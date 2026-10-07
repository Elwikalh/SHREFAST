import "server-only";

import { randomUUID } from "node:crypto";
import { asc, eq, like, sql } from "drizzle-orm";
import { db, menuItems, siteSettings } from "@el7bboB/db";
import {
  parseSandwichBread,
  sandwichBreadEligible,
  sandwichBreadKey,
  SANDWICH_BREAD_PREFIX,
  SANDWICH_BREADS,
} from "@/app/sandwich-bread";

const BALADI_PRICE_RATIO = 1.3;
const BALADI_RATIO_MIGRATION_KEY = "migration:bread-pricing-ratio-1.3";

function suggestedBaladiPrice(finoPrice: number) {
  return Math.round(finoPrice * BALADI_PRICE_RATIO);
}

/**
 * Defaults for products that have never had bread pricing, plus a one-time
 * normalization of the current catalog. A baladi loaf split into two filled
 * halves is estimated to use roughly 50% more filling than one fino roll.
 * Because the baladi bread itself is cheaper, the temporary retail suggestion
 * is a rounded 30% premium rather than the full 50%.
 */
export async function ensureDefaultBreadPricingForCurrentProducts() {
  const [products, settings] = await Promise.all([
    db.select().from(menuItems).orderBy(asc(menuItems.sortOrder)),
    db.select().from(siteSettings).where(like(siteSettings.id, "sandwich_bread:%")),
  ]);
  const configured = new Set(
    settings
      .filter(
        (row) =>
          row.id.startsWith("sandwich_bread:") &&
          parseSandwichBread(row.heroImageDataUrl),
      )
      .map((row) => row.id.slice("sandwich_bread:".length)),
  );
  const candidates = products.filter(
    (product) =>
      sandwichBreadEligible(product) &&
      !configured.has(product.id) &&
      Number.isFinite(Number(product.priceEGP)) &&
      Number(product.priceEGP) > 0,
  );
  return db.transaction(async (transaction) => {
    await transaction.execute(sql`select pg_advisory_xact_lock(741073, 2)`);

    const [ratioMigration] = await transaction
      .select({ id: siteSettings.id })
      .from(siteSettings)
      .where(eq(siteSettings.id, BALADI_RATIO_MIGRATION_KEY))
      .limit(1);
    if (!ratioMigration) {
      const productsById = new Map(products.map((product) => [product.id, product]));
      for (const setting of settings) {
        const config = parseSandwichBread(setting.heroImageDataUrl);
        if (!config) continue;
        const fino = config.variants.find((variant) => variant.kind === "fino");
        const baladi = config.variants.find((variant) => variant.kind === "baladi");
        if (!fino || !baladi) continue;
        const finoProduct = productsById.get(fino.id);
        const finoPrice = Number(finoProduct?.priceEGP);
        if (!Number.isFinite(finoPrice) || finoPrice <= 0) continue;
        await transaction
          .update(menuItems)
          .set({ priceEGP: String(suggestedBaladiPrice(finoPrice)) })
          .where(eq(menuItems.id, baladi.id));
      }
      await transaction.insert(siteSettings).values({
        id: BALADI_RATIO_MIGRATION_KEY,
        heroImageDataUrl: JSON.stringify({
          version: 1,
          ratio: BALADI_PRICE_RATIO,
          basis: "baladi-two-halves-estimated-1.5x-filling",
        }),
      });
    }

    let created = 0;
    for (const parent of candidates) {
      const [existing] = await transaction
        .select({ id: siteSettings.id })
        .from(siteSettings)
        .where(like(siteSettings.id, sandwichBreadKey(parent.id)))
        .limit(1);
      if (existing) continue;

      const finoId = randomUUID();
      const baladiId = randomUUID();
      const finoPrice = Number(parent.priceEGP);
      const baladiPrice = suggestedBaladiPrice(finoPrice);
      await transaction.insert(menuItems).values([
        {
          id: finoId,
          slug: SANDWICH_BREAD_PREFIX + finoId,
          nameAr: `${parent.nameAr} — ${SANDWICH_BREADS.fino.nameAr}`,
          nameEn: `${parent.nameEn} — ${SANDWICH_BREADS.fino.nameEn}`,
          category: parent.category,
          priceEGP: String(finoPrice),
          costEGP: parent.costEGP,
          isAvailable: false,
          sortOrder: parent.sortOrder,
        },
        {
          id: baladiId,
          slug: SANDWICH_BREAD_PREFIX + baladiId,
          nameAr: `${parent.nameAr} — ${SANDWICH_BREADS.baladi.nameAr}`,
          nameEn: `${parent.nameEn} — ${SANDWICH_BREADS.baladi.nameEn}`,
          category: parent.category,
          priceEGP: String(baladiPrice),
          costEGP: parent.costEGP,
          isAvailable: false,
          sortOrder: parent.sortOrder,
        },
      ]);
      await transaction.insert(siteSettings).values({
        id: sandwichBreadKey(parent.id),
        heroImageDataUrl: JSON.stringify({
          version: 1,
          enabled: true,
          variants: [
            { id: finoId, kind: "fino", available: true },
            { id: baladiId, kind: "baladi", available: true },
          ],
        }),
      });
      created += 1;
    }
    return created;
  });
}
