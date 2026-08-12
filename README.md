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
| **Nombre y localidad de cada obra** | La galería describe cada trabajo por tipología y materiales, que es lo único verificable ahora mismo. |
| **Dominio definitivo** | Está puesto `https://www.mueblespurias.com/` en **cinco sitios**: la etiqueta canónica, `og:url`, `og:image`, el JSON-LD (todo en `index.html`), más `robots.txt` y `sitemap.xml`. Si el dominio es otro, hay que cambiarlo en los cinco. La URL de `og:image` **tiene que ser absoluta**: con una ruta relativa, el enlace se comparte por WhatsApp sin miniatura. |

### Dos avisos sobre el material entregado

1. **Los dos vídeos llevaban una marca de agua de IA** (la estrella de cuatro
   puntas, abajo a la derecha). Se ha eliminado por interpolación en las copias
   de `Recursos/optimizado/`. Los originales están intactos y sin tocar.
2. **Nada de lo que hay en la galería es obra propia fotografiada.** Las dos
   imágenes del salón y el vestidor y los dos vídeos son material generado; la
   cocina es una **fotografía de Unsplash** (autor: Kam Idris). La licencia de
   Unsplash permite el uso comercial sin atribución, así que legalmente no hay
   problema, pero están bajo un titular que dice «Trabajos realizados» y eso es
   una afirmación sobre obra propia. Antes de publicar conviene decidirlo:
   sustituir por fotos reales de Purias, o cambiar el titular por algo como
   «Ambientes» o «Nuestro estilo», que no afirma autoría.
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
| `logo.png` | `logo-600.png`, 754 px nativos | 49 KB | sin pérdida |
| `gafas3d.jpg` (6336×2688) | `proyecto-3d-{900,1400,2400}.webp` — fondo de la sección «Proyecto 3D» | 50–229 KB | q92 |
| `cocinahistorica.jpg` (4800×3584) | `historia-fondo-{900,1400,2400}.webp` — fondo a sangre de «Cincuenta y cinco años…» | 155–766 KB | q90 |

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

`logo.png` no tiene transparencia: es tinta negra sobre un blanco opaco. Sobre
el fondo oscuro se resuelve por CSS con `filter: invert(1) contrast(1.25)` y
`mix-blend-mode: screen`, sin retocar ni redibujar el archivo del cliente. El
contraste extra lleva el blanco invertido a negro puro; sin él quedaría un
rectángulo fantasma alrededor del logotipo.

---

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
  propósito: las tres fotos de «Trabajos realizados» entran deslizándose
  (`opacity` + `translateX`, sin `clip-path`) en vez de bajo la cortina que
  usa el resto de `.reveal`. Mismo disparador (`.reveal`/`.es-visible`, el
  mismo `IntersectionObserver`) y el mismo `--curva`, pero declarado después
  de `.reveal > *` en la cascada para poder anular su `clip-path` con la
  misma especificidad. La cocina —la primera— desliza desde la izquierda en
  0,9 s, la misma duración que ya usa el título al cruzar el marco. El salón
  y el vestidor entran uno hacia el otro —izquierda y derecha, en espejo,
  vía `.reveal--lateral-derecha`, que solo cambia el signo del
  `translateX`— y algo más despacio (1,2 s): es el segundo movimiento de la
  galería, no el primero, y puede permitirse un recorrido más largo. Sigue
  reservado a la galería: si se generaliza a más secciones, deja de leerse
  como acento y pasa a ser el gesto por defecto, que es justo lo que la
  cortina evita en el resto de la web.
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
- **El teléfono que rompe el filete inferior** no es un adorno: en el logotipo,
  los guiones se abren para dejar sitio al número. La web repite ese gesto.
- **`--marco` y `--cruce` están atados.** El marco está metido hacia dentro
  precisamente para dejar hueco entre su línea y el borde de la pantalla: ese
  hueco es lo único que impide que se corten las primeras letras de los
  títulos al desbordar. Si se estrecha `--marco`, hay que estrechar `--cruce`
  en la misma medida. Comprobado de 390 a 1920 px: el título cruza entre 18 y
  38 px y nunca se sale de la pantalla.
- **El logotipo y el menú no son dos cajas encima de la página: son las dos
  esquinas superiores del marco.** Sus bordes exteriores *son* los filetes del
  marco y los interiores los cierran con el mismo trazo de 1 px. Si se les
  cambia la posición o se les pone un margen, dejan de encajar y vuelven a
  parecer banners pegados. El fondo es traslúcido con desenfoque para que la
  cocina siga viéndose por detrás.
- **Todas las entradas del menú van en hueso, no en gris.** Detrás corre el
  vídeo: un gris medio sobre fondo traslúcido no garantiza contraste si en ese
  instante pasa un reflejo claro. Lo que marca la sección actual es el filete
  de debajo, no el color. Medido sobre píxeles reales: 8,4:1.
- **El vídeo de la reforma se ve entero, sin recortar.** La sección es una
  rejilla de cuatro filas (título, vídeo, barra, pie) donde solo crece la del
  vídeo, así que todo el hueco sobrante se lo queda la imagen. El vídeo llena
  esa fila y es `object-fit: contain` quien encaja el fotograma dentro. **No
  se puede sustituir por `max-height: 100%` sobre el propio vídeo**: en un
  elemento reemplazado dentro de una rejilla ese porcentaje no limita nada y
  el vídeo se sale por debajo, encima de la barra de ANTES/DESPUÉS.
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
(la combinación más justa va a 4,55:1), los 18 elementos enfocables tienen
indicador de foco visible, hay enlace para saltar al contenido, y con
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
traslúcido que ya usan las placas del menú, no un color nuevo. Medido: el
texto secundario sigue en 5,56:1 sobre el fondo compuesto, por encima del
4,5:1 exigido.
