import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Layers, LayoutGrid, LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import UserAvatar from '@/components/shared/UserAvatar';
import SidebarSectionHeader from './SidebarSectionHeader';
import SidebarTeamItem from './SidebarTeamItem';
import BrowseTeamsButton from './BrowseTeamsButton';
import useTeamPreferences, { formatShortTimeAgo } from '@/hooks/useTeamPreferences';
import { useGetAllTeamsQuery, useGetUserTeamsQuery, teamsApiSlice } from '@/stores/slices/teamApiSlice';
import { logout, selectCurrentUser } from '@/stores/slices/userSlice';

/**
 * Main application sidebar navigation content.
 * Features Workspace overview, user Starred teams, Recently visited teams, and a sticky Browse all teams button.
 */
export default function SidebarContent({
      activeTeamId = null,
      onSelectTeam,
      onSelectOverview,
      onNavigate,
}) {
      const dispatch = useDispatch();
      const navigate = useNavigate();
      const location = useLocation();
      const currentUser = useSelector(selectCurrentUser);

      const [starredOpen, setStarredOpen] = useState(true);
      const [recentOpen, setRecentOpen] = useState(true);

      const { starredIds, isPinnedLoading, recentList, recordRecentVisit } = useTeamPreferences();

      const { data: allTeamsData } = useGetAllTeamsQuery();
      const { data: userTeamsData } = useGetUserTeamsQuery(currentUser?.id, { skip: !currentUser?.id });

      const allTeams = allTeamsData?.teams || allTeamsData || [];
      const userTeams = userTeamsData?.teams || userTeamsData || [];

      // Combine teams with the user's role
      const enrichedTeams = useMemo(() => {
            const roleMap = new Map();
            userTeams.forEach((t) => {
                  const id = t.id || t._id;
                  const r = t.role || t.myRole;
                  if (id && r) roleMap.set(id, r);
            });

            return allTeams.map((team) => {
                  const id = team.id || team._id;
                  const role = roleMap.get(id) || team.role || team.myRole || null;
                  return { ...team, id, role };
            });
      }, [allTeams, userTeams]);

      // Starred teams list
      const starredTeams = useMemo(() => {
            return enrichedTeams.filter((t) => starredIds.includes(t.id));
      }, [enrichedTeams, starredIds]);

      // Recently visited teams with timestamps
      const recentTeams = useMemo(() => {
            return recentList
                  .map((entry) => {
                        const team = enrichedTeams.find((t) => t.id === entry.id);
                        if (!team) return null;
                        return { ...team, visitedAt: entry.visitedAt };
                  })
                  .filter(Boolean);
      }, [enrichedTeams, recentList]);

      /**
       * Handles navigation to the Global Dashboard overview.
       */
      const handleGoToDashboard = () => {
            if (location.pathname !== '/dashboard') {
                  navigate('/dashboard');
            } else if (onSelectOverview) {
                  onSelectOverview();
            }
            onNavigate?.();
      };

      /**
       * Selects a specific team and records it in recent history.
       */
      const handlePickTeam = (teamId) => {
            recordRecentVisit(teamId);
            if (onSelectTeam) {
                  onSelectTeam(teamId);
            } else {
                  navigate(`/dashboard?teamId=${teamId}`);
            }
            onNavigate?.();
      };

      /**
       * Navigates to the unified Organization Directory view.
       */
      const handleBrowseTeams = () => {
            navigate('/directory');
            onNavigate?.();
      };

      /**
       * Clears authentication session and resets cached RTK Query state.
       */
      const handleSignOut = () => {
            dispatch(logout());
            dispatch(teamsApiSlice.util.resetApiState());
            navigate('/login');
      };

      const isDashboardActive = location.pathname === '/dashboard' && !activeTeamId;

      return (
            <div className="flex h-full flex-col justify-between">
                  <div className="flex-1 overflow-y-auto px-4 pb-4">
                        {/* ── Brand Header ── */}
                        <div className="flex h-[68px] items-center gap-2 px-1">
                              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                                    <Layers className="size-4" />
                              </span>
                              <span className="text-xl font-bold tracking-tight">OpsDesk.</span>
                        </div>

                        {/* ── WORKSPACE ── */}
                        <div className="mt-2 space-y-1">
                              <div className="px-1 py-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Workspace
                              </div>
                              <button
                                    type="button"
                                    onClick={handleGoToDashboard}
                                    className={`flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium transition-colors ${
                                          isDashboardActive
                                                ? 'bg-accent text-accent-foreground font-semibold shadow-xs'
                                                : 'text-sidebar-foreground hover:bg-muted/50 hover:text-foreground'
                                    }`}
                              >
                                    <LayoutGrid className="size-4 shrink-0 text-muted-foreground" />
                                    <span>Dashboard</span>
                              </button>
                        </div>

                        {/* ── STARRED TEAMS ── */}
                        <div className="mt-6">
                              <SidebarSectionHeader
                                    title="Starred Teams"
                                    isOpen={starredOpen}
                                    onToggle={() => setStarredOpen((o) => !o)}
                              />
                              {starredOpen && (
                                    <div className="mt-1 space-y-0.5">
                                          {isPinnedLoading ? (
                                                <div className="space-y-2 px-2.5 py-1.5">
                                                      <div className="flex items-center gap-2.5">
                                                            <Skeleton className="size-4 rounded-full shrink-0" />
                                                            <Skeleton className="h-3.5 w-28 rounded-sm" />
                                                      </div>
                                                      <div className="flex items-center gap-2.5">
                                                            <Skeleton className="size-4 rounded-full shrink-0" />
                                                            <Skeleton className="h-3.5 w-20 rounded-sm" />
                                                      </div>
                                                </div>
                                          ) : starredTeams.length > 0 ? (
                                                starredTeams.map((team) => (
                                                      <SidebarTeamItem
                                                            key={team.id}
                                                            team={team}
                                                            active={team.id === activeTeamId}
                                                            onClick={() => handlePickTeam(team.id)}
                                                      />
                                                ))
                                          ) : (
                                                <p className="px-2 py-1.5 text-xs text-muted-foreground/70">
                                                      No starred teams
                                                </p>
                                          )}
                                    </div>
                              )}
                        </div>

                        {/* ── RECENT TEAMS ── */}
                        <div className="mt-6">
                              <SidebarSectionHeader
                                    title="Recent Teams"
                                    isOpen={recentOpen}
                                    onToggle={() => setRecentOpen((o) => !o)}
                              />
                              {recentOpen && (
                                    <div className="mt-1 space-y-0.5">
                                          {recentTeams.length > 0 ? (
                                                recentTeams.map((team) => (
                                                      <SidebarTeamItem
                                                            key={team.id}
                                                            team={team}
                                                            active={team.id === activeTeamId}
                                                            timeTag={formatShortTimeAgo(team.visitedAt)}
                                                            onClick={() => handlePickTeam(team.id)}
                                                      />
                                                ))
                                          ) : (
                                                <p className="px-2 py-1.5 text-xs text-muted-foreground/70">
                                                      No recent teams
                                                </p>
                                          )}
                                    </div>
                              )}
                        </div>
                  </div>

                  {/* ── Bottom Sticky Zone: Browse all teams + Profile Card ── */}
                  <div className="p-4 space-y-3 border-t border-border/40 bg-sidebar">
                        <BrowseTeamsButton onClick={handleBrowseTeams} />

                        <div className="flex items-center justify-between rounded-xl bg-muted/40 p-2.5">
                              <div className="flex items-center gap-2.5 min-w-0">
                                    <UserAvatar
                                          name={currentUser?.name || 'User'}
                                          email={currentUser?.email}
                                          className="size-8 text-xs shrink-0"
                                    />
                                    <div className="min-w-0">
                                          <p className="truncate text-xs font-semibold leading-tight">{currentUser?.name || 'User'}</p>
                                          <p className="truncate text-[11px] text-muted-foreground leading-tight">{currentUser?.email}</p>
                                    </div>
                              </div>
                              <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 cursor-pointer text-muted-foreground hover:text-foreground shrink-0"
                                    onClick={handleSignOut}
                                    title="Sign out"
                              >
                                    <LogOut className="size-3.5" />
                              </Button>
                        </div>
                  </div>
            </div>
      );
}
