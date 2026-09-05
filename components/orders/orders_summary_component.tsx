import { Icon } from "@/components/icon";

export const OrdersSummary = [
    { id: "revenue", label: "Doanh thu", value: "10 tỷ" },
    { id: "debt", label: "Công nợ", value: "1 tỷ" },
    { id: "paid", label: "Đã thu", value: "9 tỷ" },
  ];
  

export function OrdersSummaryComponent() {
    return (
        <section className="overview__kpis" aria-label="Chỉ số">
            {OrdersSummary.map((item) => (
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