from pathlib import Path
import json,re
p=Path('Urdu.ts');d=json.loads(Path('urdu.json').read_text(encoding='utf8'));d.update({'DESI KITCHEN':'دیسی کھانے','Sign in to Dastarkhwan':'دسترخوان میں داخل ہوں','Local development: owner / Demo@2026!':'نمونے کا کھاتہ: owner، پاس ورڈ: Demo@2026!','Cashier: cashier · Kitchen: kitchen':'ملازم: cashier، باورچی: kitchen','Connected · Shared database':'رابطہ قائم ہے','Connection interrupted':'رابطہ بند ہے','Create Owner account':'مالک کا کھاتہ بنائیں','Create initial Owner':'مالک کا کھاتہ بنائیں','Opening cash PKR':'شروع کی نقد رقم، روپے','Counted cash PKR':'گنے ہوئے پیسے، روپے','Kitchen status':'کھانے کی حالت','Payment status':'پیسوں کی حالت','Kitchen board':'باورچی خانے کے آرڈر','Dish photo credits':'تصویروں کے حوالے','Food menu':'کھانوں کی فہرست','Staff':'ملازمین','Restaurant':'ہوٹل','Audit log':'پچھلے کام','Customer profile':'گاہک کی تفصیل','Record stock movement':'سامان کی مقدار لکھیں','Supplier payment':'سپلائر کو رقم دیں','Opening cash':'شروع کی نقد رقم','Counted cash':'گنے ہوئے پیسے','Open cash session':'نقد حساب شروع کریں','Review cash closing':'نقد حساب دیکھیں','No open cash session':'نقد حساب شروع نہیں ہوا','Cash session open':'نقد حساب جاری ہے','Cash, card and bank/wallet are recorded tenders.':'وصول شدہ رقم اور طریقہ درج کریں۔','On desktop, attach the downloaded PDF in WhatsApp before sending. Handoff is not confirmed delivery.':'واٹس ایپ میں محفوظ کیا ہوا بل ساتھ لگائیں، نمبر دیکھیں اور بھیجیں۔','PDF prepared. Confirm the recipient inside your sharing app.':'بل تیار ہے۔ بھیجنے سے پہلے گاہک کا نمبر دیکھ لیں۔','Refund lowers the collectible value; it does not create new customer debt.':'واپس کیے گئے پیسے الگ درج ہوں گے۔ گاہک پر نیا ادھار نہیں بنے گا۔','No saved orders yet. Create a guest order to get started.':'ابھی کوئی آرڈر نہیں۔ نیا آرڈر کھول کر کھانا منتخب کریں۔','No customers. Guest orders remain available.':'ابھی کوئی گاہک درج نہیں۔ نام لکھے بغیر بھی آرڈر لے سکتے ہیں۔','Manual consumption · quantities stored to 0.001 base unit':'جو سامان آئے یا استعمال ہو، اس کی مقدار لکھیں۔','Receiving increases stock once. Later supplier payments do not receive stock again.':'سامان وصول کرنے پر مقدار بڑھے گی۔ باقی پیسے دینے سے سامان دوبارہ نہیں بڑھے گا۔','Quantity (base unit)':'مقدار','Unit cost PKR':'ایک اکائی کی قیمت، روپے','Receive purchase once':'خریداری محفوظ کریں','Return to sign in':'داخل ہونے کے صفحے پر واپس جائیں','Prepare & download PDF':'بل محفوظ کریں','1. Prepare & download PDF':'بل محفوظ کریں','Open WhatsApp':'واٹس ایپ کھولیں','Handoff is not confirmed delivery.':'واٹس ایپ میں نمبر دیکھ کر خود بھیجیں۔','opening':'شروع کا سامان','consumption':'استعمال','wastage':'ضائع ہوا','adjustment':'درستگی','stock-in':'سامان آیا','Plain Roti':'سادہ روٹی'})
Path('urdu.json').write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf8')
helper='''
export function urdu(value:any):any {
 if(Array.isArray(value))return value.map(urdu)
 if(typeof value!=="string")return value
 const key=value.trim()
 if(dictionary[key])return dictionary[key]
 if(/^Table \\d+$/.test(key))return "میز "+key.split(" ")[1]
 if(/^PKR /.test(key))return key.slice(4)+" روپے"
 if(key.startsWith("Choose variant"))return "مقدار منتخب کریں — "+urdu(key.split(/[·?]/).pop()?.trim())
 if(key.startsWith("Neeche scroll"))return "نیچے مزید کھانے دیکھیں"
 if(key.includes("order lines ki lagat"))return "کچھ پرانے آرڈروں کی لاگت درج نہیں تھی۔ ان کا درست منافع معلوم نہیں۔ نئے کھانوں کی لاگت ضرور لکھیں۔"
 if(key.startsWith("Khanay ki sale −"))return "منافع = کھانوں کی آمدن − بنانے کی لاگت − خرچے"
 if(key.startsWith("Add to order #"))return "آرڈر میں کھانا شامل کریں "+key.split("#")[1]
 if(key.startsWith("Print "))return "پرنٹ کریں "+key.slice(6)
 if(key.startsWith("Opening "))return "شروع کی رقم: "+key.slice(8).replace("Expected","موجودہ رقم")
 if(key.startsWith("Customer · "))return "گاہک — "+key.slice(11)
 return value
}
'''
p.write_text('const dictionary: Record<string,string> = '+json.dumps(d,ensure_ascii=False,indent=2)+'\n'+helper,encoding='utf8')
p=Path('preview_order_panel.mjs');s=p.read_text(encoding='utf8');s=re.sub(r"await page.getByRole\('button',\{name:.*?\}\).click\(\);","await page.locator('form button[type=submit], form button.primary').first().click();",s,count=1);p.write_text(s,encoding='utf8')
p=Path('Workspace.tsx');s=p.read_text(encoding='utf8');s=s.replace('throw Error(`Select at least one dish`);','throw Error(`پہلے کم از کم ایک کھانا منتخب کریں`);\n                if (!e && !l.pending && !l.editId && l.service === `Dine-in` && !Number(l.tableId)) { document.querySelector(`.desktop-order .order-body, .mobile-sheet.open .order-body`)?.scrollTo({top:0,behavior:`smooth`}); throw Error(`اوپر میز منتخب کریں یا پارسل کا بٹن دبائیں، پھر بل بنائیں`); }');p.write_text(s,encoding='utf8')
