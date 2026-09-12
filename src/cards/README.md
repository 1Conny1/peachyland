# Módulo de cartas

Estado: primera entrega, pendiente de aprobación visual.

Este módulo presenta cartas. No conoce el catálogo de acciones, probabilidades,
sorteos, archivos JSON ni Electron. Conserva los doce dibujos de `cartas.html`
y el diseño de `cards.css` en archivos nuevos independientes. Reutiliza `perfil.png`.

## Archivos

- `zodiac.mjs`: catálogo inmutable de doce signos y sus trazos SVG originales.
- `card.mjs`: fábrica de elementos y operaciones de presentación.
- `card.css`: estilos encapsulados mediante Shadow DOM, sin estilos globales.
- `../../demos/cards.html`: galería y prueba manual de frontal bajo demanda.

## Contrato de integración

```js
import { createCard } from './src/cards/card.mjs';

const card = createCard({ signId: 'scorpio', width: 82 });
cardsLayer.append(card.element);
await card.ready;
// El módulo de animación controla transform, opacity y posición de card.element.
// Cuando la carta seleccionada esté fuera de pantalla:
const fits = card.showFront(selectedAction.text);
// Si fits es false, resolver el texto antes de revelarlo.
```

`createCard` acepta `signId`, `width` positivo (225 por defecto) y `portraitUrl`
opcional. No conserva información de acciones. Crear otra carta con el mismo
signo está permitido; la estrategia de asignación pertenece a otro módulo.

El resultado expone:

- `element`: contenedor estable para insertar y animar.
- `ready`: promesa de carga de CSS; montar el elemento antes de esperarla.
  No garantiza la carga de un retrato personalizado.
- `showFront(text)`: construye la frontal y ajusta texto entre 16 y 10 px sobre
  la superficie base. Usa `textContent` para tratar las acciones como texto.
  Devuelve false si no puede medir (sin montar o sin estilos), o si no cabe.
- `fitFront()`: permite repetir la medición tras montar/cargar estilos.
- `showBack()`: restaura el reverso y elimina la frontal.
- `setWidth(px)`: cambia el tamaño conservando la proporción 5:8.

No hay temporizadores, escuchas globales ni observadores propios que liberar:
el consumidor retira `element` cuando termina y cancela sus propias animaciones.

## Tamaño y fidelidad

La superficie interna conserva 225 × 360 px y se escala proporcionalmente.
El contenedor exterior queda libre para movimiento. A 82 px la altura es 131,2 px:
la futura animación deberá considerar esta proporción, distinta de 82 × 116 del MVP.
Los detalles se conservan completos; su legibilidad a escala compacta queda
pendiente de revisión visual. No se eliminan ornamentos automáticamente.

Los textos arbitrariamente largos o palabras que excedan el panel pueden no caber.
Se informa mediante el resultado de `showFront`; no se truncan silenciosamente.
La política definitiva para esos textos se decidirá al integrar las acciones.

## Revisión

Abrir `demos/cards.html` desde un servidor estático de desarrollo o un entorno
Electron que soporte módulos ES. El doble clic mediante file:// puede bloquear
imports en el navegador. No requiere dependencias ni acceso a Node desde la vista.

Comprobar los doce signos frente a la referencia, la fila compacta, el cambio de
reverso a frontal, acciones largas y restauración. Esta demo no hace sorteos.
El fondo se configura solo en la demo: no es responsabilidad de la carta.

El futuro proveedor de datos entregará acciones al coordinador; solo este llamará
a `showFront` con la acción elegida previamente. El módulo visual no necesitará
cambiar cuando los datos simulados sean reemplazados por JSON mediante Electron.
