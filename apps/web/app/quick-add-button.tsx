"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { ProductExtrasPicker } from "./product-extras-picker";
import type { ProductExtraOption } from "./product-extras";

type Props = {
  menuItemId: string;
  nameAr: string;
  priceEGP: number;
  label: string;
  extrasProductId?: string;
  alwaysShowCounter?: boolean;
  compactCounter?: boolean;
};

const MAX_QUANTITY = 20;

export function QuickAddButton({
  menuItemId,
  nameAr,
  priceEGP,
  label,
  extrasProductId = menuItemId,
  alwaysShowCounter = false,
  compactCounter = false,
}: Props) {
  const lines = useCartStore((state) => state.lines);
  const addItem = useCartStore((state) => state.addItem);
  const setLineQuantity = useCartStore((state) => state.setLineQuantity);
  const matchingLines = lines.filter((line) => line.menuItemId === menuItemId);
  const plainQuantity = lines.find((line) => line.id === menuItemId)?.quantity ?? 0;
  const quantity = alwaysShowCounter
    ? matchingLines.reduce((sum, line) => sum + line.quantity, 0)
    : plainQuantity;
  const orderable = Number.isFinite(priceEGP) && priceEGP > 0;
  const [options, setOptions] = useState<ProductExtraOption[] | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function prepare(plain: () => void) {
    if (pending) return;
    if (options !== null) {
      if (options.length) setOpen(true);
      else plain();
      return;
    }
    setPending(true);
    setError("");
    try {
      const response = await fetch(
        `/api/product-extras?productId=${encodeURIComponent(extrasProductId)}`,
        { cache: "no-store" },
      );
      const body: unknown = await response.json();
      if (
        !response.ok ||
        !body ||
        typeof body !== "object" ||
        !("options" in body) ||
        !Array.isArray(body.options)
      )
        throw new Error();
      const values: unknown[] = body.options;
      if (
        values.some(
          (value) =>
            !value ||
            typeof value !== "object" ||
            !("id" in value) ||
            typeof value.id !== "string" ||
            !("nameAr" in value) ||
            typeof value.nameAr !== "string" ||
            !("nameEn" in value) ||
            typeof value.nameEn !== "string" ||
            !("priceEGP" in value) ||
            typeof value.priceEGP !== "number" ||
            !Number.isFinite(value.priceEGP) ||
            value.priceEGP < 0,
        ) ||
        values.length > 10
      )
        throw new Error();
      const next = values as ProductExtraOption[];
      setOptions(next);
      if (next.length) setOpen(true);
      else plain();
    } catch {
      setError(
        label === "Add"
          ? "Could not load choices. Try again."
          : "تعذر تحميل الاختيارات؛ حاول مرة تانية.",
      );
    } finally {
      setPending(false);
    }
  }

  if (!orderable)
    return (
      <button
        type="button"
        disabled
        className="btn h-9 rounded-full border border-[var(--line)] bg-[var(--surface-muted)] px-3 text-[10px] text-[var(--ink)]/45"
      >
        السعر غير متاح
      </button>
    );

  function decrease() {
    if (quantity <= 0) return;
    if (alwaysShowCounter) {
      const target = matchingLines[matchingLines.length - 1];
      if (target) setLineQuantity(target.id, target.quantity - 1);
      return;
    }
    setLineQuantity(menuItemId, quantity - 1);
  }

  const counter = (
    <div
      className={`flex shrink-0 items-center justify-between text-[var(--ink)] ${
        compactCounter
          ? "h-11 w-full overflow-hidden rounded-xl border border-[var(--line-strong)] bg-white shadow-none sm:w-[7.75rem]"
          : `rounded-xl bg-gradient-to-b from-[var(--amber)] to-[var(--amber-deep)] p-1 shadow-[var(--shadow-amber)] ${alwaysShowCounter ? "h-11 w-full" : "h-9"}`
      }`}
      aria-label={label}
    >
      <button
        type="button"
        disabled={quantity === 0}
        onClick={decrease}
        className={`btn ${
          compactCounter
            ? "h-11 w-10 rounded-none border-e border-[var(--line)] bg-[var(--surface-muted)] text-[var(--ink)]/55"
            : `rounded-lg bg-black/5 ${alwaysShowCounter ? "h-9 w-9" : "h-7 w-7"}`
        }`}
        aria-label="تقليل الكمية"
      >
        <Minus className="h-4 w-4" strokeWidth={3.25} />
      </button>
      <span
        className="num min-w-[1.5rem] text-center text-sm font-black"
        aria-live="polite"
      >
        {quantity}
      </span>
      <button
        type="button"
        disabled={pending || quantity >= MAX_QUANTITY}
        onClick={() =>
          void prepare(() =>
            quantity === 0
              ? addItem({ menuItemId, nameAr, priceEGP })
              : setLineQuantity(menuItemId, Math.min(MAX_QUANTITY, quantity + 1)),
          )
        }
        className={`btn ${
          compactCounter
            ? "h-11 w-10 rounded-none bg-[var(--amber)] text-[var(--ink)]"
            : `rounded-lg bg-white/35 ${alwaysShowCounter ? "h-9 w-9" : "h-7 w-7"}`
        }`}
        aria-label="زيادة الكمية"
      >
        <Plus className="h-4 w-4" strokeWidth={3.25} />
      </button>
    </div>
  );

  if (options?.length)
    return (
      <>
        {counter}
        <ProductExtrasPicker
          menuItemId={menuItemId}
          nameAr={nameAr}
          priceEGP={priceEGP}
          options={options}
          isAr={label !== "Add"}
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          hideTrigger
        />
        {error ? (
          <span role="alert" className="mt-1 block text-[10px] font-bold text-red-700">
            {error}
          </span>
        ) : null}
      </>
    );

  if (alwaysShowCounter || quantity > 0)
    return (
      <>
        {counter}
        {error ? (
          <span role="alert" className="mt-1 block text-[10px] font-bold text-red-700">
            {error}
          </span>
        ) : null}
      </>
    );

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => void prepare(() => addItem({ menuItemId, nameAr, priceEGP }))}
        aria-label={label}
        title={label}
        className="btn h-9 w-9 shrink-0 rounded-full bg-gradient-to-b from-[var(--amber)] to-[var(--amber-deep)] text-[var(--ink)] shadow-[var(--shadow-amber)]"
      >
        <Plus className="h-4 w-4" strokeWidth={3.25} />
      </button>
      {error ? (
        <span role="alert" className="text-xs">
          {error}
        </span>
      ) : null}
    </>
  );
}
