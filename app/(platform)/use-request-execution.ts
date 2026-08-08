import { useCallback, useEffect, useRef, useState } from 'react';
import { executeRequest } from './request-executor';
import { PlaygroundRequest, PlaygroundResponse } from './types';

export const useRequestExecution = () => {
  const controllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const [response, setResponse] = useState<PlaygroundResponse | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  const sendRequest = useCallback(async (request: PlaygroundRequest) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const requestId = ++requestIdRef.current;

    setIsSending(true);
    const result = await executeRequest(request, { signal: controller.signal });

    if (requestId === requestIdRef.current) {
      setResponse(result);
      setIsSending(false);
    }
  }, []);

  const cancelRequest = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  return { cancelRequest, isSending, response, sendRequest };
};
