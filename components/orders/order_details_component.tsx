import { Modal, TableHead } from "@/components/core_component";
import { Icon } from "@/components/icon";
import type { Order } from "@/lib/api/types";
import { getOrderStatusLabel, orderColor, type OrderStatusId } from "@/lib/constants";

type OrderDetailsComponentProps = {
  order: Order;
  onClose: () => void;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
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

export function OrderDetailsComponent({ order, onClose }: OrderDetailsComponentProps) {
  return (
    <Modal
      id="order-details-modal"
      show
      width="2xl"
      title={`Đơn hàng ${order.code}`}
      subtitle={`${order.agency_name} - ${order.address}`}
      status={<OrderStatusBadge status={order.status} />}
      onClose={onClose}
    >
      <div className="core_modal__form overflow-hidden -mx-4">
        <div className="px-4 pb-4">
          <div className="overview-table-wrap">
            <div className="overview-table-inner">
              <table className="overview-table min-w-full" id="order-details-table">
                <colgroup>
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "40%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "4%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <TableHead icon="hero-hashtag">Mã sản phẩm</TableHead>
                    <TableHead icon="hero-cube">Sản phẩm</TableHead>
                    <TableHead icon="hero-hashtag">Số lượng</TableHead>
                    <TableHead icon="hero-banknotes">Đơn giá</TableHead>
                    <th className="actions"></th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="overview-table__muted">{item.product_code}</span> 
                      </td>
                      <td>
                        <span>{item.product_name}</span> 
                      </td>
                      <td className="overview-table__muted">{item.quantity}</td>
                      <td className="is-num overview-table__money">{formatMoney(item.price)}</td>
                      <td className="actions">
                        <div className="admin-actions">
                          <button type="button" className="admin-actions__btn" aria-label="Chỉnh sửa sản phẩm">
                            <Icon name="hero-pencil-square" className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="core_modal__actions">
          {order.status === 1 && (
            <button type="button" className="core_button core_button--primary">
              Tách đơn
              
            </button>
          )}
          <button type="button" className="core_button core_button--secondary" onClick={onClose}>
            Đóng
          </button>
          {order.status != 8 && (
            <>
            <button type="button" className="core_button core_button--danger">
              Huỷ đơn
            </button>
            <button type="button" className="core_button core_button--primary">
                Chuẩn bị đóng gói
            </button>
            </>
          )}
          
        </div>
      </div>
    </Modal>
  );
}