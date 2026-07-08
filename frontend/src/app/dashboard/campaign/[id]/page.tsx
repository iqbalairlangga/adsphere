'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Edit3, PauseCircle, PlayCircle, Trash2, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart } from '@/components/charts/area-chart';
import { MetricCard } from '@/components/charts/metric-card';
import { DataTable } from '@/components/common/data-table';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import type { Campaign, CampaignStatus, Ad, User } from '@/types';

const statusColors: Record<CampaignStatus, 'success' | 'warning' | 'info' | 'secondary' | 'outline' | 'destructive'> = {
  DRAFT: 'secondary', PENDING: 'warning', ACTIVE: 'success', PAUSED: 'info', COMPLETED: 'outline', CANCELLED: 'destructive',
};

const campaign: Campaign = {
  id: '1', name: 'Summer Sale 2024', description: 'Summer promotional campaign targeting young adults aged 18-35. Focus on beachwear and outdoor equipment.',
  status: 'ACTIVE', budget: 50000, dailyBudget: 2000, startDate: '2024-06-01T00:00:00Z', endDate: '2024-08-31T00:00:00Z',
  targeting: { countries: ['US', 'CA', 'UK'], devices: ['mobile', 'desktop'], platforms: ['instagram', 'facebook'], ageRange: [18, 35] },
  userId: 'u1', createdAt: '2024-05-15T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z',
  stats: { impressions: 2845000, clicks: 89200, conversions: 3450, spend: 45280, ctr: 3.14, cpc: 0.51, cpm: 15.92 },
};

const chartData = Array.from({ length: 14 }, (_, i) => ({
  date: `Day ${i + 1}`,
  impressions: Math.floor(Math.random() * 80000) + 20000,
  clicks: Math.floor(Math.random() * 4000) + 500,
  conversions: Math.floor(Math.random() * 200) + 20,
}));

const ads: Ad[] = [
  { id: 'a1', name: 'Beachwear Banner', campaignId: '1', format: 'BANNER', status: 'ACTIVE', headline: 'Summer is Here!', description: 'Get 20% off all beachwear', destinationUrl: 'https://example.com/beach', impressions: 1200000, clicks: 45000, conversions: 1800, spend: 22500, dimensions: '728x90', createdAt: '2024-05-20T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'a2', name: 'Outdoor Video', campaignId: '1', format: 'VIDEO', status: 'ACTIVE', headline: 'Adventure Awaits', destinationUrl: 'https://example.com/outdoor', impressions: 845000, clicks: 28000, conversions: 1100, spend: 15800, dimensions: '1920x1080', createdAt: '2024-05-22T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'a3', name: 'Mobile Interstitial', campaignId: '1', format: 'INTERSTITIAL', status: 'PAUSED', headline: 'Flash Sale!', destinationUrl: 'https://example.com/sale', impressions: 800000, clicks: 16200, conversions: 550, spend: 6980, dimensions: '360x640', createdAt: '2024-05-25T00:00:00Z', updatedAt: '2024-06-10T00:00:00Z' },
];

export default function CampaignDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/campaign">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{campaign.name}</h1>
              <Badge variant={statusColors[campaign.status]}>{campaign.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Created {formatDate(campaign.createdAt)} &middot; {campaign.ads?.length || 0} ads
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {campaign.status === 'ACTIVE' ? (
            <Button variant="outline" className="gap-2"><PauseCircle className="h-4 w-4" /> Pause</Button>
          ) : (
            <Button variant="outline" className="gap-2"><PlayCircle className="h-4 w-4" /> Activate</Button>
          )}
          <Button variant="outline" size="icon"><Edit3 className="h-4 w-4" /></Button>
          <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard title="Impressions" value={formatNumber(campaign.stats!.impressions)} change={10.2} />
        <MetricCard title="Clicks" value={formatNumber(campaign.stats!.clicks)} change={7.8} />
        <MetricCard title="Conversions" value={formatNumber(campaign.stats!.conversions)} change={15.3} />
        <MetricCard title="CTR" value={`${campaign.stats!.ctr}%`} change={-2.1} />
        <MetricCard title="Spend" value={formatCurrency(campaign.stats!.spend)} change={12.4} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ads">Ads</TabsTrigger>
          <TabsTrigger value="targeting">Targeting</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
              <CardDescription>14-day performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <AreaChart
                data={chartData}
                xKey="date"
                series={[
                  { key: 'impressions', color: 'hsl(var(--primary))', name: 'Impressions' },
                  { key: 'clicks', color: '#10b981', name: 'Clicks' },
                  { key: 'conversions', color: '#f59e0b', name: 'Conversions' },
                ]}
                height={300}
                showLegend
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget Overview</CardTitle>
              <CardDescription>${formatCurrency(campaign.stats!.spend)} of {formatCurrency(campaign.budget)} spent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Budget</span>
                  <span className="font-medium">{formatCurrency(campaign.budget)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(campaign.stats!.spend / campaign.budget) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Spent: {formatCurrency(campaign.stats!.spend)}</span>
                  <span>Remaining: {formatCurrency(campaign.budget - campaign.stats!.spend)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads">
          <Card>
            <CardHeader>
              <CardTitle>Ad Creatives</CardTitle>
              <CardDescription>All ads in this campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  { key: 'name', header: 'Name' },
                  { key: 'format', header: 'Format' },
                  { key: 'status', header: 'Status', render: (ad: Ad) => <Badge variant={ad.status === 'ACTIVE' ? 'success' : 'secondary'}>{ad.status}</Badge> },
                  { key: 'impressions', header: 'Impressions', sortable: true, render: (ad: Ad) => formatNumber(ad.impressions) },
                  { key: 'clicks', header: 'Clicks', sortable: true, render: (ad: Ad) => formatNumber(ad.clicks) },
                  { key: 'spend', header: 'Spend', sortable: true, render: (ad: Ad) => formatCurrency(ad.spend) },
                  { key: 'ctr', header: 'CTR', render: (ad: Ad) => `${((ad.clicks / ad.impressions) * 100).toFixed(2)}%` },
                ]}
                data={ads}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targeting">
          <Card>
            <CardHeader>
              <CardTitle>Targeting Configuration</CardTitle>
              <CardDescription>Who sees your ads</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {campaign.targeting && (
                <>
                  <div>
                    <h4 className="mb-1 text-sm font-medium">Countries</h4>
                    <div className="flex flex-wrap gap-2">
                      {campaign.targeting.countries?.map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm font-medium">Devices</h4>
                    <div className="flex flex-wrap gap-2">
                      {campaign.targeting.devices?.map((d) => <Badge key={d} variant="secondary">{d}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm font-medium">Platforms</h4>
                    <div className="flex flex-wrap gap-2">
                      {campaign.targeting.platforms?.map((p) => <Badge key={p} variant="secondary">{p}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm font-medium">Age Range</h4>
                    <p className="text-sm text-muted-foreground">{campaign.targeting.ageRange?.[0]} - {campaign.targeting.ageRange?.[1]} years</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Settings</CardTitle>
              <CardDescription>Edit campaign configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Campaign Name</label>
                  <p className="text-sm text-muted-foreground">{campaign.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <p className="text-sm text-muted-foreground">{campaign.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Total Budget</label>
                  <p className="text-sm text-muted-foreground">{formatCurrency(campaign.budget)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Daily Budget</label>
                  <p className="text-sm text-muted-foreground">{campaign.dailyBudget ? formatCurrency(campaign.dailyBudget) : 'Unlimited'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <p className="text-sm text-muted-foreground">{formatDate(campaign.startDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <p className="text-sm text-muted-foreground">{campaign.endDate ? formatDate(campaign.endDate) : 'Ongoing'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-muted-foreground">{campaign.description || 'No description'}</p>
              </div>
              <Button className="mt-2">Edit Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
