import type { Metadata } from "next";
import { Suspense } from "react";

import { Dashboard, TableSkeleton } from "@/components/dashboard";
import { PageLoadError } from "@/components/load_error";
import { PackagingComponent } from "@/components/packaging/packaging_component";
import { filterPackagings, fetchPackagingGroups } from "@/lib/api/packaging";
import { totalPagesFromMeta } from "@/lib/api/pagination";
import { pageMetadata } from "@/lib/dashboard/navbar";

export const metadata: Metadata = pageMetadata("/products/packaging");

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
  const [packagingsResult, groupsResult] = await Promise.all([
    filterPackagings({ page: 1, page_size: 20, status: "ALL" }),
    fetchPackagingGroups(),
  ]);

  if (!packagingsResult.ok) {
    return <PageLoadError message={packagingsResult.message} />;
  }
  if (!groupsResult.ok) {
    return <PageLoadError message={groupsResult.message} />;
  }
 
  return (
    <PackagingComponent
      initialPackagings={packagingsResult.data ?? []}
      initialTotalPages={totalPagesFromMeta(
        packagingsResult.meta,
        packagingsResult.data?.length ?? 0,
      )}
      packagingGroups={groupsResult.data}
    />
  );
}
