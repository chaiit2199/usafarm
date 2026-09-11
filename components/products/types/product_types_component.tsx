"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import {
  EmptyData,
  Input,
  Modal,
  Pagination,
  TableHead,
} from "@/components/core_component";
import { FormSubmitButton } from "@/components/form-submit-button";
import { RequiredLabel, SelectField } from "@/components/form-fields";
import { subscribeHeaderAction } from "@/lib/dashboard/header-actions";
import { MOCK_PRODUCT_GROUPS } from "@/lib/mock/product-groups";
import { MOCK_PRODUCT_TYPES } from "@/lib/mock/product-types";

type CreateProductTypePayload = {
  groupCode: string;
  name: string;
  typeId: string;
  skuBase: string;
};

function buildSkuBase(groupCode: string, typeId: string) {
  return `${groupCode}${typeId}`.trim();
}

function CreateProductTypeModal({ onClose }: { onClose: () => void }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [payload, setPayload] = useState<CreateProductTypePayload | null>(null);
  const [groupCode, setGroupCode] = useState("");
  const [typeId, setTypeId] = useState("");

  const skuPreview = groupCode ? buildSkuBase(groupCode, typeId.trim().toUpperCase()) : "";

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const nextGroupCode = String(data.group_code ?? "").trim();
    const name = String(data.name ?? "").trim();
    const nextTypeId = String(data.type_id ?? "").trim().toUpperCase();
    if (!nextGroupCode || !name || !nextTypeId) return;

    setPayload({
      groupCode: nextGroupCode,
      name,
      typeId: nextTypeId,
      skuBase: buildSkuBase(nextGroupCode, nextTypeId),
    });
    setIsConfirmOpen(true);
  }

  function confirmCreate() {
    setIsConfirmOpen(false);
    onClose();
  }

  return (
    <>
      <Modal
        id="create-product-type-modal"
        show
        title="Thêm loại hàng"
        closeable={!isConfirmOpen}
        width="lg"
        onClose={onClose}
      >
        <form
          id="create-product-type-form"
          className="core_modal__form overflow-hidden -mx-4"
          autoComplete="off"
          onSubmit={handleFormSubmit}
        >
          <div className="admin-user-form gap-4 overflow-y-auto flex-auto h-full px-4">
            <SelectField
              id="create-product-type-group"
              name="group_code"
              label={<RequiredLabel>Nhóm cha</RequiredLabel>}
              value={groupCode}
              required
              onChange={(event) => setGroupCode(event.target.value)}
            >
              <option value="">Chọn nhóm cha</option>
              {MOCK_PRODUCT_GROUPS.map((group) => (
                <option key={group.id} value={group.code}>
                  {group.code} — {group.name}
                </option>
              ))}
            </SelectField>

            <Input
              id="create-product-type-name"
              name="name"
              label={<RequiredLabel>Tên loại hàng / tên công thức</RequiredLabel>}
              placeholder="Ví dụ: 20-20-15, Đen, Dạng bột"
              required
            />

            <Input
              id="create-product-type-id"
              name="type_id"
              label={
                <RequiredLabel>
                  ID loại hàng (mã viết liền — dùng ghép đuôi SKU phân đoạn 1)
                </RequiredLabel>
              }
              placeholder="VÍ DỤ: 202015, D, BOT"
              value={typeId}
              required
              onChange={(event) => setTypeId(event.target.value)}
            />

            {skuPreview ? (
              <p className="text-sm text-theme-muted mb-0">
                Mã ghép SKU gốc:{" "}
                <span className="font-semibold text-slate-900">{skuPreview}</span>
              </p>
            ) : null}
          </div>

          <div className="core_modal__actions px-4">
            <button type="button" className="core_button core_button--secondary" onClick={onClose}>
              Hủy
            </button>
            <FormSubmitButton>Tạo mới</FormSubmitButton>
          </div>
        </form>
      </Modal>

      <Modal
        id="create-product-type-confirm-modal"
        show={isConfirmOpen}
        title="Xác nhận thêm loại hàng"
        width="md"
        className="core_modal--stacked"
        onClose={() => setIsConfirmOpen(false)}
      >
        <form className="core_modal__form" action={confirmCreate}>
          <p className="text-sm text-theme-muted">
            Bạn có chắc muốn thêm loại hàng{" "}
            <span className="font-semibold text-slate-900">{payload?.name}</span> thuộc nhóm{" "}
            <span className="font-semibold text-slate-900">{payload?.groupCode}</span> với mã SKU{" "}
            <span className="font-semibold text-slate-900">{payload?.skuBase}</span>?
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

export function ProductTypesComponent() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    return subscribeHeaderAction("/products/types", (detail) => {
      if (detail.action === "create") setIsCreateOpen(true);
    });
  }, []);

  const totalPages = Math.max(1, Math.ceil(MOCK_PRODUCT_TYPES.length / pageSize));
  const pageItems = useMemo(
    () => MOCK_PRODUCT_TYPES.slice((page - 1) * pageSize, page * pageSize),
    [page, pageSize],
  );

  return (
    <section className="section" id="product-types-section">
      <div className="section-container section-table mb-6 ">
        {MOCK_PRODUCT_TYPES.length === 0 ? (
          <EmptyData
            title="Không có loại hàng"
            description="Chưa có loại hàng nào được tạo."
          />
        ) : (
          <div className="overview-table-wrap">
            <div className="overview-table-inner">
              <table className="overview-table min-w-full" id="product-types-table">
                <colgroup>
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "28%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "30%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <TableHead>STT</TableHead>
                    <TableHead icon="hero-rectangle-stack">Nhóm cha</TableHead>
                    <TableHead icon="hero-beaker">Tên loại hàng / công thức</TableHead>
                    <TableHead icon="hero-hashtag">ID loại hàng</TableHead>
                    <TableHead icon="hero-tag">Mã ghép SKU gốc</TableHead>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((item, index) => (
                    <tr key={item.id} id={`product-type-row-${item.id}`}>
                      <td className="overview-table__muted">
                        {(page - 1) * pageSize + index + 1}
                      </td>
                      <td>
                        <span className="status status--active">{item.groupCode}</span>
                      </td>
                      <td className="font-medium text-slate-900">{item.name}</td>
                      <td className="overview-table__muted">{item.typeId || "—"}</td>
                      <td className="overview-table__code">{item.skuBase}</td>
                    </tr>
                  ))}
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
      </div>

      {isCreateOpen ? <CreateProductTypeModal onClose={() => setIsCreateOpen(false)} /> : null}
    </section>
  );
}
