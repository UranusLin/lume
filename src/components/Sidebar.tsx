import { useState } from "react";
import { Files, MessageSquare, Settings, ChevronLeft, ChevronRight, FileText } from "lucide-react";

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    isOpen: boolean;
    onToggle: () => void;
    files: Array<{ name: string }>;
    activeFileName: string;
    onAddFile: (name: string) => void;
    onSelectFile: (name: string) => void;
}

export function Sidebar({ activeTab, onTabChange, isOpen, onToggle, files, activeFileName, onAddFile, onSelectFile }: SidebarProps) {
    const [newFileName, setNewFileName] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    return (
        <div className="sidebar-container" style={{ width: isOpen ? "300px" : "60px" }}>
            <div className="activity-bar">
                <button
                    className={activeTab === "explorer" ? "active" : ""}
                    onClick={() => { onTabChange("explorer"); if (!isOpen) onToggle(); }}
                >
                    <Files size={24} />
                </button>
                <button
                    className={activeTab === "chat" ? "active" : ""}
                    onClick={() => { onTabChange("chat"); if (!isOpen) onToggle(); }}
                >
                    <MessageSquare size={24} />
                </button>
                <button
                    className={activeTab === "settings" ? "active" : ""}
                    onClick={() => { onTabChange("settings"); if (!isOpen) onToggle(); }}
                >
                    <Settings size={24} />
                </button>

                <div style={{ marginTop: "auto", marginBottom: "20px" }}>
                    <button onClick={onToggle}>
                        {isOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
                    </button>
                </div>
            </div>

            {isOpen && (
                <div className="side-panel">
                    <div style={{ padding: "16px", borderBottom: "1px solid var(--glass-border)", fontSize: "12px", fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "1px" }}>
                        {activeTab}
                    </div>
                    <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
                        {activeTab === "explorer" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "10px", color: "var(--text-dim)" }}>FILES</span>
                                    <button
                                        onClick={() => setIsAdding(true)}
                                        style={{ background: "transparent", border: "none", color: "var(--accent-color)", padding: 0, fontSize: "18px", lineHeight: 1 }}
                                    >
                                        +
                                    </button>
                                </div>

                                {isAdding && (
                                    <div style={{ display: "flex", gap: "4px" }}>
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="filename.tex"
                                            value={newFileName}
                                            onChange={(e) => setNewFileName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    onAddFile(newFileName);
                                                    setNewFileName("");
                                                    setIsAdding(false);
                                                } else if (e.key === "Escape") {
                                                    setIsAdding(false);
                                                }
                                            }}
                                            style={{ flex: 1, background: "rgba(0,0,0,0.2)", border: "1px solid var(--accent-color)", color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", outline: "none" }}
                                        />
                                    </div>
                                )}

                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                    {files.map(file => (
                                        <div
                                            key={file.name}
                                            onClick={() => onSelectFile(file.name)}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                color: file.name === activeFileName ? "var(--accent-color)" : "var(--text-main)",
                                                cursor: "pointer",
                                                fontSize: "13px",
                                                padding: "4px 8px",
                                                borderRadius: "4px",
                                                background: file.name === activeFileName ? "rgba(120, 150, 255, 0.1)" : "transparent"
                                            }}
                                        >
                                            <FileText size={14} /> {file.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeTab === "chat" && (
                            <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                                <div style={{ flex: 1, color: "var(--text-dim)", fontSize: "13px" }}>
                                    Ask anything about your LaTeX project...
                                </div>
                                <div style={{ marginTop: "16px" }}>
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        style={{
                                            width: "100%",
                                            background: "rgba(255,255,255,0.05)",
                                            border: "1px solid var(--glass-border)",
                                            borderRadius: "6px",
                                            padding: "8px 12px",
                                            color: "white",
                                            outline: "none"
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                        {activeTab === "settings" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", color: "var(--text-dim)", marginBottom: "4px" }}>OpenAI API Key</label>
                                    <input type="password" placeholder="sk-..." className="glass-input" style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid var(--glass-border)", color: "white", padding: "6px", borderRadius: "4px" }} />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", color: "var(--text-dim)", marginBottom: "4px" }}>Anthropic API Key</label>
                                    <input type="password" placeholder="sk-ant-..." className="glass-input" style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid var(--glass-border)", color: "white", padding: "6px", borderRadius: "4px" }} />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", color: "var(--text-dim)", marginBottom: "4px" }}>Gemini API Key</label>
                                    <input type="password" placeholder="..." className="glass-input" style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid var(--glass-border)", color: "white", padding: "6px", borderRadius: "4px" }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
