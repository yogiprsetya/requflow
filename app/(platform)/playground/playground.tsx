'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { RequestBuilder } from './request-builder';
import { ResponseViewer } from './response-viewer';
import { loadEndpointDetails, subscribeToSpecChanges, usePlaygroundStore } from './playground-store';
import { ApiEndpointDetail } from '../types';
import { PlaygroundEmpty } from './playground-empty';
import { RequestTabs } from './request-tabs';

export const Playground = () => {
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
      <div className="bg-background flex items-center justify-between gap-4 border-b">
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
