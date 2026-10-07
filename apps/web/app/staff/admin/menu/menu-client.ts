import type { MenuItemInput } from "./actions";
import { withAutomaticEnglishName } from "./menu-name-english";

// A stable HTTP endpoint, not a build-specific Server Action reference.
async function mutateMenu(body: Record<string, unknown>): Promise<void> {
  let response: Response;
  try {
    response = await fetch("/api/staff/menu", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // Never retry a mutation automatically: it may already have committed.
    throw new Error(
      "الاتصال اتقطع — حدّث قائمة المنتجات وتأكد هل التعديل اتحفظ قبل ما تكرر الحفظ",
    );
  }
  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      result &&
      typeof result === "object" &&
      "error" in result &&
      typeof result.error === "string"
        ? result.error
        : null;
    throw new Error(
      message ??
        "مقدرناش نؤكد الحفظ — حدّث قائمة المنتجات وتأكد من التعديل قبل ما تحاول تاني",
    );
  }
  if (
    !result ||
    typeof result !== "object" ||
    !("ok" in result) ||
    result.ok !== true
  ) {
    throw new Error(
      "استجابة الحفظ غير متوقعة — حدّث قائمة المنتجات وتأكد من التعديل قبل ما تحاول تاني",
    );
  }
}

export function createMenuItem(input: MenuItemInput) {
  return mutateMenu({ operation: "create", input: withAutomaticEnglishName(input) });
}
export function updateMenuItem(id: string, input: MenuItemInput) {
  return mutateMenu({
    operation: "update",
    id,
    input: withAutomaticEnglishName(input),
  });
}
export function toggleMenuItemAvailability(id: string, isAvailable: boolean) {
  return mutateMenu({ operation: "toggle", id, isAvailable });
}
export function deleteMenuItem(id: string) {
  return mutateMenu({ operation: "delete", id });
}

export function reorderMenuItems(section: string, orderedIds: string[]) {
  return mutateMenu({ operation: "reorder", section, orderedIds });
}
export type { MenuItemInput };

export type InlineBreadPricing = {
  enabled: boolean;
  variants: Array<{
    id: string;
    kind: "baladi" | "fino";
    priceEGP: string;
    available: boolean;
  }>;
};

export async function saveInlineBreadPricing(
  productId: string,
  pricing: InlineBreadPricing,
) {
  let response: Response;
  try {
    response = await fetch("/api/staff/sandwich-bread", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        enabled: pricing.enabled,
        variants: pricing.variants.filter(
          (variant) => variant.available || variant.priceEGP.trim() !== "",
        ),
      }),
    });
  } catch {
    throw new Error(
      "اتحفظت بيانات المنتج لكن الاتصال اتقطع أثناء حفظ أسعار العيش — حدّث الصفحة وتأكد قبل إعادة المحاولة",
    );
  }
  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      result &&
      typeof result === "object" &&
      "error" in result &&
      typeof result.error === "string"
        ? result.error
        : null;
    throw new Error(
      message ??
        "اتحفظت بيانات المنتج لكن تعذر تأكيد أسعار العيش — حدّث الصفحة وراجعها",
    );
  }
  if (
    !result ||
    typeof result !== "object" ||
    !("ok" in result) ||
    result.ok !== true
  ) {
    throw new Error("استجابة حفظ أسعار العيش غير متوقعة — حدّث الصفحة وراجعها");
  }
}
