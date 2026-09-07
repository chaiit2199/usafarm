"use client";

import { Icon, type IconName } from "@/components/icon";
import type { OrderStatusInput } from "@/lib/constants";
import { formatDateTimeVi } from "@/lib/format/date";

type StepDef = {
  id: string;
  title: string;
  upcomingTime: string;
  icon: IconName;
};

const STEPS: StepDef[] = [
  {
    id: "NEW",
    title: "Đơn mới",
    upcomingTime: "Chờ xử lý",
    icon: "hero-document-plus",
  },
  {
    id: "INVENTORY",
    title: "Kiểm tra tồn kho",
    upcomingTime: "Chờ xử lý",
    icon: "hero-building-storefront",
  },
  {
    id: "PACKAGING",
    title: "Đóng gói",
    upcomingTime: "Chờ xử lý",
    icon: "hero-cube",
  },
  {
    id: "SHIPPING",
    title: "Đang vận chuyển",
    upcomingTime: "Chờ giao",
    icon: "hero-truck",
  },
  {
    id: "COMPLETED",
    title: "Hoàn thành",
    upcomingTime: "--:--",
    icon: "hero-clipboard-document-check",
  },
];

/** Map ORDER_STATUSES code → index trên stepper (5 bước UI). */
function stepperIndex(status: OrderStatusInput): number {
  const code = typeof status === "number" ? status : status.code;
  if (code <= 0) return 0;
  if (code === 1) return 1;
  if (code === 2) return 2;
  if (code === 3 || code === 4) return 3;
  return 4;
}

type OrderStatusProps = {
  status: OrderStatusInput;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export function OrderStatus({ status, createdAt, updatedAt }: OrderStatusProps) {
  const currentIndex = stepperIndex(status);
  const currentStep = STEPS[currentIndex] ?? STEPS[0];
  const updatedLabel = formatDateTimeVi(updatedAt);
  const createdLabel = formatDateTimeVi(createdAt);
  const progressPercent = (currentIndex / (STEPS.length - 1)) * 80;

  return (
    <section className="section-container mb-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h6 className="text-base font-semibold flex items-center gap-2">
          <Icon name={currentStep.icon} className="size-5 text-theme-primary" />
          Trạng thái xử lý đơn hàng
        </h6>
        <p className="text-xs text-theme-muted">
          Cập nhật gần nhất:{" "}
          <span className="font-semibold text-slate-700">{updatedLabel}</span>
        </p>
      </div>

      <div className="relative">
        {/* Line nối giữa các step (đi qua tâm icon) */}
        <div
          aria-hidden
          className="absolute top-[22px] left-[10%] right-[10%] h-0.5 bg-slate-200"
        />
        <div
          aria-hidden
          className="absolute top-[22px] left-[10%] h-0.5 bg-theme-primary transition-[width] duration-300"
          style={{ width: `${progressPercent}%` }}
        />

        <div className="relative z-10 grid grid-cols-5 gap-2">
          {STEPS.map((step, index) => {
            const isCurrent = index === currentIndex;
            const isDone = index < currentIndex;
            const time =
              isDone || isCurrent
                ? index === 0
                  ? createdLabel
                  : updatedLabel
                : step.upcomingTime;

            return (
              <div key={step.id} className="flex flex-col items-center text-center gap-2">
                <div
                  className={[
                    "flex size-11 items-center justify-center rounded-xl",
                    isCurrent
                      ? "bg-theme-primary text-white"
                      : isDone
                        ? "bg-theme-primary/15 text-theme-primary"
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
                  {step.title}
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
