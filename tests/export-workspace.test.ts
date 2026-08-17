import assert from 'node:assert/strict';
import test from 'node:test';
import { exportWorkspace, serializeWorkspace } from '../app/(platform)/utils/export-workspace.js';
import type { Workspace } from '../app/(platform)/types.js';

const createWorkspace = (): Workspace => ({
  id: 'workspace:test',
  name: 'Test Workspace',
  spec: JSON.stringify({ openapi: '3.0.0', paths: {} }),
  manualEndpoints: [
    {
      id: 'get:/health',
      method: 'get',
      path: '/health',
      sourceType: 'manual',
      baseUrl: 'https://api.example.com',
      summary: 'Health check',
      tags: ['System'],
      parameters: [],
    },
  ],
  environments: [
    { id: 'dev', name: 'Development' },
    { id: 'prod', name: 'Production' },
  ],
  activeEnvironmentId: 'dev',
  folderNames: { System: 'Infra' },
});

test('serializeWorkspace includes selected fields only', () => {
  const workspace = createWorkspace();
  const serialized = serializeWorkspace(workspace);

  assert.equal(serialized.name, workspace.name);
  assert.equal(serialized.spec, workspace.spec);
  assert.deepEqual(serialized.manualEndpoints, workspace.manualEndpoints);
  assert.deepEqual(serialized.environments, workspace.environments);
  assert.equal(serialized.activeEnvironmentId, workspace.activeEnvironmentId);
  assert.deepEqual(serialized.folderNames, workspace.folderNames);
  assert.equal('id' in serialized, false);
});

test('exportWorkspace returns pretty-printed JSON', () => {
  const workspace = createWorkspace();
  const exported = exportWorkspace(workspace, 'json');

  assert.equal(exported.startsWith('{'), true);
  assert.equal(exported.includes('"name": "Test Workspace"'), true);
  assert.equal(JSON.parse(exported).name, 'Test Workspace');
});

test('exportWorkspace returns YAML', () => {
  const workspace = createWorkspace();
  const exported = exportWorkspace(workspace, 'yaml');

  assert.equal(exported.includes('name: Test Workspace'), true);
  assert.equal(exported.includes('manualEndpoints:'), true);
});

test('exportWorkspace preserves spec as object when spec is null', () => {
  const workspace = { ...createWorkspace(), spec: null };
  const exported = exportWorkspace(workspace, 'json');

  assert.equal(JSON.parse(exported).spec, null);
});
