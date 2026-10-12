import requests,re,sys,json,time,statistics as st,unicodedata
from bs4 import BeautifulSoup
H={"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36","Accept-Language":"ja","Referer":"https://suumo.jp/"}
S=requests.Session(); S.headers.update(H)
C={}
tok=[l.split() for l in """
13 13101 Chiyoda
13 13102 Chuo
13 13103 Minato
13 13104 Shinjuku
13 13105 Bunkyo
13 13106 Taito
13 13107 Sumida
13 13108 Koto
13 13109 Shinagawa
13 13110 Meguro
13 13111 Ota
13 13112 Setagaya
13 13113 Shibuya
13 13114 Nakano
13 13115 Suginami
13 13116 Toshima
13 13117 Kita
13 13118 Arakawa
13 13119 Itabashi
13 13120 Nerima
13 13121 Adachi
13 13122 Katsushika
13 13123 Edogawa
13 13203 Musashino
13 13204 Mitaka
13 13208 Chofu
13 13206 Fuchu
13 13210 Koganei
13 13202 Tachikawa
13 13209 Machida
13 13224 Tama-shi
13 13225 Inagi
12 12106 Chiba-Mihama
12 12101 Chiba-Chuo
12 12103 Chiba-Inage
12 12102 Chiba-Hanamigawa
12 12105 Chiba-Midori
12 12104 Chiba-Wakaba
12 12216 Narashino
12 12204 Funabashi
12 12203 Ichikawa
12 12227 Urayasu
12 12207 Matsudo
12 12217 Kashiwa
12 12220 Nagareyama
12 12231 Inzai
12 12232 Shiroi
12 12221 Yachiyo
12 12212 Sakura
12 12206 Kisarazu
12 12229 Sodegaura
12 12219 Ichihara
12 12224 Kamagaya
08 08220 Tsukuba
08 08224 Moriya
08 08235 Tsukubamirai
11 11107 Saitama-Urawa
11 11103 Saitama-Omiya
11 11105 Saitama-Chuo
11 11108 Saitama-Minami
11 11109 Saitama-Midori
11 11203 Kawaguchi
11 11224 Toda
11 11222 Koshigaya
11 11237 Misato
11 11234 Yashio
11 11221 Soka
14 14133 Kawasaki-Nakahara
14 14134 Kawasaki-Takatsu
14 14136 Kawasaki-Miyamae
14 14131 Kawasaki-Kawasaki
14 14132 Kawasaki-Saiwai
14 14109 Yokohama-Kohoku
14 14118 Yokohama-Tsuzuki
14 14117 Yokohama-Aoba
14 14102 Yokohama-Kanagawa
14 14103 Yokohama-Nishi
""".strip().splitlines()]
def url(ta,sc,mb,mt,page):
    return (f"https://suumo.jp/jj/bukken/ichiran/JJ010FJ001/?ar=030&bs=011&ta={ta}&jspIdFlg=patternShikugun&sc={sc}&kb=1&kt=9999999&mb={mb}&mt={mt}&ekTjCd=&ekTjNm=&tj=0&cnb=0&cn=9999999&srch_navi=1&pc=100&page={page}")
def get(u):
    for i in range(3):
        try:
            r=S.get(u,timeout=25); r.raise_for_status(); r.encoding="utf-8"; time.sleep(1.0); return r.text
        except Exception as e:
            print("warn",e,file=sys.stderr); time.sleep(4*(i+1))
    return None
def price(t):
    t=unicodedata.normalize("NFKC",t); t=t.split("～")[0].split("~")[0]
    m=re.search(r"(?:(\d+)億)?\s*(\d+)?万",t)
    if not m: 
        m2=re.search(r"(\d+)億",t)
        return int(m2.group(1))*10000 if m2 else None
    return int(m.group(1) or 0)*10000+int(m.group(2) or 0)
def area(t):
    m=re.search(r"([\d.]+)\s*m",unicodedata.normalize("NFKC",t)); return float(m.group(1)) if m else None
def year(t):
    m=re.search(r"(\d{4})年",t); return int(m.group(1)) if m else None
def crawl(ta,sc,mb,mt,maxp=25):
    out=[];hit=None
    for p in range(1,maxp+1):
        h=get(url(ta,sc,mb,mt,p))
        if not h: break
        s=BeautifulSoup(h,"html.parser")
        if p==1:
            e=s.select_one(".pagination_set-hit"); hit=int(re.sub(r"\D","",e.get_text())) if e else 0
        us=s.select("div.property_unit")
        for u in us:
            d={dt.get_text(strip=True):dt.find_next_sibling("dd").get_text(" ",strip=True) for dt in u.find_all("dt") if dt.find_next_sibling("dd")}
            out.append(dict(n=d.get("物件名"),p=price(d.get("販売価格","")),a=area(d.get("専有面積","")),y=year(d.get("築年月","")),st=d.get("沿線・駅")))
        if len(us)<100: break
    return hit,out
res={}
only=sys.argv[1:] 
for ta,sc,name in tok:
    if only and name not in only: continue
    h0,_=crawl(ta,sc,0,9999999,maxp=1)
    h90,l90=crawl(ta,sc,90,9999999)
    h65,l65=crawl(ta,sc,70,80)
    res[name]=dict(sc=sc,total=h0,hit90=h90,l90=l90,hit65=h65,l65=l65)
    print(name,h0,h90,len(l90),h65,len(l65),flush=True)
    json.dump(res,open("raw.json","w",encoding="utf-8"),ensure_ascii=False)
