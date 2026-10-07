"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Eye, EyeOff, Save, Search, Sandwich, Wheat } from "lucide-react";
import { SANDWICH_BREADS, type SandwichBreadKind } from "@/app/sandwich-bread";

export type BreadEditProduct = {
  id: string;
  nameAr: string;
  available: boolean;
  enabled: boolean;
  variants: Array<{
    id: string;
    kind: SandwichBreadKind;
    priceEGP: string;
    available: boolean;
  }>;
};

const kinds = Object.keys(SANDWICH_BREADS) as SandwichBreadKind[];

export function SandwichBreadPanel({ products }: { products: BreadEditProduct[] }) {
  const [drafts, setDrafts] = useState(products);
  const [id, setId] = useState(products[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const current = drafts.find((product) => product.id === id);
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return drafts.filter(
      (product) =>
        product.id === id || product.nameAr.toLocaleLowerCase().includes(query),
    );
  }, [drafts, id, search]);

  function patch(update: Partial<BreadEditProduct>) {
    setError("");
    setMessage("");
    setDrafts((all) =>
      all.map((product) => (product.id === id ? { ...product, ...update } : product)),
    );
  }

  function variant(
    kind: SandwichBreadKind,
    update: Partial<BreadEditProduct["variants"][number]>,
  ) {
    if (!current) return;
    const old = current.variants.find((item) => item.kind === kind);
    patch({
      variants: old
        ? current.variants.map((item) =>
            item.kind === kind ? { ...item, ...update } : item,
          )
        : [
            ...current.variants,
            {
              id: crypto.randomUUID(),
              kind,
              priceEGP: "",
              available: false,
              ...update,
            },
          ],
    });
  }

  function setAvailability(mode: "both" | SandwichBreadKind) {
    if (!current) return;
    const variants = kinds.map((kind) => {
      const old = current.variants.find((item) => item.kind === kind);
      return old
        ? { ...old, available: mode === "both" || mode === kind }
        : {
            id: crypto.randomUUID(),
            kind,
            priceEGP: "",
            available: mode === "both" || mode === kind,
          };
    });
    patch({ variants });
  }

  async function save() {
    if (!current || pending) return;
    const variants = current.variants.filter(
      (item) => item.available || item.priceEGP.trim() !== "",
    );
    if (current.enabled && !variants.some((item) => item.available)) {
      setError("فعّل نوع عيش واحد على الأقل قبل الحفظ.");
      return;
    }
    if (
      variants.some(
        (item) =>
          !/^\d+(?:\.\d{1,2})?$/.test(item.priceEGP) ||
          Number(item.priceEGP) <= 0 ||
          Number(item.priceEGP) > 10000,
      )
    ) {
      setError("اكتب سعر الساندوتش الكامل لكل نوع محدد.");
      return;
    }
    setPending(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/staff/sandwich-bread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: current.id,
          enabled: current.enabled,
          variants,
        }),
      });
      const data: unknown = await response.json();
      if (
        !response.ok ||
        !data ||
        typeof data !== "object" ||
        !("ok" in data) ||
        data.ok !== true
      )
        throw new Error(
          data &&
            typeof data === "object" &&
            "error" in data &&
            typeof data.error === "string"
            ? data.error
            : "تعذر تأكيد الحفظ.",
        );
      setDrafts((all) =>
        all.map((product) =>
          product.id === current.id ? { ...product, variants } : product,
        ),
      );
      setMessage("تم الحفظ — الاختيارات الجديدة جاهزة للظهور للعميل.");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "تعذر تأكيد الحفظ؛ مسودتك ما زالت موجودة هنا.",
      );
    } finally {
      setPending(false);
    }
  }

  const activeChoices = current?.variants.filter(
    (item) =>
      item.available &&
      /^\d+(?:\.\d{1,2})?$/.test(item.priceEGP) &&
      Number(item.priceEGP) > 0,
  );

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-white shadow-[var(--shadow-lg)]">
      <header className="border-b border-[var(--line)] bg-[var(--surface-muted)] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="chip mb-2">إعدادات البيع</span>
            <h2 className="text-xl font-black sm:text-2xl">نوع العيش وسعر الساندوتش</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--ink)]/60">
              اختر الصنف، فعّل البلدي أو الفينو أو الاثنين، ثم اكتب السعر الكامل
              للساندوتش بكل نوع. لن نغيّر أسعار أي صنف تلقائيًا.
            </p>
          </div>
          <span className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-black">
            {drafts.filter((product) => product.enabled).length} صنف مُفعّل
          </span>
        </div>
      </header>

      <fieldset disabled={pending} className="space-y-5 p-4 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.35fr]">
          <label className="block font-black">
            ابحث عن الصنف
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute end-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink)]/35" />
              <input
                aria-label="بحث عن صنف"
                className="input pe-11"
                placeholder="مثال: فول الحبوب"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </label>
          <label className="block font-black">
            الصنف
            <select
              aria-label="الصنف"
              className="input mt-2"
              value={id}
              onChange={(event) => {
                setId(event.target.value);
                setError("");
                setMessage("");
              }}
            >
              <option value="" disabled>
                اختار الصنف
              </option>
              {filtered.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.nameAr}
                  {product.available ? "" : " — مخفي من المنيو"}
                </option>
              ))}
            </select>
          </label>
        </div>

        {current ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] p-4">
                <div>
                  <p className="font-black">{current.nameAr}</p>
                  <p className="mt-1 text-xs font-bold text-[var(--ink)]/50">
                    {current.available
                      ? "ظاهر حاليًا في المنيو"
                      : "الصنف نفسه مخفي حاليًا من المنيو"}
                  </p>
                </div>
                <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border border-[var(--line)] bg-white px-4 font-black">
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-[var(--amber-deep)]"
                    checked={current.enabled}
                    onChange={(event) => patch({ enabled: event.target.checked })}
                  />
                  تفعيل الاختيار حسب نوع العيش
                </label>
              </div>

              {current.enabled ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setAvailability("both")}
                      className="btn btn-outline min-h-11 px-4 text-sm"
                    >
                      إتاحة النوعين
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvailability("baladi")}
                      className="btn btn-outline min-h-11 px-4 text-sm"
                    >
                      بلدي فقط
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvailability("fino")}
                      className="btn btn-outline min-h-11 px-4 text-sm"
                    >
                      فينو فقط
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {kinds.map((kind) => {
                      const item = current.variants.find(
                        (candidate) => candidate.kind === kind,
                      );
                      const label = SANDWICH_BREADS[kind];
                      const Icon = kind === "baladi" ? Wheat : Sandwich;
                      return (
                        <motion.article
                          layout
                          key={kind}
                          className={`rounded-3xl border p-4 transition sm:p-5 ${
                            item?.available
                              ? "border-[var(--amber-deep)]/60 bg-[var(--amber)]/10 shadow-[var(--shadow-md)]"
                              : "border-[var(--line)] bg-[var(--surface-muted)]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--amber-deep)] shadow-[var(--shadow-sm)]">
                                <Icon className="h-5 w-5" />
                              </span>
                              <div>
                                <p className="font-black">{label.nameAr}</p>
                                <p dir="ltr" className="text-xs text-[var(--ink)]/45">
                                  {label.nameEn}
                                </p>
                              </div>
                            </div>
                            <label className="flex cursor-pointer items-center gap-2 text-sm font-black">
                              <input
                                type="checkbox"
                                className="h-5 w-5 accent-[var(--amber-deep)]"
                                checked={item?.available ?? false}
                                onChange={(event) =>
                                  variant(kind, {
                                    available: event.target.checked,
                                  })
                                }
                              />
                              {item?.available ? "متاح" : "غير متاح"}
                            </label>
                          </div>
                          <label className="mt-5 block text-sm font-black">
                            سعر الساندوتش كاملًا
                            <div className="relative mt-2">
                              <input
                                aria-label={`سعر ${label.nameAr}`}
                                inputMode="decimal"
                                type="number"
                                min="0.01"
                                max="10000"
                                step="0.01"
                                value={item?.priceEGP ?? ""}
                                onChange={(event) =>
                                  variant(kind, {
                                    priceEGP: event.target.value,
                                  })
                                }
                                className="input pe-16 text-lg font-black"
                                placeholder="0.00"
                              />
                              <span className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-xs font-black text-[var(--ink)]/45">
                                ج.م
                              </span>
                            </div>
                          </label>
                        </motion.article>
                      );
                    })}
                  </div>

                  <section className="rounded-3xl border border-[var(--line)] bg-[var(--ink)] p-4 text-white sm:p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <Eye className="h-5 w-5 text-[var(--amber)]" />
                      <h3 className="font-black">معاينة ما سيظهر للعميل</h3>
                    </div>
                    {activeChoices?.length ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {activeChoices.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"
                          >
                            <span className="font-black">
                              {SANDWICH_BREADS[item.kind].nameAr}
                            </span>
                            <span className="num font-black text-[var(--amber)]">
                              {item.priceEGP} ج.م
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="flex items-center gap-2 text-sm text-white/65">
                        <EyeOff className="h-4 w-4" /> فعّل نوعًا واكتب سعره لتظهر
                        المعاينة.
                      </p>
                    )}
                  </section>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--surface-muted)] p-5 text-sm leading-7 text-[var(--ink)]/60">
                  الصنف يستخدم سعره الأصلي حاليًا. فعّل الاختيار لتحديد البلدي والفينو
                  وأسعار كل نوع.
                </div>
              )}

              <button
                type="button"
                onClick={() => void save()}
                className="btn btn-dark min-h-14 w-full px-5 py-3 text-base"
              >
                {pending ? (
                  "جاري الحفظ…"
                ) : (
                  <>
                    <Save className="h-5 w-5" /> حفظ أنواع العيش والأسعار
                  </>
                )}
              </button>
            </motion.div>
          </AnimatePresence>
        ) : (
          <p className="rounded-2xl border border-dashed p-6 text-center">
            لا توجد أصناف مناسبة.
          </p>
        )}
      </fieldset>

      <AnimatePresence>
        {error ? (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="mx-4 mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 font-bold text-red-800 sm:mx-6 sm:mb-6"
          >
            {error}
          </motion.p>
        ) : null}
        {message ? (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            role="status"
            className="mx-4 mb-4 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 font-bold text-green-800 sm:mx-6 sm:mb-6"
          >
            <CheckCircle2 className="h-5 w-5" /> {message}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
