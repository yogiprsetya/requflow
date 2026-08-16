'use client';

import { useState } from 'react';
import { Boxes, Check, Container, Plus } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { useWorkspaceStore } from './workspace-store';
import dynamic from 'next/dynamic';

const DialogAddWorkspace = dynamic(() => import('./dialog-add-workspace').then((m) => m.DialogAddWorkspace), {
  ssr: false,
});

export const Sidedock = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const selectEnvironment = useWorkspaceStore((state) => state.selectEnvironment);
  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? workspaces[0];
  const activeEnvironment = activeWorkspace.environments.find(
    (environment) => environment.id === activeWorkspace.activeEnvironmentId
  );

  return (
    <nav
      aria-label="Quick navigation"
      className="bg-sidebar border-secondary z-20 hidden h-full w-12 flex-col items-center border-r py-3 md:flex"
    >
      <div className="flex flex-col items-center space-y-2">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                size="icon-lg"
                variant="ghost"
                aria-label="Create New Workspace"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus />
              </Button>
            }
          />
          <TooltipContent side="right">Create New Workspace</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button type="button" className="opacity-50" size="icon-lg" aria-label="Collection">
                <Boxes />
              </Button>
            }
          />
          <TooltipContent side="right">Collection</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger
              render={
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      size="icon-lg"
                      variant="secondary"
                      aria-label={`Environment: ${activeEnvironment?.name ?? 'Development'}`}
                    >
                      <Container />
                    </Button>
                  }
                />
              }
            />
            <TooltipContent side="right">{activeEnvironment?.name ?? 'Development'}</TooltipContent>
          </Tooltip>

          <DropdownMenuContent side="right" align="start" sideOffset={8} className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Environment</DropdownMenuLabel>
              {activeWorkspace.environments.map((environment) => (
                <DropdownMenuItem
                  key={environment.id}
                  onClick={() => selectEnvironment(activeWorkspace.id, environment.id)}
                >
                  <Container />
                  {environment.name}
                  {environment.id === activeWorkspace.activeEnvironmentId && <Check className="ml-auto" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DialogAddWorkspace open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </nav>
  );
};
