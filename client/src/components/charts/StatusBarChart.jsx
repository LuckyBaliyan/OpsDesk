/* Revenue-style floating bar chart: above axis = team, below = mine */
export default function StatusBarChart({ data }) {
      const max = Math.max(1, ...data.flatMap((d) => [d.team, d.mine]));
      const step = Math.max(1, Math.ceil(max / 3));
      const top = step * 3;
      const ticks = [3, 2, 1, 0, -1, -2, -3].map((n) => n * step);

      return (
            <div className="flex gap-3">
                  <div className="relative my-2 h-[300px] w-7 shrink-0 text-xs text-muted-foreground">
                        {ticks.map((t, i) => (
                              <span
                                    key={t}
                                    className="absolute right-0 -translate-y-1/2 leading-none"
                                    style={{ top: `${(i / 6) * 100}%` }}
                              >
                                    {t}
                              </span>
                        ))}
                  </div>

                  <div className="min-w-0 flex-1">
                        <div className="relative my-2 h-[300px]">
                              {ticks.map((t, i) => (
                                    <div
                                          key={t}
                                          className="absolute inset-x-0 border-t border-border/60"
                                          style={{ top: `${(i / 6) * 100}%` }}
                                    />
                              ))}

                              <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)` }}>
                                    {data.map((d) => (
                                          <div key={d.key} className="relative" title={`${d.label}: ${d.team} team, ${d.mine} mine`}>
                                                <span
                                                      className="absolute bottom-1/2 left-1/2 w-2.5 -translate-x-1/2 rounded-full bg-foreground/20"
                                                      style={{ height: `${(d.team / top) * 50}%` }}
                                                />
                                                <span
                                                      className="absolute top-1/2 left-1/2 w-2.5 -translate-x-1/2 rounded-full bg-primary"
                                                      style={{ height: `${(d.mine / top) * 50}%` }}
                                                />
                                          </div>
                                    ))}
                              </div>
                        </div>

                        <div className="mt-1 grid text-center text-xs text-muted-foreground" style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)` }}>
                              {data.map((d) => <span key={d.key}>{d.label}</span>)}
                        </div>
                  </div>
            </div>
      );
}
