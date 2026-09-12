import { createCard } from '../cards/card.mjs';
import { ZODIAC } from '../cards/zodiac.mjs';
import { MAX_ACTION_LENGTH } from '../data/actions-provider.mjs';

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
      <form class="gallery-action-form" aria-label="Agregar una acción">
        <label for="new-action-text">Nueva acción</label>
        <div class="gallery-action-fields">
          <textarea id="new-action-text" name="action" rows="2" required
            maxlength="${MAX_ACTION_LENGTH}" aria-describedby="action-help"
            placeholder="Escribe lo que puede salir en la ruleta…"></textarea>
          <button type="submit" disabled>Agregar acción</button>
        </div>
        <p id="action-help">Hasta ${MAX_ACTION_LENGTH} caracteres. Agregar y eliminar solo afecta esta sesión; al recargar se restablece la colección inicial.</p>
        <p class="gallery-action-feedback" role="status" aria-live="polite"></p>
      </form>
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
  const count = container.querySelector('[data-action-count]');
  count.textContent = `${actions.length} acciones`;
  const fronts = container.querySelector('[data-fronts]');
  const backs = container.querySelector('[data-backs]');
  const jobs = [];
  const overflowingActions = new Set();

  function mountCard(target, signId, action) {
    const figure = document.createElement('figure');
    const card = createCard({ signId });
    figure.append(card.element);
    if (action) {
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'gallery-remove-action';
      removeButton.textContent = 'Eliminar';
      removeButton.setAttribute('aria-label', `Eliminar acción: ${action.text}`);
      removeButton.disabled = true;
      removeButton.addEventListener('click', () => removeAction(action, figure));
      figure.append(removeButton);
    }
    target.append(figure);
    return card.ready.then(() => {
      if (!container.isConnected) return true;
      const fits = action === undefined || card.showFront(action.text);
      if (!fits) overflowingActions.add(action.id);
      return fits;
    });
  }

  // En la galería el signo de los frentes es solo un requisito de construcción.
  // No se asignan signos a las acciones ni se toma ninguna decisión de sorteo.
  for (const action of actions) jobs.push(mountCard(fronts, ZODIAC[0].id, action));
  for (const sign of ZODIAC) jobs.push(mountCard(backs, sign.id));
  if (!actions.length) fronts.textContent = 'Todavía no hay acciones cargadas.';
  await Promise.all(jobs);
  if (!container.isConnected) return;
  function updateSummary() {
    const overflow = overflowingActions.size;
    count.textContent = `${actions.length} acciones`;
    status.textContent = `${actions.length} acciones · ${ZODIAC.length} reversos.` +
      (overflow ? ` ${overflow} textos necesitan revisión de longitud para caber en la carta.` : ' Cartas listas.');
  }
  updateSummary();

  const form = container.querySelector('.gallery-action-form');
  const input = form.querySelector('textarea');
  const button = form.querySelector('button');
  const feedback = form.querySelector('.gallery-action-feedback');
  let saving = false;
  function updateControls() {
    button.disabled = saving;
    input.readOnly = saving;
    for (const control of fronts.querySelectorAll('.gallery-remove-action')) {
      control.disabled = saving;
    }
  }
  updateControls();

  async function removeAction(action, figure) {
    if (saving) return;
    saving = true;
    updateControls();
    feedback.textContent = '';
    delete feedback.dataset.error;
    let nextFocus = null;
    try {
      await actionsProvider.removeAction(action.id);
      if (!container.isConnected) return;
      nextFocus = figure.nextElementSibling?.querySelector('button') ||
        figure.previousElementSibling?.querySelector('button') || input;
      actions.splice(actions.findIndex(item => item.id === action.id), 1);
      overflowingActions.delete(action.id);
      figure.remove();
      if (!actions.length) fronts.textContent = 'Todavía no hay acciones cargadas.';
      updateSummary();
      feedback.textContent = `«${action.text}» se eliminó de la colección y de la ruleta.`;
    } catch (error) {
      if (!container.isConnected) return;
      feedback.dataset.error = 'true';
      feedback.textContent = error.message;
    } finally {
      saving = false;
      if (container.isConnected) {
        updateControls();
        nextFocus?.focus();
      }
    }
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (saving) return;
    saving = true;
    updateControls();
    button.textContent = 'Agregando…';
    feedback.textContent = '';
    delete feedback.dataset.error;
    let addedAction = null;
    try {
      addedAction = await actionsProvider.addAction(input.value);
      if (!container.isConnected) return;
      if (!actions.length) fronts.replaceChildren();
      actions.push(addedAction);
      updateSummary();
      const fits = await mountCard(fronts, ZODIAC[0].id, addedAction);
      if (!container.isConnected) return;
      updateSummary();
      feedback.textContent = `«${addedAction.text}» ya está disponible en la ruleta.` +
        (fits ? '' : ' Su texto necesita revisión para caber en la carta.');
    } catch (error) {
      if (!container.isConnected) return;
      feedback.dataset.error = 'true';
      feedback.textContent = addedAction
        ? 'La acción quedó agregada, pero no se pudo mostrar su carta. Vuelve a entrar a Cartas para verla.'
        : error.message;
    } finally {
      saving = false;
      if (container.isConnected) {
        if (addedAction) form.reset();
        updateControls();
        button.textContent = 'Agregar acción';
        input.focus();
      }
    }
  });
}
