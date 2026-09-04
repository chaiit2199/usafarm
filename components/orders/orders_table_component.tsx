"use client";

import { Pagination, TableHead } from "@/components/core_component";
import { Tab } from "@/components/tab";
import { Order, orderTotal } from "@/lib/api/types";
import {
  ORDER_STATUSES,
  type OrderStatusId,
  getOrderStatusLabel,
  orderColor,
} from "@/lib/constants";
import { formatDateTimeVi } from "@/lib/format/date";
import { Icon } from "@/components/icon";

const ORDER_STATUS_TABS = [
  { value: "all" as const, label: "Tất cả" },
  ...ORDER_STATUSES.map((s) => ({ value: s.id, label: s.label })),
];

export const ORDERS: Order[] = [
  {
    id: 1,
    code: "DH-240518",
    agency_name: "Đại lý Hà Nội",
    address: "12 Láng Hạ, Đống Đa, Hà Nội",
    status: 8,
    created_at: "2024-05-18T10:20:00+07:00",
    updated_at: "2024-05-20T14:05:00+07:00",
    collected_amount: 9_250_000,
    received_amount: 9_250_000,
    items: [
      {
        id: 11,
        product_code: "NPK-30-10-10",
        product_name: "NPK 30-10-10 Bao 25kg",
        quantity: 10,
        unit_price: 500_000,
        status: 8,
      },
      {
        id: 12,
        product_code: "DAP-18-46",
        product_name: "DAP 18-46 Bao 50kg",
        quantity: 5,
        unit_price: 850_000,
        status: 8,
      },
    ],
  },
  {
    id: 2,
    code: "DH-240517",
    agency_name: "Đại lý Đà Nẵng",
    address: "45 Nguyễn Văn Linh, Hải Châu, Đà Nẵng",
    status: 2,
    created_at: "2024-05-17T10:15:00+07:00",
    updated_at: "2024-05-17T16:40:00+07:00",
    collected_amount: 0,
    received_amount: 0,
    items: [
      {
        id: 21,
        product_code: "UREA-46",
        product_name: "Urê 46% Bao 50kg",
        quantity: 20,
        unit_price: 420_000,
        status: 2,
      },
    ],
  },
  {
    id: 3,
    code: "DH-240516",
    agency_name: "Đại lý HCM",
    address: "161 Võ Văn Tần, Quận 3, TP.HCM",
    status: 4,
    created_at: "2024-05-16T09:00:00+07:00",
    updated_at: "2024-05-18T11:20:00+07:00",
    collected_amount: 3_000_000,
    received_amount: 5_000_000,
    items: [
      {
        id: 31,
        product_code: "HUMIC-01",
        product_name: "Humic Acid Gói 1kg",
        quantity: 100,
        unit_price: 75_000,
        status: 4,
      },
      {
        id: 32,
        product_code: "NPK-20-15-15",
        product_name: "NPK 20-15-15 Bao 25kg",
        quantity: 40,
        unit_price: 480_000,
        status: 1,
      },
    ],
  },
  {
    id: 4,
    code: "DH-240515",
    agency_name: "Đại lý Cần Thơ",
    address: "88 Nguyễn Trãi, Ninh Kiều, Cần Thơ",
    status: 1,
    created_at: "2024-05-15T07:45:00+07:00",
    updated_at: "2024-05-15T07:45:00+07:00",
    collected_amount: 0,
    received_amount: 0,
    items: [
      {
        id: 41,
        product_code: "KALI-60",
        product_name: "Kali clorua 60% Bao 50kg",
        quantity: 15,
        unit_price: 390_000,
        status: 1,
      },
    ],
  },
  {
    id: 5,
    code: "DH-240514",
    agency_name: "Đại lý Hải Phòng",
    address: "22 Lạch Tray, Ngô Quyền, Hải Phòng",
    status: 5,
    created_at: "2024-05-14T11:20:00+07:00",
    updated_at: "2024-05-16T09:10:00+07:00",
    collected_amount: 0,
    received_amount: 13_650_000,
    items: [
      {
        id: 51,
        product_code: "NPK-16-16-8",
        product_name: "NPK 16-16-8 Bao 25kg",
        quantity: 30,
        unit_price: 455_000,
        status: 5,
      },
    ],
  },
  {
    id: 6,
    code: "DH-240513",
    agency_name: "Đại lý Bình Dương",
    address: "15 Đại lộ Bình Dương, Thủ Dầu Một",
    status: 3,
    created_at: "2024-05-13T14:00:00+07:00",
    updated_at: "2024-05-14T08:30:00+07:00",
    collected_amount: 0,
    received_amount: 2_000_000,
    items: [
      {
        id: 61,
        product_code: "SA-21",
        product_name: "Phân SA 21% Bao 50kg",
        quantity: 25,
        unit_price: 310_000,
        status: 3,
      },
    ],
  },
];

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

export function OrdersTableComponent() {
  return (
    <section className="section" id="admin-orders-section">
      <div className="section-table mb-6">
        <Tab tabs={ORDER_STATUS_TABS} activeTab="all" />

        <div className="overview-table-wrap">
          <div className="overview-table-inner">
            <table className="overview-table min-w-[1600px]" id="orders-table">
              <colgroup>
                <col style={{ width: "8%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "4%" }} />
              </colgroup>
              <thead>
                <tr>
                  <TableHead icon="hero-clipboard-document-list">Mã đơn</TableHead>
                  <TableHead icon="hero-building-storefront">Đại lý</TableHead>
                  <TableHead icon="hero-banknotes">Tổng</TableHead>
                  <TableHead icon="hero-banknotes">Đã thu</TableHead>
                  <TableHead icon="hero-banknotes">Đã nhận</TableHead>
                  <TableHead icon="hero-calendar-days">Ngày tạo</TableHead>
                  <TableHead icon="hero-calendar-days">Ngày CN</TableHead>
                  <TableHead icon="hero-tag">Trạng thái</TableHead>
                  <TableHead icon="hero-map-pin">Địa chỉ</TableHead>
                  <th className="actions" />
                </tr>
              </thead>
              <tbody>
                {ORDERS.map((order) => (
                  <tr key={order.code} id={`order-row-${order.code}`} className="cursor-pointer">
                    <td className="overview-table__code">{order.code}</td>
                    <td>{order.agency_name}</td>
                    <td className="is-num overview-table__money">{formatMoney(orderTotal(order))}</td>
                    <td className="is-num overview-table__money">{formatMoney(order.collected_amount)}</td>
                    <td className="is-num overview-table__money">{formatMoney(order.received_amount)}</td>
                    <td className="overview-table__muted">{formatDateTimeVi(order.created_at)}</td>
                    <td className="overview-table__muted">{formatDateTimeVi(order.updated_at)}</td>
                    <td><OrderStatusBadge status={order.status} /></td>
                    <td className="overview-table__muted">{order.address}</td>
                    <td className="actions">
                      <div className="admin-actions">
                        <button type="button" className="admin-actions__btn" aria-label="Chỉnh sửa">
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
        <Pagination
          currentPage={1}
          totalPages={1}
          pageSize={20}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
        />
      </div>
    </section>
  );
}
