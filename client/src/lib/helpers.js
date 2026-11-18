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

/**
 * Formats a timestamp into a clean month and year string (e.g., "Joined Jan 2023").
 */
export const fmtMonthYear = (d) => {
      if (!d) return 'Joined recently';
      try {
            return `Joined ${new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
      } catch {
            return 'Joined recently';
      }
};

/**
 * Returns deterministic dark-theme background and text colors for user avatars based on identifier.
 */
export const getAvatarColor = (str = '') => {
      const palette = [
            'bg-purple-950/60 text-purple-300 border-purple-500/30',
            'bg-cyan-950/60 text-cyan-300 border-cyan-500/30',
            'bg-amber-950/60 text-amber-300 border-amber-500/30',
            'bg-teal-950/60 text-teal-300 border-teal-500/30',
            'bg-indigo-950/60 text-indigo-300 border-indigo-500/30',
            'bg-emerald-950/60 text-emerald-300 border-emerald-500/30',
            'bg-rose-950/60 text-rose-300 border-rose-500/30',
            'bg-blue-950/60 text-blue-300 border-blue-500/30',
      ];
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return palette[Math.abs(hash) % palette.length];
};

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

export const isActive = (item) => {
      if (!item || !item.status) return false;
      const st = item.status.toLowerCase();
      return st !== 'resolved' && st !== 'closed';
};

export const isUnassignedUrgent = (item) => {
      if (!item) return false;
      const pr = (item.priority || '').toLowerCase();
      const isUrgentOrHigh = pr === 'urgent' || pr === 'high';
      const isUnassigned = !item.assigneeId && !item.assignee;
      return isUrgentOrHigh && isUnassigned && isActive(item);
};

export const pctOf = (n, total) => (total ? Math.round((n / total) * 100) : 0);

/**
 * Formats an activity event record into a readable human-friendly audit description.
 * Handles item creation, status progressions, reassignments, and generic updates.
 */
export const describeActivity = (a) => {
      if (!a) return 'Activity recorded';
      switch (a.actionType) {
            case 'CREATED':
                  return a.newValue
                        ? (a.newValue.toLowerCase().startsWith('created') ? a.newValue : `created "${a.newValue}"`)
                        : 'created this item';
            case 'UPDATED':
                  return a.newValue || 'updated this item';
            default: {
                  const base = (a.actionType || '').toLowerCase().replace(/_/g, ' ');
                  if (a.oldValue && a.newValue) return `${base}: ${a.oldValue} → ${a.newValue}`;
                  return a.newValue ? `${base}: ${a.newValue}` : base || 'Activity recorded';
            }
      }
};