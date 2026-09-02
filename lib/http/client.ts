import "server-only";

import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { cookies } from "next/headers";

import { refreshSession } from "@/lib/auth/refresh";
import {
  SESSION_KEY,
  decodeSession,
  encodeSession,
  sessionCookieOptions,
  type Session,
} from "@/lib/auth/session";
import { Logger } from "@/lib/debug/logger";

export type HttpRequestOptions = Omit<AxiosRequestConfig, "url" | "method" | "data"> & {
  accessToken?: string;
};

const AUTH_ENDPOINTS = ["/api/v1/auth/login", "/api/v1/auth/refresh-token"];

function isAuthEndpoint(url?: string) {
  return AUTH_ENDPOINTS.some((path) => url?.includes(path));
}

export class HttpError extends Error {
  static readonly Unauthorized = 401;

  constructor(
    message: string,
    public readonly status?: number,
    public readonly data?: unknown,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export class Client {
  private readonly instance: AxiosInstance;

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config);
  }

  private async readSession(): Promise<Session> {
    try {
      const store = await cookies();
      return await decodeSession(store.get(SESSION_KEY)?.value);
    } catch {
      return {};
    }
  }

  private async writeSession(session: Session): Promise<boolean> {
    try {
      const store = await cookies();
      store.set(
        SESSION_KEY,
        await encodeSession(session),
        sessionCookieOptions(process.env.NODE_ENV === "production"),
      );
      return true;
    } catch {
      // RSC cannot set cookies — proxy/guard persists refreshed session.
      return false;
    }
  }

  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = (await this.readSession()).refresh_token;
    if (!refreshToken) return null;

    const session = await refreshSession(refreshToken);
    if (!session?.access_token) return null;

    await this.writeSession(session);
    return session.access_token;
  }

  private async request<TResponse, TBody = unknown>(
    method: AxiosRequestConfig["method"],
    url: string,
    data?: TBody,
    options: HttpRequestOptions = {},
    isRetry = false,
  ): Promise<TResponse> {
    const { accessToken: explicitToken, headers, ...requestConfig } = options;
    const skipAuth = isAuthEndpoint(url);
    const token = skipAuth ? undefined : (explicitToken ?? (await this.readSession()).access_token);

    const debug = Logger(
      String(method ?? "GET").toUpperCase(),
      `${url}${isRetry ? " (retry)" : ""}`,
    );

    try {
      const response = await this.instance.request<TResponse>({
        ...requestConfig,
        method,
        url,
        data,
        headers: {
          ...headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      debug(response.status);
      return response.data;
    } catch (error) {
      const httpError = toHttpError(error);
      debug(httpError.status ?? "error");

      if (!isRetry && !skipAuth && httpError.status === HttpError.Unauthorized) {
        const accessToken = await this.refreshAccessToken();
        if (accessToken) {
          return this.request<TResponse, TBody>(method, url, data, { ...options, accessToken }, true);
        }
      }

      throw httpError;
    }
  }

  get<TResponse>(url: string, options?: HttpRequestOptions) {
    return this.request<TResponse>("GET", url, undefined, options);
  }

  post<TResponse, TBody = unknown>(url: string, body?: TBody, options?: HttpRequestOptions) {
    return this.request<TResponse, TBody>("POST", url, body, options);
  }

  put<TResponse, TBody = unknown>(url: string, body?: TBody, options?: HttpRequestOptions) {
    return this.request<TResponse, TBody>("PUT", url, body, options);
  }

  patch<TResponse, TBody = unknown>(url: string, body?: TBody, options?: HttpRequestOptions) {
    return this.request<TResponse, TBody>("PATCH", url, body, options);
  }

  delete<TResponse = void>(url: string, options?: HttpRequestOptions) {
    return this.request<TResponse>("DELETE", url, undefined, options);
  }
}

function toHttpError(error: unknown): HttpError {
  if (!axios.isAxiosError(error)) {
    return new HttpError(error instanceof Error ? error.message : "Unknown HTTP error");
  }

  const data = error.response?.data;
  return new HttpError(
    extractServerMessage(data) || error.message || "HTTP request failed",
    error.response?.status,
    data,
    error.code,
  );
}

function extractServerMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;

  const body = data as Record<string, unknown>;
  const nested =
    body.data && typeof body.data === "object"
      ? (body.data as Record<string, unknown>)
      : undefined;

  return (
    readMessage(body.message) ||
    readMessage(body.error) ||
    readMessage(nested?.message) ||
    readMessage(nested?.error)
  );
}

function readMessage(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value)) {
    const joined = value.filter((item): item is string => typeof item === "string").join(", ");
    return joined || undefined;
  }
  if (value && typeof value === "object" && "message" in value) {
    return readMessage((value as { message: unknown }).message);
  }
  return undefined;
}

export const client = new Client({
  baseURL: process.env.BASE_API_URL,
  timeout: 10_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  },
});
