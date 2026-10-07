import Link from "next/link";
import {
	ArrowLeft,
	ArrowUpLeft,
	Bike,
	Building2,
	Check,
	ChevronDown,
	CircleCheck,
	Layers3,
	LockKeyhole,
	MapPin,
	MoveUpLeft,
	Package,
	Route,
	ShieldCheck,
	Sparkles,
	Store,
	Zap,
} from "lucide-react";
import styles from "./site.module.css";
import { Brand } from "./brand";
import SiteHeader from "./header";
export { Brand } from "./brand";
export default function Landing() {
	return (
		<div className={styles.site}>
			<a href="#main-content" className={styles.skip}>
				انتقل للمحتوى
			</a>
			<SiteHeader />
			<main id="main-content">
				<section className={styles.hero}>
					<div className={styles.heroCopy}>
						<span className={styles.eyebrow}>
							<span className={styles.statusDot} /> إدارة التوصيل، ببساطة
						</span>
						<h1>
							كل طلب،
							<br />
							<span>تحت السيطرة.</span>
						</h1>
						<p className={styles.heroDescription}>
							أنشئ طلبات التوصيل، نظّم فريقك، وتابع حالة كل طلب من لوحة واحدة. تجربة عربية واضحة، على الموبايل والكمبيوتر.
						</p>
						<div className={styles.ctaRow}>
							<Link href="/register" className={styles.primary}>
								أنشئ حسابك <ArrowLeft size={19} />
							</Link>
							<a href="#how" className={styles.secondary}>
								كيف تعمل المنصة؟ <ArrowUpLeft size={18} />
							</a>
						</div>
						<div className={styles.heroNotes}>
							<span>
								<Check size={16} /> حساب مناسب لطبيعة عملك
							</span>
							<span>
								<Check size={16} /> دخول خاص بكلمة مرور
							</span>
						</div>
					</div>
					<div
						className={styles.productVisual}
						aria-label="معاينة توضيحية لواجهة إدارة التوصيل"
					>
						<div className={styles.visualTop}>
							<span>
								<Layers3 size={18} /> لوحة الطلبات
							</span>
							<span className={styles.previewTag}>معاينة توضيحية</span>
						</div>
						<div className={styles.visualMain}>
							<div className={styles.visualHeading}>
								<div>
									<span className={styles.muted}>متابعة الطلب</span>
									<h2>متابعة الطلب، خطوة بخطوة</h2>
								</div>
								<span className={styles.visualIcon}>
									<Package size={24} />
								</span>
							</div>
							<div className={styles.previewOrder}>
								<div className={styles.previewOrderTop}>
									<span className={styles.orderLabel}>
										<span className={styles.orderDot} /> طلب توضيحي
									</span>
									<span className={styles.orderBadge}>في الطريق</span>
								</div>
								<div className={styles.routePoint}>
									<span className={styles.pointIcon}>
										<Store size={19} />
									</span>
									<div>
										<small>نقطة الاستلام</small>
										<b>نشاطك التجاري</b>
									</div>
									<CircleCheck size={19} className={styles.positive} />
								</div>
								<div className={styles.routeConnector} />
								<div className={styles.routePoint}>
									<span className={styles.pointIcon}>
										<MapPin size={19} />
									</span>
									<div>
										<small>نقطة التسليم</small>
										<b>عنوان العميل</b>
									</div>
									<span className={styles.routeArrow}>
										<MoveUpLeft size={20} />
									</span>
								</div>
								<div className={styles.previewDivider} />
								<div className={styles.courierRow}>
									<span className={styles.courierAvatar}>
										<Bike size={22} />
									</span>
									<div>
										<b>المندوب المكلّف</b>
										<small>من الاستلام حتى التسليم</small>
									</div>
									<span className={styles.miniStatus}>متابعة الحالة</span>
								</div>
							</div>
							<div className={styles.visualBottom}>
								<span>
									<LockKeyhole size={15} /> وصول خاص لحسابك
								</span>
								<span>
									<Route size={16} /> واجهة عربية واضحة
								</span>
							</div>
						</div>
						<div className={styles.floatingNote}>
							<span>
								<Check size={17} />
							</span>
							<div>
								<b>كل التفاصيل أمامك</b>
								<small>حالة الطلب والمندوب في لوحة واحدة</small>
							</div>
						</div>
					</div>
				</section>
				<section className={styles.valueStrip} aria-label="مميزات التجربة">
					<div>
						<Route />
						<span>
							<b>تابع كل مرحلة</b>
							<small>متابعة واضحة لحالة كل طلب</small>
						</span>
					</div>
					<div>
						<ShieldCheck />
						<span>
							<b>بياناتك تخص حسابك</b>
							<small>تسجيل دخول وصلاحيات للحساب</small>
						</span>
					</div>
					<div>
						<Zap />
						<span>
							<b>اعمل من أي جهاز</b>
							<small>على الكمبيوتر والموبايل</small>
						</span>
					</div>
				</section>
				<section id="solutions" className={styles.section}>
					<div className={styles.sectionIntro}>
						<span className={styles.eyebrow}>مصممة لطبيعة عملك</span>
						<h2>
							ثلاثة أدوار.
							<br />
							منصة واحدة.
						</h2>
						<p>
							نشاط تجاري، شركة توصيل، أو مندوب. اختر دورك واحصل على لوحة تناسب مهامك اليومية.
						</p>
					</div>
					<div className={styles.solutions}>
						{[
							{
								role: "merchant",
								icon: Store,
								title: "للنشاط التجاري",
								text: "للمطاعم والصيدليات والأسواق. سجل نشاطك، أنشئ طلبات التوصيل، وتابعها من لوحة حسابك.",
								label: "سجّل نشاطك",
							},
							{
								role: "company",
								icon: Building2,
								title: "لشركة التوصيل",
								text: "اجمع فريقك وعملاءك في مكان واحد. حدد نطاق التغطية، ونظّم توزيع الطلبات على المناديب.",
								label: "سجّل شركتك",
							},
							{
								role: "courier",
								icon: Bike,
								title: "للمندوب",
								text: "حساب مستقل للمتابعة. انضم لفريق بدعوة، واعرف الطلبات المسندة إليك وخطوتك التالية.",
								label: "حمّل تطبيق المندوب",
							},
						].map(({ role, icon: Icon, title, text, label }) => (
							<article key={role} className={styles.solutionCard}>
								<span className={styles.solutionIcon}>
									<Icon size={26} />
								</span>
								<h3>{title}</h3>
								<p>{text}</p>
								<Link href={role === "courier" ? "/app?role=courier" : `/register?role=${role}`}>
									{label}
									<ArrowLeft size={17} />
								</Link>
							</article>
						))}
					</div>
				</section>
				<section id="how" className={styles.howSection}>
					<div className={styles.howHeading}>
						<span className={styles.eyebrow}>بداية واضحة</span>
						<h2>
							ابدأ بخطوات بسيطة،
							<br />
							وأكمل عملك بوضوح.
						</h2>
						<p>
							اختر نوع الحساب، أضف بياناتك، ثم أنشئ كلمة مرور للدخول.
						</p>
						<Link href="/register" className={styles.secondary}>
							ابدأ التسجيل <ArrowLeft size={18} />
						</Link>
					</div>
					<ol className={styles.steps}>
						{[
							{
								title: "اختر نوع حسابك",
								text: "نشاط تجاري، شركة توصيل، أو مندوب. نعرض لك فقط البيانات المناسبة لدورك.",
							},
							{
								title: "أضف بيانات العمل",
								text: "أضف الاسم، والمحافظة، والمنطقة والعنوان. للشركات، يمكن إضافة نطاق التغطية لاحقًا.",
							},
							{
								title: "أمّن حسابك",
								text: "أضف رقم الموبايل وكلمة المرور. بعد التسجيل، انتقل مباشرة إلى لوحة حسابك.",
							},
						].map((step, i) => (
							<li key={step.title}>
								<span className={styles.stepNumber}>0{i + 1}</span>
								<div>
									<h3>{step.title}</h3>
									<p>{step.text}</p>
								</div>
							</li>
						))}
					</ol>
				</section>
				<section id="faq" className={styles.section}>
					<div className={styles.faqLayout}>
						<div>
							<span className={styles.eyebrow}>الأسئلة الشائعة</span>
							<h2 className={styles.sectionTitle}>
								كل ما تحتاج معرفته
								<br />
								قبل التسجيل.
							</h2>
						</div>
						<div className={styles.faqs}>
							{[
								{
									q: "أي نوع حساب يناسبني؟",
									a: "لو لديك نشاط يرسل طلبات للعملاء اختر النشاط التجاري. لو تدير شركة وفريق توصيل اختر شركة التوصيل. ولو تعمل في التسليم بنفسك اختر المندوب.",
								},
								{
									q: "من يمكنه الوصول إلى بيانات حسابي؟",
									a: "الصفحات التشغيلية تتطلب تسجيل الدخول. مرجع الحساب وحده لا يمنح الوصول إلى بياناته، ولا يسمح بتعديل حساب آخر.",
								},
								{
									q: "لدي حساب قديم. كيف أستعيد الوصول؟",
									a: "حسابات المناديب التي لها كلمة مرور سابقة يمكنها الدخول من الصفحة الجديدة. سجلات الأنشطة والشركات القديمة التي بلا كلمة مرور تحتاج تثبيت ملكية من إدارة المنصة؛ لا ننقلها تلقائيًا بمجرد معرفة رقم الهاتف.",
								},
								{
									q: "هل تسجيل الحساب يفعّل التوصيل في منطقتي تلقائيًا؟",
									a: "لا. تسجيل الحساب لا يعد تأكيدًا لتوفر التوصيل أو تفعيل اتفاق شركة. التغطية، الدعوات، وتفعيل فريقك تحتاج إعدادًا وتحققًا داخل المنصة.",
								},
							].map(({ q, a }) => (
								<details key={q}>
									<summary>
										{q}
										<ChevronDown size={18} />
									</summary>
									<p>{a}</p>
								</details>
							))}
						</div>
					</div>
				</section>
				<section className={styles.finalCta}>
					<span className={styles.eyebrow}>
						<Sparkles size={16} /> خطوتك التالية
					</span>
					<h2>
						ابدأ اليوم.
						<br />
						نظّم توصيلك من مكان واحد.
					</h2>
					<Link href="/register" className={styles.primary}>
						إنشاء حساب جديد <ArrowLeft size={19} />
					</Link>
				</section>
			</main>
			<footer className={styles.footer}>
				<Brand />
				<p>إدارة أوضح لطلباتك وفريقك.</p>
				<div>
					<Link href="/app">تثبيت التطبيق</Link>
                    <Link href="/privacy">بيانات التسجيل</Link>
					<Link href="/login">تسجيل الدخول</Link>
					<span dir="ltr">© {new Date().getFullYear()} SHARE FAST</span>
				</div>
			</footer>
		</div>
	);
}
