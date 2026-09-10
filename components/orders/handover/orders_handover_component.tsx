"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

import {
  EmptyData,
  Modal,
  Pagination,
  TableHead,
  TableLoading,
} from "@/components/core_component";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Icon } from "@/components/icon";
import { RequiredLabel } from "@/components/form-fields";
import { LoadError } from "@/components/load_error";
import { getWarehouseOrders, uploadGoodsIssueImages } from "@/lib/api/production";
import { totalPagesFromMeta } from "@/lib/api/pagination";
import type { GoodsIssue, WarehouseOrder } from "@/lib/api/types";
import { getOrderStatusLabel, orderColor } from "@/lib/constants";
import { putFlash } from "@/lib/flash/flash";

function latestGoodsIssue(order: WarehouseOrder): GoodsIssue | undefined {
  return order.goods_issues.at(-1);
}

function vehicleLabel(issue: GoodsIssue | undefined) {
  if (!issue) return "—";
  return [issue.vehicle_plate, issue.driver_name].filter(Boolean).join(" — ") || "—";
}

function OrderStatusBadge({ status }: { status: number }) {
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

function HandoverConfirmModal({
  order,
  onClose,
  onSaved,
}: {
  order: WarehouseOrder;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [podFiles, setPodFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const issue = latestGoodsIssue(order);
  const hasFile = podFiles.length > 0;

  async function handleUploadImage(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    console.log("files", files);
    setPodFiles(files);
    if (files.length === 0) return;

    if (!issue) {
      putFlash("error", "Không tìm thấy phiếu xuất kho", 1500);
      return;
    }

    const formData = new FormData();
    formData.append("id", String(issue.id));
    for (const file of files) formData.append("file", file);

    setUploading(true);
    const result = await uploadGoodsIssueImages(formData);
    setUploading(false);

    if (!result.ok) {
      putFlash("error", result.message, 1500);
      setPodFiles([]);
      event.target.value = "";
      return;
    }

    putFlash("success", "Đã tải ảnh chứng từ", 1500);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hasFile || uploading) return;
    setIsConfirmOpen(true);
  }

  async function confirmHandover() {
    setIsConfirmOpen(false);
    putFlash("success", "Đã xác nhận bàn giao", 1500);
    onSaved();
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
                    {order.code} ({order.total_items} sản phẩm)
                  </p>
                </div>
                <div>
                  <p className="text-theme-muted text-xs mb-0.5">Số phiếu xuất</p>
                  <p className="font-semibold text-slate-900 text-sm">{issue?.code ?? "—"}</p>
                </div>
                <div>
                  <p className="text-theme-muted text-xs mb-0.5">Xe nhận hàng</p>
                  <p className="font-semibold text-slate-900 text-sm">{vehicleLabel(issue)}</p>
                </div>
                <div>
                  <p className="text-theme-muted text-xs mb-0.5">Trạng thái</p>
                  <p className="font-semibold text-slate-900 text-sm">
                    <OrderStatusBadge status={order.status} />
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
                    {uploading
                      ? "Đang tải ảnh..."
                      : podFiles.length > 0
                        ? podFiles.map((file) => file.name).join(", ")
                        : "Chụp ảnh từ điện thoại hoặc bấm vào đây để tải file biên bản"}
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
                  multiple
                  className="sr-only"
                  required
                  disabled={uploading}
                  onChange={handleUploadImage}
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
              disabled={!hasFile || uploading}
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
  const [totalPages, setTotalPages] = useState(1);
  const [search] = useState("");
  const [orders, setOrders] = useState<WarehouseOrder[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadAt, setReloadAt] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<WarehouseOrder | null>(null);

  useEffect(() => {
    let cancelled = false;
    setOrders(null);
    setLoadError(null);

    getWarehouseOrders({
      search: search.trim() || "",
      status: 12,
      page,
      page_size: pageSize,
    }).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setLoadError(result.message);
        setOrders([]);
        return;
      }
      setOrders(result.data ?? []);
      setTotalPages(totalPagesFromMeta(result.meta, result.data?.length ?? 0, pageSize));
    });

    return () => {
      cancelled = true;
    };
  }, [search, page, pageSize, reloadAt]);

  return (
    <section className="section" id="production-handover-section">
      <div className="section-container section-table mb-6">
        {loadError ? (
          <LoadError
            message={loadError}
            onRetry={() => {
              setLoadError(null);
              setOrders(null);
              setReloadAt((value) => value + 1);
            }}
          />
        ) : (
          <>
            <div className="overview-table-wrap">
              <div className="overview-table-inner">
                <table className="overview-table min-w-[1200px]" id="handover-orders-table">
                  <colgroup>
                    <col style={{ width: "4%" }} />
                    <col style={{ width: "24%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "16%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <TableHead></TableHead>
                      <TableHead>Mã đơn hàng</TableHead>
                      <TableHead>Số phiếu xuất</TableHead> 
                      <TableHead icon="hero-truck">Xe nhận hàng</TableHead>
                      <TableHead icon="hero-tag">Người nhận hàng</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="actions"></TableHead>
                    </tr>
                  </thead>
                  <tbody>
                    {orders?.map((order, index) => (
                      <tr key={order.code} id={`handover-order-row-${order.code}`}>
                        <td className="overview-table__muted">{index + 1}</td>
                        <td className="overview-table__muted">{order.code}</td>
                        <td className="overview-table__muted">
                          {order.goods_issues.at(-1)?.code ?? "—"}
                        </td>
                        <td>{order.goods_issues.at(-1)?.vehicle_plate ?? "—"}</td>
                        <td>{order.goods_issues.at(-1)?.driver_name ?? "—"}</td>
                        <td>
                          <OrderStatusBadge status={order.status} />
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
          </>
        )}
      </div>

      {selectedOrder && (
        <HandoverConfirmModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSaved={() => {
            setSelectedOrder(null);
            setReloadAt((value) => value + 1);
          }}
        />
      )}
    </section>
  );
}
