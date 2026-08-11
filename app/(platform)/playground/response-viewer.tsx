'use client';
import { Check, ChevronRight, ChevronsUpDown, Clock3, Copy, FileJson, Gauge } from 'lucide-react';
import { useState, ReactNode } from 'react';
import { Badge } from '~/components/ui/badge';
import { Button, buttonVariants } from '~/components/ui/button';
import { ScrollArea } from '~/components/ui/scroll-area';
import { PlaygroundResponse } from '../types';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '~/components/ui/navigation-menu';

export const ResponseViewer = ({
  response,
  isLoading,
}: {
  response: PlaygroundResponse | null;
  isLoading: boolean;
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'json' | 'text'>('json');
  const [expandAll, setExpandAll] = useState<boolean | null>(null);
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
        <div className="bg-muted/30 flex items-center justify-between border-b px-3 py-1">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={buttonVariants({ size: 'sm', variant: viewMode === 'json' ? 'secondary' : 'ghost' })}
                  onClick={() => setViewMode('json')}
                  render={<button />}
                >
                  JSON
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  className={buttonVariants({ size: 'sm', variant: viewMode === 'text' ? 'secondary' : 'ghost' })}
                  onClick={() => setViewMode('text')}
                  render={<button />}
                >
                  Plain text
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={copy} aria-label="Copy all response">
              {copied ? <Check /> : <Copy />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </Button>

            {viewMode === 'json' && response && !response.error && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setExpandAll(expandAll !== true)}
                aria-label={expandAll === true ? 'Collapse all JSON nodes' : 'Expand all JSON nodes'}
              >
                <ChevronsUpDown />
                <span className="hidden sm:inline">{expandAll === true ? 'Collapse' : 'Expand'}</span>
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-0 min-h-0 flex-1 basis-0">
          <div className="text-muted-foreground bg-muted/10 p-4 font-mono text-xs">
            {viewMode === 'json' && response && !response.error ? (
              <JsonTree value={response.body} expandAll={expandAll} />
            ) : (
              <pre className="whitespace-pre-wrap">{body}</pre>
            )}
          </div>
        </ScrollArea>
      </div>
    </section>
  );
};

const JsonTree = ({ value, expandAll }: { value: unknown; expandAll: boolean | null }) => (
  <JsonNode value={value} depth={0} expandAll={expandAll} />
);

const JsonNode = ({
  value,
  depth,
  label,
  isLast = true,
  expandAll,
}: {
  value: unknown;
  depth: number;
  label?: string;
  isLast?: boolean;
  expandAll: boolean | null;
}) => {
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value);
    const isArray = Array.isArray(value);
    const opening = isArray ? '[' : '{';
    const closing = isArray ? ']' : '}';

    return (
      <details open={expandAll ?? depth < 2} className="group">
        <summary className="hover:bg-muted flex cursor-pointer list-none items-center gap-1 rounded px-1">
          <ChevronRight className="size-3 shrink-0 transition-transform group-open:rotate-90" />
          {label && <JsonKey>{label}</JsonKey>}
          <span>{opening}</span>
          <span className="text-muted-foreground/70 text-[10px]">{entries.length}</span>
        </summary>

        <div className="border-muted-foreground/20 ml-2 border-l pl-3">
          {entries.map(([key, child], index) => (
            <JsonNode
              key={key}
              value={child}
              depth={depth + 1}
              label={isArray ? `${key}: ` : `${JSON.stringify(key)}: `}
              isLast={index === entries.length - 1}
              expandAll={expandAll}
            />
          ))}
        </div>

        <div className="px-1">
          <span>{closing}</span>
          {!isLast && ','}
        </div>
      </details>
    );
  }

  return (
    <div className="px-1">
      {label && <JsonKey>{label}</JsonKey>}
      <JsonValue value={value} />
      {!isLast && ','}
    </div>
  );
};

const JsonKey = ({ children }: { children: ReactNode }) => (
  <span className="text-sky-600 dark:text-sky-400">{children}</span>
);

const JsonValue = ({ value }: { value: unknown }) => {
  if (typeof value === 'string') {
    return <span className="text-emerald-600 dark:text-emerald-400">{JSON.stringify(value)}</span>;
  }

  if (typeof value === 'boolean') {
    return <span className="text-amber-600 dark:text-amber-400">{String(value)}</span>;
  }

  if (value === null) {
    return <span className="text-purple-600 dark:text-purple-400">null</span>;
  }

  return <span className="text-purple-600 dark:text-purple-400">{String(value)}</span>;
};

const formatBytes = (bytes: number) => (bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`);

const Metric = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <div className="bg-muted/10 rounded border p-3">
    <div className="text-muted-foreground flex items-center gap-2 text-xs">
      {icon}
      {label}
    </div>
    <p className="mt-2 text-sm font-semibold">{value}</p>
  </div>
);
