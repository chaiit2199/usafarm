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
import { exportHandoverPdf } from "@/components/orders/handover_template";
import { OrderStatusBadge } from "@/components/status";
import { getWarehouseOrders, createWarehouseOrderGoodsIssue } from "@/lib/api/production";
import { totalPagesFromMeta } from "@/lib/api/pagination";
import type { WarehouseOrder } from "@/lib/api/types";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/lib/constants";
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
      warehouse_id: order.warehouses?.[0].warehouse_id ?? 0,
      ...slip,
    });

    if (!result.ok) {
      putFlash("error", result.message, 1500);
      return;
    }

    // const result = {
    //   data: {
    //     id: 5,
    //     code: "XK-20260914-0002",
    //     form_code: "02-VT",
    //     issued_at: "2026-09-14T04:31:01.002976Z",
    //     created_at: "2026-09-14T04:31:01.005851Z",
    //     created_by: 1,
    //     agency_name: "Công Ty Lam Agri",
    //     carrier_name: "Công ty vận tải B",
    //     driver_name: "12312",
    //     driver_identity_or_phone: "0373270196",
    //     vehicle_plate: "92M1-03920",
    //     warehouse_id: 9,
    //     warehouse_name: "Kho khu vực Cần Thơ",
    //     order_id: 15,
    //     order_code: "ORD-20260908072923-E54FF3",
    //     order_status: 12,
    //     total_quantity: 200,
    //     total_weight_kg: 10000,
    //     delivery_address: {
    //       id: 31,
    //       address: "Số 18 đường Trần Phú, Phường 1, TP. Vĩnh Long, Vĩnh Long",
    //     },
    //     handed_over_at: null,
    //     handed_over_by: null,
    //     handover_images: [],
    //     handover_note: null,
    //     lines: [
    //       {
    //         id: 1,
    //         sku_name: "Phân Bón DAP xanh miểng DAPEN2500",
    //         quantity: 20,
    //         packaging_weight_kg: 50,
    //         unit: "kg",
    //       },
    //       {
    //         id: 2,
    //         sku_name: "Phân Bón DAP xanh miểng DAPEN2500",
    //         quantity: 20,
    //         packaging_weight_kg: 50,
    //         unit: "kg",
    //       }, 
    //       {
    //         id: 3,
    //         sku_name: "Phân Bón DAP xanh miểng DAPEN2500",
    //         quantity: 20,
    //         packaging_weight_kg: 50,
    //         unit: "kg",
    //       },
    //       {
    //         id: 4,
    //         sku_name: "Phân Bón DAP xanh miểng DAPEN2500",
    //         quantity: 20,
    //         packaging_weight_kg: 50,
    //         unit: "kg",
    //       },
    //       {
    //         id: 5,
    //         sku_name: "Phân Bón DAP xanh miểng DAPEN2500",
    //         quantity: 20,
    //         packaging_weight_kg: 50,
    //         unit: "kg",
    //       },

    //     ],
    //   },
    // };

    try {
      await exportHandoverPdf(result.data);
      setIsConfirmOpen(false);
      putFlash("success", "Đã lập phiếu xuất kho", 1500);
      onSaved();
    } catch (error) {
      putFlash(
        "error",
        error instanceof Error ? error.message : "Không thể xuất phiếu xuất kho",
        1500,
      );
    }
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
              <div className="overview-table-inner min-h-auto">
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
                    {(order.lines ?? []).map((line, index) => (
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
  const [isLoading, setIsLoading] = useState(true);
  const [reloadAt, setReloadAt] = useState(0);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoadError(null);
    setIsLoading(true);

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
    }).finally(() => {
      setIsLoading(false);
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
            {isLoading ? null : orders.length === 0 ? (
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
                              <td>{order.warehouses?.[0].warehouse_name ?? ""}</td>
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

            {isLoading ? null : (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(DEFAULT_PAGE);
              }}
            />
            )}
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
