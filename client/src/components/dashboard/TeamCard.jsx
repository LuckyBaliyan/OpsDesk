import { ArrowRight, Users } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CARD, STATUSES, STATUS_META } from '@/lib/constants';
import { STATUS_COLORS } from '@/lib/chartColors';
import Chip from '@/components/shared/Chip';
import UserAvatar from '@/components/shared/UserAvatar';

function Mini({ label, value, alert }) {
      return (
            <div className="rounded-md border border-border px-2.5 py-1.5">
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                  <p className={cn('text-base leading-tight font-semibold tracking-tight', alert && 'text-red-600 dark:text-red-500')}>{value}</p>
            </div>
      );
}

/* One team in the "All teams" grid. Click opens that team's dashboard. */
export default function TeamCard({ row, onOpen }) {
      const { team, total, active, urgent, awaiting, lead, memberCount, byStatus } = row;

      return (
            <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpen(team.id)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen(team.id)}
                  className={cn(CARD, 'cursor-pointer transition-colors hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring')}
            >
                  <CardContent className="flex h-full flex-col gap-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                    <h3 className="truncate text-base font-medium">{team.name}</h3>
                                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground" title={team.description}>{team.description}</p>
                              </div>
                              <Chip tone={team.myRole && team.myRole !== 'Viewer' ? 'up' : 'down'}>{team.myRole ?? 'View only'}</Chip>
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