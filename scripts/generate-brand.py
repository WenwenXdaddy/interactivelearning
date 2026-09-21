"""Generate the JIADI page/path mark from one 64-unit geometry definition.

Requires Pillow. Run: python scripts/generate-brand.py
"""
from pathlib import Path
from math import hypot
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parents[1] / "content" / "brand"
GREEN = "#17483d"
CREAM = "#f6f2e8"

# One coordinate system drives the editable vector and all raster sizes.
PATHS = [
    ("page", 2.7, [
        ("M", 17, 7), ("L", 39, 7), ("L", 50, 18), ("L", 50, 52),
        ("C", 50, 55, 48, 57, 45, 57), ("L", 17, 57),
        ("C", 14, 57, 12, 55, 12, 52), ("L", 12, 12),
        ("C", 12, 9, 14, 7, 17, 7),
    ]),
    ("fold", 2.7, [
        ("M", 39, 7), ("L", 39, 16), ("C", 39, 17.5, 40.5, 19, 42, 19),
        ("L", 50, 19),
    ]),
    ("J", 5.5, [
        ("M", 22, 27), ("L", 39, 27), ("L", 39, 40),
        ("C", 39, 47, 35, 51, 29, 51),
        ("C", 24, 51, 21, 48, 20, 44),
    ]),
]


def svg_path(commands):
    parts = []
    for command in commands:
        parts.append(command[0] + " " + " ".join(str(n) for n in command[1:]))
    return " ".join(parts)


def svg(*, badge, ink, ground=None):
    field = f'<rect width="64" height="64" rx="13" fill="{ground}"/>' if badge else ""
    strokes = "".join(
        f'<path id="{name}" d="{svg_path(commands)}" fill="none" stroke="{ink}" '
        f'stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round"/>'
        for name, width, commands in PATHS
    )
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" '
            f'role="img" aria-labelledby="brand-title">'
            f'<title id="brand-title">JIADI 学习 · J 与书页路径</title>{field}{strokes}</svg>\n')


def points(commands):
    out = []
    cursor = None
    for cmd in commands:
        if cmd[0] == "M":
            cursor = (cmd[1], cmd[2]); out.append(cursor)
        elif cmd[0] == "L":
            cursor = (cmd[1], cmd[2]); out.append(cursor)
        elif cmd[0] == "C":
            start = cursor
            p1, p2, end = (cmd[1], cmd[2]), (cmd[3], cmd[4]), (cmd[5], cmd[6])
            length = sum(hypot(b[0]-a[0], b[1]-a[1]) for a, b in [(start,p1),(p1,p2),(p2,end)])
            for i in range(1, max(5, int(length * 2)) + 1):
                t = i / max(5, int(length * 2)); u = 1 - t
                out.append((u**3*start[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t**3*end[0],
                            u**3*start[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t**3*end[1]))
            cursor = end
    return out


def png(path, size, safe=False):
    scale = size * 4 / 64
    image = Image.new("RGBA", (size * 4, size * 4), CREAM)
    draw = ImageDraw.Draw(image)
    for _, width, commands in PATHS:
        shrink = .75 if safe else 1
        ps = [(round((32 + (x - 32) * shrink) * scale),
               round((32 + (y - 32) * shrink) * scale)) for x, y in points(commands)]
        stroke = round(width * shrink * scale)
        draw.line(ps, fill=GREEN, width=stroke, joint="curve")
        radius = stroke / 2
        for x, y in (ps[0], ps[-1]):
            draw.ellipse((round(x-radius), round(y-radius), round(x+radius), round(y+radius)), fill=GREEN)
    result = image.resize((size, size), Image.Resampling.LANCZOS).convert("RGB")
    if safe:
        background = Image.new("RGB", (1, 1), CREAM).getpixel((0, 0))
        for y in range(size):
            for x in range(size):
                if result.getpixel((x, y)) != background:
                    assert hypot(x - (size - 1) / 2, y - (size - 1) / 2) <= size * .4, (
                        "Maskable foreground exceeds the central safe circle")
    result.save(path, optimize=True)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "logo.svg").write_text(svg(badge=True, ink=GREEN, ground=CREAM), encoding="utf-8")
    (OUT / "logo-light.svg").write_text(svg(badge=False, ink=GREEN), encoding="utf-8")
    (OUT / "logo-dark.svg").write_text(svg(badge=False, ink=CREAM), encoding="utf-8")
    (OUT / "logo-mono.svg").write_text(svg(badge=False, ink=GREEN), encoding="utf-8")
    for name, size in [("icon-192.png", 192), ("icon-512.png", 512),
                       ("icon-maskable-512.png", 512), ("apple-touch-icon.png", 180)]:
        png(OUT / name, size, safe=name.startswith("icon-maskable"))


if __name__ == "__main__":
    main()
