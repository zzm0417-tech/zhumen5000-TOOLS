"use client";

import dynamic from "next/dynamic";

const Whiteboard = dynamic(() => import("./whiteboard-client"), {
  ssr: false,
  loading: () => <div className="board-loading">正在打开画布…</div>,
});

export default function WhiteboardPage() {
  return <Whiteboard />;
}
