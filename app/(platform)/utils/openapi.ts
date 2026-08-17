import { httpMethods } from '../constant';
import {
  ApiEndpoint,
  ApiEndpointDetail,
  ParameterLocation,
  RequestBody,
  RequestParameter,
  SchemaObject,
} from '../types';

export type ApiGroup = {
  tag: string;
  label: string;
  endpoints: ApiEndpoint[];
};

type OpenApiRecord = Record<string, unknown>;

export const parseStoredSpec = (storedSpec: string | null): ApiEndpointDetail[] => {
  if (!storedSpec) return [];

  try {
    const spec: unknown = JSON.parse(storedSpec);
    if (!isRecord(spec) || !isRecord(spec.paths)) return [];

    const server = Array.isArray(spec.servers)
      ? spec.servers.find((candidate) => isRecord(candidate) && typeof candidate.url === 'string')
      : undefined;
    const baseUrl = isRecord(server) && typeof server.url === 'string' ? server.url : undefined;
    const components = isRecord(spec.components) ? spec.components : undefined;
    const parameterComponents = components && isRecord(components.parameters) ? components.parameters : undefined;

    return parseEndpoints(spec.paths, baseUrl, parameterComponents);
  } catch {
    return [];
  }
};

export const groupEndpoints = (
  endpoints: ApiEndpointDetail[],
  folderNames: Record<string, string> = {}
): ApiGroup[] => {
  const groups = new Map<string, ApiEndpoint[]>();

  for (const endpoint of endpoints) {
    const tag = endpoint.tags[0] || 'Other';
    const group = groups.get(tag) ?? [];
    group.push({
      method: endpoint.method,
      path: endpoint.path,
      summary: endpoint.summary,
      sourceType: endpoint.sourceType,
    });
    groups.set(tag, group);
  }

  return [...groups.entries()]
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([tag, groupEndpoints]) => ({ tag, label: folderNames[tag] ?? tag, endpoints: groupEndpoints }));
};

const parseEndpoints = (
  paths: OpenApiRecord,
  baseUrl?: string,
  parameterComponents?: OpenApiRecord
): ApiEndpointDetail[] => {
  const endpoints: ApiEndpointDetail[] = [];

  for (const [path, pathItem] of Object.entries(paths)) {
    if (!isRecord(pathItem)) continue;

    for (const method of httpMethods) {
      const operation = pathItem[method];
      if (!isRecord(operation)) continue;

      const parameters = [
        ...(Array.isArray(pathItem.parameters) ? pathItem.parameters : []),
        ...(Array.isArray(operation.parameters) ? operation.parameters : []),
      ].flatMap((parameter) => {
        const parsed = toRequestParameter(parameter, parameterComponents);
        return parsed ? [parsed] : [];
      });
      const tags = Array.isArray(operation.tags)
        ? operation.tags.filter((tag): tag is string => typeof tag === 'string')
        : [];

      endpoints.push({
        id: `${method}:${path}`,
        method,
        path,
        sourceType: 'spec',
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
};

const toRequestParameter = (
  value: unknown,
  parameterComponents?: OpenApiRecord
): RequestParameter | undefined => {
  if (isRecord(value) && typeof value.$ref === 'string' && parameterComponents) {
    const reference = value.$ref.match(/^#\/components\/parameters\/([^/]+)$/);
    value = reference ? parameterComponents[reference[1]] : value;
  }

  if (!isRecord(value) || typeof value.name !== 'string' || !value.name || typeof value.in !== 'string') {
    return undefined;
  }

  return {
    name: value.name,
    in: value.in as ParameterLocation,
    required: value.required === true,
    description: typeof value.description === 'string' ? value.description : undefined,
    schema: toSchemaObject(value.schema),
    example: 'example' in value ? value.example : undefined,
  };
};

const toRequestBody = (value: unknown): RequestBody | undefined => {
  if (!isRecord(value)) return undefined;

  const body: RequestBody = {
    required: value.required === true,
    description: typeof value.description === 'string' ? value.description : undefined,
  };

  if (isRecord(value.content)) {
    body.content = Object.fromEntries(
      Object.entries(value.content).flatMap(([mediaType, media]) => {
        if (!isRecord(media)) return [];
        return [
          [
            mediaType,
            { schema: toSchemaObject(media.schema), example: 'example' in media ? media.example : undefined },
          ],
        ];
      })
    );
  }

  return body;
};

const toSchemaObject = (value: unknown): SchemaObject | undefined => {
  if (!isRecord(value)) return undefined;

  const schema: SchemaObject = {};
  if (typeof value.type === 'string') schema.type = value.type;
  if (typeof value.format === 'string') schema.format = value.format;
  if (typeof value.description === 'string') schema.description = value.description;
  if ('default' in value) schema.default = value.default;
  if (Array.isArray(value.enum)) schema.enum = value.enum;
  if (Array.isArray(value.required))
    schema.required = value.required.filter((item): item is string => typeof item === 'string');
  if (value.nullable === true) schema.nullable = true;
  if (value.readOnly === true) schema.readOnly = true;
  if (value.writeOnly === true) schema.writeOnly = true;
  if ('example' in value) schema.example = value.example;

  if (isRecord(value.properties)) {
    schema.properties = Object.fromEntries(
      Object.entries(value.properties).flatMap(([key, property]) => {
        const parsed = toSchemaObject(property);
        return parsed ? [[key, parsed]] : [];
      })
    );
  }

  schema.items = toSchemaObject(value.items);
  return schema;
};

const isRecord = (value: unknown): value is OpenApiRecord => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};
