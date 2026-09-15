import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard";
import { getDepartments } from "@/lib/api/me";
import { totalPagesFromMeta } from "@/lib/api/pagination";
import { filterUsers } from "@/lib/api/users";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { catchPageLoadError } from "@/lib/catch-page-load";
import { pageMetadata } from "@/lib/dashboard/navbar";
import { StaffUsers } from "./staff-users";

export const metadata: Metadata = pageMetadata("/users");

export default function StaffPage() {
  return (
    <Dashboard id="staff-main">
      <StaffData />
    </Dashboard>
  );
}

async function StaffData() {
  try {
    const [departments, usersResult] = await Promise.all([
      getDepartments(),
      filterUsers({ page: DEFAULT_PAGE, page_size: DEFAULT_PAGE_SIZE }),
    ]);

    return (
      <StaffUsers
        departments={departments}
        initialUsers={usersResult.data ?? []}
        initialTotalPages={totalPagesFromMeta(usersResult.meta, usersResult.data?.length ?? 0)}
      />
    );
  } catch (error) {
    return catchPageLoadError(error);
  }
}
