"use client";

import { useEffect, useMemo, useState } from "react";
import GlancePage from "./glance/page";

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
  { id: "market", name: "电渠 TOP 畅销品监控看板", eyebrow: "UAE · KSA · DAILY", desc: "六大榜单、华为席位、排名变化与竞争告警", category: "工作", tone: "amber", mark: "▥", href: "/bestsellers" },
  { id: "english", name: "每日英语", eyebrow: "DAILY · 08:00 DXB", desc: "5 个单词、3 个句子、对话、复习与表达模板", category: "学习", tone: "blue", mark: "Aa", href: "/english" },
  { id: "unit", name: "全能单位转换器", eyebrow: "UNIT · CURRENCY · LIVE", desc: "汇率、长度、面积、重量、温度一站转换", category: "生活", tone: "lime", mark: "↔" },
  { id: "fx", name: "多币种快捷换算", eyebrow: "FINANCE · LIVE", desc: "AED、SAR、CNY、USD、EUR 即时换算", category: "生活", tone: "cyan", mark: "¥" },
  { id: "freight", name: "快递体积重", eyebrow: "SHIPPING", desc: "比较实际重量与体积重量，估算计费重", category: "生活", tone: "orange", mark: "◫" },
  { id: "time", name: "双城时间", eyebrow: "DUBAI · SHANGHAI", desc: "迪拜与上海时间即时对照", category: "生活", tone: "indigo", mark: "◷" },
  { id: "whiteboard", name: "创作白板", eyebrow: "EXCALIDRAW · LOCAL FIRST", desc: "画流程、做脑暴、写方案；自动保存在当前浏览器", category: "创作", tone: "rose", mark: "✎", href: "/whiteboard" },
];

const categories = ["全部", "生活", "工作", "学习", "创作"];

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
    if (tool.href?.startsWith("/")) window.location.assign(tool.href);
    else if (tool.href) window.open(tool.href, "_blank", "noopener,noreferrer");
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

      <GlancePage embedded />

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

type QuizQuestion=
  | {type:"choice";prompt:string;options:string[];answer:string}
  | {type:"spelling";prompt:string;hint:string;answer:string};
type Lesson={theme:string;scene:string;words:[string,string,string][];sentences:[string,string][];dialogue:[string,string][];template:string;quiz:QuizQuestion[]};
const workLessons:Lesson[]=[
  {theme:"把进度说清楚",scene:"PROJECT UPDATE",words:[["align","对齐；达成一致","Let's align on the timeline."],["on track","进展正常","The launch is on track."],["blocker","阻碍因素","The main blocker is inventory."],["milestone","里程碑","We reached the first milestone."],["follow up","跟进","I'll follow up tomorrow."]],sentences:[["We are on track to close this by Friday.","我们有望在周五前完成。"],["The main blocker is the delayed input from the local team.","主要障碍是本地团队输入延迟。"],["Let me follow up and get back to you today.","我来跟进，今天回复你。"]],dialogue:[["A","Are we still on track for launch?"],["B","Yes. The only blocker is the final price approval."],["A","Please follow up and keep me posted."]],template:"We are [on track / slightly behind] because ___. The next milestone is ___.",quiz:[{type:"choice",prompt:"“项目进展正常”最自然的表达是？",options:["The project is on track.","The project is on road.","The project is tracking."],answer:"The project is on track."},{type:"choice",prompt:"哪个词表示“阻碍项目推进的因素”？",options:["milestone","blocker","driver"],answer:"blocker"},{type:"spelling",prompt:"拼写：里程碑",hint:"m________",answer:"milestone"},{type:"spelling",prompt:"补全：I'll ___ up and get back to you today.",hint:"跟进",answer:"follow"}]},
  {theme:"会议中表达不同意见",scene:"MEETING",words:[["perspective","观点；视角","From my perspective..."],["concern","顾虑","My concern is the timing."],["alternative","替代方案","We have an alternative."],["trade-off","取舍","There is a trade-off."],["revisit","重新讨论","Let's revisit the plan."]],sentences:[["I see your point, but I have one concern.","我理解你的观点，但有一个顾虑。"],["Could we consider an alternative approach?","我们能否考虑另一种方法？"],["Let's revisit this after we review the data.","看完数据后我们再讨论。"]],dialogue:[["A","I suggest increasing the discount."],["B","I see your point, but my concern is margin."],["A","Fair. Let's review the trade-off."]],template:"I see your point, but my concern is ___. Could we consider ___?",quiz:[{type:"choice",prompt:"哪句话最适合礼貌提出不同意见？",options:["You are wrong.","I see your point, but I have one concern.","I don't accept it."],answer:"I see your point, but I have one concern."},{type:"choice",prompt:"trade-off 的含义是？",options:["取舍","共识","进度"],answer:"取舍"},{type:"spelling",prompt:"拼写：替代方案",hint:"a__________",answer:"alternative"},{type:"spelling",prompt:"补全：Let's ___ this after we review the data.",hint:"重新讨论",answer:"revisit"}]},
  {theme:"汇报数据与趋势",scene:"BUSINESS REVIEW",words:[["momentum","势头","Sales gained momentum."],["decline","下降","We saw a slight decline."],["outperform","表现优于","KSA outperformed the target."],["gap","差距","There is a 10% gap."],["driver","驱动因素","Traffic was the key driver."]],sentences:[["Revenue is up 12% week over week.","收入周环比增长12%。"],["KSA outperformed the target, mainly driven by wearables.","沙特超额完成目标，主要由穿戴驱动。"],["The gap is narrowing, but we still need to improve conversion.","差距正在缩小，但仍需改善转化。"]],dialogue:[["A","What drove the growth?"],["B","Higher traffic and better conversion."],["A","Is the momentum sustainable?"]],template:"___ increased by ___, mainly driven by ___. The remaining gap is ___.",quiz:[{type:"choice",prompt:"“周环比增长 12%”应表达为？",options:["up 12% week over week","up 12% every week","up to 12% weekly"],answer:"up 12% week over week"},{type:"choice",prompt:"表示“表现优于目标”的动词是？",options:["decline","outperform","revisit"],answer:"outperform"},{type:"spelling",prompt:"拼写：势头",hint:"m_______",answer:"momentum"},{type:"spelling",prompt:"补全：Traffic was the key ___.",hint:"驱动因素",answer:"driver"}]},
  {theme:"推动对方行动",scene:"COLLABORATION",words:[["action item","行动项","Let's confirm the action items."],["owner","责任人","Who is the owner?"],["deadline","截止时间","The deadline is Thursday."],["prioritize","优先处理","Please prioritize this."],["commit","承诺做到","Can we commit to Friday?"]],sentences:[["Could you prioritize this and confirm by noon?","能否优先处理并在中午前确认？"],["Let's assign an owner and a clear deadline.","我们明确责任人和截止时间。"],["Can we commit to closing this by Friday?","我们能否承诺周五前关闭？"]],dialogue:[["A","Who owns the price update?"],["B","I do. I'll close it by Thursday."],["A","Great, please keep us posted."]],template:"Could you please ___ by ___? This is needed for ___.",quiz:[{type:"choice",prompt:"哪句话能明确但礼貌地推动行动？",options:["Do it now.","Could you prioritize this and confirm by noon?","Why haven't you done it?"],answer:"Could you prioritize this and confirm by noon?"},{type:"choice",prompt:"项目中的 owner 指什么？",options:["客户","责任人","审批人"],answer:"责任人"},{type:"spelling",prompt:"拼写：截止时间",hint:"d_______",answer:"deadline"},{type:"spelling",prompt:"补全：Can we ___ to closing this by Friday?",hint:"承诺",answer:"commit"}]},
  {theme:"电话与即时沟通",scene:"CALLS",words:[["clarify","澄清","Let me clarify one point."],["cut out","声音中断","You're cutting out."],["recap","回顾总结","Let me recap."],["available","有空的","Are you available at three?"],["reschedule","改期","Can we reschedule?"]],sentences:[["Sorry, you're cutting out. Could you repeat that?","抱歉，声音断断续续，能再说一次吗？"],["Let me recap the key points before we close.","结束前我总结一下要点。"],["Something came up. Could we reschedule to tomorrow?","临时有事，能改到明天吗？"]],dialogue:[["A","Can you hear me clearly?"],["B","Mostly, but you're cutting out a little."],["A","I'll reconnect and call you back."]],template:"Let me clarify ___. What I mean is ___.",quiz:[{type:"choice",prompt:"对方声音断断续续时怎么说？",options:["You're cutting out.","You're cutting down.","You're turning off."],answer:"You're cutting out."},{type:"choice",prompt:"结束通话前“总结一下”用哪个词？",options:["revisit","recap","reschedule"],answer:"recap"},{type:"spelling",prompt:"拼写：澄清",hint:"c______",answer:"clarify"},{type:"spelling",prompt:"补全：Could we ___ to tomorrow?",hint:"改期",answer:"reschedule"}]}
];
const lifeLessons:Lesson[]=[
  {theme:"入住与维修沟通",scene:"LIFE · HOME",words:[["maintenance","维修","I need maintenance support."],["leak","漏水","There is a small leak."],["appointment","预约","I'd like to book an appointment."],["available","可用；有空","Is anyone available today?"],["urgent","紧急的","It's quite urgent."]],sentences:[["There seems to be a leak under the sink.","水槽下面好像漏水。"],["Could you send someone to check it today?","今天能派人来检查吗？"],["Please let me know the available time slots.","请告诉我可预约的时间。"]],dialogue:[["A","How can I help?"],["B","There is a leak under my kitchen sink."],["A","We'll send someone this afternoon."]],template:"There seems to be ___. Could you send someone to check it by ___?",quiz:[{type:"choice",prompt:"描述水槽下漏水应说？",options:["There is a leak under the sink.","There is water broken.","The sink is leaking out."],answer:"There is a leak under the sink."},{type:"choice",prompt:"maintenance 的含义是？",options:["搬家","维修","清洁"],answer:"维修"},{type:"spelling",prompt:"拼写：预约",hint:"a__________",answer:"appointment"},{type:"spelling",prompt:"补全：Is anyone ___ today?",hint:"有空",answer:"available"}]},
  {theme:"商店购买与退换",scene:"LIFE · SHOPPING",words:[["receipt","收据","Do you have the receipt?"],["refund","退款","I'd like a refund."],["exchange","换货","Can I exchange this?"],["defective","有缺陷的","The item is defective."],["warranty","保修","Is it under warranty?"]],sentences:[["I'd like to exchange this for a different size.","我想换一个尺码。"],["The item appears to be defective.","这个商品似乎有问题。"],["Could you explain the refund policy?","能说明一下退款政策吗？"]],dialogue:[["A","What seems to be the problem?"],["B","It doesn't turn on. I'd like an exchange."],["A","Do you have the receipt?"]],template:"I bought this on ___. Unfortunately, ___. Could I [exchange it / get a refund]?",quiz:[{type:"choice",prompt:"想换一个尺码时应说？",options:["I'd like to exchange this for a different size.","I want to change another size.","Please switch the size."],answer:"I'd like to exchange this for a different size."},{type:"choice",prompt:"defective 的含义是？",options:["打折的","缺货的","有缺陷的"],answer:"有缺陷的"},{type:"spelling",prompt:"拼写：收据",hint:"r______",answer:"receipt"},{type:"spelling",prompt:"补全：Is it under ___?",hint:"保修",answer:"warranty"}]}
];
function dubaiDay(now:Date){const p=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Dubai",year:"numeric",month:"2-digit",day:"2-digit",weekday:"short",hour:"2-digit",hour12:false}).formatToParts(now);const get=(t:string)=>p.find(x=>x.type===t)?.value||"";const date=`${get("year")}-${get("month")}-${get("day")}`;const weekday=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(get("weekday"));const hour=Number(get("hour"));const effective=new Date(`${date}T00:00:00Z`);if(hour<8)effective.setUTCDate(effective.getUTCDate()-1);return {key:effective.toISOString().slice(0,10),weekday:effective.getUTCDay()};}
function lessonForDate(date:Date){const weekend=[0,6].includes(date.getUTCDay());const bank=weekend?lifeLessons:workLessons;const epoch=Math.floor(date.getTime()/86400000);return {lesson:bank[((epoch%bank.length)+bank.length)%bank.length],date,weekend};}
function EnglishDaily({now}:{now:Date}){
  const currentKey=dubaiDay(now).key;
  const [selectedKey,setSelectedKey]=useState(currentKey);
  const [answers,setAnswers]=useState<Record<number,string>>({});
  const [submitted,setSubmitted]=useState(false);
  const archive=useMemo(()=>{const items:{key:string;label:string;lesson:ReturnType<typeof lessonForDate>}[]=[];const cursor=new Date("2026-07-28T00:00:00Z");const end=new Date(`${currentKey}T00:00:00Z`);while(cursor<=end){const date=new Date(cursor);items.unshift({key:date.toISOString().slice(0,10),label:date.toLocaleDateString("zh-CN",{month:"long",day:"numeric",weekday:"short",timeZone:"UTC"}),lesson:lessonForDate(date)});cursor.setUTCDate(cursor.getUTCDate()+1)}return items},[currentKey]);
  const selected=archive.find(item=>item.key===selectedKey)??archive[0]!;
  const today=selected.lesson,l=today.lesson;
  const dayNumber=archive.length-archive.findIndex(item=>item.key===selectedKey);
  const normalize=(value:string)=>value.trim().toLocaleLowerCase().replace(/[.?!。！？]$/g,"");
  const score=l.quiz.reduce((total,q,i)=>total+(normalize(answers[i]??"")===normalize(q.answer)?1:0),0);
  const chooseLesson=(key:string)=>{setSelectedKey(key);setAnswers({});setSubmitted(false);window.scrollTo({top:0,behavior:"smooth"})};
  return <div className="english-daily">
    <section className="lesson-archive" aria-label="往期课程"><div><small>LESSON ARCHIVE</small><h2>选择期数</h2><p>从第一期开始持续累积，随时回来复习。</p></div><label><span>当前课程</span><select value={selectedKey} onChange={e=>chooseLesson(e.target.value)}>{archive.map((item,index)=><option key={item.key} value={item.key}>第 {archive.length-index} 期 · {item.label} · {item.lesson.lesson.theme}</option>)}</select></label></section>
    <div className="lesson-hero"><div><small>{today.weekend?"WEEKEND · LIFE ENGLISH":"WEEKDAY · WORK ENGLISH"}</small><h2>{l.theme}</h2><p>{today.date.toLocaleDateString("zh-CN",{month:"long",day:"numeric",weekday:"long",timeZone:"UTC"})} · 每天 08:00（迪拜）更新</p></div><span>LESSON<br/><b>{String(dayNumber).padStart(3,"0")}</b></span></div>
    <section className="lesson-block"><header><b>01</b><h3>今日 5 词</h3><small>{l.scene}</small></header><div className="word-list">{l.words.map(([w,c,e])=><article key={w}><strong>{w}</strong><span>{c}</span><p>{e}</p></article>)}</div></section>
    <section className="lesson-block"><header><b>02</b><h3>高频句子</h3></header><div className="sentence-list">{l.sentences.map(([e,c],i)=><article key={e}><b>0{i+1}</b><div><strong>{e}</strong><span>{c}</span></div></article>)}</div></section>
    <div className="lesson-split"><section className="lesson-block"><header><b>03</b><h3>迷你对话</h3></header><div className="dialogue">{l.dialogue.map(([who,line],i)=><p key={i}><b>{who}</b><span>{line}</span></p>)}</div></section><section className="lesson-block template-card"><header><b>04</b><h3>直接套用</h3></header><blockquote>{l.template}</blockquote></section></div>
    <section className="quiz-card"><header><div><small>FINAL CHECK · 提交后显示答案</small><h3>本期小测验</h3></div><strong>{submitted?`${score} / ${l.quiz.length}`:`${l.quiz.length} 题`}</strong></header><div className="quiz-list">{l.quiz.map((q,i)=>{const correct=normalize(answers[i]??"")===normalize(q.answer);return <fieldset className={submitted?(correct?"correct":"wrong"):""} key={q.prompt}><legend><b>{String(i+1).padStart(2,"0")}</b>{q.prompt}</legend>{q.type==="choice"?<div className="quiz-options">{q.options.map(option=><label key={option}><input type="radio" name={`q-${selectedKey}-${i}`} value={option} checked={answers[i]===option} disabled={submitted} onChange={e=>setAnswers({...answers,[i]:e.target.value})}/><span>{option}</span></label>)}</div>:<label className="spelling-input"><span>{q.hint}</span><input value={answers[i]??""} disabled={submitted} autoComplete="off" spellCheck={false} placeholder="输入英文答案" onChange={e=>setAnswers({...answers,[i]:e.target.value})}/></label>}{submitted&&<p className="answer-note">{correct?"✓ 回答正确":"✕ 正确答案："+q.answer}</p>}</fieldset>})}</div>{!submitted?<button className="submit-quiz" disabled={Object.keys(answers).length<l.quiz.length} onClick={()=>setSubmitted(true)}>提交答案</button>:<button className="retry-quiz" onClick={()=>{setAnswers({});setSubmitted(false)}}>再测一次</button>}</section>
  </div>
}

export { EnglishDaily };

function PanelTitle({ over, title }: {over:string,title:string}) { return <header className="panel-title"><small>{over}</small><h2>{title}</h2></header> }
function formatTime(d: Date, zone: string) { return new Intl.DateTimeFormat("zh-CN", { timeZone: zone, hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false }).format(d) }
function formatDate(d: Date, zone: string) { return new Intl.DateTimeFormat("zh-CN", { timeZone: zone, month:"long", day:"numeric", weekday:"short" }).format(d) }
