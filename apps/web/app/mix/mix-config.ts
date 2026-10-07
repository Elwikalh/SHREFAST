export const CUSTOM_MIX_SLUG = "mix-custom"
export const MIX_MIN_COMPONENTS = 2
export const MIX_MAX_COMPONENTS = 5
export const CUSTOM_MIX_NAME_AR = "ميكس حسب اختيارك"
export const CUSTOM_MIX_NAME_EN = "Build your own mix"

export const MIX_COMPONENTS = [
	{ slug:"foul-sada", matchAr:"فول سادة", nameAr:"فول", nameEn:"Foul", priceEGP:7 },
	{ slug:"batates-mehamara", matchAr:"بطاطس محمرة", nameAr:"بطاطس", nameEn:"Potatoes", priceEGP:6 },
	{ slug:"gebna-beida", matchAr:"جبنة بيضاء", nameAr:"جبنة بيضاء", nameEn:"White cheese", priceEGP:7 },
	{ slug:"gebna-adima", matchAr:"جبنة قديمة", nameAr:"جبنة قديمة", nameEn:"Aged cheese", priceEGP:10 },
	{ slug:"beid-omelette", matchAr:"بيض", nameAr:"بيض", nameEn:"Egg", priceEGP:9 },
	{ slug:"betengan-mikli", matchAr:"باذنجان", nameAr:"باذنجان", nameEn:"Eggplant", priceEGP:6 },
	{ slug:"babaghanoug", matchAr:"بابا", nameAr:"بابا غنوج", nameEn:"Baba ghanoush", priceEGP:7 },
	{ slug:"hummus-tahina", matchAr:"حمص", nameAr:"حمص", nameEn:"Hummus", priceEGP:8 },
	{ slug:"tuna", matchAr:"تونة", nameAr:"تونة", nameEn:"Tuna", priceEGP:15 },
	{ slug:"halawa-tahiniya", matchAr:"حلاوة", nameAr:"حلاوة طحينية", nameEn:"Halawa", priceEGP:7 },
	{ slug:"addon-tahini", matchAr:"طحينة", nameAr:"طحينة", nameEn:"Tahini", priceEGP:4 },
	{ slug:"addon-pickles", matchAr:"مخلل", nameAr:"مخلل", nameEn:"Pickles", priceEGP:3 },
	{ slug:"addon-shatta", matchAr:"شطة", nameAr:"شطة ودقة", nameEn:"Chili & dukkah", priceEGP:2 },
] as const

export type MixSetting = { slug:string; priceEGP:number; enabled:boolean; sortOrder:number }
export function defaultMixSettings(): MixSetting[] {
	return MIX_COMPONENTS.map((item,index) => ({ slug:item.slug, priceEGP:item.priceEGP, enabled:true, sortOrder:index }))
}
export function parseMixSettings(value: unknown): MixSetting[] {
	if (!Array.isArray(value) || value.length === 0) return defaultMixSettings()
	const parsed: MixSetting[] = []
	for (const entry of value) {
		if (typeof entry !== "string") continue
		try {
			const item = JSON.parse(entry) as Partial<MixSetting>
			if (typeof item.slug === "string" && typeof item.priceEGP === "number" && Number.isFinite(item.priceEGP) && item.priceEGP >= 0 && typeof item.enabled === "boolean") parsed.push({ slug:item.slug, priceEGP:item.priceEGP, enabled:item.enabled, sortOrder:typeof item.sortOrder === "number" ? item.sortOrder : parsed.length })
		} catch { /* Ignore malformed legacy gallery values on the hidden container. */ }
	}
	return parsed.length ? parsed.sort((a,b) => a.sortOrder-b.sortOrder) : defaultMixSettings()
}
export function serializeMixSettings(settings: MixSetting[]): string[] {
	return settings.map((item,index) => JSON.stringify({ slug:item.slug, priceEGP:item.priceEGP, enabled:item.enabled, sortOrder:index }))
}
