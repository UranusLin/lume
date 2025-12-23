import { useRef, useEffect } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, ViewUpdate } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { StreamLanguage } from "@codemirror/language";
import { stex } from "@codemirror/legacy-modes/mode/stex";
import { oneDark } from "@codemirror/theme-one-dark";

interface EditorProps {
    value: string;
    onChange: (value: string) => void;
}

export function Editor({ value, onChange }: EditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);

    useEffect(() => {
        if (!editorRef.current) return;

        const startState = EditorState.create({
            doc: value,
            extensions: [
                lineNumbers(),
                highlightActiveLineGutter(),
                history(),
                keymap.of([...defaultKeymap, ...historyKeymap]),
                StreamLanguage.define(stex),
                oneDark,
                EditorView.updateListener.of((update: ViewUpdate) => {
                    if (update.docChanged) {
                        onChange(update.state.doc.toString());
                    }
                }),
                EditorView.theme({
                    "&": { height: "100%", backgroundColor: "transparent" },
                    ".cm-scroller": { overflow: "auto" },
                    ".cm-gutters": { backgroundColor: "transparent", border: "none" }
                })
            ],
        });

        const view = new EditorView({
            state: startState,
            parent: editorRef.current,
        });

        viewRef.current = view;

        return () => {
            view.destroy();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (viewRef.current && value !== viewRef.current.state.doc.toString()) {
            viewRef.current.dispatch({
                changes: { from: 0, to: viewRef.current.state.doc.length, insert: value }
            });
        }
    }, [value]);

    useEffect(() => {
        const handleJump = (e: any) => {
            if (viewRef.current) {
                const line = e.detail.line;
                const pos = viewRef.current.state.doc.line(line).from;
                viewRef.current.dispatch({
                    selection: { anchor: pos, head: pos },
                    scrollIntoView: true
                });
                viewRef.current.focus();
            }
        };
        window.addEventListener("cm-jump-to-line", handleJump);
        return () => window.removeEventListener("cm-jump-to-line", handleJump);
    }, []);

    return <div ref={editorRef} style={{ height: "100%" }} />;
}
