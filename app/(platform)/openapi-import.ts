import { validateOpenApiSpec } from '~/lib/openapi-validator';

const acceptedExtensions = /\.(json|ya?ml)$/i;
const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_MAX_SOURCE_BYTES = 5 * 1024 * 1024;

type ImportSpecOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
  maxBytes?: number;
};

export const isSupportedSpecFile = (file: File): boolean => acceptedExtensions.test(file.name);

export const importSpecFromFile = async (file: File, options: ImportSpecOptions = {}): Promise<string> => {
  if (!isSupportedSpecFile(file)) {
    throw new Error('Choose an OpenAPI file with a .json, .yaml, or .yml extension.');
  }

  const maxBytes = options.maxBytes ?? DEFAULT_MAX_SOURCE_BYTES;
  if (file.size > maxBytes) {
    throw new Error(`The OpenAPI file must be smaller than ${formatMegabytes(maxBytes)}.`);
  }

  return file.text();
};

export const importSpecFromUrl = async (value: string, options: ImportSpecOptions = {}): Promise<string> => {
  const url = parseHttpUrl(value);
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const signal = options.signal ? combineSignals(options.signal, controller.signal) : controller.signal;

  try {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new Error(`Unable to fetch the spec (HTTP ${response.status}).`);
    }

    const maxBytes = options.maxBytes ?? DEFAULT_MAX_SOURCE_BYTES;
    const contentLength = Number(response.headers.get('content-length'));
    if (Number.isFinite(contentLength) && contentLength > maxBytes) {
      throw new Error(`The OpenAPI response must be smaller than ${formatMegabytes(maxBytes)}.`);
    }

    return readResponseText(response, maxBytes);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Fetching the OpenAPI spec timed out or was cancelled.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
};

export const validateImportedSpec = (source: string): string => {
  const result = validateOpenApiSpec(source);
  if (!result.valid || !result.spec) {
    throw new Error(result.errors.map(({ path, message }) => (path ? `${path}: ${message}` : message)).join(' '));
  }

  return JSON.stringify(result.spec);
};

const readResponseText = async (response: Response, maxBytes: number): Promise<string> => {
  if (!response.body) return response.text();

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const chunks: string[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        throw new Error(`The OpenAPI response must be smaller than ${formatMegabytes(maxBytes)}.`);
      }

      chunks.push(decoder.decode(value, { stream: true }));
    }

    chunks.push(decoder.decode());
    return chunks.join('');
  } finally {
    reader.releaseLock();
  }
};

const parseHttpUrl = (value: string): URL => {
  try {
    const url = new URL(value.trim());
    if (!/^https?:$/.test(url.protocol)) throw new Error();
    return url;
  } catch {
    throw new Error('Enter a valid HTTP or HTTPS URL.');
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

const formatMegabytes = (bytes: number): string => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
