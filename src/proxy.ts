import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  getAuthSecret,
  verifySessionToken,
} from "@/lib/session-token";

// Next 16 的请求拦截约定是 proxy.ts（middleware.ts 已弃用）
// 在请求入口统一拦截：API 未登录返回 401，页面未登录跳转 /login
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith("/api/auth/");

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token, getAuthSecret());

  if (isAuthRoute) {
    return NextResponse.next();
  }

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const login = new URL("/login", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/app/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.svg|robots.txt).*)"],
};
