import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CREATE_NEW_WORKSPACE_OPTION_ID,
  getImportWorkspaceOptions,
  resolveImportWorkspaceId,
} from '../app/(platform)/import-workspace-target.js';

const workspaces = [
  { id: 'workspace:personal', name: 'Personal Workspace' },
  { id: 'workspace:team', name: 'Team Workspace' },
];

test('lists every workspace and marks the active workspace', () => {
  assert.deepEqual(getImportWorkspaceOptions(workspaces, 'workspace:team'), [
    { id: 'workspace:personal', name: 'Personal Workspace', isActive: false },
    { id: 'workspace:team', name: 'Team Workspace', isActive: true },
    { id: CREATE_NEW_WORKSPACE_OPTION_ID, name: 'Create new workspace', isActive: false },
  ]);
});

test('uses the active workspace as the default import target', () => {
  assert.equal(resolveImportWorkspaceId('', workspaces, 'workspace:team'), 'workspace:team');
});

test('preserves a selected non-active workspace as the import target', () => {
  assert.equal(
    resolveImportWorkspaceId('workspace:personal', workspaces, 'workspace:team'),
    'workspace:personal'
  );
});

test('falls back to the active workspace for an invalid target', () => {
  assert.equal(resolveImportWorkspaceId('workspace:missing', workspaces, 'workspace:team'), 'workspace:team');
});

test('returns empty string for the create-new-workspace option', () => {
  assert.equal(resolveImportWorkspaceId(CREATE_NEW_WORKSPACE_OPTION_ID, workspaces, 'workspace:team'), '');
});
