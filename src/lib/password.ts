import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// 密码哈希：node:crypto 自带 scrypt，无需引入 bcrypt 依赖
// 存储格式：salt(hex):hash(hex)

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
