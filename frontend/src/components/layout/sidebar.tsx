'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Flag,
  BarChart3,
  Wallet,
  Settings,
  Users,
  Globe,
  Newspaper,
  DollarSign,
  TrendingUp,
  Shield,
  FileText,
  ChevronLeft,
  ChevronRight,
  Megaphone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSidebarStore } from '@/store/sidebar-store';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const advertiserLinks: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Campaigns', href: '/dashboard/campaign', icon: Flag },
  { title: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { title: 'Billing', href: '/dashboard/billing', icon: DollarSign },
  { title: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
  { title: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const publisherLinks: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Websites', href: '/dashboard/websites', icon: Globe },
  { title: 'Ad Units', href: '/dashboard/ad-units', icon: Newspaper },
  { title: 'Earnings', href: '/dashboard/earnings', icon: TrendingUp },
  { title: 'Payouts', href: '/dashboard/payouts', icon: DollarSign },
  { title: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const adminLinks: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
  { title: 'Users', href: '/dashboard/users', icon: Users },
  { title: 'Campaigns', href: '/dashboard/campaign', icon: Megaphone },
  { title: 'Payments', href: '/dashboard/payments', icon: DollarSign },
  { title: 'Fraud Detection', href: '/dashboard/fraud', icon: Shield },
  { title: 'Audit Logs', href: '/dashboard/audit-logs', icon: FileText },
  { title: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const roleLinks: Record<UserRole, NavItem[]> = {
  ADVERTISER: advertiserLinks,
  PUBLISHER: publisherLinks,
  ADMIN: adminLinks,
  SUPER_ADMIN: [...adminLinks, { title: 'System', href: '/dashboard/system', icon: Settings }],
};

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse } = useSidebarStore();
  const user = useAuthStore((s) => s.user);
  const navLinks = user ? roleLinks[user.role] || advertiserLinks : advertiserLinks;

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-card"
    >
      <div className={cn('flex h-16 items-center border-b px-4', isCollapsed ? 'justify-center' : 'justify-between')}>
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">A</span>
            </div>
            <span className="text-lg font-bold">AdSphere</span>
          </Link>
        )}
        {isCollapsed && (
          <Link href="/dashboard">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">A</span>
            </div>
          </Link>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <nav className="flex flex-col gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  isCollapsed && 'justify-center px-2',
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 rounded-lg bg-primary/10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="relative z-10 h-5 w-5 shrink-0" />
                {!isCollapsed && <span className="relative z-10">{item.title}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={cn('border-t p-3', isCollapsed && 'flex justify-center')}>
        <Button
          variant="ghost"
          size={isCollapsed ? 'icon' : 'default'}
          onClick={toggleCollapse}
          className="w-full justify-center"
        >
          <AnimatePresence mode="wait">
            {isCollapsed ? (
              <motion.div
                key="right"
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 180, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-4 w-4" />
              </motion.div>
            ) : (
              <motion.div
                key="left"
                initial={{ rotate: 180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -180, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse</span>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </motion.aside>
  );
}
