import { useEffect, useState } from 'react';
import { httpMethods, IMPORTED_SPEC_STORAGE_KEY, IMPORTED_SPEC_UPDATED_EVENT } from './constant';
import { ApiEndpoint } from './types';

type ApiGroup = {
  tag: string;
  endpoints: ApiEndpoint[];
};

export const useLocalSpec = (): ApiGroup[] => {
  const [apiGroups, setApiGroups] = useState<ApiGroup[]>([]);

  useEffect(() => {
    const loadGroups = () => {
      const storedSpec = localStorage.getItem(IMPORTED_SPEC_STORAGE_KEY);
      if (!storedSpec) {
        setApiGroups([]);
        return;
      }

      let groups: ApiGroup[] = [];

      try {
        const spec: unknown = JSON.parse(storedSpec);
        if (isRecord(spec) && isRecord(spec.paths)) {
          groups = groupEndpoints(spec.paths);
        }
      } catch {}

      setApiGroups(groups);
    };

    loadGroups();
    window.addEventListener(IMPORTED_SPEC_UPDATED_EVENT, loadGroups);
    return () => window.removeEventListener(IMPORTED_SPEC_UPDATED_EVENT, loadGroups);
  }, []);

  return apiGroups;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const groupEndpoints = (paths: Record<string, unknown>): ApiGroup[] => {
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
        summary: typeof operation.summary === 'string' ? operation.summary : undefined,
      });
      groups.set(tag, endpoints);
    }
  }

  return [...groups.entries()]
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([tag, endpoints]) => ({ tag, endpoints }));
};
