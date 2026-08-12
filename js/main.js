/* ═══════════════════════════════════════════════════════════════════════
   MUEBLES PURIAS · Comportamiento
   ───────────────────────────────────────────────────────────────────────
   Solo hay cuatro movimientos en toda la web, y ninguno es decorativo:

     1. El marco se dibuja una vez al cargar. Nunca vuelve a moverse.
     2. Cada título sale del marco al entrar en pantalla. Una vez.
     3. La reforma avanza con el scroll. Eso no es una animación: es el
        usuario moviendo el tiempo del vídeo con el dedo, con un pelín de
        inercia al soltar para que no pare en seco.
     4. Las fotos, fichas y tarjetas se revelan al llegar a ellas, una
        cortina que se abre, no un fundido genérico. Una vez cada una.

   Si el sistema pide movimiento reducido, no ocurre ninguno de los cuatro.
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


  /* ── 2b · Las piezas se revelan al llegar ─────────────────────────
     Misma geometría que el título de arriba, misma disciplina: se
     dispara una vez y se olvida del elemento. Lo que cambia es la
     clase que añade —.es-visible mueve un clip-path, no un
     translateX— así que va en su propio observador en vez de forzar
     al de los títulos a hacer dos cosas distintas. */

  var revelados = document.querySelectorAll('.reveal');

  if (quieto.matches || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revelados, function (r) { r.classList.add('es-visible'); });
  } else {
    var vigiaRevelado = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('es-visible');
        vigiaRevelado.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });

    Array.prototype.forEach.call(revelados, function (r) { vigiaRevelado.observe(r); });
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


  /* ── 4 · La reforma avanza con el scroll ────────────────────────── */

  var pista = document.getElementById('reforma-pista');
  var reforma = document.getElementById('reforma-video');
  var avance = document.getElementById('reforma-avance');
  var etAntes = document.getElementById('etiqueta-antes');
  var etDespues = document.getElementById('etiqueta-despues');
  var instruccion = document.getElementById('reforma-instruccion');

  if (reforma && pista) {
    if (quieto.matches || ahorraDatos()) {
      // Sin scrub: el vídeo se queda con sus controles y no se descarga
      // hasta que alguien le da al play.
      reforma.controls = true;
      if (instruccion) { instruccion.textContent = 'reproduce para ver la reforma'; }
    } else {
      arrancarScrub();
    }
  }

  function arrancarScrub() {
    var ultimo = -1;
    var objetivo = null;        // último instante que ha pedido el scroll
    var saltando = false;       // ¿hay un salto todavía resolviéndose?
    var actual = 0;             // progreso mostrado, persiguiendo al del scroll
    var animando = false;       // ¿sigue corriendo el lazo de persecución?

    reforma.controls = false;   // a partir de aquí manda el scroll

    // No se pide hasta que el lector se acerca: dos pantallas de margen
    // bastan para que llegue cargado. En pantallas estrechas se sirve la
    // copia de 480p: a 368 px de ancho no se distingue de la de 720p, pesa
    // la mitad y se recorre el doble de rápido.
    function traerVideo() {
      if (reforma.preload === 'auto') return;
      if (pantallaChica.matches) {
        reforma.src = 'Recursos/optimizado/antes-despues-480.mp4';
      }
      reforma.preload = 'auto';
      reforma.load();
    }
    if ('IntersectionObserver' in window) {
      var cerca = new IntersectionObserver(function (entradas) {
        if (entradas[0].isIntersecting) { traerVideo(); cerca.disconnect(); }
      }, { rootMargin: '200% 0px' });
      cerca.observe(pista);
    } else {
      traerVideo();
    }

    // La duración se lee del elemento en cada pasada. Depender de un
    // evento aquí es frágil: si «loadedmetadata» ya ha saltado antes de
    // que lleguemos a escucharlo, el scrub se queda mudo para siempre.
    // Los dos van con «once»: son arranque, no seguimiento. «canplay» en
    // concreto vuelve a saltar después de cada salto de scrubbing —es
    // normal, el navegador avisa de que hay datos alrededor del nuevo
    // punto—, y sin «once» cada uno de esos avisos llamaba a dibujar(),
    // que pinta de golpe y cortaba en seco la persecución con inercia.
    reforma.addEventListener('loadedmetadata', dibujar, { once: true });
    reforma.addEventListener('canplay', comprobarSalto, { once: true });

    // Si el servidor no sirve peticiones parciales, el navegador no puede
    // saltar a un instante del vídeo y el scrub no funcionaría. Antes que
    // dejar un vídeo congelado, se le devuelven los controles.
    function comprobarSalto() {
      var puede = reforma.seekable.length > 0 && reforma.seekable.end(0) > 0.5;
      if (!puede) {
        reforma.controls = true;
        if (instruccion) { instruccion.textContent = 'reproduce para ver la reforma'; }
        return;
      }
      dibujar();
    }

    // Safari en iOS no permite buscar en un vídeo que nunca se ha
    // reproducido. Un play/pause inmediato y silencioso lo desbloquea.
    function desbloquear() {
      var p = reforma.play();
      if (p && p.then) { p.then(function () { reforma.pause(); }).catch(function () {}); }
      else { reforma.pause(); }
      window.removeEventListener('touchstart', desbloquear);
      window.removeEventListener('pointerdown', desbloquear);
    }
    window.addEventListener('touchstart', desbloquear, { once: true, passive: true });
    window.addEventListener('pointerdown', desbloquear, { once: true });

    function progreso() {
      var caja = pista.getBoundingClientRect();
      var recorrido = caja.height - window.innerHeight;
      if (recorrido <= 0) return 0;
      var p = -caja.top / recorrido;
      return p < 0 ? 0 : p > 1 ? 1 : p;
    }

    function aplicar(p) {
      if (avance) { avance.style.width = (p * 100).toFixed(2) + '%'; }
      if (etAntes) { etAntes.style.opacity = (1 - p * 0.75).toFixed(3); }
      if (etDespues) { etDespues.style.opacity = (0.35 + p * 0.65).toFixed(3); }

      var duracion = reforma.duration;
      if (!duracion || !isFinite(duracion) || reforma.readyState < 1) return;

      // Un pelín antes del final: el último fotograma a veces no existe.
      objetivo = p * (duracion - 0.05);
      saltar();
    }

    // Pinta de golpe, sin perseguir nada: para el primer fotograma y
    // para los redimensionados, donde arrancar una persecución desde
    // cero solo añadiría un salto de más.
    function dibujar() {
      actual = progreso();
      aplicar(actual);
    }

    /* El progreso que se pinta no salta directo al punto que marca el
       scroll: lo persigue con una pequeña inercia. Por eso, al soltar
       el gesto —dedo o rueda—, sigue deslizando un instante hasta
       alcanzarlo en vez de parar en seco. Lo que manda sigue siendo
       el scroll, el destino no cambia; solo cambia cómo se llega. Con
       0,16 por fotograma el alcance tarda ~35 fotogramas (≈0,6 s) en
       cerrarse del todo: se nota como deslizamiento, no como retraso. */
    function avanzar() {
      var destino = progreso();
      var diferencia = destino - actual;

      if (Math.abs(diferencia) < 0.0006) {
        actual = destino;
        aplicar(actual);
        animando = false;
        return;
      }

      actual += diferencia * 0.16;
      aplicar(actual);
      requestAnimationFrame(avanzar);
    }

    /* Los saltos se encadenan, no se amontonan.
       Pedir un instante nuevo mientras el anterior sigue resolviéndose
       encola trabajo que el navegador acaba descartando, y eso es
       justo lo que se percibe como pasos en vez de movimiento. Aquí solo
       hay un salto en vuelo: cuando termina, se va directo al último
       objetivo que haya dejado el scroll. */
    function saltar() {
      if (saltando || objetivo === null) return;
      if (Math.abs(objetivo - ultimo) < 0.015) return;

      ultimo = objetivo;
      saltando = true;
      reforma.pause();

      try { reforma.currentTime = ultimo; }
      catch (e) { saltando = false; reforma.controls = true; return; }

      reforma.addEventListener('seeked', function alTerminar() {
        reforma.removeEventListener('seeked', alTerminar);
        saltando = false;
        saltar();                       // ¿se ha movido mientras tanto?
      });
    }

    function pedir() {
      if (animando) return;       // ya hay un lazo en marcha, la persigue igual
      animando = true;
      requestAnimationFrame(avanzar);
    }

    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', dibujar);
    dibujar();
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
