import assert from 'node:assert/strict';
import test from 'node:test';
import { pickCoinSide } from '../src/coin/coin-toss.mjs';

test('los dos valores equiprobables de cada par dan caras opuestas', () => {
  for (const value of [0, 2, 0xfffffffe]) {
    assert.equal(pickCoinSide(value), 'cara');
    assert.equal(pickCoinSide(value + 1), 'cruz');
  }
});
