import assert from 'node:assert/strict';
import test from 'node:test';
import { removeWorkspace } from '../app/(platform)/workspace-store.js';

const workspaces = [
  { id: 'workspace:personal', name: 'Personal Workspace' },
  { id: 'workspace:team', name: 'Team Workspace' },
] as never[];

test('deletes a workspace and selects the first remaining workspace when it was active', () => {
  assert.deepEqual(removeWorkspace(workspaces, 'workspace:team', 'workspace:team'), {
    workspaces: [workspaces[0]],
    activeWorkspaceId: 'workspace:personal',
    deleted: true,
  });
});

test('does not delete the last workspace', () => {
  assert.deepEqual(removeWorkspace([workspaces[0]], 'workspace:personal', 'workspace:personal'), {
    workspaces: [workspaces[0]],
    activeWorkspaceId: 'workspace:personal',
    deleted: false,
  });
});
