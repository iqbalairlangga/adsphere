'use client';

import { Globe, Newspaper, TrendingUp, DollarSign, Eye, MousePointerClick } from 'lucide-react';
import { MetricCard } from '@/components/charts/metric-card';
import { AreaChart } from '@/components/charts/area-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber } from '@/lib/utils';

const metrics = [
  { title: 'Active Websites', value: '5', change: 0, icon: <Globe className="h-4 w-4" /> },
  { title: 'Ad Units', value: '18', change: 3, icon: <Newspaper className="h-4 w-4" /> },
  { title: 'Total Earnings', value: formatCurrency(67200), change: 22.5, icon: <DollarSign className="h-4 w-4" /> },
  { title: 'Page RPM', value: '$8.45', change: 5.2, icon: <TrendingUp className="h-4 w-4" /> },
];

const chartData = Array.from({ length: 30 }, (_, i) => ({
  date: `Day ${i + 1}`,
  earnings: Math.floor(Math.random() * 2000) + 500,
  pageViews: Math.floor(Math.random() * 50000) + 10000,
}));

const websites = [
  { name: 'techblog.com', status: 'Active', pageViews: 450000, earnings: 28400, rpm: 6.31 },
  { name: 'travelguide.net', status: 'Active', pageViews: 320000, earnings: 19800, rpm: 6.19 },
  { name: 'fitnesshub.org', status: 'Active', pageViews: 280000, earnings: 14200, rpm: 5.07 },
  { name: 'foodiefeed.com', status: 'Pending', pageViews: 0, earnings: 0, rpm: 0 },
  { name: 'gadgetreview.io', status: 'Active', pageViews: 150000, earnings: 4800, rpm: 3.20 },
];

export default function PublisherPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Publisher Dashboard</h1>
        <p className="text-muted-foreground">Your monetization performance overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => <MetricCard key={m.title} {...m} />)}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Earnings Trend</CardTitle>
            <CardDescription>Daily earnings over last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={chartData}
              xKey="date"
              series={[{ key: 'earnings', color: '#10b981', name: 'Earnings' }]}
              height={300}
              formatY={(v) => formatCurrency(v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Page Views Trend</CardTitle>
            <CardDescription>Daily page views over last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={chartData}
              xKey="date"
              series={[{ key: 'pageViews', color: 'hsl(var(--primary))', name: 'Page Views' }]}
              height={300}
              formatY={(v) => formatNumber(v)}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Websites Overview</CardTitle>
          <CardDescription>Your registered websites and their performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">Website</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Page Views</th>
                  <th className="pb-3 font-medium text-right">Earnings</th>
                  <th className="pb-3 font-medium text-right">RPM</th>
                </tr>
              </thead>
              <tbody>
                {websites.map((w) => (
                  <tr key={w.name} className="border-b last:border-0">
                    <td className="py-3 font-medium">{w.name}</td>
                    <td className="py-3">
                      <Badge variant={w.status === 'Active' ? 'success' : 'secondary'}>{w.status}</Badge>
                    </td>
                    <td className="py-3 text-right">{w.pageViews ? formatNumber(w.pageViews) : '-'}</td>
                    <td className="py-3 text-right">{w.earnings ? formatCurrency(w.earnings) : '-'}</td>
                    <td className="py-3 text-right">{w.rpm ? `$${w.rpm.toFixed(2)}` : '-'}</td>
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
