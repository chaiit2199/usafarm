import type { ChangeEvent, ReactNode } from "react";

import { RECORD_STATUS_OPTIONS, UserStatus } from "@/lib/constants";

export function RequiredLabel({ children }: { children: string }) {
  return (
    <>
      {children} <span className="core_label__required">*</span>
    </>
  );
}

export function SelectField({
  id,
  name,
  label,
  defaultValue,
  required,
  disabled,
  onChange,
  children,
}: {
  id: string;
  name: string;
  label: ReactNode;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
}) {
  return (
    <div className="core_field">
      <label htmlFor={id} className="core_label">
        {label}
      </label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
        onChange={onChange}
        className="core_input core_input--select w-full"
      >
        {children}
      </select>
    </div>
  );
}

export function RecordStatusSelectField({
  id,
  name = "status",
  label,
  defaultValue = UserStatus.Active,
  required = true,
}: {
  id: string;
  name?: string;
  label: ReactNode;
  defaultValue?: number;
  required?: boolean;
}) {
  return (
    <SelectField
      id={id}
      name={name}
      label={label}
      defaultValue={String(defaultValue)}
      required={required}
    >
      {RECORD_STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </SelectField>
  );
}
