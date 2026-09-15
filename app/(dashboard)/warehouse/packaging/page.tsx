import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard";
import { PageLoadError } from "@/components/load_error";
import { PackagingComponent } from "@/components/packaging/packaging_component";
import { filterPackagings, fetchPackagingGroups } from "@/lib/api/packaging";
import { totalPagesFromMeta } from "@/lib/api/pagination";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { pageMetadata } from "@/lib/dashboard/navbar";

export const metadata: Metadata = pageMetadata("/products/packaging");

export default function PackagingPage() {
  return (
    <Dashboard id="packaging-main">
      <PackagingData />
    </Dashboard>
  );
}

async function PackagingData() {
  const [packagingsResult, groupsResult] = await Promise.all([
    filterPackagings({ page: DEFAULT_PAGE, page_size: DEFAULT_PAGE_SIZE, status: "ALL" }),
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
