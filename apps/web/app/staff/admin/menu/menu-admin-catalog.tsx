"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  GripVertical,
  ListOrdered,
  Loader2,
  Plus,
  Save,
  Search,
  X,
} from "lucide-react";
import { compareAdminMenuItems } from "./menu-product-code";
import { MenuItemRow, type MenuItem } from "./menu-admin-panel";
import {
  ADMIN_MENU_GROUPS,
  adminMenuGroup,
  matchesMenuSearch,
  type AdminMenuGroup,
} from "./menu-admin-groups";
import { reorderMenuItems } from "./menu-client";
import {
  storefrontSectionFor,
  type StorefrontSection,
} from "@/app/storefront-menu-sections";

const STOREFRONT_SECTIONS: Array<{
  value: StorefrontSection;
  label: string;
}> = [
  { value: "base_item", label: "الساندويتشات" },
  { value: "mix", label: "روقان الحبوب والميكسات" },
  { value: "packs", label: "العلب والباكيتات" },
  { value: "platter", label: "طبلية الفطار والأطباق" },
  { value: "breakfast_box", label: "بوكسات الفطار" },
  { value: "addon", label: "الإضافات والمقبلات" },
  { value: "beverage", label: "المشروبات" },
];

function sorted(items: MenuItem[]) {
  return [...items].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.nameAr.localeCompare(b.nameAr, "ar"),
  );
}

export function MenuAdminCatalog({
  items,
  onAddToGroup,
}: {
  items: MenuItem[];
  onAddToGroup: (group: AdminMenuGroup) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AdminMenuGroup | "all">("all");
  const [ordering, setOrdering] = useState(false);
  const [orderedItems, setOrderedItems] = useState(() => sorted(items));
  const [savingSection, setSavingSection] = useState<StorefrontSection | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => setOrderedItems(sorted(items)), [items]);

  const grouped = ADMIN_MENU_GROUPS.map((group) => {
    const members = items
      .filter((item) => adminMenuGroup(item) === group.value)
      .sort(compareAdminMenuItems);
    return {
      ...group,
      items: members,
      matches: members.filter((item) => matchesMenuSearch(item, query)).length,
    };
  });
  const resultCount = grouped
    .filter((group) => selected === "all" || selected === group.value)
    .reduce((sum, group) => sum + group.matches, 0);

  const storefrontGroups = useMemo(
    () =>
      STOREFRONT_SECTIONS.map((section) => ({
        ...section,
        items: orderedItems.filter(
          (item) => storefrontSectionFor(item) === section.value,
        ),
      })).filter((section) => section.items.length > 0),
    [orderedItems],
  );

  function move(section: StorefrontSection, id: string, step: -1 | 1) {
    setMessage("");
    setError("");
    setOrderedItems((current) => {
      const members = current.filter((item) => storefrontSectionFor(item) === section);
      const from = members.findIndex((item) => item.id === id);
      const to = from + step;
      if (from < 0 || to < 0 || to >= members.length) return current;
      const nextMembers = [...members];
      const [moved] = nextMembers.splice(from, 1);
      if (!moved) return current;
      nextMembers.splice(to, 0, moved);
      let sectionIndex = 0;
      return current.map((item) =>
        storefrontSectionFor(item) === section
          ? (nextMembers[sectionIndex++] ?? item)
          : item,
      );
    });
  }

  // Jump an item straight to a typed position (1-based from the admin's view).
  function moveTo(section: StorefrontSection, id: string, target: number) {
    setMessage("");
    setError("");
    setOrderedItems((current) => {
      const members = current.filter(
        (item) => storefrontSectionFor(item) === section,
      );
      const from = members.findIndex((item) => item.id === id);
      const to = Math.max(0, Math.min(members.length - 1, target));
      if (from < 0 || from === to) return current;
      const nextMembers = [...members];
      const [moved] = nextMembers.splice(from, 1);
      if (!moved) return current;
      nextMembers.splice(to, 0, moved);
      let sectionIndex = 0;
      return current.map((item) =>
        storefrontSectionFor(item) === section
          ? (nextMembers[sectionIndex++] ?? item)
          : item,
      );
    });
  }

  function saveOrder(section: StorefrontSection) {
    const ids = orderedItems
      .filter((item) => storefrontSectionFor(item) === section)
      .map((item) => item.id);
    if (!ids.length) return;
    setSavingSection(section);
    setMessage("");
    setError("");
    startTransition(async () => {
      try {
        await reorderMenuItems(section, ids);
        setMessage("تم حفظ الترتيب — ده نفس ترتيب الظهور للعميل.");
        router.refresh();
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "تعذر حفظ الترتيب. حدّث الصفحة وحاول مرة ثانية.",
        );
      } finally {
        setSavingSection(null);
      }
    });
  }

  if (ordering) {
    return (
      <div className="flex min-w-0 flex-col gap-5" dir="rtl">
        <header className="rounded-3xl border border-[var(--amber-deep)]/30 bg-[var(--amber)]/10 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="chip mb-2">ترتيب واجهة العميل</span>
              <h2 className="text-xl font-black">رتّب المنتجات زي ما تحب</h2>
              <p className="mt-1 text-sm font-bold leading-6 text-[var(--ink)]/55">
                اكتب رقم المكان الجديد في خانة الترتيب (أو استخدم الأسهم)، ثم احفظ
                القسم. الأصناف المخفية تظل محفوظة في مكانها عندما تُظهرها لاحقًا.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOrdering(false)}
              className="btn btn-outline min-h-11 px-4 text-sm"
            >
              <X className="h-4 w-4" /> إنهاء الترتيب
            </button>
          </div>
        </header>

        {message ? (
          <p
            role="status"
            className="flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 font-bold text-green-800"
          >
            <CheckCircle2 className="h-5 w-5" /> {message}
          </p>
        ) : null}
        {error ? (
          <p
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-4 font-bold text-red-800"
          >
            {error}
          </p>
        ) : null}

        {storefrontGroups.map((section) => (
          <section
            key={section.value}
            className="overflow-hidden rounded-3xl border border-[var(--line)] bg-white shadow-[var(--shadow-sm)]"
          >
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--surface-muted)] p-4">
              <div>
                <h3 className="text-lg font-black">{section.label}</h3>
                <p className="text-xs font-bold text-[var(--ink)]/45">
                  {section.items.length} صنف • من أعلى لأسفل
                </p>
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={() => saveOrder(section.value)}
                className="btn btn-dark min-h-11 px-4 text-sm"
              >
                {savingSection === section.value ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                حفظ ترتيب القسم
              </button>
            </header>
            <ol className="divide-y divide-[var(--line)]">
              {section.items.map((item, index) => (
                <li key={item.id} className="flex items-center gap-3 p-3 sm:p-4">
                  <GripVertical className="h-5 w-5 shrink-0 text-[var(--ink)]/25" />
                  <input
                    key={`${item.id}-${index}`}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={section.items.length}
                    defaultValue={index + 1}
                    disabled={isPending}
                    aria-label={`مكان ${item.nameAr} في الترتيب`}
                    title="اكتب رقم المكان الجديد واضغط Enter"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") event.currentTarget.blur();
                    }}
                    onBlur={(event) => {
                      const target = Number(event.target.value);
                      if (Number.isInteger(target) && target !== index + 1) {
                        moveTo(section.value, item.id, target - 1);
                      }
                    }}
                    className="num h-11 w-16 shrink-0 rounded-xl border border-[var(--line)] bg-[var(--sesame)] text-center font-black outline-none focus:border-[var(--amber)]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-black">{item.nameAr}</p>
                    <p className="text-xs font-bold text-[var(--ink)]/45">
                      {item.priceEGP} ج.م • {item.isAvailable ? "ظاهر" : "مخفي"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      disabled={index === 0 || isPending}
                      onClick={() => move(section.value, item.id, -1)}
                      className="btn h-11 w-11 border border-[var(--line)] bg-white"
                      aria-label={`تحريك ${item.nameAr} لأعلى`}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === section.items.length - 1 || isPending}
                      onClick={() => move(section.value, item.id, 1)}
                      className="btn h-11 w-11 border border-[var(--line)] bg-white"
                      aria-label={`تحريك ${item.nameAr} لأسفل`}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-5" dir="rtl">
      <div className="rounded-2xl border border-[var(--ink)]/10 bg-white p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-black">إدارة المنتجات</h2>
            <p className="text-xs font-bold text-[var(--ink)]/45">
              ابحث أو عدّل أو غيّر ترتيب الظهور للعملاء.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOrdering(true)}
            className="btn btn-dark min-h-11 px-4 text-sm"
          >
            <ListOrdered className="h-4 w-4" /> ترتيب ظهور المنتجات
          </button>
        </div>
        <label htmlFor="admin-menu-search" className="mb-2 block text-sm font-bold">
          دور على الصنف بسرعة
        </label>
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink)]/35" />
            <input
              id="admin-menu-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="اسم الصنف أو الكود — فول، بطاطس، تونة..."
              className="min-h-11 w-full rounded-xl border border-[var(--ink)]/15 px-3 pe-10 text-sm outline-none focus:border-[var(--amber)]"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelected("all");
            }}
            className="rounded-xl border border-[var(--ink)]/15 px-3 py-2 text-xs font-bold"
          >
            عرض الكل
          </button>
        </div>
        <nav aria-label="أقسام أصناف لوحة التحكم" className="mt-3 flex flex-wrap gap-2">
          {grouped.map((group) => (
            <button
              key={group.value}
              type="button"
              aria-pressed={selected === group.value}
              onClick={() =>
                setSelected(selected === group.value ? "all" : group.value)
              }
              className={`rounded-full border px-3 py-2 text-xs font-bold ${
                selected === group.value
                  ? "border-[var(--amber)] bg-[var(--amber)] text-[var(--ink)]"
                  : "border-[var(--ink)]/15 bg-white text-[var(--ink)]/70"
              }`}
            >
              {group.label} ({group.items.length})
            </button>
          ))}
        </nav>
        <p role="status" className="mt-3 text-xs text-[var(--ink)]/55">
          {resultCount} صنف
        </p>
      </div>

      {resultCount === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--ink)]/15 p-5 text-center text-sm text-[var(--ink)]/55">
          مفيش أصناف مطابقة — امسح البحث أو اختار قسم تاني
        </p>
      ) : null}
      {grouped.map((group) => (
        <section
          key={group.value}
          aria-label={group.label}
          style={{
            display:
              (selected === "all" && group.matches > 0) ||
              selected === group.value
                ? undefined
                : "none",
          }}
        >
          <h2 className="mb-3 text-lg font-bold text-[var(--amber-deep)]">
            {group.label} ({group.matches})
          </h2>
          {group.matches === 0 ? (
            <p className="mb-3 rounded-2xl border border-dashed border-[var(--ink)]/15 p-4 text-center text-sm text-[var(--ink)]/55">
              مفيش أصناف هنا لسه — ضيف أول منتج من الزر تحت
            </p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            {group.items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: matchesMenuSearch(item, query) ? "contents" : "none",
                }}
              >
                <MenuItemRow item={item} />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onAddToGroup(group.value)}
            className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--amber-deep)]/40 bg-[var(--amber)]/5 px-4 py-3 text-sm font-bold text-[var(--amber-deep)] transition hover:bg-[var(--amber)]/15 active:scale-[0.99]"
          >
            <Plus className="h-4 w-4" /> إضافة منتج في {group.label}
          </button>
        </section>
      ))}
    </div>
  );
}
