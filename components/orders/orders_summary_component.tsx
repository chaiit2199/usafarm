import { Icon } from "@/components/icon";
import type { OrderSummary } from "@/lib/api/types";

function formatMoney(amount: number, currency = "VND") {
  const formatted = new Intl.NumberFormat("en-US").format(amount);
  return currency === "VND" ? `${formatted} đ` : `${formatted} ${currency}`;
}

export function OrdersSummaryComponent({ summary }: { summary: OrderSummary | null }) {
  const items = [
    {
      id: "revenue",
      label: "Doanh thu",
      value: formatMoney(summary?.revenue_amount ?? 0, summary?.currency),
      icon: "hero-banknotes" as const,
    },
    {
      id: "debt",
      label: "Công nợ",
      value: formatMoney(summary?.debt_amount ?? 0, summary?.currency),
      icon: "hero-banknotes" as const,
    },
    {
      id: "paid",
      label: "Đã thu",
      value: formatMoney(summary?.collected_amount ?? 0, summary?.currency),
      icon: "hero-banknotes" as const,
    },
    {
      id: "total_orders",
      label: "Tổng đơn",
      value: new Intl.NumberFormat("en-US").format(summary?.total_orders ?? 0),
      icon: "hero-clipboard-document-list" as const,
    },
  ];

  return (
    <section className="overview__kpis" aria-label="Chỉ số">
      {items.map((item) => (
        <article key={item.id} id={`kpi-${item.id}`} className="overview-kpi">
          <span className="overview-kpi__icon">
            <Icon name={item.icon} className="size-6" />
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
