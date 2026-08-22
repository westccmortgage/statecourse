#!/usr/bin/env python3
"""
Will the filled form actually print what it says it holds?

Reading a field back tells you the value is stored. It does not tell you the value will be
legible, and it does not tell you it will be there at all. A value too long for its field is
shrunk by the viewer until it fits; if it still does not fit, the appearance stream's own clip
rectangle cuts the overflow off. The PDF then reads back perfectly and prints truncated.

In practice the shrinking is what bites, not the clipping: pypdf sizes the text to the box, so a
field is made to fit almost whatever you put in it. What it cannot do is make the result readable.
The first RE 306 exemption line came out at 7.3pt — small enough that a reviewer would squint at a
filed application, and the value read back perfectly the whole time.

So the legibility floor is the check that earns its place, and the width comparison is kept with a
tolerance for the case the auto-sizer cannot handle at all. Measured widths carry a percent or so
of error against a viewer's own metrics, and a check that fired on that error would be noise.

Emits a JSON array of problems. Empty means every filled field is readable and fits.
"""

import json
import re
import sys

from pypdf import PdfReader

# Helvetica advance widths from the AFM, in 1/1000 em. Measuring with the real metrics rather
# than an average character width is the difference between "probably fits" and "fits".
WIDTHS = {
    " ": 278, "!": 278, '"': 355, "#": 556, "$": 556, "%": 889, "&": 667, "'": 191, "(": 333,
    ")": 333, "*": 389, "+": 584, ",": 278, "-": 333, ".": 278, "/": 278, ":": 278, ";": 278,
    "<": 584, "=": 584, ">": 584, "?": 556, "@": 1015, "[": 278, "]": 278, "_": 556, "|": 260,
    "§": 556,
}
for _c in "0123456789":
    WIDTHS[_c] = 556
for _c, _w in zip("ABCDEFGHIJKLMNOPQRSTUVWXYZ",
                  [667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833,
                   722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611]):
    WIDTHS[_c] = _w
for _c, _w in zip("abcdefghijklmnopqrstuvwxyz",
                  [556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833,
                   556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500]):
    WIDTHS[_c] = _w

# Below this, a reviewer is squinting at a filed application. It is not a rendering limit — the
# text is there and a viewer will draw it — it is the point at which an answer stops being an
# answer anybody wants to read, and the signal that a field has been asked to hold too much.
MINIMUM_LEGIBLE_POINTS = 7.5

# How far past its clip a line may measure before it is called overflow rather than arithmetic.
# The widths here are the AFM's and the viewer's may differ slightly; one percent is comfortably
# more than that difference and far less than a lost word.
WIDTH_TOLERANCE = 1.01

MULTILINE = 1 << 12


def text_width(text, size):
    return sum(WIDTHS.get(ch, 556) for ch in text) / 1000.0 * size


def problems_in(path):
    reader = PdfReader(path)
    found = []
    for page in reader.pages:
        for annotation in page.get("/Annots") or []:
            obj = annotation.get_object()
            parent = obj.get("/Parent")
            name = str(obj.get("/T") or (parent.get("/T") if parent else ""))
            field_type = obj.get("/FT") or (parent.get("/FT") if parent else None)
            value = obj.get("/V") or (parent.get("/V") if parent else None)
            if field_type != "/Tx" or not value:
                continue

            appearance = obj.get("/AP")
            if not appearance or "/N" not in appearance:
                found.append(f"{name}: has a value and no appearance stream, so it may print blank")
                continue

            stream = appearance["/N"].get_object()
            data = stream.get_data().decode("latin-1")
            font = re.search(r"/(\S+)\s+([\d.]+)\s+Tf", data)
            size = float(font.group(2)) if font else 0.0
            if size and size < MINIMUM_LEGIBLE_POINTS:
                found.append(f"{name}: rendered at {size}pt, below the {MINIMUM_LEGIBLE_POINTS}pt floor")

            flags = int(obj.get("/Ff") or (parent.get("/Ff") if parent else 0) or 0)
            if flags & MULTILINE:
                # The viewer wraps, so height is what runs out rather than width.
                lines = data.count("Td") + data.count("TD") + data.count("T*")
                box = [float(x) for x in stream.get("/BBox")]
                if size and lines * size * 1.15 > (box[3] - box[1]):
                    found.append(f"{name}: {lines} wrapped lines at {size}pt exceed the field height")
                continue

            clip = re.search(r"([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+re\s*\n?W", data)
            if not clip:
                continue
            available = float(clip.group(3))
            rendered = text_width(str(value), size)
            if rendered > available * WIDTH_TOLERANCE:
                found.append(
                    f"{name}: {rendered:.1f}pt of text at {size}pt is clipped to "
                    f"{available:.1f}pt - it will print cut off"
                )
    return found


if __name__ == "__main__":
    print(json.dumps(problems_in(sys.argv[1])))
