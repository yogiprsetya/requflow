import { Workspace } from '../types';
import YAML from 'yaml';

export type ExportFormat = 'json' | 'yaml';

type ExportedWorkspace = {
  name: string;
  spec: string | null;
  manualEndpoints: Workspace['manualEndpoints'];
  environments: Workspace['environments'];
  activeEnvironmentId: string;
  folderNames: Record<string, string>;
};

export const serializeWorkspace = (workspace: Workspace): ExportedWorkspace => ({
  name: workspace.name,
  spec: workspace.spec,
  manualEndpoints: workspace.manualEndpoints,
  environments: workspace.environments,
  activeEnvironmentId: workspace.activeEnvironmentId,
  folderNames: workspace.folderNames ?? {},
});

export const exportWorkspace = (workspace: Workspace, format: ExportFormat): string => {
  const payload = serializeWorkspace(workspace);

  if (format === 'yaml') {
    return YAML.stringify(payload, { indent: 2, lineWidth: 0 });
  }

  return JSON.stringify(payload, null, 2);
};

export const downloadExport = (workspace: Workspace, format: ExportFormat): void => {
  const content = exportWorkspace(workspace, format);
  const mimeType = format === 'yaml' ? 'application/yaml' : 'application/json';
  const extension = format === 'yaml' ? 'yaml' : 'json';
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const sanitizedName = workspace.name.replace(/[^a-z0-9_\-]/gi, '-').toLowerCase() || 'workspace';

  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizedName}-export.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
