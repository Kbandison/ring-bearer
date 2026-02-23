'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export function SwipesChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
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
        <Bar dataKey="count" name="Swipes" fill="#f59e0b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
