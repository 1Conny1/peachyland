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

## Etapa 5 — Carga de energía

El usuario autorizó la fase de carga y pidió coherencia cromática con cartas y fondo.
Se añadió charge-animation.mjs y se conectó después del reparto en la vista existente.
La secuencia usa pausa de 450 ms, carga de 1400 ms, sostén de 300 ms y salida suave
de 350 ms para terminar esta prueba. El temblor aumenta hasta unos 2,5 px; el halo
utiliza dorado del marco, ciruela y borgoña, sin blanco ni blanqueamiento del retrato.

Los controles permanecen desactivados hasta finalizar. El módulo conserva las
posiciones del reparto, admite cancelación al navegar y elimina sus efectos al
terminar. Movimiento reducido muestra solo el halo gradual. No se implementa aún
convergencia, explosión ni revelación. Estado: implementado para revisión visual.

## Etapa 6 — Convergencia al centro

El usuario aprobó visualmente la carga de energía y pidió continuar la animación.
Se conecta la convergencia después del sostén de la carga: las mismas cartas viajan
al centro en 620–660 ms, con ligeras diferencias de posición y rotación. El halo
dorado/ciruela/borgoña permanece durante el recorrido y después se desvanece.

converge-animation.mjs separa el movimiento del sorteo y devuelve los destinos para
conectar futuras fases. charge-animation.mjs ofrece whileCharged para mantener
el halo mientras se ejecuta esa fase. No se modifica la probabilidad 1/n ni la
selección previa del resultado; no se crean frontales. Los controles siguen
bloqueados hasta completar toda la secuencia. Cancelar restaura posiciones y limpia
efectos. Movimiento reducido sustituye el vuelo por una aparición breve central.

Esta entrega termina con las cartas reunidas; explosión y revelación quedan para
el siguiente paso. Los archivos originales protegidos no se modifican.
Estado: implementado para revisión visual; pruebas automatizadas de destinos,
finalización, cancelación y continuidad del halo incluidas.

## Etapa 7 — Explosión de las cartas

El usuario confirmó que hasta la convergencia todo está correcto y autorizó continuar.
Se incorpora explode-animation.mjs: tras 140 ms de reunión, las mismas cartas salen
en distintas direcciones durante 720–800 ms, con giros alternados y el halo existente
dorado/ciruela/borgoña. No se añaden destellos blancos ni se modifican los originales.

Los destinos consideran el tamaño de la mesa y la diagonal de las cartas. Al acabar,
las cartas quedan ocultas fuera del escenario, incluso si luego cambia la ventana.
El módulo devuelve los destinos para conectar el regreso de la ganadora; no conoce
el resultado, no vuelve a sortear y todavía no construye ningún frontal.

Los controles se mantienen bloqueados durante toda la secuencia. La cancelación
restaura los estilos y libera animaciones; movimiento reducido sustituye el vuelo
por un desvanecimiento. Esta etapa termina intencionalmente con la mesa vacía y
permite repetir. Regreso y revelación se reservan para la siguiente etapa.

Estado: implementado para revisión visual. Se añaden pruebas de salidas completas,
cantidades dinámicas, movimiento reducido, finalización y cancelación.

## Etapa 8 — Regreso y revelación

El usuario aprobó la explosión y autorizó continuar. reveal-animation.mjs recibe
exclusivamente la carta del winnerIndex y el texto selectedAction del plan original.
Después de la explosión, estando oculta y fuera del escenario, se construye su
frontal y se espera la imagen antes de hacerla regresar. Ninguna otra frontal
se construye y no se realiza otro sorteo.

La carta vuelve desde su posición de salida al centro en 1000 ms, ampliándose
uniformemente hasta 1,5 veces (limitado por el espacio disponible). Movimiento
reducido usa aparición de 250 ms. El resultado queda visible hasta repetir;
el estado accesible anuncia la acción completa, también útil si el texto es largo.
Los controles se desbloquean al finalizar; cancelar oculta la carta y limpia su
animación. Los cuatro originales siguen intactos.

Estado: implementado para revisión visual. Se añaden pruebas de preparación oculta,
regreso, movimiento reducido y cancelación. No se integra persistencia ni Electron.

## Ajuste — Entrada variable e impacto sobre la mesa

El usuario aprobó el regreso y solicitó entradas desde cualquier borde y una caída
con fuerza. Se conserva la curva de regreso de 1000 ms, ahora desde uno de los
cuatro bordes elegido con azar exclusivamente visual. La carta llega ligeramente
elevada, desciende en 150 ms y hace un rebote amortiguado de 300 ms. Al contacto,
la mesa tiembla durante 300 ms, con desplazamientos decrecientes de hasta 6 px.
No se añaden destellos blancos ni se altera la selección previa de la acción.

Los efectos se limpian al terminar o cancelar; los controles esperan el impacto.
Movimiento reducido mantiene únicamente la aparición, sin caída ni sacudida.
Estado: implementado para revisión visual, con pruebas de los cuatro bordes y
limpieza del temblor. Los archivos originales permanecen intactos.

## Ajuste — Panel inferior anclado al borde

El usuario aprobó la animación y señaló la separación bajo el panel de controles.
Se elimina su margen inferior de 25 px y se dejan rectas las esquinas inferiores
para unirlo al borde de la mesa. Solo cambia .roulette-controls en table.css;
no se modifican cartas, animaciones ni la imagen original del fondo.
Estado: implementado para revisión visual.

## Ajuste visual — Formación del mazo

Con la animación principal aprobada, el usuario pidió que la baraja inicial se
perciba como un mazo real y no como una carta sobre una plataforma rayada. Se
modifica únicamente su presentación en table.css: el canto queda ligeramente
más estrecho que la carta superior, integra capas marfil con divisiones doradas
y ciruela, oscurece suavemente los laterales y une la sombra al cuerpo del mazo.

El grosor continúa disminuyendo con la lógica existente y llega a cero con la
última carta. No cambian el reparto, el sorteo, las cartas ni los originales.
Estado: implementado para revisión visual.

## Corrección visual — Ancho exacto del mazo

El usuario percibió el mazo más pequeño que las cartas ya aprobadas. La carta
superior sí compartía sus medidas exactas de 150 × 213,33; la diferencia visual
provenía del canto, que estaba retraído 3 px a cada lado. Se corrige únicamente
el canto del mazo para ocupar exactamente 150 px incluyendo sus bordes mediante
box-sizing: border-box. Las cartas repartidas no se modifican.

## Rediseño visual — Mazo compuesto por cartas

Tras revisar la segunda captura, se confirma que el tamaño era correcto pero el
canto seguía pareciendo un zócalo. Se sustituye únicamente la representación del
mazo por tres cuerpos completos de carta detrás de la carta superior real. Las
capas comparten exactamente 150 × 213,33, borde borgoña, interior ciruela y línea
dorada; pequeños desplazamientos verticales permiten reconocer la superposición.

El módulo de reparto conserva las cartas aprobadas y ahora acerca la carta superior
a esas capas conforme disminuye el grosor. Al entregar la última, todas coinciden
y el mazo desaparece como antes. No cambian las cartas repartidas, sus estilos,
el sorteo ni el resto de la animación. Estado: implementado para revisión visual.

## Corrección — Agotamiento de las capas del mazo

El usuario detectó una carta decorativa residual después de salir la última real.
Las capas completas añadidas en la iteración anterior no se retiraban hasta acabar
el último vuelo. Ahora se ocultan bajo la carta superior al quedar una sola carta;
el contenedor vacío se oculta al comenzar el último vuelo. La preparación restaura
las capas según el número de acciones, también al repetir con una sola acción.

Se alinea el apilado y se atenúan sus líneas doradas. El grosor se interpola durante
el vuelo mediante una propiedad CSS registrada, evitando el salto al finalizar.
Las cartas y las trayectorias existentes se conservan. Se añade una regresión
para comprobar que no queda decoración al salir la última carta.
Estado: corrección implementada; apariencia pendiente de revisión visual.

## Barra lateral — Diseño aprobado

El usuario aprobó el aspecto de la barra lateral tras revisar la captura completa:
fondo borgoña y ciruela, detalles dorados, emblema celestial, iconos de navegación
y resaltado de la sección activa. Se conserva el espacio libre bajo el menú.
Los cambios visuales están limitados a la barra lateral en src/app/shell.css.
Estado: aprobado visualmente; se mantiene este diseño.

## Estela de luz del cursor

El usuario propuso una estela y autorizó implementarla. Se añade un módulo visual
compartido por las vistas: partículas doradas y ciruela, con pequeños destellos
de cuatro puntas, que se desvanecen en 650 ms. Un canvas transparente permite
seguir pulsando todos los controles y conserva el cursor habitual.

La estela limita sus partículas a 80 y deja de animarse al vaciarse. Se limpia
al salir de la ventana, perder foco o cambiar el tamaño. Respeta la preferencia
de movimiento reducido y solo responde al ratón. Estado: pendiente de revisión
visual del usuario.

## Reflejo periódico en la barra lateral

El usuario autorizó un brillo ocasional de izquierda a derecha. Se incorpora
un reflejo dorado tenue mediante CSS, con una pasada de aproximadamente 2,6 s
en cada ciclo de 12 s. La capa permanece dentro de la barra y permite los clics.
Movimiento reducido desactiva el efecto. Estado: implementado para revisión visual.

El usuario aclaró que el brillo corresponde a los selectores de páginas, no al
fondo de la barra. Se retira el reflejo general y se aplica dentro de cada enlace
de navegación, respetando sus esquinas. Ahora pasa durante 2 s cada 4 s, con un
desfase de 0,6 s entre opciones. Se conserva el dorado y la opción de movimiento
reducido. Estado: ajuste implementado para revisión visual.

## Brillo sobre las letras y tipografía del menú

El usuario precisó que el reflejo debe recorrer las letras, no las cajas. Se elimina
la capa de brillo del enlace y se envuelve cada etiqueta en un span para recortar
el degradado al texto. Ruleta y Cartas usan Georgia negrita a 16 px (14 px en barra
estrecha), con mayor presencia y continuidad con la marca. El reflejo dorado mantiene
el ciclo de 4 s. Movimiento reducido y colores forzados muestran texto estático.
Estado: implementado para revisión visual; cambios limitados al menú lateral.

Corrección posterior: la captura del usuario mostraba fragmentos de etiquetas y
palabras separadas, aunque el HTML guardado era válido. Se recuperan los enlaces
simples en index.html y se construyen los rótulos con createElement/textContent al
iniciar. Cada etiqueta queda en una sola línea sin encogerse. Se conserva el brillo
sobre las letras. Causa de la discrepancia en el navegador sin confirmar.

## Recuperación de la sección Cartas · 2026-09-12

El usuario informó de una reversión accidental en este proyecto y pidió recuperar
la galería. La vista volvió a su versión inicial, pero sobrevivieron como archivos
sin seguimiento cards-view.css, gallery-sky.svg y las fuentes con sus licencias.
Se restauró cards-view.mjs desde el estado final documentado en esta conversación.

Estado recuperado: cabecera «El arte de las cartas», secciones de acciones y zodiaco
con cantidades, cartas libres sin paneles ni etiquetas duplicadas, contorno mate
tenue y elevación/inclinación al pasar el cursor. La tipografía elegida es Lora 700
(título hasta 48 px y secciones de 32 px), con textos secundarios ampliados y brillo
dorado periódico en títulos. El fondo celestial incorpora constelaciones laterales,
estrellas discretas y luces borgoña/ciruela. Se respeta movimiento reducido.

Se conserva la hoja independiente de galería: solucionó que la vista previa
sirviera CSS corrupto distinto del archivo guardado. No se restauran las propuestas
descartadas de paneles, tipografías anteriores ni halos intensos. La ruleta, la barra
lateral, los datos y los cuatro originales permanecen intactos.
Lora fue aceptada para continuar; el fondo conserva el último diseño implementado.

## Constelaciones refinadas y resplandor ocasional

El usuario autorizó mejorar las figuras del fondo y añadir resplandor. Se modifica
únicamente gallery-sky.svg: mayor definición de líneas doradas, uniones suaves y
estrellas de cuatro puntas con aros finos en los puntos principales. Los trazos y
estrellas aumentan suavemente su luminosidad en ciclos de 13 s; los halos laterales
se alternan con un desfase de 6,5 s. El brillo permanece en el dibujo de fondo.
Movimiento reducido mantiene las figuras estáticas y sin halos animados.
Estado: implementado para revisión visual.

## Fondo estático con doce constelaciones

El usuario pidió reducir la saturación y representar los doce signos mediante sus
constelaciones. Se sustituye gallery-sky.svg por doce figuras decorativas
simplificadas, seis por lateral, con estrellas pequeñas y conexiones doradas tenues.
No es un mapa astronómico a escala. Se eliminan arcos, aros, halos, animaciones
y luz radial adicional. El fondo se dibuja una sola vez y conserva las proporciones
del SVG al adaptarse al área disponible. Las cartas y los textos quedan intactos.
Estado: implementado para revisión visual.

### Aclaración — Cielo estrellado con conexiones temporales

El usuario precisó que desea estrellas permanentes y constelaciones que se formen
ocasionalmente entre ellas. Se añaden 240 estrellas discretas al fondo y se conservan
los puntos de las doce figuras. Sus líneas se trazan progresivamente, permanecen
brevemente y desaparecen; las estrellas nunca se retiran. Cada figura tiene un
ciclo de 48 s, desfasado 4 s respecto a la siguiente, evitando mostrarlas todas
a la vez. Movimiento reducido deja solo el cielo estrellado estático.
Estado: implementado para revisión visual; modificación exclusiva del fondo SVG.

## Galería — encabezados sin numeración

Se retiran «01 · EL FRENTE» y «02 · EL REVERSO». Los encabezados de ambas
secciones conservan sus títulos, identificadores accesibles y contadores;
el marcado de «El zodiaco» queda explícito y limpio. No se modifican las cartas,
el fondo ni la ruleta.

### Corrección comprobada en navegador

Se recupera el contenedor original de cada título y se mantienen retirados solo
los rótulos numerados. Se comprobó que la vista previa del puerto 57391 servía
HTML malformado distinto del archivo guardado: faltaban partes de las etiquetas
de ambos títulos y del contador del zodiaco. Recargar esa vista no lo corregía.
Se abrió una vista local que lee directamente del disco en el puerto 8080.
El navegador externo del usuario seguía apuntando a 57391, que aún entrega
la plantilla malformada. Para revisar la versión guardada, abrir
http://127.0.0.1:8080/index.html#/cartas en ese navegador; el 8080 entregó
exactamente el contenido de cards-view.mjs en disco al comprobarlo.
Verificación visual: ambos títulos y contadores correctos, sin numeración ni HTML
visible; 10 acciones y 12 reversos cargados. No se alteran los estilos.

### Causa identificada del desfase con Zed LiveServer

El proceso del puerto 57391 es la extensión LiveServer de Zed. La comparación
HTTP confirmó que entrega `cards-view.mjs` malformado mientras CSS y bitácora
coinciden con el disco. Su implementación, en modo predeterminado, prioriza
una copia en memoria de cada archivo abierto sobre el archivo guardado; al
cerrarlo elimina esa copia. El servidor del puerto 8080 lee el disco y entrega
el módulo correcto. Para recuperar el flujo habitual en Zed, revisar primero
si hay cambios propios sin guardar en `cards-view.mjs`, cerrar ese archivo en
Zed sin sobrescribir la versión buena del disco, reabrirlo y recargar 57391.

## Agregar acciones desde Cartas — almacenamiento simulado

Se integra el formulario «Nueva acción» en la sección Cartas, con el estilo
ciruela y dorado de la galería. Cada alta aparece como carta y actualiza los
contadores. El proveedor compartido incorpora `addAction(text)` asíncrono,
genera identificadores únicos y mantiene una copia privada en memoria del
documento simulado. No modifica el archivo de ejemplo ni escribe almacenamiento
local; los datos duran al navegar y se restablecen al recargar. Esta limitación
se explica en el formulario. El futuro adaptador Electron implementará
`listActions()` y `addAction(text)` para sustituir la simulación.

Se valida texto no vacío de hasta 120 caracteres; los envíos se bloquean mientras
se procesa el alta y los errores conservan el texto para corregirlo. Un fallo
visual después de agregar se distingue de un fallo de almacenamiento para evitar
que el usuario repita accidentalmente un alta que sí se realizó.

Verificación: nueve pruebas de proveedor y sorteo aprobadas. En navegador se
agregó una acción: 10 → 11 acciones, carta visible, probabilidad 1/11 en Ruleta
y conservación al volver a Cartas. Se rechazó texto en blanco y se recargó para
retirar la acción de prueba. Comprobación realizada en 8081 con módulos recién
cargados, después de detectar un módulo antiguo en la caché de la vista 8080.

## Eliminar acciones desde Cartas

Cada carta de acción incluye un botón Eliminar debajo del diseño. El proveedor
compartido incorpora `removeAction(id)`: retira exclusivamente ese identificador
y conserva intacto el documento de ejemplo. Se actualizan carta, contadores y
advertencias de texto; la ruleta recibe la colección restante al entrar. Se
bloquean altas y bajas durante cada operación y se conserva la carta si falla
la eliminación. Tras borrar, el foco pasa al siguiente control disponible.
Los doce reversos zodiacales no tienen controles de eliminación.

Verificado en navegador: 10 → 9 acciones y probabilidad 1/9; colección vacía
con reparto desactivado; agregar después de vaciar y eliminar una acción recién
creada. Se restablecieron los datos iniciales tras las pruebas. Diez pruebas
de proveedor y sorteo aprobadas, incluyendo eliminación por ID de textos iguales,
ID inexistente, vaciado completo e independencia del documento inicial.
Altas y bajas siguen siendo temporales hasta conectar almacenamiento local.

## Fondo de Cartas con una colección creciente

Al crecer la galería, el SVG del cielo se estiraba a `100% 100%` de la altura
total: las estrellas y las constelaciones cambiaban de proporción. Además,
el color claro del `body` podía asomarse como una franja inferior. La galería
ahora usa el ancho disponible y la altura proporcional del SVG, repitiéndolo
verticalmente según haga falta; el fondo del `body` de esta ruta usa el mismo
tono oscuro. Las cartas y la ruleta no se modifican.

Se reprodujo en navegador a 1919 × 995 con 13 acciones y los 12 reversos:
la altura del escenario cubrió la página, el cielo mantuvo `100% auto` y el
borde inferior quedó oscuro. Se recargó para retirar las acciones de prueba.

## Persistencia local con Electron

Se sustituye el documento simulado en memoria por un catálogo JSON real. La
aplicación arranca con `npm start` o `pnpm start`; Electron usa su ruta `userData`,
que en Windows queda en `%APPDATA%\Peachyland\actions.json`. Esta carpeta está
separada del proyecto y de la instalación. Si falta, se crea automáticamente con
las nueve acciones iniciales. Si ya existe, se conserva y se lee, incluso tras
reinstalar la aplicación. Un archivo existente malformado produce un error visible
y nunca se reemplaza silenciosamente por los valores iniciales.

El proceso principal posee el almacén y expone únicamente listar, agregar y
eliminar a través del preload. Las vistas mantienen su contrato asíncrono; la
ruleta y Cartas consultan el mismo catálogo. El almacén valida textos de hasta
120 caracteres e identificadores únicos, serializa operaciones concurrentes y
guarda mediante un archivo temporal antes de sustituir el JSON. La eliminación
sigue siendo por identificador, por lo que dos acciones con el mismo texto son
independientes. LiveServer ya no puede operar estas vistas porque no dispone del
puente de Electron; se usa para desarrollo visual únicamente.

Verificación: 37 pruebas automáticas aprobadas, incluidas creación inicial,
persistencia al construir un segundo almacén, altas concurrentes, vaciado,
validación y protección de JSON dañado. La aplicación abrió en Electron y Cartas
mostró las nueve acciones. Se comprobó que el archivo real se creó en AppData
con versión 1 y nueve acciones. No se modificaron los archivos originales de
referencia (`background.png`, `perfil.png`, `cartas.html`, `cards.css`).

## Retrato durante el reparto y control Eliminar

El componente visual inserta `perfil.png` antes de que termine de cargar su CSS
interno. El primer intento ocultó el elemento completo hasta la carga de CSS;
fue incorrecto: la usuaria observó que las cartas dejaban de aparecer durante
el reparto y que el destello continuaba. Se revirtió ese ocultamiento. La carta
queda visible y únicamente se retrasa la asignación de `src` al retrato hasta
que la hoja de estilos de la carta carga. Así el navegador no puede pintar la
imagen sin sus reglas de tamaño y posición. La ruleta sigue esperando a que la
imagen se decodifique antes de iniciar el reparto.

Se investigó el botón Eliminar en una instancia aislada de Electron: agregar una
acción temporal y eliminarla con un clic de puntero dejó el JSON temporal de
nuevo en nueve acciones. El almacenamiento real se comprobó legible, con nueve
identificadores únicos y sin alterar datos del usuario. El fallo reportado no
se reprodujo en esa instancia. Para mejorar el uso y el diagnóstico, el botón
tiene una zona de clic mayor y muestra «Eliminando…»; si la operación falla,
el error se presenta junto a la carta además de junto al formulario. No se
cambia la política de eliminación por ID ni el diseño de las cartas.

Las 38 pruebas automáticas pasan, incluida una prueba nueva que comprueba que
la carta no queda oculta y que el retrato recibe su `src` solo después del CSS.
Queda pendiente la revisión visual final en la instalación del usuario: una
nueva ejecución de Electron fue rechazada por el límite de uso del entorno.

## Corrección comprobada en Electron — estilos durante el reparto

La corrección anterior del retrato no resolvió el defecto. Se reprodujo en una
instancia de Electron con acciones iniciales aisladas de los datos reales. Al
repartir nueve cartas, el muestreo de cuadros detectó dos cartas visibles cuyo
Shadow DOM tenía cero hojas de estilo aplicadas después de cambiar de contenedor.
En esos cuadros, `perfil.png` medía 836 × 836 px y el encabezado del signo tenía
posición `static`: esto explica tanto la imagen suelta como el nombre fuera del
marco. La espera de `card.ready` y `image.decode()` había terminado antes de ese
cambio de contenedor y no garantizaba que el `<link>` siguiera aplicado.

`card.mjs` ahora convierte el CSS cargado en una hoja construida y la adopta en
el Shadow DOM antes de resolver `ready` y asignar el retrato. Esa hoja permanece
aplicada al mover el mismo elemento entre `.deck-top` y `.roulette-layer`.
Se conservan el tamaño y el diseño de `card.css`, las trayectorias y la identidad
de cada carta. No se modificaron Eliminar, el almacenamiento ni los originales.

Verificación real: en Electron, dos rondas consecutivas con nueve acciones se
muestrearon cuadro a cuadro durante el reparto; hubo cero cuadros con una carta
visible sin estilos, retrato sobredimensionado o encabezado fuera de posición.
Se inspeccionaron capturas de los vuelos, la mesa completa y la frontal ganadora:
las cartas permanecieron sobre la mesa durante el reparto, el mazo se agotó y
el resultado apareció después de la explosión. Las 38 pruebas automáticas
pasaron, incluida la comprobación de adopción de CSS; por sí solas no prueban
la apariencia. La revisión visual en la instalación del usuario sigue abierta.

## Contador y restablecimiento de la mesa — 2026-09-12

El usuario confirmó que la corrección del destello y del texto inferior quedó
como esperaba. Pidió simplificar la información superior izquierda a la cantidad
de cartas y sustituir «Repartir de nuevo» por un control con icono arriba a la
derecha. Ese control debe devolver la vista al mazo inicial sin iniciar el reparto.

La cabecera de la ruleta muestra únicamente el conteo dinámico («1 carta»,
«n cartas») junto a un icono de naipes. El botón de restablecer usa un icono de
retorno con una carta, contorno dorado y fondo borgoña/ciruela; se sitúa separado
del sol decorativo del fondo. El panel inferior conserva solamente el estado.

Después del resultado, pulsar el icono retira las cartas de la mesa, prepara el
mazo y espera. Se mantiene la regla existente de elegir el resultado antes de
animar; pulsar el icono no inicia el vuelo ni revela otro resultado. Solo pulsar
el mazo inicia la siguiente animación. El control permanece desactivado mientras
se prepara o anima, y mientras el mazo está listo.

Verificado en una instancia aislada de Electron con nueve acciones: se capturaron
inicio, resultado y mesa restablecida; el mazo volvió y permaneció quieto tras
700 ms; un nuevo clic en el mazo inició el segundo reparto. La revisión de
capturas comprobó que el icono no se superpone al adorno y que el mazo restaurado
no muestra un marco de foco adicional. Las 38 pruebas automáticas pasaron.
No se usó ni modificó el archivo de acciones real. Estado: implementado y
comprobado localmente; pendiente de aprobación visual del usuario.

### Ajuste del icono de restablecimiento

El usuario indicó que la flecha del icono se veía extraña y pidió dejar solo el
mazo. Se sustituyó únicamente el SVG del botón por tres cartas superpuestas con
un pequeño rombo en la frontal; su acción de restablecer, posición y etiqueta
accesible permanecen iguales. Se verificó una captura del botón en Electron al
tamaño real de la interfaz. Pendiente de aprobación visual del usuario.

## Cartas — acceso a la carpeta de datos — 2026-09-12

El usuario pidió retirar los dos textos inferiores del formulario «Nueva acción»
y ofrecer un acceso a los datos guardados. Se quitaron el aviso permanente de
longitud/guardado y los mensajes de éxito tras agregar o eliminar. Los errores
de guardado, apertura o representación de una carta siguen apareciendo bajo el
formulario cuando requieren atención. El límite de 120 caracteres y la lógica
de altas y bajas permanecen intactos.

Un botón secundario «Abrir carpeta de datos» bajo el campo llama a Electron para
abrir exclusivamente su carpeta `userData`, donde se encuentra `actions.json`.
La interfaz no recibe ni elige rutas arbitrarias. El botón tiene icono de carpeta
y estilos acordes a la galería; un fallo al abrir muestra un error en el formulario.

Verificado en Electron con datos aislados: la vista mostró el botón sin los
textos anteriores, una alta de prueba aumentó el conteo de 9 a 10 sin mensaje
de éxito y el clic invocó una sola llamada IPC. También se ejecutó el proceso
principal con `userData` temporal y `shell.openPath` instrumentado: el destino
solicitado coincidió exactamente con esa carpeta y su `actions.json` existía.
No se abrió ni alteró el JSON real.
Pasaron las 38 pruebas automáticas. Pendiente de revisión visual del usuario.

## Ventana de Electron sin menú predeterminado — 2026-09-12

El usuario pidió retirar la franja «File · Edit · View · Window» que aparece
debajo de la barra de título. El proceso principal desactiva el menú
predeterminado de Electron antes de crear la ventana. La barra de título y los
controles de minimizar, maximizar y cerrar se conservan; no cambian las vistas.

Verificado al abrir Electron con `userData` aislado: `isMenuBarVisible()` devolvió
`false`, el título de la ventana siguió siendo «Ruleta · Peachyland» y el archivo
de acciones de prueba se creó en la carpeta temporal. No se tocaron los datos
reales. Pendiente de revisión visual del usuario.

## Icono de la ventana con el retrato — 2026-09-12

El usuario pidió sustituir el icono de Electron por `perfil.png`. La ventana
ahora usa esa imagen original como icono mediante la opción `icon` de
`BrowserWindow`; el PNG no se modificó. Electron admite PNG para el icono de
ventana en Windows, por lo que no se requiere un `.ico` en el arranque actual.
Un futuro ejecutable distribuible puede necesitar un `.ico` derivado para su
propio icono y las distintas escalas de Windows.

Verificado al abrir la aplicación en Electron con `userData` aislado:
`nativeImage` cargó `perfil.png` sin quedar vacío (1254 × 1254 px), la ventana
conservó el título «Ruleta · Peachyland» y el archivo de acciones se creó solo
en la carpeta temporal. No se tocó el JSON real. Pendiente de revisión visual
del usuario en su instalación.

## Limpieza de carpetas vacías tras las verificaciones de Electron — 2026-09-12

El usuario encontró carpetas con nombres Unicode extraños en la raíz del
proyecto. Se revisaron en solo lectura: eran 19, creadas en los horarios de las
pruebas locales de Electron, y cada una contenía exclusivamente los directorios
vacíos `Microsoft/Spelling/neutral`. No había archivos, acciones ni código.
Tras verificar cada ruta y contenido, se retiraron solo esas 19 carpetas.
La raíz conserva `.git`, `demos`, `electron`, `node_modules`, `src` y `tests`.
No se cambió código ni se tocaron los datos reales del usuario.

## Moneda — 2026-09-12

Se añadió «Moneda» como tercera sección de la navegación. La vista utiliza el
fondo zodiacal de la ruleta y una moneda dorada con dos caras identificadas
como «CARA» y «CRUZ». Al pulsar «Lanzar moneda», se elige una de las dos con
probabilidad 1/2 mediante `crypto.getRandomValues`, antes de iniciar el giro.
El botón se bloquea durante la animación y, al terminar, la cara visible y el
mensaje de resultado coinciden. Se puede lanzar de nuevo sin salir de la vista.
Con movimiento reducido, el cambio dura 240 ms sin giros rápidos.

Se comprobó en Electron con carpeta `userData` aislada: la vista cargó el fondo,
la navegación y el título «Moneda · Peachyland»; se inspeccionaron capturas de
inicio, vuelo y resultado. La primera revisión reveló que una sombra con filtro
aplanaba la moneda 3D: se trasladó esa sombra a las caras y una nueva captura
mostró correctamente «CRUZ» junto a «Salió cruz». En otras ejecuciones se
observaron «Salió cara» con la cara frontal, el segundo lanzamiento y la rama
de movimiento reducido. Pasaron las 39 pruebas automáticas. Estas capturas
verifican la instancia local de Electron, no una sesión posterior de la streamer.
No se abrió ni alteró el archivo real de acciones.
Las ejecuciones de Electron generaron seis carpetas Unicode sin archivos
(cinco con `Microsoft/Spelling/neutral` vacío) pese a desactivar Spellcheck.
Se verificó su contenido y ubicación antes de borrarlas. También se retiraron
el perfil aislado y el guion temporal de la prueba; la raíz volvió a contener
solo los directorios habituales del proyecto.

## Ajuste visual de Moneda — 2026-09-13

El usuario pidió una moneda más acorde con las cartas y centrada en la rueda
zodiacal. Se sustituyó el acabado metálico liso por un disco de esmalte
ciruela/borgoña con aros dorados, la firma Peachyland y símbolos de sol y luna.
Un halo y un reflejo tenues aportan brillo; ambos dejan de animarse con la
preferencia de movimiento reducido. El centro de la moneda se fijó al 46,3 %
de la altura de la mesa, que corresponde al centro de la rueda en `background.png`.
Se redujo el símbolo central para separar con claridad el dibujo y el nombre
de cada cara. No cambió la selección aleatoria ni la lógica del lanzamiento.

Verificado en Electron con perfil aislado mediante capturas de la vista inicial,
el resultado «Salió cruz», un segundo lanzamiento «Salió cara» en modo de
movimiento reducido y la ventana de 950 × 650. La posición medida de la moneda
fue el 46,3 % de la altura de la mesa y las caras visibles coincidieron con
sus mensajes. Una primera captura de diagnóstico quedó detenida cuando
Electron marcó la ventana como oculta; al mantener activa la ventana de prueba
se completó la animación y se obtuvieron las capturas finales. No se usaron
los datos reales de acciones.
Las pruebas generaron siete carpetas Unicode sin archivos, todas con solo
`Microsoft/Spelling/neutral` vacío. Se verificó su contenido y se retiraron
junto al perfil y guion temporales de Electron. Pasaron las 39 pruebas
automáticas y `git diff --check`.

## Vuelo e impacto de Moneda — 2026-09-13

Se ajustó el lanzamiento a petición del usuario. El giro ahora usa de 1,5 a
2,5 vueltas (según la cara anterior y el resultado) repartidas linealmente en
2,8 segundos. La moneda asciende hasta 240 px en la mesa grande, permanece un
instante arriba y acelera en el descenso. En ventanas pequeñas la altura se
limita al espacio disponible para evitar que salga del escenario. Al tocar la
mesa, hace un rebote de 9 px y activa durante 300 ms exactamente los mismos
desplazamientos de sacudida que el impacto de la carta ganadora. El halo y la
sombra se intensifican brevemente. Movimiento reducido conserva el cambio de
cara sin vuelo ni sacudida.

Verificado en Electron con perfil aislado: se capturaron vuelo alto y resultado;
la animación midió 240 px de elevación y 2,8 s de giro en la ventana grande.
El impacto produjo 14 muestras de desplazamiento de la mesa y terminó con
`translate: none`. En la ventana mínima la elevación fue de 148 px; un segundo
lanzamiento conservó la cara correcta. Se forzó el modo de movimiento reducido
para comprobar que termina en «Salió cara» sin sacudida. No se usó el JSON real.
Pasaron las 39 pruebas automáticas y `git diff --check`. Las dos carpetas
Unicode vacías creadas por Electron se verificaron y retiraron junto al perfil
y guion temporales; la raíz conserva solo los directorios habituales.
