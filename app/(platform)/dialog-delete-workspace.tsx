'use client';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { useWorkspaceStore } from './workspace-store';

interface DialogDeleteWorkspaceProps {
  workspaceId: string;
  workspaceName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DialogDeleteWorkspace = ({
  workspaceId,
  workspaceName,
  open,
  onOpenChange,
}: DialogDeleteWorkspaceProps) => {
  const deleteWorkspace = useWorkspaceStore((state) => state.deleteWorkspace);

  const handleDelete = () => {
    if (deleteWorkspace(workspaceId)) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete workspace</DialogTitle>

          <DialogDescription>
            Delete “{workspaceName}”? Its endpoints and imported spec will be removed.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
