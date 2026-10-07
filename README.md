# الحَبّوب — El7bboB Platform

منصة طلبات وإدارة كاملة لمطعم الحَبّوب وعرباته الخارجية: موقع طلب، شاشة أرقام، شاشة مطبخ (KDS)، كاشير، وداشبورد أدمن — كل حاجة TypeScript من غير أي حاجة قديمة.

## البنية

هذا مونوريبو (pnpm workspaces + Turborepo):

- `apps/web` — موقع Next.js 16 (الموقع + الـAPI + الداشبورد لاحقًا)
- `packages/core` — منطق مشترك: التسعير، هامش الربح، ترقيم الأوردرات (بدون أي اعتماد على قاعدة بيانات)
- `packages/db` — سكيما Drizzle + PostgreSQL + بذور المينيو (seed)

## المتطلبات

- Node.js 22+ (راجع `.nvmrc`)
- pnpm 9+ (`corepack enable`)
- PostgreSQL 17 (محلي أو Railway)

## التشغيل محليًا

```bash
cp .env.example .env
pnpm install
pnpm --filter @el7bboB/db db:generate
pnpm --filter @el7bboB/db db:migrate
pnpm --filter @el7bboB/db db:seed
pnpm dev
```

الموقع هيشتغل على `http://localhost:3000`.

ملحوظة: أول ما تشغّل `pnpm install` هيتولد `pnpm-lock.yaml` — لازم يتعمله كوميت عشان الـCI والديبلوي يبقوا أسرع وثابتين (frozen lockfile).

## الديبلوي على Railway (Staging)

1. اعمل مشروع جديد على Railway واربطه بريبو GitHub ده.
2. Railway هيقرأ `railway.json` تلقائيًا وهيبني بالـ Dockerfile الموجود في `apps/web/Dockerfile` (الـ build context هو جذر الريبو دايمًا في Railway، حتى لو الـDockerfile جوه مجلد فرعي).
3. ضيف خدمة PostgreSQL من Railway وانسخ الـ `DATABASE_URL` بتاعتها في متغيرات البيئة.
4. ضيف باقي المتغيرات من `.env.example`.
5. بعد أول ديبلوي، شغّل المايجريشن والبذور من تبويب الـ Shell بتاع Railway:
   ```bash
   pnpm --filter @el7bboB/db db:migrate
   pnpm --filter @el7bboB/db db:seed
   ```
6. الصفحة `/api/health` بتستخدمها Railway كـ healthcheck.

### ملاحظات إصلاح الديبلوي

- لو ظهر خطأ `Cannot find module '@swc/helpers'` وقت التشغيل: ده بسبب طريقة pnpm الافتراضية في تنظيم `node_modules` (nested `.pnpm` store) اللي بتتعارض مع تتبع ملفات Next.js standalone. الحل موجود في `.npmrc` (`node-linker=hoisted`).
- لو الـ healthcheck فشل بـ "service unavailable" مع إن الـ build نجح: تأكد إن `apps/web/Dockerfile` فيه `ENV HOSTNAME="0.0.0.0"` عشان السيرفر يستقبل طلبات من بره الكونتينر.

## ملاحظة عن المينيو

الطعمية مش مضافة في البذور الحالية (نسخة ١) بقرار من صاحب المشروع — هتتضاف لاحقًا لو ظهر طلب عليها.
