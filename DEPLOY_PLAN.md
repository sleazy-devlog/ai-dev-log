# Deployment Plan

AI-DEV-LOG を本番デプロイするための準備メモ。

このドキュメントは整理用であり、まだ実際のデプロイ作業は行わない。

## 現在の構成

- Next.js 16
- React
- TypeScript
- MUI
- Next.js Route Handlers
- Prisma 6
- PostgreSQL
- ローカルDBは Docker Compose の PostgreSQL

## 1. Next.js アプリ本体

本番デプロイ前に確認すること。

- `npm run lint` が通る
- `npm run build` が通る
- 不要な `console.log` / `debugger` が残っていない
- `.env` を GitHub に含めない
- `.DS_Store` や `tsconfig.tsbuildinfo` などの生成物を commit しない

現在の `package.json` では以下の script を利用する。

```bash
npm run dev
npm run lint
npm run build
npm run start
```

Vercel に置く場合は Next.js の標準構成に近いため、基本的に `npm run build` が通れば進めやすい。

Railway / Fly.io / Render などに置く場合は、環境によって `next.config.ts` の `output: "standalone"` や Dockerfile が必要になる可能性がある。

## 2. PostgreSQL 本番DB

ローカルの Docker PostgreSQL は本番では使わない。

本番用の PostgreSQL を別途用意し、`DATABASE_URL` を本番環境変数として設定する。

候補:

- Neon
- Supabase
- Railway PostgreSQL
- Render PostgreSQL
- Fly Postgres
- AWS RDS

このアプリは Prisma の `postgresql` provider を使っているため、基本的には PostgreSQL 接続URLがあれば接続可能。

本番DBで確認すること。

- DB作成
- 接続URL取得
- 接続元の制限やSSL要件
- connection pooling の要否
- backup / restore 方針
- 無料枠やスリープ有無
- リージョン

## 3. 環境変数

必須:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

注意:

- `.env` は GitHub に commit しない
- Vercel / Railway / Render / Fly.io などの管理画面に本番用 `DATABASE_URL` を設定する
- Preview 環境と Production 環境で DB を分けるか検討する
- DBパスワードに記号が含まれる場合は URL encode が必要になる場合がある

現時点ではブラウザ公開用の `NEXT_PUBLIC_*` 環境変数は不要。

## 4. Prisma migration

本番DBには `prisma migrate dev` ではなく、production 向けに migration を適用する。

基本方針:

```bash
npx prisma migrate deploy
```

事前に確認すること。

- `prisma/migrations` を GitHub に commit している
- 本番DBに向けた `DATABASE_URL` が設定されている
- migration 実行タイミングを決める
  - デプロイ前に手動実行
  - CI/CD の deploy step に組み込む
  - デプロイ先の pre-deploy command に設定
- migration 失敗時の rollback / restore 方針を決める

現在の migration:

- `20260510045755_init`
- `20260517054101_add_tags_to_log`

## 5. GitHub 連携

本番デプロイ前に GitHub repository を用意する。

確認すること。

- このプロジェクトディレクトリが Git repository として初期化されている
- `.gitignore` に以下が含まれている
  - `.env`
  - `node_modules`
  - `.next`
  - `.DS_Store`
  - `tsconfig.tsbuildinfo`
- commit 対象を整理する
- GitHub に push する
- デプロイ先と GitHub repository を連携する

注意:

現在の作業ディレクトリでは `.git` が見つからない状態だったため、実際に push する前に repository root を確認する。

## 6. デプロイ先候補

### Vercel + Neon / Supabase

Next.js アプリ本体は Vercel、PostgreSQL は Neon または Supabase に分ける構成。

向いている点:

- Next.js との相性がよい
- GitHub push から自動デプロイしやすい
- 小さく始めやすい

注意点:

- Prisma から serverless DB に接続する場合、connection pooling の要否を確認する
- migration は Vercel の build と分離するか、明示的な deploy step を設計する

### Railway

Next.js アプリと PostgreSQL を Railway 上でまとめて管理する構成。

向いている点:

- アプリとDBを1つのプロジェクトで扱いやすい
- PostgreSQL の `DATABASE_URL` を同一プロジェクト内で参照しやすい
- pre-deploy command に migration を組み込みやすい

注意点:

- Next.js の self-hosted 構成として `output: "standalone"` が必要になる場合がある
- 料金・スリープ・リソース制限を確認する

### Render

Next.js Web Service と Render PostgreSQL を使う構成。

向いている点:

- Web Service と managed PostgreSQL を同一サービス群で扱える
- 常時稼働型の構成にしやすい

注意点:

- build command / start command の設定確認が必要
- 無料枠やスリープ仕様を確認する

### Fly.io

Next.js をコンテナ/VM として動かし、PostgreSQL も近いリージョンで運用する構成。

向いている点:

- コンテナ寄りの運用に向いている
- リージョン配置を意識できる

注意点:

- `fly.toml` や Dockerfile など、追加設定が必要になる
- 初回デプロイの学習コストは Vercel より高め

## 7. 推奨する初回方針

最初の本番デプロイは以下が扱いやすい。

### 第一候補

- App: Vercel
- DB: Neon または Supabase
- Migration: 手動で `npx prisma migrate deploy`

理由:

- Next.js のデプロイが簡単
- DBをmanaged PostgreSQLにできる
- 小規模な個人開発として始めやすい

### 第二候補

- App: Railway
- DB: Railway PostgreSQL
- Migration: Railway の pre-deploy command または手動

理由:

- App と DB を同じプロジェクト内で管理しやすい
- `DATABASE_URL` の連携が分かりやすい

## 8. デプロイ前チェックリスト

- [ ] Git repository root を確認する
- [ ] `.gitignore` を整備する
- [ ] `.DS_Store` / `tsconfig.tsbuildinfo` を commit 対象から外す
- [ ] GitHub に push する
- [ ] 本番DBを作成する
- [ ] 本番 `DATABASE_URL` を取得する
- [ ] デプロイ先に `DATABASE_URL` を設定する
- [ ] `npx prisma migrate deploy` の実行方法を決める
- [ ] `npm run lint` を通す
- [ ] `npm run build` を通す
- [ ] 初回デプロイする
- [ ] `/api/logs` の疎通確認をする
- [ ] ログ作成・更新・削除・一覧表示を確認する

## 参考リンク

- Next.js Deploying: https://nextjs.org/docs/app/getting-started/deploying
- Next.js Environment Variables: https://nextjs.org/docs/pages/guides/environment-variables
- Vercel Next.js: https://vercel.com/docs/concepts/next.js/overview
- Vercel Environment Variables: https://vercel.com/docs/projects/environment-variables
- Prisma migrate deploy: https://docs.prisma.io/docs/cli/migrate
- Prisma development and production: https://www.prisma.io/docs/concepts/components/prisma-migrate/migrate-development-production
- Prisma with Neon: https://www.prisma.io/docs/orm/v6/overview/databases/neon
- Supabase connection strings: https://supabase.com/docs/reference/postgres/connection-strings
- Railway Next.js with Postgres: https://docs.railway.com/guides/nextjs
- Railway PostgreSQL: https://docs.railway.com/guides/postgresql
- Render PostgreSQL: https://render.com/docs/postgresql
- Fly.io Next.js: https://fly.io/docs/js/frameworks/nextjs/
