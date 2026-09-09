"use client";

import { Icon } from "@/components/icon";

export const IngredientsSummary = [
  { id: "total_inventory_weight", label: "Tổng nguyên liệu tồn kho", value: "104,000 KG" },
  { id: "monitored_blocks", label: "Số khối nguyên liệu đang theo dõi", value: "6" },
  { id: "expected_bags", label: "Tổng số bao dự kiến", value: "2,680 bao" },
];

export function IngredientsSummaryComponent() {
  return (
    <section className="overview__kpis" aria-label="Chỉ số">
      {IngredientsSummary.map((item) => (
        <article key={item.id} id={`kpi-${item.id}`} className="overview-kpi">
          <span className="overview-kpi__icon">
            <Icon name="hero-banknotes" className="size-6" />
          </span>
          <div className="overview-kpi__body">
            <p className="overview-kpi__label">{item.label}</p>
            <p className="overview-kpi__value">{item.value}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
