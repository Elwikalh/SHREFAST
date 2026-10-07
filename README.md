# SHARE FAST — SHREFAST

منصة إدارة التوصيل: بوابة نشاط تجاري، شركات توصيل، مناديب ولوحة إدارة، مع حزم المونوريبو الأصلية المشتركة.

> قبل تشغيل بيانات حقيقية، راجع [التحديث التقني ونقاط الأمان المتبقية](docs/REVIEW.md). التسجيل والجلسات والعزل أُضيفت؛ توثيق الهاتف وترحيل السجلات القديمة واختبار Railway ما زالت شروط إطلاق منفصلة.

## المنصة الحالية

- `/` — Landing عربية جديدة؛ `/register` و`/login` للتسجيل والدخول؛ `/wasl` بوابة مرتبطة بالجلسة، و`/wasl/index.html` يحوّل للعنوان الجديد.
- `apps/web/components/wasl` — مصدر البوابات المستعاد والأيقونات من Lucide.
- `apps/web/lib` و`apps/web/app/api/wasl` — الاتصال، التحقق والتخزين وواجهات المنصة.
- `docs/REVIEW.md` — نطاق التغييرات وخطة العمل الأمنية التالية.

## البنية

هذا مونوريبو (pnpm workspaces + Turborepo):

- `apps/web` — موقع Next.js 16 (منصة SHARE FAST + الـAPI)
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
6. اضبط `NEXT_PUBLIC_SITE_URL` على أصل الموقع HTTPS الفعلي (بدون مسار) لحماية origin. مثاله: `https://sharefastweb-production.up.railway.app`.
7. صفحة `/api/health` تستخدمها Railway كـ healthcheck. اختبر التسجيل والدخول والخروج وملكية الطلبات على staging قبل الدمج والنشر.

### الحسابات القديمة والإدارة

- السجل التجاري السابق لا يملك كلمة مرور: ربطه بحساب جديد يتطلب إثبات ملكية إداريًا، ولا يتم تلقائيًا برقم الهاتف. تعامل مع `legacy_account_requires_verification` كإجراء مراجعة، وليس خطأ يُحل بإلغاء الحماية.
- لا يوجد تسجيل admin عام. منح صلاحيات إدارة أو توثيق هاتف يتم من مشغّل موثوق عبر قاعدة البيانات بعد تحقق مستقل وتسجيل العملية. لا ترفع مستخدمًا تلقائيًا إلى admin بسبب بريده أو رقمه.
- مزود SMS/OTP واسترجاع كلمة المرور غير متصلين. دعوتا العميل والشراكة اللتان تعتمدان على الهاتف تتطلبان توثيقه؛ لا تعتبر التسجيل إثبات ملكية.
- بيانات الإنتاج لا تدخل اختبارات PGlite أو Playwright؛ الاختبارات محلية مستقلة ومُحاكاة للواجهة كما هو موثق.

### GitHub Actions

الملف [docs/ci-workflow.yml](docs/ci-workflow.yml) جاهز للنقل إلى `.github/workflows/ci.yml` بعد حل رفض الكتابة من GitHub. لا يعمل كـworkflow من مساره الحالي. Docker يتضمن lint واختبارات الخادم حتى أثناء هذا العائق.

### ملاحظات إصلاح الديبلوي

- لو ظهر خطأ `Cannot find module '@swc/helpers'` وقت التشغيل: ده بسبب طريقة pnpm الافتراضية في تنظيم `node_modules` (nested `.pnpm` store) اللي بتتعارض مع تتبع ملفات Next.js standalone. الحل موجود في `.npmrc` (`node-linker=hoisted`).
- لو الـ healthcheck فشل بـ "service unavailable" مع إن الـ build نجح: تأكد إن `apps/web/Dockerfile` فيه `ENV HOSTNAME="0.0.0.0"` عشان السيرفر يستقبل طلبات من بره الكونتينر.

## ملاحظة عن المينيو

الطعمية مش مضافة في البذور الحالية (نسخة ١) بقرار من صاحب المشروع — هتتضاف لاحقًا لو ظهر طلب عليها.
