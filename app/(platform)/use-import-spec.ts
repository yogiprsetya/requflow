import { useState } from 'react';
import { validateOpenApiSpec } from '~/lib/openapi-validator';
import { IMPORTED_SPEC_STORAGE_KEY } from './constant';

const acceptedExtensions = /\.(json|ya?ml)$/i;

export type ImportMethod = 'file' | 'url';

export function useImportSpec() {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<ImportMethod>('file');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [workspace, setWorkspace] = useState('current');
  const [error, setError] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const hasSource = method === 'file' ? file !== null : url.trim().length > 0;

  function reset() {
    setMethod('file');
    setFile(null);
    setUrl('');
    setWorkspace('current');
    setError('');
    setIsImporting(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) reset();
  }

  function handleOpen() {
    setOpen(true);
  }

  function handleCancel() {
    handleOpenChange(false);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    setError('');

    if (nextFile && !acceptedExtensions.test(nextFile.name)) {
      setFile(null);
      setError(
        'Choose an OpenAPI file with a .json, .yaml, or .yml extension.'
      );
      return;
    }

    setFile(nextFile);
  }

  function handleMethodChange(value: string) {
    setMethod(value as ImportMethod);
    setError('');
  }

  function handleUrlChange(value: string) {
    setUrl(value);
    setError('');
  }

  async function handleImport() {
    if (!hasSource) return;

    setError('');
    setIsImporting(true);

    try {
      let source: string;

      if (method === 'file') {
        source = await file!.text();
      } else {
        let parsedUrl: URL;

        try {
          parsedUrl = new URL(url);
          if (!/^https?:$/.test(parsedUrl.protocol)) throw new Error();
        } catch {
          throw new Error('Enter a valid HTTP or HTTPS URL.');
        }

        const response = await fetch(parsedUrl);
        if (!response.ok) {
          throw new Error(
            `Unable to fetch the spec (HTTP ${response.status}).`
          );
        }

        source = await response.text();
      }

      const result = validateOpenApiSpec(source);
      if (!result.valid || !result.spec) {
        throw new Error(
          result.errors
            .map(({ path, message }) =>
              path ? `${path}: ${message}` : message
            )
            .join(' ')
        );
      }

      localStorage.setItem(
        IMPORTED_SPEC_STORAGE_KEY,
        JSON.stringify(result.spec)
      );
      setOpen(false);
      reset();
    } catch (importError) {
      setError(
        importError instanceof Error
          ? importError.message
          : 'Unable to import the OpenAPI spec.'
      );
    } finally {
      setIsImporting(false);
    }
  }

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
}
