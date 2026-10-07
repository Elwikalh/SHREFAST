import type { Money, MarginResult, MenuItemInput } from "./types"

const MARGIN_ALERT_THRESHOLD = 0.5

/**
 * Rounds a price up to the nearest half EGP, matching the shop's cash-friendly
 * pricing rule (platform spec section و — تقفيل الأسعار بالنصف جنيه لأعلى).
 */
export function roundUpToHalfPound(amount: Money): Money {
	return Math.ceil(amount * 2) / 2
}

/**
 * Computes the margin percentage for a menu item and flags it when it drops
 * below the alert threshold (50%), so the admin dashboard can surface it
 * automatically when an ingredient's price rises.
 */
export function computeMargin(item: MenuItemInput): MarginResult {
	if (item.priceEGP <= 0) {
		return { marginPercent: 0, isBelowThreshold: true }
	}

	const marginPercent = ((item.priceEGP - item.costEGP) / item.priceEGP) * 100

	return {
		marginPercent: Math.round(marginPercent * 100) / 100,
		isBelowThreshold: marginPercent / 100 < MARGIN_ALERT_THRESHOLD,
	}
}

/**
 * A "mix" (composite sandwich) is priced as the highest-priced filling plus a
 * fixed delta per additional filling — never a naive sum — so pricing stays
 * consistent everywhere and the cashier never has to improvise (spec section و).
 */
export function computeMixPrice(fillingPricesEGP: Money[], deltaPerExtraFillingEGP: Money): Money {
	if (fillingPricesEGP.length === 0) return 0

	const sorted = [...fillingPricesEGP].sort((a, b) => b - a)
	const [highest, ...rest] = sorted

	const total = (highest ?? 0) + rest.length * deltaPerExtraFillingEGP

	return roundUpToHalfPound(total)
}

export type OrderLineInput = {
	unitPriceEGP: Money
	quantity: number
	addonsEGP?: Money[]
}

export function computeLineTotal(line: OrderLineInput): Money {
	const addonsTotal = (line.addonsEGP ?? []).reduce((sum, price) => sum + price, 0)
	return roundUpToHalfPound((line.unitPriceEGP + addonsTotal) * line.quantity)
}
