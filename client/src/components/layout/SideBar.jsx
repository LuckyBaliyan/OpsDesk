import { cn } from '@/lib/utils';
import SidebarContent from './SidebarContent';

/* Desktop sidebar (hidden below lg, or when collapsed) */
export default function SideBar({ collapsed, ...sidebarProps }) {
      return (
            <aside
                  className={cn(
                        'fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-sidebar-border bg-sidebar',
                        !collapsed && 'lg:block'
                  )}
            >
                  <SidebarContent {...sidebarProps} />
            </aside>
      );
}
