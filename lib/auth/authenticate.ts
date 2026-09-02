import { NextRequest, NextResponse } from "next/server";
import { client, HttpError } from "@/lib/http/client";
import type { AuthTokenResponse } from "@/lib/auth/tokens";
import { buildSession } from "@/lib/auth/refresh";
import { SESSION_KEY, encodeSession, sessionCookieOptions } from "@/lib/auth/session";
import { redirectToLogin } from "@/lib/auth/guard";
import { withFlash } from "@/lib/flash/cookie";
import { isSecureRequest, getPublicOrigin } from "@/lib/http/request-origin";

export async function login(request: NextRequest) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return withFlash(
      NextResponse.redirect(new URL("/login", getPublicOrigin(request)), 303),
      request,
      "error",
      "Thiếu tên đăng nhập hoặc mật khẩu",
    );
  }

  try {
    const payload = await client.post<AuthTokenResponse>("/api/v1/auth/login", { username, password });
    const response = NextResponse.redirect(new URL("/", getPublicOrigin(request)), 303);
    response.cookies.set(
      SESSION_KEY,
      await encodeSession(buildSession(payload.data)),
      sessionCookieOptions(isSecureRequest(request)),
    );

    return withFlash(response, request, "success", "Đăng nhập thành công", 1500);
  } catch (error) {
    const message =
      error instanceof HttpError && error.status === 401
        ? "Tài khoản hoặc mật khẩu không chính xác"
        : "Không thể đăng nhập";

    return withFlash(
      NextResponse.redirect(new URL("/login", getPublicOrigin(request)), 303),
      request,
      "error",
      message,
      2000,
    );
  }
}

export async function logout(request: NextRequest) {
  return redirectToLogin(request);
}
