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
import { RequiredLabel, RecordStatusSelectField } from "@/components/form-fields";
import { Icon } from "@/components/icon";
import { RecordStatusBadge } from "@/components/status";
import { readFormStatus, UserStatus } from "@/lib/constants";
import { subscribeHeaderAction } from "@/lib/dashboard/header-actions";
import { formatDateVi } from "@/lib/format/date";
import { MOCK_PROMOTIONS } from "@/lib/mock/promotions";

type CreatePromotionPayload = {
  code: string;
  name: string;
  status: number;
  startsAt: string;
  endsAt: string;
};

function CreatePromotionModal({ onClose }: { onClose: () => void }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [payload, setPayload] = useState<CreatePromotionPayload | null>(null);

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const code = String(data.code ?? "").trim();
    const name = String(data.name ?? "").trim();
    const startsAt = String(data.starts_at ?? "").trim();
    const endsAt = String(data.ends_at ?? "").trim();
    const status = readFormStatus(new FormData(event.currentTarget)) ?? UserStatus.Active;

    if (!code || !name || !startsAt || !endsAt) return;
    if (endsAt < startsAt) return;

    setPayload({ code, name, status, startsAt, endsAt });
    setIsConfirmOpen(true);
  }

  function confirmCreate() {
    console.log({
      ...payload,
      createdAt: new Date().toISOString(),
    });
    setIsConfirmOpen(false);
    onClose();
  }

  return (
    <>
      <Modal
        id="create-promotion-modal"
        show
        title="Thêm khuyến mãi"
        closeable={!isConfirmOpen}
        width="lg"
        onClose={onClose}
      >
        <form
          id="create-promotion-form"
          className="core_modal__form overflow-hidden -mx-4"
          autoComplete="off"
          onSubmit={handleFormSubmit}
        >
          <div className="admin-user-form gap-4 overflow-y-auto flex-auto h-full px-4">
            <Input
              id="create-promotion-code"
              name="code"
              label={<RequiredLabel>Mã khuyến mãi</RequiredLabel>}
              placeholder="KM006"
              required
            />
            <Input
              id="create-promotion-name"
              name="name"
              label={<RequiredLabel>Tên khuyến mãi</RequiredLabel>}
              placeholder="Ví dụ: Mua 10 tặng 1 NPK"
              required
            />
            <Input
              id="create-promotion-starts-at"
              name="starts_at"
              type="date"
              label={<RequiredLabel>Ngày hiệu lực</RequiredLabel>}
              required
            />
            <Input
              id="create-promotion-ends-at"
              name="ends_at"
              type="date"
              label={<RequiredLabel>Ngày hết hạn</RequiredLabel>}
              required
            />
            <div className="col-span-2">
              <RecordStatusSelectField
                id="create-promotion-status"
                label={<RequiredLabel>Trạng thái</RequiredLabel>}
              />
            </div>
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
        id="create-promotion-confirm-modal"
        show={isConfirmOpen}
        title="Xác nhận thêm khuyến mãi"
        width="md"
        className="core_modal--stacked"
        onClose={() => setIsConfirmOpen(false)}
      >
        <form
          className="core_modal__form"
          onSubmit={(event) => {
            event.preventDefault();
            confirmCreate();
          }}
        >
          <p className="text-sm text-theme-muted">
            Bạn có chắc muốn thêm khuyến mãi{" "}
            <span className="font-semibold text-slate-900">{payload?.name}</span> (mã{" "}
            <span className="font-semibold text-slate-900">{payload?.code}</span>)?
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

export function PromotionComponent() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    return subscribeHeaderAction("/promotion", (detail) => {
      if (detail.action === "create") setIsCreateOpen(true);
    });
  }, []);

  const totalPages = Math.max(1, Math.ceil(MOCK_PROMOTIONS.length / pageSize));
  const pageItems = useMemo(
    () => MOCK_PROMOTIONS.slice((page - 1) * pageSize, page * pageSize),
    [page, pageSize],
  );

  return (
    <section className="section" id="promotion-section">
      <div className="section-container section-table mb-6 ">
        {MOCK_PROMOTIONS.length === 0 ? (
          <EmptyData title="Không có khuyến mãi" description="Chưa có chương trình khuyến mãi nào được tạo." />
        ) : (
          <div className="overview-table-wrap">
            <div className="overview-table-inner">
              <table className="overview-table min-w-[1100px]" id="promotion-table">
                <colgroup>
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "28%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "4%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <TableHead></TableHead>
                    <TableHead icon="hero-hashtag">Mã</TableHead>
                    <TableHead icon="hero-ticket">Tên khuyến mãi</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead icon="hero-calendar-days">Ngày tạo</TableHead>
                    <TableHead icon="hero-calendar-days">Ngày hiệu lực</TableHead>
                    <TableHead icon="hero-calendar-days">Ngày hết hạn</TableHead>
                    <TableHead></TableHead>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((item, index) => (
                      <tr key={item.id} id={`promotion-row-${item.code}`}>
                        <td className="overview-table__muted">
                          {(page - 1) * pageSize + index + 1}
                        </td>
                        <td className="overview-table__code">{item.code}</td>
                        <td className="font-medium text-slate-900">{item.name}</td>
                        <td>
                          <RecordStatusBadge status={item.status} />
                        </td>
                        <td className="overview-table__muted">{formatDateVi(item.createdAt)}</td>
                        <td className="overview-table__muted">{formatDateVi(item.startsAt)}</td>
                        <td className="overview-table__muted">{formatDateVi(item.endsAt)}</td>
                        <td className="actions">
                          <button type="button" className="admin-actions__btn" aria-label="Chỉnh sửa">
                            <Icon name="hero-pencil-square" className="size-5" />
                          </button>
                        </td>
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

      {isCreateOpen ? <CreatePromotionModal onClose={() => setIsCreateOpen(false)} /> : null}
    </section>
  );
}
