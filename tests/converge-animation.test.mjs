import test from 'node:test';
import assert from 'node:assert/strict';
import { convergeCards, createImpactPositions } from '../src/roulette/converge-animation.mjs';
import { cardTransform } from '../src/roulette/layout.mjs';

function makeCard(pending = false) {
  const animations = [];
  const element = {
    style: { transform: 'translate(200px, 50px)' },
    animate(frames) {
      let rejectFinished;
      const finished = pending
        ? new Promise((resolve, reject) => { rejectFinished = reject; })
        : Promise.resolve();
      const animation = {
        frames,
        finished,
        cancelled: false,
        cancel() {
          this.cancelled = true;
          rejectFinished?.(new DOMException('Cancelada', 'AbortError'));
        },
      };
      animations.push(animation);
      return animation;
    },
  };
  return { element, animations };
}

test('los destinos admiten n cartas y permanecen cerca del centro', () => {
  for (const total of [1, 9, 12, 50]) {
    const positions = createImpactPositions(total, () => 0.5);
    assert.equal(positions.length, total);
    assert.ok(positions.every(position => Math.hypot(position.x, position.y) <= 42));
    assert.equal(new Set(positions.map(position => `${position.x},${position.y}`)).size, total);
  }
  assert.throws(() => createImpactPositions(0), RangeError);
});

for (const reducedMotion of [false, true]) {
  test(`la convergencia fija destinos y limpia efectos (movimiento reducido: ${reducedMotion})`, async () => {
    const cards = [makeCard(), makeCard()];
    const destinations = await convergeCards({
      cards, reducedMotion, signal: new AbortController().signal,
    });
    cards.forEach((card, index) => {
      const { x, y, rotation } = destinations[index];
      assert.equal(card.element.style.transform, cardTransform(x, y, rotation));
      assert.ok(card.animations.every(animation => animation.cancelled));
      assert.equal('opacity' in card.animations[0].frames[0], reducedMotion);
    });
  });

  test(`cancelar restaura las posiciones (movimiento reducido: ${reducedMotion})`, async () => {
    const cards = [makeCard(true), makeCard(true)];
    const controller = new AbortController();
    const pending = convergeCards({ cards, reducedMotion, signal: controller.signal });
    controller.abort();
    await assert.rejects(pending, { name: 'AbortError' });
    for (const card of cards) {
      assert.equal(card.element.style.transform, 'translate(200px, 50px)');
      assert.ok(card.animations.every(animation => animation.cancelled));
    }
  });
}
