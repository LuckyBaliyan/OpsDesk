import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Builds an array of page numbers with ellipsis for pagination controls.
 */
function getPaginationRange(currentPage, totalPages) {
      if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
      }
      if (currentPage <= 3) {
            return [1, 2, 3, '...', totalPages];
      }
      if (currentPage >= totalPages - 2) {
            return [1, '...', totalPages - 2, totalPages - 1, totalPages];
      }
      return [1, '...', currentPage, '...', totalPages];
}

/**
 * Footer pagination controls for the Users Directory view.
 * Displays "Showing X–Y of Z users" alongside numbered pages and navigation arrows.
 */
export default function UsersPagination({
      currentPage = 1,
      totalPages = 1,
      totalCount = 0,
      pageSize = 10,
      onPageChange,
}) {
      if (totalCount === 0) return null;

      const start = (currentPage - 1) * pageSize + 1;
      const end = Math.min(currentPage * pageSize, totalCount);
      const range = getPaginationRange(currentPage, totalPages);

      return (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-2">
                  <p className="text-xs text-muted-foreground">
                        Showing <span className="font-medium text-foreground">{start}–{end}</span> of{' '}
                        <span className="font-medium text-foreground">{totalCount}</span> users
                  </p>

                  <div className="flex items-center gap-1 self-center sm:self-auto">
                        {/* Prev Button */}
                        <button
                              type="button"
                              onClick={() => onPageChange(currentPage - 1)}
                              disabled={currentPage <= 1}
                              aria-label="Previous page"
                              className="size-8 inline-flex items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:bg-muted/60 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                        >
                              <ChevronLeft className="size-4" />
                        </button>

                        {/* Page Numbers */}
                        {range.map((item, idx) => {
                              if (item === '...') {
                                    return (
                                          <span
                                                key={`ellipsis-${idx}`}
                                                className="size-8 inline-flex items-center justify-center text-xs text-muted-foreground"
                                          >
                                                …
                                          </span>
                                    );
                              }
                              const isCurrent = item === currentPage;
                              return (
                                    <button
                                          key={item}
                                          type="button"
                                          onClick={() => onPageChange(item)}
                                          aria-current={isCurrent ? 'page' : undefined}
                                          className={cn(
                                                'size-8 inline-flex items-center justify-center rounded-lg text-xs font-medium cursor-pointer transition-colors',
                                                isCurrent
                                                      ? 'bg-foreground text-background font-semibold'
                                                      : 'border border-border/60 text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                                          )}
                                    >
                                          {item}
                                    </button>
                              );
                        })}

                        {/* Next Button */}
                        <button
                              type="button"
                              onClick={() => onPageChange(currentPage + 1)}
                              disabled={currentPage >= totalPages}
                              aria-label="Next page"
                              className="size-8 inline-flex items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:bg-muted/60 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                        >
                              <ChevronRight className="size-4" />
                        </button>
                  </div>
            </div>
      );
}
