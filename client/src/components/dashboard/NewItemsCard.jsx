import { CalendarDays } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { CARD } from '@/lib/constants';
import Chip from '@/components/shared/Chip';
import AreaChart from '@/components/charts/AreaChart';

/* Monthly earnings -> New items */
export default function NewItemsCard({ newItems }) {
      return (
            <Card className={CARD}>
                  <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                              <h2 className="text-lg font-medium">New items</h2>
                              <span className="flex size-10 items-center justify-center rounded-md border border-border">
                                    <CalendarDays className="size-[18px]" />
                              </span>
                        </div>
                        <p className="mt-5 text-2xl font-semibold tracking-tight">{newItems.thisWeek}</p>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                              <Chip tone={newItems.delta >= 0 ? 'up' : 'down'}>
                                    {newItems.delta >= 0 ? '+' : ''}{newItems.delta}%
                              </Chip>
                              than last week
                        </div>
                        <div className="mt-4">
                              <AreaChart values={newItems.series} />
                        </div>
                  </CardContent>
            </Card>
      );
}
