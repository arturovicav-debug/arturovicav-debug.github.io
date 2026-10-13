# Arturo — Sala

Portfolio de dirección de arte y concepto. Web estática, sin dependencias ni proceso de compilación: se publica tal cual con GitHub Pages.

## Estructura

```
index.html    maquetación, estilos y navegación
data.js       todos los textos, proyectos, imágenes y colores
img/          cada imagen en dos tamaños (-720.webp y -1440.webp)
video/        vídeos de proyecto (.mp4) y su póster (.webp)
favicon.svg
```

## Cambiar un texto

Abre `data.js`, busca la frase y cámbiala solo dentro de las comillas. Guarda y haz commit: GitHub Pages publica el cambio en uno o dos minutos.

## Añadir un proyecto

1. Sube sus imágenes a `img/` en 720 y 1440 px de ancho (`.webp`).
2. En `data.js`, añade cada imagen a `images` y a `img`, y un objeto nuevo a `projects` con la misma forma que los existentes. La imagen indicada en `cover` es la portada.

## Añadir un vídeo a un proyecto

1. Copia el vídeo a `video/` en `.mp4` (H.264) y un póster `.webp` con el mismo nombre (el fotograma que se ve antes de cargar).
2. En `data.js`, añádelo a `videos` (título, pie, ancho, alto y duración) y pon un bloque `{ "t": "video", "v": "nombre", "size": "bleed" }` (o `"full"`) en los `blocks` del proyecto.

Los vídeos se reproducen en bucle y sin sonido al entrar en pantalla y se pausan al salir; cada uno tiene botones de sonido y pausa.

## Vista previa al compartir el enlace

`og-image.jpg` (1200×630) es la tarjeta que muestran LinkedIn, WhatsApp o X al pegar el enlace; las etiquetas `og:` y `twitter:` del `<head>` de `index.html` la apuntan con su URL completa. Si cambias la imagen o los textos, pega el enlace en [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) para que LinkedIn deje de usar la versión que tiene guardada.

Rutas: `#trabajo`, `#sobre-mi`, `#contacto` y una por proyecto (`#aisu`, `#la-garita`, `#gaviota`, `#eggs`, `#verde`, `#miso`).
