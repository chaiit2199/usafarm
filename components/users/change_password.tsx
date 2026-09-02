"use client";

import { useRef, useState } from "react";

import { FormSubmitButton } from "@/components/form-submit-button";
import { Icon } from "@/components/icon";
import { Input, Modal, useDropdownClose } from "@/components/core_component";
import { changePassword } from "@/lib/api/users";
import { putFlash } from "@/lib/flash/flash";
import {
  PASSWORD_MIN_LENGTH,
  hasPasswordErrors,
  validateChangePassword,
} from "@/lib/auth/password";

type PendingPassword = {
  current_password: string;
  new_password: string;
};

export function ChangePasswordComponent() {
  const closeDropdown = useDropdownClose();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState<PendingPassword | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ReturnType<typeof validateChangePassword>>({});

  function onClose() {
    setFieldErrors({});
    setPending(null);
    setConfirmOpen(false);
    setOpen(false);
  }

  function onCloseConfirm() {
    setConfirmOpen(false);
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const values = {
      current_password: String(data.get("current_password") ?? ""),
      new_password: String(data.get("new_password") ?? ""),
      new_password_confirmation: String(data.get("new_password_confirmation") ?? ""),
    };

    const nextFieldErrors = validateChangePassword(values);
    setFieldErrors(nextFieldErrors);

    if (hasPasswordErrors(nextFieldErrors)) return;

    setPending({
      current_password: values.current_password,
      new_password: values.new_password,
    });
    setConfirmOpen(true);
  }

  async function onConfirm() {
    if (!pending) return;

    const result = await changePassword(pending);

    if (!result.ok) {
      setConfirmOpen(false);
      putFlash("error", result.message, 1500);
      return;
    }

    formRef.current?.reset();
    setFieldErrors({});
    setPending(null);
    setConfirmOpen(false);
    setOpen(false);
    putFlash("success", "Đổi mật khẩu thành công", 1500);
  }

  return (
    <>
      <button
        onClick={() => {
          closeDropdown?.();
          setOpen(true);
        }}
        type="button"
        id="open-change-password"
        className="header-menu__item"
        role="menuitem"
      >
        <Icon name="hero-lock-closed" className="header-menu__icon" />
        <span>Đổi mật khẩu</span>
      </button>

      <Modal
        id="change-password-modal"
        show={open}
        title="Đổi mật khẩu"
        subtitle="Đặt lại mật khẩu mới để bảo mật tài khoản của bạn."
        closeable={!confirmOpen}
        width="md"
        onClose={onClose}
      >
        <form
          ref={formRef}
          id="change-password-form"
          className="core_modal__form"
          autoComplete="off"
          onSubmit={onSubmit}
        >
          <div className="flex-auto overflow-y-auto gap-4 flex flex-col">

            <Input
              id="change-password-current"
              name="current_password"
              type="password"
              label="Mật khẩu hiện tại *"
              placeholder="Nhập mật khẩu hiện tại"
              autoComplete="off"
              minLength={PASSWORD_MIN_LENGTH}
              required
              error={fieldErrors.current_password}
            />
            <Input
              id="change-password-new"
              name="new_password"
              type="password"
              label="Mật khẩu mới *"
              placeholder={`Tối thiểu ${PASSWORD_MIN_LENGTH} ký tự`}
              autoComplete="new-password"
              minLength={PASSWORD_MIN_LENGTH}
              required
              error={fieldErrors.new_password}
            />
            <Input
              id="change-password-confirm"
              name="new_password_confirmation"
              type="password"
              label="Xác nhận mật khẩu mới *"
              placeholder="Nhập lại mật khẩu mới"
              autoComplete="new-password"
              minLength={PASSWORD_MIN_LENGTH}
              required
              error={fieldErrors.new_password_confirmation}
            />
          </div>

          <div className="core_modal__actions">
            <button
              type="button"
              className="core_button core_button--secondary"
              onClick={onClose}
            >
              Hủy
            </button>
            <button type="submit" className="core_button core_button--primary">
              Xác nhận
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        id="change-password-confirm-modal"
        show={confirmOpen}
        title="Xác nhận đổi mật khẩu"
        width="sm"
        className="core_modal--stacked"
        onClose={onCloseConfirm}
      >
        <p>Bạn có chắc chắn muốn đổi mật khẩu không?</p>
        <form className="core_modal__actions" action={onConfirm}>
          <button
            type="button"
            id="change-password-confirm-cancel"
            className="core_button core_button--secondary"
            onClick={onCloseConfirm}
          >
            Hủy
          </button>
          <FormSubmitButton>Xác nhận</FormSubmitButton>
        </form>
      </Modal>
    </>
  );
}
