'use client';

import { FileUp, FolderInput, Link2, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Label } from '~/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { useImportSpec } from './use-import-spec';
import { CREATE_NEW_WORKSPACE_OPTION_ID } from './utils/import-workspace-target';
import { ReactNode } from 'react';

type ImportSpecDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: (onOpen: () => void) => ReactNode;
};

export const ImportSpecDialog = ({ open: controlledOpen, onOpenChange, trigger }: ImportSpecDialogProps) => {
  const {
    canImport,
    error,
    file,
    handleFileChange,
    handleImport,
    handleMethodChange,
    handleNewWorkspaceNameChange,
    handleOpen,
    handleOpenChange,
    handleCancel,
    handleUrlChange,
    handleWorkspaceChange,
    isCreatingNewWorkspace,
    isImporting,
    method,
    newWorkspaceName,
    open: internalOpen,
    url,
    workspace,
    workspaceOptions,
  } = useImportSpec({ onOpenChange });

  const open = controlledOpen ?? internalOpen;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        trigger(handleOpen)
      ) : (
        <Button onClick={handleOpen}>
          <FolderInput /> Spec
        </Button>
      )}

      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="mb-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
              <FolderInput aria-hidden="true" />
            </div>

            <div className="flex flex-col">
              <DialogTitle>Import OpenAPI spec</DialogTitle>
              <DialogDescription>Add endpoints from an OpenAPI JSON or YAML document.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={method} orientation="vertical" onValueChange={handleMethodChange}>
          <TabsList className="grid h-10 w-full grid-cols-2" aria-label="Import source">
            <TabsTrigger value="file">
              <FileUp data-icon="inline-start" />
              Upload file
            </TabsTrigger>

            <TabsTrigger value="url">
              <Link2 data-icon="inline-start" />
              Import from URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="bg-muted dark:border-input mt-3 rounded-lg border p-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor="openapi-file">OpenAPI file</Label>
                <span className="text-muted-foreground text-xs">Select a JSON, YAML, or YML file to upload.</span>
              </div>

              <Input
                id="openapi-file"
                type="file"
                accept=".json,.yaml,.yml,application/json,application/yaml,text/yaml"
                onChange={handleFileChange}
              />

              {file && <p className="text-muted-foreground truncate text-xs">Selected: {file.name}</p>}
            </div>
          </TabsContent>

          <TabsContent value="url" className="bg-muted/20 mt-3 rounded-lg border p-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor="openapi-url">OpenAPI URL</Label>
                <span className="text-muted-foreground text-xs">
                  Use a publicly accessible HTTP or HTTPS URL.
                </span>
              </div>

              <Input
                id="openapi-url"
                type="url"
                placeholder="https://example.com/openapi.yaml"
                value={url}
                onChange={(event) => handleUrlChange(event.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="workspace-target">Workspace target</Label>
            <span className="text-muted-foreground text-xs">
              Choose where the imported endpoints should be added.
            </span>
          </div>

          <Select value={workspace} onValueChange={handleWorkspaceChange}>
            <SelectTrigger id="workspace-target" className="w-full">
              <span className="flex flex-1 text-left">
                {workspaceOptions.find((workspaceOption) => workspaceOption.id === workspace)?.name}
              </span>
            </SelectTrigger>

            <SelectContent>
              {workspaceOptions.map((workspaceOption) => (
                <SelectItem key={workspaceOption.id} value={workspaceOption.id}>
                  {workspaceOption.id === CREATE_NEW_WORKSPACE_OPTION_ID ? (
                    <span className="flex items-center gap-2">
                      <Plus data-icon="inline-start" className="size-4" />
                      {workspaceOption.name}
                    </span>
                  ) : (
                    <>
                      {workspaceOption.name}
                      {workspaceOption.isActive ? ' (active)' : ''}
                    </>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isCreatingNewWorkspace && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-workspace-name">New workspace name</Label>

              <Input
                id="new-workspace-name"
                value={newWorkspaceName}
                onChange={(event) => handleNewWorkspaceNameChange(event.target.value)}
                placeholder="My API workspace"
                maxLength={50}
              />
            </div>
          )}

          {error && (
            <p className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-xs" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button size="lg" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>

          <Button size="lg" disabled={!canImport || isImporting} onClick={handleImport}>
            {isImporting ? 'Validating…' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
