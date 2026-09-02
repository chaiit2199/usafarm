import { NextRequest, NextResponse } from "next/server";

import { isAccessTokenExpired, refreshSession } from "@/lib/auth/refresh";
import {
  SESSION_KEY,
  SESSION_COOKIE_PATH,
  decodeSession,
  encodeSession,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { isSecureRequest, getPublicOrigin } from "@/lib/http/request-origin";

export function redirectToLogin(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", getPublicOrigin(request)), 303);

  response.cookies.delete({
    name: SESSION_KEY,
    path: SESSION_COOKIE_PATH,
  });

  return response;
}

async function nextWithSession(
  request: NextRequest,
  session: Awaited<ReturnType<typeof decodeSession>>,
) {
  const response = NextResponse.next();
  response.cookies.set(
    SESSION_KEY,
    await encodeSession(session),
    sessionCookieOptions(isSecureRequest(request)),
  );
  return response;
}

export async function ensureAuthenticated(request: NextRequest) {
  const session = await decodeSession(request.cookies.get(SESSION_KEY)?.value);

  if (!session.refresh_token) {
    return redirectToLogin(request);
  }

  if (!session.access_token || isAccessTokenExpired(session)) {
    const refreshed = await refreshSession(session.refresh_token);
    if (!refreshed) {
      return redirectToLogin(request);
    }

    return nextWithSession(request, refreshed);
  }

  return NextResponse.next();
}
