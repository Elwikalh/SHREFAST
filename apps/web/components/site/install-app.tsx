"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/wasl-api";
import { useState, useEffect } from "react";
import { ArrowLeft, Bike, Building2, Check, Download, Monitor, ShieldCheck, Smartphone, Store } from "lucide-react";
import { Brand } from "./brand";
import { useInstall } from "./install-provider";
import styles from "./site.module.css";
const roles=[{id:"courier",label:"مندوب توصيل",hint:"ثبّت التطبيق على الموبايل، أنشئ حسابك وتابع الطلبات المسندة إليك.",icon:Bike}, {id:"merchant",label:"مطعم أو نشاط تجاري",hint:"لوحة طلباتك على الكمبيوتر أو الموبايل، بنفس بيانات الحساب.",icon:Store},{id:"company",label:"شركة توصيل",hint:"افتح لوحة الشركة من سطح المكتب، ونظّم العملاء والمناديب.",icon:Building2}] as const;
export default function InstallApp({initialRole="courier",autoOpen=false}:{initialRole?:"courier"|"merchant"|"company";autoOpen?:boolean}) {
 const [role,setRole]=useState(initialRole);const {installed,available,installing,install}=useInstall();
 const [signedIn,setSignedIn]=useState(false);const router=useRouter();
 useEffect(()=>{
  const controller=new AbortController();
  apiFetch("/api/wasl/auth/me",{signal:controller.signal,cache:"no-store"}).then(async response=>{
   if(!response.ok)return;const data=await response.json();if(!data.user)return;
   setSignedIn(true);
   if(["merchant","company","courier"].includes(data.user.role))setRole(data.user.role);
   if(autoOpen)router.replace("/wasl");
  }).catch(()=>{});
  return()=>controller.abort();
 },[autoOpen,router]);
 return <div className={styles.site}>
  <header className={styles.authHeader}><Brand/><Link href="/">العودة للموقع <ArrowLeft size={16}/></Link></header>
  <main className={styles.installPage}>
   <div className={styles.installIntro}><span className={styles.eyebrow}><Smartphone size={18}/> تطبيق SHARE FAST</span><h1>شغلك معك.<br/><span>على أي جهاز.</span></h1><p>ثبّت التطبيق من الموقع. ادخل برقم الموبايل وكلمة المرور، وتابع نفس حسابك من الموبايل أو سطح المكتب.</p></div>
   <div className={styles.installGrid}>
    <section className={styles.installSurface} aria-labelledby="app-role-title"><h2 id="app-role-title">اختر طريقة استخدامك</h2><div className={styles.installRoles}>
     {roles.map(({id,label,hint,icon:Icon})=><button key={id} type="button" aria-pressed={role===id} onClick={()=>setRole(id)} className={role===id?styles.installSelected:undefined}><Icon size={24}/><span><b>{label}</b><small>{hint}</small></span>{role===id&&<Check size={20}/>}</button>)}
    </div><div className={styles.installActions}>
     {installed?<p role="status" className={styles.installSuccess}><Check size={20}/> التطبيق جاهز على جهازك</p>:available?<button type="button" className={styles.primary} disabled={installing} onClick={install}><Download size={20}/>{installing?"جارٍ فتح التثبيت…":"تثبيت التطبيق"}</button>:<a className={styles.primary} href="#install-help"><Download size={20}/> طريقة تثبيت التطبيق</a>}
     {signedIn ? <Link className={styles.secondary} href="/wasl">فتح لوحة التحكم<ArrowLeft size={18}/></Link> : <Link className={styles.secondary} href={`/register?role=${role}&app=1`}>{role==="courier"?"إنشاء حساب المندوب":"إنشاء حساب جديد"}<ArrowLeft size={18}/></Link>}
     {!signedIn && <Link className={styles.installLogin} href={`/login?role=${role}`}>لديك حساب؟ تسجيل الدخول</Link>}
    </div><p className={styles.fieldNote}>إذا كان المتصفح لا يدعم التثبيت، يمكنك التسجيل والاستخدام من هنا. التثبيت لا ينشئ حسابًا جديدًا ولا يغيّر بياناتك.</p></section>
    <section className={styles.installHelp} id="install-help" aria-labelledby="install-title"><h2 id="install-title">تثبيت بسيط، بدون متجر</h2>
     <div><Smartphone size={24}/><h3>موبايل Android</h3><p>افتح الموقع في Chrome واضغط «تثبيت التطبيق». لو الزر لم يظهر، افتح قائمة المتصفح واختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».</p></div>
     <div><Smartphone size={24}/><h3>iPhone أو iPad</h3><p>افتح الموقع في Safari، اضغط زر المشاركة، ثم «إضافة إلى الشاشة الرئيسية». افتح أيقونة SHARE FAST للتسجيل والدخول.</p></div>
     <div><Monitor size={24}/><h3>الكمبيوتر وسطح المكتب</h3><p>افتح الموقع في Chrome أو Edge، واختر تثبيت التطبيق من شريط العنوان أو قائمة المتصفح. ستفتح لوحة حسابك في نافذة مستقلة.</p></div>
     <div className={styles.installSecurity}><ShieldCheck size={22}/><p>الحساب والطلبات تُحفظ في قاعدة بيانات المنصة، وليس في أيقونة التطبيق. مشاهدة الطلبات وتحديثها تحتاج اتصالًا بالإنترنت.</p></div>
    </section>
   </div>
  </main>
 </div>;
}
