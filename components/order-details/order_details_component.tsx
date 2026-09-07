"use client"; 

import { Fragment, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { TableHead } from "@/components/core_component";
import { Icon } from "@/components/icon";
import { SelectField } from "@/components/form-fields";
import type {
  Order,
  OrderFulfillmentCapacity,
  OrderFulfillmentWarehouse,
  OrderLine,
} from "@/lib/api/types";
import { orderAmount, orderReceived, orderRemaining } from "@/lib/api/types";
import { getOrderStatusLabel, orderColor, type OrderStatusInput } from "@/lib/constants";
import { formatDateTimeVi } from "@/lib/format/date";

type OrderDetailsComponentProps = {
  order: Order;
  fulfillmentCapacity: OrderFulfillmentCapacity;
};

const PRODUCT_TABLE_COL_SPAN = 7;

function formatMoney(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)} đ`;
}

/** Danh sách kho unique từ mọi fulfillment line. */
function listWarehouses(capacity: OrderFulfillmentCapacity): OrderFulfillmentWarehouse[] {
  return Array.from(
    new Map(
      capacity.lines
        .flatMap((line) => line.warehouses)
        .map((warehouse) => [warehouse.warehouse_id, warehouse]),
    ).values(),
  );
}

/** Ghép order.line.id ↔ capacity.line.order_line_id ↔ warehouses.warehouse_id */
function findWarehouseCapacity(
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

function LineFulfillmentStatus({ waiting }: { waiting: number | undefined }) {
  if (waiting == null) {
    return <span className="status">—</span>;
  }
  if (waiting <= 0) {
    return <span className="status status--active">Đủ</span>;
  }
  return <span className="status status--rejected">Thiếu {waiting} bao</span>;
}

/** Expand: tồn kho theo kho đã chọn (không hardcode). */
function ProductCapacityPanel({ capacity }: { capacity?: OrderFulfillmentWarehouse }) {
  if (!capacity) {
    return (
      <div className="px-4 py-3 text-sm text-slate-500">
        Chọn kho để xem năng lực đối chiếu cho dòng này.
      </div>
    );
  }

  const rows = [
    {
      type: "Vỏ bao",
      stock: `${capacity.packaging_available} Bao`,
      ok: capacity.packaging_available > 0,
    },
    {
      type: "Ruột thô",
      stock: `${capacity.core_available_kg} KG`,
      ok: Number(capacity.core_available_kg) > 0,
    },
    {
      type: "Tồn thành phẩm có sẵn",
      stock: `${capacity.finished_goods_available} Bao`,
      ok: capacity.finished_goods_available > 0,
    },
  ];

  return (
    <div className="px-4 py-3">
      <p className="mb-2 text-sm font-semibold text-theme-base-content">
        Năng lực kho — {capacity.warehouse_name}
      </p>
      <div className="overview-table-inner theme-primary-border">
        <table className="overview-table min-w-full">
          <thead>
            <tr>
              <TableHead>Loại vật tư</TableHead>
              <TableHead>Tồn kho khả dụng</TableHead>
              <TableHead>Gợi ý xuất</TableHead>
              <TableHead>Thiếu bao</TableHead>
              <TableHead>Trạng thái</TableHead>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.type}>
                <td className="font-semibold">{row.type}</td>
                <td>{row.stock}</td>
                <td className="overview-table__muted">
                  {row.type === "Vỏ bao" && `${capacity.suggested_pack_new_quantity} Bao`}
                  {row.type === "Ruột thô" && "—"}
                  {row.type === "Tồn thành phẩm có sẵn" &&
                    `${capacity.suggested_finished_goods_quantity} Bao`}
                </td>
                <td>{capacity.waiting_quantity}</td>
                <td>
                  <span className={`status ${row.ok ? "status--active" : "status--rejected"}`}>
                    {row.ok ? "Có sẵn" : "Thiếu"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrderProductRow({
  item,
  capacity,
  expanded,
  onToggle,
}: {
  item: OrderLine;
  capacity?: OrderFulfillmentWarehouse;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Fragment>
      <tr>
        <td>
          <button type="button" className="admin-actions__btn" onClick={onToggle}>
            <Icon
              name="hero-chevron-down"
              className={[
                "size-5 transition-transform duration-200",
                expanded ? "rotate-0" : "-rotate-90",
              ].join(" ")}
            />
          </button>
        </td>
        <td>
          <span className="overview-table__muted">{item.sales_sku_code}</span>
        </td>
        <td>{item.product_name}</td>
        <td className="overview-table__muted">{item.quantity}</td>
        <td className="is-num overview-table__money">
          {formatMoney(orderAmount(item.unit_price))}
        </td>
        <td className="is-num overview-table__money">
          {formatMoney(orderAmount(item.total_amount))}
        </td>
        <td className="font-semibold">
          <LineFulfillmentStatus waiting={capacity?.waiting_quantity} />
        </td>
      </tr>

      {expanded && (
        <tr className="td-collapse">
          <td colSpan={PRODUCT_TABLE_COL_SPAN}>
            <ProductCapacityPanel capacity={capacity} />
          </td>
        </tr>
      )}
    </Fragment>
  );
}

export function OrderDetailsComponent({ order, fulfillmentCapacity }: OrderDetailsComponentProps) {
  const router = useRouter();
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const remainingDebt = orderRemaining(order);

  const warehouses = useMemo(
    () => listWarehouses(fulfillmentCapacity),
    [fulfillmentCapacity],
  );

  const [warehouseId, setWarehouseId] = useState<number | null>(
    () =>
      warehouses.find((w) => w.can_fulfill_remaining)?.warehouse_id ??
      warehouses[0]?.warehouse_id ??
      null,
  );

  /** Cộng theo kho đang chọn → tách đơn. */
  const splitTotals = useMemo(() => {
    let ready = 0;
    let waiting = 0;
    for (const line of order.lines) {
      const cap = findWarehouseCapacity(fulfillmentCapacity, line.id, warehouseId);
      if (!cap) continue;
      ready += cap.suggested_quantity;
      waiting += cap.waiting_quantity;
    }
    return { ready, waiting };
  }, [order.lines, fulfillmentCapacity, warehouseId]);

  function toggleExpanded(id: number) {
    setExpandedIds((current) =>
      current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id],
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-6">
        <section className="section-container mb-6">
          <h6 className="mb-3 text-base font-semibold flex items-center gap-2">
            <Icon name="hero-clipboard-document-list" className="size-5 text-theme-primary" />
            Thông tin đơn hàng
          </h6>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Mã đơn hàng</p>
              <p className="font-semibold text-slate-900">{order.code}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Ngày tạo đơn</p>
              <p className="font-semibold text-slate-900">
                {formatDateTimeVi(order.created_at)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Trạng thái</p>
              <p className="font-semibold text-slate-900">
                <OrderStatusBadge status={order.status} />
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Nhân viên tạo đơn</p>
              <p className="font-semibold text-slate-900">{order.created_by.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Mã nhân viên</p>
              <p className="font-semibold text-slate-900">{order.created_by.code}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Tổng tiền</p>
              <p className="font-semibold text-slate-900">
                {formatMoney(orderAmount(order.total_amount))}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Công nợ đã thu</p>
              <p className="font-semibold text-slate-900">
                {formatMoney(orderReceived(order))}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Công nợ còn lại</p>
              <p className="font-semibold text-slate-900">{formatMoney(remainingDebt)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Thời gian cập nhật</p>
              <p className="font-semibold text-slate-900">
                {formatDateTimeVi(order.updated_at)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Số lượng sản phẩm</p>
              <p className="font-semibold text-slate-900">{order.lines.length}</p>
            </div>
          </div>
        </section>

        <section className="section-container mb-6">
          <h6 className="mb-3 text-base font-semibold flex items-center gap-2">
            <Icon name="hero-users" className="size-5 text-theme-primary" />
            Thông tin đại lý
          </h6>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Tên đại lý</p>
              <p className="font-semibold text-slate-900">{order.agency.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Mã đại lý</p>
              <p className="font-semibold text-slate-900">{order.agency.code}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Số điện thoại</p>
              <p className="font-semibold text-slate-900">{order.agency.phone ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Người liên hệ</p>
              <p className="font-semibold text-slate-900">
                {order.agency.contact_name ?? "—"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-slate-500 mb-0.5">Địa chỉ đại lý</p>
              <p className="font-semibold text-slate-900">{order.delivery_address.address}</p>
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
              <col style={{ width: "18%" }} />
              <col style={{ width: "26%" }} />
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
                  capacity={findWarehouseCapacity(
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

          <div className="rounded-b-xl bg-theme-primary-border py-4 text-right pr-8">
            Tổng thành tiền các sản phẩm:{" "}
            <strong className="pl-1">
              {formatMoney(orderAmount(order.subtotal_amount))}
            </strong>
          </div>
        </div>
      </section>

      <div className="section-container mb-6">
        <h6 className="mb-4 text-base font-semibold flex items-center gap-2">
          <Icon name="hero-rectangle-stack" className="size-5 text-theme-primary" />
          Tách đơn tự động
        </h6>

        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-xl border border-theme-primary-border p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-medium text-slate-500">Đơn 1</span>
              <span className="status status--active">Sẵn sàng đóng gói</span>
            </div>
            <p className="text-2xl font-semibold text-slate-900">
              {splitTotals.ready}{" "}
              <span className="text-base font-medium text-slate-500">bao</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">Xuất từ tồn khả dụng (suggested)</p>
          </div>

          <div className="rounded-xl border border-theme-primary-border p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-medium text-slate-500">Đơn 2</span>
              <span
                className="status"
                style={{
                  color: "#B45309",
                  borderColor: "#F59E0B55",
                  backgroundColor: "#F59E0B1A",
                }}
              >
                Treo chờ hàng
              </span>
            </div>
            <p className="text-2xl font-semibold text-slate-900">
              {splitTotals.waiting}{" "}
              <span className="text-base font-medium text-slate-500">bao</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">Chờ bổ sung tồn kho (waiting)</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 mb-12">
        <button
          type="button"
          className="core_button core_button--secondary"
          onClick={() => router.push("/orders")}
        >
          Quay lại
        </button>

        <button type="button" className="core_button core_button--danger">
          Huỷ đơn
        </button>

        <button type="button" className="core_button core_button--primary">
          Chuẩn bị đóng gói
        </button>
      </div>
    </>
  );
}
