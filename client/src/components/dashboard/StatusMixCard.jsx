import { Card, CardContent } from '@/components/ui/card';
import { CARD, STATUSES, STATUS_META } from '@/lib/constants';
import { STATUS_COLORS } from '@/lib/chartColors';
import { pctOf } from '@/lib/helpers';
import Donut from '@/components/charts/Donut';

/* Org-wide status split as a donut + legend */
export default function StatusMixCard({ byStatus, total }) {
      const segments = STATUSES.map((s) => ({
            label: STATUS_META[s].label,
            value: byStatus[s] || 0,
            color: STATUS_COLORS[s],
      }));

      return (
            <Card className={CARD}>
                  <CardContent className="p-5">
                        <h2 className="text-lg font-medium">Status mix</h2>
                        <p className="mt-1 text-sm text-muted-foreground">All teams</p>

                        <div className="mt-4 flex items-center gap-4">
                              <div className="relative shrink-0">
                                    <Donut segments={segments} />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                          <span className="text-xl font-semibold leading-none">{total}</span>
                                          <span className="mt-1 text-xs text-muted-foreground">items</span>
                                    </div>
                              </div>

                              <ul className="min-w-0 flex-1 space-y-2 text-sm">
                                    {segments.map((s) => (
                                          <li key={s.label} className="flex items-center gap-2">
                                                <span className="size-2 shrink-0 rounded-full" style={{ background: s.color }} />
                                                <span className="flex-1 truncate text-muted-foreground">{s.label}</span>
                                                <span className="font-medium tabular-nums">{s.value}</span>
                                                <span className="w-9 text-right text-xs text-muted-foreground tabular-nums">{pctOf(s.value, total)}%</span>
                                          </li>
                                    ))}
                              </ul>
                        </div>
                  </CardContent>
            </Card>
      );
}