import { useState, type ReactNode } from "react";

import { Modal, TableHead } from "@/components/core_component";
import { Icon } from "@/components/icon";
import { OrderProductDetailsComponent } from "@/components/orders/order_product_details_component";
import type { Order } from "@/lib/api/types";
import { getOrderStatusLabel, orderColor, type OrderStatusId } from "@/lib/constants";
import { formatDateTimeVi } from "@/lib/format/date";
import { Input } from "@/components/input";
import { RequiredLabel } from "../form-fields";
type OrderDetailsComponentProps = {
  order: Order;
  onClose: () => void;
};

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

function InfoRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-theme-muted">{label}</p>
      <p className="font-semibold">
        {value}
      </p>
    </div>
  );
}

function InfoSection({ title, children, cols = 1 }: { title: string; children: ReactNode; cols?: 1 | 2 }) {
  const gridClass = cols === 2 ? "grid grid-cols-2 gap-x-16 gap-y-4" : "grid grid-cols-1 gap-x-16 gap-y-4";

  return (
    <section>
      <h3 className="mb-2 text-base font-semibold text-theme-base-content">{title}</h3>
      <div className={`${gridClass} p-4 rounded-2xl bg-theme-primary-border`}>{children}</div>
    </section>
  );
}

export function OrderDetailsComponent({ order, onClose }: OrderDetailsComponentProps) {
  const [view, setView] = useState<"details" | "product-details">("details");
  const remainingDebt = Math.max(order.total_amount - order.collected_amount, 0);
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {view === "details" && (
        <Modal
          id="order-details-modal"
          show
          width="4xl"
          title={`Đơn hàng ${order.code}`}
          onClose={onClose}
        >
          <div className="core_modal__form overflow-hidden -mx-4">
            <div className="space-y-5 overflow-y-auto px-4 pb-4">
              <InfoSection title="1. Thông tin đơn hàng" cols={2}>
                <InfoRow label="Mã đơn hàng" value={order.code} />
                <InfoRow label="Ngày tạo đơn" value={formatDateTimeVi(order.created_at)} />
                <InfoRow label="Trạng thái" value={<OrderStatusBadge status={order.status} />} />
                <InfoRow label="Nhân viên tạo đơn" value="Lê Văn Phúc" />
                <InfoRow label="Mã nhân viên" value="NV0007" />
                <InfoRow label="Tổng tiền" value={formatMoney(order.total_amount)} />
                <InfoRow label="Công nợ đã thu" value={formatMoney(order.collected_amount)} />
                <InfoRow
                  label="Công nợ còn lại"
                  value={formatMoney(remainingDebt)}
                  valueClassName="font-semibold text-red-500"
                />
                <InfoRow label="TG cập nhật" value={formatDateTimeVi(order.updated_at)} />
                <InfoRow
                  label="Số lượng sản phẩm"
                  value={`${order.items.length} sản phẩm / ${totalQuantity} Bao`}
                />
              </InfoSection>

              <InfoSection title="2. Thông tin đại lý" cols={2}>
                <InfoRow label="Tên đại lý" value={order.agency_name} />
                <InfoRow label="Địa chỉ đại lý" value={order.address} />
              </InfoSection>

              <section>
                <h3 className="mb-2 text-base font-semibold text-theme-base-content">3. Sản phẩm</h3>
                <div className="overview-table-inner">
                  <table className="overview-table min-w-full" id="order-details-table">
                    <colgroup>
                      <col style={{ width: "4%" }} />
                      <col style={{ width: "18%" }} />
                      <col style={{ width: "28%" }} />
                      <col style={{ width: "6%" }} />
                      <col style={{ width: "12%" }} />
                      <col style={{ width: "12%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "4%" }} />
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
                        <th className="actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, index) => (
                        <tr key={item.id}>
                          <td>
                            <span className="overview-table__muted">
                              <Icon name="hero-chevron-down" className="size-8 -rotate-90 p-1.5" />
                            </span>
                          </td>
                          <td>
                            <span className="overview-table__muted">{item.product_code}</span>
                          </td>
                          <td>
                            <span>{item.product_name}</span>
                          </td>
                          <td className="overview-table__muted">{item.quantity}</td>
                          <td className="is-num overview-table__money">{formatMoney(item.price)}</td>
                          <td className="is-num overview-table__money">{formatMoney(item.price)}</td>
                          <td className="is-num overview-table__money">Sẵn sàng</td>
                          <td className="actions">
                            <div className="admin-actions">
                              {order.status === 1 && (
                                <button
                                  type="button"
                                  className="admin-actions__btn"
                                  aria-label="Chỉnh sửa sản phẩm"
                                  onClick={() => setView("product-details")}
                                >
                                  <Icon name="hero-pencil-square" className="size-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="text-right bg-theme-primary-border rounded-b-xl py-4">
                    Tổng thành tiền các sản phẩm: <strong className="pl-1">{formatMoney(order.total_amount)}</strong>
                  </div>
                </div>
              </section>
            </div>

            <div className="core_modal__actions">
              {order.status === 1 && (
                <button type="button" className="core_button core_button--primary mr-auto">
                  Tách đơn
                </button>
              )}
              <button type="button" className="core_button core_button--secondary" onClick={onClose}>
                Đóng
              </button>
              {order.status != 8 && (
                <button type="button" className="core_button core_button--danger">
                  Huỷ đơn
                </button>
              )}
              {order.status === 1 && (
                <button type="button" className="core_button core_button--primary">
                  Chuẩn bị đóng gói
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {view === "product-details" && (
        <OrderProductDetailsComponent onClose={() => setView("details")} />
      )}
    </>
  );
}
