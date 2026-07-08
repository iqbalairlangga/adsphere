'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, Wallet as WalletIcon, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/common/data-table';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import type { Payment } from '@/types';

const wallet = { balance: 45800, pendingBalance: 2500, totalDeposited: 125000, totalWithdrawn: 79200 };

const transactions: Payment[] = [
  { id: 't1', userId: 'u1', amount: 5000, currency: 'USD', status: 'COMPLETED', type: 'DEPOSIT', description: 'Wallet deposit', createdAt: '2024-09-01T10:30:00Z', updatedAt: '2024-09-01T10:30:00Z' },
  { id: 't2', userId: 'u1', amount: 2500, currency: 'USD', status: 'COMPLETED', type: 'WITHDRAWAL', description: 'Withdrawal to bank', createdAt: '2024-08-28T14:00:00Z', updatedAt: '2024-08-28T14:00:00Z' },
  { id: 't3', userId: 'u1', amount: 1200, currency: 'USD', status: 'COMPLETED', type: 'CHARGE', description: 'Campaign: Summer Sale', createdAt: '2024-08-25T00:00:00Z', updatedAt: '2024-08-25T00:00:00Z' },
  { id: 't4', userId: 'u1', amount: 800, currency: 'USD', status: 'PENDING', type: 'REFUND', description: 'Campaign credit adjustment', createdAt: '2024-08-24T00:00:00Z', updatedAt: '2024-08-24T00:00:00Z' },
  { id: 't5', userId: 'u1', amount: 3000, currency: 'USD', status: 'COMPLETED', type: 'DEPOSIT', description: 'Wire transfer deposit', createdAt: '2024-08-20T09:00:00Z', updatedAt: '2024-08-20T09:00:00Z' },
  { id: 't6', userId: 'u1', amount: 1500, currency: 'USD', status: 'COMPLETED', type: 'WITHDRAWAL', description: 'Withdrawal to PayPal', createdAt: '2024-08-15T16:00:00Z', updatedAt: '2024-08-15T16:00:00Z' },
];

export default function WalletPage() {
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('');

  const columns = [
    { key: 'description', header: 'Description' },
    { key: 'type', header: 'Type', render: (t: Payment) => (
      <div className="flex items-center gap-2">
        {t.type === 'DEPOSIT' || t.type === 'REFUND' ? (
          <ArrowDown className="h-4 w-4 text-emerald-500" />
        ) : (
          <ArrowUp className="h-4 w-4 text-red-500" />
        )}
        <Badge variant="outline">{t.type}</Badge>
      </div>
    )},
    { key: 'amount', header: 'Amount', sortable: true, render: (t: Payment) => (
      <span className={t.type === 'DEPOSIT' || t.type === 'REFUND' ? 'text-emerald-600' : 'text-red-600'}>
        {t.type === 'DEPOSIT' || t.type === 'REFUND' ? '+' : '-'}{formatCurrency(t.amount)}
      </span>
    )},
    { key: 'status', header: 'Status', render: (t: Payment) => (
      <Badge variant={t.status === 'COMPLETED' ? 'success' : t.status === 'PENDING' ? 'warning' : 'destructive'}>{t.status}</Badge>
    )},
    { key: 'createdAt', header: 'Date', sortable: true, render: (t: Payment) => formatDateTime(t.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wallet</h1>
        <p className="text-muted-foreground">Manage your account balance and transactions</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Balance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-3xl font-bold">{formatCurrency(wallet.balance)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-semibold text-amber-500">{formatCurrency(wallet.pendingBalance)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Deposited</p>
                <p className="text-2xl font-semibold text-emerald-500">{formatCurrency(wallet.totalDeposited)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full gap-2"><Plus className="h-4 w-4" /> Deposit</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Deposit Funds</DialogTitle>
                  <DialogDescription>Add money to your wallet</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="deposit-amount">Amount (USD)</Label>
                    <Input id="deposit-amount" type="number" placeholder="0.00" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select value={depositMethod} onValueChange={setDepositMethod}>
                      <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="wire">Wire Transfer</SelectItem>
                        <SelectItem value="crypto">Cryptocurrency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button>Deposit {depositAmount ? formatCurrency(Number(depositAmount)) : ''}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2"><ArrowUp className="h-4 w-4" /> Withdraw</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Withdraw Funds</DialogTitle>
                  <DialogDescription>Withdraw money from your wallet</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="withdraw-amount">Amount (USD)</Label>
                    <Input id="withdraw-amount" type="number" placeholder="0.00" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
                    <p className="text-xs text-muted-foreground">Available: {formatCurrency(wallet.balance)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Withdraw to</Label>
                    <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                      <SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank">Bank Account</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="destructive">Withdraw {withdrawAmount ? formatCurrency(Number(withdrawAmount)) : ''}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>All wallet transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={transactions} searchable searchKeys={['description', 'type', 'status']} />
        </CardContent>
      </Card>
    </div>
  );
}
