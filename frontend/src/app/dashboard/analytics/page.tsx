'use client';

import { useState } from 'react';
import { Download, Calendar, Eye, MousePointerClick, DollarSign, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/charts/metric-card';
import { AreaChart } from '@/components/charts/area-chart';
import { BarChart } from '@/components/charts/bar-chart';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState('Last 30 Days');

  const summaryMetrics = [
    { title: 'Total Impressions', value: formatNumber(12500000), change: 15.3, icon: <Eye className="h-4 w-4" /> },
    { title: 'Total Clicks', value: formatNumber(384500), change: 12.1, icon: <MousePointerClick className="h-4 w-4" /> },
    { title: 'Total Revenue', value: formatCurrency(284500), change: 18.7, icon: <DollarSign className="h-4 w-4" /> },
    { title: 'Avg CTR', value: '3.08%', change: -2.8, icon: <TrendingUp className="h-4 w-4" /> },
    { title: 'Avg CPC', value: '$0.74', change: 5.2, icon: <TrendingUp className="h-4 w-4" /> },
    { title: 'Avg CPM', value: '$22.76', change: 3.4, icon: <TrendingUp className="h-4 w-4" /> },
  ];

  const chartData = Array.from({ length: 30 }, (_, i) => ({
    date: `Day ${i + 1}`,
    impressions: Math.floor(Math.random() * 200000) + 100000,
    clicks: Math.floor(Math.random() * 8000) + 2000,
    revenue: Math.floor(Math.random() * 5000) + 2000,
  }));

  const deviceData = [
    { name: 'Mobile', value: 58, color: '#3b82f6' },
    { name: 'Desktop', value: 30, color: '#10b981' },
    { name: 'Tablet', value: 12, color: '#f59e0b' },
  ];

  const rangeOptions = ['Today', 'Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year', 'Custom'];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Comprehensive performance reports</p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                {selectedRange}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {rangeOptions.map((r) => (
                <DropdownMenuItem key={r} onClick={() => setSelectedRange(r)}>
                  {r}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem>Export as Excel</DropdownMenuItem>
              <DropdownMenuItem>Export as PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {summaryMetrics.map((m) => (
          <MetricCard key={m.title} {...m} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Impressions & Clicks</CardTitle>
            <CardDescription>Daily trend over selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={chartData}
              xKey="date"
              series={[
                { key: 'impressions', color: 'hsl(var(--primary))', name: 'Impressions' },
                { key: 'clicks', color: '#10b981', name: 'Clicks' },
              ]}
              height={300}
              showLegend
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Daily revenue over selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={chartData}
              xKey="date"
              series={[{ key: 'revenue', color: '#f59e0b', name: 'Revenue' }]}
              height={300}
              formatY={(v) => `$${v.toLocaleString()}`}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>Top campaigns by impressions</CardDescription>
        </CardHeader>
        <CardContent>
          <BarChart
            data={[
              { name: 'Summer Sale', impressions: 2845000, clicks: 89200 },
              { name: 'Brand Q3', impressions: 2100000, clicks: 65000 },
              { name: 'Product Launch', impressions: 1850000, clicks: 54000 },
              { name: 'Retargeting', impressions: 1200000, clicks: 48000 },
              { name: 'Holiday', impressions: 950000, clicks: 28000 },
            ]}
            xKey="name"
            series={[
              { key: 'impressions', color: 'hsl(var(--primary))', name: 'Impressions' },
              { key: 'clicks', color: '#10b981', name: 'Clicks' },
            ]}
            height={300}
            showLegend
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Device Breakdown</CardTitle>
          <CardDescription>Performance by device type</CardDescription>
        </CardHeader>
        <CardContent>
          <BarChart
            data={[
              { device: 'Mobile', impressions: 7250000, clicks: 223000, revenue: 165000 },
              { device: 'Desktop', impressions: 3750000, clicks: 115350, revenue: 85400 },
              { device: 'Tablet', impressions: 1500000, clicks: 46150, revenue: 34100 },
            ]}
            xKey="device"
            series={[
              { key: 'impressions', color: '#3b82f6', name: 'Impressions' },
              { key: 'revenue', color: '#10b981', name: 'Revenue' },
            ]}
            height={250}
            showLegend
            formatY={(v) => formatNumber(v)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
