import type { Metadata } from "next";
import { Suspense } from "react";

import { Dashboard, TableSkeleton } from "@/components/dashboard";
import { getPermissions, getScopeTypes } from "@/lib/api/me";
import { filterRoles } from "@/lib/api/roles";
import { catchPageLoadError } from "@/lib/catch-page-load";
import { PermissionGroupsComponent } from "@/components/permission_groups/permission_groups_component";
import { pageMetadata } from "@/lib/dashboard/navbar";

export const metadata: Metadata = pageMetadata("/roles");

export default function PermissionGroupsPage() {
  return (
    <Dashboard id="permission-main">
      <Suspense fallback={<TableSkeleton />}>
        <RolesData />
      </Suspense>
    </Dashboard>
  );
}

async function RolesData() {
  try {
    const [scopeTypes, permissions, rolesResult] = await Promise.all([
      getScopeTypes(),
      getPermissions(),
      filterRoles({ page: 1, page_size: 20 }),
    ]);
    const pageSize = rolesResult.meta?.page_size ?? 20;
    const total = rolesResult.meta?.total ?? rolesResult.data?.length ?? 0;

    return (
      <PermissionGroupsComponent
        scopeTypes={scopeTypes}
        permissions={permissions}
        initialRoles={rolesResult.data ?? []}
        initialTotalPages={Math.max(1, Math.ceil(total / pageSize))}
      />
    );
  } catch (error) {
    return catchPageLoadError(error);
  }
}
