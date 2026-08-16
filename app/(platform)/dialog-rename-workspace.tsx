'use client';

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

interface DialogRenameWorkspaceProps {
  workspaceId: string;
  workspaceName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DialogRenameWorkspace = ({
  workspaceId,
  workspaceName,
  open,
  onOpenChange,
}: DialogRenameWorkspaceProps) => {
  const [name, setName] = useState(workspaceName);
  const [nameError, setNameError] = useState('');

  const renameWorkspace = useWorkspaceStore((state) => state.renameWorkspace);

  const handleRename = () => {
    const trimmed = name.trim();

    if (!trimmed) {
      setNameError('Enter a workspace name.');
      return;
    }

    if (renameWorkspace(workspaceId, trimmed)) {
      setNameError('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename workspace</DialogTitle>

          <DialogDescription>Choose a new name for this workspace.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Label htmlFor="rename-workspace-name">Workspace name</Label>

          <Input
            id="rename-workspace-name"
            autoFocus
            maxLength={50}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setNameError('');
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleRename();
            }}
            aria-invalid={Boolean(nameError)}
          />

          {nameError && <p className="text-destructive text-xs">{nameError}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button onClick={handleRename}>Rename</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
