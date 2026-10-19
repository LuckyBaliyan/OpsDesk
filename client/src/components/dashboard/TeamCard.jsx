import { ArrowRight, Users } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CARD, STATUSES, STATUS_META } from '@/lib/constants';
import { STATUS_COLORS } from '@/lib/chartColors';
import Chip from '@/components/shared/Chip';
import UserAvatar from '@/components/shared/UserAvatar';
import { useGetTeamMembersQuery } from '@/stores/slices/teamApiSlice';

import { Skeleton } from '@/components/ui/skeleton';

// Renders a single compact stat metric tile within the team overview card
function Mini({ label, value, alert }) {
      return (
            <div className="rounded-md border border-border px-2.5 py-1.5">
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                  <p className={cn('text-base leading-tight font-semibold tracking-tight', alert && 'text-red-600 dark:text-red-500')}>{value}</p>
            </div>
      );
}

// Renders a loading skeleton placeholder for a TeamCard matching the current theme layout
export function TeamCardSkeleton() {
      return (
            <Card className={cn(CARD, 'pointer-events-none select-none')}>
                  <CardContent className="flex h-full flex-col gap-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1 space-y-1.5">
                                    <Skeleton className="h-5 w-32 rounded-md" />
                                    <Skeleton className="h-3 w-48 rounded-sm" />
                              </div>
                              <Skeleton className="h-5 w-16 shrink-0 rounded-sm" />
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                              {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="rounded-md border border-border px-2.5 py-1.5 space-y-1">
                                          <Skeleton className="h-2.5 w-10 rounded-xs" />
                                          <Skeleton className="h-5 w-7 rounded-sm" />
                                    </div>
                              ))}
                        </div>

                        <Skeleton className="h-1.5 w-full rounded-full" />

                        <div className="mt-auto flex items-center justify-between pt-1">
                              <div className="flex items-center gap-2">
                                    <Skeleton className="size-5 rounded-full" />
                                    <Skeleton className="h-3 w-24 rounded-sm" />
                              </div>
                              <div className="flex items-center gap-2">
                                    <Skeleton className="h-3.5 w-8 rounded-sm" />
                                    <Skeleton className="size-3.5 rounded-sm" />
                              </div>
                        </div>
                  </CardContent>
            </Card>
      );
}

// Renders an individual team summary card in the all teams overview grid with team lead and work item counts
export default function TeamCard({ row, onOpen }) {
      const { team, total, active, urgent, awaiting, byStatus } = row;
      const teamId = team.id || team._id;

      // Real API call to fetch members of this specific team
      const { data: membersData } = useGetTeamMembersQuery(teamId);
      const teamMembers = membersData?.members || membersData?.data || (Array.isArray(membersData) ? membersData : []);

      // Extract lead and member count dynamically
      const lead = teamMembers.find((m) => m.role === 'Lead')?.user || teamMembers.find((m) => m.role === 'Lead') || null;
      const memberCount = teamMembers.length;

      return (
            <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpen(teamId)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen(teamId)}
                  className={cn(CARD, 'cursor-pointer transition-colors hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring')}
            >
                  <CardContent className="flex h-full flex-col gap-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                    <h3 className="truncate text-base font-medium">{team.name}</h3>
                                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground" title={team.description}>{team.description}</p>
                              </div>
                              <Chip tone={team.role && team.role !== 'Viewer' ? 'up' : 'down'}>{team.role ?? 'View only'}</Chip>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                              <Mini label="Active" value={active} />
                              <Mini label="Urgent" value={urgent} alert={urgent > 0} />
                              <Mini label="Approval" value={awaiting} />
                              <Mini label="Total" value={total} />
                        </div>

                        {/* tiny status bar, same colors as the charts */}
                        <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
                              {STATUSES.map((s) =>
                                    byStatus[s] ? (
                                          <span
                                                key={s}
                                                title={`${STATUS_META[s].label}: ${byStatus[s]}`}
                                                style={{ width: `${(byStatus[s] / Math.max(total, 1)) * 100}%`, background: STATUS_COLORS[s] }}
                                          />
                                    ) : null
                              )}
                        </div>

                        <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
                              {lead ? (
                                    <>
                                          <UserAvatar name={lead.name} email={lead.email} className="size-5 [&_span]:text-[9px]" />
                                          <span className="truncate">Lead: {lead.name}</span>
                                    </>
                              ) : (
                                    <span>No lead assigned</span>
                              )}
                              <span className="ml-auto flex items-center gap-1">
                                    <Users className="size-3.5" /> {memberCount}
                              </span>
                              <ArrowRight className="size-3.5" />
                        </div>
                  </CardContent>
            </Card>
      );
}