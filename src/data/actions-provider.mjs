import { actionsDocument } from './actions.mock.mjs';

/** El futuro adaptador Electron implementará el mismo método async listActions(). */
export function createActionsProvider(document = actionsDocument) {
  return Object.freeze({
    async listActions() {
      if (document?.version !== 1 || !Array.isArray(document.actions)) {
        throw new TypeError('Formato de acciones no compatible.');
      }
      const ids = new Set();
      return document.actions.map(action => {
        if (!action || typeof action.id !== 'string' || !action.id.trim() ||
            ids.has(action.id) || typeof action.text !== 'string' || !action.text.trim()) {
          throw new TypeError('Cada acción necesita un identificador único y texto.');
        }
        ids.add(action.id);
        return { id: action.id, text: action.text };
      });
    },
  });
}
