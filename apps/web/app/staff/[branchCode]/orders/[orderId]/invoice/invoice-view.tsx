"use client"

const STATUS_LABELS: Record<string, string> = {
	pending_payment: "بانتظار تأكيد الدفع",
	queued: "في الانتظار",
	in_progress: "قيد التحضير",
	ready: "جاهز",
	completed: "تم التسليم",
	cancelled: "ملغي",
}
const CHANNEL_LABELS: Record<string, string> = {
	online_delivery: "توصيل",
	online_pickup: "استلام من المحل",
	in_store: "حضوري / كاشير",
	cart_kiosk: "عربة",
}
const PAYMENT_METHOD_LABELS: Record<string, string> = { cash: "نقدي", instapay: "إنستاباي" }
const PAYMENT_STATUS_LABELS: Record<string, string> = {
	pending: "غير مدفوع",
	awaiting_confirmation: "بانتظار تأكيد التحويل",
	confirmed: "مدفوع",
	failed: "فشل الدفع",
	refunded: "مسترد",
}

type InvoiceItem = {
	nameAr: string
	quantity: number
	unitPriceEGP: number
	addons: Array<{ nameAr: string; priceEGP: number }>
	note: string | null
	lineTotalEGP: number
}

type Props = {
	branchName: string
	displayNumber: string
	createdAt: string
	status: string
	channel: string
	customerName: string | null
	customerPhone: string | null
	deliveryAddress: string | null
	customerNote: string | null
	subtotalEGP: number
	discountEGP: number
	discountLabel: string | null
	deliveryFeeEGP: number
	taxEGP: number
	totalEGP: number
	paymentMethod: string | null
	paymentStatus: string | null
	instapayReference: string | null
	items: InvoiceItem[]
}

// The badge shows only the daily sequence — that's what the staff call out
// and what the customer remembers. The full BRANCH-YYMMDD-NNNN reference stays
// as a tiny line for lookups.
function splitOrderNumber(d: string): { prefix: string; num: string } {
	const parts = d.split("-")
	const last = parts[parts.length - 1]
	const n = Number(last)
	return parts.length > 1 && last !== "" && !Number.isNaN(n) ? { prefix: parts.slice(0, -1).join("-"), num: String(n) } : { prefix: "", num: d }
}

function money(value: number): string {
	return `${Number.isInteger(value) ? value : value.toFixed(2)} ج.م`
}

export function InvoiceView(props: Props) {
	const orderNum = splitOrderNumber(props.displayNumber)
	const created = new Intl.DateTimeFormat("ar-EG", {
		timeZone: "Africa/Cairo",
		dateStyle: "full",
		timeStyle: "short",
	}).format(new Date(props.createdAt))

	return (
		<main dir="rtl" className="inv-root">
			<style>{`
				.inv-root{background:#eceadf;min-height:100vh;padding:18px 10px;display:flex;flex-direction:column;align-items:center;gap:14px;color:#1c1a15;font-family:inherit}
				.inv-sheet{background:#fff;width:100%;max-width:420px;border-radius:14px;box-shadow:0 10px 30px rgba(30,41,34,.12);padding:22px 20px}
				.inv-brand{text-align:center}
				.inv-brand h1{margin:0;font-size:26px;font-weight:950}
				.inv-brand p{margin:2px 0;font-size:12px;font-weight:700;color:#6b6557}
				.inv-number{text-align:center;margin:12px 0 4px}
				.inv-number b{display:inline-block;direction:ltr;font-size:34px;font-weight:950;background:#f5b545;border-radius:10px;padding:6px 18px;min-width:64px}
				.inv-numref{margin:6px 0 0;font-size:10px;font-weight:700;color:#8a8574;letter-spacing:.04em}
				.inv-meta{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:8px}
				.inv-chip{border:1px solid #ddd6c4;border-radius:999px;padding:4px 10px;font-size:11px;font-weight:800;background:#faf8f1}
				.inv-hr{border:none;border-top:2px dashed #d8d2c0;margin:14px 0}
				.inv-section-title{font-size:12px;font-weight:950;color:#8a6a1f;margin:0 0 6px}
				.inv-row{display:flex;justify-content:space-between;gap:10px;font-size:13px;font-weight:700;padding:3px 0}
				.inv-row span:first-child{color:#5d584c}
				.inv-item{padding:8px 0;border-bottom:1px solid #efe9da}
				.inv-item-head{display:flex;justify-content:space-between;gap:10px;font-size:14px;font-weight:850}
				.inv-item-head .num{white-space:nowrap}
				.inv-sub{font-size:12px;font-weight:700;color:#6b6557;display:flex;justify-content:space-between;gap:10px;padding-inline-start:14px;margin-top:2px}
				.inv-note{margin-top:4px;font-size:12px;font-weight:700;background:#fff4d9;border:1px solid #ecd9a8;border-radius:8px;padding:6px 8px}
				.inv-total{display:flex;justify-content:space-between;align-items:center;background:#182720;color:#fff;border-radius:12px;padding:12px 14px;margin-top:12px}
				.inv-total b{font-size:20px;font-weight:950;color:#f5b545}
				.inv-thanks{text-align:center;font-size:12px;font-weight:800;color:#6b6557;margin-top:14px}
				.inv-actions{display:flex;gap:8px;max-width:420px;width:100%}
				.inv-actions button{flex:1;border:none;border-radius:12px;padding:13px;font-size:14px;font-weight:900;cursor:pointer}
				.inv-print{background:#f5b545;color:#182720;box-shadow:0 6px 16px rgba(217,151,37,.35)}
				.inv-back{background:#fff;border:1px solid #d8d2c0 !important;color:#182720}
				@media print{
					@page{size:80mm auto;margin:3mm}
					body *{visibility:hidden !important}
					#invoice-sheet,#invoice-sheet *{visibility:visible !important}
					#invoice-sheet{position:absolute;top:0;right:0;left:0;margin:0 auto;width:74mm;max-width:74mm;border-radius:0;box-shadow:none;padding:4mm 2mm}
					.no-print{display:none !important}
				}
			`}</style>

			<div className="inv-actions no-print">
				<button type="button" className="inv-print" onClick={() => window.print()}>
					🖨️ طباعة الفاتورة
				</button>
				<button type="button" className="inv-back" onClick={() => window.history.back()}>
					رجوع
				</button>
			</div>

			<article id="invoice-sheet" className="inv-sheet">
				<header className="inv-brand">
					<h1>الحَبّوب</h1>
					<p>EL7BBOB • {props.branchName}</p>
				</header>

				<div className="inv-number">
					<b className="num">{orderNum.num}</b>
					{orderNum.prefix ? <p className="inv-numref" dir="ltr">{props.displayNumber}</p> : null}
					<div className="inv-meta">
						<span className="inv-chip">{created}</span>
						<span className="inv-chip">{STATUS_LABELS[props.status] ?? props.status}</span>
						<span className="inv-chip">{CHANNEL_LABELS[props.channel] ?? props.channel}</span>
					</div>
				</div>

				<hr className="inv-hr" />

				{props.customerName || props.customerPhone || props.deliveryAddress ? (
					<section>
						<p className="inv-section-title">بيانات العميل</p>
						{props.customerName ? <div className="inv-row"><span>الاسم</span><span>{props.customerName}</span></div> : null}
						{props.customerPhone ? <div className="inv-row"><span>الهاتف</span><span dir="ltr" className="num">{props.customerPhone}</span></div> : null}
						{props.deliveryAddress ? <div className="inv-row"><span>العنوان</span><span style={{ textAlign: "left", maxWidth: "65%" }}>{props.deliveryAddress}</span></div> : null}
					</section>
				) : null}

				<section style={{ marginTop: 10 }}>
					<p className="inv-section-title">الأصناف</p>
					{props.items.map((item, index) => (
						<div className="inv-item" key={index}>
							<div className="inv-item-head">
								<span>
									<span className="num">{item.quantity} × </span>
									{item.nameAr}
								</span>
								<span className="num">{money(item.lineTotalEGP)}</span>
							</div>
							<div className="inv-sub">
								<span>سعر الوحدة</span>
								<span className="num">{money(item.unitPriceEGP)}</span>
							</div>
							{item.addons.map((addon, addonIndex) => (
								<div className="inv-sub" key={addonIndex}>
									<span>+ {addon.nameAr}</span>
									<span className="num">{money(addon.priceEGP)}</span>
								</div>
							))}
							{item.note ? <p className="inv-note">📝 {item.note}</p> : null}
						</div>
					))}
				</section>

				{props.customerNote ? <p className="inv-note" style={{ marginTop: 10 }}>📝 ملاحظات العميل: {props.customerNote}</p> : null}

				<hr className="inv-hr" />

				<section>
					<div className="inv-row"><span>الإجمالي قبل الرسوم</span><span className="num">{money(props.subtotalEGP)}</span></div>
					{props.deliveryFeeEGP > 0 ? <div className="inv-row"><span>رسوم التوصيل</span><span className="num">{money(props.deliveryFeeEGP)}</span></div> : null}
					{props.discountEGP > 0 ? <div className="inv-row"><span>الخصم{props.discountLabel ? ` — ${props.discountLabel}` : ""}</span><span className="num">- {money(props.discountEGP)}</span></div> : null}
					{props.taxEGP > 0 ? <div className="inv-row"><span>الضريبة</span><span className="num">{money(props.taxEGP)}</span></div> : null}
					<div className="inv-total">
						<span style={{ fontWeight: 900 }}>الإجمالي النهائي</span>
						<b className="num">{money(props.totalEGP)}</b>
					</div>
				</section>

				<hr className="inv-hr" />

				<section>
					<div className="inv-row"><span>طريقة الدفع</span><span>{props.paymentMethod ? (PAYMENT_METHOD_LABELS[props.paymentMethod] ?? props.paymentMethod) : "—"}</span></div>
					<div className="inv-row"><span>حالة الدفع</span><span>{props.paymentStatus ? (PAYMENT_STATUS_LABELS[props.paymentStatus] ?? props.paymentStatus) : "—"}</span></div>
					{props.instapayReference ? <div className="inv-row"><span>مرجع التحويل</span><span dir="ltr" className="num">{props.instapayReference}</span></div> : null}
				</section>

				<p className="inv-thanks">شكرًا لاختياركم الحَبّوب ❤️<br />el7bbob.com</p>
			</article>

			<div className="inv-actions no-print">
				<button type="button" className="inv-print" onClick={() => window.print()}>
					🖨️ طباعة الفاتورة
				</button>
				<button type="button" className="inv-back" onClick={() => window.history.back()}>
					رجوع
				</button>
			</div>
		</main>
	)
}
