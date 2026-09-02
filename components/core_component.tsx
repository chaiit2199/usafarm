"use client";

import { createContext, useContext, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export { Input, type InputProps } from "@/components/input";
export { Tab, type TabItem, type TabProps } from "@/components/tab";
export { EmptyData, TableLoading } from "@/components/empty_data";
export { Pagination, type PaginationProps } from "@/components/pagination";
export { TableHead } from "@/components/table_head";

export type ModalCloseable = true | false | "close_button";

/** false — chặn đóng; "close_button" — Esc + nút X; true — Esc + backdrop + nút X */
function modalDismissOptions(closeable: ModalCloseable) {
  return {
    backdrop: closeable === true,
    escape: closeable !== false,
    closeButton: closeable !== false,
  };
}
export type ModalWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
export type ModalHeight = "base" | "full";

export type ModalAction = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  color?: "primary" | "secondary" | "danger";
};

export type ModalProps = {
  id?: string;
  show?: boolean;
  icon?: React.ReactNode;
  onClose?: () => void;
  closeable?: ModalCloseable;
  width?: ModalWidth;
  height?: ModalHeight;
  size?: ModalWidth;
  showCloseIcon?: boolean;
  showHeader?: boolean;
  className?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  status?: React.ReactNode;
  footer?: React.ReactNode;
  actions?: ModalAction[];
  children: React.ReactNode;
};

export function Modal({
  id,
  show = false,
  icon,
  onClose,
  closeable = true,
  width = "md",
  height = "base",
  size,
  showCloseIcon = true,
  showHeader = true,
  className,
  title,
  subtitle,
  status,
  footer,
  actions,
  children,
}: ModalProps) {
  const generatedId = useId();
  const modalId = id ?? generatedId;
  const containerRef = useRef<HTMLDivElement>(null);
  const sizer = size ?? width;
  const dismiss = modalDismissOptions(closeable);
  const hasFooter = Boolean(footer) || Boolean(actions?.length);

  useEffect(() => {
    if (!show) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || !dismiss.escape) return;
      event.preventDefault();
      event.stopPropagation();
      onClose?.();
    }

    window.addEventListener("keydown", onKeyDown, true);
    containerRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [show, dismiss.escape, onClose]);

  if (!show || typeof document === "undefined") return null;

  return createPortal(
    <div id={modalId} className={["core_modal", className].filter(Boolean).join(" ")}>
      <div
        id={`${modalId}-bg`}
        className="core_modal__backdrop"
        aria-hidden="true"
        onClick={() => {
          if (dismiss.backdrop) onClose?.();
        }}
      />
      <div
        className="core_modal__position"
        aria-labelledby={`${modalId}-title`}
        aria-describedby={`${modalId}-description`}
        role="dialog"
        aria-modal="true"
      >
        <div
          className={[
            "core_modal__sizer",
            `core_modal__sizer--${sizer}`,
            height === "full" && "core_modal__sizer--full",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div
            ref={containerRef}
            id={`${modalId}-container`}
            className="core_modal__container"
            tabIndex={-1}
          >
            <div id={`${modalId}-content`} className="core_modal__content">
              {showHeader && (
                <header>
                  {icon && <span className="core_modal__icon">{icon}</span>}
                  <div className="core_modal__title--left">
                    <h2 id={`${modalId}-title`} className="core_modal__title">
                      {title}
                    </h2>
                    {subtitle && <div className="core_modal__subtitle">{subtitle}</div>}
                  </div>
                  <div className="core_modal__title--right">
                    {status && <div className="core_modal__status">{status}</div>}
                    {showCloseIcon && dismiss.closeButton && (
                      <button
                        type="button"
                        tabIndex={-1}
                        className="core_modal__close"
                        aria-label="close"
                        onClick={onClose}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                      </button>
                    )}
                  </div>
                </header>
              )}

              <div id={`${modalId}-description`} className="core_modal__body">
                {children}
              </div>

              {hasFooter && (
                <footer>
                  {actions && actions.length > 0 && (
                    <div className="core_modal__actions">
                      {actions.map((action, index) => (
                        <button
                          key={index}
                          type={action.type ?? "button"}
                          className={`core_modal core_modal--${action.color ?? "secondary"}`}
                          onClick={() => {
                            action.onClick?.();
                            onClose?.();
                          }}
                        >
                          {action.children}
                        </button>
                      ))}
                    </div>
                  )}
                  {footer}
                </footer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export type DropdownPlacement = | "bottom-left" | "bottom-right" | "top-left" | "top-right" | "top-center" | "center-right";

export type DropdownItem = {
  children: React.ReactNode;
  onClick?: () => void;
};

export type DropdownProps = {
  id?: string;
  className?: string;
  labelClassName?: string;
  placement?: DropdownPlacement;
  label: React.ReactNode;
  items?: DropdownItem[];
  children?: React.ReactNode;
};

export function Dropdown({
  id,
  className,
  labelClassName,
  placement = "bottom-left",
  label,
  items,
  children,
}: DropdownProps) {
  const generatedId = useId();
  const dropdownId = id ?? generatedId;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node | null;
      if (!(target instanceof Element)) return;
      if (target.closest(".core_modal")) return;
      if (rootRef.current?.contains(target)) return;
      close();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !document.querySelector(".core_modal")) {
        close();
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <DropdownCloseContext.Provider value={close}>
      <div
        ref={rootRef}
        id={dropdownId}
        className={["core_dropdown", open && "core_dropdown--active", className]
          .filter(Boolean)
          .join(" ")}
      >
        <div
          className={["core_dropdown__title", labelClassName].filter(Boolean).join(" ")}
          onClick={() => setOpen((value) => !value)}
        >
          {label}
        </div>
        <ul id={`${dropdownId}-list`} className="core_dropdown__list" data-placement={placement}>
          {children
            ? children
            : items?.map((item, index) => (
                <li key={index}>
                  <button
                    type="button"
                    className="item"
                    onClick={() => {
                      item.onClick?.();
                      close();
                    }}
                  >
                    {item.children}
                  </button>
                </li>
              ))}
        </ul>
      </div>
    </DropdownCloseContext.Provider>
  );
}

const DropdownCloseContext = createContext<(() => void) | null>(null);

export function useDropdownClose() {
  return useContext(DropdownCloseContext);
}
