#!/usr/bin/env python3
"""Build the integration's brand icons (custom_components/map_overlay_button/brand/).

A map pin with a round button in the bottom-left corner, drawn with plain
Python (no image libraries), in two colour sets:

    icon.png / icon@2x.png            light theme
    dark_icon.png / dark_icon@2x.png  dark theme

    python tools/build_brand.py
"""
import math
import pathlib
import struct
import zlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "custom_components" / "map_overlay_button" / "brand"

SIZE = 512  # @2x; the 1x icon is this halved
SAMPLES = 3  # per axis, for anti-aliasing

COLOURS = {
    "light": {"pin": (3, 169, 244), "button": (38, 50, 56), "cross": (255, 255, 255)},
    "dark": {"pin": (41, 182, 246), "button": (236, 239, 241), "cross": (38, 50, 56)},
}

PIN_CENTRE, PIN_RADIUS, PIN_HOLE = (318, 196), 132, 54
PIN_TIP = (318, 478)
BUTTON_CENTRE, BUTTON_RADIUS, BUTTON_RING = (128, 384), 96, 14
CROSS_HALF, CROSS_WIDTH = 34, 18


def _pin_triangle():
    # The two points where lines from the tip touch the pin's circle.
    cx, cy = PIN_CENTRE
    tx, ty = PIN_TIP
    d = math.hypot(tx - cx, ty - cy)
    angle = math.acos(PIN_RADIUS / d)
    base = math.atan2(ty - cy, tx - cx)
    return [
        (cx + PIN_RADIUS * math.cos(base + angle), cy + PIN_RADIUS * math.sin(base + angle)),
        (cx + PIN_RADIUS * math.cos(base - angle), cy + PIN_RADIUS * math.sin(base - angle)),
        PIN_TIP,
    ]


TRIANGLE = _pin_triangle()


def _in_triangle(x, y):
    (x1, y1), (x2, y2), (x3, y3) = TRIANGLE
    d1 = (x - x2) * (y1 - y2) - (x1 - x2) * (y - y2)
    d2 = (x - x3) * (y2 - y3) - (x2 - x3) * (y - y3)
    d3 = (x - x1) * (y3 - y1) - (x3 - x1) * (y - y1)
    return not ((d1 < 0 or d2 < 0 or d3 < 0) and (d1 > 0 or d2 > 0 or d3 > 0))


def _segment_distance(px, py, ax, ay, bx, by):
    dx, dy = bx - ax, by - ay
    t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - (ax + t * dx), py - (ay + t * dy))


def _colour_at(x, y, colours):
    """RGBA of the drawing at one point; the button sits on top of the pin."""
    bx, by = BUTTON_CENTRE
    button_d = math.hypot(x - bx, y - by)
    if button_d <= BUTTON_RADIUS:
        h = CROSS_HALF
        if (
            _segment_distance(x, y, bx - h, by - h, bx + h, by + h) <= CROSS_WIDTH / 2
            or _segment_distance(x, y, bx - h, by + h, bx + h, by - h) <= CROSS_WIDTH / 2
        ):
            return colours["cross"] + (255,)
        return colours["button"] + (255,)
    if button_d <= BUTTON_RADIUS + BUTTON_RING:
        return (0, 0, 0, 0)  # a transparent gap between button and pin
    cx, cy = PIN_CENTRE
    pin_d = math.hypot(x - cx, y - cy)
    if pin_d <= PIN_HOLE:
        return (0, 0, 0, 0)
    if pin_d <= PIN_RADIUS or _in_triangle(x, y):
        return colours["pin"] + (255,)
    return (0, 0, 0, 0)


def render(colours):
    """Premultiplied RGBA rows at SIZE x SIZE."""
    rows = []
    step = 1 / SAMPLES
    n = SAMPLES * SAMPLES
    for py in range(SIZE):
        row = []
        for px in range(SIZE):
            r = g = b = a = 0
            for sy in range(SAMPLES):
                for sx in range(SAMPLES):
                    cr, cg, cb, ca = _colour_at(px + (sx + 0.5) * step, py + (sy + 0.5) * step, colours)
                    r += cr * ca
                    g += cg * ca
                    b += cb * ca
                    a += ca
            row.append((r / n, g / n, b / n, a / n))
        rows.append(row)
    return rows


def halve(rows):
    out = []
    for y in range(0, len(rows), 2):
        row = []
        for x in range(0, len(rows[0]), 2):
            px = [rows[y][x], rows[y][x + 1], rows[y + 1][x], rows[y + 1][x + 1]]
            row.append(tuple(sum(p[i] for p in px) / 4 for i in range(4)))
        out.append(row)
    return out


def write_png(path, rows):
    raw = bytearray()
    for row in rows:
        raw.append(0)
        for r, g, b, a in row:
            if a:
                raw += bytes((round(r / a), round(g / a), round(b / a), round(a)))
            else:
                raw += b"\0\0\0\0"

    def chunk(kind, data):
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data))

    height, width = len(rows), len(rows[0])
    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    png += chunk(b"IEND", b"")
    path.write_bytes(png)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for theme, colours in COLOURS.items():
        prefix = "" if theme == "light" else "dark_"
        big = render(colours)
        write_png(OUT / f"{prefix}icon@2x.png", big)
        write_png(OUT / f"{prefix}icon.png", halve(big))
        print(f"{theme}: {prefix}icon.png, {prefix}icon@2x.png")


if __name__ == "__main__":
    main()
