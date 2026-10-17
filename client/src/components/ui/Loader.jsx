import React from "react";

const SIZES = {
      sm: "w-4 h-4",
      default: "w-6 h-6",
      lg: "w-10 h-10",
};

export function Loader({ size = "default", className = "" }) {
      return (
            <span className={`inline-flex items-center justify-center ${className}`}>
                  <svg
                        className={`${SIZES[size] ?? SIZES.default} shrink-0 animate-spin motion-reduce:animate-none`}
                        viewBox="0 0 24 24"
                        fill="none"
                        role="status"
                        aria-label="Loading"
                  >
                        {/* track */}
                        <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="text-muted-foreground/25"
                        />
                        {/* spinning arc */}
                        <path
                              d="M12 2a10 10 0 0 1 10 10"
                              stroke="currentColor"
                              strokeWidth="1"
                              strokeLinecap="round"
                              className="text-foreground"
                        />
                  </svg>
            </span>
      );
}

export function FullPageLoader({ text = "Loading system..." }) {
      return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-3">
                  <Loader size="lg" />
                  <p className="text-xs text-muted-foreground font-medium tracking-wide animate-pulse">
                        {text}
                  </p>
            </div>
      );
}