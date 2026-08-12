/* ═══════════════════════════════════════════════════════════════════════
   MUEBLES PURIAS · Comportamiento
   ───────────────────────────────────────────────────────────────────────
   Solo hay tres movimientos en toda la web, y ninguno es decorativo:

     1. El marco se dibuja una vez al cargar. Nunca vuelve a moverse.
     2. Cada título sale del marco al entrar en pantalla. Una vez.
     3. El vídeo de la reforma se reproduce solo al acercarse, en bucle,
        y se para si el lector se va a otra parte.

   Si el sistema pide movimiento reducido, no ocurre ninguno de los tres.
   Sin dependencias.
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var quieto = window.matchMedia('(prefers-reduced-motion: reduce)');
  var pantallaChica = window.matchMedia('(max-width: 640px)');

  function ahorraDatos() {
    var c = navigator.connection;
    return !!(c && (c.saveData || /2g/.test(c.effectiveType || '')));
  }


  /* ── 1 · El marco se dibuja ─────────────────────────────────────── */

  var marco = document.querySelector('.marco');
  if (marco) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { marco.classList.add('marco--trazado'); });
    });
  }


  /* ── 2 · Los títulos salen del marco ────────────────────────────── */

  var titulos = document.querySelectorAll('.titulo');

  if (quieto.matches || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(titulos, function (t) { t.classList.add('titulo--rompe'); });
  } else {
    var vigia = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('titulo--rompe');
        vigia.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });

    Array.prototype.forEach.call(titulos, function (t) { vigia.observe(t); });
  }


  /* ── 3 · El vídeo del hero ──────────────────────────────────────────
     No se descarga en móvil ni con ahorro de datos: se queda el póster,
     que ya está pintado como fondo. Son 880 KB que nadie pidió.        */

  var hero = document.getElementById('hero-video');

  if (hero && !quieto.matches && !pantallaChica.matches && !ahorraDatos()) {
    hero.src = 'Recursos/optimizado/cocina-hero.mp4';
    hero.load();
    var intento = hero.play();
    if (intento && intento.catch) { intento.catch(function () { /* el póster se queda */ }); }
  }


  /* ── 4 · La reforma se reproduce sola al acercarse ──────────────────
     Antes el scroll movía el tiempo del vídeo a mano; ahora es un vídeo
     normal, en bucle, que arranca solo y se para si el lector se va a
     otra parte. No hace falta desplazar la página para verlo entero. */

  var reforma = document.getElementById('reforma-video');

  if (reforma) {
    if (quieto.matches || ahorraDatos()) {
      // Se queda con el póster y sus controles nativos: nadie descarga
      // 10,9 MB de golpe si prefiere no ver cosas moverse solas, o si va
      // con el ahorro de datos activado.
    } else {
      arrancarAutoplay();
    }
  }

  function arrancarAutoplay() {
    var reproduciendo = false;

    function traerYReproducir() {
      // En pantallas estrechas, la copia de 480p: a ese ancho no se
      // distingue de la de 720p y pesa la mitad.
      if (pantallaChica.matches && !reforma.dataset.movil) {
        reforma.dataset.movil = '1';
        reforma.src = 'Recursos/optimizado/antes-despues-480.mp4';
      }
      if (reforma.preload !== 'auto') { reforma.preload = 'auto'; reforma.load(); }
      var intento = reforma.play();
      if (intento && intento.catch) { intento.catch(function () { /* controles nativos de sobra */ }); }
      reproduciendo = true;
    }

    if (!('IntersectionObserver' in window)) { traerYReproducir(); return; }

    var vigia = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { traerYReproducir(); }
        else if (reproduciendo) { reforma.pause(); }
      });
    }, { threshold: 0.4 });
    vigia.observe(reforma);
  }


  /* ── 5 · El menú dice dónde estás ───────────────────────────────────
     El filete bajo cada entrada no adorna: marca la sección que estás
     leyendo. Se calcula cuál es la última que ha pasado por encima de
     la línea de lectura, a un 42 % de la altura. Así siempre hay una
     marcada —ni parpadea entre secciones ni se queda en blanco al
     llegar al final—, salvo en el hero, donde todavía no toca.        */

  var pares = [];
  Array.prototype.forEach.call(
    document.querySelectorAll('.cabecera__nav a[href^="#"]'),
    function (a) {
      var seccion = document.getElementById(a.getAttribute('href').slice(1));
      if (seccion) { pares.push({ enlace: a, seccion: seccion }); }
    }
  );

  if (pares.length) {
    var brujulaPedida = false;

    function orientar() {
      brujulaPedida = false;
      var linea = window.innerHeight * 0.42;
      var actual = null;

      pares.forEach(function (par) {
        if (par.seccion.getBoundingClientRect().top <= linea) { actual = par; }
      });

      pares.forEach(function (par) {
        var esta = par === actual;
        par.enlace.classList.toggle('es-actual', esta);
        if (esta) { par.enlace.setAttribute('aria-current', 'true'); }
        else { par.enlace.removeAttribute('aria-current'); }
      });
    }

    function pedirBrujula() {
      if (brujulaPedida) return;
      brujulaPedida = true;
      requestAnimationFrame(orientar);
    }

    window.addEventListener('scroll', pedirBrujula, { passive: true });
    window.addEventListener('resize', pedirBrujula);
    orientar();
  }


  /* ── 6 · Detalles ───────────────────────────────────────────────── */

  var anio = document.getElementById('anio');
  if (anio) { anio.textContent = new Date().getFullYear(); }

  // El logo de cabecera lleva al principio sin ensuciar la URL.
  var logo = document.querySelector('.cabecera__logo');
  if (logo) {
    logo.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: quieto.matches ? 'auto' : 'smooth' });
    });
  }
})();
