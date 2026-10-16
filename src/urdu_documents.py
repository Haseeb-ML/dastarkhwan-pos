from pathlib import Path
import json
p=Path('urdu.json');d=json.loads(p.read_text(encoding='utf8'));d.update({'Item / quantity':'کھانا اور تعداد','Amount':'رقم','QTY / UNIT':'تعداد اور اکائی','UNIT PRICE':'فی عدد قیمت','Refunds / reversals':'واپس کیے گئے پیسے','Outstanding balance':'باقی رقم','Cash change returned':'بقایا واپس','Thank you for dining with us.':'تشریف لانے کا شکریہ۔','Saved invoice identity and revision retained on reprint.':'یہ محفوظ بل ہے۔','Invalid integer amount or quantity':'رقم یا تعداد درست لکھیں۔','Menu saved. Existing invoice prices retained.':'کھانا محفوظ ہو گیا۔','Prepare & download PDF':'بل محفوظ کریں'})
p.write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf8')
p=Path('invoice_pdf.py');s=p.read_text(encoding='utf8');a=s.index("    p=lambda v,style=normal:");b=s.index("    r=o['restaurant'];",a);s=s[:a]+'''    translations=json.load(open(os.path.join(os.path.dirname(__file__),'urdu.json'),encoding='utf-8'))
    def tr(value):
        text=str(value)
        if text in translations:return translations[text]
        for key in sorted(translations,key=len,reverse=True):
            if key and key in text:text=text.replace(key,translations[key])
        return text
    def p(value,style=normal):
        value=tr(value)
        return RTLText(value,style) if re.search(r'[\\u0600-\\u06ff]',value) else Paragraph(escape(value),style)
    money=lambda v:format(v/100,',.2f')+' روپے'
''' +s[b:];s=s.replace("'CUSTOMER INVOICE '","'گاہک کا بل '").replace("'Revision '","'نسخہ '").replace("'Customer: '","'گاہک: '");p.write_text(s,encoding='utf8')
p=Path('Workspace.tsx');s=p.read_text(encoding='utf8').replace('x.jsx("div", { className: "order-body"','x.jsxs("div", { className: "order-body"').replace('x.jsx("footer", { className: "order-footer"','x.jsxs("footer", { className: "order-footer"');p.write_text(s,encoding='utf8')
p=Path('erp.mjs');s=p.read_text(encoding='utf8');s=s.replace('category = text(b.category),','category = (()=>{const input=text(b.category);const translations=JSON.parse(readFileSync(new URL("./urdu.json",import.meta.url),"utf8"));return ["Karahi & Handi","Biryani & Pulao","BBQ & Sajji","Paratha & Breads","Daal & Sabzi","Sides","Breakfast & Specials","Desserts","Drinks"].find(c=>translations[c]===input) || input})(),');p.write_text(s,encoding='utf8')
