# Aplicación de escritorio

Desde la raíz del proyecto, ejecutar `npm start` o `pnpm start` para abrir
Peachyland con Electron. La interfaz ya no usa la simulación en memoria: abrir
`index.html` con LiveServer o `file://` no permite cargar ni guardar acciones.

En Windows, Electron guarda el catálogo en
`%APPDATA%\Peachyland\actions.json` (la carpeta Roaming del perfil del usuario).
Es independiente de la carpeta de instalación. Al arrancar, se crea la carpeta
y el archivo si faltan; si el archivo ya existe, se lee sin reemplazarlo. Así,
una instalación posterior recupera las acciones mientras esa carpeta siga allí.
Si el JSON existente está dañado, la aplicación muestra un error y no lo
sobrescribe con las acciones iniciales.

## Módulos

- `../../electron/main.cjs`: ventana, ruta de datos de Electron y canales IPC.
- `../../electron/actions-store.mjs`: lectura, validación y escritura del JSON.
  Serializa las altas y bajas, y escribe primero en un archivo temporal.
- `../../electron/default-actions.json`: nueve acciones iniciales, usadas solo
  cuando no existe todavía `actions.json`.
- `../../electron/preload.cjs`: expone únicamente los métodos de acciones a la
  interfaz, sin darle acceso directo al sistema de archivos.
- `../data/actions-provider.mjs`: adaptador asíncrono para `listActions()`,
  `addAction(text)`, `removeAction(id)` y `openDataFolder()` mediante el preload.
- `main.mjs`: navegación e inyección del proveedor compartido a las vistas.
- `../views/cards-view.mjs`: galería, formulario de alta y botones de baja.
- `../views/roulette-view.mjs`: mesa y reparto usando la misma lista actual.

Agregar o eliminar una acción desde Cartas actualiza el archivo local. La ruleta
lee el catálogo vigente al abrir su vista y mantiene la probabilidad `1/n` para
cada acción. Los reversos zodiacales y el módulo visual de cartas no almacenan
acciones ni conocen Electron.

«Abrir carpeta de datos» en Cartas abre la carpeta `userData` de Electron que
contiene `actions.json`; no expone una ruta editable a la interfaz.

Ejecutar `npm test` o `pnpm test` para comprobar el almacén, el proveedor y la
lógica existente. Las pruebas del almacén usan carpetas temporales, no modifican
los datos reales del usuario.
