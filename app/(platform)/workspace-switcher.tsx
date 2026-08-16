import { useState } from 'react';
import { Check, GamepadDirectional, Plus, SquarePen, Trash2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
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
  const [dialogMode, setDialogMode] = useState<'create' | 'rename' | 'delete' | null>(null);
  const [workspaceName, setWorkspaceName] = useState('');
  const [nameError, setNameError] = useState('');

  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const createWorkspace = useWorkspaceStore((state) => state.createWorkspace);
  const renameWorkspace = useWorkspaceStore((state) => state.renameWorkspace);
  const deleteWorkspace = useWorkspaceStore((state) => state.deleteWorkspace);
  const selectWorkspace = useWorkspaceStore((state) => state.selectWorkspace);
  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? workspaces[0];

  const handleCreate = () => {
    setWorkspaceName('');
    setNameError('');
    setDialogMode('create');
  };

  const handleRename = () => {
    setWorkspaceName(activeWorkspace.name);
    setNameError('');
    setDialogMode('rename');
  };

  const handleDelete = () => {
    setDialogMode('delete');
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setDialogMode(null);
      setNameError('');
    }
  };

  const handleSubmit = () => {
    if (dialogMode === 'delete') {
      if (deleteWorkspace(activeWorkspace.id)) setDialogMode(null);
      return;
    }

    const name = workspaceName.trim();

    if (!name) {
      setNameError('Enter a workspace name.');
      return;
    }

    const saved =
      dialogMode === 'create' ? createWorkspace(name) !== null : renameWorkspace(activeWorkspace.id, name);
    if (saved) setDialogMode(null);
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

      <Dialog open={dialogMode !== null} onOpenChange={handleDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'rename'
                ? 'Rename workspace'
                : dialogMode === 'delete'
                  ? 'Delete workspace'
                  : 'Add workspace'}
            </DialogTitle>

            <DialogDescription>
              {dialogMode === 'rename'
                ? 'Choose a new name for this workspace.'
                : dialogMode === 'delete'
                  ? `Delete “${activeWorkspace.name}”? Its endpoints and imported spec will be removed.`
                  : 'Create a workspace for a separate set of endpoints.'}
            </DialogDescription>
          </DialogHeader>

          {dialogMode !== 'delete' && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="workspace-name">Workspace name</Label>

              <Input
                id="workspace-name"
                autoFocus
                maxLength={50}
                value={workspaceName}
                onChange={(event) => {
                  setWorkspaceName(event.target.value);
                  setNameError('');
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleSubmit();
                }}
                aria-invalid={Boolean(nameError)}
              />

              {nameError && <p className="text-destructive text-xs">{nameError}</p>}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => handleDialogChange(false)}>
              Cancel
            </Button>

            <Button variant={dialogMode === 'delete' ? 'destructive' : 'default'} onClick={handleSubmit}>
              {dialogMode === 'rename' ? 'Rename' : dialogMode === 'delete' ? 'Delete' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  );
};
