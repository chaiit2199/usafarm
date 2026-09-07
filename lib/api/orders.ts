"use server";

import { client, HttpError } from "@/lib/http/client";
import type {
  OrderFulfillmentCapacityResponse,
  OrderResponse,
  OrdersResponse,
} from "@/lib/api/types";

export type FilterOrdersParams = {
  search?: string;
  status?: number | string;
  page?: number;
  page_size?: number;
};

export async function filterOrders(params: FilterOrdersParams = {}) {
  try {
    const response = await client.get<OrdersResponse>("/api/v1/orders", { params });
    return { ok: true as const, data: response.data ?? [], meta: response.meta };
  } catch (error) {
    return {
      ok: false as const,
      message: error instanceof HttpError ? error.message : "Không thể tải đơn hàng",
    };
  }
}

export async function getOrders() {
  try {
    const response = await client.get<OrdersResponse>(`/api/v1/orders`);
    return { ok: true as const, data: response.data ?? [] };
  } catch (error) {
    return { ok: false as const, message: error instanceof HttpError ? error.message : "Không thể tải đơn hàng" };
  }
}

export async function getOrder(code: string) {
  try {
    const response = await client.get<OrderResponse>(`/api/v1/orders/${code}`);
    return { ok: true as const, data: response.data };
  } catch (error) {
    return { ok: false as const, message: error instanceof HttpError ? error.message : "Không thể tải đơn hàng" };
  }
}

export async function getOrderFulfillmentCapacity(orderId: number) {
  try {
    const response = await client.get<OrderFulfillmentCapacityResponse>(
      `/api/v1/orders/${orderId}/fulfillment-capacity`,
    );
    return { ok: true as const, data: response.data };
  } catch (error) {
    return {
      ok: false as const,
      message:
        error instanceof HttpError
          ? error.message
          : "Không thể tải năng lực đối chiếu kho",
    };
  }
}
