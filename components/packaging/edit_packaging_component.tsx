"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import type { Packaging, PackagingGroup } from "@/lib/api/types";
import { Icon } from "@/components/icon";
import { Tab } from "@/components/tab";
import { Input, Modal, EmptyData, Pagination, TableHead, TableLoading } from "@/components/core_component";
import { LoadError } from "@/components/load_error";
import { FormSubmitButton } from "@/components/form-submit-button";
import { RequiredLabel, SelectField } from "@/components/form-fields";
import {
  PACKAGING_UNITS,
  USER_STATUS_TABS,
  UserStatus,
  type UserStatusTabValue,
  recordStatusMeta,
} from "@/lib/constants";
import {
  filterPackagings,
  getPackaging,
  updatePackaging,
  type UpdatePackagingInput,
} from "@/lib/api/packaging";
import { totalPagesFromMeta } from "@/lib/api/pagination";
import { putFlash } from "@/lib/flash/flash";
import {
  PackagingGroupChecklist,
  PackagingGroupTags,
  PackagingImageGallery,
  PackagingThumb,
} from "./packaging_groups";

function formatWeight(weight: string | number | undefined) {
  if (weight == null || weight === "") return "—";
  const value = typeof weight === "number" ? weight : Number(weight);
  if (!Number.isFinite(value)) return String(weight);
  return `${value} kg`;
}

function unitLabel(unit: string) {
  return PACKAGING_UNITS.find((item) => item.value === unit)?.label ?? unit;
}

function readUpdateForm(
  data: FormData,
  id: number,
  status: number,
): UpdatePackagingInput | null {
  const text = (name: string) => String(data.get(name) ?? "").trim();
  const code = text("code");
  const name = text("name");
  const unit = text("unit");
  const note = text("note");
  const weight_kg = Number(data.get("weight_kg"));
  const group_ids = data
    .getAll("group_ids")
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (!code || !name || !unit || !Number.isFinite(weight_kg)) return null;

  return {
    id,
    code,
    name,
    status,
    unit: unit as UpdatePackagingInput["unit"],
    group_ids,
    note: note || undefined,
    weight_kg,
  };
}

export function EditPackagingComponent({
  search,
  reloadAt: externalReloadAt = 0,
  initialPackagings,
  initialTotalPages = 1,
  packagingGroups,
}: {
  search: string;
  reloadAt?: number;
  initialPackagings: Packaging[];
  initialTotalPages?: number;
  packagingGroups: PackagingGroup[];
}) {
  const [selectedPackaging, setSelectedPackaging] = useState<Packaging | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [payload, setPayload] = useState<UpdatePackagingInput | null>(null);
  const [reloadAt, setReloadAt] = useState(0);
  const [activeTab, setActiveTab] = useState<UserStatusTabValue>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [packagings, setPackagings] = useState<Packaging[] | null>(initialPackagings);
  const [loadError, setLoadError] = useState<string | null>(null);
  const skipFirstFetch = useRef(true);
  const canEdit = selectedPackaging?.status === UserStatus.Active;

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (skipFirstFetch.current) {
      skipFirstFetch.current = false;
      return;
    }

    let cancelled = false;

    filterPackagings({
      search: search.trim() || undefined,
      status: activeTab === "all" ? "ALL" : Number(activeTab),
      page,
      page_size: pageSize,
    }).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setLoadError(result.message);
        setPackagings([]);
        return;
      }

      setLoadError(null);
      setPackagings(result.data ?? []);
      setTotalPages(totalPagesFromMeta(result.meta, result.data?.length ?? 0, pageSize));
    });

    return () => {
      cancelled = true;
    };
  }, [search, activeTab, page, pageSize, reloadAt, externalReloadAt]);

  async function openEditForm(packaging: Packaging) {
    setIsDetailLoading(true);
    setIsFormOpen(true);
    setSelectedPackaging(packaging);
    setPayload(null);
    setIsConfirmOpen(false);

    const result = await getPackaging(packaging.id);
    setIsDetailLoading(false);

    if (!result.ok) {
      putFlash("error", result.message, 1500);
      setIsFormOpen(false);
      setSelectedPackaging(null);
      return;
    }

    setSelectedPackaging(result.data);
  }

  function resetForm() {
    setPayload(null);
    setIsConfirmOpen(false);
    setIsFormOpen(false);
    setSelectedPackaging(null);
    setIsDetailLoading(false);
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPackaging || selectedPackaging.status !== UserStatus.Active) return;
    const formValues = readUpdateForm(
      new FormData(event.currentTarget),
      selectedPackaging.id,
      selectedPackaging.status,
    );
    if (!formValues) return;
    setPayload(formValues);
    setIsConfirmOpen(true);
  }

  async function handleConfirm() {
    if (!payload) return;

    const result = await updatePackaging(payload);
    if (!result.ok) {
      setIsConfirmOpen(false);
      putFlash("error", result.message, 1500);
      return;
    }

    resetForm();
    setReloadAt((value) => value + 1);
    putFlash("success", "Cập nhật bao bì thành công", 1500);
  }

  return (
    <>
      <section className="section" id="admin-packaging-section">
        <div className="section-table mb-6">
          {loadError ? (
            <LoadError
              message={loadError}
              onRetry={() => {
                setLoadError(null);
                setPackagings(null);
                setReloadAt((value) => value + 1);
              }}
            />
          ) : (
            <>
              <Tab
                tabs={USER_STATUS_TABS}
                activeTab={activeTab}
                onTabClick={(tab) => {
                  setActiveTab(tab.value);
                  setPage(1);
                }}
              />

              {packagings === null ? (
                <TableLoading />
              ) : packagings.length === 0 ? (
                <EmptyData
                  title="Không có bao bì"
                  description="Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
                />
              ) : (
                <div className="overview-table-wrap">
                  <div className="overview-table-inner">
                    <table className="overview-table min-w-[1400px]" id="packagings-table">
                      <colgroup>
                        <col style={{ width: "8%" }} />
                        <col style={{ width: "14%" }} />
                        <col style={{ width: "18%" }} />
                        <col style={{ width: "24%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "12%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "4%" }} />
                      </colgroup>
                      <thead>
                        <tr>
                          <TableHead></TableHead>
                          <TableHead icon="hero-hashtag">Mã bao bì</TableHead>
                          <TableHead icon="hero-archive-box">Tên bao bì</TableHead>
                          <TableHead icon="hero-tag">Nhóm</TableHead>
                          <TableHead icon="hero-cube">Định lượng</TableHead>
                          <TableHead icon="hero-tag">Trạng thái</TableHead>
                          <TableHead icon="hero-building-office-2">Đơn vị</TableHead>
                          <th className="actions" />
                        </tr>
                      </thead>
                      <tbody>
                        {packagings.map((packaging) => {
                          const meta = recordStatusMeta(packaging.status);

                          return (
                            <tr
                              key={packaging.id}
                              id={`packaging-row-${packaging.id}`}
                              onClick={() => openEditForm(packaging)}
                              className="cursor-pointer"
                            >
                              <td>
                                <PackagingThumb images={packaging.images} alt={packaging.name} />
                              </td>
                              <td className="overview-table__muted">{packaging.code}</td>
                              <td>{packaging.name}</td>
                              <td>
                                <PackagingGroupTags groups={packaging.groups ?? []} />
                              </td>
                              <td className="overview-table__muted">{formatWeight(packaging.weight_kg)}</td>
                              <td>
                                <span className={`status status--${meta.kind}`}>{meta.label}</span>
                              </td>
                              <td className="overview-table__muted">{unitLabel(packaging.unit)}</td>
                              <td className="actions">
                                <div className="admin-actions">
                                  <button type="button" className="admin-actions__btn" aria-label="Chỉnh sửa">
                                    <Icon name="hero-pencil-square" className="size-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
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
      </section>

      <Modal
        id="update-packaging-modal"
        show={isFormOpen && selectedPackaging !== null}
        title="Chi tiết bao bì"
        closeable={!isConfirmOpen && !isDetailLoading}
        width="2xl"
        onClose={resetForm}
      >
        {selectedPackaging && (
          <form
            key={`${selectedPackaging.id}-${selectedPackaging.groups?.map((g) => g.id).join("-") ?? ""}`}
            id="update-packaging-form"
            className="core_modal__form overflow-hidden"
            autoComplete="off"
            onSubmit={handleFormSubmit}
          >
            {isDetailLoading ? (
              <div className="admin-user-form gap-4 overflow-y-auto flex-auto h-full">
                <p className="overview-table__muted">Đang tải chi tiết…</p>
              </div>
            ) : (
              <div className="admin-user-form gap-4 overflow-y-auto flex-auto h-full">
                <div className="admin-user-form__full">
                  <div className="core_field">
                    <label className="core_label">Hình ảnh sản phẩm</label>
                    <PackagingImageGallery images={selectedPackaging.images} alt={selectedPackaging.name} />
                  </div>
                </div>
                <Input
                  id="update-packaging-code"
                  name="code"
                  label={<RequiredLabel>Mã bao bì</RequiredLabel>}
                  placeholder="BBACXX25001TR"
                  defaultValue={selectedPackaging.code}
                  readOnly={!canEdit}
                  required={canEdit}
                />
                <Input
                  id="update-packaging-name"
                  name="name"
                  label={<RequiredLabel>Tên bao bì</RequiredLabel>}
                  placeholder="Bao Bạc Trắng"
                  defaultValue={selectedPackaging.name}
                  readOnly={!canEdit}
                  required={canEdit}
                />
                <SelectField
                  id="update-packaging-unit"
                  name="unit"
                  label={<RequiredLabel>Đơn vị</RequiredLabel>}
                  defaultValue={selectedPackaging.unit}
                  required={canEdit}
                  disabled={!canEdit}
                >
                  {PACKAGING_UNITS.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </SelectField>
                <Input
                  id="update-packaging-weight"
                  name="weight_kg"
                  type="number"
                  step="0.001"
                  min={0}
                  label={<RequiredLabel>Định lượng (kg)</RequiredLabel>}
                  defaultValue={String(Number(selectedPackaging.weight_kg) || selectedPackaging.weight_kg)}
                  readOnly={!canEdit}
                  required={canEdit}
                />
                <div className="admin-user-form__full">
                  <div className="core_field">
                    <label className="core_label">Nhóm bao bì</label>
                    <PackagingGroupChecklist
                      groups={packagingGroups}
                      selectedIds={(selectedPackaging.groups ?? []).map((group) => group.id)}
                      readOnly={!canEdit}
                    />
                  </div>
                </div>
                <div className="admin-user-form__full">
                  <div className="core_field">
                    <label htmlFor="update-packaging-note" className="core_label">
                      Ghi chú
                    </label>
                    <textarea
                      id="update-packaging-note"
                      name="note"
                      rows={3}
                      readOnly={!canEdit}
                      defaultValue={selectedPackaging.note ?? ""}
                      placeholder="Ghi chú (không bắt buộc)"
                      className="core_input core_input--textarea w-full"
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="core_modal__actions">
              <button type="button" className="core_button core_button--secondary" onClick={resetForm}>
                Hủy
              </button>
              {canEdit && !isDetailLoading && (
                <button type="submit" className="core_button core_button--primary">
                  Xác nhận
                </button>
              )}
            </div>
          </form>
        )}
      </Modal>

      <Modal
        id="update-packaging-confirm-modal"
        show={isConfirmOpen}
        title="Xác nhận cập nhật bao bì"
        width="md"
        className="core_modal--stacked"
        onClose={() => {
          setIsConfirmOpen(false);
          setPayload(null);
        }}
      >
        <form className="core_modal__actions" action={handleConfirm}>
          <button
            type="button"
            className="core_button core_button--secondary"
            onClick={() => {
              setIsConfirmOpen(false);
              setPayload(null);
            }}
          >
            Hủy
          </button>
          <FormSubmitButton>Xác nhận</FormSubmitButton>
        </form>
      </Modal>
    </>
  );
}
