import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db, user, session, account, verification } from "@el7bboB/db"

const PRODUCTION_URL = "https://el7bbob-production.up.railway.app"
const CUSTOM_DOMAIN_URL = "https://el7bbob.com"
const railwayUrl = process.env.RAILWAY_PUBLIC_DOMAIN
 ? "https://" + process.env.RAILWAY_PUBLIC_DOMAIN
 : undefined
const publicUrl = process.env.BETTER_AUTH_URL || railwayUrl || CUSTOM_DOMAIN_URL
const trustedOrigins = Array.from(new Set([
 process.env.BETTER_AUTH_URL,
 railwayUrl,
 PRODUCTION_URL,
 CUSTOM_DOMAIN_URL,
 "https://www.el7bbob.com",
 ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:3000"]),
].filter((origin): origin is string => Boolean(origin))))

// Explicitly trust the owner's domain and the existing Railway address.
// Never derive trusted origins from an arbitrary incoming Host header.
export const auth = betterAuth({
 baseURL: publicUrl,
 secret: process.env.BETTER_AUTH_SECRET,
 trustedOrigins,
 database: drizzleAdapter(db, {
  provider: "pg",
  schema: { user, session, account, verification },
 }),
 emailAndPassword: { enabled: true, requireEmailVerification: false },
 session: { expiresIn: 60 * 60 * 24 * 7 },
})
export type Auth = typeof auth
