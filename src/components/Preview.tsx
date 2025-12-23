import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

// @ts-ignore
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

// PDF.js worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PreviewProps {
    url: string | null;
    error: string | null;
}

export function Preview({ url, error }: PreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [pageCount, setPageCount] = useState<number>(0);
    const [renderStatus, setRenderStatus] = useState<string>("waiting");

    useEffect(() => {
        if (!url || !containerRef.current) return;

        const renderPdf = async () => {
            try {
                console.log("Loading document from URL:", url);
                setRenderStatus("loading");
                const loadingTask = pdfjsLib.getDocument(url);
                const pdf = await loadingTask.promise;
                console.log("PDF loaded, pages:", pdf.numPages);
                setPageCount(pdf.numPages);

                // Clear container for re-render
                if (containerRef.current) {
                    containerRef.current.innerHTML = "";
                }

                setRenderStatus("rendering");

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1.5 });

                    const canvas = document.createElement("canvas");
                    canvas.style.display = "block";
                    canvas.style.marginBottom = "20px";
                    canvas.style.maxWidth = "100%";
                    canvas.style.height = "auto";
                    canvas.style.background = "white";
                    canvas.style.boxShadow = "0 10px 30px rgba(0,0,0,0.5)";
                    canvas.style.borderRadius = "4px";

                    const context = canvas.getContext("2d");
                    if (!context) continue;

                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport,
                    };

                    if (containerRef.current) {
                        containerRef.current.appendChild(canvas);
                    }

                    // @ts-ignore - PDF.js types mismatch
                    await page.render(renderContext).promise;
                }

                console.log("Render complete");
                setRenderStatus("complete");
            } catch (err: any) {
                console.error("PDF Render Error:", err);
                setRenderStatus("error: " + err.message);
            }
        };

        renderPdf();
    }, [url]);

    return (
        <div style={{
            height: "100%",
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px",
            background: "#1e1e2e"
        }}>
            {error ? (
                <div style={{
                    padding: "24px",
                    background: "rgba(255, 69, 58, 0.1)",
                    border: "1px solid rgba(255, 69, 58, 0.2)",
                    borderRadius: "12px",
                    color: "#ff453a",
                    fontSize: "13px",
                    whiteSpace: "pre-wrap",
                    fontFamily: "'Fira Code', monospace",
                    width: "100%",
                    maxWidth: "800px",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
                }}>
                    <div style={{ fontWeight: 600, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ff453a" }} />
                        Compilation Error
                    </div>
                    <div style={{ opacity: 0.9, lineHeight: 1.5 }}>
                        {error}
                    </div>
                </div>
            ) : url ? (
                <div style={{ position: "relative", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        fontSize: "9px",
                        color: "var(--text-dim)",
                        display: "flex",
                        gap: "8px",
                        background: "var(--glass-border)",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        zIndex: 10
                    }}>
                        <span>{renderStatus.toUpperCase()}</span>
                        {pageCount > 0 && <span>PAGES: {pageCount}</span>}
                    </div>
                    <div ref={containerRef} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }} />
                </div>
            ) : (
                <div style={{ color: "var(--text-dim)", marginTop: "100px", textAlign: "center" }}>
                    <div style={{ marginBottom: "12px", opacity: 0.5 }}>No PDF generated yet</div>
                    <div style={{ fontSize: "12px" }}>Start typing or press Compile to see results</div>
                </div>
            )}
        </div>
    );
}
