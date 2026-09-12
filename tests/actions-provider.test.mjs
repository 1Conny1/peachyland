import test from 'node:test';
import assert from 'node:assert/strict';
import { createActionsProvider } from '../src/data/actions-provider.mjs';

test('elimina por identificador, admite vaciar la colección y agregar después', async () => {
  const seed = { version: 1, actions: [{ id: 'a', text: 'Igual' }, { id: 'b', text: 'Igual' }] };
  const provider = createActionsProvider(seed);
  assert.equal((await provider.removeAction('a')).id, 'a');
  assert.deepEqual((await provider.listActions()).map(action => action.id), ['b']);
  await assert.rejects(provider.removeAction('a'), RangeError);
  await provider.removeAction('b');
  assert.deepEqual(await provider.listActions(), []);
  const added = await provider.addAction('Nueva');
  assert.deepEqual(await provider.listActions(), [added]);
  assert.equal(seed.actions.length, 2);
  assert.equal((await createActionsProvider(seed).listActions()).length, 2);
});

test('agregar conserva la sesión, protege la semilla y devuelve copias', async () => {
  const seed = { version: 1, actions: [{ id: 'action-1', text: 'Original' }] };
  const provider = createActionsProvider(seed);
  const added = await provider.addAction('  Una acción nueva  ');
  assert.equal(added.text, 'Una acción nueva');
  assert.notEqual(added.id, 'action-1');
  added.text = 'Cambio externo';
  assert.equal((await provider.listActions())[1].text, 'Una acción nueva');
  assert.equal(seed.actions.length, 1);
  assert.equal((await createActionsProvider(seed).listActions()).length, 1);
});

test('rechaza texto inválido sin alterar la colección', async () => {
  const provider = createActionsProvider({ version: 1, actions: [] });
  for (const text of ['', '   ', null, 42, 'a'.repeat(121)]) {
    await assert.rejects(provider.addAction(text));
  }
  assert.deepEqual(await provider.listActions(), []);
  const results = await Promise.all(Array.from({ length: 25 }, () => provider.addAction('Misma acción')));
  assert.equal(new Set(results.map(action => action.id)).size, 25);
  assert.equal((await provider.listActions()).length, 25);
});

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
