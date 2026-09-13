import "server-only";

import { inspect } from "node:util";

const enabled = process.env.NODE_ENV === "development";

export function Logger(method: string, url: string) {
  if (!enabled) {
    return (_status: number | string) => {};
  }

  const started = performance.now();

  return (status: number | string) => {
    const ms = Math.round(performance.now() - started);
    console.debug(`[debug] ${method} ${url} ${status} ${ms}ms`);
  };
}

export function logHttp(input: {
  method: string;
  url: string;
  status?: number | string;
  message?: string;
  payload?: unknown;
  data?: unknown;
}) {
  if (!enabled) return;

  const statusCode = typeof input.status === "number" ? input.status : Number(input.status);
  const isError = !Number.isFinite(statusCode) || statusCode >= 400;
  const write = isError ? console.error : console.debug;

  write(
    "[http]",
    inspect(
      {
        method: input.method,
        url: input.url,
        status: input.status,
        message: input.message,
        payload: input.payload,
        data: input.data,
      },
      { depth: null, colors: true },
    ),
  );
}
