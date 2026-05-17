# AI-DEV-LOG

AIを活用した開発ログ記録アプリケーションです。

日々の開発内容、AIの活用方法、詰まったこと、学びを記録し、タグ・検索・並び替えで振り返りやすくすることを目的にしています。

## 技術スタック

- Next.js 16
- React
- TypeScript
- MUI (Material UI)
- Next.js Route Handlers
- Prisma
- PostgreSQL (Docker)

## 主な機能

- 開発ログの作成
- 開発ログの一覧表示
- 開発ログの編集・更新
- 開発ログの削除
- 削除確認ダイアログ
- 詳細表示ダイアログ
- タグ入力・タグ表示
- タグ絞り込み
- タイトル検索
- 並び替え
  - 新しい順
  - 古い順
  - タイトル昇順
- 表示件数制限と「もっと見る」
- ローディング表示
- 成功・エラー表示
- フォームバリデーション

## ローカル起動手順

依存関係をインストールします。

```bash
npm install
```

PostgreSQL を Docker で起動します。

```bash
docker compose up -d
```

Prisma Client を生成します。

```bash
npx prisma generate
```

必要に応じて Prisma の migration を適用します。

```bash
npx prisma migrate dev
```

開発サーバーを起動します。

```bash
npm run dev
```

ブラウザで以下を開きます。

```text
http://localhost:3000
```

## Docker PostgreSQL / Prisma 前提

このアプリは PostgreSQL を利用します。ローカル開発では `docker-compose.yml` の PostgreSQL コンテナを起動して利用します。

デフォルトの接続情報は以下です。

```text
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=ai_dev_log
PORT=5432
```

`.env` には `DATABASE_URL` が必要です。

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_dev_log"
```

開発再開時に API が 500 エラーになる場合は、まず PostgreSQL コンテナが起動しているか確認してください。

```bash
docker ps
```

## よく使うコマンド

```bash
npm run dev
npm run lint
npm run build
npx prisma generate
npx prisma migrate dev
npx prisma studio
```

## 開発メモ運用

このプロジェクトでは、実装の文脈や作業状況を Markdown に残しながら進めます。

- `PROJECT_CONTEXT.md`
  - プロジェクト概要、技術スタック、開発ルール、重要な履歴を管理します。
- `CURRENT_FOCUS.md`
  - 現在の作業対象や近い将来の実装予定を管理します。
- `DEV_LOG.md`
  - 詰まったこと、原因、解決策、学びを記録します。

作業前に `PROJECT_CONTEXT.md` と `CURRENT_FOCUS.md` を確認し、必要に応じて `DEV_LOG.md` に学びを残します。
