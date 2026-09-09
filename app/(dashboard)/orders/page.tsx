import type { Metadata } from "next";

import { Suspense } from "react";
import { Dashboard, TableSkeleton } from "@/components/dashboard";
import { pageMetadata } from "@/lib/dashboard/navbar";
import { OrdersComponent } from "@/components/orders/orders_component";
import { getOrders, getOrderSummary } from "@/lib/api/orders";

import { catchPageLoadError } from "@/lib/catch-page-load";


export const metadata: Metadata = pageMetadata("/orders");

export default async function Page() {
  
  return ( 

    <Dashboard id="orders-main">
    <Suspense fallback={<TableSkeleton />}>
      <OrdersData />
    </Suspense>
    </Dashboard>
  );
}

async function OrdersData() {
  try {
    const [orders, summary] = await Promise.all([getOrders(), getOrderSummary()]);
    return (
      <OrdersComponent
        orders={orders.ok ? (orders.data ?? []) : []}
        summary={summary.ok ? (summary.data ?? null) : null}
      />
    );
  } catch (error) {
    return catchPageLoadError(error);
  }
}
  