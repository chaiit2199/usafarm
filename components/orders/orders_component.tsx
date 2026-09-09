"use client";

import { subscribeHeaderAction } from "@/lib/dashboard/header-actions";
import { useEffect, useState } from "react";

import { CreateOrderComponent } from "@/components/orders/create_order_component";
import { OrdersTableComponent } from "@/components/orders/orders_table_component";
import { OrdersSummaryComponent } from "@/components/orders/orders_summary_component";
import type { OrderSummary } from "@/lib/api/types";

export function OrdersComponent({ summary }: { summary: OrderSummary | null }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    return subscribeHeaderAction("/orders", (detail) => {
      if (detail.action === "create") setIsCreateOpen(true);
    });
  }, []);

  return (
    <>
      <OrdersSummaryComponent summary={summary} />
      <OrdersTableComponent />
      {isCreateOpen && <CreateOrderComponent />}
    </>
  );
}
