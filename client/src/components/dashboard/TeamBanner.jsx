import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CARD } from '@/lib/constants';
import Chip from '@/components/shared/Chip';

/* Top strip inside a team: back to "All teams" + who you are in this team */
export default function TeamBanner({ team, canWrite, onBack }) {
      return (
            <Card className={CARD}>
                  <CardContent className="flex flex-wrap items-center gap-4 px-6 py-4">
                        <Button variant="outline" size="sm" onClick={onBack} className="cursor-pointer">
                              <ArrowLeft className="size-4" /> All teams
                        </Button>

                        <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                    <h1 className="text-lg font-medium">{team.name}</h1>
                                    <Chip tone={canWrite ? 'up' : 'down'}>{team.role ?? 'Not a member'}</Chip>
                              </div>
                              <p className="truncate text-sm text-muted-foreground">
                                    {team.description}
                                    {!canWrite && ' · View only, editing is disabled.'}
                              </p>
                        </div>
                  </CardContent>
            </Card>
      );
}