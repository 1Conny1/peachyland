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

test('espera al CSS para cargar el retrato sin ocultar la carta', async () => {
  const originalDocument = globalThis.document;
  const originalCSSStyleSheet = globalThis.CSSStyleSheet;
  const images = [];
  const shadow = { append() {}, adoptedStyleSheets: [] };
  let stylesheet;
  globalThis.CSSStyleSheet = class {
    replaceSync(text) { this.text = text; }
  };
  globalThis.document = {
    createElement(tag) {
      const element = {
        style: {},
        append() {},
        setAttribute() {},
        attachShadow() { return shadow; },
        querySelector() { return { textContent: '', clientWidth: 0 }; },
        firstElementChild: { append() {} },
      };
      if (tag === 'img') images.push(element);
      if (tag === 'link') stylesheet = {
        ...element,
        sheet: { cssRules: [{ cssText: '.profile img { width: 55px; }' }] },
        remove() { this.removed = true; },
      };
      return tag === 'link' ? stylesheet : element;
    },
  };

  try {
    const card = createCard({ signId: 'aries' });
    assert.equal(card.element.style.visibility, undefined);
    assert.equal(images.length, 1);
    assert.equal(images[0].src, undefined);

    stylesheet.onload();
    await card.ready;
    assert.equal(shadow.adoptedStyleSheets.length, 1);
    assert.match(shadow.adoptedStyleSheets[0].text, /profile img/);
    assert.equal(stylesheet.removed, true);
    assert.match(images[0].src, /perfil\.png$/);

    card.showFront('Zing');
    assert.equal(images.length, 2);
    assert.match(images[1].src, /perfil\.png$/);
  } finally {
    globalThis.document = originalDocument;
    globalThis.CSSStyleSheet = originalCSSStyleSheet;
  }
});
