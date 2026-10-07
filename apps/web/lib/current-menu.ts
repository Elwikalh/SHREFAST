import { eq } from "drizzle-orm"
import { auditLog, db, menuItems } from "@el7bboB/db"

type Category = (typeof menuItems.$inferInsert)["category"]
type Row = [string, string, Category, string, string, number, string?]
const MARKER = "menu_catalog_reference_2026_09"
const rows: Row[] = [
["foul-el7bbob","فول الحبوب","base_item","15","foul-sandwich.svg",10],
["foul-spicy-oil","فول زيت حار","base_item","17","foul-sandwich.svg",20],
["foul-butter","فول بالزبدة","base_item","18","foul-sandwich.svg",30],
["foul-taameya","فول بالطعمية","base_item","18","foul-sandwich.svg",40],
["foul-potato","فول بالبطاطس","base_item","20","foul-sandwich.svg",50],
["foul-cheese","فول بالجبنة","base_item","22","foul-sandwich.svg",60],
["foul-egg","فول بالبيض","base_item","23","foul-sandwich.svg",70,"متاح عيش فينو أو نصين بلدي صغير"],
["taameya-el7bbob","طعمية الحبوب","base_item","10","mezze.svg",80],
["taameya-eggplant","طعمية بالباذنجان","base_item","14","babaganoug.svg",90],
["taameya-potato","طعمية بالبطاطس","base_item","14","potato.svg",100],
["taameya-cheese","طعمية بالجبنة","base_item","16","egg-cheese.svg",110],
["taameya-egg","طعمية بالبيض","base_item","18","egg-cheese.svg",120],
["egg-boiled","بيض مسلوق","base_item","8","egg-cheese.svg",130],
["egg-omelette","بيض أومليت","base_item","15","egg-cheese.svg",140],
["egg-cheese","بيض بالجبنة","base_item","20","egg-cheese.svg",150],
["egg-pizza","بيتزا","base_item","22","egg-cheese.svg",160],
["egg-basterma","بيض بالبسطرمة","base_item","25","egg-cheese.svg",170],
["cheese-feta","جبنة فيتا","base_item","12","egg-cheese.svg",180],
["cheese-istanbuli","جبنة إسطنبولي","base_item","14","egg-cheese.svg",190],
["cheese-old","جبنة قديمة","base_item","16","egg-cheese.svg",200],
["cheese-roumy","جبنة رومي","base_item","18","egg-cheese.svg",210],
["cheese-cheddar","جبنة شيدر","base_item","18","egg-cheese.svg",220],
["cheese-mix","ميكس جبن","base_item","22","egg-cheese.svg",230],
["potato-fried","بطاطس مقلية","base_item","12","potato.svg",240],
["potato-mashed","بطاطس مهروسة متبلة","base_item","14","potato.svg",250],
["potato-cheese","بطاطس بالجبنة","base_item","18","potato.svg",260],
["potato-shrimp","بطاطس جمبري","base_item","18","potato.svg",270],
["potato-shrimp-cheese","بطاطس جمبري بالجبنة","base_item","22","potato.svg",280],
["eggplant-duqqa","باذنجان مقلي بالدقة","base_item","14","babaganoug.svg",290],
["eggplant-soaked-duqqa","باذنجان بايت في الدقة","base_item","16","babaganoug.svg",300],
["sweet-halawa","حلاوة","base_item","15","mezze.svg",310],
["sweet-halawa-cream","حلاوة بالقشطة","base_item","20","mezze.svg",320],
["sweet-jam","مربى","base_item","15","mezze.svg",330],
["sweet-jam-cream","مربى بالقشطة","base_item","20","mezze.svg",340],
["sweet-white-honey","عسل أبيض","base_item","18","mezze.svg",350],
["sweet-white-honey-cream","عسل أبيض بالقشطة","base_item","23","mezze.svg",360],
["sweet-white-honey-sakalance","سكلنس عسل أبيض","base_item","28","mezze.svg",370],
["sweet-black-honey-tahini","عسل أسود بالطحينة","base_item","18","mezze.svg",380],
["sweet-black-honey-sakalance","سكلنس عسل أسود","base_item","25","mezze.svg",390,"كل الحلو عيش فينو"],
["roqan-mesh","روقان مش","mix","45","mezze.svg",10,"بيض + جبنة قديمة مش + بطاطس"],
["roqan-cheese","روقان جبنة","mix","45","egg-cheese.svg",20,"بيض + جبنة بيضا براميلي + بطاطس"],
["roqan-tuna","روقان تونة","mix","55","mezze.svg",30,"تونة متوضبة عراقي + بطاطس + فينو"],
["roqan-sweet","روقان الحلو","mix","55","mezze.svg",40,"حلاوة + زبدة + عسل أبيض + مربى + مكسرات + فينو"],
["tuna-sandwich","ساندويتش تونة","mix","25","mezze.svg",50,"عيش فينو"],
["tub-foul","علب فول الحبوب","platter","15","foul-pan.svg",10,"صغيرة 15 · وسط 25 · كبيرة 40"],
["taameya-small-piece","طعمية صغيرة — قطعة","platter","3","mezze.svg",20],
["taameya-large-piece","طعمية كبيرة — قطعة","platter","5","mezze.svg",30],
["tub-potato","علبة بطاطس","platter","15","potato.svg",40,"صغيرة · كبيرة"],
["tub-eggplant","علبة باذنجان","platter","15","babaganoug.svg",50,"صغيرة · كبيرة"],
["boiled-egg-piece","بيضة مسلوقة","platter","8","egg-cheese.svg",60],
["tub-cottage-cheese","علبة جبنة قريش","platter","25","egg-cheese.svg",70],
["tub-cheese-mix","علبة ميكس جبن","platter","30","egg-cheese.svg",80],
["mix-el7bbob-tub","ميكس الحبوب","platter","30","mezze.svg",90,"صغير · كبير"],
["table-two","طبلية فردين","platter","120","mezze.svg",100,"أطباق فول وطعمية وبطاطس وباذنجان وبيض على الصينية — بدون ساندويتشات"],
["table-three","طبلية 3 أفراد","platter","175","mezze.svg",110],
["table-four","طبلية 4 أفراد","platter","225","mezze.svg",120],
["table-five","طبلية 5 أفراد","platter","275","mezze.svg",130],
["table-six","طبلية 6 أفراد","platter","325","mezze.svg",140],
["box-solo","بوكس فردي","breakfast_box","50","mezze.svg",10,"تشكيلة ساندوتشات + سلطة ومخلل"],
["box-two","بوكس لشخصين","breakfast_box","90","mezze.svg",20,"تشكيلة ساندوتشات + حمص + سلطة ومخلل"],
["box-family","بوكس عائلي","breakfast_box","160","mezze.svg",30,"تشكيلة ساندوتشات + حمص + سلطة ومخلل"],
["extra-tahini","طحينة إضافية","addon","6","mezze.svg",10],
["extra-egg","بيضة","addon","8","egg-cheese.svg",20],
["extra-taameya","قطعة طعمية","addon","3","mezze.svg",30],
["extra-potato","بطاطس","addon","8","potato.svg",40],
["extra-cheese","جبنة","addon","8","egg-cheese.svg",50],
["extra-bread","عيش إضافي","addon","2","foul-sandwich.svg",60],
["extra-dry-bread","عيش ناشف الحبوب","addon","5","foul-sandwich.svg",70]
]

export async function syncCurrentMenu() {
	const [done] = await db.select({ id: auditLog.id }).from(auditLog).where(eq(auditLog.action, MARKER)).limit(1)
	if (done) return
	await db.transaction(async (tx) => {
		await tx.update(menuItems).set({ isAvailable: false, updatedAt: new Date() })
		for (const [slug, nameAr, category, priceEGP, image, sortOrder, descriptionAr] of rows) {
			const values = { slug, nameAr, nameEn: nameAr, category, priceEGP, costEGP: "0", isAvailable: true, sortOrder, photoDataUrl: `/food/${image}`, descriptionAr: descriptionAr ?? null, descriptionEn: null, updatedAt: new Date() }
			await tx.insert(menuItems).values(values).onConflictDoUpdate({ target: menuItems.slug, set: values })
		}
		await tx.insert(auditLog).values({ action: MARKER, entityType: "menu", entityId: "current", reason: "Replaced storefront menu from approved reference image", metadataJson: { itemCount: rows.length } })
	})
}
