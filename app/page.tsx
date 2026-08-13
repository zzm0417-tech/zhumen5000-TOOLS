"use client";

import { useEffect, useMemo, useState } from "react";

type Tool = {
  id: string;
  name: string;
  eyebrow: string;
  desc: string;
  category: string;
  tone: string;
  mark: string;
  status?: string;
  href?: string;
};

const tools: Tool[] = [
  { id: "unit", name: "全能单位转换器", eyebrow: "UNIT · CURRENCY · LIVE", desc: "汇率、长度、面积、重量、温度一站转换", category: "生活", tone: "lime", mark: "↔" },
  { id: "fx", name: "多币种快捷换算", eyebrow: "FINANCE · LIVE", desc: "AED、SAR、CNY、USD、EUR 即时换算", category: "生活", tone: "cyan", mark: "¥" },
  { id: "freight", name: "快递体积重", eyebrow: "SHIPPING", desc: "比较实际重量与体积重量，估算计费重", category: "生活", tone: "orange", mark: "◫" },
  { id: "time", name: "双城时间", eyebrow: "DUBAI · SHANGHAI", desc: "迪拜与上海时间即时对照", category: "生活", tone: "indigo", mark: "◷" },
  { id: "market", name: "MEA 电商分析", eyebrow: "WORKSPACE", desc: "市场数据、SMR 与渠道报告工作台", category: "工作", tone: "amber", mark: "▥", status: "规划中" },
];

const categories = ["全部", "生活", "工作"];

export default function Home() {
  const [category, setCategory] = useState("全部");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const visible = useMemo(() => tools.filter((tool) =>
    (category === "全部" || tool.category === category) &&
    `${tool.name}${tool.desc}${tool.eyebrow}`.toLowerCase().includes(query.toLowerCase())
  ), [category, query]);

  const openTool = (tool: Tool) => {
    if (tool.href) window.open(tool.href, "_blank", "noopener,noreferrer");
    else if (["fx", "unit", "freight", "time"].includes(tool.id)) setActive(tool.id);
  };

  return (
    <main>
      <nav className="topbar">
        <a className="brand" href="#top" aria-label="返回首页"><span className="brand-dot">A</span><span>ALEX / TOOLBOX</span></a>
        <div className="nav-meta"><span className="online-dot" /> SYSTEM ONLINE <span className="divider" /> {formatTime(now, "Asia/Dubai")}</div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-kicker"><span>PERSONAL OPERATING SYSTEM</span><span>DXB · 2026</span></div>
        <h1>把复杂的事，<br /><em>变成趁手的工具。</em></h1>
        <p>生活、工作与创作的统一入口。需要的时候，它们都在这里。</p>
        <div className="search-wrap">
          <span>⌕</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索工具…" aria-label="搜索工具" />
          <kbd>⌘ K</kbd>
        </div>
      </section>

      <section className="tool-section">
        <div className="section-head">
          <div><span className="section-index">01</span><h2>全部工具</h2><small>{visible.length.toString().padStart(2, "0")} TOOLS AVAILABLE</small></div>
          <div className="filters" role="tablist" aria-label="工具分类">
            {categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
        </div>

        <div className="tool-grid">
          {visible.map((tool, index) => (
            <button className={`tool-card ${tool.tone}`} key={tool.id} onClick={() => openTool(tool)}>
              <span className="card-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="tool-mark">{tool.mark}</span>
              <span className="tool-copy"><small>{tool.eyebrow}</small><strong>{tool.name}</strong><span>{tool.desc}</span></span>
              <span className="card-foot"><span>{tool.status ?? "立即使用"}</span><b>{tool.status ? "·" : "↗"}</b></span>
            </button>
          ))}
        </div>
        {visible.length === 0 && <div className="empty">没有找到匹配的工具。</div>}
      </section>

      <footer><span>PRIVATE TOOLS, BUILT AROUND ALEX.</span><span>ALL SYSTEMS READY</span></footer>
      {active && <ToolPanel id={active} now={now} close={() => setActive(null)} />}
    </main>
  );
}

function ToolPanel({ id, now, close }: { id: string; now: Date; close: () => void }) {
  const [value, setValue] = useState(100);
  const [from, setFrom] = useState("AED");
  const [rates, setRates] = useState<Record<string, number>>({ AED: 1, CNY: 1.96, SAR: 1.02, USD: 0.2723, EUR: 0.234 });
  const [dims, setDims] = useState({ l: 60, w: 60, h: 100, weight: 20 });

  useEffect(() => {
    if (id !== "fx") return;
    fetch("https://open.er-api.com/v6/latest/AED").then(r => r.json()).then(data => {
      if (data?.rates) setRates({ AED: 1, CNY: data.rates.CNY, SAR: data.rates.SAR, USD: data.rates.USD, EUR: data.rates.EUR });
    }).catch(() => {});
  }, [id]);

  const baseAED = value / (rates[from] || 1);
  return <div className="modal-backdrop" onMouseDown={close}>
    <section className="panel" onMouseDown={(e) => e.stopPropagation()}>
      <button className="close" onClick={close} aria-label="关闭">×</button>
      {id === "fx" && <><PanelTitle over="LIVE RATE" title="多币种汇率" /><div className="input-row"><input type="number" value={value} onChange={e => setValue(Number(e.target.value))} /><select value={from} onChange={e => setFrom(e.target.value)}>{Object.keys(rates).map(c => <option key={c}>{c}</option>)}</select></div><div className="results">{Object.entries(rates).filter(([c]) => c !== from).map(([c, r]) => <div key={c}><span>{c}</span><strong>{(baseAED * r).toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></div>)}</div><p className="note">联网时自动获取最新参考汇率；实际结算以银行为准。</p></>}
      {id === "unit" && <UnitTool />}
      {id === "freight" && <><PanelTitle over="VOLUMETRIC WEIGHT" title="快递体积重" /><div className="dimension-grid">{(["l","w","h","weight"] as const).map((k) => <label key={k}><span>{{l:"长 / CM",w:"宽 / CM",h:"高 / CM",weight:"实重 / KG"}[k]}</span><input type="number" value={dims[k]} onChange={e => setDims({...dims,[k]:Number(e.target.value)})} /></label>)}</div><div className="big-result"><span>国际快递计费重</span><strong>{Math.max(dims.weight, dims.l*dims.w*dims.h/5000).toFixed(1)} <small>KG</small></strong></div><p className="note">按常用除数 5000 估算；不同承运商规则可能不同。</p></>}
      {id === "time" && <><PanelTitle over="WORLD CLOCK" title="双城时间" /><div className="clock-grid"><div><span>迪拜</span><strong>{formatTime(now,"Asia/Dubai")}</strong><small>{formatDate(now,"Asia/Dubai")}</small></div><div><span>上海</span><strong>{formatTime(now,"Asia/Shanghai")}</strong><small>{formatDate(now,"Asia/Shanghai")} · +4H</small></div></div></>}
    </section>
  </div>;
}

function UnitTool() {
  const [v, setV] = useState(1);
  const [kind, setKind] = useState("sqm");
  const normal:Record<string,[string,number,string][]>={sqm:[["平方英尺",10.7639,"ft²"],["平方厘米",10000,"cm²"],["坪",.3025,"坪"]],cm:[["英寸",1/2.54,"in"],["米",.01,"m"],["英尺",1/30.48,"ft"]],kg:[["磅",2.20462,"lb"],["克",1000,"g"],["市斤",2,"斤"]]};
  const items = kind === "c" ? [["华氏度",v*9/5+32,"°F"],["开尔文",v+273.15,"K"]] : normal[kind].map(([n,r,u])=>[n,v*r,u]);
  return <><PanelTitle over="UNIT CONVERTER" title="全能单位转换器" /><div className="input-row"><input type="number" value={v} onChange={e => setV(Number(e.target.value))} /><select value={kind} onChange={e => setKind(e.target.value)}><option value="sqm">平方米</option><option value="cm">厘米</option><option value="kg">千克</option><option value="c">摄氏度</option></select></div><div className="results">{items.map(([name,n,u]) => <div key={String(name)}><span>{name}</span><strong>{Number(n).toLocaleString(undefined,{maximumFractionDigits:2})} <small>{u}</small></strong></div>)}</div><p className="note">汇率换算请使用首页的“多币种快捷换算”，联网时自动获取最新数据。</p></>;
}

function PanelTitle({ over, title }: {over:string,title:string}) { return <header className="panel-title"><small>{over}</small><h2>{title}</h2></header> }
function formatTime(d: Date, zone: string) { return new Intl.DateTimeFormat("zh-CN", { timeZone: zone, hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false }).format(d) }
function formatDate(d: Date, zone: string) { return new Intl.DateTimeFormat("zh-CN", { timeZone: zone, month:"long", day:"numeric", weekday:"short" }).format(d) }
