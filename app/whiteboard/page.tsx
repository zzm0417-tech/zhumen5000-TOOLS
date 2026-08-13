"use client";

import Link from "next/link";
import { useState } from "react";

export default function WhiteboardPage() {
  const [loaded, setLoaded] = useState(false);
  return <main className="whiteboard-page">
    <header className="board-bar">
      <Link href="/" className="board-back">← 返回工具中枢</Link>
      <div className="board-title"><b>创作白板</b><span>POWERED BY EXCALIDRAW</span></div>
      <div className="board-actions"><a href="https://excalidraw.com" target="_blank" rel="noreferrer">新窗口打开 ↗</a></div>
    </header>
    <section className="board-canvas">
      {!loaded && <div className="board-loading">正在打开 Excalidraw 画布…</div>}
      <iframe src="https://excalidraw.com" title="Excalidraw 创作白板" allow="clipboard-read; clipboard-write" loading="eager" onLoad={() => setLoaded(true)} />
    </section>
  </main>;
}
