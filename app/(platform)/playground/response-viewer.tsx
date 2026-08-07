'use client';

import { Clock3, Copy, FileJson, Gauge, Check } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { PlaygroundResponse } from '../types';
import { ScrollArea } from '~/components/ui/scroll-area';

export const ResponseViewer = ({
  url,
  method,
  response,
  isLoading,
}: {
  url: string;
  method: string;
  response: PlaygroundResponse | null;
  isLoading: boolean;
}) => {
  const [copied, setCopied] = useState(false);
  const body =
    response?.error ??
    (response ? JSON.stringify(response.body, null, 2) : '// Send a request to see the response.');

  const copy = async () => {
    await navigator.clipboard?.writeText(body);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <section className="flex min-h-0 w-96 flex-1 flex-col space-y-2 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="pl-2">
          <h3 className="text-sm font-medium">Response</h3>
          <p className="text-muted-foreground text-xs">Run the request to inspect status, headers, and body.</p>
        </div>

        <Badge variant={response?.error ? 'destructive' : 'secondary'}>
          {isLoading
            ? 'Sending'
            : response
              ? response.error
                ? 'Error'
                : response.statusText || response.status
              : 'Idle'}
        </Badge>
      </div>

      <div className="grid gap-2 pl-2 sm:grid-cols-3">
        <Metric icon={<Gauge />} label="Status" value={response ? String(response.status || 'Error') : '—'} />
        <Metric icon={<Clock3 />} label="Time" value={response ? `${response.durationMs} ms` : '—'} />
        <Metric icon={<FileJson />} label="Size" value={response ? formatBytes(response.sizeBytes) : '—'} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border border-b-0 border-l-0">
        <div className="bg-muted/30 flex items-center justify-between border-b px-3 py-2">
          <p className="font-mono text-xs">
            <span className="text-muted-foreground">{method.toUpperCase()}</span> {url}
          </p>

          <Button size="icon-sm" variant="ghost" onClick={copy} aria-label="Copy response body">
            {copied ? <Check /> : <Copy />}
          </Button>
        </div>

        <ScrollArea className="h-0 min-h-0 flex-1 basis-0">
          <pre className="text-muted-foreground bg-muted/10 p-4 font-mono text-xs">{body}</pre>
        </ScrollArea>
      </div>
    </section>
  );
};

const formatBytes = (bytes: number) => (bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`);

const Metric = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="bg-muted/10 rounded border p-3">
    <div className="text-muted-foreground flex items-center gap-2 text-xs">
      {icon}
      {label}
    </div>
    <p className="mt-2 text-sm font-semibold">{value}</p>
  </div>
);
