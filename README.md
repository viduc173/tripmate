# TripMate

Lên lịch du lịch Việt Nam: điểm đến, ngày đi, ngân sách, số người → lịch trình từng ngày.

## Chạy trên máy (Windows, PowerShell)

```powershell
corepack enable          # một lần, để có pnpm đúng phiên bản
pnpm install
pnpm dev                 # http://localhost:3000
pnpm lint; pnpm typecheck; pnpm test
```

Cần Node 22 trở lên.

## Cơ sở dữ liệu (Supabase)

- Bảng và phân quyền: `supabase/migrations/0001_init.sql`.
- Test phân quyền (pgTAP): `supabase test db` khi dùng Supabase CLI, hoặc chạy trên Postgres thường:
  `psql -f supabase/tests/local-shim.sql`, rồi migration, rồi `psql -f supabase/tests/rls.test.sql`.
- Nạp dữ liệu: đặt `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY` trong môi trường (không commit), chạy `pnpm seed`.
