import { useState, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PRIORITIES, STATUSES, STATUS_META, MEMBER_ALLOWED_STATUSES } from '@/lib/constants';
import { fmtDate, humanize } from '@/lib/helpers';
import { ShieldAlert, Info, Trash2 } from 'lucide-react';

/**
 * Dialog for editing a work item with role-based authorization:
 * - Admin and Lead can perform all modifications (any status, priority, and assign to anyone).
 *   They also see a "Delete item" button in the footer with an inline confirmation step.
 * - Normal Members:
 *   1. Access only up to AwaitingApproval (cannot edit items that are AwaitingApproval, Resolved, or Closed).
 *   2. Cannot change status to Resolved or Closed (can only transition Open, InProgress, AwaitingApproval).
 *   3. Cannot assign or reassign items to other users (can only self-assign or leave unassigned).
 *   4. Cannot modify items assigned to other team members.
 *   5. Never see the delete button.
 */
export default function EditItemDialog({
      item,
      members = [],
      meId = null,
      canWrite = false,
      isAdminOrLead = false,
      onClose,
      onSave,
      onDelete,
}) {
      const [form, setForm] = useState({
            status: item.status,
            priority: item.priority,
            assigneeId: item.assigneeId ?? null,
      });

      // Tracks whether the inline delete confirmation step is active
      const [confirmingDelete, setConfirmingDelete] = useState(false);

      // Normal member restrictions evaluation
      const isPastApproval = ['AwaitingApproval', 'Resolved', 'Closed'].includes(item.status);
      const isAssignedToOther = item.assigneeId && item.assigneeId !== meId;
      const isLockedForMember = !isAdminOrLead && (isPastApproval || isAssignedToOther);

      // User has active edit permissions on this item
      const canEdit = canWrite && !isLockedForMember;

      const dirty =
            form.status !== item.status || form.priority !== item.priority || form.assigneeId !== item.assigneeId;

      /**
       * Determines allowed status options:
       * - Admins and Leads can set any status.
       * - Normal members can only choose up to AwaitingApproval.
       */
      const allowedStatuses = useMemo(() => {
            if (isAdminOrLead) {
                  return STATUSES;
            }
            return MEMBER_ALLOWED_STATUSES;
      }, [isAdminOrLead]);

      /**
       * Determines allowed assignee options:
       * - Admins and Leads can assign to any team member.
       * - Normal members can only self-assign or leave unassigned.
       */
      const allowedAssigneeOptions = useMemo(() => {
            if (isAdminOrLead) {
                  return members;
            }
            // For normal members, only self is permitted
            return members.filter((m) => m.userId === meId);
      }, [members, isAdminOrLead, meId]);

      /**
       * Submits updated work item values to the parent handler if valid.
       */
      const save = () => {
            if (!canEdit) return;

            // Normalize assigneeId (empty string or 'none' maps to null)
            const cleanAssignee = form.assigneeId === '' || form.assigneeId === 'none' ? null : form.assigneeId;

            onSave(item.id, {
                  ...form,
                  assigneeId: cleanAssignee,
            });
            onClose();
      };

      // Real createdBy object from API
      const creatorName = item.createdBy?.name || item.createdBy?.email || 'Unknown';

      return (
            <Dialog open onOpenChange={(o) => !o && onClose()}>
                  <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                              <DialogTitle className="pr-6">{item.title}</DialogTitle>
                              <DialogDescription>
                                    {humanize(item.type)} · created {fmtDate(item.createdAt)} by {creatorName} · v{item.version}
                              </DialogDescription>
                        </DialogHeader>

                        {/* Informational banners explaining role-based restrictions */}
                        {!isAdminOrLead && isPastApproval && (
                              <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
                                    <ShieldAlert className="size-4 shrink-0 mt-0.5" />
                                    <div>
                                          <p className="font-medium">Read-only for normal members</p>
                                          <p className="mt-0.5 text-muted-foreground">
                                                This work item is in <span className="font-semibold">{STATUS_META[item.status]?.label || item.status}</span>. Normal members have access only till Awaiting Approval. Only Leads or Admins can review, modify, or approve items in this stage.
                                          </p>
                                    </div>
                              </div>
                        )}

                        {!isAdminOrLead && !isPastApproval && isAssignedToOther && (
                              <div className="flex items-start gap-2.5 rounded-lg border border-sky-500/20 bg-sky-500/10 p-3 text-xs text-sky-700 dark:text-sky-400">
                                    <Info className="size-4 shrink-0 mt-0.5" />
                                    <div>
                                          <p className="font-medium">Assigned to another member</p>
                                          <p className="mt-0.5 text-muted-foreground">
                                                This item is currently assigned to another member. Only Leads, Admins, or the assignee can modify it.
                                          </p>
                                    </div>
                              </div>
                        )}

                        {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}

                        <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                          <Label>Status</Label>
                                          {!isAdminOrLead && (
                                                <span className="text-[10px] text-muted-foreground">Up to Approval</span>
                                          )}
                                    </div>
                                    <Select
                                          value={form.status}
                                          onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                                          disabled={!canEdit}
                                    >
                                          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                          <SelectContent>
                                                {allowedStatuses.map((s) => (
                                                      <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
                                                ))}
                                          </SelectContent>
                                    </Select>
                              </div>
                              <div className="space-y-1.5">
                                    <Label>Priority</Label>
                                    <Select
                                          value={form.priority}
                                          onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}
                                          disabled={!canEdit}
                                    >
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
                                    {canEdit && form.assigneeId !== meId && (
                                          <button
                                                type="button"
                                                onClick={() => setForm((f) => ({ ...f, assigneeId: meId }))}
                                                className="cursor-pointer text-xs font-medium text-foreground hover:underline"
                                          >
                                                Assign to me
                                          </button>
                                    )}
                              </div>
                              <Select
                                    value={form.assigneeId ?? 'none'}
                                    onValueChange={(v) => setForm((f) => ({ ...f, assigneeId: v === 'none' ? null : v }))}
                                    disabled={!canEdit}
                              >
                                    <SelectTrigger className="w-full"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                                    <SelectContent>
                                          <SelectItem value="none">Unassigned</SelectItem>
                                          {allowedAssigneeOptions.map((m) => (
                                                <SelectItem key={m.userId} value={m.userId}>
                                                      {m.user.name} {m.userId === meId ? '(Myself)' : ''}
                                                </SelectItem>
                                          ))}
                                    </SelectContent>
                              </Select>
                              {!isAdminOrLead && canEdit && (
                                    <p className="text-[11px] text-muted-foreground">
                                          Normal members cannot assign tasks to other users.
                                    </p>
                              )}
                        </div>

                        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:items-center">
                              {/* Delete zone — visible only to Admin and Lead */}
                              {isAdminOrLead && (
                                    <div className="flex items-center gap-2">
                                          {confirmingDelete ? (
                                                <>
                                                      <span className="text-xs text-muted-foreground">Delete permanently?</span>
                                                      {/* Confirm: calls parent onDelete handler then closes dialog */}
                                                      <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            className="cursor-pointer h-8 px-3 text-xs"
                                                            onClick={() => { onDelete(item.id); onClose(); }}
                                                      >
                                                            Confirm Delete
                                                      </Button>
                                                      {/* Cancel: returns to normal footer state */}
                                                      <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="cursor-pointer h-8 px-3 text-xs"
                                                            onClick={() => setConfirmingDelete(false)}
                                                      >
                                                            Cancel
                                                      </Button>
                                                </>
                                          ) : (
                                                /* Delete trigger button — switches footer into confirm mode */
                                                <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      className="cursor-pointer h-8 px-3 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                                      onClick={() => setConfirmingDelete(true)}
                                                >
                                                      <Trash2 className="size-3.5 mr-1.5" />
                                                      Delete item
                                                </Button>
                                          )}
                                    </div>
                              )}

                              {/* Save / Close zone — always visible */}
                              <div className="flex gap-2">
                                    <Button variant="outline" onClick={onClose} className="cursor-pointer">Close</Button>
                                    {canEdit && (
                                          <Button onClick={save} disabled={!dirty} className="cursor-pointer">Save changes</Button>
                                    )}
                              </div>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}

