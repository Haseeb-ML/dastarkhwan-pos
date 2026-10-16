from pathlib import Path
p=Path('invoice_pdf.py');s=p.read_text(encoding='utf-8-sig')
s=s.replace("story += [KeepTogether([t,Spacer(1,12),p(r['footer'],center),p('Saved invoice identity and revision retained on reprint.',center)])]","tail=[t,Spacer(1,12),p(r['footer'],center),p('Saved invoice identity and revision retained on reprint.',center)]\n    story += tail if thermal else [KeepTogether(tail)]\n    if thermal:\n        height=sum(f.wrap(usable-12,1000000)[1]+f.getSpaceBefore()+f.getSpaceAfter() for f in story)+doc.topMargin+doc.bottomMargin+30\n        doc.pagesize=(width,max(400,height))\n        doc.height=doc.pagesize[1]-doc.topMargin-doc.bottomMargin")
s=s.replace("p(item['name']+' - '+item['variant']+'<invalid>' if False else item['name']+' - '+item['variant']","p(item['name']+' - '+item['variant']")
p.write_text(s,encoding='utf-8')

