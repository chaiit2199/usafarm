"use server";

import { client, HttpError } from "@/lib/http/client";
import type {
  WarehouseOrderResponse,
  WarehouseOrdersResponse,
} from "@/lib/api/types";

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
