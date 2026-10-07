import { createAuthClient } from "better-auth/react"

// Authentication stays on the browser's current origin. A stale public
// Railway URL must not send the custom domain's credentials/cookies elsewhere.
export const authClient = createAuthClient({
 baseURL: typeof window !== "undefined" ? window.location.origin : undefined,
})
export const { signIn, signUp, signOut, useSession } = authClient
