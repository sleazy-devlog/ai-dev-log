# AI-DEV-LOG

## Overview

AIを活用した開発ログ記録サービス。

日々の開発内容、
AI活用方法、
詰まったポイント、
学びを記録する。

将来的には：
- 開発履歴管理
- タグ検索
- Markdown対応
- 認証機能
- AI分析
- note/X投稿補助
を追加予定。

---

# Tech Stack

## Frontend
- Next.js 16
- React
- TypeScript
- MUI (Material UI)

## Backend
- Next.js Route Handlers

## Database
- PostgreSQL (Docker)

## ORM
- Prisma

---

# Architecture

- App Router 使用
- API Route 使用
- Prisma経由でDBアクセス
- フロントとAPIは同一Next.js内で管理
- 単体構成

---

# Development Rules

- TypeScript strict前提
- App Router only
- MUIベースでUI統一
- Prismaを通してDB操作
- any型は極力使わない
- API Routeベースで実装
- 可読性を優先
- 小さく実装して確認しながら進める

---

# Current Features

- ログ保存
- ログ一覧取得
- ログ削除
- フォーム入力
- MUI UI

---

# Important Dev History

## Next.js cache issue

localhost:3000 が /contact にリダイレクトされ続けた。

解決方法：
- rm -rf .next
- npm run dev
- Chrome強制リロード

---

## Prisma issue

Prisma 7で datasource url エラー発生。

Prisma 6へダウングレードして安定化。

---

## Docker PostgreSQL issue

/api/logs が500エラー。

原因：
Docker PostgreSQL停止。

学び：
開発再開時はまず docker ps を確認する。