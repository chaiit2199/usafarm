import type { Metadata } from "next";

import { Dashboard } from "@/components/dashboard";
import { pageMetadata } from "@/lib/dashboard/navbar";
import { OrdersComponent } from "@/components/orders/orders_component";
import { filterOrders, getOrderSummary } from "@/lib/api/orders";
import { totalPagesFromMeta } from "@/lib/api/pagination";
import { catchPageLoadError } from "@/lib/catch-page-load";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/lib/constants";


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
    const [summary, orders] = await Promise.all([
      getOrderSummary(),
      filterOrders({ page: DEFAULT_PAGE, page_size: DEFAULT_PAGE_SIZE }),
    ]);
    return (
      <OrdersComponent
        summary={summary.ok ? (summary.data ?? null) : null}
        initialOrders={orders.ok ? (orders.data ?? []) : []}
        initialTotalPages={
          orders.ok
            ? totalPagesFromMeta(orders.meta, orders.data?.length ?? 0, DEFAULT_PAGE_SIZE)
            : 1
        }
        initialLoadError={orders.ok ? null : orders.message}
      />
    );
  } catch (error) {
    return catchPageLoadError(error);
  }
}
  