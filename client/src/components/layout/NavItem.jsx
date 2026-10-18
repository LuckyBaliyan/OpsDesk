import { cn } from '@/lib/utils';

export default function NavItem({ icon: Icon, active, onClick, trailing, children }) {
      return (
            <button
                  type="button"
                  onClick={onClick}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                        'flex h-10 w-full cursor-pointer items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors',
                        active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-accent'
                  )}
            >
                  <Icon className="size-[18px] shrink-0" />
                  <span className="flex-1 truncate text-left">{children}</span>
                  {trailing}
            </button>
      );
}
