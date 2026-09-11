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

export const completeWarehousePackingSchema = z.object({
  id: positiveInt,
  lines: z
    .array(
      z.object({
        order_line_id: positiveInt,
        actual_packed_quantity: z.coerce.number().int().nonnegative(),
      }),
    )
    .min(1, "Vui lòng nhập số lượng đóng gói"),
});

export const createGoodsIssueSchema = z.object({
  id: positiveInt,
  warehouse_id: positiveInt,
  carrier_name: trimmed.min(1, "Vui lòng chọn nhà vận chuyển"),
  vehicle_plate: trimmed.min(1, "Vui lòng nhập biển số xe"),
  driver_name: trimmed.min(1, "Vui lòng nhập họ tên lái xe"),
  driver_identity_or_phone: trimmed.min(1, "Vui lòng nhập CCCD / điện thoại"),
});

export const uploadGoodsIssueImagesSchema = z.object({
  id: positiveInt,
  files: z.array(z.instanceof(File)).min(1, "Vui lòng tải ảnh chứng từ"),
});

export const confirmGoodsIssueHandoverSchema = z.object({
  id: positiveInt,
  image_ids: z.array(positiveInt).min(1, "Vui lòng tải ảnh chứng từ"),
  note: trimmed.max(2000).optional().default(""),
});

export type OrderIdInput = z.infer<typeof orderIdSchema>;
export type RejectOrderInput = z.infer<typeof rejectOrderSchema>;
export type AssignWarehouseInput = z.infer<typeof assignWarehouseSchema>;
export type CompleteWarehousePackingInput = z.infer<typeof completeWarehousePackingSchema>;
export type CreateGoodsIssueInput = z.infer<typeof createGoodsIssueSchema>;
export type UploadGoodsIssueImagesInput = z.infer<typeof uploadGoodsIssueImagesSchema>;
export type ConfirmGoodsIssueHandoverInput = z.infer<typeof confirmGoodsIssueHandoverSchema>;
