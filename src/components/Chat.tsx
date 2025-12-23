import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Sparkles, Copy } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface ChatProps {
    messages: Message[];
    onSend: (message: string) => void;
    isProcessing: boolean;
}

export const Chat: React.FC<ChatProps> = ({ messages, onSend, isProcessing }) => {
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isProcessing]);

    const handleSend = () => {
        if (!input.trim() || isProcessing) return;
        onSend(input);
        setInput("");
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "transparent" }}>
            {/* Header Area */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--glass-border)", background: "rgba(255, 255, 255, 0.03)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Sparkles className="text-blue-400" size={14} style={{ color: "var(--accent-color)" }} />
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-main)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Lume AI Copilot</span>
                </div>
                <div style={{ fontSize: "10px", color: "var(--text-dim)", fontStyle: "italic" }}>Context aware</div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}
            >
                {messages.length === 0 && (
                    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", opacity: 0.5, padding: "0 20px" }}>
                        <Bot size={32} style={{ marginBottom: "16px", color: "var(--accent-color)" }} />
                        <p style={{ fontSize: "14px", fontWeight: 500, color: "white", marginBottom: "8px" }}>How can I help you today?</p>
                        <p style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: "1.5" }}>
                            Ask me to generate tables, explain equations, or help structure your document.
                        </p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        style={{ display: "flex", gap: "12px", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}
                    >
                        <div style={{
                            flexShrink: 0,
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: msg.role === "user" ? "var(--glass-accent)" : "rgba(255, 255, 255, 0.05)",
                            border: "1px solid var(--glass-border)",
                            color: msg.role === "user" ? "var(--accent-color)" : "var(--text-dim)"
                        }}>
                            {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                        </div>

                        <div style={{
                            maxWidth: "85%",
                            borderRadius: "12px",
                            padding: "10px 14px",
                            fontSize: "13px",
                            lineHeight: "1.6",
                            background: msg.role === "user" ? "var(--accent-color)" : "rgba(255, 255, 255, 0.07)",
                            color: msg.role === "user" ? "white" : "var(--text-main)",
                            border: msg.role === "user" ? "none" : "1px solid var(--glass-border)",
                            borderTopRightRadius: msg.role === "user" ? "2px" : "12px",
                            borderTopLeftRadius: msg.role === "assistant" ? "2px" : "12px",
                            boxShadow: msg.role === "user" ? "0 4px 12px rgba(120, 150, 255, 0.2)" : "none"
                        }}>
                            <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
                            {msg.role === "assistant" && msg.content.includes("\\") && (
                                <button
                                    style={{
                                        marginTop: "12px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        fontSize: "10px",
                                        fontWeight: 600,
                                        color: "var(--accent-color)",
                                        background: "transparent",
                                        border: "none",
                                        padding: 0,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px"
                                    }}
                                    onClick={() => navigator.clipboard.writeText(msg.content)}
                                >
                                    <Copy size={12} /> Copy Code
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {isProcessing && (
                    <div style={{ display: "flex", gap: "12px" }}>
                        <div style={{ flexShrink: 0, width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255, 255, 255, 0.05)", border: "1px solid var(--glass-border)", color: "var(--text-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Bot size={16} />
                        </div>
                        <div style={{ background: "rgba(255, 255, 255, 0.07)", border: "1px solid var(--glass-border)", borderRadius: "12px", borderTopLeftRadius: "2px", padding: "12px 14px", display: "flex", gap: "4px" }}>
                            <span className="animate-bounce" style={{ width: "4px", height: "4px", background: "var(--text-dim)", borderRadius: "50%" }}></span>
                            <span className="animate-bounce" style={{ width: "4px", height: "4px", background: "var(--text-dim)", borderRadius: "50%", animationDelay: "0.2s" }}></span>
                            <span className="animate-bounce" style={{ width: "4px", height: "4px", background: "var(--text-dim)", borderRadius: "50%", animationDelay: "0.4s" }}></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div style={{ padding: "20px", background: "rgba(0, 0, 0, 0.2)", borderTop: "1px solid var(--glass-border)" }}>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <textarea
                        rows={1}
                        placeholder="Ask Lume AI..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        style={{
                            width: "100%",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid var(--glass-border)",
                            borderRadius: "10px",
                            padding: "12px 45px 12px 16px",
                            color: "white",
                            fontSize: "13px",
                            outline: "none",
                            resize: "none",
                            fontFamily: "inherit"
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isProcessing}
                        style={{
                            position: "absolute",
                            right: "8px",
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            background: isProcessing || !input.trim() ? "transparent" : "var(--accent-color)",
                            color: "white",
                            border: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0,
                            transition: "all 0.2s",
                            opacity: isProcessing || !input.trim() ? 0.3 : 1
                        }}
                    >
                        <Send size={16} />
                    </button>
                </div>
                <p style={{ marginTop: "10px", fontSize: "10px", textAlign: "center", color: "var(--text-dim)" }}>
                    Press Enter to send, Shift + Enter for new line.
                </p>
            </div>
        </div>
    );
};
