"use server";

import { revalidatePath } from "next/cache";

import { client, HttpError } from "@/lib/http/client";
import type {
  WarehouseOrderResponse,
  WarehouseOrdersResponse,
} from "@/lib/api/types";
import { runServerAction } from "@/lib/server-actions";
import { orderIdSchema } from "@/lib/validate/orders";

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
