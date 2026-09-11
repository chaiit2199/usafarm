import "server-only";

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
  data?: unknown;
}) {
  if (!enabled) return;

  console.error("[http]", {
    method: input.method,
    url: input.url,
    status: input.status,
    message: input.message,
    data: input.data,
  });
}
