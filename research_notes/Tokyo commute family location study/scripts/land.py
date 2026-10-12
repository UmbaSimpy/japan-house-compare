import requests,re,json,time,os
from bs4 import BeautifulSoup
H={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'}
src=open("crawl.py",encoding="utf-8").read()
rows=re.findall(r"^(\d\d) (\d{5}) (\S+)$",src,re.M)
out={}
for ta,sc,name in rows:
    fn=f"landtxt/{sc}.txt"
    if os.path.exists(fn): t=open(fn,encoding="utf-8").read()
    else:
        t=BeautifulSoup(requests.get(f'https://totinokati.com/kakaku/place/{sc}/kouji/',headers=H,timeout=25).text,'html.parser').get_text('|',strip=True)
        open(fn,"w",encoding="utf-8").write(t); time.sleep(0.8)
    m=re.search(r'における2026年の住宅地の\|.*?平均値は坪単価\|([\d,.]+)\|万円/坪\(([\d,.]+) 万円/㎡\)',t)
    i=t.find('住宅地の年別公示地価'); seg=t[i:i+700]
    yrs={}
    for y,v in re.findall(r'(20\d\d)\|年\|([\d,.]+)\|万円/坪',seg): yrs.setdefault(int(y),float(v.replace(',','')))
    yoy=re.search(r'前年\(2025年\)に比べて\|([+\-\d.]+)\|%',t)
    npts=re.search(r'住宅地を含む\|(\d+)\|地点',t)
    out[name]=dict(sc=sc,tsubo=m.group(1) if m else None,m2=m.group(2) if m else None,yoy=yoy.group(1) if yoy else None,years=yrs,points=npts.group(1) if npts else None)
    y=yrs; print(name,out[name]['tsubo'],out[name]['m2'],out[name]['yoy'],y.get(2026),y.get(2021),out[name]['points'],flush=True)
json.dump(out,open("land.json","w",encoding="utf-8"),ensure_ascii=False,indent=0)
