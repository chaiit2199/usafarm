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
