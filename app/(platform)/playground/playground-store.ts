import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { httpMethods, IMPORTED_SPEC_STORAGE_KEY, IMPORTED_SPEC_UPDATED_EVENT } from '../constant';
import {
  ApiEndpointDetail,
  ParameterLocation,
  PlaygroundState,
  PlaygroundTab,
  RequestBody,
  RequestParameter,
  SchemaObject,
} from '../types';

function createRequestTab(endpointId: string): PlaygroundTab {
  return { id: `${endpointId}:${Date.now()}:${Math.random()}`, endpointId };
}

export const usePlaygroundStore = create<PlaygroundState>()(
  persist(
    (set) => ({
      activeEndpointId: null,
      activeRequestTabId: null,
      requestTabs: [],
      setActiveEndpointId: (id) => set({ activeEndpointId: id }),
      openEndpoint: (endpointId) =>
        set((state) => {
          const existingTab = state.requestTabs.find((tab) => tab.endpointId === endpointId);

          if (existingTab) {
            return {
              activeEndpointId: endpointId,
              activeRequestTabId: existingTab.id,
            };
          }

          const tab = createRequestTab(endpointId);
          return {
            activeEndpointId: endpointId,
            activeRequestTabId: tab.id,
            requestTabs: [...state.requestTabs, tab],
          };
        }),
      newRequest: (endpointId) =>
        set((state) => {
          const resolvedEndpointId = endpointId ?? state.activeEndpointId ?? state.requestTabs[0]?.endpointId;

          if (!resolvedEndpointId) return state;

          const tab = createRequestTab(resolvedEndpointId);
          return {
            activeEndpointId: resolvedEndpointId,
            activeRequestTabId: tab.id,
            requestTabs: [...state.requestTabs, tab],
          };
        }),
      closeRequest: (tabId) =>
        set((state) => {
          const tabIndex = state.requestTabs.findIndex((tab) => tab.id === tabId);
          if (tabIndex === -1) return state;

          const remainingTabs = state.requestTabs.filter((tab) => tab.id !== tabId);
          if (!remainingTabs.length) {
            return {
              activeEndpointId: null,
              activeRequestTabId: null,
              requestTabs: [],
            };
          }

          if (state.activeRequestTabId !== tabId) {
            return { requestTabs: remainingTabs };
          }

          const nextTab = remainingTabs[Math.min(tabIndex, remainingTabs.length - 1)];
          return {
            activeEndpointId: nextTab.endpointId,
            activeRequestTabId: nextTab.id,
            requestTabs: remainingTabs,
          };
        }),
      closeOtherRequests: (tabId) =>
        set((state) => {
          const tab = state.requestTabs.find((item) => item.id === tabId);
          if (!tab) return state;

          return {
            activeEndpointId: tab.endpointId,
            activeRequestTabId: tab.id,
            requestTabs: [tab],
          };
        }),
      setActiveRequestTab: (tabId) =>
        set((state) => {
          const tab = state.requestTabs.find((item) => item.id === tabId);
          return tab ? { activeRequestTabId: tab.id, activeEndpointId: tab.endpointId } : state;
        }),
    }),
    { name: 'requflow:playground' }
  )
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toSchemaObject(value: unknown): SchemaObject | undefined {
  if (!isRecord(value)) return undefined;

  const schema: SchemaObject = {};

  if (typeof value.type === 'string') schema.type = value.type;
  if (typeof value.format === 'string') schema.format = value.format;
  if (typeof value.description === 'string') schema.description = value.description;
  if ('default' in value) schema.default = value.default;
  if (Array.isArray(value.enum)) schema.enum = value.enum;
  if (Array.isArray(value.required)) schema.required = value.required as string[];
  if (value.nullable === true) schema.nullable = true;
  if (value.readOnly === true) schema.readOnly = true;
  if (value.writeOnly === true) schema.writeOnly = true;
  if ('example' in value) schema.example = value.example;

  if (isRecord(value.properties)) {
    schema.properties = {};
    for (const [key, prop] of Object.entries(value.properties)) {
      const parsed = toSchemaObject(prop);
      if (parsed) schema.properties[key] = parsed;
    }
  }

  if (isRecord(value.items)) {
    const parsed = toSchemaObject(value.items);
    if (parsed) schema.items = parsed;
  }

  return schema;
}

function toRequestParameter(value: unknown): RequestParameter | undefined {
  if (!isRecord(value)) return undefined;
  if (typeof value.name !== 'string' || !value.name) return undefined;
  if (typeof value.in !== 'string' || !value.in) return undefined;

  return {
    name: value.name,
    in: value.in as ParameterLocation,
    required: value.required === true,
    description: typeof value.description === 'string' ? value.description : undefined,
    schema: toSchemaObject(value.schema),
    example: 'example' in value ? value.example : undefined,
  };
}

function toRequestBody(value: unknown): RequestBody | undefined {
  if (!isRecord(value)) return undefined;

  const body: RequestBody = {
    required: value.required === true,
    description: typeof value.description === 'string' ? value.description : undefined,
  };

  if (isRecord(value.content)) {
    body.content = {};
    for (const [mediaType, media] of Object.entries(value.content)) {
      if (!isRecord(media)) continue;
      body.content[mediaType] = {
        schema: toSchemaObject(media.schema),
        example: 'example' in media ? media.example : undefined,
      };
    }
  }

  return body;
}

export function loadEndpointDetails(): ApiEndpointDetail[] {
  if (typeof window === 'undefined') return [];

  const storedSpec = localStorage.getItem(IMPORTED_SPEC_STORAGE_KEY);
  if (!storedSpec) return [];

  try {
    const spec: unknown = JSON.parse(storedSpec);
    if (!isRecord(spec) || !isRecord(spec.paths)) return [];
    const server = Array.isArray(spec.servers)
      ? spec.servers.find((candidate) => isRecord(candidate) && typeof candidate.url === 'string')
      : undefined;
    const baseUrl = isRecord(server) && typeof server.url === 'string' ? server.url : undefined;

    return parseEndpoints(spec.paths, baseUrl);
  } catch {
    return [];
  }
}

function parseEndpoints(paths: Record<string, unknown>, baseUrl?: string): ApiEndpointDetail[] {
  const endpoints: ApiEndpointDetail[] = [];

  for (const [path, pathItem] of Object.entries(paths)) {
    if (!isRecord(pathItem)) continue;

    for (const method of httpMethods) {
      const operation = pathItem[method];
      if (!isRecord(operation)) continue;

      const tags = Array.isArray(operation.tags)
        ? operation.tags.filter((tag): tag is string => typeof tag === 'string')
        : [];

      const parameters: RequestParameter[] = [];
      if (Array.isArray(pathItem.parameters)) {
        for (const param of pathItem.parameters) {
          const parsed = toRequestParameter(param);
          if (parsed) parameters.push(parsed);
        }
      }
      if (Array.isArray(operation.parameters)) {
        for (const param of operation.parameters) {
          const parsed = toRequestParameter(param);
          if (parsed) parameters.push(parsed);
        }
      }

      const id = `${method}:${path}`;

      endpoints.push({
        id,
        method,
        path,
        baseUrl,
        summary: typeof operation.summary === 'string' ? operation.summary : undefined,
        description: typeof operation.description === 'string' ? operation.description : undefined,
        operationId: typeof operation.operationId === 'string' ? operation.operationId : undefined,
        tags,
        parameters,
        requestBody: toRequestBody(operation.requestBody),
      });
    }
  }

  return endpoints;
}

export function useEndpointById(id: string | null): ApiEndpointDetail | undefined {
  if (typeof window === 'undefined') return undefined;

  const endpoints = loadEndpointDetails();
  return endpoints.find((endpoint) => endpoint.id === id);
}

export function subscribeToSpecChanges(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener(IMPORTED_SPEC_UPDATED_EVENT, callback);
  return () => window.removeEventListener(IMPORTED_SPEC_UPDATED_EVENT, callback);
}
