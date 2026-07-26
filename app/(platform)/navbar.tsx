import { Bell } from 'lucide-react';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';

export function PlatformNavbar() {
  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/80 sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b px-4 backdrop-blur">
      <div className="flex min-w-0 items-center gap-2">
        <div className="hidden items-center gap-2 sm:flex">
          <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md text-xs font-semibold">
            R
          </div>
          <span className="text-sm font-semibold tracking-tight">Requflow</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell />
        </Button>
        <Avatar size="sm" aria-label="Account menu">
          <AvatarFallback>YU</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
