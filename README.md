# Arturo — Sala

Portfolio de dirección de arte y concepto. Web estática, sin dependencias ni proceso de compilación: GitHub Pages publica tal cual la raíz del repositorio en **https://arturovicav-debug.github.io/**.

## Estructura

```
index.html           maquetación, estilos base y navegación (todo se pinta desde data.js);
                     en <head>, los metadatos para buscadores y para la vista previa al compartir
data.js              todos los textos, proyectos, imágenes, colores, correo y LinkedIn
css/intro.css        intro de arranque, entrada de la portada y proyector
css/motion.css       animaciones y transiciones del resto del sitio
js/intro-gate.js     decide antes del primer pintado si se muestra la intro (portada, una vez por sesión)
js/intro.js          intro de arranque, entrada de la portada y proyector
js/motion.js         animaciones al navegar y al desplazarse
img/                 cada imagen en dos tamaños: -720.webp y -1440.webp
og-image.jpg         imagen de la vista previa al compartir en LinkedIn, WhatsApp, Slack… (1200 × 630)
favicon.svg          icono de pestaña
apple-touch-icon.png icono al guardar la web en la pantalla de inicio (180 × 180)
site.webmanifest     nombre, colores e iconos de la web
404.html             página «Fuera de plano» para direcciones que no existen
robots.txt           permite indexar todo y apunta al sitemap
sitemap.xml          la única URL del sitio (las secciones #trabajo, #aisu… no son páginas aparte)
.nojekyll            hace que GitHub Pages publique los archivos sin procesarlos
```

Rutas: `#trabajo`, `#sobre-mi`, `#contacto` y una por proyecto (`#aisu`, `#la-garita`, `#gaviota`, `#eggs`, `#verde`, `#miso`).

Sin JavaScript (o para buscadores que no lo ejecutan) se muestra un resumen estático: el bloque `<noscript>` al principio del `<body>` de `index.html`.

## Cambiar un texto

Abre `data.js`, busca la frase y cámbiala solo dentro de las comillas. Guarda y haz commit: GitHub Pages publica el cambio en uno o dos minutos.

## Cambiar el correo o el LinkedIn

1. En `data.js`, dentro de `site`: `email`, `linkedin` y la entrada de `socials`.
2. En `index.html` hay copias fijas que leen LinkedIn, Google y quien navega sin JavaScript. Busca `linkedin.com` y `arturo.vic.av@gmail.com` y cámbialas también en:
   - el bloque `<script type="application/ld+json">` del `<head>` (`email` y `sameAs`);
   - el bloque `<noscript>`;
   - los enlaces `data-linkedin` de cabecera, menú y pie (el JavaScript ya los sobrescribe con el valor de `data.js`, pero conviene que coincidan).

## Añadir un proyecto

1. Sube sus imágenes a `img/` en 720 y 1440 px de ancho, en `.webp`, con el mismo nombre base: `nuevo-01-720.webp` y `nuevo-01-1440.webp`.
2. En `data.js`:
   - en `images`, una entrada por imagen con `alt` (descripción para lectores de pantalla), `cap` (pie de foto) y `pos` (punto de encuadre, p. ej. `"50% 40%"`);
   - en `img`, una entrada por imagen con `w` y `h` (tamaño original, para la proporción), `bg` (color de fondo mientras carga) y `edge` (color de relleno cuando la imagen no ocupa todo el marco, normalmente el de su borde);
   - en `projects`, un objeto nuevo copiando uno existente y cambiando `slug` (será su ruta, `#nuevo`), `num`, `title`, `kind`, `year`, `cover` (imagen de portada), `color` (`ground` = fondo, `ink` = tinta) y sus `blocks`.
3. Los contadores («01/07», «7 proyectos») y el rango de años se calculan solos.
4. En `index.html`: añádelo a la lista del `<noscript>` y cambia «Seis proyectos» en las descripciones del `<head>` (`description`, `og:description`, `twitter:description`). Si quieres que salga en la vista previa, rehaz `og-image.jpg`.

## Vista previa al compartir

Los metadatos Open Graph y Twitter están en el `<head>` de `index.html`. LinkedIn necesita la imagen como **URL absoluta** en JPG o PNG (no WebP) y de al menos 1200 × 627 px: por eso `og-image.jpg` vive en la raíz y se enlaza como `https://arturovicav-debug.github.io/og-image.jpg`.

Para cambiar la imagen, sustituye `og-image.jpg` por otra de 1200 × 630 px, en JPG y de menos de 300 KB, con el mismo nombre.

Si algún día la web cambia de dirección (dominio propio u otro repositorio), busca `arturovicav-debug.github.io` y actualízala en `index.html` (canonical, `og:url`, `og:image`, `twitter:image`, JSON-LD), `robots.txt` y `sitemap.xml`.

## Después de publicar

1. Comprueba la vista previa en **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/ — pega `https://arturovicav-debug.github.io/` y pulsa *Inspect*. Además de mostrar cómo se verá la tarjeta, obliga a LinkedIn a releer la página: repítelo cada vez que cambies el título, la descripción o `og-image.jpg`, porque LinkedIn guarda la vista previa en caché durante días.
2. Opcional: en Google Search Console, añade la propiedad `https://arturovicav-debug.github.io/` y envía `sitemap.xml`.
