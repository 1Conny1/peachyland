import test from 'node:test';
import assert from 'node:assert/strict';
import { createRandomInteger } from '../src/draw/random.mjs';
import { prepareDraw } from '../src/draw/prepare-draw.mjs';
import { ZODIAC } from '../src/cards/zodiac.mjs';

const signIds = ZODIAC.map(sign => sign.id);

function makeActions(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: `action-${index}`,
    text: `Acción ${index}`,
  }));
}

test('el muestreo descarta el sobrante y alcanza todos los índices', () => {
  const values = [2 ** 32 - 1, 4];
  const randomInteger = createRandomInteger(() => values.shift());
  assert.equal(randomInteger(3), 1);
  assert.equal(values.length, 0);

  for (let index = 0; index < 9; index += 1) {
    assert.equal(createRandomInteger(() => index)(9), index);
  }
  assert.throws(() => createRandomInteger(() => -1)(3), RangeError);
  assert.throws(() => randomInteger(0), RangeError);
  assert.equal(createRandomInteger(() => 2 ** 32 - 1)(2 ** 32), 2 ** 32 - 1);
});

test('prepara cantidades dinámicas, ciclos completos y agotamiento del mazo', () => {
  for (const total of [1, 2, 9, 12, 13, 24, 100]) {
    const plan = prepareDraw(makeActions(total), signIds);
    assert.equal(plan.total, total);
    assert.equal(plan.probability, 1 / total);
    assert.equal(plan.cards.length, total);
    assert.equal(plan.cards[plan.winnerIndex].actionId, plan.selectedAction.id);

    for (let index = 0; index < total; index += 1) {
      const card = plan.cards[index];
      assert.equal(card.actionId, `action-${index}`);
      assert.equal(card.dealIndex, index);
      assert.equal(card.remainingAfterDeal, total - index - 1);
      assert.ok(!Object.hasOwn(card, 'text'));
    }

    for (let start = 0; start < total; start += 12) {
      const cycle = plan.cards.slice(start, start + 12).map(card => card.signId);
      assert.equal(new Set(cycle).size, cycle.length);
      assert.ok(cycle.every(id => signIds.includes(id)));
    }
  }
});

test('cambiar el azar visual no cambia el resultado ya elegido', () => {
  function source(visualIndex) {
    let firstCall = true;
    return maximum => {
      if (firstCall) {
        firstCall = false;
        return 4;
      }
      return visualIndex % maximum;
    };
  }
  const first = prepareDraw(makeActions(9), signIds, source(0));
  const second = prepareDraw(makeActions(9), signIds, source(7));
  assert.deepEqual(first.selectedAction, second.selectedAction);
  assert.notDeepEqual(first.cards, second.cards);
});

test('el plan conserva el resultado ante cambios posteriores del catálogo', () => {
  const actions = makeActions(2);
  const plan = prepareDraw(actions, signIds, () => 0);
  actions[0].text = 'Modificada';
  actions[0].id = 'otro-id';
  actions.pop();
  assert.equal(plan.selectedAction.text, 'Acción 0');
  assert.equal(plan.cards[0].actionId, 'action-0');
  assert.ok(Object.isFrozen(plan));
  assert.ok(Object.isFrozen(plan.cards));
  assert.ok(Object.isFrozen(plan.selectedAction));
  assert.ok(plan.cards.every(Object.isFrozen));
});

test('rechaza entradas inválidas antes de consumir azar', () => {
  const unexpectedRandom = () => assert.fail('No debe sortear entradas inválidas');
  assert.throws(() => prepareDraw([], signIds, unexpectedRandom), TypeError);
  assert.throws(() => prepareDraw([{ id: 'a', text: '' }], signIds, unexpectedRandom), TypeError);
  assert.throws(() => prepareDraw([makeActions(1)[0], makeActions(1)[0]], signIds, unexpectedRandom), TypeError);
  assert.throws(() => prepareDraw(makeActions(1), ['aries', 'aries'], unexpectedRandom), TypeError);
  assert.throws(() => prepareDraw(makeActions(1), [], unexpectedRandom), TypeError);
  assert.throws(() => prepareDraw(makeActions(2), signIds, () => 2), RangeError);
});
