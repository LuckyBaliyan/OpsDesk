import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { APPROVER_ROLES, PAGE_SIZE, WRITE_ROLES } from '@/lib/constants';
import { isUnassignedUrgent } from '@/lib/helpers';
import { useGetUserTeamsQuery, useGetAllTeamsQuery, useGetTeamMembersQuery } from '@/stores/slices/teamApiSlice';
import { useGetAllWorkItemsQuery, useCreateWorkItemMutation, useUpdateWorkItemMutation, useDeleteWorkItemMutation } from '@/stores/slices/workItemsApiSlice';
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

// Main dashboard container managing team views, work item filters, queries, and modal dialogs
export default function DashBoard() {
      const currentUser = useSelector(selectCurrentUser);
      const { data: userTeamsData, isLoading: isUserTeamsLoading } = useGetUserTeamsQuery(currentUser?.id);
      const { data: allTeamsData, isLoading: isAllTeamsLoading } = useGetAllTeamsQuery();
      const {
            data: workItemsData,
            isLoading: isWorkItemsLoading,
            isFetching: isWorkItemsFetching
      } = useGetAllWorkItemsQuery();

      // Combined loading flag for initial server fetch across teams and work items
      const isDashboardLoading = (isAllTeamsLoading || isWorkItemsLoading) && (!allTeamsData || !workItemsData);

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

      const [searchParams, setSearchParams] = useSearchParams();
      const urlTeamId = searchParams.get('teamId') || null;

      const [activeTeamId, setActiveTeamId] = useState(urlTeamId);

      // Keep activeTeamId in sync with the URL search param (e.g., when navigating back or switching teams)
      useEffect(() => {
            setActiveTeamId(urlTeamId);
      }, [urlTeamId]);

      const [search, setSearch] = useState('');
      const [view, setView] = useState('all');
      const [statusFilter, setStatusFilter] = useState('all');
      const [priorityFilter, setPriorityFilter] = useState('all');
      const [chartPriority, setChartPriority] = useState('all');

      const queryKey = [activeTeamId, view, statusFilter, priorityFilter, search].join('|');
      const [pageState, setPageState] = useState({ key: '', page: 1 });
      const requestedPage = pageState.key === queryKey ? pageState.page : 1;

      // Updates the current paginated page state matching queryKey
      const setPage = (p) => setPageState({ key: queryKey, page: p });

      const [selectedId, setSelectedId] = useState(null);
      const [createOpen, setCreateOpen] = useState(false);
      const [editItem, setEditItem] = useState(null);

      // Resolve active team from ALL teams (not just user's teams) so non-members can
      // view any team's dashboard with Viewer-level access (role = null → canWrite = false)
      const activeTeam = enrichedAllTeams.find((t) => (t.id || t._id) === activeTeamId) ?? null;
      const role = activeTeam?.role ?? null;          // null = not a member (Viewer access)
      const isMember = role !== null;                  // true only when user has an explicit role
      const canWrite = WRITE_ROLES.includes(role);
      const isApprover = APPROVER_ROLES.includes(role);

      // Fetch team members only when user is an actual member — backend returns 403 otherwise
      const { data: membersRaw, isLoading: isMembersLoading } = useGetTeamMembersQuery(activeTeamId, { skip: !activeTeamId || !isMember });
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

      // Fetch real activity logs for the selected work item with auto-refetch when selected id changes
      const {
            data: activitiesRaw,
            isLoading: isActivitiesLoading,
            isFetching: isActivitiesFetching
      } = useGetWorkItemActivitiesQuery(
            { workItemId: selected?.id },
            { skip: !selected?.id, refetchOnMountOrArgChange: true }
      );

      // Sort activities deterministically with latest createdAt first, showing top 7 in card
      const activities = useMemo(() => {
            const list = Array.isArray(activitiesRaw) ? [...activitiesRaw] : [];
            return list
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 7);
      }, [activitiesRaw]);

      // Resets all active view, status, priority, and text search filters back to their default values
      const resetFilters = () => {
            setView('all');
            setStatusFilter('all');
            setPriorityFilter('all');
            setChartPriority('all');
            setSearch('');
            setSelectedId(null);
      };

      // Sets the active work item table view and smoothly scrolls the table into viewport
      const goTo = (v) => {
            setView(v);
            tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };

      /**
       * Navigates into a specific team dashboard view, updates URL query params, and resets active search filters
       */
      const selectTeam = (id, nextView = 'all') => {
            setActiveTeamId(id);
            setSearchParams(id ? { teamId: id } : {});
            resetFilters();
            if (nextView !== 'all') setView(nextView);
            window.scrollTo({ top: 0 });
      };

      /**
       * Navigates back to the global all teams overview dashboard and clears URL query params
       */
      const goToOverview = () => {
            setActiveTeamId(null);
            setSearchParams({});
            resetFilters();
            window.scrollTo({ top: 0 });
      };

      // Toggles sidebar collapse on desktop or toggles mobile drawer on mobile screens
      const toggleSidebar = () => {
            if (window.innerWidth >= 1024) setCollapsed((c) => !c);
            else setMobileOpen(true);
      };

      // Toggles the application color theme between dark and light modes
      const toggleTheme = () => {
            const next = !dark;
            document.documentElement.classList.toggle('dark', next);
            setDark(next);
      };

      // RTK Query mutations for creating and updating work items
      const [createWorkItem, { isLoading: isCreating }] = useCreateWorkItemMutation();
      const [updateWorkItem, { isLoading: isUpdating }] = useUpdateWorkItemMutation();
      const [deleteWorkItem, { isLoading: isDeleting }] = useDeleteWorkItemMutation();

      // Tracks which item is currently mid-delete (fades that row in the table)
      const [deletingItemId, setDeletingItemId] = useState(null);

      // Holds the item pending delete confirmation in the overlay dialog (null = no dialog)
      const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);

      // Combined mutation state indicating active work item CRUD operation
      const isWorkItemMutating = isCreating || isUpdating || isDeleting;

      // Combined loading flag for WorkItemsCard (initial load, background refetch, or mutation in progress)
      const isWorkItemsCardLoading =
            isDashboardLoading ||
            isWorkItemsLoading ||
            isWorkItemsFetching ||
            isWorkItemMutating;

      // Combined loading flag for RecentActivityCard (initial load, item switch, activities refetch, or CRUD mutation)
      const isActivitiesCardLoading =
            isDashboardLoading ||
            isActivitiesLoading ||
            isActivitiesFetching ||
            isWorkItemMutating;

      /**
       * Handler for CreateItemDialog — calls POST /work-items API with active team id.
       * Automatically selects newly created item so recent activities and item details refresh immediately.
       */
      const handleCreate = async (formData) => {
            if (!activeTeamId) return;
            try {
                  const createdItem = await createWorkItem({
                        ...formData,
                        teamId: activeTeamId,
                  }).unwrap();
                  if (createdItem?.id) {
                        setSelectedId(createdItem.id);
                  }
            } catch (err) {
                  console.error('Create work item failed:', err);
            }
      };

      /**
       * Handler for EditItemDialog — calls PATCH /work-items/:id API with optimistic lock version.
       */
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

      /**
       * Opens the inline confirm overlay for a table-row delete request.
       * Called by WorkItemsCard when Admin/Lead clicks the row's trash icon.
       */
      const handleDeleteRequest = (item) => {
            setConfirmDeleteItem(item);
      };

      /**
       * Executes the actual DELETE /work-items/:id API call after the user confirms.
       * Clears the selected item highlight and closes the edit dialog if the deleted
       * item was currently open. Also used directly by EditItemDialog's onDelete prop.
       */
      const handleDeleteConfirm = async (idToDelete) => {
            setConfirmDeleteItem(null);
            setDeletingItemId(idToDelete);
            try {
                  await deleteWorkItem(idToDelete).unwrap();
                  if (selectedId === idToDelete) setSelectedId(null);
                  // Close edit dialog if the deleted item is currently open
                  if (editItem?.id === idToDelete) setEditItem(null);
            } catch (err) {
                  console.error('Delete work item failed:', err);
            } finally {
                  setDeletingItemId(null);
            }
      };

      /**
       * Cancels the pending delete confirmation overlay without performing any action.
       */
      const handleDeleteCancel = () => setConfirmDeleteItem(null);

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
                              {!activeTeam && !activeTeamId ? (
                                    <AllTeamsOverview
                                          teams={enrichedAllTeams}
                                          items={allItems}
                                          search={search}
                                          user={currentUser}
                                          onSelectTeam={selectTeam}
                                          isLoading={isDashboardLoading}
                                    />
                              ) : (
                                    <>
                                          <TeamBanner
                                                team={activeTeam}
                                                canWrite={canWrite}
                                                onBack={goToOverview}
                                                isLoading={isDashboardLoading && !activeTeam}
                                          />

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
                                                            <OperationsCard activeTeam={activeTeam} stats={stats} onGoTo={goTo} isLoading={isDashboardLoading} />
                                                            <ApprovalCard isApprover={isApprover} stats={stats} onGoTo={goTo} isLoading={isDashboardLoading} />
                                                            <TotalItemsCard stats={stats} onGoTo={goTo} isLoading={isDashboardLoading} />
                                                      </section>

                                                      <section className="grid gap-6 lg:grid-cols-3">
                                                            <StatusOverviewCard
                                                                  chart={chart}
                                                                  chartPriority={chartPriority}
                                                                  onChartPriorityChange={setChartPriority}
                                                                  onGoTo={goTo}
                                                                  isLoading={isDashboardLoading}
                                                            />
                                                            <div className="flex flex-col gap-6">
                                                                  <NewItemsCard newItems={newItems} isLoading={isDashboardLoading} />
                                                                  <WorkloadCard workload={workload} isLoading={isDashboardLoading} />
                                                            </div>
                                                      </section>

                                                      <section ref={tableRef} className="grid scroll-mt-24 gap-6 lg:grid-cols-3">
                                                            <RecentActivityCard
                                                                  selected={selected}
                                                                  activities={activities}
                                                                  onOpenItem={setEditItem}
                                                                  isLoading={isActivitiesCardLoading}
                                                            />
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
                                                                  onDeleteItem={handleDeleteRequest}
                                                                  isAdminOrLead={isApprover}
                                                                  deletingId={deletingItemId}
                                                                  isLoading={isWorkItemsCardLoading}
                                                            />
                                                      </section>

                                                      <section>
                                                            <TeamMembersCard members={members} activeTeam={activeTeam} isLoading={isMembersLoading} />
                                                      </section>
                                                </>
                                          )}
                                    </>
                              )}
                        </main>
                  </div>

                  {createOpen && activeTeam && (
                        <CreateItemDialog
                              members={members}
                              isAdminOrLead={isApprover}
                              currentUserId={currentUser?.id}
                              onClose={() => setCreateOpen(false)}
                              onCreate={handleCreate}
                        />
                  )}

                  {editItem && activeTeam && (
                        <EditItemDialog
                              key={`${editItem.id}-${editItem.version}`}
                              item={allItems.find((i) => i.id === editItem.id) ?? editItem}
                              members={members}
                              meId={currentUser?.id}
                              canWrite={canWrite}
                              isAdminOrLead={isApprover}
                              onClose={() => setEditItem(null)}
                              onSave={handleSave}
                              onDelete={handleDeleteConfirm}
                        />
                  )}

                  {/* Inline confirm overlay for table-row delete requests — Admin/Lead only */}
                  {confirmDeleteItem && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                              <div className="rounded-xl border border-border bg-card p-6 shadow-xl max-w-sm w-full mx-4 space-y-4">
                                    <h3 className="font-semibold text-foreground">Delete work item?</h3>
                                    <p className="text-sm text-muted-foreground">
                                          <span className="font-medium text-foreground">"{confirmDeleteItem.title}"</span> will be permanently deleted. This cannot be undone.
                                    </p>
                                    <div className="flex justify-end gap-3">
                                          <Button variant="outline" onClick={handleDeleteCancel} className="cursor-pointer">Cancel</Button>
                                          <Button variant="destructive" onClick={() => handleDeleteConfirm(confirmDeleteItem.id)} className="cursor-pointer">Delete</Button>
                                    </div>
                              </div>
                        </div>
                  )}
            </div>
      );
}