"use client";

import { useEffect, useRef, useState } from "react";

import { EmptyData, Pagination, TableHead, TableLoading } from "@/components/core_component";
import { LoadError } from "@/components/load_error";
import { Tab } from "@/components/tab";
import { getWarehouseOrders } from "@/lib/api/production";
import { totalPagesFromMeta } from "@/lib/api/pagination";
import type { WarehouseOrder } from "@/lib/api/types";
import {
  ORDER_STATUSES,
  getOrderStatusLabel,
  orderColor,
  type OrderStatusId,
} from "@/lib/constants";
import { subscribeHeaderAction } from "@/lib/dashboard/header-actions";
import { formatDateTimeVi } from "@/lib/format/date";

const ORDER_STATUS_TABS = [
  { value: "all" as const, label: "Tất cả" },
  ...ORDER_STATUSES.map((s) => ({ value: s.id, label: s.label })),
];

type StatusTabValue = (typeof ORDER_STATUS_TABS)[number]["value"];

function OrderStatusBadge({ status }: { status: number }) {
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

export function PackagingComponent({
  initialOrders,
  initialTotalPages = 1,
}: {
  initialOrders: WarehouseOrder[];
  initialTotalPages?: number;
}) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<StatusTabValue>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [orders, setOrders] = useState<WarehouseOrder[] | null>(initialOrders);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadAt, setReloadAt] = useState(0);
  const skipFirstFetch = useRef(true);

  useEffect(() => {
    return subscribeHeaderAction("/production/packaging", (detail) => {
      if (detail.action === "search") setSearch(detail.query ?? "");
    });
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (skipFirstFetch.current) {
      skipFirstFetch.current = false;
      return;
    }

    let cancelled = false;

    getWarehouseOrders({
      search: search.trim() || undefined,
      status: activeTab === "all" ? undefined : (activeTab as OrderStatusId),
      page,
      page_size: pageSize,
    }).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setLoadError(result.message);
        setOrders([]);
        return;
      }

      setLoadError(null);
      setOrders(result.data ?? []);
      setTotalPages(totalPagesFromMeta(result.meta, result.data?.length ?? 0, pageSize));
    });

    return () => {
      cancelled = true;
    };
  }, [search, activeTab, page, pageSize, reloadAt]);

  return (
    <section className="section" id="production-packaging-section">
      <div className="section-container section-table mb-6">
        {loadError ? (
          <LoadError
            message={loadError}
            onRetry={() => {
              setLoadError(null);
              setOrders(null);
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
                setActiveTab(tab.value);
                setPage(1);
              }}
            />

            {orders === null ? (
              <TableLoading />
            ) : orders.length === 0 ? (
              <EmptyData
                title="Không có đơn đóng gói"
                description="Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
              />
            ) : (
              <div className="overview-table-wrap">
                <div className="overview-table-inner cursor-e-resize">
                  <table className="overview-table min-w-[2000px]" id="packaging-orders-table">
                    <colgroup>
                      <col style={{ width: "4%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "14%" }} />
                      <col style={{ width: "12%" }} />
                      <col style={{ width: "14%" }} />
                      <col style={{ width: "14%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "12%" }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <TableHead></TableHead>
                        <TableHead icon="hero-clipboard-document-list">Mã đơn kho</TableHead>
                        <TableHead icon="hero-hashtag">Đơn gốc</TableHead>
                        <TableHead icon="hero-tag">Trạng thái</TableHead>
                        <TableHead icon="hero-building-storefront">Kho</TableHead>
                        <TableHead icon="hero-users">Đại lý</TableHead>
                        <TableHead icon="hero-cube">Đã đóng / Tổng</TableHead>
                        <TableHead icon="hero-circle-stack">TP / Đóng mới</TableHead>
                        <TableHead icon="hero-calendar-days">Bắt đầu</TableHead>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, index) => (
                        <tr key={order.id} id={`packaging-order-row-${order.id}`}>
                          <td>{index + 1}</td>
                          <td className="overview-table__code">{order.code}</td>
                          <td className="overview-table__muted">{order.parent_order_code}</td>
                          <td>
                            <OrderStatusBadge status={order.status} />
                          </td>
                          <td>{order.warehouse_name}</td>
                          <td className="overview-table__muted">{order.agency_name}</td>
                          <td className="is-num overview-table__muted">
                            {order.packed_quantity} / {order.total_quantity}
                          </td>
                          <td className="is-num overview-table__muted">
                            {order.finished_goods_quantity} / {order.pack_new_quantity}
                          </td>
                          <td className="overview-table__muted">
                            {formatDateTimeVi(order.started_at)}
                          </td>
                        </tr>
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
