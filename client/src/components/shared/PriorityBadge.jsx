import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PRIORITY_META } from '@/lib/constants';

export default function PriorityBadge({ priority }) {
      return (
            <Badge variant="outline" className={cn('font-medium', PRIORITY_META[priority])}>
                  {priority}
            </Badge>
      );
}
