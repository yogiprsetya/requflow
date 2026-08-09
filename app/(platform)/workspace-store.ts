'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorkspaceState } from './types';

const defaultWorkspace = {
  id: 'workspace:personal',
  name: 'Personal Workspace',
  spec: null,
};

const normalizeName = (name: string): string => name.trim();

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      workspaces: [defaultWorkspace],
      activeWorkspaceId: defaultWorkspace.id,
      createWorkspace: (name) => {
        const normalizedName = normalizeName(name);
        if (!normalizedName) return null;

        const workspace = {
          id: `workspace:${Date.now()}:${Math.random()}`,
          name: normalizedName,
          spec: null,
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
        set((state) => ({
          workspaces: state.workspaces.map((workspace) => {
            if (workspace.id !== id) return workspace;
            renamed = true;
            return { ...workspace, name: normalizedName };
          }),
        }));
        return renamed;
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
    }),
    { name: 'requflow:workspaces' }
  )
);

export const getActiveWorkspace = (state: Pick<WorkspaceState, 'activeWorkspaceId' | 'workspaces'>) =>
  state.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId) ?? state.workspaces[0];
