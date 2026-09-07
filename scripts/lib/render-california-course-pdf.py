#!/usr/bin/env python3
"""Typeset a generated California course HTML volume without a browser process.

The HTML already contains the full curriculum and formative assessments. This renderer
preserves that order; no final bank is imported. A new pagination is an explicit output
artifact and must be reconciled with the professor's actual reviewed copy.
"""
import html
from html.parser import HTMLParser
import os
from pathlib import Path
import sys

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, LongTable, TableStyle, KeepTogether


class Element:
    def __init__(self, tag, attrs=None):
        self.tag = tag
        self.attrs = dict(attrs or [])
        self.children = []


class DocumentParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Element("document")
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        node = Element(tag, attrs)
        self.stack[-1].children.append(node)
        if tag not in {"meta", "link", "br", "hr", "img", "input", "source", "wbr"}:
            self.stack.append(node)

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                self.stack = self.stack[:index]
                return

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def text_content(node):
    if isinstance(node, str):
        return node
    return "".join(text_content(child) for child in node.children)


def descendants(node, tag):
    found = []
    if isinstance(node, Element):
        if node.tag == tag:
            found.append(node)
        for child in node.children:
            found.extend(descendants(child, tag))
    return found


def clean(text):
    return text.translate({code: "-" for code in range(0x2010, 0x2016)}).replace("\u00ad", "")


def markup(node):
    if isinstance(node, str):
        # Serif has no check-mark glyph; explicitly select the companion Unicode font.
        return html.escape(clean(node)).replace("✓", '<font name="DejaVuSans">✓</font>')
    body = "".join(markup(child) for child in node.children)
    if node.tag in {"b", "strong"}:
        return f"<b>{body}</b>"
    if node.tag in {"em", "i"}:
        return f"<i>{body}</i>"
    if node.tag == "br":
        return "<br/>"
    if node.tag == "code":
        return f'<font name="DejaVuSans" size="9.3">{body}</font>'
    return body


def register_fonts():
    candidates = [
        os.environ.get("STATECOURSE_FONT_DIR"),
        "/usr/share/fonts/truetype/dejavu",
        str(Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies/native/libreoffice-headless/libreoffice/LibreOfficeDev.app/Contents/Resources/fonts/truetype"),
    ]
    fontdir = next((Path(value) for value in candidates if value and (Path(value) / "DejaVuSerif.ttf").exists()), None)
    if fontdir is None:
        raise RuntimeError("Install DejaVu fonts or set STATECOURSE_FONT_DIR to a folder containing DejaVuSerif and DejaVuSans TTF families.")
    for family in ["DejaVuSerif", "DejaVuSans"]:
        italic_suffix = "Italic" if family.endswith("Serif") else "Oblique"
        for variant, suffix in [("", ""), ("-Bold", "-Bold"), ("-Italic", f"-{italic_suffix}"), ("-BoldItalic", f"-Bold{italic_suffix}")]:
            filename = fontdir / f"{family}{suffix}.ttf"
            if not filename.exists():
                raise RuntimeError(f"Missing font: {filename}")
            pdfmetrics.registerFont(TTFont(family + variant, str(filename)))
        pdfmetrics.registerFontFamily(family, normal=family, bold=family + "-Bold", italic=family + "-Italic", boldItalic=family + "-BoldItalic")


def make_styles():
    body = ParagraphStyle("Body", fontName="DejaVuSerif", fontSize=10.5, leading=15.75, spaceAfter=8, allowWidows=0, allowOrphans=0)
    styles = {"body": body}
    for level, size, before in [(1, 19, 0), (2, 14, 15), (3, 11.5, 12), (4, 10.5, 10), (5, 10.5, 9), (6, 10.5, 8)]:
        styles[f"h{level}"] = ParagraphStyle(f"Heading{level}", parent=body, fontName="DejaVuSans-Bold", fontSize=size, leading=size * 1.25, spaceBefore=before, spaceAfter=7, keepWithNext=True)
    styles["small"] = ParagraphStyle("Small", parent=body, fontSize=9.3, leading=13.2, spaceAfter=6)
    styles["table"] = ParagraphStyle("Cell", parent=body, fontSize=9, leading=12.8, spaceAfter=0, allowWidows=1, allowOrphans=1)
    styles["tablehead"] = ParagraphStyle("CellHead", parent=styles["table"], fontName="DejaVuSans-Bold")
    styles["list"] = ParagraphStyle("List", parent=body, leftIndent=15, firstLineIndent=-12, spaceAfter=4)
    styles["quote"] = ParagraphStyle("Quote", parent=body, leftIndent=15, borderColor=colors.HexColor("#aaaaaa"), borderPadding=5, spaceBefore=6, spaceAfter=7)
    styles["cover"] = ParagraphStyle("Cover", parent=body, fontName="DejaVuSans-Bold", fontSize=27, leading=34, alignment=TA_CENTER, spaceAfter=16)
    styles["coversub"] = ParagraphStyle("CoverSub", parent=body, fontName="DejaVuSans", fontSize=14, leading=20, alignment=TA_CENTER)
    styles["coverstatus"] = ParagraphStyle("CoverStatus", parent=styles["small"], alignment=TA_CENTER)
    return styles


def render(source, target):
    register_fonts()
    styles = make_styles()
    parser = DocumentParser()
    parser.feed(Path(source).read_text(encoding="utf-8"))
    body = descendants(parser.root, "body")[0]
    title = clean(text_content(descendants(parser.root, "title")[0]))
    width = letter[0] - 112 - 12  # SimpleDocTemplate frame has 6pt padding on both sides.
    story = []
    stats = {"headings": 0, "paragraphs": 0, "tables": 0, "listItems": 0}

    def add_break():
        if story and not isinstance(story[-1], PageBreak):
            story.append(PageBreak())

    def paragraph(node, style="body"):
        value = markup(node).strip()
        if value:
            story.append(Paragraph(value, styles[style]))
            stats["paragraphs"] += 1

    def visit(node, context=None):
        if isinstance(node, str):
            if node.strip():
                paragraph(node)
            return
        tag = node.tag
        classname = node.attrs.get("class", "")
        if tag in {"style", "head", "script"}:
            return
        if tag == "div" and classname == "item":
            start = len(story)
            if story and isinstance(story[-1], Paragraph) and story[-1].style.keepWithNext:
                start -= 1  # Keep an assessment-set heading with its first complete item.
            for child in node.children:
                visit(child, context)
            item = story[start:]
            del story[start:]
            story.append(KeepTogether(item))
            return
        if tag == "section" and classname == "cover":
            story.append(Spacer(1, 140))
            for child in node.children:
                if not isinstance(child, Element):
                    continue
                cls = child.attrs.get("class", "")
                if cls == "title":
                    paragraph(child, "cover")
                elif cls == "hours":
                    paragraph(child, "coversub")
                elif cls == "pub":
                    story.append(Spacer(1, 95))
                    paragraph(child, "coversub")
                elif cls == "status":
                    story.append(Spacer(1, 50))
                    paragraph(child, "coverstatus")
            add_break()
            return
        if tag == "section" and classname in {"pubpage", "toc"}:
            for child in node.children:
                visit(child, classname)
            add_break()
            return
        if tag in {"h1", "h2", "h3", "h4", "h5", "h6"}:
            if tag == "h1" and context != "toc":
                add_break()
            paragraph(node, tag)
            stats["headings"] += 1
            return
        if tag == "p":
            paragraph(node, "small" if "rationale" in classname or "assessment-note" in classname else ("quote" if context == "quote" else "body"))
            return
        if tag in {"ol", "ul"}:
            items = [child for child in node.children if isinstance(child, Element) and child.tag == "li"]
            for index, item in enumerate(items, 1):
                prefix = "" if "choices" in classname or context == "toc" else (f"{index}. " if tag == "ol" else "• ")
                story.append(Paragraph(prefix + markup(item).strip(), styles["list"]))
                stats["listItems"] += 1
            story.append(Spacer(1, 5))
            return
        if tag == "table":
            rows = descendants(node, "tr")
            cells = [[cell for cell in row.children if isinstance(cell, Element) and cell.tag in {"td", "th"}] for row in rows]
            cells = [row for row in cells if row]
            if not cells:
                return
            columns = max(len(row) for row in cells)
            data = [[Paragraph(markup(cell), styles["tablehead" if cell.tag == "th" else "table"]) for cell in row] for row in cells]
            data = [row + [""] * (columns - len(row)) for row in data]
            # Text-heavy reference columns get room without allowing a single word to determine widths.
            weights = [max(8, min(65, max(len(text_content(row[index])) if index < len(row) else 0 for row in cells) ** 0.5 * 6)) for index in range(columns)]
            widths = [width * weight / sum(weights) for weight in weights]
            table = LongTable(data, colWidths=widths, repeatRows=1 if any(cell.tag == "th" for cell in cells[0]) else 0, splitByRow=1, splitInRow=0, hAlign="LEFT")
            table.setStyle(TableStyle([
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#999999")),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#eeeeee")),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]))
            story.extend([Spacer(1, 5), table, Spacer(1, 10)])
            stats["tables"] += 1
            return
        if tag == "hr":
            story.append(Spacer(1, 10))
            return
        for child in node.children:
            visit(child, "quote" if tag == "blockquote" else context)

    for element in body.children:
        visit(element)

    def page_number(canvas, document):
        canvas.saveState()
        canvas.setFont("DejaVuSans", 8)
        canvas.setFillColor(colors.HexColor("#555555"))
        canvas.drawCentredString(letter[0] / 2, 30, str(document.page))
        canvas.restoreState()

    document = SimpleDocTemplate(str(target), pagesize=letter, leftMargin=56, rightMargin=56, topMargin=62, bottomMargin=62, title=title, author="StateCourse LLC", pageCompression=1, invariant=1)
    document.build(story, onFirstPage=page_number, onLaterPages=page_number)
    import json
    print(json.dumps({"output": str(target), "renderer": "reportlab", **stats}))


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: render-california-course-pdf.py input.html output.pdf")
    render(sys.argv[1], sys.argv[2])
