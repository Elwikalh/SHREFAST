import { ShareFastMark } from "../brand/share-fast-mark";
import SiteMotion from "./site-motion";
import Link from "next/link";
import {
	ArrowLeft,
	Bike,
	Building2,
	ChevronDown,
	CircleCheck,
    MapPin,
    Phone,
    PackageCheck,
	Monitor,
	Smartphone,
	Download,
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
		<SiteMotion className={`${styles.site} ${styles.polishedSite} ${styles.merchantLanding}`}>
			<a href="#main-content" className={styles.skip}>
				انتقل للمحتوى
			</a>
			<SiteHeader />
			<main id="main-content">
				<section className={styles.hero}>
					<div className={styles.heroCopy}>
						<span className={styles.eyebrow}>
							<span className={styles.statusDot} /> للمطاعم والأنشطة التجارية
						</span>
						<h1>
							طلبك جاهز؟
							<br />
							<span>اطلب مندوب.</span>
						</h1>
						<p className={styles.heroDescription}>
							سجّل عنوان مطعمك مرة واحدة. بعد كده، أضف بيانات العميل، شوف رسوم التوصيل، وأكّد الطلب — من الموبايل أو الكمبيوتر.
						</p>
						<div className={styles.ctaRow}>
							<Link href="/request" className={styles.primary}>
                                اطلب مندوب <Bike size={19} />
							</Link>
							<Link href="/register?role=merchant&intent=request" className={styles.secondary}>
                                سجّل مطعمك <ArrowLeft size={18} />
                            </Link>
						</div>
						<div className={styles.heroNotes}>
							<span>
								<Monitor size={17} /> موبايل وكمبيوتر، نفس الحساب
							</span>
							<span>
								<ShieldCheck size={17} /> الرسوم واضحة قبل التأكيد
							</span>
						</div>
					</div>
                    <div className={`${styles.heroArt} ${styles.requestBanner}`} aria-label="بنر طلب مندوب من المطعم إلى العميل">
                        <div className={styles.bannerTop}><span>SHARE FAST</span><span>طلب سريع. متابعة واضحة.</span></div>
                        <h2>من مطعمك،<br /><span>لباب العميل.</span></h2>
                        <div className={styles.bannerRoute} aria-hidden="true"><div className={styles.bannerStop}><Store size={30} /><span>مطعمك</span></div><span className={styles.bannerConnector} /><div className={styles.bannerMark}><ShareFastMark size={118} /></div><span className={styles.bannerConnector} /><div className={styles.bannerStop}><MapPin size={30} /><span>العميل</span></div></div>
                        <div className={styles.bannerBottom}><div><b>عنوان مطعمك محفوظ.</b><p>ابدأ طلبك من غير ما تعيد بيانات نشاطك.</p></div><PackageCheck size={28} /></div>
                        <div className={styles.bannerDisclaimer}><span>معاينة توضيحية</span><span>القبول حسب التغطية وتوافر المناديب.</span></div>
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
                <section className={styles.restaurantBanner} data-reveal aria-labelledby="work-story-title">
                    <div><span className={styles.eyebrow}>بسيطة من أول طلب</span><h2 id="work-story-title">وقت المطبخ للمطبخ.<br />وطلب المندوب في 3 بيانات.</h2><p>عنوان الاستلام من حساب مطعمك. المطلوب لكل أوردر هو بيانات العميل فقط، ثم مراجعة الرسوم وتأكيد الإرسال.</p><Link href="/request" className={styles.primary}>افتح طلب مندوب <ArrowLeft size={19} /></Link></div>
                    <div className={styles.bannerFields}><ol><li><span>01</span><Phone size={22} /><b>رقم موبايل العميل</b></li><li><span>02</span><MapPin size={22} /><b>منطقة التسليم</b></li><li><span>03</span><Store size={22} /><b>العنوان بالتفصيل</b></li></ol><div className={styles.bannerConfirm}><CircleCheck size={22} /><span>راجع الرسوم. تأكيد واحد لإرسال الطلب.</span></div></div>
                </section>
				<section id="solutions" className={styles.section}>
					<div className={styles.sectionIntro} data-reveal>
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
                            <article key={role} className={styles.solutionCard} data-reveal>
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
                <section id="devices" className={styles.deviceSection} data-reveal aria-labelledby="devices-title">
                    <div className={styles.deviceIntro}>
                        <span className={styles.eyebrow}>للمطاعم والأنشطة وشركات التوصيل</span>
                        <h2 id="devices-title">حساب واحد.<br />{" "}على الموبايل والكمبيوتر.</h2>
                        <p>ابدأ على جهاز، وأكمل على الآخر. ادخل بنفس رقم الموبايل وكلمة المرور لتصل إلى نفس لوحة الحساب وبياناتك المحفوظة.</p>
                        <Link href="/app" className={styles.primary}>تثبيت التطبيق <Download size={18} /></Link>
                    </div>
                    <div className={styles.devicePanels}>
                        <div className={styles.devicePanel}><span className={styles.deviceIcon}><Smartphone size={30} /></span><h3>على الموبايل</h3><p>لوحة نشاطك أو شركتك على الموبايل. تابع الطلبات أينما كنت، بنفس بيانات حسابك.</p><span className={styles.deviceAudience}>للمطعم والنشاط وشركة التوصيل</span></div>
                        <div className={styles.devicePanel}><span className={styles.deviceIcon}><Monitor size={30} /></span><h3>على الكمبيوتر</h3><p>مساحة أوضح لإدارة الطلبات والفريق، في نافذة مستقلة على سطح المكتب.</p><span className={styles.deviceAudience}>نفس الحساب. نفس البيانات.</span></div>
                        <div className={styles.deviceAssurance}><CircleCheck size={21} /><p>لا تحتاج إلى حساب جديد لكل جهاز. وللمندوب، تبدأ التجربة من تطبيق الموبايل.</p></div>
                    </div>
                </section>
				<section id="how" className={styles.howSection} data-reveal>
					<div className={styles.howHeading}>
						<span className={styles.eyebrow}>بداية واضحة</span>
						<h2>
							من الطلب الجاهز،
							<br />
							إلى متابعة المندوب.
						</h2>
						<p>
							الزر يفتح نموذج الطلب مباشرة لحساب المطعم المسجّل. لو دي أول مرة، سجّل نشاطك وعنوانه ثم أكمل طلبك.
						</p>
						<Link href="/request" className={styles.secondary}>
                            افتح طلب مندوب <ArrowLeft size={18} />
						</Link>
					</div>
					<ol className={styles.steps}>
						{[
							{
								title: "افتح طلب مندوب",
								text: "اضغط الزر من الموقع. لو أنت مسجّل دخول، يفتح طلبك بعنوان نشاطك المحفوظ.",
							},
							{
								title: "أضف بيانات العميل",
                                text: "رقم الموبايل، منطقة التسليم، والعنوان بالتفصيل. وقت التحضير اختياري لو الطلب مش جاهز.",
							},
							{
								title: "راجع الرسوم وأكّد",
                                text: "شوف رسوم التوصيل قبل إرسال الطلب، وبعد التسجيل تابع حالة القبول والتوصيل من حسابك.",
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
					<div className={styles.faqLayout} data-reveal>
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
				<section className={styles.finalCta} data-reveal>
					<span className={styles.eyebrow}>
						<Sparkles size={16} /> خطوتك التالية
					</span>
					<h2>
						أوردر جديد؟
						<br />
						اطلب مندوب من مكانك.
					</h2>
					<Link href="/request" className={styles.primary}>
                        اطلب مندوب الآن <ArrowLeft size={19} />
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
		</SiteMotion>
	);
}
