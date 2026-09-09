
import type { Metadata } from "next";
import { Suspense } from "react";

import { Dashboard, TableSkeleton } from "@/components/dashboard";
import { getWarehouseOrders } from "@/lib/api/production";
import { PackagingComponent } from "@/components/warehouse/packaging/packaging_component";
import { pageMetadata } from "@/lib/dashboard/navbar";

export const metadata: Metadata = pageMetadata("/production/packaging");
export default async function PackagingPage() {
    const packagingOrders = await getWarehouseOrders();
    if (!packagingOrders.ok) {
        return <div>Error: {packagingOrders.message}</div>;
    }
    return <Dashboard id="packaging">
        <Suspense fallback={<TableSkeleton />}>
            <PackagingComponent packagingOrders={packagingOrders.data} />
        </Suspense>
    </Dashboard>;
}