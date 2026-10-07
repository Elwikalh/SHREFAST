"use client";

import { useEffect, useRef, useState } from "react";
import type { Catalog, ManualInput } from "./manual";
import {
  normalizeQuantityDigits,
  OWNER_LINE_MAX,
  OWNER_LINES_MAX,
  parseOwnerQuantity,
  quantityKey,
} from "./touch-quantity";

type Line = ManualInput["lines"][number];
type Extra = ManualInput["extras"][number];

const categoryNames: Record<string, string> = {
  base_item: "الساندوتشات",
  mix: "الميكسات",
  platter: "العلب والباكيتات والأطباق",
  breakfast_box: "بوكس فطار",
  beverage: "المشروبات",
};

function QuantityDialog({
  name,
  initial,
  onConfirm,
  onClose,
}: {
  name: string;
  initial: string;
  onConfirm: (quantity: number) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initial);
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const quantity = parseOwnerQuantity(value);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const element = dialog.current!;
    element.showModal();
    input.current?.focus();
    input.current?.select();
    return () => {
      element.close();
      if (previous?.isConnected) previous.focus();
    };
  }, []);

  function key(event: React.KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "Tab") {
      const controls = Array.from(
        event.currentTarget.querySelectorAll<HTMLInputElement | HTMLButtonElement>(
          "input, button",
        ),
      ).filter((element) => !element.disabled);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (
        (event.shiftKey && document.activeElement === first) ||
        (!event.shiftKey && document.activeElement === last)
      ) {
        event.preventDefault();
        (event.shiftKey ? last : first)?.focus();
      }
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if ((event.target as HTMLElement).closest("[data-cancel-quantity]")) onClose();
      else if (quantity !== null) onConfirm(quantity);
      return;
    }
    if (
      event.target !== input.current &&
      (/^[0-9٠-٩۰-۹]$/.test(event.key) || ["Backspace", "Delete"].includes(event.key))
    ) {
      event.preventDefault();
      setValue((current) => quantityKey(current, event.key));
    }
  }

  return (
    <dialog
      ref={dialog}
      className="touch-dialog"
      aria-labelledby="touch-quantity-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={key}
    >
      <div className="touch-dialog-heading">
        <span>تحديد الكمية</span>
        <h3 id="touch-quantity-title">{name}</h3>
      </div>
      <label htmlFor="touch-quantity-value">الكمية المطلوبة</label>
      <input
        id="touch-quantity-value"
        ref={input}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        dir="ltr"
        value={value}
        aria-invalid={quantity === null}
        aria-describedby="touch-quantity-help"
        onChange={(event) => {
          const next = normalizeQuantityDigits(event.target.value);
          if (/^\d{0,3}$/.test(next)) setValue(next);
        }}
      />
      <p id="touch-quantity-help" role="status">
        {quantity === null
          ? "اكتب عددًا صحيحًا من 1 إلى 50."
          : `${quantity} قطعة — جاهز للإضافة`}
      </p>
      <div className="touch-keys" dir="ltr">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "Delete", "0", "Backspace"].map(
          (keyName) => (
            <button
              type="button"
              key={keyName}
              aria-label={
                keyName === "Delete"
                  ? "مسح الكمية"
                  : keyName === "Backspace"
                    ? "حذف آخر رقم"
                    : keyName
              }
              onClick={() => setValue((current) => quantityKey(current, keyName))}
            >
              {keyName === "Delete" ? "مسح" : keyName === "Backspace" ? "⌫" : keyName}
            </button>
          ),
        )}
      </div>
      <div className="touch-dialog-actions">
        <button type="button" data-cancel-quantity onClick={onClose}>
          رجوع
        </button>
        <button
          type="button"
          className="touch-accent"
          disabled={quantity === null}
          onClick={() => {
            if (quantity !== null) onConfirm(quantity);
          }}
        >
          تأكيد الكمية
        </button>
      </div>
    </dialog>
  );
}

export function TouchBasket({
  catalog,
  lines,
  extras,
  onChange,
  onExtrasChange,
  disabled,
  total,
}: {
  catalog: Catalog;
  lines: Line[];
  extras: Extra[];
  onChange: (lines: Line[]) => void;
  onExtrasChange: (extras: Extra[]) => void;
  disabled: boolean;
  total: number;
}) {
  const basket = useRef<HTMLElement>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selection, setSelection] = useState<{
    id: string;
    index?: number;
  } | null>(null);

  const products = catalog.products.filter(
    (product) => product.category !== "addon" && product.price > 0,
  );
  const addons = catalog.products.filter(
    (product) => product.category === "addon" && product.price >= 0,
  );
  const categories = [...new Set(products.map((product) => product.category))];
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const shown = products.filter(
    (product) =>
      (category === "all" || product.category === category) &&
      product.name.toLocaleLowerCase().includes(normalizedSearch),
  );
  const selected = products.find((product) => product.id === selection?.id);
  const itemCount =
    lines.reduce((sum, line) => sum + (line.menuItemId ? line.quantity : 0), 0) +
    extras.reduce((sum, extra) => sum + extra.quantity, 0);

  function confirm(quantity: number) {
    if (!selection || disabled) return;
    const next =
      selection.index === undefined
        ? [
            ...lines.filter((line) => line.menuItemId),
            {
              menuItemId: selection.id,
              quantity,
              addonMenuItemIds: [],
            },
          ]
        : lines.map((line, index) =>
            index === selection.index ? { ...line, quantity } : line,
          );
    onChange(next);
    setSelection(null);
  }

  function setExtraQuantity(menuItemId: string, quantity: number) {
    if (disabled) return;
    if (quantity < 1) {
      onExtrasChange(extras.filter((extra) => extra.menuItemId !== menuItemId));
      return;
    }
    if (quantity > OWNER_LINE_MAX) return;
    const existing = extras.some((extra) => extra.menuItemId === menuItemId);
    onExtrasChange(
      existing
        ? extras.map((extra) =>
            extra.menuItemId === menuItemId ? { ...extra, quantity } : extra,
          )
        : [...extras, { menuItemId, quantity }],
    );
  }

  return (
    <div className="touch-pos">
      <style>{`.touch-pos{--ink:#17261f;--muted:#68756d;--line:#dedbd2;--paper:#fff;--soft:#f7f5ef;--accent:#d99725;--accent-dark:#8d5b09;font-size:14px;color:var(--ink)}
.touch-pos *{box-sizing:border-box}.touch-pos button,.touch-pos input,.touch-pos select{min-height:44px}.touch-pos button{cursor:pointer}.touch-pos button:disabled{cursor:not-allowed}.touch-pos button:focus-visible,.touch-pos input:focus-visible,.touch-pos select:focus-visible,.touch-dialog button:focus-visible,.touch-dialog input:focus-visible{outline:3px solid #2362aa;outline-offset:2px}
.touch-status{position:sticky;top:6px;z-index:4;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;padding:9px 12px;background:var(--ink);color:white;border-radius:12px;margin:10px 0;box-shadow:0 7px 20px rgba(23,38,31,.13)}.touch-status strong{display:block;font-size:17px}.touch-status small{color:#d7e0da;font-size:10px}.touch-status button{background:white;border:0;border-radius:9px;padding:7px 12px;font-size:12px;font-weight:900;color:var(--ink)}
.touch-tools{display:grid;grid-template-columns:minmax(220px,1fr) minmax(170px,.38fr);gap:9px;margin:11px 0}.touch-tools label{font-size:12px;font-weight:850}.touch-tools input,.touch-tools select{margin-top:4px;width:100%;padding:9px 11px;border:1px solid var(--line);border-radius:10px;background:white;color:var(--ink);font-size:14px}
.touch-layout{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(290px,.72fr);gap:14px;align-items:start}.touch-catalog{min-width:0}.touch-section-head{display:flex;justify-content:space-between;align-items:end;gap:9px;margin:12px 0 7px}.touch-section-head h3{font-size:17px;font-weight:950;margin:0}.touch-section-head p{color:var(--muted);font-size:11px;margin:0}
.touch-products{display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:7px}.touch-product{position:relative;text-align:right;min-height:76px;padding:10px;border:1px solid var(--line);border-radius:11px;background:white;color:var(--ink);font-size:14px;font-weight:900;overflow-wrap:anywhere;transition:transform .14s ease,border-color .14s ease,box-shadow .14s ease}.touch-product:hover{border-color:#c18a2c;box-shadow:0 6px 14px rgba(30,41,34,.07);transform:translateY(-1px)}.touch-product span{display:block;margin-top:6px;color:var(--accent-dark);font-size:12px}
.touch-extras{margin-top:15px;padding:11px;border:1px solid #e8d5af;border-radius:13px;background:#fffaf0}.touch-extra-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:7px}.touch-extra{border:1px solid #dfd4bf;border-radius:11px;background:white;padding:9px}.touch-extra.is-selected{border-color:var(--accent);background:#fff6e6;box-shadow:0 0 0 2px rgba(217,151,37,.10)}.touch-extra-title{display:flex;justify-content:space-between;gap:6px;min-height:34px;font-size:12px;font-weight:900}.touch-extra-title span:last-child{color:var(--accent-dark);white-space:nowrap}.touch-stepper{display:grid;grid-template-columns:38px 1fr 38px;gap:5px;align-items:center;margin-top:7px}.touch-stepper button{min-height:38px;border:1px solid #d9d2c5;border-radius:8px;background:white;font-size:18px;font-weight:900;color:var(--ink)}.touch-stepper output{text-align:center;font-size:16px;font-weight:950}.touch-extra-add{width:100%;margin-top:7px;border:1px solid #d4b473;border-radius:8px;background:#fff4dd;color:#6c4507;font-size:12px;font-weight:900}
.touch-basket{position:sticky;top:72px;background:var(--paper);border:1px solid var(--line);border-radius:13px;padding:12px;min-width:0;box-shadow:0 8px 22px rgba(30,41,34,.07)}.touch-basket h3{font-size:18px;font-weight:950;margin:0 0 2px}.touch-basket-sub{color:var(--muted);font-size:11px;margin:0 0 7px}.touch-empty{padding:16px 9px;text-align:center;background:var(--soft);border-radius:9px;color:var(--muted)}.touch-item{border-top:1px solid #ece9e1;padding:9px 0;overflow-wrap:anywhere}.touch-item:first-of-type{border-top:0}.touch-item-head{display:flex;justify-content:space-between;gap:8px;align-items:start}.touch-item-name{font-size:13px;font-weight:950}.touch-item-price{white-space:nowrap;font-size:12px;font-weight:900}.touch-item-meta{color:var(--muted);font-size:11px;margin-top:2px}.touch-item-actions{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}.touch-item-actions button{min-height:36px;padding:6px 9px;border:1px solid #ddd8cb;border-radius:8px;background:var(--soft);font-size:11px;font-weight:850;color:var(--ink)}.touch-item-actions .touch-remove{color:#9a2c21;background:#fff7f5}.touch-extra-row{display:flex;justify-content:space-between;gap:8px;align-items:center}.touch-extra-row .touch-stepper{grid-template-columns:34px 36px 34px;margin:0}.touch-extra-row .touch-stepper button{min-height:34px}.touch-total{display:flex;justify-content:space-between;gap:10px;font-size:17px;margin:10px -12px -12px;padding:12px;background:var(--ink);color:white;border-radius:0 0 12px 12px;font-weight:950}.touch-total small{display:block;color:#cbd7cf;font-size:10px;font-weight:600}
.touch-dialog{position:fixed;inset:0;margin:auto;width:min(390px,calc(100vw - 20px));max-height:calc(100dvh - 20px);overflow:auto;padding:18px;border:0;border-radius:17px;background:#fff;color:#17261f;box-shadow:0 30px 90px rgba(0,0,0,.35);box-sizing:border-box;z-index:100}.touch-dialog::backdrop{background:rgba(8,17,12,.68);backdrop-filter:blur(3px)}.touch-dialog-heading span{color:#8d5b09;font-size:11px;font-weight:900}.touch-dialog-heading h3{font-size:20px;font-weight:950;margin:3px 0 11px;overflow-wrap:anywhere}.touch-dialog label{font-size:12px;font-weight:800}.touch-dialog input{font-size:27px;text-align:center;min-height:54px;width:100%;box-sizing:border-box;margin-top:5px;border:2px solid #d8d3c8;border-radius:11px}.touch-dialog p{margin:7px 0;color:#68756d;font-size:12px}.touch-keys{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.touch-dialog button{min-height:46px;font-size:15px;touch-action:manipulation;border:1px solid #d9d4c9;border-radius:10px;background:#f7f5ef;color:#17261f;font-weight:900}.touch-dialog-actions{display:flex;gap:8px;margin-top:10px}.touch-dialog-actions button{flex:1}.touch-dialog-actions .touch-accent{background:#d99725;border-color:#d99725;color:#17261f}.touch-pos button{touch-action:manipulation}
@media(max-width:950px){.touch-layout{grid-template-columns:1fr}.touch-basket{position:static}.touch-products{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:650px){.touch-tools{grid-template-columns:1fr}.touch-products{grid-template-columns:repeat(2,minmax(0,1fr))}.touch-extra-grid{grid-template-columns:1fr 1fr}.touch-status strong{font-size:16px}.touch-section-head{align-items:start;flex-direction:column}.touch-extra-row{align-items:start;flex-direction:column}.touch-extra-row .touch-stepper{width:100%;grid-template-columns:40px 1fr 40px}}`}</style>
      <div className="touch-status">
        <div aria-live="polite">
          <strong>
            {itemCount} قطعة • {total} ج.م
          </strong>
          <small>الطلب يتحدث فورًا مع كل اختيار</small>
        </div>
        <button
          type="button"
          onClick={() => {
            basket.current?.scrollIntoView({ block: "center" });
            basket.current?.focus();
          }}
        >
          عرض ملخص الطلب
        </button>
      </div>

      <div className="touch-tools">
        <label>
          بحث سريع عن صنف
          <input
            type="search"
            placeholder="اكتب اسم الصنف…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label>
          القسم
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="all">كل الأقسام</option>
            {categories.map((categoryName) => (
              <option key={categoryName} value={categoryName}>
                {categoryNames[categoryName] ?? categoryName}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="touch-layout">
        <div className="touch-catalog">
          <div className="touch-section-head">
            <div>
              <h3>الأصناف</h3>
              <p>اضغط الصنف ثم اكتب كميته من لوحة الأرقام.</p>
            </div>
            <p>{shown.length} صنف ظاهر</p>
          </div>
          <div className="touch-products">
            {shown.map((product) => (
              <button
                className="touch-product"
                type="button"
                disabled={
                  disabled ||
                  lines.filter((line) => line.menuItemId).length >= OWNER_LINES_MAX
                }
                key={product.id}
                onClick={() => setSelection({ id: product.id })}
              >
                {product.name}
                <span>{product.price} ج.م</span>
              </button>
            ))}
            {!shown.length && <p role="status">لا توجد أصناف مطابقة.</p>}
          </div>

          {addons.length > 0 && (
            <section className="touch-extras" aria-labelledby="global-extras-title">
              <div className="touch-section-head">
                <div>
                  <h3 id="global-extras-title">إضافات الطلب</h3>
                  <p>تظهر مرة واحدة فقط. اختَر الإضافة وحدد عددها حسب طلب العميل.</p>
                </div>
                <p>{extras.length} نوع مختار</p>
              </div>
              <div className="touch-extra-grid">
                {addons.map((addon) => {
                  const selectedExtra = extras.find(
                    (extra) => extra.menuItemId === addon.id,
                  );
                  return (
                    <article
                      className={`touch-extra${selectedExtra ? " is-selected" : ""}`}
                      key={addon.id}
                    >
                      <div className="touch-extra-title">
                        <span>{addon.name}</span>
                        <span>+{addon.price} ج.م</span>
                      </div>
                      {selectedExtra ? (
                        <div className="touch-stepper">
                          <button
                            type="button"
                            disabled={disabled}
                            aria-label={`تقليل ${addon.name}`}
                            onClick={() =>
                              setExtraQuantity(addon.id, selectedExtra.quantity - 1)
                            }
                          >
                            −
                          </button>
                          <output aria-label={`كمية ${addon.name}`}>
                            {selectedExtra.quantity}
                          </output>
                          <button
                            type="button"
                            disabled={
                              disabled || selectedExtra.quantity >= OWNER_LINE_MAX
                            }
                            aria-label={`زيادة ${addon.name}`}
                            onClick={() =>
                              setExtraQuantity(addon.id, selectedExtra.quantity + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="touch-extra-add"
                          disabled={disabled || extras.length >= 30}
                          onClick={() => setExtraQuantity(addon.id, 1)}
                        >
                          ＋ إضافة للطلب
                        </button>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <section
          ref={basket}
          tabIndex={-1}
          className="touch-basket"
          aria-label="ملخص الطلب"
        >
          <h3>ملخص الطلب</h3>
          <p className="touch-basket-sub">راجع الأصناف والإضافات قبل التسجيل</p>
          {!lines.some((line) => line.menuItemId) && extras.length === 0 && (
            <p className="touch-empty">الطلب فارغ — اختر صنفًا من القائمة للبدء.</p>
          )}

          {lines.map((line, index) => {
            const product = products.find(
              (candidate) => candidate.id === line.menuItemId,
            );
            if (!line.menuItemId) return null;
            const unit = product?.price ?? 0;
            return (
              <article className="touch-item" key={`${line.menuItemId}:${index}`}>
                <div className="touch-item-head">
                  <div>
                    <div className="touch-item-name">
                      {product?.name ?? "صنف غير متاح"}
                    </div>
                    <div className="touch-item-meta">
                      {line.quantity} × {unit} ج.م
                    </div>
                  </div>
                  <div className="touch-item-price">{unit * line.quantity} ج.م</div>
                </div>
                <div className="touch-item-actions">
                  <button
                    type="button"
                    disabled={disabled || !product}
                    onClick={() => setSelection({ id: line.menuItemId, index })}
                    aria-label={`تعديل كمية ${product?.name ?? "الصنف"}`}
                  >
                    تعديل الكمية ({line.quantity})
                  </button>
                  <button
                    type="button"
                    className="touch-remove"
                    disabled={disabled}
                    onClick={() =>
                      onChange(lines.filter((_, lineIndex) => lineIndex !== index))
                    }
                  >
                    حذف
                  </button>
                </div>
              </article>
            );
          })}

          {extras.length > 0 && (
            <div aria-label="الإضافات المختارة">
              <div className="touch-section-head">
                <h3>الإضافات</h3>
              </div>
              {extras.map((extra) => {
                const addon = addons.find(
                  (candidate) => candidate.id === extra.menuItemId,
                );
                if (!addon) return null;
                return (
                  <article
                    className="touch-item touch-extra-row"
                    key={extra.menuItemId}
                  >
                    <div>
                      <div className="touch-item-name">{addon.name}</div>
                      <div className="touch-item-meta">
                        {extra.quantity} × {addon.price} ج.م ={" "}
                        {extra.quantity * addon.price} ج.م
                      </div>
                    </div>
                    <div className="touch-stepper">
                      <button
                        type="button"
                        disabled={disabled}
                        aria-label={`تقليل ${addon.name}`}
                        onClick={() => setExtraQuantity(addon.id, extra.quantity - 1)}
                      >
                        −
                      </button>
                      <output>{extra.quantity}</output>
                      <button
                        type="button"
                        disabled={disabled || extra.quantity >= OWNER_LINE_MAX}
                        aria-label={`زيادة ${addon.name}`}
                        onClick={() => setExtraQuantity(addon.id, extra.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="touch-total" aria-live="polite">
            <div>
              الإجمالي
              <small>يشمل التوصيل عند اختياره</small>
            </div>
            <div>{total} ج.م</div>
          </div>
        </section>
      </div>

      {selected && selection && (
        <QuantityDialog
          key={`${selection.id}:${selection.index ?? "new"}`}
          name={selected.name}
          initial={
            selection.index === undefined
              ? ""
              : String(lines[selection.index]?.quantity ?? 1)
          }
          onConfirm={confirm}
          onClose={() => setSelection(null)}
        />
      )}
    </div>
  );
}
