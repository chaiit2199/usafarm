import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard";
import { OrdersHandoverComponent } from "@/components/orders/handover/orders_handover_component";
import { pageMetadata } from "@/lib/dashboard/navbar";

export const metadata: Metadata = pageMetadata("/production/handover");

export default function HandoverPage() {
  return (
    <Dashboard id="handover-main">
      <OrdersHandoverComponent />
    </Dashboard>
  );
}
