# Bitácora de Peachyland

Consultar antes de cada etapa. Registrar aprobación explícita del usuario; una
implementación o propuesta no equivale a una aprobación.

## Acuerdos de trabajo y producto — 2026-09-11

- Trabajar por módulos pequeños con contratos de conexión claros, revisar cada
  etapa y registrar aquí los avances aprobados.
- Conservar intactos únicamente background.png, perfil.png, cartas.html y cards.css.
  Los archivos creados para la aplicación pueden editarse y consolidarse. Esta
  aclaración sustituye la interpretación anterior de la regla.
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

## Nuevos acuerdos

- El código futuro debe ser fácil de leer: nombres descriptivos, funciones pequeñas,
  formato espacioso y comentarios en español sobre las decisiones. El código previo
  se conserva tal como está, según indicación del usuario.
- El usuario resolvió el arranque local para visualizar la aplicación.
- Cambio aprobado para la futura animación: el mazo pierde grosor a medida que
  entrega cartas y desaparece al entregar la última. Se elimina la salida lateral.
  Se conserva el tamaño de cada carta; disminuye el apilado.
- El usuario autorizó continuar paso a paso con el motor de preparación propuesto,
  incluyendo la asignación zodiacal por ciclos barajados.

## Etapa 3 — Motor de preparación del sorteo

Estado: implementado para revisión; pendiente de aprobación del resultado.

Archivos nuevos: `src/draw/random.mjs`, `prepare-draw.mjs`, `README.md` y
`tests/draw.test.mjs`. No se modifican módulos anteriores ni la interfaz.

El motor recibe acciones y signos, elige uniformemente la acción antes de preparar
la apariencia, y devuelve un plan inmutable con probabilidad 1/n. Conserva solamente
el texto seleccionado; los descriptores de cartas contienen identificador de acción,
signo, índice de reparto y cantidad restante después de repartir esa carta.
Este último dato permite conectar el adelgazamiento del mazo en la etapa visual.

Se admiten cantidades dinámicas; una lista vacía se rechaza y una acción tiene
probabilidad 1. La decisión de permitir ese caso desde la interfaz queda pendiente.
La asignación usa ciclos barajados; puede repetirse un signo entre ciclos.

Pruebas: rechazo del sobrante aleatorio, límites, cantidades 1/2/9/12/13/24/100,
unicidad dentro de cada ciclo, agotamiento exacto del mazo, independencia del
resultado respecto a la apariencia y conservación del plan ante cambios de origen.
La animación aún no se integra. Siguiente etapa: mesa y representación del mazo.

## Etapa 4 — Mesa, mazo y reparto

Estado: implementada para revisión; pendiente de aprobación visual.

El usuario aprobó avanzar con la primera parte de la animación. Se creó
`reparto.html` como entrada nueva para conservar los archivos existentes.
`src/app/dealing-main.mjs` reutiliza la navegación y conecta la nueva vista.
Se añadieron `src/roulette/` y `tests/deal-layout.test.mjs`.

La mesa utiliza el fondo zodiacal y el módulo de cartas existente. Al pulsar el
mazo se prepara el sorteo, se cargan los reversos y se reparten secuencialmente.
El apilado pierde grosor durante cada vuelo; al entregar la última carta desaparece.
Se puede repetir el reparto. Cambiar de sección cancela el trabajo activo.
Se muestra la cantidad dinámica de acciones y la probabilidad 1/n.

La secuencia termina en la mesa: carga, convergencia, explosión y revelación
permanecen para etapas posteriores. No se construyen frontales durante el reparto.

Validación: pruebas de posiciones dentro de la mesa, grosor decreciente hasta cero,
sintaxis y regresiones del motor y proveedor. Revisión visual pendiente. Para
probar esta etapa usar la ruta `/reparto.html#/ruleta` del servidor local existente.
Con grandes cantidades hay superposición entre anillos; se revisará su distribución
y rendimiento según los catálogos reales antes de considerar completo ese caso.

## Consolidación y ajustes de la mesa

El usuario aprobó el reparto y aclaró la protección de los cuatro originales.
Se retiraron reparto.html y src/app/dealing-main.mjs. La vista funcional reemplaza
el placeholder en src/views/roulette-view.mjs, eliminando su copia en src/roulette/.
La entrada vigente es index.html#/ruleta. Se preservan los módulos de animación,
geometría, datos y cartas, y la demo aislada de cartas por su función de prueba.

Los controles y el estado están dentro del escenario. Mazo y repetición quedan
desactivados mientras se prepara y reparte. La mesa se adapta al ancho y alto
disponibles con la proporción del fondo completo, sin recorte. Los originales
permanecen intactos. Ajustes pendientes de revisión visual del usuario.

## Ajuste del fondo y el círculo zodiacal

Estado: implementado para revisión visual.

El usuario indicó que el fondo debe cubrir todo el espacio útil sin bordes blancos
y que las cartas deben coincidir con el círculo central de signos. La ruta Ruleta
ahora elimina el padding del contenido y utiliza toda la altura disponible. La
imagen se adapta al ancho y alto del escenario completo, sin recorte.

Las posiciones se calculan con las dimensiones visibles de la mesa. El primer
anillo usa el centro y las proporciones del círculo zodiacal de background.png;
los anillos adicionales avanzan hacia el interior. Las cartas conservan su propia
proporción y no dependen del estiramiento del fondo.

Validación automatizada: posiciones dentro de mesas horizontal, estándar y vertical;
coincidencia de puntos cardinales con el anillo; rechazo de dimensiones inválidas;
regresión del reparto, sorteo, datos y catálogo visual. Revisión en pantalla pendiente.

## Aumento del tamaño de las cartas

Estado: implementado para revisión visual.

El usuario indicó que el tamaño anterior ocultaba el trabajo del diseño y autorizó
solapamientos. Las cartas del reparto y la portada del mazo aumentan de 82 × 131,2
a 150 × 240. Mantienen la proporción 5:8 de la baraja y continúan centradas sobre
el anillo zodiacal. El borde que representa el grosor del mazo se ajustó al nuevo tamaño.

Se consolidó table.css para retirar reglas duplicadas de iteraciones anteriores y
facilitar su lectura. La prioridad actual es reconocer signos, marcos y retrato;
la cantidad de solapamiento se evaluará visualmente con distintos valores de n.

## Ajuste de proporción de las cartas

Estado: implementado a solicitud del usuario; pendiente de revisión visual.

Aunque la galería y el reparto compartían la proporción 5:8, el usuario percibió
las cartas demasiado largas y angostas. El módulo completo cambia a 225 × 320,
una proporción 45:64 cercana a 7:10. La ruleta utiliza la misma relación a
150 × 213,33. Galería, mazo y reparto continúan usando una única proporción.

El alto se calcula desde constantes exportadas por el módulo de cartas. La geometría
de la mesa consume esa misma relación para mantener las cartas dentro del escenario.
Los cuatro archivos originales no cambian; la corrección se aplica a los componentes
creados para la aplicación.

## Continuidad visual entre el mazo y el reparto

Estado: corregido a solicitud del usuario; pendiente de revisión visual.

La portada fija de Aries fue eliminada. Al preparar el sorteo, la primera carta
real se coloca encima del mazo. Cuando comienza su vuelo, el mismo elemento pasa
a la capa de la mesa y la siguiente carta real queda visible en el mazo. El signo
ya no se sustituye durante el recorrido.

El plan completo continúa preparándose antes de animar y la acción seleccionada
permanece oculta. Al repetir, se prepara un mazo nuevo con su primera carta real.
