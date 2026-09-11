import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard";
import { HeaderPageMeta } from "@/components/header_meta";
import { PageLoadError } from "@/components/load_error";
import { OrderDetailsComponent } from "@/components/order-details/order_details_component";
import { getOrderDetail } from "@/lib/api/orders";
import { catchPageLoadError } from "@/lib/catch-page-load";
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

  return (
    <>
      <HeaderPageMeta href="/orders" subpage={code} />
      <Dashboard id="order-detail-main">
        <OrderDetailData code={code} />
      </Dashboard>
    </>
  );
}

async function OrderDetailData({ code }: { code: string }) {
  try {
    const result = await getOrderDetail(code);
    if (!result.ok) {
      return <PageLoadError message={result.message} />;
    }

    return (
      <OrderDetailsComponent
        order={result.data.order}
        fulfillmentCapacity={result.data.fulfillment}
      />
    );
  } catch (error) {
    return catchPageLoadError(error);
  }
}
