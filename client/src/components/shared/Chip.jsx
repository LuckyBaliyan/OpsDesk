import { cn } from '@/lib/utils';

// the small +18% / -5% pill from the reference
export default function Chip({ tone = 'up', children, title }) {
      return (
            <span
                  title={title}
                  className={cn(
                        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                        tone === 'up'
                              ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400'
                              : 'bg-red-500/15 text-red-600 dark:text-red-500'
                  )}
            >
                  {children}
            </span>
      );
}
