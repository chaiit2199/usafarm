"use client";

import { useId, useState } from "react";

import { Icon } from "@/components/icon";

export type InputProps = Omit<React.ComponentProps<"input">, "type"> & {
  type?: React.HTMLInputTypeAttribute;
  label?: React.ReactNode;
  error?: string;
};

export function Input({
  id,
  type = "text",
  label,
  error,
  className,
  autoComplete,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const isPassword = type === "password";
  const [visible, setVisible] = useState(false);
  const inputType = isPassword ? (visible ? "text" : "password") : type;

  return (
    <div className="core_field">
      {label && (
        <label htmlFor={inputId} className="core_label">
          {label}
        </label>
      )}
      <div className={isPassword ? "core_field__control" : undefined}>
        <input
          id={inputId}
          type={inputType}
          autoComplete={autoComplete}
          className={[
            "core_input",
            "w-full",
            isPassword && "core_input--with-trailing",
            error && "core_input--error",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="core_input__toggle"
            aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            onClick={() => setVisible((value) => !value)}
          >
            <Icon name={visible ? "hero-eye-slash" : "hero-eye"} className="size-5" />
          </button>
        )}
      </div>
      {error && <p className="core_field__error">{error}</p>}
    </div>
  );
}
