"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Single-series charts: one hue (lime accent), no legend — the card title
// names the series. Grid/axes stay recessive.
const ACCENT = "#a3e635";
const GRID = "#1d4a2e";
const INK_MUTED = "#8fb89a";

const tooltipStyle = {
  backgroundColor: "#11331f",
  border: "1px solid #1d4a2e",
  borderRadius: 12,
  color: "#e7f6e9",
  fontSize: 12,
} as const;

const axisProps = {
  stroke: INK_MUTED,
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;

export function RateTrendChart({ data }: { data: { date: string; rate: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" {...axisProps} />
        <YAxis {...axisProps} width={56} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v) => [`₹${Number(v).toFixed(2)}/g`, "avg rate"]}
        />
        <Line
          type="monotone"
          dataKey="rate"
          stroke={ACCENT}
          strokeWidth={2}
          dot={{ r: 3, fill: ACCENT, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CumulativeSmokedChart({ data }: { data: { date: string; total: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="smokeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
            <stop offset="100%" stopColor={ACCENT} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" {...axisProps} />
        <YAxis {...axisProps} width={44} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v) => [`${Number(v).toFixed(2)}g`, "total burned"]}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke={ACCENT}
          strokeWidth={2}
          fill="url(#smokeFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MemberGramsChart({ data }: { data: { name: string; grams: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(140, data.length * 44)}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" {...axisProps} />
        <YAxis type="category" dataKey="name" {...axisProps} width={90} />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "#11331f" }}
          formatter={(v) => [`${Number(v).toFixed(2)}g`, "smoked"]}
        />
        <Bar dataKey="grams" fill={ACCENT} radius={[0, 4, 4, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}
