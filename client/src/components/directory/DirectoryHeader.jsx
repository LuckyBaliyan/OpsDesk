import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

/**
 * Top header component for the unified Organization Directory.
 * Renders the workspace breadcrumb, page title, top-right range counter,
 * and the sleek segmented switch tabs for toggling between Teams and Users.
 */
export default function DirectoryHeader({
      activeTab = 'teams',
      onTabChange,
      teamsCount = 0,
      usersCount = 0,
      rangeText = '',
}) {
      return (
            <div className="space-y-4">
                  {/* Workspace Breadcrumbs */}
                  <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground/80">
                        <span>WORKSPACE</span>
                        <ChevronRight className="size-3 text-muted-foreground/50" />
                        <span className="text-foreground/80">DIRECTORY</span>
                  </div>

                  {/* Title and Top-Right Item Counter */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                    Organization directory
                              </h1>
                              <p className="mt-1 text-sm text-muted-foreground">
                                    Find the teams and people you work with.
                              </p>
                        </div>

                        {rangeText && (
                              <div className="self-start sm:self-auto">
                                    <span className="inline-flex items-center rounded-full border border-border/80 bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
                                          {rangeText}
                                    </span>
                              </div>
                        )}
                  </div>

                  {/* Segmented Switch Tabs (Teams vs Users) */}
                  <div className="inline-flex rounded-lg border border-border/70 bg-card p-1">
                        <button
                              type="button"
                              onClick={() => onTabChange('teams')}
                              className={cn(
                                    'inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-medium cursor-pointer transition-all',
                                    activeTab === 'teams'
                                          ? 'bg-muted text-foreground font-semibold shadow-xs'
                                          : 'text-muted-foreground hover:text-foreground'
                              )}
                        >
                              <span>Teams</span>
                              <span
                                    className={cn(
                                          'rounded-md px-1.5 py-0.5 text-[11px] font-semibold',
                                          activeTab === 'teams'
                                                ? 'bg-background/80 text-foreground border border-border/60'
                                                : 'bg-muted/60 text-muted-foreground'
                                    )}
                              >
                                    {teamsCount}
                              </span>
                        </button>

                        <button
                              type="button"
                              onClick={() => onTabChange('users')}
                              className={cn(
                                    'inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-medium cursor-pointer transition-all',
                                    activeTab === 'users'
                                          ? 'bg-muted text-foreground font-semibold shadow-xs'
                                          : 'text-muted-foreground hover:text-foreground'
                              )}
                        >
                              <span>Users</span>
                              <span
                                    className={cn(
                                          'rounded-md px-1.5 py-0.5 text-[11px] font-semibold',
                                          activeTab === 'users'
                                                ? 'bg-background/80 text-foreground border border-border/60'
                                                : 'bg-muted/60 text-muted-foreground'
                                    )}
                              >
                                    {usersCount}
                              </span>
                        </button>
                  </div>
            </div>
      );
}
