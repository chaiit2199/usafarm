import type { Metadata } from "next";
import { Suspense } from "react";

import { Dashboard, TableSkeleton } from "@/components/dashboard";
import { PageLoadError } from "@/components/load_error";
import { DepartmentsComponent } from "@/components/departments/departments_component";
import { filterDepartments } from "@/lib/api/departments";
import { pageMetadata } from "@/lib/dashboard/navbar";

export const metadata: Metadata = pageMetadata("/departments");

export default function DepartmentsPage() {
  return (
    <Dashboard id="departments-main">
      <Suspense fallback={<TableSkeleton />}>
        <DepartmentsData />
      </Suspense>
    </Dashboard>
  );
}

async function DepartmentsData() {
  const result = await filterDepartments({ page: 1, page_size: 20, status: "ALL" });
  if (!result.ok) {
    return <PageLoadError message={result.message} />;
  }

  const pageSize = result.meta?.page_size ?? 20;
  const total = result.meta?.total ?? result.data?.length ?? 0;

  return (
    <DepartmentsComponent
      initialDepartments={result.data ?? []}
      initialTotalPages={Math.max(1, Math.ceil(total / pageSize))}
    />
  );
}
