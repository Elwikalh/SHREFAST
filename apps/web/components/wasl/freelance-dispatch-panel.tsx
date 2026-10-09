"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/wasl-api";
type Setting={enabled:boolean;revision:number};
type Offer={ref:string;merchantName:string;pickupZone:string;destinationZone:string;feeEGP:number;readyMinutes:number|null;readyAt:string|null;restaurantPriority:boolean};
const messages:Record<string,string>={
  courier_not_eligible:"حساب المندوب أو اشتراكه أو نطاقه لا يسمح بالعمل حاليًا.",
  courier_policy_unavailable:"تعذر التحقق من سياسة الاشتراك؛ لم نسمح بقبول جديد.",
  courier_busy:"عندك مهمة مسندة لم تنتهِ؛ لا يمكن قبول مهمة ثانية.",
  courier_offline:"استقبال عروض الشبكة متوقف؛ فعّله قبل القبول.",
  offer_unavailable:"الطلب اتغير أو قبله مندوب آخر؛ لم نحجزه لك.",
  settings_changed_reload:"الإعداد تغير من جلسة أخرى؛ أعد تحميله قبل التعديل.",
};
export default function FreelanceDispatchPanel({accountId,role}:{accountId:string;role:"merchant"|"courier"}) {
  const [setting,setSetting]=useState<Setting|null>(null),[offers,setOffers]=useState<Offer[]>([]),
    [busyCourier,setBusyCourier]=useState(false),[working,setWorking]=useState(false),
    [message,setMessage]=useState(""),[failed,setFailed]=useState(false),
    [pending,setPending]=useState<string|null>(null),[confirmed,setConfirmed]=useState<{ref:string;status:string}|null>(null);
  const pendingKey="sharefast-pending-claim:"+accountId;
  useEffect(()=>{
    const c=new AbortController();
    apiFetch("/api/wasl/freelance/settings",{signal:c.signal,cache:"no-store"})
      .then(async r=>{const j=await r.json();if(!r.ok || !j.ok)throw Error(messages[j.error]||"تعذر قراءة إعداد استقبال الطلبات.");
        if(!c.signal.aborted){setSetting(j.setting);try{setPending(sessionStorage.getItem(pendingKey));}catch{}}})
      .catch(e=>{if(!c.signal.aborted)setMessage(e.message);});
    return()=>c.abort();
  },[pendingKey]);
  useEffect(()=>{
    if(role!=="courier" || !setting?.enabled)return;
    const c=new AbortController();let loading=false;
    const refresh=async()=>{
      if(loading)return;loading=true;
      try{const r=await apiFetch("/api/wasl/freelance/offers",{signal:c.signal,cache:"no-store"});const j=await r.json();
        if(!r.ok || !j.ok)throw Error(messages[j.error]||"تعذر تحديث العروض؛ لا تعتمد على قائمة قديمة.");
        if(!c.signal.aborted){setOffers(j.offers);setBusyCourier(j.busy);setFailed(false);}}
      catch(e){if(!c.signal.aborted){setOffers([]);setFailed(true);setMessage(e instanceof Error?e.message:"تعذر التحديث.");}}
      finally{loading=false;}
    };
    void refresh();const timer=setInterval(()=>void refresh(),15000);
    const onVisible=()=>{if(!document.hidden)void refresh();};
    document.addEventListener("visibilitychange",onVisible);
    return()=>{c.abort();clearInterval(timer);document.removeEventListener("visibilitychange",onVisible);};
  },[role,setting?.enabled]);
  async function toggle() {
    if(!setting || working || pending)return;setWorking(true);setMessage("");
    try{const r=await apiFetch("/api/wasl/freelance/settings",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({enabled:!setting.enabled,expectedRevision:setting.revision})});const j=await r.json();
      if(!r.ok || !j.ok){if(r.status===409){const current=await apiFetch("/api/wasl/freelance/settings",{cache:"no-store"});const data=await current.json();if(current.ok && data.ok)setSetting(data.setting);}
        throw Error(messages[j.error]||"لم نتأكد من حفظ الإعداد؛ أعد تحميله قبل التغيير.");}
      setSetting(j.setting);setOffers([]);setMessage(j.setting.enabled?"تم تفعيل استقبال عروض الشبكة.":"تم إيقاف استقبال عروض الشبكة؛ المهام المقبولة لم تتغير.");
    }catch(e){setMessage(e instanceof Error?e.message:"تعذر حفظ الإعداد.");}finally{setWorking(false);}
  }
  async function claim(ref:string) {
    if(working || (pending && pending!==ref))return;
    setWorking(true);setPending(ref);setMessage("");
    try{sessionStorage.setItem(pendingKey,ref);}catch{}
    try{const r=await apiFetch("/api/wasl/freelance/claim",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({orderRef:ref})});
      const j=await r.json();
      if(!r.ok || !j.ok){if(r.status<500){setPending(null);try{sessionStorage.removeItem(pendingKey);}catch{}}
        throw Error(messages[j.error]||"لم نتأكد من القبول؛ أعد التحقق من نفس الطلب، وليس طلبًا آخر.");}
      setConfirmed(j.claim);setPending(null);setOffers([]);setBusyCourier(true);
      try{sessionStorage.removeItem(pendingKey);}catch{}
      setMessage("الطلب مسجل لك بحالته الحالية. تفاصيل العميل تظهر ضمن طلباتك بعد القبول فقط.");
    }catch(e){setMessage(e instanceof Error?e.message:"الرد غير مؤكد؛ أعد التحقق من نفس الطلب.");}finally{setWorking(false);}
  }
  const shown=setting?.enabled && !busyCourier && !failed?offers:[];
  return <section className="portal-review-notice" aria-label="عروض شبكة المناديب">
    <h2>{role==="merchant"?"إتاحة الطلبات لشبكة المندوبين":"عروض الطلبات المستقلة"}</h2>
    <p>{role==="merchant"?"تفعيل صريح لطلبات نشاطك غير المسندة لشركة أو مندوب فقط. لا يغير رحلة مقبولة. طلبات الحبوب القادمة من الربط الموقّع تطلب الشبكة تلقائيًا، ولا يوقفها هذا المفتاح."
      :"هذا المفتاح يخص استقبال عروض الشبكة فقط. النطاق هو المحافظة والمنطقة المسجلتان بحسابك، وليس تحديد موقع GPS. لا تُكشف بيانات العميل قبل القبول."}</p>
    <button type="button" onClick={()=>void toggle()} disabled={!setting || working || !!pending}>
      {setting?.enabled?"إيقاف عروض الشبكة":"تفعيل عروض الشبكة"}
    </button>
    {message && <p role="status">{message}</p>}
    {pending && <div><p>نتيجة قبول {pending} لم تُحسم. لا تقبل طلبًا آخر قبل التحقق.</p>
      <button type="button" disabled={working} onClick={()=>void claim(pending)}>إعادة التحقق من نفس الطلب</button></div>}
    {confirmed && <div><p>مرجع الطلب: {confirmed.ref} — الحالة المسجلة: {confirmed.status}</p>
      <button type="button" onClick={()=>window.location.reload()}>تحديث لوحة طلباتي وفتح التفاصيل</button></div>}
    {role==="courier" && setting?.enabled && <div>
      {busyCourier?<p>لديك مهمة قائمة؛ لا نعرض طلبًا جديدًا فوقها.</p>:!failed && !shown.length?<p>لا توجد عروض مؤهلة في نطاقك حاليًا. التحديث كل 15 ثانية أثناء فتح التطبيق.</p>:null}
      <ol>{shown.map(o=><li key={o.ref}><b>{o.merchantName} — {o.ref}</b>{o.restaurantPriority?" · أولوية الحبوب":""}
        <p>{o.pickupZone} ← {o.destinationZone} · رسوم التوصيل على الطلب {o.feeEGP} ج.م</p>
        <p>{o.readyAt?"المطبخ أعلن أن الطلب جاهز للاستلام":o.readyMinutes!==null?`مدة تجهيز تقديرية: ${o.readyMinutes} دقيقة؛ ليست إعلان جاهزية`:"الوقت لم يُحدد؛ ننتظر تأكيد المطبخ"}</p>
        <button type="button" disabled={working || !!pending} onClick={()=>void claim(o.ref)}>قبول هذا الطلب</button>
      </li>)}</ol>
      <p>العرض ليس حجزًا. القبول يؤكده الخادم فقط. الأولوية ترتيب انتظار، ولا تسحب مندوبًا من مهمة مقبولة. التحديث والتنبيهات هنا تحتاج التطبيق مفتوحًا؛ إشعارات الخلفية لم تُستكمل.</p>
    </div>}
  </section>;
}