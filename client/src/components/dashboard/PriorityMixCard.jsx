import { Card, CardContent } from '@/components/ui/card';
import { CARD, PRIORITIES } from '@/lib/constants';
import { PRIORITY_COLORS } from '@/lib/chartColors';
import { pctOf } from '@/lib/helpers';

/* Priority split of the active items across all teams */
export default function PriorityMixCard({ byPriority, total }) {
      return (
            <Card className={CARD}>
                  <CardContent className="p-5">
                        <h2 className="text-lg font-medium">Priority mix</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Active items, all teams</p>

                        <div className="mt-5 space-y-4">
                              {[...PRIORITIES].reverse().map((p) => {
                                    const n = byPriority[p] || 0;
                                    return (
                                          <div key={p} title={`${p}: ${n}`}>
                                                <div className="mb-1.5 flex items-center justify-between text-sm">
                                                      <span className="text-muted-foreground">{p}</span>
                                                      <span className="font-medium tabular-nums">{n}</span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                      <div
                                                            className="h-full rounded-full transition-all"
                                                            style={{ width: `${pctOf(n, total)}%`, background: PRIORITY_COLORS[p] }}
                                                      />
                                                </div>
                                          </div>
                                    );
                              })}
                        </div>
                  </CardContent>
            </Card>
      );
}