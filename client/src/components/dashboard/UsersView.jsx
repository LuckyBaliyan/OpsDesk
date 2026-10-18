import { useMemo, useState } from 'react';
import { UserPlus, Search, Users, Check, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader } from '@/components/ui/Loader';

import UserAvatar from '@/components/shared/UserAvatar';
import { CARD } from '@/lib/constants';
import { cn } from '@/lib/utils';

import { useGetUsersQuery } from '@/stores/slices/usersApiSlice';
import { useAddTeamMemberMutation } from '@/stores/slices/teamApiSlice';

const TEAM_ROLES = ['Member', 'Lead', 'Viewer']; // Admin is not allowed on add — use role update for that
const PAGE_SIZE = 10;

/* ─────────────────────────────────────────────────────────────
   Role badge — colour-coded pill for each membership role
───────────────────────────────────────────────────────────── */
function RoleBadge({ role }) {
      const styles = {
            Admin: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
            Lead: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
            Member: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
            Viewer: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
      };
      return (
            <Badge variant="outline" className={cn('font-medium', styles[role] ?? styles.Viewer)}>
                  {role}
            </Badge>
      );
}

/* ─────────────────────────────────────────────────────────────
   AddMemberDialog — shown when an Admin clicks "+ Add to team"
   Lets the admin pick a role before confirming
───────────────────────────────────────────────────────────── */
function AddMemberDialog({ user, teamName, teamId, onClose, onSuccess }) {
      const [role, setRole] = useState('Member');
      const [apiError, setApiError] = useState('');
      const [addTeamMember, { isLoading }] = useAddTeamMemberMutation();

      // POST /teams/:teamId/members with { email, role } — backend looks up user by email
      const handleAdd = async () => {
            setApiError('');
            try {
                  await addTeamMember({ teamId, email: user.email, role }).unwrap();
                  onSuccess?.();
                  onClose();
            } catch (err) {
                  console.error('Add team member failed:', err);
                  // Show the server's error message if available
                  setApiError(err?.data?.error || 'Failed to add member. Please try again.');
            }
      };

      return (
            <Dialog open onOpenChange={(o) => !o && onClose()}>
                  <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                              <DialogTitle>Add to {teamName}</DialogTitle>
                              <DialogDescription>
                                    Choose a role for <span className="font-medium text-foreground">{user.name}</span> in this team.
                              </DialogDescription>
                        </DialogHeader>

                        {/* User preview */}
                        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
                              <UserAvatar name={user.name} email={user.email} className="size-9" />
                              <div className="min-w-0">
                                    <p className="text-sm font-medium">{user.name}</p>
                                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                              </div>
                        </div>

                        {/* Role selector */}
                        <div className="space-y-1.5">
                              <label className="text-sm font-medium">Role</label>
                              <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                          {TEAM_ROLES.map((r) => (
                                                <SelectItem key={r} value={r}>{r}</SelectItem>
                                          ))}
                                    </SelectContent>
                              </Select>
                        </div>

                        {/* API error message */}
                        {apiError && (
                              <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                                    {apiError}
                              </p>
                        )}

                        <DialogFooter>
                              <Button variant="outline" onClick={onClose} className="cursor-pointer">
                                    <X className="size-4" /> Cancel
                              </Button>
                              <Button onClick={handleAdd} disabled={isLoading} className="cursor-pointer">
                                    {isLoading ? <Loader size="sm" /> : <Check className="size-4" />}
                                    Add member
                              </Button>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}

/* ─────────────────────────────────────────────────────────────
   UsersView — main component, renders inside dashboard
   Props:
     activeTeam  — currently selected team object (null if overview)
     members     — current team's member list (from teamApiSlice)
     isAdmin     — whether the logged-in user is Admin of active team
     currentUserId — id of logged-in user
───────────────────────────────────────────────────────────── */
export default function UsersView({ activeTeam, members, isAdmin, currentUserId }) {
      const [search, setSearch] = useState('');
      const [page, setPage] = useState(1);
      const [addTarget, setAddTarget] = useState(null); // user to add dialog

      // Fetch all app users (search-filtered) from GET /users?search=...
      // We debounce by passing search only; RTK Query caches per arg
      const { data: usersRaw, isLoading } = useGetUsersQuery(search);
      const allUsers = Array.isArray(usersRaw) ? usersRaw : (usersRaw?.data ?? []);

      // Build a Set of userIds already in the current team for O(1) lookup
      const memberMap = useMemo(() => {
            const map = new Map();
            (members ?? []).forEach((m) => map.set(m.userId, m.role));
            return map;
      }, [members]);

      // Paginate client-side (search already filtered by API)
      const totalPages = Math.max(1, Math.ceil(allUsers.length / PAGE_SIZE));
      const safePage = Math.min(page, totalPages);
      const pageUsers = allUsers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

      // Reset to page 1 whenever search changes
      const handleSearch = (val) => { setSearch(val); setPage(1); };

      return (
            <section className="space-y-4">
                  <Card className={CARD}>
                        <CardHeader className="gap-1 px-6 pt-6 pb-0">
                              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                                    <Users className="size-5 text-muted-foreground" />
                                    All Users
                              </CardTitle>
                              <CardDescription className="text-sm">
                                    {activeTeam
                                          ? `Showing all app users · ${isAdmin ? 'You can add them to ' + activeTeam.name : 'Admin access required to add members'}`
                                          : 'Select a team to manage membership'}
                              </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4 p-6">
                              {/* ── Search bar ── */}
                              <div className="relative max-w-sm">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                          value={search}
                                          onChange={(e) => handleSearch(e.target.value)}
                                          placeholder="Search by name or email…"
                                          className="pl-9"
                                    />
                              </div>

                              {/* ── Users table ── */}
                              <Table>
                                    <TableHeader>
                                          <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Email</TableHead>
                                                {activeTeam && <TableHead>Team status</TableHead>}
                                                {activeTeam && isAdmin && <TableHead className="text-right">Action</TableHead>}
                                          </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                          {isLoading && (
                                                <TableRow>
                                                      <TableCell colSpan={4} className="py-10 text-center">
                                                            <Loader />
                                                      </TableCell>
                                                </TableRow>
                                          )}

                                          {!isLoading && pageUsers.length === 0 && (
                                                <TableRow>
                                                      <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                                                            No users found{search ? ` for "${search}"` : ''}.
                                                      </TableCell>
                                                </TableRow>
                                          )}

                                          {!isLoading && pageUsers.map((user) => {
                                                // Check if this user is already a member of the active team
                                                const memberRole = memberMap.get(user.id);
                                                const isMember = !!memberRole;
                                                const isSelf = user.id === currentUserId;

                                                return (
                                                      <TableRow key={user.id} className={cn(isSelf && 'bg-muted/30')}>
                                                            {/* Avatar + name */}
                                                            <TableCell>
                                                                  <div className="flex items-center gap-3">
                                                                        <UserAvatar name={user.name} email={user.email} className="size-8" />
                                                                        <div className="min-w-0">
                                                                              <p className="text-sm font-medium leading-none">
                                                                                    {user.name}
                                                                                    {isSelf && (
                                                                                          <span className="ml-2 text-xs text-muted-foreground font-normal">(you)</span>
                                                                                    )}
                                                                              </p>
                                                                        </div>
                                                                  </div>
                                                            </TableCell>

                                                            {/* Email */}
                                                            <TableCell className="text-sm text-muted-foreground">
                                                                  {user.email}
                                                            </TableCell>

                                                            {/* Team status — only when a team is selected */}
                                                            {activeTeam && (
                                                                  <TableCell>
                                                                        {isMember ? (
                                                                              <div className="flex items-center gap-2">
                                                                                    <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                                                                                    <span className="text-xs text-muted-foreground mr-1">In team ·</span>
                                                                                    <RoleBadge role={memberRole} />
                                                                              </div>
                                                                        ) : (
                                                                              <div className="flex items-center gap-2">
                                                                                    <span className="size-2 rounded-full bg-zinc-400 shrink-0" />
                                                                                    <span className="text-xs text-muted-foreground">Not a member</span>
                                                                              </div>
                                                                        )}
                                                                  </TableCell>
                                                            )}

                                                            {/* Add action — only Admins, only for non-members */}
                                                            {activeTeam && isAdmin && (
                                                                  <TableCell className="text-right">
                                                                        {isMember ? (
                                                                              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                                                                    <Check className="size-3.5" /> Member
                                                                              </span>
                                                                        ) : (
                                                                              <Button
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    className="cursor-pointer gap-1.5"
                                                                                    onClick={() => setAddTarget(user)}
                                                                              >
                                                                                    <UserPlus className="size-3.5" />
                                                                                    Add to team
                                                                              </Button>
                                                                        )}
                                                                  </TableCell>
                                                            )}
                                                      </TableRow>
                                                );
                                          })}
                                    </TableBody>
                              </Table>

                              {/* ── Pagination ── */}
                              {totalPages > 1 && (
                                    <div className="flex items-center justify-between pt-1">
                                          <p className="text-xs text-muted-foreground">
                                                Page {safePage} of {totalPages} · {allUsers.length} users
                                          </p>
                                          <div className="flex gap-2">
                                                <Button variant="outline" size="sm" disabled={safePage <= 1}
                                                      onClick={() => setPage((p) => p - 1)} className="cursor-pointer">
                                                      Prev
                                                </Button>
                                                <Button variant="outline" size="sm" disabled={safePage >= totalPages}
                                                      onClick={() => setPage((p) => p + 1)} className="cursor-pointer">
                                                      Next
                                                </Button>
                                          </div>
                                    </div>
                              )}
                        </CardContent>
                  </Card>

                  {/* Add member confirmation dialog */}
                  {addTarget && activeTeam && (
                        <AddMemberDialog
                              user={addTarget}
                              teamName={activeTeam.name}
                              teamId={activeTeam.id || activeTeam._id}
                              onClose={() => setAddTarget(null)}
                              onSuccess={() => setAddTarget(null)}
                        />
                  )}
            </section>
      );
}
