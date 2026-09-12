import { createRandomInteger } from './random.mjs';

function validateActions(actions) {
  if (!Array.isArray(actions) || actions.length === 0) {
    throw new TypeError('Se necesita al menos una acción para preparar el sorteo.');
  }

  const identifiers = new Set();

  for (const action of actions) {
    if (!action || typeof action.id !== 'string' || !action.id.trim() ||
        typeof action.text !== 'string' || !action.text.trim()) {
      throw new TypeError('Cada acción necesita identificador y texto.');
    }

    if (identifiers.has(action.id)) {
      throw new TypeError('Los identificadores de las acciones deben ser únicos.');
    }

    identifiers.add(action.id);
  }
}

function shuffleSigns(signIds, randomInteger) {
  const shuffledSigns = [...signIds];

  // Fisher–Yates: cada posición se intercambia con una posición equiprobable.
  for (let index = shuffledSigns.length - 1; index > 0; index -= 1) {
    const otherIndex = randomInteger(index + 1);
    const previousSign = shuffledSigns[index];
    shuffledSigns[index] = shuffledSigns[otherIndex];
    shuffledSigns[otherIndex] = previousSign;
  }

  return shuffledSigns;
}

/** Prepara datos estables; no crea elementos visuales ni ejecuta animaciones. */
export function prepareDraw(actions, signIds, randomInteger = createRandomInteger()) {
  validateActions(actions);

  if (!Array.isArray(signIds) || signIds.length === 0 ||
      signIds.some(id => typeof id !== 'string' || !id.trim()) ||
      new Set(signIds).size !== signIds.length) {
    throw new TypeError('El catálogo debe contener identificadores de signos únicos.');
  }

  function chooseIndex(maximum) {
    const index = randomInteger(maximum);

    if (!Number.isInteger(index) || index < 0 || index >= maximum) {
      throw new RangeError('La selección aleatoria devolvió un índice fuera de rango.');
    }

    return index;
  }

  const total = actions.length;
  // El resultado se decide antes de asignar apariencias y antes de animar.
  const winnerIndex = chooseIndex(total);
  const selectedAction = Object.freeze({
    id: actions[winnerIndex].id,
    text: actions[winnerIndex].text,
  });

  const cards = [];
  let availableSigns = [];

  for (let index = 0; index < total; index += 1) {
    const positionInCycle = index % signIds.length;

    if (positionInCycle === 0) {
      availableSigns = shuffleSigns(signIds, chooseIndex);
    }

    cards.push(Object.freeze({
      actionId: actions[index].id,
      signId: availableSigns[positionInCycle],
      dealIndex: index,
      remainingAfterDeal: total - index - 1,
    }));
  }

  return Object.freeze({
    total,
    probability: 1 / total,
    winnerIndex,
    selectedAction,
    cards: Object.freeze(cards),
  });
}
