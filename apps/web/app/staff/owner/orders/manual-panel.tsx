"use client";

import { useEffect, useRef, useState } from "react";
import { createOwnerOrder, type Catalog, type ManualInput } from "./manual";
import { TouchBasket } from "./touch-basket";

function ReviewDialog({
  order,
  catalog,
  branches,
  total,
  busy,
  onBack,
  onConfirm,
}: {
  order: ManualInput;
  catalog: Catalog;
  branches: { code: string; name: string; active: boolean }[];
  total: number;
  busy: boolean;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const products = catalog.products.filter((product) => product.category !== "addon");
  const addons = catalog.products.filter((product) => product.category === "addon");

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const element = dialog.current!;
    element.showModal();
    return () => {
      element.close();
      if (previous?.isConnected) previous.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      className="owner-review"
      aria-labelledby="owner-review-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onBack();
      }}
    >
      <style>{`
.owner-review{position:fixed;inset:0;margin:auto;width:min(760px,calc(100vw - 24px));max-height:calc(100dvh - 24px);overflow:auto;border:0;border-radius:22px;padding:0;background:#f8f6f0;color:#17261f;box-shadow:0 35px 110px rgba(0,0,0,.38);z-index:120}.owner-review::backdrop{background:rgba(8,17,12,.72);backdrop-filter:blur(4px)}.owner-review *{box-sizing:border-box}.review-head{background:#17261f;color:white;padding:22px 24px}.review-head span{color:#f5bd58;font-size:13px;font-weight:900}.review-head h2{font-size:27px;font-weight:950;margin:4px 0}.review-head p{margin:0;color:#ced8d1}.review-body{padding:20px 24px}.review-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.review-box{background:white;border:1px solid #e1ddd3;border-radius:15px;padding:15px}.review-box h3{font-size:16px;margin:0 0 10px}.review-box p{margin:5px 0;color:#5f6d64}.review-list{list-style:none;margin:0;padding:0}.review-list li{display:flex;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid #ece9e1}.review-list li:last-child{border-bottom:0}.review-item-name{font-weight:900}.review-item-meta{display:block;color:#6a756e;font-size:13px;margin-top:3px}.review-item-price{font-weight:900;white-space:nowrap}.review-total{display:flex;justify-content:space-between;align-items:center;gap:15px;margin-top:14px;padding:18px;background:#fff1d5;border:1px solid #e8c982;border-radius:15px;font-size:24px;font-weight:950}.review-warning{margin-top:12px;color:#6a5124;font-size:13px}.review-actions{position:sticky;bottom:0;display:flex;gap:10px;padding:16px 24px;background:rgba(248,246,240,.96);border-top:1px solid #dedbd2;backdrop-filter:blur(8px)}.review-actions button{flex:1;min-height:54px;border:1px solid #d8d2c6;border-radius:13px;background:white;color:#17261f;font-size:16px;font-weight:950}.review-actions .review-confirm{background:#d99725;border-color:#d99725}.review-actions button:focus-visible{outline:3px solid #2362aa;outline-offset:3px}@media(max-width:620px){.review-grid{grid-template-columns:1fr}.review-head,.review-body,.review-actions{padding-left:16px;padding-right:16px}.review-actions{flex-direction:column-reverse}.review-total{font-size:20px}}
`}</style>
      <header className="review-head">
        <span>المراجعة النهائية</span>
        <h2 id="owner-review-title">راجع الطلب قبل التسجيل</h2>
        <p>لن يُسجل أي شيء قبل الضغط على تأكيد الطلب.</p>
      </header>

      <div className="review-body">
        <div className="review-grid">
          <section className="review-box">
            <h3>بيانات التشغيل</h3>
            <p>
              <b>نقطة البيع:</b>{" "}
              {branches.find((branch) => branch.code === order.branchCode)?.name ??
                order.branchCode}
            </p>
            <p>
              <b>المصدر:</b>{" "}
              {order.source === "counter"
                ? "حضوري"
                : order.source === "phone"
                  ? "تليفون"
                  : "واتساب — يدوي"}
            </p>
            <p>
              <b>الاستلام:</b> {order.delivery ? "توصيل" : "من المحل"}
            </p>
            <p>
              <b>الدفع:</b>{" "}
              {order.method === "cash"
                ? "نقدي — لم يُحصل بعد"
                : "InstaPay — يحتاج مراجعة"}
            </p>
          </section>
          <section className="review-box">
            <h3>بيانات العميل</h3>
            <p>
              <b>الاسم:</b> {order.name.trim() || "عميل المحل"}
            </p>
            <p>
              <b>الهاتف:</b> {order.phone || "غير مطلوب"}
            </p>
            {order.delivery && (
              <p>
                <b>العنوان:</b> {order.address || "—"}
              </p>
            )}
            <p>
              <b>الملاحظات:</b> {order.note.trim() || "لا توجد"}
            </p>
          </section>
        </div>

        <section className="review-box" style={{ marginTop: 12 }}>
          <h3>الأصناف</h3>
          <ul className="review-list">
            {order.lines.map((line, index) => {
              const product = products.find(
                (candidate) => candidate.id === line.menuItemId,
              );
              const unit = product?.price ?? 0;
              return (
                <li key={`${line.menuItemId}:${index}`}>
                  <div>
                    <span className="review-item-name">
                      {product?.name ?? "صنف غير متاح"}
                    </span>
                    <span className="review-item-meta">
                      {line.quantity} × {unit} ج.م
                    </span>
                  </div>
                  <span className="review-item-price">{line.quantity * unit} ج.م</span>
                </li>
              );
            })}
          </ul>
        </section>

        {order.extras.length > 0 && (
          <section className="review-box" style={{ marginTop: 12 }}>
            <h3>إضافات الطلب</h3>
            <ul className="review-list">
              {order.extras.map((extra) => {
                const addon = addons.find(
                  (candidate) => candidate.id === extra.menuItemId,
                );
                const unit = addon?.price ?? 0;
                return (
                  <li key={extra.menuItemId}>
                    <div>
                      <span className="review-item-name">
                        {addon?.name ?? "إضافة غير متاحة"}
                      </span>
                      <span className="review-item-meta">
                        {extra.quantity} × {unit} ج.م
                      </span>
                    </div>
                    <span className="review-item-price">
                      {extra.quantity * unit} ج.م
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <div className="review-total">
          <span>الإجمالي النهائي</span>
          <span>{total} ج.م</span>
        </div>
        <p className="review-warning">
          تسجيل الطلب يضيفه لطابور التجهيز فقط، ولا يؤكد تحصيل النقدية أو وصول تحويل
          InstaPay تلقائيًا.
        </p>
      </div>

      <footer className="review-actions">
        <button type="button" disabled={busy} onClick={onBack}>
          رجوع للتعديل
        </button>
        <button
          type="button"
          className="review-confirm"
          disabled={busy}
          onClick={onConfirm}
        >
          {busy ? "جارٍ تسجيل الطلب…" : "تأكيد وتسجيل الطلب"}
        </button>
      </footer>
    </dialog>
  );
}

export function ManualPanel({
  catalog,
  branches,
  onSaved,
}: {
  catalog: Catalog;
  branches: { code: string; name: string; active: boolean }[];
  onSaved: () => void;
}) {
  const fresh = (): ManualInput => ({
    id: "",
    branchCode: branches.find((branch) => branch.active)?.code ?? "",
    source: "counter",
    delivery: false,
    zoneId: "",
    name: "",
    phone: "",
    address: "",
    note: "",
    method: "cash",
    reference: "",
    lines: [],
    extras: [],
  });
  const saving = useRef(false);
  const [touch, setTouch] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [form, setForm] = useState(fresh);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const products = catalog.products.filter(
    (product) => product.category !== "addon" && product.price > 0,
  );
  const addons = catalog.products.filter((product) => product.category === "addon");
  const itemsSubtotal = form.lines.reduce(
    (sum, line) =>
      sum +
      (catalog.products.find((product) => product.id === line.menuItemId)?.price ?? 0) *
        line.quantity,
    0,
  );
  const extrasSubtotal = form.extras.reduce(
    (sum, extra) =>
      sum +
      (addons.find((addon) => addon.id === extra.menuItemId)?.price ?? 0) *
        extra.quantity,
    0,
  );
  const deliveryFee = form.delivery
    ? (catalog.zones.find((zone) => zone.id === form.zoneId)?.fee ?? 0)
    : 0;
  const total = itemsSubtotal + extrasSubtotal + deliveryFee;

  function validate(): string | null {
    if (
      !form.lines.length ||
      form.lines.some(
        (line) =>
          !line.menuItemId ||
          !Number.isInteger(line.quantity) ||
          line.quantity < 1 ||
          line.quantity > 50,
      ) ||
      form.lines.length > 60
    )
      return "اختر صنفًا واحدًا على الأقل، وأدخل كمية صحيحة من 1 إلى 50.";
    if (
      form.extras.length > 30 ||
      form.extras.some(
        (extra) =>
          !extra.menuItemId ||
          !Number.isInteger(extra.quantity) ||
          extra.quantity < 1 ||
          extra.quantity > 50,
      )
    )
      return "راجع كميات الإضافات المختارة.";
    if (
      (form.source !== "counter" || form.delivery) &&
      (form.name.trim().length < 2 || !/^01[0125][0-9]{8}$/.test(form.phone))
    )
      return "أدخل اسم العميل ورقم هاتف مصري صحيح.";
    if (form.delivery && (!form.zoneId || form.address.trim().length < 10))
      return "اختر منطقة التوصيل واكتب العنوان كاملًا.";
    return null;
  }

  function startReview() {
    const error = validate();
    if (error) {
      setMessage(error);
      return;
    }
    setMessage("");
    setReviewing(true);
  }

  async function save() {
    if (saving.current) return;
    saving.current = true;
    const next = { ...form, id: form.id || crypto.randomUUID() };
    setForm(next);
    setBusy(true);
    try {
      const result = await createOwnerOrder(next);
      setMessage(
        result.message +
          (result.orderNumber ? ` رقم الطلب: ${result.orderNumber}` : ""),
      );
      if (result.ok) {
        setReviewing(false);
        setForm(fresh());
        onSaved();
      }
    } catch {
      setMessage(
        "تعذر الاتصال. أعد المحاولة بنفس الطلب، ولا تنشئ طلبًا ثانيًا قبل التحقق.",
      );
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }

  return (
    <section className="op-card owner-manual">
      <style>{`
.owner-manual{padding:14px!important}.owner-manual button,.owner-manual input,.owner-manual select{min-height:44px}.owner-manual input[type=checkbox]{min-height:20px;width:20px;height:20px}.owner-manual button:focus-visible{outline:3px solid #2362aa;outline-offset:2px}.owner-manual .op-help{font-size:12px}.owner-cashier-head{display:flex;justify-content:space-between;gap:10px;align-items:start;flex-wrap:wrap}.owner-cashier-head h2{margin:0 0 3px;font-size:19px}.owner-cashier-head p{max-width:720px;margin:0}.owner-review-button{width:min(100%,520px);min-height:48px!important;font-size:15px;margin-top:10px}@media(max-width:650px){.owner-manual{padding:11px!important}.owner-manual .op-line{grid-template-columns:minmax(0,1fr) 70px}.owner-manual .op-line>button{grid-column:1/-1}.owner-review-button{width:100%}}
`}</style>
      <div className="owner-cashier-head">
        <div>
          <h2>كاشير المالك</h2>
          <p className="op-help">
            اختَر الأصناف باللمس، ثم أضف احتياجات الطلب مرة واحدة وحدد كمية كل إضافة. كل
            شيء يظهر في ملخص واضح قبل التسجيل.
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          aria-pressed={touch}
          onClick={() => setTouch(!touch)}
        >
          {touch ? "استخدام النموذج التقليدي" : "العودة للكاشير باللمس"}
        </button>
      </div>

      <fieldset disabled={busy} style={{ border: 0, padding: 0 }}>
        <div className="op-form">
          <label>
            المصدر
            <select
              value={form.source}
              onChange={(event) =>
                setForm({
                  ...form,
                  source: event.target.value as ManualInput["source"],
                })
              }
            >
              <option value="phone">تليفون</option>
              <option value="whatsapp">واتساب — يدوي</option>
              <option value="counter">حضوري</option>
            </select>
          </label>
          <label>
            نقطة البيع
            <select
              value={form.branchCode}
              onChange={(event) => setForm({ ...form, branchCode: event.target.value })}
            >
              {branches
                .filter((branch) => branch.active)
                .map((branch) => (
                  <option key={branch.code} value={branch.code}>
                    {branch.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            العميل
            <input
              value={form.name}
              maxLength={80}
              placeholder="اختياري للطلب الحضوري"
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </label>
          <label>
            الهاتف
            <input
              dir="ltr"
              inputMode="tel"
              value={form.phone}
              maxLength={11}
              placeholder="01xxxxxxxxx"
              onChange={(event) =>
                setForm({
                  ...form,
                  phone: event.target.value.replace(/\D/g, ""),
                })
              }
            />
          </label>
          <label>
            الاستلام
            <select
              value={form.delivery ? "delivery" : "pickup"}
              onChange={(event) =>
                setForm({
                  ...form,
                  delivery: event.target.value === "delivery",
                })
              }
            >
              <option value="pickup">استلام من المحل</option>
              <option value="delivery">توصيل</option>
            </select>
          </label>
          <label>
            الدفع
            <select
              value={form.method}
              onChange={(event) =>
                setForm({
                  ...form,
                  method: event.target.value as ManualInput["method"],
                })
              }
            >
              <option value="cash">نقدي — لم يُحصل بعد</option>
              <option value="instapay">InstaPay — يحتاج مراجعة</option>
            </select>
          </label>
          {form.delivery && (
            <>
              <label>
                المنطقة
                <select
                  value={form.zoneId}
                  onChange={(event) => setForm({ ...form, zoneId: event.target.value })}
                >
                  <option value="">اختر المنطقة</option>
                  {catalog.zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} — {zone.fee} ج.م
                    </option>
                  ))}
                </select>
              </label>
              <label>
                العنوان التفصيلي
                <input
                  value={form.address}
                  maxLength={300}
                  onChange={(event) =>
                    setForm({ ...form, address: event.target.value })
                  }
                />
              </label>
            </>
          )}
        </div>

        {touch ? (
          <TouchBasket
            catalog={catalog}
            lines={form.lines}
            extras={form.extras}
            onChange={(lines) => setForm((current) => ({ ...current, lines }))}
            onExtrasChange={(extras) => setForm((current) => ({ ...current, extras }))}
            disabled={busy}
            total={total}
          />
        ) : (
          <>
            {form.lines.map((line, index) => (
              <div className="op-line" key={index}>
                <select
                  aria-label="الصنف"
                  value={line.menuItemId}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      lines: form.lines.map((current, lineIndex) =>
                        lineIndex === index
                          ? { ...current, menuItemId: event.target.value }
                          : current,
                      ),
                    })
                  }
                >
                  <option value="">اختر الصنف</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} — {product.price} ج.م
                    </option>
                  ))}
                </select>
                <input
                  aria-label="الكمية"
                  type="number"
                  min={1}
                  max={50}
                  value={line.quantity}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      lines: form.lines.map((current, lineIndex) =>
                        lineIndex === index
                          ? { ...current, quantity: Number(event.target.value) }
                          : current,
                      ),
                    })
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      lines: form.lines.filter((_, lineIndex) => lineIndex !== index),
                    })
                  }
                >
                  حذف
                </button>
              </div>
            ))}
            <button
              type="button"
              disabled={form.lines.length >= 60}
              onClick={() =>
                setForm({
                  ...form,
                  lines: [
                    ...form.lines,
                    {
                      menuItemId: "",
                      quantity: 1,
                      addonMenuItemIds: [],
                    },
                  ],
                })
              }
            >
              ＋ صنف
            </button>
            {addons.length > 0 && (
              <p className="op-help">
                لإضافة المخلل والسلطة وباقي الإضافات بالكميات، استخدم وضع الكاشير
                باللمس.
              </p>
            )}
          </>
        )}

        <div className="op-form">
          <label>
            ملاحظات الطلب
            <input
              value={form.note}
              maxLength={160}
              placeholder="مثال: تجهيز سريع أو تغليف منفصل"
              onChange={(event) => setForm({ ...form, note: event.target.value })}
            />
          </label>
          {form.method === "instapay" && (
            <label>
              مرجع التحويل إن كان متاحًا
              <input
                value={form.reference}
                maxLength={60}
                onChange={(event) =>
                  setForm({ ...form, reference: event.target.value })
                }
              />
            </label>
          )}
        </div>

        <button
          type="button"
          className="op-primary owner-review-button"
          onClick={startReview}
          disabled={busy || !form.lines.length}
        >
          مراجعة الطلب • {total} ج.م
        </button>
      </fieldset>

      {message && (
        <p role="status" className="op-notice">
          {message}
        </p>
      )}

      {reviewing && (
        <ReviewDialog
          order={form}
          catalog={catalog}
          branches={branches}
          total={total}
          busy={busy}
          onBack={() => setReviewing(false)}
          onConfirm={() => void save()}
        />
      )}
    </section>
  );
}
