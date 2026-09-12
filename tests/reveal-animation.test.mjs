import test from 'node:test';
import assert from 'node:assert/strict';
import { revealWinner, createReturnPosition } from '../src/roulette/reveal-animation.mjs';

test('el regreso puede comenzar fuera de cualquiera de los cuatro bordes', () => {
  for (let edge = 0; edge < 4; edge += 1) {
    const values = [(edge + 0.5) / 4, 0.5, 0.5];
    const point = createReturnPosition(1600, 900, () => values.shift());
    assert.ok([point.y < -450, point.x > 800, point.y > 450, point.x < -800][edge]);
  }
});

test('el impacto sacude la mesa y limpia los efectos al terminar', async () => {
  const card = makeCard();
  let shakes = 0;
  let cleaned = false;
  await revealWinner({
    card, actionText: 'Zing', width: 1600, height: 900,
    signal: new AbortController().signal, reducedMotion: false,
    table: { animate() {
      shakes += 1;
      return { finished: Promise.resolve(), cancel() { cleaned = true; } };
    } },
  });
  assert.equal(shakes, 1);
  assert.ok(cleaned);
});

function makeCard() {
  return {
    texts: [],
    element: {
      style: { visibility: 'hidden', transform: 'translate(2000px, 0px)', zIndex: '2' },
      animate(frames) {
        this.frames = frames;
        return { finished: Promise.resolve(), cancel() {} };
      },
    },
    showFront(text) {
      assert.equal(this.element.style.visibility, 'hidden');
      this.texts.push(text);
      return true;
    },
  };
}

for (const reducedMotion of [false, true]) {
  test(`prepara solo la frontal recibida antes de mostrarla (reducido: ${reducedMotion})`, async () => {
    const card = makeCard();
    let assetsReady = false;
    const result = await revealWinner({
      card, actionText: 'Doble o Nada', width: 1600, height: 900,
      signal: new AbortController().signal, reducedMotion,
      async prepareAssets(received) {
        assert.equal(received, card);
        assert.equal(card.element.style.visibility, 'hidden');
        assetsReady = true;
      },
    });
    assert.ok(assetsReady);
    assert.deepEqual(card.texts, ['Doble o Nada']);
    assert.equal(card.element.style.visibility, 'visible');
    assert.equal(card.element.style.transform, 'translate(0px, 0px) rotate(0deg) scale(1.5)');
    assert.equal('opacity' in card.element.frames[0], reducedMotion);
    assert.equal(result.textFits, true);
  });
}

test('cancelar durante la preparación impide el regreso', async () => {
  const card = makeCard();
  const controller = new AbortController();
  await assert.rejects(revealWinner({
    card, actionText: 'Zing', width: 1600, height: 900,
    signal: controller.signal, reducedMotion: false,
    async prepareAssets() { controller.abort(); },
  }), { name: 'AbortError' });
  assert.equal(card.element.style.visibility, 'hidden');
  assert.equal(card.element.style.transform, 'translate(2000px, 0px)');
  assert.equal(card.element.frames, undefined);
});

test('rechaza preparar información mientras la carta esté visible', async () => {
  const card = makeCard();
  card.element.style.visibility = 'visible';
  await assert.rejects(revealWinner({
    card, actionText: 'Zing', width: 1600, height: 900,
    signal: new AbortController().signal, reducedMotion: false,
  }), /oculta/);
  assert.equal(card.texts.length, 0);
});
