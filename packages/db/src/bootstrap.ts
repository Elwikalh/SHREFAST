import { sql } from "drizzle-orm"
import { db } from "./client"

// This file makes the production database self-healing: on every server
// boot it creates any missing enums/tables/columns and seeds baseline data
// if empty. There is no drizzle-kit migrations folder in this project, so
// any new column added to schema.ts must also be added here (as a raw SQL
// statement) to actually take effect against the live database.

const enumStatements = [
	`DO $$ BEGIN
		CREATE TYPE branch_type AS ENUM ('restaurant', 'cart');
	EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN
		CREATE TYPE menu_item_category AS ENUM ('base_item', 'mix', 'platter', 'addon', 'breakfast_box', 'beverage');
	EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN
		CREATE TYPE order_channel AS ENUM ('in_store', 'cart_kiosk', 'online_pickup', 'online_delivery');
	EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN
		CREATE TYPE order_status AS ENUM ('pending_payment', 'queued', 'in_progress', 'ready', 'completed', 'cancelled');
	EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN
		CREATE TYPE payment_method AS ENUM ('cash', 'instapay');
	EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN
		CREATE TYPE payment_status AS ENUM ('pending', 'awaiting_confirmation', 'confirmed', 'failed', 'refunded');
	EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN
		CREATE TYPE staff_role AS ENUM ('admin', 'branch_manager', 'cashier', 'kitchen');
	EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
]

const tableStatements = [
	`CREATE TABLE IF NOT EXISTS "user" (
		"id" text PRIMARY KEY,
		"name" text NOT NULL,
		"email" text NOT NULL UNIQUE,
		"email_verified" boolean NOT NULL DEFAULT false,
		"image" text,
		"created_at" timestamptz NOT NULL DEFAULT now(),
		"updated_at" timestamptz NOT NULL DEFAULT now()
	)`,
	`CREATE TABLE IF NOT EXISTS "session" (
		"id" text PRIMARY KEY,
		"expires_at" timestamptz NOT NULL,
		"token" text NOT NULL UNIQUE,
		"created_at" timestamptz NOT NULL,
		"updated_at" timestamptz NOT NULL,
		"ip_address" text,
		"user_agent" text,
		"user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
	)`,
	`CREATE TABLE IF NOT EXISTS "account" (
		"id" text PRIMARY KEY,
		"account_id" text NOT NULL,
		"provider_id" text NOT NULL,
		"user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
		"access_token" text,
		"refresh_token" text,
		"id_token" text,
		"access_token_expires_at" timestamptz,
		"refresh_token_expires_at" timestamptz,
		"scope" text,
		"password" text,
		"issuer" text,
		"created_at" timestamptz NOT NULL,
		"updated_at" timestamptz NOT NULL
	)`,
	`CREATE TABLE IF NOT EXISTS "verification" (
		"id" text PRIMARY KEY,
		"identifier" text NOT NULL,
		"value" text NOT NULL,
		"expires_at" timestamptz NOT NULL,
		"created_at" timestamptz,
		"updated_at" timestamptz
	)`,
	`CREATE TABLE IF NOT EXISTS "branches" (
		"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
		"code" varchar(10) NOT NULL UNIQUE,
		"name" text NOT NULL,
		"type" branch_type NOT NULL,
		"address" text,
		"latitude" numeric(9,6),
		"longitude" numeric(9,6),
		"is_active" boolean NOT NULL DEFAULT true,
		"created_at" timestamptz NOT NULL DEFAULT now()
	)`,
	`CREATE TABLE IF NOT EXISTS "order_number_blocks" (
		"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
		"branch_id" uuid NOT NULL REFERENCES "branches"("id"),
		"range_start" integer NOT NULL,
		"range_end" integer NOT NULL,
		"next_value" integer NOT NULL,
		"business_date" timestamptz NOT NULL,
		"created_at" timestamptz NOT NULL DEFAULT now()
	)`,
	`CREATE UNIQUE INDEX IF NOT EXISTS "order_number_blocks_branch_date_idx" ON "order_number_blocks" ("branch_id", "business_date")`,
	`CREATE TABLE IF NOT EXISTS "menu_items" (
		"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
		"slug" varchar(100) NOT NULL UNIQUE,
		"name_ar" text NOT NULL,
		"name_en" text NOT NULL,
		"category" menu_item_category NOT NULL,
		"price_egp" numeric(10,2) NOT NULL,
		"cost_egp" numeric(10,2) NOT NULL,
		"is_available" boolean NOT NULL DEFAULT true,
		"sort_order" integer NOT NULL DEFAULT 0,
		"photo_data_url" text,
		"photos_json" jsonb,
		"description_ar" text,
		"description_en" text,
		"created_at" timestamptz NOT NULL DEFAULT now(),
		"updated_at" timestamptz NOT NULL DEFAULT now()
	)`,
	`CREATE TABLE IF NOT EXISTS "mix_items" (
		"mix_id" uuid NOT NULL REFERENCES "menu_items"("id"),
		"filling_id" uuid NOT NULL REFERENCES "menu_items"("id"),
		PRIMARY KEY ("mix_id", "filling_id")
	)`,
	`CREATE TABLE IF NOT EXISTS "inventory_items" (
		"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
		"name" text NOT NULL,
		"unit" varchar(20) NOT NULL,
		"unit_cost_egp" numeric(10,4) NOT NULL,
		"created_at" timestamptz NOT NULL DEFAULT now()
	)`,
	`CREATE TABLE IF NOT EXISTS "recipe_lines" (
		"menu_item_id" uuid NOT NULL REFERENCES "menu_items"("id"),
		"inventory_item_id" uuid NOT NULL REFERENCES "inventory_items"("id"),
		"quantity" numeric(10,4) NOT NULL,
		PRIMARY KEY ("menu_item_id", "inventory_item_id")
	)`,
	`CREATE TABLE IF NOT EXISTS "branch_inventory" (
		"branch_id" uuid NOT NULL REFERENCES "branches"("id"),
		"inventory_item_id" uuid NOT NULL REFERENCES "inventory_items"("id"),
		"current_stock" numeric(12,4) NOT NULL DEFAULT '0',
		"low_stock_threshold" numeric(12,4) NOT NULL DEFAULT '0',
		"updated_at" timestamptz NOT NULL DEFAULT now(),
		PRIMARY KEY ("branch_id", "inventory_item_id")
	)`,
	`CREATE TABLE IF NOT EXISTS "inventory_transfers" (
		"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
		"to_branch_id" uuid NOT NULL REFERENCES "branches"("id"),
		"inventory_item_id" uuid NOT NULL REFERENCES "inventory_items"("id"),
		"quantity" numeric(12,4) NOT NULL,
		"note" text,
		"transferred_by_staff_id" uuid,
		"created_at" timestamptz NOT NULL DEFAULT now()
	)`,
	`CREATE TABLE IF NOT EXISTS "staff" (
		"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
		"branch_id" uuid REFERENCES "branches"("id"),
		"name" text NOT NULL,
		"role" staff_role NOT NULL,
		"user_id" text NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
		"created_at" timestamptz NOT NULL DEFAULT now()
	)`,
	// Postgres has no "ADD CONSTRAINT IF NOT EXISTS" syntax (unlike ADD COLUMN),
	// so re-running this on every boot must swallow the "already exists" error
	// via a DO block instead, the same way the enum statements above do.
	`DO $$ BEGIN
		ALTER TABLE "inventory_transfers" ADD CONSTRAINT "inventory_transfers_transferred_by_staff_id_fkey" FOREIGN KEY ("transferred_by_staff_id") REFERENCES "staff"("id");
	EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`CREATE TABLE IF NOT EXISTS "orders" (
		"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
		"branch_id" uuid NOT NULL REFERENCES "branches"("id"),
		"display_number" varchar(40) NOT NULL,
		"channel" order_channel NOT NULL,
		"status" order_status NOT NULL DEFAULT 'pending_payment',
		"subtotal_egp" numeric(10,2) NOT NULL,
		"discount_egp" numeric(10,2) NOT NULL DEFAULT '0',
		"discount_label" text,
		"delivery_fee_egp" numeric(10,2) NOT NULL DEFAULT '0',
		"tax_egp" numeric(10,2) NOT NULL DEFAULT '0',
		"total_egp" numeric(10,2) NOT NULL,
		"customer_name" text,
		"customer_phone" text,
		"delivery_address" text,
		"customer_note" text,
		"customer_lat" numeric(9,6),
		"customer_lng" numeric(9,6),
		"cashier_staff_id" uuid REFERENCES "staff"("id"),
		"created_at" timestamptz NOT NULL DEFAULT now(),
		"updated_at" timestamptz NOT NULL DEFAULT now()
	)`,
	`CREATE TABLE IF NOT EXISTS "order_items" (
		"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
		"order_id" uuid NOT NULL REFERENCES "orders"("id"),
		"menu_item_id" uuid NOT NULL REFERENCES "menu_items"("id"),
		"quantity" integer NOT NULL,
		"unit_price_egp" numeric(10,2) NOT NULL,
		"addons_json" jsonb,
		"note" text,
		"line_total_egp" numeric(10,2) NOT NULL
	)`,
	`CREATE TABLE IF NOT EXISTS "payments" (
		"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
		"order_id" uuid NOT NULL REFERENCES "orders"("id"),
		"method" payment_method NOT NULL,
		"status" payment_status NOT NULL DEFAULT 'pending',
		"amount_egp" numeric(10,2) NOT NULL,
		"instapay_reference" text,
		"confirmed_by_staff_id" uuid REFERENCES "staff"("id"),
		"confirmed_at" timestamptz,
		"created_at" timestamptz NOT NULL DEFAULT now()
	)`,
	`CREATE TABLE IF NOT EXISTS "audit_log" (
		"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
		"actor_staff_id" uuid REFERENCES "staff"("id"),
		"action" varchar(100) NOT NULL,
		"entity_type" varchar(50) NOT NULL,
		"entity_id" text NOT NULL,
		"reason" text,
		"metadata_json" jsonb,
		"created_at" timestamptz NOT NULL DEFAULT now()
	)`,
	`CREATE TABLE IF NOT EXISTS "site_settings" (
		"id" text PRIMARY KEY DEFAULT 'default',
		"hero_image_data_url" text,
		"instapay_address" text,
		"instapay_wallet_number" text,
		"instapay_account_name" text,
		"updated_at" timestamptz NOT NULL DEFAULT now()
	)`,
	`INSERT INTO "site_settings" ("id") VALUES ('default') ON CONFLICT ("id") DO NOTHING`,
]

// Columns added after the initial table statements above were written.
// ADD COLUMN IF NOT EXISTS keeps already-deployed databases in sync even
// though CREATE TABLE IF NOT EXISTS is a no-op once the table exists.
const columnStatements = [
	`ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "latitude" numeric(9,6)`,
	`ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "longitude" numeric(9,6)`,
	`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customer_lat" numeric(9,6)`,
	`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customer_lng" numeric(9,6)`,
	`ALTER TABLE "menu_items" ADD COLUMN IF NOT EXISTS "photo_data_url" text`,
	// Product detail page: extra gallery photos + Arabic/English descriptions.
	`ALTER TABLE "menu_items" ADD COLUMN IF NOT EXISTS "photos_json" jsonb`,
	`ALTER TABLE "menu_items" ADD COLUMN IF NOT EXISTS "description_ar" text`,
	`ALTER TABLE "menu_items" ADD COLUMN IF NOT EXISTS "description_en" text`,
	`ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "issuer" text`,
	// InstaPay transfer account shown to the customer at checkout.
	`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "instapay_address" text`,
	`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "instapay_wallet_number" text`,
	`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "instapay_account_name" text`,
	// Customer notes: one for the whole order, one per ordered line.
	`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customer_note" text`,
	`ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "note" text`,
	// Dated order display numbers (e.g. MAIN-251005-0007) are longer than the
	// original varchar(20). Widening is lossless for every existing order.
	`ALTER TABLE "orders" ALTER COLUMN "display_number" TYPE varchar(40)`,
]

let bootstrapped = false

export async function bootstrapDatabase() {
	if (bootstrapped) return

	for (const statement of enumStatements) {
		await db.execute(sql.raw(statement))
	}
	for (const statement of tableStatements) {
		await db.execute(sql.raw(statement))
	}
	for (const statement of columnStatements) {
		await db.execute(sql.raw(statement))
	}

	const { seedIfEmpty } = await import("./seed")
	await seedIfEmpty()

	bootstrapped = true
}
