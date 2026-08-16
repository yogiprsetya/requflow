import { useState } from 'react';
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
import { useWorkspaceStore } from './workspace-store';

interface DialogAddWorkspaceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DialogAddWorkspace = ({ open, onOpenChange }: DialogAddWorkspaceProps) => {
  const [workspaceName, setWorkspaceName] = useState('');
  const [nameError, setNameError] = useState('');

  const createWorkspace = useWorkspaceStore((state) => state.createWorkspace);

  const handleCreate = () => {
    const name = workspaceName.trim();

    if (!name) {
      setNameError('Enter a workspace name.');
      return;
    }

    if (createWorkspace(name) !== null) {
      setWorkspaceName('');
      setNameError('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>

          <DialogDescription>Create a workspace for a separate set of endpoints.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Label htmlFor="dock-workspace-name">Workspace name</Label>

          <Input
            id="dock-workspace-name"
            autoFocus
            maxLength={50}
            value={workspaceName}
            onChange={(event) => {
              setWorkspaceName(event.target.value);
              setNameError('');
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleCreate();
            }}
            aria-invalid={Boolean(nameError)}
          />

          {nameError && <p className="text-destructive text-xs">{nameError}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button onClick={handleCreate}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
