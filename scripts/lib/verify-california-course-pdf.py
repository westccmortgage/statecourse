#!/usr/bin/env python3
"""Require every textual HTML block to survive PDF rendering, including all assessments."""
import importlib.util
import json
from pathlib import Path
import re
import sys
import unicodedata
from pypdf import PdfReader

spec = importlib.util.spec_from_file_location("course_renderer", Path(__file__).with_name("render-california-course-pdf.py"))
renderer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)

def normalize(text):
    return re.sub(r"\s+", "", unicodedata.normalize("NFKC", renderer.clean(text)))

def verify(source, pdf):
    parser = renderer.DocumentParser()
    parser.feed(Path(source).read_text(encoding="utf-8"))
    body = renderer.descendants(parser.root, "body")[0]
    # Footers are drawn first in the PDF stream. Remove exactly that page-number line;
    # leave all content text intact, including numbers inside the instructional material.
    pages = [(page.extract_text() or "").removeprefix(f"{index}\n") for index, page in enumerate(PdfReader(pdf).pages, 1)]
    output = normalize(" ".join(pages))
    inspected = 0
    missing = []
    for tag in ["p", "li", "h1", "h2", "h3", "h4", "h5", "h6", "th", "td"]:
        for node in renderer.descendants(body, tag):
            content = renderer.text_content(node)
            if not content.strip():
                continue
            inspected += 1
            if normalize(content) not in output:
                missing.append({"tag": tag, "text": content[:240]})
    examples = {}
    for index, content in enumerate(pages, 1):
        for label, pattern in [("assessment", "Assessment materials for this assignment"), ("firstLesson", "Lesson Assignment 01"), ("finalLesson", "Lesson Assignment 15")]:
            if label not in examples and pattern in content:
                examples[label] = index
    result = {"pdf": pdf, "pages": len(pages), "checkedHtmlBlocks": inspected, "missingBlocks": missing, "examplePages": examples}
    print(json.dumps(result))
    if missing:
        raise SystemExit(1)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: verify-california-course-pdf.py input.html output.pdf")
    verify(sys.argv[1], sys.argv[2])
