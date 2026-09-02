import type { Metadata } from "next";
import Link from "next/link";

import { ChartPeriodFilter } from "@/components/charts/chart-period-filter";
import { OrderPieChart } from "@/components/charts/order-pie-chart";
import { SalesAreaChart } from "@/components/charts/sales-area-chart";
import { Icon } from "@/components/icon";
import { TableHead } from "@/components/table_head";
import { KPIS, RECENT_ORDERS, SALES_SERIES, TOP_SALES } from "@/lib/mock/overview";
import { ORDER_SERIES } from "@/lib/constants";
import { pageMetadata } from "@/lib/dashboard/navbar";

export const metadata: Metadata = pageMetadata("/");

export default function DashboardPage() {
  return (
    <main className="dash-main overview" id="overview">
      <section className="overview__kpis" aria-label="Chỉ số">
        {KPIS.map((kpi) => (
          <article key={kpi.id} id={`kpi-${kpi.id}`} className="overview-kpi">
            <span className="overview-kpi__icon">
              <Icon name={kpi.icon} className="size-6" />
            </span>
            <div className="overview-kpi__body">
              <p className="overview-kpi__label">{kpi.label}</p>
              <p className="overview-kpi__value">{kpi.value}</p>
            </div>
          </article>
        ))}
      </section>

      <div className="flex gap-6">
        <article className="overview-card overview-card--chart min-w-[500px] max-w-[500px]" id="overview-order-chart">
          <div className="overview-card__head">
            <div className="overview-card__heading">
              <Icon name="hero-chart-pie" className="overview-card__icon" />
              <h2 className="overview-card__title">Thống kê đơn hàng</h2>
            </div>
          </div>
          <OrderPieChart series={ORDER_SERIES} />
        </article>

        <article className="overview-card overview-card--orders w-full" id="overview-order-table">
          <div className="overview-card__head">
            <div className="overview-card__heading">
              <Icon name="hero-clipboard-document-list" className="overview-card__icon" />
              <h2 className="overview-card__title">Đơn hàng gần đây</h2>
            </div>
            <Link href="/orders" className="overview-card__btn">
              Xem tất cả
              <Icon name="hero-arrow-right" className="size-3.5" />
            </Link>
          </div>
          <div className="overview-table-wrap">
            <table className="overview-table">
              <thead>
                <tr>
                  <TableHead icon="hero-clipboard-document-list">Mã đơn hàng</TableHead>
                  <TableHead icon="hero-building-storefront">Đại lý</TableHead>
                  <TableHead icon="hero-banknotes" className="is-num">Tổng tiền</TableHead>
                  <TableHead icon="hero-tag" className="is-center">Trạng thái</TableHead>
                  <TableHead icon="hero-calendar-days" className="is-muted">Ngày tạo</TableHead>
                </tr>
              </thead>
              <tbody>
                {RECENT_ORDERS.map((order) => (
                  <tr key={order.code} id={`order-${order.code}`}>
                    <td className="overview-table__code">{order.code}</td>
                    <td>{order.agent}</td>
                    <td className="is-num overview-table__money">{order.total}</td>
                    <td className="is-center">
                      <span className={`orders-badge orders-badge--${order.status}`}>
                        {order.status === "completed"
                          ? "Hoàn thành"
                          : order.status === "processing"
                            ? "Đang xử lý"
                            : order.status === "shipping"
                              ? "Đang giao"
                              : "Hủy"}
                      </span>
                    </td>
                    <td className="overview-table__muted">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>

      <div className="overview__grid">
        <article className="overview-card overview-card--sales" id="overview-sales-chart">
          <div className="overview-card__head">
            <div className="overview-card__heading">
              <Icon name="hero-chart-bar" className="overview-card__icon" />
              <h2 className="overview-card__title">Doanh thu theo thời gian</h2>
            </div>
            <div className="overview-card__actions min-w-max">
              <ChartPeriodFilter />
            </div>
          </div>
          <SalesAreaChart series={SALES_SERIES} />
        </article>

        <article className="overview-card overview-card--sellers" id="overview-products-for-sales">
          <div className="overview-card__head">
            <div className="overview-card__heading">
              <Icon name="hero-user-group" className="overview-card__icon" />
              <h2 className="overview-card__title">Top nhân viên bán hàng</h2>
            </div>
          </div>
          <div className="overview-table-wrap">
            <table className="overview-table overview-table--sellers">
              <thead>
                <tr>
                  <TableHead icon="hero-chart-bar" className="is-center">Hạng</TableHead>
                  <TableHead icon="hero-users">Nhân viên</TableHead>
                  <TableHead icon="hero-map-pin">Khu vực</TableHead>
                  <TableHead icon="hero-shopping-cart" className="is-num">Số đơn</TableHead>
                  <TableHead icon="hero-currency-dollar" className="is-num">Doanh thu</TableHead>
                </tr>
              </thead>
              <tbody>
                {TOP_SALES.map((staff) => (
                  <tr key={staff.code} id={`top-sales-${staff.code}`}>
                    <td className="is-center">
                      <span className={["overview-rank", staff.rank <= 3 && "overview-rank--top"].filter(Boolean).join(" ")}>
                        {staff.rank}
                      </span>
                    </td>
                    <td>
                      <div className="overview-seller">
                        <span className="overview-seller__avatar" style={{ background: staff.avatar }}>
                          {staff.initials}
                        </span>
                        <div className="overview-seller__meta">
                          <span className="overview-seller__name">{staff.name}</span>
                          <span className="overview-seller__code">{staff.code}</span>
                        </div>
                      </div>
                    </td>
                    <td>{staff.region}</td>
                    <td className="is-num">{staff.orders}</td>
                    <td className="is-num overview-table__money">{staff.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </main>
  );
}
