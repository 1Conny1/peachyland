// Capa decorativa compartida: apagada hasta que la tirada comienza.
export function createTableFire(table) {
  const element = document.createElement('div');
  element.className = 'table-fire';
  element.setAttribute('aria-hidden', 'true');
  element.innerHTML = Array.from({ length: 16 }, (_, index) =>
    `<span class="table-ember" style="--x:${3 + (index * 37 % 94)}%;--y:${35 + (index * 19 % 64)}%;--drift:${index % 2 ? 22 : -18}px;--delay:${-index * .63}s;--duration:${4 + index % 5}s"></span>`
  ).join('');
  table.prepend(element);
  return {
    async ignite({ signal } = {}) {
      signal?.throwIfAborted();
      element.classList.add('is-active');
      // 650 ms de encendido y una breve pausa antes de mover cartas o moneda.
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          signal?.removeEventListener('abort', cancel);
          resolve();
        }, 900);
        function cancel() {
          clearTimeout(timer);
          element.classList.remove('is-active');
          reject(signal.reason);
        }
        signal?.addEventListener('abort', cancel, { once: true });
      });
      signal?.throwIfAborted();
    },
    setActive(active) {
      element.classList.toggle('is-active', active);
    },
  };
}
