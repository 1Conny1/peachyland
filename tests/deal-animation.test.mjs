import test from 'node:test';
import assert from 'node:assert/strict';
import { dealCards } from '../src/roulette/deal-animation.mjs';

test('la última carta sale sin dejar una capa decorativa y repetir recupera el mazo', async () => {
  const previousMatchMedia = globalThis.matchMedia;
  globalThis.matchMedia = () => ({ matches: false });
  const edge = { hidden: false };
  const animated = () => ({
    style: { setProperty() {} },
    animate() { return { finished: Promise.resolve(), cancel() {} }; },
  });
  const top = { ...animated(), replaceChildren() {}, append() {} };
  const deck = {
    ...animated(), hidden: false,
    querySelector(selector) { return selector === '.deck-top' ? top : edge; },
  };
  try {
    for (const total of [3, 1, 3]) {
      deck.hidden = false;
      const cards = Array.from({ length: total }, (_, index) => {
        const element = animated();
        element.animate = () => {
          if (index === total - 1) {
            assert.equal(edge.hidden, true);
            assert.equal(deck.hidden, true);
          }
          return { finished: Promise.resolve(), cancel() {} };
        };
        return { element };
      });
      let dealt = 0;
      await dealCards({
        cards, deck, layer: { append() {} },
        plan: { total, cards: cards.map((_, index) => ({ remainingAfterDeal: total - index - 1 })) },
        positions: cards.map(() => ({ x: 10, y: 20, rotation: 0 })),
        signal: new AbortController().signal,
        onProgress(count) { dealt = count; },
      });
      assert.equal(dealt, total);
    }
  } finally {
    if (previousMatchMedia === undefined) delete globalThis.matchMedia;
    else globalThis.matchMedia = previousMatchMedia;
  }
});
