import type { Metadata } from "next";
import { Suspense } from "react";

import { Dashboard, TableSkeleton } from "@/components/dashboard";
import { OrdersHandoverComponent } from "@/components/orders/handover/orders_handover_component";
import { pageMetadata } from "@/lib/dashboard/navbar";

export const metadata: Metadata = pageMetadata("/production/handover");

export default function HandoverPage() {
  return (
    <Dashboard id="handover-main">
      <Suspense fallback={<TableSkeleton />}>
        <OrdersHandoverComponent />
      </Suspense>
    </Dashboard>
  );
}
