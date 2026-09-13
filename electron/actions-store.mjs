import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { MAX_ACTION_LENGTH } from '../src/data/actions-provider.mjs';

const DATA_FILE = 'actions.json';

function validateDocument(document) {
  if (document?.version !== 1 || !Array.isArray(document.actions)) {
    throw new TypeError('El archivo de acciones tiene un formato incompatible.');
  }

  const ids = new Set();
  const actions = document.actions.map(action => {
    if (!action || typeof action.id !== 'string' || !action.id.trim() ||
        ids.has(action.id) || typeof action.text !== 'string' || !action.text.trim() ||
        action.text.length > MAX_ACTION_LENGTH) {
      throw new TypeError('El archivo de acciones contiene una acción inválida.');
    }
    ids.add(action.id);
    return { id: action.id, text: action.text };
  });

  return { version: 1, actions };
}

function parseDocument(contents) {
  try {
    return validateDocument(JSON.parse(contents));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new TypeError('El archivo de acciones no contiene JSON válido.', { cause: error });
    }
    throw error;
  }
}

/** Al iniciar, crea el archivo solo si falta. Nunca reemplaza datos existentes. */
export async function createActionsStore({ directory, defaultsFile }) {
  await mkdir(directory, { recursive: true });
  const file = path.join(directory, DATA_FILE);

  let contents;
  try {
    contents = await readFile(file, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const defaults = await readFile(defaultsFile, 'utf8');
    parseDocument(defaults);
    try {
      await writeFile(file, defaults, { flag: 'wx' });
      contents = defaults;
    } catch (writeError) {
      if (writeError.code !== 'EEXIST') throw writeError;
      contents = await readFile(file, 'utf8');
    }
  }

  let document = parseDocument(contents);
  let operations = Promise.resolve();

  // Serializa las llamadas IPC: ninguna escritura puede adelantar a otra.
  function run(operation) {
    const result = operations.then(operation);
    operations = result.catch(() => {});
    return result;
  }

  async function save(nextDocument) {
    const temporaryFile = path.join(directory, `${DATA_FILE}.${randomUUID()}.tmp`);
    try {
      await writeFile(temporaryFile, JSON.stringify(nextDocument, null, 2) + '\n', { flag: 'wx' });
      await rename(temporaryFile, file);
    } catch (error) {
      await unlink(temporaryFile).catch(() => {});
      throw error;
    }
    document = nextDocument;
  }

  return Object.freeze({
    listActions: () => run(() => document.actions.map(action => ({ ...action }))),

    addAction: text => run(async () => {
      if (typeof text !== 'string' || !text.trim()) {
        throw new TypeError('Escribe una acción antes de agregarla.');
      }
      const cleanText = text.trim();
      if (cleanText.length > MAX_ACTION_LENGTH) {
        throw new RangeError(`La acción puede tener hasta ${MAX_ACTION_LENGTH} caracteres.`);
      }
      const action = { id: randomUUID(), text: cleanText };
      await save({ version: 1, actions: [...document.actions, action] });
      return { ...action };
    }),

    removeAction: id => run(async () => {
      const action = document.actions.find(item => item.id === id);
      if (!action) throw new RangeError('La acción que quieres eliminar ya no existe.');
      await save({ version: 1, actions: document.actions.filter(item => item.id !== id) });
      return { ...action };
    }),
  });
}
