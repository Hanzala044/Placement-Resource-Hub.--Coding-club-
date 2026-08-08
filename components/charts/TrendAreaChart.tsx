"use client";

import { useState, type PointerEvent } from "react";

export interface TrendPoint {
  label: string;
  value: number;
}

const WIDTH = 560;
const HEIGHT = 160;
const PAD_X = 8;
const PAD_TOP = 12;
const PAD_BOTTOM = 22;

/**
 * Single-series area + line trend chart. Sequential blue hue per the
 * dataviz skill ("trend over time" job -> 1 hue). Ships its own hover
 * layer: a crosshair snaps to the nearest point and a tooltip shows the
 * date + value, per the skill's "hover is part of the deliverable" rule.
 */
export function TrendAreaChart({ data }: { data: TrendPoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return <p className="text-sm text-[var(--text-secondary)]">Not enough data yet.</p>;
  }

  const max = Math.max(1, ...data.map((d) => d.value));
  const plotW = WIDTH - PAD_X * 2;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const stepX = data.length > 1 ? plotW / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    x: PAD_X + stepX * i,
    y: PAD_TOP + plotH - (d.value / max) * plotH,
    ...d,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${PAD_TOP + plotH} L${points[0].x},${PAD_TOP + plotH} Z`;

  function handleMove(e: PointerEvent<SVGSVGElement>) {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    let nearest = 0;
    let nearestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - relX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="viz-root relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full touch-none"
        onPointerMove={handleMove}
        onPointerLeave={() => setHoverIndex(null)}
        role="img"
        aria-label="Submissions over the last two weeks"
      >
        {/* baseline */}
        <line x1={PAD_X} y1={PAD_TOP + plotH} x2={WIDTH - PAD_X} y2={PAD_TOP + plotH} stroke="var(--viz-baseline)" strokeWidth={1} />

        <defs>
          <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--viz-series-blue)" stopOpacity={0.18} />
            <stop offset="100%" stopColor="var(--viz-series-blue)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#trend-fill)" stroke="none" />
        <path d={linePath} fill="none" stroke="var(--viz-series-blue)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {hovered && (
          <>
            <line x1={hovered.x} y1={PAD_TOP} x2={hovered.x} y2={PAD_TOP + plotH} stroke="var(--viz-muted)" strokeWidth={1} strokeDasharray="3 3" />
            <circle cx={hovered.x} cy={hovered.y} r={4} fill="var(--viz-series-blue)" stroke="var(--viz-surface)" strokeWidth={2} />
          </>
        )}

        {/* first/last date labels */}
        <text x={PAD_X} y={HEIGHT - 4} fontSize={10} fill="var(--viz-muted)">
          {data[0].label}
        </text>
        <text x={WIDTH - PAD_X} y={HEIGHT - 4} fontSize={10} fill="var(--viz-muted)" textAnchor="end">
          {data[data.length - 1].label}
        </text>
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-card)] px-2.5 py-1.5 text-xs shadow-lg"
          style={{ left: `${(hovered.x / WIDTH) * 100}%`, top: `${(hovered.y / HEIGHT) * 100}%` }}
        >
          <p className="font-semibold text-[var(--text-primary)]">{hovered.value}</p>
          <p className="text-[var(--text-secondary)]">{hovered.label}</p>
        </div>
      )}
    </div>
  );
}
