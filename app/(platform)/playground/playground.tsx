'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { RequestBuilder } from './request-builder';
import { ResponseViewer } from './response-viewer';
import { loadEndpointDetails, subscribeToSpecChanges, usePlaygroundStore } from './playground-store';
import { ApiEndpointDetail, PlaygroundRequest, PlaygroundResponse } from '../types';
import { PlaygroundEmpty } from './playground-empty';
import { RequestTabs } from './request-tabs';

export const Playground = () => {
  const activeEndpointId = usePlaygroundStore((state) => state.activeEndpointId);
  const activeRequestTabId = usePlaygroundStore((state) => state.activeRequestTabId);
  const requestTabs = usePlaygroundStore((state) => state.requestTabs);
  const openEndpoint = usePlaygroundStore((state) => state.openEndpoint);
  const newRequest = usePlaygroundStore((state) => state.newRequest);
  const closeRequest = usePlaygroundStore((state) => state.closeRequest);
  const closeOtherRequests = usePlaygroundStore((state) => state.closeOtherRequests);
  const setActiveRequestTab = usePlaygroundStore((state) => state.setActiveRequestTab);
  const [endpoints, setEndpoints] = useState<ApiEndpointDetail[]>([]);
  const [response, setResponse] = useState<PlaygroundResponse | null>(null);
  const [isSending, setIsSending] = useState(false);

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

  const sendRequest = async (request: PlaygroundRequest) => {
    setIsSending(true);
    const startedAt = performance.now();

    try {
      const result = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
      const rawBody = await result.text();
      const contentType = result.headers.get('content-type') ?? '';
      let body: unknown = rawBody;

      if (contentType.includes('json') && rawBody) {
        try {
          body = JSON.parse(rawBody);
        } catch {
          body = rawBody;
        }
      }

      setResponse({
        status: result.status,
        statusText: result.statusText,
        headers: Object.fromEntries(result.headers.entries()),
        body,
        durationMs: Math.round(performance.now() - startedAt),
        sizeBytes: new TextEncoder().encode(rawBody).length,
      });
    } catch (error) {
      setResponse({
        status: 0,
        statusText: 'Request failed',
        headers: {},
        body: null,
        durationMs: Math.round(performance.now() - startedAt),
        sizeBytes: 0,
        error: error instanceof Error ? error.message : 'Unable to send request.',
      });
    } finally {
      setIsSending(false);
    }
  };

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
        <RequestBuilder key={activeRequestTabId ?? endpoint.id} endpoint={endpoint} onSend={sendRequest} />
        <ResponseViewer response={response} isLoading={isSending} />
      </div>
    </div>
  );
};
