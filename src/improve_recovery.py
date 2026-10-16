from pathlib import Path
p=Path('Workspace.tsx');s=p.read_text(encoding='utf-8')
start=s.index('const pending=new Map');end=s.index('\nfunction Pill',start)
api="""let actorId:number|null=null;
type PendingOperation={route:string;body:Data;key:string};
function readPending():Record<string,PendingOperation>{try{return JSON.parse(localStorage.getItem('erp-pending-'+actorId)||'{}');}catch{return {};}}
function savePending(p:Record<string,PendingOperation>){localStorage.setItem('erp-pending-'+actorId,JSON.stringify(p));}
async function api(route:string,body?:Data,key?:string){
 const store=readPending(),signature=route+JSON.stringify(body||{});
 const safeRead=['summary','order'].includes(route),write=!!body&&!route.startsWith('auth/')&&!safeRead&&route!=='uploads';
 let recovered=false,pendingSignature=signature;
 if(write){
  const entity=(v:Data)=>String(v.id??v.supplierId??v.ingredientId??'new');
  if(!key){const previous=Object.entries(store).find(([,v])=>v.route===route&&entity(v.body)===entity(body!));if(previous){pendingSignature=previous[0];body=previous[1].body;key=previous[1].key;recovered=true;}}
  key=key||crypto.randomUUID();
  if(route!=='tickets'){
   const existing=await fetch('/api/operations/'+encodeURIComponent(key),{credentials:'same-origin'});
   if(existing.ok){const lookup=await existing.json();if(lookup.found){delete store[pendingSignature];savePending(store);return {...lookup.result,_recovered:true};}}
  }
  store[pendingSignature]={route,body:body!,key};savePending(store);
 }
 let res;try{res=await fetch('/api/'+route,{method:body?'POST':'GET',credentials:'same-origin',headers:body?{'Content-Type':'application/json','Idempotency-Key':key||crypto.randomUUID()}:{},body:body?JSON.stringify(body):undefined});}catch{throw new Error('Connection interrupted. Previous action is retained for safe recovery. Retry before starting another action.');}
 let json;try{json=await res.json();}catch{throw new Error('Server unavailable. Draft and pending action are retained.');}
 if(!res.ok){if(res.status<500){delete store[pendingSignature];savePending(store);}throw Object.assign(new Error(json.error||'Request failed'),{status:res.status});}
 if(route==='bootstrap')actorId=json.user.id;
 if(route==='auth/login')actorId=json.id;
 if(route==='auth/logout')actorId=null;
 if(write){delete store[pendingSignature];savePending(store);}
 return recovered?{...json,_recovered:true}:json;
}
"""
s=s[:start]+api+s[end:]
s=s.replace("setDraft(emptyDraft());onSaved();openInvoice(o.id)","setDraft(emptyDraft());setSheet(false);onSaved();openInvoice(o.id)")
s=s.replace("const result=await api(route,body,key);await refresh();return result;","const result=await api(route,body,key);await refresh();if(result._recovered)setToast('Previous pending action recovered safely.');return result;")
# Phone search treats Pakistani local prefix the same as normalized records.
s=s.replace("query.replace(/[+\\s-]/g,'').toLowerCase()","query.replace(/[+\\s-]/g,'').replace(/^0/,'92').toLowerCase()")
p.write_text(s,encoding='utf-8')
p=Path('server.mjs');s=p.read_text(encoding='utf-8')
needle="   if(path==='/api/uploads'&&req.method==='POST'){"
code="""   if(path.startsWith('/api/operations/')&&req.method==='GET'){
    const op=app.one('SELECT route,result FROM idempotency WHERE actor=? AND key=?',u.id,path.split('/').pop());
    if(!op)return json(res,200,{found:false});
    if(u.role==='Kitchen'&&op.route!=='tickets')fail('Access restricted',403);
    const ownerRoutes=['refunds','orders/cancel','menu/save','menu/archive','ingredients/save','stock/move','suppliers/save','purchases','suppliers/pay','expenses','cash/open','cash/close','settings','tables/save','staff'];
    if(ownerRoutes.includes(op.route))app.owner(u);
    return json(res,200,{found:true,result:JSON.parse(op.result)});
   }
"""
s=s.replace(needle,code+needle)
# Old revisions use their own total and the current ledger, explicitly recomputed.
s=s.replace("Object.assign(o,JSON.parse(old.snapshot),{revision});","Object.assign(o,JSON.parse(old.snapshot),{revision});o.collectible=o.state==='cancelled'?0:Math.max(0,o.total-o.refunded);o.balance=Math.max(0,o.collectible-o.net);o.paymentStatus=o.state==='cancelled'?'Cancelled':o.refunded?'Refunded':o.balance===0?'Paid':o.net>0?'Partial':'Unpaid';")
p.write_text(s,encoding='utf-8')
p=Path('erp.mjs');s=p.read_text(encoding='utf-8')
s=s.replace("const raw=integer(Math.abs(b.qty),1,1000000000);","integer(b.qty,-1000000000,1000000000);const raw=integer(Math.abs(b.qty),1,1000000000);")
# Include immutable reference types in stock adjustment records; do not change units.
# Expenses may be backdated in reports, while cash effects retain the actual posting time.
s=s.replace("if(route==='expenses'){owner(u);const id=","if(route==='expenses'){owner(u);const expenseDate=b.businessDate||date();if(!/^\\d{4}-\\d{2}-\\d{2}$/.test(expenseDate))fail('Invalid expense date');const id=")
s=s.replace("text(b.note,500),now(),date(),u.id).lastInsertRowid","text(b.note,500),now(),expenseDate,u.id).lastInsertRowid")
p.write_text(s,encoding='utf-8')

