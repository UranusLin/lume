import { useState, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Download, Play, MessageSquare, Settings, FileText, Sparkles, Save, Sun, Moon } from "lucide-react";
import { Editor } from "./components/Editor";
import { Preview } from "./components/Preview";
import { CommandPalette } from "./components/CommandPalette";
import { Sidebar } from "./components/Sidebar";
import { OutlineItem } from "./components/Outline";
import { save, message } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { ApiKeys } from "./components/Settings";
import "./index.css";

const STORAGE_KEY = "lume-api-keys";

const defaultKeys: ApiKeys = {
  openai: "",
  anthropic: "",
  google: "",
  activeProvider: "openai",
  openaiModel: "gpt-4o",
  anthropicModel: "claude-3-5-sonnet-latest",
  googleModel: "gemini-2.0-flash-exp"
};

function App() {
  const [files, setFiles] = useState([
    {
      name: "main.tex",
      content: `\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage[T1]{fontenc}\n\\usepackage{hyperref}\n\\usepackage{xcolor}\n\\usepackage{geometry}\n\\usepackage{enumitem}\n\\usepackage{amssymb}\n\n\\geometry{margin=1in}\n\\definecolor{accent}{HTML}{7896FF}\n\\definecolor{statusgray}{HTML}{666666}\n\n\\title{\\Huge \\textbf{\\textcolor{accent}{Project Lume}}}\n\\author{Zero-Config AI-Driven LaTeX IDE}\n\\date{\\today}\n\n\\begin{document}\n\n\\maketitle\n\n%% Note: You can include images like this in your local environment:\n%% \\begin{center}\n%%    \\includegraphics[width=0.8\\textwidth]{assets/demo.png}\n%% \\end{center}\n\n\\centerline{\\textcolor{statusgray}{\\textbf{Status}: Beta $|$ \\textbf{Core}: Rust (Tauri / Tectonic) $|$ \\textbf{UX}: Liquid Glass (React 19)}}\n\n\\vspace{1em}\n\n\\begin{abstract}\n\\textbf{Lume} (Latin for \\textit{light/illumination}) is a next-generation LaTeX environment designed to end the nightmare of environmental configuration. By bridging a self-contained Tectonic compiler with an agentic AI core, Lume allows researchers, students, and writers to focus on creation rather than troubleshooting.\n\\end{abstract}\n\n\\section{The Vision}\\label{sec:vision}\n\\begin{itemize}\n    \\item \\textbf{End Environment Hell}: Integrated Tectonic engine for \`\`compile-on-demand'' packages. No multi-gigabyte TeX Live installation required.\n    \\item \\textbf{AI-First Workflow}: Built-in Lume Copilot for generating complex tables, formulas, and document structures via natural language.\n    \\item \\textbf{Premium Aesthetics}: A \`\`Liquid Glass'' UI inspired by modern macOS design, featuring deep translucency and smooth transitions.\n    \\item \\textbf{Native Performance}: Built with Rust for a minimal memory footprint and blistering fast compilation.\n\\end{itemize}\n\n\\section{Features \\& Progress}\\label{sec:progress}\n\n\\subsection{Completed (Implemented)}\n\\begin{enumerate}[label=\\checkmark]\n    \\item \\textbf{Phase 1: The Forge}: Tauri + Tectonic Rust integration.\n    \\item \\textbf{Phase 2: The Canvas}: CodeMirror 6 Editor and multi-page previewer.\n    \\item \\textbf{Phase 3: The Soul}: Multi-model AI completion bridge (OpenAI, Claude, Gemini).\n    \\item \\textbf{Phase 4: Advanced IDE Features}: VS Code-style Sidebar, multi-file support, and native PDF exporting.\n    \\item \\textbf{Phase 5: Navigation \\& Theming}: Floating Document Structure (Outline) and OS-level Dark/Light Mode Sync.\n\\end{enumerate}\n\n\\subsection{In Progress / Planned}\n\\begin{itemize}[label=$\\square$]\n    \\item \\textbf{Interactive Labels}: Advanced jump-to-label and cross-reference preview.\n    \\item \\textbf{Collaboration Core}: Real-time multi-user editing bridge.\n    \\item \\textbf{Plugin Ecosystem}: User-defined VS Code-compatible extensions.\n\\end{itemize}\n\n\\section{Supported Platforms}\nLume is built on \\textbf{Tauri 2.0}, ensuring native speed across major operating systems:\n\\begin{itemize}\n    \\item \\textbf{macOS}: Fully optimized (Apple Silicon \\& Intel).\n    \\item \\textbf{Windows}: Windows 10/11 supported.\n    \\item \\textbf{Linux}: Major distributions supported via AppImage/Deb.\n\\end{itemize}\n\n\\section{Tech Stack}\n\\begin{itemize}\n    \\item \\textbf{Frontend}: React 19, Vite, Tailwind 4, CodeMirror 6.\n    \\item \\textbf{Backend}: Rust, Tauri 2.0 (FS, Dialog, Shell plugins).\n    \\item \\textbf{Compiler}: Tectonic (Native Rust sidecar).\n    \\item \\textbf{PDF Engine}: PDF.js (WebWorker implementation).\n\\end{itemize}\n\n\\section{Getting Started}\n\\subsection{Development}\n\\begin{enumerate}\n    \\item \\texttt{pnpm install}\n    \\item \\texttt{pnpm tauri dev}\n\\end{enumerate}\n\n\\subsection{Build \\& Deployment}\nTo generate a production-ready standalone installer:\n\\begin{itemize}\n    \\item Run: \\texttt{pnpm tauri build}\n    \\item \\textbf{macOS}: Output found in \\texttt{target/release/bundle/dmg/}.\n    \\item \\textbf{Windows/Linux}: Output found in respective bundle folders.\n\\end{itemize}\n\n\\vspace{2em}\n\\centerline{\\textit{Focus on your content. Let Lume handle the rest.}}\n\n\\end{document}`
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
  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultKeys;
  });

  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleSaveSettings = (keys: ApiKeys) => {
    setApiKeys(keys);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  };

  const handleChatSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMsg = { role: "user" as const, content: messageText };
    setChatMessages(prev => [...prev, userMsg]);
    setIsAIProcessing(true);

    try {
      const promptWithContext = `Current LaTeX Document:\n---\n${content}\n---\nUser Query: ${messageText}`;
      const provider = apiKeys.activeProvider;
      let model = "";
      let apiKey = "";

      if (provider === "openai") {
        model = apiKeys.openaiModel;
        apiKey = apiKeys.openai;
      } else if (provider === "anthropic") {
        model = apiKeys.anthropicModel;
        apiKey = apiKeys.anthropic;
      } else if (provider === "google") {
        model = apiKeys.googleModel;
        apiKey = apiKeys.google;
      }

      const response = await invoke<string>("ai_complete", {
        prompt: promptWithContext,
        model,
        provider,
        apiKey
      });

      setChatMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (err) {
      console.error("AI Chat Error:", err);
      setChatMessages(prev => [...prev, { role: "assistant", content: `Error: ${err}` }]);
    } finally {
      setIsAIProcessing(false);
    }
  };

  const handleAIComplete = async (prompt: string, modelOverride?: string) => {
    try {
      const provider = apiKeys.activeProvider;
      let model = modelOverride || "";
      let apiKey = "";

      if (provider === "openai") {
        model = model || apiKeys.openaiModel;
        apiKey = apiKeys.openai;
      } else if (provider === "anthropic") {
        model = model || apiKeys.anthropicModel;
        apiKey = apiKeys.anthropic;
      } else if (provider === "google") {
        model = model || apiKeys.googleModel;
        apiKey = apiKeys.google;
      }

      const response = await invoke<string>("ai_complete", {
        prompt,
        model,
        provider,
        apiKey
      });
      setContent(prev => prev + "\n\n" + response);
    } catch (err) {
      console.error("AI Error:", err);
    }
  };

  // Theme Sync
  useEffect(() => {
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(darkModeQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    darkModeQuery.addEventListener("change", handler);
    return () => darkModeQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // Outline Sync
  useEffect(() => {
    const fetchOutline = async () => {
      try {
        const result = await invoke<OutlineItem[]>("get_document_outline", { content });
        setOutline(result);
      } catch (err) {
        console.error("Failed to fetch outline:", err);
      }
    };
    fetchOutline();
  }, [content]);

  const handleOutlineClick = (line: number) => {
    const event = new CustomEvent("cm-jump-to-line", { detail: { line } });
    window.dispatchEvent(event);
  };

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

      const bytes = new Uint8Array(pdfBytes);
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

  useEffect(() => {
    const timer = setTimeout(() => {
      compileLatex();
    }, 1000);
    return () => clearTimeout(timer);
  }, [content, compileLatex]);

  useEffect(() => {
    compileLatex();
  }, []);

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
      const updated = prev.map(f => f.name === activeFileName ? { ...f, content } : f);
      return [...updated, newFile];
    });

    setActiveFileName(cleanName);
    setContent(`% New file: ${cleanName}\n\\documentclass{article}\n\\begin{document}\nNew file: ${cleanName}\n\\end{document}`);
  };

  const handleSelectFile = (name: string) => {
    if (name === activeFileName) return;
    setFiles(prev => prev.map(f => f.name === activeFileName ? { ...f, content } : f));
    const target = files.find(f => f.name === name);
    if (target) {
      setActiveFileName(name);
      setContent(target.content);
    }
  };

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
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="glass-card" style={{ padding: "8px" }} title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
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
          width={sidebarWidth}
          onWidthChange={setSidebarWidth}
          files={files}
          activeFileName={activeFileName}
          onAddFile={handleAddFile}
          onSelectFile={handleSelectFile}
          apiKeys={apiKeys}
          onSaveSettings={handleSaveSettings}
          chatMessages={chatMessages}
          onSendMessage={handleChatSendMessage}
          isAIProcessing={isAIProcessing}
          outline={outline}
          onOutlineClick={handleOutlineClick}
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
