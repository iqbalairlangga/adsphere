'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/store/sidebar-store';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types';

const roleLinks: Record<UserRole, Array<{ title: string; href: string }>> = {
  ADVERTISER: [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Campaigns', href: '/dashboard/campaign' },
    { title: 'Analytics', href: '/dashboard/analytics' },
    { title: 'Billing', href: '/dashboard/billing' },
    { title: 'Wallet', href: '/dashboard/wallet' },
    { title: 'Settings', href: '/dashboard/settings' },
  ],
  PUBLISHER: [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Websites', href: '/dashboard/websites' },
    { title: 'Ad Units', href: '/dashboard/ad-units' },
    { title: 'Earnings', href: '/dashboard/earnings' },
    { title: 'Payouts', href: '/dashboard/payouts' },
    { title: 'Settings', href: '/dashboard/settings' },
  ],
  ADMIN: [
    { title: 'Dashboard', href: '/dashboard/admin' },
    { title: 'Users', href: '/dashboard/users' },
    { title: 'Campaigns', href: '/dashboard/campaign' },
    { title: 'Payments', href: '/dashboard/payments' },
    { title: 'Fraud Detection', href: '/dashboard/fraud' },
    { title: 'Audit Logs', href: '/dashboard/audit-logs' },
    { title: 'Settings', href: '/dashboard/settings' },
  ],
  SUPER_ADMIN: [
    { title: 'Dashboard', href: '/dashboard/admin' },
    { title: 'Users', href: '/dashboard/users' },
    { title: 'Campaigns', href: '/dashboard/campaign' },
    { title: 'Payments', href: '/dashboard/payments' },
    { title: 'System', href: '/dashboard/system' },
    { title: 'Settings', href: '/dashboard/settings' },
  ],
};

export function MobileNav() {
  const pathname = usePathname();
  const { isOpen, setOpen } = useSidebarStore();
  const user = useAuthStore((s) => s.user);
  const links = user ? roleLinks[user.role] || roleLinks.ADVERTISER : roleLinks.ADVERTISER;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 md:hidden"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r bg-background md:hidden"
          >
            <div className="flex h-16 items-center justify-between border-b px-4">
              <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <span className="text-sm font-bold text-primary-foreground">A</span>
                </div>
                <span className="text-lg font-bold">AdSphere</span>
              </Link>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-accent">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-1">
                {links.map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                      )}
                    >
                      {link.title}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
