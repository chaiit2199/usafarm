import type { Metadata } from "next";
import { Suspense } from "react";

import { Dashboard, TableSkeleton } from "@/components/dashboard";
import { ProductSeedsComponent } from "@/components/products/seeds";
import { pageMetadata } from "@/lib/dashboard/navbar";

export const metadata: Metadata = pageMetadata("/products/seeds");

export default function Page() {
  return (
    <Dashboard id="product-seeds-main">
      <Suspense fallback={<TableSkeleton />}>
        <ProductSeedsComponent />
      </Suspense>
    </Dashboard>
  );
}
