import { Users, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Renders the All Teams directory in a structured table/list layout.
 * Columns include Team details, Member count, Work item count, User role, Status pill, and Star action.
 */
export default function TeamsTableView({
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
            <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card">
                  <table className="w-full text-left text-sm">
                        <thead className="border-b border-border/80 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/20">
                              <tr>
                                    <th className="py-3.5 pl-6 pr-4">Team</th>
                                    <th className="px-4 py-3.5">Members</th>
                                    <th className="px-4 py-3.5">Work Items</th>
                                    <th className="px-4 py-3.5">Role</th>
                                    <th className="px-4 py-3.5">Status</th>
                                    <th className="py-3.5 pl-4 pr-6 text-right"></th>
                              </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                              {teams.map((item) => {
                                    const team = item.team || item;
                                    const teamId = team.id || team._id;
                                    const starred = isTeamStarred(teamId);
                                    const membersCount = item.membersCount ?? team.membersCount ?? 0;
                                    const workItemsCount = item.workItemsCount ?? team.workItemsCount ?? 0;
                                    const userRole = team.role || team.myRole || 'Viewer';
                                    const status = team.status || 'Active';

                                    return (
                                          <tr
                                                key={teamId}
                                                onClick={() => onSelectTeam(teamId)}
                                                className="group cursor-pointer transition-colors hover:bg-muted/30"
                                          >
                                                {/* TEAM DETAILS */}
                                                <td className="py-4 pl-6 pr-4">
                                                      <div className="flex items-center gap-3.5">
                                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground group-hover:text-foreground transition-colors">
                                                                  <Users className="size-5" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                  <p className="font-semibold text-foreground group-hover:underline truncate">
                                                                        {team.name}
                                                                  </p>
                                                                  <p className="text-xs text-muted-foreground truncate max-w-sm mt-0.5">
                                                                        {team.description || 'No description provided.'}
                                                                  </p>
                                                            </div>
                                                      </div>
                                                </td>

                                                {/* MEMBERS */}
                                                <td className="px-4 py-4 font-medium text-foreground">
                                                      {membersCount}
                                                </td>

                                                {/* WORK ITEMS */}
                                                <td className="px-4 py-4 font-medium text-foreground">
                                                      {workItemsCount}
                                                </td>

                                                {/* ROLE */}
                                                <td className="px-4 py-4 text-muted-foreground font-medium">
                                                      {userRole}
                                                </td>

                                                {/* STATUS */}
                                                <td className="px-4 py-4">
                                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                            {status}
                                                      </span>
                                                </td>

                                                {/* PIN ACTION */}
                                                <td className="py-4 pl-4 pr-6 text-right">
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
                                                </td>
                                          </tr>
                                    );
                              })}
                        </tbody>
                  </table>
            </div>
      );
}
