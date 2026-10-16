from pathlib import Path
import json
p=Path('Urdu.ts');s=p.read_text(encoding='utf8');s=s.replace('import words from "./urdu.json"\nconst dictionary: Record<string,string> = words','const dictionary: Record<string,string> = '+Path('urdu.json').read_text(encoding='utf8'));p.write_text(s,encoding='utf8')
p=Path('Workspace.tsx');s=p.read_text(encoding='utf8');s=s.replace('<div className="app-shell">','<div className="app-shell" dir="rtl" lang="ur">');s=s.replace('<div className="login-page">','<div className="login-page" dir="rtl" lang="ur">')
s=s.replace('toLocaleString("en-PK", { timeZone: "Asia/Karachi" })','toLocaleString("ur-PK", { timeZone: "Asia/Karachi" })');s=s.replace('toLocaleDateString("en-PK",','toLocaleDateString("ur-PK",')
s=s.replace('    "PKR " +','    "" +',1)
# Show the basic fields openly; notes remain small inputs rather than menus.
s=s.replace('<details className="optional-customer">','<div className="optional-customer">').replace('<summary>گاہک کا نام یا موبائل، اگر ضرورت ہو</summary>','<span className="optional-label">گاہک کا نام، اگر ضرورت ہو</span>')
a=s.index('<div className="optional-customer">');b=s.index('</details>',a);s=s[:b]+'</div>'+s[b+len('</details>'):]
s=s.replace('<details className="optional-discount">','<div className="optional-discount">').replace('<summary>رعایت</summary>','')
a=s.index('<div className="optional-discount">');b=s.index('</details>',a);s=s[:b]+'</div>'+s[b+len('</details>'):]
s=s.replace('<details className="kitchen-note">','<div className="kitchen-note">').replace('<summary>باورچی کے لیے بات</summary>','')
a=s.index('<div className="kitchen-note">');b=s.index('</details>',a);s=s[:b]+'</div>'+s[b+len('</details>'):]
s=s.replace('<details><summary>وزن اور دستیاب مقدار</summary>','<div className="quantity-settings"><h4>وزن اور دستیاب مقدار</h4>')
# Find generated multiline menu details independently.
s=s.replace('<details><summary>وزن اور دستیاب مقدار</summary>', '<div className="quantity-settings"><h4>وزن اور دستیاب مقدار</h4>')
a=s.find('<div className="quantity-settings">');
if a!=-1:
 b=s.index('</details>',a);s=s[:b]+'</div>'+s[b+len('</details>'):]
s=s.replace('value={v.category}', 'value={urdu(v.category)}').replace('value={v.name}', 'value={urdu(v.name)}').replace('value={x.name}', 'value={urdu(x.name)}')
s=s.replace('Kitchen and payment states remain independent.', 'باورچی کو آرڈر پہنچ گیا ہے۔ اب پیسے وصول کریں یا بل دیں۔')
s=s.replace('Neeche scroll kar ke tamam khanay dekhein ?', 'نیچے مزید کھانے دیکھیں')
s=s.replace('Kitchen note (optional)', 'مثلاً مرچ کم رکھیں')
p.write_text(s,encoding='utf8')
p=Path('Design.tsx');s=p.read_text(encoding='utf8');s='import { urdu } from "./Urdu"\n'+s;s=s.replace('{name[0]}','{urdu(name)[0]}').replace('{name}</strong>','{urdu(name)}</strong>').replace('{tagline.toUpperCase()}','{urdu(tagline)}');p.write_text(s,encoding='utf8')
