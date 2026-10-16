from pathlib import Path
p=Path('server.mjs');s=p.read_text(encoding='utf-8-sig')
s=s.replace("server:{middlewareMode:true,hmr:{server}}","server:{middlewareMode:true,hmr:{server},watch:{ignored:['**/src/data/**','**/src/output/**','**/src/test-results/**','**/src/tests/**','**/src/build/**','**/src/node_modules/**']}}")
p.write_text(s,encoding='utf-8')
p=Path('Workspace.tsx');s=p.read_text(encoding='utf-8')
s=s.replace('<input type={f.type','<input aria-label={f.label} type={f.type')
s=s.replace('<textarea value={values[f.name]','<textarea aria-label={f.label} value={values[f.name]')
p.write_text(s,encoding='utf-8')
start=s.index('Connected')
print([hex(ord(c)) for c in s[start:start+30]])

