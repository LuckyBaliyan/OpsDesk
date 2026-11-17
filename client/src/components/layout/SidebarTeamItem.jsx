import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Maps a team role to a semantic pill badge style.
 */
function getRoleBadgeClass(role) {
      switch ((role || '').toLowerCase()) {
            case 'admin':
                  return 'bg-teal-500/15 text-teal-400 border-teal-500/30';
            case 'lead':
                  return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
            case 'member':
                  return 'bg-violet-500/15 text-violet-400 border-violet-500/30';
            default:
                  return 'bg-muted text-muted-foreground border-transparent';
      }
}

/**
 * Individual team navigation row within sidebar sections.
 * Displays user icon, team title, optional role badge, and optional elapsed time indicator.
 */
export default function SidebarTeamItem({
      team,
      active = false,
      role = null,
      timeTag = null,
      onClick
}) {
      const displayRole = role || team?.role || team?.myRole;

      return (
            <button
                  type="button"
                  onClick={onClick}
                  aria-pressed={active}
                  className={cn(
                        'group flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium transition-colors',
                        active
                              ? 'bg-accent text-accent-foreground font-semibold shadow-xs'
                              : 'text-sidebar-foreground hover:bg-muted/50 hover:text-foreground'
                  )}
            >
                  <Users className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span className="truncate text-left flex-1">{team.name}</span>

                  {/* Role pill badge (e.g. Admin, Lead) */}
                  {displayRole && (
                        <span
                              className={cn(
                                    'inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-full border shrink-0',
                                    getRoleBadgeClass(displayRole)
                              )}
                        >
                              {displayRole}
                        </span>
                  )}

                  {/* Relative elapsed time indicator (e.g. 2h, 1d) */}
                  {timeTag && (
                        <span className="text-[11px] text-muted-foreground font-normal shrink-0">
                              {timeTag}
                        </span>
                  )}
            </button>
      );
}
