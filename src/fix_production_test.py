from pathlib import Path
p=Path('tests/production.test.mjs');s=p.read_text(encoding='utf-8-sig')
s=s.replace("import {join,resolve} from 'node:path';","import {join,resolve,sep} from 'node:path';")
start=s.index(' }finally{await stop();')
s=s[:start]+" }finally{await stop();if(resolve(root).startsWith(resolve(tmpdir())+sep))rmSync(root,{recursive:true,force:true});}\n});\n"
p.write_text(s,encoding='utf-8')

