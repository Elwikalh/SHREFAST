import { afterEach, describe, expect, it, vi } from "vitest";
import { assertSameOrigin } from "../lib/wasl-auth";
const site = "https://sharefastweb-production.up.railway.app";
afterEach(() => vi.unstubAllEnvs());
function request(origin: string, extra: Record<string,string> = {}) {return new Request("http://localhost:3000/api/wasl/auth/register",{method:"POST",headers:{origin,...extra}});}
describe("Railway TLS termination and CSRF origin checks", () => {
 it("accepts the public HTTPS Host behind an internal HTTP URL",()=>{vi.stubEnv("NODE_ENV","production");expect(()=>assertSameOrigin(request(site,{host:new URL(site).host}))).not.toThrow();});
 it("uses the runtime Railway public domain",()=>{vi.stubEnv("NODE_ENV","production");vi.stubEnv("RAILWAY_PUBLIC_DOMAIN",new URL(site).host);expect(()=>assertSameOrigin(request(site))).not.toThrow();});
 it("uses dynamically configured public app URL",()=>{vi.stubEnv("NEXT_PUBLIC_APP_URL",site);expect(()=>assertSameOrigin(request(site))).not.toThrow();});
 it("rejects attacker origins despite a matching forwarded header",()=>{expect(()=>assertSameOrigin(request("https://attacker.invalid",{host:new URL(site).host,"x-forwarded-host":"attacker.invalid"}))).toThrow("invalid_origin");});
 it("rejects null, missing and path-bearing origins",()=>{for(const origin of ["null","",site+"/path"])expect(()=>assertSameOrigin(request(origin))).toThrow("invalid_origin");});
 it("rejects insecure origins in production even if configured",()=>{vi.stubEnv("NODE_ENV","production");vi.stubEnv("NEXT_PUBLIC_SITE_URL","http://example.com");expect(()=>assertSameOrigin(request("http://example.com"))).toThrow("invalid_origin");});
 it("retains same-origin local development",()=>{expect(()=>assertSameOrigin(request("http://localhost:3000"))).not.toThrow();});
});
