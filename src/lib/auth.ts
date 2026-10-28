import { cookies } from "next/headers";
import { db } from "@/lib/db";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  getAuthSecret,
  signSessionToken,
  verifySessionToken,
} from "@/lib/session-token";

export {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  getAuthSecret,
  isUsingDefaultSecret,
} from "@/lib/session-token";
export { hashPassword, verifyPassword } from "@/lib/password";

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

/**
 * 取当前登录用户 ID。
 * 鉴权由 src/proxy.ts 在请求入口统一拦截，未登录不会走到这里；
 * 这里再做一次用户存在性校验，防止 cookie 指向已删除的账号。
 */
export async function getCurrentUserId(): Promise<string> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const payload = await verifySessionToken(token, getAuthSecret());
  if (!payload) {
    throw new UnauthorizedError();
  }
  const user = await db.user.findUnique({
    where: { id: payload.uid },
    select: { id: true },
  });
  if (!user) {
    throw new UnauthorizedError();
  }
  return user.id;
}

/** 建立会话并写回 httpOnly cookie */
export async function createSession(userId: string): Promise<void> {
  const token = await signSessionToken(userId, getAuthSecret());
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
