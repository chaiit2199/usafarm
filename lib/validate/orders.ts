import { z } from "zod";

import { positiveInt } from "./shared";

export const orderIdSchema = z.object({
  id: positiveInt,
});

export const assignWarehouseSchema = z.object({
  warehouse_id: positiveInt,
});

export type OrderIdInput = z.infer<typeof orderIdSchema>;
export type AssignWarehouseInput = z.infer<typeof assignWarehouseSchema>;
