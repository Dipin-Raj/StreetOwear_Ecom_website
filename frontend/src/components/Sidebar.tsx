import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SidebarProps {
  items: {
    icon: LucideIcon;
    label: string;
    href: string;
  }[];
  className?: string;
}

export function Sidebar({ items, className }: SidebarProps) {
  const location = useLocation();

  return (
    <aside className={cn("w-64 border-r border-border gradient-primary text-white", className)}>
      <nav className="flex flex-col gap-1 p-4">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-smooth",
                isActive
                  ? "bg-white/10"
                  : "hover:bg-white/10"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
