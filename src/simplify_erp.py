from pathlib import Path
p=Path('erp.mjs');s=p.read_text(encoding='utf8')
anchor='  const transaction = (fn) => {'
s=s.replace(anchor,'''  // Nullable cost preserves unknown historic costs rather than inventing profit.
  for (const table of ['variants', 'order_items']) {
    if (!all('PRAGMA table_info(' + table + ')').some(c => c.name === 'cost'))
      db.exec('ALTER TABLE ' + table + ' ADD COLUMN cost INTEGER CHECK(cost IS NULL OR cost>=0)');
  }

'''+anchor)
s=s.replace('note,batch) VALUES(?,?,?,?,?,?,?,?,?,?)','note,batch,cost) VALUES(?,?,?,?,?,?,?,?,?,?,?)')
s=s.replace('        batch,\n      )','        batch,\n        v.cost,\n      )',1)
s=s.replace('        money(v.price)\n','        money(v.price)\n        if (v.cost !== null && v.cost !== undefined) money(v.cost)\n',1)
s=s.replace('      audit(u, "menu.saved", id, b)', '''      for (let i=0; i<b.variants.length; i++) {
        const v=b.variants[i];
        const target=v.id || all('SELECT id FROM variants WHERE menu_id=? AND active=1 ORDER BY id',id)[i]?.id;
        run('UPDATE variants SET cost=? WHERE id=?',v.cost ?? null,target);
      }
      audit(u, "menu.saved", id, b)''')
s=s.replace('      return {\n        from,\n        to,', '''      const activeOrders=os.filter(o=>o.state!=='cancelled');
      const costLines=all("SELECT oi.cost,oi.qty FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE o.business_date BETWEEN ? AND ? AND o.state!='cancelled'",from,to);
      const missingCosts=costLines.filter(i=>i.cost===null).length;
      const foodCost=costLines.reduce((n,i)=>n+(i.cost===null?0:round(BigInt(i.cost)*BigInt(i.qty))),0);
      const netSales=activeOrders.reduce((n,o)=>n+o.subtotal-o.discount,0)-sum('refunds');
      return {
        foodCost, missingCosts, netSales,
        profit: missingCosts ? null : netSales-foodCost-sum('expenses'),
        from,
        to,''')
p.write_text(s,encoding='utf8')
p=Path('Workspace.tsx');s=p.read_text(encoding='utf8')
s=s.replace('const money = (n: number) =>','const simpleNav: Record<string,string> = {"New Order":"Naya Order", "Orders & Kitchen":"Orders / Rasoi", "Menu":"Khanay / Rates", "Customers":"Gahak / Udhaar", "Stock & Purchases":"Stock / Khareed", "Daily Summary":"Munafa / Hisaab", "Settings":"Setting"}\n\nconst money = (n: number) =>')
s=s.replace('minimumFractionDigits: 2,','minimumFractionDigits: 0,',1)
s=s.replace('<span>{label}</span>','<span>{simpleNav[label] || label}</span>')
s=s.replace('<h1>{active}</h1>','<h1>{simpleNav[active] || active}</h1>')
s=s.replace('<p>CURRENT ORDER</p>','<p>1. Khana chunein → 2. Miqdaar → 3. Bill banayein</p>')
s=s.replace(': "Draft order"',': "Aap ka order"')
s=s.replace('{draft.items.length} items','{draft.items.length} khanay')
s=s.replace('          Clear\n','          Saaf karein\n')
s=s.replace('            {s}\n','            {s === "Dine-in" ? "Yahin khana" : "Parcel"}\n')
s=s.replace('Takeaway token generated on saving','Parcel ka number bill par ayega')
s=s.replace('        <label>\n          Customer (optional)','        <details className="optional-customer"><summary>Naam / mobile add karein (zaroori nahi)</summary><label>\n          Customer (optional)',1)
s=s.replace('          + Add customer\n        </button>\n      </div>','          + Add customer\n        </button></details>\n      </div>',1)
s=s.replace('                className="note-input"','                className="note-input"',1)
s=s.replace('              <input\n                className="note-input"','              <details className="kitchen-note"><summary>Rasoi ko hidayat</summary><input\n                className="note-input"',1)
s=s.replace('      <div className="totals">','      <div className="totals">',1)
# close just the kitchen-note details
start=s.index('<details className="kitchen-note">'); end=s.index('              />',start)+len('              />');s=s[:end]+'</details>'+s[end:]
s=s.replace('        {data.user.role === "Owner" && !draft.editId && (','        {data.user.role === "Owner" && !draft.editId && (',1)
s=s.replace('          <label className="discount-field">','          <details className="optional-discount"><summary>Discount dein</summary><label className="discount-field">',1)
a=s.index('<details className="optional-discount">');b=s.index('          </label>',a)+len('          </label>');s=s[:b]+'</details>'+s[b:]
s=s.replace('        <div>\n          <span>Tax & service</span>','        {(tax + charge > 0) && <div>\n          <span>Tax & service</span>',1)
s=s.replace('<strong>{money(tax + charge)}</strong>\n        </div>','<strong>{money(tax + charge)}</strong>\n        </div>}',1)
s=s.replace(': "Order & Bill"',': "Order & Bill"') # accessible name stays stable
s=s.replace('          <span>{money(total)}</span>\n        </button>\n        <small>Unsaved draft protected on this device.</small>','          <span>{money(total)}</span>\n        </button>\n        <strong className="bill-hint">Bill banayein aur payment lein</strong>',1)
s=s.replace('placeholder="Search food by name…"','placeholder="Khana dhoondein…"')
s=s.replace('"Popular today"','"Kya order lena hai?"')
s=s.replace('Tap a dish to choose its portion','Photo dabayein. Half / Full chunein. Bill banayein.')
s=s.replace('            <span>{visible.length} dishes</span>','            <span>{visible.length} khanay</span>')
s=s.replace('"Unavailable today" : "Available now"','"Aaj khatam" : "+ Order mein dalein"')
s=s.replace('src={f.image || photos.curry}','src={f.image || "/media/no-photo.svg"}')
s=s.replace('<h2>Food menu</h2>','<h2>Food menu</h2>')
s=s.replace('Prices, portions, photos and live availability','Apna khana, photo, rate aur lagat yahan add karein')
s=s.replace('Upload / replace photo (JPEG, PNG, WebP)','Apni dish ki photo lagayein (mobile / computer se)')
s=s.replace('["name", "category", "image"].map','["name", "category"].map')
s=s.replace('      <h3>Variants & units</h3>','      {v.image && <img className="dish-upload-preview" src={v.image} alt="Dish photo" />}\n      <h3>Half / Full ya plate ka rate</h3>')
s=s.replace('              price: paise(x.priceInput ?? String(x.price / 100)),','              price: paise(x.priceInput ?? String(x.price / 100)),\n              cost: x.costInput === "" ? null : x.costInput !== undefined ? paise(x.costInput) : x.cost ?? null,')
s=s.replace('            {\n              key: "stepInput",','            {key: "costInput", label: "Banane ki lagat PKR (is size / plate ki)", fallback: x.cost === null || x.cost === undefined ? "" : String(x.cost/100)},\n            {\n              key: "stepInput",',1)
s=s.replace('required={f.key !== "portionsInput"}','required={!["portionsInput","costInput"].includes(f.key)}')
s=s.replace('label: "Quantity increment"','label: "Quantity increment"')
s=s.replace('<h2>Daily summary</h2>','<h2>Kitna kamaya? Kitna kharch hua?</h2>')
s=s.replace('Actual sales, collections, expenses and outstanding','Aaj, is haftay aur is mahinay ka hisaab ek nazar mein')
s=s.replace('      <div className="date-filter">','''      <div className="period-buttons">{[["Aaj",0],["Is haftay",6],["Is mahinay",-1]].map(([label,days])=><button key={label} onClick={()=>{const today=businessDate();const d=new Date(today+"T12:00:00Z");if(days===-1)d.setUTCDate(1);else d.setUTCDate(d.getUTCDate()-Number(days));setFrom(d.toISOString().slice(0,10));setTo(today)}}>{label}</button>)}</div>
      <div className="date-filter">''',1)
s=s.replace('          <div className="metric-grid">','''          <div className="profit-banner"><span>{report.profit === null ? "Lagat add karein, phir munafa nazar ayega" : report.profit < 0 ? "Nuqsan" : "Munafa"}</span><strong>{report.profit === null ? "—" : money(report.profit)}</strong><p>{report.missingCosts ? `${report.missingCosts} order lines ki lagat nahi di gayi. Khanay / Rates mein har size ki lagat dalein. Purane unknown costs andazay se nahi bhare jate.` : "Khanay ki sale − refunds − dish ki lagat − roz ke kharchay. Tax / service munafay mein shamil nahi."}</p></div>
          <div className="metric-grid">''',1)
s=s.replace('["Sales", report.sales],','["Khanay ki sale", report.netSales],\n              ["Khanay ki lagat", report.foodCost],')
s=s.replace('["Collections", report.collections],','["Collections / Wasool raqam", report.collections],')
s=s.replace('["Expenses", report.expenses],','["Kharchay", report.expenses],')
p.write_text(s,encoding='utf8')
