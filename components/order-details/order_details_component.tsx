"use client";

import { Fragment, useState } from "react";

import { TableHead } from "@/components/core_component";
import { Icon } from "@/components/icon";
import { OrderProductDetailsComponent } from "@/components/orders/order_product_details_component";
import type { Order, OrderItem, ProductComponent } from "@/lib/api/types";
import { getOrderStatusLabel, orderColor, type OrderStatusId } from "@/lib/constants";
import { formatDateTimeVi } from "@/lib/format/date";
import { MOCK_WAREHOUSES } from "@/lib/mock/authorization";
import { SelectField } from "../form-fields";
import { useRouter } from "next/navigation";


type OrderDetailsComponentProps = {
  order: Order;
}; 


const PRODUCT_COMPONENTS: ProductComponent[] = [
  {
    type: "Vỏ bao",
    code: "B0001",
    owner: "Công ty (CT)",
    demand: "200 Cái",
    stock: "15,500 Cái",
    status: "-500",
  },
  {
    type: "Ruột thô",
    code: "NVL-NPK202015",
    owner: "Công ty",
    demand: "10,000 KG",
    stock: "30,000 KG",
    status: "Đủ",
  },
  {
    type: "Tồn thành phẩm có sẵn",
    code: "NPK202015-B0001-DM-M-001-50",
    owner: "CT",
    demand: "200 Bao",
    stock: "200 Bao",
    status: "Có thể xuất thẳng",
  },
];

const PRODUCT_TABLE_COL_SPAN = 7; 

function formatMoney(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)} đ`;
}

function OrderStatusBadge({ status }: { status: OrderStatusId }) {
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

function ProductComponentsPanel() {
  return (
    <div className="px-4 py-3">
      <p className="mb-2 text-sm font-semibold text-theme-base-content">Thành phần của sản phẩm</p>
      <div className="overview-table-inner cursor-e-resize theme-primary-border">
        <table className="overview-table min-w-[1400px]">
        <colgroup>
          <col style={{ width: "4%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "24%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "12%" }} />
        </colgroup>
          <thead>
            <tr>
              <TableHead />
              <TableHead>Loại vật tư</TableHead>
              <TableHead>Mã vật tư</TableHead>
              <TableHead>Nguồn sở hữu</TableHead>
              <TableHead>Nhu cầu cần</TableHead>
              <TableHead>Tồn kho khả dụng</TableHead>
              <TableHead className="actions">Trạng thái vật tư</TableHead>
            </tr>
          </thead>
          <tbody>
            {PRODUCT_COMPONENTS.map((row, index) => (
              <tr key={row.code}>
                <td>{index + 1}</td>
                <td className="font-semibold">{row.type}</td>
                <td className="overview-table__muted">{row.code}</td>
                <td>{row.owner}</td>
                <td>{row.demand}</td>
                <td>{row.stock}</td>
                <td className="actions">
                  <span className={`status ${row.status === "Đủ" || row.status === "Có thể xuất thẳng" ? "status--active" : "status--rejected"}`}>{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrderProductRow({ item, expanded, onToggle }: {
  item: OrderItem;
  expanded: boolean;
  onToggle: () => void}) {
  return (
    <Fragment>
      <tr>
        <td>
          <button className="admin-actions__btn" onClick={onToggle}>
            <Icon
              name="hero-chevron-down"
              className={["size-5 transition-transform duration-200", expanded ? "rotate-0" : "-rotate-90"].join(" ")}
            />
          </button>
        </td>
        <td>
          <span className="overview-table__muted">{item.product_code}</span>
        </td>
        <td>{item.product_name}</td>
        <td className="overview-table__muted">{item.quantity}</td>
        <td className="is-num overview-table__money">{formatMoney(item.price)}</td>
        <td className="is-num overview-table__money">{formatMoney(item.price)}</td>
        <td className="font-semibold">
          <span className={`status ${item.status === "-500" ? "status--rejected" : item.status === "Đủ" ? "status--active" : ""}`}>{item.status}</span>
        </td>
      </tr>

      {expanded && (
        <tr className="td-collapse">
          <td colSpan={PRODUCT_TABLE_COL_SPAN}>
            <ProductComponentsPanel />
          </td>
        </tr>
      )}
    </Fragment>
  );
}

export function OrderDetailsComponent({ order }: OrderDetailsComponentProps) {
  const [view, setView] = useState<"details" | "product-details">("details");
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const remainingDebt = Math.max(order.total_amount - order.collected_amount, 0);
  const router = useRouter();

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
            <p className="font-semibold text-slate-900">{formatDateTimeVi(order.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Trạng thái</p>
            <p className="font-semibold text-slate-900">
              <OrderStatusBadge status={order.status} />
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Nhân viên tạo đơn</p>
            <p className="font-semibold text-slate-900">Lê Văn Phúc</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Mã nhân viên</p>
            <p className="font-semibold text-slate-900">NV0007</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Tổng tiền</p>
            <p className="font-semibold text-slate-900">{formatMoney(order.total_amount)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Công nợ đã thu</p>
            <p className="font-semibold text-slate-900">{formatMoney(order.collected_amount)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Công nợ còn lại</p>
            <p className="font-semibold text-slate-900">{formatMoney(remainingDebt)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Thời gian cập nhật</p>
            <p className="font-semibold text-slate-900">{formatDateTimeVi(order.updated_at)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Số lượng sản phẩm</p>
            <p className="font-semibold text-slate-900">{order.items.length}</p>
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
            <p className="font-semibold text-slate-900">{order.agency_name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Mã đại lý</p>
            <p className="font-semibold text-slate-900">AG0001</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Số điện thoại</p>
            <p className="font-semibold text-slate-900">0909090909</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Người liên hệ</p>
            <p className="font-semibold text-slate-900">Nguyễn Văn A</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-slate-500 mb-0.5">Địa chỉ đại lý</p>
            <p className="font-semibold text-slate-900">{order.address}</p>
          </div>
        </div>
      </section>
      </div>

      <div className="section-container mb-6">
        <h6 className="mb-3 text-base font-semibold flex items-center gap-2">
          <Icon name="hero-building-storefront" className="size-5 text-theme-primary" />
          Chọn kho hàng đối chiếu năng lực
        </h6> 

        <SelectField
          id="update-user-department"
          name="department_id"
          label=""
        >
          <option value="" disabled>
          Chọn phòng ban
          </option>
            {MOCK_WAREHOUSES.map((warehouse) => (
            <option key={warehouse.code} value={warehouse.code}>
                {warehouse.name}
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
                <col style={{ width: "22%" }} />
                <col style={{ width: "26%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>
              <thead>
                <tr>
                  <TableHead />
                  <TableHead>SKU</TableHead>
                  <TableHead icon="hero-cube">Tên sản phẩm</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead icon="hero-banknotes">Đơn giá</TableHead>
                  <TableHead icon="hero-banknotes">Thành tiền</TableHead>
                  <TableHead icon="hero-banknotes">Trạng thái</TableHead>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <OrderProductRow
                    key={item.id}
                    item={item} 
                    expanded={expandedIds.includes(item.id)}
                    onToggle={() => toggleExpanded(item.id)}
                  />
                ))}
              </tbody>
            </table>

            <div className="rounded-b-xl bg-theme-primary-border py-4 text-right pr-8">
              Tổng thành tiền các sản phẩm:{" "}
              <strong className="pl-1">{formatMoney(order.total_amount)}</strong>
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
                600 <span className="text-base font-medium text-slate-500">bao</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">Xuất từ tồn khả dụng</p>
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
                400 <span className="text-base font-medium text-slate-500">bao</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">Chờ bổ sung tồn kho</p>
            </div>
          </div>
        </div>


        <div className="flex items-center justify-end gap-3 pt-2 mb-12">
          <button type="button" className="core_button core_button--secondary" onClick={() => router.push("/orders")}>
            Quay lại
          </button>
          
          <button type="button" className="core_button core_button--danger">
            Huỷ đơn
          </button> 

          <button type="button" className="core_button core_button--primary">
            Chuẩn bị đóng gói
          </button>
        </div>

       

      {view === "product-details" && (
        <OrderProductDetailsComponent onClose={() => setView("details")} />
      )}
    </>
  );
}
