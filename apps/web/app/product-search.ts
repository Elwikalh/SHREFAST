// Search only the customer-visible parent products passed to HomeView.
// Never expand bread choices or builder components into search results.
export type SearchableProduct = {
  nameAr: string
  nameEn: string
  slug: string
  descriptionAr?: string | null
  descriptionEn?: string | null
}

export function normalizeProductSearch(value: string): string {
  return value.normalize("NFKC")
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/[ىی]/g, "ي")
    .replace(/ة/g, "ه")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
}

export function matchesProductSearch(product: SearchableProduct, query: string): boolean {
  const normalized = normalizeProductSearch(query)
  if (!normalized) return true
  const fields = [product.nameAr, product.nameEn, product.descriptionAr,
    product.descriptionEn, product.slug].map(value => normalizeProductSearch(value ?? ""))
  return normalized.split(" ").every(word => fields.some(field => field.includes(word)))
}
