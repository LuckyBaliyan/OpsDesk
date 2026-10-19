import { ArrowRight } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { CARD } from '@/lib/constants';
import { timeAgo } from '@/lib/helpers';
import Chip from '@/components/shared/Chip';

import { Skeleton } from '@/components/ui/skeleton';

// Renders the unassigned urgent work items list across all teams with a loading skeleton state
export default function NeedsAttentionCard({ items = [], total = 0, onOpen, isLoading = false }) {
      if (isLoading) {
            return (
                  <Card className={CARD}>
                        <CardContent className="p-5">
                              <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1.5">
                                          <h2 className="text-lg font-medium">Needs attention</h2>
                                          <p className="text-sm text-muted-foreground">Unassigned urgent</p>
                                    </div>
                                    <Skeleton className="h-5 w-14 rounded-sm" />
                              </div>

                              <div className="mt-3 space-y-2">
                                    {[1, 2, 3].map((n) => (
                                          <div key={n} className="flex items-center gap-3 px-2 py-2">
                                                <Skeleton className="size-2 shrink-0 rounded-full" />
                                                <div className="min-w-0 flex-1 space-y-1.5">
                                                      <Skeleton className="h-4 w-3/4 rounded-sm" />
                                                      <Skeleton className="h-3 w-1/2 rounded-sm" />
                                                </div>
                                          </div>
                                    ))}
                              </div>
                        </CardContent>
                  </Card>
            );
      }
      return (
            <Card className={CARD}>
                  <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3">
                              <div>
                                    <h2 className="text-lg font-medium">Needs attention</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">Unassigned urgent</p>
                              </div>
                              <Chip tone={total > 0 ? 'down' : 'up'}>{total > 0 ? `${total} open` : 'Clear'}</Chip>
                        </div>

                        <div className="mt-3 space-y-1">
                              {items.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Nothing urgent is waiting.</p>}

                              {items.map((i) => {
                                    // teamId may come as a nested object or a plain string — resolve safely
                                    const teamId = i.teamId?.id || i.teamId?._id || i.teamId;
                                    const itemId = i.id || i._id;
                                    return (
                                          <button
                                                key={itemId}
                                                type="button"
                                                // Navigate to the team's dashboard (view='all' by default in selectTeam)
                                                // onClick={() => onOpen(teamId)}
                                                className="flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-accent/50"
                                          >
                                                <span className="size-2 shrink-0 rounded-full bg-red-500" />
                                                <span className="min-w-0 flex-1">
                                                      <span className="block truncate text-sm font-medium">{i.title}</span>
                                                      <span className="block truncate text-xs text-muted-foreground">{i.teamName} · {timeAgo(i.createdAt)}</span>
                                                </span>
                                                {/*<ArrowRight className="size-4 shrink-0 text-muted-foreground" />*/}
                                          </button>
                                    );
                              })}
                        </div>
                  </CardContent>
            </Card>
      );
}