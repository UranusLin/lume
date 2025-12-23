import React from "react";
import { ListTree, Hash } from "lucide-react";

export interface OutlineItem {
    title: string;
    level: number;
    line: number;
}

interface OutlineProps {
    items: OutlineItem[];
    onItemClick: (line: number) => void;
}

export const Outline: React.FC<OutlineProps> = ({ items, onItemClick }) => {
    if (items.length === 0) {
        return (
            <div style={{
                padding: "40px 20px",
                textAlign: "center",
                color: "var(--text-dim)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px"
            }}>
                <ListTree size={32} style={{ opacity: 0.3 }} />
                <p style={{ fontSize: "13px" }}>No sections found in this document.</p>
                <p style={{ fontSize: "11px", opacity: 0.6 }}>Use {"\\section{...}"} to create an outline.</p>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "10px" }}>
            {items.map((item, index) => (
                <div
                    key={`${item.line}-${index}`}
                    onClick={() => onItemClick(item.line)}
                    className="outline-item"
                    style={{
                        padding: "8px 12px",
                        paddingLeft: `${12 + (item.level - 1) * 12}px`,
                        cursor: "pointer",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "13px",
                        color: "var(--text-main)",
                        transition: "all 0.2s"
                    }}
                >
                    <Hash size={12} style={{ color: item.level === 1 ? "var(--accent-color)" : "var(--text-dim)", opacity: 0.7 }} />
                    <span style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: item.level === 1 ? 600 : 400
                    }}>
                        {item.title}
                    </span>
                    <span style={{ marginLeft: "auto", fontSize: "10px", color: "var(--text-dim)", opacity: 0.5 }}>
                        L{item.line}
                    </span>
                </div>
            ))}
        </div>
    );
};
