"""Specimen Loan Estimate — Page 3 (DiStefano file), CFPB H-24 layout.
Continues the completed form used in the Document Overview video series:
ResiCentral LLC / Rocco Carlo DiStefano / loan $1,189,150 @ 7.5% / 30 yr.
Comparisons values computed by amortization of that exact loan."""
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib.colors import black, white, Color

W, H = letter
L, R = 0.55*inch, W-0.55*inch
CW = R-L
grey = Color(.45,.45,.45)
light = Color(.88,.88,.88)

c = canvas.Canvas("/home/user/statecourse/california/video-production/specimens/specimen-loan-estimate-page-3.pdf", pagesize=letter)

def watermark():
    c.saveState()
    c.translate(W/2, H/2); c.rotate(38)
    c.setFont("Helvetica-Bold", 40); c.setFillColor(Color(.55,.55,.55,alpha=.07))
    c.drawCentredString(0, 0, "SPECIMEN — FICTIONAL TRANSACTION")
    c.restoreState()

def bar(y, text, h=16):
    c.setFillColor(black); c.rect(L, y-h, CW, h, stroke=0, fill=1)
    c.setFillColor(white); c.setFont("Helvetica-Bold", 10.5)
    c.drawString(L+5, y-h+4.5, text)
    c.setFillColor(black)
    return y-h

def rule(y, x0=None, x1=None, w=0.6, col=black):
    c.setLineWidth(w); c.setStrokeColor(col)
    c.line(x0 if x0 is not None else L, y, x1 if x1 is not None else R, y)

def checkbox(x, y, checked):
    c.setLineWidth(0.8); c.setStrokeColor(black); c.rect(x, y, 6.5, 6.5, stroke=1, fill=0)
    if checked:
        c.setFont("Helvetica-Bold", 7); c.drawString(x+1.1, y+1.1, "X")

watermark()

y = H-0.5*inch
y = bar(y, "Additional Information About This Loan", h=17)
y -= 6

# ── contact table ─────────────────────────────────────────
col2 = L + CW/2 + 4
lab_w = 78
rows = [
    ("LENDER", "ResiCentral, LLC", "MORTGAGE BROKER", "Canyon Gate Mortgage, Inc."),
    ("NMLS/__ LICENSE ID", "9902481", "NMLS/__ LICENSE ID", "9928654"),
    ("LOAN OFFICER", "Daniel Merced", "LOAN OFFICER", "Alicia Fontaine"),
    ("NMLS/__ LICENSE ID", "9914372", "NMLS/__ LICENSE ID", "9931207"),
    ("EMAIL", "dmerced@resicentral.example", "EMAIL", "afontaine@canyongate.example"),
    ("PHONE", "(813) 555-0142", "PHONE", "(323) 555-0173"),
]
c.setFont("Helvetica", 7.5)
rh = 15
for i,(l1,v1,l2,v2) in enumerate(rows):
    yy = y - i*rh
    for (lab,val,x0) in ((l1,v1,L),(l2,v2,col2)):
        c.setFont("Helvetica-Bold" if i==0 else "Helvetica", 7)
        c.setFillColor(grey)
        c.drawString(x0, yy-9, lab.replace("__",""))
        c.setFillColor(black)
        c.setFont("Helvetica" if i>0 else "Helvetica-Bold", 8.5)
        c.drawString(x0+lab_w, yy-9, val)
    rule(yy-12, L, L+CW/2-4, .4, light); rule(yy-12, col2, R, .4, light)
y -= len(rows)*rh + 10

# ── Comparisons ───────────────────────────────────────────
yb = bar(y, "Comparisons")
c.setFont("Helvetica-Oblique", 8)
c.drawString(L+150, yb+4.5, "")
c.setFillColor(white); c.setFont("Helvetica-Oblique", 8.5)
c.drawRightString(R-5, yb+4.5, "Use these measures to compare this loan with other loans.")
c.setFillColor(black)
y = yb - 8

comp = [
    ("In 5 Years", [("$521,989", "Total you will have paid in principal, interest, mortgage insurance, and loan costs."),
                    ("$64,007", "Principal you will have paid off.")]),
    ("Annual Percentage Rate (APR)", [("7.640%", "Your costs over the loan term expressed as a rate. This is not your interest rate.")]),
    ("Total Interest Percentage (TIP)", [("151.72%", "The total amount of interest that you will pay over the loan term as a\npercentage of your loan amount.")]),
]
for label, lines in comp:
    block_h = 0
    c.setFont("Helvetica-Bold", 9)
    c.drawString(L, y-11, label)
    yy = y
    for val, desc in lines:
        c.setFont("Helvetica-Bold", 9.5)
        c.drawString(L+170, yy-11, val)
        c.setFont("Helvetica", 8.5)
        for j,seg in enumerate(desc.split("\n")):
            c.drawString(L+232, yy-11-j*10, seg)
        yy -= 11*max(1,len(desc.split("\n")))+3
    y = yy - 4
    rule(y+2, w=.5)
y -= 8

# ── Other Considerations ──────────────────────────────────
y = bar(y, "Other Considerations")
y -= 6
oc = [
    ("Appraisal", None,
     "We may order an appraisal to determine the property's value and charge you for this\nappraisal. We will promptly give you a copy of any appraisal, even if your loan does not close.\nYou can pay for an additional appraisal for your own use at your own cost."),
    ("Assumption", ("assumption",),
     "If you sell or transfer this property to another person, we\n[ ] will allow, under certain conditions, this person to assume this loan on the original terms.\n[X] will not allow assumption of this loan on the original terms."),
    ("Homeowner's\nInsurance", None,
     "This loan requires homeowner's insurance on the property, which you may obtain from a\ncompany of your choice that we find acceptable."),
    ("Late Payment", None,
     "If your payment is more than 15 days late, we will charge a late fee of 5% of the monthly\nprincipal and interest payment."),
    ("Refinance", None,
     "Refinancing this loan will depend on your future financial situation, the property value, and\nmarket conditions. You may not be able to refinance this loan."),
    ("Servicing", None,
     "We intend\n[X] to service your loan. If so, you will make your payments to us.\n[ ] to transfer servicing of your loan."),
]
for label, _, text in oc:
    c.setFont("Helvetica-Bold", 9)
    for j,seg in enumerate(label.split("\n")):
        c.drawString(L, y-11-j*10, seg)
    lines = text.split("\n")
    for j,seg in enumerate(lines):
        yy = y-11-j*10
        if seg.startswith("[X]") or seg.startswith("[ ]"):
            checkbox(L+140, yy-1, seg.startswith("[X]"))
            c.setFont("Helvetica", 8.5); c.drawString(L+152, yy, seg[4:])
        else:
            c.setFont("Helvetica", 8.5); c.drawString(L+140, yy, seg)
    y -= 11 + len(lines)*10 - 4
    rule(y+3, w=.4, col=light)
y -= 8

# ── Confirm Receipt ───────────────────────────────────────
y = bar(y, "Confirm Receipt")
y -= 6
c.setFont("Helvetica", 8.5)
for j,seg in enumerate(["By signing, you are only confirming that you have received this form. You do not have to accept this loan because you have signed or",
                        "received this form."]):
    c.drawString(L, y-10-j*10, seg)
y -= 34
sig_w = (CW-30)/2
for i,(who) in enumerate(["Applicant Signature", "Co-Applicant Signature"]):
    x0 = L + i*(sig_w+30)
    rule(y, x0, x0+sig_w-60, .7); rule(y, x0+sig_w-50, x0+sig_w, .7)
    c.setFont("Helvetica", 7)
    c.drawString(x0, y-9, who); c.drawString(x0+sig_w-50, y-9, "Date")
y -= 28

# ── specimen notice + footer ──────────────────────────────
c.setFont("Helvetica-Oblique", 6.5); c.setFillColor(grey)
c.drawString(L, 0.62*inch, "SPECIMEN for StateCourse education. All parties, companies, identifiers, and figures are fictional and for instructional use only. Not a genuine disclosure.")
c.setFillColor(black)
rule(0.56*inch, w=.6)
c.setFont("Helvetica", 6.5)
c.drawString(L, 0.44*inch, "LOAN ESTIMATE  •  GTRIDLEJ_S  0720")
c.drawString(L, 0.35*inch, "07/07/2026 10:17 AM PST")
c.drawRightString(R, 0.44*inch, "PAGE 3 OF 3  •  LOAN ID # 5020047841")
c.drawRightString(R, 0.35*inch, "GTRIDLEJ (INI)")

c.showPage(); c.save()
print("done")
