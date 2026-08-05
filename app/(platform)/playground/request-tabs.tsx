'use client';

import { CopyX, X } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '~/components/ui/context-menu';
import { cn } from '~/lib/css';
import { ApiEndpointDetail } from '../types';
import { methodTextClass } from '../utils';

type RequestTab = { id: string; endpointId: string };

type RequestTabsProps = {
  activeTabId: string | null;
  endpoints: ApiEndpointDetail[];
  tabs: RequestTab[];
  onClose: (tabId: string) => void;
  onCloseOthers: (tabId: string) => void;
  onSelect: (tabId: string) => void;
};

export const RequestTabs = ({
  activeTabId,
  endpoints,
  tabs,
  onClose,
  onCloseOthers,
  onSelect,
}: RequestTabsProps) => {
  if (!tabs.length) return null;

  return (
    <div className="flex min-h-10 items-end overflow-x-auto">
      {tabs.map((tab) => {
        const endpoint = endpoints.find((item) => item.id === tab.endpointId);

        if (!endpoint) return null;

        return (
          <ContextMenu key={tab.id}>
            <ContextMenuTrigger>
              <div
                role="button"
                onClick={() => onSelect(tab.id)}
                className={cn(
                  'group flex h-12 max-w-64 min-w-44 shrink-0 items-center gap-2 px-3 text-xs',
                  tab.id === activeTabId
                    ? 'border-b-primary text-foreground border-b-2'
                    : 'text-muted-foreground hover:bg-muted/50'
                )}
              >
                <span className={cn('font-semibold uppercase', methodTextClass(endpoint.method))}>
                  {endpoint.method}
                </span>

                <span
                  className={cn(
                    'truncate font-mono',
                    tab.id === activeTabId ? 'text-foreground' : 'text-foreground/55'
                  )}
                >
                  {endpoint.path}
                </span>
              </div>
            </ContextMenuTrigger>

            <ContextMenuContent>
              <ContextMenuItem onClick={() => onClose(tab.id)}>
                <X /> Close
              </ContextMenuItem>

              <ContextMenuItem onClick={() => onCloseOthers(tab.id)}>
                <CopyX /> Close Others
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        );
      })}
    </div>
  );
};
