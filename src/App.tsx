import { useState, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Download, Play, MessageSquare, Settings, FileText, Sparkles, Save } from "lucide-react";
import { Editor } from "./components/Editor";
import { Preview } from "./components/Preview";
import { CommandPalette } from "./components/CommandPalette";
import { Sidebar } from "./components/Sidebar";
import { save, message } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import "./index.css";

function App() {
  const [files, setFiles] = useState([
    {
      name: "main.tex",
      content: `\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage[T1]{fontenc}\n\\usepackage{hyperref}\n\\usepackage{xcolor}\n\\usepackage{geometry}\n\\usepackage{enumitem}\n\\usepackage{amssymb}\n\n\\geometry{margin=1in}\n\\definecolor{accent}{HTML}{7896FF}\n\\definecolor{statusgray}{HTML}{666666}\n\n\\title{\\Huge \\textbf{\\textcolor{accent}{Project Lume}}}\n\\author{Zero-Config AI-Driven LaTeX IDE}\n\\date{\\today}\n\n\\begin{document}\n\n\\maketitle\n\n\\centerline{\\textcolor{statusgray}{\\textbf{Status}: Beta $|$ \\textbf{Core}: Rust (Tauri / Tectonic) $|$ \\textbf{UX}: Liquid Glass (React 19)}}\n\n\\vspace{1em}\n\n\\begin{abstract}\n\\textbf{Lume} (Latin for \\textit{light/illumination}) is a next-generation LaTeX environment designed to end the nightmare of environmental configuration. By bridging a self-contained Tectonic compiler with an agentic AI core, Lume allows researchers, students, and writers to focus on creation rather than troubleshooting.\n\\end{abstract}\n\n\\section{The Vision}\n\\begin{itemize}\n    \\item \\textbf{End Environment Hell}: Integrated Tectonic engine for \`\`compile-on-demand'' packages. No multi-gigabyte TeX Live installation required.\n    \\item \\textbf{AI-First Workflow}: Built-in Lume Copilot for generating complex tables, formulas, and document structures via natural language.\n    \\item \\textbf{Premium Aesthetics}: A \`\`Liquid Glass'' UI inspired by modern macOS design, featuring deep translucency and smooth transitions.\n    \\item \\textbf{Native Performance}: Built with Rust for a minimal memory footprint and blistering fast compilation.\n\\end{itemize}\n\n\\section{Features \\& Progress}\n\n\\subsection{Completed (Implemented)}\n\\begin{enumerate}[label=\\checkmark]\n    \\item \\textbf{Phase 1: The Forge}: Tauri + Tectonic Rust integration.\n    \\item \\textbf{Phase 2: The Canvas}: CodeMirror 6 Editor and multi-page previewer.\n    \\item \\textbf{Phase 3: The Soul}: Multi-model AI completion bridge (OpenAI, Claude, Gemini).\n    \\item \\textbf{Phase 4: Advanced IDE Features}: VS Code-style Sidebar, multi-file support, and native PDF exporting.\n\\end{enumerate}\n\n\\subsection{In Progress / Planned}\n\\begin{itemize}[label=$\\square$]\n    \\item Persistent AI Chat Sidebar.\n    \\item Multi-Provider Settings Page for API keys.\n    \\item Floating Document Structure (Section Jump).\n    \\item Dark/Light Mode Synchronization.\n\\end{itemize}\n\n\\section{Supported Platforms}\nLume is built on \\textbf{Tauri 2.0}, ensuring native speed across major operating systems:\n\\begin{itemize}\n    \\item \\textbf{macOS}: Fully optimized (Apple Silicon \\& Intel).\n    \\item \\textbf{Windows}: Windows 10/11 supported.\n    \\item \\textbf{Linux}: Major distributions supported via AppImage/Deb.\n\\end{itemize}\n\n\\section{Tech Stack}\n\\begin{itemize}\n    \\item \\textbf{Frontend}: React 19, Vite, Tailwind 4, CodeMirror 6.\n    \\item \\textbf{Backend}: Rust, Tauri 2.0 (FS, Dialog, Shell plugins).\n    \\item \\textbf{Compiler}: Tectonic (Native Rust sidecar).\n    \\item \\textbf{PDF Engine}: PDF.js (WebWorker implementation).\n\\end{itemize}\n\n\\section{Getting Started}\n\\begin{enumerate}\n    \\item \\texttt{git clone ...}\n    \\item \\texttt{pnpm install}\n    \\item \\texttt{pnpm tauri dev}\n\\end{enumerate}\n\n\\vspace{2em}\n\\centerline{\\textit{Focus on your content. Let Lume handle the rest.}}\n\n\\end{document}`
    }
  ]);
  const [activeFileName, setActiveFileName] = useState("main.tex");
  const [content, setContent] = useState(files[0].content);
  const [compiling, setCompiling] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [compilationError, setCompilationError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("explorer");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [lastPdfBytes, setLastPdfBytes] = useState<number[] | null>(null);

  const handleAIComplete = async (prompt: string, model: string) => {
    try {
      const response = await invoke<string>("ai_complete", { prompt, model });
      // Append or insert AI response. For now, we append.
      setContent(prev => prev + "\n\n" + response);
    } catch (err) {
      console.error("AI Error:", err);
    }
  };

  // Keyboard shortcut for CMD+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsAIModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSaveSource = async () => {
    try {
      const path = await save({
        filters: [{
          name: 'LaTeX',
          extensions: ['tex']
        }],
        defaultPath: activeFileName
      });

      if (path) {
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        await writeFile(path, data);
        await message(`Source file successfully saved to:\n${path}`, { title: 'Success', kind: 'info' });
      }
    } catch (err) {
      console.error("Failed to save source file:", err);
      await message(`Failed to save source file: ${err}`, { title: 'Error', kind: 'error' });
    }
  };

  const handleDownload = async () => {
    if (!lastPdfBytes) return;
    try {
      const path = await save({
        filters: [{
          name: 'PDF',
          extensions: ['pdf']
        }],
        defaultPath: 'main.pdf'
      });

      if (path) {
        // Explicitly convert to Uint8Array for the fs plugin
        const uint8 = new Uint8Array(lastPdfBytes);
        await writeFile(path, uint8);
        await message(`PDF successfully saved to:\n${path}`, { title: 'Success', kind: 'info' });
      }
    } catch (err) {
      console.error("Failed to save PDF:", err);
      await message(`Failed to save PDF: ${err}`, { title: 'Error', kind: 'error' });
    }
  };

  const compileLatex = useCallback(async () => {
    setCompiling(true);
    setCompilationError(null);
    try {
      const pdfBytes = await invoke<number[]>("compile_latex", { content });
      setLastPdfBytes(pdfBytes);
      console.log("Compilation finished, bytes received:", pdfBytes.length);

      // Ensure we have a proper Uint8Array for the Blob
      const bytes = new Uint8Array(pdfBytes);
      console.log("First 5 bytes:", bytes.slice(0, 5));

      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setPdfUrl(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } catch (err) {
      console.error("Compilation failed", err);
      setCompilationError(err as string);
      setPdfUrl(null);
    } finally {
      setCompiling(false);
    }
  }, [content]);

  // Debounced real-time compilation
  useEffect(() => {
    const timer = setTimeout(() => {
      compileLatex();
    }, 1000);
    return () => clearTimeout(timer);
  }, [content, compileLatex]);

  // Initial compile
  useEffect(() => {
    compileLatex();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup PDF URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const handleAddFile = (name: string) => {
    let cleanName = name.trim();
    if (!cleanName) return;
    if (!cleanName.endsWith(".tex")) cleanName += ".tex";

    setFiles(prev => {
      if (prev.find(f => f.name === cleanName)) return prev;
      const newFile = { name: cleanName, content: `% New file: ${cleanName}\n\\documentclass{article}\n\\begin{document}\nNew file: ${cleanName}\n\\end{document}` };
      // Save current content to the active file and add the new one
      const updated = prev.map(f => f.name === activeFileName ? { ...f, content } : f);
      return [...updated, newFile];
    });

    setActiveFileName(cleanName);
    setContent(`% New file: ${cleanName}\n\\documentclass{article}\n\\begin{document}\nNew file: ${cleanName}\n\\end{document}`);
  };

  const handleSelectFile = (name: string) => {
    if (name === activeFileName) return;

    // 1. First, save the current editor content to the file list
    setFiles(prev => prev.map(f => f.name === activeFileName ? { ...f, content } : f));

    // 2. Find target file in the current state to determine what to load
    const target = files.find(f => f.name === name);
    if (target) {
      setActiveFileName(name);
      setContent(target.content);
    }
  };

  return (
    <div className="app-container">
      <header className="header liquid-glass">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ fontWeight: 600, fontSize: "18px", color: "var(--accent-color)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={20} /> Lume
          </div>
          <div style={{ opacity: 0.5, fontSize: "12px" }}>Draft - {activeFileName}</div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={compileLatex} disabled={compiling} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Play size={14} fill={compiling ? "none" : "currentColor"} />
            {compiling ? "Compiling..." : "Compile"}
          </button>
          <button onClick={handleSaveSource} className="glass-card" style={{ padding: "8px" }} title="Save Source (.tex)">
            <Save size={16} />
          </button>
          <button onClick={handleDownload} className="glass-card" style={{ padding: "8px" }} disabled={!lastPdfBytes} title="Download PDF">
            <Download size={16} />
          </button>
          <button onClick={() => { setActiveTab("chat"); setIsSidebarOpen(true); }} className="glass-card" style={{ padding: "8px" }}><MessageSquare size={16} /></button>
          <button onClick={() => { setActiveTab("settings"); setIsSidebarOpen(true); }} className="glass-card" style={{ padding: "8px" }}><Settings size={16} /></button>
        </div>
      </header>

      <main className="main-content">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          files={files}
          activeFileName={activeFileName}
          onAddFile={handleAddFile}
          onSelectFile={handleSelectFile}
        />
        <div className="layout-content">
          <section className="editor-pane">
            <div style={{ height: "40px", display: "flex", alignItems: "center", gap: "8px", padding: "0 16px", borderBottom: "1px solid var(--glass-border)", fontSize: "12px", color: "var(--text-dim)" }}>
              <FileText size={14} /> {activeFileName}
            </div>
            <div style={{ height: "calc(100% - 40px)" }}>
              <Editor value={content} onChange={setContent} />
            </div>
          </section>

          <section className="preview-pane">
            <Preview url={pdfUrl} error={compilationError} />
          </section>
        </div>
      </main>

      <CommandPalette
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onComplete={handleAIComplete}
      />
    </div>
  );
}

export default App;
