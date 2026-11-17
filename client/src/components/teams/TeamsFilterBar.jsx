import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * Filter toolbar for the teams directory.
 * Provides search across team name and description, role filtering, status filtering, and clear action.
 */
export default function TeamsFilterBar({
      search = '',
      onSearchChange,
      roleFilter = 'all',
      onRoleFilterChange,
      statusFilter = 'all',
      onStatusFilterChange,
      onClearFilters,
}) {
      const hasActiveFilters = search.trim() !== '' || roleFilter !== 'all' || statusFilter !== 'all';

      return (
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  {/* Search Input */}
                  <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <input
                              type="text"
                              value={search}
                              onChange={(e) => onSearchChange(e.target.value)}
                              placeholder="Search teams..."
                              className="h-10 w-full rounded-xl border border-border/80 bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition-shadow"
                        />
                  </div>

                  {/* Filter Dropdowns + Clear Action */}
                  <div className="flex flex-wrap items-center gap-2.5">
                        {/* Role Filter */}
                        <Select value={roleFilter} onValueChange={onRoleFilterChange}>
                              <SelectTrigger className="h-10 w-[140px] rounded-xl border-border/80 bg-card text-xs">
                                    <SelectValue placeholder="All roles" />
                              </SelectTrigger>
                              <SelectContent>
                                    <SelectItem value="all">All roles</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="lead">Lead</SelectItem>
                                    <SelectItem value="member">Member</SelectItem>
                                    <SelectItem value="viewer">Viewer</SelectItem>
                              </SelectContent>
                        </Select>

                        {/* Status Filter */}
                        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                              <SelectTrigger className="h-10 w-[140px] rounded-xl border-border/80 bg-card text-xs">
                                    <SelectValue placeholder="Any status" />
                              </SelectTrigger>
                              <SelectContent>
                                    <SelectItem value="all">Any status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                              </SelectContent>
                        </Select>

                        {/* Clear Filters Button */}
                        {hasActiveFilters && (
                              <button
                                    type="button"
                                    onClick={onClearFilters}
                                    className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                              >
                                    Clear filters
                              </button>
                        )}
                  </div>
            </div>
      );
}
