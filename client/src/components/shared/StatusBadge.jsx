import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { STATUS_META } from '@/lib/constants';
import { humanize } from '@/lib/helpers';

export default function StatusBadge({ status }) {
      const meta = STATUS_META[status];
      return (
            <Badge variant="outline" className={cn('font-medium whitespace-nowrap', meta?.badge)}>
                  {meta?.label ?? humanize(status)}
            </Badge>
      );
}
