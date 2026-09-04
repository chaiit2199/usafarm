import type { Metadata } from "next";

import { pageMetadata } from "@/lib/dashboard/navbar";
import { OrdersComponent } from "@/components/orders/orders_component";
import { Dashboard } from "@/components/dashboard";

export const metadata: Metadata = pageMetadata("/orders");

export default function Page() {
  return (
    <Dashboard id="orders-main">
      <OrdersComponent />
    </Dashboard>
  );

}
  