import { z } from "zod";

import { UserStatus } from "@/lib/constants";

export const trimmed = z.string().trim();

/** Form gửi "" hoặc bỏ trống → undefined. */
export function optionalString(max: number) {
  return z
    .union([trimmed.max(max), z.literal("")])
    .transform((value) => (value === "" ? undefined : value))
    .optional();
}

export function optionalEmail() {
  return z
    .union([trimmed.email("Email không hợp lệ").max(255), z.literal("")])
    .transform((value) => (value === "" ? undefined : value))
    .optional();
}

export const positiveInt = z.coerce.number().int().positive();

export const recordStatusSchema = z.coerce
  .number()
  .int()
  .refine((value) => value === UserStatus.Active || value === UserStatus.Inactive || value === UserStatus.WaitingForApproval || value === UserStatus.Rejected);
