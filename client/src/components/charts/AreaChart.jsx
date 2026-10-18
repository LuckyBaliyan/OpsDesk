/* Monthly-earnings-style area chart */
export default function AreaChart({ values }) {
      const max = Math.max(1, ...values);
      const pts = values.map((v, i) => [(i / (values.length - 1)) * 300, 92 - (v / max) * 80]);
      const line = pts.reduce((d, [x, y], i) => {
            if (i === 0) return `M${x},${y}`;
            const [px, py] = pts[i - 1];
            const cx = (px + x) / 2;
            return `${d} C${cx},${py} ${cx},${y} ${x},${y}`;
      }, '');

      return (
            <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="h-24 w-full" aria-hidden="true">
                  <defs>
                        <linearGradient id="opsAreaFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
                              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                        </linearGradient>
                  </defs>
                  <path d={`${line} L300,100 L0,100 Z`} fill="url(#opsAreaFill)" className="text-foreground" />
                  <path d={line} fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.5" vectorEffect="non-scaling-stroke" className="text-foreground" />
            </svg>
      );
}
