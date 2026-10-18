import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CARD } from '@/lib/constants';
import { pctOf } from '@/lib/helpers';
import Chip from '@/components/shared/Chip';
import HeroIllustration from '@/components/charts/HeroIllustration';

/* Analytics Dashboard card */
export default function OperationsCard({ activeTeam, stats, onGoTo }) {
      return (
            <Card className={cn(CARD, 'relative min-h-[170px] overflow-hidden lg:col-span-2')}>
                  <CardContent className="relative z-10 flex h-full flex-col justify-between gap-6 p-6">
                        <div>
                              <h2 className="text-lg font-medium">Operations Dashboard</h2>
                              <p className="mt-1 text-sm text-muted-foreground">What needs attention in {activeTeam.name}</p>
                        </div>

                        <div className="flex items-end gap-6">
                              <button type="button" onClick={() => onGoTo('mine')} className="cursor-pointer text-left">
                                    <p className="text-sm text-muted-foreground">Assigned to me</p>
                                    <div className="mt-1 flex items-center gap-2">
                                          <span className="text-2xl font-semibold tracking-tight">{stats.mine}</span>
                                          <Chip title="Share of team items">{pctOf(stats.mine, stats.total)}%</Chip>
                                    </div>
                              </button>

                              <span className="h-12 w-px bg-border" />

                              <button type="button" onClick={() => onGoTo('urgent')} className="cursor-pointer text-left">
                                    <p className="text-sm text-muted-foreground">Unassigned urgent</p>
                                    <div className="mt-1 flex items-center gap-2">
                                          <span className="text-2xl font-semibold tracking-tight">{stats.urgentUnassigned}</span>
                                          {stats.urgentUnassigned > 0 ? <Chip tone="down">Action</Chip> : <Chip>Clear</Chip>}
                                    </div>
                              </button>
                        </div>
                  </CardContent>
                  <HeroIllustration className="pointer-events-none absolute right-4 bottom-0 hidden h-[170px] text-foreground md:block" />
            </Card>
      );
}
