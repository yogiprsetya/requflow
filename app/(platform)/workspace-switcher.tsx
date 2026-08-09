import { Check, Plus, SquarePen, User } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useWorkspaceStore } from './workspace-store';

export const WorkspaceSwitcher = () => {
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const createWorkspace = useWorkspaceStore((state) => state.createWorkspace);
  const renameWorkspace = useWorkspaceStore((state) => state.renameWorkspace);
  const selectWorkspace = useWorkspaceStore((state) => state.selectWorkspace);
  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? workspaces[0];

  const handleCreate = () => {
    const name = window.prompt('Workspace name');
    if (name !== null) createWorkspace(name);
  };

  const handleRename = () => {
    const name = window.prompt('Workspace name', activeWorkspace.name);
    if (name !== null) renameWorkspace(activeWorkspace.id, name);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        <User /> {activeWorkspace.name}
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-auto max-w-[calc(100vw-2rem)] min-w-56">
        <DropdownMenuGroup>
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => selectWorkspace(workspace.id)}
              className="wrap-break-word whitespace-normal"
            >
              <User /> {workspace.name}
              {workspace.id === activeWorkspace.id && <Check className="ml-auto" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleCreate}>
            <Plus /> Add
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleRename}>
            <SquarePen /> Rename
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
