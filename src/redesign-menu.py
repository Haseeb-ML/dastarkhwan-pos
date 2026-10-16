from pathlib import Path
p=Path('Workspace.tsx');s=p.read_text(encoding='utf-8');a=s.index('function _e()');b=s.index('\nfunction ',a+1);part=s[a:b]
part=part.replace('className: `page-content`','className: `page-content menu-workspace`',1)
part=part.replace('Apna khana, photo, rate aur lagat yahan add karein','کھانے، تصاویر، قیمتیں اور دستیابی ایک جگہ سنبھالیں۔')
part=part.replace('className: `food-card`, children:', 'className: `food-card`, "data-available": Boolean(e.available), children:')
part=part.replace('(0, x.jsx)("small", { children: urdu(e.category) })','(0, x.jsx)("small", { className: "menu-category", children: urdu(e.category) })')
part=part.replace('e.variants.map(e => (0, x.jsxs)("p", { children:', 'e.variants.map(e => (0, x.jsxs)("p", { className: "menu-price-line", children:')
marker='(0, x.jsx)("div", { className: "catalog-menu-entry"'
summary='''<div className="menu-overview"><article><span>{urdu("کل کھانے")}</span><bdi>{e.menu.length}</bdi></article><article><span>{urdu("موجود کھانے")}</span><bdi>{e.menu.filter((dish:any)=>dish.available).length}</bdi></article><article><span>{urdu("ختم شدہ کھانے")}</span><bdi>{e.menu.filter((dish:any)=>!dish.available).length}</bdi></article></div>, '''
part=part.replace(marker,summary+marker,1)
s=s[:a]+part+s[b:];p.write_text(s,encoding='utf-8')
