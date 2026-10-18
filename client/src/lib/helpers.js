export const humanize = (s = '') => s.replace(/([a-z])([A-Z])/g, '$1 $2');

export const initials = (name, email) =>
      (name || email || '?')
            .split(/[\s@.]+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((p) => p[0].toUpperCase())
            .join('');

export const fmtDate = (d) =>
      new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export const timeAgo = (d) => {
      const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
      if (s < 60) return 'just now';
      const m = Math.floor(s / 60);
      if (m < 60) return `${m}m ago`;
      const h = Math.floor(m / 60);
      if (h < 24) return `${h}h ago`;
      const days = Math.floor(h / 24);
      return days < 7 ? `${days}d ago` : fmtDate(d);
};

export const isActive = (item) => !['Resolved', 'Closed'].includes(item.status);
export const isUnassignedUrgent = (item) => item.priority === 'Urgent' && !item.assigneeId && isActive(item);
export const pctOf = (n, total) => (total ? Math.round((n / total) * 100) : 0);

export const describeActivity = (a) => {
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