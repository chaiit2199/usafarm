export const FLASH_COOKIE = "_next_flash";
export const FLASH_EVENT = "app:flash";

export type FlashKind = "info" | "success" | "error";

export type FlashPayload = {
  id: string;
  kind: FlashKind;
  message: string;
  duration: number | null;
};

export const FLASH_TITLES: Record<FlashKind, string> = {
  info: "Thông báo",
  success: "Thành công",
  error: "Lỗi",
};

export const FLASH_COOKIE_PATH = "/";

export function flashCookieOptions(secure: boolean) {
  return {
    maxAge: 30,
    httpOnly: false,
    sameSite: "lax" as const,
    path: FLASH_COOKIE_PATH,
    secure,
  };
}

export function createFlashPayload(
  kind: FlashKind,
  message: string,
  duration?: number | null,
): FlashPayload {
  const ms = typeof duration === "number" && duration > 0 ? duration : null;

  return {
    id: crypto.randomUUID(),
    kind,
    message,
    duration: ms,
  };
}

export function encodeFlash(payload: FlashPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function decodeFlash(raw: string | undefined): FlashPayload | null {
  if (!raw) return null;

  try {
    const payload = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as FlashPayload;

    if (!payload?.id || !payload.message || !payload.kind) return null;

    return payload;
  } catch {
    return null;
  }
}

export function putFlash(kind: FlashKind, message: string, duration?: number | null) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<FlashPayload>(FLASH_EVENT, {
      detail: createFlashPayload(kind, message, duration),
    }),
  );
}
