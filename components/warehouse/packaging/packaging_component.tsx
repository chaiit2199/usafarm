"use client";

import { Fragment, useEffect, useState } from "react";

import { EmptyData, Dropdown, Modal, Pagination, TableHead, TableLoading, useDropdownClose } from "@/components/core_component";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Icon } from "@/components/icon";
import { LoadError } from "@/components/load_error";
import { Tab } from "@/components/tab";
import { getWarehouseOrders, startWarehouseOrder } from "@/lib/api/production";
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

function remainingQuantity(order: WarehouseOrder) {
  return Math.max(0, order.total_quantity - order.packed_quantity);
}

function normalizePackedQty(raw: number, remaining: number) {
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  return Math.min(Math.floor(raw), remaining);
}

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

function CompletePackForm({ order }: { order: WarehouseOrder }) {
  const closeDropdown = useDropdownClose();
  const remaining = remainingQuantity(order);

  function clampInput(event: React.ChangeEvent<HTMLInputElement>) {
    const next = Number(event.target.value);
    if (Number.isFinite(next) && next > remaining) {
      event.target.value = String(remaining);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const qty = normalizePackedQty(Number(formData.get("packed_quantity")), remaining);
    if (qty <= 0) return;

    console.log("packed_quantity", qty, "order", order.id, "code", order.code);
    closeDropdown?.();
  }

  return (
    <li className="px-3 py-3 min-w-64" onClick={(event) => event.stopPropagation()}>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <label htmlFor={`packed-qty-${order.id}`} className="core_label text-xs">
          Nhập số lượng đã đóng gói
        </label>
        <p className="text-xs text-theme-muted mb-0">Còn lại tối đa: {remaining}</p>
        <input
          id={`packed-qty-${order.id}`}
          name="packed_quantity"
          type="number"
          min={1}
          max={remaining}
          required
          disabled={remaining <= 0}
          defaultValue={remaining > 0 ? remaining : undefined}
          className="core_input w-full"
          placeholder="Nhập số lượng"
          onChange={clampInput}
        />
        <button
          type="submit"
          className="core_button core_button--primary w-full"
          disabled={remaining <= 0}
        >
          Xác nhận
        </button>
      </form>
    </li>
  );
}

function CompletePackDropdown({ order }: { order: WarehouseOrder }) {
  return (
    <Dropdown
      placement="bottom-right"
      label={
        <span className="btn btn--primary inline-flex items-center gap-1.5">
          <Icon name="hero-forward" className="size-4 shrink-0" />
          <span>Hoàn thành</span>
        </span>
      }
    >
      <CompletePackForm order={order} />
    </Dropdown>
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
              <TableHead>Tồn kho</TableHead>
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
                                {order.status === orderStatus.waitingWarehouseAcceptance ? (
                                  <button onClick={() => setConfirmOrder(order)}
                                  className="btn btn--primary">
                                    <Icon name="hero-forward" className="size-4 shrink-0" />
                                    <span>Đóng gói</span>
                                  </button>
                                ) : (
                                  <CompletePackDropdown order={order} />
                                )}
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
    </section>
  );
}
