'use client';

import { Clock3, Copy, FileJson, Gauge, Check } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';

export function ResponseViewer({ url, method }: { url: string; method: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard?.writeText(JSON.stringify({ message: 'Response runner ready' }, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Response</h3>
          <p className="text-muted-foreground text-xs">Run the request to inspect status, headers, and body.</p>
        </div>
        <Badge variant="secondary">Idle</Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric icon={<Gauge />} label="Status" value="—" />
        <Metric icon={<Clock3 />} label="Time" value="—" />
        <Metric icon={<FileJson />} label="Size" value="—" />
      </div>
      <div className="overflow-hidden rounded-lg border">
        <div className="bg-muted/30 flex items-center justify-between border-b px-3 py-2">
          <p className="font-mono text-xs">
            <span className="text-muted-foreground">{method.toUpperCase()}</span> {url}
          </p>
          <Button size="icon-sm" variant="ghost" onClick={copy} aria-label="Copy response body">
            {copied ? <Check /> : <Copy />}
          </Button>
        </div>
        <pre className="text-muted-foreground bg-muted/10 min-h-40 overflow-auto p-4 font-mono text-xs">
          {'// Response data will appear here after the request runner is connected.'}
        </pre>
      </div>
    </section>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-muted/10 rounded-lg border p-3">
      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}
