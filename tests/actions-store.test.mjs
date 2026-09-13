import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createActionsStore } from '../electron/actions-store.mjs';

const defaultsFile = fileURLToPath(new URL('../electron/default-actions.json', import.meta.url));

async function testDirectory(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'peachyland-actions-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return path.join(root, 'Peachyland');
}

test('crea la carpeta al primer inicio y conserva altas y bajas al reinstalar', async t => {
  const directory = await testDirectory(t);
  const first = await createActionsStore({ directory, defaultsFile });
  assert.equal((await first.listActions()).length, 9);
  const added = await first.addAction('  Una acción nueva  ');
  assert.equal(added.text, 'Una acción nueva');
  await first.removeAction('zing');

  const second = await createActionsStore({ directory, defaultsFile });
  const actions = await second.listActions();
  assert.equal(actions.length, 9);
  assert.ok(actions.some(action => action.id === added.id));
  assert.ok(!actions.some(action => action.id === 'zing'));
  assert.equal(JSON.parse(await readFile(path.join(directory, 'actions.json'), 'utf8')).actions.length, 9);
});

test('borra por ID, admite cero acciones y serializa cambios simultáneos', async t => {
  const directory = await testDirectory(t);
  const store = await createActionsStore({ directory, defaultsFile });
  const created = await Promise.all(Array.from({ length: 25 }, () => store.addAction('Mismo texto')));
  assert.equal(new Set(created.map(action => action.id)).size, 25);
  await assert.rejects(store.removeAction('no-existe'), RangeError);
  await Promise.all((await store.listActions()).map(action => store.removeAction(action.id)));
  assert.deepEqual(await store.listActions(), []);
  assert.deepEqual(await (await createActionsStore({ directory, defaultsFile })).listActions(), []);
  const again = await store.addAction('Después de vaciar');
  assert.deepEqual(await (await createActionsStore({ directory, defaultsFile })).listActions(), [again]);
});

test('rechaza datos inválidos sin cambiar el archivo y no reemplaza JSON dañado', async t => {
  const directory = await testDirectory(t);
  const store = await createActionsStore({ directory, defaultsFile });
  const file = path.join(directory, 'actions.json');
  const before = await readFile(file, 'utf8');
  for (const text of ['', '   ', null, 42, 'a'.repeat(121)]) {
    await assert.rejects(store.addAction(text));
  }
  assert.equal(await readFile(file, 'utf8'), before);

  await writeFile(file, '{ JSON roto');
  await assert.rejects(createActionsStore({ directory, defaultsFile }), /JSON válido/);
  assert.equal(await readFile(file, 'utf8'), '{ JSON roto');
});
