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

interface DialogRenameFolderProps {
  workspaceId: string;
  tag: string;
  folderName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DialogRenameFolder = ({
  workspaceId,
  tag,
  folderName,
  open,
  onOpenChange,
}: DialogRenameFolderProps) => {
  const [name, setName] = useState(folderName);
  const [nameError, setNameError] = useState('');

  const renameFolder = useWorkspaceStore((state) => state.renameFolder);

  const handleRename = () => {
    const trimmed = name.trim();

    if (!trimmed) {
      setNameError('Enter a folder name.');
      return;
    }

    if (renameFolder(workspaceId, tag, trimmed)) {
      setNameError('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) setName(folderName);
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename folder</DialogTitle>

          <DialogDescription>Choose a new name for this folder.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Label htmlFor="rename-folder-name">Folder name</Label>

          <Input
            id="rename-folder-name"
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
