import { useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import { APPROVER_ROLES, PAGE_SIZE, WRITE_ROLES } from '@/lib/constants';
import { isUnassignedUrgent } from '@/lib/helpers';
import { useGetUserTeamsQuery, useGetAllTeamsQuery, useGetTeamMembersQuery } from '@/stores/slices/teamApiSlice';
import { useGetAllWorkItemsQuery, useCreateWorkItemMutation, useUpdateWorkItemMutation } from '@/stores/slices/workItemsApiSlice';
import { useGetWorkItemActivitiesQuery } from '@/stores/slices/activitiesApiSlice';
import { selectCurrentUser } from '@/stores/slices/userSlice';
import useDashboardData from '@/hooks/userDashBoardData';
import { useSelector } from 'react-redux';

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
import UsersView from '@/components/dashboard/UsersView';

import CreateItemDialog from '@/components/dialogs/CreateItemDialog';
import EditItemDialog from '@/components/dialogs/EditItemDialog';

export default function DashBoard() {
      const currentUser = useSelector(selectCurrentUser);
      const { data: userTeamsData } = useGetUserTeamsQuery(currentUser?.id);
      const { data: allTeamsData } = useGetAllTeamsQuery();
      const { data: workItemsData } = useGetAllWorkItemsQuery();

      const teams = userTeamsData?.teams || userTeamsData || [];
      const allTeams = allTeamsData?.teams || allTeamsData || teams;

      // Real items from API
      const allItems = useMemo(() => workItemsData?.data || workItemsData || [], [workItemsData]);

      // Merge user role into allTeams so TeamCard knows which teams the user belongs to
      const enrichedAllTeams = useMemo(() => {
            const userTeamRoleMap = new Map();
            teams.forEach((t) => {
                  const teamId = t.id || t._id;
                  const userRole = t.role || t.myRole;
                  if (teamId && userRole) {
                        userTeamRoleMap.set(teamId, userRole);
                  }
            });

            return allTeams.map((team) => {
                  const teamId = team.id || team._id;
                  const assignedRole = userTeamRoleMap.get(teamId) || team.role || team.myRole || null;
                  return {
                        ...team,
                        role: assignedRole,
                        myRole: assignedRole,
                  };
            });
      }, [allTeams, teams]);

      const [collapsed, setCollapsed] = useState(false);
      const [mobileOpen, setMobileOpen] = useState(false);
      const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
      const tableRef = useRef(null);

      const [activeTeamId, setActiveTeamId] = useState(null);

      const [search, setSearch] = useState('');
      const [view, setView] = useState('all');
      const [statusFilter, setStatusFilter] = useState('all');
      const [priorityFilter, setPriorityFilter] = useState('all');
      const [chartPriority, setChartPriority] = useState('all');

      const queryKey = [activeTeamId, view, statusFilter, priorityFilter, search].join('|');
      const [pageState, setPageState] = useState({ key: '', page: 1 });
      const requestedPage = pageState.key === queryKey ? pageState.page : 1;
      const setPage = (p) => setPageState({ key: queryKey, page: p });

      const [selectedId, setSelectedId] = useState(null);
      const [createOpen, setCreateOpen] = useState(false);
      const [editItem, setEditItem] = useState(null);

      const activeTeam = teams.find((t) => (t.id || t._id) === activeTeamId) ?? null;
      const role = activeTeam?.role ?? null;
      const canWrite = WRITE_ROLES.includes(role);
      const isApprover = APPROVER_ROLES.includes(role);

      // Fetch real members for active team from API (replaces MEMBERS mock)
      const { data: membersRaw } = useGetTeamMembersQuery(activeTeamId, { skip: !activeTeamId });
      const members = membersRaw?.members || membersRaw?.data || (Array.isArray(membersRaw) ? membersRaw : []);

      const teamItems = useMemo(
            () => (activeTeamId ? allItems.filter((i) => i.teamId === activeTeamId) : []),
            [allItems, activeTeamId]
      );

      // Pass real currentUserId to the hook instead of ME mock
      const { stats, chart, newItems, workload } = useDashboardData(teamItems, chartPriority, currentUser?.id);

      const filtered = useMemo(() => {
            const q = search.trim().toLowerCase();
            return teamItems
                  .filter((i) => {
                        if (view === 'mine' && i.assigneeId !== currentUser?.id) return false;
                        if (view === 'urgent' && !isUnassignedUrgent(i)) return false;
                        if (view === 'approval' && i.status !== 'AwaitingApproval') return false;
                        if (statusFilter !== 'all' && i.status !== statusFilter) return false;
                        if (priorityFilter !== 'all' && i.priority !== priorityFilter) return false;
                        if (q && !`${i.title} ${i.description}`.toLowerCase().includes(q)) return false;
                        return true;
                  })
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }, [teamItems, view, statusFilter, priorityFilter, search, currentUser?.id]);

      const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
      const page = Math.min(requestedPage, totalPages);
      const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

      const selected = filtered.find((i) => i.id === selectedId) ?? items[0] ?? null;

      // Fetch real activity logs for the selected work item from activities API
      const { data: activitiesRaw } = useGetWorkItemActivitiesQuery(
            { workItemId: selected?.id },
            { skip: !selected?.id }
      );
      // First 7 activities shown in the Recent Activity card
      const activities = (activitiesRaw || []).slice(0, 7);

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

      // RTK Query mutations for creating and updating work items
      const [createWorkItem] = useCreateWorkItemMutation();
      const [updateWorkItem] = useUpdateWorkItemMutation();

      // Handler for CreateItemDialog — calls POST /work-items API with active team id
      const handleCreate = async (formData) => {
            if (!activeTeamId) return;
            try {
                  await createWorkItem({
                        ...formData,
                        teamId: activeTeamId,
                  }).unwrap();
            } catch (err) {
                  console.error('Create work item failed:', err);
            }
      };

      // Handler for EditItemDialog — calls PATCH /work-items/:id API with optimistic lock version
      const handleSave = async (id, formData) => {
            const currentItem = allItems.find((i) => i.id === id);
            try {
                  await updateWorkItem({
                        id,
                        ...formData,
                        // Send current version so server can detect concurrent edits
                        version: currentItem?.version,
                  }).unwrap();
            } catch (err) {
                  console.error('Update work item failed:', err);
            }
      };

      const sidebarProps = {
            teams: teams,
            activeTeamId,
            onSelectTeam: selectTeam,
            onSelectOverview: goToOverview,
            view,
            onSelectView: goTo,
            user: currentUser,
      };

      return (
            <div className="min-h-screen bg-background text-foreground">
                  <Sidebar collapsed={collapsed} {...sidebarProps} />
                  <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} {...sidebarProps} />

                  <div className={cn(!collapsed && 'lg:pl-64')}>
                        <Header
                              user={currentUser}
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
                                    <AllTeamsOverview
                                          teams={enrichedAllTeams}
                                          items={allItems}
                                          search={search}
                                          user={currentUser}
                                          onSelectTeam={selectTeam}
                                    />
                              ) : (
                                    <>
                                          <TeamBanner team={activeTeam} canWrite={canWrite} onBack={goToOverview} />

                                          {/* ── Users view (Admin-only management tab) ── */}
                                          {view === 'users' ? (
                                                <UsersView
                                                      activeTeam={activeTeam}
                                                      members={members}
                                                      isAdmin={role === 'Admin'}
                                                      currentUserId={currentUser?.id}
                                                />
                                          ) : (
                                                <>
                                                      <section className="grid gap-6 lg:grid-cols-4">
                                                            <OperationsCard activeTeam={activeTeam} stats={stats} onGoTo={goTo} />
                                                            <ApprovalCard isApprover={isApprover} stats={stats} onGoTo={goTo} />
                                                            <TotalItemsCard stats={stats} onGoTo={goTo} />
                                                      </section>

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

                                                      <section>
                                                            <TeamMembersCard members={members} activeTeam={activeTeam} />
                                                      </section>
                                                </>
                                          )}
                                    </>
                              )}
                        </main>
                  </div>

                  {createOpen && activeTeam && (
                        <CreateItemDialog members={members} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
                  )}

                  {editItem && activeTeam && (
                        <EditItemDialog
                              key={`${editItem.id}-${editItem.version}`}
                              item={allItems.find((i) => i.id === editItem.id) ?? editItem}
                              members={members}
                              meId={currentUser?.id}
                              canWrite={canWrite}
                              onClose={() => setEditItem(null)}
                              onSave={handleSave}
                        />
                  )}
            </div>
      );
}