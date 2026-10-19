import { Eye, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CARD } from '@/lib/constants';
import { describeActivity, timeAgo } from '@/lib/helpers';
import UserAvatar from '@/components/shared/UserAvatar';

import { Skeleton } from '@/components/ui/skeleton';

// Renders the recent activity audit history card for the selected work item with loading skeleton support
export default function RecentActivityCard({ selected, activities = [], onOpenItem, isLoading = false }) {
      if (isLoading) {
            return (
                  <Card className={cn(CARD, 'lg:col-span-1')}>
                        <CardHeader className="gap-1 px-6 pt-6 pb-0">
                              <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
                              <Skeleton className="h-4 w-36 rounded-sm" />
                        </CardHeader>
                        <CardContent className="space-y-5 p-6">
                              {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex items-center gap-3">
                                          <Skeleton className="size-10 rounded-full shrink-0" />
                                          <div className="min-w-0 flex-1 space-y-1.5">
                                                <Skeleton className="h-4 w-28 rounded-sm" />
                                                <Skeleton className="h-3 w-40 rounded-sm" />
                                          </div>
                                          <Skeleton className="h-3 w-12 rounded-sm shrink-0" />
                                    </div>
                              ))}
                        </CardContent>
                  </Card>
            );
      }
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
                              // Use real actor object returned by activities API (include: { actor: { select: ... } })
                              const actor = a.actor || null;
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
                              <div className="flex gap-2">
                                    {/* Quick-edit dialog — original behavior */}
                                    <Button className="h-11 flex-1 cursor-pointer" onClick={() => onOpenItem(selected)}>
                                          <Eye className="size-4" />
                                          Quick edit
                                    </Button>
                                    {/* Full detail page */}
                                    <Link
                                          to={`/work-items/${selected.id}`}
                                          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-border bg-transparent px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                                    >
                                          <ExternalLink className="size-4" />
                                          View details
                                    </Link>
                              </div>
                        )}
                  </CardContent>
            </Card>
      );
}

