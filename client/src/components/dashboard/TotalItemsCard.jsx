import { ArrowRight, Layers } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CARD } from '@/lib/constants';
import Chip from '@/components/shared/Chip';
import IconCircle from '@/components/shared/IconCircle';

import { Skeleton } from '@/components/ui/skeleton';

// Renders the total team work items metric card with active count and navigation button with loading skeleton support
export default function TotalItemsCard({ stats = {}, onGoTo, isLoading = false }) {
      if (isLoading) {
            return (
                  <Card className={CARD}>
                        <CardContent className="flex h-full items-start justify-between gap-3 p-6">
                              <div className="space-y-2">
                                    <h2 className="text-lg font-medium">Total work items</h2>
                                    <div className="mt-2 flex items-center gap-2">
                                          <Skeleton className="h-7 w-12 rounded-md" />
                                          <Skeleton className="h-5 w-16 rounded-sm" />
                                    </div>
                                    <Skeleton className="mt-4 h-10 w-24 rounded-md" />
                              </div>
                              <IconCircle icon={Layers} />
                        </CardContent>
                  </Card>
            );
      }
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
