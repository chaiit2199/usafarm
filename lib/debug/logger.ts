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
