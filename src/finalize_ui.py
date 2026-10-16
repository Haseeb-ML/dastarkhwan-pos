from pathlib import Path
p=Path('Workspace.tsx');s=p.read_text(encoding='utf-8')
s=s.replace("const paise=(v:any)=>{const s=String(v);if(!/^\\d+(\\.\\d{1,2})?$/.test(s))throw new Error('Enter a positive amount with up to two decimal places');return Math.round(Number(s)*100);};","const paise=(v:any)=>{const s=String(v);if(!/^\\d+(\\.\\d{1,2})?$/.test(s))throw new Error('Enter a positive amount with up to two decimal places');const n=Math.round(Number(s)*100);if(!Number.isSafeInteger(n)||n>10000000000)throw new Error('Amount is outside the supported range');return n;};")
s=s.replace("return Math.round(Number(s)*1000);};","const n=Math.round(Number(s)*1000);if(!Number.isSafeInteger(n)||Math.abs(n)>1000000000)throw new Error('Quantity is outside the supported range');return n;};")
s=s.replace("const emptyDraft=():Draft","const lineAmount=(price:number,qty:number)=>Number((BigInt(price)*BigInt(qty)+500n)/1000n);\nconst emptyDraft=():Draft")
s=s.replace("Math.round(x.price*x.qty/1000)","lineAmount(x.price,x.qty)").replace("Math.round(item.price*item.qty/1000)","lineAmount(item.price,item.qty)")
s=s.replace(":{...emptyDraft(),service:editing.service"," :{...emptyDraft(),items:d.items,service:editing.service")
s=s.replace("useEffect(()=>{if(live){setO(live);setRevision(live.revision);}},[live?.version]);","useEffect(()=>{let current=true;if(!live)return;if(revision===live.revision){setO(live);return;}fetch('/api/invoices/'+id+'/data?revision='+revision).then(async r=>{if(!r.ok)throw new Error((await r.json()).error);return r.json();}).then(r=>{if(current)setO(r);}).catch(e=>{if(current)setError(e.message);});return()=>{current=false;};},[revision,live?.version]);")
s=s.replace('<div className="receipt-brand"><div><h2>{o.restaurant.name}','<div className="receipt-brand"><div>{o.restaurant.logo&&<img className="logo-preview" src={o.restaurant.logo} alt="Restaurant logo"/>}<h2>{o.restaurant.name}')
s=s.replace("{o.balance>0&&o.state!=='cancelled'&&<button","{revision===live.revision&&o.balance>0&&o.state!=='cancelled'&&<button")
s=s.replace("{data.user.role==='Owner'&&o.net>0&&<button","{revision===live.revision&&data.user.role==='Owner'&&o.net>0&&<button")
s=s.replace('<p>Kitchen and payment states remain independent.</p>','<p>Kitchen and payment states remain independent.</p>{revision!==live.revision&&<p className="external-note">Historical invoice revision. Choose the latest revision to receive payment or refund. Payment figures show the current ledger.</p>}')
s=s.replace('onClick={()=>setStep(\'share\')}','disabled={revision!==o.revision} onClick={()=>setStep(\'share\')}')
# Filter orders by date and real customer/name/order identifiers.
s=s.replace("[filter,setFilter]=useState('All'),[action", "[filter,setFilter]=useState('All'),[from,setFrom]=useState(''),[to,setTo]=useState(''),[action")
s=s.replace("(o.number+' '+o.place+' '+(o.customer?.phone||''))","(o.number+' '+o.place+' '+(o.customer?.phone||'')+' '+(o.customer?.name||'')+' '+o.created+' '+(o.business_date||''))")
s=s.replace("o.paymentStatus===filter)));","o.paymentStatus===filter))&&(!from||o.business_date>=from)&&(!to||o.business_date<=to));")
needle="{view==='Kitchen board'?<div"
s=s.replace(needle,"{!kitchen&&['Active orders','Order history','Invoices'].includes(view)&&<div className='date-filter'><label>From date<input type='date' value={from} onChange={e=>setFrom(e.target.value)}/></label><label>To date<input type='date' value={to} onChange={e=>setTo(e.target.value)}/></label></div>}"+needle)
# Supplier cards show their purchase history alongside payment history.
s=s.replace("<h4>Payments</h4>{data.supplierPayments","<h4>Purchases</h4>{data.purchases.filter((p:Data)=>p.supplier_id===s.id).map((p:Data)=><small className='block' key={p.id}>Purchase #{p.id} · {displayDate(p.created)} · {money(p.total)}</small>)}<h4>Payments</h4>{data.supplierPayments")
p.write_text(s,encoding='utf-8')
p=Path('server.mjs');s=p.read_text(encoding='utf-8')
s=s.replace("    if(parts[4]==='pdf'){","    if(parts[4]==='data')return json(res,200,o);\n    if(parts[4]==='pdf'){")
p.write_text(s,encoding='utf-8')
p=Path('erp.mjs');s=p.read_text(encoding='utf-8')
s=s.replace(" ORDER BY id DESC LIMIT 1000"," ORDER BY id DESC")
s=s.replace(" ORDER BY sm.id DESC LIMIT 500"," ORDER BY sm.id DESC")
p.write_text(s,encoding='utf-8')
p=Path('Design.tsx');s=p.read_text(encoding='utf-8')
start=s.index('type Food =');end=s.index('export const nav',start)
s=s[:start]+s[end:]
p.write_text(s,encoding='utf-8')

