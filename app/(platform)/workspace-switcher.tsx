import { useState } from 'react';
import { Check, Plus, SquarePen, User } from 'lucide-react';
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
  const [dialogMode, setDialogMode] = useState<'create' | 'rename' | null>(null);
  const [workspaceName, setWorkspaceName] = useState('');
  const [nameError, setNameError] = useState('');

  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const createWorkspace = useWorkspaceStore((state) => state.createWorkspace);
  const renameWorkspace = useWorkspaceStore((state) => state.renameWorkspace);
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

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setDialogMode(null);
      setNameError('');
    }
  };

  const handleSubmit = () => {
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

      <Dialog open={dialogMode !== null} onOpenChange={handleDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === 'rename' ? 'Rename workspace' : 'Add workspace'}</DialogTitle>

            <DialogDescription>
              {dialogMode === 'rename'
                ? 'Choose a new name for this workspace.'
                : 'Create a workspace for a separate set of endpoints.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="workspace-name">Workspace name</Label>

            <Input
              id="workspace-name"
              autoFocus
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

          <DialogFooter>
            <Button variant="outline" onClick={() => handleDialogChange(false)}>
              Cancel
            </Button>

            <Button onClick={handleSubmit}>{dialogMode === 'rename' ? 'Rename' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  );
};
