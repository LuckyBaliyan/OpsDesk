import { initials, fmtMonthYear, getAvatarColor } from '@/lib/helpers';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * Renders the users directory table with initials avatar, name, email,
 * assigned team pills with overflow badge, joined/activity status, and action button.
 */
export default function UsersTableView({
      users = [],
      isLoading = false,
      onAddToTeam,
}) {
      if (isLoading) {
            return (
                  <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
                        <div className="divide-y divide-border/60">
                              {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex items-center justify-between p-4">
                                          <div className="flex items-center gap-3">
                                                <Skeleton className="size-9 rounded-full" />
                                                <div className="space-y-1.5">
                                                      <Skeleton className="h-4 w-32" />
                                                      <Skeleton className="h-3 w-44" />
                                                </div>
                                          </div>
                                          <Skeleton className="h-6 w-36 rounded-md" />
                                          <Skeleton className="h-6 w-28 rounded-md" />
                                          <Skeleton className="h-8 w-24 rounded-lg" />
                                    </div>
                              ))}
                        </div>
                  </div>
            );
      }

      if (users.length === 0) {
            return (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-border/80 bg-card p-12 text-center">
                        <p className="text-sm font-medium text-foreground">No users found</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                              No users match your active search or filter criteria.
                        </p>
                  </div>
            );
      }

      return (
            <div className="rounded-xl border border-border/80 bg-card overflow-x-auto">
                  <table className="w-full text-left text-xs">
                        {/* Table Header */}
                        <thead className="border-b border-border/80 bg-muted/20 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              <tr>
                                    <th className="py-3 px-4">USER</th>
                                    <th className="py-3 px-4">CURRENT TEAMS</th>
                                    <th className="py-3 px-4">JOINED / ACTIVITY</th>
                                    <th className="py-3 px-4 text-right">ACTION</th>
                              </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody className="divide-y divide-border/60">
                              {users.map((user) => {
                                    const memberships = user.memberships || [];
                                    const isInvited = user.status === 'invited';

                                    return (
                                          <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                                                {/* User Identity Column */}
                                                <td className="py-3.5 px-4">
                                                      <div className="flex items-center gap-3">
                                                            <div
                                                                  className={cn(
                                                                        'size-9 shrink-0 rounded-full border flex items-center justify-center font-bold text-xs select-none',
                                                                        getAvatarColor(user.email || user.name)
                                                                  )}
                                                            >
                                                                  {initials(user.name, user.email)}
                                                            </div>
                                                            <div className="min-w-0">
                                                                  <div className="font-semibold text-sm text-foreground truncate">
                                                                        {user.name}
                                                                  </div>
                                                                  <div className="text-xs text-muted-foreground truncate">
                                                                        {user.email}
                                                                  </div>
                                                            </div>
                                                      </div>
                                                </td>

                                                {/* Current Teams Column */}
                                                <td className="py-3.5 px-4">
                                                      <div className="flex flex-wrap items-center gap-1.5 max-w-[280px]">
                                                            {memberships.length === 0 ? (
                                                                  <span className="inline-flex rounded-md border border-border/60 bg-muted/20 px-2 py-0.5 text-xs text-muted-foreground">
                                                                        No teams
                                                                  </span>
                                                            ) : (
                                                                  <>
                                                                        {memberships.slice(0, 2).map((m) => (
                                                                              <span
                                                                                    key={m.id || m.teamId}
                                                                                    className="inline-flex rounded-md border border-border/80 bg-muted/40 px-2.5 py-0.5 text-xs text-foreground/90 font-normal truncate max-w-[130px]"
                                                                                    title={m.team?.name}
                                                                              >
                                                                                    {m.team?.name || 'Team'}
                                                                              </span>
                                                                        ))}
                                                                        {memberships.length > 2 && (
                                                                              <span className="inline-flex rounded-md border border-border/60 bg-muted/30 px-1.5 py-0.5 text-[11px] text-muted-foreground font-medium">
                                                                                    +{memberships.length - 2} more
                                                                              </span>
                                                                        )}
                                                                  </>
                                                            )}
                                                      </div>
                                                </td>

                                                {/* Joined and Activity Column */}
                                                <td className="py-3.5 px-4">
                                                      <div className="space-y-1">
                                                            <div className="text-xs text-foreground/90 font-medium">
                                                                  {fmtMonthYear(user.createdAt)}
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                  <span className="text-[11px] text-muted-foreground">
                                                                        {isInvited ? 'Invite pending' : 'Active now'}
                                                                  </span>
                                                                  <span
                                                                        className={cn(
                                                                              'inline-flex items-center rounded-full px-1.5 py-0.2 text-[10px] font-medium border',
                                                                              isInvited
                                                                                    ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                                                                                    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                                                                        )}
                                                                  >
                                                                        {isInvited ? 'Invited' : 'Active'}
                                                                  </span>
                                                            </div>
                                                      </div>
                                                </td>

                                                {/* Action Column */}
                                                <td className="py-3.5 px-4 text-right">
                                                      <button
                                                            type="button"
                                                            onClick={() => onAddToTeam(user)}
                                                            className="inline-flex items-center justify-center rounded-lg border border-border/80 bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted cursor-pointer transition-colors shadow-2xs"
                                                      >
                                                            + Add to team
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
