import { Bell, Moon, PanelLeft, Plus, Search, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import UserAvatar from '@/components/shared/UserAvatar';

export default function Header({
      user,
      search,
      onSearchChange,
      canWrite,
      onNewItem,
      dark,
      onToggleTheme,
      onToggleSidebar,
      urgentCount,
      onBellClick,
}) {
      return (
            <header className="sticky top-0 z-30 flex h-[68px] items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
                  <Button variant="ghost" size="icon" onClick={onToggleSidebar} aria-label="Toggle sidebar" className="cursor-pointer">
                        <PanelLeft className="size-[18px]" />
                  </Button>
                  <span className="hidden h-5 w-px bg-border sm:block" />

                  <div className="relative w-full max-w-80">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                              value={search}
                              onChange={(e) => onSearchChange(e.target.value)}
                              placeholder="Search..."
                              className="h-10 rounded-md pl-9"
                        />
                  </div>

                  <div className="ml-auto flex items-center gap-1.5">
                        {canWrite && (
                              <Button onClick={onNewItem} className="mr-1 cursor-pointer">
                                    <Plus className="size-4" />
                                    <span className="hidden sm:inline">New item</span>
                              </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={onToggleTheme} aria-label="Toggle theme" className="cursor-pointer">
                              {dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onBellClick} aria-label="Unassigned urgent items" className="relative cursor-pointer">
                              <Bell className="size-[18px]" />
                              {urgentCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500" />
                              )}
                        </Button>
                        <UserAvatar name={user?.name} email={user?.email} className="ml-1 size-9" />
                  </div>
            </header>
      );
}
