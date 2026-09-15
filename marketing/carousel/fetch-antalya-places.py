import json, os, sys, urllib.request, urllib.parse, time
S=os.path.dirname(os.path.abspath(__file__)); OUT=os.path.join(S,'places')
PLACES={
 'phaselis':(36.5250,30.5520,800), 'olympos':(36.4000,30.4740,900), 'cirali':(36.4150,30.4830,1500),
 'kaputas':(36.2244,29.4497,800), 'termessos':(36.9840,30.4640,900), 'side':(36.7655,31.3905,500),
 'aspendos':(36.9389,31.1722,500), 'duden':(36.8515,30.7830,500), 'kaleici':(36.8845,30.7035,500),
 'kekova':(36.1920,29.8620,1500), 'saklikent':(36.4470,29.4060,1500), 'adrasan':(36.3080,30.4740,1500),
 'koprulu':(37.1950,31.1900,2500), 'tahtali':(36.5420,30.4460,1500), 'kursunlu':(36.9315,30.8400,500),
 'perge':(36.9615,30.8540,600), 'konyaalti':(36.8570,30.6400,1500),
}
UA={'User-Agent':'aidan-carousel-recce/1.0 (aidan.torrence@gmail.com)'}
def api(params):
    q=urllib.parse.urlencode(params); req=urllib.request.Request('https://commons.wikimedia.org/w/api.php?'+q, headers=UA)
    return json.load(urllib.request.urlopen(req, timeout=40))
sources={}
for slug,(lat,lon,r) in PLACES.items():
    d=os.path.join(OUT,slug); os.makedirs(d,exist_ok=True)
    try:
        j=api({'action':'query','format':'json','generator':'geosearch','ggscoord':f'{lat}|{lon}','ggsradius':r,'ggsnamespace':6,'ggslimit':40,
               'prop':'imageinfo','iiprop':'url|size|extmetadata','iiurlwidth':1100})
    except Exception as e:
        print(slug,'API ERR',e); continue
    pages=list(j.get('query',{}).get('pages',{}).values())
    keep=[]
    for p in pages:
        ii=(p.get('imageinfo') or [{}])[0]
        w,h=ii.get('width',0),ii.get('height',0)
        if not w or w<1200 or w/h>3.5 or h/w>3.5: continue
        if not urllib.parse.urlparse(ii.get('thumburl','')).path.lower().endswith(('.jpg','.jpeg')): continue
        keep.append((p['title'],ii))
    keep=keep[:14]; sources[slug]=[]
    for i,(t,ii) in enumerate(keep):
        fn=os.path.join(d,f'{i:02d}.jpg')
        try:
            req=urllib.request.Request(ii['thumburl'],headers=UA); open(fn,'wb').write(urllib.request.urlopen(req,timeout=40).read())
        except Exception as e:
            print(slug,i,'DL ERR',e); continue
        em=ii.get('extmetadata',{})
        sources[slug].append({'idx':i,'title':t,'artist':em.get('Artist',{}).get('value','').replace('\n',' ')[:120],'license':em.get('LicenseShortName',{}).get('value',''),'url':ii.get('descriptionurl'),'w':ii['width'],'h':ii['height']})
        time.sleep(0.15)
    print(f'{slug}: {len(pages)} geo hits, {len(sources[slug])} kept')
json.dump(sources,open(os.path.join(OUT,'sources.json'),'w'),indent=1,ensure_ascii=False)
