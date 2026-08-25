/*
 * Home.tsx が参照する画像が client/public/ に揃っているか確認する。
 *
 * 画像はベースパス込みで参照している（GitHub Pages がサブパス配信のため）。
 * ファイルを置き忘れると LP 上の画像が表示されなくなるので、ビルド時に検出する。
 */

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const HOME_TSX = path.join(ROOT, "client/src/pages/Home.tsx");
const PUBLIC_DIR = path.join(ROOT, "client/public");

const source = await fs.readFile(HOME_TSX, "utf-8");
const required = [
  ...new Set(
    [...source.matchAll(/src=\{`\$\{import\.meta\.env\.BASE_URL\}([A-Za-z0-9_.-]+)`\}/g)].map((m) => m[1]),
  ),
];
if (required.length === 0) throw new Error("Home.tsx から画像の参照を抽出できませんでした");

const present = new Set(await fs.readdir(PUBLIC_DIR).catch(() => []));
const missing = required.filter((file) => !present.has(file));

console.log(`${required.length - missing.length}/${required.length} 件の画像が揃っています。`);
if (missing.length > 0) {
  console.log("\nclient/public/ に不足している画像:");
  for (const file of missing) console.log(`  - ${file}`);
  process.exitCode = 1;
}

// ベースパスを通さない絶対パスが残っていると、サブパス配信で 404 になる
const bare = [...source.matchAll(/src="(\/[A-Za-z0-9_.-]+\.(?:webp|svg|png|jpg))"/g)].map((m) => m[1]);
if (bare.length > 0) {
  console.log("\nベースパスを通さずに参照している画像があります（サブパス配信で404になります）:");
  for (const p of bare) console.log(`  - ${p}`);
  process.exitCode = 1;
}
