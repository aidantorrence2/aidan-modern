from pathlib import Path
import json, math
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import simpleSplit

ROOT=Path('/workspace/scratch/0e6023c67dfb')
OUT=ROOT/'output/pdf'
OUT.mkdir(parents=True,exist_ok=True)
PDF=OUT/'Aidan-Torrence_Between-Addresses_Creative-Treatment.pdf'
W,H=842,595
INK='#22241F'; BG='#F1EEE6'; MUTED='#64685F'; ACCENT='#8E482D'; LINE='#C8C8BB'
c=canvas.Canvas(str(PDF),pagesize=(W,H))
c.setTitle('Between Addresses - proposed New York womenswear editorial - Aidan Torrence')
c.setAuthor('Aidan Torrence - creative proposal prepared for review')
styles={
 'body':ParagraphStyle('body',fontName='Helvetica',fontSize=11,leading=16,textColor=HexColor(INK)),
 'small':ParagraphStyle('small',fontName='Helvetica',fontSize=9,leading=13,textColor=HexColor(MUTED)),
 'white':ParagraphStyle('white',fontName='Helvetica',fontSize=11,leading=16,textColor=HexColor(BG)),
}
def para(s,x,y,w,style='body'):
 p=Paragraph(s,styles[style]); _,h=p.wrap(w,600); p.drawOn(c,x,y-h); return y-h
def txt(s,x,y,size=11,font='Helvetica',color=INK):
 c.setFillColor(HexColor(color));c.setFont(font,size);c.drawString(x,y,s)
def line(x,y,w):
 c.setStrokeColor(HexColor(LINE));c.setLineWidth(.6);c.line(x,y,x+w,y)
def page(n,title,sub='PROPOSED CREATIVE DIRECTION / FOR AIDAN\'S REVIEW'):
 c.setFillColor(HexColor(BG));c.rect(0,0,W,H,fill=1,stroke=0)
 txt('AIDAN TORRENCE',42,557,10,'Helvetica-Bold')
 txt(sub,260,557,8,'Helvetica',MUTED)
 line(42,542,758)
 txt(title,42,500,34,'Times-Roman')
 txt('NEW YORK  |  21-28 OCTOBER 2026 TRAVEL WINDOW',42,30,8,'Helvetica',MUTED)
 txt(str(n).zfill(2),777,30,9,'Helvetica-Bold',ACCENT)
def block(title,text,x,y,w):
 txt(title.upper(),x,y,9,'Helvetica-Bold',ACCENT)
 return para(text,x,y-14,w)
def person(cx,base,h=95,coat=ACCENT,gesture=0):
 c.setFillColor(HexColor('#D1AF92'));c.circle(cx,base+h*.88,h*.075,fill=1,stroke=0)
 c.setFillColor(HexColor(coat));p=c.beginPath();p.moveTo(cx-h*.12,base+h*.78);p.lineTo(cx+h*.12,base+h*.78);p.lineTo(cx+h*.2,base+h*.28);p.lineTo(cx-h*.2,base+h*.28);p.close();c.drawPath(p,fill=1,stroke=0)
 c.setStrokeColor(HexColor(INK));c.setLineWidth(max(2,h*.045));c.line(cx-h*.06,base+h*.3,cx-h*.12-gesture,base);c.line(cx+h*.06,base+h*.3,cx+h*.16+gesture,base)
 c.setLineWidth(max(2,h*.035));c.line(cx-h*.1,base+h*.72,cx-h*.23-gesture,base+h*.4);c.line(cx+h*.1,base+h*.72,cx+h*.24,base+h*.45)
def frame(x,y,w,h,kind):
 c.setFillColor(HexColor('#D6D4C7'));c.rect(x,y,w,h,fill=1,stroke=0)
 c.saveState();p=c.beginPath();p.rect(x,y,w,h);c.clipPath(p,stroke=0)
 if kind==0:
  c.setFillColor(HexColor('#A7AA9A'));c.rect(x,y,w*.35,h,fill=1,stroke=0)
  c.setStrokeColor(HexColor('#8D9284'))
  for yy in range(int(y),int(y+h),17):c.line(x,yy,x+w*.35,yy)
  person(x+w*.58,y+12,h*.82,ACCENT,6)
 elif kind==1:
  c.setFillColor(HexColor('#909687'));c.rect(x,y,w,h,fill=1,stroke=0)
  c.setFillColor(HexColor('#E4DECA'));c.rect(x+w*.18,y,w*.5,h,fill=1,stroke=0)
  person(x+w*.48,y+18,h*.82,'#333B38')
 elif kind==2:
  c.setFillColor(HexColor('#9AA3A2'));c.rect(x,y,w,h,fill=1,stroke=0)
  c.setFillColor(HexColor('#D9B397'));c.ellipse(x+w*.23,y+h*.3,x+w*.77,y+h*1.04,fill=1,stroke=0)
  c.setFillColor(HexColor('#323B36'));c.ellipse(x-w*.1,y-h*.35,x+w*1.1,y+h*.47,fill=1,stroke=0)
  c.setStrokeColor(HexColor('#5F4838'));c.line(x+w*.54,y+h*.68,x+w*.54,y+h*.55)
 elif kind==3:
  c.setFillColor(HexColor('#A1A89A'));c.rect(x,y,w,h,fill=1,stroke=0)
  c.setStrokeColor(HexColor('#D9DDCF'));c.setLineWidth(2)
  for xx in range(int(x),int(x+w),28):c.line(xx,y,xx,y+h)
  person(x+w*.57,y+13,h*.83,'#6D4C45',3)
 elif kind==4:
  c.setFillColor(HexColor('#B9A789'));c.rect(x,y,w,h,fill=1,stroke=0)
  c.setFillColor(HexColor('#343D38'));p=c.beginPath();p.moveTo(x+w*.12,y);p.lineTo(x+w*.38,y+h);p.lineTo(x+w*.88,y+h);p.lineTo(x+w*.76,y);p.close();c.drawPath(p,fill=1,stroke=0)
  c.setStrokeColor(HexColor('#E7DCCA'));c.setLineWidth(3);c.line(x+w*.47,y+h,x+w*.58,y)
 else:
  c.setFillColor(HexColor('#989D8B'));c.rect(x,y,w,h,fill=1,stroke=0)
  c.setFillColor(HexColor('#D3C4A9'));c.rect(x,y+h*.25,w,h*.14,fill=1,stroke=0)
  person(x+w*.56,y+15,h*.8,'#BCB99C',0)
 c.restoreState()

page(1,'Between Addresses')
txt('A WOMAN IN TRANSIT. A WARDROBE WITH ITS OWN HISTORY.',44,458,12,'Helvetica-Bold',ACCENT)
para('One woman moves through an ordinary New York day without a fixed destination. On the street, at a doorway and in the pause between places, her clothes shift from protection to expression: a long coat becomes a moving shape, a structured jacket softens against a wall, and an evening silhouette appears in daylight.',44,423,400)
para('The city is a lived setting rather than a landmark backdrop. The photographs move between full silhouettes and intimate portraits, pairing the texture of 35mm film with a digital edit. The mood is self-possessed, tactile and slightly restless; the clothing remains legible in every sequence.',44,309,400)
block('Proposed scope','One model. Eight looks. A compact exterior route. A proposed edit of 10-12 photographs, shaped with the selected stylist and publication.',44,197,400)
block('Status','Creative direction proposed for review. Aidan\'s New York travel window is confirmed. Shoot day, team, casting, locations, brands and publication remain unconfirmed.',44,113,400)
frame(490,115,300,330,0)
txt('GRAPHIC COMPOSITION STUDY / NOT A PORTFOLIO PHOTOGRAPH',490,96,7,'Helvetica',MUTED)
c.showPage()

page(2,'Light, movement, proximity')
para('Illustrated composition board: these original graphic studies communicate framing, palette and gesture. They are not photographs, booked locations or evidence of previous work. A photographic reference edit is still needed before an editor-facing package is complete.',42,462,758,'small')
cards=[('01 / WALK','Full look; coat catches the stride.'),('02 / THRESHOLD','A narrow frame holds the silhouette.'),('03 / PORTRAIT','Direct expression, soft open shade.'),('04 / REFLECTION','Layer the city without hiding clothes.'),('05 / DETAIL','Lapel, sleeve and hand; tactile close-up.'),('06 / STILLNESS','An unhurried final frame.')]
for i,(t,d) in enumerate(cards):
 col=i%3; rr=i//3;x=42+col*258;y=293-rr*194
 frame(x,y,240,135,i);txt(t,x,y-15,8,'Helvetica-Bold',ACCENT);para(d,x,y-22,240,'small')
palette=[('#333B38','INK'),('#CEC8B8','STONE'),('#8E482D','RUST'),('#A1A89A','CELADON'),('#D1AF92','WARM SKIN')]
for i,(color,label) in enumerate(palette):
 x=42+i*150;c.setFillColor(HexColor(color));c.rect(x,50,24,10,fill=1,stroke=0);txt(label,x+31,51,7,'Helvetica',MUTED)
c.showPage()

page(3,'Eight looks, one character')
para('Styling brief: sculptural autumn layers, visible construction and a restrained palette. Separate designers across the edit; each look must hold its own in a full-length frame. This is a wardrobe brief, not a confirmed pull list.',42,461,758)
looks=[('01','Arrival','Long tailored coat, fine knit, fluid trouser','Walking full length'),('02','Structure','Strong-shoulder jacket, straight skirt, simple boot','Doorway silhouette'),('03','Softness','Textured knit, narrow skirt, considered proportion','Open-shade portrait'),('04','Movement','Pleated or fluid dress beneath a sharp outer layer','Stride and fabric motion'),('05','Interruption','A restrained rust or oxblood look against stone','Static full look'),('06','Ease','Trouser suit with a relaxed shirt and flat shoe','Seated or leaning frame'),('07','After hours','Evening silhouette photographed in daylight','Reflection and medium frame'),('08','Departure','Light sculptural outer layer with a clean line','Distant closing portrait')]
y=395
for num,name,wardrobe,shot in looks:
 line(42,y+18,758);txt(num,44,y,12,'Times-Roman',ACCENT);txt(name,82,y,11,'Helvetica-Bold');para(wardrobe,200,y+3,365,'small');para(shot,601,y+3,190,'small');y-=38
block('Sourcing approach','The selected stylist proposes actual designers and sample routes. Brand names, garments, availability, loan conditions and expenses must be verified before they are presented as secured. No paid hire, deposit or sample responsibility is assumed.',42,100,758)
c.showPage()

page(4,'A small, coherent production')
left=42;right=440
block('Photography','Proposed 35mm film and digital. Mostly natural light: open shade, soft backlight and a brief harder-light sequence if conditions permit. Mix full-length, three-quarter, portrait and detail frames. Keep grading coherent and skin natural.',left,455,355)
block('Beauty','Proposed understated skin, defined brows and lived-in hair that can move. One subtle change for the closing looks. Hair and makeup artist still to be cast; these are creative notes, not an agreed service.',left,332,355)
block('Location brief','New York exterior textures: stone or painted walls, a threshold, glass reflections and a quiet walking stretch. Prefer one compact route after a scout. No specific property access, permission, changing space or location booking is assumed.',left,208,355)
block('Proposed model / team','One agency model, the stylist, hair and makeup, and Aidan as photographer. Agency casting is prospective. No model, stylist or additional crew is booked. Stylist interest is not a confirmed team.',right,455,355)
block('Proposed session sequence','00:00-00:45 styling / beauty / fit checks\n<br/>00:45-01:45 looks 1-3: movement and structure\n<br/>01:45-02:45 looks 4-6: texture and portrait\n<br/>02:45-03:30 looks 7-8: reflections and close\n<br/>A planning estimate only; allow revisions with the team.',right,332,355)
block('Date and delivery','Shoot to be selected within 21-28 October, subject to Aidan, team and editor agreement. Final shoot day, weather alternative, delivery date and publication deadline must be agreed before a commissioning request is represented as production-ready.',right,174,355)
c.showPage()

page(5,'Turn the treatment into a letter','INTERNAL ACTION SHEET / NOT FOR FORWARDING TO A MAGAZINE')
para('The creative treatment above is now written. The remaining gaps are a photographic reference edit and actual production decisions. No editor has accepted this story and no pull letter has been issued.',42,463,758)
block('1 / Confirm one stylist','Recommended first NY conversation: Gabriela Langone, who expressed interest. Marley Cohen is another interested contact for concept development. These are candidate conversations only, not bookings. Send the reviewed response and this direction only after Aidan approves the exact reply.',42,388,355)
block('2 / Make the visual board photographic','Replace or supplement the graphic studies with a tight, verified edit of Aidan\'s own relevant frames and properly identified references. The old proposal\'s referenced image files were absent from the repository; do not substitute unrelated pictures or claim these studies are photographs.',42,256,355)
block('3 / Resolve the production facts','With the stylist: select the actual model/casting route, HMU, proposed brands/looks, location/permissions, shoot day, fallback and delivery plan. Confirm any costs and sample obligations with Aidan. These cannot be turned into confirmed facts by writing a deck.',42,113,355)
block('Priority magazine routes','HOLLYWAY: explicit conditional letter route; establish a no-fee editorial arrangement separately from its paid placement offer.\n<br/><br/>F Word / REGIA: warm requests for the actual pitch/team or moodboard; a letter is not promised.\n<br/><br/>Jejune: only adapt if the story has a real socially aware basis. A documented reuse / deadstock approach could be proposed if the stylist can actually source and substantiate it.\n<br/><br/>DEVIN: concept/moodboard review for issue fit. Miami Shoot: a separate Miami proposal after dates and team are known.',440,388,355)
block('Approval and exclusivity','Human replies and material submissions remain unsent for review. Choose one publication for any accepting exclusive story. Do not promise this same finished story to multiple accepting titles. No publication, fee, copyright transfer, insurance or sample liability is accepted by this document.',440,144,355)
c.showPage()
c.save()

import fitz
d=fitz.open(PDF)
for i,p in enumerate(d):
 p.get_pixmap(matrix=fitz.Matrix(1,1)).save(str(OUT/f'preview-{i+1}.png'))
text='\n\n'.join(p.get_text() for p in d)
(ROOT/'Between-Addresses-treatment.txt').write_text(text)
print(json.dumps({'pdf':str(PDF),'pages':len(d),'bytes':PDF.stat().st_size,'text_chars':len(text)}))
