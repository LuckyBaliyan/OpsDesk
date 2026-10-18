import { ArrowRight, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CARD } from '@/lib/constants';
import { pctOf } from '@/lib/helpers';
import Chip from '@/components/shared/Chip';
import IconCircle from '@/components/shared/IconCircle';

/* Weekly Sales card -> Awaiting my approval */
export default function ApprovalCard({ isApprover, stats, onGoTo }) {
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
