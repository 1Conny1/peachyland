# Mesa y reparto

Entrada única: `/index.html#/ruleta`, en el servidor local del proyecto.
La navegación usa src/app/main.mjs y conserva la galería en #/cartas.

Responsabilidades:

- layout.mjs calcula las posiciones y el grosor del mazo.
- deal-animation.mjs ejecuta el reparto y acepta AbortSignal para cancelación.
- charge-animation.mjs añade pausa, temblor progresivo y halo dorado/ciruela.
- converge-animation.mjs reúne las cartas en el centro y devuelve sus destinos.
- explode-animation.mjs dispersa las cartas fuera de la mesa y devuelve sus destinos.
- reveal-animation.mjs prepara únicamente la frontal ganadora oculta y la devuelve al centro.

El regreso elige uno de los cuatro bordes con azar visual independiente. Conserva
el vuelo de 1000 ms y añade descenso de 150 ms y rebote/temblor de mesa de 300 ms.
Movimiento reducido omite el impacto. Todos los efectos se cancelan al navegar.
- ../views/roulette-view.mjs conecta proveedor, sorteo, cartas y controles.
- table.css presenta el escenario y el apilado.

La mesa ocupa todo el espacio disponible a la derecha de la navegación. El fondo
se ajusta al ancho y alto completos, sin márgenes ni recortes. Los controles están
dentro de la mesa. El mazo
tiene una portada y un borde de líneas que simula su grosor sin crear n capas.
Cada salida interpola el grosor hasta el valor restante; desaparece con la última.
Las cartas mantienen 150 × 213,33 y se reparten en anillos de hasta doce posiciones.
El primer anillo sigue las proporciones del círculo zodiacal central del fondo.
Se permiten solapamientos para conservar un tamaño legible. Con muchas acciones,
los anillos se superponen más: el rendimiento y la distribución
para grandes catálogos necesitan una revisión visual específica posterior.

El plan selecciona la acción antes de animar. Solo se construye la frontal ganadora
después de la explosión, estando oculta. Se esperan estilos e imágenes antes de
repartir. Cambiar de sección cancela animaciones y observación de tamaño.
La preferencia de movimiento reducido reemplaza los vuelos por apariciones breves.

Después del reparto hay 450 ms de pausa, 1400 ms de carga, 300 ms de energía
acumulada, convergencia de 620–660 ms, pausa de 140 ms y explosión de 720–800 ms.
La carga mantiene el halo durante ambos movimientos mediante whileCharged y lo
retira al terminar con 350 ms de desvanecimiento.
Las mismas cartas se reúnen con pequeñas variaciones de posición y rotación,
sin modificar el resultado preseleccionado ni crear frontales. Después salen en
direcciones distribuidas, con giros alternados. Los destinos contemplan la diagonal
de mesa y carta para dejarlas completamente fuera; al terminar se ocultan para
evitar que reaparezcan al redimensionar. Movimiento reducido usa un desvanecimiento
sin vuelo. La ganadora regresa desde su salida al centro en 1000 ms (aparición de
250 ms con movimiento reducido), ampliada hasta 1,5 veces sin alterar proporciones.
La acción queda visible en la carta y en el estado accesible hasta repetir.
Los controles permanecen
desactivados hasta terminar. El halo usa dorado envejecido y tonos ciruela/borgoña,
sin blanquear la imagen. El temblor usa translate y conserva el transform de cada
carta. Movimiento reducido mantiene el halo gradual sin temblor. AbortSignal cancela
pausas y animaciones; el cierre restaura los estilos temporales.

La portada del mazo no es una carta fija. El primer elemento real del plan se monta
encima del mazo; al repartirlo, ese mismo elemento pasa a la capa de la mesa y la
siguiente carta ocupa su lugar. Por eso el signo permanece idéntico durante todo
el vuelo. Cada repetición prepara un mazo nuevo antes de mostrar su primera carta.

Prueba manual pendiente: iniciar, observar adelgazamiento y última carta, repetir,
navegar durante el reparto, regresar, cambiar el ancho de ventana y comprobar que
la galería anterior sigue funcionando. No se ha ejecutado verificación visual
automatizada en navegador en esta entrega.
