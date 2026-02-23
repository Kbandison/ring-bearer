'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export function SignupsChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          interval="preserveStartEnd"
          tickLine={false}
          axisLine={false}
        />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          labelStyle={{ fontWeight: 600 }}
        />
        <Area
          type="monotone"
          dataKey="count"
          name="Signups"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#signupGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
