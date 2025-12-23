import { useState, useCallback, useEffect, useRef } from "react";
import { Files, MessageSquare, Settings, ChevronLeft, ChevronRight, FileText, ListTree } from "lucide-react";
import { Settings as SettingsComponent, ApiKeys } from "./Settings";
import { Chat as ChatComponent } from "./Chat";
import { Outline, OutlineItem } from "./Outline";

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    isOpen: boolean;
    onToggle: () => void;
    width: number;
    onWidthChange: (width: number) => void;
    files: Array<{ name: string }>;
    activeFileName: string;
    onAddFile: (name: string) => void;
    onSelectFile: (name: string) => void;
    apiKeys: ApiKeys;
    onSaveSettings: (keys: ApiKeys) => void;
    chatMessages: Array<{ role: "user" | "assistant"; content: string }>;
    onSendMessage: (msg: string) => void;
    isAIProcessing: boolean;
    outline: OutlineItem[];
    onOutlineClick: (line: number) => void;
}

export function Sidebar({
    activeTab, onTabChange, isOpen, onToggle,
    width, onWidthChange,
    files, activeFileName, onAddFile, onSelectFile,
    apiKeys, onSaveSettings,
    chatMessages, onSendMessage, isAIProcessing,
    outline, onOutlineClick
}: SidebarProps) {
    const [newFileName, setNewFileName] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const isResizing = useRef(false);

    const startResizing = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isResizing.current = true;
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", stopResizing);
        document.body.style.cursor = "col-resize";
    }, []);

    const stopResizing = useCallback(() => {
        isResizing.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", stopResizing);
        document.body.style.cursor = "default";
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing.current) return;
        const newWidth = e.clientX - 60; // Subtract activity bar width
        if (newWidth > 150 && newWidth < 800) {
            onWidthChange(newWidth);
        }
    }, [onWidthChange]);

    // Cleanup listeners on unmount
    useEffect(() => {
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", stopResizing);
        };
    }, [handleMouseMove, stopResizing]);

    return (
        <div className="sidebar-container" style={{ width: isOpen ? `${width + 60}px` : "60px" }}>
            <div className="activity-bar">
                <button
                    className={activeTab === "explorer" ? "active" : ""}
                    onClick={() => { onTabChange("explorer"); if (!isOpen) onToggle(); }}
                >
                    <Files size={24} />
                </button>
                <button
                    className={activeTab === "outline" ? "active" : ""}
                    onClick={() => { onTabChange("outline"); if (!isOpen) onToggle(); }}
                >
                    <ListTree size={24} />
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
                <>
                    <div className="side-panel" style={{ width: `${width}px` }}>
                        <div style={{
                            padding: "16px 20px",
                            borderBottom: "1px solid var(--glass-border)",
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "var(--accent-color)",
                            textTransform: "uppercase",
                            letterSpacing: "1.5px",
                            background: "rgba(0,0,0,0.2)"
                        }}>
                            {activeTab}
                        </div>
                        <div style={{ flex: 1, overflow: "auto" }}>
                            {activeTab === "explorer" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "20px" }}>
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
                            {activeTab === "outline" && (
                                <Outline items={outline} onItemClick={onOutlineClick} />
                            )}
                            {activeTab === "chat" && (
                                <ChatComponent
                                    messages={chatMessages}
                                    onSend={onSendMessage}
                                    isProcessing={isAIProcessing}
                                />
                            )}
                            {activeTab === "settings" && (
                                <SettingsComponent initialKeys={apiKeys} onSave={onSaveSettings} />
                            )}
                        </div>
                    </div>
                    {/* Resize Handle */}
                    <div
                        onMouseDown={startResizing}
                        style={{
                            width: "4px",
                            height: "100%",
                            cursor: "col-resize",
                            position: "absolute",
                            right: 0,
                            top: 0,
                            zIndex: 10,
                            transition: "background 0.2s"
                        }}
                        className="sidebar-resizer"
                    />
                </>
            )}
        </div>
    );
}
