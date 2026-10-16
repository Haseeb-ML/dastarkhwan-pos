from pathlib import Path
from urllib.request import urlopen,Request
import re
from concurrent.futures import ThreadPoolExecutor
css=Path('media/fonts-source.css').read_text()
blocks=re.findall(r'@font-face\s*\{.*?\}',css,re.S)
def cache(entry):
    i,block=entry
    family=re.search(r"font-family: '([^']+)'",block)[1]
    weight=re.search(r'font-weight: (\d+)',block)[1]
    url=re.search(r'url\(([^)]+)\)',block)[1]
    name=family.lower().replace(' ','-')+'-'+weight+'.ttf'
    data=urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=30).read()
    Path('media/'+name).write_bytes(data)
    print(name,len(data))
    return block.replace(url,'/media/'+name)
with ThreadPoolExecutor(max_workers=6) as pool:local=list(pool.map(cache,enumerate(blocks)))
p=Path('index.css');s=p.read_text(encoding='utf-8')
s=re.sub(r"@import url\('https://fonts.googleapis.com[^\n]+\n",'',s)
s=s.replace("@import 'tailwindcss';","@import 'tailwindcss';\n"+'\n'.join(local))
p.write_text(s,encoding='utf-8')
for family in ['dmsans','librefranklin']:
    try:Path('media/'+family+'-OFL.txt').write_bytes(urlopen('https://raw.githubusercontent.com/google/fonts/main/ofl/'+family+'/OFL.txt',timeout=20).read())
    except Exception as e:print(family,str(e))

