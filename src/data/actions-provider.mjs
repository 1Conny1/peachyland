import { actionsDocument } from './actions.mock.mjs';

export const MAX_ACTION_LENGTH = 120;

/** Contrato para Electron: listActions(), addAction(text) y removeAction(id). */
export function createActionsProvider(document = actionsDocument) {
  let storedActions = null;
  let nextId = 1;

  // Copia privada de la simulación: no modifica el documento de ejemplo.
  function readStoredActions() {
    if (storedActions === null) {
      if (document?.version !== 1 || !Array.isArray(document.actions)) {
        throw new TypeError('Formato de acciones no compatible.');
      }
      const ids = new Set();
      storedActions = document.actions.map(action => {
        if (!action || typeof action.id !== 'string' || !action.id.trim() ||
            ids.has(action.id) || typeof action.text !== 'string' || !action.text.trim()) {
          throw new TypeError('Cada acción necesita un identificador único y texto.');
        }
        ids.add(action.id);
        return { id: action.id, text: action.text };
      });
    }
    return storedActions;
  }

  return Object.freeze({
    async listActions() {
      return readStoredActions().map(action => ({ ...action }));
    },

    async addAction(text) {
      if (typeof text !== 'string' || !text.trim()) {
        throw new TypeError('Escribe una acción antes de agregarla.');
      }
      const cleanText = text.trim();
      if (cleanText.length > MAX_ACTION_LENGTH) {
        throw new RangeError(`La acción puede tener hasta ${MAX_ACTION_LENGTH} caracteres.`);
      }

      const actions = readStoredActions();
      let id;
      do {
        id = `action-${nextId++}`;
      } while (actions.some(action => action.id === id));

      const action = { id, text: cleanText };
      actions.push(action);
      return { ...action };
    },

    async removeAction(id) {
      const actions = readStoredActions();
      const index = actions.findIndex(action => action.id === id);
      if (index === -1) {
        throw new RangeError('La acción que quieres eliminar ya no existe.');
      }
      const [removed] = actions.splice(index, 1);
      return { ...removed };
    },
  });
}
