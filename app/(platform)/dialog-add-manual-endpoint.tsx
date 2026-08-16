'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { httpMethods } from './constant';
import { ApiEndpointDetail, RequestParameter } from './types';
import { getActiveWorkspace, useWorkspaceStore } from './workspace-store';
import { IMPORTED_SPEC_UPDATED_EVENT } from './constant';
import { Textarea } from '~/components/ui/textarea';
import { parseStoredSpec } from './utils/openapi';
import { methodTextClass } from './utils/helpers';

type KeyValue = { id: number; key: string; value: string };

const NEW_FOLDER = 'Create new folder';

const collectFolders = (workspace: ReturnType<typeof getActiveWorkspace> | undefined): string[] => {
  if (!workspace) return [];

  const specTags = workspace.spec ? parseStoredSpec(workspace.spec).flatMap((endpoint) => endpoint.tags) : [];
  const manualTags = (workspace.manualEndpoints ?? []).flatMap((endpoint) => endpoint.tags);

  return Array.from(new Set([...specTags, ...manualTags].filter(Boolean))).sort((a, b) => a.localeCompare(b));
};

export const AddManualEndpointDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const addManualEndpoint = useWorkspaceStore((state) => state.addManualEndpoint);
  const [method, setMethod] = useState<(typeof httpMethods)[number]>('get');
  const [url, setUrl] = useState('');
  const [params, setParams] = useState<KeyValue[]>([]);
  const [headers, setHeaders] = useState<KeyValue[]>([]);
  const [body, setBody] = useState('');
  const [folder, setFolder] = useState('');
  const [newFolder, setNewFolder] = useState('');

  const existingFolders = collectFolders(getActiveWorkspace({ activeWorkspaceId, workspaces }));

  const reset = () => {
    setMethod('get');
    setUrl('');
    setParams([]);
    setHeaders([]);
    setBody('');
    setFolder('');
    setNewFolder('');
  };

  const addRow = (setter: typeof setParams) =>
    setter((rows) => [...rows, { id: Date.now() + rows.length, key: '', value: '' }]);
  const updateRow = (setter: typeof setParams, id: number, field: 'key' | 'value', value: string) =>
    setter((rows) => rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  const removeRow = (setter: typeof setParams, id: number) =>
    setter((rows) => rows.filter((row) => row.id !== id));

  const handleSubmit = () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    const resolvedTag = folder === NEW_FOLDER ? newFolder.trim() : folder.trim();

    const parameters: RequestParameter[] = params
      .filter((row) => row.key.trim())
      .map((row) => ({ name: row.key.trim(), in: 'query', example: row.value }));
    const endpoint: ApiEndpointDetail = {
      id: `manual:${Date.now()}:${Math.random()}`,
      method,
      path: trimmedUrl,
      sourceType: 'manual',
      summary: 'Manual endpoint',
      tags: resolvedTag ? [resolvedTag] : [],
      parameters,
      requestBody: body.trim() ? { content: { 'application/json': { example: body } } } : undefined,
    };

    addManualEndpoint(activeWorkspaceId, endpoint);
    window.dispatchEvent(new Event(IMPORTED_SPEC_UPDATED_EVENT));
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) reset();
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="mb-1">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
              <Plus aria-hidden="true" />
            </div>

            <div className="flex flex-col gap-1">
              <DialogTitle>Add endpoint</DialogTitle>
              <DialogDescription>
                Define a request manually and save it to the active workspace.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="manual-url">Request</Label>

            <div className="bg-muted dark:border-input flex flex-col gap-3 rounded-lg border p-3 pb-2 sm:flex-row">
              <div className="space-y-2">
                <Label htmlFor="method-url">Method</Label>

                <Select
                  id="method-url"
                  value={method.toUpperCase()}
                  onValueChange={(value) => setMethod(value as typeof method)}
                >
                  <SelectTrigger>
                    <SelectValue className={methodTextClass(method)} />
                  </SelectTrigger>

                  <SelectContent>
                    {httpMethods.map((item) => (
                      <SelectItem key={item} value={item} className={methodTextClass(item)}>
                        {item.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grow space-y-2">
                <Label htmlFor="manual-url">URL</Label>

                <Input
                  id="manual-url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://api.example.com/users"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-col gap-1">
              <Label>Save to folder</Label>
              <span className="text-muted-foreground text-xs">
                Organize this endpoint in a folder in your workspace.
              </span>
            </div>

            <Select
              value={folder}
              onValueChange={(value) => {
                setFolder(value ?? '');
                if (value !== NEW_FOLDER) setNewFolder('');
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Other (uncategorized)" />
              </SelectTrigger>

              <SelectContent>
                {existingFolders.length > 0 && (
                  <SelectGroup>
                    {existingFolders.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}

                <SelectItem value={NEW_FOLDER}>
                  <span className="flex items-center gap-2">
                    <Plus data-icon="inline-start" className="size-4" />
                    Create new folder
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>

            {folder === NEW_FOLDER && (
              <div className="flex flex-col gap-1">
                <Label htmlFor="new-folder-name">New folder name</Label>

                <Input
                  id="new-folder-name"
                  value={newFolder}
                  onChange={(event) => setNewFolder(event.target.value)}
                  placeholder="e.g. Users"
                  autoFocus
                />
              </div>
            )}
          </div>

          <KeyValueEditor
            title="Query parameters"
            rows={params}
            onAdd={() => addRow(setParams)}
            onUpdate={(id, field, value) => updateRow(setParams, id, field, value)}
            onRemove={(id) => removeRow(setParams, id)}
          />

          <KeyValueEditor
            title="Headers"
            rows={headers}
            onAdd={() => addRow(setHeaders)}
            onUpdate={(id, field, value) => updateRow(setHeaders, id, field, value)}
            onRemove={(id) => removeRow(setHeaders, id)}
          />

          <div className="space-y-2">
            <div className="flex flex-col gap-1">
              <Label>JSON body</Label>
              <span className="text-muted-foreground text-xs">Optional request payload for this endpoint.</span>
            </div>

            <Textarea
              id="manual-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder={'{\n  "name": "Ada"\n}'}
              className="border-input bg-muted/50 dark:border-input min-h-28 w-full rounded-lg border px-3 py-2 font-mono text-sm outline-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button size="lg" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button size="lg" disabled={!url.trim()} onClick={handleSubmit}>
            <Plus data-icon="inline-start" />
            Add endpoint
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const KeyValueEditor = ({
  title,
  rows,
  onAdd,
  onUpdate,
  onRemove,
}: {
  title: string;
  rows: KeyValue[];
  onAdd: () => void;
  onUpdate: (id: number, field: 'key' | 'value', value: string) => void;
  onRemove: (id: number) => void;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label>{title}</Label>

      {rows.length > 0 && (
        <Button size="sm" variant="ghost" onClick={onAdd} className="text-muted-foreground hover:text-foreground">
          <Plus data-icon="inline-start" className="size-3.5" />
          Add
        </Button>
      )}
    </div>

    {rows.length === 0 ? (
      <button
        type="button"
        onClick={onAdd}
        className="text-muted-foreground border-foreground/10 hover:border-foreground/30 hover:text-foreground flex w-full items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-4 text-sm transition-colors"
      >
        <Plus data-icon="inline-start" className="size-4" />
        Add {title.toLowerCase()}
      </button>
    ) : (
      <div className="space-y-2">
        {rows.map((row) => (
          <div className="flex items-center gap-2" key={row.id}>
            <Input
              value={row.key}
              onChange={(event) => onUpdate(row.id, 'key', event.target.value)}
              placeholder="Name"
            />

            <Input
              value={row.value}
              onChange={(event) => onUpdate(row.id, 'value', event.target.value)}
              placeholder="Value"
            />

            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => onRemove(row.id)}
              aria-label={`Remove ${title} row`}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>
    )}
  </div>
);
