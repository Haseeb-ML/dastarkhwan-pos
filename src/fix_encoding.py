from pathlib import Path
for name in ['Workspace.tsx','Design.tsx','tests/browser/workflows.spec.mjs']:
    path=Path(name)
    text=path.read_text(encoding='utf-8-sig')
    # Repair individual UTF-8 sequences that Windows command transport decoded as cp1252.
    import re
    def repair(m):
        s=m.group()
        try:return s.encode('cp1252').decode('utf-8')
        except (UnicodeError,LookupError):return s
    text=re.sub(r'(?:[\u00c2\u00c3][\u0080-\u00bf\u0152\u0153\u0160\u0161\u0178\u017d\u017e\u0192\u02c6\u02dc\u2013-\u2022\u2026\u2030\u2039\u203a\u20ac\u2122]|\u00e2[\u0080-\u00bf\u0152\u0153\u0160\u0161\u0178\u017d\u017e\u0192\u02c6\u02dc\u2013-\u2022\u2026\u2030\u2039\u203a\u20ac\u2122]{2})',repair,text)
    path.write_text(text,encoding='utf-8')
p=Path('Workspace.tsx');s=p.read_text(encoding='utf-8')
s=s.replace('<select value={values[f.name]','<select aria-label={f.label} value={values[f.name]')
s=s.replace('<select disabled={!!draft.editId||busy} value={draft.tableId}','<select aria-label="Table" disabled={!!draft.editId||busy} value={draft.tableId}')
s=s.replace('<select required value={i.ingredientId}','<select aria-label="Ingredient / base unit" required value={i.ingredientId}')
s=s.replace("const update=(changes:Partial<Draft>)=>{setError('');","const update=(changes:Partial<Draft>)=>{if(draft.pending){setError('Previous save outcome is uncertain. Press Order & Bill to recover it before editing.');return;}setError('');")
s=s.replace('<button disabled={busy} onClick={()=>{setDraft(emptyDraft());','<button disabled={busy||!!draft.pending} onClick={()=>{setDraft(emptyDraft());')
p.write_text(s,encoding='utf-8')

