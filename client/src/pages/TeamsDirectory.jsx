import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { cn } from '@/lib/utils';

import Sidebar from '@/components/layout/SideBar';
import MobileDrawer from '@/components/layout/MobileDrawer';
import Header from '@/components/layout/Header';
import TeamsHeader from '@/components/teams/TeamsHeader';
import TeamsFilterBar from '@/components/teams/TeamsFilterBar';
import TeamsTableView from '@/components/teams/TeamsTableView';
import TeamsGridView from '@/components/teams/TeamsGridView';
import TeamsPagination from '@/components/teams/TeamsPagination';

import useTeamPreferences from '@/hooks/useTeamPreferences';
import useTeamsDirectory from '@/hooks/useTeamsDirectory';
import { useGetAllTeamsQuery, useGetUserTeamsQuery } from '@/stores/slices/teamApiSlice';
import { useGetAllWorkItemsQuery } from '@/stores/slices/workItemsApiSlice';
import { selectCurrentUser } from '@/stores/slices/userSlice';

const PAGE_SIZE = 6;
const VIEW_MODE_KEY = 'opsdesk_teams_view_mode';

/**
 * Dedicated All Teams Directory Page.
 * Displays searchable, filterable, and paginated teams in Grid and List view formats.
 */
export default function TeamsDirectory() {
      const navigate = useNavigate();
      const currentUser = useSelector(selectCurrentUser);

      const [collapsed, setCollapsed] = useState(false);
      const [mobileOpen, setMobileOpen] = useState(false);
      const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

      // Read saved view mode preference with 'grid' as default
      const [viewMode, setViewMode] = useState(() => {
            try {
                  return localStorage.getItem(VIEW_MODE_KEY) || 'grid';
            } catch {
                  return 'grid';
            }
      });
      const [search, setSearch] = useState('');
      const [roleFilter, setRoleFilter] = useState('all');
      const [statusFilter, setStatusFilter] = useState('all');
      const [currentPage, setCurrentPage] = useState(1);

      /**
       * Updates the view format between Grid and List and saves preference to localStorage.
       */
      const handleViewModeChange = (mode) => {
            setViewMode(mode);
            try {
                  localStorage.setItem(VIEW_MODE_KEY, mode);
            } catch (err) {
                  console.error('Failed to save view mode preference:', err);
            }
      };

      const { isTeamStarred, toggleStarTeam, recordRecentVisit } = useTeamPreferences();

      const { data: allTeamsData, isLoading: isAllTeamsLoading } = useGetAllTeamsQuery();
      const { data: userTeamsData } = useGetUserTeamsQuery(currentUser?.id, { skip: !currentUser?.id });
      const { data: workItemsData } = useGetAllWorkItemsQuery();

      const {
            displayedTeams,
            totalCount,
            totalPages,
            page,
            rangeText,
      } = useTeamsDirectory({
            rawTeams: allTeamsData?.teams || allTeamsData || [],
            userTeams: userTeamsData?.teams || userTeamsData || [],
            workItems: workItemsData?.data || workItemsData || [],
            search,
            roleFilter,
            statusFilter,
            currentPage,
            pageSize: PAGE_SIZE,
      });

      /**
       * Clears all filters and resets the active page to 1.
       */
      const handleClearFilters = () => {
            setSearch('');
            setRoleFilter('all');
            setStatusFilter('all');
            setCurrentPage(1);
      };

      /**
       * Opens a team's dashboard and marks it in recent visits.
       */
      const handleSelectTeam = (teamId) => {
            recordRecentVisit(teamId);
            navigate(`/dashboard?teamId=${teamId}`);
      };

      /**
       * Toggles the system light/dark theme class on the document root
       */
      const toggleTheme = () => {
            const next = !dark;
            document.documentElement.classList.toggle('dark', next);
            setDark(next);
      };

      return (
            <div className="min-h-screen bg-background text-foreground">
                  <Sidebar
                        collapsed={collapsed}
                        activeTeamId={null}
                        onSelectTeam={handleSelectTeam}
                        onSelectOverview={() => navigate('/dashboard')}
                  />
                  <MobileDrawer
                        open={mobileOpen}
                        onClose={() => setMobileOpen(false)}
                        activeTeamId={null}
                        onSelectTeam={handleSelectTeam}
                        onSelectOverview={() => navigate('/dashboard')}
                  />

                  <div className={cn(!collapsed && 'lg:pl-64')}>
                        <Header
                              user={currentUser}
                              search={search}
                              onSearchChange={(v) => { setSearch(v); setCurrentPage(1); }}
                              canWrite={false}
                              onNewItem={() => navigate('/dashboard')}
                              dark={dark}
                              onToggleTheme={toggleTheme}
                              onToggleSidebar={() => {
                                    if (window.innerWidth >= 1024) setCollapsed((c) => !c);
                                    else setMobileOpen(true);
                              }}
                              urgentCount={0}
                        />

                        <main className="space-y-6 p-6 max-w-7xl mx-auto">
                              <TeamsHeader
                                    totalCount={totalCount}
                                    rangeText={rangeText}
                                    viewMode={viewMode}
                                    onViewModeChange={handleViewModeChange}
                              />

                              <TeamsFilterBar
                                    search={search}
                                    onSearchChange={(v) => { setSearch(v); setCurrentPage(1); }}
                                    roleFilter={roleFilter}
                                    onRoleFilterChange={(v) => { setRoleFilter(v); setCurrentPage(1); }}
                                    statusFilter={statusFilter}
                                    onStatusFilterChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
                                    onClearFilters={handleClearFilters}
                              />

                              {isAllTeamsLoading ? (
                                    <div className="py-20 text-center text-sm text-muted-foreground">
                                          Loading teams...
                                    </div>
                              ) : viewMode === 'list' ? (
                                    <TeamsTableView
                                          teams={displayedTeams}
                                          isTeamStarred={isTeamStarred}
                                          onToggleStar={toggleStarTeam}
                                          onSelectTeam={handleSelectTeam}
                                    />
                              ) : (
                                    <TeamsGridView
                                          teams={displayedTeams}
                                          isTeamStarred={isTeamStarred}
                                          onToggleStar={toggleStarTeam}
                                          onSelectTeam={handleSelectTeam}
                                    />
                              )}

                              <TeamsPagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    totalCount={totalCount}
                                    pageSize={PAGE_SIZE}
                                    onPageChange={setCurrentPage}
                              />
                        </main>
                  </div>
            </div>
      );
}
