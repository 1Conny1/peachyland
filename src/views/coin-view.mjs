import { pickCoinSide } from '../coin/coin-toss.mjs';
import { createTableFire } from '../effects/table-fire.mjs';

const stylesheet = new URL('./coin-view.css', import.meta.url).href;

export function mountCoin(host) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = stylesheet;
  host.append(link);

  const table = document.createElement('section');
  table.className = 'coin-table';
  table.setAttribute('aria-label', 'Lanzamiento de moneda');
  table.innerHTML = `
    <header class="coin-heading">
      <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="11"/><circle cx="16" cy="16" r="8"/><path d="M16 11v10M12 16h8"/></svg>
      <h1>Moneda</h1>
    </header>
    <div class="coin-scene">
      <div class="coin-glow" aria-hidden="true"></div>
      <div class="coin-shadow" aria-hidden="true"></div>
      <div class="coin-perspective" aria-hidden="true">
        <div class="coin-disc">
          <div class="coin-face coin-front">
            <span class="coin-signature">✦ PEACHYLAND ✦</span>
            <div class="coin-engraving">
              <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="15"/><path d="M50 5v18M50 77v18M5 50h18M77 50h18M18 18l13 13M69 69l13 13M82 18 69 31M31 69 18 82"/><path d="m50 0 3 5-3 5-3-5zm0 90 3 5-3 5-3-5zM0 50l5-3 5 3-5 3zm90 0 5-3 5 3-5 3z"/></svg>
            </div>
            <span class="coin-side-label">CARA</span>
          </div>
          <div class="coin-face coin-back">
            <span class="coin-signature">✦ PEACHYLAND ✦</span>
            <div class="coin-engraving">
              <svg viewBox="0 0 100 100"><path d="M64 10a39 39 0 1 0 23 72A38 38 0 0 1 64 10Z"/><path d="m23 19 2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5zm55 8 2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></svg>
            </div>
            <span class="coin-side-label">CRUZ</span>
          </div>
        </div>
      </div>
    </div>
    <div class="coin-controls">
      <p class="coin-result" role="status" aria-live="polite">Cara o cruz</p>
      <button class="coin-launch" type="button">Lanzar moneda</button>
    </div>
  `;
  host.append(table);
  const fire = createTableFire(table);

  const coin = table.querySelector('.coin-disc');
  const button = table.querySelector('.coin-launch');
  const status = table.querySelector('.coin-result');
  const scene = table.querySelector('.coin-scene');
  const perspective = table.querySelector('.coin-perspective');

  button.addEventListener('click', async () => {
    if (button.disabled) return;
    const side = pickCoinSide();
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const resultAngle = side === 'cruz' ? 180 : 0;
    const startAngle = coin.style.transform.includes('180deg') ? 180 : 0;
    const finalTransform = `rotateY(${resultAngle}deg)`;
    const animations = [];
    button.disabled = true;
    status.textContent = 'Encendiendo el tablero…';

    try {
      await fire.ignite();
      if (!host.isConnected) return;
      status.textContent = 'Lanzando…';
      scene.classList.add('is-tossing');
      if (reducedMotion) {
        const transition = coin.animate([
          { opacity: 1, transform: `rotateY(${startAngle}deg)` },
          { opacity: 0.15, transform: `rotateY(${startAngle}deg)`, offset: 0.45 },
          { opacity: 0.15, transform: finalTransform, offset: 0.55 },
          { opacity: 1, transform: finalTransform },
        ], { duration: 240, fill: 'forwards' });
        animations.push(transition);
        await transition.finished;
      } else {
        // La altura se adapta a la mesa para no recortar la moneda en ventanas pequeñas.
        const rise = Math.max(120, Math.min(240,
          table.clientHeight * 0.463 - scene.offsetHeight / 2 - 20));
        const flight = perspective.animate([
          { transform: 'translateY(0)', easing: 'cubic-bezier(.14,.7,.3,1)' },
          { transform: `translateY(-${rise}px)`, offset: 0.43 },
          { transform: `translateY(-${rise}px)`, offset: 0.57,
            easing: 'cubic-bezier(.65,0,1,1)' },
          { transform: 'translateY(0)' },
        ], { duration: 2800, fill: 'forwards' });
        const spin = coin.animate([
          { transform: `rotateY(${startAngle}deg)` },
          { transform: `rotateY(${720 + resultAngle}deg)` },
        ], { duration: 2800, easing: 'linear', fill: 'forwards' });
        animations.push(flight, spin);
        await Promise.all([flight.finished, spin.finished]);
      }

      if (!host.isConnected) return;
      coin.style.transform = finalTransform;
      for (const animation of animations.splice(0)) animation.cancel();
      scene.classList.remove('is-tossing');
      // Apaga el tablero en el contacto, antes del pequeño rebote.
      fire.setActive(false);

      if (!reducedMotion) {
        scene.classList.add('is-impacting');
        const rebound = perspective.animate([
          { transform: 'translateY(0)' },
          { transform: 'translateY(-9px)', offset: 0.3 },
          { transform: 'translateY(0)' },
        ], { duration: 300, easing: 'ease-out' });
        // Mismos desplazamientos y duración del impacto de la carta ganadora.
        const shake = table.animate([
          { translate: '0px 0px' },
          { translate: '5px 6px' },
          { translate: '-4px -3px' },
          { translate: '3px 2px' },
          { translate: '-1px -1px' },
          { translate: '0px 0px' },
        ], { duration: 300, easing: 'linear' });
        animations.push(rebound, shake);
        await Promise.all([rebound.finished, shake.finished]);
      }

      if (!host.isConnected) return;
      status.textContent = `Salió ${side}`;
      button.textContent = 'Lanzar otra vez';
    } catch {
      if (host.isConnected) status.textContent = 'No se pudo completar el lanzamiento.';
    } finally {
      fire.setActive(false);
      for (const animation of animations) animation.cancel();
      scene.classList.remove('is-tossing', 'is-impacting');
      if (host.isConnected) button.disabled = false;
    }
  });
}
