import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { cn } from '@/lib/utils';

import Sidebar from '@/components/layout/SideBar';
import MobileDrawer from '@/components/layout/MobileDrawer';
import Header from '@/components/layout/Header';

import DirectoryHeader from '@/components/directory/DirectoryHeader';
import UsersFilterBar from '@/components/directory/UsersFilterBar';
import UsersTableView from '@/components/directory/UsersTableView';
import UsersPagination from '@/components/directory/UsersPagination';
import AddToTeamModal from '@/components/directory/AddToTeamModal';

import TeamsHeader from '@/components/teams/TeamsHeader';
import TeamsFilterBar from '@/components/teams/TeamsFilterBar';
import TeamsTableView from '@/components/teams/TeamsTableView';
import TeamsGridView from '@/components/teams/TeamsGridView';
import TeamsPagination from '@/components/teams/TeamsPagination';

import useTeamPreferences from '@/hooks/useTeamPreferences';
import useTeamsDirectory from '@/hooks/useTeamsDirectory';
import useUsersDirectory from '@/hooks/useUsersDirectory';

import { useGetAllTeamsQuery, useGetUserTeamsQuery } from '@/stores/slices/teamApiSlice';
import { useGetAllWorkItemsQuery } from '@/stores/slices/workItemsApiSlice';
import { useGetUsersQuery } from '@/stores/slices/usersApiSlice';
import { selectCurrentUser } from '@/stores/slices/userSlice';

const TEAMS_PAGE_SIZE = 6;
const USERS_PAGE_SIZE = 10;
const VIEW_MODE_KEY = 'opsdesk_teams_view_mode';

/**
 * Unified Organization Directory Page (`/directory`).
 * Combines Teams and Users directories with a segmented switch, syncs active tab
 * with URL search params (`?tab=teams` | `?tab=users`), and manages modal team assignment.
 */
export default function DirectoryPage() {
      const navigate = useNavigate();
      const [searchParams, setSearchParams] = useSearchParams();
      const activeTab = searchParams.get('tab') === 'users' ? 'users' : 'teams';

      const currentUser = useSelector(selectCurrentUser);

      const [collapsed, setCollapsed] = useState(false);
      const [mobileOpen, setMobileOpen] = useState(false);
      const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

      // Teams tab state
      const [viewMode, setViewMode] = useState(() => {
            try {
                  return localStorage.getItem(VIEW_MODE_KEY) || 'grid';
            } catch {
                  return 'grid';
            }
      });
      const [teamSearch, setTeamSearch] = useState('');
      const [roleFilter, setRoleFilter] = useState('all');
      const [teamStatusFilter, setTeamStatusFilter] = useState('all');
      const [teamPage, setTeamPage] = useState(1);

      // Users tab state
      const [userSearch, setUserSearch] = useState('');
      const [userTeamFilter, setUserTeamFilter] = useState('all');
      const [userStatusFilter, setUserStatusFilter] = useState('all');
      const [userPage, setUserPage] = useState(1);
      const [targetModalUser, setTargetModalUser] = useState(null);

      const { isTeamStarred, toggleStarTeam, recordRecentVisit } = useTeamPreferences();

      // Data fetching queries
      const { data: allTeamsData, isLoading: isAllTeamsLoading } = useGetAllTeamsQuery();
      const { data: userTeamsData } = useGetUserTeamsQuery(currentUser?.id, { skip: !currentUser?.id });
      const { data: workItemsData } = useGetAllWorkItemsQuery();
      const { data: usersData, isLoading: isUsersLoading } = useGetUsersQuery();

      const allTeams = allTeamsData?.teams || allTeamsData || [];
      const userTeams = userTeamsData?.teams || userTeamsData || [];
      const allWorkItems = workItemsData?.data || workItemsData || [];
      const allUsers = Array.isArray(usersData) ? usersData : usersData?.data || [];

      // Teams directory calculations
      const {
            displayedTeams,
            totalCount: teamsTotal,
            totalPages: teamsTotalPages,
            page: currentTeamsPage,
            rangeText: teamsRangeText,
      } = useTeamsDirectory({
            rawTeams: allTeams,
            userTeams,
            workItems: allWorkItems,
            search: teamSearch,
            roleFilter,
            statusFilter: teamStatusFilter,
            currentPage: teamPage,
            pageSize: TEAMS_PAGE_SIZE,
      });

      // Users directory calculations
      const {
            displayedUsers,
            totalCount: usersTotal,
            totalPages: usersTotalPages,
            page: currentUsersPage,
            rangeText: usersRangeText,
      } = useUsersDirectory({
            rawUsers: allUsers,
            search: userSearch,
            teamFilter: userTeamFilter,
            statusFilter: userStatusFilter,
            currentPage: userPage,
            pageSize: USERS_PAGE_SIZE,
      });

      /**
       * Switches active directory tab without full page reload, persisting in URL params.
       */
      const handleTabChange = (newTab) => {
            setSearchParams({ tab: newTab });
      };

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

      /**
       * Clears team filters and resets page.
       */
      const handleClearTeamFilters = () => {
            setTeamSearch('');
            setRoleFilter('all');
            setTeamStatusFilter('all');
            setTeamPage(1);
      };

      /**
       * Clears user filters and resets page.
       */
      const handleClearUserFilters = () => {
            setUserSearch('');
            setUserTeamFilter('all');
            setUserStatusFilter('all');
            setUserPage(1);
      };

      /**
       * Opens a team's dashboard and records the visit.
       */
      const handleSelectTeam = (teamId) => {
            recordRecentVisit(teamId);
            navigate(`/dashboard?teamId=${teamId}`);
      };

      /**
       * Toggles the system light/dark theme class on the document root.
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
                              search={activeTab === 'teams' ? teamSearch : userSearch}
                              onSearchChange={(v) => {
                                    if (activeTab === 'teams') {
                                          setTeamSearch(v);
                                          setTeamPage(1);
                                    } else {
                                          setUserSearch(v);
                                          setUserPage(1);
                                    }
                              }}
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
                              {/* Top Directory Header with Segmented Switch */}
                              <DirectoryHeader
                                    activeTab={activeTab}
                                    onTabChange={handleTabChange}
                                    teamsCount={allTeams.length}
                                    usersCount={allUsers.length}
                                    rangeText={
                                          activeTab === 'teams'
                                                ? `${teamsRangeText} teams`
                                                : `${usersRangeText} users`
                                    }
                              />

                              {/* Tab Content: Teams vs Users */}
                              {activeTab === 'teams' ? (
                                    <div className="space-y-4">
                                          <TeamsHeader
                                                totalCount={teamsTotal}
                                                rangeText={teamsRangeText}
                                                viewMode={viewMode}
                                                onViewModeChange={handleViewModeChange}
                                          />

                                          <TeamsFilterBar
                                                search={teamSearch}
                                                onSearchChange={(v) => {
                                                      setTeamSearch(v);
                                                      setTeamPage(1);
                                                }}
                                                roleFilter={roleFilter}
                                                onRoleFilterChange={(v) => {
                                                      setRoleFilter(v);
                                                      setTeamPage(1);
                                                }}
                                                statusFilter={teamStatusFilter}
                                                onStatusFilterChange={(v) => {
                                                      setTeamStatusFilter(v);
                                                      setTeamPage(1);
                                                }}
                                                onClearFilters={handleClearTeamFilters}
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
                                                currentPage={currentTeamsPage}
                                                totalPages={teamsTotalPages}
                                                totalCount={teamsTotal}
                                                pageSize={TEAMS_PAGE_SIZE}
                                                onPageChange={setTeamPage}
                                          />
                                    </div>
                              ) : (
                                    <div className="space-y-4">
                                          <UsersFilterBar
                                                search={userSearch}
                                                onSearchChange={(v) => {
                                                      setUserSearch(v);
                                                      setUserPage(1);
                                                }}
                                                teamFilter={userTeamFilter}
                                                onTeamFilterChange={(v) => {
                                                      setUserTeamFilter(v);
                                                      setUserPage(1);
                                                }}
                                                statusFilter={userStatusFilter}
                                                onStatusFilterChange={(v) => {
                                                      setUserStatusFilter(v);
                                                      setUserPage(1);
                                                }}
                                                teams={allTeams}
                                                onClearFilters={handleClearUserFilters}
                                                totalCount={usersTotal}
                                                rangeText={usersRangeText}
                                          />

                                          <UsersTableView
                                                users={displayedUsers}
                                                isLoading={isUsersLoading}
                                                onAddToTeam={setTargetModalUser}
                                          />

                                          <UsersPagination
                                                currentPage={currentUsersPage}
                                                totalPages={usersTotalPages}
                                                totalCount={usersTotal}
                                                pageSize={USERS_PAGE_SIZE}
                                                onPageChange={setUserPage}
                                          />
                                    </div>
                              )}
                        </main>
                  </div>

                  {/* Add User to Teams Modal */}
                  {targetModalUser && (
                        <AddToTeamModal
                              targetUser={targetModalUser}
                              currentUserTeams={userTeams}
                              onClose={() => setTargetModalUser(null)}
                        />
                  )}
            </div>
      );
}
