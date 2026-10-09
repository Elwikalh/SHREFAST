// Contract v1. Server-only. Keep identical in the two repositories.
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
export const BRIDGE_PATH = "/api/integrations/el7bbob/orders";
export const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export type DeliveryEnvelope = {
  version: 1;
  quote?: {id:string;acceptedAt:string};
  preparation?: { estimatedAt: string; estimatedReadyAt: string | null; needsReview?: boolean };
  externalOrderId: string;
  displayNumber: string;
  branchCode: string;
  destZone: string;
  fromAddr: string;
  toAddr: string;
  feeEGP: number;
  totalEGP: number;
  paymentMethod: "cash" | "instapay";
  customerName: string;
  customerPhone: string;
  note: string;
  source: "client_online" | "owner_phone" | "owner_whatsapp" | "owner_counter";
};
export type DeliverySnapshot = {
  externalOrderId: string;
  ref: string | null;
  status: string;
  courier: string | null;
};
export function parseEnvelope(value: unknown): DeliveryEnvelope {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("invalid_fields");
  const v = value as Record<string, unknown>;
  const keys = [
    "version",
    "externalOrderId",
    "displayNumber",
    "branchCode",
    "destZone",
    "fromAddr",
    "toAddr",
    "feeEGP",
    "totalEGP",
    "paymentMethod",
    "customerName",
    "customerPhone",
    "note",
    "source",
  ];
  if (
    Object.keys(v).some((k) => !keys.includes(k) && k !== "preparation" && k !== "quote") ||
    keys.some((k) => !(k in v))
  )
    throw new Error("invalid_fields");
  if (
    v.version !== 1 ||
    typeof v.externalOrderId !== "string" ||
    !UUID.test(v.externalOrderId)
  )
    throw new Error("invalid_fields");
  for (const [key, min, max] of [
    ["displayNumber", 1, 80],
    ["branchCode", 1, 80],
    ["destZone", 1, 100],
    ["fromAddr", 1, 500],
    ["toAddr", 10, 500],
    ["customerName", 2, 80],
    ["customerPhone", 11, 11],
    ["note", 0, 200],
  ] as const) {
    if (
      typeof v[key] !== "string" ||
      v[key].length < min ||
      v[key].length > max ||
      (min > 0 && !(v[key] as string).trim())
    )
      throw new Error("invalid_fields");
  }
  if (!/^01[0125][0-9]{8}$/.test(v.customerPhone as string))
    throw new Error("invalid_fields");
  if (
    !["cash", "instapay"].includes(String(v.paymentMethod)) ||
    ![
      "client_online",
      "owner_phone",
      "owner_whatsapp",
      "owner_counter",
    ].includes(String(v.source))
  )
    throw new Error("invalid_fields");
  // Existing Wasl monetary columns are INTEGER. Fail visibly; never silently round/reprice.
  for (const key of ["feeEGP", "totalEGP"] as const) {
    if (
      typeof v[key] !== "number" ||
      !Number.isSafeInteger(v[key]) ||
      v[key] < 0 ||
      v[key] > 1_000_000
    )
      throw new Error("whole_egp_required");
  }
  if (
    (v.totalEGP as number) <= 0 ||
    (v.feeEGP as number) > (v.totalEGP as number)
  )
    throw new Error("invalid_fields");
  const result = Object.fromEntries(keys.map((k) => [k, v[k]])) as DeliveryEnvelope;
  if ("preparation" in v) {
    const p = v.preparation as Record<string, unknown>;
    const iso = (x: unknown): x is string => typeof x === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(x) && Number.isFinite(Date.parse(x)) && new Date(x).toISOString() === x;
    if (!p || typeof p !== "object" || Array.isArray(p) || Object.keys(p).some(k=>!["estimatedAt","estimatedReadyAt","needsReview"].includes(k)) || ("needsReview" in p && typeof p.needsReview !== "boolean") || !iso(p.estimatedAt) || !(p.estimatedReadyAt === null || iso(p.estimatedReadyAt))) throw new Error("invalid_fields");
    if (p.estimatedReadyAt !== null && (Date.parse(p.estimatedReadyAt as string) < Date.parse(p.estimatedAt) || Date.parse(p.estimatedReadyAt as string) - Date.parse(p.estimatedAt) > 180 * 60000)) throw new Error("invalid_fields");
    result.preparation = { estimatedAt: p.estimatedAt, estimatedReadyAt: p.estimatedReadyAt as string | null, ...("needsReview" in p?{needsReview:p.needsReview as boolean}:{}) };
  }
  if ("quote" in v) {
    const q=v.quote as Record<string,unknown>;
    if(!q||typeof q!=="object"||Array.isArray(q)||Object.keys(q).sort().join(",")!=="acceptedAt,id"||typeof q.id!=="string"||!UUID.test(q.id)||typeof q.acceptedAt!=="string"||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(q.acceptedAt)||!Number.isFinite(Date.parse(q.acceptedAt))||new Date(q.acceptedAt).toISOString()!==q.acceptedAt)throw new Error("invalid_fields");
    result.quote={id:q.id,acceptedAt:q.acceptedAt};
  }
  return result;
}
export function payloadHash(envelope: DeliveryEnvelope): string {
  return createHash("sha256")
    .update(JSON.stringify(parseEnvelope(envelope)))
    .digest("hex");
}
export function signedHeaders(
  secret: string,
  method: string,
  path: string,
  raw: string,
  now = Date.now(),
) {
  if (secret.length < 32) throw new Error("bridge_not_configured");
  const timestamp = String(Math.floor(now / 1000));
  const signature = createHmac("sha256", secret)
    .update(`${timestamp}\n${method.toUpperCase()}\n${path}\n${raw}`)
    .digest("hex");
  return {
    "content-type": "application/json",
    "x-sharefast-timestamp": timestamp,
    "x-sharefast-signature": signature,
  };
}
export function verifySignature(
  secret: string,
  request: Request,
  raw: string,
  now = Date.now(),
): boolean {
  const timestamp = request.headers.get("x-sharefast-timestamp") || "";
  const signature = request.headers.get("x-sharefast-signature") || "";
  if (
    secret.length < 32 ||
    !/^\d{10}$/.test(timestamp) ||
    !/^[a-f0-9]{64}$/.test(signature) ||
    Math.abs(Math.floor(now / 1000) - Number(timestamp)) > 300
  )
    return false;
  const u = new URL(request.url);
  const expected = signedHeaders(
    secret,
    request.method,
    u.pathname + u.search,
    raw,
    Number(timestamp) * 1000,
  )["x-sharefast-signature"];
  return timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expected, "hex"),
  );
}
export async function readLimitedBody(
  request: Request,
  max = 16_384,
): Promise<string> {
  if (!request.body) return "";
  const reader = request.body.getReader(),
    parts: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > max) {
        await reader.cancel();
        throw new Error("body_too_large");
      }
      parts.push(part.value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    bytes.set(part, offset);
    offset += part.length;
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}
export function bridgeOrigin(value: string): string {
  const u = new URL(value);
  if (
    u.protocol !== "https:" ||
    u.username ||
    u.password ||
    u.pathname !== "/" ||
    u.search ||
    u.hash
  )
    throw new Error("bridge_not_configured");
  return u.origin;
}
