/* Yearly-backup-style donut */
export default function Donut({ segments }) {
      const R = 42;
      const C = 2 * Math.PI * R;
      const total = segments.reduce((a, s) => a + s.value, 0);
      let offset = 0;

      return (
            <svg viewBox="0 0 100 100" className="size-28 shrink-0 -rotate-90" aria-hidden="true">
                  <circle cx="50" cy="50" r={R} fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="13" className="text-foreground" />
                  {total > 0 &&
                        segments.map((s) => {
                              if (!s.value) return null;
                              const len = (s.value / total) * C;
                              const dash = Math.max(len - 1.5, 0);
                              const el = (
                                    <circle
                                          key={s.label}
                                          cx="50"
                                          cy="50"
                                          r={R}
                                          fill="none"
                                          stroke={s.color}
                                          strokeWidth="13"
                                          strokeDasharray={`${dash} ${C - dash}`}
                                          strokeDashoffset={-offset}
                                    />
                              );
                              offset += len;
                              return el;
                        })}
            </svg>
      );
}
