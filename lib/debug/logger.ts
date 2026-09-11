import "server-only";

import { inspect } from "node:util";

// show debug only in development mode
const enabled = process.env.NODE_ENV === "development";

// get log each request
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

export function logHttpError(input: {
  method: string;
  url: string;
  status?: number;
  message: string;
  payload?: unknown;
  data?: unknown;
}) {
  if (!enabled) return;

  console.error(
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
