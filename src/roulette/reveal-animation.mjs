import { CARD_WIDTH, cardTransform } from './layout.mjs';
import { CARD_HEIGHT_RATIO } from '../cards/card.mjs';

/** El borde es azar visual independiente de la acción ganadora. */
export function createReturnPosition(width, height, random = Math.random) {
  const edge = Math.floor(random() * 4);
  const alongEdge = (random() - 0.5) * 0.8;
  const margin = Math.hypot(CARD_WIDTH, CARD_WIDTH * CARD_HEIGHT_RATIO) + 64;
  const positions = [
    { x: alongEdge * width, y: -height / 2 - margin },
    { x: width / 2 + margin, y: alongEdge * height },
    { x: alongEdge * width, y: height / 2 + margin },
    { x: -width / 2 - margin, y: alongEdge * height },
  ];
  return { ...positions[edge], rotation: (random() - 0.5) * 80 };
}

/** Recibe la ganadora ya elegida: nunca sortea ni construye otras frontales. */
export async function revealWinner({
  card,
  actionText,
  width,
  height,
  signal,
  table,
  prepareAssets = async () => {},
  reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches,
}) {
  signal.throwIfAborted();
  if (card.element.style.visibility !== 'hidden') {
    throw new Error('La ganadora debe estar oculta antes de preparar su frontal.');
  }
  const element = card.element;
  const originalTransform = element.style.transform;
  const originalZIndex = element.style.zIndex;
  const animations = [];
  let completed = false;

  function cancelAnimation() {
    for (const animation of animations) animation.cancel();
  }
  signal.addEventListener('abort', cancelAnimation, { once: true });

  try {
    // La explosión ya dejó esta carta fuera de pantalla y oculta.
    const textFits = card.showFront(actionText);
    await prepareAssets(card);
    signal.throwIfAborted();

    // Ampliación uniforme: conserva proporciones y espacio para los controles.
    const scale = Math.min(1.5, width * 0.65 / CARD_WIDTH,
      height * 0.48 / (CARD_WIDTH * CARD_HEIGHT_RATIO));
    const finalTransform = `${cardTransform(0, 0)} scale(${scale})`;
    const entry = createReturnPosition(width, height);
    const entryTransform = cardTransform(entry.x, entry.y, entry.rotation);
    const liftedTransform = `${cardTransform(0, -12)} scale(${scale * 1.16})`;
    element.style.zIndex = '40';
    element.style.transform = reducedMotion ? finalTransform : entryTransform;

    const animation = element.animate(reducedMotion
      ? [{ opacity: 0 }, { opacity: 1 }]
      : [{ transform: entryTransform }, { transform: liftedTransform }], {
      duration: reducedMotion ? 250 : 1000,
      easing: 'cubic-bezier(.16,1,.3,1)',
      fill: 'both',
    });
    animations.push(animation);
    element.style.visibility = 'visible';
    await animation.finished;
    signal.throwIfAborted();

    if (!reducedMotion) {
      // La escala simula altura: descenso rápido, contacto y rebote amortiguado.
      const fall = element.animate([
        { transform: liftedTransform },
        { transform: finalTransform },
      ], { duration: 150, easing: 'cubic-bezier(.6,0,1,1)', fill: 'forwards' });
      animations.push(fall);
      await fall.finished;
      signal.throwIfAborted();

      const rebound = element.animate([
        { transform: finalTransform },
        { transform: `${cardTransform(0, -4)} scale(${scale * 1.035})`, offset: 0.3 },
        { transform: finalTransform },
      ], { duration: 300, easing: 'ease-out', fill: 'forwards' });
      animations.push(rebound);
      const impacts = [rebound];
      if (table) {
        const shake = table.animate([
          { translate: '0px 0px' },
          { translate: '5px 6px' },
          { translate: '-4px -3px' },
          { translate: '3px 2px' },
          { translate: '-1px -1px' },
          { translate: '0px 0px' },
        ], { duration: 300, easing: 'linear' });
        animations.push(shake);
        impacts.push(shake);
      }
      await Promise.all(impacts.map(impact => impact.finished));
      signal.throwIfAborted();
    }
    element.style.transform = finalTransform;
    completed = true;
    return { textFits };
  } finally {
    signal.removeEventListener('abort', cancelAnimation);
    cancelAnimation();
    if (!completed) {
      element.style.visibility = 'hidden';
      element.style.transform = originalTransform;
      element.style.zIndex = originalZIndex;
    }
  }
}
