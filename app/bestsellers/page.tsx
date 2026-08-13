"use client";

import { useMemo, useState } from "react";

const boards = [
  {market:"UAE",cat:"音频",seats:8,ranks:"#4 · #7 · #9 · #10 · #12 · #14 · #15 · #18",delta:0,note:"SKU 密度优势稳定；Apple 仍占据前三。"},
  {market:"UAE",cat:"穿戴",seats:5,ranks:"#4 · #5 · #12 · #15 · #18",delta:1,note:"新增 Band 10 Pink #4，中低价位覆盖增强。"},
  {market:"UAE",cat:"平板",seats:2,ranks:"#5 · #7",delta:0,note:"排名升至 #5、#7；Apple / Samsung 仍占主导。"},
  {market:"KSA",cat:"音频",seats:8,ranks:"#1 · #3 · #5 · #6 · #8 · #10 · #11 · #16",delta:0,note:"保持 #1，FreeBuds SE 与 FreeClip 双线优势延续。"},
  {market:"KSA",cat:"穿戴",seats:7,ranks:"#1 · #4 · #5 · #7 · #9 · #14 · #16",delta:0,note:"保持 #1；Honor 白色款新进 TOP10。"},
  {market:"KSA",cat:"平板",seats:2,ranks:"#5 · #11",delta:-1,note:"PaperMatte 跌出 TOP20；Honor 仍是首要压力。"},
];
const products = [
  {rank:1,brand:"APPLE",name:"AirPods Pro 3 Wireless Earbuds",market:"UAE",cat:"音频",price:"AED 759",change:"—"},
  {rank:2,brand:"APPLE",name:"EarPods with USB-C White",market:"UAE",cat:"音频",price:"AED 65",change:"—"},
  {rank:3,brand:"APPLE",name:"AirPods 4 with ANC",market:"UAE",cat:"音频",price:"AED 629",change:"↑ 1"},
  {rank:4,brand:"HUAWEI",name:"FreeBuds SE 3",market:"UAE",cat:"音频",price:"AED 129",change:"↑ 2"},
  {rank:5,brand:"SAMSUNG",name:"Galaxy Buds3 Pro",market:"UAE",cat:"音频",price:"AED 469",change:"↓ 1"},
  {rank:1,brand:"HUAWEI",name:"FreeBuds SE 3",market:"KSA",cat:"音频",price:"SAR 139",change:"—"},
  {rank:2,brand:"APPLE",name:"AirPods Pro 2 USB-C",market:"KSA",cat:"音频",price:"SAR 799",change:"↑ 1"},
  {rank:3,brand:"HUAWEI",name:"FreeClip Black",market:"KSA",cat:"音频",price:"SAR 599",change:"—"},
  {rank:1,brand:"HUAWEI",name:"Watch Fit 4 Black",market:"KSA",cat:"穿戴",price:"SAR 449",change:"—"},
  {rank:4,brand:"HUAWEI",name:"Band 10 Pink",market:"UAE",cat:"穿戴",price:"AED 139",change:"NEW"},
  {rank:5,brand:"HUAWEI",name:"MatePad 11.5 2025",market:"UAE",cat:"平板",price:"AED 1,199",change:"↑ 3"},
  {rank:11,brand:"HUAWEI",name:"MatePad SE 11",market:"KSA",cat:"平板",price:"SAR 699",change:"↓ 2"},
];

export default function BestsellersPage(){
  const [market,setMarket]=useState("全部"),[cat,setCat]=useState("全部");
  const rows=useMemo(()=>products.filter(x=>(market==="全部"||x.market===market)&&(cat==="全部"||x.cat===cat)),[market,cat]);
  return <main className="rank-page"><nav className="english-nav"><a className="brand" href="/"><span className="brand-dot">A</span><span>ALEX / CHANNEL RADAR</span></a><a className="back-home" href="/">← 返回工具中枢</a></nav>
    <header className="rank-head"><div><small>DAILY BESTSELLER MONITOR · EXAMPLE DATA</small><h1>电渠 TOP 畅销品<br/><em>监控看板</em></h1><p>UAE / KSA · 音频 / 穿戴 / 平板 · 6 个榜单 / 120 SKU</p></div><div className="rank-time"><span>监控时间（迪拜）</span><b>2026 / 08 / 13</b><strong>08:28</strong><i>示例数据</i></div></header>
    <section className="rank-wrap"><div className="integrity"><b>✓ 数据完整性校验通过</b><span>六榜均取得连续且不重复的 TOP20，产品 ID 完整。</span></div>
      <div className="rank-kpis"><article><small>HUAWEI SEATS</small><strong>32<em>/120</em></strong><span>六榜合计席位</span></article><article><small>NO.1 POSITIONS</small><strong>02</strong><span>KSA 音频 / 穿戴</span></article><article><small>SEAT CHANGE</small><strong className="positive">±0</strong><span>新增 1 · 跌出 1</span></article><article className="alert-kpi"><small>ACTIVE ALERTS</small><strong>01</strong><span>KSA 平板席位下滑</span></article></div>
      <div className="rank-section-title"><span>01</span><div><h2>管理层摘要</h2><small>MARKET POSITION SNAPSHOT</small></div></div><div className="board-grid">{boards.map(x=><article key={x.market+x.cat}><header><span>{x.market}</span><b>{x.cat}</b><i className={x.delta>0?"up":x.delta<0?"down":""}>{x.delta>0?`+${x.delta}`:x.delta<0?x.delta:"—"}</i></header><strong>{x.seats}<small>/20</small></strong><p>{x.ranks}</p><footer>{x.note}</footer></article>)}</div>
      <div className="rank-alert"><b>重点告警</b><p>KSA 平板 MatePad 11.5 2025 PaperMatte 从 #20 跌出 TOP20，华为席位由 3 降至 2。</p><span>PRIORITY 01</span></div>
      <div className="rank-section-title"><span>02</span><div><h2>榜单明细</h2><small>TOP PRODUCTS · SAMPLE ROWS</small></div><div className="rank-filters">{["全部","UAE","KSA"].map(x=><button className={market===x?"active":""} onClick={()=>setMarket(x)} key={x}>{x}</button>)}<select value={cat} onChange={e=>setCat(e.target.value)}><option>全部</option><option>音频</option><option>穿戴</option><option>平板</option></select></div></div>
      <div className="rank-table"><div className="rank-tr rank-th"><span>排名</span><span>市场 / 品类</span><span>品牌</span><span>产品</span><span>价格</span><span>变化</span></div>{rows.map((x,i)=><div className={`rank-tr ${x.brand==="HUAWEI"?"huawei":""}`} key={i}><b>#{x.rank}</b><span>{x.market} · {x.cat}</span><strong>{x.brand}</strong><span>{x.name}</span><span>{x.price}</span><i>{x.change}</i></div>)}</div><p className="sample-note">本页全部排名、价格和变化仅作界面演示，不代表实时市场数据。</p>
    </section><footer><span>CHANNEL BESTSELLER RADAR</span><span>EXAMPLE DATA · NOT FOR DECISION</span></footer></main>;
}
