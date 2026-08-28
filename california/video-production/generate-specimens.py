"""StateCourse Phase-2 SPECIMEN document pack.

One consistent transaction universe (the DiStefano purchase from the Loan Estimate
video series): buyer Rocco Carlo DiStefano purchases 4110 Vanetta Place, Los Angeles
from Malcolm & Diane Everett for $1,399,000 with a $1,189,150 loan at 7.5%/30yr
(P&I $8,314.71) from ResiCentral, LLC. The sellers' existing 2016 loan (Pacific Crest
Bank, $412,000 @ 6.25%) appears as an exception on the preliminary report and is the
subject of the payoff demand. All parties, companies, and figures are fictional.
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import Color, black
from reportlab.pdfgen import canvas as canvas_mod

W, H = letter
MARGIN = 0.9 * inch
GREY = Color(0.42, 0.42, 0.42)
LIGHT = Color(0.80, 0.80, 0.80)

FOOT = ("SPECIMEN — StateCourse instructional document. All parties, companies, amounts, and recording data are fictional. "
        "Not a legal instrument. Not for use in any transaction.")


def watermark(c):
    c.saveState()
    c.setFont("Helvetica-Bold", 84)
    c.setFillColor(Color(0.88, 0.86, 0.83))
    c.translate(W / 2, H / 2)
    c.rotate(38)
    c.drawCentredString(0, 0, "SPECIMEN")
    c.restoreState()


def footer(c, page, pages, doc_id):
    c.saveState()
    c.setStrokeColor(LIGHT)
    c.line(MARGIN, 0.62 * inch, W - MARGIN, 0.62 * inch)
    c.setFont("Helvetica", 6.6)
    c.setFillColor(GREY)
    c.drawString(MARGIN, 0.48 * inch, FOOT)
    c.drawString(MARGIN, 0.36 * inch, doc_id)
    c.drawRightString(W - MARGIN, 0.36 * inch, "Page %d of %d" % (page, pages))
    c.restoreState()


class Doc:
    def __init__(self, path, doc_id, pages):
        self.c = canvas_mod.Canvas(path, pagesize=letter)
        self.doc_id = doc_id
        self.pages = pages
        self.page = 0
        self.y = 0
        self.new_page()

    def new_page(self):
        if self.page:
            self.c.showPage()
        self.page += 1
        watermark(self.c)
        footer(self.c, self.page, self.pages, self.doc_id)
        self.y = H - MARGIN

    def need(self, height):
        if self.y - height < 0.85 * inch:
            self.new_page()

    def spacer(self, pts):
        self.y -= pts

    def head(self, kicker, title):
        c = self.c
        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(GREY)
        c.drawString(MARGIN, self.y, kicker.upper())
        self.y -= 20
        c.setFont("Times-Bold", 17)
        c.setFillColor(black)
        c.drawString(MARGIN, self.y, title)
        self.y -= 8
        c.setLineWidth(1.4)
        c.setStrokeColor(black)
        c.line(MARGIN, self.y, W - MARGIN, self.y)
        self.y -= 16

    def h2(self, text):
        self.need(30)
        self.spacer(6)
        self.c.setFont("Helvetica-Bold", 9.5)
        self.c.setFillColor(black)
        self.c.drawString(MARGIN, self.y, text)
        self.y -= 13

    def para(self, text, size=9, leading=12.2, indent=0, bold=False, first_indent=0):
        import textwrap
        font = "Times-Bold" if bold else "Times-Roman"
        max_chars = int((W - 2 * MARGIN - indent) / (size * 0.472))
        lines = []
        for raw in text.split("\n"):
            lines.extend(textwrap.wrap(raw, max_chars) or [""])
        for i, line in enumerate(lines):
            self.need(leading)
            self.c.setFont(font, size)
            self.c.setFillColor(black)
            x = MARGIN + indent + (first_indent if i == 0 else 0)
            self.c.drawString(x, self.y, line)
            self.y -= leading
        self.spacer(2.5)

    def kv(self, label, value, label_w=2.05 * inch, size=9):
        self.need(14)
        self.c.setFont("Helvetica-Bold", size - 1.2)
        self.c.setFillColor(GREY)
        self.c.drawString(MARGIN, self.y, label.upper())
        self.c.setFont("Times-Roman", size + 0.5)
        self.c.setFillColor(black)
        self.c.drawString(MARGIN + label_w, self.y, value)
        self.y -= 13.5

    def money_row(self, label, value, bold=False, indent=10):
        self.need(13)
        self.c.setFont("Helvetica-Bold" if bold else "Times-Roman", 9.2)
        self.c.setFillColor(black)
        self.c.drawString(MARGIN + indent, self.y, label)
        self.c.drawRightString(W - MARGIN - 4, self.y, value)
        self.y -= 12.6
        if bold:
            self.c.setStrokeColor(black); self.c.setLineWidth(0.8)
            self.c.line(MARGIN + indent, self.y + 9, W - MARGIN, self.y + 9)

    def rule(self):
        self.need(10)
        self.c.setStrokeColor(LIGHT); self.c.setLineWidth(0.6)
        self.c.line(MARGIN, self.y + 3, W - MARGIN, self.y + 3)
        self.y -= 8

    def sigline(self, name, role):
        self.need(40)
        self.spacer(24)
        self.c.setStrokeColor(black); self.c.setLineWidth(0.8)
        self.c.line(MARGIN, self.y, MARGIN + 3.1 * inch, self.y)
        self.y -= 11
        self.c.setFont("Times-Roman", 8.6)
        self.c.drawString(MARGIN, self.y, "%s — %s" % (name, role))
        self.y -= 6

    def save(self):
        self.c.save()


LEGAL = ("Lot 14 of Tract No. 30721, in the City of Los Angeles, County of Los Angeles, State of "
         "California, as per map recorded in Book 741, Pages 38 through 39 of Maps, in the Office of the "
         "County Recorder of said County.  Assessor's Parcel Number: 2375-021-014.  Commonly known as: "
         "4110 Vanetta Place, Los Angeles, CA 91604-2341.")

OUT = "california/video-production/specimens/"

# ── 1. Promissory Note ─────────────────────────────────────────────────────────────
d = Doc(OUT + "specimen-promissory-note.pdf", "StateCourse Specimen N-01 · DiStefano purchase file", 2)
d.head("Specimen instrument — for instruction only", "FIXED-RATE PROMISSORY NOTE")
d.kv("Date", "July 18, 2026 — Los Angeles, California")
d.kv("Property address", "4110 Vanetta Place, Los Angeles, CA 91604-2341")
d.kv("Loan number", "5020047841")
d.spacer(6)
d.h2("1.  BORROWER'S PROMISE TO PAY")
d.para("In return for a loan that I have received, I promise to pay U.S. $1,189,150.00 (this amount is "
       "called “Principal”), plus interest, to the order of the Lender. The Lender is ResiCentral, LLC. "
       "I will make all payments under this Note in the form of cash, check, or money order. I understand that "
       "the Lender may transfer this Note. The Lender or anyone who takes this Note by transfer and who is "
       "entitled to receive payments under this Note is called the “Note Holder.”")
d.h2("2.  INTEREST")
d.para("Interest will be charged on unpaid principal until the full amount of Principal has been paid. "
       "I will pay interest at a yearly rate of 7.500%. The interest rate required by this Section 2 is the rate "
       "I will pay both before and after any default described in Section 6(B) of this Note.")
d.h2("3.  PAYMENTS")
d.para("I will pay principal and interest by making a payment every month. I will make my monthly payment on "
       "the 1st day of each month beginning on September 1, 2026. I will make these payments every month until "
       "I have paid all of the principal and interest and any other charges described below that I may owe under "
       "this Note. If, on August 1, 2056 (the “Maturity Date”), I still owe amounts under this Note, "
       "I will pay those amounts in full on that date. My monthly payment will be in the amount of U.S. $8,314.71. "
       "I will make my monthly payments at 19417 Shumard Oak Drive, Unit 102, Land O Lakes, FL 34638, or at a "
       "different place if required by the Note Holder.")
d.h2("4.  BORROWER'S RIGHT TO PREPAY")
d.para("I have the right to make payments of Principal at any time before they are due, without paying any "
       "prepayment charge. A payment of Principal only is known as a “Prepayment.” When I make a "
       "Prepayment, I will tell the Note Holder in writing that I am doing so.")
d.h2("5.  LATE CHARGE FOR OVERDUE PAYMENTS")
d.para("If the Note Holder has not received the full amount of any monthly payment by the end of 15 calendar "
       "days after the date it is due, I will pay a late charge to the Note Holder in the amount of 5.000% of my "
       "overdue payment of principal and interest. I will pay this late charge promptly, but only once on each "
       "late payment.")
d.h2("6.  ACCELERATION; DEFAULT")
d.para("(A) Default. If I do not pay the full amount of each monthly payment on the date it is due, I will be "
       "in default.\n(B) Acceleration. If I am in default, the Note Holder may send me a written notice telling "
       "me that if I do not pay the overdue amount by a certain date, the Note Holder may require me to pay "
       "immediately the full amount of Principal that has not been paid and all the interest that I owe on that "
       "amount. That date must be at least 30 days after the date on which the notice is mailed to me or "
       "delivered by other means.")
d.h2("7.  DUE-ON-SALE (ALIENATION)")
d.para("If all or any part of the Property or any interest in the Property is sold or transferred without the "
       "Note Holder's prior written consent, the Note Holder may require immediate payment in full of all sums "
       "secured by the Security Instrument described in Section 9 of this Note.")
d.h2("8.  GIVING OF NOTICES; WAIVERS")
d.para("Unless applicable law requires a different method, any notice that must be given to me under this Note "
       "will be given by delivering it or by mailing it by first class mail to me at the Property Address above "
       "or at a different address if I give the Note Holder a notice of my different address. I and any other "
       "person who has obligations under this Note waive the rights of Presentment and Notice of Dishonor.")
d.h2("9.  SECURED NOTE")
d.para("In addition to the protections given to the Note Holder under this Note, a Deed of Trust dated the same "
       "date as this Note (the “Security Instrument”) protects the Note Holder from possible losses "
       "which might result if I do not keep the promises which I make in this Note. That Security Instrument "
       "describes how and under what conditions I may be required to make immediate payment in full of all "
       "amounts I owe under this Note.")
d.sigline("Rocco Carlo DiStefano", "Borrower")
d.save()

# ── 2. Deed of Trust ───────────────────────────────────────────────────────────────
d = Doc(OUT + "specimen-deed-of-trust.pdf", "StateCourse Specimen D-01 · DiStefano purchase file", 2)
d.para("RECORDING REQUESTED BY AND WHEN RECORDED MAIL TO:  ResiCentral, LLC, 19417 Shumard Oak Drive, "
       "Unit 102, Land O Lakes, FL 34638.   Space above this line for Recorder's use.", size=8, leading=10.5)
d.rule()
d.head("Specimen instrument — for instruction only", "DEED OF TRUST")
d.para("This Deed of Trust is made on July 18, 2026, among the Trustor, Rocco Carlo DiStefano, an unmarried man "
       "(“Borrower”); the Trustee, Golden State Title Company, a California corporation "
       "(“Trustee”); and the Beneficiary, ResiCentral, LLC (“Lender”).", bold=False)
d.h2("CONVEYANCE IN TRUST; POWER OF SALE")
d.para("Borrower irrevocably grants and conveys to Trustee, in trust, WITH POWER OF SALE, the following "
       "described property located in the County of Los Angeles, State of California:")
d.para(LEGAL, indent=14, size=8.6, leading=11.4)
d.h2("OBLIGATION SECURED")
d.para("This Deed of Trust secures to Lender: (a) the repayment of the debt evidenced by Borrower's Promissory "
       "Note dated July 18, 2026 in the principal sum of $1,189,150.00, with interest, and all renewals, "
       "extensions and modifications of the Note; and (b) the performance of Borrower's covenants and agreements "
       "under this Security Instrument and the Note. The Note is the debt; this instrument is the remedy.")
d.h2("BORROWER'S COVENANTS")
d.para("1. Payment. Borrower shall promptly pay when due the principal of and interest on the debt evidenced by "
       "the Note, any late charges, and other amounts due under the Note.\n"
       "2. Taxes and Assessments. Borrower shall pay all taxes, assessments, and governmental charges "
       "attributable to the Property before they become delinquent.\n"
       "3. Insurance. Borrower shall keep the improvements now existing or hereafter erected on the Property "
       "insured against loss by fire and hazards included within the term “extended coverage,” in "
       "amounts and with carriers acceptable to Lender, with Lender named under a standard mortgagee clause. "
       "If Borrower fails to maintain coverage, Lender may obtain coverage to protect Lender's interest and "
       "charge the cost to Borrower.\n"
       "4. Preservation and Maintenance. Borrower shall keep the Property in good repair and shall not commit "
       "waste or permit impairment or deterioration of the Property.\n"
       "Failure to perform any covenant in this section is a default under this Security Instrument even where "
       "monthly payments are current.")
d.h2("ASSIGNMENT OF RENTS")
d.para("As additional security, Borrower hereby assigns to Lender the rents of the Property. Prior to "
       "acceleration or abandonment, Borrower shall have the right to collect and retain such rents as they "
       "become due. Upon acceleration or abandonment, Lender or a judicially appointed receiver shall be "
       "entitled to enter upon, take possession of, and manage the Property and to collect the rents of the "
       "Property, including those past due.")
d.h2("ACCELERATION; REMEDIES")
d.para("Upon Borrower's breach of any covenant or agreement, including the covenants to pay when due any sums "
       "secured by this Deed of Trust, Lender, after any notice required by applicable law, may declare all "
       "sums secured by this Deed of Trust to be immediately due and payable and may invoke the POWER OF SALE "
       "and any other remedies permitted by applicable law, following the notice, timing, reinstatement, and "
       "sale procedures that California law prescribes for nonjudicial foreclosure.")
d.h2("DUE-ON-SALE (ALIENATION)")
d.para("If all or any part of the Property or any interest in it is sold or transferred without Lender's prior "
       "written consent, Lender may, at its option, require immediate payment in full of all sums secured by "
       "this Deed of Trust.")
d.h2("RECONVEYANCE")
d.para("Upon payment of all sums secured by this Deed of Trust, Lender shall request Trustee to reconvey the "
       "Property and shall surrender this Deed of Trust and all notes evidencing debt secured by this Deed of "
       "Trust to Trustee. Trustee shall reconvey the Property without warranty to the person or persons legally "
       "entitled to it. Payment of the debt does not clear the record; the recorded reconveyance does.")
d.h2("SUBSTITUTE TRUSTEE")
d.para("Lender, at its option, may from time to time appoint a successor trustee to any Trustee appointed "
       "hereunder by an instrument executed and acknowledged by Lender and recorded in the office of the "
       "Recorder of the county in which the Property is located.")
d.sigline("Rocco Carlo DiStefano", "Trustor (Borrower)")
d.spacer(4)
d.para("[Notary acknowledgment block intentionally omitted from this instructional specimen.]", size=8, leading=10)
d.save()

# ── 3. Preliminary Report ──────────────────────────────────────────────────────────
d = Doc(OUT + "specimen-preliminary-report.pdf", "StateCourse Specimen T-01 · DiStefano purchase file", 2)
d.head("Sierra Pacific Title Company — specimen for instruction only", "PRELIMINARY REPORT")
d.kv("Order number", "SP-2026-118845")
d.kv("Report dated", "July 9, 2026 at 7:30 a.m.")
d.kv("Property", "4110 Vanetta Place, Los Angeles, CA 91604-2341")
d.kv("Escrow officer", "R. Calloway — Unit 4, (800) 555-0147")
d.spacer(4)
d.para("In response to the above referenced application for a policy of title insurance, Sierra Pacific Title "
       "Company hereby reports that it is prepared to issue, or cause to be issued, as of the date hereof, a "
       "Policy of Title Insurance describing the land and the estate or interest therein hereinafter set forth, "
       "insuring against loss which may be sustained by reason of any defect, lien or encumbrance not shown or "
       "referred to as an Exception below or not excluded from coverage pursuant to the printed Schedules, "
       "Conditions and Stipulations of said Policy form. This report (and any supplements or amendments) is "
       "issued solely for the purpose of facilitating the issuance of a policy of title insurance and no "
       "liability is assumed hereby.")
d.h2("SCHEDULE A — ESTATE AND VESTING")
d.para("The estate or interest in the land hereinafter described is: A FEE.  Title to said estate or interest "
       "at the date hereof is vested in: MALCOLM J. EVERETT and DIANE R. EVERETT, husband and wife, as "
       "community property.")
d.h2("LEGAL DESCRIPTION")
d.para(LEGAL, indent=14, size=8.6, leading=11.4)
d.h2("SCHEDULE B — EXCEPTIONS")
d.para("At the date hereof, exceptions to coverage, in addition to the printed Exceptions and Exclusions in "
       "said policy form, would be as follows:")
d.para("1.  General and special taxes and assessments for the fiscal year 2026–2027, a lien not yet due or "
       "payable, and any supplemental taxes or assessments levied pursuant to Chapter 3.5 (commencing with "
       "Section 75) of the Revenue and Taxation Code, arising from a change in ownership or completion of new "
       "construction occurring prior to the date of this report.", indent=14)
d.para("2.  Covenants, conditions and restrictions in an instrument recorded March 3, 1961 in Book 8123, "
       "Page 455 of Official Records, but deleting any covenant, condition or restriction indicating a "
       "preference, limitation or discrimination based on any characteristic protected by applicable law, "
       "to the extent such covenants, conditions or restrictions violate applicable law.", indent=14)
d.para("3.  An easement for public utilities and incidental purposes over the easterly 5 feet of said land, as "
       "granted in an instrument recorded September 12, 1961 as Instrument No. 4471, Official Records.", indent=14)
d.para("4.  A Deed of Trust to secure an indebtedness in the original amount of $520,000.00, dated June 10, "
       "2016, recorded June 14, 2016 as Instrument No. 2016-0712334, Official Records. Trustor: Malcolm J. "
       "Everett and Diane R. Everett. Beneficiary: Pacific Crest Bank. (An unreleased deed of trust of record; "
       "see Requirement No. 2 below.)", indent=14)
d.h2("REQUIREMENTS — TO BE SATISFIED BEFORE ISSUANCE")
d.para("1.  A completed Statement of Information from each of the sellers and from the proposed buyer, to "
       "permit elimination of matters affecting persons of similar name.", indent=14)
d.para("2.  A full reconveyance of the Deed of Trust shown as Exception No. 4, or satisfactory arrangements "
       "for payoff and reconveyance through this transaction. Payment of the debt does not clear the record; "
       "the recorded document does.", indent=14)
d.para("3.  Recordation of a Grant Deed from the vested owners to the proposed insured, and of the new Deed of "
       "Trust to be insured, in proper sequence.", indent=14)
d.h2("NOTE — PRINTED EXCLUSIONS")
d.para("The policy form to be issued contains printed exclusions from coverage, including without limitation "
       "matters of governmental regulation and zoning, eminent domain, matters created, suffered, assumed or "
       "agreed to by the insured claimant, matters known to the insured claimant and not disclosed in writing "
       "to the Company, and, under the standard-coverage form, matters which would be disclosed by a correct "
       "survey of the land. This report addresses record title only and is not a substitute for a survey.")
d.save()

# ── 4. Payoff Demand Statement ─────────────────────────────────────────────────────
d = Doc(OUT + "specimen-payoff-demand.pdf", "StateCourse Specimen P-01 · DiStefano purchase file", 1)
d.head("Pacific Crest Bank — Loan Servicing — specimen for instruction only", "PAYOFF DEMAND STATEMENT")
d.kv("Demand date", "July 9, 2026")
d.kv("Loan number", "8834412")
d.kv("Borrowers", "Malcolm J. Everett and Diane R. Everett")
d.kv("Secured property", "4110 Vanetta Place, Los Angeles, CA 91604-2341")
d.kv("Requested by", "Sierra Pacific Title Company, Order No. SP-2026-118845")
d.kv("Figures good through", "July 15, 2026")
d.spacer(8)
d.h2("AMOUNT REQUIRED TO PAY THIS LOAN IN FULL")
d.money_row("Unpaid principal balance", "$412,000.00")
d.money_row("Interest paid to June 30, 2026 — accrued interest July 1 through July 15, 2026 (15 days at $70.55 per diem)", "$1,058.25")
d.money_row("Demand statement fee", "$30.00")
d.money_row("Reconveyance processing fee", "$45.00")
d.money_row("County recording fee (full reconveyance)", "$18.00")
d.spacer(2)
d.money_row("TOTAL AMOUNT DUE — good through July 15, 2026", "$413,151.25", bold=True)
d.spacer(8)
d.para("PER DIEM: If funds are received after July 15, 2026, add interest of $70.55 for each additional day "
       "(computed on the unpaid principal balance at the note rate of 6.250% on a 365-day basis). A demand "
       "that expires before disbursement must be refreshed; this demand is void after August 8, 2026.", bold=True)
d.h2("CONDITIONS")
d.para("1. Funds must be received by wire transfer or other collected funds. Payments received in uncollected "
       "funds will delay the release of the lien until the funds have cleared.\n"
       "2. Interest accrues to the date of payoff. The total above will not match the borrower's last monthly "
       "statement balance, because interest is paid in arrears and accrues to the day of payoff, and because "
       "this demand includes fees connected with the release of the lien.\n"
       "3. Upon payment in full, the beneficiary will direct the trustee to execute a full reconveyance of the "
       "deed of trust recorded June 14, 2016 as Instrument No. 2016-0712334, and the reconveyance will be "
       "delivered for recording within the time required by law.\n"
       "4. Any overpayment of $10.00 or more will be refunded to the borrowers.")
d.h2("WIRE SECURITY NOTICE")
d.para("Wire instructions for this payoff are furnished separately and WILL NEVER BE CHANGED BY EMAIL. Before "
       "sending funds, verify the wire instructions by telephone using a number obtained independently from "
       "your escrow instructions or this bank's published directory listing — never a number contained in an "
       "email transmitting instructions.", bold=True)
d.save()

print("done")
