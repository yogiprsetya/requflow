import { useEffect, useState } from 'react';
import { IMPORTED_SPEC_STORAGE_KEY, IMPORTED_SPEC_UPDATED_EVENT } from './constant';
import { groupEndpoints, type ApiGroup, parseStoredSpec } from './openapi';

export const useLocalSpec = (): ApiGroup[] => {
  const [apiGroups, setApiGroups] = useState<ApiGroup[]>([]);

  useEffect(() => {
    const loadGroups = () => {
      const storedSpec = localStorage.getItem(IMPORTED_SPEC_STORAGE_KEY);
      if (!storedSpec) {
        setApiGroups([]);
        return;
      }

      setApiGroups(groupEndpoints(parseStoredSpec(storedSpec)));
    };

    loadGroups();
    window.addEventListener(IMPORTED_SPEC_UPDATED_EVENT, loadGroups);
    return () => window.removeEventListener(IMPORTED_SPEC_UPDATED_EVENT, loadGroups);
  }, []);

  return apiGroups;
};
