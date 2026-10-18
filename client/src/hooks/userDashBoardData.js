import { useMemo } from 'react';

import { DAY, STATUSES, STATUS_META } from '@/lib/constants';
import { isActive, isUnassignedUrgent } from '@/lib/helpers';
import { ME } from '@/data/mockData';

/* All derived numbers for the stat cards + charts of the selected team */
export default function useDashboardData(teamItems, chartPriority) {
      const stats = useMemo(() => {
            const total = teamItems.length;
            const awaiting = teamItems.filter((i) => i.status === 'AwaitingApproval').length;
            return {
                  total,
                  active: teamItems.filter(isActive).length,
                  mine: teamItems.filter((i) => i.assigneeId === ME.id).length,
                  urgentUnassigned: teamItems.filter(isUnassignedUrgent).length,
                  awaiting,
            };
      }, [teamItems]);

      // bar chart (Revenue Updates slot)
      const chart = useMemo(() => {
            const rows = teamItems.filter((i) => chartPriority === 'all' || i.priority === chartPriority);
            return {
                  data: STATUSES.map((s) => ({
                        key: s,
                        label: STATUS_META[s].short,
                        team: rows.filter((i) => i.status === s).length,
                        mine: rows.filter((i) => i.status === s && i.assigneeId === ME.id).length,
                  })),
                  active: rows.filter(isActive).length,
                  team: rows.length,
                  mine: rows.filter((i) => i.assigneeId === ME.id).length,
            };
      }, [teamItems, chartPriority]);

      // new items per day (Monthly earnings slot)
      const newItems = useMemo(() => {
            const now = Date.now();
            const t = (i) => new Date(i.createdAt).getTime();
            const series = Array.from({ length: 7 }, (_, d) => {
                  const start = now - (7 - d) * DAY;
                  return teamItems.filter((i) => t(i) >= start && t(i) < start + DAY).length;
            });
            const thisWeek = series.reduce((a, b) => a + b, 0);
            const prevWeek = teamItems.filter((i) => t(i) >= now - 14 * DAY && t(i) < now - 7 * DAY).length;
            const delta = prevWeek ? Math.round(((thisWeek - prevWeek) / prevWeek) * 100) : thisWeek ? 100 : 0;
            return { series, thisWeek, delta };
      }, [teamItems]);

      // workload donut (Yearly Backup slot)
      const workload = useMemo(() => {
            const act = teamItems.filter(isActive);
            const mine = act.filter((i) => i.assigneeId === ME.id).length;
            const unassigned = act.filter((i) => !i.assigneeId).length;
            const others = act.length - mine - unassigned;
            return { mine, others, unassigned, assigned: mine + others, total: act.length };
      }, [teamItems]);

      return { stats, chart, newItems, workload };
}