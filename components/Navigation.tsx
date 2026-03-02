'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Backpack, Home, CheckSquare, Settings } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/packing', label: 'Pack', icon: Backpack },
  { href: '/checklist', label: 'Checklist', icon: CheckSquare },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background md:relative md:border-r md:border-t-0 md:w-16 md:flex md:flex-col">
      <div className="flex justify-around md:flex-col md:gap-2 md:p-4">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center p-3 md:p-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
              title={item.label}
            >
              <Icon className="w-6 h-6 md:w-5 md:h-5" />
              <span className="text-xs mt-1 hidden md:inline">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
