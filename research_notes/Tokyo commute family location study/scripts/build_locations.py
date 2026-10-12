# Build data/locations.json for the Tokyo commute family location study.
# All inputs are transcribed from research_notes/Tokyo commute family location study/*.md
# plus condo_raw/summary.json, raw.json (SUUMO crawl 2026-10-12).
import json, math, os, statistics, sys
from urllib.parse import quote

BASE = r"D:\Cartella Privata\Claude\japan-house-compare"
NOTES = os.path.join(BASE, "research_notes", "Tokyo commute family location study", "condo_raw")
OUT = os.path.join(BASE, "data", "locations.json")
SCRATCH = os.path.dirname(os.path.abspath(__file__))

summary = {r["name"]: r for r in json.load(open(os.path.join(NOTES, "summary.json"), encoding="utf-8"))}
raw = json.load(open(os.path.join(NOTES, "raw.json"), encoding="utf-8"))

# 2026-10-12: hazard added at 10 (user choice "Hazard 10, trim space"): space 30→25, childcare 25→20.
WEIGHTS = {"commute": 25, "bus": 5, "childcare": 20, "space": 25, "growth": 10, "costco": 5, "hazard": 10}
SUBS = ["commute", "bus", "childcare", "space", "growth", "costco", "hazard"]

# Population-weighted hazard exposure per area, built by area_hazard.py (track B, manual refresh).
HAZ = json.load(open(os.path.join(BASE, "data", "area_hazard.json"), encoding="utf-8"))
HAZ_GENERATED = HAZ["generated"]; HAZ = HAZ["areas"]


def hazard_score(h):
    """0–100, higher = safer. All inputs are % of residents (2020 census 500 m mesh) — see RUBRIC."""
    shallow = max(0.0, h["waterAny"] - h["waterMid"] - h["waterDeep"])
    water = 40 * (1 - (0.25 * shallow + 0.6 * h["waterMid"] + 1.0 * h["waterDeep"]) / 100)
    liq = 25 * (1 - (h["liqHigh"] + 0.4 * h["liqMid"] + 0.4 * h["fillUpland"]) / 100)
    slide = 10 * (1 - min(1.0, (h["landslide"] + h["landslideRed"]) / 10))
    quake = lin(h["quake30"], 40, 85, 25, 0) if h["quake30"] is not None else 12.5
    return clamp(water + liq + slide + quake), {"water": round(water, 1), "liquefaction": round(liq, 1),
                                                 "landslide": round(slide, 1), "earthquake": round(quake, 1)}

# ---------------------------------------------------------------- base table
# key: (nameEn, nameJa, pref, type, station, dest, min, transfers, pass, crowd%, crowdLine, lat, lng)
A = [
 ("Chiyoda","千代田区","Tokyo","ku","市ケ谷","Otemachi",10,1,11750,158,"JR中央快速 158%",35.6917,139.7356),
 ("Chuo","中央区","Tokyo","ku","月島","Otemachi",13,1,11880,153,"Metro有楽町 153%",35.6649,139.7842),
 ("Minato","港区","Tokyo","ku","田町","Tokyo",9,0,5890,136,"JR山手 135–136%",35.6457,139.7476),
 ("Shinjuku","新宿区","Tokyo","ku","四ツ谷","Tokyo",9,0,6240,158,"JR中央快速 158%",35.6860,139.7302),
 ("Bunkyo","文京区","Tokyo","ku","茗荷谷","Otemachi",11,0,7490,154,"Metro丸ノ内 154%",35.7171,139.7372),
 ("Taito","台東区","Tokyo","ku","上野","Tokyo",5,0,5890,None,"not measured",35.7138,139.7773),
 ("Sumida","墨田区","Tokyo","ku","錦糸町","Tokyo",8,0,5890,160,"JR総武快速 160%",35.6966,139.8140),
 ("Koto","江東区","Tokyo","ku","門前仲町","Otemachi",7,0,7140,160,"Metro東西 160%",35.6717,139.7962),
 ("Shinagawa","品川区","Tokyo","ku","大井町","Tokyo",17,0,6240,159,"JR京浜東北 159%",35.6065,139.7349),
 ("Meguro","目黒区","Tokyo","ku","中目黒","Tokyo",26,1,8170,163,"Metro日比谷 163% (north section)",35.6440,139.6990),
 ("Ota","大田区","Tokyo","ku","蒲田","Tokyo",24,0,7840,159,"JR京浜東北 159%",35.5626,139.7161),
 ("Setagaya","世田谷区","Tokyo","ku","三軒茶屋","Otemachi",24,0,14770,138,"東急田園都市 138%",35.6436,139.6704),
 ("Shibuya","渋谷区","Tokyo","ku","恵比寿","Tokyo",23,1,7990,163,"Metro日比谷 163%",35.6467,139.7101),
 ("Nakano","中野区","Tokyo","ku","中野","Tokyo",20,0,7840,158,"JR中央快速 158%",35.7057,139.6657),
 ("Suginami","杉並区","Tokyo","ku","荻窪","Tokyo",27,0,10480,158,"JR中央快速 158%",35.7044,139.6201),
 ("Toshima","豊島区","Tokyo","ku","池袋","Otemachi",16,0,7990,154,"Metro丸ノ内 154%",35.7295,139.7109),
 ("Kita","北区","Tokyo","ku","赤羽","Tokyo",17,0,7840,131,"JR高崎 131% (京浜東北 158%, 埼京 167%)",35.7777,139.7210),
 ("Arakawa","荒川区","Tokyo","ku","日暮里","Tokyo",13,0,5890,None,"not measured",35.7280,139.7710),
 ("Itabashi","板橋区","Tokyo","ku","成増","Otemachi",35,1,17840,131,"東武東上 131%",35.7776,139.6316),
 ("Nerima","練馬区","Tokyo","ku","練馬","Otemachi",35,1,15050,130,"西武池袋 130%",35.7377,139.6542),
 ("Adachi","足立区","Tokyo","ku","北千住","Otemachi",20,0,8170,150,"Metro千代田 150%",35.7497,139.8049),
 ("Katsushika","葛飾区","Tokyo","ku","新小岩","Tokyo",13,0,6240,160,"JR総武快速 160%",35.7169,139.8584),
 ("Edogawa","江戸川区","Tokyo","ku","西葛西","Otemachi",20,0,7990,160,"Metro東西 160%",35.6645,139.8593),
 ("Musashino","武蔵野市","Tokyo","shi","吉祥寺","Tokyo",33,0,13120,158,"JR中央快速 158%",35.7031,139.5799),
 ("Mitaka","三鷹市","Tokyo","shi","三鷹","Tokyo",35,0,13120,158,"JR中央快速 158%",35.7027,139.5607),
 ("Chofu","調布市","Tokyo","shi","調布","Tokyo",53,1,18060,145,"京王 145%",35.6518,139.5444),
 ("Fuchu","府中市","Tokyo","shi","府中","Tokyo",62,1,19600,145,"京王 145%",35.6722,139.4800),
 ("Koganei","小金井市","Tokyo","shi","武蔵小金井","Tokyo",44,0,15600,158,"JR中央快速 158%",35.7013,139.5065),
 ("Tachikawa","立川市","Tokyo","shi","立川","Tokyo",57,0,21290,158,"JR中央快速 158%",35.6980,139.4137),
 ("Machida","町田市","Tokyo","shi","町田","Otemachi",53,1,21270,150,"小田急 150%",35.5424,139.4458),
 ("Tama-shi","多摩市","Tokyo","shi","多摩センター","Otemachi",62,1,21270,150,"小田急本線 150% (多摩線 77%)",35.6249,139.4243),
 ("Inagi","稲城市","Tokyo","shi","稲城","Tokyo",64,1,19600,145,"京王 145% (相模原線 101%)",35.6355,139.5005),
 ("Chiba-Mihama","千葉市美浜区","Chiba","ku","海浜幕張","Tokyo",34,0,18450,123,"JR京葉 123%",35.6485,140.0420),
 ("Chiba-Chuo","千葉市中央区","Chiba","ku","千葉","Tokyo",41,0,21580,160,"JR総武快速 160%",35.6130,140.1135),
 ("Chiba-Inage","千葉市稲毛区","Chiba","ku","稲毛","Tokyo",37,0,20450,160,"JR総武快速 160%",35.6371,140.0924),
 ("Chiba-Hanamigawa","千葉市花見川区","Chiba","ku","幕張本郷","Tokyo",38,1,15600,160,"JR総武快速 160%",35.6727,140.0428),
 ("Chiba-Midori","千葉市緑区","Chiba","ku","鎌取","Tokyo",53,1,24880,160,"JR総武快速 160%",35.5786,140.1904),
 ("Chiba-Wakaba","千葉市若葉区","Chiba","ku","都賀","Tokyo",49,0,23750,160,"JR総武快速 160%",35.6462,140.1500),
 ("Narashino","習志野市","Chiba","shi","津田沼","Tokyo",30,0,15600,160,"JR総武快速 160%",35.6912,140.0207),
 ("Funabashi","船橋市","Chiba","shi","船橋","Tokyo",26,0,13120,160,"JR総武快速 160%",35.7019,139.9855),
 ("Ichikawa","市川市","Chiba","shi","市川","Tokyo",19,0,10480,160,"JR総武快速 160%",35.7290,139.9087),
 ("Urayasu","浦安市","Chiba","shi","新浦安","Tokyo",20,0,10480,123,"JR京葉 123%",35.6492,139.9136),
 ("Matsudo","松戸市","Chiba","shi","松戸","Tokyo",27,0,13120,142,"JR常磐快速 142%",35.7843,139.9008),
 ("Kashiwa","柏市","Chiba","shi","柏","Tokyo",36,0,18720,142,"JR常磐快速 142%",35.8622,139.9709),
 ("Nagareyama","流山市","Chiba","shi","流山おおたかの森","Tokyo",49,1,28180,151,"TX 151%",35.8705,139.9255),
 ("Inzai","印西市","Chiba","shi","千葉ニュータウン中央","Otemachi",59,1,44600,157,"京成押上 157% (北総 90%)",35.8000,140.1180),
 ("Shiroi","白井市","Chiba","shi","西白井","Otemachi",51,1,37820,157,"京成押上 157% (北総 90%)",35.7967,140.0490),
 ("Yachiyo","八千代市","Chiba","shi","八千代緑が丘","Otemachi",52,0,30810,160,"Metro東西 160% (東葉 105%)",35.7310,140.0710),
 ("Sakura","佐倉市","Chiba","shi","佐倉","Tokyo",61,0,28440,160,"JR総武快速 160%",35.7208,140.2240),
 ("Kisarazu","木更津市","Chiba","shi","木更津","Tokyo",80,0,37460,160,"JR総武快速 160%",35.3804,139.9248),
 ("Sodegaura","袖ケ浦市","Chiba","shi","袖ケ浦","Tokyo",74,0,34170,160,"JR総武快速 160%",35.4276,139.9550),
 ("Ichihara","市原市","Chiba","shi","五井","Tokyo",60,0,26960,160,"JR総武快速 160%",35.5137,140.0890),
 ("Kamagaya","鎌ケ谷市","Chiba","shi","新鎌ヶ谷","Otemachi",47,1,35030,157,"京成押上 157% (北総 90%)",35.7800,140.0000),
 ("Tsukuba","つくば市","Ibaraki","shi","研究学園","Tokyo",71,1,50530,151,"TX 151%",36.0828,140.0816),
 ("Moriya","守谷市","Ibaraki","shi","守谷","Tokyo",56,1,39230,151,"TX 151%",35.9506,139.9932),
 ("Tsukubamirai","つくばみらい市","Ibaraki","shi","みらい平","Tokyo",61,1,43000,151,"TX 151%",35.9922,140.0420),
 ("Saitama-Urawa","さいたま市浦和区","Saitama","ku","浦和","Tokyo",26,0,13120,131,"JR高崎 131% (京浜東北 158%)",35.8587,139.6574),
 ("Saitama-Omiya","さいたま市大宮区","Saitama","ku","大宮","Tokyo",34,0,17970,131,"JR高崎 131%",35.9063,139.6240),
 ("Saitama-Chuo","さいたま市中央区","Saitama","ku","さいたま新都心","Tokyo",31,0,15600,131,"JR高崎 131%",35.8935,139.6331),
 ("Saitama-Minami","さいたま市南区","Saitama","ku","武蔵浦和","Tokyo",38,1,13120,167,"JR埼京 167%",35.8457,139.6475),
 ("Saitama-Midori","さいたま市緑区","Saitama","ku","東浦和","Tokyo",49,1,15600,156,"JR武蔵野 156%",35.8636,139.7104),
 ("Kawaguchi","川口市","Saitama","shi","川口","Tokyo",30,1,10480,158,"JR京浜東北 158%",35.8019,139.7173),
 ("Toda","戸田市","Saitama","shi","戸田公園","Tokyo",32,1,10480,167,"JR埼京 167%",35.8075,139.6789),
 ("Koshigaya","越谷市","Saitama","shi","新越谷","Otemachi",46,1,19900,142,"東武スカイツリーライン 142%",35.8920,139.7915),
 ("Misato","三郷市","Saitama","shi","三郷中央","Tokyo",41,1,26850,151,"TX 151%",35.8240,139.8705),
 ("Yashio","八潮市","Saitama","shi","八潮","Tokyo",37,1,24570,151,"TX 151%",35.8055,139.8441),
 ("Soka","草加市","Saitama","shi","草加","Otemachi",40,1,18020,142,"東武スカイツリーライン 142%",35.8288,139.8044),
 ("Kawasaki-Nakahara","川崎市中原区","Kanagawa","ku","武蔵小杉","Tokyo",18,0,10480,138,"JR横須賀 138%",35.5764,139.6597),
 ("Kawasaki-Takatsu","川崎市高津区","Kanagawa","ku","溝の口","Otemachi",41,0,17420,138,"東急田園都市 138%",35.5998,139.6107),
 ("Kawasaki-Miyamae","川崎市宮前区","Kanagawa","ku","宮前平","Otemachi",50,0,17420,138,"東急田園都市 138%",35.5853,139.5815),
 ("Kawasaki-Kawasaki","川崎市川崎区","Kanagawa","ku","川崎","Tokyo",20,0,10480,159,"JR東海道 159%",35.5313,139.6969),
 ("Kawasaki-Saiwai","川崎市幸区","Kanagawa","ku","新川崎","Tokyo",21,0,10480,138,"JR横須賀 138%",35.5531,139.6693),
 ("Yokohama-Kohoku","横浜市港北区","Kanagawa","ku","日吉","Tokyo",38,1,15470,133,"東急目黒 133%",35.5535,139.6467),
 ("Yokohama-Tsuzuki","横浜市都筑区","Kanagawa","ku","センター南","Tokyo",58,2,26030,134,"横浜市グリーンライン 134%",35.5455,139.5743),
 ("Yokohama-Aoba","横浜市青葉区","Kanagawa","ku","たまプラーザ","Otemachi",49,0,18730,138,"東急田園都市 138%",35.5776,139.5583),
 ("Yokohama-Kanagawa","横浜市神奈川区","Kanagawa","ku","東神奈川","Tokyo",38,1,15600,159,"JR京浜東北/東海道 159%",35.4781,139.6326),
 ("Yokohama-Nishi","横浜市西区","Kanagawa","ku","横浜","Tokyo",30,0,15600,159,"JR東海道 159%",35.4658,139.6223),
]

# ---------------------------------------------------------------- demographics
# pop2025, change2020to25 %, IPSS 2050 vs 2020 %, child share 2020 %
DEMO = {
 "Chiyoda":(66270,-0.6,19.7,13.46),"Chuo":(181841,7.5,24.7,13.65),"Minato":(272478,4.6,20.0,13.33),
 "Shinjuku":(361357,3.4,4.2,8.36),"Bunkyo":(249800,4.1,13.1,11.69),"Taito":(228046,7.9,15.7,8.82),
 "Sumida":(285038,4.8,9.2,10.30),"Koto":(553502,5.6,13.0,12.68),"Shinagawa":(426005,0.8,10.1,11.13),
 "Meguro":(286082,-0.7,3.6,10.95),"Ota":(758181,1.4,2.7,10.32),"Setagaya":(954737,1.2,4.6,11.54),
 "Shibuya":(238826,-2.1,9.6,9.42),"Nakano":(354853,2.9,4.9,8.44),"Suginami":(597038,1.0,4.7,9.97),
 "Toshima":(305516,1.3,9.2,8.78),"Kita":(367827,3.6,1.0,10.28),"Arakawa":(226291,4.1,6.3,11.25),
 "Itabashi":(595972,2.0,3.5,10.27),"Nerima":(760819,1.1,0.3,11.42),"Adachi":(701667,1.0,2.3,10.88),
 "Katsushika":(467267,3.1,-0.5,11.38),"Edogawa":(704696,1.0,-2.7,12.36),
 "Musashino":(150528,0.3,5.8,11.48),"Mitaka":(194892,-0.3,3.6,12.01),"Chofu":(245306,1.1,4.4,11.85),
 "Fuchu":(263084,0.1,-1.0,12.55),"Koganei":(128953,2.3,2.3,11.80),"Tachikawa":(189304,3.1,-2.6,11.89),
 "Machida":(420385,-2.5,-5.7,11.87),"Tama-shi":(141575,-3.7,-8.9,11.28),"Inagi":(95120,2.1,8.6,14.10),
 "Chiba-Chuo":(226907,7.2,1.0,10.31),"Chiba-Hanamigawa":(177630,0.2,-14.4,10.53),"Chiba-Inage":(160432,-0.1,-5.0,11.57),
 "Chiba-Wakaba":(145508,-1.0,-15.6,10.63),"Chiba-Midori":(128147,-1.0,-1.5,14.01),"Chiba-Mihama":(156222,4.9,-14.4,12.15),
 "Narashino":(175706,-0.3,-0.5,12.59),"Funabashi":(651663,1.4,1.4,12.53),"Ichikawa":(494354,-0.5,-2.7,11.53),
 "Urayasu":(172707,0.8,-4.4,12.58),"Matsudo":(496374,-0.4,-4.5,11.41),"Kashiwa":(435302,2.1,2.1,12.51),
 "Nagareyama":(215086,7.6,20.9,15.60),"Inzai":(110339,7.5,16.8,16.36),"Shiroi":(60932,-2.4,-10.5,13.80),
 "Yachiyo":(204904,2.7,-2.0,12.82),"Sakura":(163765,-3.0,-19.6,11.02),"Kisarazu":(137069,0.7,-1.7,12.59),
 "Sodegaura":(65079,1.9,-2.6,13.50),"Ichihara":(259897,-3.6,-23.0,11.15),"Kamagaya":(109081,-0.8,-6.1,11.42),
 "Tsukuba":(268832,11.2,6.0,14.34),"Moriya":(70199,2.6,11.4,15.06),"Tsukubamirai":(52100,4.5,13.0,14.74),
 "Saitama-Omiya":(125285,6.4,6.0,12.11),"Saitama-Chuo":(103818,0.5,0.8,12.28),"Saitama-Urawa":(169446,2.8,6.4,13.69),
 "Saitama-Minami":(196185,2.4,3.0,13.41),"Saitama-Midori":(132357,3.1,13.2,15.09),
 "Kawaguchi":(591712,-0.4,0.9,12.23),"Toda":(139232,-1.2,7.0,14.21),"Koshigaya":(341497,-0.0,-3.3,12.73),
 "Misato":(140568,-1.1,-1.1,12.78),"Yashio":(93410,0.1,9.3,12.14),"Soka":(251360,1.2,-7.5,11.71),
 "Kawasaki-Kawasaki":(233357,0.2,1.8,10.65),"Kawasaki-Saiwai":(175700,2.7,8.2,13.39),"Kawasaki-Nakahara":(269570,2.2,9.6,12.92),
 "Kawasaki-Takatsu":(236857,1.1,5.1,12.52),"Kawasaki-Miyamae":(235603,0.8,2.2,13.63),
 "Yokohama-Kohoku":(363598,1.4,5.3,12.11),"Yokohama-Tsuzuki":(214025,0.4,2.9,14.95),"Yokohama-Aoba":(306583,-1.3,-6.2,12.55),
 "Yokohama-Kanagawa":(252260,2.0,1.0,10.90),"Yokohama-Nishi":(108145,3.1,8.9,10.90),
}

# ---------------------------------------------------------------- childcare
TOKYO_WAIT = {  # (2025, 2026, gakudo 2026 速報)
 "Chiyoda":(0,0,0),"Chuo":(0,4,118),"Minato":(0,0,36),"Shinjuku":(0,0,5),"Bunkyo":(4,6,19),"Taito":(0,5,48),
 "Sumida":(5,17,5),"Koto":(0,0,43),"Shinagawa":(0,0,0),"Meguro":(0,0,28),"Ota":(0,48,139),"Setagaya":(47,166,0),
 "Shibuya":(0,0,0),"Nakano":(0,0,0),"Suginami":(0,0,372),"Toshima":(0,0,0),"Kita":(18,103,0),"Arakawa":(11,14,0),
 "Itabashi":(7,35,0),"Nerima":(0,21,51),"Adachi":(7,106,88),"Katsushika":(0,0,320),"Edogawa":(0,75,0),
 "Musashino":(0,0,0),"Mitaka":(0,0,0),"Chofu":(8,32,94),"Fuchu":(13,38,50),"Koganei":(6,10,32),
 "Tachikawa":(8,45,142),"Machida":(40,90,45),"Tama-shi":(2,6,105),"Inagi":(16,28,102),
}
TOKYO_COPAY = {"Koganei":200,"Machida":200,"Tama-shi":200,"Inagi":200}
TOKYO_EXTRA = {  # verified-ish ward cash extras -> (points 0-2, text)
 "Minato":(2,"出産費用助成 up to +¥310k (cap ¥810k)"),
 "Shibuya":(2,"ハッピーマザー出産助成金 ¥100k"),
 "Edogawa":(2,"乳児養育手当 ¥13k/month for age 0 (~¥156k)"),
 "Chiyoda":(1,"誕生準備手当 ¥45k or ¥450k (sources conflict); 次世代育成手当 ¥15k/month (age band unverified)"),
 "Itabashi":(0,"物価高対応子育て応援手当 ¥20k one-off"),
 "Setagaya":(0,"¥20k birth voucher"),
 "Machida":(0,"出産祝い金 ¥10k"),
}

# suburbs: fee1 (None=unknown), fee2 (None), wait25, wait26, gakudo (int, or '<50'), medAge, copay(None=unknown), lunch code, feeNote
# lunch codes: all / jh / partial / third / paid / unknown
CHIBA_CITY = dict(fee1=54330, fee2=27160, w25=0, w26=0, gak=0, medAge=18, copay=300, lunch="third", note="Chiba-shi FY2026 table D9; 2nd child half since 2025-09")
SAITAMA_CITY = dict(fee1=55000, fee2=27500, w25=0, w26=0, gak=197, medAge=18, copay=None, lunch="paid", note="Saitama-shi FY2026 てびき 第9階層")
KAWASAKI = dict(fee1=60500, fee2=30250, w25=0, w26=0, gak=0, medAge=15, copay=500, lunch="paid", note="Kawasaki C19; medical to 中3 with ¥500/visit from 小4 (expansion to 18 planned 2026-09, unconfirmed)")
YOKOHAMA = dict(fee1=60000, fee2=29000, w25=0, w26=0, gak=0, medAge=18, copay=0, lunch="paid", note="Yokohama D20; medical to 18 ¥0 from 2026-06-01; JH lunch ¥330/meal")
SUB = {
 "Chiba-Mihama":CHIBA_CITY,"Chiba-Chuo":CHIBA_CITY,"Chiba-Inage":CHIBA_CITY,"Chiba-Hanamigawa":CHIBA_CITY,"Chiba-Midori":CHIBA_CITY,"Chiba-Wakaba":CHIBA_CITY,
 "Narashino":dict(fee1=None,fee2=None,w25=5,w26=8,gak="<50",medAge=18,copay=300,lunch="third",note="FY2026 fee table not extracted"),
 "Funabashi":dict(fee1=54900,fee2=27450,w25=34,w26=12,gak=157,medAge=18,copay=300,lunch="third",note="Funabashi D10 (table 2024-09)"),
 "Ichikawa":dict(fee1=0,fee2=0,w25=0,w26=0,gak=283,medAge=18,copay=300,lunch="all",note="第1子 0–2 free from 2026-09, no income limit"),
 "Urayasu":dict(fee1=0,fee2=0,w25=0,w26=0,gak="<50",medAge=18,copay=0,lunch="all",note="All 0–2 classes free from 2026-04-01"),
 "Matsudo":dict(fee1=None,fee2=None,w25=0,w26=0,gak="<50",medAge=18,copay=200,lunch="partial",note="Fee not extracted; JH lunch ¥62/meal reduction"),
 "Kashiwa":dict(fee1=None,fee2=None,w25=0,w26=0,gak=147,medAge=18,copay=300,lunch="partial",note="Fee at ¥285k bracket not extracted (¥301–333k bracket = ¥61,300); JH lunch ~half"),
 "Nagareyama":dict(fee1=59900,fee2=29950,w25=0,w26=0,gak="<50",medAge=18,copay=200,lunch="third",note="Nagareyama C9; 送迎保育ステーション"),
 "Inzai":dict(fee1=None,fee2=None,w25=0,w26=0,gak=76,medAge=18,copay=200,lunch="all",note="Fee not extracted; lunch free since 2024-09"),
 "Shiroi":dict(fee1=None,fee2=None,w25=2,w26=2,gak="<50",medAge=18,copay=300,lunch="jh",note="Fee not extracted; JH lunch free"),
 "Yachiyo":dict(fee1=None,fee2=None,w25=16,w26=9,gak=130,medAge=18,copay=300,lunch="third",note="Fee not extracted"),
 "Sakura":dict(fee1=None,fee2=None,w25=0,w26=0,gak="<50",medAge=18,copay=200,lunch="third",note="Fee not extracted"),
 "Kisarazu":dict(fee1=None,fee2=None,w25=14,w26=19,gak="<50",medAge=18,copay=200,lunch="third",note="Fee not extracted"),
 "Sodegaura":dict(fee1=None,fee2=None,w25=0,w26=0,gak="<50",medAge=18,copay=200,lunch="third",note="Fee not extracted"),
 "Ichihara":dict(fee1=None,fee2=None,w25=0,w26=0,gak="<50",medAge=18,copay=300,lunch="third",note="Fee not extracted"),
 "Kamagaya":dict(fee1=None,fee2=None,w25=0,w26=0,gak="<50",medAge=18,copay=300,lunch="third",note="Fee not extracted"),
 "Tsukuba":dict(fee1=45000,fee2=22500,w25=0,w26=None,gak="<50",medAge=18,copay=600,lunch="paid",note="Tsukuba FY2026 11階層; medical ¥600/day (max 2 days/month); 2026 waitlist not found"),
 "Moriya":dict(fee1=None,fee2=None,w25=0,w26=None,gak="<50",medAge=18,copay=600,lunch="paid",note="Fee not extracted; JH lunch ¥4,500/month"),
 "Tsukubamirai":dict(fee1=56000,fee2=28000,w25=0,w26=None,gak="<50",medAge=18,copay=600,lunch="unknown",note="Fee from ~2023 PDF, unverified for 2026"),
 "Saitama-Urawa":SAITAMA_CITY,"Saitama-Omiya":SAITAMA_CITY,"Saitama-Chuo":SAITAMA_CITY,"Saitama-Minami":SAITAMA_CITY,"Saitama-Midori":SAITAMA_CITY,
 "Kawaguchi":dict(fee1=60000,fee2=30000,w25=9,w26=7,gak=0,medAge=18,copay=None,lunch="paid",note="Kawaguchi 第11階層; JH lunch ¥4,336/month"),
 "Toda":dict(fee1=None,fee2=None,w25=18,w26=0,gak="<50",medAge=18,copay=None,lunch="all",note="Fee not extracted; lunch free since 2025-04"),
 "Koshigaya":dict(fee1=None,fee2=None,w25=3,w26=2,gak=208,medAge=18,copay=None,lunch="paid",note="Fee not extracted"),
 "Misato":dict(fee1=None,fee2=None,w25=0,w26=0,gak="<50",medAge=18,copay=None,lunch="unknown",note="Fee and lunch status not found"),
 "Yashio":dict(fee1=None,fee2=None,w25=15,w26=12,gak=86,medAge=18,copay=None,lunch="paid",note="Fee table is an image PDF"),
 "Soka":dict(fee1=60000,fee2=30000,w25=26,w26=5,gak="<50",medAge=18,copay=None,lunch="paid",note="Soka D17"),
 "Kawasaki-Nakahara":KAWASAKI,"Kawasaki-Takatsu":KAWASAKI,"Kawasaki-Miyamae":KAWASAKI,"Kawasaki-Kawasaki":KAWASAKI,"Kawasaki-Saiwai":KAWASAKI,
 "Yokohama-Kohoku":YOKOHAMA,"Yokohama-Tsuzuki":YOKOHAMA,"Yokohama-Aoba":YOKOHAMA,"Yokohama-Kanagawa":YOKOHAMA,"Yokohama-Nishi":YOKOHAMA,
}
FEE_IMPUTE = {"Chiba":54900,"Saitama":60000,"Ibaraki":50500}  # median of confirmed paying municipalities in the prefecture
LUNCH_TXT = {"all":"Elementary + junior high free","jh":"Junior high free (elementary national support)","partial":"Elementary free; junior high partly subsidised",
             "third":"Elementary free FY2026; junior high free only for 3rd child+","paid":"Elementary free/supported FY2026; junior high paid","unknown":None}

# ---------------------------------------------------------------- costco (nearest, road km est, drive min mid)
COSTCO = {
 "Chiyoda":("川崎",26,67.5),"Chuo":("川崎",23,60),"Minato":("川崎",21,55),"Shinjuku":("川崎",26,67.5),"Bunkyo":("新三郷",27,72.5),
 "Taito":("新三郷",24,65),"Sumida":("新三郷",24,65),"Koto":("川崎 / 幕張 (near-tie)",25,67.5),"Shinagawa":("川崎",13,35),"Meguro":("川崎",18,47.5),
 "Ota":("川崎",6,15),"Setagaya":("川崎",21,55),"Shibuya":("川崎",22,60),"Nakano":("川崎",29,77.5),"Suginami":("川崎",29,77.5),
 "Toshima":("新三郷",27,72.5),"Kita":("新三郷",23,60),"Arakawa":("新三郷",21,55),"Itabashi":("新三郷",25,67.5),"Nerima":("新三郷",32,85),
 "Adachi":("新三郷",15,40),"Katsushika":("新三郷",18,47.5),"Edogawa":("幕張",21,55),
 "Musashino":("入間",27,65),"Mitaka":("多摩境",26,60),"Chofu":("多摩境",21,52.5),"Fuchu":("多摩境",16,37.5),"Koganei":("多摩境 (est.)",None,45),
 "Tachikawa":("多摩境",15,35),"Machida":("座間",10,25),"Tama-shi":("多摩境",10,22.5),"Inagi":("多摩境",17,40),
 "Chiba-Mihama":("幕張",5,12.5),"Chiba-Chuo":("幕張",12,30),"Chiba-Inage":("幕張",8,20),"Chiba-Hanamigawa":("幕張",5,12.5),
 "Chiba-Midori":("幕張",22,52.5),"Chiba-Wakaba":("幕張",16,37.5),"Narashino":("幕張",5,10),"Funabashi":("幕張",8,17.5),
 "Ichikawa":("幕張",16,37.5),"Urayasu":("幕張",15,35),"Matsudo":("新三郷",12,30),"Kashiwa":("新三郷",13,30),"Nagareyama":("新三郷",7,17.5),
 "Inzai":("千葉ニュータウン",2,7.5),"Shiroi":("千葉ニュータウン",9,22.5),"Yachiyo":("千葉NT / 幕張 (tie)",13,30),"Sakura":("千葉ニュータウン",16,40),
 "Kisarazu":("木更津",7,17.5),"Sodegaura":("木更津",5,12.5),"Ichihara":("幕張 / 木更津 (tie)",24,57.5),"Kamagaya":("千葉ニュータウン",16,40),
 "Tsukuba":("つくば",4,10),"Moriya":("新三郷 / つくば (near-tie)",21,47.5),"Tsukubamirai":("つくば",18,42.5),
 "Saitama-Urawa":("新三郷",25,60),"Saitama-Omiya":("新三郷",30,70),"Saitama-Chuo":("新三郷",29,70),"Saitama-Minami":("新三郷",27,65),
 "Saitama-Midori":("新三郷",21,47.5),"Kawaguchi":("新三郷",19,45),"Toda":("新三郷",24,55),"Koshigaya":("新三郷",10,22.5),
 "Misato":("新三郷",5,12.5),"Yashio":("新三郷",6,17.5),"Soka":("新三郷",9,22.5),
 "Kawasaki-Kawasaki":("川崎",4,10),"Kawasaki-Saiwai":("川崎",6,12.5),"Kawasaki-Nakahara":("川崎",12,30),"Kawasaki-Takatsu":("川崎",19,42.5),
 "Kawasaki-Miyamae":("川崎",20,47.5),"Yokohama-Kohoku":("川崎",12,30),"Yokohama-Tsuzuki":("座間 / 川崎 (tie)",20,47.5),"Yokohama-Aoba":("座間",17,40),
 "Yokohama-Kanagawa":("川崎 (writer est.)",14,37.5),"Yokohama-Nishi":("川崎 / 金沢シーサイド (writer est.)",16,42.5),
}
COSTCO_IMPUTED = {"Koganei","Yokohama-Kanagawa","Yokohama-Nishi"}

# ---------------------------------------------------------------- buses
BUS = {
 "Kisarazu":dict(available=True,route="木更津～東京線 (日東交通+京成) → BT東京八重洲; plus 木更津金田BT P&R hub (26 departures 05:00–07:59)",
                 morningCount=9,eveningCount=9,rideMin="64–74 (+Aqua-Line delays)",fare=1500,passMonthly=54000,
                 src="https://www.nitto-kotsu.co.jp/at-%e6%9c%a8%e6%9b%b4%e6%b4%a5%e6%9d%b1%e4%ba%ac%e7%b7%9a%ef%bc%882026-1-01%ef%bd%9e%ef%bc%89/",ride=69,imputed=False),
 "Sodegaura":dict(available=True,route="袖ケ浦～東京線「東京ガウライナー」(小湊鉄道) → 東京駅日本橋口",
                 morningCount=3,eveningCount=5,rideMin="50–60 (+10–25 Aqua-Line delay)",fare=1500,passMonthly=51300,
                 src="https://www.kominato-bus.com/highway/high/sodegaura-tokyo.html",ride=55,imputed=False),
 "Ichihara":dict(available=True,route="マイタウンライナー おゆみ野・ちはら台線 from ちはら台 (あすか交通+平和交通) → 東京駅日本橋口/銀座; also 勝浦～東京線 via 市原鶴舞BT (1 AM / 2 PM). Not from 五井",
                 morningCount=4,eveningCount=4,rideMin="90–130 (ちはら台駅)",fare=1200,passMonthly=None,
                 src="https://heiwakotsu.com/timefare_mtl_chihara.htm",ride=100,imputed=False),
 "Sakura":dict(available=True,route="東京駅～ユーカリが丘・臼井・千代田団地 (京成バス千葉イースト)",
                 morningCount=2,eveningCount=2,rideMin="77–107",fare=1400,passMonthly=None,
                 src="https://www.keiseibus.co.jp/express-bus/90404-2/",ride=92,imputed=False),
 "Chiba-Wakaba":dict(available=True,route="マイタウンライナー おゆみ野・ちはら台線 from 大宮町ターミナル (あすか交通+平和交通) → 東京駅日本橋口/銀座; also 東京駅～千城台・御成台車庫 (京成, 1 AM / 1 PM)",
                 morningCount=4,eveningCount=4,rideMin="55–95 (大宮町ターミナル)",fare=1200,passMonthly=None,
                 src="https://heiwakotsu.com/timefare_mtl_chihara.htm",ride=70,imputed=False),
 "Chiba-Hanamigawa":dict(available=True,route="ちばきたライナー (草野車庫 P&R; stop-to-ward mapping inferred)",
                 morningCount=1,eveningCount=1,rideMin="67",fare=1100,passMonthly=None,
                 src="https://www.keiseibus.co.jp/express-bus/90420-2/",ride=67,imputed=False),
 "Chiba-Inage":dict(available=True,route="マイタウンライナー ベイエリア線, 稲毛ルート (平和交通: 平和交通本社・スカイタウン・稲毛5丁目…) → 東京駅日本橋口/銀座; also ちばきたライナー (長沼, 1 AM / 1 PM)",
                 morningCount=2,eveningCount=3,rideMin="59–94 (スカイタウン)",fare=1000,passMonthly=None,
                 src="https://heiwakotsu.com/timefare_mtl_bayarea.htm",ride=75,imputed=False),
 "Urayasu":dict(available=True,route="東京駅～TDR・新浦安地区 (京成バス; 新浦安 bay districts 日の出・明海・高洲・富岡) → 東京駅日本橋口",
                 morningCount=10,eveningCount=5,rideMin="23–33 (富岡三丁目) to 44–54 (日の出七丁目)",fare=730,passMonthly=None,
                 src="https://www.keiseibus.co.jp/express-bus/90401-2/",ride=45,imputed=False),
 "Chiba-Mihama":dict(available=True,route="マイタウンライナー ベイエリア線 (平和交通+あすか交通; 幕張ベイタウン・ベイパーク・検見川浜・稲毛海岸・高洲) → 東京駅日本橋口/銀座",
                 morningCount=4,eveningCount=3,rideMin="38–81 (若葉公園 / 9番街)",fare=800,passMonthly=None,
                 src="https://heiwakotsu.com/timefare_mtl_bayarea.htm",ride=65,imputed=False),
 "Chiba-Midori":dict(available=True,route="マイタウンライナー おゆみ野・ちはら台線 (あすか交通+平和交通; おゆみ野・学園前・有吉) → 東京駅日本橋口/銀座",
                 morningCount=4,eveningCount=4,rideMin="72–112 (おゆみ野駅)",fare=1200,passMonthly=None,
                 src="https://heiwakotsu.com/timefare_mtl_chihara.htm",ride=85,imputed=False),
 "Tsukuba":dict(available=True,route="つくば号 (JRバス関東+関東鉄道), ~30–32 trips/day each way, seated-capacity",
                 morningCount=None,eveningCount=None,rideMin="85–105",fare=1260,passMonthly=None,
                 src="https://ja.wikipedia.org/wiki/つくば号",ride=95,imputed=True),
 "Yokohama-Aoba":dict(available=None,route="東名ハイウェイバス stop 東名江田 → 東京駅 via 霞が関 (seat-reserved; weekday timetable not obtained)",
                 morningCount=None,eveningCount=None,rideMin=None,fare=None,passMonthly=None,
                 src="https://trafficnews.jp/post/80561/2",ride=None,imputed=False),
}

# ---------------------------------------------------------------- pipeline adjustments (growth)
PIPE = {
 "Nagareyama":(3,"TX 8-car upgrade (early 2030s)"),"Kashiwa":(3,"TX 8-car upgrade (柏の葉)"),"Moriya":(3,"TX 8-car upgrade"),
 "Tsukubamirai":(3,"TX 8-car upgrade"),"Yashio":(3,"TX 8-car upgrade; platform extension FY2026"),
 "Tsukuba":(5,"TX 8-car upgrade + large condo project selling from spring 2026"),
 "Yokohama-Kohoku":(5,"相鉄・東急新横浜線 open since 2023-03 (新綱島, 新横浜)"),
 "Chuo":(3,"晴海フラッグ (~11,000 residents)"),"Minato":(3,"高輪ゲートウェイシティ (2025); 南北線 品川延伸 mid-2030s"),
 "Koto":(3,"有楽町線 豊洲–住吉 extension, mid-2030s"),"Shinagawa":(3,"南北線 品川延伸; 羽田空港アクセス線 (FY2031)"),
 "Chiba-Chuo":(3,"千葉駅 redevelopment; top net-inflow rate in region"),"Chiba-Mihama":(3,"幕張ベイパーク new town"),
 "Saitama-Urawa":(2,"羽田空港アクセス線 through-running (FY2031)"),"Saitama-Omiya":(2,"羽田空港アクセス線 through-running (FY2031)"),
 "Saitama-Chuo":(2,"羽田空港アクセス線 through-running (FY2031)"),"Kawaguchi":(1,"上野東京ライン stop, 2037 at earliest"),
 "Ota":(1,"新空港線 (蒲蒲線) 2038–42"),
 "Narashino":(-3,"津田沼駅南口 redevelopment paused (2025-05)"),"Nakano":(-3,"中野サンプラザ redevelopment back to square one"),
}

# ---------------------------------------------------------------- helpers
def clamp(x, lo=0.0, hi=100.0): return max(lo, min(hi, x))
def lin(x, x0, x1, y0, y1):
    if x is None: return None
    t = (x - x0) / (x1 - x0); t = max(0.0, min(1.0, t)); return y0 + t * (y1 - y0)

def raw_stats(name):
    L = raw[name]["l90"]; seen = set(); U = []
    for x in L:
        k = (x["n"], round(x["a"]), x["p"])
        if k in seen: continue
        seen.add(k); U.append(x)
    modern = [x["p"] for x in U if 90 <= x["a"] <= 110 and x.get("y") and x["y"] >= 2000]
    u80 = [x for x in U if x["p"] < 8000]
    return dict(modern_med=statistics.median(modern) if modern else None, modern_n=len(modern),
                u80=len(u80), u80_modern=sum(1 for x in u80 if x.get("y") and x["y"] >= 2000), sc=raw[name]["sc"])

def commute_score(m, x, crowd, pss):
    eff = m + 5 * x
    s = 100 * (80 - eff) / 65
    s = clamp(s)
    adj = 0
    if crowd is not None:
        if crowd >= 158: adj -= 5
        elif crowd >= 150: adj -= 2
        elif crowd <= 125: adj += 5
    if pss > 45000: adj -= 10
    elif pss > 30000: adj -= 5
    return clamp(s + adj), eff

def bus_score(b, rail_eff):
    if b is None or b.get("available") is not True: return 0.0
    A = b["morningCount"]; P = b["eveningCount"]
    if A is None: A = 5
    if P is None: P = 5
    f = 50 * min(A, 9) / 9 + 50 * min(P, 9) / 9
    if b["ride"] is not None and b["ride"] > rail_eff + 15: f *= 0.6
    return f

def gak_points(g):
    if g is None: return 7.5, True
    if g == "<50": return 10, False
    if g == 0: return 15, False
    if g < 50: return 10, False
    if g < 150: return 5, False
    return 0, False

def wait_points(w):
    if w == 0: return 30
    if w < 10: return 24
    if w < 30: return 18
    if w < 60: return 12
    if w < 100: return 6
    return 0

def med_points(age, copay):
    if copay is None: return 3.5, True
    if age < 18: return 2.5, False
    return {0: 5, 200: 4, 300: 3.5, 500: 2.5, 600: 2}.get(copay, 3), False

LUNCH_PTS = {"all": 5, "jh": 5, "partial": 3, "third": 2, "paid": 1}

def yahoo(st, dest):
    to = "東京" if dest == "Tokyo" else "大手町(東京都)"
    return f"https://transit.yahoo.co.jp/search/result?from={quote(st)}&to={quote(to)}&y=2026&m=10&d=14&hh=08&m1=4&m2=5&type=4&ticket=ic"

# ---------------------------------------------------------------- build
areas = []
for (en, ja, pref, typ, st, dest, mins, xf, pss, crowd, crowdtxt, lat, lng) in A:
    s = summary[en]; rs = raw_stats(en); flags = []
    # commute
    cs, eff = commute_score(mins, xf, crowd, pss)
    if crowd is None: flags.append("crowding not measured by MLIT for this line: no crowding adjustment")
    # bus
    b = BUS.get(en)
    bs = bus_score(b, eff)
    if b and b.get("imputed"): flags.append("bus counts unknown: imputed 5 AM / 5 PM trips from ~30 trips/day")
    if b and b.get("available") is None: flags.append("bus route exists but weekday timetable not obtained: scored 0 (unverified, conservative)")
    # childcare
    if pref == "Tokyo":
        w25, w26, gak = TOKYO_WAIT[en]
        fee1, fee2 = 0, 0; copay = TOKYO_COPAY.get(en, 0); medAge = 18; lunch = "all"
        ex = TOKYO_EXTRA.get(en, (0, None))
        cash_pts = 8 + ex[0]
        cash_txt = "018サポート ¥5,000/month per child; 赤ちゃんファースト ¥130k gift (births 2026-01 to 2027-03)" + (("; " + ex[1]) if ex[1] else "")
        fee_note = "Tokyo 0–2 認可 fee free for all children since 2025-09"
        tokyo_cash = 120000
        if en in ("Chiyoda",): flags.append("Chiyoda cash amounts conflict between aggregators")
    else:
        d = SUB[en]
        w25, w26, gak = d["w25"], d["w26"], d["gak"]
        fee1, fee2, copay, medAge, lunch = d["fee1"], d["fee2"], d["copay"], d["medAge"], d["lunch"]
        cash_pts = 0; cash_txt = None; fee_note = d["note"]; tokyo_cash = 0
    fee_for_score = fee1
    if fee1 is None:
        fee_for_score = FEE_IMPUTE[pref]; flags.append(f"0–2 fee not extracted: imputed prefecture median ¥{fee_for_score:,}")
    if en == "Tsukubamirai": flags.append("0–2 fee from ~2023 table, unverified for 2026")
    fee_pts = 35 * clamp(1 - fee_for_score / 65000, 0, 1)
    wv = w26
    if w26 is None:
        wv = w25; flags.append("2026 daycare waitlist not published in sources: 2025 value used")
    wp = wait_points(wv)
    gp, gimp = gak_points(gak)
    if gak == "<50": flags.append("学童 waitlist only known as <50 (2025 CFA list): banded 10/15")
    mp, mimp = med_points(medAge, copay)
    if mimp: flags.append("medical copay not extracted: mid value imputed")
    if lunch == "unknown":
        lp = 2; flags.append("junior-high lunch status unknown: mid value imputed")
    else:
        lp = LUNCH_PTS[lunch]
    if pref != "Tokyo": flags.append("municipal cash extras not systematically surveyed (Tokyo-only 018/gift = 0 by rule)")
    ccs = fee_pts + cash_pts + wp + gp + mp + lp
    if fee1 is not None and fee2 is not None:
        annual = tokyo_cash - 12 * (fee1 + fee2)
    else:
        annual = None
    # space
    med_all = s["med_p"]; n_all = s["nb"]
    mm, mn = rs["modern_med"], rs["modern_n"]
    est95 = s["est95"]
    if mm is not None and mn >= 3 and med_all is not None and n_all >= 3:
        P = math.sqrt(mm * med_all); pbasis = "geometric mean of all-age 90–105 m² and built≥2000 90–110 m² medians"
    elif med_all is not None and n_all >= 3:
        P = math.sqrt(med_all * est95); pbasis = "geometric mean of all-age 90–105 m² median and 70–80 m² ¥/m² × 95 (built≥2000 sample <3)"
        flags.append("built≥2000 90–110 m² sample <3: price blends all-age median with 70–80 m² unit price × 95")
    elif mm is not None and mn >= 3:
        P = math.sqrt(mm * est95); pbasis = "geometric mean of built≥2000 median and 70–80 m² ¥/m² × 95 (all-age sample <3)"
        flags.append("all-age 90–105 m² sample <3: price blends built≥2000 median with 70–80 m² unit price × 95")
    else:
        P = est95; pbasis = "70–80 m² ¥/m² × 95 (no usable ≥90 m² sample)"; flags.append("no usable ≥90 m² price sample: 95 m² price estimated from 70–80 m² unit price (thin)")
    price_s = 100 * clamp((math.log(15000) - math.log(P)) / (math.log(15000) - math.log(4000)), 0, 1)
    cnt_s = 100 * min(1, rs["u80"] / 40)
    aff_share = 100 * rs["u80"] / s["total"] if s["total"] else 0
    aff_s = 100 * min(1, aff_share / 15)
    ss = 0.4 * price_s + 0.3 * cnt_s + 0.3 * aff_s
    # growth
    pop, chg, ipss, child = DEMO[en]
    land5 = s["land5"]
    pipe = PIPE.get(en, (0, None))
    gs = lin(chg, -4, 8, 0, 35) + lin(ipss, -15, 15, 0, 30) + lin(land5, 5, 45, 0, 20) + lin(child, 9, 15, 0, 10) + pipe[0]
    gs = clamp(gs)
    # costco
    cn, ckm, cmin = COSTCO[en]
    cos = clamp(100 * (75 - cmin) / 60)
    if en in COSTCO_IMPUTED: flags.append("Costco drive time estimated by report writer with the research method (not in source table)")
    aid = en.lower().replace("-shi", "")
    hz = HAZ[aid]
    hs, hparts = hazard_score(hz)
    if hz["liqRated"] < 60: flags.append(f"Liquefaction: only {hz['liqRated']:g}% of residents are on GSI-classified landform (rest unrated, scored neutral)")
    if hz["quake30"] is None: flags.append("Earthquake probability unavailable (J-SHIS) — scored at midpoint")
    total = sum(WEIGHTS[k] * v for k, v in zip(SUBS, [cs, bs, ccs, ss, gs, cos, hs])) / 100

    hl = []
    if eff <= 25: hl.append(f"{mins} min to {dest} from {st}" + (" with 0 transfers" if xf == 0 else ""))
    if b and b.get("available"): hl.append("Weekday commuter bus to Tokyo Station")
    if fee1 == 0 and pref != "Tokyo": hl.append("0–2 認可 daycare free (matches Tokyo)")
    if wv == 0: hl.append("Zero daycare waitlist")
    elif wv >= 75: hl.append(f"Daycare waitlist {wv} (2026)")
    if isinstance(gak, int) and gak >= 150: hl.append(f"学童 waitlist {gak}")
    if s["share"] >= 20: hl.append(f"{s['share']:.0f}% of used listings ≥90 m²")
    if rs["u80"] >= 30: hl.append(f"{rs['u80']} ≥90 m² listings under ¥80M")
    if P >= 15000: hl.append("95 m² condo ≥¥150M")
    if chg >= 5: hl.append(f"Population +{chg}% (2020→25)")
    if chg <= -2: hl.append(f"Population {chg}% (2020→25)")
    if cmin <= 15: hl.append(f"Costco {cn} ~{cmin:g} min")
    if pipe[1]: hl.append(pipe[1])
    if crowd and crowd >= 160: hl.append(f"Crowded line ({crowdtxt})")
    if pss > 30000: hl.append(f"Expensive pass ¥{pss:,}/month")

    pc = rs["sc"][:2]
    sources = [
        yahoo(st, dest),
        "https://www.mlit.go.jp/report/press/content/002015142.pdf",
        f"https://suumo.jp/jj/bukken/ichiran/JJ010FJ001/?ar=030&bs=011&ta={pc}&sc={rs['sc']}&mb=90&mt=9999999&pc=100",
        f"https://totinokati.com/kakaku/place/{rs['sc']}/kouji/",
        "https://uub.jp/cdr/j/zogen.html", "https://uub.jp/cdr/j/f.html", "https://uub.jp/cdr/j/child.html",
        "https://hubmedia.co.jp/costco/costco-store/japan-all-costco-stores/",
    ]
    if pref == "Tokyo":
        sources += ["https://www.metro.tokyo.lg.jp/documents/d/tosei/20260828_05_04",
                    "https://www.fukushi.metro.tokyo.lg.jp/documents/d/fukushi/080501sokuhou",
                    "https://www.spt.metro.tokyo.lg.jp/kodomoseisaku/book/2025-02_tokyo_syoshika2025/pageindices/index30.html",
                    "https://www.fukushi.metro.tokyo.lg.jp/documents/d/fukushi/2026-07-02-093829-831"]
    else:
        prefsrc = {"Chiba":"https://www.pref.chiba.lg.jp/jika/hoikusho/jouhou/documents/r080401itiran.pdf",
                   "Saitama":"https://www.pref.saitama.lg.jp/documents/286861/shityousonnbetu20260827kai.pdf",
                   "Kanagawa":"https://www.pref.kanagawa.jp/documents/136348/taikijidoubessi.pdf",
                   "Ibaraki":"https://www.cfa.go.jp/assets/contents/node/basic_page/field_ref_resources/b0a8057b-34bf-4c20-84fb-ae592708ca9b/1aa96453/20250828_policies_hoiku_torimatome_r7_04.xlsx"}[pref]
        sources += [prefsrc, "https://www.cfa.go.jp/assets/contents/node/basic_page/field_ref_resources/69799c33-85cb-44f6-8c70-08ed3a292ab5/c253a682/20251222_policies_kosodateshien_houkago-jidou_80.pdf"]
        FEESRC = {"Chiba-":"https://www.city.chiba.jp/kodomomirai/yojikyoiku/unei/documents/r8_riyousyafutanngaku.pdf",
                  "Funabashi":"https://www.city.funabashi.lg.jp/kodomo/hoiku/002/hoikuryouhyou_d/fil/hyoujunhoikuryou.pdf",
                  "Ichikawa":"https://www.city.ichikawa.lg.jp/page/7252.html",
                  "Urayasu":"https://www.city.urayasu.lg.jp/kodomo/hoiku/hoikuen/1047820.html",
                  "Nagareyama":"https://www.city.nagareyama.chiba.jp/_res/projects/default_project/_page_/001/001/167/kizyunngaku.pdf",
                  "Tsukuba":"https://www.city.tsukuba.lg.jp/material/files/group/65/R08hoikushogoannai.pdf",
                  "Tsukubamirai":"https://www.city.tsukubamirai.lg.jp/data/doc/1681286151_doc_31_0.pdf",
                  "Saitama-":"https://www.city.saitama.lg.jp/003/001/015/001/p100639_d/fil/tebiki.pdf",
                  "Kawaguchi":"https://www.city.kawaguchi.lg.jp/soshiki/01080/050/4/35870.html",
                  "Soka":"https://www.city.soka.saitama.jp/cont/s1603/020/010/010/02.html",
                  "Yokohama-":"https://www.city.yokohama.lg.jp/kosodate-kyoiku/hoiku-yoji/shisetsu/riyou/riyouryo/riyouryosantei/default20190319.files/0070_20260123.pdf",
                  "Kawasaki-":"https://www.city.kawasaki.jp/450/cmsfiles/contents/0000030/30711/hoikuryoukingakuhyou.pdf"}
        for k, u in FEESRC.items():
            if en == k or (k.endswith("-") and en.startswith(k)): sources.append(u)
        if pref == "Chiba": sources.append("https://www.pref.chiba.lg.jp/jika/boshi/kodomo-iryo/documents/joseinaiyou.pdf")
    if b: sources.append(b["src"])
    sources += ["https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/opendata.html",
                "https://www.j-shis.bosai.go.jp/api-pshm-meshinfo",
                "https://maps.gsi.go.jp/development/ichiran.html#landformclassification",
                "https://www.e-stat.go.jp/gis/statmap-search?type=1&toukeiCode=00200521"]

    areas.append({
        "id": aid,
        "nameEn": en.replace("-", " ") if en != "Tama-shi" else "Tama",
        "nameJa": ja, "pref": pref, "type": typ, "lat": lat, "lng": lng,
        "rank": None, "totalScore": round(total, 1), "shortlisted": False,
        "scores": {"commute": round(cs, 1), "bus": round(bs, 1), "childcare": round(ccs, 1), "space": round(ss, 1),
                   "costco": round(cos, 1), "growth": round(gs, 1), "hazard": round(hs, 1)},
        "hazard": {**{k: v for k, v in hz.items() if k not in ("cells",)}, "parts": hparts},
        "commute": {"station": st, "destination": dest, "minToTokyo": mins, "transfers": xf, "effectiveMin": eff,
                    "passMonthly": pss, "crowding": (f"{crowd}%" if crowd else None), "crowdingLine": crowdtxt},
        "bus": ({k: b[k] for k in ["available","route","morningCount","eveningCount","rideMin","fare","passMonthly"]} if b else None),
        "childcare": {"daycare0to2Monthly": fee1, "daycare0to2MonthlyImputed": (fee_for_score if fee1 is None else None),
                      "waitlist2025": w25, "waitlist2026": w26,
                      "gakudoWaitlist": (gak if isinstance(gak, int) else None),
                      "gakudoWaitlistNote": ("<50 (2025-05, not on CFA ≥50 list)" if gak == "<50" else ("2026-05 preliminary" if pref == "Tokyo" else "2025-05-01")),
                      "medicalAge": medAge, "medicalCopay": copay, "lunchFree": LUNCH_TXT[lunch],
                      "cashExtras": cash_txt, "annualBenefitYen": annual, "feeNote": fee_note},
        "housing": {"median90to105": int(med_all * 10000) if med_all else None, "n90to105": n_all,
                    "median90to110new": int(mm * 10000) if mm else None, "nNew": mn,
                    "share90plus": round(s["share"], 1), "count90under80M": rs["u80"], "shareAffordableLarge": round(aff_share, 1), "count90under80MBuilt2000": rs["u80_modern"],
                    "priceUsedForScore": int(P * 10000), "priceBasis": pbasis,
                    "landPrice": int(round(float(s["land_m2"].replace(",", "")) * 10000)), "landChange5y": round(land5, 1),
                    "landYoY2026": float(s["land_yoy"]), "usedListingsTotal": s["total"]},
        "costco": {"nearest": cn, "km": ckm, "driveMin": cmin},
        "demographics": {"pop2025": pop, "change2020to2025": chg, "ipss2050": ipss, "childShare": child},
        "highlights": hl, "dataFlags": flags, "sources": sources,
    })

areas.sort(key=lambda a: -a["totalScore"])
SHORT = 28
SPACE_GATE = 10
k = 0
for i, a in enumerate(areas):
    a["rank"] = i + 1
    ok = a["scores"]["space"] >= SPACE_GATE and k < SHORT
    a["shortlisted"] = ok
    if ok: k += 1

RUBRIC = """Total = Σ weight × sub-score / 100, each sub-score 0–100. Weights: space 25, commute 25, childcare 20, hazard 10, growth 10, bus 5, costco 5 (users can re-weight on the map).
COMMUTE: effective minutes E = station-to-station minutes (best of Tokyo Stn / Otemachi, Yahoo!乗換案内 arrive 08:45 on 2026-10-14) + 5 per transfer. Base = 100×(80−E)/65 clamped 0–100 (E≤15 → 100, E≥80 → 0). Crowding adj. (MLIT FY2025 peak of main line): ≥158% −5; 150–157% −2; ≤125% +5; unmeasured 0. Pass adj.: 1-month pass >¥30k −5, >¥45k −10.
BUS (bonus): weekday buses arriving Tokyo Stn ≤~9:30 (A) and leaving 17:30–21:30 (P): 50×min(A,9)/9 + 50×min(P,9)/9; ×0.6 if scheduled ride > rail effective minutes + 15. No route found = 0 (evidence of absence from operator lists; re-swept 2026-10-12 against the Jorudan per-prefecture route index after the user reported the missed 幕張 line). Tsukuba counts unknown → imputed A=P=5 (flagged). Aoba (東名江田) timetable unknown → 0 (flagged).
CHILDCARE (100): fee 35×(1 − 1st-child 0–2 認可 monthly fee/¥65,000) for a ¥10M dual-income household (所得割 ≈¥285k); unknown fee → prefecture median of confirmed paying cities (Chiba ¥54,900, Saitama ¥60,000, Ibaraki ¥50,500), flagged. Tokyo cash 10: 018サポート + 赤ちゃんファースト = 8, +2 verified ward cash ≥¥100k (+1 if conflicting). Waitlist 30 (2026-04 待機児童; 2025 if 2026 missing): 0→30, 1–9→24, 10–29→18, 30–59→12, 60–99→6, ≥100→0. 学童 waitlist 15: 0→15, 1–49 or '<50'→10, 50–149→5, ≥150→0. Medical 5: to 18 & ¥0→5, ¥200→4, ¥300→3.5, to 15/¥500→2.5, ¥600/day→2, unknown→3.5 (flagged). Lunch 5: all free→5, JH free→5, partial→3, JH 3rd child only→2, paid→1, unknown→2 (flagged).
SPACE (100): 0.4×Price + 0.3×Count + 0.3×AffordableShare. Price = 100 × (ln ¥150M − ln P)/(ln ¥150M − ln ¥40M), clamped (P≤¥40M → 100, ≥¥150M → 0); P = geometric mean of SUUMO all-age 90–105 m² median and built≥2000 90–110 m² median (each n≥3); if one sample has n<3 it is replaced by the 70–80 m² ¥/m² × 95 estimate; if both n<3, the estimate alone (flagged). Count = 100 × min(1, de-duplicated ≥90 m² listings under ¥80M / 40). AffordableShare = 100 × min(1, (≥90 m² listings under ¥80M ÷ all used-condo listings) / 15%). All asking prices, SUUMO crawl 2026-10-12; ¥80M is the writer's affordability line for a ~¥10M household.
GROWTH (100): population change 2020→25 (census) −4%→0 … +8%→35; IPSS 2050 vs 2020 −15%→0 … +15%→30; residential land price 5-yr change 5%→0 … 45%→20; 0–14 share 2020 9%→0 … 15%→10; pipeline adjustment −3…+5 (confirmed near-term projects +, stalled flagships −). Clamped 0–100.
HAZARD (100, higher = safer; all shares = % of residents, 2020 census 500 m mesh, 4×4 sample points per cell, data/area_hazard.json from area_hazard.py): WATER 40 × (1 − (0.25·shallow<0.5 m + 0.6·0.5–3 m + 1.0·≥3 m)/100) using the deepest of flood (洪水 想定最大規模), storm surge (高潮 想定最大規模) and tsunami (津波 想定最大規模) — all ハザードマップポータル open data; GROUND 25 × (1 − (liquefaction high + 0.4·mid + 0.4·upland fill)/100) from 国土地理院 地形分類 (landform-based tendency, not a site survey; fill over hills/plateaus = collapse risk per GSI, counted as upland fill, not liquefaction; prefectural 液状化 maps are not open data); LANDSLIDE 10 × (1 − min(1, (土砂災害警戒区域 + 特別警戒区域 share)/10%)); EARTHQUAKE 25 × linear from J-SHIS 2024 30-yr P(震度6弱+) 40% → 25 … 85% → 0 (population-weighted at the 5 most-populated cells). Max-scenario maps describe rare (≈1/1000-yr) events; condo upper floors are not flooded but building services and access are.
COSTCO: estimated drive minutes (midpoint of range) to nearest Kanto warehouse: ≤15 → 100, ≥75 → 0, linear.
SHORTLIST: top 28 by total among areas whose space sub-score is >= 10; higher-ranked areas below the space gate (central wards where 90–100 m² asks ¥120M–¥430M) stay ranked but are not shortlisted.
MISSING DATA: never silently zero. Each imputation is listed in the area's dataFlags. Evidence-based absences (no bus route found, zero ≥90 m² listings) score 0 and are labelled as such.
annualBenefitYen = Tokyo-only cash (018 × 2 children = ¥120,000) minus 12 × (1st-child + 2nd-child 0–2 認可 monthly fees) for a year in which both children are aged 0–2 in 認可; null where the fee is unknown. Prices in yen; landPrice = 2026 公示地価 residential average ¥/m²."""

out = {"generated": "2026-10-12", "hazardGenerated": HAZ_GENERATED, "weights": WEIGHTS, "rubric": RUBRIC,
       "referenceFamily": "Dual income ~¥10M; children aged 0–2 (one in 認可, one newborn); target condo 90–100 m²; commute to Tokyo Station / Otemachi",
       "shortlistSize": SHORT, "spaceGate": SPACE_GATE, "shortlistRule": "Top 28 by totalScore among areas with space sub-score >= 10 (i.e. some realistically buyable 90 m2+ stock); all 77 areas keep their overall rank.", "areas": areas}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

# validate
chk = json.load(open(OUT, encoding="utf-8"))
assert chk["generated"] == "2026-10-12" and isinstance(chk["areas"], list) and len(chk["areas"]) == len(A)
need = ["id","nameEn","nameJa","pref","type","lat","lng","rank","totalScore","scores","commute","bus","childcare","housing","costco","demographics","hazard","highlights","sources","shortlisted"]
for a in chk["areas"]:
    for k in need: assert k in a, (a["id"], k)
    for k in SUBS: assert 0 <= a["scores"][k] <= 100, (a["id"], k)
ids = [a["id"] for a in chk["areas"]]; assert len(ids) == len(set(ids))
print("OK", len(chk["areas"]), "areas written to", OUT)

# dump a working table for the report
with open(os.path.join(SCRATCH, "ranked.tsv"), "w", encoding="utf-8") as f:
    for a in chk["areas"]:
        sc = a["scores"]; h = a["housing"]; c = a["childcare"]; d = a["demographics"]
        f.write("\t".join(str(v) for v in [a["rank"], a["nameEn"], a["nameJa"], a["totalScore"], sc["commute"], sc["bus"], sc["childcare"], sc["space"], sc["growth"], sc["costco"],
            a["commute"]["station"], a["commute"]["minToTokyo"], a["commute"]["transfers"], a["commute"]["destination"], a["commute"]["passMonthly"], a["commute"]["crowding"],
            c["daycare0to2Monthly"], c["waitlist2026"], c["gakudoWaitlist"] if c["gakudoWaitlist"] is not None else "<50", c["annualBenefitYen"],
            h["median90to105"], h["median90to110new"], h["nNew"], h["share90plus"], h["count90under80M"], h["landPrice"], h["landChange5y"],
            d["change2020to2025"], d["ipss2050"], d["childShare"], a["costco"]["nearest"], a["costco"]["driveMin"], len(a["dataFlags"])]) + "\n")
