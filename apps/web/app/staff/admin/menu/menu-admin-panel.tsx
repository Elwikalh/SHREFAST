"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MenuAdminCatalog } from "./menu-admin-catalog";
import { hasArabic, menuNameToEnglish } from "./menu-name-english";
import { menuCodePrefix } from "./menu-product-code";
import {
  inferNewProductCategory,
  newProductPlacementLabel,
} from "./menu-product-placement";
import {
  ADMIN_MENU_GROUPS,
  type AdminMenuGroup,
} from "./menu-admin-groups";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  X,
  Upload,
  Link2,
  ImageOff,
  UtensilsCrossed,
  ChevronLeft,
  ChevronRight,
  Sandwich,
  Wheat,
} from "lucide-react";
import {
  createMenuItem,
  updateMenuItem,
  toggleMenuItemAvailability,
  deleteMenuItem,
  saveInlineBreadPricing,
  type InlineBreadPricing,
  type MenuItemInput,
} from "./menu-client";

// Same order and wording as the storefront menu sections: sandwiches first,
// then mixes, plates & meals, boxes, appetizers, drinks.
const CATEGORY_OPTIONS = [
  { value: "base_item", label: "ساندوتش" },
  { value: "mix", label: "ميكس" },
  { value: "platter", label: "طبق / وجبة" },
  { value: "breakfast_box", label: "بوكس فطار" },
  { value: "addon", label: "مقبلات" },
  { value: "beverage", label: "مشروب" },
] as const;

type Category = (typeof CATEGORY_OPTIONS)[number]["value"];

// Stored category preset when adding a product from a group button.
const GROUP_DEFAULT_CATEGORY: Record<AdminMenuGroup, Category> = {
  foul: "base_item",
  potatoes: "base_item",
  falafel: "base_item",
  eggs: "base_item",
  cheese: "base_item",
  eggplant: "base_item",
  tuna: "base_item",
  sandwiches: "base_item",
  sweets: "base_item",
  mixes: "mix",
  packs: "platter",
  boxes: "breakfast_box",
  platters: "platter",
  drinks: "beverage",
  extras: "addon",
  other: "base_item",
};

// Keep in sync with MAX_GALLERY_PHOTOS in actions.ts (server-side guard).
const MAX_GALLERY_PHOTOS = 6;

export type MenuItem = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  category: Category;
  priceEGP: string;
  costEGP: string;
  isAvailable: boolean;
  sortOrder: number;
  photoDataUrl: string | null;
  photosJson: string[] | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  breadPricing: InlineBreadPricing | null;
};

const EMPTY_FORM: MenuItemInput = {
  slug: "",
  nameAr: "",
  nameEn: "",
  category: "base_item",
  priceEGP: "",
  costEGP: "0",
  sortOrder: 0,
  photoDataUrl: null,
  photosJson: [],
  descriptionAr: "",
  descriptionEn: "",
};

const INPUT_CLASS =
  "rounded-lg border border-[var(--ink)]/15 px-3 py-2 text-sm outline-none transition focus:border-[var(--amber)]";

// Downscales + recompresses the picked file in-browser (via canvas) before
// turning it into a data URL, so a 12MP phone photo doesn't balloon the DB
// row and the upload stays fast on a slow mobile connection.
function resizeImageToDataUrl(
  file: File,
  maxSize = 640,
  quality = 0.82,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("مقدرناش نقرا الصورة"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("الملف مش صورة صالحة"));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("مقدرناش نجهز الصورة"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function PhotoPicker({
  value,
  onChange,
}: {
  value: string | null | undefined;
  onChange: (dataUrl: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkValue, setLinkValue] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setIsProcessing(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      onChange(dataUrl);
    } catch (processError) {
      setError(
        processError instanceof Error ? processError.message : "حصل خطأ في الصورة",
      );
    } finally {
      setIsProcessing(false);
    }
  }

  function handleUseLink() {
    setError(null);
    const trimmed = linkValue.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      setError(
        "حط رابط صورة يبدأ بـ https:// (رابط عام يقدر أي حد يفتحه، مش رابط من جوه نوشن)",
      );
      return;
    }
    onChange(trimmed);
    setLinkValue("");
    setShowLinkInput(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--ink)]/15 bg-[var(--sesame)]">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="صورة الصنف" className="h-full w-full object-cover" />
          ) : (
            <ImageOff className="h-5 w-5 text-[var(--ink)]/30" />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold text-[var(--ink)]/60">
            صورة الغلاف (اللي بتظهر في المينيو)
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--ink)]/20 px-3 py-1.5 text-xs font-bold transition hover:bg-[var(--ink)]/5 disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              {isProcessing ? "جاري الرفع..." : value ? "غيّر الصورة" : "ارفع صورة"}
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => setShowLinkInput((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--ink)]/20 px-3 py-1.5 text-xs font-bold transition hover:bg-[var(--ink)]/5 disabled:opacity-50"
            >
              <Link2 className="h-3.5 w-3.5" /> الصق رابط صورة
            </button>
            {value ? (
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => onChange(null)}
                className="flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-bold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" /> شيل الصورة
              </button>
            ) : null}
          </div>
          {error ? <p className="text-xs text-red-500">{error}</p> : null}
        </div>
      </div>
      {showLinkInput ? (
        <div className="flex gap-2">
          <input
            value={linkValue}
            onChange={(event) => setLinkValue(event.target.value)}
            placeholder="https://example.com/photo.jpg"
            dir="ltr"
            className="flex-1 rounded-lg border border-[var(--ink)]/15 px-3 py-1.5 text-xs"
          />
          <button
            type="button"
            onClick={handleUseLink}
            className="rounded-lg bg-[var(--amber)] px-3 py-1.5 text-xs font-bold text-[var(--ink)]"
          >
            استخدم الرابط
          </button>
        </div>
      ) : null}
    </div>
  );
}

// Extra photos shown in the gallery on the product detail page. The cover
// photo above is always image #1; these come after it, in this order.
function GalleryPicker({
  value,
  onChange,
}: {
  value: string[] | null | undefined;
  onChange: (photos: string[]) => void;
}) {
  const photos = value ?? [];
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const isFull = photos.length >= MAX_GALLERY_PHOTOS;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setIsProcessing(true);
    try {
      const next = [...photos];
      let skipped = 0;
      for (const file of Array.from(files)) {
        if (next.length >= MAX_GALLERY_PHOTOS) {
          skipped += 1;
          continue;
        }
        next.push(await resizeImageToDataUrl(file));
      }
      onChange(next);
      if (skipped > 0) {
        setError(`أقصى عدد ${MAX_GALLERY_PHOTOS} صور إضافية — الزيادة اتجاهلت`);
      }
    } catch (processError) {
      setError(
        processError instanceof Error ? processError.message : "حصل خطأ في الصور",
      );
    } finally {
      setIsProcessing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleUseLink() {
    setError(null);
    const trimmed = linkValue.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      setError("حط رابط صورة يبدأ بـ https://");
      return;
    }
    if (isFull) {
      setError(`أقصى عدد ${MAX_GALLERY_PHOTOS} صور إضافية`);
      return;
    }
    onChange([...photos, trimmed]);
    setLinkValue("");
    setShowLinkInput(false);
  }

  function handleRemove(index: number) {
    onChange(photos.filter((_, photoIndex) => photoIndex !== index));
  }

  // step = -1 moves the photo one slot earlier in the gallery order.
  // Reads the photo before splicing so the value stays a plain string under
  // noUncheckedIndexedAccess (splice()'s return type includes undefined).
  function handleMove(index: number, step: number) {
    const target = index + step;
    if (target < 0 || target >= photos.length) return;
    const moved = photos[index];
    if (moved === undefined) return;
    const next = [...photos];
    next.splice(index, 1);
    next.splice(target, 0, moved);
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[var(--ink)]/10 bg-[var(--sesame)]/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold text-[var(--ink)]/60">
          صور إضافية للصنف ({photos.length}/{MAX_GALLERY_PHOTOS}) — بتظهر في صفحة تفاصيل
          الصنف
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => handleFiles(event.target.files)}
          />
          <button
            type="button"
            disabled={isProcessing || isFull}
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--ink)]/20 bg-white px-3 py-1.5 text-xs font-bold transition hover:bg-[var(--ink)]/5 disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            {isProcessing ? "جاري الرفع..." : "ضيف صور"}
          </button>
          <button
            type="button"
            disabled={isProcessing || isFull}
            onClick={() => setShowLinkInput((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--ink)]/20 bg-white px-3 py-1.5 text-xs font-bold transition hover:bg-[var(--ink)]/5 disabled:opacity-50"
          >
            <Link2 className="h-3.5 w-3.5" /> رابط
          </button>
        </div>
      </div>

      {showLinkInput ? (
        <div className="flex gap-2">
          <input
            value={linkValue}
            onChange={(event) => setLinkValue(event.target.value)}
            placeholder="https://example.com/photo.jpg"
            dir="ltr"
            className="flex-1 rounded-lg border border-[var(--ink)]/15 bg-white px-3 py-1.5 text-xs"
          />
          <button
            type="button"
            onClick={handleUseLink}
            className="rounded-lg bg-[var(--amber)] px-3 py-1.5 text-xs font-bold text-[var(--ink)]"
          >
            ضيف
          </button>
        </div>
      ) : null}

      {photos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--ink)]/15 bg-white/60 p-3 text-center text-xs text-[var(--ink)]/45">
          مفيش صور إضافية — ارفع صور تانية للصنف من زوايا مختلفة
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {photos.map((photo, index) => (
            <div
              key={`${index}-${photo.slice(-24)}`}
              className="relative h-20 w-20 overflow-hidden rounded-xl border border-[var(--ink)]/15 bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt={`صورة ${index + 2}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                aria-label="شيل الصورة"
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-red-500"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/45">
                <button
                  type="button"
                  disabled={index === photos.length - 1}
                  onClick={() => handleMove(index, 1)}
                  aria-label="ورا"
                  className="flex h-5 flex-1 items-center justify-center text-white disabled:opacity-30"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleMove(index, -1)}
                  aria-label="قدام"
                  className="flex h-5 flex-1 items-center justify-center text-white disabled:opacity-30"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}

function ProductNameFields({
  form,
  setForm,
}: {
  form: MenuItemInput;
  setForm: (form: MenuItemInput) => void;
}) {
  const generated = menuNameToEnglish(form.nameAr);
  return (
    <>
      <label className="flex min-w-0 flex-col gap-1 text-xs font-bold">
        اسم المنتج بالعربي
        <input
          value={form.nameAr}
          onChange={(event) => {
            const nameAr = event.target.value;
            setForm({ ...form, nameAr, nameEn: menuNameToEnglish(nameAr).text });
          }}
          placeholder="اكتب اسم المنتج بالعربي"
          className={INPUT_CLASS}
        />
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-xs font-bold">
        الاسم الإنجليزي — تلقائي
        <input
          value={form.nameEn}
          readOnly
          dir="ltr"
          className={`${INPUT_CLASS} bg-[var(--sesame)]/50`}
        />
        {form.nameAr.trim() &&
        generated.mode === "transliterated" &&
        generated.text === form.nameEn ? (
          <span className="text-xs font-normal text-amber-700">
            اسم غير موجود في قاموس الأكلات: منقول بحروف إنجليزية، مش ترجمة معنى.
          </span>
        ) : null}
      </label>
    </>
  );
}

function DescriptionFields({
  form,
  setForm,
}: {
  form: MenuItemInput;
  setForm: (form: MenuItemInput) => void;
}) {
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <textarea
        value={form.descriptionAr ?? ""}
        onChange={(event) => setForm({ ...form, descriptionAr: event.target.value })}
        placeholder="وصف الصنف بالعربي — مكوناته وطعمه (يظهر في صفحة تفاصيل الصنف)"
        rows={3}
        className={INPUT_CLASS}
      />
      <textarea
        value={form.descriptionEn ?? ""}
        onChange={(event) => setForm({ ...form, descriptionEn: event.target.value })}
        placeholder="Description in English"
        rows={3}
        dir="ltr"
        className={INPUT_CLASS}
      />
    </div>
  );
}

function InlineBreadPricingFields({
  productName,
  basePrice,
  value,
  onChange,
}: {
  productName: string;
  basePrice: string;
  value: InlineBreadPricing;
  onChange: (value: InlineBreadPricing) => void;
}) {
  const kinds = ["fino", "baladi"] as const;
  function suggestedPrice(kind: "fino" | "baladi") {
    const price = Number(basePrice);
    if (!Number.isFinite(price) || price <= 0) return "";
    return String(Math.round((price + (kind === "baladi" ? 2 : 0)) * 100) / 100);
  }
  function patch(
    kind: "fino" | "baladi",
    update: Partial<InlineBreadPricing["variants"][number]>,
  ) {
    const existing = value.variants.find((variant) => variant.kind === kind);
    onChange({
      ...value,
      variants: existing
        ? value.variants.map((variant) =>
            variant.kind === kind ? { ...variant, ...update } : variant,
          )
        : [
            ...value.variants,
            {
              id: crypto.randomUUID(),
              kind,
              available: false,
              priceEGP: suggestedPrice(kind),
              ...update,
            },
          ],
    });
  }
  return (
    <section className="mt-4 rounded-2xl border border-[var(--amber-deep)]/30 bg-[var(--amber)]/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-black">تسعير العيش — {productName}</h3>
          <p className="mt-1 text-xs font-bold leading-6 text-[var(--ink)]/55">
            السعر هنا سعر الساندوتش كاملًا. الاقتراح المؤقت: الفينو بسعر المنتج،
            والبلدي النصين أغلى 30% تقريبًا لأنه يأخذ حشوًا أكثر — وتقدر تعدّلهم.
          </p>
        </div>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-[var(--line)] bg-white px-3 text-sm font-black">
          <input
            type="checkbox"
            checked={value.enabled}
            onChange={(event) => onChange({ ...value, enabled: event.target.checked })}
          />
          تفعيل اختيار نوع العيش
        </label>
      </div>
      {value.enabled ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {kinds.map((kind) => {
            const variant = value.variants.find((one) => one.kind === kind);
            const label = kind === "fino" ? "رغيف فينو" : "رغيف بلدي نصين";
            const Icon = kind === "fino" ? Sandwich : Wheat;
            return (
              <article
                key={kind}
                className={`rounded-2xl border p-3 ${
                  variant?.available
                    ? "border-[var(--amber-deep)] bg-white"
                    : "border-[var(--line)] bg-[var(--surface-muted)]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 font-black">
                    <Icon className="h-5 w-5 text-[var(--amber-deep)]" />
                    {label}
                  </span>
                  <label className="flex items-center gap-2 text-xs font-black">
                    <input
                      type="checkbox"
                      checked={variant?.available ?? false}
                      onChange={(event) =>
                        patch(kind, { available: event.target.checked })
                      }
                    />
                    متاح
                  </label>
                </div>
                <label className="mt-3 block text-xs font-black">
                  سعر الساندوتش كاملًا
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0.01"
                    step="0.01"
                    value={variant?.priceEGP ?? ""}
                    placeholder={suggestedPrice(kind)}
                    onChange={(event) => patch(kind, { priceEGP: event.target.value })}
                    className={`${INPUT_CLASS} mt-2 w-full bg-white font-black`}
                  />
                </label>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="mt-3 rounded-xl bg-white p-3 text-xs font-bold text-[var(--ink)]/55">
          عند إيقافه سيستخدم المنتج سعره الأساسي بدون اختيار نوع عيش.
        </p>
      )}
    </section>
  );
}

export function MenuAdminPanel({ items }: { items: MenuItem[] }) {
  const [showNewItem, setShowNewItem] = useState(false);
  const [presetGroup, setPresetGroup] = useState<AdminMenuGroup | null>(null);
  const [createdMessage, setCreatedMessage] = useState<string | null>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const availableCount = items.filter((item) => item.isAvailable).length;

  function openNewItemForm(group: AdminMenuGroup | null) {
    setCreatedMessage(null);
    setPresetGroup(group);
    setShowNewItem(true);
    requestAnimationFrame(() => {
      const form = document.getElementById("menu-new-product");
      form?.scrollIntoView({ behavior: "smooth", block: "start" });
      form
        ?.querySelector<HTMLInputElement>(
          'input[placeholder="اكتب اسم المنتج بالعربي"]',
        )
        ?.focus({ preventScroll: true });
    });
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={UtensilsCrossed} label="إجمالي الأصناف" value={items.length} />
        <StatCard
          icon={Eye}
          label="متاح للطلب"
          value={availableCount}
          tint="text-green-600"
        />
        <StatCard
          icon={EyeOff}
          label="مخفي"
          value={items.length - availableCount}
          tint="text-red-500"
        />
      </div>

      <div className="flex flex-col gap-3">
        <button
          ref={addButtonRef}
          type="button"
          aria-expanded={showNewItem}
          aria-controls="menu-new-product"
          onClick={() => {
            if (showNewItem) {
              setShowNewItem(false);
            } else {
              openNewItemForm(null);
            }
          }}
          className="flex w-fit items-center gap-2 rounded-xl bg-[var(--amber)] px-5 py-3 text-sm font-bold text-[var(--ink)]"
        >
          {showNewItem ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showNewItem ? "إغلاق الإضافة" : "إضافة منتج"}
        </button>
        {createdMessage ? (
          <p role="status" className="text-sm font-bold text-green-700">
            {createdMessage}
          </p>
        ) : null}
        <div id="menu-new-product" hidden={!showNewItem}>
          <NewItemForm
            key={presetGroup ?? "general"}
            items={items}
            presetGroup={presetGroup}
            onCreated={(groupLabel) => {
              setShowNewItem(false);
              setCreatedMessage(`اتضاف المنتج في قسم: ${groupLabel}`);
              addButtonRef.current?.focus();
            }}
          />
        </div>
      </div>
      <MenuAdminCatalog
        items={items}
        onAddToGroup={(group) => openNewItemForm(group)}
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tint = "text-[var(--amber-deep)]",
}: {
  icon: typeof UtensilsCrossed;
  label: string;
  value: number;
  tint?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--ink)]/10 bg-white p-4">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--sesame)] ${tint}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-2xl font-black">{value}</p>
        <p className="text-xs font-semibold text-[var(--ink)]/55">{label}</p>
      </div>
    </div>
  );
}

function NewItemForm({
  items,
  onCreated,
  presetGroup,
}: {
  items: MenuItem[];
  onCreated: (groupLabel: string) => void;
  presetGroup: AdminMenuGroup | null;
}) {
  const router = useRouter();
  const presetCategory = presetGroup ? GROUP_DEFAULT_CATEGORY[presetGroup] : null;
  const presetLabel = presetGroup
    ? (ADMIN_MENU_GROUPS.find((group) => group.value === presetGroup)?.label ??
      null)
    : null;
  const blankForm = (): MenuItemInput =>
    presetCategory ? { ...EMPTY_FORM, category: presetCategory } : EMPTY_FORM;
  const [form, setForm] = useState<MenuItemInput>(blankForm);
  const [manualCategory, setManualCategory] = useState(presetCategory !== null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCreate() {
    setError(null);
    if (!/^\d+(?:\.\d{1,2})?$/.test(form.priceEGP) || Number(form.priceEGP) <= 0) {
      setError("اكتب سعر بيع أكبر من صفر عشان المنتج يظهر للعميل");
      return;
    }
    startTransition(async () => {
      try {
        await createMenuItem(form);
        const placement = newProductPlacementLabel(form);
        setForm(blankForm());
        setManualCategory(presetCategory !== null);
        onCreated(placement);
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "حصل خطأ");
      }
    });
  }

  return (
    <section className="rounded-2xl border border-dashed border-[var(--amber)] bg-white p-4">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
        <Plus className="h-5 w-5 text-[var(--amber-deep)]" />{" "}
        {presetLabel ? `إضافة منتج جديد في ${presetLabel}` : "إضافة منتج جديد"}
      </h2>
      <div className="mb-3 flex flex-col gap-3">
        <PhotoPicker
          value={form.photoDataUrl}
          onChange={(dataUrl) => setForm({ ...form, photoDataUrl: dataUrl })}
        />
        <GalleryPicker
          value={form.photosJson}
          onChange={(photos) => setForm({ ...form, photosJson: photos })}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex min-w-0 flex-col gap-1 text-xs font-bold">
          كود المنتج — تلقائي
          <input
            aria-label="كود المنتج — تلقائي"
            value={`${menuCodePrefix(form)}-...`}
            readOnly
            dir="ltr"
            className={`${INPUT_CLASS} bg-[var(--sesame)]/50`}
          />
          <span className="text-xs font-normal text-[var(--ink)]/55">
            رقم متسلسل داخل القسم بيتحدد عند الحفظ
          </span>
        </label>
        <ProductNameFields
          form={form}
          setForm={(next) =>
            setForm({
              ...next,
              category: manualCategory
                ? next.category
                : inferNewProductCategory(next.nameAr, items),
            })
          }
        />
        <select
          value={form.category}
          aria-label="نوع المنتج"
          onChange={(event) => {
            setManualCategory(true);
            setForm({ ...form, category: event.target.value as Category });
          }}
          className={INPUT_CLASS}
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          value={form.priceEGP}
          onChange={(event) => setForm({ ...form, priceEGP: event.target.value })}
          placeholder="سعر البيع (جنيه)"
          inputMode="decimal"
          className={INPUT_CLASS}
        />
        <input
          value={form.costEGP}
          onChange={(event) => setForm({ ...form, costEGP: event.target.value })}
          placeholder="التكلفة (جنيه)"
          inputMode="decimal"
          className={INPUT_CLASS}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-[var(--sesame)]/60 p-3">
        <p role="status" className="text-sm font-bold">
          {form.nameAr.trim()
            ? `هيتضاف في قسم: ${newProductPlacementLabel(form)}`
            : presetLabel
              ? `هيتضاف في قسم: ${presetLabel} — اكتب اسم المنتج`
              : "اكتب اسم المنتج بالعربي وهحدد القسم تلقائيًا"}
        </p>
        {manualCategory ? (
          <button
            type="button"
            onClick={() => {
              setManualCategory(false);
              setForm({
                ...form,
                category: inferNewProductCategory(form.nameAr, items),
              });
            }}
            className="rounded-lg border border-[var(--ink)]/20 px-3 py-1 text-xs font-bold"
          >
            رجوع للتصنيف التلقائي
          </button>
        ) : null}
        <p className="text-xs text-[var(--ink)]/55">
          لو القسم المقترح مش مناسب، غيّر نوع المنتج قبل الحفظ
        </p>
      </div>
      <DescriptionFields form={form} setForm={setForm} />

      {form.category === "base_item" || form.category === "mix" ? (
        <p className="mt-3 rounded-xl border border-[var(--amber-deep)]/25 bg-[var(--amber)]/10 p-3 text-xs font-bold leading-6 text-[var(--ink)]/65">
          بعد إضافة المنتج سيتم تفعيل النوعين تلقائيًا: الفينو بسعر البيع الحالي،
          والبلدي النصين أغلى 30% تقريبًا. افتح تعديل المنتج بعد الحفظ لو حابب تغيّر
          سعرًا أو توقف نوعًا.
        </p>
      ) : null}

      <button
        type="button"
        disabled={
          isPending ||
          !form.nameAr.trim() ||
          !form.nameEn.trim() ||
          !/^\d+(?:\.\d{1,2})?$/.test(form.priceEGP) ||
          Number(form.priceEGP) <= 0
        }
        onClick={handleCreate}
        className="mt-3 flex items-center gap-1.5 rounded-lg bg-[var(--amber)] px-4 py-2 text-sm font-bold text-[var(--ink)] transition active:scale-95 disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        إضافة
      </button>

      {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
    </section>
  );
}

export function MenuItemRow({ item }: { item: MenuItem }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<MenuItemInput>({
    slug: item.slug,
    nameAr: item.nameAr,
    nameEn:
      !item.nameEn.trim() || hasArabic(item.nameEn)
        ? menuNameToEnglish(item.nameAr).text
        : item.nameEn,
    category: item.category,
    priceEGP: item.priceEGP,
    costEGP: item.costEGP,
    sortOrder: item.sortOrder,
    photoDataUrl: item.photoDataUrl,
    photosJson: item.photosJson ?? [],
    descriptionAr: item.descriptionAr ?? "",
    descriptionEn: item.descriptionEn ?? "",
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [breadDraft, setBreadDraft] = useState<InlineBreadPricing>(
    item.breadPricing ?? { enabled: true, variants: [] },
  );
  const extraPhotoCount = item.photosJson?.length ?? 0;
  const customerVisible = item.isAvailable && Number(item.priceEGP) > 0;
  const breadEligible = form.category === "base_item" || form.category === "mix";

  function handleSave() {
    setError(null);
    if (!/^\d+(?:\.\d{1,2})?$/.test(form.priceEGP) || Number(form.priceEGP) <= 0) {
      setError("سعر البيع لازم يكون أكبر من صفر عشان الصنف يظهر للعميل");
      return;
    }
    if (breadEligible && breadDraft.enabled) {
      const available = breadDraft.variants.filter((variant) => variant.available);
      if (!available.length) {
        setError("فعّل الفينو أو البلدي النصين على الأقل");
        return;
      }
      if (
        available.some(
          (variant) =>
            !/^\d+(?:\.\d{1,2})?$/.test(variant.priceEGP) ||
            Number(variant.priceEGP) <= 0,
        )
      ) {
        setError("اكتب سعر الساندوتش الكامل لكل نوع عيش متاح");
        return;
      }
    }
    startTransition(async () => {
      try {
        // Do not resend/revalidate unchanged images when only text changes.
        const input = { ...form };
        if (input.photoDataUrl === item.photoDataUrl) delete input.photoDataUrl;
        if (
          JSON.stringify(input.photosJson ?? []) ===
          JSON.stringify(item.photosJson ?? [])
        ) {
          delete input.photosJson;
        }
        await updateMenuItem(item.id, input);
        if (breadEligible) await saveInlineBreadPricing(item.id, breadDraft);
        setIsEditing(false);
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "حصل خطأ");
      }
    });
  }

  function handleToggle() {
    setError(null);
    startTransition(async () => {
      try {
        await toggleMenuItemAvailability(item.id, !item.isAvailable);
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "حصل خطأ");
      }
    });
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteMenuItem(item.id);
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "حصل خطأ");
      }
    });
  }

  if (isEditing) {
    return (
      <div className="rounded-2xl border border-[var(--amber)] bg-white p-3 sm:col-span-2">
        <div className="mb-3 flex flex-col gap-3">
          <PhotoPicker
            value={form.photoDataUrl}
            onChange={(dataUrl) => setForm({ ...form, photoDataUrl: dataUrl })}
          />
          <GalleryPicker
            value={form.photosJson}
            onChange={(photos) => setForm({ ...form, photosJson: photos })}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex min-w-0 flex-col gap-1 text-xs font-bold">
            كود المنتج — ثابت
            <input
              aria-label="كود المنتج — ثابت"
              value={item.slug}
              readOnly
              dir="ltr"
              className={`${INPUT_CLASS} bg-[var(--sesame)]/50`}
            />
          </label>
          <ProductNameFields form={form} setForm={setForm} />
          <select
            value={form.category}
            onChange={(event) =>
              setForm({ ...form, category: event.target.value as Category })
            }
            className={INPUT_CLASS}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            value={form.priceEGP}
            onChange={(event) => setForm({ ...form, priceEGP: event.target.value })}
            inputMode="decimal"
            className={INPUT_CLASS}
          />
          <input
            value={form.costEGP}
            onChange={(event) => setForm({ ...form, costEGP: event.target.value })}
            inputMode="decimal"
            className={INPUT_CLASS}
          />
        </div>

        <DescriptionFields form={form} setForm={setForm} />

        {breadEligible ? (
          <InlineBreadPricingFields
            productName={form.nameAr}
            basePrice={form.priceEGP}
            value={breadDraft}
            onChange={setBreadDraft}
          />
        ) : null}

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--amber)] px-3 py-1.5 text-sm font-bold text-[var(--ink)] transition active:scale-95 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            حفظ
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-1 rounded-lg border border-[var(--ink)]/20 px-3 py-1.5 text-sm font-bold disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" /> إلغاء
          </button>
        </div>
        {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--ink)]/10 bg-white p-3.5 transition hover:border-[var(--amber)]/40">
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[var(--ink)]/10 bg-[var(--sesame)]">
        {item.photoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.photoDataUrl}
            alt={item.nameAr}
            className="h-full w-full object-cover"
          />
        ) : null}
        {extraPhotoCount > 0 ? (
          <span className="absolute bottom-0 left-0 rounded-tr-lg bg-black/65 px-1 text-[10px] font-bold text-white">
            +{extraPhotoCount}
          </span>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">
          {item.nameAr} <span className="text-[var(--ink)]/40">/ {item.nameEn}</span>
        </p>
        <p className="text-xs text-[var(--ink)]/55">
          {item.priceEGP} ج.م — تكلفة {item.costEGP} ج.م — {item.slug}
        </p>
        {item.descriptionAr ? (
          <p className="mt-0.5 truncate text-xs text-[var(--ink)]/45">
            {item.descriptionAr}
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-amber-600">مفيش وصف للصنف ده لسه</p>
        )}
        {item.breadPricing?.enabled ? (
          <p className="mt-1 text-xs font-bold text-[var(--amber-deep)]">
            {item.breadPricing.variants
              .filter((variant) => variant.available)
              .sort((a, b) =>
                a.kind === b.kind ? 0 : a.kind === "fino" ? -1 : 1,
              )
              .map(
                (variant) =>
                  `${variant.kind === "fino" ? "فينو" : "بلدي نصين"}: ${variant.priceEGP} ج.م`,
              )
              .join(" • ")}
          </p>
        ) : null}
      </div>

      <div
        aria-hidden="true"
        className="h-px basis-full bg-[var(--ink)]/8"
      />

      <span
        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
          customerVisible ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
        }`}
      >
        {customerVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
        {customerVisible
          ? "ظاهر على الموقع"
          : !item.isAvailable
            ? "مخفي من الموقع"
            : "لن يظهر: السعر صفر"}
      </span>

      <button
        type="button"
        disabled={isPending}
        onClick={handleToggle}
        className="flex items-center gap-1 rounded-lg border border-[var(--ink)]/20 px-2.5 py-1.5 text-xs font-bold transition hover:bg-[var(--ink)]/5 disabled:opacity-50"
      >
        {item.isAvailable ? (
          <EyeOff className="h-3.5 w-3.5" />
        ) : (
          <Eye className="h-3.5 w-3.5" />
        )}
        {item.isAvailable ? "إخفاء" : "إظهار"}
      </button>

      <button
        type="button"
        disabled={isPending}
        onClick={() => setIsEditing(true)}
        className="flex items-center gap-1 rounded-lg bg-[var(--amber)] px-2.5 py-1.5 text-xs font-bold text-[var(--ink)] transition active:scale-95 disabled:opacity-50"
      >
        <Pencil className="h-3.5 w-3.5" /> تعديل
      </button>

      <button
        type="button"
        disabled={isPending}
        onClick={handleDelete}
        className="flex items-center gap-1 rounded-lg border border-red-300 px-2.5 py-1.5 text-xs font-bold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" /> حذف
      </button>

      {error ? <p className="w-full text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
