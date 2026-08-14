/* ═══════════════════════════════════════════════════════════════════════
   GALERÍA · Trabajos realizados
   ───────────────────────────────────────────────────────────────────────
   Base, sin JavaScript: cuatro categorías en su rejilla, cada una con su
   propio carrusel de scroll-snap nativo — funciona entero sin script.
   Este guion añade tres cosas encima de esa base: las flechas de
   prev/siguiente con un contador en vivo, y el visor a pantalla completa
   que se abre al pinchar cualquier foto —con acercamiento desde la propia
   miniatura, zoom con dos dedos y pantalla completa real en los
   navegadores que la permiten.
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
  // Misma curva que el resto del sitio (--curva en estilo.css), leída del
  // propio CSS en vez de repetirla aquí a mano — si cambia allí, cambia
  // también aquí sin tocar el guion.
  var CURVA = (getComputedStyle(document.documentElement).getPropertyValue('--curva') || '').trim() || 'ease';

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
    var actual = carrusel.querySelector('.carrusel__contador-actual');
    var total = pista.querySelectorAll('.carrusel__foto').length;
    if (total < 2) return; // nada que recorrer con una sola foto

    // De la última foto, «siguiente» vuelve a la primera, y al revés
    // desde la primera con «anterior» — el carrusel es un círculo, no
    // se queda parado en seco contra los dos extremos. Esa vuelta en
    // concreto va sin animación: deslizarla suave se vería como un
    // retroceso por todas las fotos intermedias en vez de un salto al
    // otro extremo. Los pasos normales siguen deslizándose.
    function irAPaso(delta) {
      var paso = anchoPaso(pista, '.carrusel__foto') || 1;
      var idx = Math.round(pista.scrollLeft / paso);
      var esVuelta = (delta > 0 && idx >= total - 1) || (delta < 0 && idx <= 0);
      var destino = (idx + delta + total) % total;
      pista.scrollTo({ left: destino * paso, behavior: (reducido || esVuelta) ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { irAPaso(-1); });
    if (next) next.addEventListener('click', function () { irAPaso(1); });

    if (!actual) return;

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

  /* ── Pantalla completa real, cuando el navegador la permite ─────────
     Android/Chrome retira la barra de direcciones entera —se nota sobre
     todo con el móvil en horizontal, donde esa barra se come una buena
     parte de la pantalla—. Safari/iOS no la concede para contenido
     normal (solo para vídeo): ahí no pasa nada, simplemente se queda
     como estaba, con el mismo color de barra que ya lleva toda la web
     (meta theme-color, ya puesto en el <head>). */
  function pedirPantallaCompleta() {
    var solicitar = visor.requestFullscreen || visor.webkitRequestFullscreen;
    if (!solicitar) return;
    try {
      var resultado = solicitar.call(visor);
      if (resultado && resultado.catch) resultado.catch(function () {});
    } catch (err) { /* denegada: la web sigue igual de bien sin ella */ }
  }
  function salirPantallaCompleta() {
    if (!(document.fullscreenElement || document.webkitFullscreenElement)) return;
    var salir = document.exitFullscreen || document.webkitExitFullscreen;
    if (!salir) return;
    try {
      var resultado = salir.call(document);
      if (resultado && resultado.catch) resultado.catch(function () {});
    } catch (err) {}
  }

  /* ── FLIP: la foto vuela desde su miniatura hasta la pantalla ───────
     Técnica clásica «First, Last, Invert, Play»: se calcula dónde estaba
     la miniatura (First) y dónde queda el marco a pantalla completa
     (Last), se le aplica al marco un transform que lo hace *parecer* que
     sigue en el sitio de la miniatura (Invert), y se anima ese transform
     hasta «none» (Play). El navegador interpola el movimiento entero
     —posición y tamaño— como una sola pieza continua, no como una cosa
     que desaparece y otra que aparece. */
  function volarDesde(elemento, rectOrigen) {
    var rectDestino = elemento.getBoundingClientRect();
    if (!rectOrigen || !rectDestino.width || !rectDestino.height) return;
    var escalaX = rectOrigen.width / rectDestino.width;
    var escalaY = rectOrigen.height / rectDestino.height;
    var trasladoX = (rectOrigen.left + rectOrigen.width / 2) - (rectDestino.left + rectDestino.width / 2);
    var trasladoY = (rectOrigen.top + rectOrigen.height / 2) - (rectDestino.top + rectDestino.height / 2);

    elemento.style.transition = 'none';
    elemento.style.transform = 'translate(' + trasladoX + 'px,' + trasladoY + 'px) scale(' + escalaX + ',' + escalaY + ')';
    void elemento.offsetWidth; // confirma el estado de partida antes de animar
    requestAnimationFrame(function () {
      elemento.style.transition = 'transform 0.5s ' + CURVA;
      elemento.style.transform = 'none';
    });
    elemento.addEventListener('transitionend', function limpiar(e) {
      if (e.target !== elemento || e.propertyName !== 'transform') return;
      elemento.removeEventListener('transitionend', limpiar);
      elemento.style.transition = '';
      elemento.style.transform = '';
    });
  }

  // La vuelta al cerrar: el marco actual encoge hacia la miniatura que lo
  // abrió, en vez de solo desvanecerse con el fondo.
  function volarHacia(elemento, rectDestino) {
    var rectActual = elemento.getBoundingClientRect();
    if (!rectDestino || !rectActual.width || !rectActual.height) return;
    var escalaX = rectDestino.width / rectActual.width;
    var escalaY = rectDestino.height / rectActual.height;
    var trasladoX = (rectDestino.left + rectDestino.width / 2) - (rectActual.left + rectActual.width / 2);
    var trasladoY = (rectDestino.top + rectDestino.height / 2) - (rectActual.top + rectActual.height / 2);
    elemento.style.transition = 'transform 0.4s ' + CURVA;
    elemento.style.transform = 'translate(' + trasladoX + 'px,' + trasladoY + 'px) scale(' + escalaX + ',' + escalaY + ')';
  }

  /* ── Zoom con dos dedos + doble toque, por cada foto del visor ──────
     «touch-action» en el CSS empieza en «pan-x pinch-zoom» —dejar pasar
     el arrastre horizontal a la pista, pero avisar de que el pellizco lo
     gestiona esta página, no el zoom nativo—. En cuanto hay zoom activo
     pasa a «none»: un solo dedo deja de cambiar de foto y pasa a mover
     la imagen ampliada. */
  function activarZoomTactil(marco) {
    var img = marco.querySelector('img');
    if (!img) return function () {};

    var punteros = {};
    var numPunteros = 0;
    var escala = 1, trasladoX = 0, trasladoY = 0;
    var distanciaInicial = 0, escalaInicial = 1;
    var arrastrando = false, ultimoPunto = null;
    var ultimoToque = 0;

    function listaPunteros() {
      var lista = [];
      for (var id in punteros) if (Object.prototype.hasOwnProperty.call(punteros, id)) lista.push(punteros[id]);
      return lista;
    }

    function aplicar() {
      img.style.transform = escala === 1 ? '' : 'translate(' + trasladoX + 'px,' + trasladoY + 'px) scale(' + escala + ')';
      marco.style.touchAction = escala > 1 ? 'none' : 'pan-x pinch-zoom';
    }

    function limitar() {
      escala = Math.max(1, Math.min(4, escala));
      if (escala === 1) { trasladoX = 0; trasladoY = 0; }
    }

    function restablecer() {
      punteros = {};
      numPunteros = 0;
      escala = 1; trasladoX = 0; trasladoY = 0;
      arrastrando = false;
      img.style.transition = '';
      aplicar();
    }

    marco.addEventListener('pointerdown', function (e) {
      img.style.transition = ''; // corta cualquier transición del doble toque anterior
      punteros[e.pointerId] = { x: e.clientX, y: e.clientY };
      numPunteros++;
      if (numPunteros === 2) {
        var pts = listaPunteros();
        distanciaInicial = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        escalaInicial = escala;
        arrastrando = false;
      } else if (numPunteros === 1 && escala > 1) {
        arrastrando = true;
        ultimoPunto = { x: e.clientX, y: e.clientY };
      }
    });

    marco.addEventListener('pointermove', function (e) {
      if (!(e.pointerId in punteros)) return;
      punteros[e.pointerId] = { x: e.clientX, y: e.clientY };

      if (numPunteros === 2) {
        e.preventDefault();
        var pts = listaPunteros();
        var distancia = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (distanciaInicial > 0) {
          escala = escalaInicial * (distancia / distanciaInicial);
          limitar();
          aplicar();
        }
      } else if (arrastrando && escala > 1) {
        e.preventDefault();
        trasladoX += e.clientX - ultimoPunto.x;
        trasladoY += e.clientY - ultimoPunto.y;
        ultimoPunto = { x: e.clientX, y: e.clientY };
        aplicar();
      }
    }, { passive: false });

    function soltarPuntero(e) {
      if (e.pointerId in punteros) { delete punteros[e.pointerId]; numPunteros--; }
      arrastrando = false;
      if (numPunteros === 0 && escala <= 1.01) restablecer();
    }
    marco.addEventListener('pointerup', soltarPuntero);
    marco.addEventListener('pointercancel', soltarPuntero);

    // Doble toque: alterna entre 1x y un acercamiento cómodo, centrado en
    // el punto tocado — el gesto que cualquiera prueba sin pensarlo.
    marco.addEventListener('pointerup', function (e) {
      if (e.pointerType !== 'touch') return;
      var ahora = Date.now();
      if (ahora - ultimoToque > 300) { ultimoToque = ahora; return; }
      ultimoToque = 0;
      var rect = marco.getBoundingClientRect();
      if (escala > 1) {
        escala = 1; trasladoX = 0; trasladoY = 0;
      } else {
        escala = 2.5;
        trasladoX = (rect.width / 2 - (e.clientX - rect.left)) * (escala - 1) / escala;
        trasladoY = (rect.height / 2 - (e.clientY - rect.top)) * (escala - 1) / escala;
      }
      img.style.transition = 'transform 0.3s ' + CURVA;
      aplicar();
    });

    return restablecer;
  }

  /* ── Visor a pantalla completa ─────────────────────────────────────
     Clona el <picture> ya presente en la tarjeta que se pinchó — ni una
     URL de imagen duplicada entre la tarjeta y el visor. */

  var enfocables = [botonCerrar, botonPrev, botonNext];
  var pistaOrigen = null;
  var indiceActual = 0;
  var disparador = null;
  var cerrando = false;
  var restablecerZoomFns = [];

  function construirVisor(pista, indiceInicial) {
    visorPista.textContent = '';
    restablecerZoomFns = [];
    Array.prototype.forEach.call(pista.querySelectorAll('.carrusel__foto'), function (foto) {
      var pictureOrigen = foto.querySelector('picture');
      var tipoOrigen = foto.querySelector('.trabajo__tipo');
      var datoOrigen = foto.querySelector('.trabajo__overlay .dato');
      if (!pictureOrigen || !tipoOrigen || !datoOrigen) return;

      var figura = document.createElement('figure');
      figura.className = 'visor__foto';

      var marco = document.createElement('div');
      marco.className = 'visor__marco';
      var pictureClonada = pictureOrigen.cloneNode(true);
      // El «sizes» original describe el hueco de la tarjeta (p. ej. 38vw
      // en Salón) — aquí la foto ocupa casi toda la pantalla, así que hay
      // que decírselo de nuevo o el navegador sigue sirviendo el archivo
      // pensado para la tarjeta pequeña, y se ve borrosa o diminuta.
      Array.prototype.forEach.call(pictureClonada.querySelectorAll('source[sizes]'), function (fuente) {
        fuente.sizes = '92vw';
      });
      marco.appendChild(pictureClonada);

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

      restablecerZoomFns.push(activarZoomTactil(marco));
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

    var marcoOrigen = origen.querySelector('.trabajo__marco');
    var rectOrigen = marcoOrigen ? marcoOrigen.getBoundingClientRect() : null;

    // Primero visible, luego pantalla completa: pedirla con el visor
    // aún oculto (display:none) es donde más navegadores la deniegan.
    visor.hidden = false;
    pedirPantallaCompleta();
    construirVisor(pista, indice);

    void visor.offsetWidth; // fuerza el reflow: sin esto no hay transición que animar
    visor.classList.add('visor--visible');

    if (rectOrigen && !reducido) {
      var marcos = visorPista.querySelectorAll('.visor__marco');
      if (marcos[indice]) volarDesde(marcos[indice], rectOrigen);
    }

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

    if (disparador && !reducido) {
      var marcoOrigen = disparador.querySelector('.trabajo__marco');
      var marcoActual = visorPista.querySelectorAll('.visor__marco')[indiceActual];
      if (marcoOrigen && marcoActual) volarHacia(marcoActual, marcoOrigen.getBoundingClientRect());
    }

    visor.classList.remove('visor--visible');
    document.removeEventListener('keydown', alTeclado);
    salirPantallaCompleta();

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
      restablecerZoomFns = [];
      cerrando = false;
    };
    var alTerminarTransicion = function (e) {
      if (e.target === visor && e.propertyName === 'opacity') terminar();
    };
    visor.addEventListener('transitionend', alTerminarTransicion);
    setTimeout(terminar, 450);
  }

  function irA(delta) {
    var fotos = visorPista.querySelectorAll('.visor__foto');
    if (!fotos.length) return;
    // Circular, igual que las flechas de las tarjetas: de la última foto
    // «siguiente» vuelve a la primera, y de la primera «anterior» va a
    // la última — esa vuelta concreta salta sin animación, no desliza
    // hacia atrás por todas las fotos intermedias.
    var esVuelta = (delta > 0 && indiceActual >= fotos.length - 1) || (delta < 0 && indiceActual <= 0);
    indiceActual = (indiceActual + delta + fotos.length) % fotos.length;
    fotos[indiceActual].scrollIntoView({ block: 'nearest', inline: 'start', behavior: (reducido || esVuelta) ? 'auto' : 'smooth' });
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
  // (arrastre táctil, trackpad) en vez de usar las flechas — y de paso
  // se reinicia el zoom de todas las fotos: solo la que se está viendo
  // puede quedarse ampliada.
  var pendienteVisor = false;
  visorPista.addEventListener('scroll', function () {
    if (pendienteVisor) return;
    pendienteVisor = true;
    requestAnimationFrame(function () {
      var fotos = visorPista.querySelectorAll('.visor__foto');
      var paso = anchoPaso(visorPista, '.visor__foto') || 1;
      indiceActual = Math.max(0, Math.min(fotos.length - 1, Math.round(visorPista.scrollLeft / paso)));
      restablecerZoomFns.forEach(function (fn) { fn(); });
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
