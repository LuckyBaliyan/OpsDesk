import { Grip } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CARD, PRIORITIES } from '@/lib/constants';
import StatusBarChart from '@/components/charts/StatusBarChart';

/* Revenue Updates -> Status Overview */
export default function StatusOverviewCard({ chart, chartPriority, onChartPriorityChange, onGoTo }) {
      return (
            <Card className={cn(CARD, 'lg:col-span-2')}>
                  <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                              <div>
                                    <h2 className="text-lg font-medium">Status Overview</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">Team workload by workflow stage</p>
                              </div>
                              <Select value={chartPriority} onValueChange={onChartPriorityChange}>
                                    <SelectTrigger className="h-10 w-[150px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                          <SelectItem value="all">All priorities</SelectItem>
                                          {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                    </SelectContent>
                              </Select>
                        </div>

                        <div className="mt-6 grid gap-8 md:grid-cols-[1fr_260px]">
                              <StatusBarChart data={chart.data} />

                              <div className="flex flex-col">
                                    <div className="flex items-center gap-3">
                                          <span className="flex size-11 items-center justify-center rounded-lg border border-border">
                                                <Grip className="size-5" />
                                          </span>
                                          <div>
                                                <p className="text-2xl font-semibold tracking-tight">{chart.active}</p>
                                                <p className="text-sm text-muted-foreground">Active items</p>
                                          </div>
                                    </div>

                                    <div className="mt-10 space-y-8">
                                          <div className="flex items-start gap-3">
                                                <span className="mt-2 size-2 rounded-full bg-foreground/25" />
                                                <div>
                                                      <p className="text-sm text-muted-foreground">Team items</p>
                                                      <p className="mt-1 text-xl font-semibold">{chart.team}</p>
                                                </div>
                                          </div>
                                          <div className="flex items-start gap-3">
                                                <span className="mt-2 size-2 rounded-full bg-primary" />
                                                <div>
                                                      <p className="text-sm text-muted-foreground">Assigned to me</p>
                                                      <p className="mt-1 text-xl font-semibold">{chart.mine}</p>
                                                </div>
                                          </div>
                                    </div>

                                    <Button onClick={() => onGoTo('all')} className="mt-auto h-11 w-full cursor-pointer">
                                          View all items
                                    </Button>
                              </div>
                        </div>
                  </CardContent>
            </Card>
      );
}
