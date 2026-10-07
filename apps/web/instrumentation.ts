// إنشاء جداول قاعدة البيانات تلقائيًا عند أول تشغيل.
// طبقة التوصيل (wasl) تعتمد على الجداول المشتركة في @el7bboB/db.
export async function register() {
	if (process.env.NEXT_RUNTIME !== "nodejs") return
	const { bootstrapDatabase } = await import("@el7bboB/db")
	await bootstrapDatabase()
}
