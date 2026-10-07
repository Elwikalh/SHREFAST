import {eq} from 'drizzle-orm'
import {db,siteSettings} from '@el7bboB/db'
import Link from 'next/link'
import {ensureProvidedInstapay} from '@/lib/instapay-bootstrap'
import {InstapayQr} from '../../order/instapay-qr'
export const dynamic='force-dynamic'
export default async function InstapayPage(){await ensureProvidedInstapay();const[settings]=await db.select().from(siteSettings).where(eq(siteSettings.id,'default'));return <main dir="rtl" className="mx-auto max-w-md px-4 py-8"><Link href="/">← الحَبّوب</Link><h1 className="mt-5 text-2xl font-black">الدفع عبر InstaPay</h1><p className="mt-3 text-sm">استخدم إجمالي الطلب أو الفاتورة المتفق عليه. هذه الصفحة لا تنشئ طلبًا ولا تؤكد التحويل تلقائيًا.</p><InstapayQr address={settings?.instapayAddress}/>{settings?.instapayAddress?<p dir="ltr" className="select-all text-center font-bold">{settings.instapayAddress}</p>:<p>الدفع عبر InstaPay غير مفعّل حاليًا.</p>}</main>}
