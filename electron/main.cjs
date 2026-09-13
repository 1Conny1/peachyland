const { app, BrowserWindow, dialog, ipcMain, Menu, shell } = require('electron');
const path = require('node:path');

app.setName('Peachyland');

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const window = BrowserWindow.getAllWindows()[0];
    if (window) {
      if (window.isMinimized()) window.restore();
      window.focus();
    }
  });

  app.whenReady().then(async () => {
    try {
      const { createActionsStore } = await import('./actions-store.mjs');
      const store = await createActionsStore({
        directory: app.getPath('userData'),
        defaultsFile: path.join(__dirname, 'default-actions.json'),
      });

      ipcMain.handle('actions:list', () => store.listActions());
      ipcMain.handle('actions:add', (_event, text) => store.addAction(text));
      ipcMain.handle('actions:remove', (_event, id) => store.removeAction(id));
      ipcMain.handle('actions:open-folder', async () => {
        const error = await shell.openPath(app.getPath('userData'));
        if (error) throw new Error(`No se pudo abrir la carpeta de datos: ${error}`);
      });

      Menu.setApplicationMenu(null);
      const window = new BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 950,
        minHeight: 650,
        title: 'Peachyland',
        icon: path.join(__dirname, '..', 'perfil.png'),
        backgroundColor: '#250913',
        webPreferences: {
          preload: path.join(__dirname, 'preload.cjs'),
          contextIsolation: true,
          nodeIntegration: false,
          sandbox: true,
        },
      });
      window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
      await window.loadFile(path.join(__dirname, '..', 'index.html'));
    } catch (error) {
      dialog.showErrorBox('Peachyland no pudo abrir sus datos',
        `${error.message}\n\nCarpeta de datos: ${app.getPath('userData')}\nNo se modificó el archivo existente.`);
      app.quit();
    }
  });

  app.on('window-all-closed', () => app.quit());
}
