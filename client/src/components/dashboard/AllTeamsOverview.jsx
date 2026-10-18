import { useMemo, useState } from 'react';
import { Layers, ShieldCheck, TriangleAlert, Users } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CARD, DAY, PRIORITIES, STATUSES } from '@/lib/constants';
import { isActive, isUnassignedUrgent } from '@/lib/helpers';
import Chip from '@/components/shared/Chip';
import IconCircle from '@/components/shared/IconCircle';

import LiveClockCard from './LiveClockCard';
import TeamsWorkloadChart from './TeamsWorkloadChart';
import StatusMixCard from './StatusMixCard';
import NewItemsCard from './NewItemsCard';
import PriorityMixCard from './PriorityMixCard';
import NeedsAttentionCard from './NeedsAttentionCard';
import TeamCard from './TeamCard';

function OrgStat({ title, value, chip, tone, icon }) {
      return (
            <Card className={CARD}>
                  <CardContent className="flex items-start justify-between gap-3 p-4">
                        <div>
                              <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
                              <div className="mt-1.5 flex items-center gap-2">
                                    <span className="text-2xl font-semibold tracking-tight">{value}</span>
                                    <Chip tone={tone}>{chip}</Chip>
                              </div>
                        </div>
                        <IconCircle icon={icon} className="size-9" />
                  </CardContent>
            </Card>
      );
}

const SORTS = {
      default: () => 0,
      urgent: (a, b) => b.urgent - a.urgent || b.active - a.active,
      active: (a, b) => b.active - a.active,
      name: (a, b) => a.team.name.localeCompare(b.team.name),
};

/* "All teams" page: clock, org-wide numbers, charts, and a card per team */
export default function AllTeamsOverview({ teams, items, members, search, user, onSelectTeam }) {
      const [scope, setScope] = useState('all'); // all | mine | others
      const [sort, setSort] = useState('default');

      const data = useMemo(() => {
            const rows = teams.map((team) => {
                  const its = items.filter((i) => i.teamId === team.id);
                  const teamMembers = members[team.id] ?? [];
                  return {
                        team,
                        total: its.length,
                        active: its.filter(isActive).length,
                        urgent: its.filter(isUnassignedUrgent).length,
                        awaiting: its.filter((i) => i.status === 'AwaitingApproval').length,
                        byStatus: Object.fromEntries(STATUSES.map((s) => [s, its.filter((i) => i.status === s).length])),
                        lead: teamMembers.find((m) => m.role === 'Lead')?.user ?? null,
                        memberCount: teamMembers.length,
                  };
            });

            const sum = (k) => rows.reduce((a, r) => a + r[k], 0);
            const activeItems = items.filter(isActive);

            // new items per day across every team (same logic as the team dashboard)
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
                  .map((i) => ({ ...i, teamName: teams.find((tm) => tm.id === i.teamId)?.name }));

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
                  byStatus: Object.fromEntries(STATUSES.map((s) => [s, items.filter((i) => i.status === s).length])),
                  byPriority: Object.fromEntries(PRIORITIES.map((p) => [p, activeItems.filter((i) => i.priority === p).length])),
                  activeCount: activeItems.length,
                  newItems: { series, thisWeek, delta },
                  urgentItems,
            };
      }, [teams, items, members]);

      // header search filters teams by name / description here
      const q = search.trim().toLowerCase();
      const visible = data.rows
            .filter((r) => !q || `${r.team.name} ${r.team.description}`.toLowerCase().includes(q))
            .sort(SORTS[sort]);
      const mine = visible.filter((r) => r.team.myRole);
      const others = visible.filter((r) => !r.team.myRole);

      const grid = (list) => (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {list.map((r) => <TeamCard key={r.team.id} row={r} onOpen={onSelectTeam} />)}
            </div>
      );

      return (
            <div className="space-y-4">
                  {/* ROW 1: clock + org numbers */}
                  <section className="grid gap-4 lg:grid-cols-4">
                        <LiveClockCard user={user} org={data.org} />
                        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
                              <OrgStat title="Teams" value={data.org.teams} chip={`${data.org.mine} yours`} icon={Users} />
                              <OrgStat title="Active items" value={data.org.active} chip={`${data.org.total} total`} icon={Layers} />
                              <OrgStat
                                    title="Unassigned urgent"
                                    value={data.org.urgent}
                                    chip={data.org.urgent > 0 ? 'Action' : 'Clear'}
                                    tone={data.org.urgent > 0 ? 'down' : 'up'}
                                    icon={TriangleAlert}
                              />
                              <OrgStat title="Awaiting approval" value={data.org.awaiting} chip="all teams" icon={ShieldCheck} />
                        </div>
                  </section>

                  {/* ROW 2: team workload + status mix */}
                  <section className="grid gap-4 lg:grid-cols-3">
                        <TeamsWorkloadChart rows={data.rows} byStatus={data.byStatus} onOpen={onSelectTeam} />
                        <StatusMixCard byStatus={data.byStatus} total={data.org.total} />
                  </section>

                  {/* ROW 3: trend + priority + attention list */}
                  <section className="grid gap-4 lg:grid-cols-3">
                        <NewItemsCard newItems={data.newItems} />
                        <PriorityMixCard byPriority={data.byPriority} total={data.activeCount} />
                        <NeedsAttentionCard items={data.urgentItems.slice(0, 5)} total={data.urgentItems.length} onOpen={onSelectTeam} />
                  </section>

                  {/* ROW 4: teams */}
                  <section className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                              <h2 className="text-lg font-medium">Teams</h2>
                              <div className="flex flex-wrap items-center gap-2">
                                    <Tabs value={scope} onValueChange={setScope}>
                                          <TabsList>
                                                <TabsTrigger value="all" className="cursor-pointer">All</TabsTrigger>
                                                <TabsTrigger value="mine" className="cursor-pointer">My teams</TabsTrigger>
                                                <TabsTrigger value="others" className="cursor-pointer">Other teams</TabsTrigger>
                                          </TabsList>
                                    </Tabs>
                                    <Select value={sort} onValueChange={setSort}>
                                          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                                          <SelectContent>
                                                <SelectItem value="default">Default order</SelectItem>
                                                <SelectItem value="urgent">Most urgent</SelectItem>
                                                <SelectItem value="active">Most active</SelectItem>
                                                <SelectItem value="name">Name (A–Z)</SelectItem>
                                          </SelectContent>
                                    </Select>
                              </div>
                        </div>

                        {scope !== 'others' && mine.length > 0 && (
                              <div className="space-y-3">
                                    <h3 className="text-sm font-medium text-muted-foreground">My teams</h3>
                                    {grid(mine)}
                              </div>
                        )}

                        {scope !== 'mine' && others.length > 0 && (
                              <div className="space-y-3">
                                    <h3 className="text-sm font-medium text-muted-foreground">
                                          Other teams <span className="font-normal">· You can view these teams but not edit them.</span>
                                    </h3>
                                    {grid(others)}
                              </div>
                        )}

                        {visible.length === 0 && (
                              <p className="py-10 text-center text-sm text-muted-foreground">No teams match "{search}".</p>
                        )}
                  </section>
            </div>
      );
}