const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('peachyland', {
  actions: Object.freeze({
    listActions: () => ipcRenderer.invoke('actions:list'),
    addAction: text => ipcRenderer.invoke('actions:add', text),
    removeAction: id => ipcRenderer.invoke('actions:remove', id),
  }),
});
