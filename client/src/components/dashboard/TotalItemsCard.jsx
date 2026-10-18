import { ArrowRight, Layers } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CARD } from '@/lib/constants';
import Chip from '@/components/shared/Chip';
import IconCircle from '@/components/shared/IconCircle';

/* Purchase Orders card -> Total work items */
export default function TotalItemsCard({ stats, onGoTo }) {
      return (
            <Card className={CARD}>
                  <CardContent className="flex h-full items-start justify-between gap-3 p-6">
                        <div>
                              <h2 className="text-lg font-medium">Total work items</h2>
                              <div className="mt-2 flex items-center gap-2">
                                    <span className="text-2xl font-semibold tracking-tight">{stats.total}</span>
                                    <Chip title="Items not yet resolved or closed">{stats.active} active</Chip>
                              </div>
                              <Button variant="outline" onClick={() => onGoTo('all')} className="mt-4 h-10 cursor-pointer px-3">
                                    View all <ArrowRight className="size-4" />
                              </Button>
                        </div>
                        <IconCircle icon={Layers} />
                  </CardContent>
            </Card>
      );
}
