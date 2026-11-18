import { useMemo, useState } from 'react';

/**
 * Custom hook to filter, search, and paginate the users directory list.
 * Supports live search, team filtering, status filtering, and page navigation.
 */
export default function useUsersDirectory({
      rawUsers = [],
      search = '',
      teamFilter = 'all',
      statusFilter = 'all',
      currentPage = 1,
      pageSize = 10,
}) {
      const filteredUsers = useMemo(() => {
            let list = [...rawUsers];

            // Filter by search query (name or email)
            const q = search.trim().toLowerCase();
            if (q) {
                  list = list.filter(
                        (u) =>
                              u.name?.toLowerCase().includes(q) ||
                              u.email?.toLowerCase().includes(q)
                  );
            }

            // Filter by team membership
            if (teamFilter !== 'all') {
                  list = list.filter((u) =>
                        (u.memberships || []).some(
                              (m) => m.teamId === teamFilter || m.team?.id === teamFilter
                        )
                  );
            }

            // Filter by activity/invite status
            if (statusFilter !== 'all') {
                  if (statusFilter === 'invited') {
                        list = list.filter((u) => u.status === 'invited');
                  } else if (statusFilter === 'active') {
                        list = list.filter((u) => u.status !== 'invited');
                  }
            }

            return list;
      }, [rawUsers, search, teamFilter, statusFilter]);

      const totalCount = filteredUsers.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
      const safePage = Math.min(Math.max(1, currentPage), totalPages);

      const displayedUsers = useMemo(() => {
            const start = (safePage - 1) * pageSize;
            return filteredUsers.slice(start, start + pageSize);
      }, [filteredUsers, safePage, pageSize]);

      const rangeText = useMemo(() => {
            if (totalCount === 0) return '0 users';
            const start = (safePage - 1) * pageSize + 1;
            const end = Math.min(safePage * pageSize, totalCount);
            return `${start}–${end} of ${totalCount}`;
      }, [safePage, pageSize, totalCount]);

      return {
            displayedUsers,
            totalCount,
            totalPages,
            page: safePage,
            rangeText,
      };
}
