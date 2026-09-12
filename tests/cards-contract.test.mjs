import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ZODIAC } from '../src/cards/zodiac.mjs';
import { createCard } from '../src/cards/card.mjs';

test('conserva exactamente los doce trazos SVG de referencia', () => {
  const source = readFileSync(new URL('../cartas.html', import.meta.url), 'utf8');
  const originals = [...source.matchAll(/<symbol\s+id="zodiac-([^"]+)"[^>]*>([\s\S]*?)<\/symbol>/g)];
  assert.equal(ZODIAC.length, 12);
  assert.equal(new Set(ZODIAC.map(sign => sign.id)).size, 12);
  assert.equal(originals.length, 12);
  for (const [, id, markup] of originals) {
    assert.equal(ZODIAC.find(sign => sign.id === id)?.svg, markup.trim().replace(/\s+/g, ' '));
  }
});

test('el catálogo no se puede mutar y valida entradas antes de tocar el DOM', () => {
  assert.ok(Object.isFrozen(ZODIAC));
  assert.ok(ZODIAC.every(Object.isFrozen));
  assert.throws(() => createCard({ signId: 'unknown' }), RangeError);
  for (const width of [0, -1, NaN, Infinity, '82']) {
    assert.throws(() => createCard({ signId: 'aries', width }), RangeError);
  }
});
