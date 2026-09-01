from reportlab.pdfgen import canvas
from reportlab.lib.colors import Color
import pypdfium2 as pdfium

CREAM = Color(243/255,232/255,210/255)
NAVY = Color(0x1b/255,0x2a/255,0x4a/255)
BRICK = Color(0xA6/255,0x3C/255,0x3C/255)
GREY = Color(0x5a/255,0x62/255,0x70/255)

W,H = 625,390
c = canvas.Canvas("/tmp/card.pdf", pagesize=(W,H))
c.setFillColor(CREAM)
c.roundRect(0,0,W,H,18,stroke=0,fill=1)
c.setFillColor(BRICK)
c.rect(48,H-330,4,270,stroke=0,fill=1)
c.setFillColor(NAVY)
c.setFont("Helvetica-Bold", 30)
c.drawString(70,H-90,"Section A: Lender")
c.drawString(70,H-128,"Charges")
rows = [("Points","$1,665"),("Broker Fee","$12,872"),("Lender Fee","$1,595")]
y = H-190
for label,val in rows:
    c.setFillColor(GREY)
    c.setFont("Helvetica", 22)
    c.drawString(78,y,"✓  " + label)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 22)
    c.drawRightString(W-45,y,val)
    y -= 58
c.save()

img = pdfium.PdfDocument("/tmp/card.pdf")[0].render(scale=2).to_pil().convert("RGB")
img.save("/tmp/claude-0/-home-user-statecourse/00dc35d2-c036-51a4-9e84-f22aee4b1599/scratchpad/card-fix.png")
print(img.size)
