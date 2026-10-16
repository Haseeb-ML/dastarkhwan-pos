from pathlib import Path
p=Path('erp.mjs');s=p.read_text(encoding='utf-8-sig')
old="const images=['https://images.unsplash.com/photo-1694579740719-0e601c5d2437','https://images.unsplash.com/photo-1603496987351-f84a3ba5ec85','https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a','https://images.unsplash.com/photo-1599487488170-d11ec9c172f0','https://images.unsplash.com/photo-1690915475901-6c08af925906'];"
s=s.replace(old,"const images=['/media/karahi.jpg','/media/curry.jpg','/media/biryani.jpg','/media/bbq.jpg','/media/naan.jpg'];")
s=s.replace("images[img]+'?auto=format&fit=crop&w=700&q=80'","images[img]")
s=s.replace("variant==='Piece'?'piece':'portion'","variant==='Piece'?'piece':variant==='Bowl'?'bowl':variant==='Bottle'?'bottle':'portion'")
needle=" const owner=u=>"
migration=""" for(const [photo,name] of [['1694579740719-0e601c5d2437','karahi'],['1603496987351-f84a3ba5ec85','curry'],['1631515243349-e0cb75fb8d3a','biryani'],['1599487488170-d11ec9c172f0','bbq'],['1690915475901-6c08af925906','naan']])run('UPDATE menu SET image=? WHERE image=?','/media/'+name+'.jpg','https://images.unsplash.com/photo-'+photo+'?auto=format&fit=crop&w=700&q=80');
"""
s=s.replace(needle,migration+needle);p.write_text(s,encoding='utf-8')
p=Path('server.mjs');s=p.read_text(encoding='utf-8')
needle="  if(path.startsWith('/uploads/')){"
code="""  if(path.startsWith('/media/')){
   const name=basename(path);if(!/^[a-z-]+\\.(jpg|woff2)$/.test(name))fail('Not found',404);const file=resolve(here,'media',name);if(!existsSync(file))fail('Not found',404);res.writeHead(200,{'Content-Type':extname(file)==='.jpg'?'image/jpeg':'font/woff2','Cache-Control':'public,max-age=86400'});createReadStream(file).pipe(res);return;
  }
"""
s=s.replace(needle,code+needle);p.write_text(s,encoding='utf-8')
p=Path('Design.tsx');s=p.read_text(encoding='utf-8')
import re
s=re.sub(r'karahi: "https[^"]+"','karahi: "/media/karahi.jpg"',s)
s=re.sub(r'curry: "https[^"]+"','curry: "/media/curry.jpg"',s)
p.write_text(s,encoding='utf-8')

