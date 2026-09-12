import { createCard } from '../cards/card.mjs';
import { ZODIAC } from '../cards/zodiac.mjs';
import { prepareDraw } from '../draw/prepare-draw.mjs';
import { dealCards } from '../roulette/deal-animation.mjs';
import { chargeCards } from '../roulette/charge-animation.mjs';
import { convergeCards } from '../roulette/converge-animation.mjs';
import { explodeCards } from '../roulette/explode-animation.mjs';
import { revealWinner } from '../roulette/reveal-animation.mjs';
import { CARD_WIDTH, createDealPositions } from '../roulette/layout.mjs';

// El elemento cancela su trabajo automáticamente cuando la navegación lo retira.
class RouletteTable extends HTMLElement {
  disconnectedCallback() {
    this.controller?.abort();
  }
}

if (!customElements.get('peachy-roulette-table')) {
  customElements.define('peachy-roulette-table', RouletteTable);
}

export async function mountRoulette(container, { actionsProvider }) {
  const host = document.createElement('peachy-roulette-table');
  host.controller = new AbortController();
  const signal = host.controller.signal;
  host.innerHTML = `
    <div class="roulette-viewport" aria-label="Mesa de la ruleta">
      <div class="roulette-table">
        <header class="roulette-heading"><h1>Ruleta</h1><span data-probability></span></header>
        <div class="roulette-layer"></div>
        <div class="roulette-controls">
          <button type="button" data-repeat disabled>Repartir de nuevo</button>
          <p class="roulette-status" role="status">Cargando mesa…</p>
        </div>
        <button class="roulette-deck" type="button" aria-label="Repartir cartas" disabled hidden>
          <span class="deck-edge"></span>
          <span class="deck-top" aria-hidden="true"></span>
        </button>
      </div>
    </div>
  `;
  container.append(host);

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  const stylesReady = new Promise((resolve, reject) => {
    stylesheet.onload = resolve;
    stylesheet.onerror = () => reject(new Error('No se pudo cargar el estilo de la mesa.'));
  });
  stylesheet.href = new URL('../roulette/table.css', import.meta.url).href;
  host.prepend(stylesheet);

  const status = host.querySelector('[role="status"]');
  const deck = host.querySelector('.roulette-deck');
  const repeat = host.querySelector('[data-repeat]');
  const layer = host.querySelector('.roulette-layer');
  const deckTop = deck.querySelector('.deck-top');
  const viewport = host.querySelector('.roulette-viewport');
  let running = false;
  let preparedRound;

  async function waitForCard(card) {
    await card.ready;
    const image = card.element.shadowRoot.querySelector('img');
    await image.decode();
    signal.throwIfAborted();
  }

  async function prepareRound(actions) {
    layer.replaceChildren();
    deckTop.replaceChildren();
    deck.style.setProperty('--thickness', '24px');

    // El resultado y todos los reversos quedan definidos antes de animar.
    const plan = prepareDraw(actions, ZODIAC.map(sign => sign.id));
    const cards = plan.cards.map(descriptor => {
      const card = createCard({ signId: descriptor.signId, width: CARD_WIDTH });
      layer.append(card.element);
      return card;
    });

    await Promise.all(cards.map(waitForCard));
    signal.throwIfAborted();

    // La primera carta del plan se convierte en la portada real del mazo.
    deckTop.append(cards[0].element);
    deck.hidden = false;
    return { plan, cards };
  }

  try {
    const [, actions] = await Promise.all([
      stylesReady,
      actionsProvider.listActions(),
    ]);
    signal.throwIfAborted();

    host.querySelector('[data-probability]').textContent = actions.length
      ? `${actions.length} acciones · Probabilidad por acción: 1/${actions.length}`
      : 'Sin acciones';
    if (actions.length) {
      status.textContent = 'Preparando mazo…';
      preparedRound = await prepareRound(actions);
      deck.disabled = false;
      status.textContent = 'Mazo listo para repartir.';
    } else {
      status.textContent = 'Agrega acciones para poder repartir.';
    }

    async function startDeal() {
      if (running || signal.aborted) return;
      running = true;
      deck.disabled = true;
      repeat.disabled = true;

      try {
        status.textContent = preparedRound
          ? 'Comenzando reparto…'
          : 'Preparando un nuevo mazo…';
        const round = preparedRound ?? await prepareRound(actions);
        preparedRound = undefined;

        await dealCards({
          cards: round.cards,
          plan: round.plan,
          positions: createDealPositions(
            round.plan.total,
            viewport.clientWidth,
            viewport.clientHeight,
          ),
          deck,
          layer,
          signal,
          onProgress(dealt, remaining) {
            status.textContent = `${dealt} de ${round.plan.total} cartas en la mesa · ${remaining} en el mazo`;
          },
        });
        await chargeCards({
          cards: round.cards,
          signal,
          onPhase(phase) {
            const messages = {
              pause: 'Todas las cartas están sobre la mesa…',
              charging: 'Las cartas están cargando energía…',
              charged: 'La energía está lista.',
            };
            status.textContent = messages[phase];
          },
          async whileCharged() {
            status.textContent = 'Las cartas se reúnen en el centro…';
            await convergeCards({ cards: round.cards, signal });
            status.textContent = 'La energía se libera…';
            await explodeCards({
              cards: round.cards,
              width: viewport.clientWidth,
              height: viewport.clientHeight,
              signal,
            });
          },
        });
        status.textContent = 'La carta elegida regresa…';
        await revealWinner({
          card: round.cards[round.plan.winnerIndex],
          actionText: round.plan.selectedAction.text,
          table: host.querySelector('.roulette-table'),
          width: viewport.clientWidth,
          height: viewport.clientHeight,
          signal,
          prepareAssets: waitForCard,
        });
        // También se anuncia el texto completo fuera de la carta, sin truncarlo.
        status.textContent = `Acción elegida: ${round.plan.selectedAction.text}`;
      } catch (error) {
        if (signal.aborted) return;
        layer.replaceChildren();
        deckTop.replaceChildren();
        deck.hidden = true;
        deck.style.setProperty('--thickness', '24px');
        status.textContent = `No se pudo completar la secuencia: ${error.message}`;
      } finally {
        running = false;
        if (!signal.aborted) {
          repeat.disabled = false;
          deck.disabled = deck.hidden;
        }
      }
    }

    deck.addEventListener('click', startDeal, { signal });
    repeat.addEventListener('click', startDeal, { signal });
  } catch (error) {
    if (!signal.aborted) status.textContent = `No se pudo preparar la mesa: ${error.message}`;
  }
}
