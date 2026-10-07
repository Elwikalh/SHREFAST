// Offline product-name glossary. No external service, keys, or recipe inference.
function normalize(value: string) {
	return value.normalize("NFKC").replace(/[\u064B-\u065F\u0670\u0640]/g, "")
		.replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه")
		.replace(/\s+/g, " ").trim()
}
const names: Record<string, string> = {
	"فول": "Foul", "فول سادة": "Plain Foul", "فول الحبوب": "El7bboB Foul",
	"فول بالسمنة البلدي": "Foul with Baladi Ghee", "فول بالزيت الحار": "Foul with Spicy Oil",
	"فول زيت حار": "Foul with Spicy Oil", "فول إسكندراني": "Alexandrian Foul",
	"بطاطس": "Potatoes", "بطاطس محمرة": "Fried Potatoes", "بطاطس مقلية": "Fried Potatoes",
	"بطاطس مهروسة متبلة": "Seasoned Mashed Potatoes",
	// Gambari is the approved dish's name; do not invent seafood ingredients.
	"بطاطس جمبري": "Gambari-Style Potatoes", "بطاطس جمبري بالجبنة": "Gambari-Style Potatoes with Cheese",
	"طعمية": "Taameya", "طعمية الحبوب": "El7bboB Taameya",
	"طعمية صغيرة — قطعة": "Small Taameya Piece", "طعمية كبيرة — قطعة": "Large Taameya Piece",
	"بيض": "Egg", "بيضة": "Egg", "بيض مسلوق": "Boiled Egg", "بيضة مسلوقة": "Boiled Egg",
	"بيض أومليت": "Omelette", "بيض عجة بلدي": "Baladi Omelette",
	"جبنة": "Cheese", "جبنة بيضاء": "White Cheese", "جبنة بيضا": "White Cheese",
	"جبنة قديمة": "Aged Cheese", "جبنة قديمة / مقلية": "Aged / Fried Cheese",
	"جبنة فيتا": "Feta Cheese", "جبنة إسطنبولي": "Istanbuli Cheese", "جبنة رومي": "Roumy Cheese",
	"جبنة شيدر": "Cheddar Cheese", "جبنة قريش": "Cottage Cheese", "ميكس جبن": "Cheese Mix",
	"باذنجان": "Eggplant", "بتنجان": "Eggplant", "باذنجان مقلي": "Fried Eggplant",
	"باذنجان مقلي بالدقة": "Fried Eggplant with Duqqa", "باذنجان بايت في الدقة": "Duqqa-Marinated Eggplant",
	"باباغنوج": "Baba Ghanoush", "حمص": "Hummus", "حمص بالطحينة": "Hummus with Tahini",
	"تونة": "Tuna", "بيتزا": "Pizza", "حلاوة": "Halawa", "حلاوة طحينية": "Halawa",
	"مربى": "Jam", "عسل أبيض": "Honey", "عسل أسود": "Molasses",
	"سكلنس عسل أبيض": "Sakalance with Honey", "سكلنس عسل أسود": "Sakalance with Molasses",
	"روقان مش": "Roqaan Mish", "روقان جبنة": "Roqaan Cheese", "روقان تونة": "Roqaan Tuna",
	"روقان الحلو": "Sweet Roqaan", "ميكس حسب اختيارك": "Build Your Own Mix",
	"ديناميت الحبوب": "El7bboB Dynamite", "ديناميت الحبّوب": "El7bboB Dynamite",
	"ميكس الحبوب": "El7bboB Mix", "ميكس الحبوب الكبير": "El7bboB Big Mix",
	"علب فول الحبوب": "El7bboB Foul Tubs", "بوكس فردي": "Solo Sandwich Box",
	"بوكس الفرد": "Solo Sandwich Box", "بوكس لشخصين": "Sandwich Box for Two",
	"بوكس الاتنين": "Sandwich Box for Two", "بوكس عائلي": "Family Sandwich Box", "بوكس العيلة": "Family Sandwich Box",
	"طبلية فردين": "Breakfast Tray for Two", "طبلية 3 أفراد": "Breakfast Tray for 3",
	"طبلية 4 أفراد": "Breakfast Tray for 4", "طبلية 5 أفراد": "Breakfast Tray for 5", "طبلية 6 أفراد": "Breakfast Tray for 6",
	"سلطة خضراء": "Green Salad", "طحينة": "Tahini", "طحينة إضافية": "Extra Tahini",
	"مخلل": "Pickles", "مخلل بلدي": "Baladi Pickles", "عيش إضافي": "Extra Bread", "عيش زيادة": "Extra Bread",
	"عيش ناشف الحبوب": "El7bboB Dry Bread", "قطعة طعمية": "Taameya Piece", "بيضة زيادة": "Extra Egg",
	"جبنة زيادة": "Extra Cheese", "شطة أو دقة": "Chili or Duqqa", "زبادي": "Yogurt",
	"شاي": "Tea", "شاي / نعناع / قرفة": "Tea / Mint / Cinnamon",
	"عصير قصب أو ليمون": "Sugarcane or Lemon Juice", "عصير قصب": "Sugarcane Juice", "عصير ليمون": "Lemon Juice",
	"قهوة": "Coffee", "مياه": "Water", "مياه معدنية": "Mineral Water",
}
const glossary = new Map(Object.entries(names).map(([ar, en]) => [normalize(ar), en]))
const fillings: Record<string, string> = {
	"بطاطس": "Potatoes", "طعميه": "Taameya", "جبنه": "Cheese", "بيض": "Egg",
	"باذنجان": "Eggplant", "بتنجان": "Eggplant", "فول": "Foul", "قشطه": "Cream",
	"طحينه": "Tahini", "بسطرمه": "Basterma", "زبده": "Butter", "سمنه بلدي": "Baladi Ghee",
}
function knownName(name: string, depth = 0): string | undefined {
	if (depth > 3) return undefined
	const exact = glossary.get(name)
	if (exact) return exact
	const sized = name.match(/^(.*?)\s*(?:[—-]\s*)?(صغيره?|وسط|كبيره?)$/)
	if (sized?.[1] && sized[2]) {
		const base = knownName(sized[1].replace(/[—-]\s*$/, "").trim(), depth + 1)
		if (base) return `${base} — ${sized[2].startsWith("صغير") ? "Small" : sized[2] === "وسط" ? "Medium" : "Large"}`
	}
	const wrapped = name.match(/^(ساندوتش|ساندويتش|علبه|طبق|طاسه|باكيت|باكت|بكيت)\s+(.+)$/)
	if (wrapped?.[1] && wrapped[2]) {
		const base = knownName(wrapped[2], depth + 1)
		const suffix: Record<string, string> = { ساندوتش: "Sandwich", ساندويتش: "Sandwich", علبه: "Tub", طبق: "Plate", طاسه: "Platter", باكيت: "Pack", باكت: "Pack", بكيت: "Pack" }
		if (base) return `${base} ${suffix[wrapped[1]]}`
	}
	const withFilling = name.match(/^(.+?) بال(.+)$/)
	if (withFilling?.[1] && withFilling[2]) {
		const base = knownName(withFilling[1], depth + 1)
		const filling = fillings[withFilling[2]]
		if (base && filling) return `${base} with ${filling}`
	}
	return undefined
}
const letters: Record<string, string> = {
	ا: "a", ب: "b", ت: "t", ث: "th", ج: "g", ح: "h", خ: "kh", د: "d", ذ: "dh", ر: "r", ز: "z",
	س: "s", ش: "sh", ص: "s", ض: "d", ط: "t", ظ: "z", ع: "a", غ: "gh", ف: "f", ق: "q", ك: "k",
	ل: "l", م: "m", ن: "n", ه: "h", و: "w", ي: "y", ء: "'", ؤ: "w", ئ: "y",
	"٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4", "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
}
export function hasArabic(value: string) { return /[\u0600-\u06ff]/.test(value) }
export function menuNameToEnglish(nameAr: string): { text: string; mode: "translated" | "transliterated" } {
	const name = normalize(nameAr)
	const translated = knownName(name)
	if (translated) return { text: translated, mode: "translated" }
	// An unfamiliar/brand name is spelled in Latin letters, not guessed as a dish.
	const text = Array.from(name).map((letter) => letters[letter] ?? letter).join("")
		.replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
	return { text, mode: "transliterated" }
}

// Generate only missing/Arabic English names; preserve an approved Latin name.
export function withAutomaticEnglishName<T extends { nameAr: string; nameEn: string }>(input: T): T {
	if (input.nameEn.trim() && !hasArabic(input.nameEn)) return input
	return { ...input, nameEn: menuNameToEnglish(input.nameAr).text }
}
