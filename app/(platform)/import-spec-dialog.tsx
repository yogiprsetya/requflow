'use client';

import { useState } from 'react';
import { FileUp, Link2 } from 'lucide-react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Label } from '~/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';

const acceptedExtensions = /\.(json|ya?ml)$/i;

type ImportMethod = 'file' | 'url';

export function ImportSpecDialog() {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<ImportMethod>('file');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [workspace, setWorkspace] = useState('current');
  const [error, setError] = useState('');

  const hasSource = method === 'file' ? file !== null : url.trim().length > 0;

  function reset() {
    setMethod('file');
    setFile(null);
    setUrl('');
    setWorkspace('current');
    setError('');
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) reset();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    setError('');

    if (nextFile && !acceptedExtensions.test(nextFile.name)) {
      setFile(null);
      setError(
        'Choose an OpenAPI file with a .json, .yaml, or .yml extension.'
      );
      return;
    }

    setFile(nextFile);
  }

  function handleImport() {
    if (!hasSource) return;

    if (method === 'url') {
      try {
        const parsedUrl = new URL(url);
        if (!/^https?:$/.test(parsedUrl.protocol)) throw new Error();
      } catch {
        setError('Enter a valid HTTP or HTTPS URL.');
        return;
      }
    }

    setOpen(false);
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button onClick={() => setOpen(true)}>Import Spec</Button>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
              <FileUp aria-hidden="true" />
            </div>

            <div className="flex flex-col gap-1">
              <DialogTitle>Import OpenAPI spec</DialogTitle>

              <DialogDescription>
                Add endpoints from an OpenAPI JSON or YAML document.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs
          value={method}
          orientation="vertical"
          onValueChange={(value) => {
            setMethod(value as ImportMethod);
            setError('');
          }}
        >
          <TabsList
            className="grid h-10 w-full grid-cols-2"
            aria-label="Import source"
          >
            <TabsTrigger value="file">
              <FileUp data-icon="inline-start" />
              Upload file
            </TabsTrigger>

            <TabsTrigger value="url">
              <Link2 data-icon="inline-start" />
              Import from URL
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="file"
            className="bg-muted/20 mt-3 rounded-lg border p-4"
          >
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor="openapi-file">OpenAPI file</Label>
                <span className="text-muted-foreground text-xs">
                  Select a JSON, YAML, or YML file to upload.
                </span>
              </div>

              <Input
                id="openapi-file"
                type="file"
                accept=".json,.yaml,.yml,application/json,application/yaml,text/yaml"
                onChange={handleFileChange}
              />

              {file && (
                <p className="text-muted-foreground truncate text-xs">
                  Selected: {file.name}
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent
            value="url"
            className="bg-muted/20 mt-3 rounded-lg border p-4"
          >
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
                onChange={(event) => {
                  setUrl(event.target.value);
                  setError('');
                }}
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

          <Select
            value={workspace}
            onValueChange={(value) => setWorkspace(value ?? 'current')}
          >
            <SelectTrigger id="workspace-target" className="w-full">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="current">Current workspace</SelectItem>
              <SelectItem value="new">New workspace</SelectItem>
            </SelectContent>
          </Select>

          {error && (
            <p
              className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-xs"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button size="lg" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button size="lg" disabled={!hasSource} onClick={handleImport}>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
