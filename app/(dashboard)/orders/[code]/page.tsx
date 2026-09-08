import type { Metadata } from "next";

import { HeaderPageMeta } from "@/components/header_meta";
import { OrderDetailsComponent } from "@/components/order-details/order_details_component";
import { getOrderDetail } from "@/lib/api/orders";
import { pageMetadata } from "@/lib/dashboard/navbar";
import { Suspense } from "react";
import { Dashboard, TableSkeleton } from "@/components/dashboard";

type PageProps = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  return pageMetadata("/orders", code);
}

export default async function Page({ params }: PageProps) {
  const { code } = await params;
  const result = await getOrderDetail(code);

  return (
    <>
      <HeaderPageMeta
        href="/orders"
        subpage={result.ok ? result.data.order.code : code}
      />
      <Dashboard id="order-detail-main">
        <Suspense fallback={<TableSkeleton />}> 
          {result.ok && (
            <OrderDetailsComponent
              order={result.data.order}
              fulfillmentCapacity={result.data.fulfillment}
            />
          )}
        </Suspense>
       
      </Dashboard>
    </>
  );
}
