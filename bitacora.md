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
