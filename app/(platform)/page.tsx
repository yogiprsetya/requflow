'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { RequestBuilder } from './playground/request-builder';
import { ResponseViewer } from './playground/response-viewer';
import { loadEndpointDetails, subscribeToSpecChanges, usePlaygroundStore } from './playground/playground-store';
import { ApiEndpointDetail } from './types';
import { PlaygroundEmpty } from './playground/playground-empty';
import { RequestTabs } from './playground/request-tabs';
import { useRequestExecution } from './use-request-execution';
import { useWorkspaceStore } from './workspace-store';

const PlatformPage = () => {
  const activeEndpointId = usePlaygroundStore((state) => state.activeEndpointId);
  const activeRequestTabId = usePlaygroundStore((state) => state.activeRequestTabId);
  const requestTabs = usePlaygroundStore((state) => state.requestTabs);
  const openEndpoint = usePlaygroundStore((state) => state.openEndpoint);
  const newRequest = usePlaygroundStore((state) => state.newRequest);
  const closeRequest = usePlaygroundStore((state) => state.closeRequest);
  const closeOtherRequests = usePlaygroundStore((state) => state.closeOtherRequests);
  const setActiveRequestTab = usePlaygroundStore((state) => state.setActiveRequestTab);
  const setActiveEndpointId = usePlaygroundStore((state) => state.setActiveEndpointId);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const [endpoints, setEndpoints] = useState<ApiEndpointDetail[]>([]);
  const { getResponse, isSending, sendRequest } = useRequestExecution();

  useEffect(() => {
    const refresh = () => setEndpoints(loadEndpointDetails());
    refresh();
    return subscribeToSpecChanges(refresh);
  }, [activeWorkspaceId]);

  useEffect(() => {
    setActiveEndpointId(null);
  }, [activeWorkspaceId, setActiveEndpointId]);

  useEffect(() => {
    if (!requestTabs.length && endpoints[0]) {
      openEndpoint(activeEndpointId ?? endpoints[0].id);
    }
  }, [activeEndpointId, endpoints, openEndpoint, requestTabs.length]);

  const endpointId = activeEndpointId ?? endpoints[0]?.id;
  const endpoint = endpoints.find((item) => item.id === endpointId);
  const response = getResponse(activeRequestTabId);

  if (!endpoint) return <PlaygroundEmpty />;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="bg-background flex items-center justify-between gap-4 border-b">
        <RequestTabs
          activeTabId={activeRequestTabId}
          endpoints={endpoints}
          tabs={requestTabs}
          onClose={closeRequest}
          onCloseOthers={closeOtherRequests}
          onSelect={setActiveRequestTab}
        />

        <Button variant="ghost" size="icon-lg" className="mr-1" onClick={() => newRequest(endpoint.id)}>
          <Plus data-icon="inline-start" />
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden sm:mr-1 xl:flex-row">
        <RequestBuilder
          key={activeRequestTabId ?? endpoint.id}
          endpoint={endpoint}
          onSend={(request) => activeRequestTabId && sendRequest(activeRequestTabId, request)}
        />
        <ResponseViewer response={response} isLoading={isSending(activeRequestTabId)} />
      </div>
    </div>
  );
};

export default PlatformPage;
