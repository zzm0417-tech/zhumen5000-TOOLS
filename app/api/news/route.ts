type FeedConfig = { category:string; query:string };
const feeds:FeedConfig[]=[
  {category:"region",query:'(UAE OR "Saudi Arabia" OR Qatar OR Kuwait OR Bahrain OR Africa) (site:reuters.com OR site:thenationalnews.com OR site:arabnews.com OR site:gulfnews.com)'},
  {category:"brand",query:'(Huawei OR Samsung OR Apple OR HONOR OR Xiaomi) (Middle East OR Africa OR UAE OR Saudi) (site:reuters.com OR site:consumer.huawei.com OR site:news.samsung.com OR site:apple.com OR site:honor.com)'},
  {category:"commerce",query:'(Amazon OR Noon OR ecommerce OR retail OR marketplace) (UAE OR Saudi OR Middle East OR Africa) (site:reuters.com OR site:thenationalnews.com OR site:arabnews.com OR site:gulfnews.com)'},
];

export async function GET(){
  const settled=await Promise.allSettled(feeds.map(async feed=>{
    const url=`https://news.google.com/rss/search?q=${encodeURIComponent(feed.query)}&hl=en-AE&gl=AE&ceid=AE:en`;
    const xml=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0 AlexToolbox/1.0"}}).then(r=>{if(!r.ok)throw new Error(`feed ${r.status}`);return r.text()});
    return parseItems(xml,feed.category).slice(0,6);
  }));
  const items=settled.flatMap(result=>result.status==="fulfilled"?result.value:[]).sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt));
  return Response.json({updatedAt:new Date().toISOString(),items},{headers:{"Cache-Control":"public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600"}});
}

function parseItems(xml:string,category:string){
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(match=>{
    const block=match[1];
    const title=decode(read(block,"title")).replace(/\s+-\s+[^-]+$/," ").trim();
    const source=decode(read(block,"source"))||"News";
    return {title,link:decode(read(block,"link")),source,publishedAt:read(block,"pubDate"),category};
  }).filter(x=>x.title&&x.link);
}
function read(block:string,tag:string){return block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`))?.[1]?.trim()||""}
function decode(value:string){return value.replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">")}
