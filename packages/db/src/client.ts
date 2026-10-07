import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

/**
 * Railway (and most Docker-based hosts) only expose runtime environment
 * variables to the running container, not to the `docker build` step. Our
 * Dockerfile runs `pnpm build` during the image build, so `DATABASE_URL` is
 * not present yet at that point.
 *
 * Two things happen during `next build` that touch this file:
 * - Next.js imports every route module while "Collecting page data", even for
 *   fully dynamic routes.
 * - Modules evaluated at import time can hand the client to a library (Better
 *   Auth's drizzle adapter does exactly that), which reads properties off it
 *   immediately.
 *
 * So creating the client lazily is not enough on its own: the very first
 * property read must not explode either. Therefore, when `DATABASE_URL` is
 * missing we still build a client, using an unreachable placeholder DSN.
 * postgres-js does not open a socket until a query actually runs, so the build
 * finishes cleanly, while a real query without a configured database fails
 * loudly at request time (with the warning below already in the logs) instead
 * of silently talking to the wrong database.
 */

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>

// Deliberately unreachable: no host runs Postgres on this port, so a query
// that slips through without a real DATABASE_URL fails fast.
const BUILD_TIME_PLACEHOLDER_URL = "postgres://build:build@127.0.0.1:1/build"

let queryClient: ReturnType<typeof postgres> | undefined
let drizzleDb: DrizzleDb | undefined
let warned = false

function connectionString(): string {
	const configured = process.env.DATABASE_URL
	if (configured) return configured

	if (!warned) {
		warned = true
		console.warn(
			"[db] DATABASE_URL is not set. Using a placeholder connection; this is expected during the image build, but at runtime it means the database is not configured.",
		)
	}

	return BUILD_TIME_PLACEHOLDER_URL
}

function getDb(): DrizzleDb {
	if (!drizzleDb) {
		queryClient = postgres(connectionString(), { max: 10 })
		drizzleDb = drizzle(queryClient, { schema })
	}
	return drizzleDb
}

export const db: DrizzleDb = new Proxy({} as DrizzleDb, {
	get(_target, prop, receiver) {
		return Reflect.get(getDb() as object, prop, receiver)
	},
})

export type Database = DrizzleDb
