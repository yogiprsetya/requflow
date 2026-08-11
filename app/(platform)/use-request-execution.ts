import { useCallback, useEffect, useRef, useState } from 'react';
import { executeRequest } from './utils/request-executor';
import { PlaygroundRequest, PlaygroundResponse } from './types';

export const useRequestExecution = () => {
  const controllersRef = useRef(new Map<string, AbortController>());
  const requestIdsRef = useRef(new Map<string, number>());

  const [responses, setResponses] = useState<Record<string, PlaygroundResponse | null>>({});
  const [sendingTabs, setSendingTabs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const controllers = controllersRef.current;

    return () => {
      controllers.forEach((controller) => controller.abort());
      controllers.clear();
    };
  }, []);

  const sendRequest = useCallback(async (tabId: string, request: PlaygroundRequest) => {
    controllersRef.current.get(tabId)?.abort();
    const controller = new AbortController();
    controllersRef.current.set(tabId, controller);
    const requestId = (requestIdsRef.current.get(tabId) ?? 0) + 1;
    requestIdsRef.current.set(tabId, requestId);

    setSendingTabs((current) => ({ ...current, [tabId]: true }));
    const result = await executeRequest(request, { signal: controller.signal });

    if (requestId === requestIdsRef.current.get(tabId)) {
      setResponses((current) => ({ ...current, [tabId]: result }));
      setSendingTabs((current) => ({ ...current, [tabId]: false }));
      controllersRef.current.delete(tabId);
    }
  }, []);

  const cancelRequest = useCallback((tabId: string) => {
    controllersRef.current.get(tabId)?.abort();
  }, []);

  return {
    cancelRequest,
    getResponse: (tabId: string | null) => (tabId ? (responses[tabId] ?? null) : null),
    isSending: (tabId: string | null) => (tabId ? Boolean(sendingTabs[tabId]) : false),
    sendRequest,
  };
};
