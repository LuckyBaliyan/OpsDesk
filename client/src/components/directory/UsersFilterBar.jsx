import { Search, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * Filter toolbar for the Users tab in Organization Directory.
 * Provides live search by name/email, team filtering, status filtering,
 * and a clear-filters button.
 */
export default function UsersFilterBar({
      search = '',
      onSearchChange,
      teamFilter = 'all',
      onTeamFilterChange,
      statusFilter = 'all',
      onStatusFilterChange,
      teams = [],
      onClearFilters,
      totalCount = 0,
      rangeText = '',
}) {
      const isFiltered = search.trim() !== '' || teamFilter !== 'all' || statusFilter !== 'all';

      return (
            <div className="space-y-4">
                  {/* Section Title and Count */}
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                              <h2 className="text-xl font-bold tracking-tight text-foreground">All users</h2>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                    Find people and manage team access.
                              </p>
                        </div>

                        {rangeText && (
                              <span className="self-start sm:self-auto rounded-full border border-border/80 bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
                                    {rangeText}
                              </span>
                        )}
                  </div>

                  {/* Filter Toolbar */}
                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                        {/* Search Input */}
                        <div className="relative flex-1">
                              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                              <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    placeholder="Search users by name or email..."
                                    className="h-9 w-full rounded-lg border border-border/80 bg-card pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-hidden"
                              />
                        </div>

                        {/* Team Filter Dropdown */}
                        <div className='flex'>
                              <div className="w-full sm:w-[170px]">
                                    <Select value={teamFilter} onValueChange={onTeamFilterChange}>
                                          <SelectTrigger className="h-9 text-xs">
                                                <SelectValue placeholder="All teams" />
                                          </SelectTrigger>
                                          <SelectContent>
                                                <SelectItem value="all">All teams</SelectItem>
                                                {teams.map((t) => (
                                                      <SelectItem key={t.id} value={t.id}>
                                                            {t.name}
                                                      </SelectItem>
                                                ))}
                                          </SelectContent>
                                    </Select>
                              </div>

                              {/* Status Filter Dropdown */}
                              <div className="w-full sm:w-[140px]">
                                    <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                                          <SelectTrigger className="h-9 text-xs">
                                                <SelectValue placeholder="Any status" />
                                          </SelectTrigger>
                                          <SelectContent>
                                                <SelectItem value="all">Any status</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="invited">Invited</SelectItem>
                                          </SelectContent>
                                    </Select>
                              </div>
                        </div>

                        {/* Clear Filters Button */}
                        {isFiltered && (
                              <button
                                    type="button"
                                    onClick={onClearFilters}
                                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border/80 px-3 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
                              >
                                    <X className="size-3.5" />
                                    <span>Clear filters</span>
                              </button>
                        )}
                  </div>
            </div>
      );
}
