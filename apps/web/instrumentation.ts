// إنشاء جداول قاعدة البيانات تلقائيًا عند أول تشغيل.
// طبقة التوصيل (wasl) تعتمد على الجداول المشتركة في @el7bboB/db.
export async function register() {
	if (process.env.NEXT_RUNTIME !== "nodejs") return;
	// UI smoke tests mock every API request and intentionally do not provision PostgreSQL.
	// Never honor this test-only switch in a production server.
	if (
		process.env.NODE_ENV === "development" &&
		process.env.WASL_UI_TEST === "1"
	)
		return;
	const { bootstrapDatabase } = await import("@el7bboB/db");
	await bootstrapDatabase();
}
