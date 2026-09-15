from pathlib import Path
import subprocess,json
ROOT=Path(__file__).resolve().parents[2]
OUT=Path('/Users/aidantorrence/Documents/Antalya-IG-campaign')
FONT=ROOT/'marketing/bts-reels/fonts/Inter-Regular.ttf'
FF='ffmpeg'
from PIL import Image,ImageDraw,ImageFont
def run(args): subprocess.run([FF,'-hide_banner','-loglevel','error','-y',*map(str,args)],check=True)
def segment(src,start,dur,texts,out,still=False):
 args=['-loop','1'] if still else ['-ss',str(start)]
 vf='scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30'
 overlay=Image.new('RGBA',(1080,1920));draw=ImageDraw.Draw(overlay)
 for txt,y,size in texts:
  font=ImageFont.truetype(str(FONT),size);box=draw.textbbox((80,y),txt,font=font)
  draw.rectangle((box[0]-18,box[1]-18,box[2]+18,box[3]+18),fill=(0,0,0,123));draw.text((80,y),txt,font=font,fill='white')
 op=out.with_suffix('.png');overlay.save(op)
 run([*args,'-i',src,'-i',op,'-t',dur,'-filter_complex',f'[0:v]{vf}[v];[v][1:v]overlay=0:0', '-an','-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p',out])

def join(parts,out,audio=None):
 p=out.with_suffix('.concat.txt');p.write_text('\n'.join(f"file '{x}'" for x in parts))
 args=['-f','concat','-safe','0','-i',p]
 if audio:args+=['-i',audio,'-map','0:v','-map','1:a','-c:a','aac','-b:a','192k','-shortest']
 run([*args,'-c:v','copy','-movflags','+faststart',out])
def bts():
 d=OUT/'bts';w=d/'work';w.mkdir(parents=True,exist_ok=True)
 fav=Path('/Volumes/PortableSSD/video/video faves')
 shots=[(d/'source/reference-reel.mp4',0,3.5),(fav/'C4518.MP4',7,3),(fav/'C4612.MP4',8,3),(fav/'C4617.MP4',5,3)]
 parts=[]
 for i,(src,start,dur) in enumerate(shots):
  p=w/f'{i}.mp4';segment(src,start,dur,[('behind the scenes',220,64),('a few past shoots',1510,40)],p);parts.append(p)
 p=w/'4.mp4';segment(ROOT/'public/images/large/aidanto-r4-053-25.jpg',0,4.5,[('now in antalya',220,70),('free photo shoot',1370,66),('dm if interested',1480,50),('@madebyaidan',1580,36)],p,True);parts.append(p)
 join(parts,d/'03-behind-the-scenes.mp4')
def intro():
 d=OUT/'intro';w=d/'work';w.mkdir(parents=True,exist_ok=True)
 im=ROOT/'public/images'
 scenes=[
 ('self/aidan-udaipur-mirror-02.jpg',3.067,[("hey, i'm aidan",220,72),('photographer in antalya',1480,48)]),
 ('large/aidanto-r4-047-22.jpg',2.267,[('a few of my photos',1480,52)]),
 ('large/aidanto-r2-035-16.jpg',5.533,[('swimwear +',220,72),('fashion editorial',310,72),('looking for people to shoot with',1480,44)]),
 ('large/aidanto-r4-053-25.jpg',2.067,[('free photo collab',1480,64)]),
 ('large/manila-gallery-floor-001.jpg',3.6,[('styling, location + date',1420,52),('we plan it together',1510,52)]),
 ('self/aidan-cropped-01.jpg',2.5,[('dm if interested',1390,70),('@madebyaidan',1510,44)])]
 parts=[]
 for i,(src,dur,txt) in enumerate(scenes):
  p=w/f'{i}.mp4';segment(im/src,0,dur,txt,p,True);parts.append(p)
 join(parts,d/'04-personal-intro.mp4',d/'aidan-voice.mp3')
if __name__=='__main__':
 import sys
 (intro if len(sys.argv)>1 and sys.argv[1]=='intro' else bts)()

