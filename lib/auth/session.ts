import "server-only";
import { createHash, createSecretKey, type KeyObject } from "node:crypto";
import { EncryptJWT, jwtDecrypt } from "jose";

export const SESSION_KEY = "_next_project_key";
export const SESSION_COOKIE_PATH = "/";

export function sessionCookieOptions(secure: boolean) {
  return {
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: "lax" as const,
    path: SESSION_COOKIE_PATH,
    secure,
  };
}

export type Session = {
  access_token?: string;
  refresh_token?: string;
  access_expires_at?: number;
};

let sessionKey: KeyObject | undefined;

function getSessionKey(): KeyObject {
  if (sessionKey) return sessionKey;

  const secret = process.env.SESSION_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters");
  }

  sessionKey = createSecretKey(createHash("sha256").update(secret).digest());
  return sessionKey;
}

export async function encodeSession(session: Session): Promise<string> {
    return new EncryptJWT({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        access_expires_at: session.access_expires_at,
    })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .encrypt(getSessionKey());
}

export async function decodeSession(raw: string | undefined): Promise<Session> {
  if (!raw) return {};

  try {
    const { payload } = await jwtDecrypt(raw, getSessionKey());

    return {
      access_token: typeof payload.access_token === "string" ? payload.access_token : undefined,
      refresh_token: typeof payload.refresh_token === "string" ? payload.refresh_token : undefined,
      access_expires_at:
        typeof payload.access_expires_at === "number" ? payload.access_expires_at : undefined,
    };
  } catch {
    return {};
  }
}
