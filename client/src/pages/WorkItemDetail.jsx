import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
      ArrowLeft, Send, Pencil, Trash2, X, Check,
      User, Tag, AlertCircle, MessageSquare,
      Activity, ChevronLeft, ChevronRight, Layers,
      Calendar, GitBranch, CreditCard, Sun, Moon
} from 'lucide-react';

import { Loader, FullPageLoader } from '@/components/ui/Loader';
import UserAvatar from '@/components/shared/UserAvatar';

import { selectCurrentUser } from '@/stores/slices/userSlice';
import { useGetWorkItemByIdQuery } from '@/stores/slices/workItemsApiSlice';
import {
      useGetCommentsByWorkItemQuery,
      useAddCommentMutation,
      useUpdateCommentMutation,
      useDeleteCommentMutation,
} from '@/stores/slices/commentsApiSlice';
import { useGetWorkItemActivitiesQuery } from '@/stores/slices/activitiesApiSlice';

import { fmtDate, humanize, timeAgo, describeActivity } from '@/lib/helpers';
import { cn } from '@/lib/utils';

/**
 * Maps the work item category type to its corresponding Lucide icon and semantic color styling
 */
function getTypeInfo(type) {
      switch ((type || '').toLowerCase()) {
            case 'payment':
                  return {
                        icon: CreditCard,
                        containerClass: 'bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400',
                  };
            case 'incident':
                  return {
                        icon: AlertCircle,
                        containerClass: 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400',
                  };
            case 'customerissue':
                  return {
                        icon: User,
                        containerClass: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
                  };
            case 'compliance':
                  return {
                        icon: Tag,
                        containerClass: 'bg-violet-500/10 border-violet-500/20 text-violet-600 dark:text-violet-400',
                  };
            case 'task':
            default:
                  return {
                        icon: CreditCard,
                        containerClass: 'bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400',
                  };
      }
}

/**
 * Renders a status badge pill with a colored dot matching the system semantic theme tokens
 */
function StatusPill({ status }) {
      const config = {
            Open: {
                  label: 'Open',
                  pill: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
                  dot: 'bg-sky-500 dark:bg-sky-400',
            },
            InProgress: {
                  label: 'In Progress',
                  pill: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                  dot: 'bg-amber-500 dark:bg-amber-400',
            },
            AwaitingApproval: {
                  label: 'Awaiting Approval',
                  pill: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
                  dot: 'bg-violet-500 dark:bg-violet-400',
            },
            Resolved: {
                  label: 'Resolved',
                  pill: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                  dot: 'bg-emerald-500 dark:bg-emerald-400',
            },
            Closed: {
                  label: 'Closed',
                  pill: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
                  dot: 'bg-zinc-500 dark:bg-zinc-400',
            },
      };

      const current = config[status] || {
            label: humanize(status) || status || 'Open',
            pill: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
            dot: 'bg-sky-500 dark:bg-sky-400',
      };

      return (
            <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border select-none', current.pill)}>
                  <span className={cn('size-1.5 rounded-full shrink-0', current.dot)} />
                  <span>{current.label}</span>
            </span>
      );
}

/**
 * Renders a priority badge pill with a colored dot matching the system semantic theme tokens
 */
function PriorityPill({ priority }) {
      const config = {
            Low: {
                  label: 'Low',
                  pill: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
                  dot: 'bg-zinc-500 dark:bg-zinc-400',
            },
            Medium: {
                  label: 'Medium',
                  pill: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
                  dot: 'bg-sky-500 dark:bg-sky-400',
            },
            High: {
                  label: 'High',
                  pill: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
                  dot: 'bg-orange-500 dark:bg-orange-400',
            },
            Urgent: {
                  label: 'Urgent',
                  pill: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
                  dot: 'bg-red-500 dark:bg-red-400',
            },
      };

      const current = config[priority] || {
            label: priority || 'Medium',
            pill: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
            dot: 'bg-orange-500 dark:bg-orange-400',
      };

      return (
            <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border select-none', current.pill)}>
                  <span className={cn('size-1.5 rounded-full shrink-0', current.dot)} />
                  <span>{current.label}</span>
            </span>
      );
}

/**
 * Renders an individual comment with author avatar, time, body, and edit/delete actions
 */
function CommentItem({ comment, currentUserId, workItemId }) {
      const isOwn = (comment.author?.id || comment.authorId) === currentUserId;
      const [editing, setEditing] = useState(false);
      const [editBody, setEditBody] = useState(comment.body);

      const [updateComment, { isLoading: updating }] = useUpdateCommentMutation();
      const [deleteComment, { isLoading: deleting }] = useDeleteCommentMutation();

      /**
       * Submits updated comment content to the backend API
       */
      const handleSave = async () => {
            const trimmed = editBody.trim();
            if (!trimmed || trimmed === comment.body) {
                  setEditing(false);
                  return;
            }
            try {
                  await updateComment({ id: comment.id, body: trimmed, workItemId }).unwrap();
                  setEditing(false);
            } catch (err) {
                  console.error('Update comment failed:', err);
            }
      };

      /**
       * Calls delete mutation for the current comment
       */
      const handleDelete = async () => {
            try {
                  await deleteComment({ id: comment.id, workItemId }).unwrap();
            } catch (err) {
                  console.error('Delete comment failed:', err);
            }
      };

      return (
            <div className="flex gap-3 group">
                  <UserAvatar
                        name={comment.author?.name}
                        email={comment.author?.email}
                        className="size-7 mt-0.5 shrink-0 border border-border"
                  />
                  <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-foreground">
                                          {comment.author?.name || 'Unknown'}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground">
                                          {timeAgo(comment.createdAt)}
                                    </span>
                              </div>
                              {isOwn && !editing && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button
                                                type="button"
                                                onClick={() => setEditing(true)}
                                                className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                                                title="Edit"
                                          >
                                                <Pencil className="size-3" />
                                          </button>
                                          <button
                                                type="button"
                                                disabled={deleting}
                                                onClick={handleDelete}
                                                className="p-1 text-muted-foreground hover:text-destructive cursor-pointer"
                                                title="Delete"
                                          >
                                                {deleting ? <Loader size="sm" /> : <Trash2 className="size-3" />}
                                          </button>
                                    </div>
                              )}
                        </div>

                        {editing ? (
                              <div className="space-y-2 mt-2">
                                    <textarea
                                          value={editBody}
                                          onChange={(e) => setEditBody(e.target.value)}
                                          rows={2}
                                          className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none focus:border-ring resize-none"
                                          autoFocus
                                    />
                                    <div className="flex gap-2">
                                          <button
                                                type="button"
                                                onClick={handleSave}
                                                disabled={updating}
                                                className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary text-primary-foreground text-xs font-medium"
                                          >
                                                {updating ? <Loader size="sm" /> : <Check className="size-3" />} Save
                                          </button>
                                          <button
                                                type="button"
                                                onClick={() => {
                                                      setEditing(false);
                                                      setEditBody(comment.body);
                                                }}
                                                className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-muted text-muted-foreground text-xs"
                                          >
                                                <X className="size-3" /> Cancel
                                          </button>
                                    </div>
                              </div>
                        ) : (
                              <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap break-words rounded-lg bg-muted/40 p-2.5 border border-border">
                                    {comment.body}
                              </p>
                        )}
                  </div>
            </div>
      );
}

/**
 * Manages the comments section layout, comments fetching, empty state, and new comment submission
 */
function CommentsSection({ workItemId, currentUser }) {
      const [page, setPage] = useState(1);
      const [body, setBody] = useState('');
      const LIMIT = 10;

      const { data: raw, isLoading } = useGetCommentsByWorkItemQuery({ workItemId, page, limit: LIMIT });
      const comments = Array.isArray(raw) ? raw : (raw?.data ?? []);
      const totalPages = raw?.pagination?.totalPages ?? Math.max(1, Math.ceil((raw?.pagination?.total ?? comments.length) / LIMIT));

      const [addComment, { isLoading: submitting }] = useAddCommentMutation();

      /**
       * Submits a newly composed comment to the server
       */
      const handleSubmit = async (e) => {
            e?.preventDefault();
            if (!body.trim()) return;
            try {
                  await addComment({ workItemId, body: body.trim() }).unwrap();
                  setBody('');
                  setPage(1);
            } catch (err) {
                  console.error('Add comment failed:', err);
            }
      };

      return (
            <div className="flex flex-col flex-1 justify-between gap-4">
                  {/* Comments display container */}
                  <div className="rounded-xl border border-border bg-muted/20 flex-1 min-h-[220px] p-5 flex flex-col justify-center">
                        {isLoading ? (
                              <div className="flex justify-center py-8"><Loader /></div>
                        ) : comments.length === 0 ? (
                              <div className="flex items-center justify-center gap-3.5 py-6">
                                    <MessageSquare className="size-5 text-muted-foreground shrink-0 stroke-[1.5]" />
                                    <div className="text-left">
                                          <p className="text-sm font-medium text-foreground">No comments yet</p>
                                          <p className="text-xs text-muted-foreground mt-0.5">Start the conversation.</p>
                                    </div>
                              </div>
                        ) : (
                              <div className="space-y-4">
                                    {comments.map((c) => (
                                          <CommentItem
                                                key={c.id}
                                                comment={c}
                                                currentUserId={currentUser?.id}
                                                workItemId={workItemId}
                                          />
                                    ))}
                              </div>
                        )}

                        {totalPages > 1 && (
                              <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
                                    <p className="text-[11px] text-muted-foreground">Page {page} of {totalPages}</p>
                                    <div className="flex gap-1.5">
                                          <button
                                                type="button"
                                                disabled={page <= 1}
                                                onClick={() => setPage((p) => p - 1)}
                                                className="cursor-pointer px-2 py-1 rounded bg-muted text-xs text-foreground disabled:opacity-40"
                                          >
                                                <ChevronLeft className="size-3.5" />
                                          </button>
                                          <button
                                                type="button"
                                                disabled={page >= totalPages}
                                                onClick={() => setPage((p) => p + 1)}
                                                className="cursor-pointer px-2 py-1 rounded bg-muted text-xs text-foreground disabled:opacity-40"
                                          >
                                                <ChevronRight className="size-3.5" />
                                          </button>
                                    </div>
                              </div>
                        )}
                  </div>

                  {/* Comment Input Box */}
                  <form onSubmit={handleSubmit} className="flex items-start gap-3 shrink-0 pt-1">
                        <UserAvatar
                              name={currentUser?.name}
                              email={currentUser?.email}
                              className="size-8 shrink-0 mt-0.5 border border-border"
                        />
                        <div className="flex-1 space-y-2.5 min-w-0">
                              <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder="Write a comment... (Ctrl+Enter to post)"
                                    rows={3}
                                    className="w-full rounded-xl border border-border bg-muted/20 focus:bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors resize-none leading-relaxed"
                                    onKeyDown={(e) => {
                                          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSubmit(e);
                                    }}
                              />
                              <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground select-none">Ctrl + Enter to post</span>
                                    <button
                                          type="submit"
                                          disabled={submitting || !body.trim()}
                                          className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-px"
                                    >
                                          {submitting ? <Loader size="sm" /> : <Send className="size-3.5" />}
                                          <span>Post comment</span>
                                    </button>
                              </div>
                        </div>
                  </form>
            </div>
      );
}

/**
 * Displays the audit log timeline for the work item with actor details and relative time
 */
function ActivitySection({ workItemId }) {
      const [page, setPage] = useState(1);
      const LIMIT = 15;

      const { data: raw, isLoading } = useGetWorkItemActivitiesQuery({ workItemId, page, limit: LIMIT });
      const activities = Array.isArray(raw) ? raw : (raw?.data ?? []);
      const totalPages = raw?.pagination?.totalPages ?? 1;

      return (
            <div className="rounded-xl border border-border bg-muted/20 flex-1 min-h-[220px] p-5 flex flex-col justify-between">
                  {isLoading ? (
                        <div className="flex justify-center py-8"><Loader /></div>
                  ) : activities.length === 0 ? (
                        <p className="text-center text-xs text-muted-foreground py-8">No activity recorded yet.</p>
                  ) : (
                        <div className="relative pl-2">
                              <div className="absolute left-[17px] top-3 bottom-3 w-px bg-border" />
                              <div className="space-y-4">
                                    {activities.map((a) => {
                                          const actor = a.actor ?? {};
                                          return (
                                                <div key={a.id} className="flex items-start gap-3">
                                                      <UserAvatar
                                                            name={actor.name}
                                                            email={actor.email}
                                                            className="relative z-10 size-6 text-[10px] shrink-0 border border-border"
                                                      />
                                                      <div className="flex-1 min-w-0 pt-0.5">
                                                            <p className="text-xs text-foreground leading-snug">
                                                                  <span className="font-semibold">{actor.name || 'System'}</span>
                                                                  {' '}
                                                                  <span className="text-muted-foreground">{describeActivity(a)}</span>
                                                            </p>
                                                            <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(a.createdAt)}</p>
                                                      </div>
                                                </div>
                                          );
                                    })}
                              </div>
                        </div>
                  )}

                  {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-3 mt-4 border-t border-border">
                              <p className="text-[11px] text-muted-foreground">Page {page} of {totalPages}</p>
                              <div className="flex gap-1.5">
                                    <button
                                          type="button"
                                          disabled={page <= 1}
                                          onClick={() => setPage((p) => p - 1)}
                                          className="cursor-pointer px-2 py-1 rounded bg-muted text-xs text-foreground disabled:opacity-40"
                                    >
                                          <ChevronLeft className="size-3.5" />
                                    </button>
                                    <button
                                          type="button"
                                          disabled={page >= totalPages}
                                          onClick={() => setPage((p) => p + 1)}
                                          className="cursor-pointer px-2 py-1 rounded bg-muted text-xs text-foreground disabled:opacity-40"
                                    >
                                          <ChevronRight className="size-3.5" />
                                    </button>
                              </div>
                        </div>
                  )}
            </div>
      );
}

/**
 * Main WorkItemDetail page providing work item details, activity tracking, comments, and theme integration
 */
export default function WorkItemDetail() {
      const { id } = useParams();
      const navigate = useNavigate();
      const currentUser = useSelector(selectCurrentUser);

      const [activeTab, setActiveTab] = useState('comments');
      const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

      /**
       * Toggles the system light/dark theme class on the document root
       */
      const toggleTheme = () => {
            const isDark = document.documentElement.classList.toggle('dark');
            document.documentElement.classList.toggle('light', !isDark);
            setDark(isDark);
      };

      const { data: workItem, isLoading, isError } = useGetWorkItemByIdQuery(id, { skip: !id });

      if (isLoading) return <FullPageLoader text="Loading work item…" />;

      if (isError || !workItem) {
            return (
                  <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center p-6 text-foreground">
                        <AlertCircle className="size-10 text-destructive" />
                        <h1 className="text-xl font-semibold">Work item not found</h1>
                        <p className="text-sm text-muted-foreground">
                              This item may have been deleted or you don't have access.
                        </p>
                        <button
                              type="button"
                              onClick={() => navigate(-1)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-sm text-foreground hover:bg-muted cursor-pointer transition-colors"
                        >
                              <ArrowLeft className="size-4" /> Go back
                        </button>
                  </div>
            );
      }

      const item = workItem?.data ?? workItem;
      const typeInfo = getTypeInfo(item.type);
      const TypeIcon = typeInfo.icon;

      return (
            <div className="min-h-screen bg-background text-foreground antialiased">

                  {/* ════════ Top Navigation Bar ════════ */}
                  <header className="sticky top-0 z-30 flex h-[68px] items-center gap-3 border-b border-border bg-background/80 px-4 sm:px-8 backdrop-blur">
                        <button
                              type="button"
                              onClick={() => navigate(-1)}
                              aria-label="Go back"
                              className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                              <ArrowLeft className="size-4" />
                        </button>

                        {/* Breadcrumbs */}
                        <nav className="flex items-center gap-2 text-sm min-w-0">
                              <Link
                                    to="/dashboard"
                                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                              >
                                    <Layers className="size-4 text-muted-foreground" />
                                    <span>Dashboard</span>
                              </Link>
                              <ChevronRight className="size-3.5 text-muted-foreground/60 shrink-0" />
                              <span className="font-semibold text-foreground truncate max-w-[160px] sm:max-w-md">
                                    {item.title}
                              </span>
                        </nav>

                        {/* Status, Priority & Theme Toggle */}
                        <div className="ml-auto flex items-center gap-2.5 shrink-0">
                              <StatusPill status={item.status} />
                              <PriorityPill priority={item.priority} />
                              <button
                                    type="button"
                                    onClick={toggleTheme}
                                    aria-label="Toggle theme"
                                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
                              >
                                    {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
                              </button>
                        </div>
                  </header>

                  <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-6">

                        {/* ════════ Hero Header Card ════════ */}
                        <div className="rounded-xl border border-border bg-card p-6 sm:p-7 shadow-none">
                              <div className="flex items-start gap-4 sm:gap-5">
                                    <div className={cn('size-11 sm:size-12 rounded-xl border flex items-center justify-center shrink-0 shadow-none', typeInfo.containerClass)}>
                                          <TypeIcon className="size-5 sm:size-6" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                                                {humanize(item.type) || 'PAYMENT'}
                                          </p>
                                          <h1 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight leading-tight">
                                                {item.title}
                                          </h1>
                                          {item.description && (
                                                <p className="text-sm text-muted-foreground mt-2 leading-relaxed whitespace-pre-wrap">
                                                      {item.description}
                                                </p>
                                          )}
                                    </div>
                              </div>
                        </div>

                        {/* ════════ Main Content Grid: Balanced Equal Height Cards ════════ */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

                              {/* ── Left Column: Comments & Activity Card ── */}
                              <div className="lg:col-span-8 rounded-xl border border-border bg-card p-6 shadow-none flex flex-col h-full">
                                    {/* Card Header with Segmented Tab Switcher */}
                                    <div className="flex items-center justify-between mb-5 shrink-0">
                                          <div className="flex items-center gap-2 text-foreground font-medium text-base">
                                                <MessageSquare className="size-4.5 text-muted-foreground" />
                                                <span>Comments</span>
                                          </div>

                                          <div className="flex items-center bg-muted/50 border border-border rounded-lg p-1 gap-1">
                                                <button
                                                      type="button"
                                                      onClick={() => setActiveTab('comments')}
                                                      className={cn(
                                                            'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-all',
                                                            activeTab === 'comments'
                                                                  ? 'bg-card text-foreground border border-border shadow-xs'
                                                                  : 'text-muted-foreground hover:text-foreground'
                                                      )}
                                                >
                                                      <MessageSquare className="size-3.5" />
                                                      <span>Comments</span>
                                                </button>
                                                <button
                                                      type="button"
                                                      onClick={() => setActiveTab('activity')}
                                                      className={cn(
                                                            'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-all',
                                                            activeTab === 'activity'
                                                                  ? 'bg-card text-foreground border border-border shadow-xs'
                                                                  : 'text-muted-foreground hover:text-foreground'
                                                      )}
                                                >
                                                      <Activity className="size-3.5" />
                                                      <span>Activity</span>
                                                </button>
                                          </div>
                                    </div>

                                    {/* Active Tab Content (Stretches to fill container) */}
                                    {activeTab === 'comments' ? (
                                          <CommentsSection
                                                workItemId={id}
                                                currentUser={currentUser}
                                          />
                                    ) : (
                                          <ActivitySection
                                                workItemId={id}
                                          />
                                    )}
                              </div>

                              {/* ── Right Column: Details Panel (Aligned Equal Height) ── */}
                              <div className="lg:col-span-4 rounded-xl border border-border bg-card p-6 shadow-none flex flex-col h-full">
                                    {/* Header with cyan accent dot */}
                                    <div className="flex items-center justify-between pb-4 border-b border-border shrink-0">
                                          <h2 className="text-base font-medium text-foreground">Details</h2>
                                          <span className="size-1.5 rounded-full bg-sky-500 dark:bg-sky-400 shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
                                    </div>

                                    {/* Attribute Rows distributed evenly to align with the left card */}
                                    <div className="flex-1 flex flex-col justify-between divide-y divide-border pt-1">

                                          {/* Status */}
                                          <div className="py-3.5 flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                                      <Tag className="size-4 shrink-0" />
                                                      <span>Status</span>
                                                </div>
                                                <StatusPill status={item.status} />
                                          </div>

                                          {/* Priority */}
                                          <div className="py-3.5 flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                                      <AlertCircle className="size-4 shrink-0" />
                                                      <span>Priority</span>
                                                </div>
                                                <PriorityPill priority={item.priority} />
                                          </div>

                                          {/* Assignee */}
                                          <div className="py-3.5 flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                                      <User className="size-4 shrink-0" />
                                                      <span>Assignee</span>
                                                </div>
                                                {item.assignee ? (
                                                      <UserAvatar
                                                            name={item.assignee.name}
                                                            email={item.assignee.email}
                                                            className="size-6 text-[10px] font-semibold border border-border"
                                                      />
                                                ) : (
                                                      <span className="text-xs text-muted-foreground">Unassigned</span>
                                                )}
                                          </div>

                                          {/* Created by */}
                                          <div className="py-3.5 flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                                      <User className="size-4 shrink-0" />
                                                      <span>Created by</span>
                                                </div>
                                                {item.createdBy ? (
                                                      <UserAvatar
                                                            name={item.createdBy.name}
                                                            email={item.createdBy.email}
                                                            className="size-6 text-[10px] font-semibold border border-border"
                                                      />
                                                ) : (
                                                      <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                          </div>

                                          {/* Created */}
                                          <div className="py-3.5 flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                                      <Calendar className="size-4 shrink-0" />
                                                      <span>Created</span>
                                                </div>
                                                <span className="text-sm font-medium text-foreground">
                                                      {fmtDate(item.createdAt)}
                                                </span>
                                          </div>

                                          {/* Version */}
                                          <div className="py-3.5 flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                                      <GitBranch className="size-4 shrink-0" />
                                                      <span>Version</span>
                                                </div>
                                                <span className="text-sm font-medium text-foreground">
                                                      v{item.version ?? 1}
                                                </span>
                                          </div>

                                    </div>
                              </div>

                        </div>

                  </main>
            </div>
      );
}
