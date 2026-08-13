"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Weather = { temperature_2m:number; apparent_temperature:number; relative_humidity_2m:number; weather_code:number; wind_speed_10m:number };
type Forecast = { time:string[]; temperature_2m_max:number[]; temperature_2m_min:number[]; weather_code:number[] };
type Todo = { id:number; text:string; done:boolean };
type NewsItem = { title:string; link:string; source:string; publishedAt:string; category:string };
const shortcuts = [["GitHub","https://github.com/zzm0417-tech/zhumen5000-TOOLS","代码仓库"],["Cloudflare","https://dash.cloudflare.com/","部署管理"],["Amazon UAE","https://www.amazon.ae/","渠道观察"],["Noon","https://www.noon.com/uae-en/","渠道观察"],["每日英语","/english","学习"],["畅销品看板","/bestsellers","工作"]];

export default function GlancePage({embedded=false}:{embedded?:boolean}) {
  const [now,setNow]=useState(new Date());
  const [weather,setWeather]=useState<Weather|null>(null);
  const [forecast,setForecast]=useState<Forecast|null>(null);
  const [rates,setRates]=useState<Record<string,number>>({CNY:1.96,SAR:1.02,USD:.2723,EUR:.234});
  const [todos,setTodos]=useState<Todo[]>([]);
  const [todoText,setTodoText]=useState("");
  const [note,setNote]=useState("");
  const [news,setNews]=useState<NewsItem[]>([]);
  useEffect(()=>{const timer=window.setInterval(()=>setNow(new Date()),1000);queueMicrotask(()=>{try{setTodos(JSON.parse(localStorage.getItem("alex-glance-todos")||"[]"));setNote(localStorage.getItem("alex-glance-note")||"")}catch{}});
    fetch("https://api.open-meteo.com/v1/forecast?latitude=25.2048&longitude=55.2708&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FDubai&forecast_days=5").then(r=>r.json()).then(d=>{setWeather(d.current);setForecast(d.daily)}).catch(()=>{});
    fetch("https://open.er-api.com/v6/latest/AED").then(r=>r.json()).then(d=>d.rates&&setRates({CNY:d.rates.CNY,SAR:d.rates.SAR,USD:d.rates.USD,EUR:d.rates.EUR})).catch(()=>{});return()=>window.clearInterval(timer)},[]);
  useEffect(()=>{fetch("/api/news").then(r=>r.json()).then(d=>setNews(d.items||[])).catch(()=>{})},[]);
  useEffect(()=>{localStorage.setItem("alex-glance-todos",JSON.stringify(todos))},[todos]);
  useEffect(()=>{localStorage.setItem("alex-glance-note",note)},[note]);
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
      <article className="g-card g-note"><CardHead index="06" title="随手记" meta="AUTO SAVED"/><textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="想法、提醒、临时数字……写在这里会自动保存在当前浏览器。"/><small>{note.length} 字 · 仅保存在此设备</small></article>
      <article className="g-card g-news"><CardHead index="07" title="中东非工作情报" meta="DAILY REFRESH"/><div className="news-columns">{[["中东非要闻","region"],["消费电子与品牌动作","brand"],["电商与渠道动态","commerce"]].map(([title,key])=><section key={key}><h3>{title}</h3>{news.filter(n=>n.category===key).slice(0,4).map((item,i)=><a href={item.link} target="_blank" rel="noreferrer" key={`${item.link}-${i}`}><span>{item.source} · {formatNewsDate(item.publishedAt)}</span><strong>{item.title}</strong></a>)}{!news.some(n=>n.category===key)&&<p>正在获取今日新闻…</p>}</section>)}</div><small className="news-source-note">来源：Reuters、The National、Arab News、Gulf News及品牌官方新闻；每日刷新一次。</small></article>
    </section>{!embedded&&<footer className="glance-footer"><span>INSPIRED BY GLANCE · BUILT FOR ALEX</span><Link href="/">返回全部工具 →</Link></footer>}
  </main>;
}
function CardHead({index,title,meta}:{index:string;title:string;meta:string}){return <header className="g-head"><span>{index}</span><h2>{title}</h2><small>{meta}</small></header>}
function greeting(d:Date){const h=Number(new Intl.DateTimeFormat("en",{timeZone:"Asia/Dubai",hour:"2-digit",hour12:false}).format(d));return h<12?"MORNING":h<18?"AFTERNOON":"EVENING"}
function weatherIcon(code?:number){if(code===undefined)return"·";if(code===0)return"☀";if(code<=3)return"◐";if(code<=48)return"≋";if(code<=67)return"☂";if(code<=77)return"❄";if(code<=82)return"☔";return"ϟ"}
function weatherText(code?:number){if(code===undefined)return"正在获取";if(code===0)return"晴朗";if(code<=3)return"局部多云";if(code<=48)return"雾";if(code<=67)return"有雨";if(code<=77)return"降雪";if(code<=82)return"阵雨";return"雷雨"}
function formatNewsDate(value:string){if(!value)return"今日";try{return new Intl.DateTimeFormat("zh-CN",{timeZone:"Asia/Dubai",month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(value))}catch{return"今日"}}
