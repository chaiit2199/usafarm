import type { ReactNode } from "react";

import {
  getOrderStatusLabel,
  orderColor,
  recordStatusMeta,
  type OrderStatusInput,
} from "@/lib/constants";

export type StatusKind = "active" | "paused" | "waiting-for-approval" | "rejected" | "new";

type StatusProps = {
  children: ReactNode;
  kind?: StatusKind;
  color?: string;
  className?: string;
};

export function Status({ children, kind, color, className }: StatusProps) {
  return (
    <span
      className={["status", kind ? `status--${kind}` : "", className].filter(Boolean).join(" ")}
      style={
        color
          ? {
              color,
              borderColor: `${color}55`,
              backgroundColor: `${color}1A`,
            }
          : undefined
      }
    >
      {children}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatusInput }) {
  return <Status color={orderColor(status)}>{getOrderStatusLabel(status)}</Status>;
}

export function RecordStatusBadge({ status }: { status?: number }) {
  const meta = recordStatusMeta(status);
  return <Status kind={meta.kind}>{meta.label}</Status>;
}
