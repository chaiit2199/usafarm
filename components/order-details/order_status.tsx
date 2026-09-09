"use client";

import { Icon, type IconName } from "@/components/icon";
import {
  ORDER_STATUSES,
  getOrderStatusMeta,
  isWaitingForApproval,
  type OrderStatusInput,
  type OrderStatusSemantic,
} from "@/lib/constants";
import { formatDateTimeVi } from "@/lib/format/date";

const STEP_ICONS: Record<OrderStatusSemantic, IconName> = {
  DRAFT: "hero-document-plus",
  WAITING_FOR_APPROVAL: "hero-clock",
  APPROVED_WAITING_ALLOCATION: "hero-inbox-stack",
  REJECTED: "hero-x-mark",
  WAITING_WAREHOUSE_ACCEPTANCE: "hero-building-storefront",
  PROCESSING: "hero-cube",
  CANCELLING: "hero-hand-raised",
  COMPLETED: "hero-clipboard-document-check",
  COMPLETED_PARTIAL_CANCEL: "hero-clipboard-document-check",
  CANCELLED: "hero-x-mark",
  SPLIT_ORDER: "hero-document-duplicate",
};

const TERMINALS = new Set<OrderStatusSemantic>([
  "REJECTED",
  "CANCELLING",
  "COMPLETED",
  "COMPLETED_PARTIAL_CANCEL",
  "CANCELLED",
  "SPLIT_ORDER",
]);

const ALERTS = new Set<OrderStatusSemantic>(["REJECTED", "CANCELLING", "CANCELLED"]);

function orderCode(status: OrderStatusInput) {
  return typeof status === "number" ? status : status.code;
}

function stepsFor(semantic?: OrderStatusSemantic) {
  const terminal = semantic && TERMINALS.has(semantic) ? semantic : "COMPLETED";

  return ORDER_STATUSES.filter((item) => {
    if (item.semantic === "WAITING_FOR_APPROVAL") return false;
    if (TERMINALS.has(item.semantic)) return item.semantic === terminal;
    return true;
  }).map((item) => ({
    ...item,
    icon: STEP_ICONS[item.semantic],
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
  if (isWaitingForApproval(status)) return null;

  const semantic = getOrderStatusMeta(status)?.semantic;
  const isAlert = semantic != null && ALERTS.has(semantic);
  const steps = stepsFor(semantic);
  const currentIndex = Math.max(0, steps.findIndex((step) => step.id === orderCode(status)));
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
