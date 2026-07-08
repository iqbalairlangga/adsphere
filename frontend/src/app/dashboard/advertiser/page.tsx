'use client';

import { Eye, MousePointerClick, DollarSign, TrendingUp, Target, Users, Clock, BarChart3 } from 'lucide-react';
import { MetricCard } from '@/components/charts/metric-card';
import { AreaChart } from '@/components/charts/area-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber } from '@/lib/utils';

const metrics = [
  { title: 'Active Campaigns', value: '12', change: 2, icon: <Target className="h-4 w-4" /> },
  { title: 'Total Impressions', value: formatNumber(12500000), change: 15.3, icon: <Eye className="h-4 w-4" /> },
  { title: 'Total Clicks', value: formatNumber(384500), change: 12.1, icon: <MousePointerClick className="h-4 w-4" /> },
  { title: 'Total Spend', value: formatCurrency(284500), change: 18.7, icon: <DollarSign className="h-4 w-4" /> },
];

const chartData = Array.from({ length: 30 }, (_, i) => ({
  date: `Day ${i + 1}`,
  spend: Math.floor(Math.random() * 5000) + 2000,
  impressions: Math.floor(Math.random() * 200000) + 100000,
}));

const campaigns = [
  { name: 'Summer Sale', status: 'Active', spend: 45280, impressions: 2845000, clicks: 89200, ctr: 3.14 },
  { name: 'Brand Q3', status: 'Active', spend: 38400, impressions: 2100000, clicks: 65000, ctr: 3.10 },
  { name: 'Product Launch', status: 'Pending', spend: 0, impressions: 0, clicks: 0, ctr: 0 },
  { name: 'Retargeting', status: 'Paused', spend: 15800, impressions: 1200000, clicks: 48000, ctr: 4.0 },
];

export default function AdvertiserPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Advertiser Dashboard</h1>
        <p className="text-muted-foreground">Your advertising performance overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => <MetricCard key={m.title} {...m} />)}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Spend Trend</CardTitle>
            <CardDescription>Daily ad spend over last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={chartData}
              xKey="date"
              series={[{ key: 'spend', color: '#f59e0b', name: 'Spend' }]}
              height={300}
              formatY={(v) => formatCurrency(v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impressions Trend</CardTitle>
            <CardDescription>Daily impressions over last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={chartData}
              xKey="date"
              series={[{ key: 'impressions', color: 'hsl(var(--primary))', name: 'Impressions' }]}
              height={300}
              formatY={(v) => formatNumber(v)}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Overview</CardTitle>
          <CardDescription>Your active and pending campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">Campaign</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Spend</th>
                  <th className="pb-3 font-medium text-right">Impressions</th>
                  <th className="pb-3 font-medium text-right">Clicks</th>
                  <th className="pb-3 font-medium text-right">CTR</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.name} className="border-b last:border-0">
                    <td className="py-3 font-medium">{c.name}</td>
                    <td className="py-3">
                      <Badge variant={c.status === 'Active' ? 'success' : c.status === 'Paused' ? 'info' : 'secondary'}>{c.status}</Badge>
                    </td>
                    <td className="py-3 text-right">{c.spend ? formatCurrency(c.spend) : '-'}</td>
                    <td className="py-3 text-right">{c.impressions ? formatNumber(c.impressions) : '-'}</td>
                    <td className="py-3 text-right">{c.clicks ? formatNumber(c.clicks) : '-'}</td>
                    <td className="py-3 text-right">{c.ctr ? `${c.ctr}%` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
