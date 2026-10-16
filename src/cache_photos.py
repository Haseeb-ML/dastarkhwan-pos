from concurrent.futures import ThreadPoolExecutor
from urllib.request import urlopen,Request
from pathlib import Path
sources={'karahi':'1694579740719-0e601c5d2437','curry':'1603496987351-f84a3ba5ec85','biryani':'1631515243349-e0cb75fb8d3a','bbq':'1599487488170-d11ec9c172f0','naan':'1690915475901-6c08af925906'}
Path('media').mkdir(exist_ok=True)
def save(entry):
    name,photo=entry
    url='https://images.unsplash.com/photo-'+photo+'?auto=format&fit=crop&w=700&q=80'
    try:
        data=urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=30).read()
        if not data.startswith(bytes.fromhex('ffd8')):raise ValueError('Expected JPEG')
        Path('media/'+name+'.jpg').write_bytes(data)
        print(name,len(data))
    except Exception as e:print(name,'FAILED',str(e))
with ThreadPoolExecutor(max_workers=5) as pool:list(pool.map(save,sources.items()))

