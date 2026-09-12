import test from 'node:test';
import assert from 'node:assert/strict';
import { chargeCards } from '../src/roulette/charge-animation.mjs';

function makeCard() {
  const animations = [];
  const element = {
    style: { transform: 'translate(200px, 50px)', borderRadius: '' },
    animate(frames) {
      const animation = {
        frames,
        finished: Promise.resolve(),
        cancelled: false,
        cancel() { this.cancelled = true; },
      };
      animations.push(animation);
      return animation;
    },
  };
  return { element, animations };
}

test('la carga restaura estilos, conserva el reparto y respeta movimiento reducido', async () => {
  const card = makeCard();
  const phases = [];
  let nextPhaseCalled = false;
  await chargeCards({
    cards: [card],
    signal: new AbortController().signal,
    reducedMotion: true,
    onPhase: phase => phases.push(phase),
    async whileCharged() {
      nextPhaseCalled = true;
      assert.equal(card.element.style.borderRadius, '13px');
      assert.ok(card.animations.every(animation => !animation.cancelled));
    },
  });

  assert.deepEqual(phases, ['pause', 'charging', 'charged']);
  assert.equal(nextPhaseCalled, true);
  assert.equal(card.element.style.transform, 'translate(200px, 50px)');
  assert.equal(card.element.style.borderRadius, '');
  assert.ok(card.animations.every(animation => animation.cancelled));
  assert.ok(card.animations.every(animation => animation.frames.every(frame => !('translate' in frame))));
});

test('cancelar durante la pausa impide iniciar la carga', async () => {
  const card = makeCard();
  const controller = new AbortController();
  const pending = chargeCards({ cards: [card], signal: controller.signal, reducedMotion: false });
  controller.abort();
  await assert.rejects(pending, { name: 'AbortError' });
  assert.equal(card.animations.length, 0);
});

test('cancelar durante la carga limpia las animaciones activas', async () => {
  const card = makeCard();
  const controller = new AbortController();
  await assert.rejects(chargeCards({
    cards: [card],
    signal: controller.signal,
    reducedMotion: false,
    onPhase(phase) {
      if (phase === 'charged') controller.abort();
    },
  }), { name: 'AbortError' });
  assert.ok(card.animations.some(animation => animation.frames.some(frame => 'translate' in frame)));
  assert.ok(card.animations.every(animation => animation.cancelled));
  assert.equal(card.element.style.borderRadius, '');
});
