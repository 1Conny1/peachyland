import { cardTransform, deckThickness } from './layout.mjs';

/** El consumidor puede continuar con estas mismas cartas después del reparto. */
export async function dealCards({ cards, plan, positions, deck, layer, signal, onProgress }) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = reducedMotion ? 60 : 460;
  const deckTop = deck.querySelector('.deck-top');

  async function animate(element, keyframes) {
    signal.throwIfAborted();
    const animation = element.animate(keyframes, {
      duration,
      easing: 'cubic-bezier(.22,.68,.35,1)',
      fill: 'forwards',
    });
    const cancel = () => animation.cancel();
    signal.addEventListener('abort', cancel, { once: true });

    try {
      await animation.finished;
      signal.throwIfAborted();
    } finally {
      signal.removeEventListener('abort', cancel);
      animation.cancel();
    }
  }

  for (let index = 0; index < cards.length; index += 1) {
    signal.throwIfAborted();
    const card = cards[index].element;
    const position = positions[index];
    const remaining = plan.cards[index].remainingAfterDeal;
    const before = deckThickness(remaining + 1, plan.total);
    const after = deckThickness(remaining, plan.total);
    const destination = cardTransform(position.x, position.y, position.rotation);

    // Es el mismo elemento que estaba visible encima del mazo.
    // Al moverlo a la mesa conserva su signo durante todo el recorrido.
    layer.append(card);
    card.style.visibility = 'visible';
    card.style.zIndex = '40';

    // La siguiente carta real queda visible debajo mientras sale la actual.
    deckTop.replaceChildren();
    const nextCard = cards[index + 1]?.element;
    if (nextCard) deckTop.append(nextCard);

    // El estilo final permanece después de cancelar el objeto Animation.
    card.style.transform = destination;
    deck.style.setProperty('--thickness', `${after}px`);

    const flight = reducedMotion
      ? [{ opacity: 0 }, { opacity: 1 }]
      : [
          { transform: cardTransform(0, -before), offset: 0 },
          { transform: cardTransform(position.x * .5 + 18, position.y * .5 - 35, -5), offset: .5 },
          { transform: cardTransform(position.x, position.y - 8, position.rotation), offset: .85 },
          { transform: destination, offset: 1 },
        ];

    const thinning = [
      { height: `${before}px`, transform: `translateY(${-before}px)` },
      { height: `${after}px`, transform: `translateY(${-after}px)` },
    ];

    await Promise.all([
      animate(card, flight),
      animate(deck.querySelector('.deck-edge'), thinning),
      animate(deckTop, [
        { transform: `translateY(${-before}px)` },
        { transform: `translateY(${-after}px)` },
      ]),
    ]);

    card.style.zIndex = String(index + 1);
    if (remaining === 0) deck.hidden = true;
    onProgress(index + 1, remaining);
  }
}
