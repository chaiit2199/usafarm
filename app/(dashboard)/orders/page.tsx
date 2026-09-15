import type { Metadata } from "next";
import { Suspense } from "react";

import { Dashboard } from "@/components/dashboard";
import { OrdersComponent } from "@/components/orders/orders_component";
import {
  OrdersTableComponent,
  OrdersTableLoading,
} from "@/components/orders/orders_table_component";
import { filterOrders, getOrderSummary } from "@/lib/api/orders";
import { totalPagesFromMeta } from "@/lib/api/pagination";
import { catchPageLoadError } from "@/lib/catch-page-load";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { pageMetadata } from "@/lib/dashboard/navbar";

export const metadata: Metadata = pageMetadata("/orders");

export default async function Page() {
  return (
    <Dashboard id="orders-main">
      <OrdersData />
    </Dashboard>
  );
}

async function OrdersData() {
  try {
    const ordersPromise = filterOrders({ page: DEFAULT_PAGE, page_size: DEFAULT_PAGE_SIZE });
    const summary = await getOrderSummary();
    return (
      <OrdersComponent summary={summary.ok ? (summary.data ?? null) : null}>
        <Suspense fallback={<OrdersTableLoading />}>
          <OrdersTableData ordersPromise={ordersPromise} />
        </Suspense>
      </OrdersComponent>
    );
  } catch (error) {
    return catchPageLoadError(error);
  }
}

async function OrdersTableData({
  ordersPromise,
}: {
  ordersPromise: ReturnType<typeof filterOrders>;
}) {
  const orders = await ordersPromise;
  return (
    <OrdersTableComponent
      initialOrders={orders.ok ? (orders.data ?? []) : []}
      initialTotalPages={
        orders.ok
          ? totalPagesFromMeta(orders.meta, orders.data?.length ?? 0, DEFAULT_PAGE_SIZE)
          : 1
      }
      initialLoadError={orders.ok ? null : orders.message}
    />
  );
}
  