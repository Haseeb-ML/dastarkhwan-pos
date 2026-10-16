import urllib.request,urllib.parse,json,concurrent.futures
from pathlib import Path
items=[('Daal Mash','Dal Chana Aur Mash Ki Dal.JPG'),('Chicken Karahi','Punjabi Chicken Karahi.JPG'),('Mutton Karahi','Mutton Karahi.JPG'),('White Chicken Karahi','Chicken White Karahi.JPG'),('Chicken Handi','Punjabi Chicken Handi.JPG'),('Chicken Biryani','Chicken Biryani.jpg'),('Beef Biryani','Beef Biryani.JPG'),('Chicken Pulao','Chicken Pulao.jpg'),('Chicken Tikka','Tandoorimumbai.jpg'),('Seekh Kabab','Pakistani Food Beef Kabobs.jpg'),('Chicken Sajji','Sajji.JPG'),('Roghni Naan','Roghni Naan.jpg'),('Plain Naan','Plain Naan.jpg'),('Aloo Qeema','Aaloo Keema.JPG'),('Raita','Cucumber-raita.jpg'),('Halwa Puri','Halwa Puri, a traditional food made in Walled City of Lahore.jpg'),('Kheer','Kheer.jpg'),('Soft Drink','Glass of Cola.jpg')]
headers={'User-Agent':'RestaurantERP/1.0'}
def get(url):return urllib.request.urlopen(urllib.request.Request(url,headers=headers),timeout=25).read()
params={'action':'query','format':'json','titles':'|'.join('File:'+term for name,term in items),'prop':'imageinfo','iiprop':'url|extmetadata','iiurlwidth':700}
result=json.loads(get('https://en.wikipedia.org/w/api.php?'+urllib.parse.urlencode(params)))
pagesByTitle={p['title']:p for p in result.get('query',{}).get('pages',{}).values()}

def task(item):
 name,term=item;slug=name.lower().replace(' ','-');path=Path('media')/(slug+'.jpg')
 params={'action':'query','format':'json','titles':'File:'+term,'prop':'imageinfo','iiprop':'url|extmetadata','iiurlwidth':700}
 try:
  pages={'one':pagesByTitle.get('File:'+term,{})}
  for page in sorted(pages.values(),key=lambda p:p.get('index',99)):
   info=page.get('imageinfo',[{}])[0]
   if not info: continue
   url=info.get('thumburl',info['url']);meta=info.get('extmetadata',{});license=meta.get('LicenseShortName',{}).get('value','')
   if not license or not any(x in license.lower() for x in ['cc','public','pd']):continue
   try: payload=get(url)
   except: payload=get(info['url'])
   if not payload.startswith((b'\xff\xd8',b'\x89PNG')):continue
   path.write_bytes(payload)
   return {'name':name,'image':'/media/'+path.name,'source':info['descriptionurl'],'license':license,'artist':meta.get('Artist',{}).get('value',''),'title':page['title']}
 except Exception as e: return {'name':name,'error':str(e)}
 return {'name':name,'error':'No licensed photo found'}
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:results=list(pool.map(task,items))
Path('media/dish-photos.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf8')
for r in results:print(r['name'],r.get('title',r.get('error')))
Path('media/PHOTO_CREDITS.md').write_text('# Dish photographs\n\nWikimedia Commons source pages include original author, license and attribution. These are illustrative dish photographs; upload the restaurant\'s own photographs using Khanay / Rates.\n\n'+'\n\n'.join('## '+r['name']+'\n'+r.get('source','No photo')+'\n\n'+r.get('license','')+'\n\n'+r.get('artist','') for r in results),encoding='utf8')


