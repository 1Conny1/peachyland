# Interfaz inicial

Entrada: `../../index.html`. Servir la raíz del proyecto mediante HTTP en desarrollo;
los módulos ES pueden estar bloqueados al abrir el archivo con doble clic.

- `main.mjs`: navegación por hash (`#/ruleta`, `#/cartas`), historial, ruta inicial
  y conexiones. Inyecta `actionsProvider` a las vistas.
- `../views/roulette-view.mjs`: conecta mesa, mazo y reparto con los datos.
- `../views/cards-view.mjs`: galería de frentes dinámicos y los doce reversos.
- `../data/actions.mock.mjs`: documento simulado `{ version: 1, actions: [{ id, text }] }`.
- `../data/actions-provider.mjs`: contrato asíncrono `listActions()`, sin dependencias
  de DOM, archivos o Electron. Devuelve copias y valida identificadores únicos.

Para integrar Electron, inyectar un proveedor que implemente `listActions()` usando
la API del preload. No es necesario modificar las vistas ni el módulo visual.
Agregar una sección requiere registrar otra función `mount(container, services)`
y su enlace lateral. Cada carga dispone de un contenedor propio para evitar que
resultados tardíos interfieran al cambiar de ruta.

En esta galería se crean todas las frontales porque el propósito es inspeccionarlas.
La ruleta futura conservará la construcción tardía de una sola frontal seleccionada.
No hay asociación persistente acción/signo ni algoritmo de asignación en esta etapa.

Revisión manual pendiente: navegar entre secciones, usar Atrás/Adelante, recargar
en `#/cartas`, comparar los SVG con la referencia y revisar las nueve acciones en
frente y en sus etiquetas. El contenido vacío y los fallos de carga muestran mensajes.
