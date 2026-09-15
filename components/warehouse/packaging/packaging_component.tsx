"use client";

import { Fragment, useEffect, useState } from "react";

import { EmptyData, Modal, Pagination, TableHead } from "@/components/core_component";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Icon } from "@/components/icon";
import { LoadError } from "@/components/load_error";
import { OrderStatusBadge, Status } from "@/components/status";
import { Tab } from "@/components/tab";
import { getWarehouseOrders, startWarehouseOrder, completeWarehouseOrderPacking } from "@/lib/api/production";
import { totalPagesFromMeta } from "@/lib/api/pagination";
import type { WarehouseOrder, WarehouseOrderLine } from "@/lib/api/types";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, orderStatus } from "@/lib/constants";
import { subscribeHeaderAction } from "@/lib/dashboard/header-actions";
import { putFlash } from "@/lib/flash/flash";
import { formatDateTimeVi } from "@/lib/format/date";

const ORDER_STATUS_TABS = [
  {
    id: orderStatus.waitingForPackaging,
    label: "Chờ đóng gói",
    color: "#CA8A04",
  },
  {
    id: orderStatus.packaging,
    label: "Đang đóng gói",
    color: "#7C3AED",
  },
] as const;

type StatusTabId = (typeof ORDER_STATUS_TABS)[number]["id"];

function lineRemaining(line: WarehouseOrderLine) {
  return Math.max(0, line.quantity - line.packed_quantity);
}

function clampQty(raw: number, remaining: number) {
  if (!Number.isFinite(raw) || raw < 0) return 0;
  return Math.min(Math.floor(raw), remaining);
}

type CompletePackLinePayload = {
  order_line_id: number;
  packed_quantity: number;
};

type CompletePackPayload = {
  lines: CompletePackLinePayload[];
};

function PackingDetailsModalForm({
  order,
  onClose,
  onRequestComplete,
}: {
  order: WarehouseOrder;
  onClose: () => void;
  onRequestComplete: (payload: CompletePackPayload) => void;
}) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const lines = order.lines.map((line) => {
      const remaining = lineRemaining(line);
      const value = remaining <= 0 ? 0 : clampQty(Number(form.get(`qty-${line.id}`)), remaining);
      return { order_line_id: line.id, packed_quantity: value };
    });
    onRequestComplete({ lines });
  }

  return (
    <form className="core_modal__form" onSubmit={handleSubmit}>
      <p className="text-sm text-theme-muted mb-3">
        Chi tiết đóng gói đơn{" "}
        <span className="font-semibold text-slate-900">{order.code}</span>. Số lượng đóng
        thêm mỗi sản phẩm không được vượt quá số còn lại (cần − đã đóng).
      </p>

      {order.lines.length === 0 ? (
        <p className="text-sm text-theme-muted">Không có sản phẩm trong đơn.</p>
      ) : (
        <div className="overview-table-inner min-h-auto theme-primary-border">
          <table className="overview-table min-w-full">
            <colgroup>
              <col style={{ width: "4%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "30%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "12%" }} />
            </colgroup>
            <thead>
              <tr>
                <TableHead />
                <TableHead>SKU</TableHead>
                <TableHead icon="hero-cube">Tên sản phẩm</TableHead>
                <TableHead className="is-num">Cần</TableHead>
                <TableHead className="is-num">Đã đóng</TableHead>
                <TableHead className="is-num">Còn lại</TableHead>
                <TableHead className="is-num">Đóng thêm</TableHead>
              </tr>
            </thead>
            <tbody>
              {order.lines.map((line, index) => {
                const remaining = lineRemaining(line);
                return (
                  <tr key={line.id}>
                    <td>{index + 1}</td>
                    <td className="overview-table__muted">{line.sales_sku_code}</td>
                    <td>{line.sku_name}</td>
                    <td className="is-num overview-table__muted">{line.quantity}</td>
                    <td className="is-num overview-table__muted">{line.packed_quantity}</td>
                    <td className="is-num overview-table__muted">{remaining}</td>
                    <td className="is-num">
                      {remaining === 0 ? (
                        <Status kind="active">Đủ hàng</Status>
                      ) : (
                        <input
                          id={`complete-pack-qty-${order.id}-${line.id}`}
                          name={`qty-${line.id}`}
                          type="number"
                          min={0}
                          max={remaining}
                          defaultValue={remaining}
                          className="core_input w-full text-right"
                          onChange={(event) => {
                            event.target.value = String(
                              clampQty(Number(event.target.value), remaining),
                            );
                          }}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="core_modal__actions">
        <button type="button" className="core_button core_button--secondary" onClick={onClose}>
          Đóng
        </button>
        <button type="submit" className="core_button core_button--primary">
          Đóng gói
        </button>
      </div>
    </form>
  );
}

function PackagingOrderLines({ lines }: { lines: WarehouseOrderLine[] }) {
  if (lines.length === 0) {
    return <p className="px-4 py-3 text-sm text-theme-muted">Không có sản phẩm.</p>;
  }

  return (
    <div className="px-4 py-3">
      <div className="overview-table-inner min-h-auto theme-primary-border">
        <table className="overview-table min-w-full">
          <colgroup>
            <col style={{ width: "8%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "30%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "16%" }} />
          </colgroup>
          <thead>
            <tr>
              <TableHead></TableHead>
              <TableHead>SKU</TableHead>
              <TableHead icon="hero-cube">Tên sản phẩm</TableHead>
              <TableHead>Số lượng cần</TableHead>
              <TableHead>Đã đóng</TableHead>
              <TableHead icon="hero-circle-stack">Đóng mới</TableHead>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.sales_sku_code}>
                <td>{line.id}</td>
                <td className="overview-table__muted">{line.sales_sku_code}</td>
                <td>{line.sku_name}</td>
                <td className="is-num overview-table__muted">{line.quantity}</td>
                <td className="is-num overview-table__muted">{line.packed_quantity}</td>
                <td className="is-num overview-table__muted">
                  {line.pack_new_quantity}
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
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [orders, setOrders] = useState<WarehouseOrder[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadAt, setReloadAt] = useState(0);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [confirmOrder, setConfirmOrder] = useState<WarehouseOrder | null>(null);
  const [detailsOrder, setDetailsOrder] = useState<WarehouseOrder | null>(null);
  const [completePayload, setCompletePayload] = useState<CompletePackPayload | null>(null);

  useEffect(() => {
    return subscribeHeaderAction("/production/packaging", (detail) => {
      if (detail.action === "search") setSearch(detail.query ?? "");
    });
  }, []);

  useEffect(() => {
    setPage(DEFAULT_PAGE);
  }, [search, activeTab]);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    setIsLoading(true);

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
    }).finally(() => {
      if (!cancelled) setIsLoading(false);
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

  function closePackingDetails() {
    setDetailsOrder(null);
    setCompletePayload(null);
  }

  function closeCompleteConfirm() {
    setCompletePayload(null);
  }

  function openOrderAction(order: WarehouseOrder) {
    if (order.status === orderStatus.waitingForPackaging) {
      setConfirmOrder(order);
      return;
    }
    setDetailsOrder(order);
  }

  function requestCompletePack(payload: CompletePackPayload) {
    setCompletePayload(payload);
  }

  async function confirmCompletePackaging() {
    if (!detailsOrder || !completePayload) return;

    const result = await completeWarehouseOrderPacking({
      id: detailsOrder.id,
      lines: completePayload.lines,
    });
    if (!result.ok) {
      putFlash("error", result.message, 1500);
      return;
    }

    closePackingDetails();
    putFlash("success", "Đã hoàn thành đóng gói", 1500);
    setReloadAt((value) => value + 1);
  }

  async function confirmStartPackaging() {
    if (!confirmOrder) return;

    const result = await startWarehouseOrder({ id: confirmOrder.id });
    if (!result.ok) {
      putFlash("error", result.message, 1500);
      return;
    }

    closePackConfirm();
    putFlash("success", "Đã bắt đầu đóng gói", 1500);
    setReloadAt((value) => value + 1);
  }

  return (
    <section className="section" id="production-packaging-section">
      <div className="section-container section-table mb-6 ">
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
              tabs={ORDER_STATUS_TABS.map((tab) => ({ value: tab.id, label: tab.label }))}
              activeTab={activeTab}
              isScroll
              onTabClick={(tab) => {
                setActiveTab(tab.value as StatusTabId);
                setPage(DEFAULT_PAGE);
              }}
            />

            {isLoading ? null : orders.length === 0 ? (
              <EmptyData
                title="Không có đơn đóng gói"
                description="Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
              />
            ) : (
              <div className="overview-table-wrap">
                <div className="overview-table-inner">
                  <table className="overview-table min-w-[1800px]" id="packaging-orders-table">
                    <colgroup>
                      <col style={{ width: "4%" }} />
                      <col style={{ width: "4%" }} />
                      <col style={{ width: "14%" }} />
                      <col style={{ width: "8%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "14%" }} />
                      <col style={{ width: "14%" }} />
                      <col style={{ width: "6%" }} />
                      <col style={{ width: "4%" }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <TableHead></TableHead>
                        <TableHead></TableHead>
                        <TableHead icon="hero-clipboard-document-list">Mã đơn</TableHead>
                        <TableHead>Số lượng cần</TableHead>
                        <TableHead icon="hero-cube">Số lượng đã đóng</TableHead>
                        <TableHead icon="hero-tag">Trạng thái</TableHead>
                        <TableHead icon="hero-building-storefront">Kho</TableHead>
                        <TableHead icon="hero-users">Đại lý</TableHead>
                        <TableHead icon="hero-calendar-days">Bắt đầu</TableHead>
                        <TableHead className="actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, index) => {
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
                              <td>{index + 1}</td>
                              <td className="overview-table__code">{order.code}</td>
                              <td className="overview-table__muted">{order.total_quantity}</td>
                              <td className="is-num overview-table__muted">
                                {order.packed_quantity} / {order.total_quantity}
                              </td>
                              <td>
                                <OrderStatusBadge status={order.status} />
                              </td>
                              <td>{order.warehouses?.[0].warehouse_name ?? ""}</td>
                              <td className="overview-table__muted">{order.agency_name}</td> 
                              <td className="overview-table__muted">
                                {formatDateTimeVi(order.started_at || order.created_at)}
                              </td>
                              <td className="actions">
                                <button
                                  type="button"
                                  className="admin-actions__btn"
                                  aria-label={
                                    order.status === orderStatus.waitingForPackaging
                                      ? "Bắt đầu đóng gói"
                                      : "Hoàn thành đóng gói"
                                  }
                                  onClick={() => openOrderAction(order)}
                                >
                                  <Icon name="hero-pencil-square" className="size-4" />
                                </button>
                              </td>
                            </tr>

                            {expanded && (
                              <tr className="td-collapse">
                                <td colSpan={9}>
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

            {isLoading ? null : (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(DEFAULT_PAGE);
              }}
            />
            )}
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

      <Modal
        id="packaging-complete-confirm-modal"
        show={detailsOrder != null}
        title="Chi tiết đóng gói"
        width="3xl"
        onClose={closePackingDetails}
      >
        {detailsOrder ? (
          <PackingDetailsModalForm
            key={detailsOrder.id}
            order={detailsOrder}
            onClose={closePackingDetails}
            onRequestComplete={requestCompletePack}
          />
        ) : null}
      </Modal>

      <Modal
        id="packaging-complete-submit-confirm-modal"
        show={completePayload != null}
        title="Xác nhận hoàn thành"
        width="md"
        className="core_modal--stacked"
        onClose={closeCompleteConfirm}
      >
        <form className="core_modal__form" action={confirmCompletePackaging}>
          <p className="text-sm text-theme-muted">
            Bạn có chắc muốn hoàn thành đóng gói đơn{" "}
            <span className="font-semibold text-slate-900">{detailsOrder?.code}</span>?
          </p>
          <div className="core_modal__actions">
            <button
              type="button"
              className="core_button core_button--secondary"
              onClick={closeCompleteConfirm}
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
