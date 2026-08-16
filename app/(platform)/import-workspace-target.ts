export type ImportWorkspace = {
  id: string;
  name: string;
};

export type ImportWorkspaceOption = ImportWorkspace & {
  isActive: boolean;
};

export const CREATE_NEW_WORKSPACE_OPTION_ID = '__create_new_workspace__';

export const getImportWorkspaceOptions = (
  workspaces: ImportWorkspace[],
  activeWorkspaceId: string
): ImportWorkspaceOption[] => [
  ...workspaces.map((workspace) => ({
    ...workspace,
    isActive: workspace.id === activeWorkspaceId,
  })),
  { id: CREATE_NEW_WORKSPACE_OPTION_ID, name: 'Create new workspace', isActive: false },
];

export const resolveImportWorkspaceId = (
  selectedWorkspaceId: string,
  workspaces: ImportWorkspace[],
  activeWorkspaceId: string
): string => {
  if (selectedWorkspaceId === CREATE_NEW_WORKSPACE_OPTION_ID) return '';
  if (workspaces.some((workspace) => workspace.id === selectedWorkspaceId)) return selectedWorkspaceId;
  if (workspaces.some((workspace) => workspace.id === activeWorkspaceId)) return activeWorkspaceId;
  return workspaces[0]?.id ?? '';
};

export const isCreateNewWorkspaceOption = (value: string): boolean => value === CREATE_NEW_WORKSPACE_OPTION_ID;
