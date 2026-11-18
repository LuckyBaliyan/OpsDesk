import { ArrowUpRight } from 'lucide-react';

/**
 * Sticky action button at the bottom of the sidebar.
 * Directs the user to the dedicated All Teams directory page.
 */
export default function BrowseTeamsButton({ onClick }) {
      return (
            <button
                  type="button"
                  onClick={onClick}
                  className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-border/80 bg-card/60 px-4 py-3 text-sm font-medium text-foreground transition-all hover:bg-muted/70 hover:border-border active:scale-[0.99] shadow-xs"
            >
                  <span>Browse Directory</span>
                  <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
      );
}
