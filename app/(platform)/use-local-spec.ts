import { useEffect, useState } from 'react';
import { IMPORTED_SPEC_UPDATED_EVENT } from './constant';
import { groupEndpoints, type ApiGroup, parseStoredSpec } from './utils/openapi';
import { getActiveWorkspace, useWorkspaceStore } from './workspace-store';

export const useLocalSpec = (): ApiGroup[] => {
  const [apiGroups, setApiGroups] = useState<ApiGroup[]>([]);

  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const workspaces = useWorkspaceStore((state) => state.workspaces);

  useEffect(() => {
    const loadGroups = () => {
      const workspace = getActiveWorkspace({ activeWorkspaceId, workspaces });
      const storedSpec = workspace?.spec ?? null;
      const specEndpoints = storedSpec ? parseStoredSpec(storedSpec) : [];

      setApiGroups(
        groupEndpoints([...specEndpoints, ...(workspace?.manualEndpoints ?? [])], workspace?.folderNames ?? {})
      );
    };

    loadGroups();
    window.addEventListener(IMPORTED_SPEC_UPDATED_EVENT, loadGroups);
    return () => window.removeEventListener(IMPORTED_SPEC_UPDATED_EVENT, loadGroups);
  }, [activeWorkspaceId, workspaces]);

  return apiGroups;
};
