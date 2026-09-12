import { createCard } from '../cards/card.mjs';
import { ZODIAC } from '../cards/zodiac.mjs';

export async function mountCards(container, { actionsProvider }) {
  container.innerHTML = '<h1>Cartas</h1><p>Explora las acciones en el frente y los doce diseños zodiacales del reverso.</p><p role="status">Cargando cartas…</p><section><h2>Frentes · Acciones</h2><div class="cards-grid" data-fronts></div></section><section><h2>Reversos · Zodiaco</h2><div class="cards-grid" data-backs></div></section>';
  const status = container.querySelector('[role="status"]');
  const actions = await actionsProvider.listActions();
  if (!container.isConnected) return;
  const fronts = container.querySelector('[data-fronts]');
  const backs = container.querySelector('[data-backs]');
  const jobs = [];

  function mountCard(target, label, signId, action) {
    const figure = document.createElement('figure');
    const caption = document.createElement('figcaption');
    caption.textContent = label;
    const card = createCard({ signId });
    figure.append(card.element, caption);
    target.append(figure);
    jobs.push(card.ready.then(() => {
      if (!container.isConnected) return true;
      return action === undefined || card.showFront(action);
    }));
  }

  // En la galería el signo de los frentes es solo un requisito de construcción.
  // No se asignan signos a las acciones ni se toma ninguna decisión de sorteo.
  for (const action of actions) mountCard(fronts, action.text, ZODIAC[0].id, action.text);
  for (const sign of ZODIAC) mountCard(backs, sign.name, sign.id);
  if (!actions.length) fronts.textContent = 'Todavía no hay acciones cargadas.';
  const results = await Promise.all(jobs);
  if (!container.isConnected) return;
  const overflow = results.filter(fits => !fits).length;
  status.textContent = `${actions.length} acciones · ${ZODIAC.length} reversos.` +
    (overflow ? ` ${overflow} textos necesitan revisión de longitud; su contenido completo aparece debajo.` : ' Cartas listas.');
}
