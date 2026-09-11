import type { Metadata } from "next";

import { Dashboard } from "@/components/dashboard";
import { PromotionComponent } from "@/components/promotion";
import { pageMetadata } from "@/lib/dashboard/navbar";

export const metadata: Metadata = pageMetadata("/promotion");

export default function Page() {
  return (
    <Dashboard id="promotions-main">
      <PromotionComponent />
    </Dashboard>
  );
}
