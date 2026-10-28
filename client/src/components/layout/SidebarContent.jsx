import { Layers, LayoutDashboard, LayoutGrid, LogOut, Users, Users2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/shared/UserAvatar';
import NavLabel from './NavLabel';
import NavItem from './NavItem';
import { useGetUserTeamsQuery, teamsApiSlice } from '@/stores/slices/teamApiSlice';
import { logout, selectCurrentUser } from '@/stores/slices/userSlice';
import { useNavigate } from 'react-router-dom';

function TeamButton({ team, active, onClick }) {
      return (
            <button
                  type="button"
                  onClick={onClick}
                  aria-pressed={active}
                  className={cn(
                        'flex h-10 w-full cursor-pointer items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent',
                        active ? 'bg-accent text-foreground' : 'text-sidebar-foreground'
                  )}
            >
                  <Users className="size-[18px] shrink-0" />
                  <span className="flex-1 truncate text-left">{team.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">{team.role ?? 'View only'}</span>
            </button>
      );
}

export default function SidebarContent({
      //teams,
      activeTeamId, // null = "All teams" overview
      onSelectTeam,
      onSelectOverview,
      view,
      onSelectView,
      //user,
      onNavigate,
}) {
      const dispatch = useDispatch();
      const currentUser = useSelector(selectCurrentUser);

      const { data: teamsData, isLoading } = useGetUserTeamsQuery();

      const teams = teamsData?.teams || teamsData || [];

      const inTeam = activeTeamId !== null;
      const myTeams = teams.filter((t) => t.role);
      //const otherTeams = teams.filter((t) => !t.role);

      const navigate = useNavigate();

      const pickView = (v) => {
            onSelectView(v);
            onNavigate?.();
      };
      const pickOverview = () => {
            onSelectOverview();
            onNavigate?.();
      };
      const pickTeam = (id) => {
            onSelectTeam(id);
            onNavigate?.();
      };

      const handleSignOut = () => {
            dispatch(logout());
            // Yeh line RTK Query ke saare cache ko flush/wipe out kar degi!
            dispatch(teamsApiSlice.util.resetApiState());
            navigate("/login");
      };

      return (
            <div className="flex h-full flex-col">
                  <div className="flex h-[68px] shrink-0 items-center gap-2 px-5">
                        <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Layers className="size-4" />
                        </span>
                        <span className="text-xl font-semibold tracking-tight">OpsDesk.</span>
                  </div>

                  <nav className="flex-1 overflow-y-auto px-4 pb-4">
                        {/* ── Always visible ── */}
                        <NavLabel>Dashboard</NavLabel>
                        <div className="space-y-1">
                              <NavItem icon={LayoutGrid} active={!inTeam} onClick={pickOverview}>All teams</NavItem>
                        </div>

                        {/* ── Team-specific nav: only when a team is selected ── */}
                        {inTeam && (
                              <>
                                    <NavLabel>Team Dashboard</NavLabel>
                                    <div className="space-y-1">
                                          <NavItem icon={LayoutDashboard} active={view === 'all'} onClick={() => pickView('all')}>Team overview</NavItem>
                                          <NavItem icon={Users2} active={view === 'users'} onClick={() => pickView('users')}>Users</NavItem>
                                    </div>
                              </>
                        )}

                        {isLoading ? (
                              <div className="px-4 py-2 text-xs text-muted-foreground">Loading teams...</div>
                        ) : (
                              <>
                                    {myTeams.length > 0 && (
                                          <>
                                                <NavLabel>My teams</NavLabel>
                                                <div className="space-y-1">
                                                      {myTeams.map((t) => (
                                                            <TeamButton key={t.id || t._id} team={t} active={(t.id || t._id) === activeTeamId} onClick={() => pickTeam(t.id || t._id)} />
                                                      ))}
                                                </div>
                                          </>
                                    )}

                                    {/*otherTeams.length > 0 && (
                                          <>
                                                <NavLabel>Other teams</NavLabel>
                                                <div className="space-y-1">
                                                      {otherTeams.map((t) => (
                                                            <TeamButton key={t.id || t._id} team={t} active={(t.id || t._id) === activeTeamId} onClick={() => pickTeam(t.id || t._id)} />
                                                      ))}
                                                </div>
                                          </>
                                    )*/}
                              </>
                        )}
                  </nav>

                  {/* bottom card (same slot as "Grab Pro Now") */}
                  <div className="p-4">
                        <div className="flex flex-col items-center rounded-xl bg-muted/50 px-4 py-6 text-center">
                              <UserAvatar name={currentUser?.name || 'USER'} email={currentUser?.email} className="size-14 text-base [&_span]:text-base" />
                              <p className="mt-4 text-base font-semibold">{currentUser?.name || 'USER'}</p>
                              <p className="mt-0.5 max-w-full truncate text-sm text-muted-foreground">{currentUser?.email}</p>
                              <Button className="mt-4 h-9 cursor-pointer px-5" onClick={handleSignOut}>
                                    <LogOut className="size-4" />
                                    Sign out
                              </Button>
                        </div>
                  </div>
            </div>
      );
}
