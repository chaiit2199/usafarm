"use client";

import { useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";

import {
  EmptyData,
  Pagination,
  TableHead,
} from "@/components/core_component";
import { Icon } from "@/components/icon";
import { LoadError } from "@/components/load_error";
import { Tab } from "@/components/tab";
import { filterOrders } from "@/lib/api/orders";
import { totalPagesFromMeta } from "@/lib/api/pagination";
import {
  orderReceived,
  orderRemaining,
  orderTotal,
  type Order,
  type OrderStatusRef,
} from "@/lib/api/types";
import {
  ORDER_STATUSES,
  getOrderStatusLabel,
  orderColor,
} from "@/lib/constants";
import { subscribeHeaderAction } from "@/lib/dashboard/header-actions";
import { formatDateTimeVi } from "@/lib/format/date";

const ORDER_STATUS_TABS = [
  { value: "all" as const, label: "Tất cả" },
  ...ORDER_STATUSES.map((s) => ({ value: s.id, label: s.label })),
];

type StatusTabValue = (typeof ORDER_STATUS_TABS)[number]["value"];

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

export function OrdersTableComponent() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<StatusTabValue>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadAt, setReloadAt] = useState(0);

  useEffect(() => {
    return subscribeHeaderAction("/orders", (detail) => {
      if (detail.action === "search") setSearch(detail.query ?? "");
    });
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, activeTab]);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);

    filterOrders({
      search: search.trim() || "",
      ...(activeTab === "all" ? {} : { status: activeTab }),
      page,
      page_size: pageSize,
    }).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setLoadError(result.message);
        setOrders([]);
        return;
      }
      setOrders(result.data ?? []);
      setTotalPages(totalPagesFromMeta(result.meta, result.data?.length ?? 0, pageSize));
    });

    return () => {
      cancelled = true;
    };
  }, [search, activeTab, page, pageSize, reloadAt]);

  return (
    <section className="section" id="admin-orders-section">
      <div className="section-container section-table style-2 mb-6">
        {loadError ? (
          <LoadError
            message={loadError}
            onRetry={() => {
              setLoadError(null);
              setReloadAt((value) => value + 1);
            }}
          />
        ) : (
          <>
            <Tab
              tabs={ORDER_STATUS_TABS}
              activeTab={activeTab}
              isScroll
              onTabClick={(tab) => {
                setActiveTab(tab.value as StatusTabValue);
                setPage(1);
              }}
            />

            {orders.length === 0 ? (
              <EmptyData
                title="Không có đơn hàng"
                description="Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
              />
            ) : (
              <div className="overview-table-wrap style-2">
                <div className="overview-table-inner">
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
                            id={`order-row-${order.code}`}
                            className="cursor-pointer"
                            onClick={() => router.push(`/orders/${order.id}`)}
                          >
                            <td className="overview-table__code">{order.code}</td>
                            <td>
                              <OrderStatusBadge status={order.status} />
                            </td>
                            <td>{order.agency.name}</td>
                            <td className="overview-table__muted">
                              {formatDateTimeVi(order.created_at)}
                            </td>
                            <td className="is-num overview-table__money">
                              {formatMoney(orderTotal(order))}
                            </td>
                            <td className="is-num overview-table__money">
                              {formatMoney(orderReceived(order))}
                            </td>
                            <td className="is-num overview-table__money">
                              {formatMoney(orderRemaining(order))}
                            </td>
                            <td className="overview-table__muted">
                              {formatDateTimeVi(order.updated_at)}
                            </td>
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
                                  <span className="inline-flex items-center gap-2 pl-4">
                                    <Icon
                                      name="hero-arrow-turn-down-right"
                                      className="size-6 shrink-0 text-theme-muted"
                                    />
                                    {child.code}
                                  </span>
                                </td>
                                <td>
                                  <OrderStatusBadge status={child.status} />
                                </td>
                                <td>{child.agency.name}</td>
                                <td className="overview-table__muted">
                                  {formatDateTimeVi(child.created_at)}
                                </td>
                                <td className="is-num overview-table__money">
                                  {formatMoney(orderTotal(child))}
                                </td>
                                <td className="is-num overview-table__money">
                                  {formatMoney(orderReceived(child))}
                                </td>
                                <td className="is-num overview-table__money">
                                  {formatMoney(orderRemaining(child))}
                                </td>
                                <td className="overview-table__muted">
                                  {formatDateTimeVi(child.updated_at)}
                                </td>
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
            )}

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </>
        )}
      </div>
    </section>
  );
}
