"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/wasl-api";
type Branch = {
  merchant_ref: string;
  account_id: string;
  branch_code: string;
  enabled: boolean;
  revision: number;
};
const blank = {
  merchantRef: "",
  accountId: "",
  branchCode: "",
  enabled: true,
  expectedRevision: 0,
  confirmOwnership: false,
};
export default function OwnedRestaurantsPage() {
  const [data, setData] = useState<{
      enabled: boolean;
      root: { ref: string; accountId: string } | null;
      branches: Branch[];
    } | null>(null),
    [form, setForm] = useState(blank),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function load() {
    const r = await apiFetch("/api/wasl/admin/owned-restaurants");
    if (!r.ok)
      throw Error(
        r.status === 403
          ? "هذه الصفحة لأدمن المنصة فقط."
          : r.status === 401
            ? "سجل الدخول أولًا."
            : "تعذر التحقق من ربط الحساب الأساسي؛ لا نمنح إعفاءً بالتخمين.",
      );
    const v = await r.json();
    if (!v.ok) throw Error("تعذر التحقق.");
    setData(v);
  }
  useEffect(() => {
    let active = true;
    load().catch((e) => {
      if (active) setMessage(e.message);
    });
    return () => {
      active = false;
    };
  }, []);
  async function save(e: FormEvent) {
    e.preventDefault();
    if (busy || !data?.enabled) return;
    setBusy(true);
    setMessage("");
    try {
      const r = await apiFetch("/api/wasl/admin/owned-restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const v = await r.json();
      if (!r.ok || !v.ok) {
        if (v.error === "settings_changed_reload") {
          await load();
          throw Error(
            "تغير الربط في نافذة أخرى. راجع الإصدار الحالي قبل الحفظ.",
          );
        }
        throw Error(
          "لم يتم تأكيد الحفظ. تحقق من هوية الحساب/الفرع والتعارض؛ لا تنشئ حسابًا بديلًا بالتخمين.",
        );
      }
      setForm(blank);
      setMessage(
        "تم حفظ الربط وسياسة الاشتراك الموروثة؛ هذا لا يفعّل الربط التشغيلي أو عنوان الاستلام.",
      );
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "تعذر تأكيد الحفظ.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main dir="rtl" className="mx-auto max-w-4xl space-y-4 p-6">
      <h1 className="text-2xl font-black">
        الحبوب وفروعه — سياسة الاشتراك والأولوية
      </h1>
      <Link href="/wasl">العودة للوحة شير</Link>
      <p>
        الحساب الأساسي يثبت بإعداد السيرفر وهوية الحساب، لا الاسم أو الموبايل.
        الفروع على نفس الحساب ترث السياسة؛ الحسابات المنفصلة تحتاج توثيق ملكية
        من أدمن المنصة. الإعفاء لا يشمل التوصيل أو أجر المندوب.
      </p>
      {message && <p role="status">{message}</p>}
      {data && !data.enabled && (
        <p>
          السياسة غير مفعلة. لا نغير إعدادات السيرفر أو الحساب الأساسي من هذه
          الصفحة.
        </p>
      )}
      {data?.root && (
        <p>
          الحساب الأساسي: {data.root.ref} — {data.root.accountId}
        </p>
      )}
      <form onSubmit={(e) => void save(e)}>
        <fieldset disabled={busy || !data?.enabled} className="space-y-3">
          <label>
            مرجع حساب الفرع
            <input
              className="input"
              required
              value={form.merchantRef}
              disabled={form.expectedRevision > 0}
              onChange={(e) =>
                setForm({ ...form, merchantRef: e.target.value })
              }
            />
          </label>
          <label>
            معرّف حساب الفرع الموثق
            <input
              className="input"
              required
              value={form.accountId}
              disabled={form.expectedRevision > 0}
              onChange={(e) => setForm({ ...form, accountId: e.target.value })}
            />
          </label>
          <label>
            كود الفرع
            <input
              className="input"
              required
              maxLength={80}
              value={form.branchCode}
              disabled={form.expectedRevision > 0}
              onChange={(e) => setForm({ ...form, branchCode: e.target.value })}
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
            />{" "}
            تفعيل السياسة الموروثة لهذا الفرع
          </label>
          <label>
            <input
              type="checkbox"
              required
              checked={form.confirmOwnership}
              onChange={(e) =>
                setForm({ ...form, confirmOwnership: e.target.checked })
              }
            />{" "}
            راجعت إثبات الملكية: هذا الفرع يخص الحبوب، وليس حساب مطعم آخر.
          </label>
          <p>
            ربط حساب فعلي لا يثبت ملكية تجارية وحده؛ هذا إقرار الأدمن الموثق
            ويُحفظ في سجل مراجعة. لا توجد ترقية لصلاحيات الحساب.
          </p>
          <button className="btn btn-primary">
            {busy ? "جارٍ الحفظ…" : "حفظ الربط"}
          </button>
          <button type="button" onClick={() => setForm(blank)}>
            إلغاء التعديل
          </button>
        </fieldset>
      </form>
      <h2>الفروع الموثقة</h2>
      {data?.branches.map((b) => (
        <article key={b.merchant_ref} className="card p-4">
          <p>
            {b.branch_code} — {b.merchant_ref} —{" "}
            {b.enabled ? "السياسة مفعلة" : "السياسة معطلة"} — إصدار {b.revision}
          </p>
          <button
            disabled={busy}
            onClick={() =>
              setForm({
                merchantRef: b.merchant_ref,
                accountId: b.account_id,
                branchCode: b.branch_code,
                enabled: b.enabled,
                expectedRevision: b.revision,
                confirmOwnership: false,
              })
            }
          >
            مراجعة / تعديل التفعيل
          </button>
        </article>
      ))}
    </main>
  );
}
