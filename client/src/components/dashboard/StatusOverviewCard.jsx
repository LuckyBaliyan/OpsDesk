import { Grip } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CARD, PRIORITIES } from '@/lib/constants';
import StatusBarChart from '@/components/charts/StatusBarChart';

import { Skeleton } from '@/components/ui/skeleton';

// Renders the team status overview card showing bar chart workflow stages, active counts, and assignment breakdown with loading skeleton support
export default function StatusOverviewCard({ chart = { data: [], active: 0, team: 0, mine: 0 }, chartPriority, onChartPriorityChange, onGoTo, isLoading = false }) {
      if (isLoading) {
            return (
                  <Card className={cn(CARD, 'lg:col-span-2')}>
                        <CardContent className="p-6">
                              <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1.5">
                                          <h2 className="text-lg font-medium">Status Overview</h2>
                                          <p className="text-sm text-muted-foreground">Team workload by workflow stage</p>
                                    </div>
                                    <Skeleton className="h-10 w-[150px] rounded-md" />
                              </div>

                              <div className="mt-6 grid gap-8 md:grid-cols-[1fr_260px]">
                                    <div className="flex h-[240px] items-end justify-between gap-4 px-4 pb-2 border-b border-border/50">
                                          {[60, 85, 40, 95, 50].map((h, i) => (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                                      <Skeleton className="w-full max-w-[48px] rounded-t-md" style={{ height: `${h}%` }} />
                                                      <Skeleton className="h-3 w-12 rounded-sm" />
                                                </div>
                                          ))}
                                    </div>

                                    <div className="flex flex-col">
                                          <div className="flex items-center gap-3">
                                                <Skeleton className="size-11 rounded-lg" />
                                                <div className="space-y-1">
                                                      <Skeleton className="h-7 w-12 rounded-md" />
                                                      <p className="text-sm text-muted-foreground">Active items</p>
                                                </div>
                                          </div>

                                          <div className="mt-10 space-y-8">
                                                <div className="flex items-start gap-3">
                                                      <span className="mt-2 size-2 rounded-full bg-muted-foreground/30 animate-pulse" />
                                                      <div className="space-y-1">
                                                            <p className="text-sm text-muted-foreground">Team items</p>
                                                            <Skeleton className="h-6 w-10 rounded-sm" />
                                                      </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                      <span className="mt-2 size-2 rounded-full bg-muted-foreground/30 animate-pulse" />
                                                      <div className="space-y-1">
                                                            <p className="text-sm text-muted-foreground">Assigned to me</p>
                                                            <Skeleton className="h-6 w-10 rounded-sm" />
                                                      </div>
                                                </div>
                                          </div>

                                          <Skeleton className="mt-auto h-11 w-full rounded-md" />
                                    </div>
                              </div>
                        </CardContent>
                  </Card>
            );
      }
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
