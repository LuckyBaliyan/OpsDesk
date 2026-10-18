import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import SidebarContent from './SidebarContent';

/* Mobile drawer (only rendered while open) */
export default function MobileDrawer({ open, onClose, ...sidebarProps }) {
      if (!open) return null;

      return (
            <div className="fixed inset-0 z-50 lg:hidden">
                  <div className="absolute inset-0 bg-black/60" onClick={onClose} />
                  <aside className="absolute inset-y-0 left-0 w-64 border-r border-sidebar-border bg-sidebar">
                        <Button variant="ghost" size="icon" className="absolute top-3 right-2 cursor-pointer" onClick={onClose} aria-label="Close menu">
                              <X className="size-4" />
                        </Button>
                        <SidebarContent {...sidebarProps} onNavigate={onClose} />
                  </aside>
            </div>
      );
}
