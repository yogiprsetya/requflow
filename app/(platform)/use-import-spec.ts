import { useState } from 'react';
import { IMPORTED_SPEC_UPDATED_EVENT } from './constant';
import {
  importSpecFromFile,
  importSpecFromUrl,
  isSupportedSpecFile,
  validateImportedSpec,
} from './utils/openapi-import';
import { getActiveWorkspace, useWorkspaceStore } from './workspace-store';

export type ImportMethod = 'file' | 'url';

export const useImportSpec = () => {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<ImportMethod>('file');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [workspace, setWorkspace] = useState('current');
  const [error, setError] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const setWorkspaceSpec = useWorkspaceStore((state) => state.setWorkspaceSpec);

  const hasSource = method === 'file' ? file !== null : url.trim().length > 0;

  const reset = () => {
    setMethod('file');
    setFile(null);
    setUrl('');
    setWorkspace('current');
    setError('');
    setIsImporting(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) reset();
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    handleOpenChange(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setError('');

    if (nextFile && !isSupportedSpecFile(nextFile)) {
      setFile(null);
      setError('Choose an OpenAPI file with a .json, .yaml, or .yml extension.');
      return;
    }

    setFile(nextFile);
  };

  const handleMethodChange = (value: string) => {
    setMethod(value as ImportMethod);
    setError('');
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setError('');
  };

  const handleImport = async () => {
    if (!hasSource) return;

    setError('');
    setIsImporting(true);

    try {
      let source: string;
      if (method === 'file') {
        if (!file) throw new Error('Select an OpenAPI file.');
        source = await importSpecFromFile(file);
      } else {
        source = await importSpecFromUrl(url);
      }
      const serializedSpec = validateImportedSpec(source);

      const targetWorkspaceId =
        workspace === 'current' ? activeWorkspaceId : getActiveWorkspace(useWorkspaceStore.getState()).id;
      setWorkspaceSpec(targetWorkspaceId, serializedSpec);
      window.dispatchEvent(new Event(IMPORTED_SPEC_UPDATED_EVENT));
      setOpen(false);
      reset();
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : 'Unable to import the OpenAPI spec.');
    } finally {
      setIsImporting(false);
    }
  };

  return {
    error,
    file,
    handleFileChange,
    handleImport,
    handleMethodChange,
    handleOpen,
    handleOpenChange,
    handleCancel,
    handleUrlChange,
    hasSource,
    isImporting,
    method,
    open,
    setWorkspace,
    url,
    workspace,
  };
};
