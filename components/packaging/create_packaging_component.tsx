"use client";

import { useState, type FormEvent } from "react";

import { Input, Modal } from "@/components/core_component";
import { FormSubmitButton } from "@/components/form-submit-button";
import { RequiredLabel, SelectField } from "@/components/form-fields";
import { PACKAGING_UNITS, UserStatus } from "@/lib/constants";
import { createPackaging, type CreatePackagingInput } from "@/lib/api/packaging";
import type { PackagingGroup } from "@/lib/api/types";
import { putFlash } from "@/lib/flash/flash";
import { PackagingGroupChecklist } from "./packaging_groups";

function readCreateForm(data: FormData): CreatePackagingInput | null {
  const text = (name: string) => String(data.get(name) ?? "").trim();
  const code = text("code");
  const name = text("name");
  const unit = text("unit");
  const note = text("note");
  const weight_kg = Number(data.get("weight_kg"));
  const group_ids = data
    .getAll("group_ids")
    .map((value) => Number(value))
    .filter((id) => Number.isFinite(id) && id > 0);

  if (!code || !name || !unit || !Number.isFinite(weight_kg)) return null;

  return {
    code,
    name,
    status: UserStatus.Active,
    unit: unit as CreatePackagingInput["unit"],
    group_ids,
    note: note || undefined,
    weight_kg,
  };
}

export function CreatePackagingComponent({
  packagingGroups,
  onClose,
  onCreated,
}: {
  packagingGroups: PackagingGroup[];
  onClose: () => void;
  onCreated?: () => void;
}) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [payload, setPayload] = useState<CreatePackagingInput | null>(null);

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formValues = readCreateForm(new FormData(event.currentTarget));
    if (!formValues) return;

    setPayload(formValues);
    setIsConfirmOpen(true);
  }

  async function confirmCreate() {
    if (!payload) return;

    const result = await createPackaging(payload);
    if (!result.ok) {
      setIsConfirmOpen(false);
      putFlash("error", result.message, 1500);
      return;
    }

    onClose();
    onCreated?.();
    putFlash("success", "Thêm bao bì thành công", 1500);
  }

  return (
    <>
      <Modal
        id="create-packaging-modal"
        show
        title="Thêm bao bì"
        closeable={!isConfirmOpen}
        width="2xl"
        onClose={onClose}
      >
        <form
          id="create-packaging-form"
          className="core_modal__form overflow-hidden"
          autoComplete="off"
          onSubmit={handleFormSubmit}
        >
          <div className="admin-user-form gap-4 overflow-y-auto flex-auto h-full">
            <Input
              id="create-packaging-code"
              name="code"
              label={<RequiredLabel>Mã bao bì</RequiredLabel>}
              placeholder="BBACXX25001TR"
              required
            />
            <Input
              id="create-packaging-name"
              name="name"
              label={<RequiredLabel>Tên bao bì</RequiredLabel>}
              placeholder="Bao Bạc Trắng"
              required
            />
            <SelectField
              id="create-packaging-unit"
              name="unit"
              label={<RequiredLabel>Đơn vị</RequiredLabel>}
              defaultValue="BAO"
              required
            >
              {PACKAGING_UNITS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </SelectField>
            <Input
              id="create-packaging-weight"
              name="weight_kg"
              type="number"
              step="0.001"
              min={0}
              label={<RequiredLabel>Định lượng (kg)</RequiredLabel>}
              placeholder="25"
              required
            />
            <div className="admin-user-form__full">
              <div className="core_field">
                <label className="core_label">Nhóm bao bì</label>
                <PackagingGroupChecklist groups={packagingGroups} />
              </div>
            </div>
            <div className="admin-user-form__full">
              <div className="core_field">
                <label htmlFor="create-packaging-note" className="core_label">
                  Ghi chú
                </label>
                <textarea
                  id="create-packaging-note"
                  name="note"
                  rows={3}
                  placeholder="Ghi chú (không bắt buộc)"
                  className="core_input core_input--textarea w-full"
                />
              </div>
            </div>
          </div>
          <div className="core_modal__actions">
            <button type="button" className="core_button core_button--secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="core_button core_button--primary">
              Xác nhận
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        id="create-packaging-confirm-modal"
        show={isConfirmOpen}
        title="Xác nhận thêm bao bì"
        width="md"
        className="core_modal--stacked"
        onClose={() => setIsConfirmOpen(false)}
      >
        <form className="core_modal__actions" action={confirmCreate}>
          <button
            type="button"
            className="core_button core_button--secondary"
            onClick={() => setIsConfirmOpen(false)}
          >
            Hủy
          </button>
          <FormSubmitButton>Xác nhận</FormSubmitButton>
        </form>
      </Modal>
    </>
  );
}
