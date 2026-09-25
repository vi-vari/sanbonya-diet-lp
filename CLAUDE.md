# 三本松ダイエットLP（sanbonya-diet-lp）開発ルール

東広島西条整骨院・福山整骨院のダイエットLP。GitHub Pages（`https://vi-vari.github.io/sanbonya-diet-lp/`）で公開。
利用者はスマホ、特に LINE / Instagram のアプリ内ブラウザから開くことが多い。

## 絶対に守ること

1. **依頼された範囲だけを変える。** 「URLを変えて」と言われたら URL だけを変える。
   ボタンの動作・見た目・構成など、依頼されていないものを勝手に変えない。
2. **依頼なしにコードを削除しない。** 不要に見えるタグ・コメント・スクリプト・設定でも、
   勝手に消さない。削除が必要だと思ったら、理由を説明して依頼者の指示を待つ。
   GTM（Google タグマネージャー）など計測用のコードは特に触らない。
3. **CTA（LINE・ホットペッパー）は通常のリンク `<a href target="_blank" rel="noopener noreferrer">` にする。**
   iframe モーダル、`window.open`、`<button>` + JavaScript での遷移は禁止。
   スマホやアプリ内ブラウザでブロックされ、リンク先に飛べなくなる（過去に実際に発生した不具合）。
4. **画像は `client/public/` に置き、`${import.meta.env.BASE_URL}ファイル名` で参照する。**
   `/ファイル名` の絶対パスはサブパス配信で 404 になる（過去に実際に発生した不具合）。
5. **公開前に必ず `pnpm verify` を通す。** 型チェック・画像チェック・ビルド・スマホ相当ブラウザでの
   スモークテスト（画像表示・リンク先URL・404・JSエラー）をまとめて実行する。失敗したまま push しない。
6. **公開の流れ:** 作業ブランチ → プルリクエスト（`Verify LP` が緑になることを確認）→ `main` にマージ
   → `Deploy to GitHub Pages` が自動実行。検証に失敗した場合は公開されない。

## URLの場所

- LINE / ホットペッパーの URL は `client/src/pages/Home.tsx` 先頭の `LINKS` にまとめてある。ここ以外に URL を書かない。
- スモークテストは `LINKS` の内容と公開ページのリンクが一致することを確認し、
  結果を GitHub Actions のサマリー画面に一覧表示する（コードを読まなくても URL を確認できる）。

## コマンド

```
pnpm install           # 依存関係のインストール
pnpm dev               # 開発サーバー
pnpm verify            # 公開前検証（check + check:images + build:pages + test:smoke）
pnpm test:smoke        # スモークテストのみ（事前に pnpm build:pages が必要）
```

ローカルでスモークテストを動かすには Chromium が必要: `pnpm exec playwright install chromium`
（既存の Chromium を使う場合は `PLAYWRIGHT_CHROMIUM_PATH=/path/to/chromium` を指定）
