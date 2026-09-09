import { z } from "zod";

import { positiveInt } from "./shared";

export const assignWarehouseSchema = z.object({
  warehouse_id: positiveInt,
});

export type AssignWarehouseInput = z.infer<typeof assignWarehouseSchema>;
