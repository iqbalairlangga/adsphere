'use client';

import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  format?: 'currency' | 'percentage' | 'number';
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}

export function MetricCard({ title, value, change, changeLabel, icon, loading }: MetricCardProps) {
  const trend = change != null ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : undefined;
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'up'
      ? 'text-emerald-600 dark:text-emerald-400'
      : trend === 'down'
        ? 'text-red-600 dark:text-red-400'
        : 'text-muted-foreground';

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {(change != null || changeLabel) && (
          <div className="mt-1 flex items-center gap-1">
            {change != null && (
              <span className={cn('flex items-center text-xs font-medium', trendColor)}>
                <TrendIcon className="mr-0.5 h-3 w-3" />
                {Math.abs(change).toFixed(1)}%
              </span>
            )}
            {changeLabel && <span className="text-xs text-muted-foreground">{changeLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
