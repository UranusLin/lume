import React, { useState } from "react";
import { Key, Save, ShieldCheck, Cpu, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SettingsProps {
    onSave: (keys: ApiKeys) => void;
    initialKeys: ApiKeys;
}

export interface ApiKeys {
    openai: string;
    anthropic: string;
    google: string;
    activeProvider: string;
    openaiModel: string;
    anthropicModel: string;
    googleModel: string;
}

export const Settings: React.FC<SettingsProps> = ({ onSave, initialKeys }) => {
    const [keys, setKeys] = useState<ApiKeys>({
        ...initialKeys,
        openaiModel: initialKeys.openaiModel || "gpt-4o",
        anthropicModel: initialKeys.anthropicModel || "claude-3-5-sonnet-latest",
        googleModel: initialKeys.googleModel || "gemini-2.0-flash-exp"
    });
    const [showStatus, setShowStatus] = useState(false);

    const handleSave = () => {
        onSave(keys);
        setShowStatus(true);
        setTimeout(() => setShowStatus(false), 2000);
    };

    const labelStyle: React.CSSProperties = {
        display: "block",
        fontSize: "11px",
        fontWeight: 600,
        color: "var(--text-dim)",
        marginBottom: "8px",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
    };

    const inputStyle: React.CSSProperties = {
        width: "100%",
        background: "rgba(0, 0, 0, 0.3)",
        border: "1px solid var(--glass-border)",
        borderRadius: "6px",
        padding: "10px 12px",
        color: "var(--text-main)",
        fontSize: "13px",
        outline: "none",
        transition: "border-color 0.2s"
    };

    const selectStyle: React.CSSProperties = {
        ...inputStyle,
        appearance: "none",
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 10px center",
        backgroundSize: "16px"
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "20px", gap: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ padding: "8px", background: "rgba(120, 150, 255, 0.1)", borderRadius: "8px" }}>
                    <Cpu className="text-blue-400" size={18} style={{ color: "var(--accent-color)" }} />
                </div>
                <h2 style={{ fontSize: "16px", fontWeight: 600, color: "white" }}>AI Configuration</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Provider Selection */}
                <div>
                    <label style={labelStyle}>Active Provider</label>
                    <select
                        value={keys.activeProvider}
                        onChange={(e) => setKeys({ ...keys, activeProvider: e.target.value })}
                        style={selectStyle}
                    >
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic (Claude)</option>
                        <option value="google">Google Cloud (Gemini)</option>
                    </select>
                </div>

                <AnimatePresence mode="wait">
                    {/* OpenAI Settings */}
                    {keys.activeProvider === "openai" && (
                        <motion.div
                            key="openai"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            style={{ padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", border: "1px solid var(--glass-border)" }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                                <Zap size={14} style={{ color: "var(--accent-color)" }} />
                                <span style={{ fontSize: "12px", fontWeight: 600 }}>OpenAI</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                <div>
                                    <label style={labelStyle}>Model</label>
                                    <select
                                        value={keys.openaiModel}
                                        onChange={(e) => setKeys({ ...keys, openaiModel: e.target.value })}
                                        style={selectStyle}
                                    >
                                        <option value="gpt-4o">GPT-4o (Latest Stable)</option>
                                        <option value="gpt-4o-mini">GPT-4o mini (Fast & Cheap)</option>
                                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>API Key</label>
                                    <div style={{ position: "relative" }}>
                                        <Key style={{ position: "absolute", left: "10px", top: "11px", color: "var(--text-dim)" }} size={14} />
                                        <input
                                            type="password"
                                            placeholder="sk-..."
                                            value={keys.openai}
                                            onChange={(e) => setKeys({ ...keys, openai: e.target.value })}
                                            style={{ ...inputStyle, paddingLeft: "34px" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Anthropic Settings */}
                    {keys.activeProvider === "anthropic" && (
                        <motion.div
                            key="anthropic"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            style={{ padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", border: "1px solid var(--glass-border)" }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                                <Zap size={14} style={{ color: "#d97706" }} />
                                <span style={{ fontSize: "12px", fontWeight: 600 }}>Anthropic</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                <div>
                                    <label style={labelStyle}>Model</label>
                                    <select
                                        value={keys.anthropicModel}
                                        onChange={(e) => setKeys({ ...keys, anthropicModel: e.target.value })}
                                        style={selectStyle}
                                    >
                                        <option value="claude-3-5-sonnet-latest">Claude 3.5 Sonnet (Best)</option>
                                        <option value="claude-3-5-haiku-latest">Claude 3.5 Haiku (Fast)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>API Key</label>
                                    <div style={{ position: "relative" }}>
                                        <Key style={{ position: "absolute", left: "10px", top: "11px", color: "var(--text-dim)" }} size={14} />
                                        <input
                                            type="password"
                                            placeholder="sk-ant-..."
                                            value={keys.anthropic}
                                            onChange={(e) => setKeys({ ...keys, anthropic: e.target.value })}
                                            style={{ ...inputStyle, paddingLeft: "34px" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Google Settings */}
                    {keys.activeProvider === "google" && (
                        <motion.div
                            key="google"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            style={{ padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", border: "1px solid var(--glass-border)" }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                                <Zap size={14} style={{ color: "#3b82f6" }} />
                                <span style={{ fontSize: "12px", fontWeight: 600 }}>Google Gemini</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                <div>
                                    <label style={labelStyle}>Model</label>
                                    <select
                                        value={keys.googleModel}
                                        onChange={(e) => setKeys({ ...keys, googleModel: e.target.value })}
                                        style={selectStyle}
                                    >
                                        <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Latest)</option>
                                        <option value="gemini-1.5-pro">Gemini 1.5 Pro (Powerful)</option>
                                        <option value="gemini-1.5-flash">Gemini 1.5 Flash (Balanced)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>API Key</label>
                                    <div style={{ position: "relative" }}>
                                        <Key style={{ position: "absolute", left: "10px", top: "11px", color: "var(--text-dim)" }} size={14} />
                                        <input
                                            type="password"
                                            placeholder="AIza..."
                                            value={keys.google}
                                            onChange={(e) => setKeys({ ...keys, google: e.target.value })}
                                            style={{ ...inputStyle, paddingLeft: "34px" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={handleSave}
                    style={{
                        marginTop: "8px",
                        width: "100%",
                        background: "var(--accent-color)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        fontWeight: 600,
                        fontSize: "14px",
                        boxShadow: "0 4px 12px rgba(120, 150, 255, 0.2)",
                        cursor: "pointer"
                    }}
                >
                    <Save size={16} />
                    Save All Configuration
                </button>

                {showStatus && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "#4ade80", fontSize: "12px" }}>
                        <ShieldCheck size={14} />
                        Settings saved locally
                    </div>
                )}
            </div>

            <div style={{ marginTop: "auto", paddingTop: "20px", borderTop: "1px solid var(--glass-border)" }}>
                <p style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: "1.6" }}>
                    Lume uses <strong>Stable Aliases</strong> for model versions. This means you stay on the latest recommended version automatically.
                </p>
            </div>
        </div>
    );
};
