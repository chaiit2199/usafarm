"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export type TabItem = {
  value: string | number;
  label?: ReactNode;
  href?: string;
  disabled?: boolean;
};

export type TabProps<T extends TabItem = TabItem> = {
  tabs: readonly T[];
  activeTab?: T["value"];
  onTabClick?: (tab: T) => void;
  /** Map tab → value (default: `tab.value`). */
  tabValue?: (tab: T) => T["value"];
  /** Map tab → href when `navigate` is true (default: `tab.href`). */
  navigateTo?: (tab: T) => string | undefined;
  navigate?: boolean;
  isScroll?: boolean;
  className?: string;
  itemClassName?: string;
  renderItem?: (tab: T) => ReactNode;
  children?: ReactNode;
};

export function Tab<T extends TabItem>({
  tabs,
  activeTab,
  onTabClick,
  tabValue = (tab) => tab.value,
  navigateTo = (tab) => tab.href,
  navigate = false,
  isScroll = false,
  className,
  itemClassName,
  renderItem,
  children,
}: TabProps<T>) {
  return (
    <div className={["core_tab", isScroll && "core_tab--scroll"].filter(Boolean).join(" ")}>
      <ul className={["menu_tab", className].filter(Boolean).join(" ")} role="tablist">
        {tabs.map((tab) => {
          const value = tabValue(tab);
          const isActive = value === activeTab;
          const href = navigate ? navigateTo(tab) : undefined;
          const content = renderItem ? renderItem(tab) : (tab.label ?? String(value));
          const itemClass = [
            "menu_tab__item",
            itemClassName,
            isActive && "active",
            tab.disabled && "is-disabled",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <li key={String(value)} className={itemClass} role="presentation" onClick={() => onTabClick?.(tab)}>
              {content}
            </li>
          );
        })}
      </ul>
      {children}
    </div>
  );
}
