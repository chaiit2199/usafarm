"use client";

import { Icon, type IconName } from "@/components/icon";
import {
  ORDER_STATUSES,
  getOrderStatusMeta,
  orderStatus,
  type OrderStatusId,
  type OrderStatusInput,
} from "@/lib/constants";
import { formatDateTimeVi } from "@/lib/format/date";

const STEP_ICONS: Record<OrderStatusId, IconName> = {
  [orderStatus.draft]: "hero-document-plus",
  [orderStatus.waitingForApproval]: "hero-clock",
  [orderStatus.approvedWaitingAllocation]: "hero-inbox-stack",
  [orderStatus.rejected]: "hero-x-mark",
  [orderStatus.waitingWarehouseAcceptance]: "hero-building-storefront",
  [orderStatus.processing]: "hero-cube",
  [orderStatus.cancelling]: "hero-hand-raised",
  [orderStatus.completed]: "hero-clipboard-document-check",
  [orderStatus.completedPartialCancel]: "hero-clipboard-document-check",
  [orderStatus.cancelled]: "hero-x-mark",
  [orderStatus.splitOrder]: "hero-document-duplicate",
};

const TERMINALS = new Set<OrderStatusId>([
  orderStatus.rejected,
  orderStatus.cancelling,
  orderStatus.completed,
  orderStatus.completedPartialCancel,
  orderStatus.cancelled,
  orderStatus.splitOrder,
]);

const ALERTS = new Set<OrderStatusId>([
  orderStatus.rejected,
  orderStatus.cancelling,
  orderStatus.cancelled,
]);

function stepsFor(statusId?: OrderStatusId) {
  const terminal = statusId != null && TERMINALS.has(statusId) ? statusId : orderStatus.completed;

  return ORDER_STATUSES.filter((item) => {
    if (item.id === orderStatus.waitingForApproval) return false;
    if (TERMINALS.has(item.id)) return item.id === terminal;
    return true;
  }).map((item) => ({
    ...item,
    icon: STEP_ICONS[item.id],
  }));
}

function iconBoxClass(isCurrent: boolean, isDone: boolean, isAlert: boolean) {
  if (isCurrent && isAlert) return "bg-red-600 text-white";
  if (isCurrent) return "bg-theme-primary text-white";
  if (isDone) return "bg-[#e2ebe5] text-theme-primary";
  return "bg-slate-100 text-slate-400";
}

type OrderStatusProps = {
  status: OrderStatusInput;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export function OrderStatus({ status, createdAt, updatedAt }: OrderStatusProps) {
  const statusId = getOrderStatusMeta(status)?.id;
  if (statusId === orderStatus.waitingForApproval) return null;

  const isAlert = statusId != null && ALERTS.has(statusId);
  const steps = stepsFor(statusId);
  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === statusId),
  );
  const current = steps[currentIndex] ?? steps[0];
  const createdLabel = formatDateTimeVi(createdAt);
  const updatedLabel = formatDateTimeVi(updatedAt);
  const progressPercent = isAlert || steps.length < 2 ? 0 : (currentIndex / (steps.length - 1)) * 80;

  return (
    <section className="section-container mb-6">
      <h6 className="mb-4 text-base font-semibold flex items-center gap-2">
        <Icon
          name={current.icon}
          className={["size-5", isAlert ? "text-red-600" : "text-theme-primary"].join(" ")}
        />
        Trạng thái xử lý đơn hàng
      </h6>

      <div className="relative">
        <div aria-hidden className="absolute top-[22px] left-[10%] right-[10%] h-0.5 bg-slate-200" />
        <div
          aria-hidden
          className="absolute top-[22px] left-[10%] h-0.5 bg-theme-primary transition-[width] duration-300"
          style={{ width: `${progressPercent}%` }}
        />

        <div
          className="relative z-10 grid gap-2"
          style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
        >
          {steps.map((step, index) => {
            const isCurrent = index === currentIndex;
            const isDone = !isAlert && index < currentIndex;
            const time = isDone || isCurrent ? (index === 0 ? createdLabel : updatedLabel) : "Chờ xử lý";

            return (
              <div key={step.id} className="flex flex-col items-center text-center gap-2">
                <div
                  className={`flex size-11 items-center justify-center rounded-xl ${iconBoxClass(isCurrent, isDone, isAlert)}`}
                >
                  <Icon name={step.icon} className="size-5" />
                </div>
                <p
                  className={[
                    "text-xs font-semibold",
                    isCurrent || isDone ? "text-slate-800" : "text-theme-muted",
                  ].join(" ")}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
