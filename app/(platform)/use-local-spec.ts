import { useEffect, useState } from 'react';
import { IMPORTED_SPEC_STORAGE_KEY } from './constant';

const httpMethods = [
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'options',
  'head',
  'trace',
] as const;

export type ApiEndpoint = {
  method: (typeof httpMethods)[number];
  path: string;
  summary?: string;
};

export type ApiGroup = {
  tag: string;
  endpoints: ApiEndpoint[];
};

export function useLocalSpec(): ApiGroup[] {
  const [apiGroups, setApiGroups] = useState<ApiGroup[]>([]);

  useEffect(() => {
    const storedSpec = localStorage.getItem(IMPORTED_SPEC_STORAGE_KEY);
    if (!storedSpec) return;

    let groups: ApiGroup[] = [];

    try {
      const spec: unknown = JSON.parse(storedSpec);
      if (isRecord(spec) && isRecord(spec.paths)) {
        groups = groupEndpoints(spec.paths);
      }
    } catch {}

    const updateGroups = window.setTimeout(() => setApiGroups(groups), 0);
    return () => window.clearTimeout(updateGroups);
  }, []);

  return apiGroups;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function groupEndpoints(paths: Record<string, unknown>): ApiGroup[] {
  const groups = new Map<string, ApiEndpoint[]>();

  for (const [path, pathItem] of Object.entries(paths)) {
    if (!isRecord(pathItem)) continue;

    for (const method of httpMethods) {
      const operation = pathItem[method];
      if (!isRecord(operation)) continue;

      const tags = Array.isArray(operation.tags)
        ? operation.tags.filter((tag): tag is string => typeof tag === 'string')
        : [];
      const tag = tags[0] || 'Other';
      const endpoints = groups.get(tag) ?? [];

      endpoints.push({
        method,
        path,
        summary:
          typeof operation.summary === 'string' ? operation.summary : undefined,
      });
      groups.set(tag, endpoints);
    }
  }

  return [...groups.entries()]
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([tag, endpoints]) => ({ tag, endpoints }));
}
