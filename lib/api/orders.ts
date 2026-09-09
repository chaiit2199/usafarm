"use server";

import { client, HttpError } from "@/lib/http/client";
import { revalidatePath } from "next/cache";
import type {
  OrderFulfillmentCapacityResponse,
  OrderResponse,
  OrderSummaryResponse,
  OrdersResponse,
} from "@/lib/api/types";

import { runServerAction } from "@/lib/server-actions";
import {
  assignWarehouseSchema,
  orderIdSchema,
  rejectOrderSchema,
  type AssignWarehouseInput,
} from "@/lib/validate/orders";

export type { AssignWarehouseInput };
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

export async function getOrderSummary() {
  try {
    const response = await client.get<OrderSummaryResponse>("/api/v1/orders/summary");
    return { ok: true as const, data: response.data };
  } catch (error) {
    return {
      ok: false as const,
      message: error instanceof HttpError ? error.message : "Không thể tải tổng quan đơn hàng",
    };
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

/** Order detail + fulfillment capacity (sequential: capacity needs order.id). */
export async function getOrderDetail(code: string) {
  const order = await getOrder(code);
  if (!order.ok || !order.data) {
    return {
      ok: false as const,
      message: !order.ok ? order.message : "Không thể tải đơn hàng",
    };
  }

  const fulfillment = await getOrderFulfillmentCapacity(order.data.id);
  if (!fulfillment.ok || !fulfillment.data) {
    return {
      ok: false as const,
      message: !fulfillment.ok ? fulfillment.message : "Không thể tải năng lực đối chiếu kho",
    };
  }

  return {
    ok: true as const,
    data: { order: order.data, fulfillment: fulfillment.data },
  };
}

export async function rejectOrder(payload: { id: number; reason: string }) {
  return runServerAction(rejectOrderSchema, payload, "Không thể từ chối đơn hàng", async ({ id, reason }) => {
    await client.post(
      `/api/v1/orders/${id}/reject`,
      { reason },
      {
        headers: {
          "Idempotency-Key": crypto.randomUUID(),
        },
      },
    );
    revalidatePath("/orders");
    return { ok: true as const };
  });
}

export async function approveOrder(payload: { id: number }) {
  return runServerAction(orderIdSchema, payload, "Không thể duyệt đơn hàng", async ({ id }) => {
    await client.post(`/api/v1/orders/${id}/approve`, 
      undefined,
      {
        headers: {
          "Idempotency-Key": crypto.randomUUID(),
        },
      }
    );
    revalidatePath("/orders");
    return { ok: true as const };
  });
}

export async function assignOrderWarehouse(orderId: number, payload: AssignWarehouseInput) {
  return runServerAction(
    assignWarehouseSchema,
    payload,
    "Không thể chuẩn bị đóng gói",
    async (params) => {
      await client.post(`/api/v1/orders/${orderId}/prepare`, params, {
        headers: {
          "Idempotency-Key": crypto.randomUUID(),
        },
      });
      revalidatePath("/orders");
      return { ok: true as const };
    },
  );
}