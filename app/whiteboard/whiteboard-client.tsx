"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Excalidraw, exportToBlob, exportToSvg, loadFromBlob, serializeAsJSON } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

type BoardApi = {
  getSceneElements: () => readonly unknown[];
  getAppState: () => Record<string, unknown>;
  getFiles: () => Record<string, unknown>;
  updateScene: (scene: Record<string, unknown>) => void;
  resetScene: () => void;
  scrollToContent: (elements?: readonly unknown[], options?: Record<string, unknown>) => void;
};

const STORAGE_KEY = "alex-toolbox-whiteboard-v1";

export default function WhiteboardClient() {
  const apiRef = useRef<BoardApi | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const saveTimer = useRef<number | null>(null);
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(null);
  const [ready, setReady] = useState(false);
  const [savedAt, setSavedAt] = useState("等待编辑");

  useEffect(() => {
    queueMicrotask(() => {
      try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) setInitialData(JSON.parse(raw)); } catch {}
      setReady(true);
    });
  }, []);

  const saveLocal = useCallback((elements: readonly unknown[], appState: Record<string, unknown>, files: Record<string, unknown>) => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ elements, appState: { ...appState, collaborators: [] }, files }));
        setSavedAt(`已保存 ${new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`);
      } catch { setSavedAt("本地存储空间不足"); }
    }, 500);
  }, []);

  const download = (data: Blob | string, name: string, type?: string) => {
    const blob = data instanceof Blob ? data : new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = name; link.click(); URL.revokeObjectURL(url);
  };

  const exportScene = () => {
    const api = apiRef.current; if (!api) return;
    const data = serializeAsJSON(api.getSceneElements() as never, api.getAppState() as never, api.getFiles() as never, "local");
    download(data, "alex-whiteboard.excalidraw", "application/json");
  };

  const exportImage = async (format: "png" | "svg") => {
    const api = apiRef.current; if (!api) return;
    const scene = { elements: api.getSceneElements() as never, appState: { ...api.getAppState(), exportWithDarkMode: false } as never, files: api.getFiles() as never };
    if (format === "png") download(await exportToBlob({ ...scene, mimeType: "image/png" }), "alex-whiteboard.png");
    else download((await exportToSvg(scene)).outerHTML, "alex-whiteboard.svg", "image/svg+xml");
  };

  const importScene = async (file?: File) => {
    if (!file || !apiRef.current) return;
    try {
      const scene = await loadFromBlob(file, null, null);
      apiRef.current.updateScene(scene as unknown as Record<string, unknown>);
      apiRef.current.scrollToContent(scene.elements as unknown as readonly unknown[], { fitToContent: true });
    } catch { window.alert("无法读取这个白板文件，请选择 .excalidraw 文件。"); }
  };

  const clear = () => {
    if (!window.confirm("确定清空当前画布吗？这个操作无法撤销。")) return;
    apiRef.current?.resetScene(); localStorage.removeItem(STORAGE_KEY); setSavedAt("画布已清空");
  };

  return <main className="whiteboard-page">
    <header className="board-bar">
      <Link href="/" className="board-back">← 返回工具中枢</Link>
      <div className="board-title"><b>创作白板</b><span>EXCALIDRAW · {savedAt}</span></div>
      <div className="board-actions">
        <input ref={fileRef} type="file" accept=".excalidraw,application/json" hidden onChange={(e) => importScene(e.target.files?.[0])} />
        <button onClick={() => fileRef.current?.click()}>导入</button><button onClick={exportScene}>保存文件</button>
        <button onClick={() => exportImage("png")}>PNG</button><button onClick={() => exportImage("svg")}>SVG</button><button className="danger" onClick={clear}>清空</button>
      </div>
    </header>
    <section className="board-canvas">
      {ready && <Excalidraw initialData={(initialData ?? { appState: { viewBackgroundColor: "#f7f6f1" } }) as never} excalidrawAPI={(api) => { apiRef.current = api as unknown as BoardApi; }} onChange={(elements, appState, files) => saveLocal(elements as unknown as readonly unknown[], appState as unknown as Record<string, unknown>, files as unknown as Record<string, unknown>)} langCode="zh-CN" theme="light" name="Alex 创作白板" />}
    </section>
  </main>;
}
