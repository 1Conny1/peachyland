import { createCard } from '../src/cards/card.mjs';
import { ZODIAC } from '../src/cards/zodiac.mjs';

const preview = createCard({ signId: 'aries' });
document.querySelector('#preview').append(preview.element);
const cards = [preview];
for (const sign of ZODIAC) {
  for (const [container, width] of [['#gallery', 225], ['#compact', 82]]) {
    const card = createCard({ signId: sign.id, width });
    document.querySelector(container).append(card.element);
    cards.push(card);
  }
}
const status = document.querySelector('#status');
try {
  await Promise.all(cards.map(card => card.ready));
  status.textContent = 'Reversos listos. La frontal todavía no existe.';
  document.querySelector('#front').disabled = false;
  document.querySelector('#back').disabled = false;
} catch (error) {
  status.textContent = error.message;
}
document.querySelector('#front').addEventListener('click', () => {
  try {
    const fits = preview.showFront(document.querySelector('#action').value);
    status.textContent = fits ? 'Frontal creada únicamente en esta carta.' : 'El texto excede el espacio disponible; revisa su longitud.';
  } catch (error) { status.textContent = error.message; }
});
document.querySelector('#back').addEventListener('click', () => {
  preview.showBack();
  status.textContent = 'Reverso restaurado; frontal retirada.';
});
