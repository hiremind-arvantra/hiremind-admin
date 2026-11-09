/*
 * Record ids in the address bar.
 *
 * Pages used to carry raw database UUIDs — /company/jobs/3f0b8c2a-…/applications —
 * which put internal identifiers in the browser history, in bookmarks, in screen shares
 * and in any Referer header the page sends. These helpers pack the 16 bytes of a UUID
 * behind a keyed transform and render them as 22 base64url characters instead.
 *
 * This is obfuscation, not access control. The key ships with the page, so anyone who
 * wants the underlying id can recover it. What actually protects a record is the
 * ownership check every service performs (company_api's findByIdAndUserId, the
 * requireCompany/requireCandidate guards): a decoded id belonging to someone else still
 * returns 404. Never treat an encoded id as a permission.
 *
 * Anything that is not a UUID — a role slug, a status — passes through untouched, and
 * decode() accepts a plain UUID as well, so links shared before this change keep working.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TOKEN = /^[A-Za-z0-9_-]{22}$/;

/** Fixed 16-byte keystream. Rotating it invalidates every link already in the wild. */
const KEY = [0x7a, 0x21, 0xc4, 0x93, 0x5e, 0xb8, 0x0f, 0xd6, 0x39, 0xac, 0x62, 0x1d, 0xe7, 0x48, 0x95, 0xb3];

const toBytes = (uuid: string): number[] => {
  const hex = uuid.replace(/-/g, "");
  const bytes: number[] = [];
  for (let i = 0; i < 32; i += 2) bytes.push(parseInt(hex.slice(i, i + 2), 16));
  return bytes;
};

const toUuid = (bytes: number[]): string => {
  const hex = bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

/** XOR against the key, chained through the previous byte so equal bytes do not repeat. */
const scramble = (bytes: number[]): number[] => {
  const out: number[] = [];
  let carry = 0x5b;
  for (let i = 0; i < bytes.length; i++) {
    const value = bytes[i] ^ KEY[i] ^ carry;
    out.push(value);
    carry = value;
  }
  return out;
};

const unscramble = (bytes: number[]): number[] => {
  const out: number[] = [];
  let carry = 0x5b;
  for (let i = 0; i < bytes.length; i++) {
    out.push(bytes[i] ^ KEY[i] ^ carry);
    carry = bytes[i];
  }
  return out;
};

const toBase64Url = (bytes: number[]): string =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const fromBase64Url = (token: string): number[] => {
  const base64 = token.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return Array.from(atob(padded), (character) => character.charCodeAt(0));
};

/** Base64url encoding without `btoa`, so links render the same during SSR. */
const encodeBytes = (bytes: number[]): string =>
  typeof btoa === "function" ? toBase64Url(bytes) : Buffer.from(bytes).toString("base64url");

const decodeBytes = (token: string): number[] =>
  typeof atob === "function" ? fromBase64Url(token) : Array.from(Buffer.from(token, "base64url"));

/** A record id as it should appear in a URL. Non-UUID values pass through unchanged. */
export function encodeId(id: string | null | undefined): string {
  if (!id || !UUID.test(id)) return id ?? "";
  return encodeBytes(scramble(toBytes(id)));
}

/** The record id behind a URL segment. Accepts a plain UUID, for links made before this. */
export function decodeId(token: string | null | undefined): string {
  if (!token) return "";
  if (UUID.test(token)) return token;
  if (!TOKEN.test(token)) return token;
  try {
    const bytes = decodeBytes(token);
    if (bytes.length !== 16) return token;
    const uuid = toUuid(unscramble(bytes));
    return UUID.test(uuid) ? uuid : token;
  } catch {
    return token;
  }
}

/** The comma-separated id list some pages carry in a query string (?ids=…). */
export const encodeIds = (ids: string[]): string => ids.map(encodeId).join(",");

export const decodeIds = (value: string | null | undefined): string[] =>
  (value ?? "")
    .split(",")
    .map((part) => decodeId(part.trim()))
    .filter(Boolean);
