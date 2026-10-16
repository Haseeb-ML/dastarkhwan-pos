from pathlib import Path
p=Path('Workspace.tsx');s=p.read_text(encoding='utf8');start=s.index('          <div className="period-buttons">');end=s.index('\n      <div className="date-filter">',start);buttons=s[start:end];s=s[:start]+s[end:];pos=s.index('      <div className="date-filter">',s.index('function DailySummary'));s=s[:pos]+buttons+'\n'+s[pos:]
# Replace technical menu form with simple inputs; advanced quantity controls stay available.
a=s.index('      {["name", "category"].map');b=s.index('      {error && <p className="error">',a)
s=s[:a]+'''      <label className="field"><span>Dish name</span><input required placeholder="Misal: Chicken Karahi" value={v.name} onChange={e=>setV({...v,name:e.target.value})}/></label>
      <label className="field"><span>Khanay ki category</span><input required list="dish-categories" value={v.category} onChange={e=>setV({...v,category:e.target.value})}/><datalist id="dish-categories">{["Karahi & Handi","Biryani & Pulao","BBQ & Sajji","Paratha & Breads","Daal & Sabzi","Sides","Breakfast & Specials","Desserts","Drinks"].map(c=><option key={c}>{c}</option>)}</datalist></label>
      <PhotoUpload onUpload={(image)=>setV(x=>({...x,image}))}/>
      {v.image && <img className="dish-upload-preview" src={v.image} alt="Dish photo"/>}
      <label className="check-field"><input type="checkbox" checked={!!v.available} onChange={e=>setV({...v,available:e.target.checked})}/> Aaj yeh khana mil raha hai</label>
      <h3>Plate / Half / Full ka rate aur lagat</h3>
      <p className="muted">Lagat mein gosht, masala, oil aur doosray ingredients ka kharcha dalein. Salary, rent, bijli alag Kharchay mein dalein.</p>
      {v.variants.map((x:Data,i:number)=>{
        const change=(key:string,value:any)=>setV({...v,variants:v.variants.map((n:Data,j:number)=>i===j?{...n,[key]:value}:n)});
        return <div className="variant-editor" key={i}>
          <div className="simple-price-fields">
            <label className="field"><span>Size / plate</span><input required value={x.name} placeholder="Half / Full / Plate / Piece" onChange={e=>change('name',e.target.value)}/></label>
            <label className="field"><span>Bechnay ka rate PKR</span><input required type="number" min="0" step="0.01" value={x.priceInput ?? x.price/100} onChange={e=>change('priceInput',e.target.value)}/></label>
            <label className="field"><span>Banane ki lagat PKR</span><input type="number" min="0" step="0.01" placeholder="Munafa ke liye zaroori" value={x.costInput ?? (x.cost == null ? '' : x.cost/100)} onChange={e=>change('costInput',e.target.value)}/></label>
          </div>
          <details><summary>Wazan / stock ki mazeed setting</summary>
            <label className="field"><span>Unit</span><select value={x.unit} onChange={e=>change('unit',e.target.value)}>{['portion','piece','kg','litre','bowl','bottle'].map(u=><option key={u}>{u}</option>)}</select></label>
            <label className="field"><span>Quantity increment</span><input value={x.stepInput ?? x.step/1000} onChange={e=>change('stepInput',e.target.value)}/></label>
            <label className="field"><span>Kitni tayyar hain? (khali = limit nahi)</span><input value={x.portionsInput ?? (x.portions == null ? '' : x.portions/1000)} onChange={e=>change('portionsInput',e.target.value)}/></label>
          </details>
          {v.variants.length>1 && <button type="button" className="text-button" onClick={()=>setV({...v,variants:v.variants.filter((_:Data,j:number)=>i!==j)})}>Yeh size hata dein</button>}
        </div>
      })}
      <button type="button" className="secondary" onClick={()=>setV({...v,variants:[...v.variants,{name:'Full',unit:'portion',price:0,step:1000,portions:null}]})}>+ Half / Full ya doosra size add karein</button>
''' +s[b:]
p.write_text(s,encoding='utf8')
