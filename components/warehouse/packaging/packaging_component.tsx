"use client";

import type { WarehouseOrder } from "@/lib/api/types";

export function PackagingComponent({ packagingOrders }: { packagingOrders: WarehouseOrder[] }) {
    console.log(packagingOrders);
    return <div>PackagingComponent</div>;
}