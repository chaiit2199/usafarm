import type { Metadata } from "next";
import { Suspense } from "react";

import { Dashboard, TableSkeleton } from "@/components/dashboard";
import { FinishedGoodsComponent } from "@/components/warehouse/finished-goods/finished_goods_component";
import { pageMetadata } from "@/lib/dashboard/navbar";

export const metadata: Metadata = pageMetadata("/warehouse/finished-goods");

export default function FinishedGoodsPage() {
  return (
    <Dashboard id="finished-goods-main">
      <Suspense fallback={<TableSkeleton />}>
        <FinishedGoodsComponent />
      </Suspense>
    </Dashboard>
  );
}
