"use client";

import { useState, type FormEvent } from "react";

import {
  Input,
  Modal,
  Pagination,
  TableHead,
} from "@/components/core_component";
import { FormSubmitButton } from "@/components/form-submit-button";
import { RequiredLabel, SelectField } from "@/components/form-fields";

type ExportOrder = {
  id: number;
  code: string;
  customer: string;
  productCount: number;
  productSku: string;
  productName: string;
  packSpecKg: number;
  totalBags: number;
  note: string;
};

const MOCK_ORDERS: ExportOrder[] = [
  {
    id: 1,
    code: "DH-CASE-01",
    customer: "Đại lý Case 1 - Tồn Đủ / SX Đủ",
    productCount: 1,
    productSku: "NPK202015-B0201-C-M-003-50",
    productName: "Bao minh họa Case 1",
    packSpecKg: 50,
    totalBags: 100,
    note: "—",
  },
  {
    id: 2,
    code: "DH-CASE-02",
    customer: "Đại lý Case 2 - Tồn Đủ / SX Một phần",
    productCount: 1,
    productSku: "NPK202015-B0201-C-M-003-50",
    productName: "Bao minh họa Case 2",
    packSpecKg: 50,
    totalBags: 100,
    note: "—",
  },
  {
    id: 3,
    code: "DH-CASE-08-A",
    customer: "Đại lý Case 8 - Tồn Đủ / SX Đủ",
    productCount: 1,
    productSku: "NPK202015-B0201-C-M-003-50",
    productName: "Bao minh họa Case 8",
    packSpecKg: 50,
    totalBags: 40,
    note: "—",
  },
];

const MOCK_CARRIERS = [
  { id: 1, name: "Công ty vận tải A" },
  { id: 2, name: "Công ty vận tải B" },
  { id: 3, name: "Nhà xe C" },
] as const;

function formatWeightKg(bags: number, packSpecKg: number) {
  return new Intl.NumberFormat("en-US").format(bags * packSpecKg);
}

function ExportSlipModal({
  order,
  onClose,
}: {
  order: ExportOrder;
  onClose: () => void;
}) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const totalWeightKg = order.totalBags * order.packSpecKg;
  const totalTons = (totalWeightKg / 1000).toFixed(1);

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsConfirmOpen(true);
  }

  function confirmSave() {
    const form = document.getElementById("export-slip-form") as HTMLFormElement | null;
    const data = form ? Object.fromEntries(new FormData(form).entries()) : {};
    console.log("save_export_slip", { orderId: order.id, orderCode: order.code, ...data });
    setIsConfirmOpen(false);
    onClose();
  }

  return (
    <>
      <Modal
        id="export-slip-modal"
        show
        title="Lập phiếu xuất kho giao hàng (Mẫu 02-VT)"
        subtitle="Công ty TNHH nông nghiệp USA Farm — Thông tư 200/2014/TT-BTC."
        closeable={!isConfirmOpen}
        width="3xl"
        onBack={onClose}
        onClose={onClose}
      >
        <form
          id="export-slip-form"
          className="core_modal__form overflow-hidden -mx-4"
          onSubmit={handleSave}
        >
          <div className="flex-auto h-full overflow-y-auto px-4 flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-3 rounded-xl border border-theme-primary-border bg-slate-50 p-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs text-theme-muted mb-0.5">Mã đơn hàng</p>
                <p className="font-semibold text-slate-900">{order.code}</p>
              </div>
              <div>
                <p className="text-xs text-theme-muted mb-0.5">Số phiếu xuất (tự sinh)</p>
                <p className="font-semibold text-slate-900">XK-20260909-028</p>
              </div>
              <div>
                <p className="text-xs text-theme-muted mb-0.5">Ngày xuất</p>
                <p className="font-semibold text-slate-900">2026-09-09 09:17 PM</p>
              </div>
            </div>

            <section>
              <h6 className="mb-3 text-base font-semibold">
                Thông tin điều độ phương tiện vận tải
              </h6>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SelectField
                  id="export-carrier"
                  name="carrier_id"
                  label={<RequiredLabel>Đơn vị / nhà vận chuyển</RequiredLabel>}
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    Chọn nhà vận chuyển
                  </option>
                  {MOCK_CARRIERS.map((carrier) => (
                    <option key={carrier.id} value={carrier.id}>
                      {carrier.name}
                    </option>
                  ))}
                </SelectField>

                <Input
                  id="export-vehicle-plate"
                  name="vehicle_plate"
                  label={<RequiredLabel>Biển số xe tải nhận hàng</RequiredLabel>}
                  placeholder="Ví dụ: 95H-01163"
                  required
                />

                <Input
                  id="export-driver-name"
                  name="driver_name"
                  label={<RequiredLabel>Họ và tên lái xe / người nhận</RequiredLabel>}
                  placeholder="Nhập họ tên..."
                  required
                />

                <Input
                  id="export-driver-contact"
                  name="driver_contact"
                  label={<RequiredLabel>Số CCCD / điện thoại</RequiredLabel>}
                  placeholder="Số CCCD - SĐT"
                  required
                />
              </div>
            </section>

            <section>
              <h6 className="mb-3 text-base font-semibold">Bảng chi tiết hàng hóa xuất kho</h6>
              <div className="overview-table-inner">
                <table className="overview-table min-w-full">
                  <colgroup>
                    <col style={{ width: "6%" }} />
                    <col style={{ width: "34%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "18%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <TableHead>STT</TableHead>
                      <TableHead>Mã SKU & tên sản phẩm</TableHead>
                      <TableHead>Quy cách</TableHead>
                      <TableHead>SL bao</TableHead>
                      <TableHead>Khối lượng (KG)</TableHead>
                      <TableHead>Ghi chú</TableHead>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>
                        <p className="mb-0.5 font-medium text-slate-900">{order.productSku}</p>
                        <p className="text-xs text-theme-muted">{order.productName}</p>
                      </td>
                      <td>{order.packSpecKg} KG</td>
                      <td className="is-num">{order.totalBags}</td>
                      <td className="is-num">
                        {formatWeightKg(order.totalBags, order.packSpecKg)} KG
                      </td>
                      <td className="overview-table__muted">{order.note}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="rounded-b-xl bg-theme-primary-border py-3 pr-4 text-right text-sm font-semibold text-slate-900">
                  TỔNG CỘNG: {order.totalBags} Bao — {formatWeightKg(order.totalBags, order.packSpecKg)}{" "}
                  KG ({totalTons} Tấn)
                </div>
              </div>
            </section>
          </div>

          <div className="core_modal__actions px-4">
            <button type="button" className="core_button core_button--secondary" onClick={onClose}>
              Quay lại
            </button>
            <FormSubmitButton>Lưu & in phiếu xuất kho</FormSubmitButton>
          </div>
        </form>
      </Modal>

      <Modal
        id="export-slip-confirm-modal"
        show={isConfirmOpen}
        title="Xác nhận lưu phiếu xuất kho"
        width="md"
        className="core_modal--stacked"
        onClose={() => setIsConfirmOpen(false)}
      >
        <form className="core_modal__form" action={confirmSave}>
          <p className="text-sm text-theme-muted">
            Bạn có chắc muốn lưu & in phiếu xuất kho cho đơn{" "}
            <span className="font-semibold text-slate-900">{order.code}</span>?
          </p>
          <div className="core_modal__actions">
            <button
              type="button"
              className="core_button core_button--secondary"
              onClick={() => setIsConfirmOpen(false)}
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

export function OrdersExportComponent() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedOrder, setSelectedOrder] = useState<ExportOrder | null>(null);
  const orders = MOCK_ORDERS;
  const totalPages = 1;

  return (
    <section className="section" id="production-export-section">
      <div className="section-container section-table mb-6">
        <h6 className="mb-4 text-base font-semibold">
          Danh sách đơn chờ lập phiếu xuất kho
        </h6>

        <div className="overview-table-wrap">
          <div className="overview-table-inner">
            <table className="overview-table min-w-full" id="export-orders-table">
              <colgroup>
                <col style={{ width: "14%" }} />
                <col style={{ width: "28%" }} />
                <col style={{ width: "28%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "18%" }} />
              </colgroup>
              <thead>
                <tr>
                  <TableHead icon="hero-clipboard-document-list">Mã đơn</TableHead>
                  <TableHead icon="hero-users">Khách hàng</TableHead>
                  <TableHead icon="hero-cube">Sản phẩm trong đơn</TableHead>
                  <TableHead>Tổng SL (bao)</TableHead>
                  <TableHead className="actions">Thao tác</TableHead>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} id={`export-order-row-${order.id}`}>
                    <td className="overview-table__code">{order.code}</td>
                    <td>{order.customer}</td>
                    <td className="overview-table__muted">
                      <p className="text-theme-muted">
                        {order.productCount} sản phẩm <br />
                        {order.productSku}
                      </p>
                    </td>
                    <td className="is-num">{order.totalBags} Bao</td>
                    <td className="actions">
                      <button
                        type="button"
                        className="btn btn--primary"
                        onClick={() => setSelectedOrder(order)}
                      >
                        Lập phiếu xuất kho
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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
      </div>

      {selectedOrder && (
        <ExportSlipModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </section>
  );
}
