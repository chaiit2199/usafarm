"use client";

import { subscribeHeaderAction } from "@/lib/dashboard/header-actions";
import { useEffect, useState } from "react";

import { CreateOrderComponent } from "@/components/orders/create_order_component";
import { OrdersTableComponent } from "@/components/orders/orders_table_component";
import { OrdersSummaryComponent } from "@/components/orders/orders_summary_component";

export function OrdersComponent() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    return subscribeHeaderAction("/orders", (detail) => {
      if (detail.action === "create") setIsCreateOpen(true);
    });
  }, []);

  return (
    <>
      <OrdersSummaryComponent />
      <OrdersTableComponent />
      {isCreateOpen && <CreateOrderComponent />}
    </>
  );
}
