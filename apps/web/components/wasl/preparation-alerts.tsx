"use client";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/wasl-api";
type Entry = { ref: string; eventId: string | null; readyAt: string | null; preparation: { estimatedAt: string; estimatedReadyAt: string | null; needsReview?:boolean } | null };
export default function PreparationAlerts({ accountId }: { accountId: string }) {
  const [orders, setOrders] = useState<Entry[]>([]), [failed,setFailed]=useState(false), [permission,setPermission]=useState<NotificationPermission | "unsupported">("unsupported");
  const [now,setNow]=useState<number | null>(null);
  const seen = useRef(new Set<string>());
  useEffect(() => {
    const tick=()=>setNow(Date.now());const initial=setTimeout(tick,0);const timer=setInterval(tick,30000);return ()=>{clearTimeout(initial);clearInterval(timer);};
  },[]);
  useEffect(() => {
    let stopped=false,busy=false;const controller=new AbortController();
    const key="sharefast-ready-seen:"+accountId;
    try { const ids=JSON.parse(localStorage.getItem(key)||"[]");seen.current=new Set(Array.isArray(ids)?ids.filter(x=>typeof x==="string"):[]); } catch {seen.current=new Set();}
    const permissionTimer=setTimeout(()=>{if(!stopped && "Notification" in window)setPermission(Notification.permission);},0);
    async function poll() {
      if(busy || stopped)return;busy=true;
      try {
        const response=await apiFetch("/api/wasl/preparation",{signal:controller.signal,cache:"no-store"});
        if(!response.ok)throw new Error("unavailable");
        const data=await response.json();if(!data.ok || !Array.isArray(data.orders))throw new Error("unavailable");
        if(stopped)return;
        const entries=data.orders as Entry[];setOrders(entries);setFailed(false);
        for(const entry of entries) {
          if(!entry.eventId || !entry.readyAt || seen.current.has(entry.eventId))continue;
          // Only an actual persisted kitchen-ready event triggers an alert, never ETA expiry.
          if("Notification" in window && Notification.permission==="granted") {
            try {
              const registration = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
              if(registration)await registration.showNotification("الطلب جاهز للاستلام",{body:"راجع طلباتك في شير فاست",tag:"sharefast-ready-"+entry.eventId});
              else new Notification("الطلب جاهز للاستلام",{body:"راجع طلباتك في شير فاست",tag:"sharefast-ready-"+entry.eventId});
            } catch { /* In-app readiness remains available when OS notifications fail. */ }
          }
          seen.current.add(entry.eventId);
        }
        try {localStorage.setItem(key,JSON.stringify([...seen.current].slice(-200)));}catch{}
      }catch {if(!stopped){setFailed(true);setOrders([]);}}finally{busy=false;}
    }
    void poll();const timer=setInterval(poll,15000);
    const refresh=()=>{if(!document.hidden)void poll();};document.addEventListener("visibilitychange",refresh);
    return()=>{stopped=true;controller.abort();clearInterval(timer);clearTimeout(permissionTimer);document.removeEventListener("visibilitychange",refresh);};
  },[accountId]);
  async function enable() {
    if("Notification" in window)try {setPermission(await Notification.requestPermission());}catch {setPermission("denied");}
  }
  if(!orders.length && !failed)return null;
  return <section aria-label="جاهزية طلبات المطعم" className="portal-review-notice">
    <h2>تجهيز الطلبات</h2>
    {permission==="default" && <button type="button" onClick={enable}>تفعيل تنبيهات الجاهزية</button>}
    <p>وقت التجهيز تقديري. التنبيه يعتمد على إعلان المطبخ جاهزية الطلب. تنبيهات هذه النسخة تحتاج التطبيق مفتوحًا واتصالًا؛ إشعارات الخلفية لم تُفعّل بعد.</p>
    {failed && <p role="alert">تعذر تحديث الجاهزية؛ الحالة الحالية غير مؤكدة. ستتم إعادة المحاولة.</p>}
    <ul aria-live="polite">{orders.map(order=>{
      const remaining=order.preparation?.estimatedReadyAt && now !== null?Math.ceil((Date.parse(order.preparation.estimatedReadyAt)-now)/60000):null;
      return <li key={order.ref}><b>{order.ref}</b>: {order.readyAt ? "جاهز للاستلام" : remaining === null ? "جارٍ التجهيز — الوقت لم يُحدد" : remaining>0 ? `متبقي تقريبًا ${remaining} دقيقة` : "انتهى التقدير — ننتظر تأكيد المطبخ"}{!order.readyAt && order.preparation?.needsReview && <strong> · طلب كبير/تقدير يحتاج مراجعة؛ قد يتجاوز الوقت المبدئي؛ راجع المطبخ</strong>}</li>;
    })}</ul>
  </section>;
}
