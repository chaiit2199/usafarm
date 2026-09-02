export const PASSWORD_MIN_LENGTH = 8;

export type ChangePasswordValues = {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
};

export type PasswordFieldErrors = {
  current_password?: string;
  new_password?: string;
  new_password_confirmation?: string;
};

export function validatePassword(password: string, options?: { current?: string }): string | null {
  const value = password.trim();

  if (!value) return "Vui lòng nhập mật khẩu";
  if (value.length < PASSWORD_MIN_LENGTH) return `Tối thiểu ${PASSWORD_MIN_LENGTH} ký tự`;
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return "Mật khẩu phải gồm chữ và số";
  }
  if (options?.current && value === options.current) {
    return "Mật khẩu mới phải khác mật khẩu hiện tại";
  }

  return null;
}

export function validateChangePassword(values: ChangePasswordValues): PasswordFieldErrors {
  const current = values.current_password.trim();
  const next = values.new_password;
  const confirm = values.new_password_confirmation;
  const errors: PasswordFieldErrors = {};

  if (!current) {
    errors.current_password = "Vui lòng nhập mật khẩu hiện tại";
  }

  const newPasswordError = validatePassword(next, { current });
  if (newPasswordError) {
    errors.new_password =
      newPasswordError === "Vui lòng nhập mật khẩu"
        ? "Vui lòng nhập mật khẩu mới"
        : newPasswordError;
  }

  if (!confirm.trim()) {
    errors.new_password_confirmation = "Vui lòng xác nhận mật khẩu mới";
  } else if (confirm !== next) {
    errors.new_password_confirmation = "Xác nhận mật khẩu không khớp";
  }

  return errors;
}

export function hasPasswordErrors(errors: PasswordFieldErrors) {
  return Object.keys(errors).length > 0;
}
