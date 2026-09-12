# Preparación del sorteo

Estado: primera implementación, pendiente de revisión del usuario.

`prepareDraw` recibe acciones y los identificadores del catálogo zodiacal.
No importa el proveedor de datos ni el componente de cartas: el coordinador
conectará esos módulos. Funciona sin DOM y sin APIs de Electron.

```js
const actions = await actionsProvider.listActions();
const signIds = ZODIAC.map(sign => sign.id);
const plan = prepareDraw(actions, signIds);
```

El plan es inmutable y conserva el texto de la acción seleccionada aunque cambien
los datos de origen. Cada descriptor contiene solo actionId, signId, dealIndex y
remainingAfterDeal. El texto ganador aparece una sola vez, en selectedAction.
No construye frontales ni guarda los textos de las cartas descartadas.

La selección usa valores criptográficos con muestreo por rechazo, dando 1/n a cada
entrada. Los signos se asignan por ciclos Fisher–Yates independientes: cada ciclo
completo contiene todos los signos una vez. Pueden repetirse entre ciclos,
incluso en su frontera. La apariencia no cambia el resultado elegido previamente.

La fuente aleatoria inyectable está destinada a pruebas deterministas. En uso
normal omitir ese argumento para utilizar crypto.getRandomValues.

## Conexión prevista con el mazo

Inicialmente el mazo representa plan.total cartas. Después de cada reparto,
remainingAfterDeal indica cuántas quedan. El módulo visual podrá interpolar el
grosor entre ambos valores durante la salida de la carta. Al llegar a cero,
desaparece el mazo. Se reduce el grosor del apilado, no el ancho y alto de las cartas.
No hay salida lateral del mazo. No es necesario dibujar una capa por acción para
simular el grosor: la representación se decidirá al construir la mesa.

Este módulo todavía no modifica la interfaz. La futura animación recibirá el plan
y llamará a showFront(plan.selectedAction.text) cuando la ganadora esté fuera de pantalla.

## Límites y casos de entrada

Una lista vacía genera error. Una acción produce probabilidad 1 y una sola carta;
la interfaz podrá decidir si permite iniciar ese caso. No se fija un máximo de
nueve o doce acciones; el rendimiento visual se evaluará durante el reparto.
Se rechazan identificadores duplicados, textos vacíos y catálogos inválidos.
Acciones con el mismo texto e identificadores distintos son entradas independientes.
