import type { Metadata } from "next";
import { Suspense } from "react";

import { Dashboard, TableSkeleton } from "@/components/dashboard";
import { getPermissions, getScopeTypes } from "@/lib/api/me";
import { totalPagesFromMeta } from "@/lib/api/pagination";
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

    return (
      <PermissionGroupsComponent
        scopeTypes={scopeTypes}
        permissions={permissions}
        initialRoles={rolesResult.data ?? []}
        initialTotalPages={totalPagesFromMeta(rolesResult.meta, rolesResult.data?.length ?? 0)}
      />
    );
  } catch (error) {
    return catchPageLoadError(error);
  }
}
