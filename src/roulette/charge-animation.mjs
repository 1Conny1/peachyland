// Colores tomados del marco dorado y de los tonos ciruela/borgoña de la baraja.
const QUIET_HALO = '0 0 0 0 rgba(203, 160, 107, 0), 0 0 0 0 rgba(100, 27, 53, 0)';
const SOFT_HALO = '0 0 12px 2px rgba(203, 160, 107, .28), 0 0 22px 5px rgba(91, 70, 111, .24)';
const CHARGED_HALO = '0 0 22px 4px rgba(203, 160, 107, .65), 0 0 38px 9px rgba(100, 27, 53, .48)';

function pause(milliseconds, signal) {
  signal.throwIfAborted();

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', cancel);
      resolve();
    }, milliseconds);

    function cancel() {
      clearTimeout(timer);
      signal.removeEventListener('abort', cancel);
      reject(signal.reason);
    }

    signal.addEventListener('abort', cancel, { once: true });
  });
}

function createTrembleFrames(direction) {
  const frames = [];
  const steps = 24;

  for (let step = 0; step <= steps; step += 1) {
    const progress = step / steps;
    const amplitude = 0.5 + progress * 2;
    const horizontal = (step % 2 === 0 ? 1 : -1) * amplitude * direction;
    const vertical = (step % 3 - 1) * amplitude * 0.5;

    frames.push({
      // translate se suma al transform del reparto sin cambiar su posición base.
      translate: step === 0 || step === steps ? '0px 0px' : `${horizontal}px ${vertical}px`,
      offset: progress,
    });
  }

  return frames;
}

/** Fase acotada para revisar la carga. No conoce el resultado ni crea frontales. */
export async function chargeCards({
  cards,
  signal,
  onPhase = () => {},
  whileCharged = async () => {},
  reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches,
}) {
  signal.throwIfAborted();
  const animations = [];
  const previousRadii = new Map();

  function cancelAnimations() {
    for (const animation of animations) animation.cancel();
  }

  async function runAnimations(createAnimations) {
    signal.throwIfAborted();
    const currentAnimations = [];

    for (const card of cards) {
      const created = createAnimations(card.element, currentAnimations.length);
      animations.push(...created);
      currentAnimations.push(...created);
    }

    await Promise.all(currentAnimations.map(animation => animation.finished));
    signal.throwIfAborted();
  }

  signal.addEventListener('abort', cancelAnimations, { once: true });

  try {
    onPhase('pause');
    await pause(450, signal);
    onPhase('charging');

    for (const card of cards) {
      previousRadii.set(card.element, card.element.style.borderRadius);
      card.element.style.borderRadius = '13px';
    }

    await runAnimations((element, index) => {
      const glow = element.animate([
        { boxShadow: QUIET_HALO },
        { boxShadow: SOFT_HALO, offset: 0.4 },
        { boxShadow: CHARGED_HALO },
      ], { duration: 1400, easing: 'ease-in', fill: 'forwards' });

      if (reducedMotion) return [glow];

      const tremble = element.animate(createTrembleFrames(index % 4 === 0 ? 1 : -1), {
        duration: 1400,
        easing: 'linear',
        fill: 'forwards',
      });

      return [glow, tremble];
    });

    onPhase('charged');
    await pause(300, signal);

    // La fase siguiente comparte el halo; finally lo limpia incluso si falla.
    signal.throwIfAborted();
    await whileCharged();
    signal.throwIfAborted();

    // Retirar el halo al terminar las fases conectadas, antes de la futura revelación.
    await runAnimations(element => [element.animate([
      { boxShadow: CHARGED_HALO },
      { boxShadow: QUIET_HALO },
    ], { duration: 350, easing: 'ease-out', fill: 'forwards' })]);
  } finally {
    signal.removeEventListener('abort', cancelAnimations);
    cancelAnimations();

    for (const [element, radius] of previousRadii) {
      element.style.borderRadius = radius;
    }
  }
}
