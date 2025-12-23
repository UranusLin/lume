import { useState, useEffect, useRef } from "react";
import { Sparkles, Command, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (prompt: string, model: string) => Promise<void>;
}

export function CommandPalette({ isOpen, onClose, onComplete }: CommandPaletteProps) {
    const [prompt, setPrompt] = useState("");
    const [model, setModel] = useState("gpt-4o");
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setPrompt("");
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || loading) return;

        setLoading(true);
        try {
            await onComplete(prompt, model);
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="command-palette-overlay" style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0, 0, 0, 0.6)",
                    zIndex: 1000,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(4px)"
                }} onClick={onClose}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="command-palette liquid-glass"
                        style={{
                            width: "600px",
                            background: "var(--glass-bg)",
                            padding: "24px",
                            boxShadow: "0 24px 48px rgba(0,0,0,0.5)"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", color: "var(--accent-color)" }}>
                            <Sparkles size={20} />
                            <span style={{ fontWeight: 600 }}>Lume AI Copilot</span>
                            <div style={{ flex: 1 }} />
                            <div style={{ display: "flex", gap: "8px", background: "rgba(0,0,0,0.2)", padding: "4px", borderRadius: "6px" }}>
                                {["gpt-4o", "claude-3-5", "gemini-1.5"].map(m => (
                                    <div
                                        key={m}
                                        onClick={() => setModel(m)}
                                        style={{
                                            fontSize: "10px",
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            background: model === m ? "var(--accent-color)" : "transparent",
                                            color: model === m ? "white" : "var(--text-dim)"
                                        }}
                                    >
                                        {m.split('-')[0].toUpperCase()}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ position: "relative" }}>
                                <input
                                    ref={inputRef}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Ask me to generate a table, formula, or suggest an edit..."
                                    style={{
                                        width: "100%",
                                        background: "rgba(255,255,255,0.05)",
                                        border: "1px solid var(--glass-border)",
                                        borderRadius: "8px",
                                        padding: "16px 40px 16px 16px",
                                        color: "white",
                                        fontSize: "16px",
                                        outline: "none"
                                    }}
                                />
                                <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", opacity: 0.5 }}>
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Command size={16} />}
                                </div>
                            </div>
                        </form>

                        <div style={{ marginTop: "16px", display: "flex", gap: "8px", color: "var(--text-dim)", fontSize: "12px" }}>
                            <div style={{ background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "4px" }}>CMD+K</div>
                            <span>to open</span>
                            <div style={{ background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "4px" }}>ESC</div>
                            <span>to close</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
