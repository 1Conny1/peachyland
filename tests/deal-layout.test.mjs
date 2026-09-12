import test from 'node:test';
import assert from 'node:assert/strict';
import { createDealPositions, deckThickness, CARD_WIDTH } from '../src/roulette/layout.mjs';
import { CARD_HEIGHT_RATIO } from '../src/cards/card.mjs';

test('las cartas permanecen dentro de la mesa con cantidades dinámicas', () => {
  for (const [tableWidth, tableHeight] of [[1672, 941], [1000, 720], [700, 900]]) {
    const halfDiagonal = Math.hypot(CARD_WIDTH, CARD_WIDTH * CARD_HEIGHT_RATIO) / 2;
    for (const total of [1, 2, 9, 12, 13, 24, 100]) {
      const positions = createDealPositions(total, tableWidth, tableHeight);
      assert.equal(positions.length, total);
      for (const position of positions) {
        assert.ok(Math.abs(position.x) + halfDiagonal < tableWidth / 2);
        assert.ok(Math.abs(position.y) + halfDiagonal < tableHeight / 2);
      }
    }
  }
});

test('el primer anillo coincide con el círculo zodiacal del fondo', () => {
  const positions = createDealPositions(12, 1672, 941);
  assert.ok(Math.abs(positions[0].x) < 0.001);
  assert.ok(Math.abs(positions[0].y + 941 * 0.34) < 0.001);
  assert.ok(Math.abs(positions[3].x - 1672 * 0.191) < 0.001);
  assert.ok(Math.abs(positions[3].y) < 0.001);
});

test('rechaza dimensiones de mesa inválidas', () => {
  assert.throws(() => createDealPositions(9, 0, 941), RangeError);
  assert.throws(() => createDealPositions(9, 1672, NaN), RangeError);
});

test('el grosor decrece hasta cero al repartir la última carta', () => {
  for (const total of [1, 9, 100]) {
    let previous = deckThickness(total, total);
    for (let remaining = total - 1; remaining >= 0; remaining -= 1) {
      const thickness = deckThickness(remaining, total);
      assert.ok(thickness < previous);
      previous = thickness;
    }
    assert.equal(previous, 0);
  }
});
