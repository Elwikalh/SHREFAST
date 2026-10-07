import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/wasl-api";
// Recovered from the original shipped portal; keep behavior while incrementally refactoring.
import * as ReactNamespace from "react";
import * as jsxRuntime from "react/jsx-runtime";
import S from "./icon";
const we = ReactNamespace;
var su = ReactNamespace;
var z = jsxRuntime;
function q0({ logo: e, name: a, role: t, nav: l, cur: u, go: o, footNote: n }) {
	return (0, z.jsxs)("aside", {
		className: "side",
		children: [
			(0, z.jsxs)("div", {
				className: "brand",
				children: [
					(0, z.jsx)("div", { className: "logo", children: e }),
					(0, z.jsxs)("div", {
						children: [
							(0, z.jsx)("b", { children: a }),
							(0, z.jsx)("small", { children: t }),
						],
					}),
				],
			}),
			l.map((i) =>
				(0, z.jsxs)(
					su.default.Fragment,
					{
						children: [
							(0, z.jsx)("div", { className: "navlab", children: i.label }),
							i.items.map((r) =>
								(0, z.jsxs)(
									"button",
									{
										className: "nav" + (u === r.id ? " on" : ""),
										title: r.name,
										"aria-label": r.name,
										"aria-current": u === r.id ? "page" : undefined,
										onClick: () => o(r.id),
										children: [
											(0, z.jsx)(S, { n: r.icon }),
											(0, z.jsx)("span", { children: r.name }),
											r.pip
												? (0, z.jsx)("span", {
														className: "pip",
														children: r.pip,
													})
												: null,
										],
									},
									r.id,
								),
							),
						],
					},
					i.label,
				),
			),
			(0, z.jsxs)("div", {
				className: "foot",
				children: [
					(0, z.jsx)("b", { children: n.title }),
					(0, z.jsx)("p", { children: n.text }),
				],
			}),
		],
	});
}
function De({ title: e, sub: a, children: t, extra: l }) {
	return (0, z.jsxs)("div", {
		className: "topbar",
		children: [
			(0, z.jsxs)("div", {
				children: [
					(0, z.jsx)("h1", { children: e }),
					(0, z.jsx)("div", { className: "sub", children: a }),
				],
			}),
			(0, z.jsx)("div", { className: "sp" }),
			l,
			t,
			(0, z.jsx)("button", {
				className: "iconbtn",
				type: "button",
				"aria-label": "الإشعارات",
				children: (0, z.jsx)(S, { n: "bell", s: 17 }),
			}),
			(0, z.jsx)("div", { className: "avatar", children: "SX" }),
		],
	});
}
function H0() {
	let [e, a] = su.default.useState(new Date());
	su.default.useEffect(() => {
		let l = setInterval(() => a(new Date()), 3e4);
		return () => clearInterval(l);
	}, []);
	let t = e.toLocaleTimeString("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
	});
	return (0, z.jsxs)("span", {
		className: "tag",
		style: { display: "inline-flex", alignItems: "center", gap: 6 },
		children: [(0, z.jsx)(S, { n: "clock", s: 12 }), t],
	});
}
function F({ title: e, action: a, children: t, pad: l }) {
	return (0, z.jsxs)("div", {
		className: "card",
		children: [
			e !== void 0 &&
				(0, z.jsxs)("div", {
					className: "hd",
					children: [
						(0, z.jsx)("h3", { children: e }),
						(0, z.jsx)("div", { className: "sp" }),
						a,
					],
				}),
			(0, z.jsx)("div", {
				className: "bd",
				style: l === !1 ? { padding: 0 } : null,
				children: t,
			}),
		],
	});
}
function td({ value: e, dur: a = 900 }) {
	let [t, l] = su.default.useState(0),
		u = su.default.useRef();
	return (
		su.default.useEffect(() => {
			let o = performance.now(),
				n = (i) => {
					let r = Math.min(1, (i - o) / a);
					(l(Math.round(e * (1 - Math.pow(1 - r, 3)))),
						r < 1 && (u.current = requestAnimationFrame(n)));
				};
			return (
				(u.current = requestAnimationFrame(n)),
				() => cancelAnimationFrame(u.current)
			);
		}, [e]),
		(0, z.jsx)("span", { children: t.toLocaleString("en-US") })
	);
}
function he({
	icon: e,
	color: a,
	bg: t,
	val: l,
	label: u,
	trend: o,
	up: n,
	spark: i,
	sparkColor: r,
}) {
	return (0, z.jsxs)("div", {
		className: "card stat",
		children: [
			(0, z.jsx)("div", {
				className: "ic",
				style: { background: t, color: a },
				children: (0, z.jsx)(S, { n: e, s: 20 }),
			}),
			(0, z.jsx)("div", {
				className: "v",
				children: typeof l == "number" ? (0, z.jsx)(td, { value: l }) : l,
			}),
			(0, z.jsx)("div", { className: "l", children: u }),
			o &&
				(0, z.jsxs)("span", {
					className: "trend " + (n ? "up" : "down"),
					children: [(0, z.jsx)(S, { n: "trend", s: 11 }), " ", o],
				}),
			i && (0, z.jsx)(At, { data: i, color: r || a, h: 34 }),
		],
	});
}
function E({ c: e, children: a, icon: t, blink: l }) {
	return (0, z.jsxs)("span", {
		className: "badge " + e + (l ? " blink" : ""),
		children: [t && (0, z.jsx)(S, { n: t, s: 12 }), a],
	});
}
function Uu({ on: e, onChange: a }) {
	return (0, z.jsx)("button", {
		className: "tgl" + (e ? " on" : ""),
		onClick: () => a(!e),
		"aria-label": "تبديل",
	});
}
function At({ data: e, color: a = "#0d9488", h: t = 46, fill: l = !0 }) {
	let o = Math.max(...e),
		n = Math.min(...e),
		r = e
			.map((I, h) => [
				h * (300 / (e.length - 1)),
				t - 6 - ((I - n) / (o - n || 1)) * (t - 12),
			])
			.map((I, h) => (h ? "L" : "M") + I[0].toFixed(1) + " " + I[1].toFixed(1))
			.join(" "),
		y = r + ` L300 ${t} L0 ${t} Z`,
		C = "g" + a.replace(/[^a-z0-9]/gi, "") + t;
	return (0, z.jsxs)("svg", {
		className: "spark",
		viewBox: `0 0 300 ${t}`,
		preserveAspectRatio: "none",
		style: { height: t },
		children: [
			(0, z.jsx)("defs", {
				children: (0, z.jsxs)("linearGradient", {
					id: C,
					x1: "0",
					y1: "0",
					x2: "0",
					y2: "1",
					children: [
						(0, z.jsx)("stop", {
							offset: "0",
							stopColor: a,
							stopOpacity: l ? ".3" : "0",
						}),
						(0, z.jsx)("stop", {
							offset: "1",
							stopColor: a,
							stopOpacity: "0",
						}),
					],
				}),
			}),
			l && (0, z.jsx)("path", { d: y, fill: `url(#${C})` }),
			(0, z.jsx)("path", {
				d: r,
				fill: "none",
				stroke: a,
				strokeWidth: "2.4",
				strokeLinecap: "round",
				strokeLinejoin: "round",
			}),
		],
	});
}
function pl({ data: e, labels: a, color: t = "#0d9488" }) {
	let l = Math.max(...e);
	return (0, z.jsxs)("div", {
		children: [
			(0, z.jsx)("div", {
				className: "bar",
				children: e.map((u, o) =>
					(0, z.jsx)(
						"i",
						{
							style: {
								height: (u / l) * 100 + "%",
								background: `linear-gradient(180deg,${t}dd,${t})`,
							},
							"data-v": u,
						},
						o,
					),
				),
			}),
			(0, z.jsx)("div", {
				className: "row",
				style: { marginTop: 10 },
				children: a.map((u, o) =>
					(0, z.jsx)(
						"span",
						{
							style: {
								flex: 1,
								textAlign: "center",
								fontSize: 10.5,
								color: "var(--mut)",
								fontWeight: 700,
							},
							children: u,
						},
						o,
					),
				),
			}),
		],
	});
}
function jo({ segs: e, size: a = 130, center: t, sub: l }) {
	let u = e.reduce((r, y) => r + y.v, 0),
		o = 0,
		n = 52,
		i = 2 * Math.PI * n;
	return (0, z.jsxs)("div", {
		style: { position: "relative", width: a, height: a, margin: "0 auto" },
		children: [
			(0, z.jsxs)("svg", {
				viewBox: "0 0 140 140",
				width: a,
				height: a,
				children: [
					(0, z.jsx)("circle", {
						cx: "70",
						cy: "70",
						r: n,
						fill: "none",
						stroke: "#eef1f7",
						strokeWidth: "15",
					}),
					e.map((r, y) => {
						let C = r.v / u,
							I = (0, z.jsx)(
								"circle",
								{
									cx: "70",
									cy: "70",
									r: n,
									fill: "none",
									stroke: r.c,
									strokeWidth: "15",
									strokeDasharray: `${C * i} ${i}`,
									strokeDashoffset: -o * i,
									strokeLinecap: "round",
									transform: "rotate(-90 70 70)",
								},
								y,
							);
						return ((o += C), I);
					}),
				],
			}),
			(0, z.jsxs)("div", {
				style: {
					position: "absolute",
					inset: 0,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
				},
				children: [
					(0, z.jsx)("b", {
						style: { fontSize: 21, fontVariantNumeric: "tabular-nums" },
						children: t,
					}),
					l &&
						(0, z.jsx)("span", {
							style: { fontSize: 10, color: "var(--mut)", fontWeight: 700 },
							children: l,
						}),
				],
			}),
		],
	});
}
function of({ markers: e, height: a = 300, legend: t, badge: l }) {
	return (0, z.jsxs)("div", {
		className: "mapbox",
		style: { height: a },
		children: [
			(0, z.jsx)("div", {
				className: "map-water",
				style: { left: "-6%", top: "62%", width: "34%", height: "38%" },
			}),
			(0, z.jsx)("div", {
				className: "map-park",
				style: { right: "6%", top: "8%", width: "16%", height: "22%" },
			}),
			(0, z.jsx)("div", {
				className: "map-park",
				style: { left: "28%", top: "68%", width: "13%", height: "18%" },
			}),
			(0, z.jsx)("div", {
				className: "map-park",
				style: { right: "24%", bottom: "6%", width: "11%", height: "14%" },
			}),
			[
				{ t: "h", top: "22%", l: "0", w: "100%", h: 14 },
				{ t: "h", top: "58%", l: "0", w: "100%", h: 10 },
				{ t: "h", top: "80%", l: "0", w: "100%", h: 16 },
				{ t: "v", l: "18%", top: "0", h: "100%", w: 12 },
				{ t: "v", l: "45%", top: "0", h: "100%", w: 16 },
				{ t: "v", l: "72%", top: "0", h: "100%", w: 10 },
				{ t: "d", l: "30%", top: "35%", w: "55%", h: 8 },
			].map((o, n) =>
				(0, z.jsx)(
					"div",
					{
						className: "map-road",
						style:
							o.t === "h"
								? { top: o.top, left: o.l, width: o.w, height: o.h }
								: o.t === "v"
									? { left: o.l, top: o.top, height: o.h, width: o.w }
									: {
											left: o.l,
											top: o.top,
											width: o.w,
											height: o.h,
											transform: "rotate(-24deg)",
										},
					},
					n,
				),
			),
			e.map((o, n) =>
				(0, z.jsx)(
					"div",
					{
						className: "mk " + o.k,
						style: {
							right: o.x + "%",
							top: o.y + "%",
							transitionDelay: n * 60 + "ms",
						},
						title: o.name,
						children: (0, z.jsx)(S, { n: o.icon || "bike", s: 13 }),
					},
					n,
				),
			),
			l && (0, z.jsx)("div", { className: "map-badge", children: l }),
			t &&
				(0, z.jsx)("div", {
					className: "map-legend",
					children: t.map((o, n) =>
						(0, z.jsxs)(
							"span",
							{
								children: [
									(0, z.jsx)("i", {
										className: "dot8",
										style: { background: o.c },
									}),
									o.t,
								],
							},
							n,
						),
					),
				}),
		],
	});
}
function Xt({ cur: e, labels: a }) {
	return (0, z.jsx)("div", {
		className: "steps",
		children: a.map((t, l) =>
			(0, z.jsxs)(
				"div",
				{
					className: "step" + (l < e ? " done" : l === e ? " cur" : ""),
					children: [
						(0, z.jsx)("div", {
							className: "b",
							children: l < e ? (0, z.jsx)(S, { n: "check", s: 12 }) : l + 1,
						}),
						t,
					],
				},
				l,
			),
		),
	});
}
function Zo({ title: e, onClose: a, children: t, footer: l }) {
	return (0, z.jsx)("div", {
		className: "ovl",
		onClick: (u) => {
			u.target === u.currentTarget && a();
		},
		children: (0, z.jsxs)("div", {
			className: "modal",
			children: [
				(0, z.jsxs)("div", {
					className: "mh",
					children: [
						(0, z.jsx)("h3", { children: e }),
						(0, z.jsx)("div", { style: { flex: 1 } }),
						(0, z.jsx)("button", {
							className: "iconbtn",
							onClick: a,
							children: (0, z.jsx)(S, { n: "x", s: 16 }),
						}),
					],
				}),
				(0, z.jsx)("div", { className: "mb", children: t }),
				l && (0, z.jsx)("div", { className: "mf", children: l }),
			],
		}),
	});
}
var se = (e) => e.toLocaleString("en-US") + " ج";
function i2(e) {
	return e
		.trim()
		.split(" ")
		.slice(0, 2)
		.map((a) => a[0])
		.join("");
}
function lt({
	name: e,
	size: a = 38,
	bg: t = "linear-gradient(135deg,#2dd4bf,#0d9488)",
}) {
	return (0, z.jsx)("div", {
		className: "avatar",
		style: {
			width: a,
			height: a,
			background: t,
			borderRadius: Math.round(a * 0.32),
			fontSize: a * 0.34,
			boxShadow: "0 4px 10px -4px rgba(10,15,30,.3)",
		},
		children: i2(e),
	});
}
function Dm({
	value: e,
	onChange: a,
	placeholder: t = "بحث…",
	width: l = 220,
}) {
	return (0, z.jsxs)("div", {
		style: { position: "relative", width: l, minWidth: 0 },
		children: [
			(0, z.jsx)("span", {
				style: {
					position: "absolute",
					right: 11,
					top: "50%",
					transform: "translateY(-50%)",
					color: "var(--mut2)",
					display: "flex",
				},
				children: (0, z.jsx)(S, { n: "search", s: 14 }),
			}),
			(0, z.jsx)("input", {
				className: "inp",
				value: e,
				onChange: (u) => a(u.target.value),
				placeholder: t,
				style: {
					padding: "8px 34px 8px 12px",
					borderRadius: 11,
					fontSize: 12.5,
					border: "1.5px solid var(--line)",
				},
			}),
			e &&
				(0, z.jsx)("button", {
					onClick: () => a(""),
					style: {
						position: "absolute",
						left: 6,
						top: "50%",
						transform: "translateY(-50%)",
						color: "var(--mut2)",
						padding: 4,
					},
					children: (0, z.jsx)(S, { n: "x", s: 13 }),
				}),
		],
	});
}
function qu({ icon: e = "box", title: a, sub: t, children: l }) {
	return (0, z.jsxs)("div", {
		style: { padding: 34, textAlign: "center" },
		children: [
			(0, z.jsx)("div", {
				className: "ico",
				style: {
					width: 54,
					height: 54,
					margin: "0 auto 12px",
					background: "var(--brandSoft)",
					color: "var(--brandInk)",
				},
				children: (0, z.jsx)(S, { n: e, s: 24 }),
			}),
			(0, z.jsx)("b", { children: a }),
			t &&
				(0, z.jsx)("div", {
					className: "sub",
					style: { marginTop: 4 },
					children: t,
				}),
			l && (0, z.jsx)("div", { style: { marginTop: 12 }, children: l }),
		],
	});
}
function hl({ tip: e }) {
	return (0, z.jsx)("span", {
		className: "demotag",
		title:
			e ||
			"بيانات استعراضية داخلية — تُستبدل تلقائيًا ببياناتكم الحقيقية عند توفرها",
		children: "استعراض",
	});
}
function ld({ down: e, onRetry: a }) {
	return e
		? (0, z.jsxs)("div", {
				className: "connbanner",
				children: [
					(0, z.jsx)(S, { n: "alert", s: 16 }),
					(0, z.jsxs)("div", {
						style: { flex: 1 },
						children: [
							(0, z.jsx)("b", {
								children: "قاعدة البيانات غير متصلة حاليًا",
							}),
							(0, z.jsxs)("span", {
								children: [
									" — البيانات المعروضة الآن استعراضية. تأكد من إعداد ",
									(0, z.jsx)("b", { children: "DATABASE_URL" }),
									" في متغيرات الخدمة ثم أعد النشر.",
								],
							}),
						],
					}),
					(0, z.jsxs)("button", {
						className: "btn btn-o btn-sm",
						onClick: a,
						children: [
							(0, z.jsx)(S, { n: "refresh", s: 13 }),
							" إعادة المحاولة",
						],
					}),
				],
			})
		: null;
}
function Om({ text: e, toast: a, label: t }) {
	let [l, u] = su.default.useState(!1);
	return (0, z.jsxs)("button", {
		className: "btn btn-o btn-sm",
		onClick: () => {
			try {
				navigator.clipboard.writeText(e);
			} catch {}
			(u(!0),
				a && a("تم نسخ " + (t || "الكود")),
				setTimeout(() => u(!1), 1600));
		},
		children: [
			(0, z.jsx)(S, { n: l ? "check" : "file", s: 13 }),
			" ",
			l ? "تم النسخ" : t || "نسخ",
		],
	});
}
var Pa = ReactNamespace;
var ud = [
		"المعادي",
		"مصر الجديدة",
		"مدينة نصر",
		"التجمع الخامس",
		"الهرم",
		"وسط البلد",
		"المقطم",
		"الرحاب",
		"المهندسين",
		"شبرا",
	],
	Hu = [
		{
			id: 1,
			name: "أحمد سيد",
			phone: "0100 123 4478",
			vehicle: "bike",
			zone: "المعادي",
			status: "busy",
			rating: 4.9,
			trips: 214,
			earn: 6420,
			aff: "free",
			since: "2025-03",
		},
		{
			id: 2,
			name: "محمود عبد الرحمن",
			phone: "0111 908 2214",
			vehicle: "bike",
			zone: "مصر الجديدة",
			status: "free",
			rating: 4.8,
			trips: 187,
			earn: 5610,
			aff: "co1",
			since: "2025-01",
		},
		{
			id: 3,
			name: "كريم مصطفى",
			phone: "0122 445 7789",
			vehicle: "moto",
			zone: "مدينة نصر",
			status: "free",
			rating: 4.7,
			trips: 143,
			earn: 4290,
			aff: "free",
			since: "2025-05",
		},
		{
			id: 4,
			name: "إسلام فتحي",
			phone: "0106 778 1190",
			vehicle: "bike",
			zone: "التجمع الخامس",
			status: "busy",
			rating: 4.9,
			trips: 266,
			earn: 7980,
			aff: "co0",
			since: "2024-11",
		},
		{
			id: 5,
			name: "يوسف الشريف",
			phone: "0128 331 6620",
			vehicle: "moto",
			zone: "الهرم",
			status: "free",
			rating: 4.5,
			trips: 98,
			earn: 2940,
			aff: "free",
			since: "2025-07",
		},
		{
			id: 6,
			name: "مصطفى الغزالي",
			phone: "0102 556 8834",
			vehicle: "car",
			zone: "المهندسين",
			status: "free",
			rating: 4.8,
			trips: 171,
			earn: 6130,
			aff: "co1",
			since: "2025-02",
		},
		{
			id: 7,
			name: "عمر حسني",
			phone: "0114 209 5567",
			vehicle: "bike",
			zone: "وسط البلد",
			status: "busy",
			rating: 4.6,
			trips: 132,
			earn: 3960,
			aff: "m2",
			since: "2025-04",
		},
		{
			id: 8,
			name: "طه عبد الله",
			phone: "0100 887 3312",
			vehicle: "moto",
			zone: "الرحاب",
			status: "free",
			rating: 4.7,
			trips: 158,
			earn: 4740,
			aff: "co2",
			since: "2025-06",
		},
		{
			id: 9,
			name: "حسن الجمل",
			phone: "0115 664 2290",
			vehicle: "bike",
			zone: "المقطم",
			status: "free",
			rating: 4.4,
			trips: 87,
			earn: 2610,
			aff: "free",
			since: "2025-08",
		},
		{
			id: 10,
			name: "أنس رضوان",
			phone: "0127 410 9933",
			vehicle: "moto",
			zone: "مدينة نصر",
			status: "busy",
			rating: 4.8,
			trips: 201,
			earn: 6030,
			aff: "co0",
			since: "2025-01",
		},
		{
			id: 11,
			name: "زياد عادل",
			phone: "0109 235 7745",
			vehicle: "bike",
			zone: "المعادي",
			status: "free",
			rating: 4.6,
			trips: 119,
			earn: 3570,
			aff: "free",
			since: "2025-09",
		},
		{
			id: 12,
			name: "بلال رمضان",
			phone: "0112 780 4468",
			vehicle: "moto",
			zone: "شبرا",
			status: "free",
			rating: 4.5,
			trips: 105,
			earn: 3150,
			aff: "co2",
			since: "2025-06",
		},
		{
			id: 13,
			name: "شريف نبيل",
			phone: "0103 998 2217",
			vehicle: "car",
			zone: "التجمع الخامس",
			status: "free",
			rating: 4.9,
			trips: 243,
			earn: 8700,
			aff: "m1",
			since: "2024-12",
		},
		{
			id: 14,
			name: "مينا جورج",
			phone: "0110 552 3390",
			vehicle: "moto",
			zone: "مصر الجديدة",
			status: "busy",
			rating: 4.7,
			trips: 164,
			earn: 4920,
			aff: "co1",
			since: "2025-03",
		},
		{
			id: 15,
			name: "محمد ثابت",
			phone: "0121 660 8814",
			vehicle: "bike",
			zone: "الهرم",
			status: "off",
			rating: 4.3,
			trips: 76,
			earn: 2280,
			aff: "free",
			since: "2025-10",
		},
	],
	gl = [
		{
			id: "m1",
			name: "مطعم زيتونة",
			type: "مطعم",
			zone: "المعادي",
			orders: 412,
			plan: "pro",
			status: "active",
			aff: "platform",
			sub: "متجدد 2026-11-01",
			couriers: 2,
		},
		{
			id: "m2",
			name: "بيتزا كورنر",
			type: "مطعم",
			zone: "مدينة نصر",
			orders: 358,
			plan: "pro",
			status: "active",
			aff: "co0",
			sub: "متجدد 2026-10-18",
			couriers: 1,
		},
		{
			id: "m3",
			name: "صيدلية النور",
			type: "صيدلية",
			zone: "مصر الجديدة",
			orders: 290,
			plan: "basic",
			status: "active",
			aff: "platform",
			sub: "متجدد 2026-10-25",
			couriers: 0,
		},
		{
			id: "m4",
			name: "سوبر ماركت الأهرام",
			type: "سوبر ماركت",
			zone: "الهرم",
			orders: 244,
			plan: "basic",
			status: "active",
			aff: "platform",
			sub: "متجدد 2026-11-02",
			couriers: 1,
		},
		{
			id: "m5",
			name: "مطعم الشام",
			type: "مطعم",
			zone: "وسط البلد",
			orders: 520,
			plan: "enterprise",
			status: "active",
			aff: "co1",
			sub: "متجدد 2026-10-30",
			couriers: 0,
		},
		{
			id: "m6",
			name: "صيدلية الصفا",
			type: "صيدلية",
			zone: "التجمع الخامس",
			orders: 180,
			plan: "basic",
			status: "active",
			aff: "platform",
			sub: "متجدد 2026-11-05",
			couriers: 0,
		},
		{
			id: "m7",
			name: "كوفي لاينج",
			type: "كافيه",
			zone: "المهندسين",
			orders: 203,
			plan: "pro",
			status: "trial",
			aff: "platform",
			sub: "تجربة — 9 أيام",
			couriers: 0,
		},
		{
			id: "m8",
			name: "سوبر ماركت الرحاب",
			type: "سوبر ماركت",
			zone: "الرحاب",
			orders: 157,
			plan: "basic",
			status: "active",
			aff: "co2",
			sub: "متجدد 2026-10-22",
			couriers: 2,
		},
		{
			id: "m9",
			name: "مطعم البحر الأحمر",
			type: "مطعم",
			zone: "المقطم",
			orders: 131,
			plan: "pro",
			status: "active",
			aff: "platform",
			sub: "متجدد 2026-10-28",
			couriers: 3,
		},
		{
			id: "m10",
			name: "حلويات المملكة",
			type: "حلويات",
			zone: "المعادي",
			orders: 98,
			plan: "basic",
			status: "paused",
			aff: "platform",
			sub: "معلّق",
			couriers: 0,
		},
	],
	od = [
		{
			id: "co0",
			name: "سرعة إكسبرس",
			city: "القاهرة الكبرى",
			couriers: 32,
			clients: 18,
			plan: "enterprise",
			orders: 1840,
			rating: 4.8,
			status: "active",
			since: "2024-09",
		},
		{
			id: "co1",
			name: "النقلة الذهبية",
			city: "القاهرة والجيزة",
			couriers: 24,
			clients: 11,
			plan: "enterprise",
			orders: 1206,
			rating: 4.7,
			status: "active",
			since: "2025-01",
		},
		{
			id: "co2",
			name: "دلفين ديليفري",
			city: "القاهرة الجديدة",
			couriers: 15,
			clients: 7,
			plan: "pro",
			orders: 645,
			rating: 4.6,
			status: "active",
			since: "2025-06",
		},
	],
	X0 = [
		{
			id: "basic",
			name: "الأساسية",
			mer: "299 ج/شهور",
			cour: "199 ج/شهر",
			color: "b-blue",
			feats: [
				"إدارة طلبات التوصيل",
				"تطبيق مندوب للموظفين",
				"تتبع مباشر للطلبات",
				"تقارير أسبوعية",
			],
		},
		{
			id: "pro",
			name: "الاحترافية",
			mer: "549 ج/شهر",
			cour: "349 ج/شهر",
			color: "b-teal",
			feats: [
				"كل مزايا الأساسية",
				"مطابقة ذكية للمناديب",
				"مناديب مستقلون عند الضغط",
				"مناطق رسوم ثابتة",
				"تقارير وتحليلات متقدمة",
			],
		},
		{
			id: "enterprise",
			name: "المؤسسية",
			mer: "حسب الاتفاق",
			cour: "حسب الاتفاق",
			color: "b-violet",
			feats: [
				"كل مزايا الاحترافية",
				"ربط مع العملاء والدعوات",
				"فريق توزيع مخصص",
				"مدير حساب ودعم فوري",
				"تكاملات API",
			],
		},
	];
var Y0 = [
		{
			id: "#4178",
			merchant: "مطعم زيتونة",
			from: "المعادي — شارع 9",
			to: "التجمع الخامس — التلال أ",
			fee: 70,
			status: "heading",
			courier: "أحمد سيد",
			eta: "12 د",
			zone: "التجمع الخامس",
			pay: "كاش",
		},
		{
			id: "#4177",
			merchant: "صيدلية النور",
			from: "مصر الجديدة — الجيش",
			to: "مصر الجديدة —شارع الميرغني",
			fee: 35,
			status: "delivered",
			courier: "محمود عبد الرحمن",
			eta: "تم",
			zone: "مصر الجديدة",
			pay: "بطاقة",
		},
		{
			id: "#4176",
			merchant: "بيتزا كورنر",
			from: "مدينة نصر — عباس العقاد",
			to: "مدينة نصر — الحي العاشر",
			fee: 40,
			status: "pickup",
			courier: "أنس رضوان",
			eta: "18 د",
			zone: "مدينة نصر",
			pay: "كاش",
		},
		{
			id: "#4175",
			merchant: "سوبر ماركت الأهرام",
			from: "الهرم — شارع النصر",
			to: "الهرم — أبراج الأندلس",
			fee: 45,
			status: "accepted",
			courier: "يوسف الشريف",
			eta: "24 د",
			zone: "الهرم",
			pay: "كاش",
		},
		{
			id: "#4174",
			merchant: "مطعم الشام",
			from: "وسط البلد — طلعت حرب",
			to: "المهندسين — جامعة الدول",
			fee: 55,
			status: "delivered",
			courier: "مصطفى الغزالي",
			eta: "تم",
			zone: "المهندسين",
			pay: "محفظة",
		},
		{
			id: "#4173",
			merchant: "صيدلية الصفا",
			from: "التجمع الخامس — الخدمة",
			to: "الرحاب — بوابة 4",
			fee: 50,
			status: "delivered",
			courier: "طه عبد الله",
			eta: "تم",
			zone: "الرحاب",
			pay: "بطاقة",
		},
		{
			id: "#4172",
			merchant: "مطعم البحر الأحمر",
			from: "المقطم — دشنا",
			to: "المقطم — المقاولون",
			fee: 40,
			status: "delivered",
			courier: "حسن الجمل",
			eta: "تم",
			zone: "المقطم",
			pay: "كاش",
		},
	],
	nf = [
		{ zone: "المعادي", fee: 45 },
		{
			zone: "مصر الجديدة",
			fee: 40,
		},
		{ zone: "مدينة نصر", fee: 40 },
		{
			zone: "التجمع الخامس",
			fee: 60,
		},
		{ zone: "الرحاب", fee: 60 },
		{ zone: "المقطم", fee: 55 },
		{ zone: "وسط البلد", fee: 50 },
	];
var j0 = [
		{ zone: "المعادي", min: 35 },
		{
			zone: "مصر الجديدة",
			min: 35,
		},
		{ zone: "مدينة نصر", min: 35 },
		{
			zone: "التجمع الخامس",
			min: 45,
		},
		{ zone: "الرحاب", min: 45 },
		{ zone: "الهرم", min: 40 },
		{ zone: "المقطم", min: 40 },
		{ zone: "وسط البلد", min: 35 },
		{
			zone: "المهندسين",
			min: 40,
		},
		{ zone: "شبرا", min: 40 },
	],
	Rm = [
		{
			id: 1,
			merchant: "مطعم لافا جريل",
			zone: "المعادي",
			sent: "قبل يومين",
			status: "pending",
		},
		{
			id: 2,
			merchant: "سوبر ماركت النخبة",
			zone: "التجمع الخامس",
			sent: "قبل 5 أيام",
			status: "accepted",
		},
		{
			id: 3,
			merchant: "صيدلية الشفاء",
			zone: "مدينة نصر",
			sent: "قبل أسبوع",
			status: "accepted",
		},
		{
			id: 4,
			merchant: "بيت مذاق الشامي",
			zone: "الرحاب",
			sent: "قبل 3 أيام",
			status: "pending",
		},
		{
			id: 5,
			merchant: "ماركت ديلي فريش",
			zone: "المقطم",
			sent: "قبل أسبوعين",
			status: "declined",
		},
	],
	Yt = {
		searching: {
			t: "بحث عن مندوب",
			c: "b-amber",
		},
		accepted: {
			t: "تم القبول",
			c: "b-blue",
		},
		pickup: {
			t: "في الطريق للاستلام",
			c: "b-violet",
		},
		heading: {
			t: "في الطريق إلى العميل",
			c: "b-teal",
		},
		delivered: {
			t: "تم التوصيل",
			c: "b-green",
		},
		canceled: { t: "ملغي", c: "b-red" },
		refused: { t: "مرفوض", c: "b-red" },
		expired: { t: "انتهى", c: "b-gray" },
	},
	nd = {
		bike: "دراجة نارية",
		moto: "دراجة كهربائية",
		car: "سيارة",
	},
	Z0 = {
		free: "مندوب مستقل",
		co0: "سرعة إكسبرس",
		co1: "النقلة الذهبية",
		co2: "دلفين ديليفري",
		m1: "مطعم زيتونة",
		m2: "بيتزا كورنر",
	},
	Q0 = {
		مطعم: "store",
		صيدلية: "wallet",
		"سوبر ماركت": "box",
		كافيه: "clock",
		حلويات: "gift",
	},
	iu = {
		nearest: "أقرب مسافة",
		rating: "الأعلى تقييمًا",
		load: "الأقل تحميلًا",
		balanced: "متوازن (موصى به)",
	},
	sf = {
		auto: "تلقائي",
		manual: "يدوي",
	};
function fu(e, a, t = "balanced") {
	let l = (n) => (n.status === "busy" ? 2 : 0),
		u = (n) => (n.zone === a ? 0 : 10),
		o = (n) =>
			t === "nearest"
				? u(n) + (5 - n.rating) * 0.5
				: t === "rating"
					? (5 - n.rating) * 10 + u(n) * 0.3
					: t === "load"
						? l(n) * 10 + u(n) * 0.5
						: u(n) + l(n) * 2 + (5 - n.rating) * 1.5;
	return e
		.filter((n) => n.status !== "off")
		.map((n) => ({ ...n, score: o(n) }))
		.sort((n, i) => n.score - i.score);
}
var F0 = {
		المعادي: [29.96, 31.26],
		"مصر الجديدة": [30.09, 31.34],
		"مدينة نصر": [30.07, 31.32],
		"التجمع الخامس": [30.02, 31.44],
		الهرم: [29.99, 31.12],
		"وسط البلد": [30.05, 31.235],
		المقطم: [29.95, 31.32],
		الرحاب: [30.06, 31.47],
		المهندسين: [30.06, 31.2],
		شبرا: [30.1, 31.24],
		الدقي: [30.03, 31.21],
	},
	K0 = {
		المقطم: 4.5,
		"التجمع الخامس": 4.5,
		الرحاب: 3.5,
		المعادي: 3,
		الهرم: 3.5,
	},
	Qo = { base: 15, perKm: 2.5, min: 25, roadFactor: 1.3 },
	G0 = 111.32,
	f2 = 0.866;
function r2([e, a], [t, l]) {
	let u = (t - e) * G0,
		o = (l - a) * G0 * f2;
	return Math.sqrt(o * o + u * u);
}
function c2(e, a) {
	let t = F0[e] || V0[e],
		l = F0[a] || V0[a];
	return !t || !l
		? null
		: e === a
			? Math.round(Math.max(1, (K0[e] || 2.5) * 0.45) * 10) / 10
			: Math.round(r2(t, l) * Qo.roadFactor * 10) / 10;
}
var m2 = (e) => Math.max(Qo.min, Math.round(e / 5) * 5),
	P0 = (e) => m2(Qo.base + Qo.perKm * e);
function df({ merchantZone: e, destZone: a }) {
	let t = c2(e, a) ?? 8,
		l = K0[a] || 2.5,
		u = Math.max(1, t - l),
		o = t + l;
	return { km: t, min: P0(u), max: P0(o), base: Qo.base, perKm: Qo.perKm };
}
function sd(e) {
	return e.aff && e.aff !== "platform"
		? "company"
		: (e.couriers || 0) > 0
			? "own"
			: "network";
}
var J0 = {
		own: {
			label: "عنده مناديب",
			badge: "b-green",
			hint: "مناديبه الخاصين أولًا ثم الشبكة عند الضغط",
		},
		company: {
			label: "تابع لشركة توصيل",
			badge: "b-violet",
			hint: "حصري لشركته برسوم ثابتة",
		},
		network: {
			label: "يحتاج مناديب المنصة",
			badge: "b-amber",
			hint: "طلباته تروح لشبكة المستقلين مباشرة",
		},
	},
	du = [
		{
			id: "cairo",
			name: "القاهرة",
			zones: [
				"المعادي",
				"مصر الجديدة",
				"مدينة نصر",
				"التجمع الخامس",
				"الهرم",
				"وسط البلد",
				"المقطم",
				"الرحاب",
				"المهندسين",
				"شبرا",
			],
		},
		{
			id: "giza",
			name: "الجيزة",
			zones: [
				"الدقي",
				"المهندسين",
				"الهرم",
				"6 أكتوبر",
				"الشيخ زايد",
				"الفيصل",
				"إمبابة",
			],
		},
		{
			id: "alex",
			name: "الإسكندرية",
			zones: ["سموحة", "محرم بك", "العجمي", "برج العرب", "سيدي بشر", "منتزه"],
		},
		{
			id: "mansoura",
			name: "الدقهلية",
			zones: ["المنصورة", "ميت غمر", "طلخا", "دكرنس"],
		},
		{
			id: "tanta",
			name: "الغربية",
			zones: ["طنطا", "المحلة الكبرى", "كفر الزيات"],
		},
		{
			id: "asyut",
			name: "أسيوط",
			zones: ["أسيوط", "ديروط", "أبنوب"],
		},
		{
			id: "portSaid",
			name: "بورسعيد",
			zones: ["بورسعيد", "بورفؤاد"],
		},
		{
			id: "suez",
			name: "السويس",
			zones: ["السويس", "الأربعين"],
		},
	],
	V0 = {
		الدقي: [30.03, 31.21],
		"6 أكتوبر": [29.93, 30.92],
		"الشيخ زايد": [30.04, 30.97],
		الفيصل: [30.02, 31.14],
		إمبابة: [30.05, 31.19],
		سموحة: [31.21, 29.94],
		"محرم بك": [31.24, 31.05],
		العجمي: [29.77, 31.22],
		"برج العرب": [30.92, 29.61],
		"سيدي بشر": [31.26, 31.08],
		منتزه: [31.28, 31.09],
		المنصورة: [30.72, 31.04],
		"ميت غمر": [30.69, 31.27],
		طلخا: [30.69, 31.06],
		دكرنس: [30.79, 31.12],
		طنطا: [30.79, 31],
		"المحلة الكبرى": [30.95, 31.19],
		"كفر الزيات": [30.87, 31.14],
		أسيوط: [27.18, 31.18],
		ديروط: [27.53, 31.13],
		أبنوب: [27.27, 31.15],
		بورسعيد: [31.26, 32.31],
		بورفؤاد: [31.3, 32.33],
		السويس: [29.97, 32.55],
		الأربعين: [30.02, 32.53],
	};
function vl(e) {
	let a = du.find((t) => t.name === e);
	return a ? a.zones : du[0].zones;
}
function ff(e) {
	for (let a of du) if (a.zones.includes(e)) return a.name;
	return "القاهرة";
}
var dd = { maxDropsPerTrip: 3, batchWindowSec: 90, extraDropBonus: 15 },
	rf = {
		id: "pool-maadi",
		name: "شراكة المعادي للتوصيل",
		zone: "المعادي",
		members: [
			{
				id: "m1",
				name: "مطعم زيتونة",
				sharePct: 40,
			},
			{
				id: "m2",
				name: "بيتزا كورنر",
				sharePct: 35,
			},
			{
				id: "m10",
				name: "حلويات المملكة",
				sharePct: 25,
			},
		],
		couriers: [7, 13].map((e, a) => ({ slot: a + 1, courierId: e })),
		monthlySalaryPerCourier: 6e3,
	},
	W0 = (e, a = 1, t = 6e3) => Math.round((e / 100) * t * a);
function $0(e, a = dd.maxDropsPerTrip) {
	let t = {};
	e.forEach((u) => {
		(t[u.zone] = t[u.zone] || []).push(u);
	});
	let l = [];
	return (
		Object.entries(t).forEach(([u, o]) => {
			for (let n = 0; n < o.length; n += a)
				l.push({ zone: u, drops: o.slice(n, n + a) });
		}),
		l
	);
}
var f = jsxRuntime,
	_m = [
		{
			label: "التشغيل",
			items: [
				{
					id: "over",
					icon: "grid",
					name: "نظرة عامة",
				},
				{
					id: "live",
					icon: "route",
					name: "العمليات المباشرة",
					pip: "3",
				},
				{
					id: "orders",
					icon: "box",
					name: "الطلبات",
				},
			],
		},
		{
			label: "الشبكة",
			items: [
				{
					id: "merchants",
					icon: "store",
					name: "الأنشطة التجارية",
				},
				{
					id: "companies",
					icon: "building",
					name: "شركات التوصيل",
				},
				{
					id: "couriers",
					icon: "bike",
					name: "المناديب",
				},
			],
		},
		{
			label: "الإدارة",
			items: [
				{
					id: "subs",
					icon: "card",
					name: "الاشتراكات والإيرادات",
				},
				{
					id: "reports",
					icon: "chart",
					name: "التقارير",
				},
				{
					id: "settings",
					icon: "gear",
					name: "الإعدادات",
				},
			],
		},
	],
	Em = (e) => Yt[e] || { t: e || "—", c: "b-gray" };
function ey({ p: e }) {
	let a = X0.find((t) => t.id === e);
	return (0, f.jsx)(E, {
		c: a ? a.color : "b-gray",
		children: a ? a.name : e,
	});
}
function p2() {
	let [e, a] = Pa.default.useState(null),
		[t, l] = Pa.default.useState(!1),
		[u, o] = Pa.default.useState(""),
		[n, i] = Pa.default.useState(""),
		r = () =>
			apiFetch("/api/wasl/admin/control")
				.then((h) => (h.ok ? h.json() : null))
				.then((h) => {
					h && h.ok && (a(h), i(String(h.settings.courier.monthlyFee || "")));
				})
				.catch(() => {});
	Pa.default.useEffect(() => {
		r();
	}, []);
	let y = (h, x) => {
			(l(!0),
				apiFetch("/api/wasl/admin/control", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(h),
				})
					.then((D) => D.json())
					.then((D) => {
						D && D.ok ? (o(x), r()) : o("تعذر تنفيذ العملية — حاول مرة أخرى");
					})
					.catch(() => o("تعذر الاتصال — حاول مرة أخرى"))
					.finally(() => l(!1)));
		},
		C = (h, x) => {
			e &&
				y(
					{ settings: { ...e.settings, [h]: { ...e.settings[h], ...x } } },
					"تم حفظ إعدادات الاشتراك",
				);
		};
	return (0, f.jsxs)(f.Fragment, {
		children: [
			(0, f.jsx)(De, {
				title: "الاشتراكات والتحكم",
				sub: "حدد نوع المستخدم اللي بيدفع اشتراك شهري ومن يشتغل مجانًا — وتحكم في حسابات المناديب",
			}),
			u &&
				(0, f.jsx)("div", {
					className: "note",
					style: { marginBottom: 12 },
					children: u,
				}),
			(0, f.jsx)("div", {
				className: "grid g3",
				children: [
					["courier", "المناديب"],
					["merchant", "الأنشطة التجارية"],
					["company", "شركات التوصيل"],
				].map(([h, x]) =>
					(0, f.jsxs)(
						F,
						{
							title: x,
							children: [
								(0, f.jsxs)("div", {
									className: "between",
									children: [
										(0, f.jsx)("span", {
											style: { fontSize: 13, fontWeight: 800 },
											children: "اشتراك شهري مطلوب؟",
										}),
										(0, f.jsx)(Uu, {
											on: !!(e && e.settings[h].enabled),
											onChange: (D) => C(h, { enabled: D }),
										}),
									],
								}),
								h === "courier" &&
									(0, f.jsxs)(f.Fragment, {
										children: [
											(0, f.jsx)("div", { className: "hr" }),
											(0, f.jsxs)("div", {
												className: "field",
												children: [
													(0, f.jsx)("label", {
														children: "قيمة اشتراك المندوب الشهري (جنيه)",
													}),
													(0, f.jsxs)("div", {
														className: "row",
														style: { gap: 8 },
														children: [
															(0, f.jsx)("input", {
																className: "inp",
																type: "number",
																value: n,
																onChange: (D) => i(D.target.value),
															}),
															(0, f.jsx)("button", {
																className: "btn btn-o btn-sm",
																disabled: t || !e,
																onClick: () =>
																	C("courier", {
																		monthlyFee: Math.max(0, parseInt(n) || 0),
																	}),
																children: "حفظ القيمة",
															}),
														],
													}),
													(0, f.jsx)("span", {
														className: "hint",
														children:
															"المندوب بيدفع الاشتراك ويشتغل الشهر كله بدون أي عمولة على طلباته.",
													}),
												],
											}),
										],
									}),
								(0, f.jsx)("div", { className: "hr" }),
								(0, f.jsx)("div", {
									className: "sub",
									style: { fontSize: 12, lineHeight: 1.8 },
									children:
										e && e.settings[h].enabled
											? "مفعّل: لازم يكون اشتراك المستخدم نشط ليشتغل."
											: "مجاني حاليًا — كل مستخدمي النوع ده شغالين بدون اشتراك.",
								}),
							],
						},
						h,
					),
				),
			}),
			(0, f.jsx)("div", { style: { height: 16 } }),
			(0, f.jsx)(F, {
				title: "حسابات المناديب المسجلين",
				pad: !1,
				action: (0, f.jsxs)(E, {
					c: "b-gray",
					children: [e ? (e.accounts || []).length : 0, " حساب"],
				}),
				children: e
					? (e.accounts || []).length === 0
						? (0, f.jsx)("div", {
								style: { padding: 16 },
								className: "sub",
								children:
									"لا توجد حسابات مناديب مسجلين بعد — أول ما مندوب يسجل من التطبيق هيظهر هنا فورًا.",
							})
						: (0, f.jsxs)("table", {
								className: "tbl",
								children: [
									(0, f.jsx)("thead", {
										children: (0, f.jsxs)("tr", {
											children: [
												(0, f.jsx)("th", {
													children: "المندوب",
												}),
												(0, f.jsx)("th", {
													children: "الموبايل",
												}),
												(0, f.jsx)("th", {
													children: "المركبة",
												}),
												(0, f.jsx)("th", {
													children: "المنطقة",
												}),
												(0, f.jsx)("th", {
													children: "الحالة",
												}),
												(0, f.jsx)("th", {
													children: "الاشتراك",
												}),
												(0, f.jsx)("th", {}),
											],
										}),
									}),
									(0, f.jsx)("tbody", {
										children: e.accounts.map((h) =>
											(0, f.jsxs)(
												"tr",
												{
													children: [
														(0, f.jsxs)("td", {
															className: "main-cell",
															children: [
																h.name,
																(0, f.jsx)("div", {
																	className: "sub",
																	children: h.ref,
																}),
															],
														}),
														(0, f.jsx)("td", {
															dir: "ltr",
															className: "num",
															children: h.phone,
														}),
														(0, f.jsx)("td", {
															className: "sub",
															children: nd[h.vehicle] || h.vehicle,
														}),
														(0, f.jsx)("td", {
															className: "sub",
															children: h.zone || "—",
														}),
														(0, f.jsx)("td", {
															children:
																h.status === "active"
																	? (0, f.jsx)(E, {
																			c: "b-green",
																			children: "نشط",
																		})
																	: (0, f.jsx)(E, {
																			c: "b-amber",
																			children: "موقوف",
																		}),
														}),
														(0, f.jsx)("td", {
															children: h.subActive
																? (0, f.jsx)(E, {
																		c: "b-teal",
																		children: "مفعّل",
																	})
																: e.settings.courier.enabled
																	? (0, f.jsx)(E, {
																			c: "b-amber",
																			children: "غير مشترك",
																		})
																	: (0, f.jsx)(E, {
																			c: "b-gray",
																			children: "مجاني",
																		}),
														}),
														(0, f.jsx)("td", {
															children: (0, f.jsxs)("div", {
																className: "row",
																style: { gap: 6, flexWrap: "wrap" },
																children: [
																	h.status === "active"
																		? (0, f.jsx)("button", {
																				className: "btn btn-o btn-sm",
																				disabled: t,
																				onClick: () =>
																					y(
																						{ ref: h.ref, action: "suspend" },
																						"تم إيقاف الحساب",
																					),
																				children: "إيقاف",
																			})
																		: (0, f.jsx)("button", {
																				className: "btn btn-p btn-sm",
																				disabled: t,
																				onClick: () =>
																					y(
																						{
																							ref: h.ref,
																							action: "activate",
																						},
																						"تم تنشيط الحساب",
																					),
																				children: "تنشيط",
																			}),
																	h.subActive
																		? (0, f.jsx)("button", {
																				className: "btn btn-o btn-sm",
																				disabled: t,
																				onClick: () =>
																					y(
																						{
																							ref: h.ref,
																							action: "revoke_sub",
																						},
																						"تم إلغاء الاشتراك",
																					),
																				children: "إلغاء الاشتراك",
																			})
																		: (0, f.jsx)("button", {
																				className: "btn btn-p btn-sm",
																				disabled: t,
																				onClick: () =>
																					y(
																						{
																							ref: h.ref,
																							action: "grant_month",
																						},
																						"تم تفعيل اشتراك شهر",
																					),
																				children: "تفعيل اشتراك شهر",
																			}),
																],
															}),
														}),
													],
												},
												h.ref,
											),
										),
									}),
								],
							})
					: (0, f.jsx)("div", {
							style: { padding: 16 },
							className: "sub",
							children: "جارٍ التحميل…",
						}),
			}),
		],
	});
}
function Um({ cur: e, go: a, store: t }) {
	_m.some((c) => c.items.some((g) => g.id === e)) || (e = "over");
	let { orders: l, couriers: u } = t,
		[o, n] = Pa.default.useState(""),
		[i, r] = Pa.default.useState(null),
		[y, C] = Pa.default.useState("all"),
		[I, h] = Pa.default.useState(30),
		[x, D] = Pa.default.useState("all"),
		H = l.filter((c) => c.status !== "delivered" && c.status !== "canceled"),
		V = u.filter((c) => c.status === "free"),
		[v, b] = Pa.default.useState(null);
	if (
		(Pa.default.useEffect(() => {
			apiFetch("/api/wasl/stats")
				.then((c) => (c.ok ? c.json() : null))
				.then((c) => {
					c && c.ok && b(c.stats);
				})
				.catch(() => {});
		}, []),
		e === "over")
	)
		return (0, f.jsxs)(f.Fragment, {
			children: [
				(0, f.jsxs)(De, {
					title: "نظرة عامة",
					sub: "ملخص أداء المنصة اليوم — 6 أكتوبر 2026",
					extra: (0, f.jsx)(H0, {}),
					children: [
						(0, f.jsxs)("button", {
							className: "btn btn-o btn-sm",
							children: [(0, f.jsx)(S, { n: "cal", s: 14 }), " اليوم"],
						}),
						(0, f.jsxs)("button", {
							className: "btn btn-p btn-sm",
							children: [(0, f.jsx)(S, { n: "file", s: 14 }), " تصدير التقرير"],
						}),
					],
				}),
				(0, f.jsxs)("div", {
					className: "grid g4",
					children: [
						(0, f.jsx)(he, {
							icon: "store",
							color: "#2f6bff",
							bg: "#e9efff",
							val: gl.filter((c) => c.status === "active").length,
							label: "نشاط تجاري نشط",
							trend: "12%+",
							up: !0,
							spark: [4, 5, 5, 6, 7, 7, 8, 9],
							sparkColor: "#2f6bff",
						}),
						(0, f.jsx)(he, {
							icon: "building",
							color: "#7c3aed",
							bg: "#f2ecfe",
							val: od.length,
							label: "شركات توصيل",
							trend: "2 جديدة",
							up: !0,
							spark: [1, 1, 2, 2, 2, 3, 3, 3],
							sparkColor: "#7c3aed",
						}),
						(0, f.jsx)(he, {
							icon: "bike",
							color: "#0d9488",
							bg: "#e4f7f4",
							val: u.filter((c) => c.status !== "off").length,
							label: "مندوب متصل الآن",
							trend: "8%+",
							up: !0,
							spark: [6, 7, 7, 8, 9, 9, 10, 11],
							sparkColor: "#0d9488",
						}),
						(0, f.jsx)(he, {
							icon: "box",
							color: "#d97706",
							bg: "#fdf2e3",
							val: H.length,
							label: "طلب جارٍ الآن",
							trend: "3%+",
							up: !0,
							spark: [2, 3, 2, 4, 3, 5, 4, 3],
							sparkColor: "#d97706",
						}),
					],
				}),
				(0, f.jsx)("div", { style: { height: 16 } }),
				(0, f.jsxs)("div", {
					className: "grid g21",
					children: [
						(0, f.jsxs)("div", {
							className: "grid",
							style: { gap: 16 },
							children: [
								(0, f.jsxs)(F, {
									title: "حركة الطلبات — آخر 7 أيام",
									action: (0, f.jsx)(E, { c: "b-green", children: "+18.4%" }),
									children: [
										(0, f.jsx)(pl, {
											data: [132, 148, 141, 167, 183, 159, 196],
											labels: [
												"الأحد",
												"الاثنين",
												"الثلاثاء",
												"الأربعاء",
												"الخميس",
												"الجمعة",
												"السبت",
											],
										}),
										(0, f.jsx)("div", { className: "hr" }),
										(0, f.jsxs)("div", {
											className: "grid g3",
											style: { gap: 10 },
											children: [
												(0, f.jsxs)("div", {
													children: [
														(0, f.jsx)("span", {
															className: "l",
															style: {
																fontSize: 11.5,
																color: "var(--mut)",
																fontWeight: 700,
															},
															children: "متوسط وقت التوصيل",
														}),
														(0, f.jsx)("b", {
															style: { display: "block", fontSize: 18 },
															children: "22 دقيقة",
														}),
													],
												}),
												(0, f.jsxs)("div", {
													children: [
														(0, f.jsx)("span", {
															className: "l",
															style: {
																fontSize: 11.5,
																color: "var(--mut)",
																fontWeight: 700,
															},
															children: "نسبة الإنجاز",
														}),
														(0, f.jsx)("b", {
															style: { display: "block", fontSize: 18 },
															children: "98.2%",
														}),
													],
												}),
												(0, f.jsxs)("div", {
													children: [
														(0, f.jsx)("span", {
															className: "l",
															style: {
																fontSize: 11.5,
																color: "var(--mut)",
																fontWeight: 700,
															},
															children: "متوسط قيمة الطلب",
														}),
														(0, f.jsx)("b", {
															style: { display: "block", fontSize: 18 },
															children: se(48),
														}),
													],
												}),
											],
										}),
									],
								}),
								(0, f.jsx)(F, {
									title: "أحدث الطلبات",
									action: (0, f.jsx)("button", {
										className: "btn btn-o btn-sm",
										onClick: () => a("orders"),
										children: "عرض الكل",
									}),
									pad: !1,
									children: (0, f.jsxs)("table", {
										className: "tbl",
										children: [
											(0, f.jsx)("thead", {
												children: (0, f.jsxs)("tr", {
													children: [
														(0, f.jsx)("th", {
															children: "الطلب",
														}),
														(0, f.jsx)("th", {
															children: "النشاط",
														}),
														(0, f.jsx)("th", {
															children: "الوجهة",
														}),
														(0, f.jsx)("th", {
															children: "المندوب",
														}),
														(0, f.jsx)("th", {
															children: "الرسوم",
														}),
														(0, f.jsx)("th", {
															children: "الحالة",
														}),
													],
												}),
											}),
											(0, f.jsx)("tbody", {
												children: l.slice(0, 6).map((c) => {
													let g = Em(c.status);
													return (0, f.jsxs)(
														"tr",
														{
															children: [
																(0, f.jsxs)("td", {
																	className: "main-cell",
																	children: [
																		c.id,
																		(0, f.jsx)("div", {
																			className: "sub",
																			children: c.time,
																		}),
																	],
																}),
																(0, f.jsx)("td", { children: c.merchant }),
																(0, f.jsx)("td", {
																	className: "sub",
																	children: c.to,
																}),
																(0, f.jsx)("td", {
																	children: c.courier || "—",
																}),
																(0, f.jsx)("td", {
																	className: "main-cell",
																	children: se(c.fee),
																}),
																(0, f.jsx)("td", {
																	children: (0, f.jsx)(E, {
																		c: g.c,
																		blink: c.status === "searching",
																		children: g.t,
																	}),
																}),
															],
														},
														c.id,
													);
												}),
											}),
										],
									}),
								}),
							],
						}),
						(0, f.jsxs)("div", {
							className: "grid",
							style: { gap: 16, alignContent: "start" },
							children: [
								(0, f.jsxs)(F, {
									title: "توزيع الطلبات حسب المصدر",
									children: [
										(0, f.jsx)(jo, {
											segs: [
												{
													label: "مناديب مستقلون",
													v: 46,
													c: "#0f766e",
												},
												{
													label: "شركات التوصيل",
													v: 32,
													c: "#7c3aed",
												},
												{
													label: "مناديب الأنشطة",
													v: 22,
													c: "#2563eb",
												},
											],
											center: "1,196",
										}),
										(0, f.jsx)("div", { className: "hr" }),
										[
											["مناديب مستقلون", "46%", "#0f766e"],
											["شركات التوصيل", "32%", "#7c3aed"],
											["مناديب الأنشطة", "22%", "#2563eb"],
										].map(([c, g, R]) =>
											(0, f.jsxs)(
												"div",
												{
													className: "kv",
													children: [
														(0, f.jsxs)("span", {
															children: [
																(0, f.jsx)("i", {
																	className: "dot8",
																	style: {
																		background: R,
																		marginInlineEnd: 6,
																	},
																}),
																c,
															],
														}),
														(0, f.jsx)("b", { children: g }),
													],
												},
												c,
											),
										),
									],
								}),
								(0, f.jsx)(F, {
									title: "تنبيهات تشغيلية",
									children: [
										["alert", "طلب #4172 دون موافقة منذ 4 دقائق", "amber"],
										["clock", "3 مناديب انتهاء اشتراكهم غدًا", "blue"],
										["users", "دعوتان لعميل جديد بانتظار المتابعة", "teal"],
									].map(([c, g, R], X) =>
										(0, f.jsxs)(
											"div",
											{
												className: "list-row",
												children: [
													(0, f.jsx)("div", {
														className: "ico",
														style: {
															background:
																R === "amber"
																	? "var(--amberSoft)"
																	: R === "blue"
																		? "var(--blueSoft)"
																		: "var(--brandSoft)",
															color:
																R === "amber"
																	? "var(--amber)"
																	: R === "blue"
																		? "var(--blue)"
																		: "var(--brandInk)",
														},
														children: (0, f.jsx)(S, { n: c, s: 16 }),
													}),
													(0, f.jsx)("span", {
														style: {
															fontSize: 12.5,
															fontWeight: 600,
															flex: 1,
														},
														children: g,
													}),
													(0, f.jsx)(S, {
														n: "chevL",
														s: 15,
														c: "var(--mut2)",
													}),
												],
											},
											X,
										),
									),
								}),
								(0, f.jsx)(F, {
									title: "إحصائيات المنصة — Super X",
									action: (0, f.jsx)(E, {
										c: "b-teal",
										children: "مباشر",
									}),
									children: v
										? (0, f.jsxs)("div", {
												children: [
													(0, f.jsx)("div", {
														className: "grid g2",
														style: { gap: 10 },
														children: [
															["store", "أنشطة مسجلة", v.merchants],
															["building", "شركات مسجلة", v.companies],
															["bike", "مناديب نشطون", v.couriers],
															[
																"mail",
																"دعوات مناديب معلّقة",
																v.couriersInvited,
															],
															["users", "شراكات مناديب", v.partnerships],
															["box", "إجمالي الطلبات", v.ordersTotal],
														].map(([c, g, R]) =>
															(0, f.jsxs)(
																"div",
																{
																	className: "row",
																	style: { gap: 9 },
																	children: [
																		(0, f.jsx)("div", {
																			className: "ico",
																			style: {
																				width: 32,
																				height: 32,
																				background: "var(--brandSoft)",
																				color: "var(--brandInk)",
																			},
																			children: (0, f.jsx)(S, {
																				n: c,
																				s: 14,
																			}),
																		}),
																		(0, f.jsxs)("div", {
																			style: { flex: 1 },
																			children: [
																				(0, f.jsx)("span", {
																					className: "sub",
																					style: { fontSize: 11.5 },
																					children: g,
																				}),
																				(0, f.jsx)("b", {
																					style: {
																						display: "block",
																						fontSize: 15,
																					},
																					children: R,
																				}),
																			],
																		}),
																	],
																},
																g,
															),
														),
													}),
													(0, f.jsx)("div", { className: "hr" }),
													(0, f.jsxs)("div", {
														className: "kv",
														children: [
															(0, f.jsx)("span", {
																children: "طلبات النهاردة",
															}),
															(0, f.jsx)("b", { children: v.ordersToday }),
														],
													}),
													(0, f.jsxs)("div", {
														className: "kv",
														children: [
															(0, f.jsx)("span", {
																children: "طلبات مكتملة (إجمالي)",
															}),
															(0, f.jsx)("b", {
																children: v.ordersDelivered,
															}),
														],
													}),
												],
											})
										: (0, f.jsx)("div", {
												className: "sub",
												style: { padding: "8px 0" },
												children: "جاري تحميل الإحصائيات…",
											}),
								}),
								(0, f.jsxs)(F, {
									title: "إيرادات الاشتراكات — الشهر الحالي",
									children: [
										(0, f.jsxs)("div", {
											className: "between",
											children: [
												(0, f.jsx)("span", {
													style: { fontSize: 13, fontWeight: 700 },
													children: "إجمالي الإيرادات المتكررة",
												}),
												(0, f.jsx)("b", {
													style: { fontSize: 18, color: "var(--brandInk)" },
													children: se(87450),
												}),
											],
										}),
										(0, f.jsx)("div", {
											className: "progress",
											style: { marginTop: 10 },
											children: (0, f.jsx)("i", { style: { width: "78%" } }),
										}),
										(0, f.jsx)("div", {
											className: "sub",
											style: {
												fontSize: 11,
												color: "var(--mut)",
												marginTop: 6,
											},
											children: "78% من الهدف الشهري — 112,000 ج",
										}),
									],
								}),
							],
						}),
					],
				}),
			],
		});
	if (e === "live")
		return (0, f.jsxs)(f.Fragment, {
			children: [
				(0, f.jsx)(De, {
					title: "العمليات المباشرة",
					sub: "تتبع لحظي للمناديب والطلبات النشطة",
					children: (0, f.jsx)(E, {
						c: "b-green",
						icon: "wifi",
						children: "مباشر — تحديث كل 5 ثوان",
					}),
				}),
				(0, f.jsxs)("div", {
					className: "grid g21",
					children: [
						(0, f.jsx)(F, {
							title: "خريطة العمليات الحية",
							action: (0, f.jsxs)(E, {
								c: "b-teal",
								children: [H.length, " طلب جارٍ"],
							}),
							pad: !1,
							children: (0, f.jsx)("div", {
								style: { padding: 16 },
								children: (0, f.jsx)(of, {
									height: 430,
									badge: (0, f.jsxs)(f.Fragment, {
										children: [
											(0, f.jsx)("i", {
												className: "dot8 blink",
												style: { background: "#059669" },
											}),
											"مباشر — تحديث لحظي",
										],
									}),
									legend: [
										{
											c: "#64748b",
											t: "مندوب متاح",
										},
										{
											c: "#f59e0b",
											t: "مندوب مشغول",
										},
										{
											c: "#7c3aed",
											t: "مندوب شركة",
										},
										{
											c: "#dc2626",
											t: "وجهة توصيل",
										},
									],
									markers: [
										...u
											.filter((c) => c.status !== "off")
											.slice(0, 9)
											.map((c, g) => ({
												x: [10, 28, 46, 64, 82, 20, 55, 74, 36][g],
												y: [15, 30, 18, 42, 22, 60, 55, 70, 38][g],
												k:
													c.status === "busy"
														? "busy"
														: c.aff.startsWith("co")
															? "co"
															: "free",
												name: c.name,
											})),
										...H.map((c, g) => ({
											x: [68, 40, 25][g % 3],
											y: [50, 68, 75][g % 3],
											k: "dest",
											icon: "pin",
											name: c.to,
										})),
									],
								}),
							}),
						}),
						(0, f.jsxs)("div", {
							className: "grid",
							style: { gap: 16, alignContent: "start" },
							children: [
								(0, f.jsx)(F, {
									title: "المطابقة الذكية",
									pad: !1,
									children: (0, f.jsx)("div", {
										style: { padding: 16 },
										className: "grid",
										children: [
											[
												"متوسط زمن قبول الطلب",
												"48 ثانية",
												"zap",
												"#0f766e",
												"#e6f7f4",
											],
											[
												"أقرب مندوب يُعرض أولًا",
												"مسافة + آخر طلب",
												"target",
												"#2563eb",
												"#e8effd",
											],
											[
												"توازن التحميل",
												"توزيع عادل للمناديب",
												"layers",
												"#7c3aed",
												"#f1eafd",
											],
										].map(([c, g, R, X, O]) =>
											(0, f.jsxs)(
												"div",
												{
													className: "list-row",
													children: [
														(0, f.jsx)("div", {
															className: "ico",
															style: { background: O, color: X },
															children: (0, f.jsx)(S, { n: R, s: 16 }),
														}),
														(0, f.jsxs)("div", {
															style: { flex: 1 },
															children: [
																(0, f.jsx)("b", {
																	style: { fontSize: 12.5 },
																	children: c,
																}),
																(0, f.jsx)("div", {
																	className: "sub",
																	children: g,
																}),
															],
														}),
													],
												},
												c,
											),
										),
									}),
								}),
								(0, f.jsx)(F, {
									title: "طابور الطلبات",
									pad: !1,
									children: (0, f.jsxs)("table", {
										className: "tbl",
										children: [
											(0, f.jsx)("thead", {
												children: (0, f.jsxs)("tr", {
													children: [
														(0, f.jsx)("th", {
															children: "الطلب",
														}),
														(0, f.jsx)("th", {
															children: "الحالة",
														}),
														(0, f.jsx)("th", {
															children: "الوقت",
														}),
													],
												}),
											}),
											(0, f.jsx)("tbody", {
												children: H.map((c) => {
													let g = Em(c.status);
													return (0, f.jsxs)(
														"tr",
														{
															children: [
																(0, f.jsxs)("td", {
																	className: "main-cell",
																	children: [
																		c.id,
																		(0, f.jsx)("div", {
																			className: "sub",
																			children: c.merchant,
																		}),
																	],
																}),
																(0, f.jsx)("td", {
																	children: (0, f.jsx)(E, {
																		c: g.c,
																		blink: c.status === "searching",
																		children: g.t,
																	}),
																}),
																(0, f.jsx)("td", {
																	className: "sub",
																	children: c.eta,
																}),
															],
														},
														c.id,
													);
												}),
											}),
										],
									}),
								}),
							],
						}),
					],
				}),
			],
		});
	if (e === "orders") {
		let c = l.filter(
			(g) =>
				(y === "all" || g.status === y) &&
				(g.merchant.includes(o) || g.id.includes(o)),
		);
		return (0, f.jsxs)(f.Fragment, {
			children: [
				(0, f.jsx)(De, {
					title: "الطلبات",
					sub: `${l.length} طلب — جميع الأنشطة وشركات التوصيل`,
				}),
				(0, f.jsxs)(F, {
					pad: !1,
					children: [
						(0, f.jsxs)("div", {
							className: "hd",
							style: { gap: 12 },
							children: [
								(0, f.jsx)("div", {
									className: "field",
									style: { width: 260 },
									children: (0, f.jsx)("input", {
										className: "inp",
										placeholder: "ابحث برقم الطلب أو النشاط…",
										value: o,
										onChange: (g) => n(g.target.value),
									}),
								}),
								(0, f.jsx)("div", {
									className: "pill-tabs",
									children: [
										["all", "الكل"],
										["searching", "بحث عن مندوب"],
										["accepted", "تم القبول"],
										["pickup", "استلام"],
										["heading", "في الطريق"],
										["delivered", "تم التوصيل"],
									].map(([g, R]) =>
										(0, f.jsx)(
											"button",
											{
												className: y === g ? "on" : "",
												onClick: () => C(g),
												children: R,
											},
											g,
										),
									),
								}),
							],
						}),
						(0, f.jsxs)("table", {
							className: "tbl",
							children: [
								(0, f.jsx)("thead", {
									children: (0, f.jsxs)("tr", {
										children: [
											(0, f.jsx)("th", {
												children: "الطلب",
											}),
											(0, f.jsx)("th", {
												children: "النشاط",
											}),
											(0, f.jsx)("th", { children: "من" }),
											(0, f.jsx)("th", { children: "إلى" }),
											(0, f.jsx)("th", {
												children: "المندوب",
											}),
											(0, f.jsx)("th", {
												children: "الرسوم",
											}),
											(0, f.jsx)("th", {
												children: "الدفع",
											}),
											(0, f.jsx)("th", {
												children: "الحالة",
											}),
											(0, f.jsx)("th", {}),
										],
									}),
								}),
								(0, f.jsxs)("tbody", {
									children: [
										c.map((g) => {
											let R = Em(g.status),
												X = i === g.id;
											return (0, f.jsxs)(
												Pa.default.Fragment,
												{
													children: [
														(0, f.jsxs)("tr", {
															onClick: () => r(X ? null : g.id),
															style: { cursor: "pointer" },
															children: [
																(0, f.jsxs)("td", {
																	className: "main-cell",
																	children: [
																		g.id,
																		(0, f.jsx)("div", {
																			className: "sub",
																			children: g.time,
																		}),
																	],
																}),
																(0, f.jsx)("td", { children: g.merchant }),
																(0, f.jsx)("td", {
																	className: "sub",
																	children: g.from,
																}),
																(0, f.jsx)("td", {
																	className: "sub",
																	children: g.to,
																}),
																(0, f.jsx)("td", {
																	children: g.courier
																		? (0, f.jsxs)("div", {
																				className: "row",
																				style: { gap: 7 },
																				children: [
																					(0, f.jsx)(lt, {
																						name: g.courier,
																						size: 26,
																					}),
																					(0, f.jsx)("span", {
																						style: { fontWeight: 600 },
																						children: g.courier,
																					}),
																				],
																			})
																		: (0, f.jsx)(E, {
																				c: "b-amber",
																				blink: !0,
																				children: "بانتظار مندوب…",
																			}),
																}),
																(0, f.jsx)("td", {
																	className: "main-cell",
																	children: se(g.fee),
																}),
																(0, f.jsx)("td", {
																	className: "sub",
																	children: g.pay,
																}),
																(0, f.jsx)("td", {
																	children: (0, f.jsx)(E, {
																		c: R.c,
																		blink: g.status === "searching",
																		children: R.t,
																	}),
																}),
																(0, f.jsx)("td", {
																	children: (0, f.jsxs)("button", {
																		className: "btn btn-o btn-sm",
																		onClick: (O) => {
																			(O.stopPropagation(), r(X ? null : g.id));
																		},
																		children: [
																			(0, f.jsx)(S, { n: "eye", s: 13 }),
																			" تفاصيل",
																		],
																	}),
																}),
															],
														}),
														X &&
															(0, f.jsx)("tr", {
																style: { background: "#fbfdff" },
																children: (0, f.jsxs)("td", {
																	colSpan: 9,
																	style: { padding: "14px 18px" },
																	children: [
																		(0, f.jsxs)("div", {
																			className: "row wrap",
																			style: { gap: 10, fontSize: 12.5 },
																			children: [
																				(0, f.jsxs)(E, {
																					c: "b-blue",
																					icon: "store",
																					children: ["النشاط: ", g.merchant],
																				}),
																				g.km
																					? (0, f.jsxs)(E, {
																							c: "b-teal",
																							icon: "route",
																							children: [
																								"المسافة ≈ ",
																								g.km,
																								" كم",
																							],
																						})
																					: null,
																				g.feeMin
																					? (0, f.jsxs)(E, {
																							c: "b-gray",
																							children: [
																								"نطاق التسعير: من ",
																								g.feeMin,
																								" إلى ",
																								g.feeMax,
																								" ج",
																							],
																						})
																					: null,
																				(0, f.jsx)(E, {
																					c: "b-amber",
																					icon: "cash",
																					children: g.pay,
																				}),
																				g.kind &&
																					(0, f.jsx)(E, {
																						c: "b-violet",
																						children: g.kind,
																					}),
																			],
																		}),
																		(0, f.jsxs)("div", {
																			className: "row",
																			style: {
																				gap: 16,
																				marginTop: 10,
																				fontSize: 12,
																				color: "var(--mut)",
																				flexWrap: "wrap",
																			},
																			children: [
																				(0, f.jsxs)("span", {
																					children: [
																						(0, f.jsx)(S, {
																							n: "store",
																							s: 13,
																						}),
																						" استلام: ",
																						g.from,
																					],
																				}),
																				(0, f.jsxs)("span", {
																					children: [
																						(0, f.jsx)(S, {
																							n: "pin",
																							s: 13,
																						}),
																						" تسليم: ",
																						g.to,
																					],
																				}),
																				g.courier &&
																					(0, f.jsxs)("span", {
																						children: [
																							(0, f.jsx)(S, {
																								n: "bike",
																								s: 13,
																							}),
																							" المنفذ: ",
																							g.courier,
																						],
																					}),
																			],
																		}),
																		(0, f.jsx)("div", {
																			style: { maxWidth: 420, marginTop: 12 },
																			children: (0, f.jsx)(Xt, {
																				cur:
																					{
																						searching: 0,
																						accepted: 1,
																						pickup: 2,
																						heading: 3,
																						delivered: 4,
																					}[g.status] ?? 0,
																				labels: [
																					"طلب",
																					"قبول",
																					"استلام",
																					"في الطريق",
																					"تسليم",
																				],
																			}),
																		}),
																	],
																}),
															}),
													],
												},
												g.id,
											);
										}),
										!c.length &&
											(0, f.jsx)("tr", {
												children: (0, f.jsx)("td", {
													colSpan: 9,
													style: {
														textAlign: "center",
														color: "var(--mut)",
														padding: 30,
													},
													children: "لا توجد طلبات مطابقة",
												}),
											}),
									],
								}),
							],
						}),
					],
				}),
			],
		});
	}
	return e === "merchants"
		? (0, f.jsxs)(f.Fragment, {
				children: [
					(0, f.jsx)(De, {
						title: "الأنشطة التجارية",
						sub: "المطاعم والصيدليات والأسواق المشتركة في المنصة",
						children: (0, f.jsxs)("button", {
							className: "btn btn-o btn-sm",
							children: [(0, f.jsx)(S, { n: "mail", s: 14 }), " دعوة نشاط"],
						}),
					}),
					(0, f.jsxs)("div", {
						className: "grid g4",
						style: { marginBottom: 16 },
						children: [
							(0, f.jsx)(he, {
								icon: "store",
								color: "#2563eb",
								bg: "#e8effd",
								val: gl.length,
								label: "إجمالي الأنشطة",
							}),
							(0, f.jsx)(he, {
								icon: "check",
								color: "#059669",
								bg: "#e7f6ef",
								val: gl.filter((c) => c.status === "active").length,
								label: "نشِط",
							}),
							(0, f.jsx)(he, {
								icon: "zap",
								color: "#d97706",
								bg: "#fef3e2",
								val: gl.filter((c) => c.status === "trial").length,
								label: "في فترة تجريبية",
							}),
							(0, f.jsx)(he, {
								icon: "box",
								color: "#0f766e",
								bg: "#e6f7f4",
								val: gl
									.reduce((c, g) => c + g.orders, 0)
									.toLocaleString("ar-EG"),
								label: "طلبات هذا الشهر",
							}),
						],
					}),
					(0, f.jsx)(F, {
						pad: !1,
						title: "قائمة الأنشطة",
						action: (0, f.jsx)("div", {
							className: "row",
							style: { gap: 6 },
							children: [
								["all", "الكل"],
								["own", "عنده مناديب"],
								["network", "يحتاج مناديب المنصة"],
								["company", "تابع لشركة"],
							].map(([c, g]) =>
								(0, f.jsx)(
									"button",
									{
										className: "btn btn-o btn-sm",
										onClick: () => D(c),
										style: {
											borderColor: x === c ? "var(--brand)" : "var(--line)",
											color: x === c ? "var(--brandInk)" : "var(--mut)",
											background: x === c ? "var(--brandSoft)" : "#fff",
										},
										children: g,
									},
									c,
								),
							),
						}),
						children: (0, f.jsxs)("table", {
							className: "tbl",
							children: [
								(0, f.jsx)("thead", {
									children: (0, f.jsxs)("tr", {
										children: [
											(0, f.jsx)("th", {
												children: "النشاط",
											}),
											(0, f.jsx)("th", {
												children: "النوع",
											}),
											(0, f.jsx)("th", {
												children: "المنطقة",
											}),
											(0, f.jsx)("th", {
												children: "قدرة التوصيل",
											}),
											(0, f.jsx)("th", {
												children: "الطلبات",
											}),
											(0, f.jsx)("th", {
												children: "الباقة",
											}),
											(0, f.jsx)("th", {
												children: "الاشتراك",
											}),
											(0, f.jsx)("th", {
												children: "الحالة",
											}),
											(0, f.jsx)("th", {}),
										],
									}),
								}),
								(0, f.jsx)("tbody", {
									children: gl
										.filter((c) => x === "all" || sd(c) === x)
										.map((c) => {
											let g = J0[sd(c)];
											return (0, f.jsxs)(
												"tr",
												{
													children: [
														(0, f.jsx)("td", {
															children: (0, f.jsxs)("div", {
																className: "row",
																style: { gap: 9 },
																children: [
																	(0, f.jsx)("div", {
																		className: "ico",
																		style: {
																			width: 34,
																			height: 34,
																			background: "var(--blueSoft)",
																			color: "var(--blue)",
																		},
																		children: (0, f.jsx)(S, {
																			n: Q0[c.type] || "store",
																			s: 15,
																		}),
																	}),
																	(0, f.jsx)("b", { children: c.name }),
																],
															}),
														}),
														(0, f.jsx)("td", {
															className: "sub",
															children: c.type,
														}),
														(0, f.jsx)("td", {
															className: "sub",
															children: c.zone,
														}),
														(0, f.jsxs)("td", {
															children: [
																(0, f.jsx)(E, {
																	c: g.badge,
																	children: g.label,
																}),
																(0, f.jsx)("div", {
																	className: "sub",
																	style: { marginTop: 4, fontSize: 10.5 },
																	children:
																		c.couriers > 0
																			? c.couriers + " مندوب مسجل"
																			: g.hint,
																}),
															],
														}),
														(0, f.jsx)("td", {
															className: "main-cell",
															children: c.orders.toLocaleString("ar-EG"),
														}),
														(0, f.jsx)("td", {
															children: (0, f.jsx)(ey, { p: c.plan }),
														}),
														(0, f.jsx)("td", {
															className: "sub",
															children: c.sub,
														}),
														(0, f.jsx)("td", {
															children: (0, f.jsx)(E, {
																c:
																	c.status === "active"
																		? "b-green"
																		: c.status === "trial"
																			? "b-amber"
																			: "b-gray",
																children:
																	c.status === "active"
																		? "نشِط"
																		: c.status === "trial"
																			? "تجربة"
																			: "معلّق",
															}),
														}),
														(0, f.jsx)("td", {
															children: (0, f.jsx)("button", {
																className: "btn btn-o btn-sm",
																children: (0, f.jsx)(S, { n: "eye", s: 13 }),
															}),
														}),
													],
												},
												c.id,
											);
										}),
								}),
							],
						}),
					}),
				],
			})
		: e === "companies"
			? (0, f.jsxs)(f.Fragment, {
					children: [
						(0, f.jsx)(De, {
							title: "شركات التوصيل",
							sub: "مكاتب التوصيل المشتركة في المنصة وأداؤها",
							children: (0, f.jsxs)("button", {
								className: "btn btn-p btn-sm",
								children: [(0, f.jsx)(S, { n: "plus", s: 14 }), " إضافة شركة"],
							}),
						}),
						(0, f.jsx)("div", {
							className: "grid g3",
							children: od.map((c) =>
								(0, f.jsxs)(
									F,
									{
										children: [
											(0, f.jsxs)("div", {
												className: "row",
												style: { alignItems: "flex-start" },
												children: [
													(0, f.jsx)("div", {
														className: "ico",
														style: {
															width: 46,
															height: 46,
															background: "var(--violetSoft)",
															color: "var(--violet)",
														},
														children: (0, f.jsx)(S, { n: "building", s: 20 }),
													}),
													(0, f.jsxs)("div", {
														style: { flex: 1 },
														children: [
															(0, f.jsx)("b", {
																style: { fontSize: 15 },
																children: c.name,
															}),
															(0, f.jsxs)("div", {
																className: "sub",
																children: [c.city, " — عضو منذ ", c.since],
															}),
														],
													}),
													(0, f.jsx)(E, {
														c: "b-green",
														icon: "check",
														children: "نشطة",
													}),
												],
											}),
											(0, f.jsx)("div", { className: "hr" }),
											(0, f.jsxs)("div", {
												className: "grid g3",
												style: { gap: 8 },
												children: [
													(0, f.jsxs)("div", {
														style: { textAlign: "center" },
														children: [
															(0, f.jsx)("b", {
																style: { fontSize: 17 },
																children: c.couriers,
															}),
															(0, f.jsx)("div", {
																className: "sub",
																style: { fontSize: 10.5 },
																children: "مندوب",
															}),
														],
													}),
													(0, f.jsxs)("div", {
														style: { textAlign: "center" },
														children: [
															(0, f.jsx)("b", {
																style: { fontSize: 17 },
																children: c.clients,
															}),
															(0, f.jsx)("div", {
																className: "sub",
																style: { fontSize: 10.5 },
																children: "عميل",
															}),
														],
													}),
													(0, f.jsxs)("div", {
														style: { textAlign: "center" },
														children: [
															(0, f.jsxs)("b", {
																style: { fontSize: 17 },
																children: [(c.orders / 1e3).toFixed(1), "K"],
															}),
															(0, f.jsx)("div", {
																className: "sub",
																style: { fontSize: 10.5 },
																children: "طلب/شهر",
															}),
														],
													}),
												],
											}),
											(0, f.jsx)("div", { className: "hr" }),
											(0, f.jsxs)("div", {
												className: "row wrap",
												style: { gap: 6 },
												children: [
													(0, f.jsx)(ey, { p: c.plan }),
													(0, f.jsxs)(E, {
														c: "b-teal",
														icon: "star",
														children: [c.rating, " من 5"],
													}),
												],
											}),
										],
									},
									c.id,
								),
							),
						}),
						(0, f.jsx)("div", { style: { height: 16 } }),
						(0, f.jsx)(F, {
							title: "مقارنة أداء شركات التوصيل — آخر 6 أشهر",
							action: (0, f.jsx)(E, {
								c: "b-blue",
								children: "طلبات شهرية",
							}),
							children: (0, f.jsx)(pl, {
								data: [820, 940, 1120, 1380, 1610, 1840],
								labels: ["مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر"],
								color: "#7c3aed",
							}),
						}),
					],
				})
			: e === "couriers"
				? (0, f.jsxs)(f.Fragment, {
						children: [
							(0, f.jsxs)(De, {
								title: "المناديب",
								sub: "قاعدة مناديب المنصة — مستقلون ومناديب الشركات",
								children: [
									(0, f.jsxs)("button", {
										className: "btn btn-o btn-sm",
										children: [(0, f.jsx)(S, { n: "filter", s: 14 }), " تصفية"],
									}),
									(0, f.jsxs)("button", {
										className: "btn btn-p btn-sm",
										children: [
											(0, f.jsx)(S, { n: "plus", s: 14 }),
											" ترقية مندوب",
										],
									}),
								],
							}),
							(0, f.jsxs)("div", {
								className: "grid g4",
								style: { marginBottom: 16 },
								children: [
									(0, f.jsx)(he, {
										icon: "bike",
										color: "#0f766e",
										bg: "#e6f7f4",
										val: u.length,
										label: "مندوب مسجل",
									}),
									(0, f.jsx)(he, {
										icon: "wifi",
										color: "#059669",
										bg: "#e7f6ef",
										val: u.filter((c) => c.status === "free").length,
										label: "متاح الآن",
									}),
									(0, f.jsx)(he, {
										icon: "route",
										color: "#d97706",
										bg: "#fef3e2",
										val: u.filter((c) => c.status === "busy").length,
										label: "مشغول",
									}),
									(0, f.jsx)(he, {
										icon: "star",
										color: "#2563eb",
										bg: "#e8effd",
										val: "4.7",
										label: "متوسط التقييم",
									}),
								],
							}),
							(0, f.jsx)(F, {
								pad: !1,
								title: "كل المناديب",
								children: (0, f.jsxs)("table", {
									className: "tbl",
									children: [
										(0, f.jsx)("thead", {
											children: (0, f.jsxs)("tr", {
												children: [
													(0, f.jsx)("th", {
														children: "المندوب",
													}),
													(0, f.jsx)("th", {
														children: "الموبايل",
													}),
													(0, f.jsx)("th", {
														children: "المركبة",
													}),
													(0, f.jsx)("th", {
														children: "المنطقة",
													}),
													(0, f.jsx)("th", {
														children: "الانتماء",
													}),
													(0, f.jsx)("th", {
														children: "التقييم",
													}),
													(0, f.jsx)("th", {
														children: "رحلات",
													}),
													(0, f.jsx)("th", {
														children: "أرباح الشهر",
													}),
													(0, f.jsx)("th", {
														children: "الحالة",
													}),
												],
											}),
										}),
										(0, f.jsx)("tbody", {
											children: u.map((c) =>
												(0, f.jsxs)(
													"tr",
													{
														children: [
															(0, f.jsx)("td", {
																children: (0, f.jsxs)("div", {
																	className: "row",
																	style: { gap: 9 },
																	children: [
																		(0, f.jsx)(lt, {
																			name: c.name,
																			size: 32,
																		}),
																		(0, f.jsx)("b", { children: c.name }),
																	],
																}),
															}),
															(0, f.jsx)("td", {
																className: "sub",
																children: c.phone,
															}),
															(0, f.jsxs)("td", {
																className: "sub",
																children: [
																	(0, f.jsx)(S, {
																		n: c.vehicle === "car" ? "car" : "bike",
																		s: 14,
																	}),
																	" ",
																	nd[c.vehicle],
																],
															}),
															(0, f.jsx)("td", {
																className: "sub",
																children: c.zone,
															}),
															(0, f.jsx)("td", {
																children: (0, f.jsx)(E, {
																	c: c.aff === "free" ? "b-gray" : "b-violet",
																	children: Z0[c.aff] || "منشأة",
																}),
															}),
															(0, f.jsx)("td", {
																children: (0, f.jsxs)("span", {
																	style: {
																		fontWeight: 800,
																		color: "#d97706",
																	},
																	children: ["★ ", c.rating],
																}),
															}),
															(0, f.jsx)("td", {
																className: "main-cell",
																children: c.trips,
															}),
															(0, f.jsx)("td", {
																className: "main-cell",
																children: se(c.earn),
															}),
															(0, f.jsx)("td", {
																children: (0, f.jsx)(E, {
																	c:
																		c.status === "free"
																			? "b-green"
																			: c.status === "busy"
																				? "b-amber"
																				: "b-gray",
																	children:
																		c.status === "free"
																			? "متاح"
																			: c.status === "busy"
																				? "مشغول"
																				: "غير متصل",
																}),
															}),
														],
													},
													c.id,
												),
											),
										}),
									],
								}),
							}),
						],
					})
				: e === "subs"
					? (0, f.jsx)(p2, {})
					: e === "reports"
						? (0, f.jsxs)(f.Fragment, {
								children: [
									(0, f.jsx)(De, {
										title: "التقارير",
										sub: "تحليلات الأداء التشغيلي والمالي",
										children: (0, f.jsxs)("button", {
											className: "btn btn-p btn-sm",
											children: [
												(0, f.jsx)(S, { n: "file", s: 14 }),
												" تصدير PDF",
											],
										}),
									}),
									(0, f.jsxs)("div", {
										className: "grid g2",
										children: [
											(0, f.jsx)(F, {
												title: "نمو الطلبات",
												action: (0, f.jsx)(E, {
													c: "b-green",
													children: "+18.4% شهريًا",
												}),
												children: (0, f.jsx)(At, {
													data: [
														310, 360, 340, 420, 470, 455, 540, 590, 640, 700,
														760, 820,
													],
													h: 90,
													color: "#0f766e",
												}),
											}),
											(0, f.jsx)(F, {
												title: "متوسط زمن التوصيل (دقيقة)",
												action: (0, f.jsx)(E, {
													c: "b-green",
													children: "تحسن 6%",
												}),
												children: (0, f.jsx)(At, {
													data: [
														31, 29, 30, 27, 26, 27, 25, 24, 24, 23, 22, 22,
													],
													h: 90,
													color: "#2563eb",
												}),
											}),
										],
									}),
									(0, f.jsx)("div", { style: { height: 16 } }),
									(0, f.jsxs)("div", {
										className: "grid g3",
										children: [
											(0, f.jsx)(F, {
												title: "أفضل المناطق من حيث حجم الطلبات",
												pad: !1,
												children: (0, f.jsx)("div", {
													style: { padding: 6 },
													children: [
														["التجمع الخامس", 268],
														["المعادي", 231],
														["مدينة نصر", 196],
														["مصر الجديدة", 171],
														["الهرم", 142],
													].map(([c, g]) =>
														(0, f.jsxs)(
															"div",
															{
																style: { padding: "9px 12px" },
																children: [
																	(0, f.jsxs)("div", {
																		className: "between",
																		children: [
																			(0, f.jsx)("b", {
																				style: { fontSize: 12.5 },
																				children: c,
																			}),
																			(0, f.jsxs)("span", {
																				className: "sub",
																				children: [g, " طلب"],
																			}),
																		],
																	}),
																	(0, f.jsx)("div", {
																		className: "progress",
																		style: { marginTop: 6 },
																		children: (0, f.jsx)("i", {
																			style: { width: (g / 268) * 100 + "%" },
																		}),
																	}),
																],
															},
															c,
														),
													),
												}),
											}),
											(0, f.jsxs)(F, {
												title: "تقييم رضا العملاء",
												children: [
													(0, f.jsx)(jo, {
														segs: [
															{
																label: "تقييم عام",
																v: 82,
																c: "#0f766e",
															},
															{ label: "", v: 12, c: "#e2e8f0" },
															{ label: "", v: 6, c: "#f1b3ad" },
														],
														center: "4.7★",
													}),
													(0, f.jsx)("div", { className: "hr" }),
													[
														["توصيل في الوقت", "92%"],
														["تعامل المندوب", "95%"],
														["دقة الحالة اللحظية", "89%"],
													].map(([c, g]) =>
														(0, f.jsxs)(
															"div",
															{
																className: "kv",
																children: [
																	(0, f.jsx)("span", { children: c }),
																	(0, f.jsx)("b", { children: g }),
																],
															},
															c,
														),
													),
												],
											}),
											(0, f.jsx)(F, {
												title: "مصادر إيرادات المنصة",
												children: [
													["اشتراكات الأنشطة التجارية", 14300, "#2563eb"],
													["اشتراكات شركات التوصيل", 46200, "#7c3aed"],
													["اشتراكات المناديب", 26950, "#0f766e"],
												].map(([c, g, R]) =>
													(0, f.jsxs)(
														"div",
														{
															style: { padding: "8px 0" },
															children: [
																(0, f.jsxs)("div", {
																	className: "between",
																	children: [
																		(0, f.jsx)("span", {
																			style: {
																				fontSize: 12.5,
																				fontWeight: 600,
																			},
																			children: c,
																		}),
																		(0, f.jsx)("b", {
																			style: { fontSize: 13 },
																			children: se(g),
																		}),
																	],
																}),
																(0, f.jsx)("div", {
																	className: "progress",
																	style: { marginTop: 6 },
																	children: (0, f.jsx)("i", {
																		style: {
																			width: (g / 87450) * 100 + "%",
																			background: R,
																		},
																	}),
																}),
															],
														},
														c,
													),
												),
											}),
										],
									}),
								],
							})
						: e === "settings"
							? (0, f.jsxs)(f.Fragment, {
									children: [
										(0, f.jsx)(De, {
											title: "الإعدادات",
											sub: "ضوابط المنصة العامة",
										}),
										(0, f.jsxs)("div", {
											className: "grid g2",
											children: [
												(0, f.jsxs)(F, {
													title: "سياسة الرسوم والاشتراكات",
													children: [
														(0, f.jsxs)("div", {
															className: "field",
															style: { marginBottom: 14 },
															children: [
																(0, f.jsx)("label", {
																	children:
																		"أقل رسوم توصيل مسموح بها على المنصة (جنيه)",
																}),
																(0, f.jsx)("input", {
																	className: "inp",
																	type: "number",
																	value: I,
																	onChange: (c) => h(+c.target.value),
																}),
																(0, f.jsx)("span", {
																	className: "hint",
																	children:
																		"يُطبَّق على طلبات المناديب المستقلين لضمان عدالة التسعير.",
																}),
															],
														}),
														(0, f.jsxs)("div", {
															className: "kv",
															children: [
																(0, f.jsx)("span", {
																	children: "نموذج الربح",
																}),
																(0, f.jsx)("b", {
																	children:
																		"اشتراكات فقط — بدون أي عمولة على الطلبات",
																}),
															],
														}),
														(0, f.jsxs)("div", {
															className: "kv",
															children: [
																(0, f.jsx)("span", {
																	children: "فترة التجربة المجانية",
																}),
																(0, f.jsx)("b", {
																	children: "14 يومًا",
																}),
															],
														}),
														(0, f.jsxs)("div", {
															className: "kv",
															children: [
																(0, f.jsx)("span", {
																	children: "تجديد الاشتراك",
																}),
																(0, f.jsx)("b", {
																	children: "تلقائي مع إشعار قبل 3 أيام",
																}),
															],
														}),
														(0, f.jsx)("div", { className: "hr" }),
														(0, f.jsx)("button", {
															className: "btn btn-p btn-sm",
															children: "حفظ التغييرات",
														}),
													],
												}),
												(0, f.jsx)(F, {
													title: "مناطق التغطية وأقل رسوم مقترحة",
													pad: !1,
													children: (0, f.jsxs)("table", {
														className: "tbl",
														children: [
															(0, f.jsx)("thead", {
																children: (0, f.jsxs)("tr", {
																	children: [
																		(0, f.jsx)("th", {
																			children: "المنطقة",
																		}),
																		(0, f.jsx)("th", {
																			children: "أقل رسوم",
																		}),
																		(0, f.jsx)("th", {
																			children: "مناديب متاحون",
																		}),
																	],
																}),
															}),
															(0, f.jsx)("tbody", {
																children: ud.slice(0, 8).map((c, g) =>
																	(0, f.jsxs)(
																		"tr",
																		{
																			children: [
																				(0, f.jsx)("td", {
																					className: "main-cell",
																					children: c,
																				}),
																				(0, f.jsx)("td", {
																					children: se(j0[g].min),
																				}),
																				(0, f.jsxs)("td", {
																					className: "sub",
																					children: [
																						[3, 4, 3, 5, 2, 4, 2, 1][g],
																						" مناديب",
																					],
																				}),
																			],
																		},
																		c,
																	),
																),
															}),
														],
													}),
												}),
											],
										}),
									],
								})
							: null;
}
var K = ReactNamespace;
var d = jsxRuntime,
	qm = [
		{
			label: "التشغيل",
			items: [
				{
					id: "home",
					icon: "grid",
					name: "الرئيسية",
				},
				{
					id: "newreq",
					icon: "zap",
					name: "طلب مندوب",
					pip: "جديد",
				},
				{
					id: "orders",
					icon: "box",
					name: "الطلبات",
				},
			],
		},
		{
			label: "الفريق",
			items: [
				{
					id: "fleet",
					icon: "bike",
					name: "مناديبي",
				},
				{
					id: "pool",
					icon: "users",
					name: "شراكة المناديب",
					pip: "جديد",
				},
			],
		},
		{
			label: "الحساب",
			items: [
				{
					id: "reports",
					icon: "chart",
					name: "التقارير",
				},
				{
					id: "settings",
					icon: "gear",
					name: "الإعدادات",
				},
			],
		},
	],
	ay = (() => {
		let e = gl.find((a) => a.id === "m1") || {};
		return {
			name: e.name || "مطعم زيتونة",
			type: e.type || "مطعم",
			zone: e.zone || "المعادي",
			addr: "المعادي — شارع 9، مبنى 12",
			aff: e.aff,
			couriers: e.couriers || 0,
		};
	})(),
	h2 = {
		مطعم: "أوردر طعام",
		صيدلية: "طلب صيدلية",
		"سوبر ماركت": "بقالة وسوبر ماركت",
	},
	g2 = Hu.filter((e) => e.aff === "m1");
function cf({ cur: e, go: a, store: t, initialRef: l = "", onHasPool: u }) {
	qm.some((L) => L.items.some((q) => q.id === e)) || (e = "home");
	let {
			orders: o,
			newRequest: n,
			toast: i,
			merchantCfg: r,
			setMerchantCfg: y,
			assignOrder: C,
		} = t,
		[I, h] = K.default.useState(null),
		[x, D] = K.default.useState([]),
		[H, V] = K.default.useState(l || ""),
		[v, b] = K.default.useState(""),
		[c, g] = K.default.useState([]),
		[R, X] = K.default.useState([]),
		[O, P] = K.default.useState([]),
		[fe, W] = K.default.useState([]),
		[na, aa] = K.default.useState(!1),
		[Ia, za] = K.default.useState(""),
		[jt, ba] = K.default.useState("2"),
		[Z, ge] = K.default.useState("6000"),
		[je, J] = K.default.useState(!1),
		[Zt, Ce] = K.default.useState(0),
		N = x.find((L) => L.ref === H) || null,
		Q = N
			? {
					name: N.name,
					zone: N.zone,
					addr: N.address || N.zone,
					gov: N.governorate || ff(N.zone),
				}
			: ay,
		[ae, Ie] = K.default.useState("");
	K.default.useEffect(() => {
		N && Ie(N.businessType || "");
	}, [N]);
	let re = () => {
			N &&
				(J(!0),
				apiFetch("/api/wasl/register", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ ref: N.ref, businessType: ae }),
				})
					.then((L) => (L.ok ? L.json() : null))
					.then((L) => {
						L && L.ok
							? (i("تم تحديث نوع النشاط"), Ce((q) => q + 1))
							: i("تعذر الحفظ — حاول مرة أخرى");
					})
					.catch(() => i("تعذر الاتصال بالسيرفر"))
					.finally(() => J(!1)));
		},
		ot = !!(
			N &&
			(I || []).some(
				(L) =>
					L.founderRef === N.ref ||
					(L.members || []).some((q) => q.ref === N.ref),
			)
		);
	K.default.useEffect(() => {
		u && u(ot);
	}, [ot]);
	let k = K.default.useCallback((L) => {
		if (!L) {
			W([]);
			return;
		}
		apiFetch(
			"/api/wasl/partnerships/invites?partnershipRef=" + encodeURIComponent(L),
		)
			.then((q) => (q.ok ? q.json() : null))
			.then((q) => {
				q && q.ok && W(q.invites);
			})
			.catch(() => {});
	}, []);
	(K.default.useEffect(() => {
		(e !== "pool" && e !== "fleet" && !l) ||
			(apiFetch("/api/wasl/partnerships")
				.then((L) => (L.ok ? L.json() : null))
				.then((L) => {
					L && L.ok && h(L.partnerships);
				})
				.catch(() => {}),
			apiFetch("/api/wasl/entities?type=merchant")
				.then((L) => (L.ok ? L.json() : null))
				.then((L) => {
					L && L.ok && D(L.entities);
				})
				.catch(() => {}));
	}, [e, Zt, l]),
		K.default.useEffect(() => {
			let L = v.trim();
			if (L.length < 8) {
				P([]);
				return;
			}
			apiFetch("/api/wasl/partnerships/invites?phone=" + encodeURIComponent(L))
				.then((q) => (q.ok ? q.json() : null))
				.then((q) => {
					q && q.ok && P(q.invites);
				})
				.catch(() => {});
		}, [v, Zt]));
	let [de, ve] = K.default.useState(0);
	(K.default.useEffect(() => {
		if (!N) {
			g([]);
			return;
		}
		apiFetch("/api/wasl/orders?merchant=" + encodeURIComponent(N.name))
			.then((L) => (L.ok ? L.json() : null))
			.then((L) => {
				L && L.ok && g(L.orders);
			})
			.catch(() => {});
	}, [N, de]),
		K.default.useEffect(() => {
			let L = (N ? N.phone : v).trim();
			if (L.length < 8) {
				X([]);
				return;
			}
			apiFetch("/api/wasl/clients?phone=" + encodeURIComponent(L))
				.then((q) => (q.ok ? q.json() : null))
				.then((q) => {
					q && q.ok && X(q.invites);
				})
				.catch(() => {});
		}, [N, v, de]));
	let ta = (L, q) => {
		apiFetch("/api/wasl/clients", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ ref: L, action: q }),
		})
			.then((Y) => Y.json())
			.then((Y) => {
				Y && Y.ok
					? (i(
							q === "accept"
								? "قبلت الدعوة — أصبحت عميلًا رسميًا لشركة التوصيل، وطلباتك هتتوجه ليها تلقائيًا ✅"
								: "تم رفض الدعوة",
						),
						ve((U) => U + 1))
					: i("تعذر تنفيذ الطلب — حاول مرة أخرى");
			})
			.catch(() => i("تعذر الاتصال بالخادم"));
	};
	K.default.useEffect(() => {
		let L = (I || []).find((q) => N && q.founderRef === N.ref);
		L ? k(L.ref) : W([]);
	}, [H, I, Zt, k, x]);
	let [Te, nt] = K.default.useState([]),
		[hf, Qt] = K.default.useState(!1),
		[Fu, fd] = K.default.useState(""),
		[yl, rd] = K.default.useState(""),
		[Va, gf] = K.default.useState("المعادي"),
		[Gu, vf] = K.default.useState("دراجة نارية"),
		[Ko, Xa] = K.default.useState(!1),
		[Ym, jm] = K.default.useState(0),
		ru = N ? N.ref : "";
	K.default.useEffect(() => {
		e !== "fleet" ||
			!ru ||
			apiFetch("/api/wasl/couriers?ownerRef=" + encodeURIComponent(ru))
				.then((L) => (L.ok ? L.json() : null))
				.then((L) => {
					L && L.ok && nt(L.couriers);
				})
				.catch(() => {});
	}, [e, ru, Ym]);
	let Kt = () => {
			if (!N) {
				i("اختار حسابك المسجل الأول من القائمة");
				return;
			}
			let L = yl.replace(/\s+/g, "");
			if (Fu.trim().length < 2) {
				i("اكتب اسم المندوب");
				return;
			}
			if (L.length < 8) {
				i("اكتب رقم موبايل المندوب كامل");
				return;
			}
			(Xa(!0),
				apiFetch("/api/wasl/couriers", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						ownerRef: N.ref,
						ownerType: "merchant",
						ownerName: N.name,
						name: Fu.trim(),
						phone: L,
						zone: Va.trim() || N.zone,
						vehicle:
							Gu === "سيارة"
								? "car"
								: Gu === "دراجة كهربائية"
									? "bike"
									: "moto",
					}),
				})
					.then((q) => q.json())
					.then((q) => {
						q && q.ok
							? (i(
									"اتبعتت دعوة الانضمام لـ " +
										q.courier.name +
										" — كود التفعيل: " +
										q.courier.inviteCode,
								),
								Qt(!1),
								fd(""),
								rd(""),
								jm((Y) => Y + 1))
							: q && q.error === "courier_exists"
								? i("هذا المندوب مسجل لديك بالفعل بنفس الرقم")
								: i("تعذر إرسال الدعوة — حاول مرة أخرى");
					})
					.catch(() => i("تعذّر الاتصال بالسيرفر"))
					.finally(() => Xa(!1)));
		},
		bl = (L, q) => {
			if (!N) {
				i(
					"اختر حسابك المسجل من صفحة \xABشراكة المناديب\xBB أولًا ليُسجل التسوية باسمك",
				);
				return;
			}
			if (!(q > 0)) {
				i("لا مستحقات حالية لـ " + L);
				return;
			}
			(J(!0),
				apiFetch("/api/wasl/settlements", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						ownerRef: N.ref,
						ownerName: N.name,
						courierName: L,
						amount: q,
					}),
				})
					.then((Y) => Y.json())
					.then((Y) => {
						Y && Y.ok
							? i(
									"اتسجلت التسوية " +
										se(q) +
										" لـ " +
										L +
										" — " +
										Y.settlement.ref,
								)
							: i("تعذر تسجيل التسوية — حاول مرة أخرى");
					})
					.catch(() => i("تعذّر الاتصال بالسيرفر"))
					.finally(() => J(!1)));
		},
		[xa, yf] = K.default.useState(""),
		[bt, cd] = K.default.useState(""),
		[cu, Jo] = K.default.useState(""),
		[xl, Wo] = K.default.useState(""),
		[Ll, xt] = K.default.useState(0),
		[Pu, bf] = K.default.useState(!0),
		[md, m] = K.default.useState(!0),
		[_, M] = K.default.useState(!1),
		[T, ee] = K.default.useState(null),
		[Na, Da] = K.default.useState(""),
		[Vu, Zm] = K.default.useState(""),
		[pd, Qm] = K.default.useState("");
	K.default.useEffect(() => {
		if (!N) return;
		let L = vl(N.governorate || "القاهرة");
		(yf(L.includes(N.zone) ? N.zone : L[0]), M(!1));
	}, [N]);
	let xf = o.filter((L) => L.merchant === Q.name && L.status !== "delivered"),
		st = o.filter((L) => L.merchant === Q.name),
		[uy, Km] = K.default.useState([]);
	K.default.useEffect(() => {
		let L = !0,
			q = () =>
				apiFetch("/api/wasl/inbox")
					.then((U) => (U.ok ? U.json() : null))
					.then((U) => {
						L && U && U.ok && Km(U.messages || []);
					})
					.catch(() => {});
		q();
		let Y = setInterval(q, 15e3);
		return () => {
			((L = !1), clearInterval(Y));
		};
	}, []);
	let Lf = uy.filter((L) => !L.handled),
		oy = (L) => {
			(Jo(L.phone || ""),
				Da(L.name || ""),
				Zm(L.body || ""),
				Qm(L.ref || ""),
				M(!1),
				a("newreq"),
				i("اتحملت بيانات رسالة العميل — اكمل العنوان وأرسل الطلب"));
		},
		ny = (L) => {
			(Km((q) => q.map((Y) => (Y.ref === L ? { ...Y, handled: !0 } : Y))),
				apiFetch("/api/wasl/inbox", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ ref: L }),
				}).catch(() => {}));
		},
		Jm = Lf.length
			? (0, d.jsx)(F, {
					title: "رسايل واتساب واردة",
					action: (0, d.jsxs)(E, {
						c: "b-amber",
						blink: !0,
						children: [Lf.length, " جديدة"],
					}),
					pad: !1,
					style: { marginBottom: 16 },
					children: (0, d.jsx)("div", {
						style: { padding: 16 },
						children: Lf.map((L) =>
							(0, d.jsxs)(
								"div",
								{
									style: {
										borderBottom: "1px solid var(--line)",
										padding: "10px 0",
									},
									children: [
										(0, d.jsxs)("div", {
											className: "row",
											style: { gap: 10, fontSize: 12.5, marginBottom: 4 },
											children: [
												(0, d.jsx)("b", {
													children: L.name || "عميل",
												}),
												(0, d.jsx)("span", {
													style: { color: "var(--mut)" },
													children: L.phone,
												}),
												(0, d.jsx)("span", {
													style: {
														color: "var(--mut)",
														marginInlineStart: "auto",
													},
													children: L.time,
												}),
											],
										}),
										(0, d.jsx)("div", {
											style: {
												fontSize: 12.5,
												color: "var(--mut)",
												marginBottom: 8,
												whiteSpace: "pre-wrap",
											},
											children: L.body,
										}),
										(0, d.jsxs)("div", {
											className: "row",
											style: { gap: 8 },
											children: [
												(0, d.jsxs)("button", {
													className: "btn btn-p btn-sm",
													onClick: () => oy(L),
													children: [
														(0, d.jsx)(S, { n: "zap", s: 13 }),
														" طلب مندوب",
													],
												}),
												(0, d.jsx)("button", {
													className: "btn btn-o btn-sm",
													onClick: () => ny(L.ref),
													children: "تجاهل",
												}),
											],
										}),
									],
								},
								L.ref,
							),
						),
					}),
				})
			: null;
	if (e === "home") {
		let L = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"],
			q = (() => {
				let j = [],
					Mt = [];
				for (let G = 6; G >= 0; G--) {
					let Ke = new Date(Date.now() - G * 864e5);
					(j.push(
						st.filter(
							(ye) => new Date(ye.ts).toDateString() === Ke.toDateString(),
						).length,
					),
						Mt.push(L[Ke.getDay()]));
				}
				return { data: j, labels: Mt };
			})(),
			Y = (j) => new Date(j.ts).toDateString() === new Date().toDateString(),
			U = st.filter(Y).length,
			le = st.filter((j) => Y(j) && j.status === "delivered").length,
			Xe = st
				.filter((j) => Y(j) && j.status === "delivered")
				.reduce((j, Mt) => j + (Mt.fee || 0), 0),
			Ee = R.filter((j) => j.status === "pending"),
			Oa = R.find((j) => j.status === "accepted"),
			Be = (j) => Yt[j] || { t: j || "—", c: "b-gray" },
			ue = Ee.length
				? (0, d.jsx)(F, {
						title: "دعوات شركات توصيل وصلتك",
						action: (0, d.jsxs)(E, {
							c: "b-amber",
							blink: !0,
							children: [Ee.length, " دعوة"],
						}),
						pad: !1,
						style: { marginBottom: 16 },
						children: (0, d.jsx)("div", {
							style: { padding: 16 },
							children: Ee.map((j) =>
								(0, d.jsxs)(
									"div",
									{
										style: {
											borderBottom: "1px solid var(--line2)",
											padding: "12px 0",
										},
										children: [
											(0, d.jsxs)("div", {
												className: "between",
												style: { marginBottom: 6 },
												children: [
													(0, d.jsxs)("div", {
														className: "row",
														style: { gap: 10 },
														children: [
															(0, d.jsx)("div", {
																className: "ico",
																style: {
																	width: 36,
																	height: 36,
																	background: "var(--violetSoft)",
																	color: "var(--violet)",
																},
																children: (0, d.jsx)(S, {
																	n: "building",
																	s: 16,
																}),
															}),
															(0, d.jsxs)("div", {
																children: [
																	(0, d.jsx)("b", {
																		children: j.companyName,
																	}),
																	(0, d.jsxs)("div", {
																		className: "sub",
																		children: [
																			"دعوة لخدمة التوصيل — منطقة ",
																			j.zone,
																		],
																	}),
																],
															}),
														],
													}),
													(0, d.jsxs)("div", {
														className: "row",
														style: { gap: 8 },
														children: [
															(0, d.jsxs)("button", {
																className: "btn btn-p btn-sm",
																onClick: () => ta(j.ref, "accept"),
																children: [
																	(0, d.jsx)(S, { n: "check", s: 13 }),
																	" قبول",
																],
															}),
															(0, d.jsx)("button", {
																className: "btn btn-o btn-sm",
																onClick: () => ta(j.ref, "decline"),
																children: "رفض",
															}),
														],
													}),
												],
											}),
											(0, d.jsx)("div", {
												className: "sub",
												style: { fontSize: 11.5 },
												children:
													"بالقبول تصبح عميلًا رسميًا لشركة التوصيل — كل طلب ترسله يتوجه تلقائيًا لمناديبها وتُسوّى معها أسبوعيًا.",
											}),
										],
									},
									j.ref,
								),
							),
						}),
					})
				: null,
			Sl = c.length
				? (0, d.jsx)(F, {
						pad: !1,
						title: "طلباتك على منصة Super X",
						action: (0, d.jsxs)(E, {
							c: "b-teal",
							children: [c.length, " طلب حقيقي"],
						}),
						style: { marginBottom: 16 },
						children: (0, d.jsxs)("table", {
							className: "tbl",
							children: [
								(0, d.jsx)("thead", {
									children: (0, d.jsxs)("tr", {
										children: [
											(0, d.jsx)("th", {
												children: "الطلب",
											}),
											(0, d.jsx)("th", {
												children: "الوجهة",
											}),
											(0, d.jsx)("th", {
												children: "المندوب",
											}),
											(0, d.jsx)("th", {
												children: "الرسوم",
											}),
											(0, d.jsx)("th", {
												children: "الحالة",
											}),
										],
									}),
								}),
								(0, d.jsx)("tbody", {
									children: c.slice(0, 6).map((j) => {
										let Mt = Be(j.status);
										return (0, d.jsxs)(
											"tr",
											{
												children: [
													(0, d.jsxs)("td", {
														className: "main-cell",
														children: [
															j.id,
															(0, d.jsx)("div", {
																className: "sub",
																children: j.time,
															}),
														],
													}),
													(0, d.jsx)("td", {
														className: "sub",
														children: j.to,
													}),
													(0, d.jsx)("td", {
														children:
															j.courier ||
															(0, d.jsx)(E, {
																c: "b-amber",
																blink: !0,
																children: "بانتظار مندوب",
															}),
													}),
													(0, d.jsx)("td", {
														className: "main-cell",
														children: se(j.fee),
													}),
													(0, d.jsx)("td", {
														children: (0, d.jsx)(E, {
															c: Mt.c,
															blink: j.status === "searching",
															children: Mt.t,
														}),
													}),
												],
											},
											j.id,
										);
									}),
								}),
							],
						}),
					})
				: null;
		return (0, d.jsxs)(d.Fragment, {
			children: [
				(0, d.jsx)(De, {
					title: "الرئيسية",
					sub: "لوحة يومية لإدارة توصيل مطعمك",
					children: (0, d.jsxs)("button", {
						className: "btn btn-p btn-sm",
						onClick: () => a("newreq"),
						children: [(0, d.jsx)(S, { n: "zap", s: 14 }), " طلب مندوب"],
					}),
				}),
				Jm,
				ue,
				Oa &&
					(0, d.jsxs)("div", {
						className: "note",
						style: { marginBottom: 16 },
						children: [
							(0, d.jsx)(S, { n: "check" }),
							" أنت عميل رسمي لدى ",
							(0, d.jsx)("b", { children: Oa.companyName }),
							" — طلباتك تُسنَّد لمناديبها تلقائيًا.",
						],
					}),
				Sl,
				(0, d.jsx)(F, {
					title: "وضع تشغيلك",
					action: (0, d.jsx)("button", {
						className: "btn btn-o btn-sm",
						onClick: () => a("settings"),
						children: "تغيير",
					}),
					children:
						Te.length > 0
							? (0, d.jsxs)(d.Fragment, {
									children: [
										(0, d.jsxs)("div", {
											className: "row wrap",
											style: { gap: 8, marginBottom: 10 },
											children: [
												(0, d.jsxs)(E, {
													c: "b-green",
													icon: "bike",
													children: [
														"عندك ",
														Te.length,
														" ",
														Te.length === 1 ? "مندوب مسجل" : "مناديب مسجلين",
													],
												}),
												(0, d.jsx)(E, {
													c: "b-blue",
													icon: "cash",
													children:
														r.payModel.type === "per_order"
															? "مستحق كل مندوب " +
																(r.payModel.value || 0) +
																" ج لكل طلب"
															: r.payModel.type === "salary"
																? "مناديبك على راتب شهري ثابت"
																: "مناديبك يحصلون على " +
																	(r.payModel.value || 0) +
																	"% من رسوم كل طلب",
												}),
											],
										}),
										(0, d.jsxs)("div", {
											className: "sub",
											style: { fontSize: 12, lineHeight: 1.9 },
											children: [
												"تُسند طلباتك إلى ",
												(0, d.jsx)("b", {
													children: "فريقك",
												}),
												" أولًا — وأنت من يحدد مستحقات كل مندوب من الإعدادات، وتُجمع التسوية في صفحة \xABمناديبي\xBB.",
											],
										}),
									],
								})
							: (0, d.jsxs)(d.Fragment, {
									children: [
										(0, d.jsxs)("div", {
											className: "row wrap",
											style: { gap: 8, marginBottom: 10 },
											children: [
												(0, d.jsx)(E, {
													c: "b-teal",
													icon: "bike",
													children: "شبكة مناديب Super X",
												}),
												(0, d.jsx)(E, {
													c: "b-blue",
													icon: "cash",
													children: "رسوم ثابتة حسب المسافة لكل طلب",
												}),
											],
										}),
										(0, d.jsx)("div", {
											className: "sub",
											style: { fontSize: 12, lineHeight: 1.9 },
											children:
												"يُسند النظام كل طلب تلقائيًا إلى أقرب مندوب متاح في شبكة Super X — وتدفع رسوم التوصيل المعروضة على الطلب فقط.",
										}),
									],
								}),
				}),
				(0, d.jsx)("div", { style: { height: 16 } }),
				(0, d.jsxs)("div", {
					className: "grid g4",
					children: [
						(0, d.jsx)(he, {
							icon: "box",
							color: "#0d9488",
							bg: "#e4f7f4",
							val: xf.length,
							label: "طلبات جارية",
						}),
						(0, d.jsx)(he, {
							icon: "check",
							color: "#059669",
							bg: "#e5f6ef",
							val: st.filter((j) => j.status === "delivered").length,
							label: "طلبات مكتملة",
						}),
						(0, d.jsx)(he, {
							icon: "bike",
							color: "#2f6bff",
							bg: "#e9efff",
							val: Te.filter((j) => j.status === "active").length,
							label: "مناديب مسجلون",
						}),
						(0, d.jsx)(he, {
							icon: "pin",
							color: "#d97706",
							bg: "#fdf2e3",
							val: Q.zone,
							label: "منطقة التشغيل",
						}),
					],
				}),
				(0, d.jsx)("div", { style: { height: 16 } }),
				(0, d.jsxs)("div", {
					className: "grid g21",
					children: [
						(0, d.jsxs)("div", {
							className: "grid",
							style: { gap: 16 },
							children: [
								(0, d.jsxs)(F, {
									title: "الطلبات الجارية الآن",
									action: (0, d.jsx)("button", {
										className: "btn btn-o btn-sm",
										onClick: () => a("orders"),
										children: "كل الطلبات",
									}),
									pad: !1,
									children: [
										xf.length === 0 &&
											(0, d.jsx)("div", {
												style: {
													padding: 30,
													textAlign: "center",
													color: "var(--mut)",
												},
												children: "لا توجد طلبات جارية حاليًا.",
											}),
										xf.map((j) =>
											(0, d.jsxs)(
												"div",
												{
													style: {
														padding: "14px 18px",
														borderBottom: "1px solid var(--line2)",
													},
													children: [
														(0, d.jsxs)("div", {
															className: "between",
															style: { marginBottom: 8 },
															children: [
																(0, d.jsxs)("div", {
																	className: "row",
																	children: [
																		(0, d.jsx)("b", { children: j.id }),
																		(0, d.jsx)(E, {
																			c: (Yt[j.status] || { c: "b-gray" }).c,
																			blink: j.status === "searching",
																			children: (
																				Yt[j.status] || {
																					t: j.status || "—",
																				}
																			).t,
																		}),
																	],
																}),
																(0, d.jsxs)("span", {
																	className: "sub",
																	children: [se(j.fee), " — ", j.pay],
																}),
															],
														}),
														(0, d.jsx)(Xt, {
															cur:
																{
																	searching: 0,
																	accepted: 1,
																	pickup: 2,
																	heading: 3,
																	delivered: 4,
																}[j.status] ?? 0,
															labels: [
																"طلب",
																"قبول",
																"استلام",
																"في الطريق",
																"تسليم",
															],
														}),
														(0, d.jsxs)("div", {
															className: "row",
															style: {
																marginTop: 8,
																gap: 14,
																fontSize: 12,
																color: "var(--mut)",
															},
															children: [
																(0, d.jsxs)("span", {
																	children: [
																		(0, d.jsx)(S, { n: "pin", s: 13 }),
																		" ",
																		j.to,
																	],
																}),
																j.courier &&
																	(0, d.jsxs)("span", {
																		children: [
																			(0, d.jsx)(S, { n: "bike", s: 13 }),
																			" ",
																			j.courier,
																		],
																	}),
																(0, d.jsxs)("span", {
																	children: [
																		(0, d.jsx)(S, { n: "clock", s: 13 }),
																		" ",
																		j.eta,
																	],
																}),
															],
														}),
													],
												},
												j.id,
											),
										),
									],
								}),
								(0, d.jsxs)("div", {
									className: "grid g2",
									children: [
										(0, d.jsx)(F, {
											title: "حجم الطلبات — آخر 7 أيام",
											children: (0, d.jsx)(pl, {
												data: q.data,
												labels: q.labels,
											}),
										}),
										(0, d.jsxs)(F, {
											title: "ملخص اليوم",
											children: [
												(0, d.jsxs)("div", {
													className: "kv",
													children: [
														(0, d.jsx)("span", {
															children: "طلبات اليوم",
														}),
														(0, d.jsx)("b", { children: U }),
													],
												}),
												(0, d.jsxs)("div", {
													className: "kv",
													children: [
														(0, d.jsx)("span", {
															children: "مكتملة منها",
														}),
														(0, d.jsx)("b", { children: le }),
													],
												}),
												(0, d.jsxs)("div", {
													className: "kv",
													children: [
														(0, d.jsx)("span", {
															children: "رسوم الطلبات المكتملة",
														}),
														(0, d.jsx)("b", { children: se(Xe) }),
													],
												}),
											],
										}),
									],
								}),
							],
						}),
						(0, d.jsx)("div", {
							className: "grid",
							style: { gap: 16, alignContent: "start" },
							children: (0, d.jsxs)(F, {
								title: "إجراءات سريعة",
								children: [
									(0, d.jsxs)("button", {
										className: "btn btn-p btn-lg",
										onClick: () => a("newreq"),
										children: [(0, d.jsx)(S, { n: "zap" }), " طلب مندوب الآن"],
									}),
									(0, d.jsx)("div", { style: { height: 10 } }),
									(0, d.jsxs)("button", {
										className: "btn btn-o btn-lg",
										onClick: () => a("fleet"),
										children: [(0, d.jsx)(S, { n: "bike" }), " إدارة مناديبي"],
									}),
									(0, d.jsx)("div", { className: "hr" }),
									(0, d.jsxs)("div", {
										className: "kv",
										children: [
											(0, d.jsx)("span", {
												children: "منطقة التشغيل",
											}),
											(0, d.jsx)("b", { children: Q.zone }),
										],
									}),
									(0, d.jsxs)("div", {
										className: "kv",
										children: [
											(0, d.jsx)("span", {
												children: "مناديب مسجلون",
											}),
											(0, d.jsx)("b", { children: Te.length }),
										],
									}),
									(0, d.jsxs)("div", {
										className: "kv",
										children: [
											(0, d.jsx)("span", {
												children: "طلبات مسجلة",
											}),
											(0, d.jsx)("b", { children: st.length }),
										],
									}),
								],
							}),
						}),
					],
				}),
			],
		});
	}
	if (e === "newreq") {
		let L = vl(Q.gov || ff(Q.zone)),
			q = L.includes(xa) || !xa ? L : [xa, ...L],
			Y = h2[(N && N.businessType) || ""] || "طلب توصيل",
			U = df({ merchantZone: Q.zone, destZone: xa }),
			le = sd(ay),
			Xe = Math.round((U.min + U.max) / 2 / 5) * 5,
			Ee = _ ? parseInt(xl) || 0 : Xe,
			Oa =
				bt.trim().length > 3 &&
				Ee >= U.min &&
				Ee <= U.max &&
				cu.trim().length >= 6,
			Be = () => {
				(n({
					merchant: Q.name,
					merchantZone: Q.zone,
					from: Q.addr,
					to: xa + " — " + bt,
					fee: Ee,
					zone: xa,
					pay: "كاش",
					source: pd ? "whatsapp" : "free",
					cust: cu,
					custName: Na.trim() || void 0,
					kind: Y,
					km: U.km,
					feeMin: U.min,
					feeMax: U.max,
					readyMin: Ll,
					note: Vu.trim() || void 0,
				}),
					pd &&
						apiFetch("/api/wasl/inbox", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ ref: pd }),
						}).catch(() => {}),
					apiFetch("/api/wasl/orders", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							merchant: Q.name,
							merchantZone: Q.zone,
							fromAddr: Q.addr,
							destZone: xa,
							toAddr: xa + " — " + bt,
							fee: Ee,
							pay: "كاش",
							kind: Y,
							customerPhone: cu,
							customerName: Na.trim() || void 0,
							total: void 0,
							readyMinutes: Ll || 0,
							note: Vu.trim() || void 0,
							source: pd ? "whatsapp" : "merchant",
						}),
					})
						.then((ue) => ue.json())
						.then((ue) => {
							ue && ue.ok
								? (i(
										"الطلب اتسجل على المنصة برقم " +
											ue.order.id +
											" — وهيتوجه لأقرب مندوب متاح",
									),
									ve((Sl) => Sl + 1))
								: i("الطلب محفوظ محليًا — تعذر تسجيله على المنصة الآن");
						})
						.catch(() => i("تعذر الاتصال بالخادم — الطلب محفوظ محليًا")),
					Qm(""),
					Zm(""),
					Da(""),
					a("orders"));
			};
		return (0, d.jsxs)(d.Fragment, {
			children: [
				(0, d.jsx)(De, {
					title: "طلب مندوب",
					sub: "أرسل طلب توصيل وسيبحث النظام عن أقرب مندوب مناسب تلقائيًا",
				}),
				(0, d.jsxs)("div", {
					className: "grid g21",
					children: [
						(0, d.jsxs)(F, {
							title: "تفاصيل الطلب",
							children: [
								Vu &&
									(0, d.jsxs)("div", {
										className: "note",
										style: { marginBottom: 12 },
										children: [
											(0, d.jsx)(S, { n: "send" }),
											" رسالة العميل: ",
											Vu,
										],
									}),
								(0, d.jsxs)("div", {
									className: "field",
									style: { marginBottom: 14 },
									children: [
										(0, d.jsx)("label", {
											children: "رقم العميل",
										}),
										(0, d.jsx)("input", {
											className: "inp",
											placeholder: "01xxxxxxxxx",
											value: cu,
											onChange: (ue) => Jo(ue.target.value),
										}),
									],
								}),
								(0, d.jsxs)("div", {
									className: "field",
									style: { marginBottom: 14 },
									children: [
										(0, d.jsx)("label", {
											children: "اسم العميل — اختياري",
										}),
										(0, d.jsx)("input", {
											className: "inp",
											placeholder: "اسم صاحب الطلب",
											value: Na,
											onChange: (ue) => Da(ue.target.value),
										}),
									],
								}),
								(0, d.jsxs)("div", {
									className: "field",
									style: { marginBottom: 14 },
									children: [
										(0, d.jsxs)("label", {
											children: ["منطقة العميل — مناطق ", Q.gov || ff(Q.zone)],
										}),
										(0, d.jsx)("div", {
											className: "row wrap",
											style: { gap: 7 },
											children: q.map((ue) =>
												(0, d.jsx)(
													"button",
													{
														className: "btn btn-o btn-sm",
														onClick: () => {
															(yf(ue), M(!1));
														},
														style: {
															borderColor:
																xa === ue ? "var(--brand)" : "var(--line)",
															color:
																xa === ue ? "var(--brandInk)" : "var(--mut)",
															background:
																xa === ue ? "var(--brandSoft)" : "#fff",
															fontWeight: xa === ue ? 800 : 600,
														},
														children: ue,
													},
													ue,
												),
											),
										}),
									],
								}),
								(0, d.jsxs)("div", {
									className: "field",
									style: { marginBottom: 14 },
									children: [
										(0, d.jsx)("label", {
											children: "عنوان التسليم بالتفصيل",
										}),
										(0, d.jsx)("input", {
											className: "inp",
											placeholder: "الشارع، رقم العمارة، علامة مميزة…",
											value: bt,
											onChange: (ue) => cd(ue.target.value),
										}),
									],
								}),
								(0, d.jsxs)("div", {
									className: "field",
									style: { marginBottom: 14 },
									children: [
										(0, d.jsx)("label", {
											children: "الأوردر يجهز بعد",
										}),
										(0, d.jsx)("div", {
											className: "row",
											style: { gap: 7 },
											children: [0, 10, 15, 20, 30].map((ue) =>
												(0, d.jsx)(
													"button",
													{
														className: "btn btn-o btn-sm",
														onClick: () => xt(ue),
														style: {
															borderColor:
																Ll === ue ? "var(--brand)" : "var(--line)",
															color:
																Ll === ue ? "var(--brandInk)" : "var(--mut)",
															background:
																Ll === ue ? "var(--brandSoft)" : "#fff",
															fontWeight: Ll === ue ? 800 : 600,
														},
														children: ue === 0 ? "جاهز الآن" : ue + " دقيقة",
													},
													ue,
												),
											),
										}),
										(0, d.jsx)("span", {
											className: "hint",
											children:
												"المندوب يتوجه للعميل في الوقت المناسب بدل الانتظار عند التحضير — اختر وقت التحضير المتوقع.",
										}),
									],
								}),
								(0, d.jsxs)("div", {
									className: "row",
									style: { gap: 8, margin: "4px 0 14px", flexWrap: "wrap" },
									children: [
										(0, d.jsxs)(E, {
											c: "b-teal",
											icon: "route",
											children: ["المسافة ≈ ", U.km, " كم"],
										}),
										(0, d.jsxs)(E, {
											c: "b-blue",
											icon: "cash",
											children: [
												"نطاق الرسوم: من ",
												U.min,
												" إلى ",
												U.max,
												" ج",
											],
										}),
									],
								}),
								(0, d.jsx)("div", { className: "hr" }),
								(0, d.jsxs)("div", {
									className: "field",
									children: [
										(0, d.jsx)("label", {
											children:
												"رسوم التوصيل (جنيه) — مقترح تلقائيًا حسب المسافة",
										}),
										(0, d.jsxs)("div", {
											className: "row",
											style: { gap: 8 },
											children: [
												(0, d.jsx)("input", {
													className: "inp",
													type: "number",
													value: _ ? xl : Xe,
													onChange: (ue) => {
														(M(!0), Wo(ue.target.value));
													},
												}),
												_ &&
													(0, d.jsx)("button", {
														className: "btn btn-o btn-sm",
														style: { whiteSpace: "nowrap" },
														onClick: () => {
															(M(!1), Wo(""));
														},
														children: "السعر المقترح",
													}),
											],
										}),
										(0, d.jsxs)("span", {
											className: "hint",
											children: [
												"النطاق المعتمد من ",
												U.min,
												" إلى ",
												U.max,
												" ج — محسوب من نشاطك في \xAB",
												Q.zone,
												"\xBB إلى العميل في \xAB",
												xa,
												"\xBB (≈",
												U.km,
												" كم). السعر المقترح: ",
												Xe,
												" ج.",
											],
										}),
									],
								}),
							],
						}),
						(0, d.jsx)("div", {
							className: "grid",
							style: { gap: 16, alignContent: "start" },
							children: (0, d.jsxs)(F, {
								title: "ملخص الطلب",
								children: [
									(0, d.jsxs)("div", {
										className: "kv",
										children: [
											(0, d.jsx)("span", {
												children: "النوع",
											}),
											(0, d.jsx)("b", { children: Y }),
										],
									}),
									(0, d.jsxs)("div", {
										className: "kv",
										children: [
											(0, d.jsx)("span", {
												children: "من — الاستلام",
											}),
											(0, d.jsx)("b", {
												style: { fontSize: 12 },
												children: Q.zone,
											}),
										],
									}),
									(0, d.jsxs)("div", {
										className: "kv",
										children: [
											(0, d.jsx)("span", {
												children: "إلى — التسليم",
											}),
											(0, d.jsxs)("b", {
												style: { fontSize: 12 },
												children: [xa, bt.trim() ? " — " + bt.trim() : ""],
											}),
										],
									}),
									(0, d.jsxs)("div", {
										className: "kv",
										children: [
											(0, d.jsx)("span", {
												children: "المسافة المتوقعة",
											}),
											(0, d.jsxs)("b", { children: [U.km, " كم"] }),
										],
									}),
									(0, d.jsxs)("div", {
										className: "kv",
										children: [
											(0, d.jsx)("span", {
												children: "نطاق الرسوم",
											}),
											(0, d.jsxs)("b", {
												children: ["من ", U.min, " إلى ", U.max, " ج"],
											}),
										],
									}),
									(0, d.jsxs)("div", {
										className: "kv",
										children: [
											(0, d.jsx)("span", {
												children: "عرضك",
											}),
											(0, d.jsx)("b", {
												style: {
													color:
														Ee >= U.min && Ee <= U.max
															? "var(--green)"
															: Ee
																? "var(--red)"
																: "var(--mut)",
												},
												children: Ee ? se(Ee) : "—",
											}),
										],
									}),
									(0, d.jsx)("div", { className: "hr" }),
									(0, d.jsxs)("div", {
										className: "kv",
										children: [
											(0, d.jsx)("span", {
												children: "نظام التوزيع",
											}),
											(0, d.jsxs)("b", {
												children: [sf[r.mode], " — ", iu[r.criteria]],
											}),
										],
									}),
									(0, d.jsxs)("div", {
										className: "note",
										style: { marginTop: 10 },
										children: [
											(0, d.jsx)(S, { n: "target" }),
											r.mode === "auto"
												? "يُسند الطلب تلقائيًا إلى أقرب مندوب متاح في شبكة Super X — وسيظهر اسم المندوب وحالة الرحلة لحظة القبول."
												: "يظهر الطلب في طابور الإسناد لديك، وتُسنده بنفسك من لوحة التوزيع.",
										],
									}),
									(0, d.jsxs)("button", {
										className: "btn btn-p btn-lg",
										disabled: !Oa,
										onClick: Be,
										children: [
											(0, d.jsx)(S, { n: "send" }),
											" إرسال طلب المندوب",
										],
									}),
								],
							}),
						}),
					],
				}),
			],
		});
	}
	if (e === "orders")
		return (0, d.jsxs)(d.Fragment, {
			children: [
				(0, d.jsxs)(De, {
					title: "الطلبات",
					sub: `سجل طلبات التوصيل — ${c.length} طلب حقيقي على المنصة`,
					children: [
						(0, d.jsxs)("button", {
							className: "btn btn-p btn-sm",
							onClick: () => a("newreq"),
							children: [(0, d.jsx)(S, { n: "plus", s: 14 }), " طلب مندوب"],
						}),
						(0, d.jsx)("button", {
							className: "iconbtn",
							title: "تحديث",
							onClick: () => ve((L) => L + 1),
							children: (0, d.jsx)(S, { n: "refresh", s: 16 }),
						}),
					],
				}),
				c.length > 0 &&
					(0, d.jsx)(F, {
						pad: !1,
						title: "طلباتك المسجلة على منصة Super X",
						action: (0, d.jsx)(E, {
							c: "b-teal",
							children: "حقيقي",
						}),
						style: { marginBottom: 16 },
						children: (0, d.jsxs)("table", {
							className: "tbl",
							children: [
								(0, d.jsx)("thead", {
									children: (0, d.jsxs)("tr", {
										children: [
											(0, d.jsx)("th", {
												children: "الطلب",
											}),
											(0, d.jsx)("th", {
												children: "الوجهة",
											}),
											(0, d.jsx)("th", {
												children: "المنطقة",
											}),
											(0, d.jsx)("th", {
												children: "المندوب",
											}),
											(0, d.jsx)("th", {
												children: "الرسوم",
											}),
											(0, d.jsx)("th", {
												children: "الحالة",
											}),
										],
									}),
								}),
								(0, d.jsx)("tbody", {
									children: c.map((L) => {
										let q = Yt[L.status] || {
											t: L.status || "—",
											c: "b-gray",
										};
										return (0, d.jsxs)(
											"tr",
											{
												children: [
													(0, d.jsxs)("td", {
														className: "main-cell",
														children: [
															L.id,
															(0, d.jsx)("div", {
																className: "sub",
																children: L.time,
															}),
														],
													}),
													(0, d.jsx)("td", {
														className: "sub",
														children: L.to,
													}),
													(0, d.jsx)("td", {
														className: "sub",
														children: L.zone,
													}),
													(0, d.jsx)("td", {
														children:
															L.courier ||
															(0, d.jsx)(E, {
																c: "b-amber",
																blink: !0,
																children: "بانتظار مندوب",
															}),
													}),
													(0, d.jsx)("td", {
														className: "main-cell",
														children: se(L.fee),
													}),
													(0, d.jsx)("td", {
														children: (0, d.jsx)(E, {
															c: q.c,
															blink: L.status === "searching",
															children: q.t,
														}),
													}),
												],
											},
											L.id,
										);
									}),
								}),
							],
						}),
					}),
				Jm,
				o
					.filter((L) => L.status === "searching" && L.manual)
					.map((L) => {
						let q = fu(
							Hu.filter((Y) => Y.aff === "free"),
							L.zone,
							r.criteria,
						).slice(0, 4);
						return (0, d.jsx)(
							F,
							{
								title: `طلب ${L.id} بانتظار اختيار المندوب`,
								action: (0, d.jsx)(E, {
									c: "b-amber",
									blink: !0,
									children: "وضع يدوي",
								}),
								pad: !1,
								style: { marginBottom: 16 },
								children: (0, d.jsxs)("div", {
									style: { padding: 16 },
									children: [
										(0, d.jsxs)("div", {
											className: "row",
											style: {
												fontSize: 12.5,
												color: "var(--mut)",
												gap: 14,
												marginBottom: 12,
											},
											children: [
												(0, d.jsxs)("span", {
													children: [
														(0, d.jsx)(S, { n: "pin", s: 13 }),
														" ",
														L.to,
													],
												}),
												(0, d.jsxs)("span", {
													children: [
														(0, d.jsx)(S, { n: "cash", s: 13 }),
														" ",
														se(L.fee),
													],
												}),
											],
										}),
										(0, d.jsx)("div", {
											className: "row",
											style: { gap: 8, flexWrap: "wrap" },
											children: q.map((Y) =>
												(0, d.jsxs)(
													"button",
													{
														className: "btn btn-o btn-sm",
														onClick: () => {
															(C(L.id, Y.name),
																i("تم إسناد الطلب إلى " + Y.name));
														},
														children: [
															(0, d.jsx)(S, { n: "bike", s: 13 }),
															" ",
															Y.name,
															" — ",
															Y.zone,
															" ★",
															Y.rating,
														],
													},
													Y.id,
												),
											),
										}),
									],
								}),
							},
							L.id,
						);
					}),
				(0, d.jsx)(F, {
					pad: !1,
					children: (0, d.jsxs)("table", {
						className: "tbl",
						children: [
							(0, d.jsx)("thead", {
								children: (0, d.jsxs)("tr", {
									children: [
										(0, d.jsx)("th", {
											children: "الطلب",
										}),
										(0, d.jsx)("th", {
											children: "الوجهة",
										}),
										(0, d.jsx)("th", {
											children: "المندوب",
										}),
										(0, d.jsx)("th", {
											children: "الرسوم",
										}),
										(0, d.jsx)("th", {
											children: "الدفع",
										}),
										(0, d.jsx)("th", {
											children: "الحالة",
										}),
										(0, d.jsx)("th", {
											children: "التتبع",
										}),
									],
								}),
							}),
							(0, d.jsx)("tbody", {
								children: st.map((L) => {
									let q = Yt[L.status] || {
											t: L.status || "—",
											c: "b-gray",
										},
										Y = T === L.id;
									return (0, d.jsxs)(
										K.default.Fragment,
										{
											children: [
												(0, d.jsxs)("tr", {
													onClick: () => ee(Y ? null : L.id),
													style: { cursor: "pointer" },
													children: [
														(0, d.jsxs)("td", {
															className: "main-cell",
															children: [
																L.id,
																(0, d.jsx)("div", {
																	className: "sub",
																	children: L.time,
																}),
															],
														}),
														(0, d.jsx)("td", {
															className: "sub",
															children: L.to,
														}),
														(0, d.jsx)("td", {
															children: L.courier
																? (0, d.jsxs)("div", {
																		className: "row",
																		style: { gap: 7 },
																		children: [
																			(0, d.jsx)(lt, {
																				name: L.courier,
																				size: 26,
																			}),
																			(0, d.jsx)("span", {
																				children: L.courier,
																			}),
																		],
																	})
																: (0, d.jsx)(E, {
																		c: "b-amber",
																		blink: !0,
																		children: "بانتظار مندوب…",
																	}),
														}),
														(0, d.jsx)("td", {
															className: "main-cell",
															children: se(L.fee),
														}),
														(0, d.jsx)("td", {
															className: "sub",
															children: L.pay,
														}),
														(0, d.jsx)("td", {
															children: (0, d.jsx)(E, {
																c: q.c,
																children: q.t,
															}),
														}),
														(0, d.jsx)("td", {
															children: (0, d.jsx)("div", {
																style: { width: 120 },
																children: (0, d.jsx)(Xt, {
																	cur:
																		{
																			searching: 0,
																			accepted: 1,
																			pickup: 2,
																			heading: 3,
																			delivered: 4,
																		}[L.status] ?? 0,
																	labels: ["", ""],
																}),
															}),
														}),
													],
												}),
												Y &&
													(0, d.jsx)("tr", {
														style: { background: "#fbfdff" },
														children: (0, d.jsxs)("td", {
															colSpan: 7,
															style: { padding: "14px 18px" },
															children: [
																(0, d.jsxs)("div", {
																	className: "row wrap",
																	style: { gap: 10, fontSize: 12.5 },
																	children: [
																		(0, d.jsxs)(E, {
																			c: "b-blue",
																			icon: "store",
																			children: ["النشاط: ", L.merchant],
																		}),
																		(0, d.jsx)(E, {
																			c: "b-teal",
																			icon: "route",
																			children: L.km
																				? "المسافة ≈ " + L.km + " كم"
																				: "المسافة حسب المنطقة",
																		}),
																		L.feeMin &&
																			(0, d.jsxs)(E, {
																				c: "b-gray",
																				children: [
																					"نطاق التسعير: من ",
																					L.feeMin,
																					" إلى ",
																					L.feeMax,
																					" ج",
																				],
																			}),
																		(0, d.jsx)(E, {
																			c: "b-amber",
																			icon: "cash",
																			children: L.pay,
																		}),
																		L.kind &&
																			(0, d.jsx)(E, {
																				c: "b-violet",
																				children: L.kind,
																			}),
																		L.readyMin !== void 0 &&
																			L.readyMin !== null &&
																			(0, d.jsx)(E, {
																				c: "b-teal",
																				icon: "clock",
																				children:
																					L.readyMin === 0
																						? "جاهز الآن"
																						: "يجهز بعد " + L.readyMin + " د",
																			}),
																	],
																}),
																(0, d.jsxs)("div", {
																	className: "row",
																	style: {
																		gap: 16,
																		marginTop: 10,
																		fontSize: 12,
																		color: "var(--mut)",
																		flexWrap: "wrap",
																	},
																	children: [
																		(0, d.jsxs)("span", {
																			children: [
																				(0, d.jsx)(S, { n: "store", s: 13 }),
																				" استلام: ",
																				L.from,
																			],
																		}),
																		(0, d.jsxs)("span", {
																			children: [
																				(0, d.jsx)(S, { n: "pin", s: 13 }),
																				" تسليم: ",
																				L.to,
																			],
																		}),
																		(L.custName || L.cust) &&
																			(0, d.jsxs)("span", {
																				children: [
																					(0, d.jsx)(S, {
																						n: "phone",
																						s: 13,
																					}),
																					" العميل: ",
																					[L.custName, L.cust]
																						.filter(Boolean)
																						.join(" — "),
																				],
																			}),
																	],
																}),
																L.note &&
																	(0, d.jsxs)("div", {
																		style: {
																			marginTop: 8,
																			fontSize: 12,
																			color: "var(--mut)",
																		},
																		children: ["ملاحظة العميل: ", L.note],
																	}),
																(0, d.jsx)("div", {
																	style: { maxWidth: 420, marginTop: 12 },
																	children: (0, d.jsx)(Xt, {
																		cur:
																			{
																				searching: 0,
																				accepted: 1,
																				pickup: 2,
																				heading: 3,
																				delivered: 4,
																			}[L.status] ?? 0,
																		labels: [
																			"طلب",
																			"قبول",
																			"استلام",
																			"في الطريق",
																			"تسليم",
																		],
																	}),
																}),
															],
														}),
													}),
											],
										},
										L.id,
									);
								}),
							}),
						],
					}),
				}),
				(0, d.jsx)("div", { style: { height: 16 } }),
				(0, d.jsx)("div", {
					className: "grid g3",
					children: (() => {
						let L = new Date(),
							q = st.filter((le) => {
								let Xe = new Date(le.ts);
								return (
									Xe.getMonth() === L.getMonth() &&
									Xe.getFullYear() === L.getFullYear()
								);
							}),
							Y = q.filter((le) => le.status === "delivered"),
							U = [];
						for (let le = 7; le >= 0; le--) {
							let Xe = new Date(Date.now() - le * 7 * 864e5),
								Ee = new Date(Date.now() - (le - 1) * 7 * 864e5);
							U.push(
								Y.filter((Oa) => {
									let Be = new Date(Oa.ts);
									return Be >= Xe && Be < Ee;
								}).length,
							);
						}
						return (0, d.jsxs)(K.default.Fragment, {
							children: [
								(0, d.jsxs)(F, {
									title: "طلبات هذا الشهر",
									children: [
										(0, d.jsx)("b", {
											style: { fontSize: 24 },
											children: q.length,
										}),
										(0, d.jsx)("div", {
											className: "sub",
											style: { marginTop: 4 },
											children: "كل الطلبات المسجلة في الشهر الحالي",
										}),
										(0, d.jsx)(At, { data: U, color: "#0f766e" }),
									],
								}),
								(0, d.jsxs)(F, {
									title: "مكتملة هذا الشهر",
									children: [
										(0, d.jsx)("b", {
											style: { fontSize: 24 },
											children: Y.length,
										}),
										(0, d.jsx)("div", {
											className: "sub",
											style: { marginTop: 4 },
											children: "تم تسليمها للعملاء",
										}),
									],
								}),
								(0, d.jsxs)(F, {
									title: "رسوم الشهر",
									children: [
										(0, d.jsx)("b", {
											style: { fontSize: 24 },
											children: se(Y.reduce((le, Xe) => le + (Xe.fee || 0), 0)),
										}),
										(0, d.jsx)("div", {
											className: "sub",
											style: { marginTop: 4 },
											children: "مجموع رسوم الطلبات المكتملة",
										}),
									],
								}),
							],
						});
					})(),
				}),
			],
		});
	if (e === "fleet") {
		let L = (U) =>
				r.payModel.type === "per_order"
					? r.payModel.value || 0
					: r.payModel.type === "split"
						? Math.round(((U.fee || 0) * (r.payModel.value || 0)) / 100)
						: 0,
			q = o.filter((U) => U.courier && U.status === "delivered"),
			Y = (() => {
				let U = [];
				for (let le = 6; le >= 0; le--) {
					let Xe = new Date(Date.now() - le * 864e5);
					U.push(
						q.filter(
							(Ee) => new Date(Ee.ts).toDateString() === Xe.toDateString(),
						).length,
					);
				}
				return U;
			})();
		return (0, d.jsxs)(d.Fragment, {
			children: [
				(0, d.jsx)(De, {
					title: "مناديبي",
					sub: "فريق التوصيل التابع لنشاطك — هنا بتديرهم وتسندلهم الطلبات",
					children: (0, d.jsxs)("button", {
						className: "btn btn-p btn-sm",
						onClick: () => Qt(!0),
						children: [(0, d.jsx)(S, { n: "plus", s: 14 }), " إضافة مندوب"],
					}),
				}),
				Te.length === 0 &&
					(0, d.jsxs)(F, {
						title: "لا يوجد مناديب مسجلون بعد",
						children: [
							(0, d.jsx)("div", {
								className: "row wrap",
								style: { gap: 8, marginBottom: 10 },
								children: (0, d.jsx)(E, {
									c: "b-teal",
									icon: "globe",
									children: "كل الطلبات تُسند عبر شبكة Super X",
								}),
							}),
							(0, d.jsx)("div", {
								className: "sub",
								style: { fontSize: 12, lineHeight: 1.9 },
								children:
									"طلباتك تُسند تلقائيًا إلى أقرب مندوب متاح في شبكة Super X وتدفع رسوم المسافة فقط. وإذا أردت فريقًا خاصًا بك، ادعُ مناديبك من هنا — يسجلون برقم الموبايل وكود الدعوة ويظهر فريقك في هذه الصفحة.",
							}),
						],
					}),
				Te.length > 0 &&
					(0, d.jsxs)(F, {
						title: "تسوية مستحقات المناديب",
						action: (0, d.jsx)(E, {
							c: "b-blue",
							icon: "cash",
							children:
								r.payModel.type === "per_order"
									? (r.payModel.value || 0) + " ج لكل طلب"
									: r.payModel.type === "salary"
										? "راتب شهري ثابت"
										: (r.payModel.value || 0) + "% من كل طلب",
						}),
						pad: !1,
						children: [
							(0, d.jsxs)("table", {
								className: "tbl",
								children: [
									(0, d.jsx)("thead", {
										children: (0, d.jsxs)("tr", {
											children: [
												(0, d.jsx)("th", {
													children: "المندوب",
												}),
												(0, d.jsx)("th", {
													children: "طلبات مكتملة النهاردة",
												}),
												(0, d.jsx)("th", {
													children: "المستحق له",
												}),
												(0, d.jsx)("th", {
													children: "طريقة الدفع",
												}),
												(0, d.jsx)("th", {}),
											],
										}),
									}),
									(0, d.jsx)("tbody", {
										children: Te.map((U) => {
											let le = q.filter((Ee) => Ee.courier === U.name),
												Xe =
													r.payModel.type === "salary"
														? 0
														: le.reduce((Ee, Oa) => Ee + L(Oa), 0);
											return (0, d.jsxs)(
												"tr",
												{
													children: [
														(0, d.jsx)("td", {
															children: (0, d.jsxs)("div", {
																className: "row",
																style: { gap: 9 },
																children: [
																	(0, d.jsx)(lt, { name: U.name, size: 30 }),
																	(0, d.jsx)("b", { children: U.name }),
																],
															}),
														}),
														(0, d.jsx)("td", {
															className: "main-cell",
															children: le.length,
														}),
														(0, d.jsx)("td", {
															className: "main-cell",
															children:
																r.payModel.type === "salary"
																	? (0, d.jsx)("span", {
																			className: "sub",
																			children: "من الراتب الشهري",
																		})
																	: (0, d.jsx)("b", {
																			style: { color: "var(--brandInk)" },
																			children: se(Xe),
																		}),
														}),
														(0, d.jsx)("td", {
															className: "sub",
															children:
																r.payModel.type === "per_order"
																	? "لكل طلب"
																	: r.payModel.type === "salary"
																		? "راتب شهري"
																		: "نسبة " + (r.payModel.value || 0) + "%",
														}),
														(0, d.jsx)("td", {
															children: (0, d.jsxs)("button", {
																className: "btn btn-o btn-sm",
																disabled: je,
																onClick: () => bl(U.name, Xe),
																children: [
																	(0, d.jsx)(S, { n: "check", s: 13 }),
																	" تم التسوية",
																],
															}),
														}),
													],
												},
												U.ref,
											);
										}),
									}),
								],
							}),
							(0, d.jsx)("div", {
								style: { padding: "12px 18px" },
								children: (0, d.jsxs)("div", {
									className: "note",
									children: [
										(0, d.jsx)(S, { n: "info" }),
										" تُحسب المستحقات تلقائيًا حسب نموذج الدفع الذي اخترته في \xABالإعدادات\xBB — يمكنك تعديل النموذج والمبالغ من هناك في أي وقت، والمنصة لا تخصم أي عمولة.",
									],
								}),
							}),
						],
					}),
				o.filter((U) => U.status === "searching" && U.manual).length > 0 &&
					(0, d.jsx)(F, {
						title: "طابور الإسناد اليدوي",
						action: (0, d.jsxs)(E, {
							c: "b-amber",
							blink: !0,
							children: [
								o.filter((U) => U.status === "searching" && U.manual).length,
								" بانتظار إسنادك",
							],
						}),
						pad: !1,
						children: o
							.filter((U) => U.status === "searching" && U.manual)
							.map((U) =>
								(0, d.jsxs)(
									"div",
									{
										style: {
											padding: "14px 18px",
											borderBottom: "1px solid var(--line2)",
										},
										children: [
											(0, d.jsxs)("div", {
												className: "between",
												style: { marginBottom: 8 },
												children: [
													(0, d.jsxs)("div", {
														className: "row",
														children: [
															(0, d.jsx)("b", { children: U.id }),
															(0, d.jsx)(E, {
																c: "b-amber",
																children: "بانتظار إسناد",
															}),
														],
													}),
													(0, d.jsxs)("span", {
														className: "sub",
														children: [se(U.fee), " — ", U.zone],
													}),
												],
											}),
											(0, d.jsxs)("div", {
												className: "row",
												style: {
													fontSize: 12,
													color: "var(--mut)",
													gap: 12,
													marginBottom: 10,
												},
												children: [
													(0, d.jsxs)("span", {
														children: [
															(0, d.jsx)(S, { n: "pin", s: 13 }),
															" ",
															U.to,
														],
													}),
													(0, d.jsxs)("span", {
														children: [
															(0, d.jsx)(S, { n: "clock", s: 13 }),
															" منذ ",
															U.eta === "—" ? "لحظات" : U.eta,
														],
													}),
												],
											}),
											(0, d.jsxs)("div", {
												className: "row",
												style: { gap: 8, flexWrap: "wrap" },
												children: [
													(0, d.jsxs)("span", {
														className: "tag",
														style: {
															color: "var(--brandInk)",
															background: "var(--brandSoft)",
														},
														children: [
															"مرشح حسب ",
															iu[r.criteria],
															": ",
															fu(
																Te.map((le) => ({
																	...le,
																	rating: le.rating || 4.5,
																	status:
																		le.status === "invited" ? "off" : le.status,
																})),
																U.zone,
																r.criteria,
															)[0]?.name,
														],
													}),
													fu(
														Te.map((le) => ({
															...le,
															rating: le.rating || 4.5,
															status:
																le.status === "invited" ? "off" : le.status,
														})),
														U.zone,
														r.criteria,
													)
														.slice(0, 3)
														.map((le) =>
															(0, d.jsxs)(
																"button",
																{
																	className: "btn btn-o btn-sm",
																	onClick: () => {
																		(C(U.id, le.name),
																			i(
																				"تم إسناد الطلب " +
																					U.id +
																					" إلى " +
																					le.name,
																			));
																	},
																	children: [
																		(0, d.jsx)(S, { n: "check", s: 13 }),
																		" إسناد لـ ",
																		le.name,
																	],
																},
																le.ref,
															),
														),
												],
											}),
										],
									},
									U.id,
								),
							),
					}),
				Te.length > 0 &&
					(0, d.jsxs)(F, {
						title: "فريقك المسجل في Super X",
						pad: !1,
						children: [
							(0, d.jsxs)("table", {
								className: "tbl",
								children: [
									(0, d.jsx)("thead", {
										children: (0, d.jsxs)("tr", {
											children: [
												(0, d.jsx)("th", {
													children: "المندوب",
												}),
												(0, d.jsx)("th", {
													children: "الموبايل",
												}),
												(0, d.jsx)("th", {
													children: "المنطقة",
												}),
												(0, d.jsx)("th", {
													children: "الحالة",
												}),
												(0, d.jsx)("th", {
													children: "كود الدعوة",
												}),
											],
										}),
									}),
									(0, d.jsx)("tbody", {
										children: Te.map((U) =>
											(0, d.jsxs)(
												"tr",
												{
													children: [
														(0, d.jsx)("td", {
															children: (0, d.jsx)("b", { children: U.name }),
														}),
														(0, d.jsx)("td", {
															className: "sub",
															children: U.phone,
														}),
														(0, d.jsx)("td", {
															className: "sub",
															children: U.zone,
														}),
														(0, d.jsx)("td", {
															children: (0, d.jsx)(E, {
																c:
																	U.status === "active" ? "b-green" : "b-amber",
																children:
																	U.status === "active"
																		? "نشط"
																		: "بانتظار التفعيل",
															}),
														}),
														(0, d.jsx)("td", {
															className: "sub",
															children:
																U.status === "invited"
																	? (0, d.jsx)("span", {
																			className: "tag",
																			children: U.inviteCode,
																		})
																	: "—",
														}),
													],
												},
												U.ref,
											),
										),
									}),
								],
							}),
							(0, d.jsx)("div", {
								style: { padding: "12px 18px" },
								children: (0, d.jsxs)("div", {
									className: "note",
									children: [
										(0, d.jsx)(S, { n: "mail" }),
										" المندوب يفعّل عضويته من \xABتطبيق المندوب\xBB برقمه وكود الدعوة، وبعد التفعيل ينضم رسميًا لفريقك.",
									],
								}),
							}),
						],
					}),
				(0, d.jsx)("div", { style: { height: 16 } }),
				(0, d.jsx)(F, {
					children: (0, d.jsxs)("div", {
						style: { textAlign: "center", padding: 14 },
						children: [
							(0, d.jsx)("div", {
								className: "ico",
								style: {
									width: 52,
									height: 52,
									margin: "0 auto 12px",
									background: "var(--brandSoft)",
									color: "var(--brandInk)",
								},
								children: (0, d.jsx)(S, { n: "plus", s: 22 }),
							}),
							(0, d.jsx)("b", {
								style: { fontSize: 14 },
								children: "أضف مندوبًا جديدًا",
							}),
							(0, d.jsx)("p", {
								className: "sub",
								style: { margin: "6px 0 14px", fontSize: 12 },
								children:
									"سجّل مناديبك برقم الموبايل — يستلمون دعوة فورية للانضمام لفريقك.",
							}),
							(0, d.jsxs)("button", {
								className: "btn btn-o",
								style: { width: "100%" },
								onClick: () => Qt(!0),
								children: [(0, d.jsx)(S, { n: "send", s: 14 }), " دعوة مندوب"],
							}),
						],
					}),
				}),
				(0, d.jsx)("div", { style: { height: 16 } }),
				Te.length > 0 &&
					(0, d.jsx)(F, {
						title: "أداء الفريق — آخر أسبوع",
						children: (0, d.jsx)(pl, {
							data: Y,
							labels: [
								"أحد",
								"اثنين",
								"ثلاثاء",
								"أربعاء",
								"خميس",
								"جمعة",
								"سبت",
							],
						}),
					}),
				hf &&
					(0, d.jsx)(Zo, {
						title: "دعوة مندوب جديد",
						onClose: () => Qt(!1),
						footer: (0, d.jsxs)("button", {
							className: "btn btn-p",
							disabled: Ko,
							onClick: Kt,
							children: [(0, d.jsx)(S, { n: "send", s: 14 }), " إرسال الدعوة"],
						}),
						children: (0, d.jsxs)("div", {
							className: "grid",
							style: { gap: 12 },
							children: [
								(0, d.jsxs)("div", {
									className: "field",
									children: [
										(0, d.jsx)("label", {
											children: "حسابك المسجل (صاحب الفريق)",
										}),
										(0, d.jsx)("div", {
											className: "select",
											children: (0, d.jsxs)("select", {
												className: "inp",
												value: H,
												onChange: (U) => V(U.target.value),
												children: [
													(0, d.jsx)("option", {
														value: "",
														children: "— اختار نشاطك من المسجلين —",
													}),
													x.map((U) =>
														(0, d.jsxs)(
															"option",
															{
																value: U.ref,
																children: [
																	U.name,
																	" — ",
																	U.phone,
																	" (",
																	U.zone,
																	")",
																],
															},
															U.ref,
														),
													),
												],
											}),
										}),
									],
								}),
								(0, d.jsxs)("div", {
									className: "grid g2",
									style: { gap: 12 },
									children: [
										(0, d.jsxs)("div", {
											className: "field",
											children: [
												(0, d.jsx)("label", {
													children: "اسم المندوب",
												}),
												(0, d.jsx)("input", {
													className: "inp",
													value: Fu,
													onChange: (U) => fd(U.target.value),
													placeholder: "الاسم الكامل",
												}),
											],
										}),
										(0, d.jsxs)("div", {
											className: "field",
											children: [
												(0, d.jsx)("label", {
													children: "رقم الموبايل",
												}),
												(0, d.jsx)("input", {
													className: "inp",
													value: yl,
													onChange: (U) => rd(U.target.value),
													placeholder: "01xxxxxxxxx",
													inputMode: "tel",
												}),
											],
										}),
										(0, d.jsxs)("div", {
											className: "field",
											children: [
												(0, d.jsx)("label", {
													children: "المركبة",
												}),
												(0, d.jsx)("div", {
													className: "select",
													children: (0, d.jsxs)("select", {
														className: "inp",
														value: Gu,
														onChange: (U) => vf(U.target.value),
														children: [
															(0, d.jsx)("option", {
																children: "دراجة نارية",
															}),
															(0, d.jsx)("option", {
																children: "دراجة كهربائية",
															}),
															(0, d.jsx)("option", {
																children: "سيارة",
															}),
														],
													}),
												}),
											],
										}),
										(0, d.jsxs)("div", {
											className: "field",
											children: [
												(0, d.jsx)("label", {
													children: "منطقة العمل",
												}),
												(0, d.jsx)("input", {
													className: "inp",
													value: Va,
													onChange: (U) => gf(U.target.value),
												}),
											],
										}),
									],
								}),
								(0, d.jsxs)("div", {
									className: "note",
									children: [
										(0, d.jsx)(S, { n: "mail" }),
										" تُرسل الدعوة بكود تفعيل — يفتح المندوب \xABتطبيق المندوب\xBB ويدخل رقمه والكود، وبذلك ينضم لفريقك رسميًا.",
									],
								}),
							],
						}),
					}),
			],
		});
	}
	if (e === "pool") {
		let q =
			(I || []).filter(
				(G) =>
					N &&
					(G.founderRef === N.ref || G.members.some((Ke) => Ke.ref === N.ref)),
			)[0] || null;
		if (!q)
			return (0, d.jsxs)(d.Fragment, {
				children: [
					(0, d.jsx)(De, {
						title: "شراكة المناديب",
						sub: "شارك مع أنشطة في منطقتك لتقاسم أسطول مناديب ثابت",
					}),
					(0, d.jsx)(F, {
						title: "لا يوجد لديك شراكة مناديب بعد",
						children: (0, d.jsx)("div", {
							className: "sub",
							style: { lineHeight: 2 },
							children:
								"الشراكة اختيارية تمامًا — طلباتك تعمل الآن عبر شبكة مناديب Super X مباشرة. يمكنك إنشاء شراكة لاحقًا من زر \xABأنشئ شراكة\xBB لتقاسم أسطول ثابت مع أنشطة في نفس منطقتك.",
						}),
					}),
				],
			});
		let Y = !!(q && N && q.founderRef === N.ref),
			U = q ? q.members : rf.members,
			le = q ? q.courierCount : rf.couriers.length,
			Xe = q ? q.monthlySalary : rf.monthlySalaryPerCourier,
			Ee = o.filter((G) => G.status === "searching" || G.status === "accepted"),
			Oa = $0(
				Ee.filter((G) => G.pool),
				dd.maxDropsPerTrip,
			),
			Be = U.map((G) => ({
				m: G,
				count: q
					? ((q.usage || []).find((Ke) => Ke.entity_ref === G.ref) || {})
							.order_count || 0
					: o.filter((Ke) => Ke.merchant === G.name).length,
			})),
			ue = Math.max(
				1,
				Be.reduce((G, Ke) => G + Ke.count, 0),
			),
			Sl = O.filter((G) => G.status === "pending"),
			j = () => {
				let G = Ia.replace(/\s+/g, "");
				if (!N) {
					i("اختار حسابك المسجل الأول من القائمة");
					return;
				}
				if (G.length < 8) {
					i("اكتب رقم موبايل النشاط المُدعو كامل");
					return;
				}
				if (G === N.phone) {
					i("مينفعش تدعِ نفسك — رقمك المسجل \u{1F440}");
					return;
				}
				(J(!0),
					(q && q.founderRef === N.ref
						? Promise.resolve({ ok: !0, partnership: { ref: q.ref } })
						: apiFetch("/api/wasl/partnerships", {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({
									founderRef: N.ref,
									zone: N.zone,
									governorate: N.governorate,
									courierCount: Number(jt) || 2,
									monthlySalary: Number(Z) || 6e3,
								}),
							}).then((ye) => ye.json())
					)
						.then((ye) => {
							if (!ye || !ye.ok) throw new Error("create_failed");
							let Cl = ye.partnership.ref;
							return apiFetch("/api/wasl/partnerships/invite", {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({
									partnershipRef: Cl,
									fromRef: N.ref,
									fromName: N.name,
									toPhone: G,
								}),
							})
								.then(($o) => $o.json())
								.then(($o) => ({ inv: $o, pref: Cl }));
						})
						.then(({ inv: ye, pref: Cl }) => {
							ye && ye.ok
								? (i(
										"أُرسلت الدعوة " +
											ye.invite.ref +
											(ye.invite.registered
												? " — ستظهر للمطعم في \xABدعوات وصلتك\xBB فورًا"
												: " — وستُقبل بمجرد تسجيل النشاط بنفس الرقم"),
									),
									aa(!1),
									za(""),
									Ce(($o) => $o + 1),
									k(Cl))
								: ye && ye.error === "already_member"
									? i("هذا النشاط عضو في الشراكة بالفعل")
									: ye && ye.error === "invite_pending"
										? i("فيه دعوة معلّقة لنفس الرقم بالفعل")
										: i("تعذر إرسال الدعوة — حاول مرة أخرى");
						})
						.catch(() => i("تعذر الاتصال بالخادم — حاول مرة أخرى"))
						.finally(() => J(!1)));
			},
			Mt = (G, Ke) => {
				(J(!0),
					apiFetch("/api/wasl/partnerships/respond", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ ref: G, action: Ke }),
					})
						.then((ye) => ye.json())
						.then((ye) => {
							ye && ye.ok
								? (i(
										Ke === "accept"
											? "قبلت الدعوة \u{1F389} بقت عضو في الشراكة ونصيبك من الرواتب اتحدد تلقائيًا"
											: "تم رفض الدعوة",
									),
									Ce((Cl) => Cl + 1))
								: ye && ye.error === "already_responded"
									? i("تم الرد على هذه الدعوة بالفعل")
									: ye && ye.error === "merchant_not_registered"
										? i(
												"هذا الرقم غير مسجل كنشاط بعد — سجل أولًا ثم اقبل الدعوة",
											)
										: i("تعذر تنفيذ الطلب — حاول مرة أخرى");
						})
						.catch(() => i("تعذّر الاتصال بالسيرفر"))
						.finally(() => J(!1)));
			};
		return (0, d.jsxs)(d.Fragment, {
			children: [
				(0, d.jsx)(De, {
					title: "شراكة المناديب",
					sub: q
						? q.name + " — " + q.zone
						: "أسطول مشترك تتمول مجموعة أنشطة في نفس المنطقة — تكلفة أقل ومندوب دائم معكم",
					children: (0, d.jsxs)("button", {
						className: "btn btn-p btn-sm",
						disabled: je,
						onClick: () => aa(!0),
						children: [
							(0, d.jsx)(S, { n: "plus", s: 14 }),
							" ",
							Y ? "دعوة نشاط للشراكة" : "أنشئ شراكة / ادعُ نشاطًا",
						],
					}),
				}),
				(0, d.jsxs)("div", {
					className: "grid g4",
					children: [
						(0, d.jsx)(he, {
							icon: "users",
							color: "#0d9488",
							bg: "#e4f7f4",
							val: U.length,
							label: "أنشطة في الشراكة",
						}),
						(0, d.jsx)(he, {
							icon: "bike",
							color: "#2f6bff",
							bg: "#e9efff",
							val: le,
							label: "مناديب الأسطول المشترك",
						}),
						(0, d.jsx)(he, {
							icon: "cash",
							color: "#d97706",
							bg: "#fdf2e3",
							val: se(Xe * le),
							label: "إجمالي الرواتب شهريًا",
						}),
						(0, d.jsx)(he, {
							icon: "check",
							color: "#059669",
							bg: "#e5f6ef",
							val: dd.maxDropsPerTrip,
							label: "أقصى طلبات في رحلة واحدة",
						}),
					],
				}),
				(0, d.jsx)("div", { style: { height: 16 } }),
				(0, d.jsxs)("div", {
					className: "grid g21",
					children: [
						(0, d.jsxs)("div", {
							className: "grid",
							style: { gap: 16 },
							children: [
								(0, d.jsxs)(F, {
									title: "دمج الطلبات في نفس الاتجاه (Batching)",
									action: (0, d.jsxs)(E, {
										c: "b-teal",
										icon: "route",
										children: [Oa.length, " رحلة مخططة الآن"],
									}),
									pad: !1,
									children: [
										Oa.length === 0 &&
											(0, d.jsx)("div", {
												style: {
													padding: 24,
													textAlign: "center",
													color: "var(--mut)",
												},
												children:
													"لا توجد طلبات جارية في الشراكة حاليًا — بمجرد أول طلب يخطط النظام للرحلة فورًا.",
											}),
										Oa.map((G, Ke) =>
											(0, d.jsxs)(
												"div",
												{
													style: {
														padding: "14px 18px",
														borderBottom: "1px solid var(--line2)",
													},
													children: [
														(0, d.jsxs)("div", {
															className: "between",
															style: { marginBottom: 6 },
															children: [
																(0, d.jsxs)("div", {
																	className: "row",
																	style: { gap: 8 },
																	children: [
																		(0, d.jsx)(E, {
																			c:
																				G.drops.length > 1
																					? "b-green"
																					: "b-gray",
																			children:
																				G.drops.length > 1
																					? `رحلة مركبة — ${G.drops.length} طلبات`
																					: "رحلة فردية",
																		}),
																		(0, d.jsxs)("b", {
																			children: ["إلى ", G.zone],
																		}),
																	],
																}),
																(0, d.jsxs)("span", {
																	className: "sub",
																	children: [
																		"المندوب: ",
																		fu(g2, G.zone, r.criteria)[0]?.name || "—",
																	],
																}),
															],
														}),
														(0, d.jsx)("div", {
															className: "row",
															style: {
																gap: 8,
																flexWrap: "wrap",
																fontSize: 12,
																color: "var(--mut)",
															},
															children: G.drops.map((ye) =>
																(0, d.jsxs)(
																	"span",
																	{
																		className: "tag",
																		children: [ye.id, " — ", ye.merchant],
																	},
																	ye.id,
																),
															),
														}),
														G.drops.length > 1 &&
															(0, d.jsxs)("div", {
																className: "note",
																style: { marginTop: 8 },
																children: [
																	(0, d.jsx)(S, { n: "zap" }),
																	" المندوب بياخد الأوردرات كلها في نفس الاتجاه ويوزعهم بالترتيب — مكسب ",
																	dd.extraDropBonus * G.drops.length,
																	" ج للمندوب بدل رحلات منفصلة.",
																],
															}),
													],
												},
												Ke,
											),
										),
									],
								}),
								(0, d.jsxs)(F, {
									title: "دعوات الانضمام",
									pad: !1,
									children: [
										(0, d.jsxs)("div", {
											style: {
												padding: "14px 18px",
												borderBottom: "1px solid var(--line2)",
											},
											children: [
												(0, d.jsxs)("div", {
													className: "field",
													children: [
														(0, d.jsx)("label", {
															children:
																"حسابك المسجل (لعرض الدعوات الموجهة إليك)",
														}),
														(0, d.jsx)("div", {
															className: "select",
															children: (0, d.jsxs)("select", {
																className: "inp",
																value: H,
																onChange: (G) => V(G.target.value),
																children: [
																	(0, d.jsx)("option", {
																		value: "",
																		children: "— اختار نشاطك من المسجلين —",
																	}),
																	x.map((G) =>
																		(0, d.jsxs)(
																			"option",
																			{
																				value: G.ref,
																				children: [
																					G.name,
																					" — ",
																					G.phone,
																					" (",
																					G.zone,
																					")",
																				],
																			},
																			G.ref,
																		),
																	),
																],
															}),
														}),
													],
												}),
												(0, d.jsx)("div", { style: { height: 8 } }),
												(0, d.jsxs)("div", {
													className: "field",
													children: [
														(0, d.jsx)("label", {
															children: "أو اتحقق برقم موبايلك يدويًا",
														}),
														(0, d.jsx)("input", {
															className: "inp",
															value: v,
															onChange: (G) => b(G.target.value),
															placeholder: "01xxxxxxxxx",
															inputMode: "tel",
														}),
													],
												}),
											],
										}),
										(0, d.jsxs)("div", {
											style: {
												padding: "12px 18px",
												borderBottom: "1px solid var(--line2)",
											},
											children: [
												(0, d.jsx)("b", {
													style: { fontSize: 13 },
													children: "دعوات وصلتك",
												}),
												Sl.length === 0 &&
													(0, d.jsx)("div", {
														className: "sub",
														style: { marginTop: 4 },
														children:
															v.trim().length >= 8
																? "لا توجد دعوات معلقة على هذا الرقم"
																: "أدخل رقمك المسجل أعلاه لعرض الدعوات",
													}),
												Sl.map((G) =>
													(0, d.jsxs)(
														"div",
														{
															className: "row between",
															style: {
																padding: "9px 0",
																borderBottom: "1px dashed var(--line2)",
															},
															children: [
																(0, d.jsxs)("div", {
																	children: [
																		(0, d.jsx)("b", {
																			style: { fontSize: 13 },
																			children: G.partnershipName,
																		}),
																		(0, d.jsxs)("div", {
																			className: "sub",
																			children: [
																				G.partnershipZone,
																				" — من ",
																				G.fromName,
																				" \xB7 ",
																				G.ref,
																			],
																		}),
																	],
																}),
																(0, d.jsxs)("div", {
																	className: "row",
																	style: { gap: 8 },
																	children: [
																		(0, d.jsxs)("button", {
																			className: "btn btn-p btn-sm",
																			disabled: je,
																			onClick: () => Mt(G.ref, "accept"),
																			children: [
																				(0, d.jsx)(S, { n: "check", s: 13 }),
																				" قبول",
																			],
																		}),
																		(0, d.jsx)("button", {
																			className: "btn btn-red btn-sm",
																			disabled: je,
																			onClick: () => Mt(G.ref, "decline"),
																			children: "رفض",
																		}),
																	],
																}),
															],
														},
														G.ref,
													),
												),
											],
										}),
										Y &&
											(0, d.jsxs)("div", {
												style: { padding: "12px 18px" },
												children: [
													(0, d.jsxs)("b", {
														style: { fontSize: 13 },
														children: ["دعوات بعتّها (", fe.length, ")"],
													}),
													fe.length === 0 &&
														(0, d.jsx)("div", {
															className: "sub",
															style: { marginTop: 4 },
															children:
																"لم تُرسل دعوات بعد — استخدم زر \xABدعوة نشاط للشراكة\xBB أعلاه.",
														}),
													fe.map((G) =>
														(0, d.jsxs)(
															"div",
															{
																className: "row between",
																style: {
																	padding: "8px 0",
																	borderBottom: "1px dashed var(--line2)",
																},
																children: [
																	(0, d.jsxs)("span", {
																		className: "sub",
																		children: [G.toPhone, " \xB7 ", G.ref],
																	}),
																	(0, d.jsx)(E, {
																		c:
																			G.status === "accepted"
																				? "b-green"
																				: G.status === "declined"
																					? "b-red"
																					: "b-amber",
																		children:
																			G.status === "accepted"
																				? "قبلت"
																				: G.status === "declined"
																					? "رفضت"
																					: "معلّقة",
																	}),
																],
															},
															G.ref,
														),
													),
												],
											}),
									],
								}),
								(0, d.jsx)(F, {
									title: "كيف يتصرف المندوب في الرحلة المركبة؟",
									pad: !1,
									children: [
										[
											"1",
											"يستلم من المطاعم المشاركة",
											"بيمر على كل مطعم في المسار ويستلم طلباته",
										],
										[
											"2",
											"يمشي في اتجاه واحد",
											"يوزع حسب القرب — الأقرب أولًا ليصل الطعام ساخنًا",
										],
										[
											"3",
											"بيكسب أكتر",
											"مكافأة إضافية على كل طلب إضافي في نفس الرحلة",
										],
									].map(([G, Ke, ye]) =>
										(0, d.jsxs)(
											"div",
											{
												className: "row",
												style: {
													gap: 12,
													alignItems: "flex-start",
													padding: "10px 18px",
													borderBottom: "1px solid var(--line2)",
												},
												children: [
													(0, d.jsx)("div", {
														className: "ico",
														style: {
															width: 30,
															height: 30,
															borderRadius: 99,
															background: "var(--brandSoft)",
															color: "var(--brandInk)",
															fontWeight: 800,
															fontSize: 13,
														},
														children: G,
													}),
													(0, d.jsxs)("div", {
														children: [
															(0, d.jsx)("b", {
																style: { fontSize: 13 },
																children: Ke,
															}),
															(0, d.jsx)("div", {
																className: "sub",
																style: { fontSize: 11.5 },
																children: ye,
															}),
														],
													}),
												],
											},
											G,
										),
									),
								}),
							],
						}),
						(0, d.jsxs)("div", {
							className: "grid",
							style: { gap: 16, alignContent: "start" },
							children: [
								(0, d.jsxs)(F, {
									title: "تقسيم الرواتب بين الأعضاء",
									pad: !1,
									children: [
										(0, d.jsxs)("table", {
											className: "tbl",
											children: [
												(0, d.jsx)("thead", {
													children: (0, d.jsxs)("tr", {
														children: [
															(0, d.jsx)("th", {
																children: "العضو",
															}),
															(0, d.jsx)("th", {
																children: "طلبات الشهر",
															}),
															(0, d.jsx)("th", {
																children: "نصيبه",
															}),
															(0, d.jsx)("th", {
																children: "المستحق عليه",
															}),
														],
													}),
												}),
												(0, d.jsx)("tbody", {
													children: Be.map(({ m: G, count: Ke }) => {
														let ye = Math.round((Ke / ue) * 100),
															Cl = q
																? Math.round((G.sharePct / 100) * Xe * le)
																: W0(G.sharePct, le, Xe);
														return (0, d.jsxs)(
															"tr",
															{
																children: [
																	(0, d.jsx)("td", {
																		children: (0, d.jsx)("b", {
																			children: G.name,
																		}),
																	}),
																	(0, d.jsx)("td", {
																		className: "main-cell",
																		children: Ke,
																	}),
																	(0, d.jsxs)("td", {
																		className: "sub",
																		children: [
																			G.sharePct,
																			"% أساس + ",
																			ye,
																			"% استخدام",
																		],
																	}),
																	(0, d.jsx)("td", {
																		className: "main-cell",
																		children: se(Cl),
																	}),
																],
															},
															G.ref || G.id,
														);
													}),
												}),
											],
										}),
										(0, d.jsx)("div", {
											style: { padding: "12px 18px" },
											children: (0, d.jsxs)("div", {
												className: "note",
												children: [
													(0, d.jsx)(S, { n: "info" }),
													" يُوزع النصيب الأساسي تلقائيًا بالتساوي مع كل عضو يقبل الدعوة، ويُحدَّث الاستخدام من الطلبات الفعلية كل شهر — بدون أي عمولة لـ Super X على التسويات.",
												],
											}),
										}),
									],
								}),
								(0, d.jsxs)(F, {
									title: "لو الأسطول اتشغل كله؟",
									children: [
										(0, d.jsxs)("div", {
											className: "kv",
											children: [
												(0, d.jsx)("span", {
													children: "الأولوية",
												}),
												(0, d.jsx)("b", {
													children: "طلبات أعضاء الشراكة أولًا",
												}),
											],
										}),
										(0, d.jsxs)("div", {
											className: "kv",
											children: [
												(0, d.jsx)("span", {
													children: "واحتياطيًا",
												}),
												(0, d.jsx)("b", {
													children: "شبكة Super X المستقلين",
												}),
											],
										}),
										(0, d.jsxs)("div", {
											className: "kv",
											children: [
												(0, d.jsx)("span", {
													children: "وإن لم يتوفر مستقلون",
												}),
												(0, d.jsx)("b", {
													children: "شركات التوصيل التي تغطي منطقتك",
												}),
											],
										}),
										(0, d.jsxs)("div", {
											className: "note",
											style: { marginTop: 10 },
											children: [
												(0, d.jsx)(S, { n: "target" }),
												" تلات مستويات ضمان إن طلبك ميشيشنش أبدًا.",
											],
										}),
									],
								}),
							],
						}),
					],
				}),
				na &&
					(0, d.jsx)(Zo, {
						title: "دعوة نشاط للشراكة",
						onClose: () => aa(!1),
						footer: (0, d.jsxs)("button", {
							className: "btn btn-p",
							disabled: je,
							onClick: j,
							children: [
								(0, d.jsx)(S, { n: "send", s: 14 }),
								" ",
								Y ? "إرسال الدعوة" : "إنشاء الشراكة وإرسال الدعوة",
							],
						}),
						children: (0, d.jsxs)("div", {
							className: "grid",
							style: { gap: 12 },
							children: [
								(0, d.jsxs)("div", {
									className: "field",
									children: [
										(0, d.jsx)("label", {
											children: "حسابك المسجل (مؤسس الشراكة)",
										}),
										(0, d.jsx)("div", {
											className: "select",
											children: (0, d.jsxs)("select", {
												className: "inp",
												value: H,
												onChange: (G) => V(G.target.value),
												children: [
													(0, d.jsx)("option", {
														value: "",
														children: "— اختار نشاطك من المسجلين —",
													}),
													x.map((G) =>
														(0, d.jsxs)(
															"option",
															{
																value: G.ref,
																children: [
																	G.name,
																	" — ",
																	G.phone,
																	" (",
																	G.zone,
																	")",
																],
															},
															G.ref,
														),
													),
												],
											}),
										}),
									],
								}),
								!Y &&
									(0, d.jsxs)("div", {
										className: "grid g2",
										style: { gap: 12 },
										children: [
											(0, d.jsxs)("div", {
												className: "field",
												children: [
													(0, d.jsx)("label", {
														children: "عدد مناديب الأسطول المشترك",
													}),
													(0, d.jsx)("input", {
														className: "inp",
														type: "number",
														min: "1",
														value: jt,
														onChange: (G) => ba(G.target.value),
													}),
												],
											}),
											(0, d.jsxs)("div", {
												className: "field",
												children: [
													(0, d.jsx)("label", {
														children: "راتب المندوب الشهري (ج)",
													}),
													(0, d.jsx)("input", {
														className: "inp",
														type: "number",
														min: "0",
														value: Z,
														onChange: (G) => ge(G.target.value),
													}),
												],
											}),
										],
									}),
								(0, d.jsxs)("div", {
									className: "field",
									children: [
										(0, d.jsx)("label", {
											children: "رقم موبايل النشاط المُدعو",
										}),
										(0, d.jsx)("input", {
											className: "inp",
											value: Ia,
											onChange: (G) => za(G.target.value),
											placeholder: "01xxxxxxxxx",
											inputMode: "tel",
										}),
										x.length > 1 &&
											(0, d.jsxs)("div", {
												className: "hint",
												children: [
													"أو انسخ الرقم من قائمة المسجلين: ",
													x
														.filter((G) => !N || G.ref !== N.ref)
														.slice(0, 3)
														.map((G) => G.phone)
														.join(" \xB7 "),
												],
											}),
									],
								}),
								(0, d.jsxs)("div", {
									className: "note",
									children: [
										(0, d.jsx)(S, { n: "mail" }),
										" تُرسل الدعوة إلى النشاط — يشاهدها في \xABدعوات وصلتك\xBB وينضم بضغطة قبول، وتتوزع نسب الرواتب تلقائيًا بين الأعضاء.",
									],
								}),
							],
						}),
					}),
			],
		});
	}
	if (e === "reports") {
		let L = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"],
			q = [],
			Y = [];
		for (let Be = 13; Be >= 0; Be--) {
			let ue = new Date(Date.now() - Be * 864e5);
			(q.push(
				st.filter((Sl) => new Date(Sl.ts).toDateString() === ue.toDateString())
					.length,
			),
				Y.push(L[ue.getDay()]));
		}
		let U = {};
		st.forEach((Be) => {
			Be.zone && (U[Be.zone] = (U[Be.zone] || 0) + 1);
		});
		let le = Object.entries(U)
				.sort((Be, ue) => ue[1] - Be[1])
				.slice(0, 6),
			Xe = Math.max(1, ...le.map((Be) => Be[1])),
			Ee = st.filter((Be) => Be.status === "delivered"),
			Oa = Ee.reduce((Be, ue) => Be + (ue.fee || 0), 0);
		return (0, d.jsxs)(d.Fragment, {
			children: [
				(0, d.jsx)(De, {
					title: "التقارير",
					sub: "تحليلات طلبات التوصيل المسجلة لحسابك",
				}),
				(0, d.jsxs)("div", {
					className: "grid g2",
					children: [
						(0, d.jsx)(F, {
							title: "الطلبات — آخر 14 يوم",
							children: (0, d.jsx)(At, { data: q, h: 100 }),
						}),
						(0, d.jsx)(F, {
							title: "توزيع الطلبات حسب منطقة العميل",
							pad: !1,
							children:
								le.length === 0
									? (0, d.jsx)("div", {
											style: {
												padding: 24,
												textAlign: "center",
												color: "var(--mut)",
											},
											children: "لا توجد طلبات مسجلة بعد.",
										})
									: (0, d.jsx)("div", {
											style: { padding: 6 },
											children: le.map(([Be, ue]) =>
												(0, d.jsxs)(
													"div",
													{
														style: { padding: "9px 12px" },
														children: [
															(0, d.jsxs)("div", {
																className: "between",
																children: [
																	(0, d.jsx)("b", {
																		style: { fontSize: 12.5 },
																		children: Be,
																	}),
																	(0, d.jsxs)("span", {
																		className: "sub",
																		children: [ue, " طلب"],
																	}),
																],
															}),
															(0, d.jsx)("div", {
																className: "progress",
																style: { marginTop: 6 },
																children: (0, d.jsx)("i", {
																	style: { width: (ue / Xe) * 100 + "%" },
																}),
															}),
														],
													},
													Be,
												),
											),
										}),
						}),
					],
				}),
				(0, d.jsx)("div", { style: { height: 16 } }),
				(0, d.jsxs)("div", {
					className: "grid g3",
					children: [
						(0, d.jsxs)(F, {
							title: "إجمالي الطلبات",
							children: [
								(0, d.jsx)("b", {
									style: { fontSize: 24 },
									children: st.length,
								}),
								(0, d.jsx)("div", {
									className: "sub",
									style: { marginTop: 4 },
									children: "كل الطلبات المسجلة للحساب",
								}),
							],
						}),
						(0, d.jsxs)(F, {
							title: "طلبات مكتملة",
							children: [
								(0, d.jsx)("b", {
									style: { fontSize: 24 },
									children: Ee.length,
								}),
								(0, d.jsx)("div", {
									className: "sub",
									style: { marginTop: 4 },
									children: "تم تسليمها للعملاء",
								}),
							],
						}),
						(0, d.jsxs)(F, {
							title: "رسوم التوصيل المسجلة",
							children: [
								(0, d.jsx)("b", {
									style: { fontSize: 24 },
									children: se(Oa),
								}),
								(0, d.jsx)("div", {
									className: "sub",
									style: { marginTop: 4 },
									children: "مجموع رسوم الطلبات المكتملة",
								}),
							],
						}),
					],
				}),
			],
		});
	}
	return e === "settings"
		? (0, d.jsxs)(d.Fragment, {
				children: [
					(0, d.jsx)(De, {
						title: "الإعدادات",
						sub: "تفضيلات التشغيل لنشاطك التجاري",
					}),
					(0, d.jsxs)(F, {
						title: "مناديبي وطريقة الدفع لهم",
						action: (0, d.jsx)(E, {
							c: Te.length ? "b-green" : "b-amber",
							children: Te.length
								? "عندك " + Te.length + " مندوب مسجل"
								: "لا يوجد مناديب مسجلون",
						}),
						children: [
							Te.length === 0 &&
								(0, d.jsx)("div", {
									className: "sub",
									style: { fontSize: 12, lineHeight: 1.9, marginBottom: 10 },
									children:
										"طلباتك تُسند حاليًا عبر شبكة مناديب Super X برسوم المسافة فقط. لتفعيل فريق خاص، سجّل مناديبك من صفحة \xABمناديبي\xBB — وبعدها تظهر هنا خيارات طريقة الدفع والمستحقات.",
								}),
							Te.length > 0 &&
								(0, d.jsxs)(d.Fragment, {
									children: [
										(0, d.jsxs)("div", {
											className: "field",
											style: { marginBottom: 10 },
											children: [
												(0, d.jsx)("label", {
													children:
														"كيف تدفع لمناديبك؟ — أنت من يحدد، والمنصة لا تخصم أي عمولة",
												}),
												(0, d.jsx)("div", {
													className: "row",
													style: { gap: 10 },
													children: [
														["per_order", "لكل طلب", "zap"],
														["salary", "راتب شهري", "card"],
														["split", "نسبة من الطلب", "trend"],
													].map(([L, q, Y]) =>
														(0, d.jsxs)(
															"button",
															{
																onClick: () =>
																	y({
																		...r,
																		payModel: { ...r.payModel, type: L },
																	}),
																className: "btn btn-o",
																style: {
																	flex: 1,
																	borderColor:
																		r.payModel.type === L
																			? "var(--brand)"
																			: "var(--line)",
																	color:
																		r.payModel.type === L
																			? "var(--brandInk)"
																			: "var(--mut)",
																	background:
																		r.payModel.type === L
																			? "var(--brandSoft)"
																			: "#fff",
																},
																children: [
																	(0, d.jsx)(S, { n: Y, s: 15 }),
																	" ",
																	q,
																],
															},
															L,
														),
													),
												}),
											],
										}),
										r.payModel.type === "per_order" &&
											(0, d.jsxs)("div", {
												className: "field",
												style: { marginBottom: 10 },
												children: [
													(0, d.jsx)("label", {
														children: "المبلغ المستحق للمندوب لكل طلب (جنيه)",
													}),
													(0, d.jsx)("input", {
														className: "inp",
														type: "number",
														value: r.payModel.value || "",
														onChange: (L) =>
															y({
																...r,
																payModel: {
																	type: "per_order",
																	value: +L.target.value || 0,
																},
															}),
													}),
													(0, d.jsx)("span", {
														className: "hint",
														children:
															"الأشهر: يستلم المندوب رسوم التوصيل نقدًا من العميل وتُحتسب في التسوية اليومية. اكتب المبلغ الثابت لكل طلب.",
													}),
												],
											}),
										r.payModel.type === "salary" &&
											(0, d.jsxs)("div", {
												className: "field",
												style: { marginBottom: 10 },
												children: [
													(0, d.jsx)("label", {
														children: "الراتب الشهري لكل مندوب (جنيه)",
													}),
													(0, d.jsx)("input", {
														className: "inp",
														type: "number",
														defaultValue: 4e3,
													}),
													(0, d.jsx)("span", {
														className: "hint",
														children:
															"مناديبك على راتب ثابت — رسوم التوصيل المحصلة من العملاء تدخل حسابك بالكامل.",
													}),
												],
											}),
										r.payModel.type === "split" &&
											(0, d.jsxs)("div", {
												className: "field",
												style: { marginBottom: 10 },
												children: [
													(0, d.jsx)("label", {
														children: "نسبة المندوب من رسوم كل طلب (%)",
													}),
													(0, d.jsx)("input", {
														className: "inp",
														type: "number",
														value: r.payModel.value || "",
														onChange: (L) =>
															y({
																...r,
																payModel: {
																	type: "split",
																	value: +L.target.value || 0,
																},
															}),
													}),
													(0, d.jsx)("span", {
														className: "hint",
														children:
															"مثال: 80% — على طلب رسومه 75 ج المندوب يقبض 60 ج و30 ج ترجعلك.",
													}),
												],
											}),
										(0, d.jsxs)("div", {
											className: "note",
											children: [
												(0, d.jsx)(S, { n: "info" }),
												" تتم التسوية من صفحة \xABمناديبي\xBB — لكل مندوب حساب مستحقات واضح حسب النموذج الذي اخترته.",
											],
										}),
									],
								}),
							!r.hasFleet &&
								(0, d.jsxs)("div", {
									className: "note",
									children: [
										(0, d.jsx)(S, { n: "zap" }),
										" تُرسل طلباتك تلقائيًا إلى شبكة مناديب Super X المستقلين — تدفع رسوم المسافة \xABمن — إلى\xBB فقط، دون أي التزامات مع مندوب بعينه. ويمكنك في أي وقت تسجيل مناديبك من صفحة \xABمناديبي\xBB.",
									],
								}),
						],
					}),
					(0, d.jsxs)("div", {
						className: "grid g2",
						children: [
							(0, d.jsxs)(F, {
								title: "نظام توزيع الطلبات",
								children: [
									(0, d.jsxs)("div", {
										className: "field",
										style: { marginBottom: 14 },
										children: [
											(0, d.jsx)("label", {
												children: "طريقة إسناد الطلبات لمناديبك",
											}),
											(0, d.jsx)("div", {
												className: "row",
												style: { gap: 10 },
												children: [
													["auto", "تلقائي", "zap"],
													["manual", "يدوي", "user"],
												].map(([L, q, Y]) =>
													(0, d.jsxs)(
														"button",
														{
															onClick: () => y({ ...r, mode: L }),
															className: "btn btn-o",
															style: {
																flex: 1,
																borderColor:
																	r.mode === L ? "var(--brand)" : "var(--line)",
																color:
																	r.mode === L
																		? "var(--brandInk)"
																		: "var(--mut)",
																background:
																	r.mode === L ? "var(--brandSoft)" : "#fff",
															},
															children: [
																(0, d.jsx)(S, { n: Y, s: 15 }),
																" ",
																q,
															],
														},
														L,
													),
												),
											}),
											(0, d.jsx)("span", {
												className: "hint",
												children:
													"تلقائي: الطلب يُسند فورًا لأفضل مندوب حسب المعيار. يدوي: الطلب ينتظر في طابور الإسناد وتسنده أنت.",
											}),
										],
									}),
									(0, d.jsxs)("div", {
										className: "field",
										style: { marginBottom: 14 },
										children: [
											(0, d.jsx)("label", {
												children: "معيار الاختيار في التوزيع التلقائي",
											}),
											(0, d.jsx)("div", {
												className: "select",
												children: (0, d.jsx)("select", {
													className: "inp",
													value: r.criteria,
													onChange: (L) =>
														y({ ...r, criteria: L.target.value }),
													children: Object.entries(iu).map(([L, q]) =>
														(0, d.jsx)("option", { value: L, children: q }, L),
													),
												}),
											}),
										],
									}),
									(0, d.jsxs)("div", {
										className: "between",
										style: {
											padding: "10px 0",
											borderTop: "1px solid var(--line2)",
										},
										children: [
											(0, d.jsxs)("div", {
												children: [
													(0, d.jsx)("b", {
														style: { fontSize: 13 },
														children: "السماح بمناديب مستقلين عند الضغط",
													}),
													(0, d.jsx)("div", {
														className: "hint",
														children:
															"لو مناديبك كلهم مشغولين، يروح الطلب لشبكة المستقلين.",
													}),
												],
											}),
											(0, d.jsx)(Uu, {
												on: r.allowFreelancers,
												onChange: (L) => y({ ...r, allowFreelancers: L }),
											}),
										],
									}),
								],
							}),
							(0, d.jsxs)(F, {
								title: "تفضيلات طلب المناديب",
								children: [
									(0, d.jsxs)("div", {
										className: "between",
										style: {
											padding: "10px 0",
											borderBottom: "1px solid var(--line2)",
										},
										children: [
											(0, d.jsxs)("div", {
												children: [
													(0, d.jsx)("b", {
														style: { fontSize: 13 },
														children: "القبول التلقائي لأقرب مندوب",
													}),
													(0, d.jsx)("div", {
														className: "sub",
														style: { fontSize: 11.5 },
														children:
															"يُرسل الطلب مباشرة لأقرب مندوب متاح دون انتظار.",
													}),
												],
											}),
											(0, d.jsx)(Uu, { on: Pu, onChange: bf }),
										],
									}),
									(0, d.jsxs)("div", {
										className: "between",
										style: {
											padding: "10px 0",
											borderBottom: "1px solid var(--line2)",
										},
										children: [
											(0, d.jsxs)("div", {
												children: [
													(0, d.jsx)("b", {
														style: { fontSize: 13 },
														children: "السماح بمناديب مستقلين في الذروة",
													}),
													(0, d.jsx)("div", {
														className: "sub",
														style: { fontSize: 11.5 },
														children:
															"عند انشغال مناديبك يظهر الطلب لشبكة المستقلين.",
													}),
												],
											}),
											(0, d.jsx)(Uu, { on: md, onChange: m }),
										],
									}),
									(0, d.jsxs)("div", {
										className: "between",
										style: { padding: "10px 0" },
										children: [
											(0, d.jsxs)("div", {
												children: [
													(0, d.jsx)("b", {
														style: { fontSize: 13 },
														children: "إشعارات واتساب للعملاء",
													}),
													(0, d.jsx)("div", {
														className: "sub",
														style: { fontSize: 11.5 },
														children:
															"تُرسل تحديثات حالة الطلب لعميلك تلقائيًا.",
													}),
												],
											}),
											(0, d.jsx)(Uu, { on: !0, onChange: () => {} }),
										],
									}),
									(0, d.jsx)("div", { className: "hr" }),
									(0, d.jsx)("button", {
										className: "btn btn-p btn-sm",
										children: "حفظ التفضيلات",
									}),
								],
							}),
							(0, d.jsx)(F, {
								title: "بيانات النشاط",
								children: N
									? (0, d.jsxs)(d.Fragment, {
											children: [
												(0, d.jsxs)("div", {
													className: "kv",
													children: [
														(0, d.jsx)("span", {
															children: "الاسم التجاري",
														}),
														(0, d.jsx)("b", { children: N.name }),
													],
												}),
												(0, d.jsxs)("div", {
													className: "kv",
													children: [
														(0, d.jsx)("span", {
															children: "رقم التواصل",
														}),
														(0, d.jsx)("b", { children: N.phone }),
													],
												}),
												(0, d.jsxs)("div", {
													className: "kv",
													children: [
														(0, d.jsx)("span", {
															children: "منطقة التشغيل",
														}),
														(0, d.jsxs)("b", {
															children: [N.governorate, " — ", N.zone],
														}),
													],
												}),
												(0, d.jsxs)("div", {
													className: "field",
													style: { marginTop: 12 },
													children: [
														(0, d.jsx)("label", {
															children:
																"نوع النشاط — يحدد نوع طلبات التوصيل تلقائيًا",
														}),
														(0, d.jsx)("div", {
															className: "row",
															style: { gap: 8, flexWrap: "wrap" },
															children: [
																"مطعم",
																"صيدلية",
																"سوبر ماركت",
																"أخرى",
															].map((L) =>
																(0, d.jsxs)(
																	"button",
																	{
																		onClick: () => Ie(L),
																		className: "btn btn-o",
																		style: {
																			borderColor:
																				ae === L
																					? "var(--brand)"
																					: "var(--line)",
																			color:
																				ae === L
																					? "var(--brandInk)"
																					: "var(--mut)",
																			background:
																				ae === L ? "var(--brandSoft)" : "#fff",
																		},
																		children: [ae === L ? "✓ " : "", L],
																	},
																	L,
																),
															),
														}),
														(0, d.jsxs)("button", {
															className: "btn btn-p btn-sm",
															style: { marginTop: 10 },
															disabled: je || ae === (N.businessType || ""),
															onClick: re,
															children: [
																(0, d.jsx)(S, { n: "check", s: 14 }),
																" حفظ نوع النشاط",
															],
														}),
													],
												}),
												(0, d.jsxs)("div", {
													className: "note",
													style: { marginTop: 12 },
													children: [
														(0, d.jsx)(S, { n: "info" }),
														" عنوان الاستلام يظهر للمندوب فقط عند قبول الطلب.",
													],
												}),
											],
										})
									: (0, d.jsx)("div", {
											className: "sub",
											children: "جارٍ تحميل بيانات النشاط…",
										}),
							}),
						],
					}),
				],
			})
		: null;
}
var be = ReactNamespace;
var s = jsxRuntime,
	Fm = [
		{
			label: "التشغيل",
			items: [
				{
					id: "home",
					icon: "grid",
					name: "الرئيسية",
				},
				{
					id: "dispatch",
					icon: "route",
					name: "لوحة التوزيع",
					pip: "2",
				},
				{
					id: "orders",
					icon: "box",
					name: "الطلبات",
				},
			],
		},
		{
			label: "الشبكة",
			items: [
				{
					id: "fleet",
					icon: "bike",
					name: "مناديبنا",
				},
				{
					id: "clients",
					icon: "users",
					name: "العملاء والدعوات",
				},
				{
					id: "fees",
					icon: "cash",
					name: "رسوم التوصيل",
				},
			],
		},
		{
			label: "الحساب",
			items: [
				{
					id: "reports",
					icon: "chart",
					name: "التقارير",
				},
				{
					id: "sub",
					icon: "card",
					name: "اشتراكنا",
				},
			],
		},
	],
	mf = od[0],
	v2 = [
		{
			id: 101,
			name: "خالد الشناوي",
			phone: "0106 220 5531",
			vehicle: "moto",
			zone: "المعادي",
			status: "busy",
			rating: 4.8,
			trips: 176,
			earn: 5280,
		},
		{
			id: 102,
			name: "عمرو دياب",
			phone: "0111 556 7712",
			vehicle: "bike",
			zone: "مدينة نصر",
			status: "free",
			rating: 4.6,
			trips: 121,
			earn: 3630,
		},
		{
			id: 103,
			name: "حازم لطفي",
			phone: "0122 887 4490",
			vehicle: "moto",
			zone: "التجمع الخامس",
			status: "free",
			rating: 4.7,
			trips: 148,
			earn: 4440,
		},
		{
			id: 104,
			name: "سيف الدين",
			phone: "0105 334 2218",
			vehicle: "bike",
			zone: "مصر الجديدة",
			status: "busy",
			rating: 4.5,
			trips: 102,
			earn: 3060,
		},
		{
			id: 105,
			name: "نادر فؤاد",
			phone: "0107 669 1187",
			vehicle: "car",
			zone: "الرحاب",
			status: "free",
			rating: 4.9,
			trips: 205,
			earn: 7380,
		},
	],
	ya = [...Hu.filter((e) => e.aff === "co0"), ...v2];
var pf = "وسط البلد",
	Hm = "sx:companyRef",
	id = (e) => Yt[e] || { t: e || "—", c: "b-gray" };
function Gm({ cur: e, go: a, store: t, initialRef = "" }) {
	Fm.some((m) => m.items.some((_) => _.id === e)) || (e = "home");
	let {
			orders: l,
			newRequest: u,
			toast: o,
			companyCfg: n,
			setCompanyCfg: i,
			assignOrder: r,
		} = t,
		y = l.filter((m) => m.status !== "delivered" && m.status !== "canceled"),
		[C, I] = be.default.useState(!1),
		[h, x] = be.default.useState(""),
		[D, H] = be.default.useState(""),
		[V, v] = be.default.useState(!1),
		[b, c] = be.default.useState(""),
		[g, R] = be.default.useState(nf.map((m) => m.fee)),
		[X, O] = be.default.useState(null),
		[P, fe] = be.default.useState("وسط البلد"),
		[W, na] = be.default.useState(""),
		[aa, Ia] = be.default.useState("وسط البلد"),
		[za, jt] = be.default.useState([]),
		[ba, Z] = be.default.useState(null),
		[ge, je] = be.default.useState([]),
		[J, Zt] = be.default.useState(() => {
			try {
				return initialRef || "";
			} catch {
				return "";
			}
		}),
		Ce = ge.find((m) => m.ref === J) || null,
		[N, Q] = be.default.useState([]),
		[ae, Ie] = be.default.useState([]),
		[re, ot] = be.default.useState([]),
		[k, de] = be.default.useState([]),
		[ve, ta] = be.default.useState({}),
		[Te, nt] = be.default.useState(!1),
		[hf, Qt] = be.default.useState(0),
		[Fu, fd] = be.default.useState(null),
		[yl, rd] = be.default.useState(""),
		[Va, gf] = be.default.useState("all"),
		[Gu, vf] = be.default.useState(""),
		Ko = (m) => {
			Zt(m || "");
			try {
				m ? localStorage.setItem(Hm, m) : localStorage.removeItem(Hm);
			} catch {}
		},
		Xa = be.default.useCallback(() => {
			(apiFetch("/api/wasl/entities?type=company")
				.then((m) => (m.ok ? m.json() : null))
				.then((m) => {
					m && m.ok ? (je(m.entities), Z(!0)) : Z(!1);
				})
				.catch(() => Z(!1)),
				apiFetch("/api/wasl/entities?type=merchant")
					.then((m) => (m.ok ? m.json() : null))
					.then((m) => {
						m && m.ok && jt(m.entities);
					})
					.catch(() => {}),
				apiFetch("/api/wasl/orders")
					.then((m) => (m.ok ? m.json() : null))
					.then((m) => {
						m && m.ok && ot(m.orders);
					})
					.catch(() => {}),
				fd(new Date()));
		}, []);
	(be.default.useEffect(() => {
		Xa();
		let m = setInterval(Xa, 2e4);
		return () => clearInterval(m);
	}, [Xa]),
		be.default.useEffect(() => {
			if (!J) {
				(Q([]), Ie([]), de([]));
				return;
			}
			(apiFetch("/api/wasl/couriers?ownerRef=" + encodeURIComponent(J))
				.then((m) => (m.ok ? m.json() : null))
				.then((m) => {
					m && m.ok && Q(m.couriers);
				})
				.catch(() => {}),
				apiFetch("/api/wasl/clients?companyRef=" + encodeURIComponent(J))
					.then((m) => (m.ok ? m.json() : null))
					.then((m) => {
						m && m.ok && Ie(m.invites);
					})
					.catch(() => {}),
				apiFetch("/api/wasl/orders?companyRef=" + encodeURIComponent(J))
					.then((m) => (m.ok ? m.json() : null))
					.then((m) => {
						m && m.ok && de(m.orders);
					})
					.catch(() => {}));
		}, [J, hf]),
		be.default.useEffect(() => {
			e !== "fees" ||
				!J ||
				apiFetch("/api/wasl/settings?key=" + encodeURIComponent("fees:" + J))
					.then((m) => (m.ok ? m.json() : null))
					.then((m) => {
						m &&
							m.ok &&
							Array.isArray(m.value) &&
							m.value.length === nf.length &&
							R(m.value);
					})
					.catch(() => {});
		}, [e, J]));
	let Ym = re.filter(
			(m) =>
				m.status &&
				!["delivered", "canceled", "refused", "expired"].includes(m.status),
		),
		jm = re.filter((m) => m.status === "searching"),
		ru = re.filter((m) => m.status === "delivered"),
		Kt = ae.filter((m) => m.status === "accepted"),
		bl = k.filter((m) => m.status === "searching"),
		xa = k.filter(
			(m) =>
				m.status &&
				!["delivered", "canceled", "refused", "expired"].includes(m.status),
		),
		yf = k.filter((m) => m.status === "delivered"),
		bt = N.filter((m) => m.status === "active"),
		[cd, cu] = be.default.useState(""),
		Jo = (m, _, M) => {
			if (!Ce) {
				o("اختاروا حساب شركتكم أولًا");
				return;
			}
			(cu(m + "|" + _),
				apiFetch("/api/wasl/company/assign", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						orderRef: m,
						companyRef: Ce.ref,
						courierRef: _,
					}),
				})
					.then((T) => T.json())
					.then((T) => {
						T && T.ok
							? (o("تم إسناد " + m + " إلى " + T.courier.name + " ✅"),
								Qt((ee) => ee + 1))
							: T && T.error === "courier_not_active"
								? o(
										"المندوب لسه مش مفعّل — لازم يفعّل عضويته من تطبيق المندوب أولًا",
									)
								: T && T.error === "courier_not_found"
									? o("المندوب مش من مناديب شركتكم")
									: T && T.error === "order_not_found"
										? o("الطلب مش من طلبات عملائكم")
										: o("تعذر الإسناد — حاولوا مرة أخرى");
					})
					.catch(() => o("تعذر الاتصال بالخادم"))
					.finally(() => cu("")));
		},
		xl = (0, s.jsxs)("div", {
			className: "cobar",
			children: [
				(0, s.jsx)("div", {
					className: "ico",
					style: {
						background: "var(--violetSoft)",
						color: "var(--violet)",
						width: 38,
						height: 38,
					},
					children: (0, s.jsx)(S, { n: "building", s: 17 }),
				}),
				(0, s.jsxs)("div", {
					style: { flex: 1, minWidth: 0 },
					children: [
						(0, s.jsx)("b", {
							style: { fontSize: 13 },
							children: Ce ? Ce.name : "لم يتم اختيار حساب الشركة بعد",
						}),
						(0, s.jsxs)("div", {
							className: "sub",
							style: { fontSize: 11 },
							children: [
								Ce
									? (0, s.jsxs)(s.Fragment, {
											children: [
												"حساب مسجل — ",
												Ce.phone,
												" — ",
												Ce.zone || "—",
											],
										})
									: "اختاروا حساب شركتكم المسجل لتُربط كل الشاشات ببياناتكم الحقيقية",
								Fu &&
									(0, s.jsxs)(s.Fragment, {
										children: [
											" \xB7 آخر مزامنة ",
											Fu.toLocaleTimeString("en-GB", {
												hour: "2-digit",
												minute: "2-digit",
											}),
										],
									}),
							],
						}),
					],
				}),
				(0, s.jsx)("div", {
					className: "select",
					children: (0, s.jsxs)("select", {
						className: "inp",
						style: {
							padding: "8px 12px",
							fontSize: 12.5,
							fontWeight: 700,
							maxWidth: 260,
						},
						value: J,
						onChange: (m) => Ko(m.target.value),
						children: [
							(0, s.jsx)("option", {
								value: "",
								children: "— اختيار حساب شركة —",
							}),
							ge.map((m) =>
								(0, s.jsxs)(
									"option",
									{ value: m.ref, children: [m.name, " — ", m.phone] },
									m.ref,
								),
							),
						],
					}),
				}),
				(0, s.jsx)("button", {
					className: "iconbtn",
					title: "تحديث البيانات",
					onClick: Xa,
					children: (0, s.jsx)(S, { n: "refresh", s: 16 }),
				}),
			],
		}),
		Wo = (m, _) => {
			if (!(_ > 0)) {
				o("لا مستحقات حالية لـ " + m);
				return;
			}
			if (!Ce) {
				o("اختاروا حساب شركتكم المسجل أولًا ليُسجل التسوية رسميًا");
				return;
			}
			(nt(!0),
				apiFetch("/api/wasl/settlements", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						ownerRef: Ce.ref,
						ownerName: Ce.name,
						courierName: m,
						amount: _,
					}),
				})
					.then((M) => M.json())
					.then((M) => {
						M && M.ok
							? (o(
									"اتسجلت التسوية " +
										se(_) +
										" لـ " +
										m +
										" — " +
										M.settlement.ref,
								),
								ta((T) => ({ ...T, [m]: M.settlement.ref })))
							: o("تعذر تسجيل التسوية — حاول مرة أخرى");
					})
					.catch(() => o("تعذر الاتصال بالخادم"))
					.finally(() => nt(!1)));
		},
		Ll = () => {
			nt(!0);
			let m = "fees:" + (Ce ? Ce.ref : "guest");
			apiFetch("/api/wasl/settings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ key: m, value: g }),
			})
				.then((_) => _.json())
				.then((_) => {
					_ && _.ok
						? o(
								Ce
									? "تم حفظ جدول الرسوم بنجاح ✅"
									: "تم حفظ الرسوم مؤقتًا — اختاروا شركتكم المسجلة ليُحفظ الجدول باسمها الرسمي",
							)
						: o("تعذر الحفظ — حاول مرة أخرى");
				})
				.catch(() => o("تعذر الاتصال بالخادم"))
				.finally(() => nt(!1));
		};
	be.default.useEffect(() => {
		if (n.mode !== "auto") return;
		let m = setInterval(() => {
			let _ = l.filter((ee) => ee.status === "searching" && !ee.manual);
			if (!_.length) return;
			let M = _[_.length - 1],
				T = fu(
					ya.filter((ee) => ee.status !== "off"),
					M.zone,
					n.criteria,
				)[0];
			T && r(M.id, T.name);
		}, 6e3);
		return () => clearInterval(m);
	}, [n, l]);
	let xt = [...re, ...l.filter((m) => !re.some((_) => _.id === m.id))],
		Pu = xt.filter((m) => {
			if (
				(Va === "real" && !m.real) ||
				(Va === "active" &&
					(m.status === "delivered" || m.status === "canceled")) ||
				(Va === "done" && m.status !== "delivered") ||
				(Va === "pending" && m.status !== "searching")
			)
				return !1;
			if (yl) {
				let _ = yl.trim();
				if (
					!(
						m.id +
						" " +
						m.merchant +
						" " +
						m.to +
						" " +
						(m.courier || "") +
						" " +
						(m.zone || "")
					)
						.toLowerCase()
						.includes(_.toLowerCase())
				)
					return !1;
			}
			return !0;
		}),
		bf = () => {
			let _ =
					"﻿" +
					[
						[
							"الطلب",
							"الحالة",
							"العميل",
							"الوجهة",
							"المندوب",
							"الرسوم",
							"الوقت",
						],
					]
						.concat(
							Pu.map((T) => [
								T.id,
								id(T.status).t,
								T.merchant,
								T.to,
								T.courier || "",
								T.fee,
								T.time || "",
							]),
						)
						.map((T) =>
							T.map((ee) => '"' + String(ee).replace(/"/g, '""') + '"').join(
								",",
							),
						).join(`
`),
				M = document.createElement("a");
			((M.href = URL.createObjectURL(new Blob([_], { type: "text/csv" }))),
				(M.download = "superx-orders.csv"),
				M.click(),
				o("تم تنزيل ملف الطلبات (" + Pu.length + " طلب)"));
		};
	if (e === "home")
		return (0, s.jsxs)(s.Fragment, {
			children: [
				(0, s.jsxs)(De, {
					title: "الرئيسية",
					sub: `مركز إدارة عمليات ${Ce ? Ce.name : mf.name}`,
					children: [
						(0, s.jsx)(E, {
							c: ba === !1 ? "b-amber" : "b-green",
							icon: ba === !1 ? "alert" : "wifi",
							children: ba === !1 ? "غير متصل" : "مباشر",
						}),
						(0, s.jsxs)("button", {
							className: "btn btn-p btn-sm",
							onClick: () => a("fleet"),
							children: [(0, s.jsx)(S, { n: "plus", s: 14 }), " تسجيل مندوب"],
						}),
					],
				}),
				(0, s.jsx)(ld, { down: ba === !1, onRetry: Xa }),
				xl,
				(0, s.jsx)("div", { style: { height: 14 } }),
				(0, s.jsxs)("div", {
					className: "grid g4",
					children: [
						(0, s.jsx)(he, {
							icon: "box",
							color: "#7c3aed",
							bg: "#f2ecfe",
							val: J ? xa.length : y.length,
							label: J ? "طلبات عملائكم الجارية" : "طلبات جارية",
							spark: [2, 3, 2, 4, 3, 2, 4, 3],
							sparkColor: "#7c3aed",
						}),
						(0, s.jsx)(he, {
							icon: "bike",
							color: "#0d9488",
							bg: "#e4f7f4",
							val:
								J && N.length
									? N.filter((m) => m.status === "active").length
									: ya.filter((m) => m.status !== "off").length,
							label: J && N.length ? "مناديبكم النشطون" : "مناديب متصلون",
							spark: [5, 6, 6, 7, 7, 8, 8, 9],
							sparkColor: "#0d9488",
						}),
						(0, s.jsx)(he, {
							icon: "users",
							color: "#2563eb",
							bg: "#e8effd",
							val: J && Kt.length ? Kt.length : mf.clients,
							label:
								J && Kt.length ? "عملاء مقبولون (حقيقي)" : "عملاء متعاقدون",
						}),
						(0, s.jsx)(he, {
							icon: "wallet",
							color: "#d97706",
							bg: "#fdf2e3",
							val: se(
								J
									? k.reduce((m, _) => m + (_.fee || 0), 0)
									: ru.reduce((m, _) => m + (_.fee || 0), 0) || 38400,
							),
							label: J
								? "رسوم طلبات عملائكم (حقيقي)"
								: ru.length
									? "إيراد رسوم طلباتكم (حقيقي)"
									: "إيراد الشهر",
							trend: J || ru.length ? null : "11%+",
							up: !0,
							spark: [24, 27, 26, 31, 34, 32, 37, 38],
							sparkColor: "#d97706",
						}),
					],
				}),
				(0, s.jsx)("div", { style: { height: 16 } }),
				(0, s.jsxs)("div", {
					className: "grid g21",
					children: [
						(0, s.jsxs)("div", {
							className: "grid",
							style: { gap: 16 },
							children: [
								(0, s.jsx)(F, {
									title: "لوحة التوزيع المباشرة",
									action: (0, s.jsx)("button", {
										className: "btn btn-o btn-sm",
										onClick: () => a("dispatch"),
										children: "فتح لوحة التوزيع",
									}),
									pad: !1,
									children: (0, s.jsx)("div", {
										style: { padding: 16 },
										children: (0, s.jsx)(of, {
											height: 330,
											badge: (0, s.jsxs)(s.Fragment, {
												children: [
													(0, s.jsx)("i", {
														className: "dot8 blink",
														style: { background: "#059669" },
													}),
													"مباشر",
												],
											}),
											legend: [
												{
													c: "#7c3aed",
													t: "مناديبنا",
												},
												{ c: "#f59e0b", t: "مشغول" },
												{ c: "#dc2626", t: "وجهة" },
											],
											markers: [
												...ya.slice(0, 7).map((m, _) => ({
													x: [15, 34, 52, 70, 84, 25, 60][_],
													y: [20, 35, 18, 45, 28, 62, 58][_],
													k: m.status === "busy" ? "busy" : "co",
													name: m.name,
												})),
												...y.slice(0, 3).map((m, _) => ({
													x: [48, 30, 66][_],
													y: [68, 75, 72][_],
													k: "dest",
													icon: "pin",
													name: m.to,
												})),
											],
										}),
									}),
								}),
								(0, s.jsx)(F, {
									title: "أداء الشبكة — آخر 7 أيام",
									action: (0, s.jsx)(hl, {}),
									children: (0, s.jsx)(pl, {
										data: [54, 61, 58, 72, 80, 66, 91],
										labels: [
											"أحد",
											"اثنين",
											"ثلاثاء",
											"أربعاء",
											"خميس",
											"جمعة",
											"سبت",
										],
										color: "#7c3aed",
									}),
								}),
							],
						}),
						(0, s.jsxs)("div", {
							className: "grid",
							style: { gap: 16, alignContent: "start" },
							children: [
								(0, s.jsxs)(F, {
									title: "توزيع المناديب",
									children: [
										(0, s.jsx)(jo, {
											segs: [
												{
													label: "متاح",
													v: ya.filter((m) => m.status === "free").length,
													c: "#059669",
												},
												{
													label: "مشغول",
													v: ya.filter((m) => m.status === "busy").length,
													c: "#d97706",
												},
												{
													label: "غير متصل",
													v: ya.filter((m) => m.status === "off").length,
													c: "#cbd5e1",
												},
											],
											center: String(ya.length),
										}),
										(0, s.jsx)("div", { className: "hr" }),
										(0, s.jsxs)("div", {
											className: "kv",
											children: [
												(0, s.jsx)("span", {
													children: "متاح",
												}),
												(0, s.jsx)("b", {
													children: ya.filter((m) => m.status === "free")
														.length,
												}),
											],
										}),
										(0, s.jsxs)("div", {
											className: "kv",
											children: [
												(0, s.jsx)("span", {
													children: "مشغول",
												}),
												(0, s.jsx)("b", {
													children: ya.filter((m) => m.status === "busy")
														.length,
												}),
											],
										}),
									],
								}),
								(0, s.jsxs)(F, {
									title: "مؤشرات اليوم",
									children: [
										(0, s.jsxs)("div", {
											className: "kv",
											children: [
												(0, s.jsx)("span", {
													children: "طلبات عملائكم بانتظار الإسناد",
												}),
												(0, s.jsx)("b", {
													style: {
														color: bl.length ? "var(--amber)" : "var(--green)",
													},
													children: bl.length,
												}),
											],
										}),
										(0, s.jsxs)("div", {
											className: "kv",
											children: [
												(0, s.jsx)("span", {
													children: "دعوات عملاء معلّقة",
												}),
												(0, s.jsx)("b", {
													children: ae.filter((m) => m.status === "pending")
														.length,
												}),
											],
										}),
										(0, s.jsxs)("div", {
											className: "kv",
											children: [
												(0, s.jsx)("span", {
													children: "مناديب بانتظار التفعيل",
												}),
												(0, s.jsx)("b", {
													children: N.filter((m) => m.status === "invited")
														.length,
												}),
											],
										}),
										(0, s.jsxs)("div", {
											className: "kv",
											children: [
												(0, s.jsx)("span", {
													children: "أنشطة على المنصة",
												}),
												(0, s.jsx)("b", { children: za.length }),
											],
										}),
										(0, s.jsxs)("div", {
											className: "note warn",
											style: { marginTop: 10 },
											children: [
												(0, s.jsx)(S, { n: "alert" }),
												" ذروة متوقعة 8:00–10:00 مساءً — فعّل المناديب المستقلين عند الحاجة.",
											],
										}),
									],
								}),
							],
						}),
					],
				}),
			],
		});
	let md = l.filter((m) => m.status === "searching" && !m.manual);
	if (e === "dispatch")
		return (0, s.jsxs)(s.Fragment, {
			children: [
				(0, s.jsxs)(De, {
					title: "لوحة التوزيع",
					sub: "اختاروا طريقة إسناد الطلبات لمناديبكم — وتحكموا في معيار الاختيار",
					children: [
						(0, s.jsx)("div", {
							className: "pill-tabs",
							children: Object.entries(sf).map(([m, _]) =>
								(0, s.jsx)(
									"button",
									{
										className: n.mode === m ? "on" : "",
										onClick: () => {
											(i({ ...n, mode: m }),
												o(
													m === "auto"
														? "الإسناد التلقائي مفعّل — الطلبات هتتوزع وحدها"
														: "الإسناد اليدوي — الطلبات هتفضل مستنياك",
												));
										},
										children: _,
									},
									m,
								),
							),
						}),
						(0, s.jsx)("div", {
							className: "field",
							style: { minWidth: 180 },
							children: (0, s.jsx)("div", {
								className: "select",
								children: (0, s.jsx)("select", {
									className: "inp",
									style: { padding: "8px 12px", fontWeight: 700 },
									value: n.criteria,
									onChange: (m) => i({ ...n, criteria: m.target.value }),
									children: Object.entries(iu).map(([m, _]) =>
										(0, s.jsxs)(
											"option",
											{ value: m, children: ["حسب: ", _] },
											m,
										),
									),
								}),
							}),
						}),
					],
				}),
				(0, s.jsx)(ld, { down: ba === !1, onRetry: Xa }),
				xl,
				(0, s.jsx)("div", { style: { height: 14 } }),
				bl.length > 0 &&
					(0, s.jsx)(F, {
						title: "طلبات عملائكم بانتظار الإسناد — أسندها لمناديبكم بضغطة",
						action: (0, s.jsxs)(E, {
							c: "b-teal",
							children: [bl.length, " طلب"],
						}),
						pad: !1,
						children: bl.map((m) =>
							(0, s.jsxs)(
								"div",
								{
									style: {
										padding: "14px 18px",
										borderBottom: "1px solid var(--line2)",
									},
									children: [
										(0, s.jsxs)("div", {
											className: "between",
											style: { marginBottom: 8 },
											children: [
												(0, s.jsxs)("div", {
													className: "row",
													children: [
														(0, s.jsx)("b", { children: m.id }),
														(0, s.jsx)(E, {
															c: "b-teal",
															blink: !0,
															children: "بانتظار مندوب",
														}),
													],
												}),
												(0, s.jsx)("span", {
													className: "sub",
													children: se(m.fee),
												}),
											],
										}),
										(0, s.jsxs)("div", {
											className: "row",
											style: {
												fontSize: 12,
												color: "var(--mut)",
												gap: 12,
												flexWrap: "wrap",
												marginBottom: 10,
											},
											children: [
												(0, s.jsxs)("span", {
													children: [
														(0, s.jsx)(S, { n: "store", s: 13 }),
														" ",
														m.merchant,
													],
												}),
												(0, s.jsxs)("span", {
													children: [
														(0, s.jsx)(S, { n: "pin", s: 13 }),
														" ",
														m.to,
													],
												}),
												(0, s.jsxs)("span", {
													children: [
														(0, s.jsx)(S, { n: "route", s: 13 }),
														" ",
														m.zone,
													],
												}),
												(0, s.jsxs)("span", {
													children: [
														(0, s.jsx)(S, { n: "clock", s: 13 }),
														" ",
														m.time,
													],
												}),
											],
										}),
										(0, s.jsx)("div", {
											className: "row",
											style: { gap: 8, flexWrap: "wrap" },
											children:
												bt.length === 0
													? (0, s.jsx)("span", {
															className: "sub",
															children:
																"سجّلوا مناديب وفعّلوهم أولًا من صفحة \xABمناديبنا\xBB عشان تقدروا تسندوا.",
														})
													: bt.map((_) =>
															(0, s.jsxs)(
																"button",
																{
																	className: "btn btn-p btn-sm",
																	disabled: cd === m.id + "|" + _.ref,
																	onClick: () => Jo(m.id, _.ref, _.name),
																	children: [
																		(0, s.jsx)(S, { n: "bike", s: 13 }),
																		" ",
																		_.name,
																	],
																},
																_.ref,
															),
														),
										}),
									],
								},
								m.id,
							),
						),
					}),
				bl.length > 0 && (0, s.jsx)("div", { style: { height: 16 } }),
				(0, s.jsxs)("div", {
					className: "grid g21",
					children: [
						(0, s.jsx)(F, {
							title: "طلبات الاستعراض بانتظار الإسناد",
							action: (0, s.jsx)(hl, {}),
							pad: !1,
							children:
								md.length === 0
									? (0, s.jsx)(qu, {
											icon: "check",
											title: "كل الطلبات مُسندة إلى مناديب",
											sub: `${y.length} طلب جارٍ — ${n.mode === "auto" ? "الإسناد التلقائي شغال بمعيار " + iu[n.criteria] : "لا يوجد طلب معلّق"}`,
										})
									: md.map((m) => {
											let _ = fu(
												ya.filter((M) => M.status !== "off"),
												m.zone,
												n.criteria,
											).slice(0, 3);
											return (0, s.jsxs)(
												"div",
												{
													style: {
														padding: "14px 18px",
														borderBottom: "1px solid var(--line2)",
													},
													children: [
														(0, s.jsxs)("div", {
															className: "between",
															style: { marginBottom: 8 },
															children: [
																(0, s.jsxs)("div", {
																	className: "row",
																	children: [
																		(0, s.jsx)("b", { children: m.id }),
																		(0, s.jsx)(E, {
																			c: id(m.status).c,
																			blink: !0,
																			children: id(m.status).t,
																		}),
																	],
																}),
																(0, s.jsx)("span", {
																	className: "sub",
																	children: se(m.fee),
																}),
															],
														}),
														(0, s.jsxs)("div", {
															className: "row",
															style: {
																fontSize: 12,
																color: "var(--mut)",
																gap: 12,
																marginBottom: 10,
																flexWrap: "wrap",
															},
															children: [
																(0, s.jsxs)("span", {
																	children: [
																		(0, s.jsx)(S, { n: "store", s: 13 }),
																		" ",
																		m.merchant,
																	],
																}),
																(0, s.jsxs)("span", {
																	children: [
																		(0, s.jsx)(S, { n: "pin", s: 13 }),
																		" ",
																		m.to,
																	],
																}),
																(0, s.jsxs)("span", {
																	children: [
																		(0, s.jsx)(S, { n: "clock", s: 13 }),
																		" منذ ",
																		m.eta === "—" ? "لحظات" : m.eta,
																	],
																}),
															],
														}),
														(0, s.jsxs)("div", {
															className: "row",
															style: { gap: 8, flexWrap: "wrap" },
															children: [
																(0, s.jsxs)("span", {
																	className: "tag",
																	style: {
																		color: "var(--brandInk)",
																		background: "var(--brandSoft)",
																	},
																	children: [
																		"أفضل ترشيح (",
																		iu[n.criteria],
																		"): ",
																		_[0]?.name || "—",
																	],
																}),
																_.map((M) =>
																	(0, s.jsxs)(
																		"button",
																		{
																			className: "btn btn-o btn-sm",
																			onClick: () => {
																				(r(m.id, M.name),
																					o(
																						"تم إسناد " +
																							m.id +
																							" إلى " +
																							M.name,
																					));
																			},
																			children: [
																				(0, s.jsx)(S, { n: "check", s: 13 }),
																				" ",
																				M.name,
																			],
																		},
																		M.id,
																	),
																),
															],
														}),
													],
												},
												m.id,
											);
										}),
						}),
						(0, s.jsx)(F, {
							title: "مناديب جاهزون للإسناد",
							pad: !1,
							children: (0, s.jsxs)("table", {
								className: "tbl",
								children: [
									(0, s.jsx)("thead", {
										children: (0, s.jsxs)("tr", {
											children: [
												(0, s.jsx)("th", {
													children: "المندوب",
												}),
												(0, s.jsx)("th", {
													children: "المنطقة",
												}),
												(0, s.jsx)("th", {
													children: "الحالة",
												}),
												(0, s.jsx)("th", {}),
											],
										}),
									}),
									(0, s.jsx)("tbody", {
										children: ya
											.filter((m) => m.status !== "off")
											.slice(0, 7)
											.map((m) =>
												(0, s.jsxs)(
													"tr",
													{
														children: [
															(0, s.jsx)("td", {
																children: (0, s.jsxs)("div", {
																	className: "row",
																	style: { gap: 8 },
																	children: [
																		(0, s.jsx)(lt, {
																			name: m.name,
																			size: 28,
																		}),
																		(0, s.jsx)("b", {
																			style: { fontSize: 12.5 },
																			children: m.name,
																		}),
																	],
																}),
															}),
															(0, s.jsx)("td", {
																className: "sub",
																children: m.zone,
															}),
															(0, s.jsx)("td", {
																children: (0, s.jsx)(E, {
																	c:
																		m.status === "free" ? "b-green" : "b-amber",
																	children:
																		m.status === "free" ? "جاهز" : "مشغول",
																}),
															}),
															(0, s.jsx)("td", {
																children:
																	m.status === "free"
																		? (0, s.jsx)("button", {
																				className: "btn btn-o btn-sm",
																				onClick: () =>
																					o(
																						"تم إرسال عرض أول طلب متاح للمندوب " +
																							m.name,
																					),
																				children: "إسناد",
																			})
																		: null,
															}),
														],
													},
													m.id,
												),
											),
									}),
								],
							}),
						}),
					],
				}),
				(0, s.jsx)("div", { style: { height: 16 } }),
				(0, s.jsx)(F, {
					title: "قواعد التوزيع الذكي",
					action: (0, s.jsx)(E, {
						c: "b-violet",
						children: "مفعّلة",
					}),
					children: (0, s.jsx)("div", {
						className: "grid g3",
						style: { gap: 12 },
						children: [
							[
								"target",
								"أقرب مندوب أولًا",
								"يُحسب بُعد المندوب من نقطة الاستلام لحظيًا.",
							],
							[
								"clock",
								"عدالة التوزيع",
								"يُراعى آخر طلب للمندوب حتى لا يُثقل منهجًا.",
							],
							[
								"layers",
								"توازن التحميل",
								"لا يتجاوز حمل المندوب 3 طلبات متزامنة.",
							],
						].map(([m, _, M]) =>
							(0, s.jsxs)(
								"div",
								{
									className: "row",
									style: { gap: 10, alignItems: "flex-start" },
									children: [
										(0, s.jsx)("div", {
											className: "ico",
											style: {
												background: "var(--violetSoft)",
												color: "var(--violet)",
											},
											children: (0, s.jsx)(S, { n: m, s: 16 }),
										}),
										(0, s.jsxs)("div", {
											children: [
												(0, s.jsx)("b", {
													style: { fontSize: 13 },
													children: _,
												}),
												(0, s.jsx)("div", {
													className: "sub",
													style: { fontSize: 11.5 },
													children: M,
												}),
											],
										}),
									],
								},
								_,
							),
						),
					}),
				}),
			],
		});
	if (e === "orders")
		return (0, s.jsxs)(s.Fragment, {
			children: [
				(0, s.jsxs)(De, {
					title: "الطلبات",
					sub: `${k.length} طلب لعملائكم — ${re.length} طلب عبر المنصة كلها — ${l.length} استعراضي`,
					children: [
						(0, s.jsx)(Dm, {
							value: yl,
							onChange: rd,
							placeholder: "بحث برقم الطلب أو العميل أو المندوب…",
						}),
						(0, s.jsxs)("button", {
							className: "btn btn-o btn-sm",
							onClick: bf,
							children: [(0, s.jsx)(S, { n: "file", s: 13 }), " تصدير CSV"],
						}),
						(0, s.jsx)("button", {
							className: "iconbtn",
							title: "تحديث",
							onClick: Xa,
							children: (0, s.jsx)(S, { n: "refresh", s: 16 }),
						}),
					],
				}),
				J &&
					(0, s.jsxs)(s.Fragment, {
						children: [
							(0, s.jsx)(F, {
								pad: !1,
								title: "طلبات عملائكم — مرتبطة بحساب شركتكم تلقائيًا",
								action: (0, s.jsxs)(E, {
									c: "b-teal",
									children: [k.length, " طلب"],
								}),
								children:
									k.length === 0
										? (0, s.jsx)(qu, {
												icon: "box",
												title: "لا توجد طلبات لعملائكم بعد",
												sub: "أول ما أي نشاط من عملائكم يسجّل طلب عبر المنصة هيظهر هنا فورًا — ومن هنا أو من لوحة التوزيع تقدروا تسندوه لمناديبكم.",
											})
										: (0, s.jsxs)("table", {
												className: "tbl",
												children: [
													(0, s.jsx)("thead", {
														children: (0, s.jsxs)("tr", {
															children: [
																(0, s.jsx)("th", {
																	children: "الطلب",
																}),
																(0, s.jsx)("th", {
																	children: "العميل",
																}),
																(0, s.jsx)("th", {
																	children: "الوجهة",
																}),
																(0, s.jsx)("th", {
																	children: "المندوب",
																}),
																(0, s.jsx)("th", {
																	children: "الرسوم",
																}),
																(0, s.jsx)("th", {
																	children: "الحالة",
																}),
																(0, s.jsx)("th", {}),
															],
														}),
													}),
													(0, s.jsx)("tbody", {
														children: k
															.filter(
																(m) =>
																	!(
																		(yl &&
																			!(
																				m.id +
																				" " +
																				m.merchant +
																				" " +
																				m.to +
																				" " +
																				(m.courier || "") +
																				" " +
																				(m.zone || "")
																			)
																				.toLowerCase()
																				.includes(yl.trim().toLowerCase())) ||
																		(Va === "pending" &&
																			m.status !== "searching") ||
																		(Va === "active" &&
																			(m.status === "delivered" ||
																				m.status === "canceled")) ||
																		(Va === "done" && m.status !== "delivered")
																	),
															)
															.map((m) => {
																let _ = id(m.status);
																return (0, s.jsxs)(
																	"tr",
																	{
																		children: [
																			(0, s.jsxs)("td", {
																				className: "main-cell",
																				children: [
																					m.id,
																					(0, s.jsx)("div", {
																						className: "sub",
																						children: m.time,
																					}),
																				],
																			}),
																			(0, s.jsx)("td", {
																				children: m.merchant,
																			}),
																			(0, s.jsxs)("td", {
																				className: "sub",
																				children: [
																					m.to,
																					" ",
																					(0, s.jsxs)("span", {
																						style: { color: "var(--mut2)" },
																						children: ["— ", m.zone],
																					}),
																				],
																			}),
																			(0, s.jsx)("td", {
																				children: m.courier
																					? (0, s.jsxs)("div", {
																							className: "row",
																							style: { gap: 7 },
																							children: [
																								(0, s.jsx)(lt, {
																									name: m.courier,
																									size: 26,
																								}),
																								(0, s.jsx)("span", {
																									children: m.courier,
																								}),
																							],
																						})
																					: (0, s.jsx)(E, {
																							c: "b-amber",
																							blink: !0,
																							children: "بانتظار إسناد",
																						}),
																			}),
																			(0, s.jsx)("td", {
																				className: "main-cell",
																				children: se(m.fee),
																			}),
																			(0, s.jsx)("td", {
																				children: (0, s.jsx)(E, {
																					c: _.c,
																					blink: m.status === "searching",
																					children: _.t,
																				}),
																			}),
																			(0, s.jsx)("td", {
																				children:
																					m.status === "searching" &&
																					bt.length > 0
																						? (0, s.jsx)("div", {
																								className: "row",
																								style: {
																									gap: 6,
																									flexWrap: "wrap",
																								},
																								children: bt
																									.slice(0, 2)
																									.map((M) =>
																										(0, s.jsxs)(
																											"button",
																											{
																												className:
																													"btn btn-p btn-sm",
																												disabled:
																													cd ===
																													m.id + "|" + M.ref,
																												onClick: () =>
																													Jo(
																														m.id,
																														M.ref,
																														M.name,
																													),
																												children: [
																													(0, s.jsx)(S, {
																														n: "bike",
																														s: 12,
																													}),
																													" ",
																													M.name,
																												],
																											},
																											M.ref,
																										),
																									),
																							})
																						: (0, s.jsx)("span", {
																								className: "sub",
																								children:
																									m.status === "searching"
																										? "سجّلوا مناديب نشطين أولًا"
																										: "—",
																							}),
																			}),
																		],
																	},
																	m.id,
																);
															}),
													}),
												],
											}),
							}),
							(0, s.jsx)("div", { style: { height: 16 } }),
						],
					}),
				(0, s.jsx)("div", {
					className: "row",
					style: { gap: 8, marginBottom: 14, flexWrap: "wrap" },
					children: [
						["all", "الكل"],
						["real", "حقيقية"],
						["pending", "بانتظار إسناد"],
						["active", "جارية"],
						["done", "مكتملة"],
					].map(([m, _]) =>
						(0, s.jsxs)(
							"button",
							{
								className: "chip" + (Va === m ? " on" : ""),
								onClick: () => gf(m),
								children: [
									_,
									" ",
									(0, s.jsx)("b", {
										children:
											m === "all"
												? xt.length
												: m === "real"
													? re.length
													: m === "pending"
														? xt.filter((M) => M.status === "searching").length
														: m === "active"
															? xt.filter(
																	(M) =>
																		M.status !== "delivered" &&
																		M.status !== "canceled",
																).length
															: xt.filter((M) => M.status === "delivered")
																	.length,
									}),
								],
							},
							m,
						),
					),
				}),
				(0, s.jsx)(F, {
					pad: !1,
					children:
						Pu.length === 0
							? (0, s.jsx)(qu, {
									icon: "box",
									title: "لا توجد طلبات مطابقة",
									sub: "غيّروا عامل التصفية أو كلمة البحث، أو اعملوا تحديث.",
								})
							: (0, s.jsxs)("table", {
									className: "tbl",
									children: [
										(0, s.jsx)("thead", {
											children: (0, s.jsxs)("tr", {
												children: [
													(0, s.jsx)("th", {
														children: "الطلب",
													}),
													(0, s.jsx)("th", {
														children: "العميل",
													}),
													(0, s.jsx)("th", {
														children: "الوجهة",
													}),
													(0, s.jsx)("th", {
														children: "المندوب",
													}),
													(0, s.jsx)("th", {
														children: "الرسوم",
													}),
													(0, s.jsx)("th", {
														children: "الحالة",
													}),
													(0, s.jsx)("th", {}),
												],
											}),
										}),
										(0, s.jsx)("tbody", {
											children: Pu.map((m) => {
												let _ = id(m.status),
													M = X === m.id;
												return (0, s.jsxs)(
													be.default.Fragment,
													{
														children: [
															(0, s.jsxs)("tr", {
																onClick: () => O(M ? null : m.id),
																style: { cursor: "pointer" },
																children: [
																	(0, s.jsxs)("td", {
																		className: "main-cell",
																		children: [
																			m.id,
																			" ",
																			m.real &&
																				(0, s.jsx)(E, {
																					c: "b-teal",
																					children: "حقيقي",
																				}),
																			(0, s.jsx)("div", {
																				className: "sub",
																				children: m.time,
																			}),
																		],
																	}),
																	(0, s.jsx)("td", { children: m.merchant }),
																	(0, s.jsx)("td", {
																		className: "sub",
																		children: m.to,
																	}),
																	(0, s.jsx)("td", {
																		children: m.courier
																			? (0, s.jsxs)("div", {
																					className: "row",
																					style: { gap: 7 },
																					children: [
																						(0, s.jsx)(lt, {
																							name: m.courier,
																							size: 26,
																						}),
																						(0, s.jsx)("span", {
																							children: m.courier,
																						}),
																					],
																				})
																			: (0, s.jsx)(E, {
																					c: "b-amber",
																					blink: !0,
																					children: "بانتظار مندوب…",
																				}),
																	}),
																	(0, s.jsx)("td", {
																		className: "main-cell",
																		children: se(m.fee),
																	}),
																	(0, s.jsx)("td", {
																		children: (0, s.jsx)(E, {
																			c: _.c,
																			blink: m.status === "searching",
																			children: _.t,
																		}),
																	}),
																	(0, s.jsx)("td", {
																		children: (0, s.jsxs)("button", {
																			className: "btn btn-o btn-sm",
																			onClick: (T) => {
																				(T.stopPropagation(),
																					O(M ? null : m.id));
																			},
																			children: [
																				(0, s.jsx)(S, { n: "eye", s: 13 }),
																				" تفاصيل",
																			],
																		}),
																	}),
																],
															}),
															M &&
																(0, s.jsx)("tr", {
																	style: { background: "#fbfdff" },
																	children: (0, s.jsxs)("td", {
																		colSpan: 7,
																		style: { padding: "14px 18px" },
																		children: [
																			(0, s.jsxs)("div", {
																				className: "row wrap",
																				style: { gap: 10, fontSize: 12.5 },
																				children: [
																					(0, s.jsxs)(E, {
																						c: "b-blue",
																						icon: "store",
																						children: ["العميل: ", m.merchant],
																					}),
																					m.km
																						? (0, s.jsxs)(E, {
																								c: "b-teal",
																								icon: "route",
																								children: [
																									"المسافة ≈ ",
																									m.km,
																									" كم",
																								],
																							})
																						: null,
																					m.feeMin
																						? (0, s.jsxs)(E, {
																								c: "b-gray",
																								children: [
																									"نطاق التسعير: من ",
																									m.feeMin,
																									" إلى ",
																									m.feeMax,
																									" ج",
																								],
																							})
																						: null,
																					(0, s.jsx)(E, {
																						c: "b-amber",
																						icon: "cash",
																						children: m.pay || "كاش",
																					}),
																					m.kind
																						? (0, s.jsx)(E, {
																								c: "b-violet",
																								children: m.kind,
																							})
																						: null,
																					m.note
																						? (0, s.jsxs)(E, {
																								c: "b-red",
																								icon: "alert",
																								children: ["ملاحظة: ", m.note],
																							})
																						: null,
																				],
																			}),
																			(0, s.jsxs)("div", {
																				className: "row",
																				style: {
																					gap: 16,
																					marginTop: 10,
																					fontSize: 12,
																					color: "var(--mut)",
																					flexWrap: "wrap",
																				},
																				children: [
																					(0, s.jsxs)("span", {
																						children: [
																							(0, s.jsx)(S, {
																								n: "store",
																								s: 13,
																							}),
																							" استلام: ",
																							m.from,
																						],
																					}),
																					(0, s.jsxs)("span", {
																						children: [
																							(0, s.jsx)(S, {
																								n: "pin",
																								s: 13,
																							}),
																							" تسليم: ",
																							m.to,
																						],
																					}),
																					m.custName &&
																						(0, s.jsxs)("span", {
																							children: [
																								(0, s.jsx)(S, {
																									n: "user",
																									s: 13,
																								}),
																								" العميل: ",
																								m.custName,
																								" ",
																								m.cust ? "— " + m.cust : "",
																							],
																						}),
																					m.courier &&
																						(0, s.jsxs)("span", {
																							children: [
																								(0, s.jsx)(S, {
																									n: "bike",
																									s: 13,
																								}),
																								" المنفذ: ",
																								m.courier,
																							],
																						}),
																				],
																			}),
																			(0, s.jsx)("div", {
																				style: {
																					maxWidth: 420,
																					marginTop: 12,
																				},
																				children: (0, s.jsx)(Xt, {
																					cur:
																						{
																							searching: 0,
																							accepted: 1,
																							pickup: 2,
																							heading: 3,
																							delivered: 4,
																						}[m.status] ?? 0,
																					labels: [
																						"طلب",
																						"قبول",
																						"استلام",
																						"في الطريق",
																						"تسليم",
																					],
																				}),
																			}),
																		],
																	}),
																}),
														],
													},
													(m.real ? "R-" : "D-") + m.id,
												);
											}),
										}),
									],
								}),
				}),
			],
		});
	if (e === "fleet") {
		let m = () => {
				if (!Ce) {
					o("اختاروا حساب شركتكم المسجل من الشريط الأعلى أولًا");
					return;
				}
				if (D.trim().length < 2) {
					o("أدخل اسم المندوب");
					return;
				}
				let T = h.replace(/\s+/g, "");
				if (T.length < 8) {
					o("أدخل رقم موبايل صحيح");
					return;
				}
				(nt(!0),
					apiFetch("/api/wasl/couriers", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							ownerRef: Ce.ref,
							ownerType: "company",
							ownerName: Ce.name,
							name: D.trim(),
							phone: T,
							zone: P.trim() || "وسط البلد",
						}),
					})
						.then((ee) => ee.json())
						.then((ee) => {
							ee && ee.ok
								? (o(
										"اتبعتت دعوة الانضمام لـ " +
											ee.courier.name +
											" — كود التفعيل: " +
											ee.courier.inviteCode,
									),
									I(!1),
									x(""),
									H(""),
									Qt((Na) => Na + 1))
								: ee && ee.error === "courier_exists"
									? o("هذا المندوب مسجل لديكم بالفعل بنفس الرقم")
									: o("تعذر إرسال الدعوة — حاول مرة أخرى");
						})
						.catch(() => o("تعذر الاتصال بالخادم"))
						.finally(() => nt(!1)));
			},
			_ = Gu.trim(),
			M = (T) => {
				let ee = re.filter(
					(Na) => Na.courier === T.name && Na.status === "delivered",
				).length;
				return n.payModel.type === "per_order"
					? ee * (n.payModel.value || 0)
					: 0;
			};
		return (0, s.jsxs)(s.Fragment, {
			children: [
				(0, s.jsxs)(De, {
					title: "مناديبنا",
					sub: `${J && N.length ? N.length + " مندوب مسجل رسميًا" : ya.length + " مندوب (استعراض)"} — سجّلوا مناديبكم برقم الموبايل وستصلهم دعوة فورية`,
					children: [
						(0, s.jsx)(Dm, {
							value: Gu,
							onChange: vf,
							placeholder: "بحث بالاسم أو المنطقة…",
						}),
						(0, s.jsxs)("button", {
							className: "btn btn-p btn-sm",
							onClick: () => I(!0),
							children: [(0, s.jsx)(S, { n: "plus", s: 14 }), " تسجيل مندوب"],
						}),
					],
				}),
				(0, s.jsx)(ld, { down: ba === !1, onRetry: Xa }),
				xl,
				(0, s.jsx)("div", { style: { height: 14 } }),
				(0, s.jsxs)("div", {
					className: "grid g4",
					style: { marginBottom: 16 },
					children: [
						(0, s.jsx)(he, {
							icon: "bike",
							color: "#7c3aed",
							bg: "#f1eafd",
							val: J && N.length ? N.length : ya.length,
							label: "إجمالي المناديب",
						}),
						(0, s.jsx)(he, {
							icon: "wifi",
							color: "#059669",
							bg: "#e7f6ef",
							val:
								J && N.length
									? N.filter((T) => T.status === "active").length
									: ya.filter((T) => T.status === "free").length,
							label: J && N.length ? "نشطون رسميًا" : "جاهزون الآن",
						}),
						(0, s.jsx)(he, {
							icon: "clock",
							color: "#d97706",
							bg: "#fef3e2",
							val: N.filter((T) => T.status === "invited").length,
							label: "بانتظار التفعيل",
						}),
						(0, s.jsx)(he, {
							icon: "wallet",
							color: "#2563eb",
							bg: "#e8effd",
							val: se(
								J && N.length
									? N.reduce((T, ee) => T + M(ee), 0)
									: ya.reduce((T, ee) => T + ee.earn, 0),
							),
							label: "أجور مستحقة",
						}),
					],
				}),
				J &&
					N.length > 0 &&
					(0, s.jsxs)(F, {
						pad: !1,
						title: "مناديبكم المسجلون رسميًا في Super X",
						action: (0, s.jsx)(Om, {
							text: N.filter((T) => T.status === "invited")
								.map((T) => T.name + ": " + T.inviteCode)
								.join("، "),
							toast: o,
							label: "نسخ كل أكواد التفعيل",
						}),
						children: [
							(0, s.jsxs)("table", {
								className: "tbl",
								children: [
									(0, s.jsx)("thead", {
										children: (0, s.jsxs)("tr", {
											children: [
												(0, s.jsx)("th", {
													children: "المندوب",
												}),
												(0, s.jsx)("th", {
													children: "الموبايل",
												}),
												(0, s.jsx)("th", {
													children: "المنطقة",
												}),
												(0, s.jsx)("th", {
													children: "الحالة",
												}),
												(0, s.jsx)("th", {
													children: "كود التفعيل",
												}),
												(0, s.jsx)("th", {
													children: "مستحقات فورية",
												}),
												(0, s.jsx)("th", {}),
											],
										}),
									}),
									(0, s.jsx)("tbody", {
										children: N.map((T) => {
											let ee = M(T);
											return (0, s.jsxs)(
												"tr",
												{
													children: [
														(0, s.jsx)("td", {
															children: (0, s.jsxs)("div", {
																className: "row",
																style: { gap: 9 },
																children: [
																	(0, s.jsx)(lt, { name: T.name, size: 30 }),
																	(0, s.jsx)("b", { children: T.name }),
																],
															}),
														}),
														(0, s.jsx)("td", {
															className: "sub",
															children: T.phone,
														}),
														(0, s.jsx)("td", {
															className: "sub",
															children: T.zone,
														}),
														(0, s.jsx)("td", {
															children: (0, s.jsx)(E, {
																c:
																	T.status === "active" ? "b-green" : "b-amber",
																blink: T.status !== "active",
																children:
																	T.status === "active"
																		? "نشط"
																		: "بانتظار التفعيل",
															}),
														}),
														(0, s.jsx)("td", {
															children:
																T.status === "invited"
																	? (0, s.jsxs)("div", {
																			className: "row",
																			style: { gap: 6 },
																			children: [
																				(0, s.jsx)("span", {
																					className: "tag",
																					children: T.inviteCode,
																				}),
																				(0, s.jsx)(Om, {
																					text: T.inviteCode,
																					toast: o,
																					label: "نسخ",
																				}),
																			],
																		})
																	: "—",
														}),
														(0, s.jsx)("td", {
															className: "main-cell",
															children: (0, s.jsx)("b", {
																style: { color: "var(--violet)" },
																children: se(ee),
															}),
														}),
														(0, s.jsx)("td", {
															children: (0, s.jsxs)("button", {
																className: "btn btn-o btn-sm",
																disabled: Te,
																onClick: () => Wo(T.name, ee),
																children: [
																	(0, s.jsx)(S, { n: "check", s: 13 }),
																	" ",
																	ve[T.name] ? "تمت ✓" : "تسوية",
																],
															}),
														}),
													],
												},
												T.ref,
											);
										}),
									}),
								],
							}),
							(0, s.jsx)("div", {
								style: { padding: "12px 18px" },
								children: (0, s.jsxs)("div", {
									className: "note",
									children: [
										(0, s.jsx)(S, { n: "mail" }),
										" المندوب يفعّل عضويته من \xABتطبيق المندوب\xBB برقمه وكود الدعوة — وبعد التفعيل يظهر تلقائيًا في لوحة التوزيع.",
									],
								}),
							}),
						],
					}),
				(0, s.jsx)("div", { style: { height: 16 } }),
				(0, s.jsxs)(F, {
					pad: !1,
					title: "طريقة دفع مناديبنا — أنت من يحددها",
					action: (0, s.jsx)(E, {
						c: "b-blue",
						icon: "cash",
						children:
							n.payModel.type === "per_order"
								? (n.payModel.value || 0) + " ج لكل طلب"
								: (n.payModel.value || 0) + "% من رسوم كل طلب",
					}),
					children: [
						(0, s.jsxs)("div", {
							className: "row",
							style: { gap: 10, marginBottom: 12, flexWrap: "wrap" },
							children: [
								[
									["per_order", "لكل طلب", "zap"],
									["split", "نسبة من الطلب", "trend"],
								].map(([T, ee, Na]) =>
									(0, s.jsxs)(
										"button",
										{
											onClick: () =>
												i({ ...n, payModel: { ...n.payModel, type: T } }),
											className: "btn btn-o",
											style: {
												flex: 1,
												minWidth: 150,
												borderColor:
													n.payModel.type === T
														? "var(--violet)"
														: "var(--line)",
												color: n.payModel.type === T ? "#6d28d9" : "var(--mut)",
												background:
													n.payModel.type === T ? "var(--violetSoft)" : "#fff",
											},
											children: [(0, s.jsx)(S, { n: Na, s: 15 }), " ", ee],
										},
										T,
									),
								),
								(0, s.jsx)("input", {
									className: "inp",
									type: "number",
									style: { width: 120 },
									value: n.payModel.value || "",
									onChange: (T) =>
										i({
											...n,
											payModel: {
												...n.payModel,
												value: +T.target.value || 0,
											},
										}),
								}),
								(0, s.jsx)("span", {
									className: "sub",
									children: n.payModel.type === "per_order" ? "ج/طلب" : "%",
								}),
							],
						}),
						(0, s.jsxs)("div", {
							className: "note",
							children: [
								(0, s.jsx)(S, { n: "info" }),
								" هذا ما يستلمه المندوب من طلبات عملائكم — الرسوم المحصلة من العميل تُسوى معكم أسبوعيًا، وتُسدَّد لمناديبكم من تسوية التالية.",
							],
						}),
						!J &&
							(0, s.jsxs)(s.Fragment, {
								children: [
									(0, s.jsx)("div", { style: { height: 14 } }),
									(0, s.jsxs)("table", {
										className: "tbl",
										children: [
											(0, s.jsx)("thead", {
												children: (0, s.jsxs)("tr", {
													children: [
														(0, s.jsx)("th", {
															children: "المندوب",
														}),
														(0, s.jsx)("th", {
															children: "طلبات مكتملة (استعراض)",
														}),
														(0, s.jsx)("th", {
															children: "المستحق له",
														}),
														(0, s.jsx)("th", {}),
													],
												}),
											}),
											(0, s.jsx)("tbody", {
												children: ya.slice(0, 6).map((T) => {
													let ee = l.filter(
															(Da) =>
																Da.courier === T.name &&
																Da.status === "delivered",
														),
														Na =
															n.payModel.type === "per_order"
																? ee.length * (n.payModel.value || 0)
																: ee.reduce(
																		(Da, Vu) =>
																			Da +
																			Math.round(
																				((Vu.fee || 0) *
																					(n.payModel.value || 0)) /
																					100,
																			),
																		0,
																	);
													return (0, s.jsxs)(
														"tr",
														{
															children: [
																(0, s.jsx)("td", {
																	children: (0, s.jsxs)("div", {
																		className: "row",
																		style: { gap: 9 },
																		children: [
																			(0, s.jsx)(lt, {
																				name: T.name,
																				size: 30,
																			}),
																			(0, s.jsx)("b", { children: T.name }),
																		],
																	}),
																}),
																(0, s.jsx)("td", {
																	className: "main-cell",
																	children: ee.length,
																}),
																(0, s.jsx)("td", {
																	className: "main-cell",
																	children: (0, s.jsx)("b", {
																		style: { color: "var(--violet)" },
																		children: se(Na),
																	}),
																}),
																(0, s.jsx)("td", {
																	children: (0, s.jsxs)("button", {
																		className: "btn btn-o btn-sm",
																		disabled: Te,
																		onClick: () => Wo(T.name, Na),
																		children: [
																			(0, s.jsx)(S, { n: "check", s: 13 }),
																			" ",
																			ve[T.name]
																				? "تمت ✓ " + ve[T.name]
																				: "تم التسوية",
																		],
																	}),
																}),
															],
														},
														T.id,
													);
												}),
											}),
										],
									}),
								],
							}),
					],
				}),
				(0, s.jsx)("div", { style: { height: 16 } }),
				(0, s.jsx)(F, {
					pad: !1,
					title: "فريق التوصيل — العرض التفصيلي",
					action: (0, s.jsx)(hl, {}),
					children: (0, s.jsxs)("table", {
						className: "tbl",
						children: [
							(0, s.jsx)("thead", {
								children: (0, s.jsxs)("tr", {
									children: [
										(0, s.jsx)("th", {
											children: "المندوب",
										}),
										(0, s.jsx)("th", {
											children: "الموبايل",
										}),
										(0, s.jsx)("th", {
											children: "المركبة",
										}),
										(0, s.jsx)("th", {
											children: "المنطقة",
										}),
										(0, s.jsx)("th", {
											children: "التقييم",
										}),
										(0, s.jsx)("th", {
											children: "رحلات الشهر",
										}),
										(0, s.jsx)("th", {
											children: "مستحقات",
										}),
										(0, s.jsx)("th", {
											children: "الحالة",
										}),
										(0, s.jsx)("th", {}),
									],
								}),
							}),
							(0, s.jsx)("tbody", {
								children: ya
									.filter(
										(T) =>
											!_ || (T.name + " " + T.zone + " " + T.phone).includes(_),
									)
									.map((T) =>
										(0, s.jsxs)(
											"tr",
											{
												children: [
													(0, s.jsx)("td", {
														children: (0, s.jsxs)("div", {
															className: "row",
															style: { gap: 9 },
															children: [
																(0, s.jsx)(lt, { name: T.name, size: 32 }),
																(0, s.jsx)("b", { children: T.name }),
															],
														}),
													}),
													(0, s.jsx)("td", {
														className: "sub",
														children: T.phone,
													}),
													(0, s.jsxs)("td", {
														className: "sub",
														children: [
															(0, s.jsx)(S, {
																n: T.vehicle === "car" ? "car" : "bike",
																s: 14,
															}),
															" ",
															nd[T.vehicle],
														],
													}),
													(0, s.jsx)("td", {
														className: "sub",
														children: T.zone,
													}),
													(0, s.jsx)("td", {
														children: (0, s.jsxs)("span", {
															style: { fontWeight: 800, color: "#d97706" },
															children: ["★ ", T.rating],
														}),
													}),
													(0, s.jsx)("td", {
														className: "main-cell",
														children: T.trips,
													}),
													(0, s.jsx)("td", {
														className: "main-cell",
														children: se(T.earn),
													}),
													(0, s.jsx)("td", {
														children: (0, s.jsx)(E, {
															c:
																T.status === "free"
																	? "b-green"
																	: T.status === "busy"
																		? "b-amber"
																		: "b-gray",
															children:
																T.status === "free"
																	? "جاهز"
																	: T.status === "busy"
																		? "مشغول"
																		: "غير متصل",
														}),
													}),
													(0, s.jsx)("td", {
														children: (0, s.jsxs)("button", {
															className: "btn btn-o btn-sm",
															children: [
																(0, s.jsx)(S, { n: "route", s: 13 }),
																" تتبع",
															],
														}),
													}),
												],
											},
											T.id,
										),
									),
							}),
						],
					}),
				}),
				C &&
					(0, s.jsxs)(Zo, {
						title: "تسجيل مندوب جديد",
						onClose: () => I(!1),
						footer: (0, s.jsxs)(s.Fragment, {
							children: [
								(0, s.jsxs)("button", {
									className: "btn btn-p",
									disabled: Te,
									onClick: m,
									children: [
										(0, s.jsx)(S, { n: "send", s: 14 }),
										" إرسال دعوة الانضمام",
									],
								}),
								(0, s.jsx)("button", {
									className: "btn btn-o",
									onClick: () => I(!1),
									children: "إلغاء",
								}),
							],
						}),
						children: [
							(0, s.jsxs)("div", {
								className: "field",
								style: { marginBottom: 12 },
								children: [
									(0, s.jsx)("label", {
										children: "حساب شركتكم المسجل",
									}),
									(0, s.jsx)("div", {
										className: "select",
										children: (0, s.jsxs)("select", {
											className: "inp",
											value: J,
											onChange: (T) => Ko(T.target.value),
											children: [
												(0, s.jsx)("option", {
													value: "",
													children: "— اختاروا من الشركات المسجلة —",
												}),
												ge.map((T) =>
													(0, s.jsxs)(
														"option",
														{
															value: T.ref,
															children: [
																T.name,
																" — ",
																T.phone,
																" (",
																T.zone,
																")",
															],
														},
														T.ref,
													),
												),
											],
										}),
									}),
								],
							}),
							(0, s.jsxs)("div", {
								className: "grid g2",
								style: { gap: 14 },
								children: [
									(0, s.jsxs)("div", {
										className: "field",
										children: [
											(0, s.jsx)("label", {
												children: "اسم المندوب",
											}),
											(0, s.jsx)("input", {
												className: "inp",
												value: D,
												onChange: (T) => H(T.target.value),
												placeholder: "الاسم الكامل",
											}),
										],
									}),
									(0, s.jsxs)("div", {
										className: "field",
										children: [
											(0, s.jsx)("label", {
												children: "رقم الموبايل",
											}),
											(0, s.jsx)("input", {
												className: "inp",
												value: h,
												onChange: (T) => x(T.target.value),
												placeholder: "01xxxxxxxxx",
												inputMode: "tel",
											}),
										],
									}),
									(0, s.jsxs)("div", {
										className: "field",
										children: [
											(0, s.jsx)("label", {
												children: "المركبة",
											}),
											(0, s.jsx)("div", {
												className: "select",
												children: (0, s.jsxs)("select", {
													className: "inp",
													children: [
														(0, s.jsx)("option", {
															children: "دراجة نارية",
														}),
														(0, s.jsx)("option", {
															children: "دراجة كهربائية",
														}),
														(0, s.jsx)("option", {
															children: "سيارة",
														}),
													],
												}),
											}),
										],
									}),
									(0, s.jsxs)("div", {
										className: "field",
										children: [
											(0, s.jsx)("label", {
												children: "منطقة العمل",
											}),
											(0, s.jsx)("div", {
												className: "select",
												children: (0, s.jsx)("select", {
													className: "inp",
													value: P,
													onChange: (T) => fe(T.target.value),
													children: ud.map((T) =>
														(0, s.jsx)("option", { children: T }, T),
													),
												}),
											}),
										],
									}),
								],
							}),
							(0, s.jsxs)("div", {
								className: "note",
								style: { marginTop: 16 },
								children: [
									(0, s.jsx)(S, { n: "mail" }),
									" تُرسل الدعوة بكود تفعيل — يفعّل المندوب عضويته من \xABتطبيق المندوب\xBB برقمه والكود، وبذلك ينضم لفريقكم رسميًا.",
								],
							}),
						],
					}),
			],
		});
	}
	if (e === "clients") {
		let m = () => {
				if (!Ce) {
					o("اختاروا حساب شركتكم المسجل من الشريط الأعلى أولًا");
					return;
				}
				if (b.trim().length < 3) {
					o("أدخل اسم النشاط التجاري");
					return;
				}
				let M = W.replace(/\s+/g, "");
				if (M.length < 8) {
					o("أدخل رقم تواصل صحيح");
					return;
				}
				(nt(!0),
					apiFetch("/api/wasl/clients", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							companyRef: Ce.ref,
							companyName: Ce.name,
							merchantName: b.trim(),
							phone: M,
							zone: aa.trim() || "وسط البلد",
						}),
					})
						.then((T) => T.json())
						.then((T) => {
							T && T.ok
								? (o(
										"اتسجلت دعوة العميل " +
											T.invite.merchantName +
											" — " +
											T.invite.ref,
									),
									v(!1),
									c(""),
									na(""),
									Qt((ee) => ee + 1))
								: T && T.error === "invite_pending"
									? o("فيه دعوة معلّقة لنفس الرقم بالفعل")
									: o("تعذر إرسال الدعوة — حاول مرة أخرى");
						})
						.catch(() => o("تعذر الاتصال بالخادم"))
						.finally(() => nt(!1)));
			},
			_ = (M) => {
				(nt(!0),
					apiFetch("/api/wasl/clients/resend", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ ref: M }),
					})
						.then((T) => T.json())
						.then((T) => {
							T && T.ok
								? (o(
										"اتعيد إرسال الدعوة " +
											M +
											" — المرة رقم " +
											T.invite.sentCount,
									),
									Qt((ee) => ee + 1))
								: o("تعذر إعادة الإرسال — حاول مرة أخرى");
						})
						.catch(() => o("تعذر الاتصال بالخادم"))
						.finally(() => nt(!1)));
			};
		return (0, s.jsxs)(s.Fragment, {
			children: [
				(0, s.jsx)(De, {
					title: "العملاء والدعوات",
					sub: "المطاعم والصيدليات المتعاقدة معكم — ودعواتكم الجديدة",
					children: (0, s.jsxs)("button", {
						className: "btn btn-p btn-sm",
						onClick: () => v(!0),
						children: [(0, s.jsx)(S, { n: "mail", s: 14 }), " دعوة عميل جديد"],
					}),
				}),
				(0, s.jsx)(ld, { down: ba === !1, onRetry: Xa }),
				xl,
				(0, s.jsx)("div", { style: { height: 14 } }),
				(0, s.jsxs)("div", {
					className: "grid g4",
					style: { marginBottom: 16 },
					children: [
						(0, s.jsx)(he, {
							icon: "users",
							color: "#2563eb",
							bg: "#e8effd",
							val: J ? Kt.length : mf.clients,
							label: J ? "عملاء مقبولون (حقيقي)" : "عميل متعاقد",
						}),
						(0, s.jsx)(he, {
							icon: "mail",
							color: "#d97706",
							bg: "#fef3e2",
							val: J
								? ae.filter((M) => M.status === "pending").length
								: Rm.filter((M) => M.status === "pending").length,
							label: "دعوة معلّقة",
						}),
						(0, s.jsx)(he, {
							icon: "box",
							color: "#0f766e",
							bg: "#e6f7f4",
							val: re.length ? re.length : (mf.orders / 1e3).toFixed(1) + "K",
							label: re.length
								? "طلب عبر المنصة (حقيقي)"
								: "طلب شهري من العملاء",
						}),
						(0, s.jsx)(he, {
							icon: "percent",
							color: "#7c3aed",
							bg: "#f1eafd",
							val:
								J && ae.length
									? Math.round(
											(100 * ae.filter((M) => M.status === "accepted").length) /
												ae.length,
										) + "%"
									: "92%",
							label: "نسبة قبول الدعوات",
						}),
					],
				}),
				(0, s.jsx)(F, {
					pad: !1,
					title: "دعوات الانضمام",
					children: J
						? ae.length === 0
							? (0, s.jsx)(qu, {
									icon: "mail",
									title: "لا توجد دعوات بعد",
									sub: "استخدموا زر \xABدعوة عميل جديد\xBB أعلاه — الدعوة توصل للعميل فورًا.",
								})
							: (0, s.jsxs)("table", {
									className: "tbl",
									children: [
										(0, s.jsx)("thead", {
											children: (0, s.jsxs)("tr", {
												children: [
													(0, s.jsx)("th", {
														children: "النشاط التجاري",
													}),
													(0, s.jsx)("th", {
														children: "الموبايل",
													}),
													(0, s.jsx)("th", {
														children: "المنطقة",
													}),
													(0, s.jsx)("th", {
														children: "مرات الإرسال",
													}),
													(0, s.jsx)("th", {
														children: "الحالة",
													}),
													(0, s.jsx)("th", {}),
												],
											}),
										}),
										(0, s.jsx)("tbody", {
											children: ae.map((M) =>
												(0, s.jsxs)(
													"tr",
													{
														children: [
															(0, s.jsx)("td", {
																children: (0, s.jsxs)("div", {
																	className: "row",
																	style: { gap: 9 },
																	children: [
																		(0, s.jsx)("div", {
																			className: "ico",
																			style: {
																				width: 32,
																				height: 32,
																				background: "var(--blueSoft)",
																				color: "var(--blue)",
																			},
																			children: (0, s.jsx)(S, {
																				n: "store",
																				s: 14,
																			}),
																		}),
																		(0, s.jsx)("b", {
																			children: M.merchantName,
																		}),
																	],
																}),
															}),
															(0, s.jsx)("td", {
																className: "sub",
																children: M.phone,
															}),
															(0, s.jsx)("td", {
																className: "sub",
																children: M.zone,
															}),
															(0, s.jsx)("td", {
																className: "sub",
																children: M.sentCount,
															}),
															(0, s.jsx)("td", {
																children: (0, s.jsx)(E, {
																	c:
																		M.status === "accepted"
																			? "b-green"
																			: M.status === "pending"
																				? "b-amber"
																				: "b-red",
																	blink: M.status === "pending",
																	children:
																		M.status === "accepted"
																			? "قَبِل الدعوة"
																			: M.status === "pending"
																				? "بانتظار الرد"
																				: "اعتذر",
																}),
															}),
															(0, s.jsx)("td", {
																children:
																	M.status === "pending"
																		? (0, s.jsxs)("button", {
																				className: "btn btn-o btn-sm",
																				disabled: Te,
																				onClick: () => _(M.ref),
																				children: [
																					(0, s.jsx)(S, {
																						n: "refresh",
																						s: 13,
																					}),
																					" إعادة الإرسال",
																				],
																			})
																		: null,
															}),
														],
													},
													M.ref,
												),
											),
										}),
									],
								})
						: (0, s.jsxs)("div", {
								children: [
									(0, s.jsx)("div", {
										style: { padding: "12px 18px" },
										children: (0, s.jsxs)("div", {
											className: "note warn",
											children: [
												(0, s.jsx)(S, { n: "alert" }),
												" اختاروا حساب شركتكم المسجل من الشريط الأعلى لعرض دعواتكم الحقيقية وإدارتها — ما يظهر الآن استعراضي.",
											],
										}),
									}),
									(0, s.jsxs)("table", {
										className: "tbl",
										children: [
											(0, s.jsx)("thead", {
												children: (0, s.jsxs)("tr", {
													children: [
														(0, s.jsx)("th", {
															children: "النشاط التجاري",
														}),
														(0, s.jsx)("th", {
															children: "المنطقة",
														}),
														(0, s.jsx)("th", {
															children: "تاريخ الإرسال",
														}),
														(0, s.jsx)("th", {
															children: "الحالة",
														}),
													],
												}),
											}),
											(0, s.jsx)("tbody", {
												children: Rm.map((M) =>
													(0, s.jsxs)(
														"tr",
														{
															children: [
																(0, s.jsx)("td", {
																	children: (0, s.jsxs)("div", {
																		className: "row",
																		style: { gap: 9 },
																		children: [
																			(0, s.jsx)("div", {
																				className: "ico",
																				style: {
																					width: 32,
																					height: 32,
																					background: "var(--blueSoft)",
																					color: "var(--blue)",
																				},
																				children: (0, s.jsx)(S, {
																					n: "store",
																					s: 14,
																				}),
																			}),
																			(0, s.jsx)("b", {
																				children: M.merchant,
																			}),
																		],
																	}),
																}),
																(0, s.jsx)("td", {
																	className: "sub",
																	children: M.zone,
																}),
																(0, s.jsx)("td", {
																	className: "sub",
																	children: M.sent,
																}),
																(0, s.jsx)("td", {
																	children: (0, s.jsx)(E, {
																		c:
																			M.status === "accepted"
																				? "b-green"
																				: M.status === "pending"
																					? "b-amber"
																					: "b-red",
																		children:
																			M.status === "accepted"
																				? "قَبِل الدعوة"
																				: M.status === "pending"
																					? "بانتظار الرد"
																					: "اعتذر",
																	}),
																}),
															],
														},
														M.id,
													),
												),
											}),
										],
									}),
								],
							}),
				}),
				(0, s.jsx)("div", { style: { height: 16 } }),
				Kt.length > 0 &&
					(0, s.jsxs)(F, {
						pad: !1,
						title: "عملاؤكم المقبولون — أنشطة تابعة لشركتكم رسميًا",
						action: (0, s.jsxs)(E, {
							c: "b-green",
							children: [Kt.length, " عميل"],
						}),
						children: [
							(0, s.jsxs)("table", {
								className: "tbl",
								children: [
									(0, s.jsx)("thead", {
										children: (0, s.jsxs)("tr", {
											children: [
												(0, s.jsx)("th", {
													children: "النشاط التجاري",
												}),
												(0, s.jsx)("th", {
													children: "الموبايل",
												}),
												(0, s.jsx)("th", {
													children: "المنطقة",
												}),
												(0, s.jsx)("th", {
													children: "تاريخ القبول",
												}),
												(0, s.jsx)("th", {
													children: "طلبات عبر المنصة",
												}),
												(0, s.jsx)("th", {
													children: "الحالة",
												}),
											],
										}),
									}),
									(0, s.jsx)("tbody", {
										children: Kt.map((M) => {
											let T = k.filter(
												(ee) => ee.merchant === M.merchantName,
											).length;
											return (0, s.jsxs)(
												"tr",
												{
													children: [
														(0, s.jsx)("td", {
															children: (0, s.jsxs)("div", {
																className: "row",
																style: { gap: 9 },
																children: [
																	(0, s.jsx)("div", {
																		className: "ico",
																		style: {
																			width: 32,
																			height: 32,
																			background: "var(--greenSoft)",
																			color: "var(--green)",
																		},
																		children: (0, s.jsx)(S, {
																			n: "store",
																			s: 14,
																		}),
																	}),
																	(0, s.jsx)("b", {
																		children: M.merchantName,
																	}),
																],
															}),
														}),
														(0, s.jsx)("td", {
															className: "sub",
															children: M.phone,
														}),
														(0, s.jsx)("td", {
															className: "sub",
															children: M.zone,
														}),
														(0, s.jsx)("td", {
															className: "sub",
															children: M.respondedAt
																? new Date(M.respondedAt).toLocaleDateString(
																		"ar-EG",
																	)
																: "—",
														}),
														(0, s.jsx)("td", {
															className: "main-cell",
															children: T,
														}),
														(0, s.jsx)("td", {
															children: (0, s.jsx)(E, {
																c: "b-green",
																icon: "check",
																children: "عميل لكم",
															}),
														}),
													],
												},
												M.ref,
											);
										}),
									}),
								],
							}),
							(0, s.jsx)("div", {
								style: { padding: "12px 18px" },
								children: (0, s.jsxs)("div", {
									className: "note",
									children: [
										(0, s.jsx)(S, { n: "info" }),
										" كل طلب يسجّله أي نشاط من دول عبر المنصة يظهر تلقائيًا في \xABالطلبات\xBB و\xABلوحة التوزيع\xBB باسم شركتكم — وتسندوه لمناديبكم بأنفسكم.",
									],
								}),
							}),
						],
					}),
				(0, s.jsx)("div", { style: { height: 16 } }),
				(0, s.jsxs)(F, {
					pad: !1,
					title: "دليل الأنشطة التجارية على المنصة",
					action: (0, s.jsxs)(E, {
						c: "b-blue",
						children: [za.length, " نشاط مسجل"],
					}),
					children: [
						za.length === 0
							? (0, s.jsx)(qu, {
									icon: "store",
									title: "لا توجد أنشطة مسجلة على المنصة بعد",
									sub: "أول ما أي مطعم أو صيدلية يسجل من صفحة \xABتسجيل جديد\xBB هيظهر هنا فورًا مع زر دعوة جاهز.",
								})
							: (0, s.jsxs)("table", {
									className: "tbl",
									children: [
										(0, s.jsx)("thead", {
											children: (0, s.jsxs)("tr", {
												children: [
													(0, s.jsx)("th", {
														children: "النشاط",
													}),
													(0, s.jsx)("th", {
														children: "النوع",
													}),
													(0, s.jsx)("th", {
														children: "المحافظة / المنطقة",
													}),
													(0, s.jsx)("th", {
														children: "الموبايل",
													}),
													(0, s.jsx)("th", {
														children: "العلاقة بشركتكم",
													}),
													(0, s.jsx)("th", {}),
												],
											}),
										}),
										(0, s.jsx)("tbody", {
											children: za.map((M) => {
												let T = ae.some(
														(Da) =>
															Da.phone === M.phone && Da.status === "accepted",
													),
													ee = ae.find(
														(Da) =>
															Da.phone === M.phone && Da.status === "pending",
													),
													Na = T
														? (0, s.jsx)(E, {
																c: "b-green",
																icon: "check",
																children: "عميل لكم",
															})
														: ee
															? (0, s.jsx)(E, {
																	c: "b-amber",
																	blink: !0,
																	children: "دعوة معلقة",
																})
															: (0, s.jsx)(E, {
																	c: "b-gray",
																	children: "غير مدعو",
																});
												return (0, s.jsxs)(
													"tr",
													{
														children: [
															(0, s.jsx)("td", {
																children: (0, s.jsxs)("div", {
																	className: "row",
																	style: { gap: 9 },
																	children: [
																		(0, s.jsx)("div", {
																			className: "ico",
																			style: {
																				width: 32,
																				height: 32,
																				background: "var(--blueSoft)",
																				color: "var(--blue)",
																			},
																			children: (0, s.jsx)(S, {
																				n: "store",
																				s: 14,
																			}),
																		}),
																		(0, s.jsx)("b", { children: M.name }),
																	],
																}),
															}),
															(0, s.jsx)("td", {
																className: "sub",
																children: M.businessType || "نشاط تجاري",
															}),
															(0, s.jsxs)("td", {
																className: "sub",
																children: [M.governorate, " — ", M.zone],
															}),
															(0, s.jsx)("td", {
																className: "sub",
																children: M.phone,
															}),
															(0, s.jsx)("td", { children: Na }),
															(0, s.jsx)("td", {
																children: T
																	? (0, s.jsx)(E, {
																			c: "b-teal",
																			children: "طلبوه تلقائيًا",
																		})
																	: ee
																		? (0, s.jsxs)("button", {
																				className: "btn btn-o btn-sm",
																				disabled: Te,
																				onClick: () => _(ee.ref),
																				children: [
																					(0, s.jsx)(S, {
																						n: "refresh",
																						s: 12,
																					}),
																					" إعادة الإرسال",
																				],
																			})
																		: (0, s.jsxs)("button", {
																				className: "btn btn-p btn-sm",
																				onClick: () => {
																					(c(M.name),
																						na(M.phone),
																						Ia(M.zone || "وسط البلد"),
																						v(!0));
																				},
																				children: [
																					(0, s.jsx)(S, { n: "mail", s: 12 }),
																					" دعوة",
																				],
																			}),
															}),
														],
													},
													M.ref,
												);
											}),
										}),
									],
								}),
						(0, s.jsx)("div", {
							style: { padding: "12px 18px" },
							children: (0, s.jsxs)("div", {
								className: "note",
								children: [
									(0, s.jsx)(S, { n: "mail" }),
									" لما النشاط يقبل دعوتكم — أو يسجل بنفس رقم الموبايل المُدعو — بيبقى عميل رسمي لشركتكم وطلباته ترتبط بكم تلقائيًا.",
								],
							}),
						}),
					],
				}),
				V &&
					(0, s.jsxs)(Zo, {
						title: "دعوة عميل جديد",
						onClose: () => v(!1),
						footer: (0, s.jsxs)(s.Fragment, {
							children: [
								(0, s.jsxs)("button", {
									className: "btn btn-p",
									disabled: Te,
									onClick: m,
									children: [
										(0, s.jsx)(S, { n: "send", s: 14 }),
										" إرسال الدعوة",
									],
								}),
								(0, s.jsx)("button", {
									className: "btn btn-o",
									onClick: () => v(!1),
									children: "إلغاء",
								}),
							],
						}),
						children: [
							(0, s.jsxs)("div", {
								className: "field",
								style: { marginBottom: 12 },
								children: [
									(0, s.jsx)("label", {
										children: "حساب شركتكم المسجل (صاحب الدعوات)",
									}),
									(0, s.jsx)("div", {
										className: "select",
										children: (0, s.jsxs)("select", {
											className: "inp",
											value: J,
											onChange: (M) => Ko(M.target.value),
											children: [
												(0, s.jsx)("option", {
													value: "",
													children: "— اختاروا من الشركات المسجلة —",
												}),
												ge.map((M) =>
													(0, s.jsxs)(
														"option",
														{
															value: M.ref,
															children: [M.name, " — ", M.phone],
														},
														M.ref,
													),
												),
											],
										}),
									}),
								],
							}),
							(0, s.jsxs)("div", {
								className: "grid g2",
								style: { gap: 14 },
								children: [
									(0, s.jsxs)("div", {
										className: "field",
										children: [
											(0, s.jsx)("label", {
												children: "اسم النشاط التجاري",
											}),
											(0, s.jsx)("input", {
												className: "inp",
												value: b,
												onChange: (M) => c(M.target.value),
												placeholder: "مطعم / صيدلية / سوبر ماركت",
											}),
										],
									}),
									(0, s.jsxs)("div", {
										className: "field",
										children: [
											(0, s.jsx)("label", {
												children: "رقم التواصل",
											}),
											(0, s.jsx)("input", {
												className: "inp",
												value: W,
												onChange: (M) => na(M.target.value),
												placeholder: "01xxxxxxxxx",
												inputMode: "tel",
											}),
										],
									}),
									(0, s.jsxs)("div", {
										className: "field",
										children: [
											(0, s.jsx)("label", {
												children: "منطقة النشاط",
											}),
											(0, s.jsx)("div", {
												className: "select",
												children: (0, s.jsx)("select", {
													className: "inp",
													value: aa,
													onChange: (M) => Ia(M.target.value),
													children: ud.map((M) =>
														(0, s.jsx)("option", { children: M }, M),
													),
												}),
											}),
										],
									}),
								],
							}),
							(0, s.jsxs)("div", {
								className: "note",
								style: { marginTop: 16 },
								children: [
									(0, s.jsx)(S, { n: "info" }),
									" عند القبول يصبح النشاط تابعًا لشركتكم حصريًا — تُطبَّق رسوم التوصيل الثابتة المحددة في صفحة \xABرسوم التوصيل\xBB وتظهر للعميل تلقائيًا.",
								],
							}),
						],
					}),
			],
		});
	}
	if (e === "fees")
		return (0, s.jsxs)(s.Fragment, {
			children: [
				(0, s.jsx)(De, {
					title: "رسوم التوصيل",
					sub: "تسعير حسب المسافة من مقركم إلى منطقة العميل — تظهر تلقائيًا لعملائكم عند تحديد موقع التوصيل",
					children: (0, s.jsxs)("button", {
						className: "btn btn-p btn-sm",
						disabled: Te,
						onClick: Ll,
						children: [(0, s.jsx)(S, { n: "check", s: 14 }), " حفظ التغييرات"],
					}),
				}),
				xl,
				(0, s.jsx)("div", { style: { height: 14 } }),
				(0, s.jsxs)("div", {
					className: "grid g21",
					children: [
						(0, s.jsx)(F, {
							pad: !1,
							title: "جدول الرسوم حسب المسافة",
							action: (0, s.jsxs)(E, {
								c: "b-violet",
								icon: "pin",
								children: ["مقر الشركة: ", pf],
							}),
							children: (0, s.jsxs)("table", {
								className: "tbl",
								children: [
									(0, s.jsx)("thead", {
										children: (0, s.jsxs)("tr", {
											children: [
												(0, s.jsx)("th", {
													children: "من — إلى",
												}),
												(0, s.jsx)("th", {
													children: "المسافة",
												}),
												(0, s.jsx)("th", {
													children: "النطاق المحسوب",
												}),
												(0, s.jsx)("th", {
													children: "رسومكم المعتمدة (جنيه)",
												}),
												(0, s.jsx)("th", {
													children: "متوسط زمن التوصيل",
												}),
												(0, s.jsx)("th", {
													children: "مناديب مغطون",
												}),
											],
										}),
									}),
									(0, s.jsx)("tbody", {
										children: nf.map((m, _) => {
											let M = df({ merchantZone: pf, destZone: m.zone });
											return (0, s.jsxs)(
												"tr",
												{
													children: [
														(0, s.jsxs)("td", {
															className: "main-cell",
															children: [
																(0, s.jsx)(S, {
																	n: "pin",
																	s: 14,
																	c: "var(--mut)",
																}),
																" من ",
																pf,
																" ",
																(0, s.jsx)("span", {
																	style: { color: "var(--mut)" },
																	children: "إلى",
																}),
																" ",
																m.zone,
															],
														}),
														(0, s.jsx)("td", {
															children: (0, s.jsxs)(E, {
																c: "b-teal",
																children: [M.km, " كم"],
															}),
														}),
														(0, s.jsxs)("td", {
															className: "sub",
															style: { fontSize: 12 },
															children: ["من ", M.min, " إلى ", M.max, " ج"],
														}),
														(0, s.jsx)("td", {
															children: (0, s.jsxs)("div", {
																className: "row",
																style: { gap: 8 },
																children: [
																	(0, s.jsx)("input", {
																		className: "inp",
																		type: "number",
																		style: { width: 90, padding: "7px 10px" },
																		value: g[_],
																		onChange: (T) => {
																			let ee = [...g];
																			((ee[_] = +T.target.value), R(ee));
																		},
																	}),
																	(0, s.jsx)("span", {
																		className: "sub",
																		children: "ج",
																	}),
																],
															}),
														}),
														(0, s.jsxs)("td", {
															className: "sub",
															children: [
																[18, 20, 22, 26, 24, 23, 21][_],
																" دقيقة",
															],
														}),
														(0, s.jsxs)("td", {
															className: "sub",
															children: [[4, 3, 3, 5, 2, 2, 3][_], " مناديب"],
														}),
													],
												},
												m.zone,
											);
										}),
									}),
								],
							}),
						}),
						(0, s.jsxs)("div", {
							className: "grid",
							style: { gap: 16, alignContent: "start" },
							children: [
								(0, s.jsx)(F, {
									title: "كيف يُحسب السعر؟",
									children: [
										[
											"1",
											"من مقركم إلى العميل",
											"المسافة تُحسب من عنوان شركتكم المسجّل (\xAB" +
												pf +
												"\xBB) إلى منطقة التسليم.",
										],
										[
											"2",
											"نطاق \xABمن — إلى\xBB",
											"النطاق يغطي نقطة قريبة ونقطة بعيدة داخل منطقة العميل — تظل رسومكم الثابتة المعتمدة هي السائدة.",
										],
										[
											"3",
											"مندوبكم ينفذ الطلب",
											"المبلغ يُسوّى معكم أسبوعيًا دون أي عمولة من المنصة.",
										],
									].map(([m, _, M]) =>
										(0, s.jsxs)(
											"div",
											{
												className: "row",
												style: {
													gap: 12,
													alignItems: "flex-start",
													padding: "8px 0",
												},
												children: [
													(0, s.jsx)("div", {
														className: "ico",
														style: {
															width: 30,
															height: 30,
															borderRadius: 99,
															background: "var(--violetSoft)",
															color: "var(--violet)",
															fontWeight: 800,
															fontSize: 13,
														},
														children: m,
													}),
													(0, s.jsxs)("div", {
														children: [
															(0, s.jsx)("b", {
																style: { fontSize: 13 },
																children: _,
															}),
															(0, s.jsx)("div", {
																className: "sub",
																style: { fontSize: 11.5 },
																children: M,
															}),
														],
													}),
												],
											},
											m,
										),
									),
								}),
								(0, s.jsxs)(F, {
									title: "متوسط الرسوم الحالية",
									children: [
										(0, s.jsx)("b", {
											style: { fontSize: 24 },
											children: se(
												Math.round(g.reduce((m, _) => m + _, 0) / g.length),
											),
										}),
										(0, s.jsx)("div", {
											className: "sub",
											style: { marginTop: 4 },
											children: "متوسط لكل طلب",
										}),
										(0, s.jsx)(At, {
											data: [38, 40, 41, 43, 45, 46, 47],
											color: "#7c3aed",
											h: 60,
										}),
									],
								}),
							],
						}),
					],
				}),
			],
		});
	if (e === "reports") {
		let m = [
			{
				label: "مكتمل",
				v: xt.filter((_) => _.status === "delivered").length,
				c: "#059669",
			},
			{
				label: "جارٍ",
				v: xt.filter(
					(_) =>
						_.status &&
						!["delivered", "canceled", "searching"].includes(_.status),
				).length,
				c: "#d97706",
			},
			{
				label: "بانتظار",
				v: xt.filter((_) => _.status === "searching").length,
				c: "#7c3aed",
			},
		].filter((_) => _.v > 0);
		return (0, s.jsxs)(s.Fragment, {
			children: [
				(0, s.jsx)(De, {
					title: "التقارير",
					sub: "تحليلات أداء شركة التوصيل — محسوبة من الطلبات الفعلية متى توفرت",
					children: (0, s.jsx)("button", {
						className: "iconbtn",
						title: "تحديث",
						onClick: Xa,
						children: (0, s.jsx)(S, { n: "refresh", s: 16 }),
					}),
				}),
				(0, s.jsxs)("div", {
					className: "grid g2",
					children: [
						(0, s.jsxs)(F, {
							title: "توزيع الطلبات الحالية",
							action: re.length
								? (0, s.jsx)(E, {
										c: "b-teal",
										children: "حقيقي",
									})
								: (0, s.jsx)(hl, {}),
							children: [
								m.length
									? (0, s.jsx)(jo, {
											segs: m,
											center: String(xt.length),
											sub: "إجمالي الطلبات",
										})
									: (0, s.jsx)(qu, {
											icon: "chartpie",
											title: "لا توجد طلبات بعد",
											sub: "أول ما تُسجل طلبات عبر المنصة هتظهر التحليلات هنا تلقائيًا.",
										}),
								(0, s.jsx)("div", { className: "hr" }),
								m.map((_) =>
									(0, s.jsxs)(
										"div",
										{
											className: "kv",
											children: [
												(0, s.jsxs)("span", {
													children: [
														(0, s.jsx)("i", {
															className: "dot8",
															style: {
																background: _.c,
																display: "inline-block",
																marginInlineEnd: 6,
															},
														}),
														_.label,
													],
												}),
												(0, s.jsx)("b", { children: _.v }),
											],
										},
										_.label,
									),
								),
							],
						}),
						(0, s.jsx)(F, {
							title: "أداء المناديب",
							action: (0, s.jsx)(hl, {}),
							pad: !1,
							children: (0, s.jsx)("div", {
								style: { padding: 6 },
								children: [
									["نادر فؤاد", 94],
									["خالد الشناوي", 91],
									["عمرو دياب", 89],
									["إسلام فتحي", 88],
								].map(([_, M]) =>
									(0, s.jsxs)(
										"div",
										{
											style: { padding: "9px 12px" },
											children: [
												(0, s.jsxs)("div", {
													className: "between",
													children: [
														(0, s.jsx)("b", {
															style: { fontSize: 12.5 },
															children: _,
														}),
														(0, s.jsxs)("span", {
															className: "sub",
															children: [M, "% في الوقت"],
														}),
													],
												}),
												(0, s.jsx)("div", {
													className: "progress",
													style: { marginTop: 6 },
													children: (0, s.jsx)("i", {
														style: { width: M + "%", background: "#7c3aed" },
													}),
												}),
											],
										},
										_,
									),
								),
							}),
						}),
					],
				}),
				(0, s.jsx)("div", { style: { height: 16 } }),
				(0, s.jsxs)("div", {
					className: "grid g3",
					children: [
						(0, s.jsxs)(F, {
							title: "رسوم طلباتكم",
							action: k.length
								? (0, s.jsx)(E, {
										c: "b-teal",
										children: "حقيقي",
									})
								: (0, s.jsx)(hl, {}),
							children: [
								(0, s.jsx)("b", {
									style: { fontSize: 22 },
									children: se(
										J
											? k.reduce((_, M) => _ + (M.fee || 0), 0)
											: re.reduce((_, M) => _ + (M.fee || 0), 0),
									),
								}),
								(0, s.jsxs)("div", {
									className: "sub",
									style: { marginTop: 4 },
									children: ["إجمالي رسوم ", J ? k.length : re.length, " طلب"],
								}),
								(0, s.jsxs)("div", {
									className: "note",
									style: { marginTop: 12 },
									children: [
										(0, s.jsx)(S, { n: "wallet" }),
										" المنصة لا تقتطع أي عمولة من هذه المبالغ.",
									],
								}),
							],
						}),
						(0, s.jsx)(F, {
							title: "نشاط آخر 7 أيام",
							action: (0, s.jsx)(hl, {}),
							children: (0, s.jsx)(pl, {
								data: [54, 61, 58, 72, 80, 66, 91],
								labels: [
									"أحد",
									"اثنين",
									"ثلاثاء",
									"أربعاء",
									"خميس",
									"جمعة",
									"سبت",
								],
								color: "#0d9488",
							}),
						}),
						(0, s.jsxs)(F, {
							title: "جودة الخدمة",
							action: (0, s.jsx)(hl, {}),
							children: [
								(0, s.jsxs)("div", {
									className: "kv",
									children: [
										(0, s.jsx)("span", {
											children: "طلبات مكتملة",
										}),
										(0, s.jsx)("b", { children: "98.1%" }),
									],
								}),
								(0, s.jsxs)("div", {
									className: "kv",
									children: [
										(0, s.jsx)("span", {
											children: "إلغاءات",
										}),
										(0, s.jsx)("b", { children: "1.2%" }),
									],
								}),
								(0, s.jsxs)("div", {
									className: "kv",
									children: [
										(0, s.jsx)("span", {
											children: "شكاوى العملاء",
										}),
										(0, s.jsx)("b", { children: "0.7%" }),
									],
								}),
								(0, s.jsxs)("div", {
									className: "kv",
									children: [
										(0, s.jsx)("span", {
											children: "رضا العملاء",
										}),
										(0, s.jsx)("b", {
											style: { color: "var(--green)" },
											children: "4.8 / 5",
										}),
									],
								}),
							],
						}),
					],
				}),
			],
		});
	}
	return e === "sub"
		? (0, s.jsxs)(s.Fragment, {
				children: [
					(0, s.jsx)(De, {
						title: "اشتراكنا",
						sub: "باقة المؤسسية — كل مزايا الإدارة المتقدمة",
					}),
					(0, s.jsxs)("div", {
						className: "grid g21",
						children: [
							(0, s.jsxs)(F, {
								title: "الباقة الحالية",
								children: [
									(0, s.jsxs)("div", {
										className: "row",
										style: { gap: 14, marginBottom: 14 },
										children: [
											(0, s.jsx)("div", {
												className: "ico",
												style: {
													width: 52,
													height: 52,
													background: "var(--violetSoft)",
													color: "var(--violet)",
												},
												children: (0, s.jsx)(S, { n: "award", s: 22 }),
											}),
											(0, s.jsxs)("div", {
												style: { flex: 1 },
												children: [
													(0, s.jsx)("b", {
														style: { fontSize: 17 },
														children: "باقة المؤسسية",
													}),
													(0, s.jsx)("div", {
														className: "sub",
														children:
															"إدارة كاملة لمناديبكم + ربط مع العملاء ودعواتهم + رسوم ثابتة + مدير حساب مخصص",
													}),
												],
											}),
											(0, s.jsx)(E, {
												c: "b-green",
												icon: "check",
												children: "نشط حتى 12 أكتوبر",
											}),
										],
									}),
									(0, s.jsx)("div", { className: "hr" }),
									(0, s.jsx)("div", {
										className: "grid g2",
										style: { gap: 8 },
										children: [
											"مركز توزيع ذكي للمناديب",
											"دعوات عملاء غير محدودة",
											"رسوم ثابتة لكل منطقة",
											"تسويات مالية أسبوعية",
											"تطبيق مندوب بعلامتكم",
											"تكامل API ونظام POS",
										].map((m) =>
											(0, s.jsxs)(
												"div",
												{
													className: "row",
													style: { gap: 8 },
													children: [
														(0, s.jsx)(S, {
															n: "check",
															s: 14,
															c: "var(--violet)",
														}),
														(0, s.jsx)("span", {
															style: { fontSize: 12.5 },
															children: m,
														}),
													],
												},
												m,
											),
										),
									}),
									(0, s.jsx)("div", { className: "hr" }),
									(0, s.jsxs)("div", {
										className: "kv",
										children: [
											(0, s.jsx)("span", {
												children: "قيمة الاشتراك",
											}),
											(0, s.jsx)("b", {
												children: "حسب الاتفاق — تُصرف شهريًا",
											}),
										],
									}),
									(0, s.jsxs)("div", {
										className: "kv",
										children: [
											(0, s.jsx)("span", {
												children: "عمولة المنصة على الطلبات",
											}),
											(0, s.jsx)("b", {
												style: { color: "var(--green)" },
												children: "صفر — دائمًا",
											}),
										],
									}),
								],
							}),
							(0, s.jsxs)(F, {
								title: "فواتير سابقة",
								pad: !1,
								children: [
									(0, s.jsxs)("table", {
										className: "tbl",
										children: [
											(0, s.jsx)("thead", {
												children: (0, s.jsxs)("tr", {
													children: [
														(0, s.jsx)("th", {
															children: "الفاتورة",
														}),
														(0, s.jsx)("th", {
															children: "التاريخ",
														}),
														(0, s.jsx)("th", {
															children: "المبلغ",
														}),
													],
												}),
											}),
											(0, s.jsx)("tbody", {
												children: [
													["INV-C091", "12 سبتمبر", 12400],
													["INV-C078", "12 أغسطس", 12400],
													["INV-C065", "12 يوليو", 12400],
												].map((m) =>
													(0, s.jsxs)(
														"tr",
														{
															children: [
																(0, s.jsx)("td", {
																	className: "main-cell",
																	children: m[0],
																}),
																(0, s.jsx)("td", {
																	className: "sub",
																	children: m[1],
																}),
																(0, s.jsx)("td", {
																	className: "main-cell",
																	children: se(m[2]),
																}),
															],
														},
														m[0],
													),
												),
											}),
										],
									}),
									(0, s.jsx)("div", {
										style: { padding: 12 },
										children: (0, s.jsxs)("div", {
											className: "note",
											children: [
												(0, s.jsx)(S, { n: "headset" }),
												" مدير حسابكم المخصص متاح على مدار الساعة للدعم الفوري.",
											],
										}),
									}),
								],
							}),
						],
					}),
				],
			})
		: null;
}
var ut = ReactNamespace;
var p = jsxRuntime,
	Pm = {
		moto: "دراجة نارية",
		bike: "دراجة كهربائية",
		car: "عربية",
	};
function ty({ c: e, icon: a, children: t }) {
	return (0, p.jsxs)("span", {
		className: "badge " + e,
		children: [a && (0, p.jsx)(S, { n: a, s: 12 }), t],
	});
}
function Vm({ store: e }) {
 const router = useRouter();
	let {
			orders: a,
			courierOn: t,
			setCourierOn: l,
			acceptOrder: u,
			advanceOrder: o,
			toast: n,
		} = e,
		[i, r] = ut.default.useState(() => {
			try {
				return JSON.parse(localStorage.getItem("wasl_courier_acct") || "null");
			} catch {
				return null;
			}
		}),
		[y, C] = ut.default.useState(!0),
		[I, h] = ut.default.useState(!0),
		[x, D] = ut.default.useState({ required: !1, fee: 0 }),
		[H, V] = ut.default.useState("register"),
		[v, b] = ut.default.useState({
			name: "",
			phone: "",
			password: "",
			nationalId: "",
			vehicle: "moto",
			governorate: "",
			zone: "",
		}),
		[c, g] = ut.default.useState(null),
		[R, X] = ut.default.useState(!1),
		[O, P] = ut.default.useState(() => new Set()),
		fe = (k) => {
			try {
				localStorage.setItem("wasl_courier_acct", JSON.stringify(k));
			} catch {}
			r(k);
		},
		W = () => {
			try {
				localStorage.removeItem("wasl_courier_acct");
			} catch {}
			apiFetch("/api/wasl/auth/logout", { method: "POST" }).then(response => { if(response.ok)router.replace("/login"); }).catch(() => n("تعذر تسجيل الخروج؛ حاول مرة أخرى."));
		};
	ut.default.useEffect(() => {
		if (!i || !i.ref) return;
		let k = !0,
			de = () =>
				apiFetch("/api/wasl/courier-auth?ref=" + encodeURIComponent(i.ref))
					.then((ta) => (ta.ok ? ta.json() : null))
					.then((ta) => {
						if (k) {
							if ((h(!0), ta && ta.ok))
								(C(ta.canWork !== !1),
									D({ required: !!ta.subRequired, fee: ta.monthlyFee || 0 }));
							else if (ta && ta.error === "not_found") {
								try {
									localStorage.removeItem("wasl_courier_acct");
								} catch {}
								r(null);
							}
						}
					})
					.catch(() => {
						k && h(!1);
					});
		de();
		let ve = setInterval(de, 2e4);
		return () => {
			((k = !1), clearInterval(ve));
		};
	}, [i && i.ref]);
	let na = () => {
			if (R) return;
			let k = {
				...v,
				phone: v.phone.replace(/\s+/g, ""),
				nationalId: v.nationalId.replace(/\D/g, ""),
			};
			if (H === "register") {
				if (k.name.trim().length < 3) {
					g({
						ok: !1,
						text: "اكتب اسمك الكامل",
					});
					return;
				}
				if (!/^01\d{9}$/.test(k.phone)) {
					g({
						ok: !1,
						text: "رقم الموبايل لازم 11 رقم ويبدأ بـ 01",
					});
					return;
				}
				if (k.password.length < 6) {
					g({
						ok: !1,
						text: "كلمة السر 6 أحرف على الأقل",
					});
					return;
				}
				if (k.nationalId.length !== 14) {
					g({
						ok: !1,
						text: "الرقم القومي لازم 14 رقم",
					});
					return;
				}
				if (!k.governorate || !k.zone) {
					g({
						ok: !1,
						text: "اختر محافظتك ومنطقتك",
					});
					return;
				}
			} else {
				if (!/^01\d{9}$/.test(k.phone)) {
					g({
						ok: !1,
						text: "رقم الموبايل غير صحيح",
					});
					return;
				}
				if (!k.password) {
					g({
						ok: !1,
						text: "اكتب كلمة السر",
					});
					return;
				}
			}
			(X(!0),
				apiFetch("/api/wasl/courier-auth", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: H, ...k }),
				})
					.then((de) => de.json())
					.then((de) => {
						de && de.ok && de.account
							? (fe(de.account),
								C(de.canWork !== !1),
								D({ required: !!de.subRequired, fee: de.monthlyFee || 0 }),
								g(null),
								za("home"),
								n(
									"أهلًا " + de.account.name.split(" ")[0] + " — حسابك جاهز ✅",
								))
							: de && de.error === "phone_taken"
								? g({
										ok: !1,
										text: "الرقم ده مسجل بالفعل — ادخل من \xABلدي حساب\xBB",
									})
								: de && de.error === "bad_credentials"
									? g({
											ok: !1,
											text: "الرقم أو كلمة السر غير صحيحة",
										})
									: g({
											ok: !1,
											text: "تعذر الاتصال — حاول مرة أخرى",
										});
					})
					.catch(() =>
						g({
							ok: !1,
							text: "تعذر الاتصال — حاول مرة أخرى",
						}),
					)
					.finally(() => X(!1)));
		},
		aa = {
			border: "1.5px solid var(--line)",
			borderRadius: 12,
			padding: "10px 12px",
			fontSize: 13,
			fontFamily: "inherit",
			background: "#fff",
			width: "100%",
			boxSizing: "border-box",
		},
		[Ia, za] = ut.default.useState("home"),
		jt = (k) =>
			"https://www.google.com/maps/search/?api=1&query=" +
			encodeURIComponent((k || "") + ", مصر"),
		ba = i ? i.name : "",
		Z = ba
			? a.find(
					(k) =>
						k.real &&
						k.courier === ba &&
						k.status !== "delivered" &&
						k.status !== "canceled" &&
						k.status !== "refused" &&
						k.status !== "no_answer",
				)
			: null,
		ge =
			t && i && y
				? a.find(
						(k) =>
							k.real && k.status === "searching" && !k.manual && !O.has(k.id),
					)
				: null,
		je = a.filter(
			(k) =>
				k.real &&
				k.courier === ba &&
				["delivered", "refused", "no_answer"].includes(k.status),
		),
		J = new Date().toLocaleTimeString("en-GB", {
			hour: "2-digit",
			minute: "2-digit",
		}),
		Zt = (k) =>
			P((de) => {
				let ve = new Set(de);
				return (ve.add(k), ve);
			}),
		Ce = ge ? ge.id : null;
	ut.default.useEffect(() => {
		if (Ce && navigator.vibrate)
			try {
				navigator.vibrate([180, 90, 180]);
			} catch {}
	}, [Ce]);
	let N = (k, de) => k && new Date(k).toDateString() === de.toDateString(),
		Q = new Date(),
		ae = je.filter((k) => N(k.ts, Q)).reduce((k, de) => k + de.fee, 0),
		Ie = (() => {
			let k = [];
			for (let de = 6; de >= 0; de--) {
				let ve = new Date(Date.now() - de * 864e5);
				k.push(
					je.filter((ta) => N(ta.ts, ve)).reduce((ta, Te) => ta + Te.fee, 0),
				);
			}
			return k;
		})(),
		re = Ie.reduce((k, de) => k + de, 0),
		ot = je.filter((k) => N(k.ts, Q)).length;
	return (0, p.jsx)("div", {
		className: "phone-wrap",
		children: (0, p.jsx)("div", {
			className: "phone",
			children: (0, p.jsxs)("div", {
				className: "scr",
				children: [
					(0, p.jsx)("div", {
						className: "notch",
						children: (0, p.jsx)("i", {}),
					}),
					(0, p.jsx)("div", {
						style: {
							textAlign: "center",
							fontSize: 10,
							fontWeight: 800,
							letterSpacing: 2,
							color: "var(--mut)",
							paddingTop: 2,
						},
						children: "SUPER X",
					}),
					(0, p.jsx)("div", {
						className: "app-head",
						children: (0, p.jsxs)("div", {
							className: "between",
							style: { position: "relative" },
							children: [
								(0, p.jsxs)("div", {
									children: [
										(0, p.jsxs)("div", {
											style: { fontSize: 11, opacity: 0.85, fontWeight: 600 },
											children: [
												J,
												i && i.zone ? " — منطقة " + i.zone : "",
												" ",
												(0, p.jsxs)("span", {
													style: {
														display: "inline-flex",
														alignItems: "center",
														gap: 4,
														marginInlineStart: 6,
													},
													children: [
														(0, p.jsx)("i", {
															className: "dot8",
															style: {
																background: I ? "#34d399" : "#f87171",
																display: "inline-block",
															},
														}),
														I ? "متصل" : "إعادة محاولة…",
													],
												}),
											],
										}),
										(0, p.jsx)("b", {
											style: { fontSize: 18 },
											children: i
												? "أهلًا " + i.name.split(" ")[0]
												: "تطبيق المندوب",
										}),
									],
								}),
								(0, p.jsxs)("div", {
									style: {
										textAlign: "center",
										background: "rgba(255,255,255,.14)",
										backdropFilter: "blur(6px)",
										borderRadius: 15,
										padding: "9px 13px",
										border: "1px solid rgba(255,255,255,.18)",
									},
									children: [
										(0, p.jsx)("div", {
											style: { fontSize: 10, opacity: 0.9, fontWeight: 700 },
											children: t ? "متاح للعمل" : "غير متاح",
										}),
										(0, p.jsx)("button", {
											className: "tgl",
											style: {
												marginTop: 6,
												background: t ? "#34d399" : "rgba(255,255,255,.35)",
											},
											onClick: () => l(!t),
										}),
									],
								}),
							],
						}),
					}),
					(0, p.jsxs)("div", {
						className: "app-body",
						children: [
							Ia === "home" &&
								(i
									? y
										? t
											? (0, p.jsxs)(p.Fragment, {
													children: [
														i &&
															!Z &&
															!ge &&
															(0, p.jsxs)("div", {
																className: "bigcard",
																style: {
																	textAlign: "center",
																	padding: 30,
																	borderStyle: "dashed",
																	borderColor: "#c9d5e8",
																	background: "rgba(255,255,255,.7)",
																},
																children: [
																	(0, p.jsx)("div", {
																		style: {
																			marginBottom: 8,
																			color: "var(--brand)",
																		},
																		children: (0, p.jsx)(S, {
																			n: "bike",
																			s: 40,
																		}),
																	}),
																	(0, p.jsx)("b", {
																		style: { fontSize: 15.5 },
																		children: "أنت جاهز للعمل",
																	}),
																	(0, p.jsx)("p", {
																		style: {
																			fontSize: 12.5,
																			color: "var(--mut)",
																			marginTop: 6,
																			lineHeight: 1.9,
																		},
																		children:
																			"الطلبات المتاحة في الشبكة تظهر هنا فورًا — أول من يقبل ياخد الطلب.",
																	}),
																],
															}),
														ge &&
															!Z &&
															(0, p.jsxs)("div", {
																className: "bigcard",
																style: {
																	borderColor: "var(--brand)",
																	boxShadow:
																		"0 14px 34px -12px rgba(13,148,136,.4)",
																},
																children: [
																	(0, p.jsxs)("div", {
																		className: "between",
																		style: { marginBottom: 10 },
																		children: [
																			(0, p.jsx)(ty, {
																				c: "b-amber",
																				icon: "zap",
																				children: "طلب جديد",
																			}),
																			(0, p.jsx)("span", {
																				style: {
																					fontSize: 11,
																					fontWeight: 700,
																					color: "var(--mut)",
																				},
																				children: ge.id,
																			}),
																		],
																	}),
																	(0, p.jsxs)("div", {
																		className: "row",
																		style: { alignItems: "baseline", gap: 6 },
																		children: [
																			(0, p.jsx)("b", {
																				style: {
																					fontSize: 24,
																					color: "var(--brandInk)",
																				},
																				children: (0, p.jsx)(td, {
																					value: ge.fee,
																				}),
																			}),
																			(0, p.jsx)("span", {
																				style: {
																					fontSize: 13,
																					fontWeight: 700,
																				},
																				children: "ج — رسوم التوصيل",
																			}),
																		],
																	}),
																	(0, p.jsx)("div", { className: "hr" }),
																	(0, p.jsxs)("div", {
																		style: {
																			display: "flex",
																			gap: 11,
																			alignItems: "flex-start",
																			marginBottom: 10,
																		},
																		children: [
																			(0, p.jsx)("div", {
																				className: "ico",
																				style: {
																					width: 32,
																					height: 32,
																					background: "var(--brandSoft)",
																					color: "var(--brandInk)",
																				},
																				children: (0, p.jsx)(S, {
																					n: "store",
																					s: 14,
																				}),
																			}),
																			(0, p.jsxs)("div", {
																				children: [
																					(0, p.jsx)("b", {
																						style: { fontSize: 13.5 },
																						children: ge.merchant,
																					}),
																					(0, p.jsx)("div", {
																						style: {
																							fontSize: 12,
																							color: "var(--mut)",
																						},
																						children: ge.from,
																					}),
																				],
																			}),
																		],
																	}),
																	(0, p.jsxs)("div", {
																		style: {
																			display: "flex",
																			gap: 11,
																			alignItems: "flex-start",
																			marginBottom: 12,
																		},
																		children: [
																			(0, p.jsx)("div", {
																				className: "ico",
																				style: {
																					width: 32,
																					height: 32,
																					background: "var(--redSoft)",
																					color: "var(--red)",
																				},
																				children: (0, p.jsx)(S, {
																					n: "pin",
																					s: 14,
																				}),
																			}),
																			(0, p.jsxs)("div", {
																				children: [
																					(0, p.jsx)("b", {
																						style: { fontSize: 13.5 },
																						children: "التسليم",
																					}),
																					(0, p.jsx)("div", {
																						style: {
																							fontSize: 12,
																							color: "var(--mut)",
																						},
																						children: ge.to,
																					}),
																				],
																			}),
																		],
																	}),
																	(0, p.jsxs)("div", {
																		className: "row wrap",
																		style: { gap: 6, marginBottom: 14 },
																		children: [
																			ge.km
																				? (0, p.jsxs)("span", {
																						className: "tag",
																						children: [
																							"≈ ",
																							ge.km,
																							" كم — ",
																							Math.round(ge.fee / ge.km),
																							" ج لكل كم",
																						],
																					})
																				: null,
																			ge.time
																				? (0, p.jsxs)("span", {
																						className: "tag",
																						children: ["نُشر ", ge.time],
																					})
																				: null,
																			ge.readyMin !== void 0 &&
																			ge.readyMin !== null
																				? (0, p.jsx)("span", {
																						className: "tag",
																						children:
																							ge.readyMin === 0
																								? "جاهز الآن"
																								: "يجهز بعد " +
																									ge.readyMin +
																									" د",
																					})
																				: null,
																			ge.kind
																				? (0, p.jsx)("span", {
																						className: "tag",
																						children: ge.kind,
																					})
																				: null,
																			(0, p.jsxs)("span", {
																				className: "tag",
																				children: ["دفع ", ge.pay],
																			}),
																		],
																	}),
																	(0, p.jsxs)("button", {
																		className: "bigbtn accept",
																		onClick: () => u(ge.id, ba),
																		children: [
																			(0, p.jsx)(S, { n: "check", s: 19 }),
																			" قبول الطلب",
																		],
																	}),
																	(0, p.jsx)("div", { style: { height: 9 } }),
																	(0, p.jsxs)("button", {
																		className: "bigbtn decline",
																		onClick: () => Zt(ge.id),
																		children: [
																			(0, p.jsx)(S, { n: "x", s: 16 }),
																			" رفض — يفضل متاح لغيرك",
																		],
																	}),
																],
															}),
														Z &&
															(0, p.jsxs)("div", {
																className: "bigcard",
																children: [
																	(0, p.jsxs)("div", {
																		className: "between",
																		style: { marginBottom: 10 },
																		children: [
																			(0, p.jsx)(ty, {
																				c: "b-teal",
																				icon: "route",
																				children: "رحلتك الحالية",
																			}),
																			(0, p.jsx)("b", {
																				style: {
																					fontSize: 15,
																					color: "var(--brandInk)",
																				},
																				children: se(Z.fee),
																			}),
																		],
																	}),
																	(0, p.jsx)(Xt, {
																		cur:
																			{
																				accepted: 1,
																				pickup: 2,
																				heading: 3,
																				arrived: 4,
																				delivered: 6,
																				refused: 6,
																				no_answer: 6,
																			}[Z.status] ?? 1,
																		labels: [
																			"قبول",
																			"استلام",
																			"تأكيد العميل",
																			"في الطريق",
																			"وصلت",
																			"تسليم",
																		],
																	}),
																	(0, p.jsx)("div", { className: "hr" }),
																	(0, p.jsxs)("div", {
																		style: {
																			display: "flex",
																			gap: 11,
																			alignItems: "flex-start",
																			marginBottom: 10,
																		},
																		children: [
																			(0, p.jsx)("div", {
																				className: "ico",
																				style: {
																					width: 32,
																					height: 32,
																					background: "var(--brandSoft)",
																					color: "var(--brandInk)",
																				},
																				children: (0, p.jsx)(S, {
																					n: "store",
																					s: 14,
																				}),
																			}),
																			(0, p.jsxs)("div", {
																				style: { flex: 1 },
																				children: [
																					(0, p.jsx)("b", {
																						style: { fontSize: 13.5 },
																						children: Z.merchant,
																					}),
																					(0, p.jsx)("div", {
																						style: {
																							fontSize: 12,
																							color: "var(--mut)",
																						},
																						children: Z.from,
																					}),
																				],
																			}),
																			Z.status === "accepted" &&
																				(0, p.jsxs)("a", {
																					href: jt(Z.from),
																					target: "_blank",
																					rel: "noreferrer",
																					className: "btn btn-o btn-sm",
																					style: {
																						flex: "none",
																						textDecoration: "none",
																					},
																					children: [
																						(0, p.jsx)(S, {
																							n: "nav",
																							s: 13,
																						}),
																						" خريطة",
																					],
																				}),
																		],
																	}),
																	(0, p.jsxs)("div", {
																		style: {
																			display: "flex",
																			gap: 11,
																			alignItems: "flex-start",
																			marginBottom: 12,
																		},
																		children: [
																			(0, p.jsx)("div", {
																				className: "ico",
																				style: {
																					width: 32,
																					height: 32,
																					background: "var(--redSoft)",
																					color: "var(--red)",
																				},
																				children: (0, p.jsx)(S, {
																					n: "pin",
																					s: 14,
																				}),
																			}),
																			(0, p.jsxs)("div", {
																				style: { flex: 1 },
																				children: [
																					(0, p.jsx)("b", {
																						style: { fontSize: 13.5 },
																						children: "التسليم",
																					}),
																					(0, p.jsx)("div", {
																						style: {
																							fontSize: 12,
																							color: "var(--mut)",
																						},
																						children: Z.to,
																					}),
																				],
																			}),
																			(Z.status === "pickup" ||
																				Z.status === "heading" ||
																				Z.status === "arrived") &&
																				(0, p.jsxs)("a", {
																					href: jt(Z.to),
																					target: "_blank",
																					rel: "noreferrer",
																					className: "btn btn-p btn-sm",
																					style: {
																						flex: "none",
																						textDecoration: "none",
																					},
																					children: [
																						(0, p.jsx)(S, {
																							n: "nav",
																							s: 13,
																						}),
																						" توجه",
																					],
																				}),
																		],
																	}),
																	(Z.custName || Z.cust) &&
																		(0, p.jsxs)("div", {
																			style: {
																				fontSize: 12,
																				color: "var(--mut)",
																				marginBottom: 10,
																			},
																			children: [
																				(0, p.jsx)(S, { n: "user", s: 13 }),
																				" العميل: ",
																				[Z.custName, Z.cust]
																					.filter(Boolean)
																					.join(" — "),
																			],
																		}),
																	Z.readyMin !== void 0 &&
																		Z.readyMin !== null &&
																		Z.status !== "pickup" &&
																		Z.status !== "heading" &&
																		(0, p.jsxs)("div", {
																			style: {
																				fontSize: 12,
																				color: "var(--mut)",
																				marginBottom: 10,
																			},
																			children: [
																				(0, p.jsx)(S, { n: "clock", s: 13 }),
																				" ",
																				Z.readyMin === 0
																					? "الأوردر جاهز للاستلام"
																					: "الأوردر يجهز بعد " +
																						Z.readyMin +
																						" دقيقة",
																			],
																		}),
																	Z.note &&
																		(0, p.jsxs)("div", {
																			style: {
																				background: "var(--amberSoft)",
																				borderRadius: 12,
																				padding: "10px 12px",
																				marginBottom: 12,
																			},
																			children: [
																				(0, p.jsxs)("b", {
																					style: {
																						fontSize: 12.5,
																						color: "#b45309",
																					},
																					children: [
																						(0, p.jsx)(S, {
																							n: "info",
																							s: 14,
																						}),
																						" ملاحظة على الأوردر",
																					],
																				}),
																				(0, p.jsx)("div", {
																					style: {
																						fontSize: 11.5,
																						color: "#92400e",
																						marginTop: 3,
																						lineHeight: 1.7,
																					},
																					children: Z.note,
																				}),
																			],
																		}),
																	Z.pay === "كاش" &&
																		(0, p.jsxs)("div", {
																			style: {
																				background: "var(--amberSoft)",
																				borderRadius: 12,
																				padding: "10px 12px",
																				marginBottom: 12,
																			},
																			children: [
																				(0, p.jsxs)("b", {
																					style: {
																						fontSize: 12.5,
																						color: "#b45309",
																					},
																					children: [
																						(0, p.jsx)(S, {
																							n: "wallet",
																							s: 14,
																						}),
																						" تحصيل نقدي — أنت مسؤول عن قيمة الأوردر",
																					],
																				}),
																				(0, p.jsxs)("div", {
																					style: {
																						fontSize: 11.5,
																						color: "#92400e",
																						marginTop: 3,
																						lineHeight: 1.7,
																					},
																					children: [
																						"العميل لم يدفع أونلاين — حصّل قيمة الأوردر نقدًا عند التسليم",
																						Z.total
																							? " (" + se(Z.total) + " ج)"
																							: "",
																						".",
																					],
																				}),
																			],
																		}),
																	Z.pay !== "كاش" &&
																		(0, p.jsxs)("div", {
																			style: {
																				background: "var(--greenSoft,#e5f6ef)",
																				borderRadius: 12,
																				padding: "10px 12px",
																				marginBottom: 12,
																			},
																			children: [
																				(0, p.jsxs)("b", {
																					style: {
																						fontSize: 12.5,
																						color: "var(--green)",
																					},
																					children: [
																						(0, p.jsx)(S, {
																							n: "check",
																							s: 14,
																						}),
																						" الأوردر مدفوع أونلاين",
																					],
																				}),
																				(0, p.jsx)("div", {
																					style: {
																						fontSize: 11.5,
																						color: "var(--mut)",
																						marginTop: 3,
																						lineHeight: 1.7,
																					},
																					children:
																						"لا تستلم أي مبلغ من العميل — رسوم التوصيل مستحقة لك من المطعم.",
																				}),
																			],
																		}),
																	Z.status === "accepted" &&
																		(0, p.jsxs)("button", {
																			className: "bigbtn step",
																			onClick: () => o(Z.id, "pickup"),
																			children: [
																				(0, p.jsx)(S, { n: "box", s: 17 }),
																				" استلمت الأوردر من المطعم",
																			],
																		}),
																	Z.status === "pickup" &&
																		(0, p.jsxs)(p.Fragment, {
																			children: [
																				(0, p.jsxs)("div", {
																					style: {
																						background: "var(--brandSoft)",
																						borderRadius: 12,
																						padding: "10px 12px",
																						marginBottom: 10,
																					},
																					children: [
																						(0, p.jsxs)("b", {
																							style: {
																								fontSize: 12.5,
																								color: "var(--brandInk)",
																							},
																							children: [
																								(0, p.jsx)(S, {
																									n: "phone",
																									s: 14,
																								}),
																								" قبل ما تتحرك — اتصل بالعميل",
																							],
																						}),
																						(0, p.jsx)("div", {
																							style: {
																								fontSize: 11.5,
																								color: "var(--mut)",
																								marginTop: 3,
																								lineHeight: 1.7,
																							},
																							children:
																								"تأكد إن العميل موجود وينتظر الأوردر وإن العنوان واضح، وبعدها انطلق.",
																						}),
																					],
																				}),
																				Z.cust &&
																					(0, p.jsxs)("a", {
																						className: "bigbtn step",
																						style: {
																							textAlign: "center",
																							textDecoration: "none",
																						},
																						href: "tel:" + Z.cust,
																						children: [
																							(0, p.jsx)(S, {
																								n: "phone",
																								s: 16,
																							}),
																							" اتصال بالعميل — ",
																							Z.cust,
																						],
																					}),
																				(0, p.jsx)("div", {
																					style: { height: 8 },
																				}),
																				(0, p.jsxs)("button", {
																					className: "bigbtn accept",
																					onClick: () => o(Z.id, "heading"),
																					children: [
																						(0, p.jsx)(S, {
																							n: "check",
																							s: 17,
																						}),
																						" اتصلت وتأكدت — انطلق للعميل",
																					],
																				}),
																			],
																		}),
																	Z.status === "heading" &&
																		(0, p.jsxs)("button", {
																			className: "bigbtn accept",
																			onClick: () => o(Z.id, "arrived"),
																			children: [
																				(0, p.jsx)(S, { n: "pin", s: 18 }),
																				" وصلت للعميل — سجّل وقت الوصول",
																			],
																		}),
																	Z.status === "arrived" &&
																		(0, p.jsxs)(p.Fragment, {
																			children: [
																				(0, p.jsxs)("div", {
																					style: {
																						background: "var(--brandSoft)",
																						borderRadius: 12,
																						padding: "10px 12px",
																						marginBottom: 10,
																					},
																					children: [
																						(0, p.jsxs)("b", {
																							style: {
																								fontSize: 12.5,
																								color: "var(--brandInk)",
																							},
																							children: [
																								(0, p.jsx)(S, {
																									n: "clock",
																									s: 14,
																								}),
																								" وقت وصولك اتسجّل الآن",
																							],
																						}),
																						(0, p.jsx)("div", {
																							style: {
																								fontSize: 11.5,
																								color: "var(--mut)",
																								marginTop: 3,
																								lineHeight: 1.7,
																							},
																							children:
																								"لو وصلت في التوقيت المحدد بدون تأخير، أي استرجاع للأوردر يكون على المطعم — ورسوم التوصيل مستحقة لك من المطعم.",
																						}),
																					],
																				}),
																				(0, p.jsxs)("button", {
																					className: "bigbtn accept",
																					onClick: () => o(Z.id, "delivered"),
																					children: [
																						(0, p.jsx)(S, {
																							n: "check",
																							s: 18,
																						}),
																						" وصلت وتم تسليم الأوردر",
																					],
																				}),
																				(0, p.jsx)("div", {
																					style: { height: 8 },
																				}),
																				(0, p.jsxs)("button", {
																					className: "bigbtn decline",
																					onClick: () => o(Z.id, "refused"),
																					children: [
																						(0, p.jsx)(S, { n: "x", s: 16 }),
																						" وصلت والعميل رفض الاستلام",
																					],
																				}),
																				(0, p.jsx)("div", {
																					style: { height: 8 },
																				}),
																				(0, p.jsxs)("button", {
																					className: "bigbtn decline",
																					style: {
																						color: "var(--ink2)",
																						borderColor: "var(--line)",
																					},
																					onClick: () => o(Z.id, "no_answer"),
																					children: [
																						(0, p.jsx)(S, {
																							n: "phone",
																							s: 15,
																						}),
																						" وصلت والعميل مابيردش / المكان مقفل",
																					],
																				}),
																			],
																		}),
																],
															}),
														(0, p.jsx)("div", {
															className: "bigcard",
															style: {
																background:
																	"linear-gradient(135deg,#0f766e,#115e59)",
																color: "#fff",
																border: "none",
															},
															children: (0, p.jsxs)("div", {
																className: "between",
																children: [
																	(0, p.jsxs)("div", {
																		children: [
																			(0, p.jsx)("div", {
																				style: {
																					fontSize: 10.5,
																					opacity: 0.8,
																					fontWeight: 700,
																				},
																				children: "أرباح اليوم",
																			}),
																			(0, p.jsxs)("b", {
																				style: { fontSize: 26 },
																				children: [
																					(0, p.jsx)(td, { value: ae }),
																					" ج",
																				],
																			}),
																		],
																	}),
																	(0, p.jsxs)("div", {
																		style: { textAlign: "center" },
																		children: [
																			(0, p.jsx)("div", {
																				style: {
																					fontSize: 10.5,
																					opacity: 0.8,
																					fontWeight: 700,
																				},
																				children: "رحلات اليوم المكتملة",
																			}),
																			(0, p.jsx)("b", {
																				style: { fontSize: 22 },
																				children: ot,
																			}),
																		],
																	}),
																	(0, p.jsxs)("div", {
																		style: { textAlign: "center" },
																		children: [
																			(0, p.jsx)("div", {
																				style: {
																					fontSize: 10.5,
																					opacity: 0.8,
																					fontWeight: 700,
																				},
																				children: "إجمالي رحلاتك",
																			}),
																			(0, p.jsx)("b", {
																				style: { fontSize: 22 },
																				children: je.length,
																			}),
																		],
																	}),
																],
															}),
														}),
													],
												})
											: (0, p.jsxs)("div", {
													className: "bigcard",
													style: { textAlign: "center", padding: 32 },
													children: [
														(0, p.jsx)("div", {
															style: {
																marginBottom: 10,
																color: "var(--mut)",
															},
															children: (0, p.jsx)(S, { n: "moon", s: 40 }),
														}),
														(0, p.jsx)("b", {
															style: { fontSize: 15.5 },
															children: "أنت غير متاح الآن",
														}),
														(0, p.jsxs)("p", {
															style: {
																fontSize: 12.5,
																color: "var(--mut)",
																marginTop: 8,
																lineHeight: 1.9,
															},
															children: [
																"شغّل زر \xABمتاح\xBB في الأعلى لتبدأ استلام الطلبات.",
																(0, p.jsx)("br", {}),
																"الطلبات المتاحة في الشبكة هتظهر هنا أول بأول — أول من يقبل ياخد الطلب.",
															],
														}),
														(0, p.jsxs)("button", {
															className: "bigbtn accept",
															style: { marginTop: 16 },
															onClick: () => l(!0),
															children: [
																(0, p.jsx)(S, { n: "zap", s: 18 }),
																" أنا جاهز — ابدأ استلام الطلبات",
															],
														}),
													],
												})
										: (0, p.jsxs)("div", {
												className: "bigcard",
												style: { textAlign: "center", padding: 26 },
												children: [
													(0, p.jsx)("div", {
														style: { marginBottom: 8, color: "var(--amber)" },
														children: (0, p.jsx)(S, { n: "wallet", s: 36 }),
													}),
													(0, p.jsx)("b", {
														style: { fontSize: 15.5 },
														children: "اشتراكك الشهري مش مفعّل",
													}),
													(0, p.jsx)("p", {
														style: {
															fontSize: 12.5,
															color: "var(--mut)",
															marginTop: 6,
															lineHeight: 1.9,
														},
														children:
															x.fee > 0
																? "اشتراك المناديب " +
																	x.fee +
																	" ج في الشهر — تدفع مرة واحدة وتشتغل الشهر كله بدون أي عمولة على طلباتك."
																: "اشتراك المناديب مطلوب حاليًا لتشغيل الحساب.",
													}),
													(0, p.jsx)("p", {
														style: {
															fontSize: 12,
															color: "var(--mut)",
															marginTop: 4,
															lineHeight: 1.8,
														},
														children:
															"تواصل مع إدارة المنصة لتفعيل اشتراكك — أول ما يتفعّل هتلاقي الطلبات المتاحة هنا فورًا.",
													}),
												],
											})
									: (0, p.jsxs)("div", {
											className: "bigcard",
											style: { padding: 20 },
											children: [
												(0, p.jsxs)("div", {
													style: { textAlign: "center", marginBottom: 12 },
													children: [
														(0, p.jsx)("div", {
															style: {
																marginBottom: 8,
																color: "var(--brand)",
															},
															children: (0, p.jsx)(S, { n: "bike", s: 38 }),
														}),
														(0, p.jsx)("b", {
															style: { fontSize: 16 },
															children: "سجّل كمندوب توصيل",
														}),
														(0, p.jsx)("p", {
															style: {
																fontSize: 12,
																color: "var(--mut)",
																marginTop: 5,
																lineHeight: 1.8,
															},
															children:
																"سجّل بياناتك مرة واحدة وابدأ استلام الطلبات المتاحة في منطقتك — زي تطبيقات التوصيل بالظبط.",
														}),
													],
												}),
												(0, p.jsxs)("div", {
													style: {
														display: "flex",
														gap: 8,
														marginBottom: 12,
													},
													children: [
														(0, p.jsx)("button", {
															className: "bigbtn",
															style: {
																padding: "10px 8px",
																fontSize: 13,
																fontWeight: 800,
																border:
																	H === "register"
																		? "2px solid var(--brand)"
																		: "1.5px solid var(--line)",
																color:
																	H === "register"
																		? "var(--brandInk)"
																		: "var(--mut)",
																background:
																	H === "register"
																		? "var(--brandSoft)"
																		: "#fff",
															},
															onClick: () => {
																(V("register"), g(null));
															},
															children: "حساب جديد",
														}),
														(0, p.jsx)("button", {
															className: "bigbtn",
															style: {
																padding: "10px 8px",
																fontSize: 13,
																fontWeight: 800,
																border:
																	H === "login"
																		? "2px solid var(--brand)"
																		: "1.5px solid var(--line)",
																color:
																	H === "login"
																		? "var(--brandInk)"
																		: "var(--mut)",
																background:
																	H === "login" ? "var(--brandSoft)" : "#fff",
															},
															onClick: () => {
																(V("login"), g(null));
															},
															children: "لدي حساب — دخول",
														}),
													],
												}),
												H === "login"
													? (0, p.jsxs)(p.Fragment, {
															children: [
																(0, p.jsx)("input", {
																	style: aa,
																	placeholder: "رقم الموبايل — 01xxxxxxxxx",
																	inputMode: "tel",
																	dir: "ltr",
																	value: v.phone,
																	onChange: (k) =>
																		b({ ...v, phone: k.target.value }),
																}),
																(0, p.jsx)("div", { style: { height: 8 } }),
																(0, p.jsx)("input", {
																	style: aa,
																	placeholder: "كلمة السر",
																	type: "password",
																	value: v.password,
																	onChange: (k) =>
																		b({ ...v, password: k.target.value }),
																}),
															],
														})
													: (0, p.jsxs)(p.Fragment, {
															children: [
																(0, p.jsx)("input", {
																	style: aa,
																	placeholder: "الاسم الكامل",
																	value: v.name,
																	onChange: (k) =>
																		b({ ...v, name: k.target.value }),
																}),
																(0, p.jsx)("div", { style: { height: 8 } }),
																(0, p.jsx)("input", {
																	style: aa,
																	placeholder: "رقم الموبايل — 01xxxxxxxxx",
																	inputMode: "tel",
																	dir: "ltr",
																	value: v.phone,
																	onChange: (k) =>
																		b({ ...v, phone: k.target.value }),
																}),
																(0, p.jsx)("div", { style: { height: 8 } }),
																(0, p.jsx)("input", {
																	style: aa,
																	placeholder: "الرقم القومي — 14 رقم",
																	inputMode: "numeric",
																	dir: "ltr",
																	value: v.nationalId,
																	onChange: (k) =>
																		b({ ...v, nationalId: k.target.value }),
																}),
																(0, p.jsx)("div", { style: { height: 10 } }),
																(0, p.jsx)("div", {
																	style: { display: "flex", gap: 7 },
																	children: Object.keys(Pm).map((k) =>
																		(0, p.jsx)(
																			"button",
																			{
																				className: "bigbtn",
																				style: {
																					flex: 1,
																					padding: "9px 4px",
																					fontSize: 12,
																					fontWeight: 800,
																					border:
																						v.vehicle === k
																							? "2px solid var(--brand)"
																							: "1.5px solid var(--line)",
																					color:
																						v.vehicle === k
																							? "var(--brandInk)"
																							: "var(--mut)",
																					background:
																						v.vehicle === k
																							? "var(--brandSoft)"
																							: "#fff",
																				},
																				onClick: () => b({ ...v, vehicle: k }),
																				children: Pm[k],
																			},
																			k,
																		),
																	),
																}),
																(0, p.jsx)("div", { style: { height: 10 } }),
																(0, p.jsxs)("select", {
																	style: aa,
																	value: v.governorate,
																	onChange: (k) =>
																		b({
																			...v,
																			governorate: k.target.value,
																			zone: "",
																		}),
																	children: [
																		(0, p.jsx)("option", {
																			value: "",
																			children: "المحافظة…",
																		}),
																		du.map((k) =>
																			(0, p.jsx)(
																				"option",
																				{ value: k.name, children: k.name },
																				k.name,
																			),
																		),
																	],
																}),
																(0, p.jsx)("div", { style: { height: 8 } }),
																(0, p.jsxs)("select", {
																	style: aa,
																	value: v.zone,
																	onChange: (k) =>
																		b({ ...v, zone: k.target.value }),
																	disabled: !v.governorate,
																	children: [
																		(0, p.jsx)("option", {
																			value: "",
																			children: v.governorate
																				? "المنطقة…"
																				: "اختر المحافظة أولًا",
																		}),
																		vl(v.governorate).map((k) =>
																			(0, p.jsx)(
																				"option",
																				{ value: k, children: k },
																				k,
																			),
																		),
																	],
																}),
																(0, p.jsx)("div", { style: { height: 8 } }),
																(0, p.jsx)("input", {
																	style: aa,
																	placeholder: "كلمة سر — 6 أحرف على الأقل",
																	type: "password",
																	value: v.password,
																	onChange: (k) =>
																		b({ ...v, password: k.target.value }),
																}),
															],
														}),
												(0, p.jsx)("div", { style: { height: 12 } }),
												(0, p.jsxs)("button", {
													className: "bigbtn accept",
													disabled: R,
													onClick: na,
													children: [
														(0, p.jsx)(S, { n: "check", s: 17 }),
														" ",
														H === "register" ? "إنشاء حسابي" : "دخول",
													],
												}),
												c &&
													(0, p.jsx)("div", {
														style: {
															marginTop: 9,
															fontSize: 12,
															fontWeight: 700,
															color: c.ok ? "var(--green)" : "var(--red)",
															lineHeight: 1.7,
															textAlign: "center",
														},
														children: c.text,
													}),
											],
										})),
							Ia === "trips" &&
								(0, p.jsxs)(p.Fragment, {
									children: [
										(0, p.jsx)("b", {
											style: {
												fontSize: 14.5,
												display: "block",
												margin: "2px 4px 12px",
											},
											children: "رحلاتي",
										}),
										je.length === 0 &&
											(0, p.jsx)("div", {
												className: "bigcard",
												style: {
													textAlign: "center",
													color: "var(--mut)",
													fontSize: 13,
												},
												children: "لا توجد رحلات مكتملة اليوم بعد",
											}),
										je.map((k) =>
											(0, p.jsxs)(
												"div",
												{
													className: "bigcard",
													children: [
														(0, p.jsxs)("div", {
															className: "between",
															children: [
																(0, p.jsx)("b", {
																	style: { fontSize: 13 },
																	children: k.id,
																}),
																(0, p.jsx)("b", {
																	style: {
																		color: "var(--green)",
																		fontSize: 14,
																	},
																	children: se(k.fee),
																}),
															],
														}),
														(0, p.jsxs)("div", {
															style: {
																fontSize: 12,
																color: "var(--mut)",
																marginTop: 4,
																lineHeight: 1.7,
															},
															children: [k.merchant, " ← ", k.to],
														}),
														(0, p.jsxs)("div", {
															className: "row",
															style: { gap: 6, marginTop: 9 },
															children: [
																(0, p.jsx)("span", {
																	className: "tag",
																	children:
																		k.status === "refused"
																			? "العميل رفض الاستلام"
																			: k.status === "no_answer"
																				? "لا يرد / المكان مقفل"
																				: "تم التسليم",
																}),
																(0, p.jsx)("span", {
																	className: "tag",
																	children: k.pay,
																}),
															],
														}),
													],
												},
												k.id,
											),
										),
									],
								}),
							Ia === "earn" &&
								(0, p.jsxs)(p.Fragment, {
									children: [
										(0, p.jsx)("b", {
											style: {
												fontSize: 14.5,
												display: "block",
												margin: "2px 4px 12px",
											},
											children: "أرباحي",
										}),
										(0, p.jsxs)("div", {
											className: "bigcard",
											style: {
												textAlign: "center",
												background: "linear-gradient(135deg,#0f766e,#115e59)",
												color: "#fff",
												border: "none",
											},
											children: [
												(0, p.jsxs)("div", {
													style: {
														fontSize: 11,
														opacity: 0.85,
														fontWeight: 700,
													},
													children: [
														"أرباح اليوم — من ",
														ot,
														" ",
														ot === 1 ? "رحلة مكتملة" : "رحلات مكتملة",
													],
												}),
												(0, p.jsxs)("b", {
													style: { fontSize: 32 },
													children: [(0, p.jsx)(td, { value: ae }), " ج"],
												}),
												(0, p.jsx)("div", {
													style: { fontSize: 11, opacity: 0.8, marginTop: 4 },
													children: "محسوبة من رسوم طلباتك المكتملة فعلًا",
												}),
											],
										}),
										(0, p.jsxs)("div", {
											className: "bigcard",
											children: [
												(0, p.jsx)("b", {
													style: { fontSize: 13 },
													children: "أرباح آخر 7 أيام",
												}),
												(0, p.jsx)(At, { data: Ie, color: "#0d9488", h: 56 }),
												(0, p.jsxs)("div", {
													className: "row",
													style: { gap: 14, marginTop: 4 },
													children: [
														(0, p.jsxs)("div", {
															children: [
																(0, p.jsx)("b", {
																	style: { fontSize: 13 },
																	children: se(re),
																}),
																(0, p.jsx)("div", {
																	style: {
																		fontSize: 10.5,
																		color: "var(--mut)",
																	},
																	children: "هذا الأسبوع",
																}),
															],
														}),
														(0, p.jsxs)("div", {
															children: [
																(0, p.jsx)("b", {
																	style: { fontSize: 13 },
																	children: je.length,
																}),
																(0, p.jsx)("div", {
																	style: {
																		fontSize: 10.5,
																		color: "var(--mut)",
																	},
																	children: "إجمالي رحلاتك المسجلة",
																}),
															],
														}),
													],
												}),
											],
										}),
									],
								}),
							Ia === "me" &&
								(0, p.jsxs)(p.Fragment, {
									children: [
										(0, p.jsx)("b", {
											style: {
												fontSize: 14.5,
												display: "block",
												margin: "2px 4px 12px",
											},
											children: "حسابي",
										}),
										i
											? (0, p.jsxs)(p.Fragment, {
													children: [
														(0, p.jsxs)("div", {
															className: "bigcard",
															style: { textAlign: "center", padding: 22 },
															children: [
																(0, p.jsx)("div", {
																	style: {
																		width: 68,
																		height: 68,
																		borderRadius: 99,
																		background:
																			"linear-gradient(135deg,#2dd4bf,#0d9488)",
																		color: "#fff",
																		display: "flex",
																		alignItems: "center",
																		justifyContent: "center",
																		fontSize: 25,
																		fontWeight: 800,
																		margin: "0 auto 10px",
																		boxShadow:
																			"0 12px 26px -10px rgba(13,148,136,.6)",
																	},
																	children: i.name.trim()[0],
																}),
																(0, p.jsx)("b", {
																	style: { fontSize: 15.5 },
																	children: i.name,
																}),
																(0, p.jsx)("div", {
																	style: {
																		fontSize: 12,
																		color: "var(--mut)",
																	},
																	dir: "ltr",
																	children: i.phone,
																}),
																(0, p.jsxs)("div", {
																	className: "row wrap",
																	style: {
																		gap: 6,
																		justifyContent: "center",
																		marginTop: 11,
																	},
																	children: [
																		i.zone
																			? (0, p.jsxs)("span", {
																					className: "tag",
																					children: ["منطقة ", i.zone],
																				})
																			: null,
																		(0, p.jsx)("span", {
																			className: "tag",
																			children: Pm[i.vehicle] || "مركبة",
																		}),
																		(0, p.jsx)("span", {
																			className: "tag",
																			style: y
																				? void 0
																				: {
																						color: "var(--red)",
																						borderColor: "var(--red)",
																					},
																			children: y
																				? x.required
																					? "اشتراكك نشط"
																					: "العمل مجاني حاليًا"
																				: "اشتراك مطلوب",
																		}),
																	],
																}),
															],
														}),
														(0, p.jsxs)("div", {
															className: "bigcard",
															style: { marginBottom: 12 },
															children: [
																(0, p.jsx)("b", {
																	style: { fontSize: 13.5 },
																	children: "بياناتي المسجلة",
																}),
																(0, p.jsxs)("div", {
																	className: "between",
																	style: {
																		fontSize: 12.5,
																		padding: "9px 0",
																		borderBottom: "1px solid var(--line)",
																	},
																	children: [
																		(0, p.jsx)("span", {
																			style: { color: "var(--mut)" },
																			children: "رقم الحساب",
																		}),
																		(0, p.jsx)("b", {
																			dir: "ltr",
																			children: i.ref,
																		}),
																	],
																}),
																(0, p.jsxs)("div", {
																	className: "between",
																	style: {
																		fontSize: 12.5,
																		padding: "9px 0",
																		borderBottom: "1px solid var(--line)",
																	},
																	children: [
																		(0, p.jsx)("span", {
																			style: { color: "var(--mut)" },
																			children: "الرقم القومي",
																		}),
																		(0, p.jsx)("b", {
																			dir: "ltr",
																			children: i.nationalId
																				? i.nationalId.slice(0, 4) +
																					"••••••••" +
																					i.nationalId.slice(-2)
																				: "—",
																		}),
																	],
																}),
																(0, p.jsxs)("div", {
																	className: "between",
																	style: {
																		fontSize: 12.5,
																		padding: "9px 0",
																		borderBottom: "1px solid var(--line)",
																	},
																	children: [
																		(0, p.jsx)("span", {
																			style: { color: "var(--mut)" },
																			children: "المحافظة",
																		}),
																		(0, p.jsx)("b", {
																			children: i.governorate || "—",
																		}),
																	],
																}),
																(0, p.jsxs)("div", {
																	className: "between",
																	style: { fontSize: 12.5, padding: "9px 0" },
																	children: [
																		(0, p.jsx)("span", {
																			style: { color: "var(--mut)" },
																			children: "منطقة العمل",
																		}),
																		(0, p.jsx)("b", {
																			children: i.zone || "—",
																		}),
																	],
																}),
																x.required &&
																	(0, p.jsxs)("div", {
																		style: {
																			marginTop: 8,
																			fontSize: 11.5,
																			color: "var(--mut)",
																			lineHeight: 1.7,
																		},
																		children: [
																			"اشتراك المناديب ",
																			x.fee > 0 ? x.fee + " ج/شهر" : "مطلوب",
																			" — بدون أي عمولة على طلباتك.",
																		],
																	}),
															],
														}),
														(0, p.jsxs)("button", {
															className: "bigbtn decline",
															onClick: W,
															children: [
																(0, p.jsx)(S, { n: "x", s: 16 }),
																" خروج من الحساب",
															],
														}),
													],
												})
											: (0, p.jsxs)("div", {
													className: "bigcard",
													style: { textAlign: "center", padding: 24 },
													children: [
														(0, p.jsx)("div", {
															style: { marginBottom: 8, color: "var(--mut)" },
															children: (0, p.jsx)(S, { n: "user", s: 34 }),
														}),
														(0, p.jsx)("b", {
															style: { fontSize: 14.5 },
															children: "لسه مسجلتش",
														}),
														(0, p.jsx)("p", {
															style: {
																fontSize: 12.5,
																color: "var(--mut)",
																marginTop: 6,
																lineHeight: 1.8,
															},
															children:
																"سجّل كمندوب توصيل من تبويب \xABالرئيسية\xBB — بياناتك كاملة وحسابك ليك وحدك.",
														}),
														(0, p.jsxs)("button", {
															className: "bigbtn accept",
															style: { marginTop: 12 },
															onClick: () => {
																(za("home"), V("register"));
															},
															children: [
																(0, p.jsx)(S, { n: "check", s: 16 }),
																" سجّل الآن",
															],
														}),
													],
												}),
									],
								}),
						],
					}),
					(0, p.jsx)("div", {
						className: "app-tabbar",
						children: [
							["home", "grid", "الرئيسية"],
							["trips", "route", "رحلاتي"],
							["earn", "wallet", "أرباحي"],
							["me", "user", "حسابي"],
						].map(([k, de, ve]) =>
							(0, p.jsxs)(
								"button",
								{
									className: Ia === k ? "on" : "",
									onClick: () => za(k),
									children: [(0, p.jsx)(S, { n: de }), ve],
								},
								k,
							),
						),
					}),
				],
			}),
		}),
	});
}
var A = jsxRuntime,
	y2 = [
		{
			id: "admin",
			name: "لوحة التحكم",
			desc: "قيادة المنصة بالكامل — العمليات، الشبكة، الإيرادات والتحليلات في مركز واحد.",
			icon: "layers",
			color: "#0d9488",
			bg: "#e4f7f4",
		},
		{
			id: "merchant",
			name: "بوابة النشاط التجاري",
			desc: "مطاعم وصيدليات وأسواق — أدر مناديبك أو اطلب مندوبًا بضغطة واحدة.",
			icon: "store",
			color: "#2f6bff",
			bg: "#e9efff",
		},
		{
			id: "company",
			name: "بوابة شركة التوصيل",
			desc: "مركز توزيع متقدم، إدارة مناديب وعملاء، ورسوم ثابتة لكل منطقة.",
			icon: "building",
			color: "#7c3aed",
			bg: "#f2ecfe",
		},
		{
			id: "courier",
			name: "تطبيق المندوب",
			desc: "بسيط ومرن: جاهزية بلمسة، طلبات واضحة، وأرباح كاملة بلا أي خصم.",
			icon: "bike",
			color: "#d97706",
			bg: "#fdf2e3",
		},
	];
function b2({ open: e }) {
	let [a, t] = we.default.useState(null);
	return (
		we.default.useEffect(() => {
			apiFetch("/api/wasl/stats")
				.then((l) => l.json())
				.then((l) => {
					l && l.ok && t(l.stats);
				})
				.catch(() => {});
		}, []),
		(0, A.jsxs)("div", {
			className: "launch",
			children: [
				(0, A.jsxs)("div", {
					className: "hero",
					children: [
						(0, A.jsx)("div", { className: "logo", children: "SX" }),
						(0, A.jsx)("h1", {
							children: "Super X — منظومة إدارة التوصيل المتكاملة",
						}),
						(0, A.jsx)("p", {
							children:
								"منصة واحدة تربط الأنشاط التجارية والمناديب في شبكة تشغيل واحدة — توصيل محلي منظم برسوم واضحة محسوبة على كل طلب.",
						}),
						(0, A.jsxs)("div", {
							className: "stats",
							children: [
								(0, A.jsxs)("div", {
									children: [
										(0, A.jsx)("b", { children: a ? a.merchants : "—" }),
										(0, A.jsx)("span", {
											children: "أنشطة مسجلة",
										}),
									],
								}),
								(0, A.jsxs)("div", {
									children: [
										(0, A.jsx)("b", { children: a ? a.companies : "—" }),
										(0, A.jsx)("span", {
											children: "شركات توصيل",
										}),
									],
								}),
								(0, A.jsxs)("div", {
									children: [
										(0, A.jsx)("b", { children: a ? a.couriers : "—" }),
										(0, A.jsx)("span", {
											children: "مناديب",
										}),
									],
								}),
								(0, A.jsxs)("div", {
									children: [
										(0, A.jsx)("b", {
											children: a ? a.ordersTotal : "—",
										}),
										(0, A.jsx)("span", {
											children: "طلب عبر المنصة",
										}),
									],
								}),
							],
						}),
					],
				}),
				(0, A.jsx)("div", {
					className: "pcards",
					children: y2.map((l) =>
						(0, A.jsxs)(
							"button",
							{
								className: "pcard",
								onClick: () => e(l.id),
								children: [
									(0, A.jsx)("div", {
										className: "ic",
										style: { background: l.bg, color: l.color },
										children: (0, A.jsx)(S, { n: l.icon, s: 24 }),
									}),
									(0, A.jsx)("b", { children: l.name }),
									(0, A.jsx)("p", { children: l.desc }),
									(0, A.jsxs)("span", {
										className: "go",
										children: ["دخول ", (0, A.jsx)(S, { n: "arrowL", s: 13 })],
									}),
								],
							},
							l.id,
						),
					),
				}),
				(0, A.jsx)("div", {
					style: { textAlign: "center", marginBottom: 26 },
					children: (0, A.jsxs)("button", {
						className: "btn btn-o btn-lg",
						onClick: () => e("register"),
						children: [
							(0, A.jsx)(S, { n: "plus", s: 15 }),
							" تسجيل جديد — نشاط تجاري أو شركة توصيل (كل مصر)",
						],
					}),
				}),
				(0, A.jsx)("div", {
					className: "ver",
					children: "Super X \xA9 2026 — منصة إدارة التوصيل",
				}),
			],
		})
	);
}
var Xm = class extends we.default.Component {
	constructor(a) {
		(super(a), (this.state = { err: null }));
	}
	static getDerivedStateFromError(a) {
		return { err: a };
	}
	render() {
		return this.state.err
			? (0, A.jsxs)("div", {
					style: {
						minHeight: "100vh",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						gap: 16,
					},
					children: [
						(0, A.jsx)("div", {
							style: { fontSize: 42 },
							children: (0, A.jsx)(S, { n: "alert", s: 42 }),
						}),
						(0, A.jsx)("b", {
							style: { fontSize: 18 },
							children: "حدث خطأ غير متوقع في هذه الشاشة",
						}),
						(0, A.jsx)("span", {
							style: { color: "var(--mut)", fontSize: 13 },
							children:
								"العمل باقي على باقي الصفحات — جرّب تعيد من غير ما تضيع حاجة.",
						}),
						(0, A.jsx)("button", {
							className: "btn btn-p",
							onClick: () => this.setState({ err: null }),
							children: "إعادة المحاولة",
						}),
					],
				})
			: this.props.children;
	}
};
function x2({ goPortal: e, toast: a }) {
	let [t, l] = we.default.useState("merchant"),
		[u, o] = we.default.useState(""),
		[n, i] = we.default.useState(""),
		[r, y] = we.default.useState("القاهرة"),
		[C, I] = we.default.useState(vl("القاهرة")[0]),
		[h, x] = we.default.useState(""),
		[D, H] = we.default.useState([]),
		[V, v] = we.default.useState(null),
		b = vl(r),
		c =
			u.trim().length > 2 &&
			n.trim().length >= 10 &&
			h.trim().length > 3 &&
			(t !== "company" || D.length > 0),
		[g, R] = we.default.useState("مطعم"),
		X = () => {
			let O = {
				type: t,
				name: u.trim(),
				phone: n.trim(),
				governorate: r,
				zone: C,
				address: h.trim(),
				businessType: t === "merchant" ? g : void 0,
				coverage: D,
			};
			apiFetch("/api/wasl/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(O),
			})
				.then((P) => (P.ok ? P.json() : null))
				.then((P) => {
					P && P.ok
						? (v({ ...O, ref: P.entity.ref }), a("تم تسجيل " + u + " بنجاح ✅"))
						: a("تعذر إكمال التسجيل الآن — تأكد من الاتصال وحاول مرة أخرى");
				})
				.catch(() =>
					a("تعذر إكمال التسجيل الآن — تأكد من الاتصال وحاول مرة أخرى"),
				);
		};
	return V
		? (0, A.jsx)("div", {
				className: "launch",
				children: (0, A.jsxs)("div", {
					className: "hero",
					children: [
						(0, A.jsx)("div", { className: "logo", children: "SX" }),
						(0, A.jsx)("h1", {
							children: "تم التسجيل بنجاح \u{1F389}",
						}),
						(0, A.jsxs)("p", {
							children: [
								(0, A.jsx)("b", { children: V.name }),
								" — ",
								V.type === "company" ? "شركة توصيل" : "نشاط تجاري",
								" في ",
								V.governorate,
								" / ",
								V.zone,
							],
						}),
						(0, A.jsx)("div", {
							className: "stats",
							children: (0, A.jsxs)("div", {
								children: [
									(0, A.jsx)("b", { children: V.ref }),
									(0, A.jsx)("span", {
										children: "رقم الحساب",
									}),
								],
							}),
						}),
						(0, A.jsxs)("div", {
							style: {
								display: "flex",
								gap: 10,
								justifyContent: "center",
								flexWrap: "wrap",
								marginTop: 8,
							},
							children: [
								(0, A.jsxs)("button", {
									className: "btn btn-p btn-lg",
									onClick: () =>
										e(V.type === "company" ? "company" : "merchant"),
									children: [
										"ادخل ",
										V.type === "company" ? "بوابة شركتك" : "بوابتك التجارية",
										" ",
										(0, A.jsx)(S, { n: "arrowL", s: 14 }),
									],
								}),
								(0, A.jsx)("button", {
									className: "btn btn-o btn-lg",
									onClick: () => {
										(v(null), o(""), i(""), x(""), H([]));
									},
									children: "تسجيل حساب آخر",
								}),
							],
						}),
					],
				}),
			})
		: (0, A.jsxs)("div", {
				className: "launch",
				children: [
					(0, A.jsxs)("div", {
						className: "hero",
						children: [
							(0, A.jsx)("div", { className: "logo", children: "SX" }),
							(0, A.jsx)("h1", {
								children: "تسجيل جديد — Super X",
							}),
							(0, A.jsx)("p", {
								children:
									"سجّل نشاطك التجاري أو شركة التوصيل الخاصة بك — بياناتك ومنطقتك ونطاق عملك، ويمكنك البدء من أي محافظة في مصر.",
							}),
						],
					}),
					(0, A.jsx)("div", {
						style: { maxWidth: 860, margin: "0 auto", width: "100%" },
						children: (0, A.jsxs)("div", {
							className: "pcard",
							style: { cursor: "default", width: "100%", maxWidth: "none" },
							children: [
								(0, A.jsx)("div", {
									className: "row",
									style: { gap: 10, marginBottom: 14 },
									children: [
										["merchant", "نشاط تجاري", "store"],
										["company", "شركة توصيل", "building"],
									].map(([O, P, fe]) =>
										(0, A.jsxs)(
											"button",
											{
												onClick: () => l(O),
												className: "btn btn-o",
												style: {
													flex: 1,
													borderColor: t === O ? "var(--brand)" : "var(--line)",
													color: t === O ? "var(--brandInk)" : "var(--mut)",
													background: t === O ? "var(--brandSoft)" : "#fff",
												},
												children: [(0, A.jsx)(S, { n: fe, s: 15 }), " ", P],
											},
											O,
										),
									),
								}),
								t === "merchant" &&
									(0, A.jsxs)("div", {
										className: "field",
										style: { marginBottom: 14 },
										children: [
											(0, A.jsx)("label", {
												children: "نوع النشاط",
											}),
											(0, A.jsx)("div", {
												className: "row",
												style: { gap: 8 },
												children: ["مطعم", "صيدلية", "سوبر ماركت", "أخرى"].map(
													(O) =>
														(0, A.jsxs)(
															"button",
															{
																onClick: () => R(O),
																className: "btn btn-o",
																style: {
																	borderColor:
																		g === O ? "var(--brand)" : "var(--line)",
																	color:
																		g === O ? "var(--brandInk)" : "var(--mut)",
																	background:
																		g === O ? "var(--brandSoft)" : "#fff",
																},
																children: [g === O ? "✓ " : "", O],
															},
															O,
														),
												),
											}),
										],
									}),
								(0, A.jsxs)("div", {
									className: "grid g2",
									style: { gap: 12 },
									children: [
										(0, A.jsxs)("div", {
											className: "field",
											children: [
												(0, A.jsxs)("label", {
													children: [
														"الاسم ",
														t === "company" ? "(اسم الشركة)" : "(اسم النشاط)",
													],
												}),
												(0, A.jsx)("input", {
													className: "inp",
													value: u,
													onChange: (O) => o(O.target.value),
													placeholder: "مثال: مطعم النيل / سرعة إكسبرس",
												}),
											],
										}),
										(0, A.jsxs)("div", {
											className: "field",
											children: [
												(0, A.jsx)("label", {
													children: "رقم الموبايل",
												}),
												(0, A.jsx)("input", {
													className: "inp",
													value: n,
													onChange: (O) => i(O.target.value),
													placeholder: "01xxxxxxxxx",
												}),
											],
										}),
										(0, A.jsxs)("div", {
											className: "field",
											children: [
												(0, A.jsx)("label", {
													children: "المحافظة",
												}),
												(0, A.jsx)("div", {
													className: "select",
													children: (0, A.jsx)("select", {
														className: "inp",
														value: r,
														onChange: (O) => {
															(y(O.target.value), I(vl(O.target.value)[0]));
														},
														children: du.map((O) =>
															(0, A.jsx)("option", { children: O.name }, O.id),
														),
													}),
												}),
											],
										}),
										(0, A.jsxs)("div", {
											className: "field",
											children: [
												(0, A.jsx)("label", {
													children: "المنطقة / مركز الشغل",
												}),
												(0, A.jsx)("div", {
													className: "select",
													children: (0, A.jsx)("select", {
														className: "inp",
														value: C,
														onChange: (O) => I(O.target.value),
														children: b.map((O) =>
															(0, A.jsx)("option", { children: O }, O),
														),
													}),
												}),
											],
										}),
									],
								}),
								(0, A.jsxs)("div", {
									className: "field",
									style: { marginTop: 12 },
									children: [
										(0, A.jsx)("label", {
											children: "العنوان بالتفصيل",
										}),
										(0, A.jsx)("input", {
											className: "inp",
											value: h,
											onChange: (O) => x(O.target.value),
											placeholder: "الشارع، رقم المبنى، علامة مميزة…",
										}),
									],
								}),
								t === "company" &&
									(0, A.jsxs)("div", {
										className: "field",
										style: { marginTop: 12 },
										children: [
											(0, A.jsx)("label", {
												children: "نطاق التغطية — المناطق التي تخدمها شركتك",
											}),
											(0, A.jsx)("div", {
												className: "row wrap",
												style: { gap: 7 },
												children: du.map((O) =>
													O.zones.map((P) =>
														(0, A.jsxs)(
															"button",
															{
																className: "btn btn-o btn-sm",
																onClick: () =>
																	H((fe) =>
																		fe.includes(P)
																			? fe.filter((W) => W !== P)
																			: [...fe, P],
																	),
																style: {
																	borderColor: D.includes(P)
																		? "var(--violet)"
																		: "var(--line)",
																	color: D.includes(P)
																		? "var(--violet)"
																		: "var(--mut)",
																	background: D.includes(P)
																		? "var(--violetSoft)"
																		: "#fff",
																},
																children: [D.includes(P) ? "✓ " : "", P],
															},
															P,
														),
													),
												),
											}),
											(0, A.jsx)("span", {
												className: "hint",
												children:
													"اختر كل المناطق التي يغطيها نطاقكم — وهي التي تظهر لكم عندما يطلب نشاط في منطقتكم شركة توصيل.",
											}),
										],
									}),
								(0, A.jsx)("div", { className: "hr" }),
								(0, A.jsxs)("button", {
									className: "btn btn-p btn-lg",
									disabled: !c,
									onClick: X,
									children: [
										(0, A.jsx)(S, { n: "send", s: 15 }),
										" إتمام التسجيل",
									],
								}),
								(0, A.jsx)("div", { style: { height: 8 } }),
								(0, A.jsxs)("button", {
									className: "btn btn-o",
									onClick: () => e("home"),
									children: [
										(0, A.jsx)(S, { n: "arrowL", s: 13 }),
										" رجوع للشاشة الرئيسية",
									],
								}),
							],
						}),
					}),
					(0, A.jsx)("div", {
						className: "ver",
						children:
							"يُحفظ تسجيلك رسميًا — ويُفعَّل حسابك بعد المراجعة والاعتماد",
					}),
				],
			});
}
function L2({ principal }) {
 const router = useRouter();
	let e = (() => {
			let N = (location.hash || "").replace(/^#/, ""),
				Q = N.indexOf("?");
			return new URLSearchParams(Q < 0 ? "" : N.slice(Q + 1));
		})(),
		a = principal.ref,
		t = e.get("page") || "",
		l = e.get("embed") === "1",
		[u, o] = we.default.useState(
			() => principal.role,
		),
		[n, i] = we.default.useState(
			() =>
				t ||
				(principal.role === "admin" ? "over" : "home"),
		),
		[r, y] = we.default.useState(
			[],
		),
		[C, setCouriers] = we.default.useState([]),
		[I, h] = we.default.useState(() => {
			try {
				return localStorage.getItem("wasl_courier_on") !== "0";
			} catch {
				return !0;
			}
		});
	we.default.useEffect(() => {
		try {
			localStorage.setItem("wasl_courier_on", I ? "1" : "0");
		} catch {}
	}, [I]);
	let [x, D] = we.default.useState(null),
		[, H] = we.default.useState(0),
		[V, v] = we.default.useState({
			mode: "auto",
			criteria: "balanced",
			allowFreelancers: !0,
			hasFleet: !0,
			payModel: { type: "per_order", value: 70 },
		}),
		[b, c] = we.default.useState({
			mode: "auto",
			criteria: "balanced",
			payModel: { type: "per_order", value: 40 },
		}),
		g = we.default.useRef({});
	g.current = { merchantCfg: V, companyCfg: b, courierOn: I };
	let [R, X] = we.default.useState(null),
		[O, P] = we.default.useState(!1);
	we.default.useEffect(() => {
		a &&
			apiFetch("/api/wasl/entities")
				.then((N) => N.json())
				.then((N) => {
					if (N && N.ok) {
						let Q = (N.entities || []).find((ae) => ae.ref === a);
						Q && X(Q.name);
					}
				})
				.catch(() => {});
	}, []);
	let fe = (N) => {
			(D(N), setTimeout(() => D(null), 2800));
		},
		W = (N) => {
   if (N === "home") { router.push("/"); return; }
   if (N !== principal.role) return;
   (o(N), i(N === "admin" ? "over" : "home"));
  },
		na = () => H((N) => N + 1),
		aa = we.default.useRef(4200),
  Ia = async (N, status, courierName) => {
   if (!N || !N.real) return false;
   const courier = C.find(item => item.name === courierName);
   try {
    const response = await apiFetch("/api/wasl/advance", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ ref: N.id, status, courierRef: courier?.ref }) });
    const data = await response.json();
    if (!response.ok || !data.order) { fe("لم تُحفظ الحالة — قد يكون الطلب تغيّر أو لا تملك صلاحية الإجراء."); return false; }
    y(previous => previous.map(item => item.id === N.id ? data.order : item)); return true;
   } catch { fe("تعذر حفظ الحالة. راجع اتصالك وأعد المحاولة."); return false; }
  },
  za = async (N) => {
   try {
    const response = await apiFetch("/api/wasl/orders", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ merchant: principal.name, merchantZone: principal.zone, fromAddr: principal.address, destZone: N.zone, toAddr: N.to, fee: N.fee, pay: N.pay, kind: N.kind, customerPhone: N.cust, customerName: N.custName, note: N.note, total: N.total, readyMinutes: N.readyMin, source: N.source }) });
    const data = await response.json();
    if (!response.ok || !data.order) { fe("لم يتم حفظ الطلب. راجع البيانات واتصال الخدمة؛ لن نعرض طلبًا وهميًا."); return false; }
    y(previous => [data.order, ...previous]); fe("تم حفظ الطلب بنجاح"); return true;
   } catch { fe("تعذر حفظ الطلب. بيانات الطلب لم تُرسل بنجاح."); return false; }
  },
  jt = (ref, courier) => Ia(r.find(order => order.id === ref), "accepted", courier),
  ba = () => fe("الرفض لا يغير الطلب المحفوظ؛ راجع الإسناد مع مالك الحساب."),
  Z = (ref, status) => Ia(r.find(order => order.id === ref), status),
  ge = (ref, courier) => Ia(r.find(order => order.id === ref), "accepted", courier);
 we.default.useEffect(() => {
  if (principal.role === "merchant" || principal.role === "company") apiFetch("/api/wasl/couriers?ownerRef=" + encodeURIComponent(principal.ref)).then(response => response.json()).then(data => { if (data.ok) setCouriers(data.couriers || []); }).catch(() => {});
 }, [principal.ref]);

	we.default.useEffect(() => {
		let N = () => {
			apiFetch("/api/wasl/orders")
				.then((ae) => (ae.ok ? ae.json() : null))
				.then((ae) => {
					ae &&
						ae.ok &&
						Array.isArray(ae.orders) &&
						y((Ie) => {
							let re = new Map(ae.orders.map((ve) => [ve.id, ve])),
								ot = Date.now(),
								k = new Set(
									Ie.filter(
										(ve) => ve.real && re.has(ve.id) && ot - (ve.ts || 0) < 6e3,
									).map((ve) => ve.id),
								),
								de = Ie.filter(
									(ve) => !ve.real || !re.has(ve.id) || k.has(ve.id),
								);
							return [
								...ae.orders.map((ve) => ({ ...ve })),
								...de.filter((ve) => !ve.real),
							];
						});
				})
				.catch(() => {});
		};
		N();
		let Q = setInterval(N, 15e3);
		return () => clearInterval(Q);
	}, []);
	let je = {
		orders: r,
		couriers: C,
		courierOn: I,
		setCourierOn: h,
		newRequest: za,
		acceptOrder: jt,
		declineOrder: ba,
		advanceOrder: Z,
		assignOrder: ge,
		merchantCfg: V,
		setMerchantCfg: v,
		companyCfg: b,
		setCompanyCfg: c,
		toast: fe,
		force: na,
	};
	if (u === "home")
		return (0, A.jsxs)(A.Fragment, {
			children: [
				(0, A.jsx)(b2, { open: W }),
				x &&
					(0, A.jsxs)("div", {
						className: "toast",
						role: "status",
						"aria-live": "polite",
						children: [(0, A.jsx)(S, { n: "check" }), x],
					}),
			],
		});
	if (u === "register")
		return (0, A.jsxs)(A.Fragment, {
			children: [
				(0, A.jsx)(x2, { goPortal: W, toast: fe }),
				x &&
					(0, A.jsxs)("div", {
						className: "toast",
						children: [(0, A.jsx)(S, { n: "check" }), x],
					}),
			],
		});
	if (u === "courier")
		return (0, A.jsxs)(A.Fragment, {
			children: [
				(0, A.jsx)(Vm, { store: je }),
				x &&
					(0, A.jsxs)("div", {
						className: "toast",
						children: [(0, A.jsx)(S, { n: "check" }), x],
					}),
			],
		});
	if (u === "merchant" && l)
		return (0, A.jsxs)("div", {
			style: {
				minHeight: "100vh",
				background: "var(--paper,#f6f7f9)",
				padding: "22px 16px 40px",
			},
			children: [
				(0, A.jsxs)("div", {
					style: { maxWidth: 880, margin: "0 auto" },
					children: [
						(0, A.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: 11,
								marginBottom: 16,
							},
							children: [
								(0, A.jsx)("span", {
									style: {
										width: 40,
										height: 40,
										borderRadius: 13,
										background: "var(--brandSoft)",
										color: "var(--brandInk)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									},
									children: (0, A.jsx)(S, { n: "store", s: 18 }),
								}),
								(0, A.jsxs)("div", {
									children: [
										(0, A.jsx)("b", {
											style: { fontSize: 15.5 },
											children: R || "المطعم",
										}),
										(0, A.jsx)("div", {
											className: "sub",
											style: { fontSize: 11.5 },
											children: "طلب مندوب توصيل — خدمة Super X",
										}),
									],
								}),
								(0, A.jsx)("a", {
									href: "/wasl/index.html?full=1#merchant?ref=" + a,
									className: "btn btn-o btn-sm",
									style: { marginInlineStart: "auto" },
									children: "لوحة التحكم الكاملة",
								}),
							],
						}),
						(0, A.jsx)("style", {
							children: ".embedOrder .topbar{display:none!important}",
						}),
						(0, A.jsx)("div", {
							className: "embedOrder",
							children: (0, A.jsx)(cf, {
								cur: "newreq",
								go: () => {},
								store: je,
								initialRef: a,
							}),
						}),
					],
				}),
				x &&
					(0, A.jsxs)("div", {
						className: "toast",
						children: [(0, A.jsx)(S, { n: "check" }), x],
					}),
			],
		});
	let J = u === "admin" ? _m : u === "merchant" ? qm : Fm,
		Zt =
			u === "merchant"
				? J.map((N) => ({
						...N,
						items: N.items.filter((Q) => Q.id !== "pool" || O),
					})).filter((N) => N.items.length)
				: J,
		Ce = {
			admin: {
				logo: "SX",
				name: "Super X",
				role: "لوحة تحكم المنصة",
				footNote: {
					title: "حالة النظام",
					text: "راجع حالات الاتصال قبل تنفيذ الإجراء.",
				},
			},
			merchant: {
				logo: "SX",
				name: R || "حساب النشاط",
				role: "بوابة النشاط التجاري",
				footNote: {
					title: "منطقة التشغيل",
					text: "تتحدد تلقائيًا من ملف نشاطك المسجّل في Super X.",
				},
			},
			company: {
				logo: "س",
				name: principal.name,
				role: "بوابة شركة التوصيل",
				footNote: {
					title: "حساب شركتك",
					text: "صلاحيات الشركة وبياناتها مرتبطة بالجلسة المسجلة.",
				},
			},
		}[u];
	return (0, A.jsxs)("div", {
		className: "shell",
		children: [
			(0, A.jsx)(q0, { nav: Zt, cur: n, go: i, ...Ce }),
			(0, A.jsxs)("main", {
				className: "main",
				children: [
					u === "admin" && (0, A.jsx)(Um, { cur: n, go: i, store: je }),
					u === "merchant" &&
						(0, A.jsx)(cf, {
							cur: n,
							go: i,
							store: je,
							initialRef: a,
							onHasPool: P,
						}),
					u === "company" && (0, A.jsx)(Gm, { cur: n, go: i, store: je, initialRef: principal.ref }),
				],
			}),
			x &&
				(0, A.jsxs)("div", {
					className: "toast",
					children: [(0, A.jsx)(S, { n: "check" }), x],
				}),
		],
	});
}

export default function WaslPortal({ principal }) {
	return jsxRuntime.jsx(Xm, { children: jsxRuntime.jsx(L2, { principal }) });
}
