"use client";

import { useMemo, useState } from "react";

type Slice = {
  status: string;
  label: string;
  value: number;
  color: string;
};

const PIE = { size: 220, rOuter: 95, rInner: 58 };

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutPath(cx: number, cy: number, rOuter: number, rInner: number, startAngle: number, endAngle: number) {
  const sweep = endAngle - startAngle;
  if (sweep >= 359.999) {
    return [
      `M ${cx} ${cy - rOuter}`,
      `A ${rOuter} ${rOuter} 0 1 1 ${cx - 0.001} ${cy - rOuter}`,
      `L ${cx - 0.001} ${cy - rInner}`,
      `A ${rInner} ${rInner} 0 1 0 ${cx} ${cy - rInner}`,
      "Z",
    ].join(" ");
  }

  const large = sweep > 180 ? 1 : 0;
  const o1 = polar(cx, cy, rOuter, startAngle);
  const o2 = polar(cx, cy, rOuter, endAngle);
  const i1 = polar(cx, cy, rInner, endAngle);
  const i2 = polar(cx, cy, rInner, startAngle);

  return [
    `M ${o1.x} ${o1.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${i2.x} ${i2.y}`,
    "Z",
  ].join(" ");
}

export function OrderPieChart({ series }: { series: Slice[] }) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [hover, setHover] = useState<string | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number; label: string; text: string } | null>(null);

  const allPoints = series.filter((item) => item.value > 0);
  const visiblePoints = allPoints.filter((item) => !hidden.has(item.status));
  const totalAll = allPoints.reduce((sum, item) => sum + item.value, 0);
  const total = visiblePoints.reduce((sum, item) => sum + item.value, 0);

  const slices = useMemo(() => {
    const { size, rOuter, rInner } = PIE;
    const cx = size / 2;
    const cy = size / 2;
    let angle = 0;

    return visiblePoints.map((point) => {
      const sweep = total > 0 ? (point.value / total) * 360 : 0;
      const start = angle;
      const end = angle + Math.max(sweep, 0.01);
      angle = end;
      return {
        ...point,
        d: donutPath(cx, cy, rOuter, rInner, start, end),
        pct: total > 0 ? Math.round((point.value / total) * 100) : 0,
      };
    });
  }, [visiblePoints, total]);

  function toggleStatus(status: string) {
    setHidden((current) => {
      const next = new Set(current);
      if (next.has(status)) {
        next.delete(status);
        return next;
      }
      const stillVisible = allPoints.some((item) => item.status !== status && !next.has(item.status));
      if (!stillVisible) return current;
      next.add(status);
      return next;
    });
  }

  function showTip(event: React.MouseEvent, point: Slice, pct: number) {
    const rect = event.currentTarget.closest(".overview-chart-canvas")?.getBoundingClientRect();
    if (!rect) return;
    setHover(point.status);
    setTip({
      x: Math.min(Math.max(event.clientX - rect.left, 8), rect.width - 148),
      y: Math.max(event.clientY - rect.top - 56, 8),
      label: point.label,
      text: `${Math.round(point.value)} đơn · ${pct}%`,
    });
  }

  return (
    <div className="overview-chart-wrap" id="home-order-chart">
      <div id="home-order-chart-canvas" className="overview-chart-canvas overview-chart-canvas--pie">
        <div className="order-pie-chart">
          <div className="order-pie-chart__plot">
            <svg viewBox={`0 0 ${PIE.size} ${PIE.size}`} width={PIE.size} height={PIE.size} role="img" aria-label="Thống kê đơn hàng">
              {slices.map((slice) => (
                <path
                  key={slice.status}
                  d={slice.d}
                  fill={slice.color}
                  className={["order-pie-chart__slice", hover === slice.status && "is-hover"].filter(Boolean).join(" ")}
                  onMouseMove={(event) => showTip(event, slice, slice.pct)}
                  onMouseLeave={() => {
                    setHover(null);
                    setTip(null);
                  }}
                />
              ))}
            </svg>
            <div className="order-pie-chart__center">
              <strong>{total}</strong>
              <span>đơn</span>
            </div>
          </div>
          <div className="order-pie-chart__labels">
            {allPoints.map((point) => {
              const pct = totalAll > 0 ? Math.round((point.value / totalAll) * 100) : 0;
              const isOff = hidden.has(point.status);
              return (
                <button
                  key={point.status}
                  type="button"
                  className={[
                    "order-pie-chart__label",
                    isOff && "is-off",
                    hover === point.status && "is-hover",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  title="Bật/tắt trạng thái trên biểu đồ"
                  onClick={() => toggleStatus(point.status)}
                  onMouseMove={(event) => !isOff && showTip(event, point, pct)}
                  onMouseLeave={() => {
                    setHover(null);
                    setTip(null);
                  }}
                >
                  <span className="order-pie-chart__label-dot" style={{ background: point.color }} />
                  <span className="order-pie-chart__label-text">{point.label}</span>
                  <span className="order-pie-chart__label-value">{Math.round(point.value)}</span>
                  <span className="order-pie-chart__label-pct">{pct}%</span>
                </button>
              );
            })}
          </div>
        </div>
        {tip && (
          <div className="order-pie__tooltip chart-tooltip" style={{ display: "flex", left: tip.x, top: tip.y }}>
            <strong>{tip.label}</strong>
            <span>{tip.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}
