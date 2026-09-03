import { z } from "zod";

import { PACKAGING_UNITS } from "@/lib/constants";
import { optionalString, positiveInt, recordStatusSchema, trimmed } from "./shared";

const packagingUnitValues = PACKAGING_UNITS.map((unit) => unit.value) as [string, ...string[]];

export const packagingUnitSchema = z.enum(packagingUnitValues);

export const createPackagingSchema = z.object({
  code: trimmed.min(1, "Thiếu mã bao bì").max(64),
  name: trimmed.min(1, "Thiếu tên bao bì").max(255),
  status: recordStatusSchema,
  unit: packagingUnitSchema,
  group_ids: z.array(positiveInt).default([]),
  note: optionalString(1000),
  weight_kg: z.coerce.number().nonnegative("Khối lượng không hợp lệ"),
});

export const updatePackagingSchema = createPackagingSchema.extend({
  id: positiveInt,
});

export type CreatePackagingInput = z.infer<typeof createPackagingSchema>;
export type UpdatePackagingInput = z.infer<typeof updatePackagingSchema>;
