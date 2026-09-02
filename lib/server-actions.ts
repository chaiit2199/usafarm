import type { z } from "zod";

import { requireCurrentUser } from "@/lib/api/me";
import { HttpError } from "@/lib/http/client";

export type ActionResult = { ok: true } | { ok: false; message: string };

function validationMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Dữ liệu không hợp lệ";
}

function actionErrorMessage(error: unknown, fallback: string): string {
  return error instanceof HttpError ? error.message : fallback;
}

/** Kiểm tra đăng nhập → validate payload → gọi handler. */
export async function runServerAction<TSchema extends z.ZodType, TResult extends ActionResult>(
  schema: TSchema,
  payload: unknown,
  fallbackMessage: string,
  handler: (input: z.infer<TSchema>) => Promise<TResult>,
): Promise<ActionResult> {
  await requireCurrentUser();

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, message: validationMessage(parsed.error) };
  }

  try {
    return await handler(parsed.data);
  } catch (error) {
    return { ok: false, message: actionErrorMessage(error, fallbackMessage) };
  }
}
