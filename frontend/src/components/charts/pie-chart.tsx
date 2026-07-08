'use client';

import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PieChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  formatValue?: (value: number) => string;
}

const DEFAULT_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2, 215 100% 50%))',
  'hsl(var(--chart-3, 142 70% 45%))',
  'hsl(var(--chart-4, 48 96% 53%))',
  'hsl(var(--chart-5, 0 72% 51%))',
];

export function PieChart({
  data,
  height = 300,
  innerRadius = 60,
  outerRadius = 100,
  showLegend = false,
  formatValue,
}: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid hsl(var(--border))',
            background: 'hsl(var(--background))',
          }}
          formatter={(value: number) => [formatValue ? formatValue(value) : value.toLocaleString()]}
        />
        {showLegend && <Legend />}
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
