"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/wasl-api";
type Policy = {
  subscriptionExempt: boolean;
  subscriptionRequired: boolean;
  effectiveMonthlyFeeEGP: number;
  deliveryFeesWaived: false;
  courierWagesWaived: false;
  paidStatus: "not_evaluated";
};
export default function OwnedPolicyBanner({
  accountId,
}: {
  accountId: string;
}) {
  const [state, setState] = useState<{ policy?: Policy; error?: boolean }>({});
  useEffect(() => {
    const c = new AbortController();
    setState({});
    apiFetch("/api/wasl/subscription-policy", { signal: c.signal })
      .then(async (r) => {
        if (!r.ok) throw Error();
        const v = await r.json();
        if (!v.ok || !v.policy) throw Error();
        if (!c.signal.aborted) setState({ policy: v.policy });
      })
      .catch(() => {
        if (!c.signal.aborted) setState({ error: true });
      });
    return () => c.abort();
  }, [accountId]);
  if (state.error)
    return (
      <p role="status">
        تعذر التحقق من سياسة الاشتراك الآن؛ لا تعتبر الرسوم صفرًا أو الاشتراك
        مدفوعًا.
      </p>
    );
  if (!state.policy) return null;
  const p = state.policy;
  return (
    <aside className="portal-review-notice">
      <b>
        {p.subscriptionExempt
          ? "حساب الحبوب: معفى من اشتراك شير"
          : p.subscriptionRequired
            ? `رسوم الاشتراك المقررة: ${p.effectiveMonthlyFeeEGP} ج.م شهريًا`
            : "الاشتراك غير مطلوب حاليًا حسب إعدادات المنصة"}
      </b>
      <p>
        الإعفاء يخص اشتراك التطبيق فقط؛ رسوم التوصيل وأجر المندوب لا يُلغيان.
        هذه سياسة رسوم، وليست فاتورة أو تأكيد دفع أو تجديد.
      </p>
    </aside>
  );
}
