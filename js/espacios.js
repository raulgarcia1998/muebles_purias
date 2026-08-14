/* ═══════════════════════════════════════════════════════════════════════
   ESPACIOS · Explora por categoría
   ───────────────────────────────────────────────────────────────────────
   Cuaderno de muestras: las cuatro categorías ya están montadas en el
   HTML como tarjetas iguales, cada una con su propio carrusel de
   scroll-snap nativo — todo esto funciona entero sin JavaScript. Lo
   único que añade este guion es el atajo de las flechas sobre ese mismo
   scroll, y un contador «01 / 03» que seguía el gesto real del usuario
   (arrastrar, teclado o las propias flechas) en vez de fingir uno propio.
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var seccion = document.getElementById('espacios');
  if (!seccion) return;

  var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function anchoPaso(pista) {
    var foto = pista.querySelector('.carrusel__foto');
    if (!foto) return pista.clientWidth;
    var estilo = getComputedStyle(pista);
    var salto = parseFloat(estilo.columnGap || estilo.gap || '0') || 0;
    return foto.getBoundingClientRect().width + salto;
  }

  Array.prototype.forEach.call(seccion.querySelectorAll('.carrusel'), function (carrusel) {
    var pista = carrusel.querySelector('.carrusel__pista');
    if (!pista) return;

    var prev = carrusel.querySelector('.carrusel__control--prev');
    var next = carrusel.querySelector('.carrusel__control--next');
    if (prev) prev.addEventListener('click', function () {
      pista.scrollBy({ left: -anchoPaso(pista), behavior: reducido ? 'auto' : 'smooth' });
    });
    if (next) next.addEventListener('click', function () {
      pista.scrollBy({ left: anchoPaso(pista), behavior: reducido ? 'auto' : 'smooth' });
    });

    var actual = carrusel.querySelector('.carrusel__contador-actual');
    var total = pista.querySelectorAll('.carrusel__foto').length;
    if (!actual || total < 2) return;

    var pendiente = false;
    pista.addEventListener('scroll', function () {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(function () {
        var paso = anchoPaso(pista) || 1;
        var idx = Math.round(pista.scrollLeft / paso);
        idx = Math.max(0, Math.min(total - 1, idx));
        actual.textContent = String(idx + 1);
        pendiente = false;
      });
    }, { passive: true });
  });
})();
