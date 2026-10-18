import { cn } from '@/lib/utils';

export default function IconCircle({ icon: Icon, className }) {
      return (
            <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-full border border-border', className)}>
                  <Icon className="size-5" />
            </span>
      );
}
