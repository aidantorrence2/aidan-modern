import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output-v5')
const IMG_DIR = '/Volumes/PortableSSD/Exports/film scans selected'

fs.mkdirSync(OUT, { recursive: true })

function img(filename) {
  const buf = fs.readFileSync(path.join(IMG_DIR, filename))
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

const LANDSCAPE_FILES = new Set([
  'DSC_0017.jpg','DSC_0280.jpg','DSC_0314-2.jpg','DSC_0466.jpg','DSC_0487.jpg',
  'DSC_0505.jpg','DSC_0507.jpg','DSC_0520.jpg','DSC_0528.jpg','DSC_0539.jpg',
  'DSC_0563.jpg','DSC_0565.jpg','DSC_0621.jpg','DSC_0692.jpg','DSC_0781.jpg',
  'DSC_0861-2.jpg','DSC_0988.jpg'
])

const allFiles = fs.readdirSync(IMG_DIR).filter(f => f.endsWith('.jpg') && !f.startsWith('._'))
const portraitPhotos = allFiles.filter(f => !LANDSCAPE_FILES.has(f)).map(f => img(f))
const landscapePhotos = allFiles.filter(f => LANDSCAPE_FILES.has(f)).map(f => img(f))

console.log(`Loaded ${portraitPhotos.length} portrait, ${landscapePhotos.length} landscape photos`)

const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "'Helvetica Neue', 'Arial', sans-serif"
const DISPLAY = "Impact, 'Arial Black', sans-serif"
const MONO = "Menlo, 'Courier New', monospace"
const FUTURA = "Futura, 'Trebechet MS', sans-serif"
const AVENIR = "'Avenir Next', 'Avenir', 'Helvetica Neue', sans-serif"

const cities = ['Manila', 'Antipolo', 'Subic']
const CTA = 'if interested, message me for details'

function cs(base, city) {
  if (city.length <= 5) return base
  if (city.length <= 6) return Math.round(base * 0.88)
  return Math.round(base * 0.6)
}

function makeSlide(city, p, p2, p3, variant) {
  const C = city.toUpperCase()
  const PH = (color, font = SANS) => `<div style="font-family:${font};font-size:20px;letter-spacing:4px;color:${color};margin-top:2px;">PHILIPPINES</div>`

  switch (variant) {

    // 0: AIRPORT DEPARTURE BOARD — black board with yellow flip-display text, photos below
    case 0: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#1a1a1a;display:flex;flex-direction:column;">
        <div style="background:#111;border:3px solid #333;margin:40px 40px 20px;padding:40px;flex-shrink:0;">
          <div style="font-family:${MONO};font-size:16px;color:#888;letter-spacing:6px;margin-bottom:10px;">DEPARTURES</div>
          <div style="display:flex;gap:20px;align-items:baseline;">
            <div style="font-family:${MONO};font-size:${cs(80,city)}px;color:#ffcc00;letter-spacing:4px;line-height:1;">${C}</div>
          </div>
          ${PH('#ffcc0060', MONO)}
          <div style="width:100%;height:2px;background:#333;margin:20px 0;"></div>
          <div style="display:flex;justify-content:space-between;font-family:${MONO};font-size:22px;color:#ffcc00;">
            <span>GATE: FREE</span><span>STATUS: PHOTO SHOOT</span>
          </div>
          <div style="font-family:${MONO};font-size:14px;color:#666;margin-top:16px;">${CTA}</div>
        </div>
        <div style="flex:1;display:flex;gap:8px;padding:0 40px 40px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 1: VINYL RECORD SLEEVE — left panel as record sleeve, right photos column
    case 1: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#1c1c1c;display:flex;">
        <div style="width:420px;background:linear-gradient(180deg,#2c1810,#1a0e08);display:flex;flex-direction:column;justify-content:center;padding:50px 40px;">
          <div style="width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,#111 30%,#333 31%,#333 33%,#111 34%,#222 60%,#111 100%);margin:0 auto 30px;border:3px solid #444;"></div>
          <div style="font-family:${SERIF};font-size:${cs(60,city)}px;font-weight:bold;font-style:italic;color:#e8d5b7;text-align:center;line-height:0.95;">${C}</div>
          ${PH('#e8d5b740', SERIF)}
          <div style="text-align:center;font-family:${SERIF};font-size:26px;color:#c9a84c;margin-top:14px;font-style:italic;">Free Photo Shoot</div>
          <div style="text-align:center;font-family:${SANS};font-size:14px;color:#e8d5b730;margin-top:20px;">${CTA}</div>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;gap:6px;padding:20px;">
          <div style="flex:1;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 2: BLUEPRINT/SCHEMATIC — blue bg with white line-art style, photos in "windows"
    case 2: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#0a3d6b;display:flex;flex-direction:column;">
        <div style="padding:50px;flex-shrink:0;">
          <div style="border:1px solid rgba(255,255,255,0.3);padding:30px;">
            <div style="font-family:${MONO};font-size:14px;color:rgba(255,255,255,0.4);letter-spacing:4px;">PROJECT BRIEF</div>
            <div style="font-family:${MONO};font-size:${cs(70,city)}px;color:#fff;margin-top:10px;line-height:0.95;">${C}</div>
            ${PH('rgba(255,255,255,0.3)', MONO)}
            <div style="font-family:${MONO};font-size:28px;color:#7ec8e3;margin-top:14px;">SPEC: FREE PHOTO SHOOT</div>
            <div style="font-family:${MONO};font-size:14px;color:rgba(255,255,255,0.25);margin-top:12px;">${CTA}</div>
          </div>
        </div>
        <div style="flex:1;display:flex;gap:2px;padding:0 50px 50px;overflow:hidden;">
          <div style="flex:1;border:1px dashed rgba(255,255,255,0.3);padding:4px;overflow:hidden;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="flex:1;border:1px dashed rgba(255,255,255,0.3);padding:4px;overflow:hidden;">
            <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="flex:1;border:1px dashed rgba(255,255,255,0.3);padding:4px;overflow:hidden;">
            <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
      </div>`

    // 3: TAROT CARD — ornate gold border, centered photo, mystical text
    case 3: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#0f0a1a;display:flex;justify-content:center;align-items:center;">
        <div style="width:940px;height:1780px;border:3px solid #c9a84c;border-radius:20px;background:#0f0a1a;display:flex;flex-direction:column;align-items:center;padding:50px 40px;">
          <div style="font-family:${SERIF};font-size:18px;letter-spacing:8px;color:#c9a84c80;">THE JOURNEY</div>
          <div style="font-family:${SERIF};font-size:${cs(80,city)}px;font-weight:bold;font-style:italic;color:#c9a84c;margin-top:10px;line-height:0.9;">${C}</div>
          ${PH('#c9a84c60', SERIF)}
          <div style="width:100%;flex:1;margin:20px 0;display:flex;gap:10px;overflow:hidden;">
            <div style="flex:2;overflow:hidden;border:1px solid #c9a84c40;">
              <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
            <div style="flex:1;display:flex;flex-direction:column;gap:10px;">
              <div style="flex:1;overflow:hidden;border:1px solid #c9a84c40;">
                <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
              </div>
              <div style="flex:1;overflow:hidden;border:1px solid #c9a84c40;">
                <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
              </div>
            </div>
          </div>
          <div style="font-family:${SERIF};font-size:28px;color:#c9a84c;font-style:italic;">Free Photo Shoot</div>
          <div style="font-family:${SANS};font-size:14px;color:#c9a84c40;margin-top:10px;">${CTA}</div>
        </div>
      </div>`

    // 4: MIXTAPE COVER — cassette tape aesthetic, photos as album art grid
    case 4: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#222;display:flex;flex-direction:column;">
        <div style="background:#111;margin:30px;padding:40px;border:2px solid #555;flex-shrink:0;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div style="font-family:${DISPLAY};font-size:16px;color:#ff4444;letter-spacing:6px;">SIDE A</div>
            <div style="font-family:${MONO};font-size:14px;color:#666;">90 MIN</div>
          </div>
          <div style="font-family:${DISPLAY};font-size:${cs(72,city)}px;color:#fff;margin-top:10px;line-height:0.9;">${C}</div>
          ${PH('#ffffff40', DISPLAY)}
          <div style="font-family:${SANS};font-size:30px;color:#ff4444;font-weight:bold;margin-top:10px;letter-spacing:2px;">FREE PHOTO SHOOT</div>
          <div style="display:flex;gap:20px;margin-top:20px;">
            <div style="width:80px;height:80px;border-radius:50%;background:#333;border:3px solid #555;"></div>
            <div style="width:80px;height:80px;border-radius:50%;background:#333;border:3px solid #555;"></div>
          </div>
          <div style="font-family:${SANS};font-size:14px;color:#555;margin-top:14px;">${CTA}</div>
        </div>
        <div style="flex:1;display:flex;gap:6px;padding:0 30px 30px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 5: RANSOM NOTE — cutout letter style on corkboard, photos pinned
    case 5: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#c4a86e;display:flex;flex-direction:column;">
        <div style="padding:60px 50px 30px;flex-shrink:0;">
          <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:baseline;">
            ${C.split('').map((ch,i) => `<div style="font-family:${[SERIF,DISPLAY,SANS,MONO][i%4]};font-size:${cs(70,city)}px;color:${['#fff','#000','#e63946','#1d3557'][i%4]};background:${['#e63946','#f1c40f','#fff','#f1c40f'][i%4]};padding:2px 10px;transform:rotate(${(i%3-1)*5}deg);display:inline-block;">${ch}</div>`).join('')}
          </div>
          ${PH('#333', MONO)}
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:16px;">
            ${['FREE','PHOTO','SHOOT'].map((w,i) => `<div style="font-family:${DISPLAY};font-size:32px;color:#fff;background:#111;padding:4px 14px;transform:rotate(${(i-1)*3}deg);">${w}</div>`).join('')}
          </div>
          <div style="font-family:${MONO};font-size:14px;color:#5a4a30;margin-top:16px;">${CTA}</div>
        </div>
        <div style="flex:1;display:flex;gap:12px;padding:0 30px 40px;overflow:hidden;">
          <div style="flex:1;background:#fff;padding:8px;transform:rotate(-3deg);box-shadow:2px 4px 10px rgba(0,0,0,0.3);overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;background:#fff;padding:8px;transform:rotate(2deg);box-shadow:2px 4px 10px rgba(0,0,0,0.3);overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;background:#fff;padding:8px;transform:rotate(-1deg);box-shadow:2px 4px 10px rgba(0,0,0,0.3);overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 6: BOARDING PASS — left stub with text, right with photo grid
    case 6: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#e8e8e8;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:40px;">
        <div style="width:1000px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);flex-shrink:0;">
          <div style="background:#1d3557;padding:20px 40px;display:flex;justify-content:space-between;align-items:center;">
            <div style="font-family:${SANS};font-size:18px;color:#fff;letter-spacing:4px;">BOARDING PASS</div>
            <div style="font-family:${MONO};font-size:14px;color:#ffffff80;">@madebyaidan</div>
          </div>
          <div style="padding:30px 40px;display:flex;justify-content:space-between;">
            <div>
              <div style="font-family:${SANS};font-size:14px;color:#999;letter-spacing:2px;">DESTINATION</div>
              <div style="font-family:${DISPLAY};font-size:${cs(60,city)}px;color:#1d3557;line-height:1;">${C}</div>
              ${PH('#1d355740', SANS)}
            </div>
            <div style="text-align:right;">
              <div style="font-family:${SANS};font-size:14px;color:#999;letter-spacing:2px;">CLASS</div>
              <div style="font-family:${DISPLAY};font-size:36px;color:#e63946;">FREE</div>
              <div style="font-family:${SANS};font-size:20px;color:#1d3557;font-weight:bold;">PHOTO SHOOT</div>
            </div>
          </div>
          <div style="border-top:2px dashed #ddd;margin:0 30px;"></div>
          <div style="padding:20px 40px;">
            <div style="font-family:${SANS};font-size:14px;color:#aaa;">${CTA}</div>
          </div>
        </div>
        <div style="flex:1;width:1000px;display:flex;gap:10px;margin-top:20px;overflow:hidden;">
          <div style="flex:2;overflow:hidden;border-radius:12px;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;display:flex;flex-direction:column;gap:10px;">
            <div style="flex:1;overflow:hidden;border-radius:12px;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
            <div style="flex:1;overflow:hidden;border-radius:12px;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
          </div>
        </div>
      </div>`

    // 7: MUSEUM PLACARD — white wall, small brass placard, large photo as "artwork"
    case 7: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#f5f2ed;display:flex;flex-direction:column;">
        <div style="flex:1;display:flex;gap:16px;padding:40px 40px 0;">
          <div style="flex:1;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.15);">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="flex:1;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.15);">
            <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <div style="padding:30px 60px;flex-shrink:0;">
          <div style="background:#f8f4ee;border:1px solid #d4c8b0;padding:24px 30px;box-shadow:0 2px 8px rgba(0,0,0,0.08);display:inline-block;">
            <div style="font-family:${SERIF};font-size:${cs(40,city)}px;font-style:italic;color:#333;">${C}</div>
            ${PH('#33333350', SERIF)}
            <div style="font-family:${SANS};font-size:18px;color:#666;margin-top:6px;">Free Photo Shoot — mixed media</div>
            <div style="font-family:${SANS};font-size:13px;color:#aaa;margin-top:6px;">${CTA}</div>
          </div>
        </div>
        <div style="height:500px;padding:0 40px 40px;overflow:hidden;">
          <img src="${p3}" style="width:100%;height:100%;object-fit:cover;box-shadow:0 4px 20px rgba(0,0,0,0.15);"/>
        </div>
      </div>`

    // 8: DINER MENU — retro diner checkerboard top, menu-style text, photos below
    case 8: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#fdf6e3;display:flex;flex-direction:column;">
        <div style="background:#c0392b;padding:40px 50px 30px;flex-shrink:0;">
          <div style="font-family:${DISPLAY};font-size:${cs(80,city)}px;color:#fdf6e3;line-height:0.9;">${C}</div>
          ${PH('#fdf6e380', DISPLAY)}
          <div style="font-family:${SERIF};font-size:20px;color:#fdf6e3cc;font-style:italic;margin-top:6px;">est. 2024</div>
        </div>
        <div style="background:repeating-linear-gradient(90deg,#111 0,#111 40px,#fdf6e3 40px,#fdf6e3 80px);height:16px;flex-shrink:0;"></div>
        <div style="padding:30px 50px;flex-shrink:0;">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px dotted #333;padding-bottom:12px;">
            <div style="font-family:${SERIF};font-size:34px;color:#333;font-style:italic;">Today's Special</div>
            <div style="font-family:${DISPLAY};font-size:34px;color:#c0392b;">FREE</div>
          </div>
          <div style="font-family:${SERIF};font-size:26px;color:#333;margin-top:12px;">Photo Shoot</div>
          <div style="font-family:${SANS};font-size:15px;color:#999;margin-top:8px;">${CTA}</div>
        </div>
        <div style="flex:1;display:flex;gap:8px;padding:0 30px 30px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 9: COMIC PANEL — bold outlines, halftone dots bg, speech bubble CTA
    case 9: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#fff700;display:flex;flex-direction:column;">
        <div style="padding:40px 40px 20px;flex-shrink:0;">
          <div style="font-family:${DISPLAY};font-size:${cs(100,city)}px;color:#111;line-height:0.85;-webkit-text-stroke:3px #111;">${C}</div>
          ${PH('#11111160', DISPLAY)}
          <div style="background:#fff;border:4px solid #111;border-radius:30px;padding:14px 28px;display:inline-block;margin-top:10px;position:relative;">
            <div style="font-family:${DISPLAY};font-size:30px;color:#e63946;">FREE PHOTO SHOOT!</div>
          </div>
          <div style="font-family:${SANS};font-size:14px;color:#333;margin-top:12px;">${CTA}</div>
        </div>
        <div style="flex:1;display:flex;flex-wrap:wrap;gap:6px;padding:0 20px 20px;overflow:hidden;">
          <div style="width:calc(60% - 3px);height:calc(50% - 3px);border:4px solid #111;overflow:hidden;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="width:calc(40% - 3px);height:calc(50% - 3px);border:4px solid #111;overflow:hidden;">
            <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="width:100%;height:calc(50% - 3px);border:4px solid #111;overflow:hidden;">
            <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
      </div>`

    // 10: LUGGAGE TAG — tag shape with hole, text on tag, photos below
    case 10: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#2c3e50;display:flex;flex-direction:column;align-items:center;">
        <div style="width:700px;background:#e8d5b7;margin-top:60px;padding:50px;border-radius:8px;flex-shrink:0;position:relative;">
          <div style="width:60px;height:60px;border-radius:50%;background:#2c3e50;position:absolute;top:20px;right:30px;"></div>
          <div style="font-family:${SANS};font-size:14px;color:#999;letter-spacing:4px;">DESTINATION</div>
          <div style="font-family:${DISPLAY};font-size:${cs(70,city)}px;color:#2c3e50;line-height:0.9;margin-top:6px;">${C}</div>
          ${PH('#2c3e5050', DISPLAY)}
          <div style="border-top:2px dashed #c9a84c;margin:20px 0;"></div>
          <div style="font-family:${SANS};font-size:28px;font-weight:bold;color:#e63946;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:14px;color:#999;margin-top:10px;">${CTA}</div>
        </div>
        <div style="flex:1;width:100%;display:flex;gap:10px;padding:30px 40px 40px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;border-radius:8px;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;border-radius:8px;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;border-radius:8px;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 11: PARKING TICKET — yellow ticket with violation style, photos in evidence section
    case 11: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#333;display:flex;flex-direction:column;align-items:center;padding:40px;">
        <div style="width:960px;background:#fff8a1;padding:40px;flex-shrink:0;">
          <div style="font-family:${MONO};font-size:14px;color:#666;letter-spacing:4px;">CITATION NO. 001</div>
          <div style="font-family:${DISPLAY};font-size:${cs(60,city)}px;color:#111;margin-top:8px;line-height:0.9;">${C}</div>
          ${PH('#11111140', DISPLAY)}
          <div style="border-top:2px solid #ccc;margin:16px 0;"></div>
          <div style="font-family:${MONO};font-size:18px;color:#111;">VIOLATION: Not getting a free photo shoot</div>
          <div style="font-family:${MONO};font-size:18px;color:#e63946;margin-top:6px;">FINE: $0.00 (IT'S FREE)</div>
          <div style="font-family:${SANS};font-size:14px;color:#888;margin-top:12px;">${CTA}</div>
        </div>
        <div style="font-family:${MONO};font-size:14px;color:#999;margin:16px 0;letter-spacing:4px;flex-shrink:0;">EVIDENCE:</div>
        <div style="flex:1;width:960px;display:flex;gap:8px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 12: LIBRARY CARD — card catalog style, text fields, photos as "checked out" items
    case 12: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#8b7355;display:flex;flex-direction:column;align-items:center;padding:40px;">
        <div style="width:960px;background:#fdf8f0;padding:40px;border:1px solid #d4c8b0;flex-shrink:0;">
          <div style="font-family:${MONO};font-size:14px;color:#999;letter-spacing:4px;border-bottom:1px solid #ddd;padding-bottom:8px;">LIBRARY CARD</div>
          <div style="margin-top:16px;">
            <div style="font-family:${MONO};font-size:13px;color:#999;">SUBJECT:</div>
            <div style="font-family:${SERIF};font-size:${cs(50,city)}px;font-weight:bold;color:#333;line-height:1;border-bottom:1px solid #ddd;padding-bottom:8px;">${C}</div>
          </div>
          ${PH('#33333340', SERIF)}
          <div style="margin-top:12px;">
            <div style="font-family:${MONO};font-size:13px;color:#999;">CATEGORY:</div>
            <div style="font-family:${SERIF};font-size:24px;color:#333;">Free Photo Shoot</div>
          </div>
          <div style="font-family:${SANS};font-size:13px;color:#aaa;margin-top:14px;">${CTA}</div>
        </div>
        <div style="flex:1;width:960px;display:flex;gap:10px;margin-top:20px;overflow:hidden;">
          <div style="flex:2;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;display:flex;flex-direction:column;gap:10px;">
            <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
            <div style="flex:1;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
          </div>
        </div>
      </div>`

    // 13: CONCERT WRISTBAND — neon wristband across top, dark bg, photos below
    case 13: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#0a0a0a;display:flex;flex-direction:column;">
        <div style="background:linear-gradient(90deg,#ff006e,#ff4d94,#ff006e);padding:30px 50px;flex-shrink:0;">
          <div style="font-family:${DISPLAY};font-size:${cs(60,city)}px;color:#fff;line-height:1;text-shadow:0 2px 10px rgba(0,0,0,0.3);">${C}</div>
          ${PH('#ffffff80', DISPLAY)}
        </div>
        <div style="background:#1a1a1a;padding:24px 50px;border-bottom:3px solid #ff006e;flex-shrink:0;">
          <div style="font-family:${SANS};font-size:34px;font-weight:bold;color:#ff006e;letter-spacing:4px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:16px;color:#ffffff30;margin-top:8px;">${CTA}</div>
        </div>
        <div style="flex:1;display:flex;gap:6px;padding:20px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 14: SCRATCH-OFF LOTTERY — gold scratch texture top, "revealed" photos below
    case 14: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#2d2d2d;display:flex;flex-direction:column;">
        <div style="background:linear-gradient(135deg,#c9a84c,#e8d5b7,#c9a84c,#b8942e);padding:60px 50px;flex-shrink:0;">
          <div style="font-family:${DISPLAY};font-size:18px;color:#333;letter-spacing:8px;">SCRATCH & WIN</div>
          <div style="font-family:${DISPLAY};font-size:${cs(80,city)}px;color:#333;line-height:0.9;margin-top:8px;">${C}</div>
          ${PH('#33333360', DISPLAY)}
          <div style="font-family:${SERIF};font-size:30px;color:#1a5c1a;font-weight:bold;margin-top:14px;">YOU WON: FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:14px;color:#666;margin-top:10px;">${CTA}</div>
        </div>
        <div style="padding:10px 30px;font-family:${MONO};font-size:14px;color:#666;flex-shrink:0;">YOUR PRIZE:</div>
        <div style="flex:1;display:flex;gap:8px;padding:0 30px 30px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;border-radius:6px;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;border-radius:6px;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;border-radius:6px;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 15: POSTAGE STAMP COLLECTION — stamps arranged on dark album page
    case 15: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#1a2634;display:flex;flex-direction:column;align-items:center;padding:50px;">
        <div style="text-align:center;flex-shrink:0;">
          <div style="font-family:${SERIF};font-size:${cs(70,city)}px;font-weight:bold;font-style:italic;color:#e8d5b7;line-height:0.9;">${C}</div>
          ${PH('#e8d5b750', SERIF)}
          <div style="font-family:${SERIF};font-size:26px;color:#e8d5b7;font-style:italic;margin-top:10px;">Free Photo Shoot Collection</div>
          <div style="font-family:${SANS};font-size:14px;color:#e8d5b730;margin-top:8px;">${CTA}</div>
        </div>
        <div style="flex:1;width:100%;display:flex;flex-direction:column;gap:20px;margin-top:30px;overflow:hidden;">
          <div style="flex:2;display:flex;gap:20px;">
            <div style="flex:1;border:6px solid #e8d5b7;padding:6px;overflow:hidden;">
              <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
            <div style="flex:1;border:6px solid #e8d5b7;padding:6px;overflow:hidden;">
              <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
          </div>
          <div style="flex:1;border:6px solid #e8d5b7;padding:6px;overflow:hidden;">
            <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
      </div>`

    // 16: MOOD BOARD — scattered photos on cork with washi tape, text as sticky notes
    case 16: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#d4a76a;display:flex;flex-direction:column;">
        <div style="padding:50px 50px 10px;flex-shrink:0;">
          <div style="background:#fff9c4;padding:20px 30px;transform:rotate(-2deg);box-shadow:2px 3px 8px rgba(0,0,0,0.15);display:inline-block;">
            <div style="font-family:${SANS};font-size:${cs(52,city)}px;font-weight:bold;color:#333;">${C}</div>
            ${PH('#33333340', SANS)}
          </div>
        </div>
        <div style="padding:10px 50px;flex-shrink:0;">
          <div style="background:#ffcdd2;padding:14px 24px;transform:rotate(1deg);box-shadow:2px 3px 8px rgba(0,0,0,0.15);display:inline-block;">
            <div style="font-family:${SANS};font-size:28px;font-weight:bold;color:#c62828;">FREE PHOTO SHOOT</div>
          </div>
        </div>
        <div style="padding:6px 50px;flex-shrink:0;">
          <div style="font-family:${SANS};font-size:14px;color:#7a5c3a;">${CTA}</div>
        </div>
        <div style="flex:1;display:flex;gap:16px;padding:20px 30px 40px;overflow:hidden;">
          <div style="flex:1;transform:rotate(-4deg);background:#fff;padding:10px;box-shadow:3px 5px 15px rgba(0,0,0,0.2);overflow:hidden;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="flex:1;transform:rotate(3deg);background:#fff;padding:10px;box-shadow:3px 5px 15px rgba(0,0,0,0.2);overflow:hidden;margin-top:40px;">
            <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="flex:1;transform:rotate(-1deg);background:#fff;padding:10px;box-shadow:3px 5px 15px rgba(0,0,0,0.2);overflow:hidden;margin-top:-20px;">
            <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
      </div>`

    // 17: FLIP PHONE SCREEN — Nokia-style outer shell, photos on "screen"
    case 17: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#111;display:flex;flex-direction:column;align-items:center;padding:40px;">
        <div style="width:800px;background:#333;border-radius:30px;padding:20px;flex-shrink:0;">
          <div style="background:#7a9e3e;padding:30px;border-radius:10px;">
            <div style="font-family:${MONO};font-size:${cs(50,city)}px;color:#2d3e0f;line-height:1;">${C}</div>
            ${PH('#2d3e0f60', MONO)}
            <div style="font-family:${MONO};font-size:22px;color:#2d3e0f;margin-top:8px;">FREE PHOTO SHOOT</div>
            <div style="font-family:${MONO};font-size:12px;color:#2d3e0f80;margin-top:6px;">${CTA}</div>
          </div>
        </div>
        <div style="flex:1;width:100%;display:flex;gap:10px;padding:30px 20px 20px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;border-radius:8px;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;border-radius:8px;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;border-radius:8px;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 18: OLD TV BROADCAST — CRT scanline effect, test pattern colors, photos as channels
    case 18: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#111;display:flex;flex-direction:column;">
        <div style="display:flex;height:16px;flex-shrink:0;">
          ${['#fff','#ff0','#0ff','#0f0','#f0f','#f00','#00f'].map(c => `<div style="flex:1;background:${c};"></div>`).join('')}
        </div>
        <div style="padding:50px;flex-shrink:0;">
          <div style="font-family:${MONO};font-size:14px;color:#888;letter-spacing:4px;">CHANNEL ${city.length}</div>
          <div style="font-family:${DISPLAY};font-size:${cs(90,city)}px;color:#fff;line-height:0.9;margin-top:6px;">${C}</div>
          ${PH('#ffffff40', DISPLAY)}
          <div style="font-family:${SANS};font-size:32px;color:#0f0;font-weight:bold;margin-top:12px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:14px;color:#555;margin-top:10px;">${CTA}</div>
        </div>
        <div style="flex:1;display:flex;gap:4px;padding:0 20px 20px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;border:2px solid #333;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;border:2px solid #333;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;border:2px solid #333;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
        <div style="display:flex;height:16px;flex-shrink:0;">
          ${['#fff','#ff0','#0ff','#0f0','#f0f','#f00','#00f'].map(c => `<div style="flex:1;background:${c};"></div>`).join('')}
        </div>
      </div>`

    // 19: VIDEO GAME HUD — health bar, score, minimap-style photos
    case 19: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#0a0a12;display:flex;flex-direction:column;">
        <div style="padding:40px 40px 20px;flex-shrink:0;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div style="font-family:${MONO};font-size:14px;color:#0f0;letter-spacing:2px;">LVL 99</div>
            <div style="font-family:${MONO};font-size:14px;color:#ff4444;">HP ████████████</div>
          </div>
          <div style="font-family:${DISPLAY};font-size:${cs(80,city)}px;color:#0f0;line-height:0.9;margin-top:10px;text-shadow:0 0 20px rgba(0,255,0,0.3);">${C}</div>
          ${PH('#0f060', DISPLAY)}
          <div style="background:#0f03;border:1px solid #0f06;padding:10px 20px;margin-top:14px;display:inline-block;">
            <div style="font-family:${MONO};font-size:24px;color:#0f0;">QUEST: FREE PHOTO SHOOT</div>
          </div>
          <div style="font-family:${MONO};font-size:13px;color:#0f040;margin-top:10px;">${CTA}</div>
        </div>
        <div style="flex:1;display:flex;gap:4px;padding:0 20px 20px;overflow:hidden;">
          <div style="flex:1;border:2px solid #0f03;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;border:2px solid #0f03;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;border:2px solid #0f03;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 20: SKATEBOARD DECK — vertical deck shape, bold graphic text, photo as deck art
    case 20: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#ff6600;display:flex;flex-direction:column;">
        <div style="padding:60px 50px 20px;flex-shrink:0;">
          <div style="font-family:${DISPLAY};font-size:${cs(110,city)}px;color:#fff;line-height:0.8;-webkit-text-stroke:2px #000;">${C}</div>
          ${PH('#ffffff60', DISPLAY)}
          <div style="font-family:${DISPLAY};font-size:44px;color:#111;margin-top:10px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:16px;color:#ffffff60;margin-top:8px;">${CTA}</div>
        </div>
        <div style="flex:1;padding:0 40px 40px;display:flex;gap:10px;overflow:hidden;">
          <div style="flex:2;border-radius:20px;overflow:hidden;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="flex:1;display:flex;flex-direction:column;gap:10px;">
            <div style="flex:1;border-radius:20px;overflow:hidden;">
              <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
            <div style="flex:1;border-radius:20px;overflow:hidden;">
              <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
          </div>
        </div>
      </div>`

    // 21: MATCHBOOK — matchbook shape with striking strip, photos and text
    case 21: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#8b0000;display:flex;flex-direction:column;">
        <div style="padding:60px 60px 30px;flex-shrink:0;">
          <div style="font-family:${SERIF};font-size:${cs(80,city)}px;font-weight:bold;font-style:italic;color:#f5e6c8;line-height:0.9;">${C}</div>
          ${PH('#f5e6c850', SERIF)}
          <div style="font-family:${SERIF};font-size:30px;color:#f5e6c8;font-style:italic;margin-top:12px;">Free Photo Shoot</div>
          <div style="font-family:${SANS};font-size:14px;color:#f5e6c830;margin-top:10px;">${CTA}</div>
        </div>
        <div style="flex:1;display:flex;gap:8px;padding:0 40px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
        <div style="height:60px;background:repeating-linear-gradient(90deg,#5a0000 0,#5a0000 10px,#8b0000 10px,#8b0000 20px);margin:20px 40px 40px;border-radius:4px;flex-shrink:0;"></div>
      </div>`

    // 22: BEER LABEL — oval label shape, brewery style, photo in center
    case 22: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#1a1206;display:flex;flex-direction:column;align-items:center;">
        <div style="width:900px;margin-top:50px;border:4px solid #c9a84c;border-radius:300px/150px;padding:50px 60px;text-align:center;flex-shrink:0;background:#1a120680;">
          <div style="font-family:${SERIF};font-size:16px;color:#c9a84c80;letter-spacing:8px;">PREMIUM QUALITY</div>
          <div style="font-family:${SERIF};font-size:${cs(70,city)}px;font-weight:bold;font-style:italic;color:#c9a84c;line-height:0.9;margin-top:6px;">${C}</div>
          ${PH('#c9a84c50', SERIF)}
          <div style="font-family:${SERIF};font-size:26px;color:#e8d5b7;font-style:italic;margin-top:10px;">Free Photo Shoot</div>
          <div style="width:120px;height:2px;background:#c9a84c;margin:12px auto;"></div>
          <div style="font-family:${SANS};font-size:13px;color:#c9a84c40;">${CTA}</div>
        </div>
        <div style="flex:1;width:100%;display:flex;gap:10px;padding:30px 40px 40px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:2;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 23: CANDY WRAPPER — twisted ends, bright pink/teal, photos as wrapper art
    case 23: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:linear-gradient(135deg,#ff69b4,#ff1493);display:flex;flex-direction:column;">
        <div style="padding:50px 50px 20px;flex-shrink:0;">
          <div style="font-family:${DISPLAY};font-size:${cs(90,city)}px;color:#fff;line-height:0.85;text-shadow:3px 3px 0 #c71585;">${C}</div>
          ${PH('#ffffff60', DISPLAY)}
          <div style="font-family:${SANS};font-size:36px;font-weight:bold;color:#fff700;margin-top:8px;text-shadow:2px 2px 0 #c71585;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:15px;color:#ffffffaa;margin-top:8px;">${CTA}</div>
        </div>
        <div style="flex:1;display:flex;gap:10px;padding:10px 30px 30px;overflow:hidden;">
          <div style="flex:1;border-radius:16px;overflow:hidden;border:4px solid #fff;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;border-radius:16px;overflow:hidden;border:4px solid #fff;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;border-radius:16px;overflow:hidden;border:4px solid #fff;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 24: PRESCRIPTION BOTTLE — medical label style, photos as "contents"
    case 24: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#f0f0f0;display:flex;flex-direction:column;">
        <div style="margin:40px;background:#fff;border:2px solid #ddd;padding:40px;flex-shrink:0;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div>
              <div style="font-family:${SANS};font-size:14px;color:#e63946;font-weight:bold;letter-spacing:2px;">Rx ONLY</div>
              <div style="font-family:${SANS};font-size:${cs(56,city)}px;font-weight:bold;color:#111;line-height:1;margin-top:6px;">${C}</div>
              ${PH('#11111140', SANS)}
            </div>
            <div style="font-family:${MONO};font-size:12px;color:#999;text-align:right;">NDC 0000-0001<br/>QTY: UNLIMITED</div>
          </div>
          <div style="border-top:2px solid #e63946;margin:16px 0;"></div>
          <div style="font-family:${SANS};font-size:22px;color:#111;font-weight:bold;">DOSAGE: One free photo shoot</div>
          <div style="font-family:${SANS};font-size:16px;color:#666;margin-top:8px;">DIRECTIONS: ${CTA}</div>
          <div style="font-family:${MONO};font-size:12px;color:#bbb;margin-top:12px;">REFILLS: UNLIMITED</div>
        </div>
        <div style="flex:1;display:flex;gap:8px;padding:0 40px 40px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;border-radius:8px;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;border-radius:8px;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;border-radius:8px;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 25: ID BADGE — lanyard clip at top, badge card with photo and details
    case 25: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#2c3e50;display:flex;flex-direction:column;align-items:center;">
        <div style="width:6px;height:80px;background:#888;flex-shrink:0;"></div>
        <div style="width:100px;height:30px;background:#888;border-radius:6px;flex-shrink:0;"></div>
        <div style="width:800px;background:#fff;margin-top:20px;padding:40px;border-radius:12px;flex-shrink:0;">
          <div style="background:#1d3557;padding:14px 20px;border-radius:6px;">
            <div style="font-family:${SANS};font-size:16px;color:#fff;letter-spacing:4px;">PHOTO SHOOT PASS</div>
          </div>
          <div style="text-align:center;margin-top:20px;">
            <div style="font-family:${DISPLAY};font-size:${cs(56,city)}px;color:#1d3557;">${C}</div>
            ${PH('#1d355740', SANS)}
            <div style="font-family:${SANS};font-size:24px;color:#e63946;font-weight:bold;margin-top:6px;">ACCESS: FREE</div>
          </div>
          <div style="font-family:${SANS};font-size:13px;color:#aaa;margin-top:14px;text-align:center;">${CTA}</div>
        </div>
        <div style="flex:1;width:100%;display:flex;gap:10px;padding:30px 40px 40px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;border-radius:10px;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;border-radius:10px;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;border-radius:10px;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 26: REPORT CARD — school report card grid, grades, photos in sidebar
    case 26: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#f5f0e8;display:flex;">
        <div style="width:480px;padding:50px 40px;display:flex;flex-direction:column;">
          <div style="font-family:${SERIF};font-size:18px;color:#999;letter-spacing:4px;flex-shrink:0;">REPORT CARD</div>
          <div style="font-family:${SERIF};font-size:${cs(60,city)}px;font-weight:bold;color:#333;line-height:0.95;margin-top:10px;flex-shrink:0;">${C}</div>
          ${PH('#33333340', SERIF)}
          <div style="margin-top:20px;flex-shrink:0;">
            ${[['VIBES','A+'],['PHOTOGRAPHY','A+'],['COST','FREE']].map(([sub,gr]) => `
              <div style="display:flex;justify-content:space-between;border-bottom:1px solid #ddd;padding:10px 0;">
                <div style="font-family:${SERIF};font-size:20px;color:#555;">${sub}</div>
                <div style="font-family:${DISPLAY};font-size:22px;color:#e63946;">${gr}</div>
              </div>
            `).join('')}
          </div>
          <div style="font-family:${SANS};font-size:13px;color:#aaa;margin-top:16px;flex-shrink:0;">${CTA}</div>
          <div style="flex:1;"></div>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;gap:6px;padding:20px 20px 20px 0;overflow:hidden;">
          <div style="flex:1;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 27: WEATHER FORECAST — weather app style, photos as "conditions"
    case 27: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:linear-gradient(180deg,#1a73e8,#4fc3f7);display:flex;flex-direction:column;">
        <div style="padding:60px 50px 30px;flex-shrink:0;">
          <div style="font-family:${SANS};font-size:18px;color:#ffffffaa;letter-spacing:4px;">FORECAST</div>
          <div style="font-family:${SANS};font-size:${cs(80,city)}px;font-weight:200;color:#fff;line-height:0.95;">${C}</div>
          ${PH('#ffffff60', SANS)}
          <div style="display:flex;align-items:flex-end;gap:16px;margin-top:16px;">
            <div style="font-family:${SANS};font-size:100px;font-weight:100;color:#fff;line-height:0.8;">0°</div>
            <div>
              <div style="font-family:${SANS};font-size:26px;color:#fff;">COST</div>
              <div style="font-family:${SANS};font-size:20px;color:#ffffffaa;">Photo Shoot</div>
            </div>
          </div>
          <div style="font-family:${SANS};font-size:14px;color:#ffffff50;margin-top:14px;">${CTA}</div>
        </div>
        <div style="flex:1;display:flex;gap:6px;padding:0 20px 20px;overflow:hidden;">
          <div style="flex:1;border-radius:12px;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;border-radius:12px;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;border-radius:12px;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 28: SPORTS SCOREBOARD — LED scoreboard style, photos below
    case 28: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#0a0a0a;display:flex;flex-direction:column;">
        <div style="background:#1a1a1a;border:3px solid #333;margin:30px;padding:40px;flex-shrink:0;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div style="font-family:${MONO};font-size:14px;color:#ff0;letter-spacing:4px;">SCOREBOARD</div>
            <div style="font-family:${MONO};font-size:14px;color:#f00;">LIVE</div>
          </div>
          <div style="font-family:${DISPLAY};font-size:${cs(80,city)}px;color:#ff0;line-height:0.9;margin-top:10px;">${C}</div>
          ${PH('#ff000060', DISPLAY)}
          <div style="display:flex;gap:30px;margin-top:20px;">
            <div style="text-align:center;">
              <div style="font-family:${MONO};font-size:14px;color:#888;">COST</div>
              <div style="font-family:${DISPLAY};font-size:60px;color:#0f0;">0</div>
            </div>
            <div style="text-align:center;">
              <div style="font-family:${MONO};font-size:14px;color:#888;">PHOTOS</div>
              <div style="font-family:${DISPLAY};font-size:60px;color:#ff0;">99+</div>
            </div>
          </div>
          <div style="font-family:${MONO};font-size:14px;color:#555;margin-top:12px;">${CTA}</div>
        </div>
        <div style="flex:1;display:flex;gap:6px;padding:0 30px 30px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 29: THEATER MARQUEE — bulb border, marquee text, photos below
    case 29: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#1a0000;display:flex;flex-direction:column;">
        <div style="background:#2a0a0a;border:8px solid #c9a84c;margin:30px 30px 20px;padding:40px;text-align:center;flex-shrink:0;">
          <div style="font-family:${SERIF};font-size:16px;color:#c9a84c;letter-spacing:8px;">NOW SHOWING</div>
          <div style="font-family:${SERIF};font-size:${cs(80,city)}px;font-weight:bold;font-style:italic;color:#c9a84c;line-height:0.9;margin-top:10px;">${C}</div>
          ${PH('#c9a84c60', SERIF)}
          <div style="font-family:${SERIF};font-size:30px;color:#fff;font-style:italic;margin-top:14px;">Free Photo Shoot</div>
          <div style="width:200px;height:2px;background:#c9a84c;margin:16px auto;"></div>
          <div style="font-family:${SANS};font-size:14px;color:#c9a84c40;">${CTA}</div>
        </div>
        <div style="flex:1;display:flex;gap:8px;padding:0 30px 30px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 30: MOVIE CREDITS — dark bg, scrolling credits style text, photos in top half
    case 30: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#000;display:flex;flex-direction:column;">
        <div style="flex:1;display:flex;gap:6px;padding:20px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
        <div style="padding:40px 60px 60px;text-align:center;flex-shrink:0;">
          <div style="font-family:${SERIF};font-size:18px;color:#888;letter-spacing:6px;">A FILM BY</div>
          <div style="font-family:${SERIF};font-size:${cs(80,city)}px;font-weight:bold;font-style:italic;color:#fff;line-height:0.9;margin-top:10px;">${C}</div>
          ${PH('#ffffff40', SERIF)}
          <div style="font-family:${SERIF};font-size:28px;color:#c9a84c;font-style:italic;margin-top:16px;">Free Photo Shoot</div>
          <div style="font-family:${SANS};font-size:14px;color:#555;margin-top:14px;">${CTA}</div>
        </div>
      </div>`

    // 31: RECIPE CARD — lined card, ingredient list, photos as "plating"
    case 31: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#f5f0e8;display:flex;flex-direction:column;">
        <div style="background:repeating-linear-gradient(180deg,transparent 0,transparent 38px,#ccc 38px,#ccc 39px);padding:50px 60px;flex-shrink:0;">
          <div style="font-family:${SERIF};font-size:18px;color:#c0392b;letter-spacing:4px;">RECIPE</div>
          <div style="font-family:${SERIF};font-size:${cs(60,city)}px;font-weight:bold;font-style:italic;color:#333;line-height:1;margin-top:6px;">${C}</div>
          ${PH('#33333340', SERIF)}
          <div style="margin-top:16px;">
            <div style="font-family:${SERIF};font-size:18px;color:#c0392b;letter-spacing:2px;margin-bottom:8px;">INGREDIENTS:</div>
            ${['1x Camera','1x Great location','1x You','COST: Free'].map(item => `
              <div style="font-family:${SERIF};font-size:20px;color:#444;padding:4px 0;">- ${item}</div>
            `).join('')}
          </div>
          <div style="font-family:${SANS};font-size:14px;color:#aaa;margin-top:16px;">${CTA}</div>
        </div>
        <div style="flex:1;display:flex;gap:10px;padding:10px 40px 40px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 32: SHOPPING LIST — torn paper, checkbox items, photos alongside
    case 32: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#fff;display:flex;">
        <div style="width:440px;background:#fff9c4;padding:50px 40px;display:flex;flex-direction:column;">
          <div style="font-family:${SANS};font-size:16px;color:#999;letter-spacing:4px;flex-shrink:0;">SHOPPING LIST</div>
          <div style="font-family:${SANS};font-size:${cs(48,city)}px;font-weight:bold;color:#333;line-height:1;margin-top:10px;flex-shrink:0;">${C}</div>
          ${PH('#33333340', SANS)}
          <div style="margin-top:20px;flex-shrink:0;">
            ${['Free photo shoot','Amazing photos','Great memories','New content'].map(item => `
              <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #e6dc9a;">
                <div style="width:24px;height:24px;border:2px solid #999;border-radius:4px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:16px;color:#4caf50;">✓</div>
                <div style="font-family:${SANS};font-size:18px;color:#555;">${item}</div>
              </div>
            `).join('')}
          </div>
          <div style="font-family:${SANS};font-size:13px;color:#aaa;margin-top:16px;flex-shrink:0;">${CTA}</div>
          <div style="flex:1;"></div>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;gap:6px;padding:20px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 33: BROWSER TAB — Chrome-like browser UI, photos as webpage content
    case 33: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#1e1e1e;display:flex;flex-direction:column;">
        <div style="background:#2d2d2d;padding:12px 20px;display:flex;align-items:center;gap:8px;flex-shrink:0;">
          <div style="display:flex;gap:6px;">
            <div style="width:12px;height:12px;border-radius:50%;background:#ff5f56;"></div>
            <div style="width:12px;height:12px;border-radius:50%;background:#ffbd2e;"></div>
            <div style="width:12px;height:12px;border-radius:50%;background:#27ca40;"></div>
          </div>
          <div style="flex:1;background:#1e1e1e;border-radius:6px;padding:8px 16px;margin-left:12px;">
            <div style="font-family:${SANS};font-size:14px;color:#888;">madebyaidan.com/free-photo-shoot</div>
          </div>
        </div>
        <div style="background:#fff;padding:40px 50px;flex-shrink:0;">
          <div style="font-family:${SANS};font-size:${cs(56,city)}px;font-weight:bold;color:#111;line-height:1;">${C}</div>
          ${PH('#11111140', SANS)}
          <div style="font-family:${SANS};font-size:28px;color:#1a73e8;font-weight:bold;margin-top:10px;">Free Photo Shoot</div>
          <div style="font-family:${SANS};font-size:15px;color:#666;margin-top:8px;">${CTA}</div>
        </div>
        <div style="flex:1;display:flex;gap:4px;padding:4px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 34: TERMINAL WINDOW — green-on-black terminal, photos below
    case 34: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#0a0a0a;display:flex;flex-direction:column;">
        <div style="background:#1a1a1a;padding:10px 20px;display:flex;align-items:center;gap:8px;flex-shrink:0;">
          <div style="display:flex;gap:6px;">
            <div style="width:12px;height:12px;border-radius:50%;background:#ff5f56;"></div>
            <div style="width:12px;height:12px;border-radius:50%;background:#ffbd2e;"></div>
            <div style="width:12px;height:12px;border-radius:50%;background:#27ca40;"></div>
          </div>
          <div style="font-family:${MONO};font-size:13px;color:#888;margin-left:10px;">bash — 80x24</div>
        </div>
        <div style="padding:30px 40px;flex-shrink:0;">
          <div style="font-family:${MONO};font-size:16px;color:#0f0;">$ echo "Welcome to ${C}"</div>
          <div style="font-family:${MONO};font-size:${cs(56,city)}px;color:#0f0;margin-top:10px;line-height:1;">${C}</div>
          ${PH('#00ff0040', MONO)}
          <div style="font-family:${MONO};font-size:16px;color:#0f0;margin-top:14px;">$ cost --check</div>
          <div style="font-family:${MONO};font-size:20px;color:#0f0;">FREE PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:16px;color:#0f0;margin-top:10px;">$ howto</div>
          <div style="font-family:${MONO};font-size:14px;color:#0f060;margin-top:4px;">${CTA}</div>
          <div style="font-family:${MONO};font-size:16px;color:#0f0;margin-top:10px;">$ show --gallery<span style="animation:blink 1s infinite;">_</span></div>
        </div>
        <div style="flex:1;display:flex;gap:4px;padding:0 20px 20px;overflow:hidden;">
          <div style="flex:1;border:1px solid #0f03;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;border:1px solid #0f03;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;border:1px solid #0f03;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 35: LOADING SCREEN — progress bar, percentage, photos as loaded content
    case 35: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#111;display:flex;flex-direction:column;align-items:center;">
        <div style="padding:80px 60px 40px;width:100%;flex-shrink:0;">
          <div style="font-family:${SANS};font-size:${cs(70,city)}px;font-weight:200;color:#fff;letter-spacing:6px;text-align:center;">${C}</div>
          ${PH('#ffffff30', SANS)}
          <div style="text-align:center;margin-top:30px;">
            <div style="font-family:${MONO};font-size:60px;color:#4fc3f7;">100%</div>
            <div style="width:600px;height:8px;background:#333;border-radius:4px;margin:16px auto;overflow:hidden;">
              <div style="width:100%;height:100%;background:linear-gradient(90deg,#4fc3f7,#00bcd4);border-radius:4px;"></div>
            </div>
            <div style="font-family:${MONO};font-size:18px;color:#4fc3f7;">FREE PHOTO SHOOT LOADED</div>
            <div style="font-family:${SANS};font-size:14px;color:#ffffff30;margin-top:10px;">${CTA}</div>
          </div>
        </div>
        <div style="flex:1;width:100%;display:flex;gap:8px;padding:10px 30px 30px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;border-radius:8px;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;border-radius:8px;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;border-radius:8px;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 36: ERROR 404 PAGE — 404 error style, photos as "found" content
    case 36: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#fafafa;display:flex;flex-direction:column;">
        <div style="padding:60px 60px 30px;flex-shrink:0;">
          <div style="font-family:${DISPLAY};font-size:160px;color:#e0e0e0;line-height:0.8;">404</div>
          <div style="font-family:${SANS};font-size:${cs(48,city)}px;font-weight:bold;color:#333;margin-top:10px;line-height:1;">${C}</div>
          ${PH('#33333340', SANS)}
          <div style="font-family:${SANS};font-size:22px;color:#666;margin-top:10px;">Excuses not found.</div>
          <div style="background:#1a73e8;color:#fff;font-family:${SANS};font-size:22px;font-weight:bold;padding:14px 30px;display:inline-block;border-radius:6px;margin-top:16px;">FREE PHOTO SHOOT →</div>
          <div style="font-family:${SANS};font-size:14px;color:#aaa;margin-top:14px;">${CTA}</div>
        </div>
        <div style="flex:1;display:flex;gap:8px;padding:0 30px 30px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;border-radius:10px;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;border-radius:10px;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;border-radius:10px;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 37: STOCK CERTIFICATE — ornate border, formal text, photos as "assets"
    case 37: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#f5f0e8;display:flex;flex-direction:column;align-items:center;padding:30px;">
        <div style="width:1020px;border:4px double #c9a84c;padding:40px;flex-shrink:0;">
          <div style="text-align:center;">
            <div style="font-family:${SERIF};font-size:14px;color:#c9a84c;letter-spacing:8px;">CERTIFICATE OF</div>
            <div style="font-family:${SERIF};font-size:${cs(60,city)}px;font-weight:bold;font-style:italic;color:#333;line-height:0.9;margin-top:6px;">${C}</div>
            ${PH('#33333340', SERIF)}
            <div style="width:200px;height:2px;background:#c9a84c;margin:16px auto;"></div>
            <div style="font-family:${SERIF};font-size:24px;color:#555;font-style:italic;">This certifies one (1) Free Photo Shoot</div>
            <div style="font-family:${SERIF};font-size:16px;color:#999;margin-top:8px;">VALUE: PRICELESS</div>
            <div style="font-family:${SANS};font-size:13px;color:#bbb;margin-top:12px;">${CTA}</div>
          </div>
        </div>
        <div style="flex:1;width:100%;display:flex;gap:10px;margin-top:20px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 38: JUMBOTRON — stadium screen with crowd bg, big text, photos in screen
    case 38: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#0a0a0a;display:flex;flex-direction:column;">
        <div style="background:linear-gradient(180deg,#1a1a2e,#16213e);padding:60px;text-align:center;flex-shrink:0;">
          <div style="font-family:${DISPLAY};font-size:${cs(100,city)}px;color:#fff;line-height:0.85;text-shadow:0 0 30px rgba(255,255,255,0.2);">${C}</div>
          ${PH('#ffffff40', DISPLAY)}
          <div style="font-family:${DISPLAY};font-size:44px;color:#ff4444;margin-top:10px;text-shadow:0 0 20px rgba(255,0,0,0.3);">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:16px;color:#ffffff30;margin-top:12px;">${CTA}</div>
        </div>
        <div style="flex:1;display:flex;gap:6px;padding:10px 20px 20px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 39: BUSINESS CARD HOLDER — fanned cards, minimal text, photos below
    case 39: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#2c2c2c;display:flex;flex-direction:column;align-items:center;">
        <div style="margin-top:60px;position:relative;width:700px;height:420px;flex-shrink:0;">
          <div style="position:absolute;width:600px;height:340px;background:#fff;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.3);top:40px;left:0;transform:rotate(-8deg);padding:30px;">
            <div style="font-family:${SANS};font-size:14px;color:#999;letter-spacing:4px;">PHOTOGRAPHER</div>
          </div>
          <div style="position:absolute;width:600px;height:340px;background:#fff;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.3);top:20px;left:50px;transform:rotate(-3deg);padding:30px;">
            <div style="font-family:${SANS};font-size:14px;color:#999;letter-spacing:4px;">@madebyaidan</div>
          </div>
          <div style="position:absolute;width:600px;height:340px;background:#fff;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.3);top:0;left:80px;transform:rotate(2deg);padding:30px;display:flex;flex-direction:column;justify-content:center;">
            <div style="font-family:${AVENIR};font-size:${cs(44,city)}px;font-weight:600;color:#111;line-height:1;">${C}</div>
            ${PH('#11111140', AVENIR)}
            <div style="font-family:${AVENIR};font-size:22px;color:#e63946;font-weight:600;margin-top:8px;">Free Photo Shoot</div>
            <div style="font-family:${AVENIR};font-size:13px;color:#aaa;margin-top:8px;">${CTA}</div>
          </div>
        </div>
        <div style="flex:1;width:100%;display:flex;gap:10px;padding:20px 40px 40px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;border-radius:8px;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;border-radius:8px;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;border-radius:8px;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 40: DETENTION SLIP — school form, pink carbon copy style, photos as evidence
    case 40: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#f8e8ea;display:flex;flex-direction:column;">
        <div style="margin:40px;padding:40px;border:2px solid #d4a0a8;flex-shrink:0;">
          <div style="font-family:${DISPLAY};font-size:20px;color:#c0392b;letter-spacing:6px;border-bottom:2px solid #d4a0a8;padding-bottom:10px;">DETENTION SLIP</div>
          <div style="margin-top:16px;">
            <div style="font-family:${SERIF};font-size:16px;color:#888;">LOCATION:</div>
            <div style="font-family:${SERIF};font-size:${cs(48,city)}px;font-weight:bold;color:#333;line-height:1;border-bottom:1px solid #d4a0a8;padding-bottom:6px;">${C}</div>
          </div>
          ${PH('#33333340', SERIF)}
          <div style="margin-top:14px;">
            <div style="font-family:${SERIF};font-size:16px;color:#888;">REASON:</div>
            <div style="font-family:${SERIF};font-size:22px;color:#333;">Not signing up for a free photo shoot</div>
          </div>
          <div style="margin-top:14px;">
            <div style="font-family:${SERIF};font-size:16px;color:#888;">SENTENCE:</div>
            <div style="font-family:${DISPLAY};font-size:28px;color:#c0392b;">FREE PHOTO SHOOT</div>
          </div>
          <div style="font-family:${SANS};font-size:13px;color:#bbb;margin-top:14px;">${CTA}</div>
        </div>
        <div style="flex:1;display:flex;gap:8px;padding:0 40px 40px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 41: HALL PASS — laminated badge style, photos grid below
    case 41: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#4a90d9;display:flex;flex-direction:column;align-items:center;">
        <div style="width:860px;background:#fff;margin-top:50px;padding:40px;border-radius:12px;border:3px solid #2c5f9e;flex-shrink:0;">
          <div style="background:#2c5f9e;padding:12px 20px;border-radius:6px;text-align:center;">
            <div style="font-family:${SANS};font-size:18px;color:#fff;letter-spacing:6px;font-weight:bold;">HALL PASS</div>
          </div>
          <div style="text-align:center;margin-top:20px;">
            <div style="font-family:${SANS};font-size:16px;color:#999;">DESTINATION:</div>
            <div style="font-family:${DISPLAY};font-size:${cs(56,city)}px;color:#2c5f9e;">${C}</div>
            ${PH('#2c5f9e40', SANS)}
          </div>
          <div style="text-align:center;margin-top:14px;">
            <div style="font-family:${SANS};font-size:16px;color:#999;">PURPOSE:</div>
            <div style="font-family:${SANS};font-size:24px;color:#e63946;font-weight:bold;">FREE PHOTO SHOOT</div>
          </div>
          <div style="font-family:${SANS};font-size:13px;color:#bbb;text-align:center;margin-top:14px;">${CTA}</div>
        </div>
        <div style="flex:1;width:100%;display:flex;gap:10px;padding:30px 40px 40px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;border-radius:10px;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;border-radius:10px;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;border-radius:10px;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 42: TO-DO LIST — checkbox app style, photos as completed items
    case 42: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#fff;display:flex;flex-direction:column;">
        <div style="padding:50px;flex-shrink:0;">
          <div style="font-family:${SANS};font-size:16px;color:#1a73e8;font-weight:bold;letter-spacing:2px;">MY LIST</div>
          <div style="font-family:${SANS};font-size:${cs(56,city)}px;font-weight:bold;color:#111;line-height:1;margin-top:6px;">${C}</div>
          ${PH('#11111130', SANS)}
          <div style="margin-top:24px;">
            ${[
              {text: 'Find free photo shoot', done: true},
              {text: 'Check out the photographer', done: true},
              {text: 'Send a message', done: false},
              {text: 'Show up and look amazing', done: false}
            ].map(item => `
              <div style="display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid #f0f0f0;">
                <div style="width:28px;height:28px;border-radius:50%;border:2px solid ${item.done ? '#4caf50' : '#ddd'};background:${item.done ? '#4caf50' : 'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-size:16px;">${item.done ? '✓' : ''}</div>
                <div style="font-family:${SANS};font-size:20px;color:${item.done ? '#999' : '#333'};${item.done ? 'text-decoration:line-through;' : ''}">${item.text}</div>
              </div>
            `).join('')}
          </div>
          <div style="font-family:${SANS};font-size:14px;color:#aaa;margin-top:16px;">${CTA}</div>
        </div>
        <div style="flex:1;display:flex;gap:8px;padding:0 30px 30px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;border-radius:10px;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;border-radius:10px;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;border-radius:10px;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 43: WINE LABEL — elegant label on dark bottle-green bg, photos as vintage
    case 43: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#1a2e1a;display:flex;flex-direction:column;align-items:center;">
        <div style="width:800px;background:#fdf8f0;margin-top:50px;padding:50px;text-align:center;border:2px solid #c9a84c;flex-shrink:0;">
          <div style="font-family:${SERIF};font-size:14px;color:#c9a84c;letter-spacing:8px;">GRAND CRU</div>
          <div style="width:120px;height:1px;background:#c9a84c;margin:12px auto;"></div>
          <div style="font-family:${SERIF};font-size:${cs(60,city)}px;font-weight:bold;font-style:italic;color:#2a1a0a;line-height:0.9;">${C}</div>
          ${PH('#2a1a0a40', SERIF)}
          <div style="font-family:${SERIF};font-size:22px;color:#666;font-style:italic;margin-top:10px;">Free Photo Shoot</div>
          <div style="font-family:${SERIF};font-size:14px;color:#999;margin-top:6px;">Vintage 2024</div>
          <div style="width:120px;height:1px;background:#c9a84c;margin:12px auto;"></div>
          <div style="font-family:${SANS};font-size:13px;color:#bbb;">${CTA}</div>
        </div>
        <div style="flex:1;width:100%;display:flex;gap:10px;padding:30px 40px 40px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:2;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 44: SURFBOARD — vertical board shape, tropical colors, photos as wave background
    case 44: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:linear-gradient(180deg,#00bcd4,#006064);display:flex;flex-direction:column;">
        <div style="padding:60px 50px 20px;flex-shrink:0;">
          <div style="font-family:${DISPLAY};font-size:${cs(100,city)}px;color:#fff;line-height:0.85;text-shadow:2px 4px 0 rgba(0,0,0,0.2);">${C}</div>
          ${PH('#ffffff60', DISPLAY)}
          <div style="font-family:${SANS};font-size:36px;font-weight:bold;color:#fff700;margin-top:8px;text-shadow:1px 2px 0 rgba(0,0,0,0.2);">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:15px;color:#ffffffaa;margin-top:8px;">${CTA}</div>
        </div>
        <div style="flex:1;display:flex;gap:10px;padding:10px 30px 30px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;border-radius:100px 100px 40px 40px;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;border-radius:100px 100px 40px 40px;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;border-radius:100px 100px 40px 40px;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 45: GYM MEMBERSHIP — gym card, membership details, photos as "gains"
    case 45: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#111;display:flex;flex-direction:column;">
        <div style="background:linear-gradient(135deg,#e63946,#c62828);margin:30px;padding:40px;border-radius:16px;flex-shrink:0;">
          <div style="font-family:${SANS};font-size:14px;color:#ffffffaa;letter-spacing:6px;font-weight:bold;">MEMBER CARD</div>
          <div style="font-family:${DISPLAY};font-size:${cs(70,city)}px;color:#fff;line-height:0.9;margin-top:10px;">${C}</div>
          ${PH('#ffffff60', DISPLAY)}
          <div style="display:flex;gap:30px;margin-top:20px;">
            <div>
              <div style="font-family:${SANS};font-size:12px;color:#ffffffaa;">PLAN</div>
              <div style="font-family:${SANS};font-size:22px;color:#fff;font-weight:bold;">FREE</div>
            </div>
            <div>
              <div style="font-family:${SANS};font-size:12px;color:#ffffffaa;">SERVICE</div>
              <div style="font-family:${SANS};font-size:22px;color:#fff;font-weight:bold;">PHOTO SHOOT</div>
            </div>
          </div>
          <div style="font-family:${SANS};font-size:13px;color:#ffffff40;margin-top:16px;">${CTA}</div>
        </div>
        <div style="flex:1;display:flex;gap:8px;padding:0 30px 30px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;border-radius:10px;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;border-radius:10px;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;border-radius:10px;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 46: VISION BOARD — magazine cutout aesthetic, photos scattered with inspirational text
    case 46: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#f0ebe3;display:flex;flex-direction:column;">
        <div style="padding:40px 40px 10px;flex-shrink:0;">
          <div style="font-family:${SERIF};font-size:14px;color:#999;letter-spacing:6px;">VISION BOARD 2024</div>
          <div style="display:flex;gap:16px;align-items:baseline;margin-top:8px;">
            <div style="font-family:${DISPLAY};font-size:${cs(60,city)}px;color:#333;">${C}</div>
            <div style="font-family:${SERIF};font-size:30px;font-style:italic;color:#e63946;">free shoot</div>
          </div>
          ${PH('#33333330', SANS)}
        </div>
        <div style="flex:1;display:flex;flex-direction:column;gap:12px;padding:10px 30px 20px;overflow:hidden;">
          <div style="flex:2;display:flex;gap:12px;">
            <div style="flex:2;overflow:hidden;transform:rotate(-2deg);box-shadow:3px 4px 12px rgba(0,0,0,0.15);">
              <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
            <div style="flex:1;overflow:hidden;transform:rotate(3deg);box-shadow:3px 4px 12px rgba(0,0,0,0.15);margin-top:30px;">
              <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
          </div>
          <div style="flex:1;overflow:hidden;transform:rotate(1deg);box-shadow:3px 4px 12px rgba(0,0,0,0.15);margin:0 80px;">
            <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <div style="padding:10px 50px 40px;flex-shrink:0;">
          <div style="font-family:${SANS};font-size:14px;color:#aaa;">${CTA}</div>
        </div>
      </div>`

    // 47: POLAROID WALL — three polaroids pinned to wall, handwritten-style text
    case 47: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#3e2723;display:flex;flex-direction:column;">
        <div style="padding:50px 50px 20px;flex-shrink:0;">
          <div style="font-family:${SERIF};font-size:${cs(70,city)}px;font-weight:bold;font-style:italic;color:#f5e6c8;line-height:0.9;">${C}</div>
          ${PH('#f5e6c850', SERIF)}
          <div style="font-family:${SERIF};font-size:28px;color:#e8d5b7;font-style:italic;margin-top:10px;">Free Photo Shoot</div>
          <div style="font-family:${SANS};font-size:14px;color:#f5e6c830;margin-top:10px;">${CTA}</div>
        </div>
        <div style="flex:1;display:flex;gap:20px;padding:20px 40px 60px;overflow:hidden;align-items:flex-start;">
          <div style="flex:1;background:#fff;padding:12px 12px 50px;transform:rotate(-5deg);box-shadow:4px 6px 20px rgba(0,0,0,0.4);overflow:hidden;">
            <img src="${p}" style="width:100%;height:400px;object-fit:cover;"/>
          </div>
          <div style="flex:1;background:#fff;padding:12px 12px 50px;transform:rotate(3deg);box-shadow:4px 6px 20px rgba(0,0,0,0.4);overflow:hidden;margin-top:100px;">
            <img src="${p2}" style="width:100%;height:400px;object-fit:cover;"/>
          </div>
          <div style="flex:1;background:#fff;padding:12px 12px 50px;transform:rotate(-2deg);box-shadow:4px 6px 20px rgba(0,0,0,0.4);overflow:hidden;margin-top:40px;">
            <img src="${p3}" style="width:100%;height:400px;object-fit:cover;"/>
          </div>
        </div>
      </div>`

    // 48: STACKED HORIZONTAL BANDS — alternating colored text bands and photo bands
    case 48: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#111;display:flex;flex-direction:column;">
        <div style="background:#e63946;padding:30px 50px;flex-shrink:0;">
          <div style="font-family:${FUTURA};font-size:${cs(80,city)}px;font-weight:bold;color:#fff;line-height:0.9;">${C}</div>
          ${PH('#ffffffaa', FUTURA)}
        </div>
        <div style="height:400px;display:flex;gap:4px;overflow:hidden;flex-shrink:0;">
          <div style="flex:1;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
        <div style="background:#1d3557;padding:24px 50px;flex-shrink:0;">
          <div style="font-family:${FUTURA};font-size:36px;font-weight:bold;color:#fff;letter-spacing:4px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:14px;color:#ffffff40;margin-top:6px;">${CTA}</div>
        </div>
        <div style="flex:1;overflow:hidden;">
          <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
      </div>`

    // 49: CENTER CARD OVERLAY — large photo bg (blurred via CSS), opaque white card centered with text, smaller photos flanking
    case 49: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#111;display:flex;flex-direction:column;">
        <div style="flex-shrink:0;height:640px;display:flex;gap:6px;padding:20px 20px 0;">
          <div style="flex:1;overflow:hidden;border-radius:10px;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;border-radius:10px;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
        <div style="margin:30px 60px;background:#fff;padding:50px;border-radius:16px;flex-shrink:0;">
          <div style="font-family:${AVENIR};font-size:${cs(60,city)}px;font-weight:600;color:#111;line-height:0.95;">${C}</div>
          ${PH('#11111140', AVENIR)}
          <div style="font-family:${AVENIR};font-size:28px;font-weight:600;color:#e63946;margin-top:12px;">Free Photo Shoot</div>
          <div style="font-family:${AVENIR};font-size:15px;font-weight:400;color:#999;margin-top:10px;">${CTA}</div>
        </div>
        <div style="flex:1;padding:0 20px 20px;overflow:hidden;border-radius:10px;margin:0 20px;">
          <img src="${p3}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;"/>
        </div>
      </div>`

    default: return `<div style="width:1080px;height:1920px;background:#000;color:#fff;display:flex;align-items:center;justify-content:center;font-size:40px;">Variant ${variant}</div>`
  }
}

// LANDSCAPE_VARIANTS — put indices of variants with landscape photo containers here
const LANDSCAPE_VARIANTS = new Set([])

// Build 150 slides: 50 per city
const slides = []

for (let ci = 0; ci < cities.length; ci++) {
  const city = cities[ci]
  for (let v = 0; v < 50; v++) {
    const pool = LANDSCAPE_VARIANTS.has(v) ? landscapePhotos : portraitPhotos
    const pi1 = (v * 3 + ci * 7) % pool.length
    const pi2 = (v * 3 + ci * 7 + 1) % pool.length
    const pi3 = (v * 3 + ci * 7 + 2) % pool.length
    slides.push({
      name: `${city.toLowerCase()}-${String(v + 1).padStart(3, '0')}`,
      city,
      html: makeSlide(city, pool[pi1], pool[pi2], pool[pi3], v),
    })
  }
}

async function render() {
  for (const city of cities) {
    fs.mkdirSync(path.join(OUT, city.toLowerCase()), { recursive: true })
  }

  console.log(`Launching browser — rendering ${slides.length} CPC ads...`)
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i]
    const page = await context.newPage()
    await page.setContent(`<!doctype html><html><head><style>
      * { box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; background: #000; overflow: hidden; }
      body { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
    </style></head><body>${slide.html}</body></html>`, { waitUntil: 'load' })
    await page.waitForTimeout(300)
    const outPath = path.join(OUT, slide.city.toLowerCase(), `${slide.name}.png`)
    await page.screenshot({ path: outPath, type: 'png' })
    await page.close()
    console.log(`  [${i + 1}/${slides.length}] ${slide.name}`)
  }

  await browser.close()
  console.log(`\nDone — ${slides.length} CPC ads rendered to ${OUT}`)
}

render()
