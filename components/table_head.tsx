import type { ReactNode } from "react";

import { Icon, type IconName } from "@/components/icon";

export function TableHead({
  icon,
  children,
  className,
}: {
  icon?: IconName;
  children?: ReactNode;
  className?: string;
}) {
  const justify = className?.includes("is-num")
    ? "justify-end"
    : className?.includes("is-center")
      ? "justify-center"
      : "";

  return (
    <th className={className}>
      <span className={["inline-flex items-center gap-1.5", justify && "w-full", justify].filter(Boolean).join(" ")}>
        {icon ? <Icon name={icon} className="size-4 shrink-0" /> : null}
        {children}
      </span>
    </th>
  );
}
