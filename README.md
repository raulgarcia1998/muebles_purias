# Muebles Purias · web

Sitio estático de una sola página, más tres páginas legales. Sin build, sin
dependencias, sin framework: se sube tal cual a cualquier hosting.

```
index.html            aviso-legal.html    css/estilo.css     Recursos/            originales del cliente, intactos
                      cookies.html        css/fuentes.css    Recursos/optimizado/ derivados para web
                      privacidad.html     css/fuentes/       robots.txt · sitemap.xml
                                          js/main.js         vercel.json · .vercelignore
```

---

## Publicar

Copia todo al servidor. Un único requisito real:

> **El servidor debe responder a peticiones parciales (`Accept-Ranges: bytes`).**
> Sin eso el navegador no puede saltar a un instante del vídeo y la sección
> «Antes y después» no se puede recorrer con el scroll. Apache, nginx, Netlify,
> Vercel, GitHub Pages y cualquier hosting compartido normal lo hacen de serie.
> Si no lo hiciera, la web lo detecta sola y le devuelve al vídeo sus controles
> de reproducción: no se rompe nada, solo se pierde el efecto.

Para verlo en local no basta con abrir `index.html` haciendo doble clic: los
vídeos necesitan un servidor. Desde esta carpeta:

```
npx serve .          # o:  python -m http.server 8000
```

### En Vercel

No hay build: es un sitio estático. Al importar el repositorio, en *Framework
Preset* hay que dejar **Other**, y el resto en blanco. `vercel.json` ya fija:

- **Cabeceras de seguridad** en todo el sitio — `nosniff`, `Referrer-Policy`,
  `X-Frame-Options` y una `Permissions-Policy` que apaga cámara, micrófono y
  geolocalización, que esta web no usa.
- **Caducidad de la caché por tipo de archivo.** Las tipografías, un año
  (`immutable`: no cambian nunca). Las fotos y los vídeos, treinta días con
  revalidación en segundo plano — el plazo está pensado para que, cuando el
  cliente entregue sus fotos reales, no queden atascadas semanas en el
  navegador de nadie. El CSS y el JS, una hora.

`.vercelignore` deja fuera del despliegue los originales de `Recursos/` (17 MB
que el sitio no sirve). Siguen versionados en el repositorio: se excluyen del
servidor, no del archivo.

> No se ha puesto **Content-Security-Policy**. Ahora que la web no llama a
> ningún tercero, una CSP estricta sería trivial de escribir, pero el bloque
> JSON-LD del final de `index.html` es un `<script>` en línea y el trato que le
> dan los navegadores bajo `script-src` no es uniforme. Antes que arriesgar la
> ficha de Google por una cabecera, se deja anotado: si se añade, hay que
> comprobar el resultado en el *Rich Results Test*.

---

## Pendiente de que lo facilite el cliente

Ordenado por urgencia. Los cuatro primeros bloquean la publicación.

| Qué falta | Dónde se pone |
|---|---|
| **C.I.F. y datos registrales** | `aviso-legal.html` y `privacidad.html`, donde pone «Pendiente de facilitar» |
| **Revisión legal de los tres textos** | Los redacté describiendo el funcionamiento real de la web, pero debe validarlos un asesor. Cada página lleva un recuadro de aviso visible que hay que borrar al hacerlo. |
| **URLs de Instagram, Facebook y Google** | `index.html`, pie de página. Ahora son `<span class="pie__pendiente">` sin enlace. Sustituir por `<a href="URL">`. Preferí dejarlos sin enlazar antes que publicar enlaces rotos. |
| **URL de la tienda virtual** | Igual que las anteriores. |
| **Horario comercial** | No se ha inventado ninguno. Cuando lo dé, va en la sección «Pásate por la tienda» y en el `openingHours` del JSON-LD del final de `index.html`, que es lo que lee Google para la ficha del negocio. |
| **Foto de la tienda o del equipo** | Es la ausencia que más se nota: en una empresa que vende trato personal desde 1970, una cara y una fachada valen más que un render. Iría en «Pásate por la tienda». |
| **Captura del software 3D** | El proyecto 3D es el mayor argumento de venta del negocio y es la única sección que no tiene ninguna imagen. |
| **Fotos reales de «Trabajos realizados» (opcional)** | De las doce fotos de la galería, diez son generadas por IA — ver el aviso 2 más abajo. Sustituir cualquiera de ellas por fotografía real de un trabajo de Purias es tan simple como cambiar el `<picture>` de su `.carrusel__foto` en `index.html` y regenerar sus derivados con `Recursos/optimizado/` (mismo pipeline que el resto). |
| **Nombre y localidad de cada obra** | La galería describe cada trabajo por tipología y materiales, que es lo único verificable ahora mismo. |
| **Dominio definitivo** | Está puesto `https://www.mueblespurias.com/` en **cinco sitios**: la etiqueta canónica, `og:url`, `og:image`, el JSON-LD (todo en `index.html`), más `robots.txt` y `sitemap.xml`. Si el dominio es otro, hay que cambiarlo en los cinco. La URL de `og:image` **tiene que ser absoluta**: con una ruta relativa, el enlace se comparte por WhatsApp sin miniatura. |

### Dos avisos sobre el material entregado

1. **Los dos vídeos llevaban una marca de agua de IA** (la estrella de cuatro
   puntas, abajo a la derecha). Se ha eliminado por interpolación en las copias
   de `Recursos/optimizado/`. Los originales están intactos y sin tocar.
2. **De las doce fotos de la galería «Trabajos realizados», solo dos son
   fotografía real de un trabajo de Purias.** La cocina de roble y lama negra
   es una **fotografía de Unsplash** (autor: Kam Idris; su licencia permite el
   uso comercial sin atribución) y el vestidor es una foto real del cliente.
   Las otras diez —dos cocinas más, las tres de Salón, tres de las cuatro de
   Dormitorio y las dos de Baño— llevan la misma firma C2PA de Google
   Generative AI (`SynthID`) que el resto del material generado del sitio.
   Ninguna de las diez afirma ser un trabajo real de Purias, pero la sección
   se titula «Trabajos realizados» y eso sí es una afirmación sobre obra
   propia. Antes de publicar conviene decidirlo: sustituir las generadas por
   fotos reales, o cambiar el titular por algo como «Ambientes» o «Nuestro
   estilo», que no afirma autoría. Nota aparte: la segunda foto de Dormitorio
   es el vestidor —un vestidor, no un dormitorio—; se mantiene ahí a petición
   expresa después de señalar la disonancia.
3. **`gafas3d.jpg` (fondo de «Proyecto 3D») también es generada por IA.**
   Sus metadatos C2PA lo confirman: `claim_generator_info: Google C2PA Core
   Generator Library`, `digitalSourceType: trainedAlgorithmicMedia`, marca
   `SynthID` aplicada. A diferencia de la galería, esta sección **no afirma
   ser un trabajo de Purias** — ilustra el servicio de proyecto 3D en
   abstracto, así que el problema de autoría no se plantea aquí. Queda
   anotado por el mismo criterio de transparencia que los demás archivos.
4. **`cocinahistorica.jpg` (fondo de «Cincuenta y cinco años…») también lleva
   la misma firma C2PA de Google Generative AI.** Igual que `gafas3d.jpg`, no
   ilustra un trabajo propio: es una cocina de época que ambienta el titular
   sobre 1970, con el pie «así eran las cocinas de entonces» — que no afirma
   que sea una obra de Purias.

---

## Qué se hizo con el material

Los archivos de `Recursos/` **no se han modificado**. Todo lo derivado está en
`Recursos/optimizado/` y puede regenerarse.

Criterio: **la calidad manda sobre el peso.** Es material de escaparate de un
negocio que vende acabados; un vídeo con artefactos de compresión desmiente
justo lo que la página afirma. Todo se ha codificado en el tramo donde la
pérdida deja de verse, y se ha medido para no decirlo de oídas.

| Origen | Resultado | Peso | Fidelidad medida |
|---|---|---|---|
| `videococinadefinitivo.mp4` (2,4 MB) | `cocina-hero.mp4` — sin marca de agua, sin pista de audio, `faststart` | 2,7 MB | **SSIM 0,9956 · PSNR 46,6 dB** |
| `ANTESyDESPUES.mp4` (2,6 MB) | `antes-despues.mp4` — sin marca, **codificado para recorrerse a mano** (ver abajo) | 10,9 MB *(no se descarga hasta acercarse a la sección)* | **SSIM 0,9939 · PSNR 44,6 dB** |
| ídem | `antes-despues-480.mp4` — la misma pieza a 854×480 para pantallas estrechas | 5,4 MB | PSNR 42,1 dB |
| `kam-idris-…-unsplash.jpg` (3400×3000) | `cocina-roble-ancha-*` (2,2:1) y `cocina-roble-alta-*` (3:2), en `.webp` + `.jpg` de reserva | 90 KB – 878 KB | **SSIM 0,995** |
| `trabajo2/3.png` (4,7 MB) | `.webp` a 1408, 1000 y 640 px + `.jpg` de reserva | 380–480 KB cada uno | **SSIM 0,991–0,994** |
| `logo.png` | `logo-600.png` (opaco, favicon/JSON-LD), 754 px nativos | 49 KB | sin pérdida |
| ídem | `logo-marca.png` — mismo trazo con transparencia real, tinta en color hueso (ver abajo) | 27 KB | sin pérdida |
| `gafas3d.jpg` (6336×2688) | `proyecto-3d-{900,1400,2400}.webp` — fondo de la sección «Proyecto 3D» | 50–229 KB | q92 |
| `cocinahistorica.jpg` (4800×3584) | `historia-fondo-{900,1400,2400}.webp` — fondo a sangre de «Cincuenta y cinco años…» | 155–766 KB | q90 |
| 10 fotos generadas de la galería (~5500×3072 cada una) | `galeria-{categoría}-{n}-{800,1400,2200}.webp` + `.jpg` de reserva a 2200 — recorte centrado de 1,8:1 a 3:2 en el propio pipeline | 35–475 KB cada derivado | q88 |

Los vídeos van a **CRF 14 con preset `veryslow`**, por encima del bitrate del
propio original (2.293 kbps frente a 2.050): no se ha tirado información, solo
se ha vuelto a empaquetar. Un PSNR por encima de 40 dB se considera pérdida
invisible; estamos en 45–47.

> **El techo no es la compresión, es el material.** Los dos vídeos son
> **1280×720**. En un monitor de 1440 px la web los muestra a ~1400 px, y en una
> pantalla Retina el navegador los amplía al doble. Eso no lo arregla ningún
> bitrate. Si se quiere nitidez real en pantalla grande, hace falta el original
> en 1080p o 4K; con eso el mismo proceso da un salto visible. Las fotos tienen
> el mismo techo: son de 1408 px de ancho y no se amplían.

### La cocina de la galería lleva dos encuadres distintos

`kam-idris-vqMQN9zImG4-unsplash.jpg` es **casi cuadrada** (3400×3000, ratio
1,13) y la galería la muestra apaisada, así que hay que recortar. Se recorta
dos veces, una por forma de pantalla, y `<picture>` elige:

| | proporción | ventana | dónde |
|---|---|---|---|
| `cocina-roble-ancha-*` | **2,2:1** al 40 % de altura | conserva la lámpara completa con su riel, la vitrina, el olivo y la isla | monitores (> 900 px) |
| `cocina-roble-alta-*` | **3:2** centrado | entran también los taburetes verdes | móvil (≤ 900 px) |

En el encuadre ancho **se pierden los taburetes**: a 2,2:1 no caben la lámpara
y ellos a la vez, y la lámpara es la pieza fuerte de esa cocina. En móvil no
hace falta ese sacrificio porque manda el ancho, no el alto — y una tira de
2,2:1 en un teléfono quedaría en un hilo de 155 px.

> **El `aspect-ratio` del CSS y el recorte del archivo tienen que coincidir**,
> y cambian en el mismo punto (900 px). Si se toca uno sin el otro, la foto
> sale deformada.

`trabajo1_cocina.png` sigue en `Recursos/` intacto, pero ya no se usa: sus
derivados se han retirado de `optimizado/`.

### El vídeo de la reforma se codifica distinto, y no es opcional

Ese vídeo no se reproduce: se **recorre**. Cada píxel de scroll le pide al
navegador un instante nuevo, así que lo que importa no es solo cómo se ve, sino
**cuánto tarda en llegar a un punto cualquiera**. Con la codificación normal
tardaba 27 ms por salto: por encima de los 16 ms de un fotograma de pantalla, y
por eso se veía como un pase de fotos en vez de como movimiento.

Los tres ajustes que lo arreglan, medidos uno a uno:

| | peso | PSNR | latencia media |
|---|---|---|---|
| Codificación normal | 5,4 MB | 44,8 dB | **27,4 ms** ✗ |
| Solo acortar keyframes (sin `fastdecode`) | 9,5 MB | 44,6 dB | 19,6 ms ✗ |
| **Keyframes cada 3 + `-tune fastdecode` + `-bf 0` + `-refs 1`** | 10,9 MB | 44,6 dB | **9,4 ms** ✓ |
| La misma receta a 480p (móvil) | 5,4 MB | 42,1 dB | **4,8 ms** ✓ |

El factor decisivo resultó ser **`-tune fastdecode`**, no la cantidad de
keyframes: acortarlos solos apenas mejoraba. La calidad de imagen se mantiene
(44,6 frente a 44,8 dB: 0,2 dB, invisible). Lo que cuesta es peso, y ese peso
solo se descarga cuando el lector se acerca a la sección.

> Si alguna vez se reencoda este archivo, **hay que conservar `-tune fastdecode
> -bf 0 -refs 1 -g 3`**. Sin eso vuelven los tirones aunque la imagen se vea
> igual de bien.

Comandos usados: `ffmpeg` para vídeo y pósteres, `sharp` para las imágenes.
Si alguna vez se quiere fidelidad literal bit a bit en las fotos, basta cambiar
`quality: 100` por `nearLossless: true` en el script: sube a ~1,1 MB por imagen
para ganar 0,006 de SSIM, que es exactamente nada a ojo.

### El logotipo sobre fondo oscuro

`logo.png` no tiene transparencia: es tinta oscura sobre un blanco opaco. La
primera versión lo resolvía por CSS con `filter: invert(1) contrast(1.25)` y
`mix-blend-mode: screen` — funcionaba, pero necesitaba una placa opaca detrás
para garantizar el contraste, y esa placa se leía como una caja pegada encima
del vídeo.

Se sustituyó por un derivado generado con `sharp` a partir del mismo
`logo.png` (que no se toca): por cada píxel se calcula la luminancia y se
escribe un nuevo PNG con la tinta en color hueso (`--veta`) y alfa real —
transparente donde había blanco, opaco donde había tinta, con el degradado
intermedio de la propia antialiasing del original. El resultado,
`logo-marca.png`, flota directamente sobre el vídeo o el fondo oscuro sin
ninguna placa; el contraste lo da un `filter: drop-shadow(...)` en vez de un
fondo, el mismo lenguaje que el menú (ver «Sin placa» más abajo). El favicon,
el `apple-touch-icon` y el `logo` del JSON-LD siguen usando `logo-600.png`
(opaco), porque ahí sí hace falta un fondo sólido.

---

## Trabajos realizados · galería con carrusel y visor

Cocinas —la especialidad de la casa— ocupa su propia fila a ancho
completo; Salón, Dormitorio y Baño se reparten la fila siguiente en
proporción desigual (1,4 : 1,1 : 0,85). Cada hueco no es una foto suelta:
es su propio carrusel, que se desliza con el dedo, la rueda o el teclado,
con un título superpuesto a la foto (degradado oscuro solo en el tercio
inferior, para no competir con la imagen) y un contador «01 / 03» que
sigue el gesto real de deslizar. Pinchar cualquier foto la abre en un
**visor a pantalla completa** para recorrer esa misma categoría en
detalle, sin el recorte de la tarjeta —`object-fit: contain` en vez de
`cover`—, con flechas, teclado (`←` `→` `Esc`) y el mismo gesto de
deslizar.

Esta sección existió antes por separado, como «Espacios · explora por
categoría» entre Trabajos y «El antes y el después», con las mismas
cuatro categorías y casi las mismas fotos. Se fusionó aquí porque tener
dos secciones distintas enseñando lo mismo no aportaba nada — y de paso
desaparece la duplicidad que tenía esa versión: antes la cocina de roble
y el vestidor aparecían en dos sitios de la página (una vez en Trabajos,
otra en Espacios); ahora aparecen una sola vez cada uno.

### De dónde salen las fotos, y qué es cada una

Al llegar el material se comprobó con el mismo escaneo C2PA que ya se
aplica al resto del sitio. De las doce fotos, solo dos son fotografía
real de un trabajo de Purias —la cocina de roble y lama negra, y el
vestidor—; las otras diez llevan la misma firma C2PA de Google
Generative AI que el resto del material generado del sitio. El detalle
completo, con qué foto es cuál, está en el aviso 2 de
[Pendiente de que lo facilite el cliente](#pendiente-de-que-lo-facilite-el-cliente)
más arriba.

El recorte de origen va en el pipeline (`galeria-optimizar.js` en el
scratchpad, mismo patrón que el resto del sitio): las fuentes llegan en
~1,8:1 y el archivo se deja en 3:2, recortando el 17 % del ancho,
centrado, antes de escalar. La fila partida (Salón, Dormitorio, Baño)
muestra ese archivo 3:2 dentro de un marco 16:9 —un recorte adicional
del navegador, moderado—, y la fila de Cocinas lo muestra a 2,2:1: la
primera foto (la cocina de roble) ya trae su propio derivado ancho
dedicado (`cocina-roble-ancha-*`) sin recorte adicional; las otras dos
—generadas por IA— se recortan más en el navegador desde su archivo 3:2.
Se revisó a ojo tras montarlo: el plano queda centrado en la isla en
ambas, sin cortar nada importante.

### El primer intento se veía borroso: `sizes` no seguía al layout

La primera versión de esta fila reutilizó los derivados de la antigua
sección «Espacios», generados a 700/1050 px porque ahí vivían en una
tarjeta de ~512 px de ancho (`sizes="32rem"`). Al convertir Cocinas en
la fila principal a ancho completo (~1300 px, más del doble), ese
`sizes` se quedó desactualizado: el navegador seguía pidiendo el archivo
de 1050 px y lo estiraba para llenar una caja mucho más ancha — visible
a simple vista, y mucho peor en una pantalla Retina/HiDPI, que pide el
doble de píxeles de los que el archivo tenía. **El `sizes` de una imagen
tiene que describir su ancho real en el layout final, no el que tenía en
un diseño anterior.** Arreglado regenerando las diez fotos afectadas a
800/1400/2200 px (`galeria-optimizar.js`) y corrigiendo `sizes` en cada
`<picture>` para que coincida con el ancho real de su columna
(`90vw` la fila de Cocinas; `38vw`/`30vw`/`23vw` Salón/Dormitorio/Baño).

### El visor: mismo `<picture>`, sin duplicar ninguna URL

`js/galeria.js` no reconstruye las fotos desde cero: cuando se abre el
visor, **clona el `<picture>` que ya está en la tarjeta** que se pinchó
(`cloneNode(true)`) y lo mete en su propio carrusel de pantalla
completa. Ni una URL de imagen ni un texto de pie de foto viven
duplicados entre la tarjeta y el visor — si se cambia una foto en
`index.html`, el visor la sigue automáticamente.

Dos detalles de implementación, por la misma razón documentada más abajo
en «Decisiones que conviene no deshacer sin querer» sobre `scrollLeft` y
elementos ocultos:

- `construirVisor()` se llama **después** de quitar `hidden` del visor,
  nunca antes: solo con geometría real puede medirse el ancho de una
  foto y fijar el `scrollLeft` inicial de golpe, sin animación.
- Al cerrar, la tarjeta de origen se sincroniza con la última foto vista
  en el visor (por si el usuario deslizó dentro): se reasigna su
  `scrollLeft`, lo que dispara el mismo listener que ya actualiza su
  contador — no hace falta duplicar esa lógica.

El visor es progresivo, no obligatorio: sin JavaScript, los botones
`.carrusel__abrir` son botones normales sin comportamiento, y la galería
se sigue recorriendo entera con el scroll nativo de cada tarjeta.

### Mejora progresiva, no un componente que depende de JavaScript

El HTML base —sin JavaScript— ya es la galería completa: la fila de
Cocinas y la fila partida de abajo, cada categoría con su propio
carrusel de `scroll-snap` nativo que responde al dedo, la rueda o el
teclado sin una sola línea de script, y el total correcto ya escrito en
el contador («1 / 3», «1 / 4»…). `js/galeria.js` añade tres cosas sobre
esa base: las flechas de prev/siguiente, que el contador siga el gesto
real, y el visor a pantalla completa. Si el script no llega a cargar, la
sección sigue siendo una galería completa y usable.

Esta sección tuvo antes, en «Espacios», una versión con pestañas, pin
por scroll y una transición de elemento compartido vía GSAP (`Flip` +
`ScrollTrigger`). Al fusionarse aquí no hizo falta recuperar GSAP para
nada de esto: la web sigue en cero dependencias externas.

## La paleta

Ningún color está elegido de una carta: los seis salen de medir los colores
dominantes del vídeo y de las tres fotos. Se definen una sola vez, en `:root`.

| Variable | Hex | De dónde sale |
|---|---|---|
| `--noche` | `#1A1815` | El negro cálido de los armarios del vestidor. Nunca `#000`. |
| `--nogal` | `#2A2823` | El color dominante exacto del vídeo de la cocina (10 % de sus píxeles). |
| `--veta` | `#EDEAE4` | La veta blanca del mármol. Texto principal. |
| `--hormigon` | `#9C948A` | El suelo de hormigón. Texto secundario. |
| `--oliva` | `#5E6440` | El terciopelo de las butacas del salón. |
| `--roble` | `#8A6534` | El roble dorado de la cocina vieja del vídeo. Solo la barra de «antes». |

**El primer plan llevaba un acento de latón** —por el grifo y las tiras LED de
las fotos— y se cayó al mirar el vídeo: ahí la grifería es negra mate, la piedra
es mármol negro con veta blanca y la luz es LED lineal neutra. No hay un solo
dorado en la pieza que manda en la página. Poner latón habría sido decorar con
el tópico de «interiorismo de lujo» algo que el material desmiente. El único
color saturado que queda es el verde, que es el que de verdad se repite en todo
el material: las butacas del salón y las plantas y el jardín que entran por la
ventana en las cinco piezas.

## Decisiones que conviene no deshacer sin querer

- **El `clip-path` del revelado al desplazar (`.reveal`) va en los HIJOS del
  elemento, nunca en el elemento observado.** Es la trampa más fácil de caer
  al tocar esto: si `.reveal { clip-path: inset(0 0 100% 0) }` se pone
  directamente sobre el elemento que vigila el `IntersectionObserver`, Chrome
  calcula la intersección sobre la geometría ya clipada —una caja de 0 px de
  alto— y el observador nunca lo ve entrar en pantalla. Nunca se dispara,
  nunca se revela. Medido de forma aislada: mismo observador, mismo elemento,
  `intersectionRatio` pasa de 0 a 0,87 solo con quitarle el `clip-path` al
  propio objetivo. La regla real es `.reveal > * { clip-path: ... }`, y se
  observa el padre —su caja nunca se clipa, así que el disparador no depende
  de lo que dispara—. Por eso las filas de `.fichas` llevan el texto envuelto
  en `<span class="fichas__texto">` en vez de ir suelto: sin un elemento que
  envuelva cada parte, `.reveal > *` no tiene qué clipar.
- **`.reveal--lateral` es la única excepción al lenguaje de cortina**, y a
  propósito: las cuatro categorías de «Trabajos realizados» entran
  deslizándose (`opacity` + `translateX`, sin `clip-path`) en vez de bajo la
  cortina que usa el resto de `.reveal`. Mismo disparador (`.reveal`/
  `.es-visible`, el mismo `IntersectionObserver`) y el mismo `--curva`, pero
  declarado después de `.reveal > *` en la cascada para poder anular su
  `clip-path` con la misma especificidad. Cocinas —la primera, la fila
  principal— desliza desde la izquierda en 0,9 s, la misma duración que ya
  usa el título al cruzar el marco. Salón, Dormitorio y Baño —la fila
  partida— entran algo más despacio (1,2 s, vía `:nth-of-type`), y Baño, el
  último, lo hace desde la derecha en espejo (`.reveal--lateral-derecha`,
  que solo cambia el signo del `translateX`). Sigue reservado a la galería:
  si se generaliza a más secciones, deja de leerse como acento y pasa a ser
  el gesto por defecto, que es justo lo que la cortina evita en el resto de
  la web.
- **`scrollLeft` en un carrusel oculto no hace nada.** Asignar `scrollLeft`
  a un elemento cuyo ancestro tiene `display: none` (por ejemplo, vía
  `[hidden]`) se descarta en silencio: sin ese viewport de scroll, el
  navegador no tiene sobre qué aplicar la asignación. El visor de «Trabajos
  realizados» (`js/galeria.js`) construye su carrusel y fija el `scrollLeft`
  inicial **después** de quitar `hidden`, nunca antes — si se invierte el
  orden, el visor siempre abre en la primera foto de la categoría en vez de
  en la que se pinchó, sin ningún error visible que lo delate.
- **La vuelta circular del carrusel (de la última foto a la primera, y al
  revés) anima con un clon temporal, no con `scrollLeft` a pelo.** Se añade
  un clon puramente visual de la foto de destino al otro lado de la pista,
  se desliza hasta él como un paso normal y, al asentarse, se cambia al
  original real de un salto invisible. Dos trampas de navegador hicieron
  falta dos intentos:
  1. **`overflow-anchor` reajusta el scroll por su cuenta** al insertar
     contenido delante de la vista actual (para no descolocar al lector en
     un feed infinito) — compite con el salto en seco que compensa el
     hueco del clon y la animación no llega a arrancar. Se desactiva
     (`overflow-anchor: none`) mientras dura la maniobra.
  2. **El salto en seco dispara su propio `scrollend`.** Si el aviso de
     «ya se asentó» (`alAsentarScroll`, con `scrollend` y una red de
     seguridad por temporizador) se engancha antes de ese salto, se
     dispara con él en vez de esperar al deslizamiento de verdad, y la
     vuelta hacia atrás se resuelve en un parpadeo. Se engancha **después**
     del salto en seco, justo cuando arranca el `scrollTo` suave.
  Verificado grabando el `scrollLeft` fotograma a fotograma: sin el
  arreglo, la vuelta hacia adelante animaba pero la vuelta hacia atrás
  saltaba en un solo `requestAnimationFrame`.
- **El objetivo del `.reveal` tiene que ser un elemento de bloque, no en
  línea.** Segunda trampa del mismo mecanismo, distinta de la anterior: si
  `.reveal > *` recorta un `<span>` o un `<em>` en línea cuyo texto envuelve a
  más de una línea, Chrome fragmenta ese elemento en varias cajas —una por
  línea— y aplica el `clip-path` solo a la primera; el resto del texto
  desaparece del todo, incluso con `.es-visible` puesto (`inset(0 0 0 0)`, que
  debería significar «sin recorte»). Pasó en los dos párrafos de «Historia»
  la primera vez que se escribieron como `<span class="reveal">` sueltos
  dentro de un `<p>`: la segunda línea de cada frase se cortaba en seco. Todos
  los demás usos de `.reveal` en la web se libran de esto sin querer, porque
  recortan un elemento que ya es de bloque (`<div>`, `<figcaption>`, `<h3>`)
  o un hijo de `.fichas li` —que al ser `display: grid` convierte sus `<span>`
  en cajas de bloque aunque el HTML no lo diga—. En «Historia» hizo falta
  forzarlo a mano: `.relato__destacado.reveal > *` y `.historia__resto.reveal
  > *` llevan `display: block` explícito.
- **`--marco` y `--cruce` están atados.** El marco está metido hacia dentro
  precisamente para dejar hueco entre su línea y el borde de la pantalla: ese
  hueco es lo único que impide que se corten las primeras letras de los
  títulos al desbordar. Si se estrecha `--marco`, hay que estrechar `--cruce`
  en la misma medida. Comprobado de 390 a 1920 px: el título cruza entre 18 y
  38 px y nunca se sale de la pantalla.
- **El logotipo no es una caja encima de la página: es la esquina superior
  izquierda del marco.** Su borde exterior *es* el filete del marco y el
  interior lo cierra con el mismo trazo de 1 px. Si se le cambia la posición o
  se le pone un margen, deja de encajar y vuelve a parecer un banner pegado.
  El fondo es traslúcido con desenfoque para que la cocina siga viéndose por
  detrás.
- **El menú no lleva placa.** La tuvo al principio —compartía compartimento
  con el logotipo—, pero una lista de enlaces no necesita el mismo peso visual
  que la firma, y esa placa se leía como un rectángulo oscuro pegado sobre el
  vídeo. Ahora es texto suelto en la misma familia expandida del logotipo, con
  `text-shadow` en vez de fondo para seguir leyéndose pase lo que pase detrás.
- **Todas las entradas del menú van en hueso, no en gris.** Detrás corre el
  vídeo: un gris medio sin placa no garantiza contraste si en ese instante
  pasa un tramo claro. Lo que marca la sección actual es el filete
  de debajo, no el color. Medido sobre píxeles reales: 8,4:1.
- **El vídeo de la reforma se ve entero, sin recortar.** La sección es una
  rejilla de cuatro filas (título, vídeo, barra, pie) donde solo crece la del
  vídeo, así que todo el hueco sobrante se lo queda la imagen. El vídeo llena
  esa fila y es `object-fit: contain` quien encaja el fotograma dentro. **No
  se puede sustituir por `max-height: 100%` sobre el propio vídeo**: en un
  elemento reemplazado dentro de una rejilla ese porcentaje no limita nada y
  el vídeo se sale por debajo, encima de la barra de ANTES/DESPUÉS.
- **El póster del hero en móvil no se queda del todo quieto.** El vídeo no se
  descarga por debajo de 640 px (ver arriba), así que sin nada más el fondo
  sería una foto congelada. Se le da un «Ken Burns» muy lento —26 s por medio
  ciclo, `scale(1→1.09)` + `translate` mínimo, `alternate infinite`, solo
  `transform`— en vez de dejarlo inmóvil o descargar el vídeo igualmente.
  Vive dentro del propio `@media (max-width: 640px)`, así que en escritorio
  ni se declara. Respeta `prefers-reduced-motion` con su propia regla, no
  solo con el `animation-duration: 0.01ms` genérico: sin esa regla explícita
  el fondo se quedaría en un fotograma intermedio en vez de en el de reposo.
- **El progreso mostrado persigue al del scroll con una pequeña inercia, no
  salta directo a él.** Cada fotograma, `avanzar()` mueve `actual` un 16 % de
  la distancia que le falta hasta el punto que marca el scroll en ese
  instante; al soltar el gesto, el destino deja de moverse pero `actual`
  sigue cerrando la diferencia unos ~35 fotogramas (≈0,6 s) más, así que el
  vídeo desliza hasta pararse en vez de cortar en seco. El scroll sigue
  siendo quien manda —el destino no cambia—, solo cambia cómo se llega hasta
  él. `dibujar()` (la pintura sin inercia) queda solo para el primer
  fotograma y los redimensionados.
- **`loadedmetadata` y `canplay` van con `{ once: true }`, y no es un
  descuido.** `canplay` vuelve a dispararse después de cada salto de
  scrubbing —el navegador avisa cada vez que hay datos alrededor del nuevo
  punto—, y sin `once` cada aviso llamaba a `dibujar()`, que pinta de golpe:
  eso cortaba en seco la persecución con inercia de arriba a mitad de
  camino, cada vez que un salto terminaba. Verificado con un arrastre
  simulado: sin `once` el vídeo se quedaba clavado en el punto del scroll
  al instante; con `once`, sigue deslizando ~150 ms más tras soltar.
- **Los saltos del vídeo se encadenan, no se amontonan.** El guion mantiene un
  único salto en vuelo: cuando termina, va directo al último instante que haya
  dejado el scroll. Pedir instantes nuevos mientras el anterior se resuelve
  encola trabajo que el navegador acaba descartando, y eso se percibe como
  pasos en vez de movimiento.
- **La pista de scroll mide 260vh y no más.** El vídeo tiene 240 fotogramas:
  cuanto más larga sea la pista, más píxeles hay que desplazar para pasar de un
  fotograma al siguiente, y más se parece a un pase de fotos.
- **El título de esa sección va en una línea** (`br` oculto) porque así ocupa
  menos alto que en dos, y ese alto se lo queda el vídeo.
- **La voz técnica va toda en mayúsculas** (menú, `PURIAS · LORCA · MURCIA`,
  pies de foto, etiquetas, pie de página). Es la misma caja alta del logotipo,
  y mezclar mayúsculas y minúsculas en ese registro rompe la unidad.
- **Solo los títulos de sección se salen del marco.** Es la regla de composición
  de todo el sitio y viene del logotipo, donde el nombre atraviesa las dos
  verticales del rectángulo. Si algo más empieza a desbordar, deja de significar
  nada.
- **El velo de «Proyecto 3D» tiene una versión aparte para pantallas
  estrechas** (`max-width: 700px`), y no es redundante: en escritorio el
  texto vive en la mitad izquierda y el degradado horizontal deja ver la
  foto a la derecha; en móvil el texto ocupa el ancho completo y ese mismo
  degradado dejaría la cola de cada línea sobre la zona clara de la foto,
  por debajo de AA. Medido con el texto oculto para muestrear el fondo real
  (si se mide con el texto visible, un trazo de letra blanco puede leerse
  como si fuera el fondo): mínimo 4,98:1 en escritorio, 5,36:1 en pantalla
  ancha, 5,43:1 en móvil.
- **El verde oliva aparece una sola vez**, en el bloque de contacto. Es el único
  color saturado de la web y sale del terciopelo de las butacas de la foto del
  salón. Repetirlo lo mata.
- **La sección de servicios no lleva iconos** y no es un olvido.
- **No hay cursivas.** La cursiva de Newsreader pesa 129 KB para una frase.

## Rendimiento medido

| | Escritorio | Móvil |
|---|---|---|
| **Hasta que la página se ve entera** (texto, marco, póster, tipografías) | **1.070 KB** | **908 KB** |
| Vídeo del hero, que entra después en segundo plano | 2,7 MB | no se descarga |
| Vídeo de la reforma | solo al acercarse | solo al acercarse |
| Tipografías (desde el propio dominio) | 229 KB | 229 KB |

El vídeo del hero **no bloquea nada**: la página se pinta con el fotograma fijo
y el vídeo entra por encima cuando ha llegado (`faststart` hace que empiece a
reproducirse sin esperar al archivo completo). Quien tenga conexión lenta ve una
foto de la cocina, no una caja negra.

En móvil no se descarga el vídeo del hero en ningún caso. Y con el ahorro de
datos activado tampoco se descarga el de la reforma: se ve el póster y el vídeo
queda con su botón de play.

### Las tipografías van autoalojadas

Estaban en Google Fonts y ahora están en `css/fuentes/`, servidas desde el
propio dominio. **La web no hace ni una sola petición fuera de su dominio**, y
eso es antes que nada un asunto legal: pedir la fuente a `fonts.gstatic.com`
manda la IP del visitante a un tercero en cada visita. Ahora la página de
cookies puede decir la verdad más simple, que no sale nada.

De paso se ahorran dos conexiones nuevas —DNS, TLS y una hoja de estilos
intermedia— antes de que empiece a bajar la primera letra, y la versión del
dibujo de las letras queda congelada: Google publica revisiones y esta web ya
no se entera.

Se conserva el `unicode-range` original de cada archivo, así que el navegador
solo descarga el bloque **latin** (229 KB entre las tres familias). El
`latin-ext` está guardado por si algún día entra un texto que lo necesite; con
el castellano no llega a pedirse nunca, porque `á é í ó ú ñ ü ¿ ¡` están todas
dentro de latin. Las dos que se ven sin hacer scroll —el titular y el primer
párrafo— van además en `<link rel="preload">`.

**La palanca que queda**: recortar los archivos a los caracteres que de verdad
se usan (*subsetting* con `fonttools`). Bajaría esos 229 KB a la mitad larga,
pero obliga a rehacer el recorte cada vez que cambie un texto.

## Accesibilidad

Verificado con navegador real, no a ojo: todo el texto pasa el contraste AA
(la combinación más justa va a 4,55:1), los elementos enfocables tienen
indicador de foco visible (37 en la carga inicial, contando cada foto de
la galería y el visor a pantalla completa), hay enlace para saltar al
contenido, y con
`prefers-reduced-motion` no se mueve absolutamente nada —el marco aparece ya
dibujado, el vídeo del hero ni se descarga y la reforma pasa a tener controles
normales.

### Objetivos táctiles

Medidos con navegador real en 390 px: el teléfono flotante, los enlaces del
pie y los de «Visítanos» tenían entre **17 y 19 px** de alto real — la caja de
toque era solo el alto de la línea de texto, muy por debajo del mínimo cómodo
(44 px). Irónico en el caso del teléfono, que es el CTA que más se pulsa.

Arreglado con la misma técnica en los tres sitios: `padding` vertical +
`margin` negativo de igual medida. El texto no se mueve ni un píxel de su
sitio —el `margin` negativo compensa exactamente lo que añade el
`padding`— pero la caja que responde al toque crece hasta comerse el hueco
en blanco de alrededor. Medido después: **46–48 px** en los tres casos.

> Si se toca el espaciado de `.pie__columna li` o `.visita__datos`, hay que
> revisar que el `margin` negativo del enlace no se coma más aire del que
> hay disponible entre elementos, o dos cajas de toque contiguas se
> solaparían.

El menú de cabecera pasó de 25 a 33 px con el mismo truco, pero solo por
arriba: por abajo mantiene el `padding-bottom` original porque de él cuelga
el filete que marca la sección activa, y moverlo habría separado la línea
del texto.

### «Historia» pasó de bloque de texto a remate fotográfico

Primera versión: `#historia` era el peor caso de lectura en móvil, 818 px
seguidos de prosa sobre fondo negro. Se corrigió insertando `cocinahistorica.jpg`
a media lectura y moviendo la prosa suelta a la lista `.fichas` que ya existía
en «Proyecto 3D». Esa versión quedó obsoleta con el rediseño posterior:

- **La sección se trasladó al final del recorrido**, justo antes de «Pásate
  por la tienda»: el resto emocional («como en 1970») empuja directamente a
  la llamada a la acción, en vez de gastarse nada más salir del hero.
- **La foto dejó de ser un elemento dentro de la columna de texto y pasó a
  ser el fondo de toda la sección**, con el mismo patrón de capas que el hero
  y «Proyecto 3D» (imagen a sangre + velo degradado), más dos capas propias:
  un filtro de color sobre la propia foto (`sepia() saturate() contrast()
  brightness()`) para el aspecto de fotografía antigua, y un grano de
  película hecho con una `feTurbulence` de SVG en línea — sin petición de red
  ni archivo aparte, y reversible con solo quitar el filtro; el archivo del
  cliente no se retoca.
- **La lista `.fichas` (productos de calidad, asesoramiento, trato de
  siempre) se reubicó** en una sección nueva, «Por qué elegirnos», justo
  después del hero — mismo componente que ya usaba «Proyecto 3D», solo
  cambia dónde vive, ahora como tarjeta de presentación antes de enseñar el
  trabajo.
- **Los dos párrafos que quedan en «Historia» se revelan por separado, en
  cascada**, sobre la foto: primero la frase de 1970, 160 ms después el
  resto. Aquí apareció una variante del bug de `.reveal` documentado más
  abajo — ver «El objetivo del `.reveal` tiene que ser un bloque».

Servicios recibió un ajuste menor: cada fila gana relleno lateral y un tinte
casi imperceptible (`color-mix` al 3 % sobre `--veta`) para leerse como
tarjeta en vez de solo texto con una línea debajo. Es el mismo lenguaje
traslúcido que ya usa la placa del logotipo, no un color nuevo. Medido: el
texto secundario sigue en 5,56:1 sobre el fondo compuesto, por encima del
4,5:1 exigido.
