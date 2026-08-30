#!/usr/bin/env python3
"""
Acquire Florida Administrative Code rule text from the Department of State's own publisher.

WHY THIS EXISTS AS A SCRIPT RATHER THAN A LIST OF CURL COMMANDS. flrules.org does not serve rule
text at a stable, guessable URL. The address of the adopted text is a `readFile.asp` link carrying
a transaction id (`tid`) that changes every time the rule is amended, and that link appears only
inside the rule's own detail page. So the only honest way to fetch a rule is the way a person
would: open the rule page, find the link the Department itself publishes there, and follow it.
Hard-coding a tid would silently pin this project to a superseded version of the law the next time
FREC amends a rule — which is exactly the failure the source lock exists to catch.

WHY `strings` AND NOT A WORD LIBRARY. The Department publishes adopted rules as Word 97 (.doc)
compound files. LibreOffice in this environment refuses to load them ("source file could not be
loaded"), and there is no antiword or catdoc. The WordDocument stream in these particular files
stores its body as 8-bit CP1252 runs, so `strings` recovers the rule text intact. That is a
recovery method, not a parser: it is recorded in the header of every extracted file so a reader
knows what produced the text and can go back to the .doc, which is kept alongside it.

WHAT THIS SCRIPT DOES NOT DO. It does not decide whether a rule is current, whether it applies, or
what it means. It fetches, hashes, and records. Everything else is a human reading.

Usage:  python3 scripts/florida-fetch-fac-rules.py 61J2-3.015 61J2-17.011 ...
"""

import hashlib
import os
import re
import subprocess
import sys
import urllib.parse
from datetime import date

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FAC_DIR = os.path.join(ROOT, "florida", "frec-sources", "fac")
OUT_DIR = os.path.join(ROOT, "florida", "frec-sources", "extracted", "fac-rules")


def get(url, out_path=None):
    """Fetch through curl. Node's fetch does not honour this environment's proxy variables, and
    flrules.org answers a request with no browser User-Agent with a 403 rather than a 401."""
    cmd = ["curl", "-sS", "-A", UA, "-L", "--max-time", "90"]
    if out_path:
        cmd += ["-o", out_path]
        subprocess.run(cmd + [url], check=True)
        return None
    return subprocess.run(cmd + [url], check=True, capture_output=True).stdout.decode("utf-8", "replace")


def rule_text(doc_path):
    """Recover the rule body from the Word 97 stream. See the module docstring for why."""
    raw = subprocess.run(["strings", "-n", "6", doc_path], capture_output=True).stdout.decode("utf-8", "replace")
    lines = raw.split("\n")
    noise = re.compile(r"^(Microsoft|Normal\.dot|Times New Roman|Calibri|Cambria|WordDocument|"
                       r"SummaryInformation|DocumentSummary|Default Paragraph|Table Normal|"
                       r"FLRules_Word|Word\.Document|MSWordDoc|Root Entry|CompObj|ObjectPool|_PID_HLINKS)")
    # The body starts at the rule number heading; everything before it is OLE directory noise.
    start = next((i for i, l in enumerate(lines) if re.match(r"^61J2-\d+\.\d+\s", l)), 0)
    return "\n".join(l for l in lines[start:] if l.strip() and not noise.match(l))


def fetch(rule):
    page = get(f"https://www.flrules.org/gateway/ruleNo.asp?id={rule}")
    flat = page.replace("\n", " ")

    link = re.search(r'href="(/gateway/readFile\.asp\?[^"]+?\.doc)"', flat)
    if not link:
        print(f"  {rule}: no adopted-text link on the rule page — recorded as UNAVAILABLE")
        return None
    doc_url = "https://www.flrules.org" + link.group(1).replace("&amp;", "&")

    eff = re.search(r"Effective Date:\s*</td>\s*<td[^>]*>\s*([0-9/]+)", flat)
    title = re.search(r"Chapter Title:\s*</td>\s*<td[^>]*>\s*([^<]+)", flat)

    doc_path = os.path.join(FAC_DIR, f"fac-{rule}.doc")
    get(doc_url, doc_path)
    digest = hashlib.sha256(open(doc_path, "rb").read()).hexdigest()

    body = rule_text(doc_path)
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(os.path.join(OUT_DIR, f"fac-{rule}.txt"), "w") as fh:
        fh.write(
            f"SOURCE: {doc_url}\n"
            f"PUBLISHER: Florida Department of State, Division of Library and Information Services "
            f"(flrules.org) — official publisher of the Florida Administrative Code\n"
            f"RULE: {rule} F.A.C.\n"
            f"CHAPTER: {(title.group(1).strip() if title else '')}\n"
            f"EFFECTIVE: {(eff.group(1).strip() if eff else 'not stated on the rule page')}\n"
            f"RETRIEVED: {date.today().isoformat()}\n"
            f"LOCAL COPY: florida/frec-sources/fac/fac-{rule}.doc\n"
            f"SHA256: {digest}\n"
            f"EXTRACTION: strings(1) over the Word 97 stream; LibreOffice could not load the file.\n"
            + "-" * 70 + "\n" + body + "\n")

    # References incorporated by reference are part of the rule and have to be chased separately.
    refs = sorted(set(re.findall(r"Ref-\d+", flat)))
    print(f"  {rule}: eff {(eff.group(1) if eff else '?'):>10}  {os.path.getsize(doc_path):>7}B  "
          f"sha {digest[:12]}…  refs: {', '.join(refs) if refs else 'none'}")
    return digest


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    os.makedirs(FAC_DIR, exist_ok=True)
    for r in sys.argv[1:]:
        fetch(r)
