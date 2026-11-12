#!/usr/bin/env python3
"""Draw the TickTack home-screen icons. No third-party image library."""

import math
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "public"


def chunk(tag: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)


def write_png(path: Path, pixels: bytes, size: int) -> None:
    raw = b"".join(b"\x00" + pixels[y * size * 4 : (y + 1) * size * 4] for y in range(size))
    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(raw, 9))
    png += chunk(b"IEND", b"")
    path.write_bytes(png)


def blend(dst: tuple[int, int, int, int], src: tuple[int, int, int, int]) -> tuple[int, int, int, int]:
    sa = src[3] / 255
    if sa <= 0:
        return dst
    if sa >= 1:
        return src
    out = []
    for i in range(3):
        out.append(int(src[i] * sa + dst[i] * (1 - sa)))
    out.append(min(255, int(dst[3] + src[3] * (1 - dst[3] / 255))))
    return (out[0], out[1], out[2], out[3])


def draw(size: int, pad: float) -> bytes:
    bg = (31, 111, 235, 255)
    buf = [bg] * (size * size)
    cx = cy = (size - 1) / 2
    radius = size * (0.5 - pad)

    def plot(x: int, y: int, color: tuple[int, int, int, int]) -> None:
        if 0 <= x < size and 0 <= y < size:
            i = y * size + x
            buf[i] = blend(buf[i], color)

    def fill_circle(px: float, py: float, r: float, color: tuple[int, int, int, int]) -> None:
        r2 = r * r
        for y in range(int(py - r - 1), int(py + r + 2)):
            for x in range(int(px - r - 1), int(px + r + 2)):
                if (x - px) ** 2 + (y - py) ** 2 <= r2:
                    plot(x, y, color)

    def thick_line(x1: float, y1: float, x2: float, y2: float, width: float, color: tuple[int, int, int, int]) -> None:
        length = math.hypot(x2 - x1, y2 - y1) or 1
        steps = int(length * 2) + 1
        for i in range(steps + 1):
            t = i / steps
            fill_circle(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, width / 2, color)

    fill_circle(cx, cy, radius, (255, 197, 61, 255))
    fill_circle(cx, cy, radius * 0.9, (255, 250, 242, 255))
    for n in range(12):
        ang = n / 12 * math.tau
        fill_circle(cx + math.sin(ang) * radius * 0.78, cy - math.cos(ang) * radius * 0.78, radius * 0.035, (28, 39, 66, 255))
    # 3:00 — hour hand to the right, minute hand up
    thick_line(cx, cy, cx + radius * 0.42, cy, radius * 0.09, (239, 61, 90, 255))
    thick_line(cx, cy, cx, cy - radius * 0.62, radius * 0.055, (31, 111, 235, 255))
    fill_circle(cx, cy, radius * 0.08, (255, 197, 61, 255))
    raw = bytearray()
    for pixel in buf:
        raw.extend(pixel)
    return bytes(raw)


def main() -> None:
    icons = ROOT / "icons"
    icons.mkdir(parents=True, exist_ok=True)
    jobs = {
        icons / "icon-192.png": (192, 0.06),
        icons / "icon-512.png": (512, 0.06),
        icons / "icon-maskable-512.png": (512, 0.18),
        ROOT / "apple-touch-icon.png": (180, 0.08),
    }
    for path, (size, pad) in jobs.items():
        write_png(path, draw(size, pad), size)
        print(path, path.stat().st_size)


if __name__ == "__main__":
    main()
