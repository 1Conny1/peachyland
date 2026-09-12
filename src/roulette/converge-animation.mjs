import { cardTransform } from './layout.mjs';

/** Destinos visuales independientes de la acción seleccionada. */
export function createImpactPositions(total, random = Math.random) {
  if (!Number.isInteger(total) || total < 1) {
    throw new RangeError('La convergencia necesita al menos una carta.');
  }

  return Array.from({ length: total }, (_, index) => {
    // El ángulo áureo evita alinear todas las cartas en una misma dirección.
    const angle = index * 2.399963 + (random() - 0.5) * 0.4;
    const radius = 14 + random() * 28;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius * 0.78,
      rotation: (random() - 0.5) * 64,
    };
  });
}

/** Reúne las mismas cartas y entrega sus destinos para conectar la próxima fase. */
export async function convergeCards({
  cards,
  signal,
  reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches,
}) {
  signal.throwIfAborted();
  const destinations = createImpactPositions(cards.length);
  const animations = [];
  const originalTransforms = cards.map(card => card.element.style.transform);
  let completed = false;

  function cancelAnimations() {
    for (const animation of animations) animation.cancel();
  }

  signal.addEventListener('abort', cancelAnimations, { once: true });

  try {
    for (let index = 0; index < cards.length; index += 1) {
      const element = cards[index].element;
      const destination = destinations[index];
      const finalTransform = cardTransform(destination.x, destination.y, destination.rotation);

      if (reducedMotion) {
        // Sin vuelo: una aparición breve en el punto de reunión.
        element.style.transform = finalTransform;
        animations.push(element.animate([{ opacity: 0.3 }, { opacity: 1 }], {
          duration: 220,
          fill: 'forwards',
        }));
      } else {
        animations.push(element.animate([
          { transform: originalTransforms[index] },
          { transform: finalTransform },
        ], {
          duration: 620 + (index % 3) * 20,
          easing: 'cubic-bezier(.65,0,.9,.55)',
          fill: 'forwards',
        }));
      }
    }

    await Promise.all(animations.map(animation => animation.finished));
    signal.throwIfAborted();

    // Fijamos los destinos antes de retirar los efectos de animación.
    cards.forEach((card, index) => {
      const { x, y, rotation } = destinations[index];
      card.element.style.transform = cardTransform(x, y, rotation);
    });
    completed = true;
    return destinations;
  } finally {
    signal.removeEventListener('abort', cancelAnimations);
    cancelAnimations();

    if (!completed) {
      cards.forEach((card, index) => {
        card.element.style.transform = originalTransforms[index];
      });
    }
  }
}
