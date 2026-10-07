import {
	pgTable,
	pgEnum,
	uuid,
	text,
	varchar,
	integer,
	numeric,
	boolean,
	timestamp,
	jsonb,
	primaryKey,
	uniqueIndex,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// --- Better Auth tables -----------------------------------------------
// Standard Better Auth schema shape (drizzle adapter, provider "pg").
// Table/column names must match Better Auth's defaults exactly.

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull().default(false),
	image: text("image"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
	scope: text("scope"),
	password: text("password"),
	// Added because the installed Better Auth version expects this column
	// (used for generic OAuth/OIDC provider identification); harmless/unused
	// for the email+password flow this app actually uses.
	issuer: text("issuer"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
})

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
})

// --- Restaurant platform tables ----------------------------------------

export const branchTypeEnum = pgEnum("branch_type", ["restaurant", "cart"])

// platter/addon/breakfast_box/beverage are just categories of menuItems —
// this avoids duplicating price/cost/availability columns across tables.
export const menuItemCategoryEnum = pgEnum("menu_item_category", [
	"base_item",
	"mix",
	"platter",
	"addon",
	"breakfast_box",
	"beverage",
])

export const orderChannelEnum = pgEnum("order_channel", [
	"in_store",
	"cart_kiosk",
	"online_pickup",
	"online_delivery",
])

export const orderStatusEnum = pgEnum("order_status", [
	"pending_payment",
	"queued",
	"in_progress",
	"ready",
	"completed",
	"cancelled",
])

export const paymentMethodEnum = pgEnum("payment_method", ["cash", "instapay"])

export const paymentStatusEnum = pgEnum("payment_status", [
	"pending",
	"awaiting_confirmation",
	"confirmed",
	"failed",
	"refunded",
])

export const staffRoleEnum = pgEnum("staff_role", ["admin", "branch_manager", "cashier", "kitchen"])

export const branches = pgTable("branches", {
	id: uuid("id").primaryKey().defaultRandom(),
	code: varchar("code", { length: 10 }).notNull().unique(),
	name: text("name").notNull(),
	type: branchTypeEnum("type").notNull(),
	address: text("address"),
	latitude: numeric("latitude", { precision: 9, scale: 6 }),
	longitude: numeric("longitude", { precision: 9, scale: 6 }),
	isActive: boolean("is_active").notNull().default(true),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

// Offline pre-allocated order-number ranges per branch per day (spec section و.١).
export const orderNumberBlocks = pgTable(
	"order_number_blocks",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		branchId: uuid("branch_id").notNull().references(() => branches.id),
		rangeStart: integer("range_start").notNull(),
		rangeEnd: integer("range_end").notNull(),
		nextValue: integer("next_value").notNull(),
		businessDate: timestamp("business_date", { withTimezone: true, mode: "date" }).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => ({
		branchDateIdx: uniqueIndex("order_number_blocks_branch_date_idx").on(
			table.branchId,
			table.businessDate,
		),
	}),
)

export const menuItems = pgTable("menu_items", {
	id: uuid("id").primaryKey().defaultRandom(),
	slug: varchar("slug", { length: 100 }).notNull().unique(),
	nameAr: text("name_ar").notNull(),
	nameEn: text("name_en").notNull(),
	category: menuItemCategoryEnum("category").notNull(),
	priceEGP: numeric("price_egp", { precision: 10, scale: 2 }).notNull(),
	costEGP: numeric("cost_egp", { precision: 10, scale: 2 }).notNull(),
	isAvailable: boolean("is_available").notNull().default(true),
	sortOrder: integer("sort_order").notNull().default(0),
	// Data URL (e.g. "data:image/jpeg;base64,...") uploaded by an admin from
	// the menu admin panel. Kept in-DB (no external object storage configured
	// yet) so uploads work immediately without extra infra.
	photoDataUrl: text("photo_data_url"),
	// Additional gallery photos for the product detail page. photoDataUrl stays
	// the cover image shown in menu cards; this array holds the extra angles.
	photosJson: jsonb("photos_json").$type<string[]>(),
	// Short customer-facing description shown on the product detail page.
	descriptionAr: text("description_ar"),
	descriptionEn: text("description_en"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

// Links a mix (category = "mix") to its filling menu items.
export const mixItems = pgTable(
	"mix_items",
	{
		mixId: uuid("mix_id").notNull().references(() => menuItems.id),
		fillingId: uuid("filling_id").notNull().references(() => menuItems.id),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.mixId, table.fillingId] }),
	}),
)

export const inventoryItems = pgTable("inventory_items", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	unit: varchar("unit", { length: 20 }).notNull(),
	unitCostEGP: numeric("unit_cost_egp", { precision: 10, scale: 4 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const recipeLines = pgTable(
	"recipe_lines",
	{
		menuItemId: uuid("menu_item_id").notNull().references(() => menuItems.id),
		inventoryItemId: uuid("inventory_item_id").notNull().references(() => inventoryItems.id),
		quantity: numeric("quantity", { precision: 10, scale: 4 }).notNull(),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.menuItemId, table.inventoryItemId] }),
	}),
)

// Per-branch running stock levels for each inventory item. This is what
// actually runs low day-to-day — carts must be topped up from the main
// restaurant before they run out of bread/fillings (spec section ٤).
export const branchInventory = pgTable(
	"branch_inventory",
	{
		branchId: uuid("branch_id").notNull().references(() => branches.id),
		inventoryItemId: uuid("inventory_item_id").notNull().references(() => inventoryItems.id),
		currentStock: numeric("current_stock", { precision: 12, scale: 4 }).notNull().default("0"),
		lowStockThreshold: numeric("low_stock_threshold", { precision: 12, scale: 4 }).notNull().default("0"),
		updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.branchId, table.inventoryItemId] }),
	}),
)

// Every time the main restaurant tops up a branch/cart's stock it is logged
// here — the audit trail behind each currentStock change.
export const inventoryTransfers = pgTable("inventory_transfers", {
	id: uuid("id").primaryKey().defaultRandom(),
	toBranchId: uuid("to_branch_id").notNull().references(() => branches.id),
	inventoryItemId: uuid("inventory_item_id").notNull().references(() => inventoryItems.id),
	quantity: numeric("quantity", { precision: 12, scale: 4 }).notNull(),
	note: text("note"),
	transferredByStaffId: uuid("transferred_by_staff_id").references(() => staff.id),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const staff = pgTable("staff", {
	id: uuid("id").primaryKey().defaultRandom(),
	branchId: uuid("branch_id").references(() => branches.id),
	name: text("name").notNull(),
	role: staffRoleEnum("role").notNull(),
	userId: text("user_id")
		.notNull()
		.unique()
		.references(() => user.id, { onDelete: "cascade" }), // Better Auth user id
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const orders = pgTable("orders", {
	id: uuid("id").primaryKey().defaultRandom(),
	branchId: uuid("branch_id").notNull().references(() => branches.id),
	displayNumber: varchar("display_number", { length: 40 }).notNull(),
	channel: orderChannelEnum("channel").notNull(),
	status: orderStatusEnum("status").notNull().default("pending_payment"),
	subtotalEGP: numeric("subtotal_egp", { precision: 10, scale: 2 }).notNull(),
	discountEGP: numeric("discount_egp", { precision: 10, scale: 2 }).notNull().default("0"),
	discountLabel: text("discount_label"),
	deliveryFeeEGP: numeric("delivery_fee_egp", { precision: 10, scale: 2 }).notNull().default("0"),
	taxEGP: numeric("tax_egp", { precision: 10, scale: 2 }).notNull().default("0"),
	totalEGP: numeric("total_egp", { precision: 10, scale: 2 }).notNull(),
	customerName: text("customer_name"),
	customerPhone: text("customer_phone"),
	deliveryAddress: text("delivery_address"),
	// Free-text note the customer types at checkout for the whole order
	// ("شطة على الجنب", "الشقة في الدور التالت"...). Shown on the kitchen ticket.
	customerNote: text("customer_note"),
	customerLat: numeric("customer_lat", { precision: 9, scale: 6 }),
	customerLng: numeric("customer_lng", { precision: 9, scale: 6 }),
	cashierStaffId: uuid("cashier_staff_id").references(() => staff.id),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const orderItems = pgTable("order_items", {
	id: uuid("id").primaryKey().defaultRandom(),
	orderId: uuid("order_id").notNull().references(() => orders.id),
	menuItemId: uuid("menu_item_id").notNull().references(() => menuItems.id),
	quantity: integer("quantity").notNull(),
	unitPriceEGP: numeric("unit_price_egp", { precision: 10, scale: 2 }).notNull(),
	addonsJson: jsonb("addons_json").$type<Array<{ menuItemId: string; nameAr: string; priceEGP: number }>>(),
	// Per-line note ("بدون بصل", "سخن أوي"). Two lines of the same item with
	// different notes stay separate lines so the kitchen never merges them.
	note: text("note"),
	lineTotalEGP: numeric("line_total_egp", { precision: 10, scale: 2 }).notNull(),
})

export const payments = pgTable("payments", {
	id: uuid("id").primaryKey().defaultRandom(),
	orderId: uuid("order_id").notNull().references(() => orders.id),
	method: paymentMethodEnum("method").notNull(),
	status: paymentStatusEnum("status").notNull().default("pending"),
	amountEGP: numeric("amount_egp", { precision: 10, scale: 2 }).notNull(),
	instapayReference: text("instapay_reference"),
	confirmedByStaffId: uuid("confirmed_by_staff_id").references(() => staff.id),
	confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

// Every delete, discount override, or manual price change is logged here —
// this is the accounting safety net (spec section و.٤).
export const auditLog = pgTable("audit_log", {
	id: uuid("id").primaryKey().defaultRandom(),
	actorStaffId: uuid("actor_staff_id").references(() => staff.id),
	action: varchar("action", { length: 100 }).notNull(),
	entityType: varchar("entity_type", { length: 50 }).notNull(),
	entityId: text("entity_id").notNull(),
	reason: text("reason"),
	metadataJson: jsonb("metadata_json"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

// Small singleton settings row for site-wide branding assets and the
// InstaPay transfer account shown at checkout. id is always "default" —
// there is only ever one row.
export const siteSettings = pgTable("site_settings", {
	id: text("id").primaryKey().default("default"),
	heroImageDataUrl: text("hero_image_data_url"),
	// InstaPay payment address (IPA), e.g. "el7bbob@instapay".
	instapayAddress: text("instapay_address"),
	// Mobile-wallet number that also receives InstaPay transfers.
	instapayWalletNumber: text("instapay_wallet_number"),
	// Account holder name the customer will see before transferring.
	instapayAccountName: text("instapay_account_name"),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
}))

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] }),
}))

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, { fields: [account.userId], references: [user.id] }),
}))

export const staffRelations = relations(staff, ({ one }) => ({
	user: one(user, { fields: [staff.userId], references: [user.id] }),
	branch: one(branches, { fields: [staff.branchId], references: [branches.id] }),
}))

export const branchesRelations = relations(branches, ({ many }) => ({
	orders: many(orders),
	staff: many(staff),
	orderNumberBlocks: many(orderNumberBlocks),
	inventory: many(branchInventory),
}))

export const menuItemsRelations = relations(menuItems, ({ many }) => ({
	recipeLines: many(recipeLines),
}))

export const inventoryItemsRelations = relations(inventoryItems, ({ many }) => ({
	recipeLines: many(recipeLines),
	branchStock: many(branchInventory),
	transfers: many(inventoryTransfers),
}))

export const branchInventoryRelations = relations(branchInventory, ({ one }) => ({
	branch: one(branches, { fields: [branchInventory.branchId], references: [branches.id] }),
	inventoryItem: one(inventoryItems, { fields: [branchInventory.inventoryItemId], references: [inventoryItems.id] }),
}))

export const inventoryTransfersRelations = relations(inventoryTransfers, ({ one }) => ({
	branch: one(branches, { fields: [inventoryTransfers.toBranchId], references: [branches.id] }),
	inventoryItem: one(inventoryItems, { fields: [inventoryTransfers.inventoryItemId], references: [inventoryItems.id] }),
	transferredBy: one(staff, { fields: [inventoryTransfers.transferredByStaffId], references: [staff.id] }),
}))

export const ordersRelations = relations(orders, ({ one, many }) => ({
	branch: one(branches, { fields: [orders.branchId], references: [branches.id] }),
	items: many(orderItems),
	payments: many(payments),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
	order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
	menuItem: one(menuItems, { fields: [orderItems.menuItemId], references: [menuItems.id] }),
}))
