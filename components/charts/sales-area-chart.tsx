"use client";

import { createChart, AreaSeries, ColorType, LineType, type Time } from "lightweight-charts";
import { useEffect, useRef } from "react";

type Point = { time: string; value: number };

function formatCompact(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    const n = value / 1_000_000_000;
    return `${Number.isInteger(n) ? n : n.toFixed(1)}B`;
  }
  if (abs >= 1_000_000) {
    const n = value / 1_000_000;
    return `${Number.isInteger(n) ? n : n.toFixed(0)}M`;
  }
  if (abs >= 1_000) {
    const n = value / 1_000;
    return `${Number.isInteger(n) ? n : n.toFixed(0)}K`;
  }
  return String(Math.round(value));
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatDayMonth(time: unknown) {
  if (typeof time === "string") {
    const [, month, day] = time.split("-");
    return `${day}/${month}`;
  }
  if (time && typeof time === "object" && "year" in time) {
    const value = time as { year: number; month: number; day: number };
    return `${pad2(value.day)}/${pad2(value.month)}`;
  }
  return String(time);
}

export function SalesAreaChart({ series }: { series: Point[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !series.length) return;

    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#94a3b8",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 12,
        attributionLogo: false,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: "#e2e8f0", style: 0 },
      },
      rightPriceScale: { visible: false },
      leftPriceScale: {
        visible: true,
        borderVisible: false,
        scaleMargins: { top: 0.18, bottom: 0.05 },
      },
      timeScale: {
        borderVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
        tickMarkFormatter: (time: Time) => formatDayMonth(time),
      },
      crosshair: {
        horzLine: { visible: false, labelVisible: false },
        vertLine: { visible: true, labelVisible: false, color: "#A7C4B5", width: 1, style: 3 },
      },
      handleScroll: false,
      handleScale: false,
      localization: {
        timeFormatter: (time: Time) => formatDayMonth(time),
        priceFormatter: (value: number) => formatCompact(value),
      },
    });

    const area = chart.addSeries(AreaSeries, {
      lineColor: "#3B7A57",
      topColor: "rgba(59, 122, 87, 0.28)",
      bottomColor: "rgba(59, 122, 87, 0.02)",
      lineWidth: 2,
      lineType: LineType.Curved,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 5,
      crosshairMarkerBorderColor: "#ffffff",
      crosshairMarkerBorderWidth: 2,
      crosshairMarkerBackgroundColor: "#3B7A57",
      pointMarkersVisible: true,
      pointMarkersRadius: 3.5,
      priceFormat: {
        type: "custom",
        minMove: 1,
        formatter: (value: number) => formatCompact(value),
      },
    });

    area.setData(series.map((point) => ({ time: point.time as never, value: point.value })));
    chart.timeScale().fitContent();

    const tip = document.createElement("div");
    tip.className = "sales-chart__tooltip chart-tooltip";
    tip.style.display = "none";
    el.appendChild(tip);

    chart.subscribeCrosshairMove((param) => {
      if (!param?.point || !param.time || param.point.x < 0 || param.point.y < 0) {
        tip.style.display = "none";
        return;
      }

      const data = param.seriesData.get(area) as { value?: number } | undefined;
      if (data?.value == null) {
        tip.style.display = "none";
        return;
      }

      tip.style.display = "flex";
      tip.innerHTML = `<strong>${formatDayMonth(param.time)}</strong><span>${Math.round(data.value).toLocaleString("vi-VN")} ₫</span>`;
      const tipWidth = tip.offsetWidth || 140;
      const tipHeight = tip.offsetHeight || 44;
      tip.style.left = `${Math.min(Math.max(param.point.x - tipWidth / 2, 8), el.clientWidth - tipWidth - 8)}px`;
      tip.style.top = `${Math.max(param.point.y - tipHeight - 14, 8)}px`;
    });

    return () => {
      chart.remove();
    };
  }, [series]);

  return (
    <div className="overview-chart-wrap" id="home-sales-chart">
      <div
        ref={ref}
        id="home-sales-chart-canvas"
        className="overview-chart-canvas overview-chart-canvas--sales"
      />
    </div>
  );
}
