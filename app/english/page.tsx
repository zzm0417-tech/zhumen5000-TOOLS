"use client";

import { useEffect, useState } from "react";
import { EnglishDaily } from "../page";

export default function EnglishPage() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="english-page">
      <nav className="english-nav">
        <a className="brand" href="/" aria-label="返回工具中枢"><span className="brand-dot">A</span><span>ALEX / ENGLISH</span></a>
        <a className="back-home" href="/">← 返回工具中枢</a>
      </nav>
      <header className="english-page-head">
        <small>DAILY ENGLISH · DUBAI 08:00</small>
        <h1>每天一点，<em>表达自然一点。</em></h1>
        <p>工作日练职场表达，周末练生活沟通。</p>
      </header>
      <div className="english-page-body"><EnglishDaily now={now} /></div>
      <footer><span>ALEX / DAILY ENGLISH</span><span>UPDATED AT 08:00 DXB</span></footer>
    </main>
  );
}
