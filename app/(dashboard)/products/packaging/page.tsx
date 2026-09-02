import type { Metadata } from "next";

import { WipPage } from "@/components/dashboard";
import { pageMetadata } from "@/lib/dashboard/navbar";

export const metadata: Metadata = pageMetadata("/products/packaging");

export default function Page() {
  return <WipPage id="products-main" />;
}
