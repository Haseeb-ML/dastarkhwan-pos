from pathlib import Path
p=Path('tests/documents.test.mjs');s=p.read_text(encoding='utf-8-sig')
start=s.index("const m=a.menu()[0];m.name=",s.index("test('Urdu"))
end=s.index(";call('menu/save'",start)
s=s[:start]+"const m=a.menu()[0];m.name='\\u0686\\u06a9\\u0646 \\u06a9\\u0691\\u0627\\u06c1\\u06cc'"+s[end:]
p.write_text(s,encoding='utf-8')

