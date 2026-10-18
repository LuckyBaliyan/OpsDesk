import React, { useMemo, useRef, useState } from 'react';
import {
      ArrowRight,
      Bell,
      CalendarDays,
      ChevronLeft,
      ChevronRight,
      Eye,
      Grip,
      Layers,
      LayoutDashboard,
      LogOut,
      Moon,
      PanelLeft,
      Plus,
      Search,
      ShieldCheck,
      Sun,
      TriangleAlert,
      UserCheck,
      Users,
      X,
} from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

/* -------------------------------------------------------------------------- */
/*  Dummy data (replace with API calls later)                                 */
/* -------------------------------------------------------------------------- */

const hoursAgo = (h) => new Date(Date.now() - h * 3600 * 1000).toISOString();

const USERS = {
      u1: { id: 'u1', name: 'Lucky Baliyan', email: 'lucky@opsdesk.dev' },
      u2: { id: 'u2', name: 'Adarsh Namdev', email: 'adarsh@opsdesk.dev' },
      u3: { id: 'u3', name: 'Mudit Dixit', email: 'mudit@opsdesk.dev' },
      u4: { id: 'u4', name: 'Priya Sharma', email: 'priya@opsdesk.dev' },
      u5: { id: 'u5', name: 'Rohan Mehta', email: 'rohan@opsdesk.dev' },
      u6: { id: 'u6', name: 'Ananya Rao', email: 'ananya@opsdesk.dev' },
};

const ME = USERS.u1;

const TEAMS = [
      { id: 't1', name: 'Platform', role: 'Lead' },
      { id: 't2', name: 'Payments', role: 'Member' },
      { id: 't3', name: 'Compliance', role: 'Viewer' },
];

const mem = (teamId, list) =>
      list.map(([userId, role]) => ({ id: `${teamId}-${userId}`, userId, role, user: USERS[userId] }));

const MEMBERS = {
      t1: mem('t1', [['u1', 'Lead'], ['u2', 'Member'], ['u3', 'Member'], ['u4', 'Admin'], ['u5', 'Viewer']]),
      t2: mem('t2', [['u1', 'Member'], ['u4', 'Lead'], ['u5', 'Member'], ['u6', 'Admin']]),
      t3: mem('t3', [['u1', 'Viewer'], ['u6', 'Lead'], ['u3', 'Member']]),
};

// [teamId, title, description, type, priority, status, assigneeId, createdById, hoursAgo]
const SEED = [
      ['t1', 'API gateway returning 502 intermittently', 'Spikes between 2-4 AM IST on /v1/orders.', 'Incident', 'Urgent', 'Open', null, 'u2', 3],
      ['t1', 'Rotate production JWT secret', 'Quarterly rotation, needs coordination with auth team.', 'Task', 'High', 'AwaitingApproval', 'u2', 'u3', 20],
      ['t1', 'Postgres connection pool exhausted', 'Pool maxes out during report generation.', 'Incident', 'Urgent', 'InProgress', 'u1', 'u4', 30],
      ['t1', 'Add index on work_items(team_id, status)', 'List queries slow past 50k rows.', 'Task', 'Medium', 'Open', 'u3', 'u1', 50],
      ['t1', 'Customer cannot reset password', 'Reset email never arrives for a corporate domain.', 'CustomerIssue', 'High', 'Open', null, 'u5', 5],
      ['t1', 'Outbox worker retries stuck jobs', 'Jobs stay PROCESSING after crash.', 'Incident', 'Urgent', 'Open', null, 'u3', 8],
      ['t1', 'Upgrade Node runtime to LTS', 'Move staging first, then production.', 'Task', 'Low', 'Resolved', 'u2', 'u1', 120],
      ['t1', 'Audit log export request', 'Finance asked for last quarter activity export.', 'Compliance', 'Medium', 'AwaitingApproval', 'u3', 'u4', 26],
      ['t1', 'Dashboard slow on first load', 'Initial render takes over 4 seconds.', 'CustomerIssue', 'Medium', 'InProgress', 'u1', 'u5', 40],
      ['t1', 'Deprecate v0 webhooks', 'Notify integrators and remove endpoints.', 'Task', 'Low', 'Closed', 'u4', 'u4', 300],
      ['t1', 'Rate limit login endpoint', 'Brute force attempts seen in logs.', 'Task', 'High', 'InProgress', 'u1', 'u2', 12],
      ['t1', 'Fix timezone bug in due dates', 'Dates shift by one day for UTC-8 users.', 'CustomerIssue', 'Medium', 'Resolved', 'u3', 'u5', 90],
      ['t1', 'Cache team lookups in middleware', 'Avoid a membership query on every request.', 'Task', 'Medium', 'Open', 'u1', 'u2', 150],
      ['t1', 'Staging database out of disk', 'Needs cleanup of old migration snapshots.', 'Incident', 'High', 'Resolved', 'u4', 'u3', 210],
      ['t2', 'Duplicate charge on retried payment', 'Customer charged twice after gateway timeout.', 'Payment', 'Urgent', 'InProgress', 'u1', 'u4', 6],
      ['t2', 'Refund stuck in pending for 5 days', 'Refund ref RF-20931 not settled.', 'Payment', 'High', 'Open', null, 'u5', 14],
      ['t2', 'Chargeback dispute: order #88412', 'Evidence due in 3 days.', 'Payment', 'Urgent', 'AwaitingApproval', 'u5', 'u6', 10],
      ['t2', 'Reconcile settlement report', 'Mismatch of 1,240 INR in weekly settlement.', 'Task', 'Medium', 'Open', 'u1', 'u4', 70],
      ['t2', 'Add UPI autopay support', 'Scope and estimate for next quarter.', 'Task', 'Low', 'Open', null, 'u6', 200],
      ['t2', 'Payment webhook signature failing', 'HMAC mismatch for one provider.', 'Incident', 'Urgent', 'Open', null, 'u1', 2],
      ['t2', 'Invoice PDF shows wrong GST', 'GST rate applied incorrectly for Karnataka.', 'CustomerIssue', 'High', 'Resolved', 'u4', 'u5', 100],
      ['t3', 'GDPR data deletion request', 'User requested full account erasure.', 'Compliance', 'High', 'InProgress', 'u3', 'u6', 36],
      ['t3', 'Annual security policy review', 'Update access control section.', 'Compliance', 'Medium', 'Open', 'u6', 'u6', 160],
      ['t3', 'Vendor risk assessment: analytics provider', 'Questionnaire pending from vendor.', 'Compliance', 'Medium', 'AwaitingApproval', 'u3', 'u6', 48],
      ['t3', 'Retention policy for activity logs', 'Define 24 month retention window.', 'Compliance', 'Urgent', 'Open', null, 'u3', 4],
      ['t3', 'SOC 2 evidence collection', 'Collect Q3 access review screenshots.', 'Task', 'Low', 'Closed', 'u6', 'u6', 400],
];

const buildItems = () =>
      SEED.map(([teamId, title, description, type, priority, status, assigneeId, createdById, h], i) => ({
            id: `wi-${i + 1}`,
            teamId,
            title,
            description,
            type,
            priority,
            status,
            assigneeId,
            createdById,
            version: 1,
            createdAt: hoursAgo(h),
      }));

const buildActivities = (items) => {
      const map = {};
      items.forEach((it, i) => {
            const list = [{ id: `${it.id}-a1`, actorId: it.createdById, actionType: 'CREATED', newValue: it.title, createdAt: it.createdAt }];
            if (it.assigneeId) {
                  list.unshift({
                        id: `${it.id}-a2`,
                        actorId: it.createdById,
                        actionType: 'UPDATED',
                        newValue: `Assigned to ${USERS[it.assigneeId].name}`,
                        createdAt: hoursAgo(Math.max(1, i % 5)),
                  });
            }
            if (['InProgress', 'AwaitingApproval', 'Resolved', 'Closed'].includes(it.status)) {
                  list.unshift({
                        id: `${it.id}-a3`,
                        actorId: it.assigneeId || it.createdById,
                        actionType: 'UPDATED',
                        newValue: `Status changed to ${it.status}`,
                        createdAt: hoursAgo(Math.max(1, i % 3)),
                  });
            }
            map[it.id] = list;
      });
      return map;
};

/* -------------------------------------------------------------------------- */
/*  Constants / helpers                                                       */
/* -------------------------------------------------------------------------- */

const PAGE_SIZE = 8;
const DAY = 24 * 3600 * 1000;
const WRITE_ROLES = ['Member', 'Lead', 'Admin'];
const APPROVER_ROLES = ['Lead', 'Admin'];

const STATUSES = ['Open', 'InProgress', 'AwaitingApproval', 'Resolved', 'Closed'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const TYPES = ['Incident', 'CustomerIssue', 'Payment', 'Compliance', 'Task'];

const STATUS_META = {
      Open: { label: 'Open', short: 'Open', badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' },
      InProgress: { label: 'In Progress', short: 'In Progress', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
      AwaitingApproval: { label: 'Awaiting Approval', short: 'Approval', badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20' },
      Resolved: { label: 'Resolved', short: 'Resolved', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
      Closed: { label: 'Closed', short: 'Closed', badge: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20' },
};

const PRIORITY_META = {
      Low: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
      Medium: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      High: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
      Urgent: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
};

const VIEWS = [
      { value: 'all', label: 'All items' },
      { value: 'mine', label: 'Assigned to me' },
      { value: 'urgent', label: 'Unassigned urgent' },
      { value: 'approval', label: 'Awaiting approval' },
];

// shared card look from the reference: 1px border, no ring, 24px padding added per-card
const CARD = 'gap-0 rounded-xl border border-border bg-card py-0 shadow-none ring-0';

const humanize = (s = '') => s.replace(/([a-z])([A-Z])/g, '$1 $2');

const initials = (name, email) =>
      (name || email || '?')
            .split(/[\s@.]+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((p) => p[0].toUpperCase())
            .join('');

const fmtDate = (d) =>
      new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const timeAgo = (d) => {
      const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
      if (s < 60) return 'just now';
      const m = Math.floor(s / 60);
      if (m < 60) return `${m}m ago`;
      const h = Math.floor(m / 60);
      if (h < 24) return `${h}h ago`;
      const days = Math.floor(h / 24);
      return days < 7 ? `${days}d ago` : fmtDate(d);
};

const isActive = (item) => !['Resolved', 'Closed'].includes(item.status);
const isUnassignedUrgent = (item) => item.priority === 'Urgent' && !item.assigneeId && isActive(item);
const pctOf = (n, total) => (total ? Math.round((n / total) * 100) : 0);

const describeActivity = (a) => {
      switch (a.actionType) {
            case 'CREATED':
                  return `created "${a.newValue ?? 'this item'}"`;
            case 'UPDATED':
                  return a.newValue || 'updated this item';
            default: {
                  const base = a.actionType.toLowerCase().replace(/_/g, ' ');
                  if (a.oldValue && a.newValue) return `${base}: ${a.oldValue} → ${a.newValue}`;
                  return a.newValue ? `${base}: ${a.newValue}` : base;
            }
      }
};

/* -------------------------------------------------------------------------- */
/*  Small presentational pieces                                               */
/* -------------------------------------------------------------------------- */

function UserAvatar({ name, email, className }) {
      return (
            <Avatar className={cn('size-8', className)}>
                  <AvatarFallback className="bg-muted text-[11px] font-medium text-foreground">
                        {initials(name, email)}
                  </AvatarFallback>
            </Avatar>
      );
}

function StatusBadge({ status }) {
      const meta = STATUS_META[status];
      return (
            <Badge variant="outline" className={cn('font-medium whitespace-nowrap', meta?.badge)}>
                  {meta?.label ?? humanize(status)}
            </Badge>
      );
}

function PriorityBadge({ priority }) {
      return (
            <Badge variant="outline" className={cn('font-medium', PRIORITY_META[priority])}>
                  {priority}
            </Badge>
      );
}

// the small +18% / -5% pill from the reference
function Chip({ tone = 'up', children, title }) {
      return (
            <span
                  title={title}
                  className={cn(
                        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                        tone === 'up'
                              ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400'
                              : 'bg-red-500/15 text-red-600 dark:text-red-500'
                  )}
            >
                  {children}
            </span>
      );
}

function IconCircle({ icon: Icon, className }) {
      return (
            <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-full border border-border', className)}>
                  <Icon className="size-5" />
            </span>
      );
}

/* ---- decorative hero art (stand-in for the reference illustration) ---- */
function HeroIllustration({ className }) {
      return (
            <svg viewBox="0 0 240 200" fill="none" className={className} aria-hidden="true">
                  {/* desk */}
                  <rect x="6" y="118" width="228" height="6" rx="1" fill="#8f2f28" />
                  <path d="M26 124 L18 200 M62 124 L70 200 M196 124 L204 200" stroke="currentColor" strokeOpacity=".35" strokeWidth="2" />
                  {/* chair */}
                  <path d="M104 160 V200" stroke="currentColor" strokeOpacity=".35" strokeWidth="3" />
                  <rect x="80" y="152" width="48" height="8" rx="3" fill="#b3342b" />
                  {/* legs */}
                  <path d="M92 126 C90 150 92 170 94 190 M116 126 C120 150 118 170 116 190" stroke="#15120f" strokeWidth="13" strokeLinecap="round" />
                  {/* torso */}
                  <path d="M68 124 C62 96 72 70 98 64 L118 68 C134 76 140 100 136 124 Z" fill="#0f9e8e" />
                  {/* arm */}
                  <path d="M112 76 C130 84 144 98 152 110" stroke="#0f9e8e" strokeWidth="13" strokeLinecap="round" />
                  <circle cx="155" cy="112" r="5" fill="#f2c9a5" />
                  {/* laptop */}
                  <path d="M150 112 L158 82 L204 80 L206 112 Z" fill="#1d1a17" stroke="currentColor" strokeOpacity=".3" />
                  <rect x="140" y="112" width="76" height="6" rx="2" fill="#2a2623" />
                  <circle cx="182" cy="97" r="2.5" fill="#efe6e4" />
                  {/* head */}
                  <circle cx="98" cy="42" r="17" fill="#f2c9a5" />
                  <path d="M81 40 C80 24 96 18 108 24 C117 29 118 38 116 44 C109 35 94 32 81 40 Z" fill="#f0602a" />
                  <circle cx="92" cy="45" r="5" stroke="#15120f" strokeWidth="1.6" />
                  <circle cx="106" cy="45" r="5" stroke="#15120f" strokeWidth="1.6" />
                  <path d="M97 45 H101" stroke="#15120f" strokeWidth="1.6" />
            </svg>
      );
}

/* ---- Revenue-style floating bar chart: above axis = team, below = mine ---- */
function StatusBarChart({ data }) {
      const max = Math.max(1, ...data.flatMap((d) => [d.team, d.mine]));
      const step = Math.max(1, Math.ceil(max / 3));
      const top = step * 3;
      const ticks = [3, 2, 1, 0, -1, -2, -3].map((n) => n * step);

      return (
            <div className="flex gap-3">
                  <div className="relative my-2 h-[300px] w-7 shrink-0 text-xs text-muted-foreground">
                        {ticks.map((t, i) => (
                              <span
                                    key={t}
                                    className="absolute right-0 -translate-y-1/2 leading-none"
                                    style={{ top: `${(i / 6) * 100}%` }}
                              >
                                    {t}
                              </span>
                        ))}
                  </div>

                  <div className="min-w-0 flex-1">
                        <div className="relative my-2 h-[300px]">
                              {ticks.map((t, i) => (
                                    <div
                                          key={t}
                                          className="absolute inset-x-0 border-t border-border/60"
                                          style={{ top: `${(i / 6) * 100}%` }}
                                    />
                              ))}

                              <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)` }}>
                                    {data.map((d) => (
                                          <div key={d.key} className="relative" title={`${d.label}: ${d.team} team, ${d.mine} mine`}>
                                                <span
                                                      className="absolute bottom-1/2 left-1/2 w-2.5 -translate-x-1/2 rounded-full bg-foreground/20"
                                                      style={{ height: `${(d.team / top) * 50}%` }}
                                                />
                                                <span
                                                      className="absolute top-1/2 left-1/2 w-2.5 -translate-x-1/2 rounded-full bg-primary"
                                                      style={{ height: `${(d.mine / top) * 50}%` }}
                                                />
                                          </div>
                                    ))}
                              </div>
                        </div>

                        <div className="mt-1 grid text-center text-xs text-muted-foreground" style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)` }}>
                              {data.map((d) => <span key={d.key}>{d.label}</span>)}
                        </div>
                  </div>
            </div>
      );
}

/* ---- Monthly-earnings-style area chart ---- */
function AreaChart({ values }) {
      const max = Math.max(1, ...values);
      const pts = values.map((v, i) => [(i / (values.length - 1)) * 300, 92 - (v / max) * 80]);
      const line = pts.reduce((d, [x, y], i) => {
            if (i === 0) return `M${x},${y}`;
            const [px, py] = pts[i - 1];
            const cx = (px + x) / 2;
            return `${d} C${cx},${py} ${cx},${y} ${x},${y}`;
      }, '');

      return (
            <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="h-24 w-full" aria-hidden="true">
                  <defs>
                        <linearGradient id="opsAreaFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
                              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                        </linearGradient>
                  </defs>
                  <path d={`${line} L300,100 L0,100 Z`} fill="url(#opsAreaFill)" className="text-foreground" />
                  <path d={line} fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.5" vectorEffect="non-scaling-stroke" className="text-foreground" />
            </svg>
      );
}

/* ---- Yearly-backup-style donut ---- */
function Donut({ segments }) {
      const R = 42;
      const C = 2 * Math.PI * R;
      const total = segments.reduce((a, s) => a + s.value, 0);
      let offset = 0;

      return (
            <svg viewBox="0 0 100 100" className="size-28 shrink-0 -rotate-90" aria-hidden="true">
                  <circle cx="50" cy="50" r={R} fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="13" className="text-foreground" />
                  {total > 0 &&
                        segments.map((s) => {
                              if (!s.value) return null;
                              const len = (s.value / total) * C;
                              const dash = Math.max(len - 1.5, 0);
                              const el = (
                                    <circle
                                          key={s.label}
                                          cx="50"
                                          cy="50"
                                          r={R}
                                          fill="none"
                                          stroke={s.color}
                                          strokeWidth="13"
                                          strokeDasharray={`${dash} ${C - dash}`}
                                          strokeDashoffset={-offset}
                                    />
                              );
                              offset += len;
                              return el;
                        })}
            </svg>
      );
}

/* -------------------------------------------------------------------------- */
/*  Sidebar                                                                   */
/* -------------------------------------------------------------------------- */

function NavLabel({ children }) {
      return <p className="mt-6 mb-3 px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase first:mt-4">{children}</p>;
}

function NavItem({ icon: Icon, active, onClick, trailing, children }) {
      return (
            <button
                  type="button"
                  onClick={onClick}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                        'flex h-10 w-full cursor-pointer items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors',
                        active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-accent'
                  )}
            >
                  <Icon className="size-[18px] shrink-0" />
                  <span className="flex-1 truncate text-left">{children}</span>
                  {trailing}
            </button>
      );
}

function SidebarContent({ teams, activeTeamId, onSelectTeam, view, onSelectView, user, onNavigate }) {
      const pickView = (v) => {
            onSelectView(v);
            onNavigate?.();
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
                        <NavLabel>Dashboard</NavLabel>
                        <div className="space-y-1">
                              <NavItem icon={LayoutDashboard} active={view === 'all'} onClick={() => pickView('all')}>Overview</NavItem>
                              <NavItem icon={UserCheck} active={view === 'mine'} onClick={() => pickView('mine')}>Assigned to me</NavItem>
                              <NavItem icon={TriangleAlert} active={view === 'urgent'} onClick={() => pickView('urgent')}>Unassigned urgent</NavItem>
                              <NavItem icon={ShieldCheck} active={view === 'approval'} onClick={() => pickView('approval')}>Awaiting approval</NavItem>
                        </div>

                        <NavLabel>Teams</NavLabel>
                        <div className="space-y-1">
                              {teams.map((t) => (
                                    <button
                                          key={t.id}
                                          type="button"
                                          onClick={() => {
                                                onSelectTeam(t.id);
                                                onNavigate?.();
                                          }}
                                          aria-pressed={t.id === activeTeamId}
                                          className={cn(
                                                'flex h-10 w-full cursor-pointer items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent',
                                                t.id === activeTeamId ? 'bg-accent text-foreground' : 'text-sidebar-foreground'
                                          )}
                                    >
                                          <Users className="size-[18px] shrink-0" />
                                          <span className="flex-1 truncate text-left">{t.name}</span>
                                          <span className="text-xs font-normal text-muted-foreground">{t.role}</span>
                                    </button>
                              ))}
                        </div>
                  </nav>

                  {/* bottom card (same slot as "Grab Pro Now") */}
                  <div className="p-4">
                        <div className="flex flex-col items-center rounded-xl bg-muted/50 px-4 py-6 text-center">
                              <UserAvatar name={user.name} email={user.email} className="size-14 text-base [&_span]:text-base" />
                              <p className="mt-4 text-base font-semibold">{user.name}</p>
                              <p className="mt-0.5 max-w-full truncate text-sm text-muted-foreground">{user.email}</p>
                              <Button className="mt-4 h-9 cursor-pointer px-5">
                                    <LogOut className="size-4" />
                                    Sign out
                              </Button>
                        </div>
                  </div>
            </div>
      );
}

/* -------------------------------------------------------------------------- */
/*  Create dialog                                                             */
/* -------------------------------------------------------------------------- */

function CreateItemDialog({ members, onClose, onCreate }) {
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

/* -------------------------------------------------------------------------- */
/*  Edit dialog                                                               */
/* -------------------------------------------------------------------------- */

function EditItemDialog({ item, members, meId, canWrite, onClose, onSave }) {
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

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function DashBoard() {
      const [collapsed, setCollapsed] = useState(false); // desktop sidebar
      const [mobileOpen, setMobileOpen] = useState(false); // mobile drawer
      const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
      const tableRef = useRef(null);

      const [allItems, setAllItems] = useState(buildItems);
      const [allActivities, setAllActivities] = useState(() => buildActivities(buildItems()));

      const [activeTeamId, setActiveTeamId] = useState(TEAMS[0].id);

      // table filters
      const [search, setSearch] = useState('');
      const [view, setView] = useState('all');
      const [statusFilter, setStatusFilter] = useState('all');
      const [priorityFilter, setPriorityFilter] = useState('all');

      // chart filter (the "Year 2026" dropdown slot in the reference)
      const [chartPriority, setChartPriority] = useState('all');

      // page resets to 1 whenever the filter combination changes
      const queryKey = [activeTeamId, view, statusFilter, priorityFilter, search].join('|');
      const [pageState, setPageState] = useState({ key: '', page: 1 });
      const requestedPage = pageState.key === queryKey ? pageState.page : 1;
      const setPage = (p) => setPageState({ key: queryKey, page: p });

      const [selectedId, setSelectedId] = useState(null);
      const [createOpen, setCreateOpen] = useState(false);
      const [editItem, setEditItem] = useState(null);

      const activeTeam = TEAMS.find((t) => t.id === activeTeamId);
      const role = activeTeam.role;
      const canWrite = WRITE_ROLES.includes(role);
      const isApprover = APPROVER_ROLES.includes(role);
      const members = MEMBERS[activeTeamId] ?? [];

      /* ---- derived data ---- */
      const teamItems = useMemo(() => allItems.filter((i) => i.teamId === activeTeamId), [allItems, activeTeamId]);

      const stats = useMemo(() => {
            const total = teamItems.length;
            const awaiting = teamItems.filter((i) => i.status === 'AwaitingApproval').length;
            return {
                  total,
                  active: teamItems.filter(isActive).length,
                  mine: teamItems.filter((i) => i.assigneeId === ME.id).length,
                  urgentUnassigned: teamItems.filter(isUnassignedUrgent).length,
                  awaiting,
            };
      }, [teamItems]);

      // bar chart (Revenue Updates slot)
      const chart = useMemo(() => {
            const rows = teamItems.filter((i) => chartPriority === 'all' || i.priority === chartPriority);
            return {
                  data: STATUSES.map((s) => ({
                        key: s,
                        label: STATUS_META[s].short,
                        team: rows.filter((i) => i.status === s).length,
                        mine: rows.filter((i) => i.status === s && i.assigneeId === ME.id).length,
                  })),
                  active: rows.filter(isActive).length,
                  team: rows.length,
                  mine: rows.filter((i) => i.assigneeId === ME.id).length,
            };
      }, [teamItems, chartPriority]);

      // new items per day (Monthly earnings slot)
      const newItems = useMemo(() => {
            const now = Date.now();
            const t = (i) => new Date(i.createdAt).getTime();
            const series = Array.from({ length: 7 }, (_, d) => {
                  const start = now - (7 - d) * DAY;
                  return teamItems.filter((i) => t(i) >= start && t(i) < start + DAY).length;
            });
            const thisWeek = series.reduce((a, b) => a + b, 0);
            const prevWeek = teamItems.filter((i) => t(i) >= now - 14 * DAY && t(i) < now - 7 * DAY).length;
            const delta = prevWeek ? Math.round(((thisWeek - prevWeek) / prevWeek) * 100) : thisWeek ? 100 : 0;
            return { series, thisWeek, delta };
      }, [teamItems]);

      // workload donut (Yearly Backup slot)
      const workload = useMemo(() => {
            const act = teamItems.filter(isActive);
            const mine = act.filter((i) => i.assigneeId === ME.id).length;
            const unassigned = act.filter((i) => !i.assigneeId).length;
            const others = act.length - mine - unassigned;
            return { mine, others, unassigned, assigned: mine + others, total: act.length };
      }, [teamItems]);

      // table
      const filtered = useMemo(() => {
            const q = search.trim().toLowerCase();
            return teamItems
                  .filter((i) => {
                        if (view === 'mine' && i.assigneeId !== ME.id) return false;
                        if (view === 'urgent' && !isUnassignedUrgent(i)) return false;
                        if (view === 'approval' && i.status !== 'AwaitingApproval') return false;
                        if (statusFilter !== 'all' && i.status !== statusFilter) return false;
                        if (priorityFilter !== 'all' && i.priority !== priorityFilter) return false;
                        if (q && !`${i.title} ${i.description}`.toLowerCase().includes(q)) return false;
                        return true;
                  })
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }, [teamItems, view, statusFilter, priorityFilter, search]);

      const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
      const page = Math.min(requestedPage, totalPages);
      const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

      const selected = filtered.find((i) => i.id === selectedId) ?? items[0] ?? null;
      const activities = selected ? (allActivities[selected.id] ?? []).slice(0, 7) : [];

      /* ---- local "mutations" ---- */
      const pushActivity = (itemId, actorId, actionType, newValue) =>
            setAllActivities((prev) => ({
                  ...prev,
                  [itemId]: [
                        { id: `${itemId}-${Date.now()}-${newValue}`, actorId, actionType, newValue, createdAt: new Date().toISOString() },
                        ...(prev[itemId] ?? []),
                  ],
            }));

      const createItem = (data) => {
            const id = `wi-${Date.now()}`;
            const item = {
                  id,
                  teamId: activeTeamId,
                  ...data,
                  status: 'Open',
                  createdById: ME.id,
                  version: 1,
                  createdAt: new Date().toISOString(),
            };
            setAllItems((prev) => [item, ...prev]);
            setAllActivities((prev) => ({
                  ...prev,
                  [id]: [{ id: `${id}-a1`, actorId: ME.id, actionType: 'CREATED', newValue: item.title, createdAt: item.createdAt }],
            }));
            setView('all');
            setSelectedId(id);
      };

      const saveItem = (id, form) => {
            const current = allItems.find((i) => i.id === id);
            if (!current) return;
            if (form.status !== current.status) pushActivity(id, ME.id, 'UPDATED', `Status changed to ${form.status}`);
            if (form.priority !== current.priority) pushActivity(id, ME.id, 'UPDATED', `Priority changed to ${form.priority}`);
            if (form.assigneeId !== current.assigneeId && form.assigneeId)
                  pushActivity(id, ME.id, 'UPDATED', `Assigned to ${USERS[form.assigneeId].name}`);
            setAllItems((prev) =>
                  prev.map((i) =>
                        i.id === id
                              ? { ...i, status: form.status, priority: form.priority, assigneeId: form.assigneeId, version: i.version + 1 }
                              : i
                  )
            );
      };

      /* ---- ui helpers ---- */
      const goTo = (v) => {
            setView(v);
            tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };

      const selectTeam = (id) => {
            setActiveTeamId(id);
            setView('all');
            setStatusFilter('all');
            setPriorityFilter('all');
            setChartPriority('all');
            setSearch('');
            setSelectedId(null);
      };

      const toggleSidebar = () => {
            if (window.innerWidth >= 1024) setCollapsed((c) => !c);
            else setMobileOpen(true);
      };

      const toggleTheme = () => {
            const next = !dark;
            document.documentElement.classList.toggle('dark', next);
            setDark(next);
      };

      const sidebarProps = {
            teams: TEAMS,
            activeTeamId,
            onSelectTeam: selectTeam,
            view,
            onSelectView: goTo,
            user: ME,
      };

      /* ---------------------------------------------------------------------- */

      return (
            <div className="min-h-screen bg-background text-foreground">
                  {/* Desktop sidebar */}
                  <aside
                        className={cn(
                              'fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-sidebar-border bg-sidebar',
                              !collapsed && 'lg:block'
                        )}
                  >
                        <SidebarContent {...sidebarProps} />
                  </aside>

                  {/* Mobile drawer */}
                  {mobileOpen && (
                        <div className="fixed inset-0 z-50 lg:hidden">
                              <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
                              <aside className="absolute inset-y-0 left-0 w-64 border-r border-sidebar-border bg-sidebar">
                                    <Button variant="ghost" size="icon" className="absolute top-3 right-2 cursor-pointer" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                                          <X className="size-4" />
                                    </Button>
                                    <SidebarContent {...sidebarProps} onNavigate={() => setMobileOpen(false)} />
                              </aside>
                        </div>
                  )}

                  <div className={cn(!collapsed && 'lg:pl-64')}>
                        {/* Header */}
                        <header className="sticky top-0 z-30 flex h-[68px] items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
                              <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle sidebar" className="cursor-pointer">
                                    <PanelLeft className="size-[18px]" />
                              </Button>
                              <span className="hidden h-5 w-px bg-border sm:block" />

                              <div className="relative w-full max-w-80">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                          value={search}
                                          onChange={(e) => setSearch(e.target.value)}
                                          placeholder="Search..."
                                          className="h-10 rounded-md pl-9"
                                    />
                              </div>

                              <div className="ml-auto flex items-center gap-1.5">
                                    {canWrite && (
                                          <Button onClick={() => setCreateOpen(true)} className="mr-1 cursor-pointer">
                                                <Plus className="size-4" />
                                                <span className="hidden sm:inline">New item</span>
                                          </Button>
                                    )}
                                    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="cursor-pointer">
                                          {dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => goTo('urgent')} aria-label="Unassigned urgent items" className="relative cursor-pointer">
                                          <Bell className="size-[18px]" />
                                          {stats.urgentUnassigned > 0 && (
                                                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500" />
                                          )}
                                    </Button>
                                    <UserAvatar name={ME.name} email={ME.email} className="ml-1 size-9" />
                              </div>
                        </header>

                        <main className="space-y-6 p-4">
                              {/* ROW 1 ------------------------------------------------------ */}
                              <section className="grid gap-6 lg:grid-cols-4">
                                    {/* Analytics Dashboard card */}
                                    <Card className={cn(CARD, 'relative min-h-[170px] overflow-hidden lg:col-span-2')}>
                                          <CardContent className="relative z-10 flex h-full flex-col justify-between gap-6 p-6">
                                                <div>
                                                      <h2 className="text-lg font-medium">Operations Dashboard</h2>
                                                      <p className="mt-1 text-sm text-muted-foreground">What needs attention in {activeTeam.name}</p>
                                                </div>

                                                <div className="flex items-end gap-6">
                                                      <button type="button" onClick={() => goTo('mine')} className="cursor-pointer text-left">
                                                            <p className="text-sm text-muted-foreground">Assigned to me</p>
                                                            <div className="mt-1 flex items-center gap-2">
                                                                  <span className="text-2xl font-semibold tracking-tight">{stats.mine}</span>
                                                                  <Chip title="Share of team items">{pctOf(stats.mine, stats.total)}%</Chip>
                                                            </div>
                                                      </button>

                                                      <span className="h-12 w-px bg-border" />

                                                      <button type="button" onClick={() => goTo('urgent')} className="cursor-pointer text-left">
                                                            <p className="text-sm text-muted-foreground">Unassigned urgent</p>
                                                            <div className="mt-1 flex items-center gap-2">
                                                                  <span className="text-2xl font-semibold tracking-tight">{stats.urgentUnassigned}</span>
                                                                  {stats.urgentUnassigned > 0 ? <Chip tone="down">Action</Chip> : <Chip>Clear</Chip>}
                                                            </div>
                                                      </button>
                                                </div>
                                          </CardContent>
                                          <HeroIllustration className="pointer-events-none absolute right-4 bottom-0 hidden h-[170px] text-foreground md:block" />
                                    </Card>

                                    {/* Weekly Sales card -> Awaiting my approval */}
                                    <Card className={CARD}>
                                          <CardContent className="flex h-full items-start justify-between gap-3 p-6">
                                                <div>
                                                      <h2 className="text-lg font-medium">Awaiting my approval</h2>
                                                      <div className="mt-2 flex items-center gap-2">
                                                            <span className="text-2xl font-semibold tracking-tight">{isApprover ? stats.awaiting : 0}</span>
                                                            {isApprover ? (
                                                                  <Chip title="Share of team items">{pctOf(stats.awaiting, stats.total)}%</Chip>
                                                            ) : (
                                                                  <Chip tone="down">Lead only</Chip>
                                                            )}
                                                      </div>
                                                      <Button variant="outline" onClick={() => goTo('approval')} className="mt-4 h-10 cursor-pointer px-3">
                                                            View queue <ArrowRight className="size-4" />
                                                      </Button>
                                                </div>
                                                <IconCircle icon={ShieldCheck} />
                                          </CardContent>
                                    </Card>

                                    {/* Purchase Orders card -> Total work items */}
                                    <Card className={CARD}>
                                          <CardContent className="flex h-full items-start justify-between gap-3 p-6">
                                                <div>
                                                      <h2 className="text-lg font-medium">Total work items</h2>
                                                      <div className="mt-2 flex items-center gap-2">
                                                            <span className="text-2xl font-semibold tracking-tight">{stats.total}</span>
                                                            <Chip title="Items not yet resolved or closed">{stats.active} active</Chip>
                                                      </div>
                                                      <Button variant="outline" onClick={() => goTo('all')} className="mt-4 h-10 cursor-pointer px-3">
                                                            View all <ArrowRight className="size-4" />
                                                      </Button>
                                                </div>
                                                <IconCircle icon={Layers} />
                                          </CardContent>
                                    </Card>
                              </section>

                              {/* ROW 2 ------------------------------------------------------ */}
                              <section className="grid gap-6 lg:grid-cols-3">
                                    {/* Revenue Updates -> Status Overview */}
                                    <Card className={cn(CARD, 'lg:col-span-2')}>
                                          <CardContent className="p-6">
                                                <div className="flex items-start justify-between gap-4">
                                                      <div>
                                                            <h2 className="text-lg font-medium">Status Overview</h2>
                                                            <p className="mt-1 text-sm text-muted-foreground">Team workload by workflow stage</p>
                                                      </div>
                                                      <Select value={chartPriority} onValueChange={setChartPriority}>
                                                            <SelectTrigger className="h-10 w-[150px]"><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                  <SelectItem value="all">All priorities</SelectItem>
                                                                  {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                                            </SelectContent>
                                                      </Select>
                                                </div>

                                                <div className="mt-6 grid gap-8 md:grid-cols-[1fr_260px]">
                                                      <StatusBarChart data={chart.data} />

                                                      <div className="flex flex-col">
                                                            <div className="flex items-center gap-3">
                                                                  <span className="flex size-11 items-center justify-center rounded-lg border border-border">
                                                                        <Grip className="size-5" />
                                                                  </span>
                                                                  <div>
                                                                        <p className="text-2xl font-semibold tracking-tight">{chart.active}</p>
                                                                        <p className="text-sm text-muted-foreground">Active items</p>
                                                                  </div>
                                                            </div>

                                                            <div className="mt-10 space-y-8">
                                                                  <div className="flex items-start gap-3">
                                                                        <span className="mt-2 size-2 rounded-full bg-foreground/25" />
                                                                        <div>
                                                                              <p className="text-sm text-muted-foreground">Team items</p>
                                                                              <p className="mt-1 text-xl font-semibold">{chart.team}</p>
                                                                        </div>
                                                                  </div>
                                                                  <div className="flex items-start gap-3">
                                                                        <span className="mt-2 size-2 rounded-full bg-primary" />
                                                                        <div>
                                                                              <p className="text-sm text-muted-foreground">Assigned to me</p>
                                                                              <p className="mt-1 text-xl font-semibold">{chart.mine}</p>
                                                                        </div>
                                                                  </div>
                                                            </div>

                                                            <Button onClick={() => goTo('all')} className="mt-auto h-11 w-full cursor-pointer">
                                                                  View all items
                                                            </Button>
                                                      </div>
                                                </div>
                                          </CardContent>
                                    </Card>

                                    <div className="flex flex-col gap-6">
                                          {/* Monthly earnings -> New items */}
                                          <Card className={CARD}>
                                                <CardContent className="p-6">
                                                      <div className="flex items-start justify-between">
                                                            <h2 className="text-lg font-medium">New items</h2>
                                                            <span className="flex size-10 items-center justify-center rounded-md border border-border">
                                                                  <CalendarDays className="size-[18px]" />
                                                            </span>
                                                      </div>
                                                      <p className="mt-5 text-2xl font-semibold tracking-tight">{newItems.thisWeek}</p>
                                                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Chip tone={newItems.delta >= 0 ? 'up' : 'down'}>
                                                                  {newItems.delta >= 0 ? '+' : ''}{newItems.delta}%
                                                            </Chip>
                                                            than last week
                                                      </div>
                                                      <div className="mt-4">
                                                            <AreaChart values={newItems.series} />
                                                      </div>
                                                </CardContent>
                                          </Card>

                                          {/* Yearly Backup -> Workload */}
                                          <Card className={CARD}>
                                                <CardContent className="flex items-center justify-between gap-4 p-6">
                                                      <div className="flex flex-col self-stretch">
                                                            <h2 className="text-lg font-medium">Workload</h2>
                                                            <p className="mt-4 text-2xl font-semibold tracking-tight">{workload.assigned}</p>
                                                            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                                                  <Chip>{pctOf(workload.assigned, workload.total)}%</Chip>
                                                                  assigned
                                                            </div>
                                                            <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-6 text-sm text-muted-foreground">
                                                                  <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-teal-600" />Mine</span>
                                                                  <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-orange-600" />Others</span>
                                                                  <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-primary" />Open</span>
                                                            </div>
                                                      </div>
                                                      <Donut
                                                            segments={[
                                                                  { label: 'Mine', value: workload.mine, color: '#0d9488' },
                                                                  { label: 'Others', value: workload.others, color: '#ea580c' },
                                                                  { label: 'Unassigned', value: workload.unassigned, color: 'var(--primary)' },
                                                            ]}
                                                      />
                                                </CardContent>
                                          </Card>
                                    </div>
                              </section>

                              {/* ROW 3 ------------------------------------------------------ */}
                              <section ref={tableRef} className="grid scroll-mt-24 gap-6 lg:grid-cols-3">
                                    {/* Recent Transactions -> Recent Activity */}
                                    <Card className={cn(CARD, 'lg:col-span-1')}>
                                          <CardHeader className="gap-1 px-6 pt-6 pb-0">
                                                <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
                                                <CardDescription className="truncate text-sm">
                                                      {selected ? selected.title : 'Select a work item'}
                                                </CardDescription>
                                          </CardHeader>
                                          <CardContent className="space-y-5 p-6">
                                                {activities.length === 0 && (
                                                      <p className="text-sm text-muted-foreground">
                                                            {selected ? 'No activity recorded yet.' : 'Pick an item from the table to see its history.'}
                                                      </p>
                                                )}
                                                {activities.map((a) => {
                                                      const actor = USERS[a.actorId];
                                                      return (
                                                            <div key={a.id} className="flex items-center gap-3">
                                                                  <UserAvatar name={actor?.name} email={actor?.email} className="size-10" />
                                                                  <div className="min-w-0 flex-1">
                                                                        <p className="truncate text-sm font-semibold">{actor?.name}</p>
                                                                        <p className="truncate text-xs text-muted-foreground">{describeActivity(a)}</p>
                                                                  </div>
                                                                  <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(a.createdAt)}</span>
                                                            </div>
                                                      );
                                                })}
                                                {selected && (
                                                      <Button className="h-11 w-full cursor-pointer" onClick={() => setEditItem(selected)}>
                                                            <Eye className="size-4" />
                                                            Open item
                                                      </Button>
                                                )}
                                          </CardContent>
                                    </Card>

                                    {/* Top Campaigns -> Work Items */}
                                    <Card className={cn(CARD, 'lg:col-span-2')}>
                                          <CardHeader className="gap-1 px-6 pt-6 pb-0">
                                                <CardTitle className="text-lg font-medium">Work Items</CardTitle>
                                                <CardDescription className="text-sm">
                                                      {filtered.length} item{filtered.length === 1 ? '' : 's'} in {activeTeam.name}
                                                </CardDescription>
                                          </CardHeader>

                                          <CardContent className="space-y-4 p-6">
                                                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                                                      <div className="overflow-x-auto">
                                                            <Tabs value={view} onValueChange={setView}>
                                                                  <TabsList>
                                                                        {VIEWS.map((v) => (
                                                                              <TabsTrigger key={v.value} value={v.value} className="cursor-pointer">{v.label}</TabsTrigger>
                                                                        ))}
                                                                  </TabsList>
                                                            </Tabs>
                                                      </div>

                                                      <div className="flex gap-2">
                                                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                                                  <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                                                                  <SelectContent>
                                                                        <SelectItem value="all">All statuses</SelectItem>
                                                                        {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>)}
                                                                  </SelectContent>
                                                            </Select>
                                                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
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
                                                                              onClick={() => setSelectedId(item.id)}
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
                                                                                                setSelectedId(item.id);
                                                                                                setEditItem(item);
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
                                                                  <Button variant="outline" size="sm" className="cursor-pointer" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                                                                        <ChevronLeft className="size-4" /> Prev
                                                                  </Button>
                                                                  <Button variant="outline" size="sm" className="cursor-pointer" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                                                                        Next <ChevronRight className="size-4" />
                                                                  </Button>
                                                            </div>
                                                      </div>
                                                )}
                                          </CardContent>
                                    </Card>
                              </section>

                              {/* ROW 4: Sales by Countries -> Team Members ------------------- */}
                              <section>
                                    <Card className={CARD}>
                                          <CardHeader className="gap-1 px-6 pt-6 pb-0">
                                                <CardTitle className="text-lg font-medium">Team Members</CardTitle>
                                                <CardDescription className="text-sm">{members.length} people in {activeTeam.name}</CardDescription>
                                          </CardHeader>
                                          <CardContent className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
                                                {members.map((m) => (
                                                      <div key={m.id} className="flex items-center gap-3 rounded-lg border border-border p-4">
                                                            <UserAvatar name={m.user.name} email={m.user.email} className="size-10" />
                                                            <div className="min-w-0 flex-1">
                                                                  <p className="truncate text-sm font-semibold">{m.user.name}</p>
                                                                  <p className="truncate text-xs text-muted-foreground">{m.user.email}</p>
                                                            </div>
                                                            <Chip tone={m.role === 'Viewer' ? 'down' : 'up'}>{m.role}</Chip>
                                                      </div>
                                                ))}
                                          </CardContent>
                                    </Card>
                              </section>
                        </main>
                  </div>

                  {createOpen && (
                        <CreateItemDialog members={members} onClose={() => setCreateOpen(false)} onCreate={createItem} />
                  )}

                  {editItem && (
                        <EditItemDialog
                              key={`${editItem.id}-${editItem.version}`}
                              item={allItems.find((i) => i.id === editItem.id) ?? editItem}
                              members={members}
                              meId={ME.id}
                              canWrite={canWrite}
                              onClose={() => setEditItem(null)}
                              onSave={saveItem}
                        />
                  )}
            </div>
      );
}