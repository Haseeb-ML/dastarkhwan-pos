from pathlib import Path
for name in ['Workspace.tsx','Design.tsx']:
 p=Path(name);s=p.read_text(encoding='utf-8')
 for old,new in [
 ('{ id: number name: string username: string role: string }','{ id: number; name: string; username: string; role: string }'),
 ('{ route: string body: Data key: string }','{ route: string; body: Data; key: string }'),
 ('{ value: any label: string }','{ value: any; label: string }'),
 ('{ id: number onClose: () => void }','{ id: number; onClose: () => void }'),
 ('{ name: IconName size?: number }','{ name: IconName; size?: number }')]:s=s.replace(old,new)
 p.write_text(s,encoding='utf-8')

