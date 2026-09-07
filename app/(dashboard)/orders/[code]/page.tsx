import type { Metadata } from "next";

import { Dashboard } from "@/components/dashboard";
import { HeaderPageMeta } from "@/components/header_meta";
import { OrderDetailsComponent } from "@/components/order-details/order_details_component";
import { getOrderDetail } from "@/lib/api/orders";
import { pageMetadata } from "@/lib/dashboard/navbar";

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
        export={true}
      />
      <Dashboard id="order-detail-main">
        {result.ok && (
          <OrderDetailsComponent
            order={result.data.order}
            fulfillmentCapacity={result.data.fulfillment}
          />
        )}
      </Dashboard>
    </>
  );
}
