import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CARD, PRIORITIES, STATUSES, STATUS_META, VIEWS } from '@/lib/constants';
import { fmtDate, humanize } from '@/lib/helpers';
import { USERS } from '@/data/mockData';
import UserAvatar from '@/components/shared/UserAvatar';
import StatusBadge from '@/components/shared/StatusBadge';
import PriorityBadge from '@/components/shared/PriorityBadge';

/* Top Campaigns -> Work Items */
export default function WorkItemsCard({
      activeTeam,
      total,
      items,
      selected,
      view,
      onViewChange,
      statusFilter,
      onStatusFilterChange,
      priorityFilter,
      onPriorityFilterChange,
      page,
      totalPages,
      onPageChange,
      onSelect,
      onOpenItem,
}) {
      return (
            <Card className={cn(CARD, 'lg:col-span-2')}>
                  <CardHeader className="gap-1 px-6 pt-6 pb-0">
                        <CardTitle className="text-lg font-medium">Work Items</CardTitle>
                        <CardDescription className="text-sm">
                              {total} item{total === 1 ? '' : 's'} in {activeTeam.name}
                        </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 p-6">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                              <div className="overflow-x-auto">
                                    <Tabs value={view} onValueChange={onViewChange}>
                                          <TabsList>
                                                {VIEWS.map((v) => (
                                                      <TabsTrigger key={v.value} value={v.value} className="cursor-pointer">{v.label}</TabsTrigger>
                                                ))}
                                          </TabsList>
                                    </Tabs>
                              </div>

                              <div className="flex gap-2">
                                    <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                                          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                                          <SelectContent>
                                                <SelectItem value="all">All statuses</SelectItem>
                                                {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>)}
                                          </SelectContent>
                                    </Select>
                                    <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
                                          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Priority" /></SelectTrigger>
                                          <SelectContent>
                                                <SelectItem value="all">All priorities</SelectItem>
                                                {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                          </SelectContent>
                                    </Select>
                              </div>
                        </div>

                        <Table>
                              <TableHeader>
                                    <TableRow>
                                          <TableHead>Work item</TableHead>
                                          <TableHead>Status</TableHead>
                                          <TableHead>Priority</TableHead>
                                          <TableHead>Assignee</TableHead>
                                          <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                              </TableHeader>
                              <TableBody>
                                    {items.length === 0 && (
                                          <TableRow>
                                                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                                                      No work items match these filters.
                                                </TableCell>
                                          </TableRow>
                                    )}

                                    {items.map((item) => {
                                          const assignee = item.assigneeId ? USERS[item.assigneeId] : null;
                                          return (
                                                <TableRow
                                                      key={item.id}
                                                      onClick={() => onSelect(item.id)}
                                                      className={cn('cursor-pointer', selected?.id === item.id && 'bg-muted/50')}
                                                >
                                                      <TableCell className="max-w-[260px]">
                                                            <p className="truncate font-medium">{item.title}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                  {humanize(item.type)} · {fmtDate(item.createdAt)}
                                                            </p>
                                                      </TableCell>
                                                      <TableCell><StatusBadge status={item.status} /></TableCell>
                                                      <TableCell><PriorityBadge priority={item.priority} /></TableCell>
                                                      <TableCell>
                                                            {assignee ? (
                                                                  <div className="flex items-center gap-2">
                                                                        <UserAvatar name={assignee.name} email={assignee.email} className="size-6" />
                                                                        <span className="max-w-[110px] truncate text-sm">{assignee.name}</span>
                                                                  </div>
                                                            ) : (
                                                                  <span className="text-sm text-muted-foreground">Unassigned</span>
                                                            )}
                                                      </TableCell>
                                                      <TableCell className="text-right">
                                                            <Button
                                                                  variant="ghost"
                                                                  size="icon-sm"
                                                                  className="cursor-pointer"
                                                                  aria-label={`Open ${item.title}`}
                                                                  onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onSelect(item.id);
                                                                        onOpenItem(item);
                                                                  }}
                                                            >
                                                                  <Eye className="size-4" />
                                                            </Button>
                                                      </TableCell>
                                                </TableRow>
                                          );
                                    })}
                              </TableBody>
                        </Table>

                        {totalPages > 1 && (
                              <div className="flex items-center justify-between">
                                    <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
                                    <div className="flex gap-2">
                                          <Button variant="outline" size="sm" className="cursor-pointer" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
                                                <ChevronLeft className="size-4" /> Prev
                                          </Button>
                                          <Button variant="outline" size="sm" className="cursor-pointer" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
                                                Next <ChevronRight className="size-4" />
                                          </Button>
                                    </div>
                              </div>
                        )}
                  </CardContent>
            </Card>
      );
}
