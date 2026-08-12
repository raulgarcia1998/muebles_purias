/* ═══════════════════════════════════════════════════════════════════════
   ESPACIOS · Explora por categoría
   ───────────────────────────────────────────────────────────────────────
   Base, sin JavaScript ni GSAP: cuatro categorías apiladas en el HTML,
   cada una ya abierta con su propio carrusel de scroll-snap nativo. Esta
   función siempre arranca ese carrusel — no depende de nada más.

   Todo lo que sigue después es mejora progresiva: si GSAP (+ ScrollTrigger
   + Flip + CustomEase, autoalojados en js/vendor/) cargó y el sistema no
   pide movimiento reducido, se reestructura el DOM en pestañas con
   activación por scroll y una transición de elemento compartido entre la
   tarjeta y el visor ampliado. Si algo de eso falta, la base de arriba se
   queda tal cual: sigue siendo una galería completa y usable.
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var seccion = document.getElementById('espacios');
  var lista = document.getElementById('espacios-lista');
  if (!seccion || !lista) return;

  /* ── Carrusel: funciona igual con o sin la mejora de abajo ────────── */

  function anchoPaso(pista) {
    var foto = pista.querySelector('.carrusel__foto');
    if (!foto) return pista.clientWidth;
    var estilo = getComputedStyle(pista);
    var salto = parseFloat(estilo.columnGap || estilo.gap || '0') || 0;
    return foto.getBoundingClientRect().width + salto;
  }

  Array.prototype.forEach.call(seccion.querySelectorAll('.carrusel'), function (carrusel) {
    var pista = carrusel.querySelector('.carrusel__pista');
    var prev = carrusel.querySelector('.carrusel__control--prev');
    var next = carrusel.querySelector('.carrusel__control--next');
    if (!pista) return;
    if (prev) prev.addEventListener('click', function () {
      pista.scrollBy({ left: -anchoPaso(pista), behavior: 'smooth' });
    });
    if (next) next.addEventListener('click', function () {
      pista.scrollBy({ left: anchoPaso(pista), behavior: 'smooth' });
    });
  });

  /* ── Mejora progresiva: pestañas, pin por scroll, Flip ─────────────
     Se detiene aquí —sin tocar el DOM— si falta cualquier ingrediente:
     movimiento reducido, o alguna de las cuatro piezas de GSAP. */

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  if (typeof window.gsap === 'undefined' ||
      typeof window.ScrollTrigger === 'undefined' ||
      typeof window.Flip === 'undefined' ||
      typeof window.CustomEase === 'undefined') return;

  var paneles = Array.prototype.slice.call(lista.querySelectorAll('.espacios__categoria'));
  if (paneles.length < 2) return;

  var gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger, window.Flip, window.CustomEase);
  // La misma curva que ya usa el resto del sitio (--curva en estilo.css),
  // no una segunda inventada para esta sección.
  window.CustomEase.create('curva', '0.22, 0.61, 0.36, 1');

  // — Reestructura el DOM: envuelve la lista en la pista/panel fijo que
  //   ScrollTrigger va a pinear, y construye la cabecera de pestañas y el
  //   indicador de progreso. —
  var pista = document.createElement('div');
  pista.className = 'espacios__pista';
  pista.id = 'espacios-pista';

  var fijo = document.createElement('div');
  fijo.className = 'espacios__fijo';

  var cabecera = document.createElement('div');
  cabecera.className = 'espacios__cabecera';
  cabecera.setAttribute('role', 'tablist');
  cabecera.setAttribute('aria-label', 'Categorías');

  var progreso = document.createElement('div');
  progreso.className = 'espacios__progreso';
  progreso.setAttribute('aria-hidden', 'true');

  var instruccion = document.createElement('p');
  instruccion.className = 'dato espacios__pista-texto';
  instruccion.textContent = 'desplaza para cambiar de espacio';

  seccion.insertBefore(pista, lista);
  pista.appendChild(fijo);
  fijo.appendChild(cabecera);
  fijo.appendChild(progreso);
  fijo.appendChild(lista);
  fijo.appendChild(instruccion);

  var tarjetas = [];
  var pasos = [];

  paneles.forEach(function (panel, i) {
    var categoria = panel.getAttribute('data-categoria');
    var nombre = panel.querySelector('.espacios__nombre').textContent;

    var tarjeta = document.createElement('a');
    tarjeta.className = 'espacios__tarjeta';
    tarjeta.href = '#' + panel.id;
    tarjeta.id = 'espacios-tab-' + categoria;
    tarjeta.setAttribute('data-categoria', categoria);
    tarjeta.setAttribute('role', 'tab');
    tarjeta.setAttribute('aria-controls', panel.id);
    tarjeta.setAttribute('aria-expanded', i === 0 ? 'true' : 'false');

    var marco = document.createElement('div');
    marco.className = 'espacios__tarjeta-marco';

    var etiqueta = document.createElement('span');
    etiqueta.className = 'espacios__tarjeta-nombre';
    etiqueta.textContent = nombre;

    tarjeta.appendChild(marco);
    tarjeta.appendChild(etiqueta);
    cabecera.appendChild(tarjeta);
    tarjetas.push(tarjeta);

    var paso = document.createElement('span');
    paso.className = 'espacios__paso';
    progreso.appendChild(paso);
    pasos.push(paso);

    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tarjeta.id);

    if (i === 0) {
      panel.classList.add('espacios__categoria--activa');
      tarjeta.classList.add('espacios__tarjeta--activa');
      paso.classList.add('espacios__paso--activo');
    } else {
      panel.hidden = true;
      var miniatura = panel.querySelector('.espacios__miniatura');
      if (miniatura) marco.appendChild(miniatura);
    }
  });

  seccion.classList.add('espacios--mejorado');

  // — Cambia de categoría activa: la miniatura saliente vuelve a su
  //   tarjeta, la entrante se instala como primera foto del visor, y
  //   Flip anima ambos viajes como un único elemento que se mueve, no
  //   como dos cosas que aparecen y desaparecen. —
  var activa = 0;

  function activar(idx) {
    if (idx === activa || idx < 0 || idx > paneles.length - 1) return;

    var salPanel = paneles[activa], salTarjeta = tarjetas[activa];
    var entPanel = paneles[idx], entTarjeta = tarjetas[idx];

    var salMini = salPanel.querySelector('.espacios__miniatura');
    var entMini = entTarjeta.querySelector('.espacios__miniatura');
    var entPista = entPanel.querySelector('.carrusel__pista');
    var otrasEntrantes = Array.prototype.slice.call(
      entPanel.querySelectorAll('.carrusel__foto:not(.espacios__miniatura)')
    );

    var estado = window.Flip.getState([salMini, entMini].filter(Boolean));

    var salMarco = salTarjeta.querySelector('.espacios__tarjeta-marco');
    if (salMini && salMarco) salMarco.appendChild(salMini);
    if (entMini && entPista) entPista.insertBefore(entMini, entPista.firstChild);

    salPanel.classList.remove('espacios__categoria--activa');
    salPanel.hidden = true;
    salTarjeta.classList.remove('espacios__tarjeta--activa');
    salTarjeta.setAttribute('aria-expanded', 'false');

    entPanel.hidden = false;
    entPanel.classList.add('espacios__categoria--activa');
    entTarjeta.classList.add('espacios__tarjeta--activa');
    entTarjeta.setAttribute('aria-expanded', 'true');

    // Solo tiene efecto una vez que el panel está visible: con
    // «hidden» puesto todavía (display:none), el navegador no tiene
    // ningún viewport de scroll sobre el que aplicar esto, y lo
    // ignora en silencio — por eso va después de desocultar el panel,
    // no antes. El scroll-snap se desactiva mientras tanto porque
    // reactivarlo más abajo puede reasentar el scroll en la segunda
    // foto en vez de en la primera — ver el porqué junto a
    // «restaurarSnap».
    if (entPista) {
      entPista.style.scrollSnapType = 'none';
      entPista.scrollLeft = 0;
    }

    pasos.forEach(function (paso, i) {
      paso.classList.toggle('espacios__paso--activo', i === idx);
      paso.classList.toggle('espacios__paso--hecho', i < idx);
    });

    window.Flip.from(estado, { duration: 0.6, ease: 'curva', absolute: true, scale: true });

    // Reactivar «scroll-snap-type» justo después de mover la miniatura
    // hace que Chrome, alguna vez, reasiente el scroll en la segunda
    // foto en vez de en la primera —medido: pasa incluso mucho después
    // de que termine cualquier animación, así que no es cuestión de
    // esperar más—. Se vigila con rAF durante medio segundo y se
    // corrige en el acto si ocurre; a 60fps no llega a verse.
    var restaurarSnap = function () {
      if (!entPista) return;
      entPista.scrollLeft = 0;
      entPista.style.scrollSnapType = '';
      var limite = performance.now() + 500;
      (function vigilar() {
        if (entPista.scrollLeft !== 0) entPista.scrollLeft = 0;
        if (performance.now() < limite) requestAnimationFrame(vigilar);
      })();
    };

    if (otrasEntrantes.length) {
      gsap.fromTo(otrasEntrantes,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'curva', stagger: 0.06, delay: 0.18, onComplete: restaurarSnap });
    } else {
      gsap.delayedCall(0.6, restaurarSnap);
    }

    activa = idx;
  }

  // — El scroll dentro de la pista fijada decide qué categoría toca,
  //   en el orden en que aparecen en el HTML: Cocinas → Salón →
  //   Dormitorio → Baño. —
  var vigia = window.ScrollTrigger.create({
    trigger: pista,
    start: 'top top',
    end: 'bottom bottom',
    pin: fijo,
    scrub: 0.3,
    onUpdate: function (self) {
      var idx = Math.min(paneles.length - 1, Math.floor(self.progress * paneles.length));
      activar(idx);
    }
  });

  // — Un click en una tarjeta activa esa categoría al instante —sin
  //   esperar a que el scroll llegue— y luego desplaza la página hasta
  //   el punto que le corresponde, para que un scroll posterior no la
  //   cambie de inmediato a otra cosa. —
  tarjetas.forEach(function (tarjeta, idx) {
    tarjeta.addEventListener('click', function (e) {
      e.preventDefault();
      activar(idx);
      var y = vigia.start + (vigia.end - vigia.start) * ((idx + 0.5) / paneles.length);
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
})();
