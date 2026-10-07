"use client";

import { useEffect, useRef, useState } from "react";
import { useCartStore, MAX_NOTE_LENGTH } from "@/lib/cart-store";
import type { ProductExtraOption } from "./product-extras";

export function ProductExtrasPicker({
  menuItemId,
  nameAr,
  priceEGP,
  options,
  isAr,
  open,
  onOpen,
  onClose,
  hideTrigger = false,
}: {
  menuItemId: string;
  nameAr: string;
  priceEGP: number;
  options: ProductExtraOption[];
  isAr: boolean;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  hideTrigger?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [ids, setIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const addItem = useCartStore((state) => state.addItem);
  const selected = options.filter((option) => ids.includes(option.id));
  const total =
    Math.round(
      (priceEGP + selected.reduce((sum, option) => sum + option.priceEGP, 0)) *
        quantity *
        100,
    ) / 100;

  useEffect(() => {
    const node = dialog.current;
    if (!node || !open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    node.showModal();
    return () => {
      node.close();
      document.body.style.overflow = previous;
    };
  }, [open]);

  function add() {
    addItem(
      { menuItemId, nameAr, priceEGP },
      selected.map((option) => ({
        menuItemId: option.id,
        nameAr: option.nameAr,
        priceEGP: option.priceEGP,
      })),
      quantity,
      note,
    );
    onClose();
    setIds([]);
    setNote("");
    setQuantity(1);
  }

  return (
    <>
      {!hideTrigger ? (
        <button
          type="button"
          aria-label={isAr ? `اختيار إضافات ${nameAr}` : "Choose optional extras"}
          onClick={onOpen}
          className="btn h-9 rounded-full border px-3 text-xs"
        >
          {isAr ? "إضافة +" : "Add +"}
        </button>
      ) : null}
      <dialog
        ref={dialog}
        dir={isAr ? "rtl" : "ltr"}
        aria-labelledby={`extras-title-${menuItemId}`}
        onCancel={(event) => {
          event.preventDefault();
          onClose();
        }}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              "button:not(:disabled),input:not(:disabled),textarea:not(:disabled)",
            ),
          );
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        className="m-auto max-h-[90dvh] w-[calc(100%_-_1rem)] max-w-md overflow-y-auto rounded-3xl border bg-[var(--surface)] p-5 text-[var(--ink)] backdrop:bg-black/60"
      >
        <header className="mb-4 flex items-center justify-between gap-3">
          <h3 id={`extras-title-${menuItemId}`} className="font-black">
            {isAr ? `إضافات ${nameAr}` : "Optional extras"}
          </h3>
          <button
            type="button"
            aria-label={isAr ? "إغلاق" : "Close"}
            onClick={onClose}
            className="btn h-10 w-10 border"
          >
            ×
          </button>
        </header>
        <p className="mb-3 text-xs text-[var(--ink)]/60">
          {isAr
            ? "الإضافات اختيارية — السعر لكل قطعة"
            : "Optional extras — price per item"}
        </p>
        <div className="space-y-2">
          {options.map((option) => (
            <label
              key={option.id}
              className="flex items-center justify-between gap-2 rounded-xl border p-3 text-sm"
            >
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={ids.includes(option.id)}
                  onChange={(event) =>
                    setIds((current) =>
                      event.target.checked
                        ? [...current, option.id]
                        : current.filter((id) => id !== option.id),
                    )
                  }
                />
                {isAr ? option.nameAr : option.nameEn}
              </span>
              <span className="num">
                +{option.priceEGP} {isAr ? "ج.م" : "EGP"}
              </span>
            </label>
          ))}
        </div>
        <label className="mt-4 flex items-center justify-between gap-3 text-sm">
          {isAr ? "العدد بنفس الاختيارات" : "Quantity with the same extras"}
          <input
            aria-label={isAr ? "الكمية" : "Quantity"}
            type="number"
            min={1}
            max={20}
            value={quantity}
            onChange={(event) =>
              setQuantity(
                Math.max(1, Math.min(20, Math.round(Number(event.target.value) || 1))),
              )
            }
            className="input w-20"
          />
        </label>
        <textarea
          aria-label={isAr ? "ملاحظات للمطبخ" : "Kitchen notes"}
          placeholder={isAr ? "ملاحظات للمطبخ (اختياري)" : "Kitchen notes (optional)"}
          className="input mt-4"
          rows={2}
          maxLength={MAX_NOTE_LENGTH}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
        <p aria-live="polite" className="num my-4 font-black">
          {isAr ? "الإجمالي" : "Total"}: {total} {isAr ? "ج.م" : "EGP"}
        </p>
        <button type="button" onClick={add} className="btn btn-dark w-full py-3">
          {isAr ? "إضافة للسلة" : "Add to cart"}
        </button>
      </dialog>
    </>
  );
}
