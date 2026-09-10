import type { Metadata } from "next";
import { Suspense } from "react";

import { Dashboard, TableSkeleton } from "@/components/dashboard";
import { ProductGroupsComponent } from "@/components/products/groups";
import { pageMetadata } from "@/lib/dashboard/navbar";

export const metadata: Metadata = pageMetadata("/products/groups");

export default function Page() {
  return (
    <Dashboard id="product-groups-main">
      <Suspense fallback={<TableSkeleton />}>
        <ProductGroupsComponent />
      </Suspense>
    </Dashboard>
  );
}
