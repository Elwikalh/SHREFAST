"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Bike,
  Boxes,
  Calculator,
  ChefHat,
  CreditCard,
  ExternalLink,
  LogOut,
  Megaphone,
  Menu,
  MonitorSmartphone,
  Palette,
  QrCode,
  ShoppingBag,
  SlidersHorizontal,
  Store,
  Type,
  Users,
  UtensilsCrossed,
  Wheat,
  X,
} from "lucide-react";
import { BeanMark } from "../../logo";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  external?: boolean;
};

const NAV_GROUPS: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "تشغيل مطعمي",
    items: [
      {
        href: "/staff/owner/orders",
        label: "شاشة شغلي والكاشير",
        icon: MonitorSmartphone,
      },
      {
        href: "/wasl/index.html#merchant?ref=SX-8",
        label: "شاشة تحكم المطعم — Super X",
        icon: Bike,
        external: true,
      },
      {
        href: "/staff/owner",
        label: "حساباتي وتقفيل اليوم",
        icon: Calculator,
        exact: true,
      },
      {
        href: "/staff",
        label: "كل شاشات الفروع",
        icon: Store,
        exact: true,
      },
      {
        href: "/",
        label: "فتح واجهة العميل",
        icon: ExternalLink,
        exact: true,
        external: true,
      },
    ],
  },
  {
    title: "المنيو والبيع",
    items: [
      {
        href: "/staff/admin/menu",
        label: "قائمة الطعام والأسعار",
        icon: UtensilsCrossed,
      },
      {
        href: "/staff/admin/sandwich-bread",
        label: "البلدي والفينو وأسعارهما",
        icon: Wheat,
      },
      {
        href: "/staff/admin/product-extras",
        label: "إضافات المنتجات",
        icon: SlidersHorizontal,
      },
      {
        href: "/staff/admin/mixes",
        label: "إعدادات الميكس",
        icon: SlidersHorizontal,
      },
      {
        href: "/staff/admin/breakfast",
        label: "إعدادات الطبلية والبوكس",
        icon: SlidersHorizontal,
      },
      {
        href: "/staff/admin/banners",
        label: "العروض والبنرات",
        icon: Megaphone,
      },
    ],
  },
  {
    title: "الإدارة",
    items: [
      {
        href: "/staff/admin",
        label: "الموظفون والصلاحيات",
        icon: Users,
        exact: true,
      },
      {
        href: "/staff/admin/branches",
        label: "الفروع ونقاط البيع",
        icon: Store,
      },
      {
        href: "/staff/admin/delivery",
        label: "التوصيل والمناطق",
        icon: Bike,
      },
      {
        href: "/staff/admin/payments",
        label: "الدفع الإلكتروني",
        icon: CreditCard,
      },
      {
        href: "/staff/admin/content",
        label: "نصوص الموقع",
        icon: Type,
      },
      {
        href: "/staff/admin/inventory",
        label: "المخزون والتوريد",
        icon: Boxes,
      },
      {
        href: "/staff/admin/recipes",
        label: "وصفات الأصناف",
        icon: ChefHat,
      },
      {
        href: "/staff/admin/branding",
        label: "هوية الموقع والخلفية",
        icon: Palette,
      },
      {
        href: "/staff/admin/qr",
        label: "الروابط وأكواد QR",
        icon: QrCode,
      },
    ],
  },
  {
    title: "روابط إضافية",
    items: [
      {
        href: "/order",
        label: "موقع الطلبات",
        icon: ShoppingBag,
        exact: true,
      },
    ],
  },
];

function isActive(pathname: string, item: NavItem) {
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(item.href + "/");
}

export function AdminShell({
  staffName,
  staffEmail,
  staffRole,
  children,
}: {
  staffName: string;
  staffEmail: string;
  staffRole: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const activeItem = NAV_GROUPS.flatMap((group) => group.items)
    .filter((item) => isActive(pathname, item))
    .sort((a, b) => b.href.length - a.href.length)[0];

  async function signOut() {
    await fetch("/api/auth/sign-out", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    window.location.href = "/staff/login";
  }

  return (
    <div className="min-h-screen lg:flex">
      {drawerOpen ? (
        <button
          type="button"
          aria-label="إغلاق القائمة"
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-black/55 lg:hidden"
        />
      ) : null}

      <aside
        className={`${drawerOpen ? "flex" : "hidden"} fixed inset-y-0 right-0 z-50 w-72 shrink-0 flex-col bg-[var(--ink)] lg:sticky lg:top-0 lg:flex lg:h-screen`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <Link href="/staff/admin" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
              <BeanMark tone="dark" className="h-8 w-8" />
            </span>
            <span>
              <span className="block text-lg font-black text-white">الحَبّوب</span>
              <span className="block text-[10px] font-bold text-[var(--amber)]">
                OWNER CONTROL CENTER
              </span>
            </span>
          </Link>
          <button
            type="button"
            aria-label="إغلاق القائمة"
            onClick={() => setDrawerOpen(false)}
            className="btn h-9 w-9 text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <p
                className={`px-3 pb-2 text-[11px] font-black ${
                  group.title === "تشغيل مطعمي"
                    ? "text-[var(--amber)]"
                    : "text-white/35"
                }`}
              >
                {group.title}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = activeItem?.href === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        onClick={() => setDrawerOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold ${
                          active
                            ? "bg-[var(--amber)] text-[var(--ink)]"
                            : group.title === "تشغيل مطعمي"
                              ? "bg-white/[0.06] text-white hover:bg-white/15"
                              : "text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Icon className="h-[18px] w-[18px]" />
                        <span className="flex-1">{item.label}</span>
                        {item.external ? (
                          <ExternalLink className="h-3.5 w-3.5 opacity-55" />
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 rounded-xl bg-white/[0.06] p-3">
            <p className="truncate text-sm font-bold text-white">{staffName}</p>
            <p className="truncate text-xs text-white/45">{staffEmail}</p>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="btn w-full border border-white/15 py-2.5 text-white"
          >
            <LogOut className="h-4 w-4" /> تسجيل الخروج
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--line)] px-4 py-3.5 lg:px-8">
          <button
            type="button"
            aria-label="فتح القائمة"
            onClick={() => setDrawerOpen(true)}
            className="btn h-10 w-10 border lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-lg font-black">
              {activeItem?.label ?? "لوحة التحكم"}
            </p>
            <p className="text-xs font-bold text-[var(--ink)]/45">{staffRole}</p>
          </div>
          <Link
            href="/staff/owner/orders"
            className="btn btn-primary ms-auto min-h-10 shrink-0 rounded-xl px-3 text-xs sm:px-4 sm:text-sm"
          >
            <MonitorSmartphone className="h-4 w-4" />
            <span className="hidden sm:inline">شاشة شغلي والكاشير</span>
            <span className="sm:hidden">شغلي</span>
          </Link>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
