import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isSecureRequest } from "@/lib/http/request-origin";
import {
  FLASH_COOKIE,
  createFlashPayload,
  encodeFlash,
  flashCookieOptions,
  type FlashKind,
} from "@/lib/flash/flash";

export function withFlash(
  response: NextResponse,
  request: NextRequest,
  kind: FlashKind,
  message: string,
  duration?: number | null,
) {
  response.cookies.set(
    FLASH_COOKIE,
    encodeFlash(createFlashPayload(kind, message, duration)),
    flashCookieOptions(isSecureRequest(request)),
  );

  return response;
}
