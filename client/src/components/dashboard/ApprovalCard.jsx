import { ArrowRight, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CARD } from '@/lib/constants';
import { pctOf } from '@/lib/helpers';
import Chip from '@/components/shared/Chip';
import IconCircle from '@/components/shared/IconCircle';

import { Skeleton } from '@/components/ui/skeleton';

// Renders the team approval queue summary card showing items waiting for lead/admin approval with loading skeleton support
export default function ApprovalCard({ isApprover, stats = {}, onGoTo, isLoading = false }) {
      if (isLoading) {
            return (
                  <Card className={CARD}>
                        <CardContent className="flex h-full items-start justify-between gap-3 p-6">
                              <div className="space-y-2">
                                    <h2 className="text-lg font-medium">Awaiting my approval</h2>
                                    <div className="mt-2 flex items-center gap-2">
                                          <Skeleton className="h-7 w-12 rounded-md" />
                                          <Skeleton className="h-5 w-16 rounded-sm" />
                                    </div>
                                    <Skeleton className="mt-4 h-10 w-28 rounded-md" />
                              </div>
                              <IconCircle icon={ShieldCheck} />
                        </CardContent>
                  </Card>
            );
      }
      return (
            <Card className={CARD}>
                  <CardContent className="flex h-full items-start justify-between gap-3 p-6">
                        <div>
                              <h2 className="text-lg font-medium">Awaiting my approval</h2>
                              <div className="mt-2 flex items-center gap-2">
                                    <span className="text-2xl font-semibold tracking-tight">{isApprover ? stats.awaiting : 0}</span>
                                    {isApprover ? (
                                          <Chip title="Share of team items">{pctOf(stats.awaiting, stats.total)}%</Chip>
                                    ) : (
                                          <Chip tone="down">Lead only</Chip>
                                    )}
                              </div>
                              <Button variant="outline" onClick={() => onGoTo('approval')} className="mt-4 h-10 cursor-pointer px-3">
                                    View queue <ArrowRight className="size-4" />
                              </Button>
                        </div>
                        <IconCircle icon={ShieldCheck} />
                  </CardContent>
            </Card>
      );
}
