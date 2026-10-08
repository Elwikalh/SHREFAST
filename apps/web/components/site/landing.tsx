import Link from "next/link";
import {
	ArrowLeft,
	Bike,
	Building2,
	Check,
	ChevronDown,
	CircleCheck,
	Layers3,
	LockKeyhole,
	MapPin,
	Monitor,
	Smartphone,
	Download,
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
							طلباتك، فريقك، وكل خطوة في التوصيل — في منصة عربية واحدة. افتح لوحة نشاطك أو شركتك من الموبايل والكمبيوتر، بنفس الحساب ونفس البيانات.
						</p>
						<div className={styles.ctaRow}>
							<Link href="/register" className={styles.primary}>
								أنشئ حسابك <ArrowLeft size={19} />
							</Link>
							<Link href="/app" className={styles.secondary}>
                                ثبّت التطبيق <Download size={18} />
                            </Link>
						</div>
						<div className={styles.heroNotes}>
							<span>
								<Monitor size={17} /> المطعم والشركة: موبايل وكمبيوتر
							</span>
							<span>
								<Smartphone size={17} /> المندوب: تطبيق للموبايل
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
							مساحة لكل دور.
							<br />
							وتجربة تناسب عملك.
						</h2>
						<p>
							اختر حسابك، واعرف من البداية أين تستخدم التطبيق وكيف تبدأ.
						</p>
					</div>
                    <div className={styles.solutions}>
                        {[
                            { role: "merchant", icon: Store, title: "مطعم أو نشاط تجاري", devices: "موبايل + كمبيوتر", text: "أنشئ طلبات التوصيل وتابع حالتها من لوحة نشاطك، أينما تعمل.", label: "إنشاء حساب النشاط", install: "تثبيت تطبيق النشاط" },
                            { role: "company", icon: Building2, title: "شركة توصيل", devices: "موبايل + كمبيوتر", text: "نظّم العملاء والمناديب ووزّع طلبات التوصيل من لوحة شركتك.", label: "إنشاء حساب الشركة", install: "تثبيت تطبيق الشركة" },
                            { role: "courier", icon: Bike, title: "مندوب توصيل", devices: "تطبيق للموبايل", text: "سجّل من تطبيق الموبايل، وانضم لفريقك وتابع الطلبات المسندة إليك.", label: "تثبيت تطبيق المندوب", install: "لديك حساب؟ تسجيل الدخول" },
                        ].map(({ role, icon: Icon, title, devices, text, label, install }) => (
                            <article key={role} className={styles.solutionCard}>
                                <div className={styles.roleTop}><span className={styles.solutionIcon}><Icon size={26} /></span><span className={styles.deviceBadge}>{role === "courier" ? <Smartphone size={16} /> : <Monitor size={16} />}{devices}</span></div>
                                <h3>{title}</h3><p>{text}</p>
                                <div className={styles.roleActions}>
                                    <Link href={role === "courier" ? "/app?role=courier" : `/register?role=${role}`} className={styles.rolePrimary}>{label}<ArrowLeft size={17} /></Link>
                                    <Link href={role === "courier" ? "/login?role=courier" : `/app?role=${role}`} className={styles.roleInstall}>{install}{role !== "courier" && <Download size={17} />}</Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
                <section id="devices" className={styles.deviceSection} aria-labelledby="devices-title">
                    <div className={styles.deviceIntro}>
                        <span className={styles.eyebrow}>للمطاعم والأنشطة وشركات التوصيل</span>
                        <h2 id="devices-title">حساب واحد.<br />{" "}على الموبايل والكمبيوتر.</h2>
                        <p>ابدأ على جهاز، وأكمل على الآخر. ادخل بنفس رقم الموبايل وكلمة المرور لتصل إلى نفس لوحة الحساب وبياناتك المحفوظة.</p>
                        <Link href="/app" className={styles.primary}>تثبيت التطبيق <Download size={18} /></Link>
                    </div>
                    <div className={styles.devicePanels}>
                        <div className={styles.devicePanel}><span className={styles.deviceIcon}><Smartphone size={30} /></span><h3>على الموبايل</h3><p>ثبّت التطبيق على Android أو iPhone، وافتح لوحة حسابك من أيقونة SHARE FAST.</p><span className={styles.deviceAudience}>للمطعم والنشاط وشركة التوصيل</span></div>
                        <div className={styles.devicePanel}><span className={styles.deviceIcon}><Monitor size={30} /></span><h3>على الكمبيوتر</h3><p>ثبّته من Chrome أو Edge، واستخدم لوحة التحكم في نافذة مستقلة على سطح المكتب.</p><span className={styles.deviceAudience}>نفس الحساب. نفس البيانات.</span></div>
                        <div className={styles.deviceAssurance}><CircleCheck size={21} /><p>لا تحتاج إلى حساب جديد لكل جهاز. وللمندوب، تبدأ التجربة من تطبيق الموبايل.</p></div>
                    </div>
                </section>
				<section id="how" className={styles.howSection}>
					<div className={styles.howHeading}>
						<span className={styles.eyebrow}>بداية واضحة</span>
						<h2>
							بداية بسيطة.
							<br />
							وحساب يكمل معك.
						</h2>
						<p>
							بيانات أساسية فقط عند التسجيل. تفاصيل التشغيل يمكن إعدادها بعد إنشاء الحساب.
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
								title: "سجّل برقم الموبايل",
                                text: "أضف بيانات حسابك الأساسية وأنشئ كلمة مرور. المندوب يبدأ التسجيل من تطبيق الموبايل.",
							},
							{
								title: "افتح لوحتك على جهازك",
                                text: "ثبّت التطبيق أو استخدم المتصفح. البيانات مرتبطة بحسابك، وليست بالجهاز الذي سجّلت منه.",
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
                                    q: "هل تطبيق المطعم والشركة للموبايل أم للكمبيوتر؟",
                                    a: "متاح للموبايل والكمبيوتر معًا. يمكنك تثبيته على Android أو iPhone، وعلى الكمبيوتر من Chrome أو Edge. ادخل بنفس الحساب للوصول إلى نفس البيانات.",
                                },
                                {
                                    q: "هل أحتاج إلى حساب جديد لكل جهاز؟",
                                    a: "لا. استخدم نفس نوع الحساب ورقم الموبايل وكلمة المرور. بياناتك محفوظة في قاعدة بيانات المنصة وتظهر عند دخولك من أي جهاز متصل بالإنترنت.",
                                },
                                {
                                    q: "كيف يبدأ المندوب؟",
                                    a: "افتح صفحة التطبيق، واختر مندوب توصيل، ثم ثبّت التطبيق على الموبايل وسجّل من داخله. إذا كان متصفحك لا يدعم التثبيت، يمكنك إكمال التسجيل والاستخدام من صفحة التطبيق.",
                                },
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
