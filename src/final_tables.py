from pathlib import Path
p=Path('erp.mjs');s=p.read_text(encoding='utf-8')
s=s.replace('staff: all("SELECT id,username,name,role,active FROM users"),','allTables: all("SELECT * FROM dining_tables ORDER BY id"),\n              staff: all("SELECT id,username,name,role,active FROM users"),')
p.write_text(s,encoding='utf-8')
p=Path('Workspace.tsx');s=p.read_text(encoding='utf-8')
start=s.index('function Settings(')
s=s[:start]+s[start:].replace('data.tables.map((t: Data)', '(data.allTables || data.tables).map((t: Data)',1)
p.write_text(s,encoding='utf-8')

