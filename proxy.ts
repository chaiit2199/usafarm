import type { NextRequest } from "next/server";

import { dispatchRoutePipeline } from "@/lib/proxy/pipeline";

export function proxy(request: NextRequest) {
  return dispatchRoutePipeline(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|icons/|images/).*)",
  ],
};