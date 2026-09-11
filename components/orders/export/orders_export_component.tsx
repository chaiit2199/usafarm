"use client";

import { Fragment, useEffect, useState, type FormEvent } from "react";

import {
  EmptyData,
  Input,
  Modal,
  Pagination,
  TableHead,
} from "@/components/core_component";
import { FormSubmitButton } from "@/components/form-submit-button";
import { RequiredLabel, SelectField } from "@/components/form-fields";
import { Icon } from "@/components/icon";
import { LoadError } from "@/components/load_error";
import { getWarehouseOrders, createWarehouseOrderGoodsIssue } from "@/lib/api/production";
import { totalPagesFromMeta } from "@/lib/api/pagination";
import type { WarehouseOrder } from "@/lib/api/types";
import { getOrderStatusLabel, orderColor } from "@/lib/constants";
import { putFlash } from "@/lib/flash/flash";
import { formatDateTimeVi } from "@/lib/format/date";

const MOCK_CARRIERS = [
  { id: 1, name: "Công ty vận tải A" },
  { id: 2, name: "Công ty vận tải B" },
  { id: 3, name: "Nhà xe C" },
] as const;

function formatWeightKg(bags: number, packSpecKg: number) {
  return new Intl.NumberFormat("en-US").format(bags * packSpecKg);
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

function ExportSlipModal({
  order,
  onClose,
  onSaved,
}: {
  order: WarehouseOrder;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [slip, setSlip] = useState<{
    carrier_name: string;
    vehicle_plate: string;
    driver_name: string;
    driver_identity_or_phone: string;
  } | null>(null);

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSlip({
      carrier_name: String(data.get("carrier_name") ?? ""),
      vehicle_plate: String(data.get("vehicle_plate") ?? ""),
      driver_name: String(data.get("driver_name") ?? ""),
      driver_identity_or_phone: String(data.get("driver_identity_or_phone") ?? ""),
    });
    setIsConfirmOpen(true);
  }

  async function confirmSave() {
    if (!slip) return;

    const result = await createWarehouseOrderGoodsIssue({
      id: order.id,
      warehouse_id: order.warehouse_id,
      ...slip,
    });
    if (!result.ok) {
      putFlash("error", result.message, 1500);
      return;
    }

    setIsConfirmOpen(false);
    putFlash("success", "Đã lập phiếu xuất kho", 1500);
    onSaved();
  }

  return (
    <>
      <Modal
        id="export-slip-modal"
        show
        title="Lập phiếu xuất kho giao hàng"
        subtitle={"Đơn hàng: " + order.code}
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
            <section>
              <h6 className="mb-3 text-base font-semibold">
                Thông tin điều độ phương tiện vận tải
              </h6>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SelectField
                  id="export-carrier"
                  name="carrier_name"
                  label={<RequiredLabel>Đơn vị / nhà vận chuyển</RequiredLabel>}
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    Chọn nhà vận chuyển
                  </option>
                  {MOCK_CARRIERS.map((carrier) => (
                    <option key={carrier.id} value={carrier.name}>
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
                  name="driver_identity_or_phone"
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
                    <col style={{ width: "22%" }} />
                    <col style={{ width: "32%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "18%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <TableHead>STT</TableHead>
                      <TableHead>Mã SKU</TableHead>
                      <TableHead>Tên sản phẩm</TableHead>
                      <TableHead>Quy cách</TableHead>
                      <TableHead>SL bao</TableHead>
                      <TableHead>Khối lượng (KG)</TableHead>
                    </tr>
                  </thead>
                  <tbody>
                    {order.lines.map((line, index) => (
                      <tr key={line.id}>
                        <td>{index + 1}</td>
                        <td>
                          {line.sales_sku_code}
                        </td>
                        <td>
                          {line.sku_name}
                        </td>
                        <td>{line.packaging_weight_kg ?? "—"} {line.unit ?? ""}</td>
                        <td className="is-num">{line.quantity}</td>
                        <td className="is-num">
                          {formatWeightKg(line.quantity, line.packaging_weight_kg ?? 0)} KG
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* <div className="rounded-b-xl bg-theme-primary-border py-3 pr-4 text-right text-sm font-semibold text-slate-900">
                  TỔNG CỘNG: {totalBags} Bao — {new Intl.NumberFormat("en-US").format(totalWeightKg)}{" "}
                  KG ({totalTons} Tấn)
                </div> */}
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
  const [selectedOrder, setSelectedOrder] = useState<WarehouseOrder | null>(null);
  const [search] = useState("");
  const [orders, setOrders] = useState<WarehouseOrder[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadAt, setReloadAt] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoadError(null);

    getWarehouseOrders({
      search: search.trim().replace("script", "") || "",
      status: 11,
      page,
      page_size: pageSize,
    }).then((result) => {
      if (!result.ok) {
        setLoadError(result.message);
        setOrders([]);
        return;
      }
      setOrders(result.data ?? []);
      setTotalPages(totalPagesFromMeta(result.meta, result.data?.length ?? 0, pageSize));
    }); 
  }, [search, page, pageSize, reloadAt]);
 

  return (
    <section className="section" id="production-export-section">
      <div className="section-container section-table mb-6 ">
        {loadError ? (
          <LoadError
            message={loadError}
            onRetry={() => {
              setLoadError(null);
              setReloadAt((value) => value + 1);
            }}
          />
        ) : (
          <>
            {orders.length === 0 ? (
              <EmptyData
                title="Không có đơn xuất kho"
                description="Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
              />
            ) : (
              <div className="overview-table-wrap">
                <div className="overview-table-inner">
                  <table className="overview-table min-w-[1400px]" id="export-orders-table">
                    <colgroup>
                      <col style={{ width: "26%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "14%" }} />
                      <col style={{ width: "14%" }} />
                      <col style={{ width: "8%" }} />
                      <col style={{ width: "8%" }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <TableHead icon="hero-clipboard-document-list">Mã đơn</TableHead>
                        <TableHead>Số lượng</TableHead>
                        <TableHead icon="hero-tag">Trạng thái</TableHead>
                        <TableHead icon="hero-building-storefront">Kho</TableHead>
                        <TableHead icon="hero-users">Đại lý</TableHead>
                        <TableHead icon="hero-calendar-days">Bắt đầu</TableHead>
                        <TableHead className="actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        return (
                          <Fragment key={order.id}>
                            <tr id={`export-order-row-${order.id}`} onClick={() => setSelectedOrder(order)}>
                              <td className="overview-table__code">{order.code}</td>
                              <td className="overview-table__muted">{order.packed_quantity}</td> 
                              <td>
                                <OrderStatusBadge status={order.status} />
                              </td>
                              <td>{order.warehouse_name}</td>
                              <td className="overview-table__muted">{order.agency_name}</td>
                              <td className="overview-table__muted">
                                {formatDateTimeVi(order.started_at || order.created_at)}
                              </td>
                              <td className="actions">
                                <button
                                  type="button"
                                  className="admin-actions__btn"
                                  aria-label="Lập phiếu xuất kho"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  <Icon name="hero-pencil-square" className="size-4" />
                                </button>
                              </td>
                            </tr> 
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

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
        <ExportSlipModal
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
