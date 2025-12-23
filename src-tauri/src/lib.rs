mod ai;

use tauri::Manager;
use tauri_plugin_shell::ShellExt;
use std::fs;
use serde::Serialize;
use regex::Regex;

#[derive(Serialize)]
pub struct OutlineItem {
    pub title: String,
    pub level: u32,
    pub line: usize,
}

#[tauri::command]
fn get_document_outline(content: String) -> Vec<OutlineItem> {
    let mut items = Vec::new();
    // Match sections, subsections, subsubsections, and labels
    let re = Regex::new(r"\\(section|subsection|subsubsection|label)\*?\{([^}]+)\}").unwrap();
    
    for (i, line) in content.lines().enumerate() {
        if let Some(caps) = re.captures(line) {
            let tag = caps.get(1).map_or("", |m| m.as_str());
            let title = caps.get(2).map_or("", |m| m.as_str()).to_string();
            
            let level = match tag {
                "section" => 1,
                "subsection" => 2,
                "subsubsection" => 3,
                "label" => 4, // Treats labels as the deepest level for navigation
                _ => 1,
            };
            
            // For labels, prefix the title so it's clear in the UI
            let display_title = if tag == "label" {
                format!("Label: {}", title)
            } else {
                title
            };

            items.push(OutlineItem { title: display_title, level, line: i + 1 });
        }
    }
    items
}

#[tauri::command]
async fn compile_latex(app: tauri::AppHandle, content: String) -> Result<Vec<u8>, String> {
    let temp_dir = app.path().app_cache_dir().map_err(|e| e.to_string())?.join("lume_temp");
    fs::create_dir_all(&temp_dir).map_err(|e| e.to_string())?;
    
    if content.trim().is_empty() {
        return Err("Latex content is empty. Please add some code and try again.".into());
    }
    
    let tex_path = temp_dir.join("main.tex");
    fs::write(&tex_path, content).map_err(|e| e.to_string())?;

    println!("Compiling in: {:?}", temp_dir);

    // Calling the sidecar with -X compile
    let sidecar_command = app.shell().sidecar("tectonic")
        .map_err(|e| format!("Failed to create sidecar 'tectonic': {}", e))?
        .args(["-X", "compile", "main.tex", "--synctex"])
        .current_dir(temp_dir.clone());

    let output = sidecar_command.output().await
        .map_err(|e| format!("Failed to execute sidecar 'tectonic': {}", e))?;

    if output.status.success() {
        let pdf_path = temp_dir.join("main.pdf");
        if pdf_path.exists() {
            let pdf_bytes = fs::read(pdf_path).map_err(|e| e.to_string())?;
            if pdf_bytes.len() > 4 && &pdf_bytes[0..4] == b"%PDF" {
                Ok(pdf_bytes)
            } else {
                let prefix = String::from_utf8_lossy(&pdf_bytes[..std::cmp::min(pdf_bytes.len(), 50)]);
                Err(format!("Generated file is not a valid PDF. Output starts with: {}", prefix))
            }
        } else {
            // List files for diagnostics
            let files: Vec<String> = fs::read_dir(&temp_dir)
                .map(|rd| rd.filter_map(|e| e.ok()).map(|e| e.file_name().to_string_lossy().into_owned()).collect())
                .unwrap_or_default();
            Err(format!("PDF not generated. Files in temp: {:?}", files))
        }
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let stdout = String::from_utf8_lossy(&output.stdout);
        Err(format!("STDOUT: {}\nSTDERR: {}", stdout, stderr))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![compile_latex, get_document_outline, ai::ai_complete])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
