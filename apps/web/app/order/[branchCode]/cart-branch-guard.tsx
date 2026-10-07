"use client"

import { useEffect } from "react"
import { useCartStore } from "@/lib/cart-store"

// Mounted on the branch menu: it hands the branch to the cart so a cart left
// over from an older visit, or from another branch, is dropped before the
// customer starts choosing. Renders nothing.
export function CartBranchGuard({ branchCode }: { branchCode: string }) {
	const startBranch = useCartStore((state) => state.startBranch)

	useEffect(() => {
		startBranch(branchCode)
	}, [branchCode, startBranch])

	return null
}
