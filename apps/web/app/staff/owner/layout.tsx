import type {ReactNode} from 'react'
import Link from 'next/link'
import {requireOwner} from './actions'
export const dynamic='force-dynamic'
export default async function OwnerLayout({children}:{children:ReactNode}){await requireOwner();return <div dir="rtl"><nav aria-label="مساحة المالك" style={{display:'flex',gap:20,flexWrap:'wrap',padding:'14px 24px',background:'#182720',color:'#f5b545',fontWeight:800}}><Link href="/staff/owner/orders">شاشة شغلي والطلبات</Link><Link href="/staff/owner">حساباتي وتقفيل اليوم</Link><Link href="/staff/owner/costing">حساب تكلفة الدفعات والمنتجات</Link><Link href="/staff/admin">الإدارة العامة</Link></nav>{children}</div>}
