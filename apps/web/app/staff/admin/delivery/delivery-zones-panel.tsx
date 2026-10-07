"use client"

import { useState, useTransition } from "react"
import { Loader2, Plus, Save, Trash2 } from "lucide-react"
import { deleteDeliveryZone, saveDeliveryZone } from "./actions"

type Zone = { id: string; name: string; feeEGP: number; isActive: boolean }
export function DeliveryZonesPanel({ initialZones }: { initialZones: Zone[] }) {
	const [name, setName] = useState("")
	const [fee, setFee] = useState("")
	const [pending, start] = useTransition()
	function add() { start(async () => { await saveDeliveryZone({ name, feeEGP: Number(fee), isActive: true }); setName(""); setFee("") }) }
	return <div className="space-y-4"><div className="card grid gap-2 p-4 sm:grid-cols-[1fr_160px_auto]"><input className="input" placeholder="اسم المنطقة" value={name} onChange={(event) => setName(event.target.value)} /><input className="input num" type="number" min={0} placeholder="رسوم التوصيل" value={fee} onChange={(event) => setFee(event.target.value)} /><button disabled={pending || !name || fee === ""} onClick={add} className="btn btn-primary px-4"><Plus className="h-4 w-4" />إضافة منطقة</button></div><div className="space-y-2">{initialZones.map((zone) => <ZoneRow key={zone.id} zone={zone} />)}</div></div>
}
function ZoneRow({ zone }: { zone: Zone }) {
	const [name, setName] = useState(zone.name)
	const [fee, setFee] = useState(String(zone.feeEGP))
	const [active, setActive] = useState(zone.isActive)
	const [pending, start] = useTransition()
	return <div className="card grid items-center gap-2 p-3 sm:grid-cols-[1fr_140px_110px_auto_auto]"><input className="input" value={name} onChange={(event) => setName(event.target.value)} /><input className="input num" type="number" min={0} value={fee} onChange={(event) => setFee(event.target.value)} /><label className="flex items-center gap-2 text-xs font-black"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />متاحة</label><button disabled={pending} onClick={() => start(() => saveDeliveryZone({ id: zone.id, name, feeEGP: Number(fee), isActive: active }))} className="btn btn-outline px-3 py-2 text-xs">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}حفظ</button><button disabled={pending} onClick={() => confirm("حذف المنطقة؟") && start(() => deleteDeliveryZone(zone.id))} className="btn px-3 py-2 text-red-600"><Trash2 className="h-4 w-4" /></button></div>
}
