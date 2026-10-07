"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type CartAddon = {
	menuItemId: string
	nameAr: string
	priceEGP: number
}

export type CartLine = {
	/** Stable identity of the line: the item plus its exact add-on set and note. */
	id: string
	menuItemId: string
	nameAr: string
	priceEGP: number
	quantity: number
	addons: CartAddon[]
	/** Kitchen instruction for this line only ("بدون بصل", "شطة زيادة"). */
	note?: string
}

type NewCartItem = {
	menuItemId: string
	nameAr: string
	priceEGP: number
}

type CartState = {
	lines: CartLine[]
	branchCode: string | null
	/** Note for the whole order ("الشقة في الدور التالت"). */
	orderNote: string
	updatedAt: number
	addItem: (item: NewCartItem, addons?: CartAddon[], quantity?: number, note?: string) => void
	setLineQuantity: (lineId: string, quantity: number) => void
	setLineNote: (lineId: string, note: string) => void
	removeLineById: (lineId: string) => void
	setOrderNote: (note: string) => void
	startBranch: (branchCode: string) => void
	clear: () => void
}

// The server rejects more than 20 of one line, so the client must not let the
// customer build an order that can never be submitted.
const MAX_LINE_QUANTITY = 20

// Notes are free text typed by the customer; the server also caps them, so the
// client trims to the same limit instead of letting an unsendable order build.
export const MAX_NOTE_LENGTH = 200

// A cart older than this belongs to a different visit. Reviving it makes items
// the customer never chose appear in the order, so it is dropped instead.
const STALE_CART_MS = 3 * 60 * 60 * 1000

export function cleanNote(note: string | undefined): string {
	if (!note) return ""
	return note.replace(/\s+/g, " ").trim().slice(0, MAX_NOTE_LENGTH)
}

// Two portions of the same sandwich with different instructions are two
// different things for the kitchen, so the note is part of the line identity.
function lineIdFor(menuItemId: string, addons: CartAddon[], note: string): string {
	const signature = addons
		.map((addon) => addon.menuItemId)
		.sort()
		.join(",")
	const base = signature.length > 0 ? `${menuItemId}|${signature}` : menuItemId
	return note.length > 0 ? `${base}#${note}` : base
}

function clampQuantity(quantity: number): number {
	if (!Number.isFinite(quantity)) return 1
	return Math.min(MAX_LINE_QUANTITY, Math.max(1, Math.round(quantity)))
}

// Lines are addressed by their own id, never by their position in the array:
// positions shift whenever a line is removed, which is how the wrong item
// used to get the quantity of another one.
export const useCartStore = create<CartState>()(
	persist(
		(set) => ({
			lines: [],
			branchCode: null,
			orderNote: "",
			updatedAt: 0,
			addItem: (item, addons = [], quantity = 1, note) =>
				set((state) => {
					const cleanedNote = cleanNote(note)
					const id = lineIdFor(item.menuItemId, addons, cleanedNote)
					const added = clampQuantity(quantity)
					const exists = state.lines.some((line) => line.id === id)

					return {
						lines: exists
							? state.lines.map((line) =>
									line.id === id
										? { ...line, quantity: clampQuantity(line.quantity + added) }
										: line,
								)
							: [
									...state.lines,
									{
										id,
										...item,
										quantity: added,
										addons,
										...(cleanedNote.length > 0 ? { note: cleanedNote } : {}),
									},
								],
						updatedAt: Date.now(),
					}
				}),
			setLineQuantity: (lineId, quantity) =>
				set((state) => ({
					lines:
						quantity <= 0
							? state.lines.filter((line) => line.id !== lineId)
							: state.lines.map((line) =>
									line.id === lineId ? { ...line, quantity: clampQuantity(quantity) } : line,
								),
					updatedAt: Date.now(),
				})),
			// Editing a note changes the line's identity. If a line with the same
			// item/add-ons/note already exists, the two are merged instead of
			// leaving two identical lines on the kitchen ticket.
			setLineNote: (lineId, note) =>
				set((state) => {
					const target = state.lines.find((line) => line.id === lineId)
					if (!target) return {}

					const cleanedNote = cleanNote(note)
					const nextId = lineIdFor(target.menuItemId, target.addons, cleanedNote)
					if (nextId === lineId) return {}

					const twin = state.lines.find((line) => line.id === nextId)
					if (twin) {
						return {
							lines: state.lines
								.filter((line) => line.id !== lineId)
								.map((line) =>
									line.id === nextId
										? { ...line, quantity: clampQuantity(line.quantity + target.quantity) }
										: line,
								),
							updatedAt: Date.now(),
						}
					}

					return {
						lines: state.lines.map((line) =>
							line.id === lineId
								? {
										...line,
										id: nextId,
										...(cleanedNote.length > 0 ? { note: cleanedNote } : { note: undefined }),
									}
								: line,
						),
						updatedAt: Date.now(),
					}
				}),
			removeLineById: (lineId) =>
				set((state) => ({
					lines: state.lines.filter((line) => line.id !== lineId),
					updatedAt: Date.now(),
				})),
			setOrderNote: (note) =>
				set({ orderNote: note.slice(0, MAX_NOTE_LENGTH), updatedAt: Date.now() }),
			// Called when the customer opens a branch menu: an old visit's cart, or
			// a cart built for another branch, is cleared instead of carried over.
			startBranch: (branchCode) =>
				set((state) => {
					const isStale = state.updatedAt > 0 && Date.now() - state.updatedAt > STALE_CART_MS
					const switchedBranch = state.branchCode !== null && state.branchCode !== branchCode

					if (isStale || switchedBranch) {
						return { lines: [], orderNote: "", branchCode, updatedAt: Date.now() }
					}
					if (state.branchCode === branchCode) return {}
					return { branchCode }
				}),
			clear: () => set({ lines: [], orderNote: "", updatedAt: Date.now() }),
		}),
		{
			name: "el7bbob-cart",
			storage: createJSONStorage(() => localStorage),
			// Bumping the version drops every cart saved by the previous shape,
			// including the test carts already sitting in customers' browsers.
			version: 4,
			migrate: () => ({ lines: [], branchCode: null, orderNote: "", updatedAt: 0 }),
			partialize: (state) => ({
				lines: state.lines,
				branchCode: state.branchCode,
				orderNote: state.orderNote,
				updatedAt: state.updatedAt,
			}),
		},
	),
)

export function lineUnitEGP(line: CartLine): number {
	return line.priceEGP + line.addons.reduce((sum, addon) => sum + addon.priceEGP, 0)
}

export function lineTotalEGP(line: CartLine): number {
	return lineUnitEGP(line) * line.quantity
}

export function cartTotal(lines: CartLine[]): number {
	return lines.reduce((sum, line) => sum + lineTotalEGP(line), 0)
}

export function cartCount(lines: CartLine[]): number {
	return lines.reduce((sum, line) => sum + line.quantity, 0)
}
