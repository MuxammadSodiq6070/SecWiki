# Hoogle

Hoogle bitta Next.js servisidan iborat. Frontend va backend API bir xil Next.js App Router loyihasida ishlaydi:

- UI: `app/` va `components/`
- API Route Handlers: `app/api/**/route.ts`
- Database: Prisma + Supabase Postgres

## Local setup

1. `.env.example` faylidan `.env` yarating.
2. `npm install` ishlating.
3. `npx prisma generate` va `npx prisma db push` ishlating.
4. `npm run dev` bilan Next.js serverini 3000-portda ishga tushiring.

Frontend so‘rovlari same-origin nisbiy yo‘llardan foydalanadi: `/api/commands`, `/api/commands/:id/comments` va `/api/commands/:id/power`.

## Deploy

```bash
npm install
npx prisma generate
npx prisma db push
npm run build
npm start
```

Vercel project env'lariga `DATABASE_URL` va `DIRECT_URL` qiymatlarini qo‘ying. `npm start` Vercel’da alohida ishlatilmaydi, Vercel `npm run build` natijasida Next.js API Route Handler’larni serverless function sifatida ishga tushiradi.

## Supabase bilan ulash

Next.js API Route Handler’lari Prisma orqali Supabase Postgres'ga ulanadi. Frontend Supabase Data API'ga to‘g‘ridan-to‘g‘ri ulanmaydi, shuning uchun Supabase `service_role` key yoki secret key'ni frontendga qo‘ymang.

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

Sizning Supabase project connection ma'lumotlaringiz:

```text
host: db.gayrvnnxvulfbwhjfdum.supabase.co
port: 5432
database: postgres
user: postgres
```

`.env` faylida quyidagidan foydalaning:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.gayrvnnxvulfbwhjfdum.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.gayrvnnxvulfbwhjfdum.supabase.co:5432/postgres"
```

`[YOUR-PASSWORD]` o‘rniga Supabase project parolingizni yozing. Parolda `@`, `#`, `%`, `/` yoki boshqa maxsus belgilar bo‘lsa, ularni percent-encode qiling. Masalan, `@` belgisi `%40` bo‘ladi.

Vercel serverless Route Handler’lari uchun **Supavisor Transaction mode** connection string'ni `DATABASE_URL`ga qo‘ying. Prisma migration uchun porti `5432` bo‘lgan direct yoki session connection string'ni `DIRECT_URL`ga qo‘ying.

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

### 4. Vercel deploy env'lari

Vercel project settings'dagi **Environment Variables** bo‘limiga quyidagilarni kiriting:

```env
DATABASE_URL=postgresql://...:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://...:5432/postgres
```

Vercel build command:

```bash
npx prisma generate
npx prisma db push
npm run build
```

Deploydan keyin API health endpointini `https://your-domain.vercel.app/api/health` orqali tekshiring. U `{ "ok": true, "service": "hoogle-api" }` qaytaradi.

### Xavfsizlik eslatmasi

Bu loyiha Supabase Data API emas, Next.js API Route Handler’lari orqali Prisma'dan foydalanadi. Data API ishlatilmasa, Supabase API Settings'da uni o‘chirish mumkin. Agar keyinchalik public schema Data API orqali expose qilinsa, barcha jadvallarda RLS'ni yoqing va aniq policies yozing; `service_role` yoki database parolini browser env'lariga qo‘ymang.

## Optional Agent Skills

Supabase bilan ishlashda AI coding tool'lar uchun tayyor ko‘rsatmalar va resurslarni o‘rnatish mumkin:

```bash
npx skills add supabase/agent-skills
```

Bu qadam majburiy emas. O‘rnatgandan keyin agent konfiguratsiyasini qayta yuklang yoki VS Code'ni restart qiling.
