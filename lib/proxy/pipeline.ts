import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ensureAuthenticated } from "@/lib/auth/guard";

const PROTECTED_ROUTES = [
  "/",
  "/products/cost-management",
  "/products/ingredients",
  "/products/packaging",
  "/products/product",
  "/order",
  "/agents",
  "/promotion",
  "/users",
  "/departments",
  "/roles",
  "/authorization",
];

export async function dispatchRoutePipeline(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/login" && request.method === "POST") {
    return NextResponse.rewrite(new URL("/api/login", request.nextUrl));
  }

  if (protectedRoute(pathname, PROTECTED_ROUTES)) {
    return ensureAuthenticated(request);
  }

  return NextResponse.next();
}

function protectedRoute(pathname: string, routes: readonly string[]): boolean {
  return routes.some((route) => {
    if (route === "/") return pathname === "/";
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}
