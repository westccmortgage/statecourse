#!/usr/bin/env python3
"""Build deterministic 1920x1080 HeyGen stills from the held IABS 1-2 PDF."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

import pdfplumber
import pypdfium2 as pdfium
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "texas/trec-sources/forms/IABS-1-2.pdf"
OUTPUT = (
    ROOT
    / "texas/tx-law-of-agency-30-v1/video-production/inputs/iabs-1-2"
)
CANVAS = (1920, 1080)
BACKGROUND = (246, 241, 232)
SCALE = 4
BODY_WIDTH = 1660

BANDS = {
    "a": (20, 600, 12, 74),
    "b": (20, 600, 73, 114),
    "c": (20, 600, 112, 175),
    "d": (20, 600, 172, 255),
    "e": (20, 600, 252, 370),
    "f": (20, 600, 368, 492),
    "g": (20, 600, 490, 592),
    "h": (20, 600, 592, 791),
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def place_on_canvas(image: Image.Image, *, width: int | None = None, height: int | None = None) -> Image.Image:
    if width is not None:
        target = (width, round(image.height * width / image.width))
    elif height is not None:
        target = (round(image.width * height / image.height), height)
    else:
        raise ValueError("width or height is required")
    resized = image.resize(target, Image.Resampling.LANCZOS)
    if resized.width > CANVAS[0] or resized.height > CANVAS[1]:
        raise ValueError(f"asset does not fit canvas: {resized.size}")
    canvas = Image.new("RGB", CANVAS, BACKGROUND)
    canvas.paste(
        resized,
        ((CANVAS[0] - resized.width) // 2, (CANVAS[1] - resized.height) // 2),
    )
    return canvas


def verify_band_edges() -> None:
    with pdfplumber.open(SOURCE) as document:
        page = document.pages[0]
        lines = page.extract_text_lines()
    for name, (x0, x1, y0, y1) in BANDS.items():
        straddlers = [
            line["text"]
            for line in lines
            if (line["top"] < y0 < line["bottom"])
            or (line["top"] < y1 < line["bottom"])
        ]
        if straddlers:
            raise ValueError(f"band {name} cuts printed text: {straddlers}")
        visible = [
            line
            for line in lines
            if line["top"] >= y0 and line["bottom"] <= y1
        ]
        clipped = [
            line["text"]
            for line in visible
            if line["x0"] < x0 or line["x1"] > x1
        ]
        if clipped:
            raise ValueError(f"band {name} clips printed text horizontally: {clipped}")


def main() -> None:
    expected_source_hash = "5056930b66d237a7a4376db0c43f833929600f0b6e5ce6e42a417da824ef6b20"
    if sha256(SOURCE) != expected_source_hash:
        raise ValueError("held IABS source hash changed")
    verify_band_edges()

    OUTPUT.mkdir(parents=True, exist_ok=True)
    document = pdfium.PdfDocument(SOURCE)
    if len(document) != 1:
        raise ValueError(f"expected one-page form, got {len(document)} pages")
    rendered = document[0].render(scale=SCALE).to_pil().convert("RGB")
    if rendered.size != (2448, 3168):
        raise ValueError(f"unexpected render dimensions: {rendered.size}")

    assets: dict[str, dict[str, object]] = {}
    full_path = OUTPUT / "iabs-full.png"
    place_on_canvas(rendered, height=1080).save(full_path, "PNG", optimize=True)
    assets[full_path.name] = {
        "sha256": sha256(full_path),
        "dimensions": CANVAS,
        "sourceBoxPoints": [0, 612, 0, 792],
    }

    for name, (x0, x1, y0, y1) in BANDS.items():
        crop = rendered.crop((x0 * SCALE, y0 * SCALE, x1 * SCALE, y1 * SCALE))
        path = OUTPUT / f"iabs-band-{name}.png"
        place_on_canvas(crop, width=BODY_WIDTH).save(path, "PNG", optimize=True)
        assets[path.name] = {
            "sha256": sha256(path),
            "dimensions": CANVAS,
            "sourceBoxPoints": [x0, x1, y0, y1],
        }

    manifest = {
        "source": str(SOURCE.relative_to(ROOT)),
        "sourceSha256": expected_source_hash,
        "renderScale": SCALE,
        "canvas": CANVAS,
        "backgroundRgb": BACKGROUND,
        "assets": assets,
    }
    (OUTPUT / "manifest.json").write_text(
        json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
    )
    print(f"built {len(assets)} locked IABS frames in {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
