import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Collapsible section header for sidebar groups (e.g., STARRED TEAMS, RECENT TEAMS).
 * Renders an uppercase label with an arrow icon indicating expansion state.
 */
export default function SidebarSectionHeader({ title, isOpen, onToggle }) {
      return (
            <button
                  type="button"
                  onClick={onToggle}
                  className="flex w-full items-center justify-between py-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase hover:text-foreground transition-colors cursor-pointer"
            >
                  <span>{title}</span>
                  <ChevronDown
                        className={cn(
                              'size-3.5 transition-transform duration-200',
                              !isOpen && '-rotate-90'
                        )}
                  />
            </button>
      );
}
