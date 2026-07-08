'use client';

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface AreaChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  series: Array<{ key: string; color: string; name: string }>;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  formatY?: (value: number) => string;
}

export function AreaChart({
  data,
  xKey,
  series,
  height = 300,
  showGrid = true,
  showLegend = false,
  formatY,
}: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          className="text-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatY}
          className="text-muted-foreground"
        />
        <Tooltip
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid hsl(var(--border))',
            background: 'hsl(var(--background))',
          }}
          formatter={(value: number) => [formatY ? formatY(value) : value.toLocaleString()]}
        />
        {showLegend && <Legend />}
        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            fill={s.color}
            fillOpacity={0.1}
            strokeWidth={2}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
