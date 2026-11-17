import { useMemo } from 'react';
import { Layers, ShieldCheck, TriangleAlert, Users } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { CARD, DAY, PRIORITIES, STATUSES } from '@/lib/constants';
import { isActive, isUnassignedUrgent } from '@/lib/helpers';
import Chip from '@/components/shared/Chip';
import IconCircle from '@/components/shared/IconCircle';
import { Skeleton } from '@/components/ui/skeleton';

import LiveClockCard from './LiveClockCard';
import TeamsWorkloadChart from './TeamsWorkloadChart';
import StatusMixCard from './StatusMixCard';
import NewItemsCard from './NewItemsCard';
import PriorityMixCard from './PriorityMixCard';
import NeedsAttentionCard from './NeedsAttentionCard';
import ActiveTeamsSection from './ActiveTeamsSection';

// Renders an individual organization statistic metric card with support for a pulsing skeleton loading state
function OrgStat({ title, value, chip, tone, icon, isLoading = false }) {
      return (
            <Card className={CARD}>
                  <CardContent className="flex items-start justify-between gap-3 p-4">
                        <div className="space-y-1">
                              <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
                              {isLoading ? (
                                    <div className="mt-1.5 flex items-center gap-2">
                                          <Skeleton className="h-7 w-12 rounded-md" />
                                          <Skeleton className="h-5 w-16 rounded-sm" />
                                    </div>
                              ) : (
                                    <div className="mt-1.5 flex items-center gap-2">
                                          <span className="text-2xl font-semibold tracking-tight">{value}</span>
                                          <Chip tone={tone}>{chip}</Chip>
                                    </div>
                              )}
                        </div>
                        <IconCircle icon={icon} className="size-9 shrink-0" />
                  </CardContent>
            </Card>
      );
}

/**
 * Optimized Global Organization Dashboard Overview.
 * Displays high-level KPIs, organization workload, trend charts, attention list,
 * and top active teams categorized by activity volume.
 */
export default function AllTeamsOverview({
      teams = [],
      items = [],
      user,
      onSelectTeam,
      isLoading = false
}) {
      const data = useMemo(() => {
            const rows = teams.map((team) => {
                  const teamId = team.id || team._id;
                  const its = items.filter((i) => i.teamId === teamId);

                  return {
                        team,
                        total: its.length,
                        active: its.filter(isActive).length,
                        urgent: its.filter(isUnassignedUrgent).length,
                        awaiting: its.filter((i) => i.status?.toLowerCase() === 'awaitingapproval' || i.status === 'AwaitingApproval').length,
                        byStatus: Object.fromEntries(
                              STATUSES.map((s) => [
                                    s,
                                    its.filter((i) => i.status?.toLowerCase() === s.toLowerCase()).length
                              ])
                        ),
                  };
            });

            const sum = (k) => rows.reduce((a, r) => a + r[k], 0);
            const activeItems = items.filter(isActive);

            // New items per day across every team
            const now = Date.now();
            const t = (i) => new Date(i.createdAt).getTime();
            const series = Array.from({ length: 7 }, (_, d) => {
                  const start = now - (7 - d) * DAY;
                  return items.filter((i) => t(i) >= start && t(i) < start + DAY).length;
            });
            const thisWeek = series.reduce((a, b) => a + b, 0);
            const prevWeek = items.filter((i) => t(i) >= now - 14 * DAY && t(i) < now - 7 * DAY).length;
            const delta = prevWeek ? Math.round(((thisWeek - prevWeek) / prevWeek) * 100) : thisWeek ? 100 : 0;

            const urgentItems = items
                  .filter(isUnassignedUrgent)
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((i) => ({ ...i, teamName: teams.find((tm) => (tm.id || tm._id) === i.teamId)?.name }));

            return {
                  rows,
                  org: {
                        teams: rows.length,
                        mine: rows.filter((r) => r.team.myRole).length,
                        active: sum('active'),
                        total: sum('total'),
                        urgent: sum('urgent'),
                        awaiting: sum('awaiting'),
                  },
                  byStatus: Object.fromEntries(
                        STATUSES.map((s) => [
                              s,
                              items.filter((i) => i.status?.toLowerCase() === s.toLowerCase()).length
                        ])
                  ),
                  byPriority: Object.fromEntries(
                        PRIORITIES.map((p) => [
                              p,
                              activeItems.filter((i) => i.priority?.toLowerCase() === p.toLowerCase()).length
                        ])
                  ),
                  activeCount: activeItems.length,
                  newItems: { series, thisWeek, delta },
                  urgentItems,
            };
      }, [teams, items]);

      return (
            <div className="space-y-6">
                  {/* ROW 1: clock + org numbers */}
                  <section className="grid gap-4 lg:grid-cols-4">
                        <LiveClockCard user={user} org={data.org} isLoading={isLoading} />
                        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
                              <OrgStat title="Teams" value={data.org.teams} chip={`${data.org.mine} yours`} icon={Users} isLoading={isLoading} />
                              <OrgStat title="Active items" value={data.org.active} chip={`${data.org.total} total`} icon={Layers} isLoading={isLoading} />
                              <OrgStat
                                    title="Unassigned urgent"
                                    value={data.org.urgent}
                                    chip={data.org.urgent > 0 ? 'Action' : 'Clear'}
                                    tone={data.org.urgent > 0 ? 'down' : 'up'}
                                    icon={TriangleAlert}
                                    isLoading={isLoading}
                              />
                              <OrgStat title="Awaiting approval" value={data.org.awaiting} chip="all teams" icon={ShieldCheck} isLoading={isLoading} />
                        </div>
                  </section>

                  {/* ROW 2: team workload + status mix */}
                  <section className="grid gap-4 lg:grid-cols-3">
                        <TeamsWorkloadChart rows={data.rows} byStatus={data.byStatus} onOpen={onSelectTeam} isLoading={isLoading} />
                        <StatusMixCard byStatus={data.byStatus} total={data.org.total} isLoading={isLoading} />
                  </section>

                  {/* ROW 3: trend + priority + attention list */}
                  <section className="grid gap-4 lg:grid-cols-3">
                        <NewItemsCard newItems={data.newItems} isLoading={isLoading} />
                        <PriorityMixCard byPriority={data.byPriority} total={data.activeCount} isLoading={isLoading} />
                        <NeedsAttentionCard items={data.urgentItems.slice(0, 5)} total={data.urgentItems.length} onOpen={onSelectTeam} isLoading={isLoading} />
                  </section>

                  {/* ROW 4: Optimized Top Active Teams */}
                  <ActiveTeamsSection
                        rows={data.rows}
                        onSelectTeam={onSelectTeam}
                        isLoading={isLoading}
                  />
            </div>
      );
}
