import { z } from "zod";

import { positiveInt, trimmed } from "./shared";

export const orderIdSchema = z.object({
  id: positiveInt,
});

export const rejectOrderSchema = z.object({
  id: positiveInt,
  reason: trimmed.min(1, "Vui lòng nhập lý do từ chối").max(1000),
});

export const assignWarehouseSchema = z.object({
  warehouse_id: positiveInt,
});

export type OrderIdInput = z.infer<typeof orderIdSchema>;
export type RejectOrderInput = z.infer<typeof rejectOrderSchema>;
export type AssignWarehouseInput = z.infer<typeof assignWarehouseSchema>;
