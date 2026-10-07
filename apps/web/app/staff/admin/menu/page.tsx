import { isSandwichBread, sandwichBreadEligible } from "@/app/sandwich-bread";
import { loadSandwichBreadCatalog } from "@/app/sandwich-bread-store";
import { asc } from "drizzle-orm";
import { UtensilsCrossed } from "lucide-react";
import { db, menuItems } from "@el7bboB/db";
import { requireAdmin } from "@/lib/staff-session";
import { MenuAdminPanel } from "./menu-admin-panel";
import { ensureDefaultBreadPricingForCurrentProducts } from "./default-bread-pricing";

export const dynamic = "force-dynamic";

export default async function MenuAdminPage() {
  await requireAdmin();
  await ensureDefaultBreadPricingForCurrentProducts();

  const [rows, breadCatalog] = await Promise.all([
    db
      .select()
      .from(menuItems)
      .orderBy(asc(menuItems.category), asc(menuItems.sortOrder)),
    loadSandwichBreadCatalog(),
  ]);
  const breadById = new Map(
    breadCatalog.products.map((product) => [product.id, product]),
  );
  const allItems = rows.filter((item) => !isSandwichBread(item.slug));

  return (
    <main className="mx-auto max-w-5xl">
      <div className="card mb-5 flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--sesame)] text-[var(--amber-deep)]">
            <UtensilsCrossed className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-black text-[var(--ink)]">المينيو والأسعار</h1>
            <p className="mt-0.5 text-sm font-bold text-[var(--ink)]/50">
              الأسعار والصور والوصف وترتيب الأصناف وتسعير البلدي والفينو
            </p>
          </div>
        </div>
        <span className="num chip-outline">{allItems.length} صنف</span>
      </div>

      <MenuAdminPanel
        items={allItems.map((item) => {
          const breadConfig = sandwichBreadEligible(item)
            ? breadCatalog.configs[item.id]
            : undefined;
          return {
            id: item.id,
            slug: item.slug,
            nameAr: item.nameAr,
            nameEn: item.nameEn,
            category: item.category,
            priceEGP: item.priceEGP,
            costEGP: item.costEGP,
            isAvailable: item.isAvailable,
            sortOrder: item.sortOrder,
            photoDataUrl: item.photoDataUrl,
            photosJson: item.photosJson ?? null,
            descriptionAr: item.descriptionAr ?? null,
            descriptionEn: item.descriptionEn ?? null,
            breadPricing: breadConfig
              ? {
                  enabled: breadConfig.enabled,
                  variants: breadConfig.variants.map((variant) => ({
                    ...variant,
                    priceEGP: String(breadById.get(variant.id)?.priceEGP ?? ""),
                  })),
                }
              : null,
          };
        })}
      />
    </main>
  );
}
