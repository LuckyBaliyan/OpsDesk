import { useState, useMemo, useEffect } from 'react';
import { useDispatch, useStore } from 'react-redux';
import { X, Search, Users, Check, Loader2, ChevronDown } from 'lucide-react';
import { initials, getAvatarColor } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useAddTeamMemberMutation, teamsApiSlice } from '@/stores/slices/teamApiSlice';
import { usersApiSlice } from '@/stores/slices/usersApiSlice';

/**
 * Interactive modal drawer for assigning a user to one or more eligible teams.
 * Only displays teams where current user has Admin or Lead permissions.
 * Disables already-assigned teams and exposes an inline role selector for new additions.
 */
export default function AddToTeamModal({
      targetUser,
      currentUserTeams = [],
      onClose,
}) {
      const dispatch = useDispatch();
      const store = useStore();

      const [searchQuery, setSearchQuery] = useState('');
      const [selectedTeams, setSelectedTeams] = useState({}); // { [teamId]: 'Member' | 'Lead' | 'Admin' }
      const [openRoleDropdownId, setOpenRoleDropdownId] = useState(null);
      const [errorMessage, setErrorMessage] = useState(null);

      const [addTeamMember, { isLoading: isSubmitting }] = useAddTeamMemberMutation();

      // Close open role dropdown when clicking anywhere outside
      useEffect(() => {
            if (!openRoleDropdownId) return;
            const handleClickOutside = () => setOpenRoleDropdownId(null);
            window.addEventListener('click', handleClickOutside);
            return () => window.removeEventListener('click', handleClickOutside);
      }, [openRoleDropdownId]);

      // Filter only teams where currently logged-in user is Admin or Lead
      const eligibleTeams = useMemo(() => {
            return (currentUserTeams || []).filter(
                  (t) => t.role === 'Admin' || t.role === 'Lead'
            );
      }, [currentUserTeams]);

      // Filter eligible teams by search input
      const filteredTeams = useMemo(() => {
            const q = searchQuery.trim().toLowerCase();
            if (!q) return eligibleTeams;
            return eligibleTeams.filter((t) => t.name?.toLowerCase().includes(q));
      }, [eligibleTeams, searchQuery]);

      // Map existing memberships of target user
      const existingMembershipsMap = useMemo(() => {
            const map = new Map();
            (targetUser?.memberships || []).forEach((m) => {
                  const tId = m.teamId || m.team?.id;
                  if (tId) map.set(tId, m.role || 'Member');
            });
            return map;
      }, [targetUser]);

      /**
       * Toggles team selection. Initializes with 'Member' role when checked.
       */
      const toggleTeamSelection = (teamId) => {
            setSelectedTeams((prev) => {
                  const next = { ...prev };
                  if (next[teamId]) {
                        delete next[teamId];
                        if (openRoleDropdownId === teamId) setOpenRoleDropdownId(null);
                  } else {
                        next[teamId] = 'Member';
                  }
                  return next;
            });
      };

      /**
       * Updates the assigned role for a selected team.
       */
      const handleRoleChange = (teamId, newRole) => {
            setSelectedTeams((prev) => ({
                  ...prev,
                  [teamId]: newRole,
            }));
            setOpenRoleDropdownId(null);
      };

      /**
       * Submits membership additions sequentially for each selected team,
       * optimistically updates the Users directory cache, and invalidates tags.
       */
      const handleSubmit = async (e) => {
            e?.preventDefault();
            setErrorMessage(null);

            const teamIds = Object.keys(selectedTeams);
            if (teamIds.length === 0 || !targetUser?.email) return;

            try {
                  for (const teamId of teamIds) {
                        const role = selectedTeams[teamId] || 'Member';
                        await addTeamMember({
                              teamId,
                              email: targetUser.email,
                              role,
                        }).unwrap();
                  }

                  // 1. Optimistically update all active getUsers queries in cache so table updates instantly
                  const queries = store.getState().usersApi?.queries || {};
                  for (const { endpointName, originalArgs } of Object.values(queries)) {
                        if (endpointName === 'getUsers') {
                              dispatch(
                                    usersApiSlice.util.updateQueryData('getUsers', originalArgs, (draft) => {
                                          const list = Array.isArray(draft) ? draft : draft?.data || [];
                                          const user = list.find(
                                                (u) => u.email === targetUser.email || u.id === targetUser.id
                                          );
                                          if (user) {
                                                user.memberships = user.memberships || [];
                                                for (const teamId of teamIds) {
                                                      const role = selectedTeams[teamId] || 'Member';
                                                      const teamObj = currentUserTeams.find((t) => t.id === teamId);
                                                      const exists = user.memberships.some(
                                                            (m) => m.teamId === teamId || m.team?.id === teamId
                                                      );
                                                      if (!exists) {
                                                            user.memberships.push({
                                                                  id: `membership-${teamId}-${Date.now()}`,
                                                                  teamId,
                                                                  role,
                                                                  team: {
                                                                        id: teamId,
                                                                        name: teamObj?.name || 'Team',
                                                                  },
                                                            });
                                                      }
                                                }
                                          }
                                    })
                              );
                        }
                  }

                  // 2. Invalidate User tag and Team tags across both APIs to ensure server sync
                  dispatch(usersApiSlice.util.invalidateTags(['User']));
                  dispatch(teamsApiSlice.util.invalidateTags(['Team']));

                  onClose();
            } catch (err) {
                  console.error('Failed to add user to teams:', err);
                  setErrorMessage(err?.data?.error || 'Failed to assign teams. Please check permissions.');
            }
      };

      const selectedCount = Object.keys(selectedTeams).length;

      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                  <div
                        className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-5 overflow-visible"
                        onClick={(e) => e.stopPropagation()}
                  >
                        {/* Header Section */}
                        <div className="flex items-start justify-between">
                              <div>
                                    <div className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase">
                                          TEAM ACCESS
                                    </div>
                                    <h2 className="text-xl font-bold tracking-tight text-foreground mt-0.5">
                                          Add user to teams
                                    </h2>
                              </div>

                              <button
                                    type="button"
                                    onClick={onClose}
                                    className="size-8 rounded-lg border border-border/60 inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
                              >
                                    <X className="size-4" />
                              </button>
                        </div>

                        {/* Target User Summary Card */}
                        <div className="flex items-center gap-3.5 rounded-xl border border-border/80 bg-muted/20 p-3.5">
                              <div
                                    className={cn(
                                          'size-11 shrink-0 rounded-full border flex items-center justify-center font-bold text-sm select-none',
                                          getAvatarColor(targetUser?.email || targetUser?.name)
                                    )}
                              >
                                    {initials(targetUser?.name, targetUser?.email)}
                              </div>
                              <div className="min-w-0">
                                    <div className="font-semibold text-sm text-foreground truncate">
                                          {targetUser?.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                          {targetUser?.email}
                                    </div>
                              </div>
                        </div>

                        {/* Eligible Teams Header & Search */}
                        <div className="space-y-3">
                              <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-foreground">Eligible teams</span>
                                    <span className="text-muted-foreground">Based on your Admin / Lead access</span>
                              </div>

                              <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                          type="text"
                                          value={searchQuery}
                                          onChange={(e) => setSearchQuery(e.target.value)}
                                          placeholder="Search your teams..."
                                          className="h-8.5 w-full rounded-lg border border-border/80 bg-background pl-8.5 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-hidden"
                                    />
                              </div>
                        </div>

                        {/* Error Message banner */}
                        {errorMessage && (
                              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive">
                                    {errorMessage}
                              </div>
                        )}

                        {/* Teams Selection List — overflow-visible so dropdown appears on top without scrollbar */}
                        <div className="space-y-2 overflow-visible">
                              {filteredTeams.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-muted-foreground">
                                          {eligibleTeams.length === 0
                                                ? 'You do not have Admin or Lead access to any teams.'
                                                : 'No matching teams found.'}
                                    </div>
                              ) : (
                                    filteredTeams.map((team) => {
                                          const isAlreadyMember = existingMembershipsMap.has(team.id);
                                          const memberRole = existingMembershipsMap.get(team.id);
                                          const isChecked = Boolean(selectedTeams[team.id]);
                                          const assignedRole = selectedTeams[team.id] || 'Member';
                                          const isDropdownOpen = openRoleDropdownId === team.id;

                                          return (
                                                <div
                                                      key={team.id}
                                                      className={cn(
                                                            'relative flex items-center justify-between rounded-xl border p-3 transition-colors',
                                                            isDropdownOpen ? 'z-40' : 'z-10',
                                                            isAlreadyMember
                                                                  ? 'border-border/40 bg-muted/10 opacity-60'
                                                                  : isChecked
                                                                  ? 'border-emerald-500/40 bg-muted/30'
                                                                  : 'border-border/70 hover:bg-muted/20'
                                                      )}
                                                >
                                                      {/* Checkbox & Team Info */}
                                                      <div
                                                            className={cn(
                                                                  'flex items-center gap-3 select-none flex-1 min-w-0',
                                                                  !isAlreadyMember && 'cursor-pointer'
                                                            )}
                                                            onClick={() => !isAlreadyMember && toggleTeamSelection(team.id)}
                                                      >
                                                            {/* Checkbox */}
                                                            <div
                                                                  className={cn(
                                                                        'size-4.5 rounded flex items-center justify-center border transition-colors shrink-0',
                                                                        isChecked
                                                                              ? 'border-emerald-500 bg-emerald-500 text-white'
                                                                              : isAlreadyMember
                                                                              ? 'border-border/60 bg-muted/40'
                                                                              : 'border-border/80 bg-background'
                                                                  )}
                                                            >
                                                                  {isChecked && <Check className="size-3 stroke-[3]" />}
                                                            </div>

                                                            {/* Team Icon */}
                                                            <div className="size-8 rounded-lg border border-border/60 bg-muted/40 flex items-center justify-center shrink-0 text-muted-foreground">
                                                                  <Users className="size-4" />
                                                            </div>

                                                            {/* Name and Access Label */}
                                                            <div className="min-w-0">
                                                                  <div className="text-xs font-semibold text-foreground truncate">
                                                                        {team.name}
                                                                  </div>
                                                                  <div className="text-[11px] text-muted-foreground">
                                                                        Your access: {team.role || 'Member'}
                                                                  </div>
                                                            </div>
                                                      </div>

                                                      {/* Right State: Already Member Pill OR Inline Role Dropdown */}
                                                      <div className="shrink-0 ml-2">
                                                            {isAlreadyMember ? (
                                                                  <span className="inline-flex rounded-md border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] text-muted-foreground">
                                                                        Already a member - {memberRole}
                                                                  </span>
                                                            ) : isChecked ? (
                                                                  <div className="relative">
                                                                        <button
                                                                              type="button"
                                                                              onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setOpenRoleDropdownId(
                                                                                          isDropdownOpen ? null : team.id
                                                                                    );
                                                                              }}
                                                                              className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted cursor-pointer"
                                                                        >
                                                                              <span>{assignedRole}</span>
                                                                              <ChevronDown className="size-3 text-muted-foreground" />
                                                                        </button>

                                                                        {/* Inline Role Menu — z-50 to appear on top of everything without clipping */}
                                                                        {isDropdownOpen && (
                                                                              <div className="absolute right-0 top-full mt-1.5 z-50 w-28 rounded-lg border border-border bg-popover p-1 shadow-2xl text-xs space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                                                                                    {['Member', 'Lead', 'Admin'].map(
                                                                                          (roleOption) => (
                                                                                                <button
                                                                                                      key={roleOption}
                                                                                                      type="button"
                                                                                                      onClick={(e) => {
                                                                                                            e.stopPropagation();
                                                                                                            handleRoleChange(
                                                                                                                  team.id,
                                                                                                                  roleOption
                                                                                                            );
                                                                                                      }}
                                                                                                      className={cn(
                                                                                                            'w-full text-left rounded-md px-2.5 py-1 text-xs cursor-pointer transition-colors',
                                                                                                            assignedRole === roleOption
                                                                                                                  ? 'bg-primary text-primary-foreground font-semibold'
                                                                                                                  : 'text-foreground hover:bg-muted'
                                                                                                      )}
                                                                                                >
                                                                                                      {roleOption}
                                                                                                </button>
                                                                                          )
                                                                                    )}
                                                                              </div>
                                                                        )}
                                                                  </div>
                                                            ) : null}
                                                      </div>
                                                </div>
                                          );
                                    })
                              )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-between border-t border-border/60 pt-4">
                              <div className="text-xs text-muted-foreground">
                                    {selectedCount} {selectedCount === 1 ? 'team' : 'teams'} selected
                              </div>

                              <div className="flex items-center gap-2">
                                    <button
                                          type="button"
                                          onClick={onClose}
                                          disabled={isSubmitting}
                                          className="rounded-lg border border-border/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
                                    >
                                          Cancel
                                    </button>

                                    <button
                                          type="button"
                                          onClick={handleSubmit}
                                          disabled={selectedCount === 0 || isSubmitting}
                                          className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-1.5 text-xs font-medium text-background hover:bg-foreground/90 disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-colors shadow-xs"
                                    >
                                          {isSubmitting ? (
                                                <>
                                                      <Loader2 className="size-3.5 animate-spin" />
                                                      <span>Adding...</span>
                                                </>
                                          ) : (
                                                <span>
                                                      {selectedCount > 0
                                                            ? `Add to ${selectedCount} ${selectedCount === 1 ? 'team' : 'teams'}`
                                                            : 'Confirm Assignment'}
                                                </span>
                                          )}
                                    </button>
                              </div>
                        </div>
                  </div>
            </div>
      );
}
