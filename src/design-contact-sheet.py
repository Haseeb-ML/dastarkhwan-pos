from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
files=list(Path('output/design-audit').glob('*.png'))
for language in ['ur','en']:
 chosen=[p for p in files if p.name.startswith(language+'-') and 'mobile' not in p.name]
 sheet=Image.new('RGB',(1200,((len(chosen)+3)//4)*220),'#e8eee2');draw=ImageDraw.Draw(sheet)
 for index,p in enumerate(chosen):
  im=Image.open(p);im.thumbnail((292,192));x=(index%4)*300;y=(index//4)*220;sheet.paste(im,(x,y+20));draw.text((x+4,y+3),p.stem,fill='#173e2c')
 sheet.save('output/design-audit/'+language+'-overview.jpg')
