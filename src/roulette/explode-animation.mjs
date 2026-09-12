import { CARD_HEIGHT_RATIO } from '../cards/card.mjs';
import { CARD_WIDTH, cardTransform } from './layout.mjs';

/** Calcula salidas completas, incluso con cartas giradas y mesas verticales. */
export function createExitPositions(total, width, height, random = Math.random) {
  if (!Number.isInteger(total) || total < 1) {
    throw new RangeError('La explosión necesita al menos una carta.');
  }
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
    throw new RangeError('La mesa necesita dimensiones positivas.');
  }

  const cardRadius = Math.hypot(CARD_WIDTH, CARD_WIDTH * CARD_HEIGHT_RATIO) / 2;
  // Fuera del círculo que contiene toda la mesa, no queda ninguna esquina visible.
  const exitRadius = Math.hypot(width / 2, height / 2) + cardRadius + 64;

  return Array.from({ length: total }, (_, index) => {
    const angle = (index + (random() - 0.5) * 0.4) * Math.PI * 2 / total - Math.PI / 2;
    return {
      x: Math.cos(angle) * exitRadius,
      y: Math.sin(angle) * exitRadius,
      rotation: (index % 2 === 0 ? 1 : -1) * (150 + random() * 160),
    };
  });
}

/** Devuelve las posiciones de salida sin crear frontales ni elegir resultados. */
export async function explodeCards({
  cards,
  width,
  height,
  signal,
  reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches,
}) {
  signal.throwIfAborted();
  const destinations = createExitPositions(cards.length, width, height);
  const originals = cards.map(({ element }) => ({
    transform: element.style.transform,
    visibility: element.style.visibility,
  }));
  const animations = [];
  let completed = false;

  function cancelAnimations() {
    for (const animation of animations) animation.cancel();
  }

  signal.addEventListener('abort', cancelAnimations, { once: true });

  try {
    cards.forEach((card, index) => {
      const { x, y, rotation } = destinations[index];
      // Una pausa breve compartida permite percibir la reunión antes de estallar.
      const frames = reducedMotion
        ? [{ opacity: 1 }, { opacity: 0 }]
        : [
          { transform: originals[index].transform },
          { transform: cardTransform(x, y, rotation) },
        ];
      animations.push(card.element.animate(frames, {
        delay: 140,
        duration: reducedMotion ? 220 : 720 + (index % 3) * 40,
        easing: reducedMotion ? 'ease-out' : 'cubic-bezier(.15,.65,.3,1)',
        fill: 'forwards',
      }));
    });

    await Promise.all(animations.map(animation => animation.finished));
    signal.throwIfAborted();

    cards.forEach((card, index) => {
      const { x, y, rotation } = destinations[index];
      card.element.style.transform = cardTransform(x, y, rotation);
      // Ocultarlas también protege frente a un cambio posterior de tamaño de ventana.
      card.element.style.visibility = 'hidden';
    });
    completed = true;
    return destinations;
  } finally {
    signal.removeEventListener('abort', cancelAnimations);
    cancelAnimations();
    if (!completed) {
      cards.forEach((card, index) => {
        Object.assign(card.element.style, originals[index]);
      });
    }
  }
}
