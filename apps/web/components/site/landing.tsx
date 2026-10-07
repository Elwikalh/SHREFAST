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
export function Brand() {
	return (
		<Link href="/" className={styles.brand} aria-label="Super X — الرئيسية">
			<span className={styles.brandMark}>
				<Route size={24} strokeWidth={2.5} />
			</span>
			<span dir="ltr">
				Super X<span className={styles.brandSub}>DELIVERY, CONNECTED.</span>
			</span>
		</Link>
	);
}
export default function Landing() {
	return (
		<div className={styles.site}>
			<a href="#main-content" className={styles.skip}>
				انتقل للمحتوى
			</a>
			<header className={styles.header}>
				<div className={styles.headerInner}>
					<Brand />
					<nav className={styles.nav} aria-label="القائمة الرئيسية">
						<a href="#solutions">لمن صُممت؟</a>
						<a href="#how">كيف تبدأ؟</a>
						<a href="#faq">الأسئلة الشائعة</a>
					</nav>
					<div className={styles.headerActions}>
						<Link href="/login" className={styles.textLink}>
							تسجيل الدخول
						</Link>
						<Link href="/register" className={styles.smallPrimary}>
							ابدأ الآن <ArrowLeft size={16} />
						</Link>
					</div>
				</div>
			</header>
			<main id="main-content">
				<section className={styles.hero}>
					<div className={styles.heroCopy}>
						<span className={styles.eyebrow}>
							<span className={styles.statusDot} /> مساحة واحدة لإدارة التوصيل
						</span>
						<h1>
							كل طلب.
							<br />
							<span>في الاتجاه الصحيح.</span>
						</h1>
						<p className={styles.heroDescription}>
							من نشاطك التجاري إلى آخر نقطة تسليم. اجمع طلباتك، وفريقك، وشركة
							التوصيل في تجربة عربية واحدة — بدل المتابعة المبعثرة.
						</p>
						<div className={styles.ctaRow}>
							<Link href="/register" className={styles.primary}>
								أنشئ حسابك <ArrowLeft size={19} />
							</Link>
							<a href="#how" className={styles.secondary}>
								شوف كيف تبدأ <ArrowUpLeft size={18} />
							</a>
						</div>
						<div className={styles.heroNotes}>
							<span>
								<Check size={16} /> تسجيل يناسب نوع نشاطك
							</span>
							<span>
								<Check size={16} /> حساب مستقل بكلمة مرور
							</span>
						</div>
					</div>
					<div
						className={styles.productVisual}
						aria-label="معاينة توضيحية لواجهة إدارة التوصيل"
					>
						<div className={styles.visualTop}>
							<span>
								<Layers3 size={18} /> مساحة التشغيل
							</span>
							<span className={styles.previewTag}>معاينة توضيحية</span>
						</div>
						<div className={styles.visualMain}>
							<div className={styles.visualHeading}>
								<div>
									<span className={styles.muted}>متابعة الطلب</span>
									<h2>من أول طلب… لآخر خطوة.</h2>
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
										<small>كل خطوة، في مكانها.</small>
									</div>
									<span className={styles.miniStatus}>متابعة الحالة</span>
								</div>
							</div>
							<div className={styles.visualBottom}>
								<span>
									<LockKeyhole size={15} /> بيانات حسابك داخل جلستك
								</span>
								<span>
									<Route size={16} /> تجربة عربية RTL
								</span>
							</div>
						</div>
						<div className={styles.floatingNote}>
							<span>
								<Check size={17} />
							</span>
							<div>
								<b>الوضوح يصنع الفرق.</b>
								<small>الطلبات والفريق في مساحة واحدة</small>
							</div>
						</div>
					</div>
				</section>
				<section className={styles.valueStrip} aria-label="مميزات التجربة">
					<div>
						<Route />
						<span>
							<b>من أول طلب لآخر تسليم</b>
							<small>متابعة واضحة لحالة كل طلب</small>
						</span>
					</div>
					<div>
						<ShieldCheck />
						<span>
							<b>حسابك مش مجرد رابط</b>
							<small>تسجيل دخول وصلاحيات للحساب</small>
						</span>
					</div>
					<div>
						<Zap />
						<span>
							<b>واجهة عربية، بدون تعقيد</b>
							<small>على الكمبيوتر والموبايل</small>
						</span>
					</div>
				</section>
				<section id="solutions" className={styles.section}>
					<div className={styles.sectionIntro}>
						<span className={styles.eyebrow}>كل دور له مساحته</span>
						<h2>
							منظومة واحدة.
							<br />
							تجربة مناسبة لشغلك.
						</h2>
						<p>
							اختر نوع حسابك من البداية. كل بوابة تركز على التفاصيل التي تحتاجها
							أنت.
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
								label: "انضم كمندوب",
							},
						].map(({ role, icon: Icon, title, text, label }) => (
							<article key={role} className={styles.solutionCard}>
								<span className={styles.solutionIcon}>
									<Icon size={26} />
								</span>
								<h3>{title}</h3>
								<p>{text}</p>
								<Link href={`/register?role=${role}`}>
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
							مسافة قصيرة
							<br />
							بينك وبين حسابك.
						</h2>
						<p>
							لا حاجة للتنقل بين بوابات مختلفة للتسجيل. بداية واحدة، وتجربة
							مرتبة.
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
								title: "عرّفنا بشغلك",
								text: "أضف الاسم، والمحافظة، والمنطقة والعنوان. للشركات، حدد مناطق التغطية أيضًا.",
							},
							{
								title: "أنشئ دخولك الآمن",
								text: "رقم موبايل وكلمة مرور. بعد التسجيل تدخل مباشرة إلى بوابة حسابك، وليس حسابًا تجريبيًا.",
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
							<span className={styles.eyebrow}>قبل ما تبدأ</span>
							<h2 className={styles.sectionTitle}>
								إجابات بسيطة.
								<br />
								لبداية أفضل.
							</h2>
						</div>
						<div className={styles.faqs}>
							{[
								{
									q: "أي نوع حساب يناسبني؟",
									a: "لو لديك نشاط يرسل طلبات للعملاء اختر النشاط التجاري. لو تدير شركة وفريق توصيل اختر شركة التوصيل. ولو تعمل في التسليم بنفسك اختر المندوب.",
								},
								{
									q: "هل بياناتي مفتوحة لأي شخص معه الرابط؟",
									a: "الصفحات التشغيلية تتطلب تسجيل الدخول. مرجع الحساب وحده لا يمنح الوصول إلى بياناته، ولا يسمح بتعديل حساب آخر.",
								},
								{
									q: "عندي بيانات مسجلة بالنظام القديم. أعمل إيه؟",
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
						<Sparkles size={16} /> شغل مرتب. بداية أهدى.
					</span>
					<h2>
						خلي التوصيل جزءًا
						<br />
						من نظامك، مش من قلقك.
					</h2>
					<Link href="/register" className={styles.primary}>
						ابدأ بحسابك <ArrowLeft size={19} />
					</Link>
				</section>
			</main>
			<footer className={styles.footer}>
				<Brand />
				<p>طلباتك، فريقك، وخطوتك التالية.</p>
				<div>
					<Link href="/privacy">بيانات التسجيل</Link>
					<Link href="/login">تسجيل الدخول</Link>
					<span dir="ltr">© {new Date().getFullYear()} Super X</span>
				</div>
			</footer>
		</div>
	);
}
