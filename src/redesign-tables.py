from pathlib import Path
p=Path('EasyOverview.tsx')
s=p.read_text(encoding='utf-8')
a=s.index('<div className="easy-table-summary">',s.index('export function TablesPage'))
b=s.index('<div className="easy-table-grid">',a)
s=s[:a]+'''<div className="easy-table-summary" aria-label={ui("میزیں")}><article><DashboardIcon index={1}/><div><span>{ui("کل میزیں: ")}</span><strong><bdi>{data.tables.length}</bdi></strong></div></article><article className="available"><DashboardIcon index={2}/><div><span>{ui("خالی: ")}</span><strong><bdi>{data.tables.filter((t:any)=>!t.orderId).length}</bdi></strong></div></article><article className="occupied"><DashboardIcon index={0}/><div><span>{ui("مصروف: ")}</span><strong><bdi>{data.tables.filter((t:any)=>t.orderId).length}</bdi></strong></div></article></div>'''+s[b:]
s=s.replace('<span className="easy-table-icon" aria-hidden="true">{ui("▤")}</span>','''<span className="easy-table-icon" aria-hidden="true"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="8" y="8" width="16" height="16" rx="4"/><path d="M12 3h8M12 29h8M3 12v8M29 12v8"/></svg></span>''')
p.write_text(s,encoding='utf-8')
