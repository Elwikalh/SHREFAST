import Link from "next/link";
import {
  Bike,
  Calculator,
  ChevronLeft,
  Clock,
  CreditCard,
  ExternalLink,
  MonitorSmartphone,
  SlidersHorizontal,
  Store,
  Type,
  Users,
  Wheat,
} from "lucide-react";
import { db, user, staff, branches } from "@el7bboB/db";
import { requireAdmin } from "@/lib/staff-session";
import { StaffAdminPanel } from "./staff-admin-panel";

export const dynamic = "force-dynamic";

export default async function StaffAdminPage() {
  await requireAdmin();
  const allStaff = await db.select().from(staff);
  const allUsers = await db.select().from(user);
  const allBranches = await db.select().from(branches);
  const staffUserIds = new Set(allStaff.map((row) => row.userId));
  const pendingUsers = allUsers.filter((oneUser) => !staffUserIds.has(oneUser.id));
  const usersById = new Map(allUsers.map((oneUser) => [oneUser.id, oneUser]));
  const staffRows = allStaff.map((row) => ({
    id: row.id,
    name: row.name,
    email: usersById.get(row.userId)?.email ?? "",
    role: row.role,
    branchId: row.branchId,
  }));
  const pendingRows = pendingUsers.map((oneUser) => ({
    userId: oneUser.id,
    name: oneUser.name,
    email: oneUser.email,
  }));

  const stats = [
    { label: "إجمالي الموظفين", value: staffRows.length, icon: Users },
    {
      label: "طلبات الصلاحية المعلقة",
      value: pendingRows.length,
      icon: Clock,
    },
    { label: "الفروع ونقاط البيع", value: allBranches.length, icon: Store },
  ];

  const operationCards = [
    {
      href: "/staff/owner/orders",
      title: "شاشة شغلي والكاشير",
      text: "الطلبات المباشرة، كاشير المالك باللمس، المطبخ وحالة التجهيز",
      icon: MonitorSmartphone,
      tone: "bg-[var(--amber)] text-[var(--ink)]",
    },
    {
      href: "/staff/owner",
      title: "حساباتي وتقفيل اليوم",
      text: "الخامات والمصروفات والتكلفة والجرد وتقفيل النقدية وInstaPay",
      icon: Calculator,
      tone: "bg-[var(--zaatar)] text-white",
    },
    {
      href: "/staff",
      title: "شاشات الفروع",
      text: "اختيار الفرع وفتح الكاشير أو المطبخ أو الدليفري الخاص به",
      icon: Store,
      tone: "bg-[var(--terracotta)] text-white",
    },
    {
      href: "/",
      title: "واجهة العميل",
      text: "افتح الموقع كما يراه العميل وراجع المنيو والطلب",
      icon: ExternalLink,
      tone: "bg-[var(--ink)] text-[var(--amber)]",
      external: true,
    },
  ];

  const setupCards = [
    {
      href: "/staff/admin/sandwich-bread",
      title: "البلدي والفينو وأسعارهما",
      text: "تحديد نوع أو نوعين وسعر الساندوتش الكامل لكل اختيار",
      icon: Wheat,
      tone: "bg-[var(--amber)] text-[var(--ink)]",
    },
    {
      href: "/staff/admin/delivery",
      title: "مناطق ورسوم التوصيل",
      text: "إدارة المناطق والأسعار وحالة التوصيل",
      icon: Bike,
      tone: "bg-[var(--amber)] text-[var(--ink)]",
    },
    {
      href: "/staff/admin/payments",
      title: "الدفع الإلكتروني وإنستاباي",
      text: "إضافة حساب التحويل وتفعيل الدفع الإلكتروني",
      icon: CreditCard,
      tone: "bg-[var(--zaatar)] text-white",
    },
    {
      href: "/staff/admin/mixes",
      title: "إعدادات الميكس",
      text: "التحكم في الأصناف المتاحة وسعر كل إضافة",
      icon: SlidersHorizontal,
      tone: "bg-[var(--terracotta)] text-white",
    },
    {
      href: "/staff/admin/content",
      title: "نصوص الموقع",
      text: "تعديل العناوين والأزرار والنصوص الظاهرة للعملاء",
      icon: Type,
      tone: "bg-[var(--ink)] text-[var(--amber)]",
    },
  ];

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="chip mb-2">اختصارات المالك</span>
            <h1 className="text-2xl font-black sm:text-3xl">تشغيل مطعمي</h1>
            <p className="mt-1 text-sm font-bold text-[var(--ink)]/50">
              الكاشير والطلبات والحسابات وكل الشاشات من مكان واحد.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {operationCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                target={card.external ? "_blank" : undefined}
                className="card card-lift group flex min-h-44 flex-col justify-between border-2 border-[var(--line)] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${card.tone}`}
                  >
                    <Icon className="h-7 w-7" />
                  </span>
                  {card.external ? (
                    <ExternalLink className="h-5 w-5 text-[var(--ink)]/30" />
                  ) : (
                    <ChevronLeft className="h-5 w-5 text-[var(--amber-deep)] transition group-hover:-translate-x-1" />
                  )}
                </div>
                <div className="mt-5">
                  <h2 className="text-lg font-black">{card.title}</h2>
                  <p className="mt-1 text-sm font-bold leading-6 text-[var(--ink)]/55">
                    {card.text}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <span className="chip mb-2">إعدادات مهمة</span>
          <h2 className="text-xl font-black sm:text-2xl">المنيو والبيع</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {setupCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="card flex items-center justify-between gap-4 border-2 border-[var(--line)] p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${card.tone}`}
                  >
                    <Icon className="h-7 w-7" />
                  </span>
                  <div>
                    <h3 className="text-lg font-black">{card.title}</h3>
                    <p className="text-sm font-bold leading-6 text-[var(--ink)]/55">
                      {card.text}
                    </p>
                  </div>
                </div>
                <ChevronLeft className="h-6 w-6 shrink-0 text-[var(--amber-deep)]" />
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const needsAttention = stat.icon === Clock && stat.value > 0;
          return (
            <div key={stat.label} className="card flex items-center gap-4 p-5">
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  needsAttention ? "bg-[var(--amber)]" : "bg-[var(--sesame)]"
                }`}
              >
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-bold text-[var(--ink)]/55">{stat.label}</p>
                <p className="num text-3xl font-black">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <StaffAdminPanel
        branches={allBranches.map((branch) => ({
          id: branch.id,
          name: branch.name,
        }))}
        staffRows={staffRows}
        pendingRows={pendingRows}
      />
    </div>
  );
}
