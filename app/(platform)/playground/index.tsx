'use client';

import { useEffect, useState } from 'react';
import { Braces, CopyX, FileUp, MousePointerClick, Plus, X } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '~/components/ui/empty';
import { RequestBuilder } from './request-builder';
import { ResponseViewer } from './response-viewer';
import { loadEndpointDetails, subscribeToSpecChanges, usePlaygroundStore } from './playground-store';
import { cn } from '~/lib/css';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '~/components/ui/context-menu';
import { methodTextClass } from '../utils';
import { ApiEndpointDetail } from '../types';

const Playground = () => {
  const activeEndpointId = usePlaygroundStore((state) => state.activeEndpointId);
  const activeRequestTabId = usePlaygroundStore((state) => state.activeRequestTabId);
  const requestTabs = usePlaygroundStore((state) => state.requestTabs);
  const openEndpoint = usePlaygroundStore((state) => state.openEndpoint);
  const newRequest = usePlaygroundStore((state) => state.newRequest);
  const closeRequest = usePlaygroundStore((state) => state.closeRequest);
  const setActiveRequestTab = usePlaygroundStore((state) => state.setActiveRequestTab);
  const [endpoints, setEndpoints] = useState<ApiEndpointDetail[]>([]);

  useEffect(() => {
    const refresh = () => setEndpoints(loadEndpointDetails());
    refresh();
    return subscribeToSpecChanges(refresh);
  }, []);

  useEffect(() => {
    if (!requestTabs.length && endpoints[0]) {
      openEndpoint(activeEndpointId ?? endpoints[0].id);
    }
  }, [activeEndpointId, endpoints, openEndpoint, requestTabs.length]);

  const endpointId = activeEndpointId ?? endpoints[0]?.id;
  const endpoint = endpoints.find((item) => item.id === endpointId);

  if (!endpoint) return <PlaygroundEmpty />;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="bg-primary-foreground flex items-center justify-between gap-4">
        <RequestTabs
          activeTabId={activeRequestTabId}
          endpoints={endpoints}
          tabs={requestTabs}
          onClose={closeRequest}
          onSelect={setActiveRequestTab}
        />

        <Button variant="ghost" size="icon-lg" className="mr-1" onClick={() => newRequest(endpoint.id)}>
          <Plus data-icon="inline-start" />
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 xl:flex-row">
        <RequestBuilder key={activeRequestTabId ?? endpoint.id} endpoint={endpoint} />
        <ResponseViewer url={endpoint.path} method={endpoint.method} />
      </div>
    </div>
  );
};

const RequestTabs = ({
  activeTabId,
  endpoints,
  tabs,
  onClose,
  onSelect,
}: {
  activeTabId: string | null;
  endpoints: ApiEndpointDetail[];
  tabs: { id: string; endpointId: string }[];
  onClose: (tabId: string) => void;
  onSelect: (tabId: string) => void;
}) => {
  if (!tabs.length) return null;

  return (
    <div className="flex min-h-10 items-end overflow-x-auto border-b">
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

              <ContextMenuItem>
                <CopyX /> Close Others
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        );
      })}
    </div>
  );
};

const PlaygroundEmpty = () => {
  return (
    <Empty className="h-full min-h-130 border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Braces />
        </EmptyMedia>

        <EmptyTitle>Build your first request</EmptyTitle>

        <EmptyDescription>
          Import an OpenAPI spec to automatically generate params, headers, and a request body in the Playground.
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent className="flex-row justify-center">
        <Button>
          <FileUp data-icon="inline-start" />
          Import spec
        </Button>

        <Button variant="outline">
          <MousePointerClick data-icon="inline-start" />
          Add manually
        </Button>
      </EmptyContent>
    </Empty>
  );
};

export default Playground;
