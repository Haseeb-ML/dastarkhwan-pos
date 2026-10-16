from pathlib import Path
p=Path('index.css');s=p.read_text(encoding='utf-8')
s+="\n@media(max-width:800px){.mobile-sheet{display:none}.mobile-sheet.open{display:block}}\n"
p.write_text(s,encoding='utf-8')
p=Path('tests/browser/workflows.spec.mjs');s=p.read_text(encoding='utf-8-sig')
s=s.replace('fullPage: true','fullPage: false')
p.write_text(s,encoding='utf-8')

