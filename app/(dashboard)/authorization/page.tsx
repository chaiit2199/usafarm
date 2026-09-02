import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthorizationComponent } from "@/components/authorization/authorization_component";
import { Dashboard, TableSkeleton } from "@/components/dashboard";
import { getRoles } from "@/lib/api/me";
import { catchPageLoadError } from "@/lib/catch-page-load";
import { pageMetadata } from "@/lib/dashboard/navbar";

export const metadata: Metadata = pageMetadata("/authorization");

export default function AuthorizationPage() {
  return (
    <Dashboard id="authorization-main">
      <Suspense fallback={<TableSkeleton />}>
        <AuthorizationData />
      </Suspense>
    </Dashboard>
  );
}

async function AuthorizationData() {
  try {
    const roles = await getRoles();
    return <AuthorizationComponent roles={roles} />;
  } catch (error) {
    return catchPageLoadError(error);
  }
}
