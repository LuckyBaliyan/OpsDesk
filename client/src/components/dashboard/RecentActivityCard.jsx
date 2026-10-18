import { Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CARD } from '@/lib/constants';
import { describeActivity, timeAgo } from '@/lib/helpers';
import { USERS } from '@/data/mockData';
import UserAvatar from '@/components/shared/UserAvatar';

/* Recent Transactions -> Recent Activity */
export default function RecentActivityCard({ selected, activities, onOpenItem }) {
      return (
            <Card className={cn(CARD, 'lg:col-span-1')}>
                  <CardHeader className="gap-1 px-6 pt-6 pb-0">
                        <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
                        <CardDescription className="truncate text-sm">
                              {selected ? selected.title : 'Select a work item'}
                        </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5 p-6">
                        {activities.length === 0 && (
                              <p className="text-sm text-muted-foreground">
                                    {selected ? 'No activity recorded yet.' : 'Pick an item from the table to see its history.'}
                              </p>
                        )}
                        {activities.map((a) => {
                              const actor = USERS[a.actorId];
                              return (
                                    <div key={a.id} className="flex items-center gap-3">
                                          <UserAvatar name={actor?.name} email={actor?.email} className="size-10" />
                                          <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold">{actor?.name}</p>
                                                <p className="truncate text-xs text-muted-foreground">{describeActivity(a)}</p>
                                          </div>
                                          <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(a.createdAt)}</span>
                                    </div>
                              );
                        })}
                        {selected && (
                              <Button className="h-11 w-full cursor-pointer" onClick={() => onOpenItem(selected)}>
                                    <Eye className="size-4" />
                                    Open item
                              </Button>
                        )}
                  </CardContent>
            </Card>
      );
}
