import test from 'node:test';
import assert from 'node:assert/strict';
import { explodeCards, createExitPositions } from '../src/roulette/explode-animation.mjs';
import { CARD_WIDTH, cardTransform } from '../src/roulette/layout.mjs';
import { CARD_HEIGHT_RATIO } from '../src/cards/card.mjs';

function makeCard(pending = false) {
  const animations = [];
  const element = {
    style: { transform: 'translate(15px, 20px)', visibility: 'visible' },
    animate(frames) {
      let rejectFinished;
      const animation = {
        frames,
        cancelled: false,
        finished: pending
          ? new Promise((resolve, reject) => { rejectFinished = reject; })
          : Promise.resolve(),
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

test('todas las cartas salen completamente en mesas horizontales y verticales', () => {
  const cardRadius = Math.hypot(CARD_WIDTH, CARD_WIDTH * CARD_HEIGHT_RATIO) / 2;
  for (const [width, height] of [[1672, 941], [600, 1000], [2560, 720]]) {
    for (const total of [1, 9, 12, 50, 100]) {
      const positions = createExitPositions(total, width, height, () => 0.5);
      assert.equal(positions.length, total);
      for (const { x, y } of positions) {
        const distanceToTable = Math.hypot(
          Math.max(0, Math.abs(x) - width / 2),
          Math.max(0, Math.abs(y) - height / 2),
        );
        assert.ok(distanceToTable > cardRadius);
      }
    }
  }
  assert.throws(() => createExitPositions(0, 1000, 700), RangeError);
  assert.throws(() => createExitPositions(9, 0, 700), RangeError);
});

for (const reducedMotion of [false, true]) {
  test(`la explosión oculta las cartas y entrega sus destinos (reducido: ${reducedMotion})`, async () => {
    const cards = [makeCard(), makeCard()];
    const destinations = await explodeCards({
      cards, width: 1600, height: 900, reducedMotion, signal: new AbortController().signal,
    });
    cards.forEach((card, index) => {
      const { x, y, rotation } = destinations[index];
      assert.equal(card.element.style.transform, cardTransform(x, y, rotation));
      assert.equal(card.element.style.visibility, 'hidden');
      assert.ok(card.animations.every(animation => animation.cancelled));
      assert.equal('opacity' in card.animations[0].frames[0], reducedMotion);
    });
  });

  test(`cancelar restaura estilos y elimina efectos (reducido: ${reducedMotion})`, async () => {
    const cards = [makeCard(true), makeCard(true)];
    const controller = new AbortController();
    const pending = explodeCards({
      cards, width: 1600, height: 900, reducedMotion, signal: controller.signal,
    });
    controller.abort();
    await assert.rejects(pending, { name: 'AbortError' });
    for (const card of cards) {
      assert.equal(card.element.style.transform, 'translate(15px, 20px)');
      assert.equal(card.element.style.visibility, 'visible');
      assert.ok(card.animations.every(animation => animation.cancelled));
    }
  });
}

test('una señal ya cancelada impide iniciar la explosión', async () => {
  const card = makeCard();
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(explodeCards({
    cards: [card], width: 1600, height: 900, reducedMotion: false, signal: controller.signal,
  }), { name: 'AbortError' });
  assert.equal(card.animations.length, 0);
});
