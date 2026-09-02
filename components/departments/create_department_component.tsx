"use client";

import { useState, type FormEvent } from "react";

import { Input, Modal } from "@/components/core_component";
import { FormSubmitButton } from "@/components/form-submit-button";
import { RequiredLabel, RecordStatusSelectField } from "@/components/form-fields";
import { readFormStatus, UserStatus } from "@/lib/constants";
import { createDepartment, type CreateDepartmentInput } from "@/lib/api/departments";
import { putFlash } from "@/lib/flash/flash";

function readCreateForm(data: FormData): CreateDepartmentInput | null {
  const text = (name: string) => String(data.get(name) ?? "").trim();
  const code = text("code");
  const name = text("name");

  if (!code || !name) return null;

  const formValues: CreateDepartmentInput = { code, name };

  return formValues;
}

export function CreateDepartmentComponent({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated?: () => void;
}) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [payload, setPayload] = useState<CreateDepartmentInput | null>(null);

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formValues = readCreateForm(new FormData(event.currentTarget));
    if (!formValues) return;

    setPayload(formValues);
    setIsConfirmOpen(true);
  }

  async function confirmCreate() {
    if (!payload) return;

    const result = await createDepartment(payload);

    if (!result.ok) {
      setIsConfirmOpen(false);
      putFlash("error", result.message, 1500);
      return;
    }

    onClose();
    onCreated?.();
    putFlash("success", "Thêm phòng ban thành công", 1500);
  }

  return (
    <>
      <Modal
        id="create-department-modal"
        show
        title="Thêm phòng ban"
        closeable={!isConfirmOpen}
        width="md"
        onClose={onClose}
      >
        <form
          id="create-department-form"
          className="core_modal__form overflow-hidden"
          autoComplete="off"
          onSubmit={handleFormSubmit}
        >
          <div className="admin-user-form gap-4 overflow-y-auto flex-auto h-full">
            <Input
              id="create-department-code"
              name="code"
              label={<RequiredLabel>Mã phòng ban</RequiredLabel>}
              placeholder="SALES"
              required
            />
            <Input
              id="create-department-name"
              name="name"
              label={<RequiredLabel>Tên phòng ban</RequiredLabel>}
              placeholder="Phòng kinh doanh"
              required
            /> 
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
        id="create-department-confirm-modal"
        show={isConfirmOpen}
        title="Xác nhận thêm phòng ban"
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
