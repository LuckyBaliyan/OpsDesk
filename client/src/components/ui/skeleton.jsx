import { cn } from "@/lib/utils";

// Renders an animated placeholder block matching the OpsDesk theme for smooth loading states
function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted/80 dark:bg-muted/60", className)}
      {...props}
    />
  );
}

export { Skeleton };

