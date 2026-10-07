"use client";
import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	ArrowLeft,
	ArrowRight,
	Bike,
	Building2,
	Check,
	Eye,
	EyeOff,
	LoaderCircle,
	LockKeyhole,
	ShieldCheck,
	Store,
} from "lucide-react";
import { Brand } from "./landing";
import {
	governorates,
	registrationSchema,
	type AccountRole,
} from "@/lib/wasl-auth-schema";
import { apiFetch } from "@/lib/wasl-api";
import styles from "./site.module.css";
const roles = [
	{
		value: "merchant",
		label: "نشاط تجاري",
		hint: "مطعم، صيدلية، متجر أو نشاط آخر",
		icon: Store,
	},
	{
		value: "company",
		label: "شركة توصيل",
		hint: "شركة تدير فريقًا وتخدم أنشطة تجارية",
		icon: Building2,
	},
	{
		value: "courier",
		label: "مندوب",
		hint: "تعمل في توصيل الطلبات بنفسك",
		icon: Bike,
	},
] as const;
const messages: Record<string, string> = {
	account_exists:
		"يوجد حساب مسجل بهذا الرقم ونوع الحساب. استخدم تسجيل الدخول بدل إعادة التسجيل.",
	legacy_account_requires_verification:
		"بيانات نشاطك مسجلة بالنظام القديم بدون كلمة مرور. يلزم تثبيت ملكية الحساب من إدارة المنصة؛ لن ننقل بياناتك بمجرد معرفة رقم الهاتف.",
	bad_credentials:
		"رقم الموبايل أو كلمة المرور غير صحيحين لهذا النوع من الحسابات.",
	too_many_attempts:
		"محاولات كثيرة خلال وقت قصير. انتظر 15 دقيقة ثم حاول مرة أخرى.",
	service_unavailable:
		"الخدمة غير متاحة مؤقتًا. بيانات النموذج محفوظة هنا؛ حاول مرة أخرى بعد قليل.",
	invalid_origin:
		"تعذر تأكيد مصدر الطلب. افتح الموقع من رابطه الأساسي ثم حاول مرة أخرى.",
	invalid_fields: "راجع البيانات المطلوبة قبل المتابعة.",
};
type Fields = {
	name: string;
	phone: string;
	governorate: string;
	zone: string;
	address: string;
	businessType: string;
	coverage: string;
	vehicle: "moto" | "bike" | "car";
	nationalId: string;
	password: string;
	confirmPassword: string;
	consent: boolean;
};
export default function AuthForm({
	mode,
	initialRole = "merchant",
}: {
	mode: "register" | "login";
	initialRole?: AccountRole | "admin";
}) {
	const router = useRouter();
	const registering = mode === "register",
		[role, setRole] = useState(initialRole),
		[step, setStep] = useState(0),
		[busy, setBusy] = useState(false),
		[showPassword, setShowPassword] = useState(false),
		[error, setError] = useState(""),
		[errors, setErrors] = useState<Record<string, string>>({});
	const submitLock = useRef(false),
		titleRef = useRef<HTMLHeadingElement>(null);
	const [fields, setFields] = useState<Fields>({
		name: "",
		phone: "",
		governorate: "القاهرة",
		zone: "",
		address: "",
		businessType: "مطعم",
		coverage: "",
		vehicle: "moto",
		nationalId: "",
		password: "",
		confirmPassword: "",
		consent: false,
	});
	const set = <K extends keyof Fields>(key: K, value: Fields[K]) => {
		setFields((previous) => ({ ...previous, [key]: value }));
		setErrors((previous) => {
			const next = { ...previous };
			delete next[key];
			return next;
		});
		setError("");
	};
	const move = (next: number) => {
		setStep(next);
		setError("");
		setErrors({});
		requestAnimationFrame(() => titleRef.current?.focus());
	};
	const roleName = roles.find((x) => x.value === role)?.label || "إدارة المنصة";
	const payload = () => ({
		...fields,
		role,
		coverage: fields.coverage
			.split(/[,،\n]/)
			.map((x) => x.trim())
			.filter(Boolean),
		nationalId:
			role === "courier"
				? fields.nationalId.replace(/[٠-٩]/g, (x) =>
						String("٠١٢٣٤٥٦٧٨٩".indexOf(x)),
					)
				: undefined,
	});
	async function submit(event: FormEvent) {
		event.preventDefault();
		if (submitLock.current) return;
		if (registering) {
			if (step === 0) {
				move(1);
				return;
			}
			const parsed = registrationSchema.safeParse(payload());
			const issues = parsed.success
				? {}
				: Object.fromEntries(
						parsed.error.issues.map((x) => [
							String(x.path[0] || "form"),
							x.message,
						]),
					);
			if (step === 1) {
				const detailKeys = [
					"name",
					"governorate",
					"zone",
					"address",
					"coverage",
					"nationalId",
				];
				const detailErrors = Object.fromEntries(
					Object.entries(issues).filter(([key]) => detailKeys.includes(key)),
				);
				if (Object.keys(detailErrors).length) {
					setErrors(detailErrors);
					setError("راجع البيانات المعلّمة أدناه.");
					return;
				}
				move(2);
				return;
			}
			if (fields.password !== fields.confirmPassword)
				issues.confirmPassword = "كلمتا المرور غير متطابقتين";
			if (Object.keys(issues).length) {
				setErrors(issues);
				setError("راجع البيانات المعلّمة أدناه.");
				return;
			}
		}
		submitLock.current = true;
		setBusy(true);
		setError("");
		try {
			const response = await apiFetch(`/api/wasl/auth/${mode}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(
					registering
						? payload()
						: { role, phone: fields.phone, password: fields.password },
				),
			});
			const data = await response.json();
			if (!response.ok || !data.ok) {
				if (data.fields) setErrors(data.fields);
				setError(messages[data.error] || "تعذر إتمام الطلب. حاول مرة أخرى.");
				return;
			}
			// Session is in an HttpOnly cookie. Never persist credentials or a token in localStorage.
			router.replace("/wasl");
			router.refresh();
		} catch {
			setError(
				"تعذر الاتصال بالخدمة. تأكد من اتصالك وحاول مرة أخرى؛ لا تعيد إرسال بياناتك في الشات.",
			);
		} finally {
			submitLock.current = false;
			setBusy(false);
		}
	}
	function input(
		key: keyof Fields,
		label: string,
		options: {
			type?: string;
			placeholder?: string;
			autocomplete?: string;
			hint?: string;
			inputMode?: "tel" | "numeric";
		} = {},
	) {
		return (
			<div className={styles.field}>
				<label htmlFor={key}>{label}</label>
				<input
					className={styles.input}
					id={key}
					name={key}
					value={String(fields[key])}
					onChange={(e) => set(key, e.target.value as never)}
					type={options.type || "text"}
					placeholder={options.placeholder}
					autoComplete={options.autocomplete}
					inputMode={options.inputMode}
					maxLength={
						key === "nationalId"
							? 14
							: key === "phone"
								? 32
								: key === "address"
									? 500
									: 160
					}
					dir={key === "phone" || key === "nationalId" ? "ltr" : undefined}
					aria-invalid={!!errors[key]}
					aria-describedby={
						errors[key]
							? `${key}-error`
							: options.hint
								? `${key}-hint`
								: undefined
					}
				/>
				{options.hint && <small id={`${key}-hint`}>{options.hint}</small>}
				{errors[key] && (
					<small className={styles.errorText} id={`${key}-error`}>
						{errors[key]}
					</small>
				)}
			</div>
		);
	}
	const passwordField = (
		key: "password" | "confirmPassword",
		label: string,
	) => (
		<div className={styles.field}>
			<label htmlFor={key}>{label}</label>
			<div className={styles.passwordWrap}>
				<input
					id={key}
					name={key}
					className={styles.input}
					value={fields[key]}
					onChange={(e) => set(key, e.target.value)}
					type={showPassword ? "text" : "password"}
					autoComplete={registering ? "new-password" : "current-password"}
					maxLength={128}
					dir="ltr"
					aria-invalid={!!errors[key]}
					aria-describedby={errors[key] ? `${key}-error` : undefined}
				/>
				<button
					type="button"
					aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
					onClick={() => setShowPassword((x) => !x)}
				>
					{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
				</button>
			</div>
			{errors[key] && (
				<small id={`${key}-error`} className={styles.errorText}>
					{errors[key]}
				</small>
			)}
			{registering && key === "password" && (
				<span className={styles.passwordInfo}>
					<LockKeyhole size={14} /> استخدم 10 أحرف على الأقل، ويفضل عبارة طويلة
					وفريدة.
				</span>
			)}
		</div>
	);
	return (
		<div className={styles.site}>
			<header className={styles.authHeader}>
				<Brand />
				<Link href="/">
					الرئيسية <ArrowLeft size={15} />
				</Link>
			</header>
			<main className={styles.authGrid}>
				<aside className={styles.authAside}>
					<span className={styles.eyebrow}>بداية مرتبة لشغلك</span>
					<h1>
						{registering ? (
							<>
								حساب واحد.
								<br />
								مساحتك أنت.
							</>
						) : (
							<>
								أهلًا بعودتك.
								<br />
								شغلك في مكانه.
							</>
						)}
					</h1>
					<p>
						{registering
							? "اختر دورك، أضف بياناتك، وأنشئ كلمة مرور. ندخلك بعدها إلى البوابة المناسبة لحسابك."
							: "سجّل الدخول بنفس نوع الحساب الذي أنشأته. بيانات التشغيل لا تفتح بمجرد معرفة رابط أو مرجع حساب."}
					</p>
					<ul className={styles.asidePoints}>
						<li>
							<Check size={18} /> خطوات واضحة، بدون بيانات زائدة
						</li>
						<li>
							<Check size={18} /> تجربة عربية على الموبايل والكمبيوتر
						</li>
						<li>
							<Check size={18} /> كلمة المرور لا تحفظ في المتصفح
						</li>
					</ul>
					<div className={styles.asideFoot}>
						<ShieldCheck size={19} />
						<span>
							هذا النموذج ينشئ حسابًا. تفعيل التغطية واتفاقات التوصيل يحتاج
							تحققًا وإعدادًا منفصلًا.
						</span>
					</div>
				</aside>
				<div className={styles.authForm}>
					{registering && (
						<ol className={styles.progress} aria-label="مراحل التسجيل">
							{["نوع الحساب", "بياناتك", "تأمين الدخول"].map((label, i) => (
								<li
									key={label}
									className={i === step ? styles.current : undefined}
									aria-current={i === step ? "step" : undefined}
								>
									<span>{i < step ? <Check size={12} /> : i + 1}</span>
									{label}
								</li>
							))}
						</ol>
					)}
					<h2 ref={titleRef} tabIndex={-1} className={styles.formTitle}>
						{registering
							? [
									"نوع حسابك إيه؟",
									"خلينا نعرف شغلك.",
									"آخر خطوة. دخولك الآمن.",
								][step]
							: "تسجيل الدخول"}
					</h2>
					<p className={styles.formSubtitle}>
						{registering
							? [
									"كل دور له بوابة وبيانات مناسبة. اختار اللي يناسبك.",
									`بيانات ${roleName} تساعدنا نجهز مساحة حسابك.`,
									"رقمك هو اسم الدخول. لا نعتبره موثّق الملكية لمجرد التسجيل.",
								][step]
							: "اختر نوع حسابك وأدخل رقم الموبايل وكلمة المرور."}
					</p>
					{error && (
						<div className={styles.formError} role="alert">
							{error}
						</div>
					)}
					<form onSubmit={submit} noValidate>
						{((registering && step === 0) || !registering) && (
							<fieldset
								className={!registering ? styles.loginRole : styles.roles}
							>
								<legend>نوع الحساب</legend>
								{(role === "admin"
									? [
											{
												value: "admin",
												label: "إدارة المنصة",
												hint: "حساب إدارة مصرح",
												icon: ShieldCheck,
											},
										]
									: roles
								).map(({ value, label, hint, icon: Icon }) => (
									<label key={value} className={styles.roleOption}>
										<input
											type="radio"
											name="role"
											value={value}
											checked={role === value}
											onChange={() => {
												setRole(value as typeof role);
												setError("");
												setErrors({});
											}}
										/>
										<Icon size={registering ? 24 : 18} />
										<div>
											<b>{label}</b>
											{registering && <small>{hint}</small>}
										</div>
										<span className={styles.radioCircle} />
									</label>
								))}
							</fieldset>
						)}
						{registering && step === 1 && (
							<>
								{input(
									"name",
									role === "courier" ? "الاسم الكامل" : "اسم النشاط أو الشركة",
									{
										autocomplete: role === "courier" ? "name" : "organization",
										placeholder:
											role === "courier"
												? "اسمك كما يظهر في أوراقك"
												: "الاسم الذي يظهر في طلباتك",
									},
								)}
								{role === "merchant" && (
									<div className={styles.field}>
										<label htmlFor="businessType">نوع النشاط</label>
										<select
											id="businessType"
											className={styles.input}
											value={fields.businessType}
											onChange={(e) => set("businessType", e.target.value)}
										>
											{["مطعم", "صيدلية", "سوبر ماركت", "متجر", "أخرى"].map(
												(x) => (
													<option key={x}>{x}</option>
												),
											)}
										</select>
									</div>
								)}
								<div className={styles.twoFields}>
									<div className={styles.field}>
										<label htmlFor="governorate">المحافظة</label>
										<select
											id="governorate"
											className={styles.input}
											value={fields.governorate}
											onChange={(e) => set("governorate", e.target.value)}
										>
											{governorates.map((x) => (
												<option key={x}>{x}</option>
											))}
										</select>
									</div>
									{input("zone", "المنطقة", {
										placeholder: "مثال: المعادي",
										autocomplete: "address-level2",
									})}
								</div>
								{input(
									"address",
									role === "courier"
										? "عنوان التواصل"
										: "عنوان النشاط أو المقر",
									{
										placeholder: "الشارع، رقم المبنى، وعلامة مميزة",
										autocomplete: "street-address",
									},
								)}
								{role === "company" &&
									input("coverage", "نطاق التغطية", {
										placeholder: "المعادي، المقطم، مدينة نصر",
										hint: "افصل بين المناطق بفاصلة. التسجيل لا يؤكد تفعيل التغطية.",
									})}{" "}
								{role === "courier" && (
									<>
										<div className={styles.field}>
											<label htmlFor="vehicle">وسيلة التوصيل</label>
											<select
												id="vehicle"
												className={styles.input}
												value={fields.vehicle}
												onChange={(e) =>
													set("vehicle", e.target.value as Fields["vehicle"])
												}
											>
												<option value="moto">موتوسيكل</option>
												<option value="bike">دراجة</option>
												<option value="car">سيارة</option>
											</select>
										</div>
										{input("nationalId", "الرقم القومي", {
											inputMode: "numeric",
											hint: "14 رقمًا. لا يظهر هذا الحقل في قوائم الأنشطة أو الطلبات.",
										})}
									</>
								)}
							</>
						)}
						{((registering && step === 2) || !registering) && (
							<>
								{input("phone", "رقم الموبايل", {
									type: "tel",
									inputMode: "tel",
									placeholder: "01012345678",
									autocomplete: "username",
									hint: "يمكنك استخدام الصيغة المحلية أو +20.",
								})}
								{passwordField("password", "كلمة المرور")}
								{registering && (
									<>
										{passwordField("confirmPassword", "تأكيد كلمة المرور")}
										<label className={styles.consent}>
											<input
												type="checkbox"
												checked={fields.consent}
												onChange={(e) => set("consent", e.target.checked)}
											/>
											<span>
												أوافق على استخدام هذه البيانات لإنشاء حسابي وتشغيل خدمات
												التوصيل.{" "}
												<Link
													href="/privacy"
													target="_blank"
													rel="noopener noreferrer"
												>
													اعرف بيانات التسجيل
												</Link>
												.
											</span>
										</label>
										{errors.consent && (
											<p className={styles.errorText} role="alert">
												{errors.consent}
											</p>
										)}
									</>
								)}
							</>
						)}
						<div className={styles.formActions}>
							{registering && step > 0 && (
								<button
									className={styles.backButton}
									type="button"
									disabled={busy}
									onClick={() => move(step - 1)}
								>
									<ArrowRight size={15} /> رجوع
								</button>
							)}
							<button className={styles.primary} type="submit" disabled={busy}>
								{busy ? (
									<>
										<LoaderCircle size={18} className={styles.loadingIcon} />
										<span role="status">
											جارٍ {registering ? "إنشاء الحساب" : "تسجيل الدخول"}...
										</span>
									</>
								) : (
									<>
										{registering
											? step === 2
												? "إنشاء حسابي"
												: "متابعة"
											: "تسجيل الدخول"}
										<ArrowLeft size={17} />
									</>
								)}
							</button>
						</div>
						<p className={styles.authSwitch}>
							{registering ? "عندك حساب بالفعل؟" : "أول مرة هنا؟"}
							<Link
								href={`${registering ? "/login" : "/register"}?role=${role === "admin" ? "merchant" : role}`}
							>
								{registering ? "تسجيل الدخول" : "إنشاء حساب"}
							</Link>
						</p>
					</form>
				</div>
			</main>
		</div>
	);
}
