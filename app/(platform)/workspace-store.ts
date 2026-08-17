'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Environment, WorkspaceState } from './types';

const defaultEnvironments: Environment[] = [
  { id: 'development', name: 'Development' },
  { id: 'staging', name: 'Staging' },
  { id: 'production', name: 'Production' },
];

const defaultWorkspace = {
  id: 'workspace:personal',
  name: 'Personal Workspace',
  spec: null,
  manualEndpoints: [],
  environments: defaultEnvironments,
  activeEnvironmentId: defaultEnvironments[0].id,
  folderNames: {},
};

const normalizeName = (name: string): string => name.trim();

export const removeWorkspace = (
  workspaces: WorkspaceState['workspaces'],
  activeWorkspaceId: string,
  workspaceId: string
) => {
  if (workspaces.length <= 1 || !workspaces.some((workspace) => workspace.id === workspaceId)) {
    return { workspaces, activeWorkspaceId, deleted: false };
  }

  const remainingWorkspaces = workspaces.filter((workspace) => workspace.id !== workspaceId);
  return {
    workspaces: remainingWorkspaces,
    activeWorkspaceId: activeWorkspaceId === workspaceId ? remainingWorkspaces[0].id : activeWorkspaceId,
    deleted: true,
  };
};

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [defaultWorkspace],
      activeWorkspaceId: defaultWorkspace.id,
      createWorkspace: (name) => {
        const normalizedName = normalizeName(name);
        if (!normalizedName) return null;

        const workspace = {
          id: `workspace:${Date.now()}:${Math.random()}`,
          name: normalizedName,
          spec: null,
          manualEndpoints: [],
          environments: defaultEnvironments,
          activeEnvironmentId: defaultEnvironments[0].id,
        };
        set((state) => ({
          workspaces: [...state.workspaces, workspace],
          activeWorkspaceId: workspace.id,
        }));
        return workspace.id;
      },
      renameWorkspace: (id, name) => {
        const normalizedName = normalizeName(name);
        if (!normalizedName) return false;

        let renamed = false;
        const nextWorkspaces = get().workspaces.map((workspace) => {
          if (workspace.id !== id) return workspace;
          renamed = true;
          return { ...workspace, name: normalizedName };
        });
        if (renamed) set({ workspaces: nextWorkspaces });
        return renamed;
      },
      deleteWorkspace: (id) => {
        const next = removeWorkspace(get().workspaces, get().activeWorkspaceId, id);
        if (!next.deleted) return false;
        set({ workspaces: next.workspaces, activeWorkspaceId: next.activeWorkspaceId });
        return true;
      },
      selectWorkspace: (id) =>
        set((state) =>
          state.workspaces.some((workspace) => workspace.id === id) ? { activeWorkspaceId: id } : state
        ),
      setWorkspaceSpec: (id, spec) =>
        set((state) => ({
          workspaces: state.workspaces.map((workspace) =>
            workspace.id === id ? { ...workspace, spec } : workspace
          ),
        })),
      addManualEndpoint: (id, endpoint) =>
        set((state) => ({
          workspaces: state.workspaces.map((workspace) =>
            workspace.id === id
              ? { ...workspace, manualEndpoints: [...workspace.manualEndpoints, endpoint] }
              : workspace
          ),
        })),
      renameFolder: (workspaceId, tag, name) => {
        const normalizedName = normalizeName(name);
        if (!normalizedName || !tag) return false;

        let renamed = false;
        const nextWorkspaces = get().workspaces.map((workspace) => {
          if (workspace.id !== workspaceId) return workspace;
          renamed = true;
          return {
            ...workspace,
            folderNames: { ...workspace.folderNames, [tag]: normalizedName },
          };
        });
        if (renamed) set({ workspaces: nextWorkspaces });
        return renamed;
      },
      selectEnvironment: (workspaceId, environmentId) =>
        set((state) => ({
          workspaces: state.workspaces.map((workspace) =>
            workspace.id === workspaceId &&
            workspace.environments.some((environment) => environment.id === environmentId)
              ? { ...workspace, activeEnvironmentId: environmentId }
              : workspace
          ),
        })),
    }),
    {
      name: 'requflow:workspaces',
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as WorkspaceState;
        return {
          ...state,
          workspaces: state.workspaces.map((workspace) => ({
            ...workspace,
            manualEndpoints: workspace.manualEndpoints ?? [],
            environments: workspace.environments ?? defaultEnvironments,
            activeEnvironmentId: workspace.activeEnvironmentId ?? defaultEnvironments[0].id,
            folderNames: workspace.folderNames ?? {},
          })),
        };
      },
    }
  )
);

export const getActiveWorkspace = (state: Pick<WorkspaceState, 'activeWorkspaceId' | 'workspaces'>) =>
  state.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId) ?? state.workspaces[0];
