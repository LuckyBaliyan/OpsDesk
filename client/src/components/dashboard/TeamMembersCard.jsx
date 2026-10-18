import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CARD } from '@/lib/constants';
import Chip from '@/components/shared/Chip';
import UserAvatar from '@/components/shared/UserAvatar';

/* Sales by Countries -> Team Members */
export default function TeamMembersCard({ members, activeTeam }) {
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
