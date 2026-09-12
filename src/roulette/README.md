# Mesa y reparto

Entrada única: `/index.html#/ruleta`, en el servidor local del proyecto.
La navegación usa src/app/main.mjs y conserva la galería en #/cartas.

Responsabilidades:

- layout.mjs calcula las posiciones y el grosor del mazo.
- deal-animation.mjs ejecuta el reparto y acepta AbortSignal para cancelación.
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

El plan selecciona la acción antes de animar. No se construye ninguna frontal ni
se muestra el resultado en esta etapa. Se esperan estilos e imágenes antes de
repartir. Cambiar de sección cancela animaciones y observación de tamaño.
La preferencia de movimiento reducido reemplaza los vuelos por apariciones breves.

La portada del mazo no es una carta fija. El primer elemento real del plan se monta
encima del mazo; al repartirlo, ese mismo elemento pasa a la capa de la mesa y la
siguiente carta ocupa su lugar. Por eso el signo permanece idéntico durante todo
el vuelo. Cada repetición prepara un mazo nuevo antes de mostrar su primera carta.

Prueba manual pendiente: iniciar, observar adelgazamiento y última carta, repetir,
navegar durante el reparto, regresar, cambiar el ancho de ventana y comprobar que
la galería anterior sigue funcionando. No se ha ejecutado verificación visual
automatizada en navegador en esta entrega.
