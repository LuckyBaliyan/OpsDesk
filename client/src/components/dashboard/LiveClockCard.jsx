import { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CARD } from '@/lib/constants';
import Chip from '@/components/shared/Chip';
import HeroIllustration from '@/components/charts/HeroIllustration';

import { Skeleton } from '@/components/ui/skeleton';

// Renders the organization overview hero card with a live clock, regional date, day progress bar, and user teams count
export default function LiveClockCard({ user, org, isLoading = false }) {
      const [now, setNow] = useState(() => new Date());
      const [is24, setIs24] = useState(false);

      useEffect(() => {
            const id = setInterval(() => setNow(new Date()), 1000);
            return () => clearInterval(id);
      }, []);

      const hour = now.getHours();
      const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
      const firstName = (user?.name || '').split(' ')[0];

      const time = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: !is24 });
      const date = now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, ' ');
      const tzShort = new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' })
            .formatToParts(now)
            .find((p) => p.type === 'timeZoneName')?.value;

      const dayPct = Math.round(((hour * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400) * 100);

      return (
            <Card className={cn(CARD, 'relative min-h-[170px] overflow-hidden lg:col-span-2')}>
                  <CardContent className="relative z-10 flex h-full flex-col justify-between gap-4 p-5">
                        <div>
                              <p className="text-sm text-muted-foreground">{greeting}{firstName && `, ${firstName}`}</p>
                              <h2 className="text-lg font-medium">Organization Overview</h2>
                        </div>

                        <div>
                              <button
                                    type="button"
                                    onClick={() => setIs24((v) => !v)}
                                    title="Click to switch 12h / 24h"
                                    className="cursor-pointer text-left text-3xl font-semibold tracking-tight tabular-nums"
                              >
                                    {time}
                              </button>
                              <p className="mt-1 text-sm text-muted-foreground">{date}</p>
                        </div>

                        <div className="max-w-sm space-y-2">
                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <Globe className="size-3.5" />
                                    <span>{tz}{tzShort && ` · ${tzShort}`}</span>
                                    {isLoading ? (
                                          <Skeleton className="h-5 w-32 rounded-sm" />
                                    ) : (
                                          <Chip>{org?.mine ?? 0} of {org?.teams ?? 0} teams yours</Chip>
                                    )}
                              </div>
                              <div className="flex items-center gap-2" title={`${dayPct}% of today has passed`}>
                                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                                          <span className="block h-full rounded-full bg-primary transition-all" style={{ width: `${dayPct}%` }} />
                                    </span>
                                    <span className="text-xs text-muted-foreground tabular-nums">{dayPct}% of day</span>
                              </div>
                        </div>
                  </CardContent>
                  <HeroIllustration className="pointer-events-none absolute right-4 bottom-0 hidden h-[150px] text-foreground xl:block" />
            </Card>
      );
}