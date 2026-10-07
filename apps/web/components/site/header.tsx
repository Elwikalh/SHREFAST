"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Menu, X } from "lucide-react";
import { Brand } from "./brand";
import styles from "./site.module.css";
const links = [
 { href: "#solutions", label: "خدماتنا" },
 { href: "#how", label: "خطوات التسجيل" },
 { href: "#faq", label: "المساعدة" },
];
export default function SiteHeader() {
 const [open, setOpen] = useState(false);
 const toggleRef = useRef<HTMLButtonElement>(null);
 useEffect(() => {
  if (!open) return;
  const close = (event: KeyboardEvent) => {
   if (event.key === "Escape") { setOpen(false); toggleRef.current?.focus(); }
  };
  document.addEventListener("keydown", close);
  return () => document.removeEventListener("keydown", close);
 }, [open]);
 return <header className={styles.header}>
  <div className={styles.headerInner}>
   <Brand />
   <button ref={toggleRef} type="button" className={styles.menuToggle} aria-expanded={open} aria-controls="site-navigation" aria-label={open ? "إغلاق القائمة" : "فتح القائمة"} onClick={() => setOpen(!open)}>
    {open ? <X size={22} /> : <Menu size={22} />}<span>القائمة</span>
   </button>
   <nav id="site-navigation" className={`${styles.nav} ${open ? styles.navOpen : ""}`} aria-label="القائمة الرئيسية">
    {links.map(link => <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}<ArrowLeft size={16} /></a>)}
   </nav>
   <div className={styles.headerActions}>
    <Link href="/login" className={styles.headerLogin}>تسجيل الدخول</Link>
    <Link href="/register" className={styles.smallPrimary}>حساب جديد <ArrowLeft size={17} /></Link>
   </div>
  </div>
 </header>;
}
