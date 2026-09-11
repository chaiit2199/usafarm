import type { Metadata } from "next";

import { Dashboard } from "@/components/dashboard";
import { pageMetadata } from "@/lib/dashboard/navbar";
import { OrdersComponent } from "@/components/orders/orders_component";
import { getOrderSummary } from "@/lib/api/orders";

import { catchPageLoadError } from "@/lib/catch-page-load";


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
    const summary = await getOrderSummary();
    return (
      <OrdersComponent summary={summary.ok ? (summary.data ?? null) : null} />
    );
  } catch (error) {
    return catchPageLoadError(error);
  }
}
  