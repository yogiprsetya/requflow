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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { httpMethods } from './constant';
import { ApiEndpointDetail, RequestParameter } from './types';
import { useWorkspaceStore } from './workspace-store';
import { IMPORTED_SPEC_UPDATED_EVENT } from './constant';
import { Textarea } from '~/components/ui/textarea';

type KeyValue = { id: number; key: string; value: string };

export const AddManualEndpointDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const addManualEndpoint = useWorkspaceStore((state) => state.addManualEndpoint);
  const [method, setMethod] = useState<(typeof httpMethods)[number]>('get');
  const [url, setUrl] = useState('');
  const [params, setParams] = useState<KeyValue[]>([]);
  const [headers, setHeaders] = useState<KeyValue[]>([]);
  const [body, setBody] = useState('');

  const reset = () => {
    setMethod('get');
    setUrl('');
    setParams([]);
    setHeaders([]);
    setBody('');
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

    const parameters: RequestParameter[] = params
      .filter((row) => row.key.trim())
      .map((row) => ({ name: row.key.trim(), in: 'query', example: row.value }));
    const endpoint: ApiEndpointDetail = {
      id: `manual:${Date.now()}:${Math.random()}`,
      method,
      path: trimmedUrl,
      sourceType: 'manual',
      summary: 'Manual endpoint',
      tags: ['Manual'],
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
        <DialogHeader>
          <DialogTitle>Add endpoint manually</DialogTitle>
          <DialogDescription>Define a request and save it to the active workspace.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex gap-3">
            <div className="space-y-2">
              <Label>Method</Label>

              <Select value={method.toUpperCase()} onValueChange={(value) => setMethod(value as typeof method)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {httpMethods.map((item) => (
                    <SelectItem key={item} value={item}>
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
            <Label htmlFor="manual-body">JSON body</Label>

            <Textarea
              id="manual-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder={'{"name":"Ada"}'}
              className="border-input bg-background min-h-28 w-full rounded-md border px-3 py-2 font-mono text-sm outline-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button disabled={!url.trim()} onClick={handleSubmit}>
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
      <Button size="sm" variant="outline" onClick={onAdd}>
        <Plus data-icon="inline-start" />
        Add
      </Button>
    </div>

    {rows.map((row) => (
      <div className="flex gap-2" key={row.id}>
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
        >
          <Trash2 />
        </Button>
      </div>
    ))}
  </div>
);
