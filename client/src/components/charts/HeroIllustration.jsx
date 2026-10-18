/* decorative hero art (stand-in for the reference illustration) */
export default function HeroIllustration({ className }) {
      return (
            <svg viewBox="0 0 240 200" fill="none" className={className} aria-hidden="true">
                  {/* desk */}
                  <rect x="6" y="118" width="228" height="6" rx="1" fill="#8f2f28" />
                  <path d="M26 124 L18 200 M62 124 L70 200 M196 124 L204 200" stroke="currentColor" strokeOpacity=".35" strokeWidth="2" />
                  {/* chair */}
                  <path d="M104 160 V200" stroke="currentColor" strokeOpacity=".35" strokeWidth="3" />
                  <rect x="80" y="152" width="48" height="8" rx="3" fill="#b3342b" />
                  {/* legs */}
                  <path d="M92 126 C90 150 92 170 94 190 M116 126 C120 150 118 170 116 190" stroke="#15120f" strokeWidth="13" strokeLinecap="round" />
                  {/* torso */}
                  <path d="M68 124 C62 96 72 70 98 64 L118 68 C134 76 140 100 136 124 Z" fill="#0f9e8e" />
                  {/* arm */}
                  <path d="M112 76 C130 84 144 98 152 110" stroke="#0f9e8e" strokeWidth="13" strokeLinecap="round" />
                  <circle cx="155" cy="112" r="5" fill="#f2c9a5" />
                  {/* laptop */}
                  <path d="M150 112 L158 82 L204 80 L206 112 Z" fill="#1d1a17" stroke="currentColor" strokeOpacity=".3" />
                  <rect x="140" y="112" width="76" height="6" rx="2" fill="#2a2623" />
                  <circle cx="182" cy="97" r="2.5" fill="#efe6e4" />
                  {/* head */}
                  <circle cx="98" cy="42" r="17" fill="#f2c9a5" />
                  <path d="M81 40 C80 24 96 18 108 24 C117 29 118 38 116 44 C109 35 94 32 81 40 Z" fill="#f0602a" />
                  <circle cx="92" cy="45" r="5" stroke="#15120f" strokeWidth="1.6" />
                  <circle cx="106" cy="45" r="5" stroke="#15120f" strokeWidth="1.6" />
                  <path d="M97 45 H101" stroke="#15120f" strokeWidth="1.6" />
            </svg>
      );
}
