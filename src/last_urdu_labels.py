from pathlib import Path
import json
p=Path('Urdu.ts');s=p.read_text(encoding='utf8');d=json.loads(Path('urdu.json').read_text(encoding='utf8'));d.update({'view':'','Plate':'پلیٹ','Piece':'عدد','Full':'پورا','Half':'آدھا','Owner':'مالک','Cashier':'کیشیئر','Kitchen':'باورچی خانہ','Staff':'عملہ'})
Path('urdu.json').write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf8')
s='const dictionary: Record<string,string> = '+json.dumps(d,ensure_ascii=False,indent=2)+'\n\n'+s[s.index('export function urdu'):]
s=s.replace('if(dictionary[key])return dictionary[key]','if(Object.prototype.hasOwnProperty.call(dictionary,key))return dictionary[key]')
p.write_text(s,encoding='utf8')
p=Path('Workspace.tsx');s=p.read_text(encoding='utf8').replace('document.querySelector(`.desktop-order .order-body, .mobile-sheet.open .order-body`)','(document.querySelector(`.mobile-sheet.open .order-body`) || document.querySelector(`.desktop-order .order-body`))');p.write_text(s,encoding='utf8')
Path('output/URDU_UPDATE.md').write_text('اردو سکرین\n\nکھانا منتخب کریں، تعداد لکھیں، بل بنائیں۔ میز یا پارسل منتخب کرنا سامنے دکھائی دیتا ہے۔ آرڈر کی فہرست الگ اسکرول ہوتی ہے اور بل کا بٹن سامنے رہتا ہے۔ کھانے، قیمت، تصویر اور بنانے کی لاگت مالک خود بدل سکتا ہے۔ روز، ہفتے اور مہینے کا حساب دستیاب ہے۔ درست منافع کے لیے کھانوں کی لاگت اور خرچے درج کرنا ضروری ہے۔\n\nصارف کی ہدایت کے مطابق اس تبدیلی پر ٹیسٹ یا بلڈ نہیں چلائے گئے۔\n',encoding='utf8')
