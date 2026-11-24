const partyColors = ['#e96555', '#f3b72e', '#55a9d5', '#e582a6', '#7db5a3', '#9d87cc'];

export function createCelebration(layer) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const effects = new Set();

  function animateEffect(className, x, y, color, keyframes, options) {
    const particle = document.createElement('span');
    particle.className = className;
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.setProperty('--particle', color);
    layer.append(particle);
    const animation = particle.animate(keyframes, { fill: 'backwards', ...options });
    effects.add(animation);
    const remove = () => {
      particle.remove();
      effects.delete(animation);
    };
    animation.finished.then(remove, remove);
  }

  function clearEffects() {
    for (const effect of effects) effect.cancel();
    layer.replaceChildren();
  }

  function celebrate(cake) {
    if (reducedMotion.matches || typeof Element.prototype.animate !== 'function') return;
    clearEffects();
    const bounds = cake.getBoundingClientRect();
    const center = bounds.left + bounds.width / 2;
    const spread = Math.min(window.innerWidth * .43, bounds.width * .96);

    for (const wick of cake.querySelectorAll('.wick')) {
      const origin = wick.getBoundingClientRect();
      for (let index = 0; index < 4; index += 1) {
        const drift = (index % 2 === 0 ? 1 : -1) * (9 + index * 4);
        animateEffect('smoke', origin.left, origin.top, 'transparent', [
          { opacity: 0, transform: 'translate(-50%, -50%) scale(.27)' },
          { opacity: .7, transform: 'translate(4px, -23px) scale(.84)', offset: .28 },
          { opacity: 0, transform: 'translate(' + drift + 'px, -72px) rotate(-24deg) scale(2)' },
        ], { delay: 100 + index * 125, duration: 830, easing: 'ease-out' });
      }
    }

    const shapes = ['ribbon', 'dot', 'paper'];
    for (let index = 0; index < 64; index += 1) {
      const side = index % 2 === 0 ? -1 : 1;
      const x = side * (44 + Math.random() * spread);
      const peak = 64 + Math.random() * bounds.height * .68;
      const spin = side * (160 + Math.random() * 520);
      const startX = center + side * bounds.width * .15;
      const startY = bounds.top + bounds.height * .59;
      animateEffect('spark ' + shapes[index % shapes.length], startX, startY, partyColors[index % partyColors.length], [
        { opacity: 0, transform: 'translate(0, 0) rotate(0) scale(.6)' },
        { opacity: 1, transform: 'translate(' + x * .62 + 'px, ' + -peak + 'px) rotate(' + spin * .35 + 'deg)', offset: .31 },
        { opacity: .95, transform: 'translate(' + x * .88 + 'px, ' + -peak * .55 + 'px) rotate(' + spin * .7 + 'deg)', offset: .64 },
        { opacity: 0, transform: 'translate(' + x + 'px, ' + (72 + Math.random() * 95) + 'px) rotate(' + spin + 'deg)' },
      ], { duration: 1100 + Math.random() * 680, delay: 155 + (index % 4) * 115, easing: 'ease-out' });
    }

    for (let index = 0; index < 6; index += 1) {
      const side = index % 2 === 0 ? -1 : 1;
      const x = center + side * Math.min(window.innerWidth * (.24 + index * .02), bounds.width * (1.1 + index * .09));
      const y = window.innerHeight + 85;
      const rise = y + 150;
      animateEffect('balloon', x, y, partyColors[(index + 2) % partyColors.length], [
        { transform: 'translate(-50%, 0) rotate(' + side * 10 + 'deg)' },
        { transform: 'translate(calc(-50% + ' + side * 19 + 'px), ' + -rise * .31 + 'px) rotate(' + side * 8 + 'deg)', offset: .32 },
        { transform: 'translate(calc(-50% + ' + side * -18 + 'px), ' + -rise * .66 + 'px) rotate(' + side * -11 + 'deg)', offset: .66 },
        { transform: 'translate(-50%, ' + -rise + 'px) rotate(' + side * 4 + 'deg)' },
      ], { delay: 250 + index * 180, duration: 2950 + (index % 3) * 180, easing: 'ease-in' });
    }
  }

  const handleMotionChange = () => {
    if (reducedMotion.matches) clearEffects();
  };
  reducedMotion.addEventListener('change', handleMotionChange);
  window.addEventListener('pagehide', clearEffects);

  return {
    celebrate,
    clear: clearEffects,
    dispose() {
      clearEffects();
      reducedMotion.removeEventListener('change', handleMotionChange);
      window.removeEventListener('pagehide', clearEffects);
    },
  };
}
