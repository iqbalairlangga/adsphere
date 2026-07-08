'use client';

import { Bell, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { UserNav } from '@/components/layout/user-nav';
import { useSidebarStore } from '@/store/sidebar-store';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { toggle } = useSidebarStore();

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6',
        className,
      )}
    >
      <Button variant="ghost" size="icon" className="md:hidden" onClick={toggle}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <div className="flex-1">
        <div className="relative hidden md:block max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search campaigns, analytics..."
            className="pl-9 bg-muted/50 border-0 focus-visible:bg-background"
          />
        </div>
      </div>

      <nav className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="sr-only">Notifications</span>
        </Button>
        <UserNav />
      </nav>
    </header>
  );
}
