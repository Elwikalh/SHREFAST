"use server"
import { sql } from 'drizzle-orm'
import { db } from '@el7bboB/db'
import { requireOwner } from '../actions'
import { calculate, type Batch } from './model'
import { revalidatePath } from 'next/cache'
export type SavedBatch={id:string;data:Batch;updatedAt:string}
let ready:Promise<void>|undefined
async function ensure(){if(!ready)ready=db.execute(sql`CREATE TABLE IF NOT EXISTS owner_costing_batches (owner_id text NOT NULL REFERENCES "user"(id), id text NOT NULL, data jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(owner_id,id))`).then(()=>{}).catch(e=>{ready=undefined;throw e});await ready}
export async function loadCosting():Promise<SavedBatch[]>{const owner=await requireOwner();await ensure();const rows=await db.execute(sql`SELECT id,data,updated_at FROM owner_costing_batches WHERE owner_id=${owner.userId} ORDER BY updated_at DESC LIMIT 300`);return Array.from(rows).map(r=>{const row=r as unknown as {id:string;data:Batch;updated_at:Date|string};return {id:row.id,data:row.data,updatedAt:new Date(row.updated_at).toISOString()}})}
export async function saveCosting(batch:Batch):Promise<{ok:boolean;message:string;saved?:SavedBatch[]}>{
 const owner=await requireOwner()
 try{
  if(!batch||JSON.stringify(batch).length>100000||!Array.isArray(batch.products)||batch.products.length<1||batch.products.length>30||!Array.isArray(batch.extras)||batch.extras.length>50||batch.products.some(p=>!Array.isArray(p.extras)||p.extras.length>30))throw new Error('راجع عدد المنتجات والإضافات')
  const result=calculate(batch);if(result.errors.length)return {ok:false,message:result.errors.join(' • ')}
  if(batch.note.length>2000||!Number.isFinite(Date.parse(batch.date))||new Date(batch.date).toISOString().slice(0,10)!==batch.date)throw new Error('راجع التاريخ والملاحظات')
  if(!/^[0-9a-f-]{36}$/i.test(batch.id))throw new Error('أعد فتح النموذج')
  await ensure()
  await db.transaction(async tx=>{await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${owner.userId}))`);const existing=await tx.execute(sql`SELECT id FROM owner_costing_batches WHERE owner_id=${owner.userId} AND id=${batch.id}`);if(!existing.length){const counts=await tx.execute(sql`SELECT count(*) AS n FROM owner_costing_batches WHERE owner_id=${owner.userId}`);if(Number((counts[0] as unknown as {n:string}).n)>=300)throw new Error('حد هذه النسخة 300 دفعة؛ صدّرها قبل التوسعة')}
  await tx.execute(sql`INSERT INTO owner_costing_batches (owner_id,id,data) VALUES (${owner.userId},${batch.id},${JSON.stringify(batch)}::jsonb) ON CONFLICT(owner_id,id) DO UPDATE SET data=excluded.data,updated_at=now()`)
  })
  revalidatePath('/staff/owner/costing');return {ok:true,message:'تم حفظ حساب الدفعة. لم تُخصم خامات ولم تُضف مبيعات إلى دفتر التشغيل.',saved:await loadCosting()}
 }catch(error){console.error('[owner-costing]',error);return {ok:false,message:error instanceof Error&&!/query|sql|postgres|connect|relation/i.test(error.message)?error.message:'تعذر تأكيد الحفظ؛ بيانات النموذج ما زالت موجودة. أعد المحاولة.'}}
}
