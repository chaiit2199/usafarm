import type { Metadata } from "next";
import { Suspense } from "react";

import { Dashboard, TableSkeleton } from "@/components/dashboard";
import { PackagingComponent } from "@/components/warehouse/packaging/packaging_component";
import { pageMetadata } from "@/lib/dashboard/navbar";

export const metadata: Metadata = pageMetadata("/production/packaging");

export default function PackagingPage() {
  return (
    <Dashboard id="packaging-main">
      <Suspense fallback={<TableSkeleton />}>
        <PackagingComponent />
      </Suspense>
    </Dashboard>
  );
}
