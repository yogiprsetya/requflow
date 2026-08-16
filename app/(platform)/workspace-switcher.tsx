import { useState } from 'react';
import { Check, GamepadDirectional, Plus, SquarePen, Trash2 } from 'lucide-react';
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
import dynamic from 'next/dynamic';

const DialogAddWorkspace = dynamic(() => import('./dialog-add-workspace').then((m) => m.DialogAddWorkspace));

const DialogDeleteWorkspace = dynamic(() =>
  import('./dialog-delete-workspace').then((m) => m.DialogDeleteWorkspace)
);

const DialogRenameWorkspace = dynamic(() =>
  import('./dialog-rename-workspace').then((m) => m.DialogRenameWorkspace)
);

export const WorkspaceSwitcher = () => {
  const [dialogMode, setDialogMode] = useState<'create' | 'rename' | 'delete' | null>(null);

  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const selectWorkspace = useWorkspaceStore((state) => state.selectWorkspace);
  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? workspaces[0];

  const handleCreate = () => {
    setDialogMode('create');
  };

  const handleRename = () => {
    setDialogMode('rename');
  };

  const handleDelete = () => {
    setDialogMode('delete');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        <GamepadDirectional /> {activeWorkspace.name}
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-auto max-w-[calc(100vw-2rem)] min-w-56">
        <DropdownMenuGroup>
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => selectWorkspace(workspace.id)}
              className="wrap-break-word whitespace-normal"
            >
              {workspace.name}
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

          <DropdownMenuItem onClick={handleDelete} disabled={workspaces.length <= 1} variant="destructive">
            <Trash2 /> Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>

      <DialogAddWorkspace
        open={dialogMode === 'create'}
        onOpenChange={(open) => {
          if (!open) {
            setDialogMode(null);
          }
        }}
      />

      <DialogRenameWorkspace
        key={activeWorkspace.id}
        workspaceId={activeWorkspace.id}
        workspaceName={activeWorkspace.name}
        open={dialogMode === 'rename'}
        onOpenChange={(open) => {
          if (!open) {
            setDialogMode(null);
          }
        }}
      />

      <DialogDeleteWorkspace
        workspaceId={activeWorkspace.id}
        workspaceName={activeWorkspace.name}
        open={dialogMode === 'delete'}
        onOpenChange={(open) => {
          if (!open) {
            setDialogMode(null);
          }
        }}
      />
    </DropdownMenu>
  );
};
