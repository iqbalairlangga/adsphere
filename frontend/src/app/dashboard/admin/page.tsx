'use client';

import { Users, Megaphone, DollarSign, Shield, TrendingUp, Activity } from 'lucide-react';
import { MetricCard } from '@/components/charts/metric-card';
import { AreaChart } from '@/components/charts/area-chart';
import { BarChart } from '@/components/charts/bar-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber } from '@/lib/utils';

const metrics = [
  { title: 'Total Users', value: formatNumber(28400), change: 12.5, icon: <Users className="h-4 w-4" /> },
  { title: 'Active Campaigns', value: formatNumber(1200), change: 8.3, icon: <Megaphone className="h-4 w-4" /> },
  { title: 'Revenue (30d)', value: formatCurrency(892000), change: 15.2, icon: <DollarSign className="h-4 w-4" /> },
  { title: 'Fraud Alerts', value: '24', change: -18.5, icon: <Shield className="h-4 w-4" /> },
];

const revenueData = Array.from({ length: 30 }, (_, i) => ({
  date: `Day ${i + 1}`,
  revenue: Math.floor(Math.random() * 50000) + 20000,
  expenses: Math.floor(Math.random() * 30000) + 10000,
}));

const userGrowth = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
  advertisers: Math.floor(Math.random() * 500) + 200,
  publishers: Math.floor(Math.random() * 400) + 150,
}));

const recentUsers = [
  { name: 'John Smith', email: 'john@example.com', role: 'Advertiser', status: 'Active', joined: '2 hours ago' },
  { name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Publisher', status: 'Active', joined: '5 hours ago' },
  { name: 'Mike Wilson', email: 'mike@example.com', role: 'Advertiser', status: 'Pending', joined: '1 day ago' },
  { name: 'Emily Brown', email: 'emily@example.com', role: 'Publisher', status: 'Active', joined: '2 days ago' },
  { name: 'Alex Garcia', email: 'alex@example.com', role: 'Admin', status: 'Active', joined: '3 days ago' },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and management</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => <MetricCard key={m.title} {...m} />)}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Platform Revenue</CardTitle>
            <CardDescription>Revenue vs expenses over last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={revenueData}
              xKey="date"
              series={[
                { key: 'revenue', color: '#10b981', name: 'Revenue' },
                { key: 'expenses', color: '#ef4444', name: 'Expenses' },
              ]}
              height={300}
              showLegend
              formatY={(v) => formatCurrency(v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Advertisers vs Publishers</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={userGrowth}
              xKey="month"
              series={[
                { key: 'advertisers', color: 'hsl(var(--primary))', name: 'Advertisers' },
                { key: 'publishers', color: '#10b981', name: 'Publishers' },
              ]}
              height={300}
              showLegend
              formatY={(v) => formatNumber(v)}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
          <CardDescription>Latest user registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.email} className="border-b last:border-0">
                    <td className="py-3 font-medium">{u.name}</td>
                    <td className="py-3 text-muted-foreground">{u.email}</td>
                    <td className="py-3">
                      <Badge variant="outline">{u.role}</Badge>
                    </td>
                    <td className="py-3">
                      <Badge variant={u.status === 'Active' ? 'success' : 'warning'}>{u.status}</Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">{u.joined}</td>
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
