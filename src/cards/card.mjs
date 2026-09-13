import { ZODIAC } from './zodiac.mjs';

const styleUrl = new URL('./card.css', import.meta.url).href;
const defaultPortrait = new URL('../../perfil.png', import.meta.url).href;

export const BASE_CARD_WIDTH = 225;
export const BASE_CARD_HEIGHT = 320;
export const CARD_HEIGHT_RATIO = BASE_CARD_HEIGHT / BASE_CARD_WIDTH;

/** Crea solamente el reverso. El consumidor conserva la acción y controla el movimiento. */
export function createCard({ signId, width = 225, portraitUrl = defaultPortrait } = {}) {
  const sign = ZODIAC.find(item => item.id === signId);
  if (!sign) throw new RangeError(`Signo desconocido: ${signId}`);
  if (!Number.isFinite(width) || width <= 0) throw new RangeError('El ancho debe ser positivo.');

  const element = document.createElement('div');
  element.className = 'peachy-card';
  element.setAttribute('role', 'img');
  const shadow = element.attachShadow({ mode: 'open' });
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  let styleLoaded = false;
  const pendingPortraits = [];
  const ready = new Promise((resolve, reject) => {
    style.onload = () => {
      try {
        // Chromium puede desactivar temporalmente un <link> dentro del Shadow DOM
        // al mover la carta entre el mazo y la mesa. Una hoja adoptada permanece.
        const sheet = new CSSStyleSheet();
        sheet.replaceSync([...style.sheet.cssRules].map(rule => rule.cssText).join('\n'));
        shadow.adoptedStyleSheets = [sheet];
        style.remove();
        styleLoaded = true;
        // La imagen no empieza a renderizarse hasta tener sus reglas de tamaño
        // y posición. La carta misma nunca queda oculta durante el reparto.
        for (const image of pendingPortraits) image.src = portraitUrl;
        pendingPortraits.length = 0;
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    style.onerror = () => reject(new Error('No se pudo cargar el estilo de las cartas.'));
  });
  // Evita rechazos sin manejar mientras el consumidor aún está montando las cartas.
  ready.catch(() => {});
  style.href = styleUrl;
  const surface = document.createElement('div');
  surface.className = 'surface';
  shadow.append(style, surface);

  function portrait(position) {
    const holder = document.createElement('div');
    holder.className = `profile profile-${position}`;
    const img = document.createElement('img');
    img.alt = '';
    img.draggable = false;
    if (styleLoaded) img.src = portraitUrl;
    else pendingPortraits.push(img);
    holder.append(img);
    return holder;
  }

  function showBack() {
    // Solo markup del catálogo local; nunca se interpolan acciones ni datos externos.
    surface.innerHTML = `<article class="card card-back"><div class="card-border"></div><div class="zodiac-header"></div><div class="zodiac-stage"><div class="orbit"></div><svg class="zodiac-icon" viewBox="0 0 100 100" aria-hidden="true">${sign.svg}</svg></div></article>`;
    surface.querySelector('.zodiac-header').textContent = sign.name.toLocaleUpperCase('es');
    surface.firstElementChild.append(portrait('bottom'));
    element.setAttribute('aria-label', `Carta de ${sign.name}`);
  }

  /** Llamar cuando la ganadora esté fuera de pantalla. Devuelve si el texto cabe. */
  function showFront(actionText) {
    if (typeof actionText !== 'string' || !actionText.trim()) {
      throw new TypeError('La acción debe contener texto.');
    }
    surface.innerHTML = '<article class="card card-front"><div class="card-border"></div><div class="celestial-top"><span></span><span></span><span></span></div><div class="front-brand">PEACHY</div><div class="action-panel"><p class="action-text"></p></div><div class="front-footer"><span class="footer-star">✦</span><span>ACTION CARD</span><span class="footer-star">✦</span></div></article>';
    surface.firstElementChild.append(portrait('top'));
    surface.querySelector('.action-text').textContent = actionText;
    element.setAttribute('aria-label', `Acción: ${actionText}`);
    return fitFront();
  }

  function fitFront() {
    const text = surface.querySelector('.action-text');
    if (!text || !element.isConnected || !text.clientWidth) return false;
    const panel = text.parentElement;
    const panelStyle = getComputedStyle(panel);
    const height = panel.clientHeight - parseFloat(panelStyle.paddingTop) - parseFloat(panelStyle.paddingBottom);
    let size = 16;
    text.style.fontSize = `${size}px`;
    while (size > 10 && (text.scrollHeight > height || text.scrollWidth > text.clientWidth)) {
      text.style.fontSize = `${--size}px`;
    }
    return text.scrollHeight <= height && text.scrollWidth <= text.clientWidth;
  }

  function setWidth(value) {
    if (!Number.isFinite(value) || value <= 0) throw new RangeError('El ancho debe ser positivo.');
    element.style.width = `${value}px`;
    element.style.height = `${value * CARD_HEIGHT_RATIO}px`;
    surface.style.transform = `scale(${value / BASE_CARD_WIDTH})`;
  }

  showBack();
  setWidth(width);
  return Object.freeze({ element, ready, showBack, showFront, fitFront, setWidth });
}
