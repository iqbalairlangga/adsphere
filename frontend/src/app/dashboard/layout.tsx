'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MobileNav } from '@/components/layout/mobile-nav';
import { useSidebarStore } from '@/store/sidebar-store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="relative min-h-screen">
      <Sidebar />
      <MobileNav />
      <div
        className="transition-all duration-300 ease-in-out"
        style={{ paddingLeft: isCollapsed ? '72px' : '260px' }}
      >
        <Header />
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
