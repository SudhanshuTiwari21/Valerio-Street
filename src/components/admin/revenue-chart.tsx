"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function RevenueChart({ data }: { data: { date: string; total: number }[] }) {
  if (!data.length) {
    return (
      <div className="mt-6 flex h-64 items-center justify-center text-sm text-bone/40">
        Not enough data yet.
      </div>
    );
  }
  return (
    <div className="mt-4 h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B89B72" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#B89B72" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(245,241,234,0.08)" />
          <XAxis dataKey="date" stroke="rgba(245,241,234,0.45)" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="rgba(245,241,234,0.45)" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: "#1A1A1A", border: "1px solid rgba(245,241,234,0.15)", color: "#F5F1EA" }}
            labelStyle={{ color: "#F5F1EA" }}
          />
          <Area type="monotone" dataKey="total" stroke="#B89B72" fill="url(#rev)" strokeWidth={1.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
