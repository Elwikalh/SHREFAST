export type SavedProductExtra = { id: string; nameAr: string; priceEGP: string }
export function extraNameKey(name: string): string { return name.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("ar") }
export function buildExtrasLibrary(saved: SavedProductExtra[]): SavedProductExtra[] {
	const choices = new Map<string, SavedProductExtra>()
	for (const row of saved) {
		const nameAr = row.nameAr.trim(), price = Number(row.priceEGP)
		if (!nameAr || nameAr.length > 80 || !/^\d+(?:\.\d{1,2})?$/.test(row.priceEGP) || !Number.isFinite(price) || price < 0 || price > 10000) continue
		const priceEGP = price.toFixed(2), key = JSON.stringify([extraNameKey(nameAr), priceEGP])
		if (!choices.has(key)) choices.set(key, { id: row.id, nameAr, priceEGP })
	}
	return Array.from(choices.values()).sort((a, b) => a.nameAr.localeCompare(b.nameAr, "ar") || Number(a.priceEGP) - Number(b.priceEGP))
}
