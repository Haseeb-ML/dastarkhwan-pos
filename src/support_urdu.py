from pathlib import Path
p=Path('invoice_pdf.py');s=p.read_text(encoding='utf-8')
s=s.replace("from io import BytesIO","""from io import BytesIO
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
""")
s=s.replace("font='ERP' if", """arabic=os.environ.get('ERP_FONT_ARABIC',os.path.join(os.path.dirname(__file__),'media','noto-sans-arabic.ttf'))
    if 'ERP-Arabic' not in pdfmetrics.getRegisteredFontNames():pdfmetrics.registerFont(TTFont('ERP-Arabic',arabic))
    if 'ERP' not in pdfmetrics.getRegisteredFontNames():
        for name,filename in [('ERP','dm-sans-400.ttf'),('ERP-Bold','dm-sans-700.ttf')]:pdfmetrics.registerFont(TTFont(name,os.path.join(os.path.dirname(__file__),'media',filename)))
    font='ERP' if""")
s=s.replace("p=lambda v,style=normal:Paragraph(escape(str(v)),style)","p=lambda v,style=normal:RTLText(str(v),style) if re.search(r'[\\u0600-\\u06ff]',str(v)) else Paragraph(escape(str(v)),style)")
p.write_text(s,encoding='utf-8')
p=Path('Workspace.tsx');s=p.read_text(encoding='utf-8')
s=s.replace("function Login({onLogin}:{onLogin:()=>Promise<void>}){","function Login({onLogin}:{onLogin:()=>Promise<void>}){\n const [mode,setMode]=useState(''),[setup,setSetup]=useState(false);useEffect(()=>{api('health').then(h=>{setMode(h.mode);setSetup(h.setupRequired);}).catch(()=>{});},[]);")
s=s.replace('<h2>Sign in to Dastarkhwan</h2>','<h2>{setup?\'Initial Owner setup\':\'Sign in to Dastarkhwan\'}</h2>')
s=s.replace("fields={[{name:'username',label:'Username'},{name:'password',label:'Password',type:'password'}]} initial={{username:'owner'}} submit={async v=>{await api('auth/login',v);await onLogin();}} label=\"Sign in\"","fields={[...(setup?[{name:'setupToken',label:'Installation setup token'},{name:'name',label:'Owner name'}]:[]),{name:'username',label:'Username'},{name:'password',label:'Password',type:'password'}]} initial={{username:'owner'}} submit={async v=>{if(setup)await api('auth/setup',v);await api('auth/login',{username:v.username,password:v.password});await onLogin();}} label={setup?'Create Owner account':'Sign in'}")
s=s.replace('<p className="login-help">Local development:', '{mode===\'development\'&&<p className="login-help">Local development:')
s=s.replace('Kitchen: kitchen</p></div></main></div>','Kitchen: kitchen</p>}</div></main></div>')
p.write_text(s,encoding='utf-8')
p=Path('server.mjs');s=p.read_text(encoding='utf-8')
s=s.replace("o.refunded?'Refunded':o.balance===0","o.balance===0")
p.write_text(s,encoding='utf-8')

