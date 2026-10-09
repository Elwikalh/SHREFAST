"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/wasl-api";
type Offer = {
  ref: string;
  merchantName: string;
  pickupZone: string;
  destZone: string;
  feeEGP: number;
  createdAt: string;
  restaurantPriority: boolean;
};
export default function DispatchQueuePanel({
  accountId,
}: {
  accountId: string;
}) {
  const [state, setState] = useState<{
    orders: Offer[];
    enabled: boolean;
    error: boolean;
  }>({ orders: [], enabled: false, error: false });
  useEffect(() => {
    const c = new AbortController();
    let loading = false;
    const refresh = async () => {
      if (loading) return;
      loading = true;
      try {
        const r = await apiFetch("/api/wasl/dispatch-queue", {
          signal: c.signal,
        });
        if (!r.ok) throw Error();
        const v = await r.json();
        if (!v.ok || !Array.isArray(v.orders)) throw Error();
        if (!c.signal.aborted)
          setState({
            orders: v.orders,
            enabled: !!v.priorityEnabled,
            error: false,
          });
      } catch {
        if (!c.signal.aborted)
          setState({ orders: [], enabled: false, error: true });
      } finally {
        loading = false;
      }
    };
    void refresh();
    const t = setInterval(() => void refresh(), 15000);
    return () => {
      clearInterval(t);
      c.abort();
    };
  }, [accountId]);
  return (
    <section className="portal-review-notice">
      <details>
        <summary>
          طابور المنتظر للإسناد{" "}
          {state.error ? "— تعذر تحديثه" : `(${state.orders.length})`}
        </summary>
        <p>
          ترتيب المنتظر فقط:{" "}
          {state.enabled
            ? "الحبوب وفروعه الموثقة أولًا، ثم الأقدم"
            : "الأقدم أولًا؛ سياسة أولوية الحبوب غير مفعلة"}
          . لا يحجز مندوبًا ولا يغير رحلة مقبولة. لا تدخل بيانات العميل أو
          التحصيل في هذه القائمة.
        </p>
        {state.error ? (
          <p role="alert">
            أوقفنا عرض القائمة القديمة؛ راجع الاتصال. لوحة الطلبات الأساسية لم
            تتغير.
          </p>
        ) : state.orders.length ? (
          <ol>
            {state.orders.map((o) => (
              <li key={o.ref}>
                <b>
                  {o.ref} — {o.merchantName}
                </b>{" "}
                {o.restaurantPriority ? "• أولوية الحبوب" : ""}
                <p>
                  {o.pickupZone} ← {o.destZone} — رسوم التوصيل {o.feeEGP} ج.م
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p>لا توجد طلبات غير مسندة ضمن صلاحيات حسابك.</p>
        )}
      </details>
    </section>
  );
}
