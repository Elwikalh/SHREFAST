# Super X — SHREFAST

منصة إدارة التوصيل: بوابة نشاط تجاري، شركات توصيل، مناديب ولوحة إدارة، مع حزم المونوريبو الأصلية المشتركة.

> قبل تشغيل بيانات حقيقية، راجع [التحديث التقني ونقاط الأمان المتبقية](docs/REVIEW.md). بعض مسارات المنصة القديمة ما زالت تحتاج مصادقة وصلاحيات وعزل بيانات؛ التحديث لا يعالجها بالكامل.

## المنصة الحالية

- `apps/web/app/wasl` — الواجهة داخل Next.js؛ `/` يعرض المنصة و`/wasl/index.html` يحوّل للعنوان الجديد.
- `apps/web/components/wasl` — مصدر البوابات المستعاد والأيقونات من Lucide.
- `apps/web/lib` و`apps/web/app/api/wasl` — الاتصال، التحقق والتخزين وواجهات المنصة.
- `docs/REVIEW.md` — نطاق التغييرات وخطة العمل الأمنية التالية.

## البنية

هذا مونوريبو (pnpm workspaces + Turborepo):

- `apps/web` — موقع Next.js 16 (منصة Super X + الـAPI)
- `packages/core` — منطق مشترك: التسعير، هامش الربح، ترقيم الأوردرات (بدون أي اعتماد على قاعدة بيانات)
- `packages/db` — سكيما Drizzle + PostgreSQL + بذور المينيو (seed)

## المتطلبات

- Node.js 22+ (راجع `.nvmrc`)
- pnpm 10 (الإصدار مثبت في packageManager) (`corepack enable`)
- PostgreSQL 17 (محلي أو Railway)

## التشغيل محليًا

```bash
cp .env.example .env
# عدل DATABASE_URL وباقي القيم، ثم حمّل البيئة في الطرفية للحزم كلها:
set -a; . ./.env; set +a
pnpm install --frozen-lockfile
pnpm --filter @el7bboB/db db:generate
pnpm --filter @el7bboB/db db:migrate
pnpm --filter @el7bboB/db db:seed
pnpm dev
```

الموقع هيشتغل على `http://localhost:3000`.

### اختبارات الجودة

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --filter @el7bboB/web exec playwright install chromium
pnpm --filter @el7bboB/web test:e2e
```

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
