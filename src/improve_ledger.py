from pathlib import Path
p=Path('schema.sql');s=p.read_text(encoding='utf-8-sig')
s += "\nCREATE TABLE IF NOT EXISTS cash_movements(id INTEGER PRIMARY KEY,session_id INTEGER REFERENCES cash_sessions(id),source_type TEXT NOT NULL,source_id INTEGER NOT NULL,amount INTEGER NOT NULL,created TEXT NOT NULL,actor INTEGER NOT NULL REFERENCES users(id),UNIQUE(source_type,source_id));\nCREATE INDEX IF NOT EXISTS cash_movement_session ON cash_movements(session_id);\n"
p.write_text(s,encoding='utf-8')
p=Path('erp.mjs');s=p.read_text(encoding='utf-8-sig')
needle=" const cashExpected=session=>"
start=s.index(needle);end=s.index(";\n function dispatch",start)
s=s[:start]+""" const cashEntry=(u,type,id,amount,m)=>{if(m!=='Cash')return;const active=one('SELECT id FROM cash_sessions WHERE closed IS NULL');run('INSERT INTO cash_movements(session_id,source_type,source_id,amount,created,actor) VALUES(?,?,?,?,?,?)',active?.id||null,type,id,amount,now(),u.id);};
 const cashExpected=session=>session.opening+one('SELECT COALESCE(SUM(amount),0) n FROM cash_movements WHERE session_id=?',session.id).n"""+s[end:]
s=s.replace("tendered-applied,m,now(),date(),u.id);run('UPDATE orders","tendered-applied,m,now(),date(),u.id);cashEntry(u,'payment',Number(one('SELECT last_insert_rowid() id').id),applied,m);run('UPDATE orders")
s=s.replace("o.id,amount,m,reason,now(),date(),u.id);run('UPDATE orders","o.id,amount,m,reason,now(),date(),u.id);cashEntry(u,'refund',Number(one('SELECT last_insert_rowid() id').id),-amount,m);run('UPDATE orders")
s=s.replace("if(paid)run('INSERT INTO supplier_payments","if(paid){run('INSERT INTO supplier_payments")
s=s.replace("b.supplierId,id,paid,method(b.method),now(),date(),u.id);audit(u,'purchase.received'","b.supplierId,id,paid,method(b.method),now(),date(),u.id);cashEntry(u,'supplier',Number(one('SELECT last_insert_rowid() id').id),-paid,b.method);}audit(u,'purchase.received'")
s=s.replace("b.supplierId,amount,method(b.method),now(),date(),u.id);audit(u,'supplier.payment'","b.supplierId,amount,method(b.method),now(),date(),u.id);cashEntry(u,'supplier',Number(one('SELECT last_insert_rowid() id').id),-amount,b.method);audit(u,'supplier.payment'")
s=s.replace(".lastInsertRowid);audit(u,'expense',id,b)",".lastInsertRowid);cashEntry(u,'expense',id,-b.amount,b.method);audit(u,'expense',id,b)")
# Backfill old databases once; new databases have no existing cash records.
needle=" const settings=()=>"
migration=""" if(!one('SELECT version FROM migrations WHERE version=2'))transaction(()=>{
  for(const [table,type,sign] of [['payments','payment',1],['refunds','refund',-1],['supplier_payments','supplier',-1],['expenses','expense',-1]])for(const row of all("SELECT * FROM "+table+" WHERE method='Cash'")){
   const session=one('SELECT id FROM cash_sessions WHERE opened<=? AND (closed IS NULL OR closed>=?) ORDER BY id DESC LIMIT 1',row.created,row.created);
   run('INSERT OR IGNORE INTO cash_movements(session_id,source_type,source_id,amount,created,actor) VALUES(?,?,?,?,?,?)',session?.id||null,type,row.id,sign*row.amount,row.created,row.actor);
  }
  run('INSERT INTO migrations(version,applied_at) VALUES(2,?)',now());
 });
"""
s=s.replace(needle,migration+needle)
s=s.replace("if(image&&!image.startsWith('/uploads/')&&!/^https:","if(image&&!image.startsWith('/uploads/')&&!image.startsWith('/media/')&&!/^https:")
p.write_text(s,encoding='utf-8')
p=Path('index.css')
s=p.read_text(encoding='utf-8-sig')
s+="\n@media(max-width:370px){.categories{margin:0 -9px;padding-left:9px;padding-right:9px}.top-actions .connection{font-size:9px;width:auto;padding:0 8px}}\n@media(max-width:800px){.food-info h3{font-size:12px}.food-info strong{font-size:12px}.food-info small{font-size:10px}.sidebar nav button{font-size:9px}}\n"
p.write_text(s,encoding='utf-8')

