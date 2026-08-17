'use client';

import { useRef } from 'react';
import { cn } from '~/lib/css';
import { highlightJson } from './highlight-json';

export type JsonEditorProps = {
  value: string;
  onChange: (value: string) => void;
  hasError: boolean;
};

export const JsonEditor = ({ value, onChange, hasError }: JsonEditorProps) => {
  const highlightRef = useRef<HTMLPreElement>(null);

  const syncScroll = (event: React.UIEvent<HTMLTextAreaElement>) => {
    if (!highlightRef.current) return;
    highlightRef.current.scrollTop = event.currentTarget.scrollTop;
    highlightRef.current.scrollLeft = event.currentTarget.scrollLeft;
  };

  return (
    <div
      className={cn(
        'bg-muted focus-within:ring-ring/50 relative min-h-64 overflow-hidden rounded-lg border focus-within:ring-3',
        hasError ? 'border-destructive' : 'border-input focus-within:border-ring'
      )}
    >
      <pre
        ref={highlightRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 m-0 overflow-hidden p-4 font-mono text-xs leading-normal wrap-break-word whitespace-pre-wrap"
      >
        {highlightJson(value)}
      </pre>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onScroll={syncScroll}
        className="caret-foreground selection:bg-primary/20 relative block min-h-64 w-full resize-y overflow-auto bg-transparent p-4 font-mono text-xs leading-normal text-transparent outline-none"
        spellCheck={false}
        aria-label="Request body"
        aria-invalid={hasError}
      />
    </div>
  );
};
