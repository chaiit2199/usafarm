"use client";

import { Fragment } from "react";

import { TableHead } from "@/components/core_component";
import { Icon } from "@/components/icon";
import type { OrderFulfillmentWarehouse, OrderLine } from "@/lib/api/types";
import { orderAmount } from "@/lib/api/types";

function formatMoney(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)} đ`;
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

function ProductCapacityPanel({ capacity , line }: { capacity?: OrderFulfillmentWarehouse, line: OrderLine }) {
  if (!capacity) {
    return (
      <div className="px-4 py-3 text-sm text-theme-muted">
        Chọn kho để xem năng lực đối chiếu cho dòng này.
      </div>
    );
  } 

  return (
    <div className="px-4 py-3">
      <p className="mb-2 text-sm font-semibold text-theme-base-content">
        Năng lực kho — {capacity.warehouse_name}
      </p>
      <div className="overview-table-inner theme-primary-border">
        <table className="overview-table min-w-full">
            <colgroup>
                <col style={{ width: "20%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "16%" }} />
            </colgroup>
          <thead>
            <tr>
              <TableHead>Loại vật tư</TableHead>
              <TableHead>Mã vật tư</TableHead>
              <TableHead>Nguồn sở hữu</TableHead>
              <TableHead>Nhu cầu cần</TableHead>
              <TableHead>Tồn kho khả dụng</TableHead>
              <TableHead>Trạng thái vật tư</TableHead>
            </tr>
          </thead>
            <tbody>
                <tr>
                    <td className="font-semibold">Vỏ bao</td>
                    <td className="font-semibold">{line.packaging_id}</td>
                    <td>Công ty</td>
                    <td className="overview-table__muted">
                        {line.quantity} cái
                    </td>
                    <td>{capacity.packaging_available} cái</td>
                    <td>
                      {capacity.is_packaging_available ? (
                        <span className="status status--active">Đủ</span>
                      ) : (
                        <span className="status status--rejected">Thiếu</span>
                      )}
                    </td>
                </tr>

                <tr>
                    <td className="font-semibold">Ruột thô / Cốt</td>
                    <td className="font-semibold">{line.requested_core_material_id}</td>
                    <td>Công ty</td>
                    <td className="overview-table__muted">
                        {line.packaging_weight_kg * line.quantity} {capacity.unit}
                    </td>
                    <td className="overview-table__muted">
                        {capacity.core_available} {capacity.unit}
                    </td>
                    <td>
                      {capacity.is_core_available ? (
                        <span className="status status--active">Đủ</span>
                      ) : (
                        <span className="status status--rejected">Thiếu</span>
                      )}
                    </td>
                </tr>  
                <tr>
                    <td className="font-semibold">Tồn thành phẩm có sẵn</td>
                    <td>{line.sales_sku_code}</td>
                    <td>Công ty</td>
                    <td className="overview-table__muted">
                        {line.quantity} Bao
                    </td>
                    <td>{capacity.finished_goods_available} Bao</td>
                    <td>
                      {capacity.is_finished_goods_available ? (
                        <span className="status status--active">Có thể xuất thẳng</span>
                      ) : (
                        <span className="status status--rejected">Cần đóng mới</span>
                      )}
                    </td>
                </tr>
            </tbody>
        </table>
      </div>
    </div>
  );
}

type OrderProductRowProps = {
  item: OrderLine;
  capacity?: OrderFulfillmentWarehouse;
  expanded: boolean;
  onToggle: () => void;
};

export function OrderProductRow({ item, capacity, expanded, onToggle }: OrderProductRowProps) {
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
          <LineFulfillmentStatus
            waiting={capacity?.allocation_proposal.waiting_quantity}
          />
        </td>
      </tr>

      {expanded && (
        <tr className="td-collapse">
          <td colSpan={7}>
            <ProductCapacityPanel capacity={capacity} line={item} />
          </td>
        </tr>
      )}
    </Fragment>
  );
}
