import { z } from "zod";
export const accountRoles = ["merchant", "company", "courier"] as const;
export type AccountRole = (typeof accountRoles)[number];
export function normalizeEgyptPhone(value: string) {
	let digits = value
		.replace(/[٠-٩۰-۹]/g, (x) =>
			String(
				"٠١٢٣٤٥٦٧٨٩".indexOf(x) >= 0
					? "٠١٢٣٤٥٦٧٨٩".indexOf(x)
					: "۰۱۲۳۴۵۶۷۸۹".indexOf(x),
			),
		)
		.replace(/[\s()+-]/g, "");
	if (digits.startsWith("0020")) digits = "0" + digits.slice(4);
	else if (digits.startsWith("20")) digits = "0" + digits.slice(2);
	return digits;
}
const phone = z
	.string()
	.max(32)
	.transform(normalizeEgyptPhone)
	.pipe(z.string().regex(/^01[0125]\d{8}$/, "أدخل رقم موبايل مصري صحيح"));
const field = (label: string, max = 160) =>
	z.string().trim().min(2, `أدخل ${label}`).max(max);
export const registrationSchema = z
	.object({
		role: z.enum(accountRoles),
		name: field("الاسم"),
		phone,
		password: z.string().min(10, "كلمة المرور 10 أحرف على الأقل").max(128),
		governorate: field("المحافظة", 80),
		zone: field("المنطقة", 100),
		address: z.string().trim().max(500).default(""),
		businessType: z.string().trim().max(80).optional(),
		coverage: z.array(z.string().trim().min(2).max(100)).max(30).default([]),
		vehicle: z.enum(["moto", "bike", "car"]).default("moto"),
		nationalId: z
			.string()
			.regex(/^\d{14}$/, "أدخل الرقم القومي من 14 رقمًا")
			.optional(),
		consent: z.literal(true, {
			error: "يجب الموافقة على استخدام البيانات لإنشاء حسابك",
		}),
	})
	.superRefine((data, ctx) => {
        if (data.role === "merchant" && data.address.length < 2)
            ctx.addIssue({ code: "custom", path: ["address"], message: "أدخل عنوان استلام الطلبات" });

	});
export const loginSchema = z.object({
	role: z.enum([...accountRoles, "admin"]),
	phone,
	password: z.string().min(1).max(128),
});
export const governorates = [
	"القاهرة",
	"الجيزة",
	"الإسكندرية",
	"الدقهلية",
	"البحر الأحمر",
	"البحيرة",
	"الفيوم",
	"الغربية",
	"الإسماعيلية",
	"المنوفية",
	"المنيا",
	"القليوبية",
	"الوادي الجديد",
	"السويس",
	"أسوان",
	"أسيوط",
	"بني سويف",
	"بورسعيد",
	"دمياط",
	"الشرقية",
	"جنوب سيناء",
	"كفر الشيخ",
	"مطروح",
	"الأقصر",
	"قنا",
	"شمال سيناء",
	"سوهاج",
];
