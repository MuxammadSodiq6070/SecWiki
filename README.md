# Hoogle

Hoogle ikki alohida servisdan iborat:

- Next.js frontend: `npm run dev` / `npm run build` / `npm start`
- Express + Prisma backend: `npm run dev:api` / `npm run start:api`

## Local setup

1. `.env.example` faylidan `.env` yarating.
2. `npm install` ishlating.
3. `npx prisma generate` va `npx prisma db push` ishlating.
4. Backendni `npm run dev:api` bilan 4000-portda ishga tushiring.
5. Frontendni `npm run dev` bilan 3000-portda ishga tushiring.

Frontend `NEXT_PUBLIC_API_URL` orqali backend URL'ni oladi. Backend CORS uchun `FRONTEND_URL` qiymatidan foydalanadi.

## Deploy

Backend servisida:

```bash
npm install
npx prisma generate
npx prisma db push
npm run start:api
```

Backend env:

```env
DATABASE_URL=file:./prisma/dev.db
PORT=4000
FRONTEND_URL=https://your-frontend-domain.com
```

Frontend servisida:

```bash
npm install
npm run build
npm start
```

Frontend env:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

Production uchun SQLite o‘rniga persistent volume yoki PostgreSQL ishlatish tavsiya qilinadi. `GET /health` endpoint backend holatini tekshirish uchun mavjud.

## Supabase bilan ulash

Backend Prisma orqali Supabase Postgres'ga ulanadi. Frontend Supabase Data API'ga to‘g‘ridan-to‘g‘ri ulanmaydi, shuning uchun Supabase `service_role` key yoki secret key'ni frontendga qo‘ymang.

### 1. Supabase project yarating

1. [Supabase Dashboard](https://supabase.com/dashboard) orqali yangi project yarating.
2. Project ichidan **Connect** oynasini oching.
3. Prisma uchun alohida database user yaratish tavsiya qilinadi. SQL Editor'da quyidagini ishga tushiring va kuchli parol qo‘ying:

```sql
create user prisma with password 'CHANGE_THIS_PASSWORD' bypassrls createdb;
grant prisma to postgres;
grant usage, create on schema public to prisma;
grant all on all tables in schema public to prisma;
grant all on all sequences in schema public to prisma;
grant all on all routines in schema public to prisma;
alter default privileges for role postgres in schema public grant all on tables to prisma;
alter default privileges for role postgres in schema public grant all on sequences to prisma;
alter default privileges for role postgres in schema public grant all on routines to prisma;
```

### 2. Connection string'larni oling

Backend serveri uchun **Supavisor Session mode** connection string'ni `DATABASE_URL`ga qo‘ying. Migration uchun porti `5432` bo‘lgan direct yoki session connection string'ni `DIRECT_URL`ga qo‘ying.

```env
DATABASE_URL="postgresql://prisma.<PROJECT_REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://prisma.<PROJECT_REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:5432/postgres"
```

Serverless yoki ko‘p parallel instance ishlatiladigan deployda `DATABASE_URL` uchun port `6543` transaction-mode pooler ishlating va oxiriga `?pgbouncer=true` qo‘shing. `DIRECT_URL` esa migration uchun port `5432` bo‘lib qoladi:

```env
DATABASE_URL="postgresql://prisma.<PROJECT_REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://prisma.<PROJECT_REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:5432/postgres"
```

`<PROJECT_REF>`, `<REGION>` va `<PASSWORD>` qiymatlarini Supabase **Connect** oynasidagi haqiqiy qiymatlar bilan almashtiring. Parolda `@`, `#`, `%` kabi belgilar bo‘lsa URL-encode qiling.

### 3. Jadval va Prisma clientni yaratish

Project root papkasida:

```bash
npm install
npx prisma generate
npx prisma db push
```

`db push` `Command`, `CommandComment` va `CommandPower` jadvallarini Supabase Postgres'da yaratadi.

Keyingi schema o‘zgarishlari uchun migration yaratib, production’da `npx prisma migrate deploy` ishlatish ma’qul. Birinchi marta mavjud loyiha uchun `db push` ishlatish mumkin.

### 4. Backend deploy env'lari

Backend hosting servisida quyidagi env'larni kiriting:

```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
PORT=4000
FRONTEND_URL=https://your-frontend-domain.com
```

Build/start commandlar:

```bash
npx prisma generate
npx prisma db push
npm run start:api
```

Backend deploy bo‘lgach `https://your-backend-domain.com/health` manzilini ochib `{ "ok": true }` javobini tekshiring.

### 5. Frontend env'i

Frontend hosting servisida faqat public backend URL'ni kiriting:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

Frontend build/start:

```bash
npm run build
npm start
```

### Xavfsizlik eslatmasi

Bu loyiha Supabase Data API emas, alohida Express backend orqali Prisma'dan foydalanadi. Data API ishlatilmasa, Supabase API Settings'da uni o‘chirish mumkin. Agar keyinchalik public schema Data API orqali expose qilinsa, barcha jadvallarda RLS'ni yoqing va aniq policies yozing; `service_role` yoki database parolini browser env'lariga qo‘ymang.
