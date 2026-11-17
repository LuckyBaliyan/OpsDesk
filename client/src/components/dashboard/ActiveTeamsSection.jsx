import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

import TeamCard, { TeamCardSkeleton } from './TeamCard';

const MAX_ACTIVE_PER_GROUP = 3;

/**
 * Renders the top most active teams on the global dashboard.
 * Categorizes teams into 'My Active Teams' and 'Other Active Teams' ordered by work items activity volume.
 */
export default function ActiveTeamsSection({
      rows = [],
      onSelectTeam,
      isLoading = false
}) {
      const navigate = useNavigate();

      // Sort teams by active items first, then total work items volume
      const sortedByActivity = useMemo(() => {
            return [...rows].sort((a, b) => b.active - a.active || b.total - a.total);
      }, [rows]);

      const myActive = useMemo(() => {
            return sortedByActivity.filter((r) => r.team.myRole).slice(0, MAX_ACTIVE_PER_GROUP);
      }, [sortedByActivity]);

      const otherActive = useMemo(() => {
            return sortedByActivity.filter((r) => !r.team.myRole).slice(0, MAX_ACTIVE_PER_GROUP);
      }, [sortedByActivity]);

      /**
       * Navigates to the full All Teams directory page.
       */
      const handleOpenDirectory = () => {
            navigate('/teams');
      };

      return (
            <section className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                              <h2 className="text-lg font-semibold tracking-tight text-foreground">Active Teams</h2>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                    Highest work-item velocity across your organization.
                              </p>
                        </div>

                        <button
                              type="button"
                              onClick={handleOpenDirectory}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/70 cursor-pointer transition-colors"
                        >
                              <span>Browse all teams</span>
                              <ArrowUpRight className="size-3.5 text-muted-foreground" />
                        </button>
                  </div>

                  {isLoading ? (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                              {[1, 2, 3].map((i) => (
                                    <TeamCardSkeleton key={i} />
                              ))}
                        </div>
                  ) : (
                        <div className="space-y-5">
                              {/* My Active Teams */}
                              {myActive.length > 0 && (
                                    <div className="space-y-2.5">
                                          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                My Active Teams
                                          </h3>
                                          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                                {myActive.map((r) => (
                                                      <TeamCard
                                                            key={r.team.id || r.team._id}
                                                            row={r}
                                                            onOpen={onSelectTeam}
                                                      />
                                                ))}
                                          </div>
                                    </div>
                              )}

                              {/* Other Active Teams */}
                              {otherActive.length > 0 && (
                                    <div className="space-y-2.5">
                                          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                Other Active Teams
                                          </h3>
                                          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                                {otherActive.map((r) => (
                                                      <TeamCard
                                                            key={r.team.id || r.team._id}
                                                            row={r}
                                                            onOpen={onSelectTeam}
                                                      />
                                                ))}
                                          </div>
                                    </div>
                              )}

                              {myActive.length === 0 && otherActive.length === 0 && (
                                    <div className="rounded-xl border border-border/80 bg-card p-8 text-center text-xs text-muted-foreground">
                                          No active teams found.
                                    </div>
                              )}
                        </div>
                  )}
            </section>
      );
}
