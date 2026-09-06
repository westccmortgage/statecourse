#!/usr/bin/env python3
"""Extract official DOL PDF page text without silently dropping bullets or footers.

Usage: python washington-extract-curricula.py PDF_DIR OUTPUT_JSON
Read-only with respect to PDFs; stores full text/page provenance for map validation.
"""
import hashlib
import json
import sys
from pathlib import Path
from pypdf import PdfReader

source_dir, output = map(Path, sys.argv[1:])
records = []
for course, expected_pages in [("fundamentals", 12), ("practices", 9)]:
    pdf = source_dir / f"{course}.pdf"
    reader = PdfReader(pdf)
    assert len(reader.pages) == expected_pages
    records.append({"course": course, "retrievedAt": "2026-09-06", "sha256": hashlib.sha256(pdf.read_bytes()).hexdigest(),
                    "pageCount": len(reader.pages), "pages": [{"page": i + 1, "text": p.extract_text()} for i, p in enumerate(reader.pages)]})
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n")
