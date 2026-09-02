import axios from "axios";

import { Logger } from "@/lib/debug/logger";
import type { AuthTokenResponse } from "@/lib/auth/tokens";
import type { Session } from "@/lib/auth/session";

const REFRESH_BUFFER_MS = 60_000; // before access token expires, call refresh
const REFRESH_PATH = "/api/v1/auth/refresh-token";

export function buildSession(data: AuthTokenResponse["data"]): Session {
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    access_expires_at: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
}

export function isAccessTokenExpired(session: Session): boolean {
  if (!session.access_token || !session.access_expires_at) return true;
  return Date.now() >= session.access_expires_at - REFRESH_BUFFER_MS;
}

export async function refreshSession(refreshToken: string): Promise<Session | null> {
  const baseUrl = process.env.BASE_API_URL;
  if (!baseUrl) return null;

  const debug = Logger("POST", REFRESH_PATH);

  try {
    const { status, data: body } = await axios.post<AuthTokenResponse>(
      `${baseUrl}${REFRESH_PATH}`,
      { refresh_token: refreshToken },
      {
        timeout: 5_000,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );

    debug(status);

    const data = body?.data;
    if (!data?.access_token) return null;

    return buildSession({
      ...data,
      refresh_token: data.refresh_token ?? refreshToken,
    });
  } catch (error) {
    debug(axios.isAxiosError(error) ? (error.response?.status ?? "error") : "error");
    return null;
  }
}
