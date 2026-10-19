import { Card, CardContent } from '@/components/ui/card';
import { CARD } from '@/lib/constants';
import { pctOf } from '@/lib/helpers';
import Chip from '@/components/shared/Chip';
import Donut from '@/components/charts/Donut';

import { Skeleton } from '@/components/ui/skeleton';

// Renders the team work item assignment distribution card with donut visualization and loading skeleton support
export default function WorkloadCard({ workload = { assigned: 0, total: 0, mine: 0, others: 0, unassigned: 0 }, isLoading = false }) {
      if (isLoading) {
            return (
                  <Card className={CARD}>
                        <CardContent className="flex items-center justify-between gap-4 p-6">
                              <div className="flex flex-col self-stretch space-y-3">
                                    <h2 className="text-lg font-medium">Workload</h2>
                                    <Skeleton className="h-8 w-16 rounded-md" />
                                    <div className="flex items-center gap-2">
                                          <Skeleton className="h-5 w-16 rounded-sm" />
                                          <Skeleton className="h-4 w-14 rounded-sm" />
                                    </div>
                                    <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-6 text-sm">
                                          <Skeleton className="h-4 w-12 rounded-sm" />
                                          <Skeleton className="h-4 w-14 rounded-sm" />
                                          <Skeleton className="h-4 w-12 rounded-sm" />
                                    </div>
                              </div>
                              <div className="relative shrink-0 flex items-center justify-center">
                                    <div className="size-24 rounded-full border-8 border-muted/70 flex items-center justify-center animate-pulse">
                                          <Skeleton className="size-8 rounded-full" />
                                    </div>
                              </div>
                        </CardContent>
                  </Card>
            );
      }
      return (
            <Card className={CARD}>
                  <CardContent className="flex items-center justify-between gap-4 p-6">
                        <div className="flex flex-col self-stretch">
                              <h2 className="text-lg font-medium">Workload</h2>
                              <p className="mt-4 text-2xl font-semibold tracking-tight">{workload.assigned}</p>
                              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                    <Chip>{pctOf(workload.assigned, workload.total)}%</Chip>
                                    assigned
                              </div>
                              <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-6 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-teal-600" />Mine</span>
                                    <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-orange-600" />Others</span>
                                    <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-primary" />Open</span>
                              </div>
                        </div>
                        <Donut
                              segments={[
                                    { label: 'Mine', value: workload.mine, color: '#0d9488' },
                                    { label: 'Others', value: workload.others, color: '#ea580c' },
                                    { label: 'Unassigned', value: workload.unassigned, color: 'var(--primary)' },
                              ]}
                        />
                  </CardContent>
            </Card>
      );
}
