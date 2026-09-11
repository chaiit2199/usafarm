"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import {
  Input,
  Modal,
  Pagination,
  TableHead,
} from "@/components/core_component";
import { FormSubmitButton } from "@/components/form-submit-button";
import { RequiredLabel } from "@/components/form-fields";
import { subscribeHeaderAction } from "@/lib/dashboard/header-actions";

type Warehouse = {
  id: number;
  code: string;
  name: string;
  address: string;
  manager: string;
};

const MOCK_WAREHOUSES: Warehouse[] = [
  {
    id: 1,
    code: "K01",
    name: "Kho số 1 - Tây Ninh",
    address: "Nhà số 20, Tổ 10, Ấp 5, Xã Lương Hòa, Tỉnh Tây Ninh",
    manager: "Nguyễn Văn A",
  },
  {
    id: 2,
    code: "K02",
    name: "Kho số 2 - Long An",
    address: "Khu công nghiệp Đức Hòa, Tỉnh Long An",
    manager: "Trần Thị B",
  },
  {
    id: 3,
    code: "K03",
    name: "Kho số 3 - Bình Dương",
    address: "Cụm CN Tân Bình, Tỉnh Bình Dương",
    manager: "Lê Văn C",
  },
  {
    id: 4,
    code: "K04",
    name: "Kho số 4 - Đồng Nai",
    address: "Khu công nghiệp Nhơn Trạch, Tỉnh Đồng Nai",
    manager: "Phạm Thị D",
  },
  {
    id: 5,
    code: "K05",
    name: "Kho số 5 - Bến Tre",
    address: "Cụm CN An Hiệp, Tỉnh Bến Tre",
    manager: "Võ Thị E",
  },
  {
    id: 6,
    code: "K06",
    name: "Kho số 6 - Cần Thơ",
    address: "KCN Trà Nóc, TP. Cần Thơ",
    manager: "Đặng Văn F",
  },
  {
    id: 7,
    code: "K07",
    name: "Kho số 7 - An Giang",
    address: "Cụm CN Bình Hòa, Tỉnh An Giang",
    manager: "Bùi Thị G",
  },
  {
    id: 8,
    code: "K08",
    name: "Kho số 8 - Kiên Giang",
    address: "KCN Thạnh Lộc, Tỉnh Kiên Giang",
    manager: "Ngô Văn H",
  },
  {
    id: 9,
    code: "K09",
    name: "Kho số 9 - Cà Mau",
    address: "Cụm CN Hòa Trung, Tỉnh Cà Mau",
    manager: "Trịnh Thị I",
  },
];

function WarehouseCodeBadge({ code }: { code: string }) {
  return <span className="status status--active">{code}</span>;
}

function CreateWarehouseModal({ onClose }: { onClose: () => void }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [payload, setPayload] = useState<Record<string, string> | null>(null);

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const values = {
      code: String(data.code ?? "").trim(),
      name: String(data.name ?? "").trim(),
      address: String(data.address ?? "").trim(),
      manager: String(data.manager ?? "").trim(),
    };
    if (!values.code || !values.name || !values.address || !values.manager) return;

    setPayload(values);
    setIsConfirmOpen(true);
  }

  function confirmCreate() {
    setIsConfirmOpen(false);
    onClose();
  }

  return (
    <>
      <Modal
        id="create-warehouse-modal"
        show
        title="Thêm kho hàng"
        closeable={!isConfirmOpen}
        width="lg"
        onClose={onClose}
      >
        <form
          id="create-warehouse-form"
          className="core_modal__form overflow-hidden -mx-4"
          autoComplete="off"
          onSubmit={handleFormSubmit}
        >
          <div className="admin-user-form gap-4 overflow-y-auto flex-auto h-full px-4">
            <Input
              id="create-warehouse-code"
              name="code"
              label={<RequiredLabel>Mã kho</RequiredLabel>}
              placeholder="K10"
              required
            />
            <Input
              id="create-warehouse-name"
              name="name"
              label={<RequiredLabel>Tên kho hàng</RequiredLabel>}
              placeholder="Kho số 10 - ..."
              required
            />
            <Input
              id="create-warehouse-address"
              name="address"
              label={<RequiredLabel>Địa chỉ vật lý</RequiredLabel>}
              placeholder="Nhập địa chỉ kho"
              required
            />
            <Input
              id="create-warehouse-manager"
              name="manager"
              label={<RequiredLabel>Thủ kho phụ trách</RequiredLabel>}
              placeholder="Họ và tên thủ kho"
              required
            />
          </div>
          <div className="core_modal__actions px-4">
            <button type="button" className="core_button core_button--secondary" onClick={onClose}>
              Hủy
            </button>
            <FormSubmitButton>Lưu</FormSubmitButton>
          </div>
        </form>
      </Modal>

      <Modal
        id="create-warehouse-confirm-modal"
        show={isConfirmOpen}
        title="Xác nhận thêm kho hàng"
        width="md"
        className="core_modal--stacked"
        onClose={() => setIsConfirmOpen(false)}
      >
        <form className="core_modal__form" action={confirmCreate}>
          <p className="text-sm text-theme-muted">
            Bạn có chắc muốn thêm kho{" "}
            <span className="font-semibold text-slate-900">{payload?.code}</span>?
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

export function WarehousesComponent() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    return subscribeHeaderAction("/warehouse", (detail) => {
      if (detail.action === "create") setIsCreateOpen(true);
      if (detail.action === "search") {
        setSearch(detail.query ?? "");
        setPage(1);
      }
    });
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return MOCK_WAREHOUSES;
    return MOCK_WAREHOUSES.filter((warehouse) =>
      [warehouse.code, warehouse.name, warehouse.address, warehouse.manager]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section className="section" id="warehouse-list-section">
      <div className="section-container section-table mb-6 ">
        <div className="overview-table-wrap">
          <div className="overview-table-inner">
            <table className="overview-table min-w-full" id="warehouses-table">
              <colgroup>
                <col style={{ width: "12%" }} />
                <col style={{ width: "24%" }} />
                <col style={{ width: "44%" }} />
                <col style={{ width: "20%" }} />
              </colgroup>
              <thead>
                <tr>
                  <TableHead icon="hero-hashtag">Mã kho</TableHead>
                  <TableHead icon="hero-inbox-stack">Tên kho hàng</TableHead>
                  <TableHead icon="hero-map-pin">Địa chỉ vật lý</TableHead>
                  <TableHead icon="hero-users">Thủ kho phụ trách</TableHead>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((warehouse) => (
                  <tr key={warehouse.id} id={`warehouse-row-${warehouse.id}`}>
                    <td>
                      <WarehouseCodeBadge code={warehouse.code} />
                    </td>
                    <td className="font-medium text-slate-900">{warehouse.name}</td>
                    <td className="overview-table__muted">{warehouse.address}</td>
                    <td>{warehouse.manager}</td>
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

      {isCreateOpen && <CreateWarehouseModal onClose={() => setIsCreateOpen(false)} />}
    </section>
  );
}
