from pathlib import Path
p=Path('Workspace.tsx');s=p.read_text(encoding='utf-8')
helper='''const dishSizes = ["Half", "Full", "Regular", "Piece", "Small", "Medium", "Large"];
const sizeKey = (name: string) => String(urdu(name)).trim().toLowerCase();
function DishSizeSelect({value,others,onChange}:any){
 const [custom,setCustom]=b.useState(!dishSizes.some(size=>sizeKey(size)===sizeKey(value)));
 const selected=dishSizes.find(size=>sizeKey(size)===sizeKey(value));
 return <div className="dish-size-select"><select aria-label="Portion size" value={custom?"custom":selected||""} onChange={event=>{const next=event.target.value;setCustom(next==="custom");onChange(next==="custom"?"":next)}}><option value="" disabled>{urdu("مقدار منتخب کریں")}</option>{dishSizes.map(size=><option key={size} value={size} disabled={others.some((name:string)=>sizeKey(name)===sizeKey(size))}>{urdu(size)}</option>)}<option value="custom">{urdu("اپنی مقدار لکھیں")}</option></select>{custom&&<UrduInput required aria-label="Custom portion size" placeholder={urdu("مثلاً فیملی پلیٹر")} value={value} onChange={(event:any)=>onChange(event.target.value)}/>}</div>;
}
'''
s=s.replace('function ve({',helper+'\nfunction ve({',1)
old='(0, x.jsx)(UrduInput, { required: !0, value: urdu(e.name), placeholder: urdu("\\u0622\\u062F\\u06BE\\u06CC\\u060C \\u067E\\u0648\\u0631\\u06CC\\u060C \\u067E\\u0644\\u06CC\\u0679 \\u06CC\\u0627 \\u0639\\u062F\\u062F"), onChange: e => n(`name`, e.target.value) })'
assert old in s
s=s.replace(old,'(0, x.jsx)(DishSizeSelect, {value:e.name, others:r.variants.filter((_,index)=>index!==t).map(variant=>variant.name), onChange:value=>n(`name`,value)})',1)
s=s.replace('onClick: () => i({ ...r, variants: [...r.variants, { name: `Full`, unit: `portion`, price: 0, step: 1e3, portions: null }] })','onClick: () => i({ ...r, variants: [...r.variants, { name: dishSizes.find(size=>!r.variants.some(variant=>sizeKey(variant.name)===sizeKey(size))) || "", unit: `portion`, price: 0, step: 1e3, portions: null }] })',1)
s=s.replace('if (e.preventDefault(), !l.current) {\n                l.current = !0, c(!0), o(``);','''if (e.preventDefault(), !l.current) {
                const names=r.variants.map(variant=>sizeKey(variant.name));
                if(names.some(name=>!name)||new Set(names).size!==names.length){o("ہر مقدار کا الگ نام منتخب کریں۔ ایک ہی مقدار دوبارہ شامل نہیں ہو سکتی۔");return;}
                l.current = !0, c(!0), o(``);''',1)
p.write_text(s,encoding='utf-8')
