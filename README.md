# jossigizq.github.io

Sitio web personal de **José María Sigüenza Izquierdo** (Ingeniero de Computadores), alojado en GitHub Pages.

🔗 **https://jossigizq.github.io**

## Páginas

- **`index.html`** — Portada. Tarjeta de presentación con avatar, rol, descarga del CV y enlaces (GitHub, LinkedIn, email y biblioteca).
- **`libros.html`** — Biblioteca. Mosaico de los libros leídos, con género, autor, valoración y notas. Incluye colecciones (sagas y bibliotecas editoriales) y **baraja las tarjetas en cada carga** manteniendo una composición asimétrica.
- Maquetas alternativas: `portfolio.html`, `landing.html`, `index_linktree.html` (variantes de diseño).

## Características

- **100 % estático**: HTML + CSS + JavaScript *vanilla*, sin proceso de *build* ni dependencias propias (las tipografías se cargan desde Google Fonts por CDN). Se publica en GitHub Pages tal cual.
- **Modo oscuro / claro**: botón en ambas páginas, con el **oscuro por defecto** (también sin JavaScript). Recuerda tu elección en `localStorage` y es coherente entre páginas, sin parpadeo al cargar.
- **Diseño responsive** con paleta cálida y tipografías *Fraunces* (titulares) + *Inter* (texto).
- **Biblioteca tipo mosaico**: cuadrícula con tarjetas de distintos anchos y altos que se reordena de forma aleatoria en cada visita evitando que se repitan tamaños contiguos.

## Desarrollo local

No requiere *build*. Puedes abrir los `.html` directamente, o servir la carpeta para que los assets y rutas relativas funcionen igual que en producción:

```bash
python -m http.server 8090
# y abrir http://127.0.0.1:8090/index.html
```

> El repositorio incluye `.claude/launch.json` con esta configuración de servidor local.

## Estructura del repositorio

| Recurso | Descripción |
| --- | --- |
| `index.html`, `libros.html`, `portfolio.html`, `landing.html`, `index_linktree.html` | Páginas del sitio |
| `index_style.css` | Estilos de la versión *linktree* |
| `avatar-*.svg`, `avatar.jpg` | Variantes de avatar |
| `favicon.*`, `apple-touch-icon.png`, `icon-*.png`, `site.webmanifest` | Iconos y manifiesto web |
| `cv_jossigizq.pdf` | CV descargable |

## Despliegue

Publicado automáticamente con **GitHub Pages** desde la rama por defecto: cada *push* actualiza https://jossigizq.github.io.

## Licencia

[MIT](LICENSE) © 2026 jossigizq
