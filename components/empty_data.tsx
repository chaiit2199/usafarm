import type { ReactNode } from "react";

import { Icon, type IconName } from "@/components/icon";

export function EmptyData({
  title = "Không có dữ liệu",
  description,
  icon = "hero-magnifying-glass",
  children,
}: {
  title?: string;
  description?: string;
  icon?: IconName;
  children?: ReactNode;
}) {
  return (
    <div className="empty-data" role="status">
      <span className="empty-data__icon">
        <Icon name={icon} className="size-8" />
      </span>
      <p className="empty-data__title">{title}</p>
      {description && <p className="empty-data__desc">{description}</p>}
      {children}
    </div>
  );
}

export function TableLoading({ label = "Đang tải dữ liệu..." }: { label?: string }) {
  return (
    <div className="relative min-h-100 overflow-hidden max-w-full" role="status" aria-live="polite">
      <div className="loading show">
        <div className="loading-inner">
          <h2 className="loader">{label}</h2>
        </div>
      </div>
    </div>
  );
}
