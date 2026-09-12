import test from 'node:test';
import assert from 'node:assert/strict';
import { createActionsProvider } from '../src/data/actions-provider.mjs';

test('acepta cantidades dinámicas y devuelve datos independientes', async () => {
  for (const count of [0, 1, 9, 20, 100]) {
    const document = { version: 1, actions: Array.from({ length: count }, (_, i) => ({ id: String(i), text: `Acción ${i}` })) };
    const provider = createActionsProvider(document);
    const result = await provider.listActions();
    assert.equal(result.length, count);
    if (count) {
      result[0].text = 'Cambio externo';
      assert.equal((await provider.listActions())[0].text, 'Acción 0');
    }
  }
});

test('rechaza documentos incompatibles y acciones ambiguas', async () => {
  for (const document of [{}, { version: 2, actions: [] }, { version: 1, actions: [{ id: 'a', text: '' }] }, { version: 1, actions: [{ id: 'a', text: 'Uno' }, { id: 'a', text: 'Dos' }] }]) {
    await assert.rejects(createActionsProvider(document).listActions(), TypeError);
  }
});
