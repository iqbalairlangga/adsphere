'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/common/data-table';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Campaign, CampaignStatus } from '@/types';

const statusColors: Record<CampaignStatus, 'success' | 'warning' | 'info' | 'secondary' | 'outline' | 'destructive'> = {
  DRAFT: 'secondary',
  PENDING: 'warning',
  ACTIVE: 'success',
  PAUSED: 'info',
  COMPLETED: 'outline',
  CANCELLED: 'destructive',
};

const mockCampaigns: Campaign[] = [
  { id: '1', name: 'Summer Sale 2024', description: 'Summer promotional campaign', status: 'ACTIVE', budget: 50000, dailyBudget: 2000, startDate: '2024-06-01T00:00:00Z', endDate: '2024-08-31T00:00:00Z', userId: 'u1', createdAt: '2024-05-15T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: '2', name: 'Brand Awareness Q3', description: 'Q3 brand awareness push', status: 'ACTIVE', budget: 75000, dailyBudget: 2500, startDate: '2024-07-01T00:00:00Z', endDate: '2024-09-30T00:00:00Z', userId: 'u1', createdAt: '2024-06-20T00:00:00Z', updatedAt: '2024-07-01T00:00:00Z' },
  { id: '3', name: 'Product Launch', description: 'New product line launch', status: 'PENDING', budget: 100000, dailyBudget: 5000, startDate: '2024-09-01T00:00:00Z', endDate: '2024-12-31T00:00:00Z', userId: 'u1', createdAt: '2024-08-01T00:00:00Z', updatedAt: '2024-08-15T00:00:00Z' },
  { id: '4', name: 'Retargeting Campaign', status: 'PAUSED', budget: 25000, dailyBudget: 1000, startDate: '2024-05-01T00:00:00Z', userId: 'u1', createdAt: '2024-04-20T00:00:00Z', updatedAt: '2024-06-15T00:00:00Z' },
  { id: '5', name: 'Holiday Special', status: 'DRAFT', budget: 150000, dailyBudget: 10000, startDate: '2024-11-15T00:00:00Z', endDate: '2025-01-15T00:00:00Z', userId: 'u1', createdAt: '2024-10-01T00:00:00Z', updatedAt: '2024-10-01T00:00:00Z' },
];

export default function CampaignsPage() {
  const [search, setSearch] = useState('');

  const columns = [
    { key: 'name', header: 'Campaign', sortable: true, render: (c: Campaign) => (
      <Link href={`/dashboard/campaign/${c.id}`} className="font-medium hover:underline">
        {c.name}
      </Link>
    )},
    { key: 'status', header: 'Status', render: (c: Campaign) => (
      <Badge variant={statusColors[c.status]}>{c.status}</Badge>
    )},
    { key: 'budget', header: 'Budget', sortable: true, render: (c: Campaign) => formatCurrency(c.budget) },
    { key: 'dailyBudget', header: 'Daily Budget', render: (c: Campaign) => c.dailyBudget ? formatCurrency(c.dailyBudget) : '-' },
    { key: 'startDate', header: 'Start Date', sortable: true, render: (c: Campaign) => formatDate(c.startDate) },
    { key: 'endDate', header: 'End Date', render: (c: Campaign) => c.endDate ? formatDate(c.endDate) : 'Ongoing' },
    { key: 'actions', header: '', render: (c: Campaign) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/campaign/${c.id}`}>View Details</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">Manage your advertising campaigns</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>{mockCampaigns.length} total campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={mockCampaigns}
            searchable
            searchKeys={['name', 'description', 'status']}
          />
        </CardContent>
      </Card>
    </div>
  );
}
