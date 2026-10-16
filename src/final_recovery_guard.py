from pathlib import Path
p=Path('Workspace.tsx');s=p.read_text(encoding='utf-8')
s=s.replace("    if (!live) return\n    if (revision === live.revision)","    if (!live) return\n    if (revision == null) { setO(live); setRevision(live.revision); return; }\n    if (revision === live.revision)")
s=s.replace('  if (!o) return null','  if (!o) return <Modal title="Loading saved invoice" onClose={onClose}><p>Waiting for shared records to reconnect...</p></Modal>')
s=s.replace('      const result = await api(route, body, key)\n      await refresh()','      const result = await api(route, body, key)\n      if (result.orderId) setData(current => current ? {...current, orders: [result, ...current.orders.filter((o:Data) => o.id !== result.id)]} : current)\n      await refresh()')
p.write_text(s,encoding='utf-8')
p=Path('erp.mjs');s=p.read_text(encoding='utf-8')
idx=s.index('export function fail')
s=s[:idx]+"""export function validDate(v) {
  if(typeof v!=='string'||!/^\\d{4}-\\d{2}-\\d{2}$/.test(v))return false;
  const d=new Date(v+'T00:00:00Z');
  return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===v;
}
"""+s[idx:]
s=s.replace('if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(expenseDate))','if (!validDate(expenseDate))')
s=s.replace('!/^\\d{4}-\\d{2}-\\d{2}$/.test(from)', '!validDate(from)').replace('!/^\\d{4}-\\d{2}-\\d{2}$/.test(to)','!validDate(to)')
p.write_text(s,encoding='utf-8')

