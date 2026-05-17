# DEV LOG

---

## 2026-05-10

### Problem
localhost:3000 が /contact にリダイレクトされ続けた。

### Cause
Next.js の .next キャッシュ問題の可能性。

### Solution
rm -rf .next
npm run dev

Chrome強制リロードで解決。

### Learning
Next.jsの謎挙動はキャッシュを疑う。

---

## 2026-05-10

### Problem
Prisma 7で datasource url エラー。

### Cause
Prisma 7で datasource url の仕様変更。

### Solution
Prisma 6へダウングレード。

### Learning
最新版が最適とは限らない。

---

## 2026-05-11

### Problem
/api/logs が500エラー。
React側では Unexpected end of JSON input。

### Cause
Docker PostgreSQL停止。

### Solution
docker ps で確認後、コンテナ起動。

### Learning
Reactエラーに見えても、
根本原因はDB停止のことがある。

開発再開時はまず docker ps。

---

## Development Style

- 小さく実装して確認
- AIを活用しながら高速開発
- 詰まったことは資産化する
- note/X投稿ネタとして蓄積する