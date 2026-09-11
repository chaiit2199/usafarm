import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard";
import { PackagingComponent } from "@/components/warehouse/packaging/packaging_component";
import { pageMetadata } from "@/lib/dashboard/navbar";

export const metadata: Metadata = pageMetadata("/production/packaging");

export default function PackagingPage() {
  return (
    <Dashboard id="packaging-main">
      <PackagingComponent />
    </Dashboard>
  );
}
