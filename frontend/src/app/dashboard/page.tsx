'use client';

import { useState } from 'react';
import { Eye, MousePointerClick, DollarSign, TrendingUp, ArrowUpRight } from 'lucide-react';
import { MetricCard } from '@/components/charts/metric-card';
import { AreaChart } from '@/components/charts/area-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber, formatDateTime } from '@/lib/utils';

const mockMetrics = [
  { title: 'Impressions', value: formatNumber(2845000), change: 12.5, icon: <Eye className="h-4 w-4" /> },
  { title: 'Clicks', value: formatNumber(89200), change: 8.3, icon: <MousePointerClick className="h-4 w-4" /> },
  { title: 'Revenue', value: formatCurrency(45280), change: 15.2, icon: <DollarSign className="h-4 w-4" /> },
  { title: 'CTR', value: '3.14%', change: -2.1, icon: <TrendingUp className="h-4 w-4" /> },
];

const chartData = Array.from({ length: 30 }, (_, i) => ({
  date: `Day ${i + 1}`,
  impressions: Math.floor(Math.random() * 100000) + 50000,
  clicks: Math.floor(Math.random() * 5000) + 1000,
}));

const recentActivity = [
  { id: '1', action: 'Campaign "Summer Sale" started', type: 'success', time: new Date() },
  { id: '2', action: 'New ad creative approved', type: 'info', time: new Date(Date.now() - 3600000) },
  { id: '3', action: 'Budget reached 80% for "Brand Awareness"', type: 'warning', time: new Date(Date.now() - 7200000) },
  { id: '4', action: 'Payment of $2,500 processed', type: 'success', time: new Date(Date.now() - 86400000) },
  { id: '5', action: 'New impression milestone: 5M', type: 'info', time: new Date(Date.now() - 172800000) },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your advertising overview at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mockMetrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Impressions and clicks over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={chartData}
              xKey="date"
              series={[
                { key: 'impressions', color: 'hsl(var(--primary))', name: 'Impressions' },
                { key: 'clicks', color: 'hsl(var(--chart-3, 142 70% 45%))', name: 'Clicks' },
              ]}
              height={350}
              showLegend
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                      activity.type === 'success'
                        ? 'bg-emerald-500'
                        : activity.type === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(activity.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
