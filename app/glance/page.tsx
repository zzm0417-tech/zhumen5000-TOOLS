"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Weather = { temperature_2m:number; apparent_temperature:number; relative_humidity_2m:number; weather_code:number; wind_speed_10m:number };
type Forecast = { time:string[]; temperature_2m_max:number[]; temperature_2m_min:number[]; weather_code:number[] };
type Todo = { id:number; text:string; done:boolean };
type NewsItem = { title:string; link:string; source:string; publishedAt:string; category:string };
type BriefItem = { title:string; source?:string; url?:string; happened?:string; why?:string; relevance?:string; opportunityRisk?:string; action?:string };
type BriefSection = { id:string; title:string; items:BriefItem[] };
type DailyBrief = { date:string; generatedAt:string; readingMinutes:number; headline:string; summary:string; sections:BriefSection[]; sourceNote?:string };
const shortcuts = [["GitHub","https://github.com/zzm0417-tech/zhumen5000-TOOLS","代码仓库"],["Cloudflare","https://dash.cloudflare.com/","部署管理"],["Amazon UAE","https://www.amazon.ae/","渠道观察"],["Noon","https://www.noon.com/uae-en/","渠道观察"],["每日英语","/english","学习"],["畅销品看板","/bestsellers","工作"]];

export default function GlancePage({embedded=false}:{embedded?:boolean}) {
  const [now,setNow]=useState(new Date());
  const [weather,setWeather]=useState<Weather|null>(null);
  const [forecast,setForecast]=useState<Forecast|null>(null);
  const [rates,setRates]=useState<Record<string,number>>({CNY:1.96,SAR:1.02,USD:.2723,EUR:.234});
  const [todos,setTodos]=useState<Todo[]>([]);
  const [todoText,setTodoText]=useState("");
  const [brief,setBrief]=useState<DailyBrief|null>(null);
  const [news,setNews]=useState<NewsItem[]>([]);
  useEffect(()=>{const timer=window.setInterval(()=>setNow(new Date()),1000);queueMicrotask(()=>{try{setTodos(JSON.parse(localStorage.getItem("alex-glance-todos")||"[]"))}catch{}});
    fetch("https://api.open-meteo.com/v1/forecast?latitude=25.2048&longitude=55.2708&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FDubai&forecast_days=5").then(r=>r.json()).then(d=>{setWeather(d.current);setForecast(d.daily)}).catch(()=>{});
    fetch("https://open.er-api.com/v6/latest/AED").then(r=>r.json()).then(d=>d.rates&&setRates({CNY:d.rates.CNY,SAR:d.rates.SAR,USD:d.rates.USD,EUR:d.rates.EUR})).catch(()=>{});return()=>window.clearInterval(timer)},[]);
  useEffect(()=>{
    fetch(`/data/daily-brief/latest.json?v=${Date.now()}`,{cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject()).then(d=>{if(isPublishableBrief(d))setBrief(d)}).catch(()=>setBrief(null));
    fetch("/api/news").then(r=>r.json()).then(d=>setNews(d.items||[])).catch(()=>setNews([]));
  },[]);
  useEffect(()=>{localStorage.setItem("alex-glance-todos",JSON.stringify(todos))},[todos]);
  const date=new Intl.DateTimeFormat("zh-CN",{timeZone:"Asia/Dubai",month:"long",day:"numeric",weekday:"long"}).format(now);
  const dubai=new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Dubai",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).format(now);
  const shanghai=new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Shanghai",hour:"2-digit",minute:"2-digit",hour12:false}).format(now);
  const progress=useMemo(()=>todos.length?Math.round(todos.filter(t=>t.done).length/todos.length*100):0,[todos]);
  const addTodo=()=>{const text=todoText.trim();if(!text)return;setTodos(v=>[...v,{id:Date.now(),text,done:false}]);setTodoText("")};
  return <main className={`glance-page ${embedded?"glance-embedded":""}`}>
    {!embedded&&<nav className="glance-nav"><Link href="/">ALEX / TOOLBOX</Link><span>PERSONAL FEED · DUBAI</span></nav>}
    <header className="glance-head"><div><small>GOOD {greeting(now)}</small><h1>今天，<em>一眼看清。</em></h1><p>{date} · 迪拜</p></div><div className="glance-clock"><strong>{dubai}</strong><span>DXB</span></div></header>
    <section className="glance-grid">
      <article className="g-card g-weather"><CardHead index="01" title="迪拜天气" meta="LIVE"/><div className="weather-now"><span>{weatherIcon(weather?.weather_code)}</span><strong>{weather?Math.round(weather.temperature_2m):"--"}<sup>°</sup></strong><div><b>{weatherText(weather?.weather_code)}</b><small>体感 {weather?Math.round(weather.apparent_temperature):"--"}° · 湿度 {weather?.relative_humidity_2m??"--"}%<br/>风速 {weather?.wind_speed_10m??"--"} km/h</small></div></div><div className="forecast-row">{forecast?.time.map((d,i)=><div key={d}><span>{i===0?"今天":new Intl.DateTimeFormat("zh-CN",{weekday:"short"}).format(new Date(`${d}T12:00:00`))}</span><b>{weatherIcon(forecast.weather_code[i])}</b><small>{Math.round(forecast.temperature_2m_max[i])}° / {Math.round(forecast.temperature_2m_min[i])}°</small></div>)}</div></article>
      <article className="g-card g-world"><CardHead index="02" title="双城时间" meta="WORLD CLOCK"/><div className="city-time"><span>迪拜<small>UTC +4</small></span><strong>{dubai.slice(0,5)}</strong></div><div className="city-time"><span>上海<small>UTC +8</small></span><strong>{shanghai}</strong></div><p>上海比迪拜快 4 小时</p></article>
      <article className="g-card g-rates"><CardHead index="03" title="今日汇率" meta="1 AED"/>{Object.entries(rates).map(([k,v])=><div className="rate-line" key={k}><span>{k}</span><strong>{v.toFixed(k==="USD"?4:2)}</strong></div>)}<small>参考汇率 · 实际结算以银行为准</small></article>
      <article className="g-card g-todos"><CardHead index="04" title="今日清单" meta={`${progress}% DONE`}/><form onSubmit={e=>{e.preventDefault();addTodo()}}><input value={todoText} onChange={e=>setTodoText(e.target.value)} placeholder="添加一件今天要完成的事…"/><button>＋</button></form><div className="todo-list">{todos.length===0&&<p>今天还没有任务。保持轻盈，或者加上一件。</p>}{todos.map(t=><label key={t.id} className={t.done?"done":""}><input type="checkbox" checked={t.done} onChange={()=>setTodos(v=>v.map(x=>x.id===t.id?{...x,done:!x.done}:x))}/><span>{t.text}</span><button onClick={()=>setTodos(v=>v.filter(x=>x.id!==t.id))}>×</button></label>)}</div></article>
      <article className="g-card g-links"><CardHead index="05" title="快捷入口" meta="QUICK ACCESS"/><div className="shortcut-grid">{shortcuts.map(([name,url,tag])=><a key={name} href={url} target={url.startsWith("http")?"_blank":undefined} rel="noreferrer"><small>{tag}</small><strong>{name}</strong><span>↗</span></a>)}</div></article>
      {brief?<article className="g-card g-news daily-brief"><CardHead index="06" title="Alex 每日情报" meta="08:00 · DUBAI"/><div className="news-lead"><strong>{brief.headline}</strong><span>{formatBriefDate(brief.date)}<br/>{brief.readingMinutes} 分钟阅读</span></div><p className="brief-summary">{brief.summary}</p><div className="brief-sections">{brief.sections.map((section,index)=><section key={section.id}><header><span>{String(index+1).padStart(2,"0")}</span><h3>{section.title}</h3></header>{section.items.map((item,itemIndex)=><article className="brief-item" key={`${section.id}-${itemIndex}`}><div className="brief-item-head"><span>{item.source}</span><a href={item.url} target="_blank" rel="noreferrer">原文 ↗</a></div><h4>{item.title}</h4>{item.happened&&<p>{item.happened}</p>}{item.why&&<p><b>为什么重要</b>{item.why}</p>}{item.relevance&&<p><b>与你的关系</b>{item.relevance}</p>}{item.opportunityRisk&&<p><b>机会与风险</b>{item.opportunityRisk}</p>}{item.action&&<p className="brief-action"><b>行动</b>{item.action}</p>}</article>)}</section>)}</div><small className="news-source-note">{brief.sourceNote}</small></article>:<article className="g-card g-news"><CardHead index="06" title="中东非工作情报" meta="DAILY INTELLIGENCE"/><div className="news-lead"><strong>今天值得关注的<br/>市场信号</strong><span>每日聚合一次<br/>点击标题阅读原文 ↗</span></div><div className="news-columns">{[["中东非要闻","region"],["消费电子与品牌动作","brand"],["电商与渠道动态","commerce"]].map(([title,key])=><section key={key}><h3>{title}</h3>{news.filter(n=>n.category===key).slice(0,4).map((item,i)=><a href={item.link} target="_blank" rel="noreferrer" key={`${item.link}-${i}`}><span>{String(i+1).padStart(2,"0")} · {item.source} · {formatNewsDate(item.publishedAt)}</span><strong>{item.title}</strong></a>)}{!news.some(n=>n.category===key)&&<p>情报源暂时不可用，已阻止空内容替换。</p>}</section>)}</div><small className="news-source-note">SOURCE SET · Reuters / The National / Arab News / Gulf News / 品牌官方新闻</small></article>}
    </section>{!embedded&&<footer className="glance-footer"><span>INSPIRED BY GLANCE · BUILT FOR ALEX</span><Link href="/">返回全部工具 →</Link></footer>}
  </main>;
}
function CardHead({index,title,meta}:{index:string;title:string;meta:string}){return <header className="g-head"><span>{index}</span><h2>{title}</h2><small>{meta}</small></header>}
function greeting(d:Date){const h=Number(new Intl.DateTimeFormat("en",{timeZone:"Asia/Dubai",hour:"2-digit",hour12:false}).format(d));return h<12?"MORNING":h<18?"AFTERNOON":"EVENING"}
function weatherIcon(code?:number){if(code===undefined)return"·";if(code===0)return"☀";if(code<=3)return"◐";if(code<=48)return"≋";if(code<=67)return"☂";if(code<=77)return"❄";if(code<=82)return"☔";return"ϟ"}
function weatherText(code?:number){if(code===undefined)return"正在获取";if(code===0)return"晴朗";if(code<=3)return"局部多云";if(code<=48)return"雾";if(code<=67)return"有雨";if(code<=77)return"降雪";if(code<=82)return"阵雨";return"雷雨"}
const blockedBriefWords=["已接入","下一期正在准备","网站新闻区","聊天记录","自动化任务","专属容器","占位内容","GitHub 仓库"];
function isPublishableBrief(value:unknown):value is DailyBrief{if(!value||typeof value!=="object")return false;const b=value as DailyBrief;const text=JSON.stringify(b);const items=Array.isArray(b.sections)?b.sections.flatMap(s=>Array.isArray(s.items)?s.items:[]):[];return typeof b.date==="string"&&typeof b.headline==="string"&&typeof b.summary==="string"&&Number.isFinite(b.readingMinutes)&&b.readingMinutes>0&&b.readingMinutes<=30&&Array.isArray(b.sections)&&b.sections.length===10&&items.length>=5&&items.every(i=>typeof i.title==="string"&&typeof i.source==="string"&&typeof i.url==="string"&&/^https?:\/\//.test(i.url))&&!blockedBriefWords.some(word=>text.includes(word))}
function formatBriefDate(value:string){try{return new Intl.DateTimeFormat("zh-CN",{timeZone:"Asia/Dubai",year:"numeric",month:"long",day:"numeric"}).format(new Date(`${value}T08:00:00+04:00`))}catch{return value}}
function formatNewsDate(value:string){if(!value)return"今日";try{return new Intl.DateTimeFormat("zh-CN",{timeZone:"Asia/Dubai",month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(value))}catch{return"今日"}}
