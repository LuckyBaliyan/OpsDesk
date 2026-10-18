import { useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CARD, STATUSES, STATUS_META } from '@/lib/constants';
import { STATUS_COLORS } from '@/lib/chartColors';

/* Stacked bar per team (by status). Legend toggles statuses, hover shows counts, click opens the team. */
export default function TeamsWorkloadChart({ rows, byStatus, onOpen }) {
      const [hidden, setHidden] = useState([]);
      const [hover, setHover] = useState(null);

      const shown = STATUSES.filter((s) => !hidden.includes(s));
      const toggle = (s) => setHidden((h) => (h.includes(s) ? h.filter((x) => x !== s) : [...h, s]));
      const sumShown = (r) => shown.reduce((a, s) => a + (r.byStatus[s] || 0), 0);
      const max = Math.max(1, ...rows.map(sumShown));
      const hovered = rows.find((r) => r.team.id === hover);

      return (
            <Card className={cn(CARD, 'lg:col-span-2')}>
                  <CardContent className="p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                    <h2 className="text-lg font-medium">Workload by team</h2>
                                    <p className="mt-1 min-h-5 text-sm text-muted-foreground">
                                          {/*hovered
                                                ? `${hovered.team.name}: ${STATUSES.map((s) => `${STATUS_META[s].short} ${hovered.byStatus[s] || 0}`).join(' · ')}`
                                                : 'Hover a bar for counts, click to open the team'*/}
                                    </p>
                              </div>

                              <div className="flex flex-wrap gap-1.5">
                                    {STATUSES.map((s) => (
                                          <button
                                                key={s}
                                                type="button"
                                                onClick={() => toggle(s)}
                                                aria-pressed={!hidden.includes(s)}
                                                className={cn(
                                                      'flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs transition-opacity',
                                                      hidden.includes(s) && 'opacity-40'
                                                )}
                                          >
                                                <span className="size-2 rounded-full" style={{ background: STATUS_COLORS[s] }} />
                                                {STATUS_META[s].short}
                                                <span className="text-muted-foreground">{byStatus[s] || 0}</span>
                                          </button>
                                    ))}
                              </div>
                        </div>

                        <div className="mt-4 space-y-1">
                              {rows.map((r) => (
                                    <button
                                          key={r.team.id}
                                          type="button"
                                          onClick={() => onOpen(r.team.id)}
                                          onMouseEnter={() => setHover(r.team.id)}
                                          onMouseLeave={() => setHover(null)}
                                          className="flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent/50"
                                    >
                                          <span className="w-28 shrink-0 truncate text-sm font-medium">{r.team.name}</span>
                                          <span className="flex h-3 flex-1 overflow-hidden rounded-full bg-muted">
                                                {shown.map((s) =>
                                                      r.byStatus[s] ? (
                                                            <span
                                                                  key={s}
                                                                  title={`${STATUS_META[s].label}: ${r.byStatus[s]}`}
                                                                  className="h-full"
                                                                  style={{ width: `${(r.byStatus[s] / max) * 100}%`, background: STATUS_COLORS[s] }}
                                                            />
                                                      ) : null
                                                )}
                                          </span>
                                          <span className="w-6 shrink-0 text-right text-sm text-muted-foreground tabular-nums">{sumShown(r)}</span>
                                    </button>
                              ))}
                        </div>
                  </CardContent>
            </Card>
      );
}