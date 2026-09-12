# Interfaz inicial

Entrada: `../../index.html`. Servir la raíz del proyecto mediante HTTP en desarrollo;
los módulos ES pueden estar bloqueados al abrir el archivo con doble clic.

- `main.mjs`: navegación por hash (`#/ruleta`, `#/cartas`), historial, ruta inicial
  y conexiones. Inyecta `actionsProvider` a las vistas.
- `../views/roulette-view.mjs`: conecta mesa, mazo y reparto con los datos.
- `../views/cards-view.mjs`: galería de frentes dinámicos, doce reversos y formulario
  para agregar acciones a la sesión.
- `../data/actions.mock.mjs`: documento simulado `{ version: 1, actions: [{ id, text }] }`.
- `../data/actions-provider.mjs`: contrato asíncrono `listActions()` y
  `addAction(text)` y `removeAction(id)`, sin dependencias de DOM, archivos o Electron. Mantiene una
  colección privada en memoria y devuelve copias. `addAction` valida texto de
  hasta 120 caracteres y devuelve `{ id, text }` con un identificador único.
  Las altas duran al navegar entre vistas; recargar restablece el documento inicial.

Cada carta de acción ofrece un botón Eliminar. La eliminación usa su identificador
(incluso cuando dos acciones tienen el mismo texto) y también dura solo la sesión.
`removeAction(id)` devuelve la acción retirada o rechaza si el identificador no existe.

Para integrar Electron, inyectar un proveedor que implemente los tres métodos usando
la API del preload. No es necesario modificar las vistas ni el módulo visual.
Agregar una sección requiere registrar otra función `mount(container, services)`
y su enlace lateral. Cada carga dispone de un contenedor propio para evitar que
resultados tardíos interfieran al cambiar de ruta.

En esta galería se crean todas las frontales porque el propósito es inspeccionarlas.
La ruleta futura conservará la construcción tardía de una sola frontal seleccionada.
No hay asociación persistente acción/signo ni algoritmo de asignación en esta etapa.

Verificado en navegador: agregar una acción crea su carta y actualiza el contador;
la ruleta recibe el total nuevo con probabilidad 1/n. Al volver a Cartas se conserva
la acción, y al recargar desaparece de la simulación. Los errores de validación
conservan el texto del formulario para corregirlo.
