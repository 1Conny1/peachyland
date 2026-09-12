import { createActionsProvider } from '../data/actions-provider.mjs';
import { mountRoulette } from '../views/roulette-view.mjs';
import { mountCards } from '../views/cards-view.mjs';

const services = { actionsProvider: createActionsProvider() };
const routes = { ruleta: mountRoulette, cartas: mountCards };
const content = document.querySelector('#content');

async function navigate({ focus = false } = {}) {
  let route = location.hash.slice(2);
  if (!Object.hasOwn(routes, route)) {
    route = 'ruleta';
    history.replaceState(null, '', '#/ruleta');
  }

  document.body.dataset.route = route;

  for (const link of document.querySelectorAll('[data-route]')) {
    if (link.dataset.route === route) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  document.title = `${route === 'cartas' ? 'Cartas' : 'Ruleta'} · Peachyland`;
  // Cada navegación tiene su propio contenedor; una carga anterior no puede
  // reemplazar la vista nueva si el usuario navega mientras espera.
  const view = document.createElement('div');
  content.replaceChildren(view);
  if (focus) content.focus();
  try {
    await routes[route](view, services);
  } catch (error) {
    if (!view.isConnected) return;
    const message = document.createElement('p');
    message.setAttribute('role', 'alert');
    message.textContent = `No se pudo cargar la sección: ${error.message}`;
    view.append(message);
    const status = view.querySelector('[role="status"]');
    if (status) status.textContent = 'Carga interrumpida. Vuelve a entrar para reintentar.';
  }
}

window.addEventListener('hashchange', () => navigate({ focus: true }));
navigate();
