import { type ApiEndpoint, type RequestParameter, type SchemaObject } from '../types';

export const methodBadgeClass = (method: ApiEndpoint['method']): string => {
  switch (method) {
    case 'get':
      return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-transparent';
    case 'post':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-transparent';
    case 'put':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-transparent';
    case 'patch':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-transparent';
    case 'delete':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-transparent';
    default:
      return 'bg-card text-muted-foreground border-border';
  }
};

export const methodTextClass = (method: ApiEndpoint['method']): string => {
  switch (method) {
    case 'get':
      return 'text-green-800 dark:text-green-300';
    case 'post':
      return 'text-yellow-800 dark:text-yellow-300';
    case 'put':
      return 'text-blue-800 dark:text-blue-300';
    case 'patch':
      return 'text-purple-800 dark:text-purple-300';
    case 'delete':
      return 'text-red-800 dark:text-red-300';
    default:
      return 'text-muted-foreground';
  }
};

export const jsonValidationError = (value: string): string | undefined => {
  try {
    JSON.parse(value);
    return undefined;
  } catch {
    return 'Request body must be valid JSON.';
  }
};

export const placeholderFor = (schema?: SchemaObject): string => {
  if (!schema) return 'Enter value';
  if (schema.example !== undefined) return String(schema.example);
  if (schema.default !== undefined) return String(schema.default);
  return schema.type === 'integer' || schema.type === 'number'
    ? '0'
    : schema.type === 'boolean'
      ? 'true'
      : 'Enter value';
};

export const createBodyValue = (schema?: SchemaObject): string => {
  if (!schema) return '{}';

  const value = Object.fromEntries(
    Object.entries(schema.properties ?? {})
      .filter(([, property]) => !property.readOnly)
      .map(([key, property]) => [key, property.example ?? property.default ?? sampleValue(property)])
  );

  return JSON.stringify(schema.type === 'array' ? [sampleValue(schema.items)] : value, null, 2);
};

export const sampleValue = (schema?: SchemaObject): unknown => {
  if (!schema) return '';
  if (schema.enum?.length) return schema.enum[0];
  if (schema.type === 'integer' || schema.type === 'number') return 0;
  if (schema.type === 'boolean') return false;
  if (schema.type === 'array') return [sampleValue(schema.items)];
  if (schema.type === 'object')
    return Object.fromEntries(
      Object.entries(schema.properties ?? {}).map(([key, property]) => [key, sampleValue(property)])
    );

  return '';
};

export const DEFAULT_BODY_MEDIA_TYPE = 'application/json';
export const COPY_FEEDBACK_MS = 1200;
export const BODY_JSON_ERROR = 'Request body must be valid JSON.';

export const groupParametersByLocation = (parameters: RequestParameter[]) => {
  const groups = {
    path: [] as RequestParameter[],
    query: [] as RequestParameter[],
    header: [] as RequestParameter[],
    cookie: [] as RequestParameter[],
  };
  for (const parameter of parameters) {
    groups[parameter.in].push(parameter);
  }
  return groups;
};

export type RequestHeader = { key: string; value: string; enabled: boolean };

export const buildRequestHeaders = (headers: RequestHeader[]): Record<string, string> =>
  Object.fromEntries(
    headers.filter((header) => header.enabled && header.key.trim()).map((header) => [header.key, header.value])
  );

export const buildRequestUrl = (
  pathUrl: string,
  parameters: RequestParameter[],
  values: Record<string, string>,
  baseUrl: string
): string => {
  let resolvedPath = pathUrl;

  for (const parameter of parameters) {
    if (parameter.in !== 'path') continue;
    const value = values[parameter.name];
    if (!value) continue;
    resolvedPath = resolvedPath.replace(`{${parameter.name}}`, encodeURIComponent(value));
  }

  const url = new URL(resolvedPath, baseUrl);

  for (const parameter of parameters) {
    if (parameter.in !== 'query') continue;
    const value = values[parameter.name];
    if (!value) continue;
    url.searchParams.set(parameter.name, value);
  }

  return url.toString();
};
