"use server";

import { revalidatePath } from "next/cache";

import { client, HttpError } from "@/lib/http/client";
import type {
  WarehouseOrderResponse,
  WarehouseOrdersResponse,
} from "@/lib/api/types";
import { runServerAction } from "@/lib/server-actions";
import {
  orderIdSchema,
  completeWarehousePackingSchema,
  createGoodsIssueSchema,
  uploadGoodsIssueImagesSchema,
} from "@/lib/validate/orders";

export type WarehouseOrdersParams = {
  search?: string;
  status?: number | string;
  page?: number;
  page_size?: number;
};

export async function getWarehouseOrders(params: WarehouseOrdersParams = {}) {
  try {
    const response = await client.get<WarehouseOrdersResponse>(
      "/api/v1/warehouse/orders",
      { params },
    );
    return { ok: true as const, data: response.data ?? [], meta: response.meta };
  } catch (error) {
    return {
      ok: false as const,
      message:
        error instanceof HttpError ? error.message : "Không thể tải đơn đóng gói",
    };
  }
}

export async function getWarehouseOrder(id: number | string) {
  try {
    const response = await client.get<WarehouseOrderResponse>(
      `/api/v1/warehouse/orders/${id}`,
    );
    return { ok: true as const, data: response.data };
  } catch (error) {
    return {
      ok: false as const,
      message:
        error instanceof HttpError
          ? error.message
          : "Không thể tải chi tiết đơn đóng gói",
    };
  }
}

export async function startWarehouseOrder(payload: { id: number }) {
  return runServerAction(
    orderIdSchema,
    payload,
    "Không thể bắt đầu đóng gói",
    async ({ id }) => {
      await client.post(`/api/v1/warehouse/orders/${id}/start`, undefined, {
        headers: {
          "Idempotency-Key": crypto.randomUUID(),
        },
      });
      revalidatePath("/production/packaging");
      return { ok: true as const };
    },
  );
}

export async function completeWarehouseOrderPacking(payload: {
  id: number;
  lines: Array<{ order_line_id: number; actual_packed_quantity: number }>;
}) {
  return runServerAction(
    completeWarehousePackingSchema,
    payload,
    "Không thể hoàn thành đóng gói",
    async ({ id, lines }) => {
      await client.patch(
        `/api/v1/warehouse/orders/${id}/packing`,
        { lines },
        {
          headers: {
            "Idempotency-Key": crypto.randomUUID(),
          },
        },
      );
      revalidatePath("/production/packaging");
      return { ok: true as const };
    },
  );
}

export async function createWarehouseOrderGoodsIssue(payload: {
  id: number;
  warehouse_id: number;
  carrier_name: string;
  vehicle_plate: string;
  driver_name: string;
  driver_identity_or_phone: string;
}) {

  console.log(payload);
  return runServerAction(
    createGoodsIssueSchema,
    payload,
    "Không thể lập phiếu xuất kho",
    async ({ id, warehouse_id, carrier_name, vehicle_plate, driver_name, driver_identity_or_phone }) => {
      await client.post(
        `/api/v1/warehouse/orders/${id}/goods-issues`,
        {
          warehouse_id,
          carrier_name,
          vehicle_plate,
          driver_name,
          driver_identity_or_phone,
        },
        {
          headers: {
            "Idempotency-Key": crypto.randomUUID(),
          },
        },
      );
      revalidatePath("/production/export");
      return { ok: true as const };
    },
  );
}

export async function uploadGoodsIssueImages(formData: FormData) {
  return runServerAction(
    uploadGoodsIssueImagesSchema,
    {
      id: formData.get("id"),
      files: formData.getAll("file").filter((item): item is File => item instanceof File),
    },
    "Không thể tải ảnh chứng từ",
    async ({ id, files }) => {
      for (const file of files) {
        const body = new FormData();
        body.append("file", file);
        const ok = await client.post(`/api/v1/warehouse/goods-issues/${id}/images`, body, {
          timeout: 60_000,
        });
        await client.post(`/api/v1/warehouse/goods-issues/${id}/images`, body, {
          timeout: 60_000,
        });
      }
      revalidatePath("/production/handover");
      return { ok: true as const };
    },
  );
}
