# Bitácora de Peachyland

Consultar antes de cada etapa. Registrar aprobación explícita del usuario; una
implementación o propuesta no equivale a una aprobación.

## Acuerdos de trabajo y producto — 2026-09-11

- Trabajar por módulos pequeños con contratos de conexión claros, revisar cada
  etapa y registrar aquí los avances aprobados.
- Conservar todos los archivos existentes como referencia. Solo esta bitácora
  puede editarse; crear archivos nuevos para la implementación.
- Destino: aplicación de escritorio con Electron. Más adelante habrá JSON en una
  carpeta específica; inicialmente los datos se simularán dentro de JavaScript.
- Lista dinámica de acciones: una carta por acción y probabilidad uniforme 1/n.
  Las nueve acciones mencionadas son contenido inicial, no una cantidad fija.
- Los signos son visuales y pueden repetirse; no alteran la probabilidad.
- Elegir la acción antes de animar; construir únicamente la frontal seleccionada
  durante el tramo fuera de pantalla. Las demás cartas conservan solo reversos.

La propuesta de asignar signos mediante ciclos barajados permanece como propuesta
de integración; no se implementa en la preparación visual.

## Etapa 1 — Preparación del módulo visual — 2026-09-11

Estado: aceptada como primer paso por el usuario al solicitar la etapa de navegación.

Se añadieron `src/cards/zodiac.mjs`, `card.mjs`, `card.css` y `README.md`, una demo
independiente en `demos/` y comprobaciones en `tests/cards-contract.test.mjs`.
La fábrica crea reversos desde el catálogo de doce SVG originales; expone un
contenedor animable, tamaño configurable y frontal construida bajo demanda.
Los estilos se encapsulan con Shadow DOM. El fondo se utiliza solo en la demo.

La superficie base es 225 × 360 px. El escalado conserva la proporción 5:8.
No se implementan sorteo, reparto, catálogo de acciones ni persistencia en esta etapa.
El texto frontal se ajusta hasta un mínimo de 10 px y devuelve si cabe; aún debe
acordarse cómo tratar acciones que excedan el espacio disponible.

Validación: comprobar sintaxis, coincidencia exacta de trazos, validación de
entradas y hashes de originales. Revisión visual e integración animada pendientes;
no considerar esta entrada como aprobación de apariencia ni de comportamiento en Electron.

## Etapa 2 — Navegación y catálogo simulado — 2026-09-11

Estado: implementada para revisión; pendiente de aprobación del usuario.

Se creó una entrada nueva `index.html` con navegación lateral izquierda: Ruleta
y Cartas. Ruleta reserva el espacio futuro; Cartas muestra frentes con las acciones
y los doce reversos zodiacales mediante el módulo visual existente.

Se añadieron módulos en `src/app/`, `src/views/` y `src/data/`. El documento de
acciones simula JSON con versión e identificadores estables; incluye los nueve
textos aportados. La cantidad se deriva del arreglo y no tiene límite de nueve o doce.
Un proveedor asíncrono inyectable prepara el reemplazo futuro por Electron/JSON.

La galería construye todas las frontales para inspección. Esta decisión no cambia
la optimización acordada para la ruleta: resultado previo y una sola frontal tardía.
La navegación por hash permite volver, avanzar y abrir directamente una sección.

Validación automatizada: proveedor con 0, 1, 9, 20 y 100 acciones, copias independientes,
rechazo de formatos inválidos e identificadores duplicados; regresión del catálogo SVG.
La comprobación visual de estilos en pantalla permanece pendiente. Los archivos
preexistentes se conservaron; únicamente se actualizó esta bitácora.
