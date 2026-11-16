import { useState, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PRIORITIES, TYPES } from '@/lib/constants';
import { humanize } from '@/lib/helpers';

/**
 * Dialog for creating a new work item with role-based assignment restrictions:
 * - Admin or Lead can assign the task to any team member or leave it unassigned.
 * - Normal Members can only assign the task to themselves or leave it unassigned.
 */
export default function CreateItemDialog({
      members = [],
      onClose,
      onCreate,
      isAdminOrLead = false,
      currentUserId = null
}) {
      const [form, setForm] = useState({
            title: '',
            description: '',
            type: 'Task',
            priority: 'Medium',
            assigneeId: 'none'
      });
      const [error, setError] = useState('');

      /**
       * Curried helper function to update individual form field values in state.
       */
      const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

      /**
       * Determines available assignee options based on user role:
       * - Admins/Leads see all team members.
       * - Normal members only see 'Unassigned' and their own account.
       */
      const assigneeOptions = useMemo(() => {
            if (isAdminOrLead) {
                  return members;
            }
            // For normal members, filter only their own user entry
            return members.filter((m) => m.userId === currentUserId);
      }, [members, isAdminOrLead, currentUserId]);

      /**
       * Validates form input and submits the new work item data to the parent handler.
       */
      const submit = (e) => {
            e.preventDefault();
            if (!form.title.trim()) {
                  setError('Title is required');
                  return;
            }

            const chosenAssigneeId = form.assigneeId === 'none' ? null : form.assigneeId;

            // Frontend guard: normal member cannot assign to someone else
            if (!isAdminOrLead && chosenAssigneeId && chosenAssigneeId !== currentUserId) {
                  setError('Normal members can only assign tasks to themselves or leave them unassigned.');
                  return;
            }

            onCreate({
                  title: form.title.trim(),
                  description: form.description.trim(),
                  type: form.type,
                  priority: form.priority,
                  assigneeId: chosenAssigneeId,
            });
            onClose();
      };

      return (
            <Dialog open onOpenChange={(o) => !o && onClose()}>
                  <DialogContent className="sm:max-w-lg">
                        <form onSubmit={submit} className="space-y-4">
                              <DialogHeader>
                                    <DialogTitle>New work item</DialogTitle>
                                    <DialogDescription>
                                          Create an item for the selected team.
                                    </DialogDescription>
                              </DialogHeader>

                              {error && (
                                    <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                                          {error}
                                    </div>
                              )}

                              <div className="space-y-1.5">
                                    <Label htmlFor="wi-title">Title</Label>
                                    <Input
                                          id="wi-title"
                                          value={form.title}
                                          onChange={(e) => set('title')(e.target.value)}
                                          placeholder="Payment gateway timing out"
                                    />
                              </div>

                              <div className="space-y-1.5">
                                    <Label htmlFor="wi-desc">Description</Label>
                                    <Textarea
                                          id="wi-desc"
                                          rows={3}
                                          value={form.description}
                                          onChange={(e) => set('description')(e.target.value)}
                                    />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                          <Label>Type</Label>
                                          <Select value={form.type} onValueChange={set('type')}>
                                                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                      {TYPES.map((t) => <SelectItem key={t} value={t}>{humanize(t)}</SelectItem>)}
                                                </SelectContent>
                                          </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                          <Label>Priority</Label>
                                          <Select value={form.priority} onValueChange={set('priority')}>
                                                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                      {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                                </SelectContent>
                                          </Select>
                                    </div>
                              </div>

                              <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                          <Label>Assignee</Label>
                                          {!isAdminOrLead && (
                                                <span className="text-[11px] text-muted-foreground">Self or unassigned only</span>
                                          )}
                                    </div>
                                    <Select value={form.assigneeId} onValueChange={set('assigneeId')}>
                                          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                          <SelectContent>
                                                <SelectItem value="none">Unassigned</SelectItem>
                                                {assigneeOptions.map((m) => (
                                                      <SelectItem key={m.userId} value={m.userId}>
                                                            {m.user.name} {m.userId === currentUserId ? '(Myself)' : ''}
                                                      </SelectItem>
                                                ))}
                                          </SelectContent>
                                    </Select>
                                    {!isAdminOrLead && (
                                          <p className="text-[11px] text-muted-foreground">
                                                As a normal member, you can only create tasks for yourself or leave them unassigned until a Lead or Admin assigns them.
                                          </p>
                                    )}
                              </div>

                              <DialogFooter>
                                    <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer">Cancel</Button>
                                    <Button type="submit" className="cursor-pointer">Create item</Button>
                              </DialogFooter>
                        </form>
                  </DialogContent>
            </Dialog>
      );
}
