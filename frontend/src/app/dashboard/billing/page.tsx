'use client';

import { useState } from 'react';
import { CreditCard, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DataTable } from '@/components/common/data-table';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Payment } from '@/types';

const usage = { impressionsUsed: 8450000, impressionsLimit: 10000000, spendUsed: 45280, spendLimit: 100000 };

const billingHistory: Payment[] = [
  { id: 'inv_001', userId: 'u1', amount: 5000, currency: 'USD', status: 'COMPLETED', type: 'CHARGE', description: 'Campaign: Summer Sale - Monthly charge', method: 'Visa **4242', createdAt: '2024-07-01T00:00:00Z', updatedAt: '2024-07-01T00:00:00Z' },
  { id: 'inv_002', userId: 'u1', amount: 7500, currency: 'USD', status: 'COMPLETED', type: 'CHARGE', description: 'Campaign: Brand Q3 - Monthly charge', method: 'Visa **4242', createdAt: '2024-08-01T00:00:00Z', updatedAt: '2024-08-01T00:00:00Z' },
  { id: 'inv_003', userId: 'u1', amount: 10000, currency: 'USD', status: 'PENDING', type: 'CHARGE', description: 'Campaign: Product Launch - Monthly charge', method: 'Visa **4242', createdAt: '2024-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z' },
  { id: 'dep_001', userId: 'u1', amount: 25000, currency: 'USD', status: 'COMPLETED', type: 'DEPOSIT', description: 'Wallet deposit', method: 'Wire Transfer', createdAt: '2024-06-15T00:00:00Z', updatedAt: '2024-06-15T00:00:00Z' },
  { id: 'dep_002', userId: 'u1', amount: 15000, currency: 'USD', status: 'COMPLETED', type: 'DEPOSIT', description: 'Wallet top-up', method: 'Visa **4242', createdAt: '2024-07-20T00:00:00Z', updatedAt: '2024-07-20T00:00:00Z' },
];

const paymentMethods = [
  { id: 'pm_1', type: 'Visa', last4: '4242', isDefault: true },
  { id: 'pm_2', type: 'Mastercard', last4: '8888', isDefault: false },
];

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState('history');

  const invoiceColumns = [
    { key: 'description', header: 'Description' },
    { key: 'amount', header: 'Amount', sortable: true, render: (p: Payment) => formatCurrency(p.amount) },
    { key: 'type', header: 'Type', render: (p: Payment) => <Badge variant="outline">{p.type}</Badge> },
    { key: 'status', header: 'Status', render: (p: Payment) => (
      <Badge variant={p.status === 'COMPLETED' ? 'success' : p.status === 'PENDING' ? 'warning' : 'destructive'}>{p.status}</Badge>
    )},
    { key: 'method', header: 'Method' },
    { key: 'createdAt', header: 'Date', sortable: true, render: (p: Payment) => formatDate(p.createdAt) },
    { key: 'actions', header: '', render: () => (
      <Button variant="ghost" size="icon-sm"><MoreHorizontal className="h-4 w-4" /></Button>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">Manage your billing and payment methods</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Add Payment Method</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Usage</CardTitle>
            <CardDescription>This billing cycle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Impressions</span>
                <span>{usage.impressionsUsed.toLocaleString()} / {usage.impressionsLimit.toLocaleString()}</span>
              </div>
              <Progress value={(usage.impressionsUsed / usage.impressionsLimit) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Spend</span>
                <span>{formatCurrency(usage.spendUsed)} / {formatCurrency(usage.spendLimit)}</span>
              </div>
              <Progress value={(usage.spendUsed / usage.spendLimit) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Your saved payment methods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {paymentMethods.map((pm) => (
              <div key={pm.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{pm.type} ****{pm.last4}</p>
                    {pm.isDefault && <p className="text-xs text-muted-foreground">Default</p>}
                  </div>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>All your invoices and transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={invoiceColumns}
            data={billingHistory}
            searchable
            searchKeys={['description', 'type', 'status']}
          />
        </CardContent>
      </Card>
    </div>
  );
}
