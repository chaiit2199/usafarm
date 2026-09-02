"use client";

import { useState, type FormEvent } from "react";

import type { Department } from "@/lib/api/me";
import { Input, Modal } from "@/components/core_component";
import { readFormStatus } from "@/lib/constants";
import { FormSubmitButton } from "@/components/form-submit-button";
import { RequiredLabel, SelectField } from "@/components/form-fields";
import { createUser, type CreateUserInput } from "@/lib/api/users";
import { PASSWORD_MIN_LENGTH } from "@/lib/auth/password";
import { putFlash } from "@/lib/flash/flash";

function readCreateForm(data: FormData): CreateUserInput | null {
  const text = (name: string) => String(data.get(name) ?? "").trim();
  const username = text("username");
  const password = text("password");
  const fullName = text("full_name");

  if (!username || !password || !fullName) return null;

  const formValues: CreateUserInput = {
    username,
    password,
    full_name: fullName,
  };
  const phone = text("phone");
  const email = text("email");
  const address = text("address");
  const status = readFormStatus(data);
  const roleId = Number(data.get("role_id"));
  const departmentId = Number(data.get("department_id"));

  if (phone) formValues.phone = phone;
  if (email) formValues.email = email;
  if (address) formValues.address = address;
  if (status !== undefined) formValues.status = status;
  if (Number.isFinite(roleId) && roleId > 0) formValues.role_id = roleId;
  if (Number.isFinite(departmentId) && departmentId > 0) formValues.department_id = departmentId;

  return formValues;
}

export function CreateUserComponent({
  departments,
  onClose,
}: {
  departments: Department[];
  onClose: () => void;
}) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [payload, setPayload] = useState<CreateUserInput | null>(null);

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formValues = readCreateForm(new FormData(event.currentTarget));
    if (!formValues) return;

    setPayload(formValues);
    setIsConfirmOpen(true);
  }

  async function confirmCreate() {
    if (!payload) return;

    const result = await createUser(payload);

    if (!result.ok) {
      setIsConfirmOpen(false);
      putFlash("error", result.message, 1500);
      return;
    }

    onClose();
    putFlash("success", "Thêm nhân viên thành công", 1500);
  }

  return (
    <>
      <Modal
        id="create-user-modal"
        show
        title="Thêm nhân viên"
        closeable={!isConfirmOpen}
        width="2xl"
        onClose={onClose}
      >
        <form
          id="create-user-form"
          className="core_modal__form overflow-hidden"
          autoComplete="off"
          onSubmit={handleFormSubmit}
        >
          <div className="admin-user-form gap-4 overflow-y-auto flex-auto h-full">
            <Input
              id="create-user-username"
              name="username"
              label={<RequiredLabel>Tên đăng nhập</RequiredLabel>}
              placeholder="Tên đăng nhập"
              autoComplete="off"
              required
            />
            <Input
              id="create-user-password"
              name="password"
              type="password"
              label={<RequiredLabel>Mật khẩu</RequiredLabel>}
              placeholder={`Tối thiểu ${PASSWORD_MIN_LENGTH} ký tự`}
              autoComplete="new-password"
              minLength={PASSWORD_MIN_LENGTH}
              required
            />
            <Input
              id="create-user-full-name"
              placeholder="Họ và tên"
              name="full_name"
              label={<RequiredLabel>Họ và tên</RequiredLabel>}
              required
            />
            <Input
              id="create-user-phone"
              name="phone"
              placeholder="Số điện thoại"
              label={<RequiredLabel>Số điện thoại</RequiredLabel>}
              required
            />
            <Input
              id="create-user-email"
              name="email"
              type="email"
              label={<RequiredLabel>Email</RequiredLabel>}
              placeholder="Email"
              required
            /> 
            <SelectField
              id="create-user-department"
              name="department_id"
              label={<RequiredLabel>Phòng ban</RequiredLabel>}
              defaultValue=""
              required
            >
              <option value="" disabled>
                Chọn phòng ban
              </option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </SelectField>
            <div className="admin-user-form__full">
              <Input
                id="create-user-address"
                name="address"
                label={<RequiredLabel>Địa chỉ</RequiredLabel>}
                placeholder="Địa chỉ"
              />
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
        id="create-user-confirm-modal"
        show={isConfirmOpen}
        title="Xác nhận thêm nhân viên"
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
