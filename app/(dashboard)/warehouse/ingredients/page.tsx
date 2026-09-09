import type { Metadata } from "next";
import { Suspense } from "react";

import { Dashboard, TableSkeleton } from "@/components/dashboard";
import { IngredientsComponent } from "@/components/warehouse/ingredients";
import { pageMetadata } from "@/lib/dashboard/navbar";

export const metadata: Metadata = pageMetadata("/warehouse/ingredients");

export default function IngredientsPage() {
  return (
    <Dashboard id="warehouse-ingredients-main">
      <Suspense fallback={<TableSkeleton />}>
        <IngredientsComponent />
      </Suspense>
    </Dashboard>
  );
}
