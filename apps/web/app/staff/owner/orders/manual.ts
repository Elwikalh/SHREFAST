"use server";

import { loadSandwichBreadCatalog } from "@/app/sandwich-bread-store";
import {
  expandBreadProducts,
  resolveBreadSale,
  isSandwichBread,
} from "@/app/sandwich-bread";
import { isProductExtra } from "@/app/product-extras";
import { asc, eq, inArray } from "drizzle-orm";
import {
  allocateOrderNumber,
  branches,
  db,
  menuItems,
  orderItems,
  orders,
  payments,
  deliveryZones,
  ensureDeliveryZones,
} from "@el7bboB/db";
import { requireOwner } from "../actions";
import { CUSTOM_MIX_SLUG } from "@/app/mix/mix-config";
import { deductBranchStockForOrder } from "@/lib/orders/inventory";
import { revalidatePath } from "next/cache";

export type Catalog = {
  products: { id: string; name: string; price: number; category: string }[];
  zones: { id: string; name: string; fee: number }[];
};

export type ManualInput = {
  id: string;
  branchCode: string;
  source: "phone" | "whatsapp" | "counter";
  delivery: boolean;
  zoneId: string;
  name: string;
  phone: string;
  address: string;
  note: string;
  method: "cash" | "instapay";
  reference: string;
  lines: {
    menuItemId: string;
    quantity: number;
    addonMenuItemIds: string[];
  }[];
  extras: { menuItemId: string; quantity: number }[];
};

export async function loadOperatingCatalog(): Promise<Catalog> {
  await requireOwner();
  await ensureDeliveryZones();
  const [items, zones] = await Promise.all([
    db
      .select()
      .from(menuItems)
      .where(eq(menuItems.isAvailable, true))
      .orderBy(asc(menuItems.category), asc(menuItems.sortOrder)),
    db
      .select()
      .from(deliveryZones)
      .where(eq(deliveryZones.isActive, true))
      .orderBy(asc(deliveryZones.sortOrder)),
  ]);
  const breadCatalog = await loadSandwichBreadCatalog();
  return {
    products: expandBreadProducts(
      items.filter(
        (product) => !isProductExtra(product.slug) && !isSandwichBread(product.slug),
      ),
      breadCatalog.products,
      breadCatalog.configs,
    )
      .filter(
        (product) =>
          product.slug !== CUSTOM_MIX_SLUG &&
          Number.isFinite(Number(product.priceEGP)) &&
          Number(product.priceEGP) >= 0,
      )
      .map((product) => ({
        id: product.id,
        name: product.nameAr,
        price: Number(product.priceEGP),
        category: product.category,
      })),
    zones: zones.map((zone) => ({
      id: zone.id,
      name: zone.name,
      fee: Number(zone.feeEGP),
    })),
  };
}

export async function createOwnerOrder(
  input: ManualInput,
): Promise<{ ok: boolean; message: string; orderNumber?: string }> {
  await requireOwner();
  try {
    if (
      !input ||
      !/^[0-9a-f-]{36}$/i.test(input.id) ||
      !["phone", "whatsapp", "counter"].includes(input.source) ||
      !["cash", "instapay"].includes(input.method) ||
      typeof input.delivery !== "boolean" ||
      input.name.length > 80 ||
      input.note.length > 160 ||
      input.address.length > 300 ||
      input.reference.length > 60 ||
      !Array.isArray(input.lines) ||
      !input.lines.length ||
      input.lines.length > 60
    )
      throw new Error("راجع بيانات الطلب");

    if (
      (input.source !== "counter" || input.delivery) &&
      (!/^01[0125][0-9]{8}$/.test(input.phone) || input.name.trim().length < 2)
    )
      throw new Error("اسم العميل ورقم هاتف مصري صحيح مطلوبان");

    const [branch] = await db
      .select()
      .from(branches)
      .where(eq(branches.code, input.branchCode));
    if (!branch?.isActive) throw new Error("اختر نقطة بيع نشطة");

    const [existing] = await db.select().from(orders).where(eq(orders.id, input.id));
    if (existing) {
      if (existing.branchId !== branch.id) throw new Error("راجع الفرع");
      return {
        ok: true,
        message: "الطلب مسجل بالفعل",
        orderNumber: existing.displayNumber,
      };
    }

    let fee = 0;
    if (input.delivery) {
      if (input.address.trim().length < 10)
        throw new Error("أدخل عنوان التوصيل كاملًا");
      const [zone] = await db
        .select()
        .from(deliveryZones)
        .where(eq(deliveryZones.id, input.zoneId));
      if (!zone?.isActive) throw new Error("اختر منطقة التوصيل");
      fee = Number(zone.feeEGP);
    }
    if (!Number.isFinite(fee) || fee < 0) throw new Error("رسوم التوصيل غير صحيحة");

    for (const line of input.lines) {
      if (
        !Number.isInteger(line.quantity) ||
        line.quantity < 1 ||
        line.quantity > 50 ||
        !Array.isArray(line.addonMenuItemIds) ||
        line.addonMenuItemIds.length > 10
      )
        throw new Error("راجع كميات الأصناف والإضافات");
    }

    const extrasInput = Array.isArray(input.extras) ? input.extras : [];
    if (extrasInput.length > 30) throw new Error("الحد الأقصى 30 نوع إضافة في الطلب");
    const extras = Array.from(
      extrasInput.reduce((result, extra) => {
        if (
          !extra ||
          typeof extra.menuItemId !== "string" ||
          !Number.isInteger(extra.quantity) ||
          extra.quantity < 1 ||
          extra.quantity > 50
        )
          throw new Error("راجع كميات الإضافات");
        result.set(
          extra.menuItemId,
          Math.min(50, (result.get(extra.menuItemId) ?? 0) + extra.quantity),
        );
        return result;
      }, new Map<string, number>()),
    ).map(([menuItemId, quantity]) => ({ menuItemId, quantity }));

    const ids = [
      ...new Set([
        ...input.lines.flatMap((line) => [line.menuItemId, ...line.addonMenuItemIds]),
        ...extras.map((extra) => extra.menuItemId),
      ]),
    ];
    const selected = await db
      .select()
      .from(menuItems)
      .where(inArray(menuItems.id, ids));
    const byId = new Map(selected.map((product) => [product.id, product]));
    let subtotal = 0;

    const breadCatalog = await loadSandwichBreadCatalog();
    const sales = new Map(
      input.lines.map((line) => [
        line.menuItemId,
        resolveBreadSale(line.menuItemId, breadCatalog.products, breadCatalog.configs),
      ]),
    );

    const productRows = input.lines.map((line) => {
      const product = sales.get(line.menuItemId)!.product;
      const price = Number(product?.priceEGP);
      if (
        !product?.isAvailable ||
        product.slug === CUSTOM_MIX_SLUG ||
        product.category === "addon" ||
        !Number.isFinite(price) ||
        price <= 0
      )
        throw new Error("صنف أو سعر غير متاح");
      const addons = [...new Set(line.addonMenuItemIds)].map((id) => {
        const addon = byId.get(id);
        const cost = Number(addon?.priceEGP);
        if (
          !addon?.isAvailable ||
          addon.category !== "addon" ||
          !Number.isFinite(cost) ||
          cost < 0
        )
          throw new Error("إضافة غير متاحة");
        return {
          menuItemId: addon.id,
          nameAr: addon.nameAr,
          priceEGP: cost,
        };
      });
      const lineTotal =
        (price + addons.reduce((sum, addon) => sum + addon.priceEGP, 0)) *
        line.quantity;
      subtotal += lineTotal;
      return {
        orderId: input.id,
        menuItemId: product.id,
        quantity: line.quantity,
        unitPriceEGP: String(price),
        addonsJson: addons,
        lineTotalEGP: String(lineTotal),
      };
    });

    const extraRows = extras.map((extra) => {
      const addon = byId.get(extra.menuItemId);
      const price = Number(addon?.priceEGP);
      if (
        !addon?.isAvailable ||
        addon.category !== "addon" ||
        !Number.isFinite(price) ||
        price < 0
      )
        throw new Error("إضافة غير متاحة");
      const lineTotal = price * extra.quantity;
      subtotal += lineTotal;
      return {
        orderId: input.id,
        menuItemId: addon.id,
        quantity: extra.quantity,
        unitPriceEGP: String(price),
        addonsJson: [],
        lineTotalEGP: String(lineTotal),
      };
    });

    const number = await allocateOrderNumber(branch.id, branch.code);
    const source = {
      phone: "تليفون",
      whatsapp: "واتساب — تسجيل يدوي",
      counter: "حضوري",
    }[input.source];
    const reference = input.reference.trim().toUpperCase();
    if (reference) {
      const [used] = await db
        .select({ id: payments.id })
        .from(payments)
        .where(eq(payments.instapayReference, reference));
      if (used) throw new Error("مرجع التحويل مستخدم في طلب آخر");
    }

    await db.transaction(async (transaction) => {
      await transaction.insert(orders).values({
        id: input.id,
        branchId: branch.id,
        displayNumber: number,
        channel: input.delivery
          ? "online_delivery"
          : input.source === "counter"
            ? "in_store"
            : "online_pickup",
        status: input.method === "instapay" ? "pending_payment" : "queued",
        subtotalEGP: String(subtotal),
        deliveryFeeEGP: String(fee),
        totalEGP: String(subtotal + fee),
        customerName: input.name.trim() || null,
        customerPhone: input.phone || null,
        deliveryAddress: input.delivery ? input.address.trim() : null,
        customerNote: `[مصدر: ${source}] ${input.note.trim()}`,
      });
      await transaction.insert(orderItems).values([...productRows, ...extraRows]);
      await transaction.insert(payments).values({
        orderId: input.id,
        method: input.method,
        status: input.method === "instapay" ? "awaiting_confirmation" : "pending",
        amountEGP: String(subtotal + fee),
        instapayReference: input.method === "instapay" && reference ? reference : null,
      });
    });

    let warning = "";
    try {
      await deductBranchStockForOrder(branch.id, [
        ...input.lines.map((line) => ({
          ...line,
          menuItemId: sales.get(line.menuItemId)!.parent.id,
        })),
        ...extras.map((extra) => ({
          ...extra,
          addonMenuItemIds: [] as string[],
        })),
      ]);
    } catch (error) {
      console.error("[owner-order-stock]", error);
      warning = " تنبيه: تعذر تأكيد خصم مخزون التشغيل؛ راجعه منفصلًا.";
    }

    revalidatePath("/staff/owner/orders");
    revalidatePath(`/staff/${branch.code}/kitchen`);
    return {
      ok: true,
      message: "تم تسجيل الطلب؛ الدفع لم يُؤكد تلقائيًا." + warning,
      orderNumber: number,
    };
  } catch (error) {
    console.error("[owner-manual-order]", error);
    return {
      ok: false,
      message:
        error instanceof Error &&
        !/sql|query|postgres|connect|relation/i.test(error.message)
          ? error.message
          : "تعذر تأكيد التسجيل. أعد المحاولة بنفس النموذج لتجنب تكرار الطلب",
    };
  }
}
