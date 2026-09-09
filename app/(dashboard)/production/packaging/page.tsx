import type { Metadata } from "next";
import { Suspense } from "react";

import { Dashboard, TableSkeleton } from "@/components/dashboard";
import { PageLoadError } from "@/components/load_error";
import { PackagingComponent } from "@/components/warehouse/packaging/packaging_component";
import { totalPagesFromMeta } from "@/lib/api/pagination";
import { getWarehouseOrders } from "@/lib/api/production";
import { pageMetadata } from "@/lib/dashboard/navbar";

export const metadata: Metadata = pageMetadata("/production/packaging");

export default function PackagingPage() {
  return (
    <Dashboard id="packaging-main">
      <Suspense fallback={<TableSkeleton />}>
        <PackagingData />
      </Suspense>
    </Dashboard>
  );
}

async function PackagingData() {
  const result = await getWarehouseOrders({ page: 1, page_size: 20 });
  if (!result.ok) {
    return <PageLoadError message={result.message} />;
  }

  return (
    <PackagingComponent
      initialOrders={result.data ?? []}
      initialTotalPages={totalPagesFromMeta(result.meta, result.data?.length ?? 0)}
    />
  );
}
