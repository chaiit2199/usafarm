"use client";

import { Fragment, useEffect, useState } from "react";

import { EmptyData, Modal, Pagination, TableHead, TableLoading } from "@/components/core_component";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Icon } from "@/components/icon";
import { LoadError } from "@/components/load_error";
import { Tab } from "@/components/tab";
import { getWarehouseOrders } from "@/lib/api/production";
import { totalPagesFromMeta } from "@/lib/api/pagination";
import type { WarehouseOrder, WarehouseOrderLine } from "@/lib/api/types";
import { getOrderStatusLabel, orderColor, orderStatus } from "@/lib/constants";
import { subscribeHeaderAction } from "@/lib/dashboard/header-actions";
import { formatDateTimeVi } from "@/lib/format/date";

const ORDER_STATUS_TABS = [
  {
    id: orderStatus.waitingWarehouseAcceptance,
    label: "Chuẩn bị đóng gói",
    color: "#7C3AED",
  },
] as const;

const ORDER_TABLE_COL_SPAN = 10;

type StatusTabId = (typeof ORDER_STATUS_TABS)[number]["id"];

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

function PackagingOrderLines({ lines }: { lines: WarehouseOrderLine[] }) {
  if (lines.length === 0) {
    return <p className="px-4 py-3 text-sm text-theme-muted">Không có sản phẩm.</p>;
  }

  return (
    <div className="px-4 py-3">
      <div className="overview-table-inner theme-primary-border">
        <table className="overview-table min-w-full">
          <colgroup>
            <col style={{ width: "4%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "30%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "16%" }} />
          </colgroup>
          <thead>
            <tr>
              <TableHead />
              <TableHead>SKU</TableHead>
              <TableHead icon="hero-cube">Tên sản phẩm</TableHead>
              <TableHead>Số lượng cần</TableHead>
              <TableHead>Đã đóng</TableHead>
              <TableHead icon="hero-circle-stack">TP / Đóng mới</TableHead>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => (
              <tr key={line.id}>
                <td>{index + 1}</td>
                <td className="overview-table__muted">{line.sales_sku_code}</td>
                <td>{line.sku_name}</td>
                <td className="is-num overview-table__muted">{line.quantity}</td>
                <td className="is-num overview-table__muted">{line.packed_quantity}</td>
                <td className="is-num overview-table__muted">
                  {line.finished_goods_quantity} / {line.pack_new_quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PackagingComponent() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<StatusTabId>(ORDER_STATUS_TABS[0].id);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [orders, setOrders] = useState<WarehouseOrder[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadAt, setReloadAt] = useState(0);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [confirmOrder, setConfirmOrder] = useState<WarehouseOrder | null>(null);

  useEffect(() => {
    return subscribeHeaderAction("/production/packaging", (detail) => {
      if (detail.action === "search") setSearch(detail.query ?? "");
    });
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, activeTab]);

  useEffect(() => {
    let cancelled = false;
    setOrders(null);
    setLoadError(null);

    getWarehouseOrders({
      search: search.trim() || "",
      status: activeTab,
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

  function toggleExpanded(id: number) {
    setExpandedIds((current) =>
      current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id],
    );
  }

  function closePackConfirm() {
    setConfirmOrder(null);
  }

  async function confirmStartPackaging() {
    // TODO: gọi API bắt đầu đóng gói khi có endpoint
    closePackConfirm();
  }

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
              tabs={ORDER_STATUS_TABS.map((tab) => ({ value: tab.id, label: tab.label }))}
              activeTab={activeTab}
              isScroll
              onTabClick={(tab) => {
                setActiveTab(tab.value as StatusTabId);
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
                <div className="overview-table-inner">
                  <table className="overview-table min-w-[2000px]" id="packaging-orders-table">
                    <colgroup>
                      <col style={{ width: "2%" }} />
                      <col style={{ width: "14%" }} />
                      <col style={{ width: "8%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "14%" }} />
                      <col style={{ width: "14%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "8%" }} />
                      <col style={{ width: "8%" }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <TableHead />
                        <TableHead icon="hero-clipboard-document-list">Mã đơn</TableHead>
                        <TableHead>Số lượng cần</TableHead>
                        <TableHead icon="hero-cube">Số lượng đã đóng</TableHead>
                        <TableHead icon="hero-tag">Trạng thái</TableHead>
                        <TableHead icon="hero-building-storefront">Kho</TableHead>
                        <TableHead icon="hero-users">Đại lý</TableHead>
                        <TableHead icon="hero-circle-stack">TP / Đóng mới</TableHead>
                        <TableHead icon="hero-calendar-days">Bắt đầu</TableHead>
                        <TableHead className="actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const expanded = expandedIds.includes(order.id);

                        return (
                          <Fragment key={order.id}>
                            <tr id={`packaging-order-row-${order.id}`}>
                              <td>
                                <button
                                  type="button"
                                  className="admin-actions__btn"
                                  aria-label={expanded ? "Thu gọn sản phẩm" : "Xem sản phẩm"}
                                  onClick={() => toggleExpanded(order.id)}
                                >
                                  <Icon
                                    name="hero-chevron-down"
                                    className={[
                                      "size-5 transition-transform duration-200",
                                      expanded ? "rotate-0" : "-rotate-90",
                                    ].join(" ")}
                                  />
                                </button>
                              </td>
                              <td className="overview-table__code">{order.code}</td>
                              <td className="overview-table__muted">{order.total_quantity}</td>
                              <td className="is-num overview-table__muted">
                                {order.packed_quantity}
                              </td>
                              <td>
                                <OrderStatusBadge status={order.status} />
                              </td>
                              <td>{order.warehouse_name}</td>
                              <td className="overview-table__muted">{order.agency_name}</td>
                              <td className="is-num overview-table__muted">
                                {order.finished_goods_quantity} / {order.pack_new_quantity}
                              </td>
                              <td className="overview-table__muted">
                                {formatDateTimeVi(order.started_at || order.created_at)}
                              </td>
                              <td className="actions"> 
                                <button onClick={() => setConfirmOrder(order)}
                                className="btn btn--primary">
                                  <Icon name="hero-forward" className="size-4 shrink-0" />
                                  <span>Đóng gói</span>
                                </button>
                              </td>
                            </tr>

                            {expanded && (
                              <tr className="td-collapse">
                                <td colSpan={ORDER_TABLE_COL_SPAN}>
                                  <PackagingOrderLines lines={order.lines} />
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
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

      <Modal
        id="packaging-start-confirm-modal"
        show={confirmOrder != null}
        title="Xác nhận đóng gói ngay"
        width="md"
        className="core_modal--stacked"
        onClose={closePackConfirm}
      >
        <form className="core_modal__form" action={confirmStartPackaging}>
          <p className="text-sm text-theme-muted">
            Bạn có chắc muốn bắt đầu đóng gói đơn{" "}
            <span className="font-semibold text-slate-900">{confirmOrder?.code}</span>?
          </p>
          <div className="core_modal__actions">
            <button
              type="button"
              className="core_button core_button--secondary"
              onClick={closePackConfirm}
            >
              Hủy
            </button>
            <FormSubmitButton>Xác nhận</FormSubmitButton>
          </div>
        </form>
      </Modal>
    </section>
  );
}
