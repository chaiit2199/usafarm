"use client";

import { Fragment, useEffect, useState } from "react";

import { EmptyData, Modal, Pagination, TableHead, TableLoading } from "@/components/core_component";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Icon } from "@/components/icon";
import { LoadError } from "@/components/load_error";
import { Tab } from "@/components/tab";
import { getWarehouseOrders, startWarehouseOrder, completeWarehouseOrderPacking } from "@/lib/api/production";
import { totalPagesFromMeta } from "@/lib/api/pagination";
import type { WarehouseOrder, WarehouseOrderLine } from "@/lib/api/types";
import { getOrderStatusLabel, orderColor, orderStatus } from "@/lib/constants";
import { subscribeHeaderAction } from "@/lib/dashboard/header-actions";
import { putFlash } from "@/lib/flash/flash";
import { formatDateTimeVi } from "@/lib/format/date";

const ORDER_STATUS_TABS = [
  {
    id: orderStatus.waitingWarehouseAcceptance,
    label: "Chờ đóng gói",
    color: "#7C3AED",
  },
  {
    id: orderStatus.processing,
    label: "Đang đóng gói",
    color: "#3B82F6",
  },
] as const;

type StatusTabId = (typeof ORDER_STATUS_TABS)[number]["id"];

function lineRemaining(line: WarehouseOrderLine) {
  return Math.max(0, line.quantity - line.packed_quantity);
}

function normalizePackedQty(raw: number, max: number) {
  if (!Number.isFinite(raw) || raw < 0) return 0;
  return Math.min(Math.floor(raw), max);
}

type CompletePackLinePayload = {
  order_line_id: number;
  actual_packed_quantity: number;
};

type CompletePackPayload = {
  lines: CompletePackLinePayload[];
};

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

function PackingDetailsModalForm({
  order,
  onClose,
  onRequestComplete,
}: {
  order: WarehouseOrder;
  onClose: () => void;
  onRequestComplete: (payload: CompletePackPayload) => void;
}) {
  const [qtys, setQtys] = useState<Record<number, number>>(() =>
    Object.fromEntries(order.lines.map((line) => [line.id, lineRemaining(line)])),
  );


  function setLineQty(line: WarehouseOrderLine, raw: number) {
    const max = lineRemaining(line);
    setQtys((current) => ({
      ...current,
      [line.id]: normalizePackedQty(raw, max),
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const lines: CompletePackLinePayload[] = order.lines
      .map((line) => ({
        order_line_id: line.id,
        actual_packed_quantity: normalizePackedQty(qtys[line.id] ?? 0, lineRemaining(line)),
      }))
      .filter((line) => line.actual_packed_quantity > 0);

    if (lines.length === 0) return;

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
        <div className="overview-table-inner theme-primary-border">
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
                      {remaining == 0 ? (
                        <span className="status status--active">Đủ hàng</span>
                      ) : (
                        <input
                          id={`complete-pack-qty-${order.id}-${line.id}`}
                          type="number"
                          min={0}
                          max={remaining}
                          disabled={remaining <= 0}
                          value={qtys[line.id] ?? 0}
                          className="core_input w-full text-right"
                          onChange={(event) => setLineQty(line, Number(event.target.value))}
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
        <button
          type="submit"
          className="core_button core_button--primary"
          disabled={order.lines.every((line) => lineRemaining(line) <= 0)}
        >
          Hoàn thành
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
              <TableHead icon="hero-circle-stack">Đóng mới</TableHead>
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [orders, setOrders] = useState<WarehouseOrder[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
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

  function closePackingDetails() {
    setDetailsOrder(null);
    setCompletePayload(null);
  }

  function closeCompleteConfirm() {
    setCompletePayload(null);
  }

  function openOrderAction(order: WarehouseOrder) {
    if (order.status === orderStatus.waitingWarehouseAcceptance) {
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

    const lines = completePayload.lines.filter((line) => line.actual_packed_quantity > 0);
    if (lines.length === 0) return;

    const result = await completeWarehouseOrderPacking({
      id: detailsOrder.id,
      lines,
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
                                {order.packed_quantity} / {order.total_quantity}
                              </td>
                              <td>
                                <OrderStatusBadge status={order.status} />
                              </td>
                              <td>{order.warehouse_name}</td>
                              <td className="overview-table__muted">{order.agency_name}</td> 
                              <td className="overview-table__muted">
                                {formatDateTimeVi(order.started_at || order.created_at)}
                              </td>
                              <td className="actions">
                                <button
                                  type="button"
                                  className="admin-actions__btn"
                                  aria-label={
                                    order.status === orderStatus.waitingWarehouseAcceptance
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
