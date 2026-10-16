from pathlib import Path
p=Path('erp.mjs');s=p.read_text(encoding='utf-8')
needle="  const call = (u, route, b, key) => {"
guard="""  const call = (u, route, b, key) => {
    const ownerOnly = ['refunds','orders/cancel','menu/save','menu/archive','ingredients/save','stock/move','suppliers/save','purchases','suppliers/pay','expenses','cash/open','cash/close','settings','tables/save','staff','summary'];
    const cashierOnly = ['orders/create','orders/append','payments','orders/close','drafts/save','drafts/delete','customers/save','order'];
    if(ownerOnly.includes(route))owner(u);
    if(cashierOnly.includes(route))cashier(u);
"""
s=s.replace(needle,guard);p.write_text(s,encoding='utf-8')

