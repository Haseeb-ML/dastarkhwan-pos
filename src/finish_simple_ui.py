from pathlib import Path
p=Path('erp.mjs');s=p.read_text(encoding='utf8');a=s.index('  const transaction = (fn) => {');s=s[:a]+'''  if (!all('PRAGMA table_info(orders)').some(c=>c.name==='preparation'))
    db.exec("ALTER TABLE orders ADD COLUMN preparation TEXT CHECK(preparation IS NULL OR preparation IN ('Prepared','Not prepared'))");

'''+s[a:]
a=s.index('  const owner = (u) => {');s=s[:a]+'''  const photoMapFile=new URL('./media/dish-photos.json',import.meta.url);
  try {
    for(const photo of JSON.parse(readFileSync(photoMapFile,'utf8'))) {
      if(!photo.image) continue;
      run("UPDATE menu SET image=? WHERE name=? AND image IN ('/media/karahi.jpg','/media/curry.jpg','/media/biryani.jpg','/media/bbq.jpg','/media/naan.jpg')",photo.image,photo.name);
    }
  } catch { /* Client uploads remain authoritative. */ }

'''+s[a:]
s=s.replace("UPDATE orders SET state='cancelled',reason=?,version=version+1 WHERE id=?","UPDATE orders SET state='cancelled',reason=?,preparation=?,version=version+1 WHERE id=?")
s=s.replace('        b.reason,\n        o.id,\n      )\n      run(\n        "UPDATE tickets','        b.reason,\n        b.preparation,\n        o.id,\n      )\n      run(\n        "UPDATE tickets')
s=s.replace("AND o.state!='cancelled'\",from,to);", "AND (o.state!='cancelled' OR o.preparation='Prepared')\",from,to);")
s=s.replace('const missingCosts=costLines.filter(i=>i.cost===null).length;','const missingCosts=costLines.filter(i=>i.cost===null).length + all("SELECT id FROM orders WHERE business_date BETWEEN ? AND ? AND state=\'cancelled\' AND preparation IS NULL",from,to).length;')
s=s.replace("const netSales=activeOrders.reduce((n,o)=>n+o.subtotal-o.discount,0)-sum('refunds');", "const netSales=activeOrders.reduce((n,o)=>{const food=o.subtotal-o.discount;return n+food-(o.total?round(BigInt(o.refunded)*BigInt(food),o.total):0)},0);")
p.write_text(s,encoding='utf8')
p=Path('Workspace.tsx');s=p.read_text(encoding='utf8')
s=s.replace('src={f.image || "/media/no-photo.svg"}','src={f.image || ""}')
s=s.replace('                  <img\n                    src={f.image || ""}', '                  {f.image ? <img\n                    src={f.image}')
s=s.replace('                    loading="lazy"\n                  />\n                  <button','                    loading="lazy"\n                  /> : <div className="no-dish-photo"><Icon name="menu" size={38}/><span>Apni photo add karein</span></div>}\n                  <button',1)
s=s.replace('const [view, setView] = useState("Kitchen board")','const [view, setView] = useState(data.user.role === "Kitchen" ? "Kitchen board" : "Active orders")')
s=s.replace('            {t}\n          </button>','            {({"Kitchen board":"Rasoi ke orders","Active orders":"Chaltay orders","Tables":"Tables","Order history":"Purane orders","Invoices":"Bills","Held drafts":"Rokay huay orders"} as Record<string,string>)[t] || t}\n          </button>',1)
s=s.replace('            key={t}\n            className={view === t','            key={t}\n            aria-label={t}\n            className={view === t',1)
s=s.replace('                      <strong>{o.number}</strong>','                      <strong>{o.number}</strong>\n                      <div className="ordered-foods">{o.items.map((item:Data)=><span key={item.id}>{item.qty/1000} × {item.name} ({item.variant})</span>)}</div>',1)
s=s.replace('Khanay ki sale − refunds − dish ki lagat − roz ke kharchay. Tax / service munafay mein shamil nahi.','Sale ki tareekh ke mutabiq: khanay ki sale − wapsi − lagat − kharchay. Tax / service shamil nahi. Tayyar cancelled khanay ki lagat bhi shamil hai.')
s=s.replace('<strong className="bill-hint">Bill banayein aur payment lein</strong>','<strong className="bill-hint">Bill banayein aur payment lein</strong>')
s=s.replace('          <button\n            disabled={!!draft.editId || busy}', '          <button\n            disabled={!!draft.editId || busy}')
s=s.replace('            key={s}\n            disabled={!!draft.editId','            key={s}\n            aria-label={s}\n            disabled={!!draft.editId',1)
s=s.replace('src={item.image}', 'src={item.image || photos.curry}')
p.write_text(s,encoding='utf8')
