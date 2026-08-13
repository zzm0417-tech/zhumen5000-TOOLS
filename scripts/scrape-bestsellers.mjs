import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const countries = {
  AE: { amazon: "amazon.ae", noon: "uae-en", currency: "AED" },
  SA: { amazon: "amazon.sa", noon: "saudi-en", currency: "SAR" },
  EG: { amazon: "amazon.eg", noon: "egypt-en", currency: "EGP" },
};
const categories = {
  phone: "smartphones",
  audio: "wireless earbuds headphones",
  wearable: "smart watches fitness trackers",
  tablet: "tablets",
};
const outDir = path.resolve("public/data/bestsellers");
const now = new Date();
const runId = now.toISOString().replace(/[:.]/g, "-");
const date = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Dubai", year: "numeric", month: "2-digit", day: "2-digit",
}).format(now);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const text = async locator => {
  try { return (await locator.first().innerText({ timeout: 1500 })).trim() || null; }
  catch { return null; }
};
const attr = async (locator, name) => {
  try { return await locator.first().getAttribute(name, { timeout: 1500 }); }
  catch { return null; }
};
const number = value => {
  const match = String(value ?? "").replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
};
const brandOf = name => (name.match(/^(Apple|Samsung|Huawei|HONOR|Xiaomi|Redmi|Nothing|OnePlus|OPPO|vivo|realme|JBL|Sony|Bose|Anker|Soundcore|Garmin|Amazfit|Lenovo|Motorola)/i)?.[0] || "").toUpperCase();

function sourceFor(country, platform, category) {
  const market = countries[country];
  const query = encodeURIComponent(categories[category]);
  if (platform === "amazon") {
    return `https://www.${market.amazon}/s?k=${query}&s=exact-aware-popularity-rank`;
  }
  return `https://www.noon.com/${market.noon}/search/?q=${query}&sort%5Bby%5D=popularity&sort%5Bdir%5D=desc`;
}

async function parseAmazon(page, meta) {
  const cards = page.locator('[data-component-type="s-search-result"][data-asin]');
  const products = [];
  for (let i = 0; i < await cards.count() && products.length < 50; i++) {
    const card = cards.nth(i);
    const whole = (await text(card)) || "";
    if (/sponsored/i.test(whole)) continue;
    const id = await attr(card, "data-asin");
    const name = await text(card.locator("h2"));
    const href = await attr(card.locator("h2 a"), "href");
    if (!id || !name || !href) continue;
    const priceText = await text(card.locator(".a-price .a-offscreen"));
    const oldPriceText = await text(card.locator(".a-text-price .a-offscreen"));
    const ratingText = await text(card.locator(".a-icon-alt"));
    const reviewText = await text(card.locator('[aria-label$="ratings"], [aria-label$="rating"]'));
    products.push({
      observedRank: products.length + 1,
      marketplaceRank: null,
      id,
      brand: brandOf(name),
      name,
      price: number(priceText),
      priceText,
      originalPrice: number(oldPriceText),
      originalPriceText: oldPriceText,
      currency: countries[meta.country].currency,
      rating: number(ratingText),
      reviewCount: number(reviewText),
      bestsellerBadge: /best.?seller/i.test(whole),
      sponsored: false,
      availability: /out of stock|currently unavailable/i.test(whole) ? "unavailable" : "unknown",
      productUrl: new URL(href, meta.sourceUrl).href,
      imageUrl: await attr(card.locator("img.s-image"), "src"),
    });
  }
  return products;
}

async function parseNoon(page, meta) {
  const cards = page.locator('div[data-qa="product-box"], div[data-qa="product-card"], a[href*="/p/"]');
  const products = [];
  const seen = new Set();
  for (let i = 0; i < await cards.count() && products.length < 50; i++) {
    const card = cards.nth(i);
    const whole = (await text(card)) || "";
    const href = await attr(card.locator('a[href*="/p/"]'), "href") || await attr(card, "href");
    const id = href?.match(/\/p\/([^/?]+)/)?.[1] || null;
    const name = await text(card.locator('[data-qa="product-name"], h2, h3, [title]'));
    const key = id || href || name;
    if (!name || !href || !key || seen.has(key)) continue;
    seen.add(key);
    const priceText = await text(card.locator('[data-qa="product-price"], [class*="priceNow"], [class*="Price"]'));
    const oldPriceText = await text(card.locator('[class*="priceWas"], del'));
    const ratingText = await text(card.locator('[data-qa="product-rating"], [class*="rating"]'));
    const reviewText = await text(card.locator('[class*="review"], [class*="count"]'));
    const marketplaceRank = number(whole.match(/#\s*\d+\s+in\s+/i)?.[0]);
    products.push({
      observedRank: products.length + 1,
      marketplaceRank,
      id,
      brand: brandOf(name),
      name,
      price: number(priceText),
      priceText,
      originalPrice: number(oldPriceText),
      originalPriceText: oldPriceText,
      currency: countries[meta.country].currency,
      rating: number(ratingText),
      reviewCount: number(reviewText),
      bestsellerBadge: /best.?seller/i.test(whole),
      sponsored: false,
      availability: /out of stock|currently unavailable/i.test(whole) ? "unavailable" : "unknown",
      productUrl: new URL(href, meta.sourceUrl).href,
      imageUrl: await attr(card.locator("img"), "src"),
    });
  }
  return products;
}

async function scrape(context, country, platform, category) {
  const sourceUrl = sourceFor(country, platform, category);
  const meta = {
    country, platform, category, sourceUrl,
    sourceType: platform === "amazon" ? "search_popularity" : "marketplace_popularity",
    fetchedAt: now.toISOString(),
  };
  const page = await context.newPage();
  try {
    const response = await page.goto(sourceUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(3000);
    const body = ((await page.locator("body").innerText()).slice(0, 6000)).toLowerCase();
    if (response && response.status() >= 400) throw new Error(`HTTP ${response.status()}`);
    if (["captcha", "robot check", "access denied", "enter the characters"].some(term => body.includes(term))) {
      throw new Error("平台触发验证码或访问限制");
    }
    const products = platform === "amazon" ? await parseAmazon(page, meta) : await parseNoon(page, meta);
    if (products.length < 5) throw new Error(`页面解析仅得到 ${products.length} 个商品，未达到最低完整性要求`);
    return { ...meta, status: "success", lastSuccessAt: now.toISOString(), error: null, products };
  } catch (error) {
    return {
      ...meta,
      status: "failed",
      lastSuccessAt: null,
      error: error instanceof Error ? error.message : "未知抓取错误",
      products: [],
    };
  } finally {
    await page.close();
  }
}

async function addLastSuccess(boards) {
  let dates = [];
  try { dates = JSON.parse(await fs.readFile(path.join(outDir, "index.json"), "utf8")).dates || []; }
  catch {}
  for (const board of boards.filter(item => item.status === "failed")) {
    for (const oldDate of dates) {
      try {
        const old = JSON.parse(await fs.readFile(path.join(outDir, `${oldDate}.json`), "utf8"));
        const match = old.boards.find(item =>
          item.country === board.country &&
          item.platform === board.platform &&
          item.category === board.category &&
          item.status === "success"
        );
        if (match) { board.lastSuccessAt = match.fetchedAt; break; }
      } catch {}
    }
  }
}

await fs.mkdir(path.join(outDir, "_runs", date), { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  locale: "en-US",
  viewport: { width: 1440, height: 1200 },
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36",
});
const boards = [];
for (const country of Object.keys(countries)) {
  for (const platform of ["amazon", "noon"]) {
    for (const category of Object.keys(categories)) {
      boards.push(await scrape(context, country, platform, category));
      await sleep(2000 + Math.random() * 3000);
    }
  }
}
await browser.close();
await addLastSuccess(boards);

const snapshot = { schemaVersion: 2, date, runId, generatedAt: now.toISOString(), boards };
const run = {
  schemaVersion: 2,
  runId,
  date,
  generatedAt: now.toISOString(),
  attempted: boards.length,
  successful: boards.filter(item => item.status === "success").length,
  failed: boards.filter(item => item.status === "failed").length,
  targets: boards.map(({ country, platform, category, status, error, products }) => ({
    country, platform, category, status, error, records: products.length,
  })),
};
await fs.writeFile(path.join(outDir, `${date}.json`), JSON.stringify(snapshot, null, 2) + "\n");
await fs.writeFile(path.join(outDir, "latest.json"), JSON.stringify(snapshot, null, 2) + "\n");
await fs.writeFile(path.join(outDir, "_runs", date, `${runId}.json`), JSON.stringify(run, null, 2) + "\n");

let dates = [];
try { dates = JSON.parse(await fs.readFile(path.join(outDir, "index.json"), "utf8")).dates || []; }
catch {}
dates = [date, ...dates.filter(item => item !== date)];
await fs.writeFile(path.join(outDir, "index.json"), JSON.stringify({
  schemaVersion: 2,
  dates,
  updatedAt: now.toISOString(),
  latestRun: run,
}, null, 2) + "\n");
console.log(JSON.stringify(run));
