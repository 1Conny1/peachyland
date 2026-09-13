import test from 'node:test';
import assert from 'node:assert/strict';
import { createActionsProvider } from '../src/data/actions-provider.mjs';

test('la vista delega las tres operaciones en el puente de Electron', async () => {
  const calls = [];
  const bridge = {
    async listActions() { calls.push('list'); return [{ id: 'a', text: 'Acción' }]; },
    async addAction(text) { calls.push(['add', text]); return { id: 'b', text }; },
    async removeAction(id) { calls.push(['remove', id]); return { id, text: 'Acción' }; },
  };
  const provider = createActionsProvider(bridge);
  assert.deepEqual(await provider.listActions(), [{ id: 'a', text: 'Acción' }]);
  assert.deepEqual(await provider.addAction('Nueva'), { id: 'b', text: 'Nueva' });
  assert.deepEqual(await provider.removeAction('a'), { id: 'a', text: 'Acción' });
  assert.deepEqual(calls, ['list', ['add', 'Nueva'], ['remove', 'a']]);
});

test('sin Electron, la vista da un error claro y no simula datos', async () => {
  const provider = createActionsProvider(null);
  await assert.rejects(provider.listActions(), /Electron/);
  await assert.rejects(provider.addAction('Nueva'), /Electron/);
  await assert.rejects(provider.removeAction('a'), /Electron/);
});
