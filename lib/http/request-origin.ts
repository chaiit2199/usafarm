import type { NextRequest } from "next/server";

function header(value: string | null) {
  return value?.split(",")[0]?.trim();
}

function appOrigin() {
  const url = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (!url) return undefined;

  try {
    return new URL(url).origin;
  } catch {
    return undefined;
  }
}

function isUpstreamLocalhost(host: string) {
  const name = host.split(":")[0]?.toLowerCase();
  return name === "localhost" || name === "127.0.0.1";
}

/** Origin browser thấy (Caddy X-Forwarded-*), không phải localhost upstream. */
export function getPublicOrigin(request: NextRequest): string {
  const host = header(request.headers.get("x-forwarded-host")) ?? header(request.headers.get("host"));
  const proto = header(request.headers.get("x-forwarded-proto")) ?? request.nextUrl.protocol.replace(":", "");

  if (host && !isUpstreamLocalhost(host)) {
    return `${proto}://${host}`;
  }

  return appOrigin() ?? (host ? `${proto}://${host}` : request.nextUrl.origin);
}

export function isSecureRequest(request: NextRequest): boolean {
  if (process.env.NODE_ENV === "production") return true;
  if (header(request.headers.get("x-forwarded-proto")) === "https") return true;
  return appOrigin()?.startsWith("https") ?? false;
}
