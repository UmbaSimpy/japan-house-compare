import json,statistics as st,sys
sys.stdout.reconfigure(encoding='utf-8')
R=json.load(open("raw.json",encoding="utf-8")); L=json.load(open("land.json",encoding="utf-8"))
def q(v,p):
    v=sorted(v); 
    if not v: return None
    k=(len(v)-1)*p; f=int(k); c=min(f+1,len(v)-1); return v[f]+(v[c]-v[f])*(k-f)
def dd(l):
    s=set();o=[]
    for x in l:
        if x['p'] is None or x['a'] is None: continue
        key=(x['n'],round(x['a']),x['p'])
        if key in s: continue
        s.add(key);o.append(x)
    return o
rows=[]
for name,d in R.items():
    l90=dd(d['l90']); b=[x for x in l90 if 90<=x['a']<=105]; big=[x for x in l90 if x['a']>=100]
    l70=dd(d['l65'])
    u70=[x['p']/x['a'] for x in l70]; u90=[x['p']/x['a'] for x in b]
    lp=L[name]
    y=lp['years']; tr=(float(y['2026'])/float(y['2021'])-1)*100 if '2021' in y and '2026' in y else None
    rows.append(dict(name=name,total=d['total'],hit90=d['hit90'],n90=len(l90),share=100*d['hit90']/d['total'] if d['total'] else 0,
        n100=len(big),nb=len(b),
        med_p=q([x['p'] for x in b],.5),p25=q([x['p'] for x in b],.25),p75=q([x['p'] for x in b],.75),
        med_u90=q(u90,.5),med_y=q([x['y'] for x in b if x['y']],.5),new2005=sum(1 for x in b if x['y'] and x['y']>=2005),
        n70=len(l70),med_u70=q(u70,.5),med_p70=q([x['p'] for x in l70],.5),
        est95=q(u70,.5)*95 if u70 else None,
        land_m2=lp['m2'],land_tsubo=lp['tsubo'],land_yoy=lp['yoy'],land5=tr,pts=lp['points']))
json.dump(rows,open("summary.json","w",encoding="utf-8"),ensure_ascii=False,indent=0)
f=lambda v,n=0: "-" if v is None else (f"{v:,.{n}f}")
print("name|total|>=90hit|share%|uniq90|uniq>=100|n90-105|med price 90-105 (万)|p25-p75|med ¥/m2 90-105 (万)|med built|#built>=2005|n70-80|med ¥/m2 70-80|med price 70-80|95m2 x 70-80 unit|land 万/m2|land YoY|land 5y%")
for r in rows:
    print("|".join([r['name'],str(r['total']),str(r['hit90']),f(r['share'],1),str(r['n90']),str(r['n100']),str(r['nb']),f(r['med_p']),f"{f(r['p25'])}-{f(r['p75'])}",f(r['med_u90'],1),f(r['med_y']),str(r['new2005']),str(r['n70']),f(r['med_u70'],1),f(r['med_p70']),f(r['est95']),str(r['land_m2']),str(r['land_yoy']),f(r['land5'],1)]))
