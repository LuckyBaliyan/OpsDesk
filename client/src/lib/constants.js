export const PAGE_SIZE = 8;
export const DAY = 24 * 3600 * 1000;
export const WRITE_ROLES = ['Member', 'Lead', 'Admin'];
export const APPROVER_ROLES = ['Lead', 'Admin'];

export const STATUSES = ['Open', 'InProgress', 'AwaitingApproval', 'Resolved', 'Closed'];
export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
export const TYPES = ['Incident', 'CustomerIssue', 'Payment', 'Compliance', 'Task'];

export const STATUS_META = {
      Open: { label: 'Open', short: 'Open', badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' },
      InProgress: { label: 'In Progress', short: 'In Progress', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
      AwaitingApproval: { label: 'Awaiting Approval', short: 'Approval', badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20' },
      Resolved: { label: 'Resolved', short: 'Resolved', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
      Closed: { label: 'Closed', short: 'Closed', badge: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20' },
};

export const PRIORITY_META = {
      Low: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
      Medium: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      High: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
      Urgent: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
};

export const VIEWS = [
      { value: 'all', label: 'All items' },
      { value: 'mine', label: 'Assigned to me' },
      { value: 'urgent', label: 'Unassigned urgent' },
      { value: 'approval', label: 'Awaiting approval' },
];

// shared card look from the reference: 1px border, no ring, 24px padding added per-card
export const CARD = 'gap-0 rounded-xl border border-border bg-card py-0 shadow-none ring-0';