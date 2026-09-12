/** Estela decorativa compartida por las vistas. Devuelve una función de limpieza. */
export function mountCursorTrail() {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:1000;';
  const context = canvas.getContext('2d');
  if (!context) return () => {};
  document.body.append(canvas);

  const controller = new AbortController();
  const options = { signal: controller.signal };
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const particles = [];
  const lifetime = 650;
  let frame = 0;
  let previousPoint;

  function clear() {
    cancelAnimationFrame(frame);
    frame = 0;
    particles.length = 0;
    previousPoint = undefined;
    context.clearRect(0, 0, innerWidth, innerHeight);
  }

  function resize() {
    clear();
    // Limitar la resolución evita un coste excesivo en pantallas de alta densidad.
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * ratio);
    canvas.height = Math.round(innerHeight * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function draw(now) {
    frame = 0;
    context.clearRect(0, 0, innerWidth, innerHeight);
    for (let index = particles.length - 1; index >= 0; index -= 1) {
      const particle = particles[index];
      const age = (now - particle.born) / lifetime;
      if (age >= 1) {
        particles.splice(index, 1);
        continue;
      }
      const x = particle.x + particle.drift * age;
      const y = particle.y + 9 * age;
      const radius = particle.size * (1 - age * 0.6);
      context.globalAlpha = (1 - age) ** 2 * 0.7;
      context.fillStyle = particle.color;
      context.shadowColor = particle.color;
      context.shadowBlur = 9;
      context.beginPath();
      if (particle.star) {
        // Destellos pequeños de cuatro puntas, como los detalles del escenario.
        context.moveTo(x, y - radius * 2);
        context.lineTo(x + radius * 0.4, y - radius * 0.4);
        context.lineTo(x + radius * 2, y);
        context.lineTo(x + radius * 0.4, y + radius * 0.4);
        context.lineTo(x, y + radius * 2);
        context.lineTo(x - radius * 0.4, y + radius * 0.4);
        context.lineTo(x - radius * 2, y);
        context.lineTo(x - radius * 0.4, y - radius * 0.4);
        context.closePath();
      } else {
        context.arc(x, y, radius, 0, Math.PI * 2);
      }
      context.fill();
    }
    context.globalAlpha = 1;
    context.shadowBlur = 0;
    // Cuando termina la estela, dejamos de solicitar fotogramas.
    if (particles.length) frame = requestAnimationFrame(draw);
  }

  function move(event) {
    if (reducedMotion.matches || event.pointerType !== 'mouse' || document.hidden) return;
    const point = { x: event.clientX, y: event.clientY };
    const start = previousPoint ?? point;
    const distance = Math.hypot(point.x - start.x, point.y - start.y);
    if (previousPoint && distance < 8) return;
    // No rellenar saltos largos al volver a entrar en la ventana.
    const steps = Math.min(10, Math.max(1, Math.floor(distance / 8)));
    for (let step = 1; step <= steps; step += 1) {
      const fraction = distance > 180 ? 1 : step / steps;
      particles.push({
        x: start.x + (point.x - start.x) * fraction + (Math.random() - 0.5) * 5,
        y: start.y + (point.y - start.y) * fraction + (Math.random() - 0.5) * 5,
        born: performance.now(),
        size: 1 + Math.random() * 1.2,
        drift: (Math.random() - 0.5) * 10,
        star: Math.random() < 0.2,
        color: Math.random() < 0.8 ? '#cba06b' : '#90709f',
      });
    }
    if (particles.length > 80) particles.splice(0, particles.length - 80);
    previousPoint = point;
    if (!frame) frame = requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('pointermove', move, options);
  window.addEventListener('resize', resize, options);
  window.addEventListener('blur', clear, options);
  document.documentElement.addEventListener('pointerleave', clear, options);
  document.addEventListener('visibilitychange', clear, options);
  reducedMotion.addEventListener('change', clear, options);
  return () => {
    controller.abort();
    clear();
    canvas.remove();
  };
}
