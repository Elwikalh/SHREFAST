"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/wasl-api";
import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { ArrowLeft, Bike, Building2, Check, Download, Monitor, PlusSquare, Share, ShieldCheck, Smartphone, Store } from "lucide-react";
import { Brand } from "./brand";
import { useInstall } from "./install-provider";
import styles from "./site.module.css";
const roles = [
 { id: "courier", label: "مندوب", icon: Bike },
 { id: "merchant", label: "مطعم أو نشاط", icon: Store },
 { id: "company", label: "شركة توصيل", icon: Building2 },
] as const;
const subscribePlatform = () => () => {};
const serverPlatform = () => "detecting" as const;
function getPlatform() {
 const ua = navigator.userAgent;
 const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
 if (ios) return /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/.test(ua) ? "ios-safari" : "ios-other";
 return /Android/.test(ua) ? "android" : "desktop";
}
export default function InstallApp({ initialRole = "courier", autoOpen = false }: { initialRole?: "courier" | "merchant" | "company"; autoOpen?: boolean }) {
 const [role, setRole] = useState(initialRole);
 const { installed, available, installing, install } = useInstall();
 const [signedIn, setSignedIn] = useState(false);
 const platform = useSyncExternalStore(subscribePlatform, getPlatform, serverPlatform);
 const device = platform.startsWith("ios-") ? "ios" : platform;
 const safari = platform === "ios-safari";
 const [showHelp, setShowHelp] = useState(false);
 const helpRef = useRef<HTMLDivElement>(null);
 const router = useRouter();
 useEffect(() => {
  const controller = new AbortController();
  apiFetch("/api/wasl/auth/me", { signal: controller.signal, cache: "no-store" }).then(async response => {
   if (!response.ok) return;
   const data = await response.json();
   if (!data.user) return;
   setSignedIn(true);
   if (["merchant", "company", "courier"].includes(data.user.role)) setRole(data.user.role);
   if (autoOpen) router.replace("/wasl");
  }).catch(() => {});
  return () => controller.abort();
 }, [autoOpen, router]);
 useEffect(() => { if (showHelp) helpRef.current?.focus(); }, [showHelp]);
 async function handleInstall() {
  if (available) { setShowHelp(false); await install(); }
  else setShowHelp(true);
 }
 const deviceLabel = device === "ios" ? "آيفون وآيباد" : device === "android" ? "Android" : device === "desktop" ? "الكمبيوتر" : "جهازك";
 return <div className={styles.site}>
  <header className={styles.authHeader}><Brand /><Link href="/">العودة للموقع <ArrowLeft size={16} /></Link></header>
  <main className={`${styles.installPage} ${styles.installCompact}`}>
   <section className={styles.installSurface} aria-labelledby="install-heading">
    <div className={styles.installPhoto}><Image src="/media/delivery-scene.svg" alt="مشهد توضيحي لاستلام طلب توصيل" fill unoptimized sizes="(max-width: 640px) 100vw, 580px" /><span>شغلك. أينما كنت.</span></div>
    <div className={styles.installDevice}>{device === "desktop" ? <Monitor size={20} /> : <Smartphone size={20} />}<span>SHARE FAST على {deviceLabel}</span></div>
    <h1 id="install-heading">ثبّت التطبيق.<br /><span>وخلي شغلك معك.</span></h1>
    <p className={styles.installLead}>افتح حسابك من أيقونة على جهازك، بنفس رقم الموبايل ونفس البيانات. بدون متجر.</p>
    <div className={styles.installActions}>
     {installed ? <p role="status" className={styles.installSuccess}><Check size={20} /> التطبيق جاهز على جهازك</p> : <button type="button" className={styles.primary} disabled={installing || device === "detecting"} onClick={handleInstall} aria-expanded={showHelp} aria-controls={showHelp ? "install-quick-help" : undefined}><Download size={20} />{installing ? "جارٍ فتح التثبيت…" : "تثبيت التطبيق"}</button>}
    </div>
    {!installed && <p className={styles.installFootnote}>{device === "ios" ? "على iPhone، نعرض لك الخطوتين اللازمتين للإضافة بعد الضغط." : "يفتح الزر نافذة التثبيت إذا كان متصفحك يدعمها."}</p>}
    {showHelp && !installed && <div id="install-quick-help" className={styles.installQuickHelp} tabIndex={-1} ref={helpRef}>
     <h2>{device === "ios" ? "أضفه إلى الشاشة الرئيسية" : "أكمل التثبيت من المتصفح"}</h2>
     {device === "ios" ? <>
      <p>{safari ? "Safari يحتاج تأكيد الإضافة من قائمة المشاركة." : "افتح هذه الصفحة في Safari، ثم أكمل الخطوتين التاليتين."}</p>
      <ol className={styles.installSteps}><li><Share size={20} /><span>اضغط زر <b>المشاركة</b> في المتصفح.</span></li><li><PlusSquare size={20} /><span>اختر <b>إضافة إلى الشاشة الرئيسية</b>، ثم <b>إضافة</b>.</span></li></ol>
     </> : <>
      <p>{device === "android" ? "استخدم Chrome على الموبايل. إذا لم تظهر نافذة التثبيت، استخدم قائمة المتصفح." : "استخدم Chrome أو Edge. إذا لم تظهر نافذة التثبيت، استخدم قائمة المتصفح."}</p>
      <ol className={styles.installSteps}><li><Download size={20} /><span>من قائمة المتصفح، اختر <b>تثبيت SHARE FAST</b>{device === "android" ? " أو إضافة إلى الشاشة الرئيسية" : " أو تثبيت هذه الصفحة كتطبيق"}.</span></li><li><Check size={20} /><span>أكد التثبيت، ثم افتح أيقونة <b>SHARE FAST</b> على جهازك.</span></li></ol>
     </>}
     <p>لو التثبيت غير متاح، يمكنك استخدام حسابك من المتصفح الآن.</p>
    </div>}
    <div className={styles.installAccount}>
     {!signedIn && <><h2>اختر نوع حسابك</h2><div className={styles.installAccountRoles} aria-label="نوع الحساب">
      {roles.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-pressed={role === id} onClick={() => setRole(id)} className={role === id ? styles.installSelected : undefined}><Icon size={20} /><span>{label}</span></button>)}
     </div></>}
     <p className={styles.fieldNote}>{role === "courier" ? "المندوب يبدأ من تطبيق الموبايل: أنشئ حسابك وتابع طلباتك." : "تطبيق المطعم وشركة التوصيل متاح للموبايل والكمبيوتر. نفس الحساب ونفس البيانات."}</p>
     <div className={styles.installActions}>
      {signedIn ? <Link className={styles.secondary} href="/wasl">فتح لوحة التحكم<ArrowLeft size={18} /></Link> : <Link className={styles.secondary} href={`/register?role=${role}&app=1`}>{role === "courier" ? "إنشاء حساب المندوب" : "إنشاء حساب جديد"}<ArrowLeft size={18} /></Link>}
      {!signedIn && <Link className={styles.installLogin} href={`/login?role=${role}`}>لديك حساب؟ تسجيل الدخول</Link>}
     </div>
    </div>
    <div className={styles.installSecurity}><ShieldCheck size={20} /><p>بياناتك محفوظة على المنصة. التثبيت لا ينشئ حسابًا جديدًا، ومتابعة الطلبات تحتاج اتصالًا بالإنترنت.</p></div>
   </section>
  </main>
 </div>;
}
