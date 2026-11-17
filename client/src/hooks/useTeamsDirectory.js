import { useMemo } from 'react';

/**
 * Custom hook to filter, enrich, and paginate teams for the Teams Directory page.
 */
export default function useTeamsDirectory({
      rawTeams = [],
      userTeams = [],
      workItems = [],
      search = '',
      roleFilter = 'all',
      statusFilter = 'all',
      currentPage = 1,
      pageSize = 6,
}) {
      // Enrich teams with member role, status, and calculated work item count
      const enrichedTeams = useMemo(() => {
            const roleMap = new Map();
            userTeams.forEach((t) => {
                  const id = t.id || t._id;
                  const r = t.role || t.myRole;
                  if (id && r) roleMap.set(id, r);
            });

            return rawTeams.map((team) => {
                  const id = team.id || team._id;
                  const role = roleMap.get(id) || team.role || team.myRole || 'Viewer';
                  const its = workItems.filter((w) => w.teamId === id);
                  const membersCount = team.members?.length || team._count?.members || 8;

                  return {
                        ...team,
                        id,
                        role,
                        status: team.status || 'Active',
                        membersCount,
                        workItemsCount: its.length,
                  };
            });
      }, [rawTeams, userTeams, workItems]);

      // Apply search query, role filter, and status filter
      const filteredTeams = useMemo(() => {
            const q = search.trim().toLowerCase();
            return enrichedTeams.filter((team) => {
                  if (q && !`${team.name} ${team.description || ''}`.toLowerCase().includes(q)) {
                        return false;
                  }
                  if (roleFilter !== 'all' && team.role.toLowerCase() !== roleFilter.toLowerCase()) {
                        return false;
                  }
                  if (statusFilter !== 'all' && team.status.toLowerCase() !== statusFilter.toLowerCase()) {
                        return false;
                  }
                  return true;
            });
      }, [enrichedTeams, search, roleFilter, statusFilter]);

      const totalCount = filteredTeams.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
      const page = Math.min(currentPage, totalPages);

      // Paginated items
      const displayedTeams = useMemo(() => {
            const start = (page - 1) * pageSize;
            return filteredTeams.slice(start, start + pageSize);
      }, [filteredTeams, page, pageSize]);

      const startIdx = totalCount > 0 ? (page - 1) * pageSize + 1 : 0;
      const endIdx = Math.min(page * pageSize, totalCount);
      const rangeText = `${startIdx}-${endIdx} of ${totalCount}`;

      return {
            enrichedTeams,
            filteredTeams,
            displayedTeams,
            totalCount,
            totalPages,
            page,
            rangeText,
      };
}
