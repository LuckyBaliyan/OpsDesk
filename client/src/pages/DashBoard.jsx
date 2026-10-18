import { useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import { APPROVER_ROLES, PAGE_SIZE, WRITE_ROLES } from '@/lib/constants';
import { isUnassignedUrgent } from '@/lib/helpers';
import { ME, TEAMS, MEMBERS, USERS, buildActivities, buildItems } from '@/data/mockData';
import useDashboardData from '@/hooks/userDashBoardData';

import Sidebar from '@/components/layout/SideBar';
import MobileDrawer from '@/components/layout/MobileDrawer';
import Header from '@/components/layout/Header';

import AllTeamsOverview from '@/components/dashboard/AllTeamsOverview';
import TeamBanner from '@/components/dashboard/TeamBanner';
import OperationsCard from '@/components/dashboard/OperationsCard';
import ApprovalCard from '@/components/dashboard/ApprovalCard';
import TotalItemsCard from '@/components/dashboard/TotalItemsCard';
import StatusOverviewCard from '@/components/dashboard/StatusOverviewCard';
import NewItemsCard from '@/components/dashboard/NewItemsCard';
import WorkloadCard from '@/components/dashboard/WorkloadCard';
import RecentActivityCard from '@/components/dashboard/RecentActivityCard';
import WorkItemsCard from '@/components/dashboard/WorkItemsCard';
import TeamMembersCard from '@/components/dashboard/TeamMembersCard';

import CreateItemDialog from '@/components/dialogs/CreateItemDialog';
import EditItemDialog from '@/components/dialogs/EditItemDialog';

export default function DashBoard() {
      const [collapsed, setCollapsed] = useState(false); // desktop sidebar
      const [mobileOpen, setMobileOpen] = useState(false); // mobile drawer
      const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
      const tableRef = useRef(null);

      const [allItems, setAllItems] = useState(buildItems);
      const [allActivities, setAllActivities] = useState(() => buildActivities(buildItems()));

      // null = "All teams" overview, otherwise the id of the opened team
      const [activeTeamId, setActiveTeamId] = useState(null);

      // table filters
      const [search, setSearch] = useState('');
      const [view, setView] = useState('all');
      const [statusFilter, setStatusFilter] = useState('all');
      const [priorityFilter, setPriorityFilter] = useState('all');

      // chart filter (the "Year 2026" dropdown slot in the reference)
      const [chartPriority, setChartPriority] = useState('all');

      // page resets to 1 whenever the filter combination changes
      const queryKey = [activeTeamId, view, statusFilter, priorityFilter, search].join('|');
      const [pageState, setPageState] = useState({ key: '', page: 1 });
      const requestedPage = pageState.key === queryKey ? pageState.page : 1;
      const setPage = (p) => setPageState({ key: queryKey, page: p });

      const [selectedId, setSelectedId] = useState(null);
      const [createOpen, setCreateOpen] = useState(false);
      const [editItem, setEditItem] = useState(null);

      const activeTeam = TEAMS.find((t) => t.id === activeTeamId) ?? null;
      const role = activeTeam?.myRole ?? null; // null when not a member -> view only
      const canWrite = WRITE_ROLES.includes(role);
      const isApprover = APPROVER_ROLES.includes(role);
      const members = activeTeam ? MEMBERS[activeTeam.id] ?? [] : [];

      /* ---- derived data ---- */
      const teamItems = useMemo(
            () => (activeTeamId ? allItems.filter((i) => i.teamId === activeTeamId) : []),
            [allItems, activeTeamId]
      );
      const { stats, chart, newItems, workload } = useDashboardData(teamItems, chartPriority);

      // table
      const filtered = useMemo(() => {
            const q = search.trim().toLowerCase();
            return teamItems
                  .filter((i) => {
                        if (view === 'mine' && i.assigneeId !== ME.id) return false;
                        if (view === 'urgent' && !isUnassignedUrgent(i)) return false;
                        if (view === 'approval' && i.status !== 'AwaitingApproval') return false;
                        if (statusFilter !== 'all' && i.status !== statusFilter) return false;
                        if (priorityFilter !== 'all' && i.priority !== priorityFilter) return false;
                        if (q && !`${i.title} ${i.description}`.toLowerCase().includes(q)) return false;
                        return true;
                  })
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }, [teamItems, view, statusFilter, priorityFilter, search]);

      const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
      const page = Math.min(requestedPage, totalPages);
      const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

      const selected = filtered.find((i) => i.id === selectedId) ?? items[0] ?? null;
      const activities = selected ? (allActivities[selected.id] ?? []).slice(0, 7) : [];

      /* ---- local "mutations" ---- */
      const pushActivity = (itemId, actorId, actionType, newValue) =>
            setAllActivities((prev) => ({
                  ...prev,
                  [itemId]: [
                        { id: `${itemId}-${Date.now()}-${newValue}`, actorId, actionType, newValue, createdAt: new Date().toISOString() },
                        ...(prev[itemId] ?? []),
                  ],
            }));

      const createItem = (data) => {
            const id = `wi-${Date.now()}`;
            const item = {
                  id,
                  teamId: activeTeamId,
                  ...data,
                  status: 'Open',
                  createdById: ME.id,
                  version: 1,
                  createdAt: new Date().toISOString(),
            };
            setAllItems((prev) => [item, ...prev]);
            setAllActivities((prev) => ({
                  ...prev,
                  [id]: [{ id: `${id}-a1`, actorId: ME.id, actionType: 'CREATED', newValue: item.title, createdAt: item.createdAt }],
            }));
            setView('all');
            setSelectedId(id);
      };

      const saveItem = (id, form) => {
            const current = allItems.find((i) => i.id === id);
            if (!current) return;
            if (form.status !== current.status) pushActivity(id, ME.id, 'UPDATED', `Status changed to ${form.status}`);
            if (form.priority !== current.priority) pushActivity(id, ME.id, 'UPDATED', `Priority changed to ${form.priority}`);
            if (form.assigneeId !== current.assigneeId && form.assigneeId)
                  pushActivity(id, ME.id, 'UPDATED', `Assigned to ${USERS[form.assigneeId].name}`);
            setAllItems((prev) =>
                  prev.map((i) =>
                        i.id === id
                              ? { ...i, status: form.status, priority: form.priority, assigneeId: form.assigneeId, version: i.version + 1 }
                              : i
                  )
            );
      };

      /* ---- ui helpers ---- */
      const resetFilters = () => {
            setView('all');
            setStatusFilter('all');
            setPriorityFilter('all');
            setChartPriority('all');
            setSearch('');
            setSelectedId(null);
      };

      const goTo = (v) => {
            setView(v);
            tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };

      // nextView lets the overview open a team straight on e.g. its "Unassigned urgent" tab
      const selectTeam = (id, nextView = 'all') => {
            setActiveTeamId(id);
            resetFilters();
            if (nextView !== 'all') setView(nextView);
            window.scrollTo({ top: 0 });
      };

      const goToOverview = () => {
            setActiveTeamId(null);
            resetFilters();
            window.scrollTo({ top: 0 });
      };

      const toggleSidebar = () => {
            if (window.innerWidth >= 1024) setCollapsed((c) => !c);
            else setMobileOpen(true);
      };

      const toggleTheme = () => {
            const next = !dark;
            document.documentElement.classList.toggle('dark', next);
            setDark(next);
      };

      const sidebarProps = {
            teams: TEAMS,
            activeTeamId,
            onSelectTeam: selectTeam,
            onSelectOverview: goToOverview,
            view,
            onSelectView: goTo,
            user: ME,
      };

      /* ---------------------------------------------------------------------- */

      return (
            <div className="min-h-screen bg-background text-foreground">
                  <Sidebar collapsed={collapsed} {...sidebarProps} />
                  <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} {...sidebarProps} />

                  <div className={cn(!collapsed && 'lg:pl-64')}>
                        <Header
                              user={ME}
                              search={search}
                              onSearchChange={setSearch}
                              canWrite={canWrite}
                              onNewItem={() => setCreateOpen(true)}
                              dark={dark}
                              onToggleTheme={toggleTheme}
                              onToggleSidebar={toggleSidebar}
                              urgentCount={activeTeam ? stats.urgentUnassigned : 0}
                              onBellClick={() => activeTeam && goTo('urgent')}
                        />

                        <main className="space-y-6 p-4">
                              {!activeTeam ? (
                                    /* ---------- ALL TEAMS ---------- */
                                    <AllTeamsOverview
                                          teams={TEAMS}
                                          items={allItems}
                                          members={MEMBERS}
                                          search={search}
                                          user={ME}
                                          onSelectTeam={selectTeam}
                                    />
                              ) : (
                                    /* ---------- ONE TEAM ---------- */
                                    <>
                                          <TeamBanner team={activeTeam} canWrite={canWrite} onBack={goToOverview} />

                                          {/* ROW 1 */}
                                          <section className="grid gap-6 lg:grid-cols-4">
                                                <OperationsCard activeTeam={activeTeam} stats={stats} onGoTo={goTo} />
                                                <ApprovalCard isApprover={isApprover} stats={stats} onGoTo={goTo} />
                                                <TotalItemsCard stats={stats} onGoTo={goTo} />
                                          </section>

                                          {/* ROW 2 */}
                                          <section className="grid gap-6 lg:grid-cols-3">
                                                <StatusOverviewCard
                                                      chart={chart}
                                                      chartPriority={chartPriority}
                                                      onChartPriorityChange={setChartPriority}
                                                      onGoTo={goTo}
                                                />
                                                <div className="flex flex-col gap-6">
                                                      <NewItemsCard newItems={newItems} />
                                                      <WorkloadCard workload={workload} />
                                                </div>
                                          </section>

                                          {/* ROW 3 */}
                                          <section ref={tableRef} className="grid scroll-mt-24 gap-6 lg:grid-cols-3">
                                                <RecentActivityCard selected={selected} activities={activities} onOpenItem={setEditItem} />
                                                <WorkItemsCard
                                                      activeTeam={activeTeam}
                                                      total={filtered.length}
                                                      items={items}
                                                      selected={selected}
                                                      view={view}
                                                      onViewChange={setView}
                                                      statusFilter={statusFilter}
                                                      onStatusFilterChange={setStatusFilter}
                                                      priorityFilter={priorityFilter}
                                                      onPriorityFilterChange={setPriorityFilter}
                                                      page={page}
                                                      totalPages={totalPages}
                                                      onPageChange={setPage}
                                                      onSelect={setSelectedId}
                                                      onOpenItem={setEditItem}
                                                />
                                          </section>

                                          {/* ROW 4 */}
                                          <section>
                                                <TeamMembersCard members={members} activeTeam={activeTeam} />
                                          </section>
                                    </>
                              )}
                        </main>
                  </div>

                  {createOpen && activeTeam && (
                        <CreateItemDialog members={members} onClose={() => setCreateOpen(false)} onCreate={createItem} />
                  )}

                  {editItem && activeTeam && (
                        <EditItemDialog
                              key={`${editItem.id}-${editItem.version}`}
                              item={allItems.find((i) => i.id === editItem.id) ?? editItem}
                              members={members}
                              meId={ME.id}
                              canWrite={canWrite}
                              onClose={() => setEditItem(null)}
                              onSave={saveItem}
                        />
                  )}
            </div>
      );
}