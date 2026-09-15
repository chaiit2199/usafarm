import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard";
import { PageLoadError } from "@/components/load_error";
import { DepartmentsComponent } from "@/components/departments/departments_component";
import { filterDepartments } from "@/lib/api/departments";
import { totalPagesFromMeta } from "@/lib/api/pagination";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { pageMetadata } from "@/lib/dashboard/navbar";

export const metadata: Metadata = pageMetadata("/departments");

export default function DepartmentsPage() {
  return (
    <Dashboard id="departments-main">
      <DepartmentsData />
    </Dashboard>
  );
}

async function DepartmentsData() {
  const result = await filterDepartments({ page: DEFAULT_PAGE, page_size: DEFAULT_PAGE_SIZE, status: "ALL" });
  if (!result.ok) {
    return <PageLoadError message={result.message} />;
  }

  return (
    <DepartmentsComponent
      initialDepartments={result.data ?? []}
      initialTotalPages={totalPagesFromMeta(result.meta, result.data?.length ?? 0)}
    />
  );
}
