'use client';

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface BarChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  series: Array<{ key: string; color: string; name: string }>;
  height?: number;
  stacked?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  formatY?: (value: number) => string;
  layout?: 'horizontal' | 'vertical';
}

export function BarChart({
  data,
  xKey,
  series,
  height = 300,
  stacked = false,
  showGrid = true,
  showLegend = false,
  formatY,
  layout = 'horizontal',
}: BarChartProps) {
  const isVertical = layout === 'vertical';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout={layout}
        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
        {isVertical ? (
          <>
            <XAxis type="number" tick={{ fontSize: 12 }} className="text-muted-foreground" tickFormatter={formatY} />
            <YAxis dataKey={xKey} type="category" tick={{ fontSize: 12 }} className="text-muted-foreground" />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" tickFormatter={formatY} />
          </>
        )}
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
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.name}
            fill={s.color}
            stackId={stacked ? 'stack' : undefined}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
