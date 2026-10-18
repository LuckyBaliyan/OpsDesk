import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PRIORITIES, STATUSES, STATUS_META } from '@/lib/constants';
import { fmtDate, humanize } from '@/lib/helpers';
import { USERS } from '@/data/mockData';

export default function EditItemDialog({ item, members, meId, canWrite, onClose, onSave }) {
      const [form, setForm] = useState({
            status: item.status,
            priority: item.priority,
            assigneeId: item.assigneeId ?? null,
      });

      const dirty =
            form.status !== item.status || form.priority !== item.priority || form.assigneeId !== item.assigneeId;

      const save = () => {
            onSave(item.id, form);
            onClose();
      };

      return (
            <Dialog open onOpenChange={(o) => !o && onClose()}>
                  <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                              <DialogTitle className="pr-6">{item.title}</DialogTitle>
                              <DialogDescription>
                                    {humanize(item.type)} · created {fmtDate(item.createdAt)} by {USERS[item.createdById]?.name} · v{item.version}
                              </DialogDescription>
                        </DialogHeader>

                        {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}

                        <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                    <Label>Status</Label>
                                    <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))} disabled={!canWrite}>
                                          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                          <SelectContent>
                                                {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>)}
                                          </SelectContent>
                                    </Select>
                              </div>
                              <div className="space-y-1.5">
                                    <Label>Priority</Label>
                                    <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))} disabled={!canWrite}>
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
                                    {canWrite && form.assigneeId !== meId && (
                                          <button
                                                type="button"
                                                onClick={() => setForm((f) => ({ ...f, assigneeId: meId }))}
                                                className="cursor-pointer text-xs font-medium text-foreground hover:underline"
                                          >
                                                Assign to me
                                          </button>
                                    )}
                              </div>
                              <Select value={form.assigneeId ?? ''} onValueChange={(v) => setForm((f) => ({ ...f, assigneeId: v }))} disabled={!canWrite}>
                                    <SelectTrigger className="w-full"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                                    <SelectContent>
                                          {members.map((m) => (
                                                <SelectItem key={m.userId} value={m.userId}>{m.user.name}</SelectItem>
                                          ))}
                                    </SelectContent>
                              </Select>
                        </div>

                        <DialogFooter>
                              <Button variant="outline" onClick={onClose} className="cursor-pointer">Close</Button>
                              {canWrite && (
                                    <Button onClick={save} disabled={!dirty} className="cursor-pointer">Save changes</Button>
                              )}
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}
