export const MAX_ACTION_LENGTH = 120;

/** La vista usa este contrato; Electron decide dónde guardar los datos. */
export function createActionsProvider(bridge = globalThis.peachyland?.actions) {
  function actionsBridge() {
    if (!bridge || typeof bridge.listActions !== 'function' ||
        typeof bridge.addAction !== 'function' || typeof bridge.removeAction !== 'function') {
      throw new Error('Abre Peachyland desde Electron para usar las acciones guardadas.');
    }
    return bridge;
  }

  return Object.freeze({
    async listActions() { return actionsBridge().listActions(); },
    async addAction(text) { return actionsBridge().addAction(text); },
    async removeAction(id) { return actionsBridge().removeAction(id); },
    async openDataFolder() {
      const bridge = actionsBridge();
      if (typeof bridge.openDataFolder !== 'function') {
        throw new Error('No se pudo abrir la carpeta de datos desde Electron.');
      }
      return bridge.openDataFolder();
    },
  });
}
