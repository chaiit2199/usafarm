"use client";

import { Icon, type IconName } from "@/components/icon";
import {
  ORDER_STATUSES,
  getOrderStatusMeta,
  isOrderApproved,
  isOrderCancelled,
  type OrderStatusInput,
  type OrderStatusSemantic,
} from "@/lib/constants";
import { formatDateTimeVi } from "@/lib/format/date";

const STEP_META: Record<OrderStatusSemantic, { upcomingTime: string; icon: IconName }> = {
  DRAFT: { upcomingTime: "Chờ xử lý", icon: "hero-document-plus" },
  WAITING_FOR_APPROVAL: { upcomingTime: "Chờ duyệt", icon: "hero-clock" },
  APPROVED_WAITING_ALLOCATION: { upcomingTime: "Chờ phân kho", icon: "hero-inbox-stack" },
  REJECTED: { upcomingTime: "--:--", icon: "hero-x-mark" },
  WAITING_WAREHOUSE_ACCEPTANCE: { upcomingTime: "Chờ kho nhận", icon: "hero-building-storefront" },
  PROCESSING: { upcomingTime: "Chờ xử lý", icon: "hero-cube" },
  CANCELLING: { upcomingTime: "Đang hủy", icon: "hero-hand-raised" },
  COMPLETED: { upcomingTime: "--:--", icon: "hero-clipboard-document-check" },
  COMPLETED_PARTIAL_CANCELLATION: { upcomingTime: "--:--", icon: "hero-scale" },
  CANCELLED: { upcomingTime: "--:--", icon: "hero-x-mark" },
};

const TERMINAL_SEMANTICS = new Set<OrderStatusSemantic>([
  "REJECTED",
  "CANCELLING",
  "COMPLETED",
  "COMPLETED_PARTIAL_CANCELLATION",
  "CANCELLED",
]);

function statusCode(status: OrderStatusInput) {
  return typeof status === "number" ? status : status.code;
}

function activeTerminal(semantic?: OrderStatusSemantic): OrderStatusSemantic {
  if (
    semantic === "CANCELLED" ||
    semantic === "REJECTED" ||
    semantic === "CANCELLING" ||
    semantic === "COMPLETED_PARTIAL_CANCELLATION"
  ) {
    return semantic;
  }
  return "COMPLETED";
}

function visibleSteps(semantic?: OrderStatusSemantic) {
  const terminal = activeTerminal(semantic);
  return ORDER_STATUSES.filter((status) => {
    if (status.semantic === "WAITING_FOR_APPROVAL") return false;
    if (TERMINAL_SEMANTICS.has(status.semantic)) return status.semantic === terminal;
    return true;
  }).map((status) => ({
    ...status,
    ...STEP_META[status.semantic],
  }));
}

type OrderStatusProps = {
  status: OrderStatusInput;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export function OrderStatus({ status, createdAt, updatedAt }: OrderStatusProps) {
  if (!isOrderApproved(status)) return null;

  const semantic = getOrderStatusMeta(status)?.semantic;
  const cancelled = isOrderCancelled(status);
  const isAlert = cancelled || semantic === "REJECTED" || semantic === "CANCELLING";
  const steps = visibleSteps(semantic);
  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === statusCode(status)),
  );
  const currentStep = steps[currentIndex] ?? steps[0];
  const updatedLabel = formatDateTimeVi(updatedAt);
  const createdLabel = formatDateTimeVi(createdAt);
  const progressPercent = isAlert ? 0 : (currentIndex / (steps.length - 1)) * 80;

  return (
    <section className="section-container mb-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h6 className="text-base font-semibold flex items-center gap-2">
          <Icon
            name={currentStep.icon}
            className={["size-5", isAlert ? "text-red-600" : "text-theme-primary"].join(" ")}
          />
          Trạng thái xử lý đơn hàng
        </h6>
      </div>

      <div className="relative">
        <div
          aria-hidden
          className="absolute top-[22px] left-[10%] right-[10%] h-0.5 bg-slate-200"
        />
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
            const time =
              isDone || isCurrent
                ? index === 0
                  ? createdLabel
                  : updatedLabel
                : step.upcomingTime;

            return (
              <div key={step.semantic} className="flex flex-col items-center text-center gap-2">
                <div
                  className={[
                    "flex size-11 items-center justify-center rounded-xl",
                    isCurrent && isAlert
                      ? "bg-red-600 text-white"
                      : isCurrent
                        ? "bg-theme-primary text-white"
                        : isDone
                          ? "bg-[#e2ebe5] text-theme-primary"
                          : "bg-slate-100 text-slate-400",
                  ].join(" ")}
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
                <p className="text-[11px] text-slate-400">{time}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
