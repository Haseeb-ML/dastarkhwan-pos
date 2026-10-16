from pathlib import Path
p=Path('Workspace.tsx');s=p.read_text(encoding='utf-8');s=s.replace('title: urdu(a.id ? `Edit dish` : `Add dish`), onClose:', 'className: "dish-editor-dialog", title: urdu(a.id ? `Edit dish` : `Add dish`), onClose:')
a=s.index('function ve(');b=s.index('\nfunction ',a+1);part=s[a:b]
part=part.replace('(0, x.jsxs)("div", { children: urdu([(0, x.jsx)("span", { children: urdu(`Wazan / stock ki mazeed setting`) })','(0, x.jsxs)("details", { className: "dish-stock-settings", children: urdu([(0, x.jsx)("summary", { children: urdu(`Wazan / stock ki mazeed setting`) })')
s=s[:a]+part+s[b:];p.write_text(s,encoding='utf-8')
