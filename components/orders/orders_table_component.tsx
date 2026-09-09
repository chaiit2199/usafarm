"use client";

import { useRouter } from "next/navigation";
import { Fragment } from "react";

import { Pagination, TableHead } from "@/components/core_component";
import { Tab } from "@/components/tab";
import { Icon } from "@/components/icon";
import {
  orderReceived,
  orderRemaining,
  orderTotal,
  type OrderStatusRef,
} from "@/lib/api/types";
import {
  ORDER_STATUSES,
  getOrderStatusLabel,
  orderColor,
} from "@/lib/constants";
import { formatDateTimeVi } from "@/lib/format/date";
import type { Order } from "@/lib/api/types";

const ORDER_STATUS_TABS = [
  { value: "all" as const, label: "Tất cả" },
  ...ORDER_STATUSES.map((s) => ({ value: s.id, label: s.label })),
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function OrderStatusBadge({ status }: { status: OrderStatusRef }) {
  const label = getOrderStatusLabel(status);
  const color = orderColor(status);

  return (
    <span
      className="status"
      style={{
        color,
        borderColor: `${color}55`,
        backgroundColor: `${color}1A`,
      }}
    >
      {label}
    </span>
  );
}

export function OrdersTableComponent({ orders }: { orders: Order[] }) {
  const router = useRouter();
  return (
    <>
      <section className="section" id="admin-orders-section">
        <div className="section-container section-table style-2 mb-6">
          <Tab tabs={ORDER_STATUS_TABS} activeTab="all" isScroll />

          <div className="overview-table-wrap style-2">
            <div className="overview-table-inner cursor-e-resize">
              <table className="overview-table min-w-[2000px]" id="orders-table">
                <colgroup>
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "4%" }} /> 
                </colgroup>
                <thead>
                  <tr>
                    <TableHead icon="hero-clipboard-document-list">Mã đơn</TableHead>
                    <TableHead icon="hero-tag">Trạng thái</TableHead>
                    <TableHead icon="hero-building-storefront">Đại lý</TableHead>
                    <TableHead icon="hero-calendar-days">Ngày tạo</TableHead>
                    <TableHead icon="hero-banknotes">Tổng tiền</TableHead>
                    <TableHead icon="hero-banknotes">Công nợ đã thu</TableHead>
                    <TableHead icon="hero-banknotes">Công nợ còn lại</TableHead>
                    <TableHead icon="hero-calendar-days">Thời gian cập nhật</TableHead>
                    <th className="actions" />
                  </tr>
                </thead>
                <tbody>
                  
                  {orders.map((order) => (
                    <Fragment key={order.id}>
                    <tr
                      key={order.code}
                      id={`order-row-${order.code}`}
                      className="cursor-pointer"
                      onClick={() => router.push(`/orders/${order.id}`)}
                    >
                      <td className="overview-table__code">{order.code}</td>
                      <td>
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td>{order.agency.name}</td>
                      <td className="overview-table__muted">{formatDateTimeVi(order.created_at)}</td>
                      <td className="is-num overview-table__money">{formatMoney(orderTotal(order))}</td>
                      <td className="is-num overview-table__money">{formatMoney(orderReceived(order))}</td>
                      <td className="is-num overview-table__money">{formatMoney(orderRemaining(order))}</td>
                    
                      <td className="overview-table__muted">{formatDateTimeVi(order.updated_at)}</td>
                      <td className="actions">
                        <div className="admin-actions">
                          <button
                            type="button"
                            className="admin-actions__btn"
                            aria-label="Chỉnh sửa"
                            onClick={(event) => {
                              event.stopPropagation();
                              router.push(`/orders/${order.id}`);
                            }}
                          >
                            <Icon name="hero-pencil-square" className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {order.children.length > 0 &&
                        order.children.map((child) => (
                      <tr
                          key={child.code}
                          id={`order-row-${child.code}`}
                          className="cursor-pointer"
                          onClick={() => router.push(`/orders/${child.id}`)}
                        >
                          <td className="overview-table__code">
                            <span className="inline-flex items-center gap-2 pl-2">
                              <Icon name="hero-arrow-turn-down-right" className="size-6 shrink-0 text-theme-muted" />
                              {child.code}
                            </span>
                          </td>
                          <td>
                            <OrderStatusBadge status={child.status} />
                          </td>
                          <td>{child.agency.name}</td>
                          <td className="overview-table__muted">{formatDateTimeVi(child.created_at)}</td>
                          <td className="is-num overview-table__money">{formatMoney(orderTotal(child))}</td>
                          <td className="is-num overview-table__money">{formatMoney(orderReceived(child))}</td>
                          <td className="is-num overview-table__money">{formatMoney(orderRemaining(child))}</td>
                        
                          <td className="overview-table__muted">{formatDateTimeVi(child.updated_at)}</td>
                          <td className="actions">
                            <div className="admin-actions">
                              <button
                                type="button"
                                className="admin-actions__btn"
                                aria-label="Chỉnh sửa"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  router.push(`/orders/${child.id}`);
                                }}
                              >
                                <Icon name="hero-pencil-square" className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                    ))}

                    </Fragment>
                  ))}  
                </tbody>
              </table>
            </div>
          </div>
          <Pagination
            currentPage={1}
            totalPages={1}
            pageSize={20}
            onPageChange={() => {}}
            onPageSizeChange={() => {}}
          />
        </div>
      </section>
    </>
  );
}
