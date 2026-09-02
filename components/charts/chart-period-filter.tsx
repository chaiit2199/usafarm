"use client";

import { Dropdown } from "@/components/core_component";
import { Icon } from "@/components/icon";
import { useState } from "react";

const PERIODS = ["Theo ngày", "Theo tuần", "Theo tháng", "Theo năm"];

export function ChartPeriodFilter() {
  const [period, setPeriod] = useState(PERIODS[0]);

  return (
    <Dropdown
      id="chart-dashboard-actions"
      placement="bottom-right"
      label={
        <button
          type="button"
          className="overview-card__select inline-flex items-center gap-2 border border-theme-primary-border rounded-md p-2"
          id="chart-period-filter"
        >
          {period}
          <Icon name="hero-chevron-down" className="size-3.5" />
        </button>
      }
    >
      <ul className="flex flex-col overflow-hidden min-w-max">
        {PERIODS.map((item, index) => (
          <li
            key={item}
            className={index === PERIODS.length - 1 ? "py-2 px-4" : "border-b border-theme-primary-border py-2 px-4"}
          >
            <button type="button" onClick={() => setPeriod(item)}>
              {item}
            </button>
          </li>
        ))}
      </ul>
    </Dropdown>
  );
}
