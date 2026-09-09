import type { Metadata } from "next";
import { Suspense } from "react";

import { Dashboard, TableSkeleton } from "@/components/dashboard";
import { WarehousesComponent } from "@/components/warehouse/warehouses/warehouses_component";
import { pageMetadata } from "@/lib/dashboard/navbar";

export const metadata: Metadata = pageMetadata("/warehouse");

export default function WarehousePage() {
  return (
    <Dashboard id="warehouse-main">
      <Suspense fallback={<TableSkeleton />}>
        <WarehousesComponent />
      </Suspense>
    </Dashboard>
  );
}
