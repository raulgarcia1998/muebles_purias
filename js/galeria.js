/* ═══════════════════════════════════════════════════════════════════════
   GALERÍA · Trabajos realizados
   ───────────────────────────────────────────────────────────────────────
   Base, sin JavaScript: cuatro categorías en su rejilla, cada una con su
   propio carrusel de scroll-snap nativo — funciona entero sin script.
   Este guion añade dos cosas encima de esa base: las flechas de
   prev/siguiente con un contador en vivo, y el visor a pantalla completa
   que se abre al pinchar cualquier foto.
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var galeria = document.querySelector('.galeria');
  var visor = document.getElementById('visor');
  var visorPista = document.getElementById('visor-pista');
  if (!galeria || !visor || !visorPista) return;

  var botonCerrar = visor.querySelector('.visor__cerrar');
  var botonPrev = visor.querySelector('.visor__control--prev');
  var botonNext = visor.querySelector('.visor__control--next');
  if (!botonCerrar || !botonPrev || !botonNext) return;

  var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function anchoPaso(pista, selectorFoto) {
    var foto = pista.querySelector(selectorFoto);
    if (!foto) return pista.clientWidth;
    var estilo = getComputedStyle(pista);
    var salto = parseFloat(estilo.columnGap || estilo.gap || '0') || 0;
    return foto.getBoundingClientRect().width + salto;
  }

  /* ── Carrusel de cada tarjeta: flechas + contador en vivo ─────────── */

  Array.prototype.forEach.call(galeria.querySelectorAll('.carrusel'), function (carrusel) {
    var pista = carrusel.querySelector('.carrusel__pista');
    if (!pista) return;

    var prev = carrusel.querySelector('.carrusel__control--prev');
    var next = carrusel.querySelector('.carrusel__control--next');
    if (prev) prev.addEventListener('click', function () {
      pista.scrollBy({ left: -anchoPaso(pista, '.carrusel__foto'), behavior: reducido ? 'auto' : 'smooth' });
    });
    if (next) next.addEventListener('click', function () {
      pista.scrollBy({ left: anchoPaso(pista, '.carrusel__foto'), behavior: reducido ? 'auto' : 'smooth' });
    });

    var actual = carrusel.querySelector('.carrusel__contador-actual');
    var total = pista.querySelectorAll('.carrusel__foto').length;
    if (!actual || total < 2) return;

    var pendiente = false;
    pista.addEventListener('scroll', function () {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(function () {
        var paso = anchoPaso(pista, '.carrusel__foto') || 1;
        var idx = Math.max(0, Math.min(total - 1, Math.round(pista.scrollLeft / paso)));
        actual.textContent = String(idx + 1);
        pendiente = false;
      });
    }, { passive: true });
  });

  /* ── Visor a pantalla completa ─────────────────────────────────────
     Clona el <picture> ya presente en la tarjeta que se pinchó — ni una
     URL de imagen duplicada entre la tarjeta y el visor. */

  var enfocables = [botonCerrar, botonPrev, botonNext];
  var pistaOrigen = null;
  var indiceActual = 0;
  var disparador = null;
  var cerrando = false;

  function construirVisor(pista, indiceInicial) {
    visorPista.textContent = '';
    Array.prototype.forEach.call(pista.querySelectorAll('.carrusel__foto'), function (foto) {
      var pictureOrigen = foto.querySelector('picture');
      var tipoOrigen = foto.querySelector('.trabajo__tipo');
      var datoOrigen = foto.querySelector('.trabajo__overlay .dato');
      if (!pictureOrigen || !tipoOrigen || !datoOrigen) return;

      var figura = document.createElement('figure');
      figura.className = 'visor__foto';

      var marco = document.createElement('div');
      marco.className = 'visor__marco';
      marco.appendChild(pictureOrigen.cloneNode(true));

      var pie = document.createElement('figcaption');
      pie.className = 'visor__pie';
      var spanTipo = document.createElement('span');
      spanTipo.className = 'trabajo__tipo';
      spanTipo.textContent = tipoOrigen.textContent;
      var spanDato = document.createElement('span');
      spanDato.className = 'dato';
      spanDato.textContent = datoOrigen.textContent;
      pie.appendChild(spanTipo);
      pie.appendChild(spanDato);

      figura.appendChild(marco);
      figura.appendChild(pie);
      visorPista.appendChild(figura);
    });

    // El visor ya está visible en este punto (abrir() quita «hidden»
    // antes de llamar aquí): solo con geometría real puede calcularse
    // el ancho de un paso y fijar el scroll de golpe, sin animación.
    var paso = anchoPaso(visorPista, '.visor__foto');
    visorPista.scrollLeft = indiceInicial * paso;
  }

  function abrir(pista, indice, origen) {
    pistaOrigen = pista;
    indiceActual = indice;
    disparador = origen;

    visor.hidden = false;
    construirVisor(pista, indice);

    void visor.offsetWidth; // fuerza el reflow: sin esto no hay transición que animar
    visor.classList.add('visor--visible');

    document.documentElement.style.overflow = 'hidden';
    botonCerrar.focus();
    document.addEventListener('keydown', alTeclado);
  }

  function cerrar() {
    if (cerrando || visor.hidden) return;
    cerrando = true;

    // Sincroniza la tarjeta de origen con la foto que se estaba viendo:
    // si el usuario deslizó dentro del visor, la tarjeta no se queda
    // enseñando una foto distinta a la que acaba de ver. Cambiar
    // «scrollLeft» ya dispara el listener que actualiza su contador —
    // no hace falta duplicar esa lógica aquí.
    if (pistaOrigen) {
      var paso = anchoPaso(pistaOrigen, '.carrusel__foto');
      pistaOrigen.scrollLeft = indiceActual * paso;
    }

    visor.classList.remove('visor--visible');
    document.removeEventListener('keydown', alTeclado);

    var yaTerminado = false;
    var terminar = function () {
      if (yaTerminado) return;
      yaTerminado = true;
      visor.removeEventListener('transitionend', alTerminarTransicion);
      visor.hidden = true;
      visorPista.textContent = '';
      document.documentElement.style.overflow = '';
      if (disparador) disparador.focus();
      pistaOrigen = null;
      disparador = null;
      cerrando = false;
    };
    var alTerminarTransicion = function (e) {
      if (e.target === visor && e.propertyName === 'opacity') terminar();
    };
    visor.addEventListener('transitionend', alTerminarTransicion);
    setTimeout(terminar, 400);
  }

  function irA(delta) {
    var fotos = visorPista.querySelectorAll('.visor__foto');
    var idx = Math.max(0, Math.min(fotos.length - 1, indiceActual + delta));
    if (idx === indiceActual || !fotos[idx]) return;
    indiceActual = idx;
    fotos[idx].scrollIntoView({ block: 'nearest', inline: 'start', behavior: reducido ? 'auto' : 'smooth' });
  }

  function alTeclado(e) {
    if (e.key === 'Escape') { cerrar(); return; }
    if (e.key === 'ArrowLeft') { irA(-1); return; }
    if (e.key === 'ArrowRight') { irA(1); return; }
    if (e.key === 'Tab') {
      var idx = enfocables.indexOf(document.activeElement);
      var siguiente = e.shiftKey
        ? (idx <= 0 ? enfocables.length - 1 : idx - 1)
        : (idx === -1 || idx === enfocables.length - 1 ? 0 : idx + 1);
      e.preventDefault();
      enfocables[siguiente].focus();
    }
  }

  botonCerrar.addEventListener('click', cerrar);
  botonPrev.addEventListener('click', function () { irA(-1); });
  botonNext.addEventListener('click', function () { irA(1); });

  // El índice también se actualiza cuando el usuario desliza a mano
  // (arrastre táctil, trackpad) en vez de usar las flechas.
  var pendienteVisor = false;
  visorPista.addEventListener('scroll', function () {
    if (pendienteVisor) return;
    pendienteVisor = true;
    requestAnimationFrame(function () {
      var fotos = visorPista.querySelectorAll('.visor__foto');
      var paso = anchoPaso(visorPista, '.visor__foto') || 1;
      indiceActual = Math.max(0, Math.min(fotos.length - 1, Math.round(visorPista.scrollLeft / paso)));
      pendienteVisor = false;
    });
  }, { passive: true });

  Array.prototype.forEach.call(galeria.querySelectorAll('.carrusel__abrir'), function (boton) {
    boton.addEventListener('click', function () {
      var figura = boton.closest('.carrusel__foto');
      var pista = boton.closest('.carrusel__pista');
      if (!figura || !pista) return;
      var fotos = Array.prototype.slice.call(pista.querySelectorAll('.carrusel__foto'));
      var indice = fotos.indexOf(figura);
      abrir(pista, indice < 0 ? 0 : indice, boton);
    });
  });
})();
