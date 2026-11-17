import { Users, Pin } from 'lucide-react';
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
                  return 'bg-muted/60 text-muted-foreground border-border/60';
      }
}

/**
 * Renders the All Teams directory in a responsive 3-column card grid layout.
 * Cards display team icon, user role badge, pin button, title, description, member count, and work item count.
 */
export default function TeamsGridView({
      teams = [],
      isTeamStarred,
      onToggleStar,
      onSelectTeam,
}) {
      if (teams.length === 0) {
            return (
                  <div className="rounded-2xl border border-border/80 bg-card p-12 text-center text-muted-foreground">
                        <Users className="mx-auto size-10 opacity-40 mb-3" />
                        <p className="text-sm font-medium">No teams match your active filters.</p>
                        <p className="text-xs text-muted-foreground mt-1">Try clearing or adjusting your search criteria.</p>
                  </div>
            );
      }

      return (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {teams.map((item) => {
                        const team = item.team || item;
                        const teamId = team.id || team._id;
                        const starred = isTeamStarred(teamId);
                        const membersCount = item.membersCount ?? team.membersCount ?? 0;
                        const workItemsCount = item.workItemsCount ?? team.workItemsCount ?? 0;
                        const userRole = team.role || team.myRole || 'Viewer';

                        return (
                              <div
                                    key={teamId}
                                    onClick={() => onSelectTeam(teamId)}
                                    className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 cursor-pointer transition-all hover:border-border hover:shadow-md"
                              >
                                    <div>
                                          {/* Top: Icon + User Role Badge + Pin button */}
                                          <div className="flex items-center justify-between">
                                                <div className="flex size-10 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground group-hover:text-foreground transition-colors">
                                                      <Users className="size-5" />
                                                </div>

                                                <div className="flex items-center gap-2">
                                                      {/* User Role Badge */}
                                                      <span
                                                            className={cn(
                                                                  'inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full border',
                                                                  getRoleBadgeClass(userRole)
                                                            )}
                                                      >
                                                            {userRole}
                                                      </span>

                                                      {/* Pin / Star Action */}
                                                      <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                  e.stopPropagation();
                                                                  onToggleStar(teamId);
                                                            }}
                                                            aria-label={starred ? 'Unpin team' : 'Pin team'}
                                                            className={cn(
                                                                  'size-8 inline-flex items-center justify-center rounded-lg cursor-pointer transition-colors',
                                                                  starred
                                                                        ? 'text-amber-400 hover:text-amber-500'
                                                                        : 'text-muted-foreground/40 hover:text-foreground'
                                                            )}
                                                      >
                                                            <Pin
                                                                  className={cn(
                                                                        'size-4 transition-transform duration-200',
                                                                        starred && 'fill-amber-400 rotate-45'
                                                                  )}
                                                            />
                                                      </button>
                                                </div>
                                          </div>

                                          {/* Title & Description */}
                                          <div className="mt-4">
                                                <h3 className="font-semibold text-base text-foreground group-hover:underline">
                                                      {team.name}
                                                </h3>
                                                <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                      {team.description || 'No description provided.'}
                                                </p>
                                          </div>
                                    </div>

                                    {/* Footer: Member count & Work items count */}
                                    <div className="mt-5 flex items-center gap-4 text-xs font-semibold text-foreground border-t border-border/50 pt-3.5">
                                          <span>{membersCount} members</span>
                                          <span>{workItemsCount} work items</span>
                                    </div>
                              </div>
                        );
                  })}
            </div>
      );
}
