import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard";
import { OrdersExportComponent } from "@/components/orders/export/orders_export_component";
import { pageMetadata } from "@/lib/dashboard/navbar";

export const metadata: Metadata = pageMetadata("/production/export");

export default function ExportPage() {
  return (
    <Dashboard id="export-main">
      <OrdersExportComponent />
    </Dashboard>
  );
}
