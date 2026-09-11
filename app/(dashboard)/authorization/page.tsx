import type { Metadata } from "next";

import { AuthorizationComponent } from "@/components/authorization/authorization_component";
import { Dashboard } from "@/components/dashboard";
import { getRoles } from "@/lib/api/me";
import { catchPageLoadError } from "@/lib/catch-page-load";
import { pageMetadata } from "@/lib/dashboard/navbar";

export const metadata: Metadata = pageMetadata("/authorization");

export default function AuthorizationPage() {
  return (
    <Dashboard id="authorization-main">
      <AuthorizationData />
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
