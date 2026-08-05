import { httpMethods } from './constant';

export type ParameterLocation = 'query' | 'path' | 'header' | 'cookie';

export type PlaygroundTab = {
  id: string;
  endpointId: string;
};

export type ApiEndpoint = {
  method: (typeof httpMethods)[number];
  path: string;
  summary?: string;
};

export type SchemaObject = {
  type?: string;
  format?: string;
  description?: string;
  default?: unknown;
  enum?: unknown[];
  required?: string[];
  properties?: Record<string, SchemaObject>;
  items?: SchemaObject;
  nullable?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  example?: unknown;
};

export type RequestBody = {
  description?: string;
  required?: boolean;
  content?: Record<string, { schema?: SchemaObject; example?: unknown }>;
};

export type PlaygroundState = {
  activeEndpointId: string | null;
  activeRequestTabId: string | null;
  requestTabs: PlaygroundTab[];
  setActiveEndpointId: (id: string | null) => void;
  openEndpoint: (endpointId: string) => void;
  newRequest: (endpointId: string | null) => void;
  closeRequest: (tabId: string) => void;
  closeOtherRequests: (tabId: string) => void;
  setActiveRequestTab: (tabId: string) => void;
};

export type RequestParameter = {
  name: string;
  in: ParameterLocation;
  required?: boolean;
  description?: string;
  schema?: SchemaObject;
  example?: unknown;
};

export type ApiEndpointDetail = {
  id: string;
  method: ApiEndpoint['method'];
  path: string;
  baseUrl?: string;
  summary?: string;
  description?: string;
  operationId?: string;
  tags: string[];
  parameters: RequestParameter[];
  requestBody?: RequestBody;
};
