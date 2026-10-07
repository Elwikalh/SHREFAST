import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Brand } from "@/components/site/brand";
import styles from "@/components/site/site.module.css";
export const metadata={title:"لا يوجد اتصال — SHARE FAST"};
export default function Offline(){return <div className={styles.site}><header className={styles.authHeader}><Brand/></header><main className={styles.offlinePage}><WifiOff size={40}/><h1>الاتصال بالإنترنت غير متاح</h1><p>بيانات حسابك محفوظة على المنصة. أعد الاتصال لفتح لوحة الحساب ومتابعة الطلبات. لن نعرض نسخة قديمة من طلباتك باعتبارها حديثة.</p><Link href="/app" className={styles.primary}>إعادة فتح التطبيق</Link></main></div>}
