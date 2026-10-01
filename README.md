# Arturo — Sala

Portfolio de dirección de arte y concepto. Web estática, sin dependencias ni proceso de compilación: se publica tal cual con GitHub Pages.

## Estructura

```
index.html    maquetación, estilos y navegación
data.js       todos los textos, proyectos, imágenes y colores
img/          cada imagen en dos tamaños (-720.webp y -1440.webp)
favicon.svg
```

## Cambiar un texto

Abre `data.js`, busca la frase y cámbiala solo dentro de las comillas. Guarda y haz commit: GitHub Pages publica el cambio en uno o dos minutos.

## Añadir un proyecto

1. Sube sus imágenes a `img/` en 720 y 1440 px de ancho (`.webp`).
2. En `data.js`, añade cada imagen a `images` y a `img`, y un objeto nuevo a `projects` con la misma forma que los existentes. La imagen indicada en `cover` es la portada.

Rutas: `#trabajo`, `#sobre-mi`, `#contacto` y una por proyecto (`#aisu`, `#la-garita`, `#gaviota`, `#eggs`, `#verde`, `#miso`).
