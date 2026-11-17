import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Header component for the All Teams directory page.
 * Displays the page title, description, visible range indicator, and view toggle (Grid vs List).
 */
export default function TeamsHeader({
      totalCount = 0,
      rangeText = '1-6 of 128',
      viewMode = 'list',
      onViewModeChange
}) {
      return (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">All teams</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                              Browse teams across your organization.
                        </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                        {/* Range indicator pill */}
                        {totalCount > 0 && (
                              <span className="rounded-full border border-border/80 bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
                                    {rangeText}
                              </span>
                        )}

                        {/* View Mode Toggle: Grid vs List */}
                        <div className="inline-flex rounded-lg border border-border/80 bg-card p-0.5">
                              <button
                                    type="button"
                                    onClick={() => onViewModeChange('grid')}
                                    aria-label="Grid view"
                                    className={cn(
                                          'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors',
                                          viewMode === 'grid'
                                                ? 'bg-muted text-foreground font-semibold shadow-xs'
                                                : 'text-muted-foreground hover:text-foreground'
                                    )}
                              >
                                    <LayoutGrid className="size-3.5" />
                                    <span>Grid</span>
                              </button>
                              <button
                                    type="button"
                                    onClick={() => onViewModeChange('list')}
                                    aria-label="List view"
                                    className={cn(
                                          'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors',
                                          viewMode === 'list'
                                                ? 'bg-muted text-foreground font-semibold shadow-xs'
                                                : 'text-muted-foreground hover:text-foreground'
                                    )}
                              >
                                    <List className="size-3.5" />
                                    <span>List</span>
                              </button>
                        </div>
                  </div>
            </div>
      );
}
