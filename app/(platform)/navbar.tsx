'use client';

import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { ImportSpecDialog } from '~/app/(platform)/import-spec-dialog';
import { SidebarTrigger } from '../../components/ui/sidebar';
import { WorkspaceSwitcher } from './workspace-switcher';
import { Check, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { cn } from '~/lib/css';

export const PlatformNavbar = () => {
  const { setTheme, theme } = useTheme();

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
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="icon">
                  <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              }
            />

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')} className="justify-between">
                Light <Check className={cn(theme !== 'light' && 'hidden')} />
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setTheme('dark')} className="justify-between">
                Dark <Check className={cn(theme !== 'dark' && 'hidden')} />
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setTheme('system')} className="justify-between">
                System <Check className={cn(theme !== 'system' && 'hidden')} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Avatar size="sm" aria-label="Account menu">
            <AvatarFallback>YU</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};
