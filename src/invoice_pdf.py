import sys,json,os
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_RIGHT,TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from datetime import datetime
from zoneinfo import ZoneInfo
from io import BytesIO
import re
from reportlab.platypus import Flowable
from arabic_reshaper import reshape
from bidi.algorithm import get_display

class RTLText(Flowable):
    def __init__(self,text,style):
        Flowable.__init__(self)
        self.text=text
        self.style=style
    def getSpaceAfter(self):return self.style.spaceAfter
    def wrap(self,width,height):
        self.width=width
        self.lines=[]
        current=''
        for word in self.text.split():
            candidate=(current+' '+word).strip()
            visual=get_display(reshape(candidate))
            if current and pdfmetrics.stringWidth(visual,'ERP-Arabic',self.style.fontSize)>width:
                self.lines.append(get_display(reshape(current)))
                current=word
            else:current=candidate
        if current:self.lines.append(get_display(reshape(current)))
        self.height=max(1,len(self.lines))*self.style.leading
        return self.width,self.height
    def draw(self):
        c=self.canv;c.setFont('ERP-Arabic',self.style.fontSize)
        c.setFillColor(self.style.textColor or colors.black)
        for n,line in enumerate(self.lines):c.drawRightString(self.width,self.height-(n+1)*self.style.leading+3,line)



def designed_a4(o, p, money, font, bold):
    green=colors.HexColor('#164b3b'); gold=colors.HexColor('#c89556'); ink=colors.HexColor('#233c32'); pale=colors.HexColor('#f0f5f1')
    width,height=A4; margin=36; usable=width-2*margin-12
    buf=BytesIO()
    doc=SimpleDocTemplate(buf,pagesize=A4,leftMargin=margin,rightMargin=margin,topMargin=32,bottomMargin=42,title=o['number']+' | Restaurant Invoice',author=o['restaurant']['name'])
    body=ParagraphStyle('InvoiceBody',fontName=font,fontSize=10,leading=17,textColor=ink,spaceAfter=0)
    small=ParagraphStyle('InvoiceSmall',parent=body,fontSize=8,leading=14,textColor=colors.HexColor('#65756c'))
    white=ParagraphStyle('InvoiceWhite',parent=body,textColor=colors.white,fontSize=10,leading=18)
    title=ParagraphStyle('InvoiceBrand',parent=white,fontSize=28,leading=40)
    number=ParagraphStyle('InvoiceNumber',parent=white,fontName=bold,fontSize=17,leading=25)
    label=ParagraphStyle('InvoiceLabel',parent=body,fontSize=9,leading=16)
    r=o['restaurant']
    # A custom vector masthead keeps the brand sharp at any print resolution.
    class Masthead(Flowable):
        def wrap(self,w,h): self.width=w; self.height=126; return w,self.height
        def draw(self):
            c=self.canv; c.setFillColor(green); c.roundRect(0,0,self.width,126,12,fill=1,stroke=0)
            c.setFillColor(gold); c.rect(0,0,self.width,4,fill=1,stroke=0)
            c.setStrokeColor(colors.HexColor('#326451')); c.setLineWidth(.6)
            for radius in [22,32,42]: c.circle(43,83,radius,stroke=1,fill=0)
            c.setStrokeColor(gold); c.setLineWidth(1.5); c.circle(43,83,18,stroke=1,fill=0)
            c.setFont(bold,15); c.setFillColor(colors.HexColor('#edd6b4')); c.drawCentredString(43,78,'D')
            logo=r.get('logo','')
            if logo.startswith('/uploads/'):
                image=os.path.join(os.path.dirname(__file__),'data','uploads',os.path.basename(logo))
                if os.path.exists(image): c.drawImage(image,19,59,width=48,height=48,preserveAspectRatio=True,anchor='c',mask='auto')
            def drawtext(text,style,x,y,w):
                f=p(text,style); _,fh=f.wrap(w,100); f.drawOn(c,x,y-fh)
            drawtext(r['name'],title,100,112,self.width-122)
            drawtext(r['tagline'],white,100,67,self.width-122)
            drawtext('گاہک کا بل',white,22,43,125)
            c.setFont(bold,13); c.setFillColor(colors.white); c.drawString(22,14,o['number'])
            details=' | '.join(str(v) for v in [r.get('address','Rawalpindi, Pakistan'),'Phone: '+str(r.get('phone') or '051 6122024')] if v)
            drawtext(details,ParagraphStyle('Contact',parent=white,fontSize=8,leading=13),170,29,self.width-192)
    story=[Masthead(),Spacer(1,16)]
    timestamp=datetime.fromisoformat(o['created'].replace('Z','+00:00')).astimezone(ZoneInfo('Asia/Karachi')).strftime('%d/%m/%Y  %H:%M')
    meta=Table([[p('تاریخ اور وقت',small),p('گاہک',small),p('کھانے کا طریقہ',small)],
                [Paragraph(timestamp,body),p((o.get('customer') or {}).get('name','Walk-in guest'),body),p(o['service']+' | '+o['place'],body)]],colWidths=[usable*.33,usable*.33,usable*.34])
    meta.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),pale),('TOPPADDING',(0,0),(-1,0),10),('BOTTOMPADDING',(0,1),(-1,1),10),('LEFTPADDING',(0,0),(-1,-1),12),('RIGHTPADDING',(0,0),(-1,-1),12),('VALIGN',(0,0),(-1,-1),'TOP')]))
    story += [meta,Spacer(1,14)]
    status=Table([[p(o['paymentStatus'],label),p('نسخہ '+str(o['revision']),small)]],colWidths=[usable*.65,usable*.35])
    status.setStyle(TableStyle([('BOX',(0,0),(-1,-1),.5,colors.HexColor('#d7e3da')),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),('LEFTPADDING',(0,0),(-1,-1),12),('RIGHTPADDING',(0,0),(-1,-1),12)]))
    story += [status,Spacer(1,18)]
    rows=[[p(v,white) for v in ['رقم','فی عدد قیمت','تعداد','کھانے کی تفصیل']]]
    for item in o['items']:
        qty=format(item['qty']/1000,'g')
        rows.append([p(money(item['amount']),body),p(money(item['price']),small),p(qty+' '+item['unit'],small),p(item['name']+' - '+item['variant'],body)])
    table=Table(rows,colWidths=[usable*.20,usable*.19,usable*.15,usable*.46],repeatRows=1)
    table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),green),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#f7f9f6')]),('VALIGN',(0,0),(-1,-1),'TOP'),('LINEBELOW',(0,1),(-1,-1),.4,colors.HexColor('#e1e8e1')),('TOPPADDING',(0,0),(-1,-1),9),('BOTTOMPADDING',(0,0),(-1,-1),9),('LEFTPADDING',(0,0),(-1,-1),10),('RIGHTPADDING',(0,0),(-1,-1),10)]))
    story += [table,Spacer(1,18)]
    totals=[('کھانوں کی رقم',o['subtotal'])]
    for key,field in [('رعایت','discount'),('ٹیکس','tax'),('اضافی رقم','serviceCharge')]:
        if o[field]: totals.append((key,-o[field] if field=='discount' else o[field]))
    totals += [('کل رقم',o['total']),('وصول شدہ رقم',o['received'])]
    if o['refunded']: totals += [('واپس کی گئی رقم',o['refunded']),('خالص وصول شدہ رقم',o['net'])]
    totals += [('باقی رقم',o['balance'])]
    if o.get('change'): totals.append(('گاہک کو واپس کیے گئے پیسے',o['change']))
    total_index=next(i for i,(key,_) in enumerate(totals) if key=='کل رقم')
    summary=Table([[p(money(v),white if i==total_index else body),p(key,white if i==total_index else label)] for i,(key,v) in enumerate(totals)],colWidths=[usable*.28,usable*.39],hAlign='RIGHT')
    summary.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),pale),('BACKGROUND',(0,total_index),(-1,total_index),green),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),('LEFTPADDING',(0,0),(-1,-1),12),('RIGHTPADDING',(0,0),(-1,-1),12)]))
    thanks=Table([[p(r.get('footer') or 'تشریف لانے کا شکریہ۔',ParagraphStyle('Thanks',parent=body,fontSize=12,leading=21)),p('یہ محفوظ بل ہے۔',small)]],colWidths=[usable*.65,usable*.35])
    thanks.setStyle(TableStyle([('LINEABOVE',(0,0),(-1,0),.6,gold),('TOPPADDING',(0,0),(-1,-1),12),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0)]))
    story += [KeepTogether([summary,Spacer(1,20),thanks])]
    def footer(c,d):
        c.setStrokeColor(gold);c.setLineWidth(.5);c.line(margin,29,width-margin,29)
        c.setFont(font,8);c.setFillColor(colors.HexColor('#65756c'));c.drawString(margin,17,o['number']);c.drawRightString(width-margin,17,str(d.page))
    doc.build(story,onFirstPage=footer,onLaterPages=footer)
    return buf.getvalue()

def generate(o,size='A4'):
    for name,filename in [('ERP','arial.ttf'),('ERP-Bold','arialbd.ttf')]:
        filename=os.path.join(os.environ.get('WINDIR','C:/Windows'),'Fonts',filename)
        if name not in pdfmetrics.getRegisteredFontNames() and os.path.exists(filename): pdfmetrics.registerFont(TTFont(name,filename))
    arabic=os.environ.get('ERP_FONT_ARABIC',os.path.join(os.path.dirname(__file__),'media','noto-sans-arabic.ttf'))
    if 'ERP-Arabic' not in pdfmetrics.getRegisteredFontNames():pdfmetrics.registerFont(TTFont('ERP-Arabic',arabic))
    if 'ERP' not in pdfmetrics.getRegisteredFontNames():
        for name,filename in [('ERP','dm-sans-400.ttf'),('ERP-Bold','dm-sans-700.ttf')]:pdfmetrics.registerFont(TTFont(name,os.path.join(os.path.dirname(__file__),'media',filename)))
    font='ERP' if 'ERP' in pdfmetrics.getRegisteredFontNames() else 'Helvetica'
    bold='ERP-Bold' if 'ERP-Bold' in pdfmetrics.getRegisteredFontNames() else 'Helvetica-Bold'
    thermal=size=='80mm'; width=226.77 if thermal else A4[0]; margin=12 if thermal else 42
    usable=width-margin*2
    buf=BytesIO()
    doc=SimpleDocTemplate(buf,pagesize=(width,max(400,320+len(o['items'])*60)) if thermal else A4,rightMargin=margin,leftMargin=margin,topMargin=22 if thermal else 36,bottomMargin=25)
    styles=getSampleStyleSheet()
    normal=ParagraphStyle('Body',fontName=font,fontSize=8 if thermal else 10,leading=12 if thermal else 15,spaceAfter=5)
    heading=ParagraphStyle('TitleERP',parent=normal,fontName=bold,fontSize=15 if thermal else 24,leading=20 if thermal else 30,textColor=colors.black if thermal else colors.HexColor('#164b3b'),spaceAfter=5)
    small=ParagraphStyle('SmallERP',parent=normal,fontSize=7 if thermal else 8,leading=10)
    right=ParagraphStyle('RightERP',parent=normal,alignment=TA_RIGHT)
    center=ParagraphStyle('CenterERP',parent=small,alignment=TA_CENTER)
    translations=json.load(open(os.path.join(os.path.dirname(__file__),'urdu.json'),encoding='utf-8'))
    def tr(value):
        text=str(value)
        if text in translations:return translations[text]
        for key in sorted(translations,key=len,reverse=True):
            if len(key) >= 3:
                text=re.sub(r"(?<![A-Za-z])"+re.escape(key)+r"(?![A-Za-z])",lambda _:translations[key],text)
        return text
    def p(value,style=normal):
        value=tr(value)
        return RTLText(value,style) if re.search(r'[\u0600-\u06ff]',value) else Paragraph(escape(value),style)
    money=lambda v:format(v/100,',.2f')+' روپے'
    if not thermal: return designed_a4(o,p,money,font,bold)
    r=o['restaurant']; story=[]
    if r.get('logo','').startswith('/uploads/'):
        from reportlab.platypus import Image
        path=os.path.join(os.path.dirname(__file__),'data','uploads',os.path.basename(r['logo']))
        if os.path.exists(path):
            img=Image(path,width=48,height=48,kind='proportional'); story.append(img)
    story += [p(r.get('name') or 'Dastarkhwan',heading),p(r.get('tagline') or 'Desi Kitchen',small),p(r.get('address') or 'Rawalpindi, Pakistan',small)]
    story.append(p('Phone: '+(r.get('phone') or '051 6122024'),small))
    if r.get('taxId'):story.append(p('Business / Tax ID: '+r['taxId'],small))
    story += [Spacer(1,12),p('گاہک کا بل '+o['number'],normal),p('نسخہ '+str(o['revision'])+' | '+o['paymentStatus'],small)]
    timestamp=datetime.fromisoformat(o['created'].replace('Z','+00:00')).astimezone(ZoneInfo('Asia/Karachi')).strftime('%d %b %Y, %I:%M %p')
    story += [p(timestamp+' (Asia/Karachi)',small),p(o['service']+' | '+o['place'],small),p('گاہک: '+(o.get('customer') or {}).get('name','Walk-in guest'),small),Spacer(1,12)]
    if thermal:
        rows=[[p('Item / quantity',small),p('Amount',small)]]
        for item in o['items']: rows.append([p(item['name']+' - '+item['variant']+' / '+str(item['qty']/1000)+' '+item['unit']+' @ '+money(item['price']),small),p(money(item['amount']),small)])
        widths=[usable*.67,usable*.33]
    else:
        rows=[[p(x,small) for x in ['ITEM / VARIANT','QTY / UNIT','UNIT PRICE','AMOUNT']]]
        for item in o['items']: rows.append([p(item['name']+' - '+item['variant']),p(str(item['qty']/1000)+' '+item['unit'],small),p(money(item['price']),small),p(money(item['amount']),small)])
        widths=[usable*.43,usable*.17,usable*.2,usable*.2]
    table=Table(rows,colWidths=widths,repeatRows=1,hAlign='LEFT')
    table.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('BACKGROUND',(0,0),(-1,0),colors.HexColor('#edf5f1') if not thermal else colors.whitesmoke),('LINEBELOW',(0,0),(-1,0),1,colors.HexColor('#164b3b')),('LINEBELOW',(0,1),(-1,-1),.3,colors.HexColor('#e5e4de')),('TOPPADDING',(0,0),(-1,-1),7 if thermal else 10),('BOTTOMPADDING',(0,0),(-1,-1),7 if thermal else 10),('LEFTPADDING',(0,0),(-1,-1),3 if thermal else 7),('RIGHTPADDING',(0,0),(-1,-1),3 if thermal else 7)]))
    story += [table,Spacer(1,15)]
    totals=[('Subtotal',o['subtotal']),('Discount',-o['discount']),('Tax',o['tax']),('Service charge',o['serviceCharge']),('Grand total',o['total']),('Payments received',o['received']),('Refunds / reversals',o['refunded']),('Net received',o['net']),('Outstanding balance',o['balance']),('Cash change returned',o.get('change',0))]
    t=Table([[p(k,small),p(money(v),right)] for k,v in totals],colWidths=[usable*.55,usable*.45])
    t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LINEABOVE',(0,4),(-1,4),1,colors.HexColor('#164b3b')),('BACKGROUND',(0,4),(-1,4),colors.whitesmoke),('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4)]))
    hh_logo=os.path.join(os.path.dirname(__file__),'media','hh-tech-hub-logo.png')
    footer_elements=[t,Spacer(1,10),p(r.get('footer') or 'تشریف لانے کا شکریہ۔',center),p('فون نمبر: '+(r.get('phone') or '051 6122024'),center)]
    if os.path.exists(hh_logo):
        from reportlab.platypus import Image as RLImage
        footer_elements += [Spacer(1,6),RLImage(hh_logo,width=65,height=22,kind='proportional'),p('Powered by HH Tech Hub',center)]
    tail=footer_elements+[p('نسخہ '+str(o['revision'])+' · '+o['number'],center)]
    story += tail if thermal else [KeepTogether(tail)]
    if thermal:
        height=sum(f.wrap(usable-12,1000000)[1]+f.getSpaceBefore()+f.getSpaceAfter() for f in story)+doc.topMargin+doc.bottomMargin+30
        doc.pagesize=(width,max(400,height))
        doc.height=doc.pagesize[1]-doc.topMargin-doc.bottomMargin
    def footer(c,d):
        c.setFont(font,7);c.setFillColor(colors.grey);c.drawRightString(width-margin,12,'Page '+str(d.page))
    doc.build(story,onFirstPage=footer,onLaterPages=footer)
    return buf.getvalue()
if __name__=='__main__':
    sys.stdin.reconfigure(encoding='utf-8'); data=json.load(sys.stdin);sys.stdout.buffer.write(generate(data,sys.argv[1] if len(sys.argv)>1 else 'A4'))

