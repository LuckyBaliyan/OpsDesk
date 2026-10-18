import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { initials } from '@/lib/helpers';

export default function UserAvatar({ name, email, className }) {
      return (
            <Avatar className={cn('size-8', className)}>
                  <AvatarFallback className="bg-muted text-[11px] font-medium text-foreground">
                        {initials(name, email)}
                  </AvatarFallback>
            </Avatar>
      );
}
