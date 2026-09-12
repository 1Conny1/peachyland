import { createCard } from '../cards/card.mjs';
import { ZODIAC } from '../cards/zodiac.mjs';

export async function mountCards(container, { actionsProvider }) {
  container.classList.add('cards-gallery');
  container.innerHTML = `
    <header class="gallery-header">
      <div>
        <p class="gallery-eyebrow">PEACHYLAND · LA COLECCIÓN</p>
        <h1>El arte de las cartas</h1>
        <p class="gallery-intro">Cada acción, una posibilidad. Cada signo, su propia magia.</p>
        <p class="gallery-status" role="status">Preparando la colección…</p>
      </div>
      <div class="gallery-emblem" aria-hidden="true">✦</div>
    </header>
    <section aria-labelledby="gallery-front-title">
      <header class="gallery-section-heading">
        <div>
          <h2 id="gallery-front-title">Las acciones</h2>
        </div>
        <span class="gallery-count" data-action-count></span>
      </header>
      <p class="gallery-description">Las posibilidades que esperan sobre la mesa.</p>
      <div class="cards-grid" data-fronts></div>
    </section>
    <section aria-labelledby="gallery-back-title">
      <header class="gallery-section-heading">
        <div>
          <h2 id="gallery-back-title">El zodiaco</h2>
        </div>
        <span class="gallery-count">12 signos</span>
      </header>
      <p class="gallery-description">Doce identidades que dan vida a nuestra baraja.</p>
      <div class="cards-grid" data-backs></div>
    </section>`;
  const status = container.querySelector('[role="status"]');
  // La galería carga su propia hoja; al salir de la vista también se retira.
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('./cards-view.css', import.meta.url).href;
  container.prepend(stylesheet);
  const actions = await actionsProvider.listActions();
  if (!container.isConnected) return;
  container.querySelector('[data-action-count]').textContent = `${actions.length} acciones`;
  const fronts = container.querySelector('[data-fronts]');
  const backs = container.querySelector('[data-backs]');
  const jobs = [];

  function mountCard(target, signId, action) {
    const figure = document.createElement('figure');
    const card = createCard({ signId });
    figure.append(card.element);
    target.append(figure);
    jobs.push(card.ready.then(() => {
      if (!container.isConnected) return true;
      return action === undefined || card.showFront(action);
    }));
  }

  // En la galería el signo de los frentes es solo un requisito de construcción.
  // No se asignan signos a las acciones ni se toma ninguna decisión de sorteo.
  for (const action of actions) mountCard(fronts, ZODIAC[0].id, action.text);
  for (const sign of ZODIAC) mountCard(backs, sign.id);
  if (!actions.length) fronts.textContent = 'Todavía no hay acciones cargadas.';
  const results = await Promise.all(jobs);
  if (!container.isConnected) return;
  const overflow = results.filter(fits => !fits).length;
  status.textContent = `${actions.length} acciones · ${ZODIAC.length} reversos.` +
    (overflow ? ` ${overflow} textos necesitan revisión de longitud para caber en la carta.` : ' Cartas listas.');
}
