"use client";

import { subscribeHeaderAction } from "@/lib/dashboard/header-actions";
import { useEffect, useState } from "react";

import { CreateOrderComponent } from "@/components/orders/create_order_component";
import { OrdersTableComponent } from "@/components/orders/orders_table_component";
import { OrdersSummaryComponent } from "@/components/orders/orders_summary_component";
import type { OrderSummary, Order } from "@/lib/api/types";

export function OrdersComponent({
  summary,
  initialOrders,
  initialTotalPages = 1,
  initialLoadError = null,
}: {
  summary: OrderSummary | null;
  initialOrders: Order[];
  initialTotalPages?: number;
  initialLoadError?: string | null;
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    return subscribeHeaderAction("/orders", (detail) => {
      if (detail.action === "create") setIsCreateOpen(true);
    });
  }, []);

  return (
    <>
      <OrdersSummaryComponent summary={summary} />
      <OrdersTableComponent
        initialOrders={initialOrders}
        initialTotalPages={initialTotalPages}
        initialLoadError={initialLoadError}
      />
      {isCreateOpen && <CreateOrderComponent />}
    </>
  );
}
