// Grupo Malory — Shared GSAP + Lenis init
// Auto-runs on DOMContentLoaded. Each version-specific JS hooks into gsap timeline.

(function() {
  function init() {
    // Respect prefers-reduced-motion
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { document.documentElement.classList.add('reduced-motion'); }

    // Lenis smooth scroll
    if (typeof Lenis !== 'undefined') {
      const lenis = new Lenis({
        duration: 1.3,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.85,
      });
      window.__lenis = lenis;

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      // Tie Lenis with GSAP ScrollTrigger
      if (typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
      }
    }

    // Register ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Mouse parallax helper — selectors use [data-parallax="<strength>"]
    const parallaxEls = document.querySelectorAll('[data-parallax]');
    if (parallaxEls.length) {
      const mouse = { x: 0, y: 0 };
      window.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
      });
      function loop() {
        parallaxEls.forEach((el) => {
          const s = parseFloat(el.dataset.parallax) || 1;
          const x = mouse.x * s * 12;
          const y = mouse.y * s * 12;
          el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        });
        requestAnimationFrame(loop);
      }
      loop();
    }

    // .fade-in handled by CSS animation in base.css (no JS needed — survives GSAP CDN failure).
    // .reveal uses GSAP ScrollTrigger when available, falls back to safety timeout below.
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          duration: 1.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
            onEnter: () => el.classList.add('shown'),
          },
        });
      });
    }

    // SAFETY FALLBACK — if anything is still hidden after 4s (GSAP failed / ScrollTrigger didn't fire),
    // force-show everything so the page is usable.
    setTimeout(() => {
      document.querySelectorAll('.reveal, .fade-in, .cardinal, .center-disc, [data-must-show]').forEach((el) => {
        const op = parseFloat(getComputedStyle(el).opacity);
        if (!op || op < 0.05) {
          el.style.opacity = '1';
          el.style.transform = 'none';
        }
      });
    }, 4000);

    document.documentElement.classList.add('ready');
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
