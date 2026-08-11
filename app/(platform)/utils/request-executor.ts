import { PlaygroundRequest, PlaygroundResponse } from '../types';

const DEFAULT_TIMEOUT_MS = 30_000;

type ExecuteRequestOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

export const executeRequest = async (
  request: PlaygroundRequest,
  options: ExecuteRequestOptions = {}
): Promise<PlaygroundResponse> => {
  const startedAt = performance.now();
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const signal = options.signal ? combineSignals(options.signal, controller.signal) : controller.signal;

  try {
    const result = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      signal,
    });
    const rawBody = await result.text();
    const contentType = result.headers.get('content-type') ?? '';
    const body = parseResponseBody(rawBody, contentType);

    return {
      status: result.status,
      statusText: result.statusText,
      headers: Object.fromEntries(result.headers.entries()),
      body,
      durationMs: Math.round(performance.now() - startedAt),
      sizeBytes: new TextEncoder().encode(rawBody).length,
    };
  } catch (error) {
    return {
      status: 0,
      statusText: 'Request failed',
      headers: {},
      body: null,
      durationMs: Math.round(performance.now() - startedAt),
      sizeBytes: 0,
      error:
        error instanceof DOMException && error.name === 'AbortError'
          ? 'The request timed out or was cancelled.'
          : error instanceof Error
            ? error.message
            : 'Unable to send request.',
    };
  } finally {
    window.clearTimeout(timeout);
  }
};

const parseResponseBody = (body: string, contentType: string): unknown => {
  if (!body || !contentType.includes('json')) return body;

  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
};

const combineSignals = (first: AbortSignal, second: AbortSignal): AbortSignal => {
  if (typeof AbortSignal.any === 'function') return AbortSignal.any([first, second]);

  const controller = new AbortController();
  const abort = () => controller.abort();
  first.addEventListener('abort', abort, { once: true });
  second.addEventListener('abort', abort, { once: true });
  return controller.signal;
};
