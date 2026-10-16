from pathlib import Path
p=Path('Workspace.tsx');s=p.read_text(encoding='utf-8')
s=s.replace('<article className={\'food-card \'+(selected.length?',"<article onClick={()=>!sold&&!busy&&(f.variants.length===1?add(f,f.variants[0]):setVariant(f))} className={'food-card '+(selected.length?")
s=s.replace("onClick={()=>f.variants.length===1?add(f,f.variants[0]):setVariant(f)}","onClick={e=>{e.stopPropagation();f.variants.length===1?add(f,f.variants[0]):setVariant(f);}}")
s=s.replace('useContext,createContext,useMemo','useContext,createContext')
p.write_text(s,encoding='utf-8')
p=Path('erp.mjs');s=p.read_text(encoding='utf-8')
s=s.replace("integer(v.step,1,1000000);","integer(v.step,1,1000000);if(['piece','bottle'].includes(v.unit)&&v.step%1000)fail('Pieces and bottles require whole-unit increments');")
p.write_text(s,encoding='utf-8')
p=Path('index.css');s=p.read_text(encoding='utf-8')
s+="\n.chart-card,.top-card{min-width:0}.bars{gap:12px;overflow-x:auto;padding-bottom:24px}.bars>div{min-width:32px}.bars small{top:auto;bottom:-20px}\n"
p.write_text(s,encoding='utf-8')

