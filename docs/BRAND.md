# JIADI learning mark

The original mark combines a page with a folded corner and a J-shaped reading path. It continues the site's cream (`#f6f2e8`) and deep green (`#17483d`) palette. The geometry is defined once in `scripts/generate-brand.py`; running `python scripts/generate-brand.py` writes the editable SVG variants and raster icons to `content/brand/`.

| Asset | Use |
| --- | --- |
| `logo.svg` | cream badge with green mark; favicon and general use on either theme |
| `logo-light.svg` | transparent green mark for light backgrounds |
| `logo-dark.svg` | transparent cream mark for dark backgrounds |
| `logo-mono.svg` | single-color green vector for print or recoloring |
| `icon-192.png`, `icon-512.png` | PWA icons |
| `icon-maskable-512.png` | padded maskable PWA icon |
| `apple-touch-icon.png` | 180-pixel Apple touch icon |

The generator rasterizes its own vector coordinates with Pillow at 4× resolution and downsamples with Lanczos. The maskable variant scales the foreground to 75% around the same center. Generation asserts every non-background pixel remains in the central 80%-diameter safe circle. Visual checks at 16 and 32 pixels kept the J and page contour legible; small-size previews are not shipped as assets. The platform build copies these assets under `/assets/brand/` and preserves `/assets/favicon.svg` as a compatibility alias to `logo.svg`.
