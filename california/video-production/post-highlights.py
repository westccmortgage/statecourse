#!/usr/bin/env python3
"""Plan C post-production: burn series-style section highlights into a clean HeyGen render.

The generator repeatedly failed to anchor highlight boxes to the uploaded document
(two defective renders), so document scenes are now ordered CLEAN — static camera
holds, nothing drawn — and this tool adds the thin outline boxes and margin labels
deterministically, at exact pixel coordinates measured from the render's own frames.

Usage: python3 post-highlights.py <clean.mp4> <scenes.json> <out.mp4> [ffmpeg]

scenes.json: list of scenes, each:
  {
    "start": 110.0, "end": 124.0,           # seconds the highlight is visible
    "box": {"x": 962, "y": 571, "w": 364, "h": 67},
    "label": {                               # optional margin label
      "header": "SECTION IDENTIFICATION",    # small grey caps line
      "lines": ["4 — J. Total Closing", "Costs"],
      "x": 1420, "y": 566                    # top-left of label overlay (must sit in the
    }                                        #  cream margin, never over the document)
  }
Box color is the series brick red; labels are vector-set (Helvetica via reportlab)
and rasterized with alpha, so no system fonts are required.
"""
import json, subprocess, sys, tempfile, os

BRICK = "0xA63C3C"
NAVY = (0x1b/255, 0x2a/255, 0x4a/255)
GREY = (0x8a/255, 0x8f/255, 0x99/255)

def make_label(spec, path):
    from reportlab.pdfgen import canvas
    from reportlab.lib.colors import Color
    import pypdfium2 as pdfium
    lines = spec["lines"]
    W, H = 240, 28 + 16*len(lines) + (18 if spec.get("header") else 0)
    pdf_path = path + ".pdf"
    c = canvas.Canvas(pdf_path, pagesize=(W, H))
    c.setFillColor(Color(*NAVY)); c.rect(2, 6, 3, H-12, stroke=0, fill=1)
    y = H - 18
    if spec.get("header"):
        c.setFillColor(Color(*GREY)); c.setFont("Helvetica-Bold", 7.5)
        c.drawString(14, y, " ".join(spec["header"]))
        y -= 20
    c.setFillColor(Color(*NAVY)); c.setFont("Helvetica-Bold", 13)
    for line in lines:
        c.drawString(14, y, line); y -= 16
    c.save()
    img = pdfium.PdfDocument(pdf_path)[0].render(scale=2).to_pil().convert("RGBA")
    px = img.load()
    for yy in range(img.height):
        for xx in range(img.width):
            r, g, b, _ = px[xx, yy]
            px[xx, yy] = (r, g, b, int(max(0, min(255, (255-(r+g+b)/3)*1.35))))
    img.save(path)
    os.unlink(pdf_path)

def main():
    video, config_path, out = sys.argv[1], sys.argv[2], sys.argv[3]
    ffmpeg = sys.argv[4] if len(sys.argv) > 4 else "ffmpeg"
    scenes = json.load(open(config_path))
    tmp = tempfile.mkdtemp(prefix="post-highlights-")
    inputs, filters, labels = [video], [], []
    for i, scene in enumerate(scenes):
        if scene.get("label"):
            p = os.path.join(tmp, f"label{i}.png")
            make_label(scene["label"], p)
            labels.append((i, p))
            inputs.append(p)
    current = "0:v"
    step = 0
    for i, scene in enumerate(scenes):
        b, on = scene["box"], f"between(t,{scene['start']},{scene['end']})"
        nxt = f"v{step}"; step += 1
        filters.append(f"[{current}]drawbox=x={b['x']}:y={b['y']}:w={b['w']}:h={b['h']}:color={BRICK}:t=3:enable='{on}'[{nxt}]")
        current = nxt
    for n, (i, _p) in enumerate(labels, start=1):
        scene = scenes[i]; lab = scene["label"]
        on = f"between(t,{scene['start']},{scene['end']})"
        nxt = f"v{step}"; step += 1
        filters.append(f"[{current}][{n}:v]overlay=x={lab['x']}:y={lab['y']}:enable='{on}'[{nxt}]")
        current = nxt
    cmd = [ffmpeg, "-y", "-v", "error"]
    for p in inputs: cmd += ["-i", p]
    cmd += ["-filter_complex", ";".join(filters), "-map", f"[{current}]", "-map", "0:a?",
            "-c:v", "libx264", "-crf", "19", "-preset", "slow", "-c:a", "copy", out]
    subprocess.run(cmd, check=True)
    print("wrote", out)

if __name__ == "__main__":
    main()
