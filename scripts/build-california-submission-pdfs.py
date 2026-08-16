#!/usr/bin/env python3
from __future__ import annotations

import html
import re
from pathlib import Path

from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
CA = ROOT / "california"
OUT = ROOT / "output" / "pdf"
TMP = ROOT / "tmp" / "pdfs"
FORMS = Path("/tmp/statecourse-ca-forms")
OUT.mkdir(parents=True, exist_ok=True)
TMP.mkdir(parents=True, exist_ok=True)

COURSES = [
    ("ca-real-estate-principles-45-v1", "Real Estate Principles", "Principles"),
    ("ca-real-estate-practice-45-v1", "Real Estate Practice", "Practice"),
    ("ca-mortgage-loan-brokering-lending-45-v1", "Mortgage Loan Brokering and Lending", "Mortgage_Loan_Brokering_and_Lending"),
]

NAVY = colors.HexColor("#172536")
BURGUNDY = colors.HexColor("#7A332B")
PAPER = colors.HexColor("#FFFDF8")
RULE = colors.HexColor("#D8D0C3")
MUTED = colors.HexColor("#5D6268")

pdfmetrics.registerFont(TTFont("DVSerif", "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"))
pdfmetrics.registerFont(TTFont("DVSerif-Bold", "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"))
pdfmetrics.registerFont(TTFont("DVSans", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DVSans-Bold", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))


def fields_and_widgets(reader: PdfReader):
    fields = reader.get_fields() or {}
    widgets = []
    for page_index, page in enumerate(reader.pages):
        for ref in page.get("/Annots") or []:
            obj = ref.get_object()
            if obj.get("/Subtype") == "/Widget":
                parent = obj.get("/Parent")
                parent_obj = parent.get_object() if parent else None
                name = obj.get("/T") or (parent_obj.get("/T") if parent_obj else None)
                value = obj.get("/V") or (parent_obj.get("/V") if parent_obj else None)
                widgets.append((page_index, name, value, obj))
    return fields, widgets


def fill_form(source: Path, dest: Path, values: dict[str, str], required: dict[str, str]):
    reader = PdfReader(source)
    if reader.is_encrypted:
        reader.decrypt("")
    before_fields, _ = fields_and_widgets(reader)
    missing = set(values) - set(before_fields)
    if missing:
        raise ValueError(f"Missing form fields in {source.name}: {sorted(missing)}")
    writer = PdfWriter()
    writer.clone_document_from_reader(reader)
    writer.update_page_form_field_values(None, values, auto_regenerate=False)
    writer.set_need_appearances_writer(False)
    with dest.open("wb") as stream:
        writer.write(stream)

    check = PdfReader(dest)
    if check.is_encrypted:
        check.decrypt("")
    final_fields, widgets = fields_and_widgets(check)
    for key, expected in required.items():
        actual = final_fields[key].get("/V")
        if str(actual) != str(expected):
            raise ValueError(f"Field {key!r} in {dest.name}: expected {expected!r}, got {actual!r}")
    for _, name, value, widget in widgets:
        if name in required:
            ap = widget.get("/AP")
            if not ap or not ap.get("/N"):
                raise ValueError(f"Widget {name!r} in {dest.name} has no normal appearance")
            effective = value
            if effective is None:
                raise ValueError(f"Widget {name!r} in {dest.name} has no effective value")


def re306_values(title: str, sb1495: bool):
    vals = {
        "1 NAME OF APPLICANT SCHOOL": "StateCourse LLC",
        "2 OTHER NAMES USED BY THE SCHOOL": "None proposed",
        "3a Business Area Code": "TBD",
        "3b Business telephone": "CONFIRM BEFORE SIGNATURE",
        "SCHOOLS BUSINESS ADDRESS   CITY STATE ZIP CODE": "FILING ADDRESS - CONFIRM BEFORE SIGNATURE",
        "SCHOOLS MAILING ADDRESS": "MAILING ADDRESS - CONFIRM BEFORE SIGNATURE",
        "Email Address": "PUBLIC SUPPORT EMAIL - PENDING",
        "School Website": "https://statecourse.com",
        "EXPLAIN EXEMPTION": "BPPE applicability/exemption determination pending.",
        "EXPLAIN EXEMPTION 2": "Insert exact statutory basis and evidence before execution.",
        "LLC": "/Yes",
        "DBA NO": "/Yes",
        "Printed name 1": "Anatoliy Kanevsky",
        "Area code1": "TBD",
        "Phone number 1": "CONFIRM",
        "Email address 1": "CONFIRM PUBLIC CONTACT EMAIL",
        "COURSE TITLE": title,
        "LANGUAGE": "English",
        "TOTAL NUMBER OF INSTRUCTION HOURS Minimum 45 hours required": "45",
        "Publication TitleRow1": f"StateCourse {title} Student Text and Workbook",
        "AuthorRow1": "StateCourse LLC",
        "Date of PublicationRow1": "2026",
        "Edition 1": "v1.0 development draft",
        "Publication TitleRow2": "Online lesson assignments and applied workbook",
        "AuthorRow2": "StateCourse LLC",
        "Date of PublicationRow2": "2026",
        "Edition 2": "v1.0 development draft",
        "NUMBER OF QUESTIONS ON FINAL EXAM": "100",
        "MINIMUM PASSING SCORE": "60%",
        "Exam Time Given": "180 minutes",
        "CLOSED BOOK": "/On",
        "Correspondence and Internet": "/On",
        "Internet Final Exam": "/On",
        "EXPLAIN YOUR PROCEDURE TO PROVIDE THE GENERAL INFORMATION PAGE TO STUDENTS PRIOR TO REGISTRATIONENROLLMENT 1": "Versioned GIP displayed before registration; student must open and accept before checkout. Enrollment remains disabled until DRE approval.",
        "EXPLAIN HOW AND WHEN STUDENTS WILL BE INFORMED OF THE AVAILABILITY OF THE ONLINE COURSE AND INSTRUCTOR EVALUATION LOCATED ON THE DRE WEB SITE 1": "RE 318A link and instructions appear in the GIP, course orientation, and completion notice.",
        "PRINTED NAME OF PRIMARY CONTACT": "Anatoliy Kanevsky",
        "TITLE OF PRIMARY CONTACT": "Founder / Authorized Member - confirm",
        "Primary conatact's phone number (include area code)": "CONFIRM BEFORE SIGNATURE",
        "DRE LICENSE NUMBER": "01385024",
        "PRINTED NAME OF OWNER OR AUTHORIZED OFFICIAL": "Anatoliy Kanevsky",
        "OWNER'S EMAIL ADDRESS": "CONFIRM BEFORE SIGNATURE",
        "Owner (or authorized school official) conatact's phone number (include area code)": "CONFIRM BEFORE SIGNATURE",
        "DRE LICENSE 2": "01385024",
    }
    if sb1495:
        vals["Check Box1"] = "/Yes"
        vals["Detail the interactive participatory component"] = "Lesson 14 requires two role-play passes: learner as consumer and learner as real estate professional, plus reflection and bias-interruption action plan."
    return vals


def re336_values(title: str):
    return {
        "PRINTED OR TYPED NAME OF PRIMARY CONTACT": "Kanevsky, Anatoliy",
        "TITLE OF PRIMARY CONTACT": "Founder / Authorized Member - confirm",
        "Name of course provider": "StateCourse LLC",
        "4DIGIT SPONSOR ID NUMBER": "PENDING",
        "Address of course provider": "FILING ADDRESS - CONFIRM",
        "city": "CONFIRM",
        "State": "CONFIRM",
        "Zip Code": "CONFIRM",
        "Course title": title,
        "INSTRUCTOR NAME": "Kanevsky, Anatoliy",
        "CalBRE LICENSE NUMBER": "01385024",
        "insturctor licensced? yes": "/Yes",
    }


styles = getSampleStyleSheet()
STYLES = {
    "cover": ParagraphStyle("Cover", parent=styles["Title"], fontName="DVSerif-Bold", fontSize=28, leading=32, textColor=NAVY, alignment=TA_LEFT, spaceAfter=18),
    "subtitle": ParagraphStyle("Subtitle", parent=styles["Normal"], fontName="DVSans", fontSize=11, leading=16, textColor=MUTED, spaceAfter=12),
    "h1": ParagraphStyle("H1", parent=styles["Heading1"], fontName="DVSerif-Bold", fontSize=18, leading=22, textColor=NAVY, spaceBefore=14, spaceAfter=8),
    "h2": ParagraphStyle("H2", parent=styles["Heading2"], fontName="DVSerif-Bold", fontSize=14, leading=17, textColor=BURGUNDY, spaceBefore=12, spaceAfter=6),
    "h3": ParagraphStyle("H3", parent=styles["Heading3"], fontName="DVSans-Bold", fontSize=10, leading=13, textColor=NAVY, spaceBefore=8, spaceAfter=4),
    "body": ParagraphStyle("Body", parent=styles["BodyText"], fontName="DVSerif", fontSize=8.7, leading=12, textColor=colors.HexColor("#2B2D2F"), spaceAfter=5),
    "small": ParagraphStyle("Small", parent=styles["BodyText"], fontName="DVSans", fontSize=7.5, leading=10, textColor=MUTED, spaceAfter=4),
    "bullet": ParagraphStyle("Bullet", parent=styles["BodyText"], fontName="DVSerif", fontSize=8.7, leading=12, leftIndent=14, firstLineIndent=-8, spaceAfter=3),
    "notice": ParagraphStyle("Notice", parent=styles["BodyText"], fontName="DVSans-Bold", fontSize=9, leading=13, textColor=BURGUNDY, borderColor=RULE, borderWidth=0.8, borderPadding=8, backColor=colors.HexColor("#F4F0E7"), spaceAfter=12),
}


def inline(text: str):
    value = html.escape(text.strip())
    value = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", value)
    value = re.sub(r"\[(.+?)\]\((https?://[^)]+)\)", r'<link href="\2" color="#7A332B">\1</link>', value)
    value = value.replace("  ", " ")
    return value


def markdown_story(file: Path, add_file_heading: bool = True, page_density: bool = False):
    text = file.read_text("utf8")
    lines = text.splitlines()
    story = []
    i = 0
    instructional_paragraphs = 0
    if add_file_heading:
        story.append(Paragraph(inline(file.stem.replace("-", " ").title()), STYLES["small"]))
    while i < len(lines):
        raw = lines[i].rstrip()
        if not raw:
            i += 1
            continue
        if raw.startswith("# "):
            story.append(Paragraph(inline(raw[2:]), STYLES["h1"]))
        elif raw.startswith("## "):
            story.append(Paragraph(inline(raw[3:]), STYLES["h2"]))
        elif raw.startswith("### "):
            story.append(Paragraph(inline(raw[4:]), STYLES["h3"]))
        elif raw.startswith("|" ) and i + 1 < len(lines) and set(lines[i + 1].replace("|", "").replace("-", "").replace(":", "").strip()) == set():
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                cells = [cell.strip() for cell in lines[i].strip("|").split("|")]
                if not all(set(cell) <= {"-", ":"} for cell in cells):
                    rows.append([Paragraph(inline(cell), STYLES["small"]) for cell in cells])
                i += 1
            i -= 1
            if rows:
                table = Table(rows, repeatRows=1, hAlign="LEFT", colWidths=[(7.0 * inch) / len(rows[0])] * len(rows[0]))
                table.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("GRID", (0, 0), (-1, -1), 0.4, RULE),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 4),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                    ("TOPPADDING", (0, 0), (-1, -1), 3),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ]))
                story.extend([table, Spacer(1, 8)])
        elif raw.startswith("- "):
            story.append(Paragraph("- " + inline(raw[2:]), STYLES["bullet"]))
        elif re.match(r"^\d+\. ", raw):
            story.append(Paragraph(inline(raw), STYLES["bullet"]))
        else:
            para = raw
            while i + 1 < len(lines) and lines[i + 1].strip() and not re.match(r"^(#|\||- |\d+\. )", lines[i + 1]):
                i += 1
                para += " " + lines[i].strip()
            style = STYLES["notice"] if para.startswith("**Development notice:") or para.startswith("**Status:") else STYLES["body"]
            story.append(Paragraph(inline(para), style))
            if page_density and style is STYLES["body"] and len(para.split()) >= 65:
                instructional_paragraphs += 1
                if instructional_paragraphs % 2 == 0:
                    story.append(PageBreak())
        i += 1
    return story


def page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, letter[0], letter[1], fill=1, stroke=0)
    canvas.setStrokeColor(RULE)
    canvas.line(0.7 * inch, 0.62 * inch, 7.8 * inch, 0.62 * inch)
    canvas.setFont("DVSans", 7)
    canvas.setFillColor(MUTED)
    canvas.drawString(0.7 * inch, 0.42 * inch, "StateCourse LLC - California DRE submission development draft - not approved")
    canvas.drawRightString(7.8 * inch, 0.42 * inch, f"Page {doc.page}")
    canvas.restoreState()


def build_report(dest: Path, title: str, subtitle: str, files: list[Path]):
    temp = TMP / (dest.stem + "-supporting.pdf")
    doc = BaseDocTemplate(str(temp), pagesize=letter, leftMargin=0.7 * inch, rightMargin=0.7 * inch, topMargin=0.65 * inch, bottomMargin=0.75 * inch, title=title, author="StateCourse LLC")
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="body")
    doc.addPageTemplates(PageTemplate(id="academic", frames=[frame], onPage=page))
    story = [
        Spacer(1, 0.75 * inch),
        Paragraph(inline(title), STYLES["cover"]),
        Paragraph(inline(subtitle), STYLES["subtitle"]),
        Paragraph("DEVELOPMENT DRAFT - NOT SUBMITTED - NOT DRE APPROVED", STYLES["notice"]),
        Paragraph("Prepared 16 August 2026 under the California DRE Course Provider Handbook revised January 2026. Filing fields, policies, signatures, professor certification, BPPE determination, credentials, and regulatory decisions identified as pending must be completed before submission or release.", STYLES["body"]),
        PageBreak(),
    ]
    for index, file in enumerate(files):
        story.extend(markdown_story(file, page_density="curriculum" in file.parts))
        if index < len(files) - 1:
            story.append(PageBreak())
    doc.build(story)
    temp.replace(dest)


def merge(dest: Path, sources: list[Path]):
    writer = PdfWriter()
    for source in sources:
        reader = PdfReader(source)
        if reader.is_encrypted:
            reader.decrypt("")
        for p in reader.pages:
            writer.add_page(p)
    with dest.open("wb") as stream:
        writer.write(stream)


def build_all():
    applications = {}
    re336_forms = []
    for course_id, title, file_title in COURSES:
        application = OUT / f"California_RE306_{file_title}_Application_Draft.pdf"
        values = re306_values(title, title == "Real Estate Practice")
        required = {key: value for key, value in values.items() if key not in {"EXPLAIN EXEMPTION", "EXPLAIN EXEMPTION 2"}}
        fill_form(FORMS / "re306.pdf", application, values, required)
        applications[course_id] = application

        re336 = TMP / f"RE336_{file_title}.pdf"
        ivals = re336_values(title)
        fill_form(FORMS / "re336.pdf", re336, ivals, ivals)
        re336_forms.append(re336)

    for course_id, title, file_title in COURSES:
        d = CA / course_id
        files = [
            d / "re306-submission-index.md",
            d / "general-information-page.md",
            d / "timed-course-outline.md",
            d / "student-instructions.md",
            d / "instructor-exam-instructions.md",
            d / "proctor-instructions.md",
            d / "regulator-login-requirements.md",
            d / "completion-certificate-template.md",
            d / "college-equivalency-certification-template.md",
            d / "manuscript-density-report.md",
            *sorted((d / "curriculum").glob("lesson-*.md")),
            d / "assessments" / "lesson-quizzes-student.md",
            d / "assessments" / "lesson-quizzes-instructor-key.md",
            d / "assessments" / "remediation-plan.md",
            d / "secure-final-exam" / "form-a-student-version.md",
            d / "secure-final-exam" / "form-a-instructor-version.md",
            d / "secure-final-exam" / "form-b-student-version.md",
            d / "secure-final-exam" / "form-b-instructor-version.md",
        ]
        support = TMP / f"{file_title}_support.pdf"
        build_report(support, f"California RE 306 Submission Binder: {title}", "45-hour correspondence/Internet statutory pre-license course - StateCourse version 1.0", files)
        binder = OUT / f"California_RE306_{file_title}_Submission_Binder.pdf"
        merge(binder, [applications[course_id], support])

    instructor_support = TMP / "RE336_support.pdf"
    instructor_files = [
        CA / "instructor" / "anatoliy-kanevsky-re336-qualification-narrative.md",
        CA / "instructor" / "re336-evidence-matrix.md",
        CA / "instructor" / "re336-filing-checklist.md",
        *[CA / "instructor" / f"re336-course-matrix-{slug}.md" for _, _, slug in [(COURSES[0][0], COURSES[0][1], "principles"), (COURSES[1][0], COURSES[1][1], "practice"), (COURSES[2][0], COURSES[2][1], "mortgage-loan-brokering-and-lending")]],
    ]
    build_report(instructor_support, "California RE 336 Instructor Qualification Package", "Anatoliy Kanevsky - experience-based candidate filing - DRE determination pending", instructor_files)
    merge(OUT / "California_RE336_Anatoliy_Kanevsky_Instructor_Qualification_Binder.pdf", [*re336_forms, instructor_support])

    build_report(
        OUT / "California_Prelicense_Master_Compliance_and_Filing_Readiness.pdf",
        "California StateCourse Pre-License Master Compliance Package",
        "Three separate 45-hour correspondence courses - first submission priority",
        [CA / "official-sources.md", CA / "regulatory-compliance-matrix.md", CA / "course-administration-policy.md", CA / "submission-master-checklist.md"],
    )

    outputs = sorted(OUT.glob("California_*.pdf"))
    if len(outputs) != 8:
        raise ValueError(f"Expected exactly 8 California PDF outputs, found {len(outputs)}")
    for output in outputs:
        reader = PdfReader(output)
        if not reader.pages:
            raise ValueError(f"No pages in {output}")
    print("\n".join(f"{p.name}\t{len(PdfReader(p).pages)} pages\t{p.stat().st_size} bytes" for p in outputs))


if __name__ == "__main__":
    build_all()
