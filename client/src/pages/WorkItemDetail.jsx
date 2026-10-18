import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
      ArrowLeft, Send, Pencil, Trash2, X, Check,
      Clock, User, Tag, AlertCircle, MessageSquare,
      Activity, ChevronLeft, ChevronRight, Layers
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader, FullPageLoader } from '@/components/ui/Loader';

import UserAvatar from '@/components/shared/UserAvatar';
import StatusBadge from '@/components/shared/StatusBadge';
import PriorityBadge from '@/components/shared/PriorityBadge';

import { selectCurrentUser } from '@/stores/slices/userSlice';
import { useGetWorkItemByIdQuery } from '@/stores/slices/workItemsApiSlice';
import {
      useGetCommentsByWorkItemQuery,
      useAddCommentMutation,
      useUpdateCommentMutation,
      useDeleteCommentMutation,
} from '@/stores/slices/commentsApiSlice';
import { useGetWorkItemActivitiesQuery } from '@/stores/slices/activitiesApiSlice';

import { CARD } from '@/lib/constants';
import { fmtDate, humanize, timeAgo, describeActivity } from '@/lib/helpers';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────────
   MetaRow — label + value row inside the detail card
───────────────────────────────────────────────────────────── */
function MetaRow({ icon: Icon, label, children }) {
      return (
            <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
                  <div className="flex items-center gap-2 w-28 shrink-0 text-sm text-muted-foreground">
                        <Icon className="size-3.5 shrink-0" />
                        <span>{label}</span>
                  </div>
                  <div className="flex-1 text-sm">{children}</div>
            </div>
      );
}

/* ─────────────────────────────────────────────────────────────
   CommentItem — renders one comment with inline edit / delete
───────────────────────────────────────────────────────────── */
function CommentItem({ comment, currentUserId, workItemId }) {
      // Show edit/delete only to the comment's own author
      const isOwn = (comment.author?.id || comment.authorId) === currentUserId;
      const [editing, setEditing] = useState(false);
      const [editBody, setEditBody] = useState(comment.body);

      const [updateComment, { isLoading: updating }] = useUpdateCommentMutation();
      const [deleteComment, { isLoading: deleting }] = useDeleteCommentMutation();

      // Save in-place edit via PATCH /comments/:id
      const handleSave = async () => {
            const trimmed = editBody.trim();
            if (!trimmed || trimmed === comment.body) { setEditing(false); return; }
            try {
                  await updateComment({ id: comment.id, body: trimmed, workItemId }).unwrap();
                  setEditing(false);
            } catch (err) {
                  console.error('Update comment failed:', err);
            }
      };

      // Delete via DELETE /comments/:id and pass workItemId so cache invalidation works
      const handleDelete = async () => {
            try {
                  await deleteComment({ id: comment.id, workItemId }).unwrap();
            } catch (err) {
                  console.error('Delete comment failed:', err);
            }
      };

      return (
            <div className="flex gap-3 group">
                  <UserAvatar name={comment.author?.name} email={comment.author?.email} className="size-8 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-sm font-semibold">{comment.author?.name || 'Unknown'}</span>
                              <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
                        </div>

                        {editing ? (
                              <div className="space-y-2">
                                    <Textarea
                                          value={editBody}
                                          onChange={(e) => setEditBody(e.target.value)}
                                          rows={3}
                                          className="text-sm resize-none"
                                          autoFocus
                                    />
                                    <div className="flex gap-2">
                                          <Button size="sm" onClick={handleSave} disabled={updating} className="cursor-pointer">
                                                {updating ? <Loader size="sm" /> : <Check className="size-3.5" />}
                                                Save
                                          </Button>
                                          <Button size="sm" variant="outline" className="cursor-pointer"
                                                onClick={() => { setEditing(false); setEditBody(comment.body); }}>
                                                <X className="size-3.5" /> Cancel
                                          </Button>
                                    </div>
                              </div>
                        ) : (
                              <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words rounded-lg bg-muted/40 px-3 py-2.5 border border-border">
                                    {comment.body}
                              </p>
                        )}
                  </div>

                  {/* Edit / Delete — visible on hover, only for comment owner */}
                  {isOwn && !editing && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 shrink-0">
                              <Button variant="ghost" size="icon" className="size-7 cursor-pointer" onClick={() => setEditing(true)}>
                                    <Pencil className="size-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" disabled={deleting}
                                    className="size-7 cursor-pointer text-destructive hover:text-destructive"
                                    onClick={handleDelete}>
                                    {deleting ? <Loader size="sm" /> : <Trash2 className="size-3.5" />}
                              </Button>
                        </div>
                  )}
            </div>
      );
}

/* ─────────────────────────────────────────────────────────────
   CommentsSection — paginated list + add form
───────────────────────────────────────────────────────────── */
function CommentsSection({ workItemId, currentUserId }) {
      const [page, setPage] = useState(1);
      const [body, setBody] = useState('');
      const LIMIT = 10;

      const { data: raw, isLoading } = useGetCommentsByWorkItemQuery({ workItemId, page, limit: LIMIT });
      // transformResponse returns the data array directly; fall back gracefully
      const comments = Array.isArray(raw) ? raw : (raw?.data ?? []);
      const totalPages = raw?.pagination?.totalPages ?? Math.max(1, Math.ceil((raw?.pagination?.total ?? comments.length) / LIMIT));

      const [addComment, { isLoading: submitting }] = useAddCommentMutation();

      // Post a new comment via POST /work-items/:id/comments
      const handleSubmit = async (e) => {
            e?.preventDefault();
            if (!body.trim()) return;
            try {
                  await addComment({ workItemId, body: body.trim() }).unwrap();
                  setBody('');
                  setPage(1); // jump back to first page to see the new comment
            } catch (err) {
                  console.error('Add comment failed:', err);
            }
      };

      return (
            <Card className={CARD}>
                  <CardHeader className="px-6 pt-6 pb-0">
                        <CardTitle className="flex items-center gap-2 text-base font-medium">
                              <MessageSquare className="size-4 text-muted-foreground" />
                              Comments
                              {totalPages > 1 && (
                                    <span className="ml-auto text-xs text-muted-foreground font-normal">
                                          Page {page} / {totalPages}
                                    </span>
                              )}
                        </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 p-6">

                        {/* ── Add comment form ── */}
                        <form onSubmit={handleSubmit} className="flex gap-3">
                              <UserAvatar name={''} email={''} className="size-8 mt-0.5 shrink-0" />
                              <div className="flex-1 space-y-2">
                                    <Textarea
                                          value={body}
                                          onChange={(e) => setBody(e.target.value)}
                                          placeholder="Write a comment… (Ctrl+Enter to post)"
                                          rows={2}
                                          className="resize-none text-sm"
                                          onKeyDown={(e) => {
                                                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSubmit(e);
                                          }}
                                    />
                                    <Button type="submit" size="sm" disabled={submitting || !body.trim()} className="cursor-pointer">
                                          {submitting ? <Loader size="sm" /> : <Send className="size-3.5" />}
                                          Post comment
                                    </Button>
                              </div>
                        </form>

                        {/* ── Comment list ── */}
                        {isLoading ? (
                              <div className="flex justify-center py-8"><Loader /></div>
                        ) : comments.length === 0 ? (
                              <p className="text-center text-sm text-muted-foreground py-8">
                                    No comments yet. Be the first to comment.
                              </p>
                        ) : (
                              <div className="space-y-5">
                                    {comments.map((c) => (
                                          <CommentItem key={c.id} comment={c} currentUserId={currentUserId} workItemId={workItemId} />
                                    ))}
                              </div>
                        )}

                        {/* ── Pagination ── */}
                        {totalPages > 1 && (
                              <div className="flex items-center justify-between pt-2 border-t border-border">
                                    <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
                                    <div className="flex gap-2">
                                          <Button variant="outline" size="sm" disabled={page <= 1}
                                                onClick={() => setPage((p) => p - 1)} className="cursor-pointer">
                                                <ChevronLeft className="size-4" /> Prev
                                          </Button>
                                          <Button variant="outline" size="sm" disabled={page >= totalPages}
                                                onClick={() => setPage((p) => p + 1)} className="cursor-pointer">
                                                Next <ChevronRight className="size-4" />
                                          </Button>
                                    </div>
                              </div>
                        )}
                  </CardContent>
            </Card>
      );
}

/* ─────────────────────────────────────────────────────────────
   ActivitySection — paginated audit timeline
───────────────────────────────────────────────────────────── */
function ActivitySection({ workItemId }) {
      const [page, setPage] = useState(1);
      const LIMIT = 15;

      const { data: raw, isLoading } = useGetWorkItemActivitiesQuery({ workItemId, page, limit: LIMIT });
      const activities = Array.isArray(raw) ? raw : (raw?.data ?? []);
      const totalPages = raw?.pagination?.totalPages ?? 1;

      return (
            <Card className={CARD}>
                  <CardHeader className="px-6 pt-6 pb-0">
                        <CardTitle className="flex items-center gap-2 text-base font-medium">
                              <Activity className="size-4 text-muted-foreground" />
                              Activity Log
                              {totalPages > 1 && (
                                    <span className="ml-auto text-xs text-muted-foreground font-normal">
                                          Page {page} / {totalPages}
                                    </span>
                              )}
                        </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                        {isLoading ? (
                              <div className="flex justify-center py-8"><Loader /></div>
                        ) : activities.length === 0 ? (
                              <p className="text-center text-sm text-muted-foreground py-8">No activity recorded yet.</p>
                        ) : (
                              <div className="relative">
                                    {/* Vertical timeline track line */}
                                    <div className="absolute left-3.5 top-4 bottom-4 w-px bg-border" />
                                    <div className="space-y-5">
                                          {activities.map((a) => {
                                                // actor included by the activities controller via select
                                                const actor = a.actor ?? {};
                                                return (
                                                      <div key={a.id} className="flex items-start gap-3">
                                                            <div className="relative z-10">
                                                                  <UserAvatar name={actor.name} email={actor.email} className="size-7 shrink-0" />
                                                            </div>
                                                            <div className="flex-1 min-w-0 pt-0.5">
                                                                  <p className="text-sm leading-relaxed">
                                                                        <span className="font-medium">{actor.name || 'System'}</span>
                                                                        {' '}
                                                                        <span className="text-muted-foreground">{describeActivity(a)}</span>
                                                                  </p>
                                                                  <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(a.createdAt)}</p>
                                                            </div>
                                                      </div>
                                                );
                                          })}
                                    </div>
                              </div>
                        )}

                        {totalPages > 1 && (
                              <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
                                    <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
                                    <div className="flex gap-2">
                                          <Button variant="outline" size="sm" disabled={page <= 1}
                                                onClick={() => setPage((p) => p - 1)} className="cursor-pointer">
                                                <ChevronLeft className="size-4" /> Prev
                                          </Button>
                                          <Button variant="outline" size="sm" disabled={page >= totalPages}
                                                onClick={() => setPage((p) => p + 1)} className="cursor-pointer">
                                                Next <ChevronRight className="size-4" />
                                          </Button>
                                    </div>
                              </div>
                        )}
                  </CardContent>
            </Card>
      );
}

/* ─────────────────────────────────────────────────────────────
   WorkItemDetail — main page   Route: /work-items/:id
───────────────────────────────────────────────────────────── */
export default function WorkItemDetail() {
      const { id } = useParams();
      const navigate = useNavigate();
      const currentUser = useSelector(selectCurrentUser);

      const [activeTab, setActiveTab] = useState('comments');

      // Fetch the full work item (includes assignee, createdBy) from GET /work-items/:id
      const { data: workItem, isLoading, isError } = useGetWorkItemByIdQuery(id, { skip: !id });

      /* ── Loading state ── */
      if (isLoading) return <FullPageLoader text="Loading work item…" />;

      /* ── Error / not-found state ── */
      if (isError || !workItem) {
            return (
                  <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center p-6">
                        <AlertCircle className="size-10 text-destructive" />
                        <h1 className="text-xl font-semibold">Work item not found</h1>
                        <p className="text-sm text-muted-foreground">
                              This item may have been deleted or you don't have access.
                        </p>
                        <Button onClick={() => navigate(-1)} className="cursor-pointer">
                              <ArrowLeft className="size-4" /> Go back
                        </Button>
                  </div>
            );
      }

      // Normalise: server may return nested object under a "data" key
      const item = workItem?.data ?? workItem;

      return (
            <div className="min-h-screen bg-background text-foreground">

                  {/* ════════ Sticky header ════════ */}
                  <header className="sticky top-0 z-30 flex h-[68px] items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}
                              aria-label="Go back" className="cursor-pointer">
                              <ArrowLeft className="size-[18px]" />
                        </Button>
                        <span className="hidden h-5 w-px bg-border sm:block" />

                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
                              <Link to="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1 shrink-0">
                                    <Layers className="size-3.5" />
                                    <span className="hidden sm:inline">Dashboard</span>
                              </Link>
                              <span className="shrink-0">/</span>
                              <span className="text-foreground font-medium truncate">{item.title}</span>
                        </nav>

                        {/* Badges on the right */}
                        <div className="ml-auto flex items-center gap-2 shrink-0">
                              <StatusBadge status={item.status} />
                              <PriorityBadge priority={item.priority} />
                        </div>
                  </header>

                  <main className="mx-auto max-w-4xl px-4 py-6 space-y-6">

                        {/* ════════ Detail card ════════ */}
                        <Card className={CARD}>
                              <CardContent className="p-6 space-y-5">

                                    {/* Title + type */}
                                    <div className="space-y-1">
                                          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                                                {humanize(item.type)}
                                          </p>
                                          <h1 className="text-xl font-semibold leading-snug">{item.title}</h1>
                                    </div>

                                    {/* Description */}
                                    {item.description && (
                                          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                {item.description}
                                          </p>
                                    )}

                                    {/* Meta table */}
                                    <div className="rounded-lg border border-border overflow-hidden">
                                          <MetaRow icon={Tag} label="Status">
                                                <StatusBadge status={item.status} />
                                          </MetaRow>
                                          <MetaRow icon={AlertCircle} label="Priority">
                                                <PriorityBadge priority={item.priority} />
                                          </MetaRow>
                                          <MetaRow icon={User} label="Assignee">
                                                {item.assignee ? (
                                                      <div className="flex items-center gap-2">
                                                            <UserAvatar name={item.assignee.name} email={item.assignee.email} className="size-5" />
                                                            <span>{item.assignee.name}</span>
                                                      </div>
                                                ) : (
                                                      <span className="text-muted-foreground">Unassigned</span>
                                                )}
                                          </MetaRow>
                                          <MetaRow icon={User} label="Created by">
                                                {item.createdBy ? (
                                                      <div className="flex items-center gap-2">
                                                            <UserAvatar name={item.createdBy.name} email={item.createdBy.email} className="size-5" />
                                                            <span>{item.createdBy.name}</span>
                                                      </div>
                                                ) : (
                                                      <span className="text-muted-foreground">—</span>
                                                )}
                                          </MetaRow>
                                          <MetaRow icon={Clock} label="Created">
                                                <span>{fmtDate(item.createdAt)}</span>
                                          </MetaRow>
                                          <MetaRow icon={Clock} label="Version">
                                                <span>v{item.version}</span>
                                          </MetaRow>
                                    </div>
                              </CardContent>
                        </Card>

                        {/* ════════ Tabs ════════ */}
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                              <TabsList>
                                    <TabsTrigger value="comments" className="cursor-pointer gap-1.5">
                                          <MessageSquare className="size-3.5" /> Comments
                                    </TabsTrigger>
                                    <TabsTrigger value="activity" className="cursor-pointer gap-1.5">
                                          <Activity className="size-3.5" /> Activity
                                    </TabsTrigger>
                              </TabsList>
                        </Tabs>

                        {/* ════════ Tab panels ════════ */}
                        {activeTab === 'comments' && (
                              <CommentsSection workItemId={id} currentUserId={currentUser?.id} />
                        )}
                        {activeTab === 'activity' && (
                              <ActivitySection workItemId={id} />
                        )}
                  </main>
            </div>
      );
}
