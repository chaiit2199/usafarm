import type { Metadata } from "next";
import { Suspense } from "react";

import { Dashboard, TableSkeleton } from "@/components/dashboard";
import { getDepartments } from "@/lib/api/me";
import { filterUsers } from "@/lib/api/users";
import { catchPageLoadError } from "@/lib/catch-page-load";
import { pageMetadata } from "@/lib/dashboard/navbar";
import { StaffUsers } from "./staff-users";

export const metadata: Metadata = pageMetadata("/users");

export default function StaffPage() {
  return (
    <Dashboard id="staff-main">
      <Suspense fallback={<TableSkeleton />}>
        <StaffData />
      </Suspense>
    </Dashboard>
  );
}

async function StaffData() {
  try {
    const [departments, usersResult] = await Promise.all([
      getDepartments(),
      filterUsers({ page: 1, page_size: 20 }),
    ]);

    return (
      <StaffUsers
        departments={departments}
        initialUsers={usersResult.data ?? []}
        initialTotalPages={Math.max(
          1,
          Math.ceil(
            (usersResult.meta?.total ?? usersResult.data?.length ?? 0) /
              (usersResult.meta?.page_size ?? 20),
          ),
        )}
      />
    );
  } catch (error) {
    return catchPageLoadError(error);
  }
}
