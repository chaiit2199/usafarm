"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";

import { Modal, Pagination, TableHead } from "@/components/core_component";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Icon } from "@/components/icon";
import { RequiredLabel } from "@/components/form-fields";

type HandoverOrder = {
  id: number;
  code: string;
  exportSlipCode: string;
  vehicle: string;
  driver: string;
  productCount: number;
  statusLabel: string;
  statusColor: string;
};

const MOCK_ORDERS: HandoverOrder[] = [
  {
    id: 1,
    code: "DH-CASE-01",
    exportSlipCode: "XK-20260909-028",
    vehicle: "123123",
    driver: "Tài xế 123",
    productCount: 1,
    statusLabel: "Chuẩn bị xuất kho",
    statusColor: "#2563EB",
  },
];

function StatusBadge({ label, color }: { label: string; color: string }) {
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

function HandoverConfirmModal({
  order,
  onClose,
}: {
  order: HandoverOrder;
  onClose: () => void;
}) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [podFileName, setPodFileName] = useState("");

  const hasFile = podFileName !== "";

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPodFileName(file?.name ?? "");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hasFile) return;
    setIsConfirmOpen(true);
  }

  function confirmHandover() {
    const form = document.getElementById("handover-pod-form") as HTMLFormElement | null;
    const data = form ? Object.fromEntries(new FormData(form).entries()) : {};
    console.log("confirm_handover", {
      orderId: order.id,
      orderCode: order.code,
      exportSlipCode: order.exportSlipCode,
      podFileName,
      ...data,
    });
    setIsConfirmOpen(false);
    onClose();
  }

  return (
    <>
      <Modal
        id="handover-pod-modal"
        show
        title="Xác nhận bàn giao & cập nhật POD"
        subtitle="Trừ tồn kho thực tế chỉ diễn ra sau khi xác nhận bàn giao thành công."
        closeable={!isConfirmOpen}
        width="2xl"
        onBack={onClose}
        onClose={onClose}
      >
        <form
          id="handover-pod-form"
          className="core_modal__form overflow-hidden -mx-4"
          onSubmit={handleSubmit}
        >
          <div className="flex-auto h-full overflow-y-auto px-4 flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-theme-muted text-xs mb-0.5">Mã đơn hàng</p>
                  <p className="font-semibold text-slate-900 text-sm">
                    {order.code} ({order.productCount} sản phẩm)
                  </p>
                </div>
                <div>
                  <p className="text-theme-muted text-xs mb-0.5">Số phiếu xuất</p>
                  <p className="font-semibold text-slate-900 text-sm">{order.exportSlipCode}</p>
                </div>
                <div>
                  <p className="text-theme-muted text-xs mb-0.5">Xe nhận hàng</p>
                  <p className="font-semibold text-slate-900 text-sm">
                    {order.vehicle} — {order.driver}
                  </p>
                </div>
                <div>
                  <p className="text-theme-muted text-xs mb-0.5">Trạng thái</p>
                  <p className="font-semibold text-slate-900 text-sm">
                    <StatusBadge label={order.statusLabel} color={order.statusColor} />
                  </p>
                </div>
              </div>

            <div className="core_field">
              <label htmlFor="handover-pod-file" className="core_label">
                <RequiredLabel>
                  Tải lên hình ảnh biên bản / phiếu xuất kho có đầy đủ chữ ký của tài xế
                </RequiredLabel>
              </label>
              <label
                htmlFor="handover-pod-file"
                className="flex cursor-pointer !items-center gap-3 rounded-xl border border-dashed border-theme-primary-border bg-slate-50 p-4 hover:bg-slate-100 !gap-2" 
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#e2ebe5] text-theme-primary">
                  <Icon name="hero-document-plus" className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-slate-900">
                    {podFileName ||
                      "Chụp ảnh từ điện thoại hoặc bấm vào đây để tải file biên bản"}
                  </span>
                  <span className="mt-0.5 block text-xs text-theme-muted">
                    Bắt buộc phải có ảnh chứng từ mới kích hoạt được nút xác nhận
                  </span>
                </span>
                <input
                  id="handover-pod-file"
                  name="pod_file"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  required
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <div className="core_field">
              <label htmlFor="handover-note" className="core_label">
                Ghi chú bàn giao (seal niêm phong, tình trạng xe)
              </label>
              <textarea
                id="handover-note"
                name="note"
                rows={4}
                placeholder="Nhập ghi chú bàn giao..."
                className="core_input core_input--textarea w-full"
              />
            </div>
          </div>

          <div className="core_modal__actions px-4">
            <button type="button" className="core_button core_button--secondary" onClick={onClose}>
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="core_button core_button--primary inline-flex items-center gap-1.5"
              disabled={!hasFile}
            >
              Xác nhận bàn giao
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        id="handover-pod-confirm-modal"
        show={isConfirmOpen}
        title="Xác nhận bàn giao"
        width="md"
        className="core_modal--stacked"
        onClose={() => setIsConfirmOpen(false)}
      >
        <form className="core_modal__form" action={confirmHandover}>
          <p className="text-sm text-theme-muted">
            Bạn có chắc muốn xác nhận bàn giao đơn{" "}
            <span className="font-semibold text-slate-900">{order.code}</span>? Hệ thống sẽ trừ tồn
            kho và đóng đơn.
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

export function OrdersHandoverComponent() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedOrder, setSelectedOrder] = useState<HandoverOrder | null>(null);
  const orders = MOCK_ORDERS;
  const totalPages = 1;

  return (
    <section className="section" id="production-handover-section">
      <div className="section-container section-table mb-6">
        <h6 className="mb-4 text-base font-semibold">Danh sách đơn chờ bàn giao</h6>

        <div className="overview-table-wrap">
          <div className="overview-table-inner">
            <table className="overview-table min-w-full" id="handover-orders-table">
              <colgroup>
                <col style={{ width: "18%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "22%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "20%" }} />
              </colgroup>
              <thead>
                <tr>
                  <TableHead icon="hero-clipboard-document-list">Mã đơn con</TableHead>
                  <TableHead icon="hero-document-text">Số phiếu xuất</TableHead>
                  <TableHead icon="hero-truck">Xe nhận hàng</TableHead>
                  <TableHead icon="hero-tag">Trạng thái</TableHead>
                  <TableHead className="actions"></TableHead>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} id={`handover-order-row-${order.id}`}>
                    <td className="overview-table__code">{order.code}</td>
                    <td className="overview-table__muted">{order.exportSlipCode}</td>
                    <td>
                      {order.vehicle} — {order.driver}
                    </td>
                    <td>
                      <StatusBadge label={order.statusLabel} color={order.statusColor} />
                    </td>
                    <td className="actions">
                      <button
                        type="button"
                        className="btn btn--primary"
                        onClick={() => setSelectedOrder(order)}
                      >
                        Xác nhận bàn giao
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
        <HandoverConfirmModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </section>
  );
}
