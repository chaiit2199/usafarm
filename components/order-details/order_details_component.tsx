"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Modal, TableHead } from "@/components/core_component";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Icon } from "@/components/icon";
import { SelectField } from "@/components/form-fields";
import { OrderProductRow } from "@/components/order-details/order_product_row";
import { OrderStatus } from "@/components/order-details/order_status";
import { assignOrderWarehouse } from "@/lib/api/orders";
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
  type OrderStatusInput,
  type OrderStatusSemantic,
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

const CAN_REQUEST_CANCEL: OrderStatusSemantic[] = [
  "DRAFT",
  "APPROVED_WAITING_ALLOCATION",
  "WAITING_WAREHOUSE_ACCEPTANCE",
  "PROCESSING",
];

function OrderDetailActions({
  orderId,
  warehouseId,
  semantic,
  canFulfillRemaining,
  onBack,
}: {
  orderId: number;
  warehouseId: number | null;
  semantic?: OrderStatusSemantic;
  canFulfillRemaining: boolean;
  onBack: () => void;
}) {
  const router = useRouter();
  const [isPreparePackagingConfirmOpen, setIsPreparePackagingConfirmOpen] = useState(false);
  const canCancel = semantic != null && CAN_REQUEST_CANCEL.includes(semantic);
  const canPreparePackaging = warehouseId != null;

  function closePreparePackagingConfirm() {
    setIsPreparePackagingConfirmOpen(false);
  }

  async function confirmPreparePackaging() {
    if (!semantic || warehouseId == null) return;

    const result = await assignOrderWarehouse(orderId, {
      warehouse_id: warehouseId,
    });

    if (!result.ok) {
      putFlash("error", result.message, 1500);
      return;
    }

    closePreparePackagingConfirm();
    putFlash("success", "Đã chuẩn bị đóng gói", 1500);
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center justify-end gap-3 pt-2 mb-30">
        <button type="button" className="core_button core_button--secondary" onClick={onBack}>
          Quay lại
        </button>

        {semantic === "WAITING_FOR_APPROVAL" && (
          <button type="button" className="core_button core_button--danger">
            Từ chối
          </button>
        )}

        {semantic === "CANCELLING" && (
          <>
            <button type="button" className="core_button core_button--secondary">
              Rút yêu cầu hủy
            </button>
            <button type="button" className="core_button core_button--danger">
              Từ chối hủy
            </button>
          </>
        )}

        {canCancel && (
          <button type="button" className="core_button core_button--danger">
            Huỷ đơn
          </button>
        )}

        {/* Nếu ở đơn mới và có đủ hàng KL, tồn kho và đóng mới */}
        {semantic === "DRAFT" && (
          <button
            type="button"
            className="core_button core_button--primary"
            disabled={!canPreparePackaging}
            onClick={() => setIsPreparePackagingConfirmOpen(true)}
          >
            Chuẩn bị đóng gói
          </button>
        )}
        {semantic === "WAITING_FOR_APPROVAL" && (
          <button type="button" className="core_button core_button--primary">
            Duyệt
          </button>
        )}
        {semantic === "APPROVED_WAITING_ALLOCATION" && (
          <button type="button" className="core_button core_button--primary">
            {canFulfillRemaining ? "Xác nhận phân kho" : "Tách đơn & phân kho"}
          </button>
        )}
        {semantic === "REJECTED" && (
          <button type="button" className="core_button core_button--primary">
            Gửi duyệt lại
          </button>
        )}
        {semantic === "WAITING_WAREHOUSE_ACCEPTANCE" && (
          <button type="button" className="core_button core_button--primary">
            Tiếp nhận kho
          </button>
        )}
        {semantic === "CANCELLING" && (
          <button type="button" className="core_button core_button--primary">
            Duyệt hủy
          </button>
        )}
      </div>

      <Modal
        id="prepare-packaging-confirm-modal"
        show={isPreparePackagingConfirmOpen}
        title="Xác nhận chuẩn bị đóng gói"
        width="md"
        className="core_modal--stacked"
        onClose={closePreparePackagingConfirm}
      >
        <p className="text-sm text-theme-muted">
          Bạn có chắc muốn chuẩn bị đóng gói cho đơn hàng này?
        </p>
        <form className="core_modal__form" action={confirmPreparePackaging}>
          <div className="core_modal__actions">
            <button
              type="button"
              className="core_button core_button--secondary"
              onClick={closePreparePackagingConfirm}
            >
              Hủy
            </button>
            <FormSubmitButton>Xác nhận</FormSubmitButton>
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

  const warehouses = listWarehouses(fulfillmentCapacity);


  // Khởi tạo warehouseId là first warehouses
  const [warehouseId, setWarehouseId] = useState<number | null>(
    () => warehouses[0]?.warehouse_id ?? null,
  );

  const warehouseSssignments = {
    can_fulfill_remaining: false,
    is_core_available: false,
    is_finished_goods_available: false,
    is_packaging_available: false,
    allocation_proposal: {
      suggested_finished_goods_quantity: 0,
      suggested_pack_new_quantity: 0,
      suggested_quantity: 0,
      waiting_quantity: 0,
    },
  };

  // warehouseAvailable Map từng item trong order.lines tìm warehouseId tương ứng với line sản phẩm
  let matchedWarehouses = 0;
  for (const line of order.lines) {
    const warehouse = getWarehouse(fulfillmentCapacity, line.id, warehouseId);
    if (!warehouse) continue;
    if (matchedWarehouses === 0) {
      warehouseSssignments.can_fulfill_remaining = warehouse.can_fulfill_remaining;
      warehouseSssignments.is_core_available = warehouse.is_core_available;
      warehouseSssignments.is_finished_goods_available = warehouse.is_finished_goods_available;
      warehouseSssignments.is_packaging_available = warehouse.is_packaging_available;
    } else {
      warehouseSssignments.can_fulfill_remaining &&= warehouse.can_fulfill_remaining;
      warehouseSssignments.is_core_available &&= warehouse.is_core_available;
      warehouseSssignments.is_finished_goods_available &&= warehouse.is_finished_goods_available;
      warehouseSssignments.is_packaging_available &&= warehouse.is_packaging_available;
    }
    matchedWarehouses += 1;
    warehouseSssignments.allocation_proposal.suggested_finished_goods_quantity += warehouse.allocation_proposal.suggested_finished_goods_quantity;
    warehouseSssignments.allocation_proposal.suggested_pack_new_quantity += warehouse.allocation_proposal.suggested_pack_new_quantity;
    warehouseSssignments.allocation_proposal.suggested_quantity += warehouse.allocation_proposal.suggested_quantity;
    warehouseSssignments.allocation_proposal.waiting_quantity += warehouse.allocation_proposal.waiting_quantity;
  }

  function toggleExpanded(id: number) {
    setExpandedIds((current) =>
      current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id],
    );
  }

  return (
    <>
      <OrderStatus
        status={order.status}
        createdAt={order.created_at}
        updatedAt={order.updated_at}
      />
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
              <p className="text-theme-muted text-xs mb-0.5">Mã đơn hàng</p>
              <p className="font-semibold text-slate-900 text-sm">{order.code}</p>
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
              <p className="font-semibold text-slate-900 text-sm">{order.agency.phone ?? "0123456789"}</p>
            </div>
            <div>
              <p className="text-theme-muted text-xs mb-0.5">Người liên hệ</p>
              <p className="font-semibold text-slate-900 text-sm">
                {order.agency.contact_name ?? "Nguyễn Lê Huỳnh Đức"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-theme-muted text-xs mb-0.5">Địa chỉ đại lý</p>
              <p className="font-semibold text-slate-900 text-sm">{order.delivery_address.address}</p>
            </div>
          </div>
        </section>
      </div>

      <div className="section-container mb-6">
        <h6 className="mb-3 text-base font-semibold flex items-center gap-2">
          <Icon name="hero-building-storefront" className="size-5 text-theme-primary" />
          Chọn kho hàng đối chiếu
        </h6>

        <SelectField
          id="order-fulfillment-warehouse"
          name="warehouse_id"
          label=""
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

      <section className="section-container mb-6">
        <h6 className="mb-3 text-base font-semibold flex items-center gap-2">
          <Icon name="hero-cube" className="size-5 text-theme-primary" />
          Sản phẩm
        </h6>
        <div className="overview-table-inner">
          <table className="overview-table min-w-full" id="order-details-table">
            <colgroup>
              <col style={{ width: "4%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "28%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "14%" }} />
            </colgroup>
            <thead>
              <tr>
                <TableHead />
                <TableHead>SKU</TableHead>
                <TableHead icon="hero-cube">Tên sản phẩm</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead icon="hero-banknotes">Đơn giá</TableHead>
                <TableHead icon="hero-banknotes">Thành tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
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

      {!warehouseSssignments.can_fulfill_remaining && (
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
              {warehouseSssignments.allocation_proposal.suggested_quantity} bao
              <span className="text-base font-medium text-theme-muted pl-1"></span>
            </p>
            <p className="mt-1 text-xs text-theme-muted">{warehouseSssignments.allocation_proposal.suggested_finished_goods_quantity} bao thành phẩm · {warehouseSssignments.allocation_proposal.suggested_pack_new_quantity} bao đóng mới</p>
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
              {warehouseSssignments.allocation_proposal.waiting_quantity} bao
            </p>
            <p className="mt-1 text-xs text-theme-muted">Chờ bổ sung tồn kho</p>
          </div>
        </div>
      </div>
      )} 

      <OrderDetailActions
        orderId={order.id}
        warehouseId={warehouseId}
        semantic={getOrderStatusMeta(order.status)?.semantic}
        canFulfillRemaining={warehouseSssignments.can_fulfill_remaining}
        onBack={() => router.push("/orders")}
      />
    </>
  );
}
