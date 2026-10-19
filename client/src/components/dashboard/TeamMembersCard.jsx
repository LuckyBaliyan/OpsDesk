import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CARD } from '@/lib/constants';
import Chip from '@/components/shared/Chip';
import UserAvatar from '@/components/shared/UserAvatar';

import { Skeleton } from '@/components/ui/skeleton';

// Renders the team membership card listing members and roles with loading skeleton support
export default function TeamMembersCard({ members = [], activeTeam, isLoading = false }) {
      if (isLoading) {
            return (
                  <Card className={CARD}>
                        <CardHeader className="gap-1 px-6 pt-6 pb-0">
                              <CardTitle className="text-lg font-medium">Team Members</CardTitle>
                              <Skeleton className="h-4 w-36 rounded-sm" />
                        </CardHeader>
                        <CardContent className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
                              {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-4">
                                          <Skeleton className="size-10 rounded-full shrink-0" />
                                          <div className="min-w-0 flex-1 space-y-1.5">
                                                <Skeleton className="h-4 w-24 rounded-sm" />
                                                <Skeleton className="h-3 w-32 rounded-sm" />
                                          </div>
                                          <Skeleton className="h-5 w-14 rounded-sm shrink-0" />
                                    </div>
                              ))}
                        </CardContent>
                  </Card>
            );
      }
      return (
            <Card className={CARD}>
                  <CardHeader className="gap-1 px-6 pt-6 pb-0">
                        <CardTitle className="text-lg font-medium">Team Members</CardTitle>
                        <CardDescription className="text-sm">{members.length} people in {activeTeam.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
                        {members.map((m) => (
                              <div key={m.id} className="flex items-center gap-3 rounded-lg border border-border p-4">
                                    <UserAvatar name={m.user.name} email={m.user.email} className="size-10" />
                                    <div className="min-w-0 flex-1">
                                          <p className="truncate text-sm font-semibold">{m.user.name}</p>
                                          <p className="truncate text-xs text-muted-foreground">{m.user.email}</p>
                                    </div>
                                    <Chip tone={m.role === 'Viewer' ? 'down' : 'up'}>{m.role}</Chip>
                              </div>
                        ))}
                  </CardContent>
            </Card>
      );
}
