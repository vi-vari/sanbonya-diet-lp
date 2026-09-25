/*
 * ビルド済みLP（dist/public）を本番と同じサブパス配信で立ち上げ、
 * スマホ相当のヘッドレスブラウザで開いて次を検証する。
 *
 *   1. 画像がすべて表示されている（404・読み込み失敗がない）
 *   2. LINE・HOT PEPPER のCTAが、Home.tsx の LINKS と同じURLを持つ
 *      通常のリンク（<a href target="_blank">）になっている
 *      （iframeモーダルや window.open はスマホ・アプリ内ブラウザで
 *        ブロックされてリンク先に飛べないため禁止）
 *   3. 同一オリジンのリソースに 404 がない、JSエラーがない
 *
 * 1つでも失敗したら終了コード1で終わり、デプロイを止める。
 * 結果は GitHub Actions のサマリー（GITHUB_STEP_SUMMARY）にも出力し、
 * コードを読まなくても Actions の画面で確認できるようにする。
 */

import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { chromium, devices } from "playwright";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIST = path.join(ROOT, "dist/public");
const BASE_PATH = "/sanbonya-diet-lp/";
const HOME_TSX = path.join(ROOT, "client/src/pages/Home.tsx");
// LPには「本の直後」「成功理由の後」「店舗情報の後」の3か所にCTAセクションがある
const CTA_SECTIONS = 3;

const failures = [];
const notes = [];
const fail = (msg) => failures.push(msg);

// ---- 期待するリンクURLを Home.tsx の LINKS から抽出 ----
const source = await fs.readFile(HOME_TSX, "utf-8");
const linksBlock = source.match(/const LINKS = \{([\s\S]*?)\n\};/)?.[1];
if (!linksBlock) throw new Error("Home.tsx から LINKS を抽出できませんでした");
const expected = []; // { clinic, kind, url }
for (const clinicMatch of linksBlock.matchAll(/(\w+): \{([\s\S]*?)\n  \}/g)) {
  const [, clinic, body] = clinicMatch;
  for (const m of body.matchAll(/(line|hotpepper):\s*"([^"]+)"/g)) {
    expected.push({ clinic, kind: m[1], url: m[2] });
  }
}
if (expected.length !== 4) {
  throw new Error(`LINKS から4件のURLを期待しましたが ${expected.length} 件でした`);
}
for (const e of expected) {
  if (e.kind === "line" && !/^https:\/\/lin\.ee\//.test(e.url)) fail(`${e.clinic} のLINE URLが lin.ee ではありません: ${e.url}`);
  if (e.kind === "hotpepper" && !/^https:\/\/beauty\.hotpepper\.jp\//.test(e.url)) fail(`${e.clinic} のHPB URLが beauty.hotpepper.jp ではありません: ${e.url}`);
}

// ---- dist/public を本番と同じサブパスで配信 ----
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon", ".json": "application/json", ".woff2": "font/woff2" };
const server = http.createServer(async (req, res) => {
  let urlPath;
  try { urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname); } catch { urlPath = ""; }
  if (!urlPath.startsWith(BASE_PATH)) { res.writeHead(404); return res.end(); }
  let rel = urlPath.slice(BASE_PATH.length) || "index.html";
  if (rel.endsWith("/")) rel += "index.html";
  const file = path.join(DIST, rel);
  try {
    const data = await fs.readFile(file);
    res.writeHead(200, { "content-type": MIME[path.extname(file)] ?? "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404); res.end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const origin = `http://127.0.0.1:${server.address().port}`;

// ---- スマホ相当のブラウザで開く ----
const launchOptions = process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {};
const browser = await chromium.launch(launchOptions);
try {
  const context = await browser.newContext({ ...devices["iPhone 13"] });
  const page = await context.newPage();
  const pageErrors = [];
  const notFound = [];
  page.on("pageerror", (e) => pageErrors.push(String(e)));
  page.on("response", (r) => { if (r.url().startsWith(origin) && r.status() >= 400) notFound.push(`${r.status()} ${r.url().slice(origin.length)}`); });

  const resp = await page.goto(origin + BASE_PATH, { waitUntil: "load" });
  if (!resp || resp.status() !== 200) fail(`トップページが開けません（status ${resp?.status()}）`);
  await page.waitForSelector("#root img", { timeout: 15000 }).catch(() => fail("ページが描画されません（React が起動していない可能性）"));

  // 遅延読み込みを考慮してページ末尾までスクロール
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});

  // 1. 画像
  const images = await page.$$eval("img", (imgs) => imgs.map((img) => ({ src: img.getAttribute("src"), ok: img.complete && img.naturalWidth > 0 })));
  const brokenImages = images.filter((i) => !i.ok);
  for (const i of brokenImages) fail(`画像が表示されていません: ${i.src}`);
  notes.push(`画像: ${images.length - brokenImages.length}/${images.length} 件が表示`);

  // 2. CTAリンク
  const anchors = await page.$$eval("a[href]", (as) => as.map((a) => ({ href: a.href, target: a.getAttribute("target"), rel: a.getAttribute("rel") ?? "", text: a.textContent.trim() })));
  for (const e of expected) {
    const found = anchors.filter((a) => a.href === e.url);
    const label = `${e.clinic} / ${e.kind}`;
    if (found.length !== CTA_SECTIONS) fail(`${label} のリンクが ${CTA_SECTIONS} 件あるはずが ${found.length} 件です: ${e.url}`);
    for (const a of found) {
      if (a.target !== "_blank") fail(`${label} のリンクが別タブで開く設定（target="_blank"）になっていません`);
      if (!a.rel.includes("noopener")) fail(`${label} のリンクに rel="noopener" がありません`);
    }
    notes.push(`リンク: ${label} → ${e.url}（${found.length} 件）`);
  }
  const ctaButtons = await page.$$eval("button", (bs) => bs.map((b) => b.textContent.trim()).filter((t) => /LINE|ホットペッパー|予約/.test(t)));
  for (const t of ctaButtons) fail(`CTAが <button> になっています（リンクではないためスマホで飛べません）: 「${t}」`);
  const embeddedExternal = await page.$$eval("iframe", (fs) => fs.map((f) => f.getAttribute("src") ?? "").filter((s) => /lin\.ee|hotpepper|line\.me/.test(s)));
  for (const s of embeddedExternal) fail(`LINE/HPB を iframe に埋め込んでいます（表示されません）: ${s}`);
  if (source.includes("window.open(")) fail("Home.tsx に window.open があります（アプリ内ブラウザでブロックされます）");

  // 3. 404・JSエラー
  for (const n of notFound) fail(`404: ${n}`);
  for (const e of pageErrors) fail(`JSエラー: ${e.slice(0, 200)}`);
} finally {
  await browser.close();
  server.close();
}

// ---- 結果出力 ----
const lines = [];
lines.push(failures.length === 0 ? "## ✅ LP検証: すべて合格" : `## ❌ LP検証: ${failures.length} 件の問題`);
for (const f of failures) lines.push(`- ❌ ${f}`);
lines.push("");
lines.push("### 確認した内容");
for (const n of notes) lines.push(`- ${n}`);
const report = lines.join("\n");
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, report + "\n");
if (failures.length > 0) process.exitCode = 1;
