import type { Metadata } from "next";

import { Dashboard } from "@/components/dashboard";
import { TableHead } from "@/components/table_head";
import { pageMetadata } from "@/lib/dashboard/navbar";

export const metadata: Metadata = pageMetadata("/products/cost-management");

const COSTS = [
  { sku: "USA-R01", name: "Gạo ST25 túi 5kg", unit: "Túi", cost: "86.000đ", updated: "18/03/2026" },
  { sku: "USA-C02", name: "Cà phê Arabica 1kg", unit: "Kg", cost: "145.000đ", updated: "17/03/2026" },
  { sku: "USA-T03", name: "Trà ô long hộp 200g", unit: "Hộp", cost: "52.000đ", updated: "16/03/2026" },
  { sku: "USA-M04", name: "Mật ong rừng 500ml", unit: "Chai", cost: "118.000đ", updated: "15/03/2026" },
  { sku: "USA-D05", name: "Đậu xanh nguyên hạt 1kg", unit: "Kg", cost: "34.000đ", updated: "14/03/2026" },
];

export default function CostPricePage() {
  return (
    <Dashboard id="products-main">
      <article className="overview-card">
        <div className="overview-table-wrap">
          <table className="overview-table">
            <thead>
              <tr>
                <TableHead icon="hero-hashtag">SKU</TableHead>
                <TableHead icon="hero-cube">Sản phẩm</TableHead>
                <TableHead icon="hero-calculator">Đơn vị</TableHead>
                <TableHead icon="hero-banknotes" className="is-num">Giá vốn</TableHead>
                <TableHead icon="hero-calendar-days">Cập nhật</TableHead>
              </tr>
            </thead>
            <tbody>
              {COSTS.map((row) => (
                <tr key={row.sku}>
                  <td className="overview-table__code">{row.sku}</td>
                  <td>{row.name}</td>
                  <td>{row.unit}</td>
                  <td className="is-num overview-table__money">{row.cost}</td>
                  <td className="overview-table__muted">{row.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </Dashboard>
  );
}
