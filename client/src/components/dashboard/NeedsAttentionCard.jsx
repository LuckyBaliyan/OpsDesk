import { ArrowRight } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { CARD } from '@/lib/constants';
import { timeAgo } from '@/lib/helpers';
import Chip from '@/components/shared/Chip';

/* Unassigned urgent items from every team. Click one to open that team's "Unassigned urgent" view. */
export default function NeedsAttentionCard({ items, total, onOpen }) {
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
                                    const teamId = i.teamId?.id || i.teamId?._id || i.teamId;
                                    const itemId = i.id || i._id;
                                    return (
                                          <button
                                                key={itemId}
                                                type="button"
                                                onClick={() => onOpen(teamId, 'urgent')}
                                                className="flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-accent/50"
                                          >
                                                <span className="size-2 shrink-0 rounded-full bg-red-500" />
                                                <span className="min-w-0 flex-1">
                                                      <span className="block truncate text-sm font-medium">{i.title}</span>
                                                      <span className="block truncate text-xs text-muted-foreground">{i.teamName} · {timeAgo(i.createdAt)}</span>
                                                </span>
                                                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                                          </button>
                                    );
                              })}
                        </div>
                  </CardContent>
            </Card>
      );
}