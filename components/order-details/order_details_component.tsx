"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Modal, TableHead } from "@/components/core_component";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Icon } from "@/components/icon";
import { SelectField, RequiredLabel } from "@/components/form-fields";
import { OrderProductRow } from "@/components/order-details/order_product_row";
import { approveOrder, assignOrderWarehouse, rejectOrder } from "@/lib/api/orders";
import type {
  Order,
  OrderFulfillmentCapacity,
  OrderFulfillmentWarehouse,
} from "@/lib/api/types";
import { orderAmount, orderReceived, orderRemaining } from "@/lib/api/types";
import {
  getOrderStatusLabel,
  getOrderStatusMeta,
  orderColor,
  orderStatus,
  type OrderStatusId,
  type OrderStatusInput,
} from "@/lib/constants";
import { formatDateTimeVi } from "@/lib/format/date";
import { putFlash } from "@/lib/flash/flash";

type OrderDetailsComponentProps = {
  order: Order;
  fulfillmentCapacity: OrderFulfillmentCapacity;
}; 

function formatMoney(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)} đ`;
}

function listWarehouses(capacity: OrderFulfillmentCapacity): OrderFulfillmentWarehouse[] {
  return Array.from(
    new Map(
      capacity.lines
        .flatMap((line) => line.warehouses)
        .map((warehouse) => [warehouse.warehouse_id, warehouse]),
    ).values(),
  );
}

function getWarehouse(
  capacity: OrderFulfillmentCapacity,
  orderLineId: number,
  warehouseId: number | null,
): OrderFulfillmentWarehouse | undefined {
  if (warehouseId == null) return undefined;
  const line = capacity.lines.find((entry) => entry.order_line_id === orderLineId);
  return line?.warehouses.find((warehouse) => warehouse.warehouse_id === warehouseId);
}

function OrderStatusBadge({ status }: { status: OrderStatusInput }) {
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

const CAN_REQUEST_CANCEL: OrderStatusId[] = [
  orderStatus.draft,
  orderStatus.approvedWaitingAllocation,
  orderStatus.waitingWarehouseAcceptance,
  orderStatus.processing,
];

function OrderDetailActions({
  orderId,
  warehouseId,
  statusId,
  canFulfillRemaining,
  onBack,
}: {
  orderId: number;
  warehouseId: number | null;
  statusId?: OrderStatusId;
  canFulfillRemaining: boolean;
  onBack: () => void;
}) {
  const router = useRouter();
  const [confirmAction, setConfirmAction] = useState<OrderStatusId | "reject" | "">("");
  const canCancel = statusId != null && CAN_REQUEST_CANCEL.includes(statusId);
  const canPreparePackaging = warehouseId != null;
  const canShowPreparePackaging =
    statusId === orderStatus.draft ||
    statusId === orderStatus.approvedWaitingAllocation;
  const isRejectConfirm = confirmAction === "reject";
  const isApproveConfirm = confirmAction === orderStatus.waitingForApproval;

  function closeConfirm() {
    setConfirmAction("");
  }

  async function handleSubmit(formData: FormData) {
    if (isRejectConfirm) {
      await handleRejectOrder(String(formData.get("reason") ?? ""));
      return;
    }

    if (isApproveConfirm) {
      await handleApproveOrder();
      return;
    }

    if (
      confirmAction === orderStatus.draft ||
      confirmAction === orderStatus.splitOrder ||
      confirmAction === orderStatus.approvedWaitingAllocation
    ) {
      await confirmPreparePackaging();
    }
  }

  async function handleRejectOrder(reason: string) {
    const result = await rejectOrder({ id: orderId, reason });
    if (!result.ok) {
      putFlash("error", result.message, 1500);
      return;
    }

    closeConfirm();
    putFlash("success", "Đã từ chối đơn hàng", 1500);
    router.refresh();
  }

  async function handleApproveOrder() {
    const result = await approveOrder({ id: orderId });
    if (!result.ok) {
      putFlash("error", result.message, 1500);
      return;
    }

    closeConfirm();
    putFlash("success", "Đã duyệt đơn hàng", 1500);
    router.refresh();
  }

  async function confirmPreparePackaging() {
    if (statusId == null || warehouseId == null) return;

    const result = await assignOrderWarehouse(orderId, {
      warehouse_id: warehouseId,
    });

    if (!result.ok) {
      putFlash("error", result.message, 1500);
      return;
    }

    closeConfirm();
    putFlash("success", "Đã chuẩn bị đóng gói", 1500);
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center justify-end gap-3 pt-2 mb-30">
        <button type="button" className="core_button core_button--secondary" onClick={onBack}>
          Quay lại
        </button>

        {statusId === orderStatus.waitingForApproval && (
          <button
            type="button"
            className="core_button core_button--danger"
            onClick={() => setConfirmAction("reject")}
          >
            Từ chối
          </button>
        )} 

        {canCancel && (
          <button type="button" className="core_button core_button--danger">
            Huỷ đơn
          </button>
        )}

        {/* Nếu ở đơn mới và có đủ hàng KL, tồn kho và đóng mới */}
        {canShowPreparePackaging && (
          <button
            type="button"
            className="core_button core_button--primary"
            disabled={!canPreparePackaging}
            onClick={() => setConfirmAction(statusId)}
          >
            Chuẩn bị đóng gói
          </button>
        )}
        {statusId === orderStatus.waitingForApproval && (
          <button
            type="button"
            className="core_button core_button--primary"
            onClick={() => setConfirmAction(statusId)}
          >
            Duyệt
          </button>
        )} 
      </div>

      <Modal
        id="order-action-confirm-modal"
        show={confirmAction !== ""}
        title={
          isRejectConfirm
            ? "Xác nhận từ chối đơn hàng"
            : isApproveConfirm
              ? "Xác nhận duyệt đơn hàng"
              : "Xác nhận chuẩn bị đóng gói"
        }
        width="md"
        className="core_modal--stacked"
        onClose={closeConfirm}
      >
        <form className="core_modal__form" action={handleSubmit}>
          {isRejectConfirm ? (
            <div className="core_field">
              <label htmlFor="reject-order-reason" className="core_label">
                <RequiredLabel>Lý do từ chối</RequiredLabel>
              </label>
              <textarea
                id="reject-order-reason"
                name="reason"
                rows={3}
                required
                placeholder="Nhập lý do từ chối"
                className="core_input core_input--textarea w-full"
              />
            </div>
          ) : isApproveConfirm ? (
            <p className="text-sm text-theme-muted">Bạn có chắc muốn duyệt đơn hàng này?</p>
          ) : (
            <p className="text-sm text-theme-muted">
              Bạn có chắc muốn chuẩn bị đóng gói cho đơn hàng này?
            </p>
          )}

          <div className="core_modal__actions">
            <button
              type="button"
              className="core_button core_button--secondary"
              onClick={closeConfirm}
            >
              Hủy
            </button>
            <FormSubmitButton>{isRejectConfirm ? "Từ chối" : "Xác nhận"}</FormSubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}

export function OrderDetailsComponent({ order, fulfillmentCapacity }: OrderDetailsComponentProps) {
  const router = useRouter();
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const remainingDebt = orderRemaining(order);
  const statusId = getOrderStatusMeta(order.status)?.id;

  const warehouses = listWarehouses(fulfillmentCapacity);


  // Khởi tạo warehouseId là first warehouses
  const [warehouseId, setWarehouseId] = useState<number | null>(
    () => warehouses[0]?.warehouse_id ?? null,
  );

  // Khởi tạo warehouseAvailable với giá trị mặc định
  const warehouseAvailable = {
    line_name: "",
    line_name_available: 0,
    can_fulfill_remaining: false, // kho đủ giao hết, không tách đơn
    is_core_available: false, // đủ ruột / cốt
    is_finished_goods_available: false, // đủ thành phẩm
    is_packaging_available: false, // đủ vỏ bao
    allocation_proposal: {
      suggested_finished_goods_quantity: 0, // xuất từ tồn thành phẩm
      suggested_pack_new_quantity: 0, // đóng mới
      suggested_quantity: 0, // tổng có thể giao
      waiting_quantity: 0, // chờ bổ sung
    },
  };

  // warehouseAvailable Map từng item trong order.lines tìm warehouseId tương ứng với line sản phẩm
  let matchedWarehouses = 0;
  for (const line of order.lines) {
    const warehouse = getWarehouse(fulfillmentCapacity, line.id, warehouseId);
    if (!warehouse) continue;
    if (matchedWarehouses === 0) {
      warehouseAvailable.can_fulfill_remaining = warehouse.can_fulfill_remaining;
      warehouseAvailable.is_core_available = warehouse.is_core_available;
      warehouseAvailable.is_finished_goods_available = warehouse.is_finished_goods_available;
      warehouseAvailable.is_packaging_available = warehouse.is_packaging_available;
    } else {
      warehouseAvailable.can_fulfill_remaining &&= warehouse.can_fulfill_remaining;
      warehouseAvailable.is_core_available &&= warehouse.is_core_available;
      warehouseAvailable.is_finished_goods_available &&= warehouse.is_finished_goods_available;
      warehouseAvailable.is_packaging_available &&= warehouse.is_packaging_available;
    }
    matchedWarehouses += 1;
    warehouseAvailable.allocation_proposal.suggested_finished_goods_quantity += warehouse.allocation_proposal.suggested_finished_goods_quantity;
    warehouseAvailable.allocation_proposal.suggested_pack_new_quantity += warehouse.allocation_proposal.suggested_pack_new_quantity;
    warehouseAvailable.allocation_proposal.suggested_quantity += warehouse.allocation_proposal.suggested_quantity;
    warehouseAvailable.allocation_proposal.waiting_quantity += warehouse.allocation_proposal.waiting_quantity;
  }

  function toggleExpanded(id: number) {
    setExpandedIds((current) =>
      current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id],
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-6">
        <section className="section-container mb-6 col-span-2">
          <h6 className="mb-4 text-base font-semibold flex items-center gap-2">
            <Icon name="hero-clipboard-document-list" className="size-5 text-theme-primary" />
            Thông tin đơn hàng
          </h6>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <p className="text-theme-muted text-xs mb-0.5">Trạng thái</p>
              <p className="font-semibold text-slate-900 text-sm">
                <OrderStatusBadge status={order.status} />
              </p>
            </div> 
            <div>
              <p className="text-theme-muted text-xs mb-0.5">Nhân viên tạo đơn</p>
              <p className="font-semibold text-slate-900 text-sm">{order.created_by.name}</p>
            </div>
            <div>
              <p className="text-theme-muted text-xs mb-0.5">Số điện thoại</p>
              <p className="font-semibold text-slate-900 text-sm">-</p>
            </div>
           
            
            <div>
              <p className="text-theme-muted text-xs mb-0.5">Mã nhân viên</p>
              <p className="font-semibold text-slate-900 text-sm">{order.created_by.code}</p>
            </div>
            <div>
              <p className="text-theme-muted text-xs mb-0.5">Số lượng sản phẩm</p>
              <p className="font-semibold text-slate-900 text-sm">{order.lines.length}</p>
            </div>
            <div>
              <p className="text-theme-muted text-xs mb-0.5">Tổng tiền</p>
              <p className="font-semibold text-slate-900 text-sm">
                {formatMoney(orderAmount(order.total_amount))}
              </p>
            </div>
            <div>
              <p className="text-theme-muted text-xs mb-0.5">Công nợ đã thu</p>
              <p className="font-semibold text-slate-900 text-sm">
                {formatMoney(orderReceived(order))}
              </p>
            </div>
            <div>
              <p className="text-theme-muted text-xs mb-0.5">Công nợ còn lại</p>
              <p className="font-semibold text-slate-900 text-sm">{formatMoney(remainingDebt)}</p>
            </div>
            <div>
              <p className="text-theme-muted text-xs mb-0.5">Ngày tạo đơn</p>
              <p className="font-semibold text-slate-900 text-sm">
                {formatDateTimeVi(order.created_at)}
              </p>
            </div>
            <div>
              <p className="text-theme-muted text-xs mb-0.5">Thời gian cập nhật</p>
              <p className="font-semibold text-slate-900 text-sm">
                {formatDateTimeVi(order.updated_at)}
              </p>
            </div>
          
          </div>
        </section>

        <section className="section-container mb-6">
          <h6 className="mb-4 text-base font-semibold flex items-center gap-2">
            <Icon name="hero-users" className="size-5 text-theme-primary" />
            Thông tin đại lý
          </h6>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-theme-muted text-xs mb-0.5">Tên đại lý</p>
              <p className="font-semibold text-slate-900 text-sm">{order.agency.name}</p>
            </div>
            <div>
              <p className="text-theme-muted text-xs mb-0.5">Mã đại lý</p>
              <p className="font-semibold text-slate-900 text-sm">{order.agency.code}</p>
            </div>
            <div>
              <p className="text-theme-muted text-xs mb-0.5">Số điện thoại</p>
              <p className="font-semibold text-slate-900 text-sm">{order.agency.phone ?? "-"}</p>
            </div>
            <div>
              <p className="text-theme-muted text-xs mb-0.5">Người liên hệ</p>
              <p className="font-semibold text-slate-900 text-sm">
                {order.agency.contact_name ?? "-"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-theme-muted text-xs mb-0.5">Địa chỉ đại lý</p>
              <p className="font-semibold text-slate-900 text-sm">{order.delivery_address.address}</p>
            </div>
          </div>
        </section>
      </div>

        

      <section className="section-container mb-6">
        <div className="flex items-center justify-between gap-4 mb-8">
          <h6 className="text-base font-semibold flex items-center gap-2">
            <Icon name="hero-cube" className="size-5 text-theme-primary" />
            Sản phẩm
          </h6>
          <div className="flex items-center gap-4">
            <h6 className="text-base font-semibold flex items-center gap-2">
              <Icon name="hero-building-storefront" className="size-5 text-theme-primary" />
              Chọn kho hàng đối chiếu
            </h6>

            <SelectField
              id="order-fulfillment-warehouse"
              name="warehouse_id"
              label=""
              disabled={statusId !== orderStatus.draft}
              value={warehouseId != null ? String(warehouseId) : ""}
              required
              onChange={(event) => {
                const next = Number(event.target.value);
                setWarehouseId(Number.isFinite(next) ? next : null);
              }}
            >
              <option value="" disabled>
                Chọn kho hàng
              </option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.warehouse_id} value={warehouse.warehouse_id}>
                  {warehouse.warehouse_name}
                </option>
              ))}
            </SelectField>
          </div>
        </div>

        <div className="overview-table-inner">
          <table className="overview-table min-w-full" id="order-details-table">
            <colgroup>
              <col style={{ width: "4%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "28%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "12%" }} />
            </colgroup>
            <thead>
              <tr>
                <TableHead />
                <TableHead>SKU</TableHead>
                <TableHead icon="hero-cube">Tên sản phẩm</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead icon="hero-banknotes">Đơn giá</TableHead>
                <TableHead icon="hero-banknotes">Thành tiền</TableHead>
              </tr>
            </thead>
            <tbody>
              {order.lines.map((item) => (
                <OrderProductRow
                  key={item.id}
                  item={item}
                  capacity={getWarehouse(
                    fulfillmentCapacity,
                    item.id,
                    warehouseId,
                  )}
                  expanded={expandedIds.includes(item.id)}
                  onToggle={() => toggleExpanded(item.id)}
                />
              ))}
            </tbody>
          </table>

          <div className="rounded-b-xl bg-theme-primary-border py-4 text-right pr-22">
            Tổng thành tiền các sản phẩm:{" "}
            <strong className="pl-1">
              {formatMoney(orderAmount(order.subtotal_amount))}
            </strong>
          </div>
        </div>
      </section>

      {!warehouseAvailable.can_fulfill_remaining && (
        <div className="section-container mb-6">
        <h6 className="mb-4 text-base font-semibold flex items-center gap-2">
          <Icon name="hero-rectangle-stack" className="size-5 text-theme-primary" />
          Tách đơn tự động
        </h6>

        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-xl border border-theme-primary-border p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-medium text-theme-muted">Đơn 1</span>
              <span className="status status--active">Sẵn sàng phân kho</span>
            </div>
            <p className="text-2xl font-semibold text-slate-900 text-sm">
              {warehouseAvailable.allocation_proposal.suggested_quantity} bao
              <span className="text-base font-medium text-theme-muted pl-1"></span>
            </p>
            <p className="mt-1 text-xs text-theme-muted">{warehouseAvailable.allocation_proposal.suggested_finished_goods_quantity} bao thành phẩm · {warehouseAvailable.allocation_proposal.suggested_pack_new_quantity} bao đóng mới</p>
          </div>

          <div className="rounded-xl border border-theme-primary-border p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-medium text-theme-muted">Đơn 2</span>
              <span
                className="status"
                style={{
                  color: "#B45309",
                  borderColor: "#F59E0B55",
                  backgroundColor: "#F59E0B1A",
                }}
              >
                Chờ bổ sung
              </span>
            </div>
            <p className="text-2xl font-semibold text-slate-900 text-sm">
              {warehouseAvailable.allocation_proposal.waiting_quantity} bao
            </p>
            <p className="mt-1 text-xs text-theme-muted">Chờ bổ sung tồn kho</p>
          </div>
        </div>
      </div>
      )} 

      <OrderDetailActions
        orderId={order.id}
        warehouseId={warehouseId}
        statusId={statusId}
        canFulfillRemaining={warehouseAvailable.can_fulfill_remaining}
        onBack={() => router.push("/orders")}
      />
    </>
  );
}
