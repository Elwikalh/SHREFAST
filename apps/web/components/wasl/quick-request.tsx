"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, Bike, Check, CircleCheck, LoaderCircle, MapPin, ShieldCheck, Store } from "lucide-react";
import { Brand } from "../site/brand";
import { apiFetch } from "@/lib/wasl-api";
import type { Principal } from "@/lib/wasl-auth";
import { normalizeEgyptPhone } from "@/lib/wasl-auth-schema";
import styles from "../site/site.module.css";
type Quote = { zone: string; km: number; feeMin: number; feeMax: number; fee: number };
type SavedOrder = { id: string | number; fee: number };
export default function QuickRequest({ principal }: { principal: Principal }) {
 const [phone, setPhone] = useState(""), [zone, setZone] = useState(""), [address, setAddress] = useState("");
 const [readyMinutes, setReadyMinutes] = useState("0");
 const [quote, setQuote] = useState<Quote | null>(null), [quoteError, setQuoteError] = useState(""), [quoteRetry, retryQuote] = useState(0);
 const [error, setError] = useState(""), [errors, setErrors] = useState<Record<string, string>>({});
 const [busy, setBusy] = useState(false), [uncertain, setUncertain] = useState(false), [order, setOrder] = useState<SavedOrder | null>(null);
 const lock = useRef(false), statusRef = useRef<HTMLDivElement>(null);
 const destination = zone.trim();
 const pickupReady = principal.address.trim().length >= 2 && principal.zone.trim().length >= 2;
 const currentQuote = quote?.zone === destination ? quote : null;
 useEffect(() => {
  if (destination.length < 2 || destination.length > 100 || !pickupReady) return;
  const controller = new AbortController();
  const timer = setTimeout(() => {
   setQuoteError("");
   apiFetch(`/api/wasl/orders/quote?zone=${encodeURIComponent(destination)}`, { signal: controller.signal })
    .then(async response => {
     const data = await response.json();
     if (!response.ok || !data.ok || !data.quote) throw new Error(response.status === 401 ? "session" : "quote");
     if (!controller.signal.aborted) setQuote(data.quote);
    }).catch(error => { if (!controller.signal.aborted) { setQuote(null); setQuoteError(error.message === "session" ? "انتهت جلسة الدخول. سجّل الدخول مرة أخرى." : "تعذر تحميل الرسوم. حاول مرة أخرى قبل إرسال الطلب."); } });
  }, 350);
  return () => { clearTimeout(timer); controller.abort(); };
 }, [destination, pickupReady, quoteRetry]);
 useEffect(() => { if (order || error) statusRef.current?.focus(); }, [order, error]);
 async function submit(event: FormEvent) {
  event.preventDefault();
  if (lock.current || uncertain || order) return;
  const issues: Record<string, string> = {};
  const normalized = normalizeEgyptPhone(phone);
  if (!/^01[0125]\d{8}$/.test(normalized)) issues.phone = "أدخل رقم موبايل مصري صحيحًا للعميل";
  if (destination.length < 2) issues.zone = "أدخل منطقة التسليم";
  if (address.trim().length < 4) issues.address = "أدخل عنوان التسليم بالتفصيل";
  setErrors(issues);
  if (Object.keys(issues).length || !currentQuote || !pickupReady) return;
  lock.current = true; setBusy(true); setError("");
  try {
   const response = await apiFetch("/api/wasl/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ destZone: destination, toAddr: `${destination} — ${address.trim()}`, customerPhone: normalized, fee: currentQuote.fee, readyMinutes: Number(readyMinutes), pay: "كاش", kind: "طلب توصيل", source: "merchant-quick" }) });
   const data = await response.json();
   if (response.ok && data.ok && data.order) setOrder(data.order);
   else if (!response.ok) setError(response.status === 401 ? "انتهت جلسة الدخول. سجّل الدخول ثم حاول مرة أخرى." : "لم يؤكد الخادم تسجيل الطلب. راجع بياناتك واتصالك ثم حاول مرة أخرى.");
   else { setUncertain(true); setError("لم نستطع تأكيد نتيجة الإرسال. راجع طلباتك قبل إنشاء طلب آخر، لتجنب التكرار."); }
  } catch { setUncertain(true); setError("انقطع الاتصال أثناء الإرسال. قد يكون الطلب تسجّل بالفعل؛ راجع طلباتك قبل إعادة الإرسال."); }
  finally { lock.current = false; setBusy(false); }
 }
 return <div className={styles.site}>
  <header className={styles.authHeader}><Brand /><Link href="/wasl">لوحة حسابك <ArrowLeft size={16} /></Link></header>
  <main className={styles.quickPage}>
   <div className={styles.quickIntro}><span className={styles.eyebrow}><Bike size={20} /> طلب سريع للمطاعم والأنشطة</span><h1>اطلب مندوب</h1><p>عنوان نشاطك جاهز. أضف بيانات العميل، راجع الرسوم، وأكّد الطلب.</p></div>
   {order ? <section className={styles.quickSuccess} ref={statusRef} tabIndex={-1} role="status"><CircleCheck size={48} /><h2>طلبك اتسجّل على المنصة</h2><p>رقم الطلب: <b dir="ltr">{order.id}</b></p><p>رسوم التوصيل: <b>{order.fee} ج</b></p><p>الطلب بانتظار قبول مندوب. التوافر والتغطية يحددان إمكانية ووقت القبول.</p><Link href="/wasl#merchant?page=orders" className={styles.primary}>متابعة طلباتي <ArrowLeft size={18} /></Link><button className={styles.secondary} onClick={() => { setOrder(null); setPhone(""); setZone(""); setAddress(""); setQuote(null); setReadyMinutes("0"); }}>طلب جديد</button></section> : <div className={styles.quickGrid}>
    <form onSubmit={submit} className={styles.quickForm} noValidate>
     <div className={styles.quickPickup}><Store size={24} /><div><b>{principal.name}</b><p>{principal.address || "عنوان الاستلام غير مكتمل"} — {principal.zone}</p><small>{pickupReady ? "عنوان الاستلام محفوظ في حسابك" : "أكمل عنوان الاستلام من حسابك"}</small></div>{pickupReady && <Check size={20} />}</div>
     {!pickupReady && <p className={styles.errorText} role="alert">أكمل عنوان ومنطقة نشاطك من لوحة الحساب قبل طلب مندوب. <Link href="/wasl">فتح لوحة الحساب</Link></p>}
     {error && <div className={styles.errorBanner} role="alert" tabIndex={-1} ref={statusRef}>{error}{uncertain && <Link href="/wasl#merchant?page=orders">راجع طلباتي أولًا</Link>}</div>}
     <div className={styles.field}><label htmlFor="quick-phone">رقم موبايل العميل</label><input id="quick-phone" className={styles.input} disabled={busy || uncertain} type="tel" inputMode="tel" dir="ltr" autoComplete="off" maxLength={32} value={phone} onChange={e => { setPhone(e.target.value); setErrors(previous => ({ ...previous, phone: "" })); }} placeholder="01012345678" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "quick-phone-error" : undefined} required />{errors.phone && <span id="quick-phone-error" className={styles.errorText}>{errors.phone}</span>}</div>
     <div className={styles.field}><label htmlFor="quick-zone">منطقة التسليم</label><input id="quick-zone" className={styles.input} disabled={busy || uncertain} maxLength={100} autoComplete="off" value={zone} onChange={e => { setZone(e.target.value); setQuote(null); setQuoteError(""); setErrors(previous => ({ ...previous, zone: "" })); }} placeholder="مثال: المعادي" aria-invalid={!!errors.zone} aria-describedby={errors.zone ? "quick-zone-error" : undefined} required />{errors.zone && <span id="quick-zone-error" className={styles.errorText}>{errors.zone}</span>}</div>
     <div className={styles.field}><label htmlFor="quick-address">عنوان العميل بالتفصيل</label><input id="quick-address" className={styles.input} disabled={busy || uncertain} maxLength={390} autoComplete="off" value={address} onChange={e => { setAddress(e.target.value); setErrors(previous => ({ ...previous, address: "" })); }} placeholder="الشارع، رقم المبنى، الدور أو علامة مميزة" aria-invalid={!!errors.address} aria-describedby={errors.address ? "quick-address-error" : undefined} required />{errors.address && <span id="quick-address-error" className={styles.errorText}>{errors.address}</span>}</div>
     <details className={styles.quickOptions}><summary>الطلب مش جاهز دلوقتي؟</summary><div className={styles.field}><label htmlFor="quick-ready">وقت التحضير المتوقع</label><select id="quick-ready" className={styles.input} disabled={busy || uncertain} value={readyMinutes} onChange={e => setReadyMinutes(e.target.value)}>{[0,10,15,20,30].map(value => <option key={value} value={value}>{value === 0 ? "جاهز الآن" : `${value} دقيقة`}</option>)}</select></div></details>
     <button type="submit" className={styles.primary} disabled={busy || uncertain || !currentQuote || !pickupReady}>{busy ? <><LoaderCircle className={styles.loadingIcon} size={20} /> جارٍ تسجيل الطلب…</> : <><Bike size={20} /> تأكيد طلب المندوب{currentQuote ? ` · ${currentQuote.fee} ج` : ""}</>}</button>
     <p className={styles.fieldNote}>لا يُرسل الطلب إلا بعد ضغط التأكيد. لا يعني التسجيل تأكيد قبول مندوب.</p>
    </form>
    <aside className={styles.quickSummary} aria-labelledby="quick-summary-title"><span className={styles.eyebrow}><MapPin size={20} /> تفاصيل واضحة قبل الإرسال</span><h2 id="quick-summary-title">من نشاطك،<br />إلى عميلك.</h2><div className={styles.quickSummaryRow}><span>الاستلام</span><b>{principal.zone}</b></div><div className={styles.quickSummaryRow}><span>التسليم</span><b>{destination || "أضف منطقة العميل"}</b></div><div className={styles.quickQuote} aria-live="polite">{currentQuote ? <><small>رسوم التوصيل لهذا الطلب</small><strong>{currentQuote.fee} <span>ج</span></strong><p>نطاق التسعير: {currentQuote.feeMin}–{currentQuote.feeMax} ج. تقدير حسب المنطقة، وليس قياسًا مباشرًا للطريق.</p></> : quoteError ? <><p>{quoteError}</p><button type="button" className={styles.secondary} onClick={() => retryQuote(value => value + 1)}>إعادة تحميل الرسوم</button><Link href="/login?role=merchant&intent=request">تسجيل الدخول</Link></> : <p>{!pickupReady ? "تظهر الرسوم بعد استكمال عنوان الاستلام في حسابك." : destination.length >= 2 ? "جارٍ تحميل الرسوم…" : "أضف منطقة التسليم لعرض الرسوم قبل التأكيد."}</p>}</div><p className={styles.quickSafety}><ShieldCheck size={20} /> الطلب محفوظ على المنصة عند نجاح الإرسال، ويمكن متابعته من لوحة حسابك.</p></aside>
   </div>}
  </main>
 </div>;
}
