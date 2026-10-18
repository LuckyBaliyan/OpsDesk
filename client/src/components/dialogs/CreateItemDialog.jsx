import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PRIORITIES, TYPES } from '@/lib/constants';
import { humanize } from '@/lib/helpers';

export default function CreateItemDialog({ members, onClose, onCreate }) {
      const [form, setForm] = useState({ title: '', description: '', type: 'Task', priority: 'Medium', assigneeId: 'none' });
      const [error, setError] = useState('');

      const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

      const submit = (e) => {
            e.preventDefault();
            if (!form.title.trim()) {
                  setError('Title is required');
                  return;
            }
            onCreate({
                  title: form.title.trim(),
                  description: form.description.trim(),
                  type: form.type,
                  priority: form.priority,
                  assigneeId: form.assigneeId === 'none' ? null : form.assigneeId,
            });
            onClose();
      };

      return (
            <Dialog open onOpenChange={(o) => !o && onClose()}>
                  <DialogContent className="sm:max-w-lg">
                        <form onSubmit={submit} className="space-y-4">
                              <DialogHeader>
                                    <DialogTitle>New work item</DialogTitle>
                                    <DialogDescription>Create an item for the selected team.</DialogDescription>
                              </DialogHeader>

                              {error && (
                                    <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                                          {error}
                                    </div>
                              )}

                              <div className="space-y-1.5">
                                    <Label htmlFor="wi-title">Title</Label>
                                    <Input id="wi-title" value={form.title} onChange={(e) => set('title')(e.target.value)} placeholder="Payment gateway timing out" />
                              </div>

                              <div className="space-y-1.5">
                                    <Label htmlFor="wi-desc">Description</Label>
                                    <Textarea id="wi-desc" rows={3} value={form.description} onChange={(e) => set('description')(e.target.value)} />
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
                                    <Label>Assignee</Label>
                                    <Select value={form.assigneeId} onValueChange={set('assigneeId')}>
                                          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                          <SelectContent>
                                                <SelectItem value="none">Unassigned</SelectItem>
                                                {members.map((m) => (
                                                      <SelectItem key={m.userId} value={m.userId}>{m.user.name}</SelectItem>
                                                ))}
                                          </SelectContent>
                                    </Select>
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
