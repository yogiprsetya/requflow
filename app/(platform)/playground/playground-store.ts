import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IMPORTED_SPEC_UPDATED_EVENT } from '../constant';
import { parseStoredSpec } from '../openapi';
import { ApiEndpointDetail, PlaygroundState, PlaygroundTab } from '../types';
import { getActiveWorkspace, useWorkspaceStore } from '../workspace-store';

const createRequestTab = (endpointId: string): PlaygroundTab => {
  return { id: `${endpointId}:${Date.now()}:${Math.random()}`, endpointId };
};

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

export const loadEndpointDetails = (): ApiEndpointDetail[] => {
  if (typeof window === 'undefined') return [];

  const workspace = getActiveWorkspace(useWorkspaceStore.getState());
  const storedSpec = workspace?.spec ?? null;
  if (!storedSpec) return [];

  return parseStoredSpec(storedSpec);
};

// export const useEndpointById = (id: string | null): ApiEndpointDetail | undefined => {
//   if (typeof window === 'undefined') return undefined;

//   const endpoints = loadEndpointDetails();
//   return endpoints.find((endpoint) => endpoint.id === id);
// };

export const subscribeToSpecChanges = (callback: () => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener(IMPORTED_SPEC_UPDATED_EVENT, callback);
  return () => window.removeEventListener(IMPORTED_SPEC_UPDATED_EVENT, callback);
};
