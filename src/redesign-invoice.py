from pathlib import Path
p=Path('Workspace.tsx');s=p.read_text(encoding='utf-8');a=s.index('function ge(');b=s.index('\nfunction ',a+1);part=s[a:b]
part=part.replace('className: `invoice-modal`','className: `invoice-modal premium-invoice`',1)
part=part.replace('className: `invoice-actions`','className: `invoice-actions`, "data-panel": s',1)
marker='(0, x.jsxs)("div", { className: `receipt-lines`'
summary='''<div className="invoice-money-summary"><article><span>{urdu("کل رقم")}</span><strong>{urdu(E(a.total))}</strong></article><article><span>{urdu("حاصل شدہ رقم")}</span><strong>{urdu(E(a.net))}</strong></article><article className={a.balance>0?"balance-due":"balance-paid"}><span>{urdu("باقی رقم")}</span><strong>{urdu(E(a.balance))}</strong></article></div>, '''
part=part.replace(marker,summary+marker,1)
part=part.replace('className: `receipt-preview`','className: `receipt-preview`, "data-payment": a.paymentStatus',1)
part=part.replace('(0, x.jsxs)("div", { children: urdu([(0, x.jsx)("span", { children: urdu(T[e] || e) })','(0, x.jsxs)("div", { "data-total": e, children: urdu([(0, x.jsx)("span", { children: urdu(T[e] || e) })',1)
s=s[:a]+part+s[b:];p.write_text(s,encoding='utf-8')
