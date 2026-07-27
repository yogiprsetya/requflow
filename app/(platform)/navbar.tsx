import { Bell } from 'lucide-react';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { ImportSpecDialog } from '~/app/(platform)/import-spec-dialog';
import { SidebarTrigger } from '../../components/ui/sidebar';
import { WorkspaceSwitcher } from './workspace-switcher';

export function PlatformNavbar() {
  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/80 sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b pr-4 pl-1 backdrop-blur">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger aria-label="Toggle navigation sidebar" />

        <div className="hidden items-center gap-2 sm:flex">
          <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md text-xs font-semibold">
            R
          </div>
          <span className="text-sm font-semibold tracking-tight">Requflow</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <WorkspaceSwitcher />

          <ImportSpecDialog />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell />
          </Button>

          <Avatar size="sm" aria-label="Account menu">
            <AvatarFallback>YU</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
