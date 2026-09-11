import type { Metadata } from "next";

import { Dashboard } from "@/components/dashboard";
import { ProductComponent } from "@/components/products/product";
import { pageMetadata } from "@/lib/dashboard/navbar";

export const metadata: Metadata = pageMetadata("/products/product");

export default function Page() {
  return (
    <Dashboard id="products-main">
      <ProductComponent />
    </Dashboard>
  );
}
