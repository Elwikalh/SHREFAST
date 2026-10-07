import { Suspense } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { BeanMark } from "../../logo"
import { LoginForm } from "./login-form"

export default function StaffLoginPage(){return <main dir="rtl" className="flex min-h-screen flex-col items-center justify-center px-4 py-10"><div className="card w-full max-w-sm p-6 text-center"><span className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--sesame)]"><BeanMark className="h-11 w-11"/></span><h1 className="text-xl font-black text-[var(--ink)]">تسجيل دخول الموظفين</h1><p className="mt-1 text-sm font-bold text-[var(--ink)]/45">لوحة الإدارة وتشغيل الطلبات</p><div className="hairline my-5"/><Suspense fallback={null}><LoginForm/></Suspense><p className="mt-5 text-sm font-bold text-[var(--ink)]/55">ليس لديك حساب؟ <Link href="/staff/signup" className="font-black text-[var(--amber-deep)] hover:underline">إنشاء حساب موظف</Link></p></div><Link href="/" className="btn mt-5 rounded-full border border-[var(--line)] bg-white px-4 py-2.5 text-sm text-[var(--ink)]/70 hover:bg-[var(--sesame)]"><ChevronRight className="h-4 w-4"/>العودة إلى الموقع</Link></main>}
