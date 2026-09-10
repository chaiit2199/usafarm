import type { Metadata } from "next";
import { Suspense } from "react";

import { Dashboard, TableSkeleton } from "@/components/dashboard";
import { ProductTypesComponent } from "@/components/products/types";
import { pageMetadata } from "@/lib/dashboard/navbar";

export const metadata: Metadata = pageMetadata("/products/types");

export default function Page() {
  return (
    <Dashboard id="product-types-main">
      <Suspense fallback={<TableSkeleton />}>
        <ProductTypesComponent />
      </Suspense>
    </Dashboard>
  );
}
