import type { Metadata } from "next";

import { Dashboard } from "@/components/dashboard";
import { HeaderPageMeta } from "@/components/header_page_meta";
import { OrderDetailsComponent } from "@/components/order-details/order_details_component";
import { getOrder, getOrderFulfillmentCapacity } from "@/lib/api/orders";
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
  const orderResult = await getOrder(code);
  const fulfillmentResult =
    orderResult.ok && orderResult.data
      ? await getOrderFulfillmentCapacity(orderResult.data.id)
      : null;

  return (
    <>
      <HeaderPageMeta href="/orders" subpage={orderResult.data?.code ?? code} />
      <Dashboard id="order-detail-main">
        {orderResult.ok &&
          orderResult.data &&
          fulfillmentResult?.ok &&
          fulfillmentResult.data && (
            <OrderDetailsComponent
              order={orderResult.data}
              fulfillmentCapacity={fulfillmentResult.data}
            />
          )}
      </Dashboard>
    </>
  );
}
