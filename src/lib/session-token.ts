// Session token：HMAC-SHA256 签名，Edge(proxy) 与 Node(route) 通用
// 只用 Web Crypto，因此不依赖 node:crypto，可同时跑在 Edge Runtime
// token 格式：hex(payload).hex(signature)
//   payload = hex(utf8(JSON))  只含 0-9a-f，不含分隔符

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const DEFAULT_SECRET = "dev-secret-change-me";

export const SESSION_COOKIE = "ajc_session";
export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

export function getAuthSecret(): string {
  return process.env.AUTH_SECRET || DEFAULT_SECRET;
}

export function isUsingDefaultSecret(): boolean {
  return !process.env.AUTH_SECRET;
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

async function hmac(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(data)));
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export interface SessionPayload {
  uid: string;
  exp: number;
}

export async function signSessionToken(userId: string, secret: string): Promise<string> {
  const payload: SessionPayload = {
    uid: userId,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encoded = toHex(encoder.encode(JSON.stringify(payload)).buffer as ArrayBuffer);
  return `${encoded}.${await hmac(encoded, secret)}`;
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string
): Promise<SessionPayload | null> {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  if (!timingSafeEqualHex(await hmac(encoded, secret), signature)) return null;
  try {
    const payload = JSON.parse(decoder.decode(fromHex(encoded))) as SessionPayload;
    if (!payload.uid || payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
