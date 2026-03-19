import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output-v6')
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

const cities = ['Manila', 'Antipolo', 'Subic/Olongapo', 'Quezon City']
const CTA = 'if interested, message me for details'

function slug(city) {
  return city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')
}

function cs(base, city) {
  if (city.length <= 5) return base
  if (city.length <= 6) return Math.round(base * 0.88)
  if (city.length <= 8) return Math.round(base * 0.6)
  return Math.round(base * 0.42)
}

function makeSlide(city, p, p2, p3, variant) {
  const C = city.toUpperCase()
  const PH = (color, font = SANS) => `<div style="font-family:${font};font-size:20px;letter-spacing:4px;color:${color};margin-top:2px;">PHILIPPINES</div>`

  switch (variant) {

    // 0: SNOW GLOBE
    case 0: {
      const snowflakes = Array.from({length:45}, (_,i) => {
        const x = Math.floor((i * 73 + 17) % 1000) + 40
        const y = Math.floor((i * 47 + 31) % 1400) + 100
        const size = 4 + (i % 5) * 2
        const opacity = 0.3 + (i % 4) * 0.15
        return `<div style="position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;border-radius:50%;background:rgba(255,255,255,${opacity});box-shadow:0 0 ${size*2}px rgba(255,255,255,${opacity*0.5});"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#0a1628 0%,#1a2a4a 40%,#2a3a5a 100%);">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 80%,rgba(100,140,200,0.15) 0%,transparent 60%);"></div>
        ${snowflakes}
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:white;text-shadow:0 2px 20px rgba(100,160,255,0.5);">${C}</div>
          ${PH('rgba(180,200,255,0.5)')}
          <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:white;letter-spacing:6px;margin-top:4px;text-shadow:0 2px 10px rgba(0,0,0,0.5);">FREE PHOTO SHOOT</div>
        </div>
        <!-- glass dome -->
        <div style="position:absolute;top:320px;left:140px;width:800px;height:1000px;border-radius:400px 400px 40px 40px;border:4px solid rgba(255,255,255,0.12);background:radial-gradient(ellipse at 30% 25%,rgba(255,255,255,0.08) 0%,transparent 50%);overflow:hidden;box-shadow:inset 0 0 60px rgba(100,150,255,0.1);">
          <div style="position:absolute;top:80px;left:80px;width:280px;height:380px;border-radius:8px;overflow:hidden;transform:rotate(-3deg);box-shadow:0 8px 30px rgba(0,0,0,0.4);">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="position:absolute;top:120px;right:60px;width:280px;height:380px;border-radius:8px;overflow:hidden;transform:rotate(2deg);box-shadow:0 8px 30px rgba(0,0,0,0.4);">
            <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="position:absolute;bottom:120px;left:180px;width:280px;height:380px;border-radius:8px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.4);">
            <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <!-- dome glare -->
          <div style="position:absolute;top:20px;left:120px;width:200px;height:400px;background:linear-gradient(180deg,rgba(255,255,255,0.1),transparent);border-radius:50%;transform:rotate(-15deg);"></div>
        </div>
        <!-- wooden base -->
        <div style="position:absolute;bottom:180px;left:100px;right:100px;height:80px;background:linear-gradient(180deg,#6b4226,#4a2e1a);border-radius:12px;box-shadow:0 8px 20px rgba(0,0,0,0.5);"></div>
        <div style="position:absolute;bottom:240px;left:130px;right:130px;height:30px;background:linear-gradient(180deg,#8B6914,#C4A035,#8B6914);border-radius:4px;"></div>
        <!-- base nameplate -->
        <div style="position:absolute;bottom:196px;left:350px;right:350px;height:44px;background:linear-gradient(180deg,#D4AF37,#B8960C);border-radius:4px;display:flex;align-items:center;justify-content:center;">
          <div style="font-family:${SERIF};font-size:18px;font-weight:bold;color:#3a2000;letter-spacing:3px;">${C}</div>
        </div>
        <div style="position:absolute;bottom:130px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(180,200,255,0.4);">${CTA}</div>
      </div>`
    }

    // 1: AQUARIUM TANK
    case 1: {
      const bubbles = Array.from({length:25}, (_,i) => {
        const x = 80 + (i * 43) % 920
        const y = 400 + (i * 67) % 1200
        const size = 8 + (i % 6) * 4
        return `<div style="position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;border-radius:50%;border:2px solid rgba(255,255,255,0.15);background:radial-gradient(circle at 30% 30%,rgba(255,255,255,0.1),transparent);"></div>`
      }).join('')
      const seaweed = Array.from({length:8}, (_,i) => {
        const x = 60 + i * 130
        const h = 120 + (i % 3) * 60
        return `<div style="position:absolute;bottom:80px;left:${x}px;width:20px;height:${h}px;background:linear-gradient(180deg,#2a6b3a,#1a4a2a);border-radius:10px 10px 0 0;transform:rotate(${-8 + (i%3)*8}deg);"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#001a33 0%,#003366 30%,#004d80 60%,#002244 100%);">
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(180deg,rgba(0,100,200,0.03) 0px,transparent 3px,transparent 6px);"></div>
        <!-- light rays from top -->
        <div style="position:absolute;top:0;left:200px;width:300px;height:800px;background:linear-gradient(180deg,rgba(100,200,255,0.1),transparent);transform:skewX(-10deg);"></div>
        <div style="position:absolute;top:0;left:500px;width:200px;height:600px;background:linear-gradient(180deg,rgba(100,200,255,0.08),transparent);transform:skewX(5deg);"></div>
        ${bubbles}
        <div style="position:absolute;top:80px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(110,city)}px;font-weight:bold;font-style:italic;color:rgba(100,220,255,0.9);text-shadow:0 0 30px rgba(0,150,255,0.5);">${C}</div>
          ${PH('rgba(100,200,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:white;letter-spacing:5px;margin-top:6px;text-shadow:0 2px 12px rgba(0,0,0,0.5);">FREE PHOTO SHOOT</div>
        </div>
        <!-- fish tank glass frame -->
        <div style="position:absolute;top:350px;left:60px;right:60px;bottom:140px;border:8px solid rgba(255,255,255,0.08);border-radius:20px;box-shadow:inset 0 0 40px rgba(0,50,100,0.3);">
          <!-- photo cards floating in water -->
          <div style="position:absolute;top:40px;left:40px;width:420px;height:560px;border-radius:12px;overflow:hidden;transform:rotate(-3deg);box-shadow:0 10px 40px rgba(0,0,0,0.4);">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="position:absolute;top:80px;right:40px;width:380px;height:480px;border-radius:12px;overflow:hidden;transform:rotate(4deg);box-shadow:0 10px 40px rgba(0,0,0,0.4);">
            <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="position:absolute;bottom:100px;left:180px;width:400px;height:500px;border-radius:12px;overflow:hidden;transform:rotate(-1deg);box-shadow:0 10px 40px rgba(0,0,0,0.4);">
            <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        ${seaweed}
        <!-- sandy bottom -->
        <div style="position:absolute;bottom:0;left:0;right:0;height:100px;background:linear-gradient(180deg,#8B7355,#6b5535);border-radius:0;"></div>
        <div style="position:absolute;bottom:60px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(100,200,255,0.4);">${CTA}</div>
      </div>`
    }

    // 2: PINBALL MACHINE
    case 2: {
      const bumpers = Array.from({length:12}, (_,i) => {
        const x = 150 + (i % 4) * 220
        const y = 700 + Math.floor(i / 4) * 280
        const colors = ['#FF1744','#FFD600','#00E5FF','#FF9100']
        const c = colors[i % 4]
        return `<div style="position:absolute;left:${x}px;top:${y}px;width:60px;height:60px;border-radius:50%;background:radial-gradient(circle at 35% 35%,${c},${c}88);box-shadow:0 0 15px ${c}88,0 4px 8px rgba(0,0,0,0.4);border:3px solid rgba(255,255,255,0.3);"></div>`
      }).join('')
      const leds = Array.from({length:20}, (_,i) => {
        const x = 30 + (i < 10 ? 0 : 1020)
        const y = 200 + (i % 10) * 160
        const c = ['#FF1744','#FFD600','#00E5FF'][i % 3]
        return `<div style="position:absolute;left:${x}px;top:${y}px;width:16px;height:16px;border-radius:50%;background:${c};box-shadow:0 0 10px ${c};"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#1a0030 0%,#0d001a 100%);">
        <div style="position:absolute;inset:20px;border:6px solid #444;border-radius:30px 30px 0 0;background:linear-gradient(180deg,#1a1a2e,#0a0a15);"></div>
        ${leds}
        <!-- score display -->
        <div style="position:absolute;top:50px;left:100px;right:100px;height:100px;background:linear-gradient(180deg,#111,#1a1a1a);border:3px solid #444;border-radius:12px;display:flex;align-items:center;justify-content:space-between;padding:0 30px;">
          <div style="font-family:${MONO};font-size:20px;color:#FF1744;letter-spacing:2px;">BALL 1</div>
          <div style="font-family:${MONO};font-size:48px;font-weight:bold;color:#FFD600;text-shadow:0 0 10px rgba(255,214,0,0.5);">0000000</div>
          <div style="font-family:${MONO};font-size:20px;color:#00E5FF;">FREE</div>
        </div>
        <div style="position:absolute;top:180px;left:0;right:0;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:${cs(100,city)}px;color:#FFD600;text-shadow:0 0 30px rgba(255,214,0,0.4),0 4px 8px rgba(0,0,0,0.8);letter-spacing:4px;">${C}</div>
          ${PH('rgba(255,214,0,0.4)', MONO)}
          <div style="font-family:${FUTURA};font-size:50px;font-weight:bold;color:#FF1744;letter-spacing:6px;margin-top:6px;text-shadow:0 0 20px rgba(255,23,68,0.4);">FREE PHOTO SHOOT</div>
        </div>
        ${bumpers}
        <!-- photo in center -->
        <div style="position:absolute;top:440px;left:160px;right:160px;height:600px;border-radius:16px;overflow:hidden;border:4px solid #FFD600;box-shadow:0 0 30px rgba(255,214,0,0.2),0 10px 40px rgba(0,0,0,0.5);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <!-- flippers -->
        <div style="position:absolute;bottom:200px;left:200px;width:200px;height:40px;background:linear-gradient(90deg,#ccc,#999);border-radius:20px;transform:rotate(25deg);box-shadow:0 4px 10px rgba(0,0,0,0.5);"></div>
        <div style="position:absolute;bottom:200px;right:200px;width:200px;height:40px;background:linear-gradient(90deg,#999,#ccc);border-radius:20px;transform:rotate(-25deg);box-shadow:0 4px 10px rgba(0,0,0,0.5);"></div>
        <!-- launch lane -->
        <div style="position:absolute;bottom:100px;right:60px;width:50px;height:300px;background:linear-gradient(180deg,#333,#222);border:2px solid #555;border-radius:25px;"></div>
        <div style="position:absolute;bottom:130px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,214,0,0.35);">${CTA}</div>
      </div>`
    }

    // 3: JUKEBOX
    case 3: {
      const arcLights = Array.from({length:16}, (_,i) => {
        const angle = (i / 16) * Math.PI
        const x = 540 + Math.cos(angle) * 420
        const y = 100 + Math.sin(angle) * 60
        const c = ['#FF1744','#FFD600','#FF9100','#E040FB'][i % 4]
        return `<div style="position:absolute;left:${Math.round(x)}px;top:${Math.round(y)}px;width:14px;height:14px;border-radius:50%;background:${c};box-shadow:0 0 10px ${c};"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#1a0a00,#2a1500,#1a0a00);">
        ${arcLights}
        <!-- chrome top arch -->
        <div style="position:absolute;top:60px;left:120px;right:120px;height:80px;background:linear-gradient(180deg,#D4AF37,#8B7355,#D4AF37);border-radius:40px 40px 0 0;box-shadow:0 -4px 20px rgba(212,175,55,0.3);"></div>
        <!-- jukebox body -->
        <div style="position:absolute;top:140px;left:80px;right:80px;bottom:100px;background:linear-gradient(180deg,#3a1500,#5a2500,#3a1500);border:4px solid #8B6914;border-radius:20px;box-shadow:0 10px 40px rgba(0,0,0,0.6);">
          <!-- title window -->
          <div style="position:absolute;top:20px;left:40px;right:40px;height:120px;background:linear-gradient(180deg,#FFE4B5,#FFD080);border-radius:10px;border:3px solid #D4AF37;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <div style="font-family:${DISPLAY};font-size:${cs(70,city)}px;color:#8B0000;letter-spacing:4px;">${C}</div>
            ${PH('#8B4513')}
          </div>
          <!-- viewing window with photos -->
          <div style="position:absolute;top:170px;left:40px;right:40px;height:520px;background:#111;border-radius:10px;border:3px solid #D4AF37;overflow:hidden;display:flex;gap:8px;padding:8px;">
            <div style="flex:1;border-radius:6px;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
            <div style="flex:1;border-radius:6px;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
            <div style="flex:1;border-radius:6px;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
          </div>
          <!-- selection buttons -->
          <div style="position:absolute;top:720px;left:60px;right:60px;display:flex;gap:16px;flex-wrap:wrap;justify-content:center;">
            ${['A1','A2','A3','B1','B2','B3','C1','C2','C3','D1'].map((label,i) => `
              <div style="width:140px;height:50px;background:${i===0?'#FF1744':'linear-gradient(180deg,#FFE4B5,#DDB87A)'};border-radius:8px;border:2px solid #8B6914;display:flex;align-items:center;justify-content:center;font-family:${MONO};font-size:18px;color:${i===0?'white':'#5a3000'};font-weight:bold;box-shadow:0 3px 8px rgba(0,0,0,0.3);">${label}</div>
            `).join('')}
          </div>
          <!-- FREE PHOTO SHOOT banner -->
          <div style="position:absolute;top:870px;left:40px;right:40px;height:80px;background:linear-gradient(90deg,#FF1744,#FF4444,#FF1744);border-radius:10px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(255,23,68,0.3);">
            <div style="font-family:${FUTURA};font-size:42px;font-weight:bold;color:white;letter-spacing:6px;">FREE PHOTO SHOOT</div>
          </div>
          <!-- speaker grille -->
          <div style="position:absolute;bottom:30px;left:60px;right:60px;height:200px;background:repeating-linear-gradient(0deg,#2a1500 0px,#2a1500 6px,#1a0a00 6px,#1a0a00 12px);border-radius:10px;border:3px solid #8B6914;"></div>
        </div>
        <div style="position:absolute;bottom:50px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(212,175,55,0.4);">${CTA}</div>
      </div>`
    }

    // 4: SLOT CANYON
    case 4: {
      const rockLayers = Array.from({length:14}, (_,i) => {
        const y = 300 + i * 100
        const colors = ['#C2642E','#A84820','#D4763A','#B85C2C','#9E4218','#CC6E34']
        return `<div style="position:absolute;top:${y}px;left:0;width:200px;height:100px;background:${colors[i%6]};border-radius:0 40px 40px 0;opacity:0.7;"></div>
        <div style="position:absolute;top:${y+20}px;right:0;width:180px;height:100px;background:${colors[(i+2)%6]};border-radius:40px 0 0 40px;opacity:0.7;"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#1a0a00 0%,#3a1a08 20%,#5a2a10 50%,#2a1208 100%);">
        ${rockLayers}
        <!-- light beam from above -->
        <div style="position:absolute;top:0;left:340px;width:400px;height:1920px;background:linear-gradient(180deg,rgba(255,180,100,0.2) 0%,rgba(255,150,80,0.08) 50%,transparent 100%);"></div>
        <div style="position:absolute;top:0;left:400px;width:280px;height:1400px;background:linear-gradient(180deg,rgba(255,200,120,0.15) 0%,transparent 80%);"></div>
        <div style="position:absolute;top:80px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(120,city)}px;font-weight:bold;font-style:italic;color:#FFB366;text-shadow:0 4px 20px rgba(255,120,50,0.4);">${C}</div>
          ${PH('rgba(255,180,120,0.4)')}
          <div style="font-family:${FUTURA};font-size:50px;font-weight:bold;color:white;letter-spacing:5px;margin-top:6px;text-shadow:0 2px 10px rgba(0,0,0,0.6);">FREE PHOTO SHOOT</div>
        </div>
        <!-- photos floating in canyon light -->
        <div style="position:absolute;top:400px;left:220px;width:640px;height:850px;">
          <div style="position:absolute;top:0;left:0;width:300px;height:400px;border-radius:8px;overflow:hidden;transform:rotate(-4deg);box-shadow:0 10px 40px rgba(0,0,0,0.5);border:3px solid rgba(255,180,100,0.3);">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="position:absolute;top:40px;right:0;width:300px;height:400px;border-radius:8px;overflow:hidden;transform:rotate(3deg);box-shadow:0 10px 40px rgba(0,0,0,0.5);border:3px solid rgba(255,180,100,0.3);">
            <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="position:absolute;bottom:0;left:140px;width:340px;height:420px;border-radius:8px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.5);border:3px solid rgba(255,180,100,0.3);">
            <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <div style="position:absolute;bottom:200px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,180,120,0.35);">${CTA}</div>
      </div>`
    }

    // 5: LAVA LAMP
    case 5: {
      const blobs = Array.from({length:8}, (_,i) => {
        const x = 100 + (i * 130) % 800
        const y = 500 + (i * 200) % 1000
        const size = 80 + (i % 4) * 50
        const colors = ['rgba(255,50,100,0.25)','rgba(255,150,0,0.2)','rgba(255,80,180,0.2)','rgba(200,50,255,0.2)']
        return `<div style="position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size*1.4}px;border-radius:50%;background:radial-gradient(ellipse,${colors[i%4]},transparent);filter:blur(20px);"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#0a0015,#1a0030,#0a0015);">
        ${blobs}
        <!-- lamp body outline -->
        <div style="position:absolute;top:200px;left:250px;right:250px;bottom:200px;border:3px solid rgba(255,100,200,0.1);border-radius:200px 200px 80px 80px;"></div>
        <!-- chrome cap -->
        <div style="position:absolute;top:160px;left:320px;right:320px;height:60px;background:linear-gradient(180deg,#aaa,#666,#888);border-radius:30px 30px 0 0;"></div>
        <!-- chrome base -->
        <div style="position:absolute;bottom:160px;left:280px;right:280px;height:60px;background:linear-gradient(180deg,#888,#666,#aaa);border-radius:0 0 30px 30px;"></div>
        <div style="position:absolute;top:80px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:#FF69B4;text-shadow:0 0 30px rgba(255,105,180,0.5);">${C}</div>
          ${PH('rgba(255,105,180,0.4)')}
          <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:#FF9100;letter-spacing:5px;margin-top:4px;text-shadow:0 0 20px rgba(255,145,0,0.4);">FREE PHOTO SHOOT</div>
        </div>
        <!-- photos stacked inside lamp -->
        <div style="position:absolute;top:380px;left:280px;right:280px;">
          <div style="width:100%;height:360px;border-radius:12px;overflow:hidden;margin-bottom:16px;box-shadow:0 8px 30px rgba(255,100,200,0.2);">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="width:100%;height:360px;border-radius:12px;overflow:hidden;margin-bottom:16px;box-shadow:0 8px 30px rgba(255,100,200,0.2);">
            <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="width:100%;height:360px;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(255,100,200,0.2);">
            <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <div style="position:absolute;bottom:100px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,105,180,0.35);">${CTA}</div>
      </div>`
    }

    // 6: KALEIDOSCOPE
    case 6: {
      const triangles = Array.from({length:12}, (_,i) => {
        const angle = i * 30
        const colors = ['#FF1744','#FF9100','#FFD600','#00E676','#00B0FF','#D500F9']
        const c = colors[i % 6]
        return `<div style="position:absolute;top:50%;left:50%;width:0;height:0;border-left:60px solid transparent;border-right:60px solid transparent;border-bottom:300px solid ${c}22;transform:translate(-50%,-50%) rotate(${angle}deg);transform-origin:center center;"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:radial-gradient(circle at 50% 40%,#1a0030,#000);">
        <!-- geometric pattern ring -->
        <div style="position:absolute;top:250px;left:140px;right:140px;height:800px;border-radius:50%;overflow:hidden;border:4px solid rgba(255,255,255,0.1);">
          ${triangles}
          <!-- center photo circle -->
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:400px;height:400px;border-radius:50%;overflow:hidden;border:6px solid rgba(255,255,255,0.2);box-shadow:0 0 40px rgba(213,0,249,0.3);">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <!-- small mirror photos -->
        <div style="position:absolute;top:280px;left:60px;width:160px;height:200px;border-radius:8px;overflow:hidden;transform:rotate(-8deg);border:3px solid rgba(255,255,255,0.15);box-shadow:0 6px 20px rgba(0,0,0,0.4);">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:320px;right:60px;width:160px;height:200px;border-radius:8px;overflow:hidden;transform:rotate(6deg);border:3px solid rgba(255,255,255,0.15);box-shadow:0 6px 20px rgba(0,0,0,0.4);">
          <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:80px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(110,city)}px;font-weight:bold;font-style:italic;color:#D500F9;text-shadow:0 0 30px rgba(213,0,249,0.5);">${C}</div>
          ${PH('rgba(213,0,249,0.4)')}
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:white;letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;bottom:200px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(213,0,249,0.35);">${CTA}</div>
      </div>`
    }

    // 7: STAINED GLASS WINDOW
    case 7: {
      const panes = Array.from({length:20}, (_,i) => {
        const col = Math.floor(i / 5)
        const row = i % 5
        const x = 60 + col * 250
        const y = 600 + row * 220
        const colors = ['rgba(200,0,0,0.15)','rgba(0,0,200,0.12)','rgba(0,150,0,0.12)','rgba(200,150,0,0.12)','rgba(150,0,200,0.12)']
        return `<div style="position:absolute;left:${x}px;top:${y}px;width:230px;height:200px;background:${colors[i%5]};border:3px solid #333;"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a1a1a;">
        <!-- stone arch frame -->
        <div style="position:absolute;top:0;left:40px;right:40px;bottom:0;border:20px solid #3a3a3a;border-radius:500px 500px 0 0;overflow:hidden;background:#0a0a0a;">
          <!-- light glow from behind -->
          <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 30%,rgba(255,200,100,0.15),transparent 70%);"></div>
          ${panes}
          <!-- lead lines -->
          <div style="position:absolute;top:600px;left:60px;right:60px;height:4px;background:#333;"></div>
          <div style="position:absolute;top:820px;left:60px;right:60px;height:4px;background:#333;"></div>
          <div style="position:absolute;top:1040px;left:60px;right:60px;height:4px;background:#333;"></div>
          <div style="position:absolute;top:1260px;left:60px;right:60px;height:4px;background:#333;"></div>
          <div style="position:absolute;top:600px;left:310px;width:4px;height:900px;background:#333;"></div>
          <div style="position:absolute;top:600px;left:560px;width:4px;height:900px;background:#333;"></div>
          <div style="position:absolute;top:600px;right:110px;width:4px;height:900px;background:#333;"></div>
        </div>
        <div style="position:absolute;top:120px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(110,city)}px;font-weight:bold;font-style:italic;color:#FFD700;text-shadow:0 0 20px rgba(255,215,0,0.5);">${C}</div>
          ${PH('rgba(255,215,0,0.4)')}
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:white;letter-spacing:5px;margin-top:6px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- photos placed within pane areas -->
        <div style="position:absolute;top:640px;left:100px;width:420px;height:520px;overflow:hidden;border:3px solid #444;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;opacity:0.9;"/>
        </div>
        <div style="position:absolute;top:680px;right:100px;width:360px;height:440px;overflow:hidden;border:3px solid #444;">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;opacity:0.9;"/>
        </div>
        <div style="position:absolute;top:1200px;left:240px;width:500px;height:350px;overflow:hidden;border:3px solid #444;">
          <img src="${p3}" style="width:100%;height:100%;object-fit:cover;opacity:0.9;"/>
        </div>
        <div style="position:absolute;bottom:150px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,215,0,0.35);">${CTA}</div>
      </div>`
    }

    // 8: TERRARIUM
    case 8: {
      const plants = Array.from({length:10}, (_,i) => {
        const x = 100 + (i * 100) % 800
        const h = 60 + (i % 4) * 30
        const green = ['#2E7D32','#388E3C','#1B5E20','#4CAF50','#66BB6A']
        return `<div style="position:absolute;bottom:${280 + (i%3)*20}px;left:${x}px;width:12px;height:${h}px;background:${green[i%5]};border-radius:6px 6px 0 0;transform:rotate(${-10+(i%5)*5}deg);"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#0a1a0a 0%,#1a2a1a 50%,#0a1510 100%);">
        <!-- glass jar outline -->
        <div style="position:absolute;top:300px;left:140px;right:140px;bottom:260px;border:4px solid rgba(255,255,255,0.08);border-radius:60px 60px 200px 200px;background:radial-gradient(ellipse at 30% 20%,rgba(255,255,255,0.04),transparent 50%);box-shadow:inset 0 0 60px rgba(0,50,0,0.2);overflow:hidden;">
          <!-- soil layer -->
          <div style="position:absolute;bottom:0;left:0;right:0;height:160px;background:linear-gradient(180deg,#3E2723,#5D4037,#4E342E);"></div>
          <div style="position:absolute;bottom:140px;left:0;right:0;height:40px;background:linear-gradient(180deg,rgba(76,175,80,0.2),#3E2723);"></div>
          <!-- pebbles -->
          <div style="position:absolute;bottom:5px;left:0;right:0;height:30px;background:repeating-linear-gradient(90deg,#78909C 0px,#78909C 14px,#90A4AE 14px,#90A4AE 26px,#607D8B 26px,#607D8B 38px);border-radius:0 0 200px 200px;"></div>
          ${plants}
          <!-- photo cards inside terrarium -->
          <div style="position:absolute;top:60px;left:40px;width:320px;height:420px;border-radius:8px;overflow:hidden;transform:rotate(-2deg);box-shadow:0 8px 24px rgba(0,0,0,0.4);">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="position:absolute;top:100px;right:40px;width:280px;height:380px;border-radius:8px;overflow:hidden;transform:rotate(3deg);box-shadow:0 8px 24px rgba(0,0,0,0.4);">
            <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="position:absolute;bottom:180px;left:180px;width:300px;height:340px;border-radius:8px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.4);">
            <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <!-- jar lid -->
        <div style="position:absolute;top:268px;left:280px;right:280px;height:50px;background:linear-gradient(180deg,#8D6E63,#6D4C41);border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.4);"></div>
        <div style="position:absolute;top:256px;left:300px;right:300px;height:20px;background:linear-gradient(180deg,#A1887F,#8D6E63);border-radius:10px 10px 0 0;"></div>
        <div style="position:absolute;top:80px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(110,city)}px;font-weight:bold;font-style:italic;color:#81C784;text-shadow:0 2px 20px rgba(129,199,132,0.4);">${C}</div>
          ${PH('rgba(129,199,132,0.4)')}
          <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:white;letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;bottom:180px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(129,199,132,0.35);">${CTA}</div>
      </div>`
    }

    // 9: MUSIC BOX
    case 9: {
      const notes = Array.from({length:12}, (_,i) => {
        const x = 60 + (i * 90) % 960
        const y = 200 + (i * 130) % 400
        const size = 20 + (i % 3) * 8
        return `<div style="position:absolute;left:${x}px;top:${y}px;font-size:${size}px;color:rgba(212,175,55,${0.2 + (i%4)*0.1});transform:rotate(${-20+(i%5)*10}deg);">&#9835;</div>`
      }).join('')
      const teeth = Array.from({length:18}, (_,i) => {
        return `<div style="position:absolute;bottom:${340}px;left:${160 + i * 42}px;width:6px;height:${40 + (i%5)*15}px;background:linear-gradient(180deg,#D4AF37,#8B6914);border-radius:3px 3px 0 0;"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#2a1a10,#1a1008,#0f0a04);">
        ${notes}
        <!-- music box lid (open) -->
        <div style="position:absolute;top:80px;left:100px;right:100px;height:200px;background:linear-gradient(180deg,#6D4C41,#5D4037);border:3px solid #8B6914;border-radius:12px 12px 0 0;transform-origin:bottom;transform:perspective(600px) rotateX(-30deg);box-shadow:0 -8px 20px rgba(0,0,0,0.3);">
          <!-- velvet lining -->
          <div style="position:absolute;inset:8px;background:linear-gradient(180deg,#880E4F,#AD1457);border-radius:8px 8px 0 0;"></div>
          <!-- mirror inside lid -->
          <div style="position:absolute;top:20px;left:40px;right:40px;bottom:20px;background:linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.05));border:2px solid #D4AF37;border-radius:4px;"></div>
        </div>
        <!-- box body -->
        <div style="position:absolute;top:280px;left:100px;right:100px;bottom:180px;background:linear-gradient(180deg,#5D4037,#4E342E,#3E2723);border:3px solid #8B6914;border-radius:0 0 12px 12px;box-shadow:0 10px 40px rgba(0,0,0,0.5);">
          <!-- velvet interior -->
          <div style="position:absolute;inset:8px;background:linear-gradient(180deg,#880E4F,#6A0040);border-radius:0 0 8px 8px;overflow:hidden;">
            <!-- photos inside box -->
            <div style="position:absolute;top:40px;left:30px;width:380px;height:480px;border-radius:6px;overflow:hidden;transform:rotate(-2deg);box-shadow:0 6px 20px rgba(0,0,0,0.4);border:2px solid rgba(212,175,55,0.3);">
              <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
            <div style="position:absolute;top:60px;right:30px;width:340px;height:440px;border-radius:6px;overflow:hidden;transform:rotate(2deg);box-shadow:0 6px 20px rgba(0,0,0,0.4);border:2px solid rgba(212,175,55,0.3);">
              <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
            <div style="position:absolute;bottom:60px;left:180px;width:400px;height:420px;border-radius:6px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.4);border:2px solid rgba(212,175,55,0.3);">
              <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
          </div>
        </div>
        ${teeth}
        <!-- cylinder drum -->
        <div style="position:absolute;bottom:280px;left:180px;right:180px;height:50px;background:linear-gradient(180deg,#D4AF37,#B8960C,#D4AF37);border-radius:25px;box-shadow:0 4px 12px rgba(0,0,0,0.4);"></div>
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(90,city)}px;font-weight:bold;font-style:italic;color:#D4AF37;text-shadow:0 2px 16px rgba(212,175,55,0.4);">${C}</div>
          ${PH('rgba(212,175,55,0.4)')}
          <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:white;letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;bottom:120px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(212,175,55,0.35);">${CTA}</div>
      </div>`
    }

    // 10: ADVENT CALENDAR
    case 10: {
      const doors = Array.from({length:24}, (_,i) => {
        const col = i % 4
        const row = Math.floor(i / 4)
        const x = 60 + col * 248
        const y = 500 + row * 200
        const isOpen = i === 0 || i === 7 || i === 15
        const doorColors = ['#C62828','#2E7D32','#C62828','#2E7D32']
        return `<div style="position:absolute;left:${x}px;top:${y}px;width:228px;height:180px;background:${isOpen ? '#3E2723' : doorColors[col]};border:3px solid #FFD700;border-radius:6px;overflow:hidden;box-shadow:${isOpen ? 'inset 0 4px 12px rgba(0,0,0,0.5)' : '0 4px 8px rgba(0,0,0,0.3)'};">
          ${isOpen ? `<img src="${[p,p2,p3][i%3]}" style="width:100%;height:100%;object-fit:cover;"/>` : `
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${doorColors[col]};position:relative;">
              <div style="font-family:${SERIF};font-size:48px;font-weight:bold;color:#FFD700;text-shadow:0 2px 6px rgba(0,0,0,0.4);">${i+1}</div>
              <div style="position:absolute;inset:6px;border:1px dashed rgba(255,215,0,0.3);border-radius:3px;"></div>
            </div>`}
        </div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#1a0a2e,#0d0520);">
        <!-- starry sky -->
        ${Array.from({length:30}, (_,i) => `<div style="position:absolute;left:${(i*73)%1060}px;top:${(i*47)%480}px;width:${2+(i%3)}px;height:${2+(i%3)}px;border-radius:50%;background:white;opacity:${0.3+(i%4)*0.15};"></div>`).join('')}
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:#FFD700;text-shadow:0 0 20px rgba(255,215,0,0.4);">${C}</div>
          ${PH('rgba(255,215,0,0.4)')}
          <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:white;letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SERIF};font-size:28px;font-style:italic;color:rgba(255,215,0,0.5);margin-top:8px;">open the doors to discover...</div>
        </div>
        ${doors}
        <div style="position:absolute;bottom:130px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,215,0,0.35);">${CTA}</div>
      </div>`
    }

    // 11: VENDING MACHINE
    case 11: {
      const itemSlots = Array.from({length:9}, (_,i) => {
        const col = i % 3
        const row = Math.floor(i / 3)
        const x = 100 + col * 300
        const y = 520 + row * 340
        return `<div style="position:absolute;left:${x}px;top:${y}px;width:270px;height:310px;background:#222;border:2px solid #444;border-radius:6px;overflow:hidden;box-shadow:inset 0 2px 8px rgba(0,0,0,0.5);">
          <img src="${[p,p2,p3][i%3]}" style="width:100%;height:260px;object-fit:cover;"/>
          <div style="height:50px;display:flex;align-items:center;justify-content:center;background:#333;">
            <div style="font-family:${MONO};font-size:20px;color:#00FF00;">${String.fromCharCode(65+row)}${col+1} — FREE</div>
          </div>
        </div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a1a1a;">
        <!-- machine body -->
        <div style="position:absolute;top:20px;left:40px;right:40px;bottom:20px;background:linear-gradient(180deg,#E53935,#C62828);border-radius:20px;border:4px solid #333;box-shadow:0 10px 40px rgba(0,0,0,0.6);">
          <!-- brand header -->
          <div style="position:absolute;top:0;left:0;right:0;height:120px;background:linear-gradient(180deg,#B71C1C,#D32F2F);border-radius:16px 16px 0 0;display:flex;align-items:center;justify-content:center;">
            <div style="font-family:${DISPLAY};font-size:56px;color:white;letter-spacing:8px;text-shadow:0 2px 8px rgba(0,0,0,0.5);">FREE PHOTOS</div>
          </div>
          <!-- display window -->
          <div style="position:absolute;top:140px;left:30px;right:30px;bottom:200px;background:#1a1a1a;border-radius:12px;border:4px solid #555;overflow:hidden;">
            <!-- inner glow -->
            <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,0.05),transparent 20%);"></div>
            <div style="position:absolute;top:20px;left:20px;right:20px;text-align:center;">
              <div style="font-family:${SERIF};font-size:${cs(80,city)}px;font-weight:bold;font-style:italic;color:white;">${C}</div>
              ${PH('rgba(255,255,255,0.4)')}
              <div style="font-family:${FUTURA};font-size:36px;font-weight:bold;color:#00FF00;letter-spacing:3px;margin-top:4px;">FREE PHOTO SHOOT</div>
            </div>
            ${itemSlots}
          </div>
          <!-- coin slot & keypad area -->
          <div style="position:absolute;bottom:30px;left:30px;right:30px;height:150px;display:flex;gap:20px;">
            <div style="flex:1;background:#333;border-radius:10px;border:2px solid #555;display:flex;align-items:center;justify-content:center;">
              <div style="width:60px;height:8px;background:#666;border-radius:4px;"></div>
            </div>
            <div style="width:200px;background:#222;border-radius:10px;border:2px solid #555;display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:10px;">
              ${Array.from({length:9}, (_,i) => `<div style="background:#444;border-radius:4px;display:flex;align-items:center;justify-content:center;font-family:${MONO};font-size:16px;color:#00FF00;">${i+1}</div>`).join('')}
            </div>
          </div>
        </div>
        <div style="position:absolute;bottom:40px;left:0;right:0;text-align:center;font-family:${SANS};font-size:18px;color:rgba(255,255,255,0.3);">${CTA}</div>
      </div>`
    }

    // 12: PHOTO MOSAIC
    case 12: {
      const tiles = Array.from({length:48}, (_,i) => {
        const col = i % 6
        const row = Math.floor(i / 6)
        const x = col * 180
        const y = 500 + row * 170
        return `<div style="position:absolute;left:${x}px;top:${y}px;width:178px;height:168px;overflow:hidden;border:1px solid rgba(255,255,255,0.05);">
          <img src="${[p,p2,p3][i%3]}" style="width:100%;height:100%;object-fit:cover;filter:${i%7===0?'saturate(1.5)':i%5===0?'brightness(1.2)':'none'};"/>
        </div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0a0a;">
        ${tiles}
        <!-- overlay gradient for text readability -->
        <div style="position:absolute;top:0;left:0;right:0;height:550px;background:linear-gradient(180deg,rgba(0,0,0,0.9) 0%,rgba(0,0,0,0.7) 60%,transparent 100%);"></div>
        <div style="position:absolute;top:80px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${FUTURA};font-size:22px;color:rgba(255,255,255,0.5);letter-spacing:8px;">MOSAIC</div>
          <div style="font-family:${SERIF};font-size:${cs(140,city)}px;font-weight:bold;font-style:italic;color:white;text-shadow:0 4px 16px rgba(0,0,0,0.8);">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:52px;font-weight:bold;color:white;letter-spacing:6px;margin-top:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);margin-top:12px;">${CTA}</div>
        </div>
        <!-- subtle grid overlay -->
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(255,255,255,0.02) 0px,transparent 1px,transparent 180px),repeating-linear-gradient(180deg,rgba(255,255,255,0.02) 0px,transparent 1px,transparent 170px);pointer-events:none;"></div>
      </div>`
    }

    // 13: CARNIVAL PRIZE BOOTH
    case 13: {
      const lights = Array.from({length:30}, (_,i) => {
        const x = 36 * i
        const colors = ['#FF1744','#FFD600','#00E676','#2979FF','#FF9100']
        const c = colors[i % 5]
        return `<div style="position:absolute;left:${x}px;top:0;width:20px;height:20px;border-radius:50%;background:${c};box-shadow:0 0 8px ${c};"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#4A148C,#311B92,#1A237E);">
        <!-- top light strip -->
        <div style="position:absolute;top:40px;left:0;right:0;height:24px;">${lights}</div>
        <!-- bottom light strip -->
        <div style="position:absolute;top:70px;left:0;right:0;height:24px;">${lights}</div>
        <!-- booth frame -->
        <div style="position:absolute;top:110px;left:50px;right:50px;bottom:100px;border:8px solid #FFD600;border-radius:20px;background:rgba(0,0,0,0.3);overflow:hidden;">
          <!-- striped awning -->
          <div style="position:absolute;top:0;left:0;right:0;height:100px;background:repeating-linear-gradient(90deg,#E53935 0px,#E53935 50px,#FDD835 50px,#FDD835 100px);"></div>
          <div style="position:absolute;top:100px;left:0;right:0;height:30px;background:repeating-conic-gradient(#E53935 0deg 45deg,#FDD835 45deg 90deg) top left / 60px 30px;"></div>
          <!-- WINNER banner -->
          <div style="position:absolute;top:150px;left:40px;right:40px;height:80px;background:#E53935;border-radius:10px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
            <div style="font-family:${DISPLAY};font-size:52px;color:#FFD600;letter-spacing:8px;text-shadow:0 2px 4px rgba(0,0,0,0.4);">WINNER!</div>
          </div>
          <div style="position:absolute;top:260px;left:0;right:0;text-align:center;">
            <div style="font-family:${SERIF};font-size:${cs(90,city)}px;font-weight:bold;font-style:italic;color:white;text-shadow:0 4px 12px rgba(0,0,0,0.6);">${C}</div>
            ${PH('rgba(255,255,255,0.5)')}
            <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:#FFD600;letter-spacing:4px;margin-top:6px;">FREE PHOTO SHOOT</div>
          </div>
          <!-- prize photos on shelves -->
          <div style="position:absolute;top:520px;left:30px;right:30px;display:flex;gap:16px;">
            ${[p,p2,p3].map(ph => `<div style="flex:1;height:440px;border-radius:10px;overflow:hidden;border:4px solid #FFD600;box-shadow:0 6px 20px rgba(0,0,0,0.4);">
              <img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>`).join('')}
          </div>
          <!-- shelf -->
          <div style="position:absolute;top:970px;left:20px;right:20px;height:12px;background:linear-gradient(180deg,#8D6E63,#5D4037);border-radius:6px;box-shadow:0 4px 8px rgba(0,0,0,0.3);"></div>
          <!-- stuffed animals decoration -->
          ${Array.from({length:6}, (_,i) => {
            const colors2 = ['#FF8A80','#FFD180','#A5D6A7','#90CAF9','#CE93D8','#FFAB91']
            return `<div style="position:absolute;bottom:${60+Math.floor(i/3)*140}px;left:${60+(i%3)*280}px;width:80px;height:80px;border-radius:50%;background:${colors2[i]};border:3px solid rgba(255,255,255,0.3);"></div>`
          }).join('')}
        </div>
        <div style="position:absolute;bottom:50px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,214,0,0.4);">${CTA}</div>
      </div>`
    }

    // 14: FERRIS WHEEL
    case 14: {
      const spokes = Array.from({length:12}, (_,i) => {
        const angle = i * 30
        return `<div style="position:absolute;top:50%;left:50%;width:4px;height:400px;background:linear-gradient(180deg,#555,#888,#555);transform-origin:top center;transform:translate(-50%,0) rotate(${angle}deg);"></div>`
      }).join('')
      const gondolas = Array.from({length:12}, (_,i) => {
        const angle = (i * 30 - 90) * Math.PI / 180
        const cx = 400 + Math.cos(angle) * 380
        const cy = 400 + Math.sin(angle) * 380
        const colors = ['#E53935','#1E88E5','#43A047','#FDD835','#8E24AA','#FF6F00']
        return `<div style="position:absolute;left:${Math.round(cx)-25}px;top:${Math.round(cy)-20}px;width:50px;height:40px;background:${colors[i%6]};border-radius:0 0 12px 12px;border:2px solid rgba(255,255,255,0.3);"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#0D1B2A 0%,#1B2838 40%,#2E4057 100%);">
        <!-- stars -->
        ${Array.from({length:25}, (_,i) => `<div style="position:absolute;left:${(i*67)%1060}px;top:${(i*41)%300}px;width:3px;height:3px;border-radius:50%;background:white;opacity:${0.3+(i%3)*0.2};"></div>`).join('')}
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(110,city)}px;font-weight:bold;font-style:italic;color:white;text-shadow:0 2px 16px rgba(0,0,0,0.6);">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:#FDD835;letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- wheel structure -->
        <div style="position:absolute;top:360px;left:140px;width:800px;height:800px;">
          <!-- outer ring -->
          <div style="position:absolute;inset:0;border:6px solid #666;border-radius:50%;"></div>
          <div style="position:absolute;inset:20px;border:3px solid #555;border-radius:50%;"></div>
          ${spokes}
          ${gondolas}
          <!-- center hub -->
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#888,#444);border:4px solid #aaa;"></div>
        </div>
        <!-- A-frame support -->
        <div style="position:absolute;top:760px;left:340px;width:8px;height:600px;background:linear-gradient(180deg,#666,#444);transform:rotate(-15deg);"></div>
        <div style="position:absolute;top:760px;right:340px;width:8px;height:600px;background:linear-gradient(180deg,#666,#444);transform:rotate(15deg);"></div>
        <!-- photo cards overlaid on wheel -->
        <div style="position:absolute;top:480px;left:220px;width:260px;height:340px;border-radius:8px;overflow:hidden;transform:rotate(-5deg);box-shadow:0 8px 30px rgba(0,0,0,0.5);border:3px solid rgba(255,255,255,0.15);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:520px;right:200px;width:260px;height:340px;border-radius:8px;overflow:hidden;transform:rotate(4deg);box-shadow:0 8px 30px rgba(0,0,0,0.5);border:3px solid rgba(255,255,255,0.15);">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;bottom:340px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(253,216,53,0.4);">${CTA}</div>
      </div>`
    }

    // 15: FORTUNE TELLER MACHINE
    case 15: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#1a0030,#2a004a,#1a0030);">
        <!-- machine cabinet -->
        <div style="position:absolute;top:40px;left:80px;right:80px;bottom:60px;background:linear-gradient(180deg,#4a0e2e,#6b1040,#4a0e2e);border:6px solid #D4AF37;border-radius:20px;box-shadow:0 0 40px rgba(212,175,55,0.2),0 10px 40px rgba(0,0,0,0.5);">
          <!-- ornate top -->
          <div style="position:absolute;top:-20px;left:100px;right:100px;height:40px;background:linear-gradient(90deg,transparent,#D4AF37,transparent);"></div>
          <!-- crystal ball glow -->
          <div style="position:absolute;top:100px;left:50%;transform:translateX(-50%);width:300px;height:300px;border-radius:50%;background:radial-gradient(circle at 40% 35%,rgba(180,100,255,0.4),rgba(100,0,200,0.2),transparent);box-shadow:0 0 60px rgba(150,50,255,0.3);"></div>
          <!-- crystal ball with photo -->
          <div style="position:absolute;top:120px;left:50%;transform:translateX(-50%);width:260px;height:260px;border-radius:50%;overflow:hidden;border:4px solid rgba(212,175,55,0.6);box-shadow:0 0 30px rgba(150,50,255,0.4);">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;opacity:0.85;"/>
            <div style="position:absolute;inset:0;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,0.15),transparent 50%);"></div>
          </div>
          <!-- base pedestal for crystal ball -->
          <div style="position:absolute;top:380px;left:50%;transform:translateX(-50%);width:180px;height:40px;background:linear-gradient(180deg,#D4AF37,#8B6914);border-radius:50%;"></div>
          <!-- title text -->
          <div style="position:absolute;top:450px;left:30px;right:30px;text-align:center;">
            <div style="font-family:${SERIF};font-size:${cs(90,city)}px;font-weight:bold;font-style:italic;color:#D4AF37;text-shadow:0 0 20px rgba(212,175,55,0.4);">${C}</div>
            ${PH('rgba(212,175,55,0.4)')}
            <div style="font-family:${FUTURA};font-size:42px;font-weight:bold;color:white;letter-spacing:5px;margin-top:6px;">FREE PHOTO SHOOT</div>
          </div>
          <!-- card display area -->
          <div style="position:absolute;top:740px;left:40px;right:40px;display:flex;gap:16px;">
            <div style="flex:1;height:460px;border-radius:10px;overflow:hidden;border:3px solid #D4AF37;box-shadow:0 6px 20px rgba(0,0,0,0.4);">
              <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
            <div style="flex:1;height:460px;border-radius:10px;overflow:hidden;border:3px solid #D4AF37;box-shadow:0 6px 20px rgba(0,0,0,0.4);">
              <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
          </div>
          <!-- fortune text banner -->
          <div style="position:absolute;top:1240px;left:40px;right:40px;padding:20px;background:rgba(0,0,0,0.3);border:2px solid rgba(212,175,55,0.3);border-radius:8px;text-align:center;">
            <div style="font-family:${SERIF};font-size:26px;font-style:italic;color:#D4AF37;">Your future is looking photogenic...</div>
          </div>
          <!-- decorative stars -->
          ${Array.from({length:8}, (_,i) => `<div style="position:absolute;left:${40+(i*110)%800}px;top:${1340+(i%2)*60}px;font-size:24px;color:rgba(212,175,55,${0.2+(i%3)*0.1});">&#9733;</div>`).join('')}
        </div>
        <div style="position:absolute;bottom:20px;left:0;right:0;text-align:center;font-family:${SANS};font-size:18px;color:rgba(212,175,55,0.3);">${CTA}</div>
      </div>`
    }

    // 16: GUMBALL MACHINE
    case 16: {
      const gumballs = Array.from({length:40}, (_,i) => {
        const x = 180 + (i * 53) % 700
        const y = 450 + (i * 37) % 500
        const size = 30 + (i % 4) * 10
        const colors = ['#E53935','#1E88E5','#43A047','#FDD835','#8E24AA','#FF6F00','#00BCD4','#FF4081']
        const c = colors[i % 8]
        return `<div style="position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;border-radius:50%;background:radial-gradient(circle at 35% 30%,${c},${c}bb);box-shadow:inset -2px -2px 4px rgba(0,0,0,0.2),0 2px 4px rgba(0,0,0,0.2);"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#FFF8E1,#FFF3E0);">
        <!-- globe top cap -->
        <div style="position:absolute;top:300px;left:50%;transform:translateX(-50%);width:120px;height:50px;background:linear-gradient(180deg,#E53935,#C62828);border-radius:60px 60px 20px 20px;z-index:2;"></div>
        <!-- glass globe -->
        <div style="position:absolute;top:340px;left:150px;right:150px;height:640px;border-radius:50%;background:rgba(255,255,255,0.3);border:6px solid rgba(0,0,0,0.1);overflow:hidden;box-shadow:inset 0 0 60px rgba(0,0,0,0.05);z-index:1;">
          ${gumballs}
          <!-- glass shine -->
          <div style="position:absolute;top:20px;left:80px;width:150px;height:300px;background:linear-gradient(180deg,rgba(255,255,255,0.3),transparent);border-radius:50%;transform:rotate(-15deg);"></div>
        </div>
        <!-- machine body -->
        <div style="position:absolute;top:960px;left:300px;right:300px;height:200px;background:linear-gradient(180deg,#E53935,#C62828);border-radius:12px;border:3px solid #B71C1C;z-index:1;">
          <!-- coin slot -->
          <div style="position:absolute;top:40px;left:50%;transform:translateX(-50%);width:60px;height:8px;background:#222;border-radius:4px;"></div>
          <!-- FREE label -->
          <div style="position:absolute;top:70px;left:50%;transform:translateX(-50%);background:#FDD835;padding:4px 20px;border-radius:4px;">
            <div style="font-family:${DISPLAY};font-size:28px;color:#C62828;">FREE!</div>
          </div>
          <!-- turn handle -->
          <div style="position:absolute;top:130px;right:40px;width:80px;height:30px;background:#888;border-radius:15px;"></div>
        </div>
        <!-- stand -->
        <div style="position:absolute;top:1150px;left:50%;transform:translateX(-50%);width:30px;height:300px;background:linear-gradient(90deg,#888,#aaa,#888);"></div>
        <div style="position:absolute;top:1440px;left:300px;right:300px;height:20px;background:linear-gradient(180deg,#888,#666);border-radius:10px;"></div>
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(110,city)}px;font-weight:bold;font-style:italic;color:#E53935;text-shadow:0 2px 8px rgba(0,0,0,0.1);">${C}</div>
          ${PH('rgba(229,57,53,0.5)')}
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:#1a1a1a;letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- photo cards floating near machine -->
        <div style="position:absolute;bottom:300px;left:60px;width:200px;height:280px;border-radius:8px;overflow:hidden;transform:rotate(-6deg);box-shadow:0 8px 24px rgba(0,0,0,0.2);border:4px solid white;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;bottom:260px;right:60px;width:200px;height:280px;border-radius:8px;overflow:hidden;transform:rotate(5deg);box-shadow:0 8px 24px rgba(0,0,0,0.2);border:4px solid white;">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;bottom:150px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(0,0,0,0.35);">${CTA}</div>
      </div>`
    }

    // 17: PACHINKO
    case 17: {
      const pegs = Array.from({length:60}, (_,i) => {
        const row = Math.floor(i / 10)
        const col = i % 10
        const offset = row % 2 === 0 ? 0 : 50
        const x = 90 + col * 100 + offset
        const y = 500 + row * 120
        return `<div style="position:absolute;left:${x}px;top:${y}px;width:12px;height:12px;border-radius:50%;background:linear-gradient(135deg,#D4AF37,#8B6914);box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`
      }).join('')
      const balls = Array.from({length:8}, (_,i) => {
        const x = 150 + (i * 120) % 780
        const y = 600 + (i * 90) % 500
        return `<div style="position:absolute;left:${x}px;top:${y}px;width:20px;height:20px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#eee,#aaa);box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0a1a;">
        <!-- neon border frame -->
        <div style="position:absolute;inset:20px;border:4px solid #FF1744;box-shadow:0 0 20px rgba(255,23,68,0.3),inset 0 0 20px rgba(255,23,68,0.1);border-radius:16px;"></div>
        <div style="position:absolute;inset:30px;border:2px solid #00E5FF;box-shadow:0 0 10px rgba(0,229,255,0.2);border-radius:12px;"></div>
        <!-- top display -->
        <div style="position:absolute;top:60px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:${cs(100,city)}px;color:#FF1744;text-shadow:0 0 20px rgba(255,23,68,0.5),0 0 40px rgba(255,23,68,0.2);">${C}</div>
          ${PH('rgba(255,23,68,0.4)', MONO)}
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:#00E5FF;letter-spacing:4px;margin-top:4px;text-shadow:0 0 15px rgba(0,229,255,0.4);">FREE PHOTO SHOOT</div>
        </div>
        <!-- play field -->
        <div style="position:absolute;top:400px;left:50px;right:50px;bottom:200px;background:rgba(255,255,255,0.03);border:3px solid #333;border-radius:8px;overflow:hidden;">
          ${pegs}
          ${balls}
          <!-- photo prize pockets at bottom -->
          <div style="position:absolute;bottom:0;left:0;right:0;display:flex;height:380px;gap:6px;padding:0 20px;">
            ${[p,p2,p3].map(ph => `<div style="flex:1;border:3px solid #FFD600;border-radius:8px 8px 0 0;overflow:hidden;box-shadow:0 0 10px rgba(255,214,0,0.2);">
              <img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>`).join('')}
          </div>
        </div>
        <!-- score display -->
        <div style="position:absolute;top:310px;right:80px;background:#111;border:2px solid #FF1744;border-radius:6px;padding:8px 20px;">
          <div style="font-family:${MONO};font-size:16px;color:#FF1744;">JACKPOT</div>
          <div style="font-family:${MONO};font-size:32px;color:#FFD600;text-shadow:0 0 8px rgba(255,214,0,0.4);">999999</div>
        </div>
        <div style="position:absolute;bottom:120px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,23,68,0.35);">${CTA}</div>
      </div>`
    }

    // 18: CRANE GAME
    case 18: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#111;">
        <!-- machine cabinet -->
        <div style="position:absolute;top:30px;left:60px;right:60px;bottom:80px;background:linear-gradient(180deg,#1565C0,#0D47A1);border:6px solid #FFD600;border-radius:20px;box-shadow:0 10px 40px rgba(0,0,0,0.5);overflow:hidden;">
          <!-- header -->
          <div style="position:absolute;top:0;left:0;right:0;height:100px;background:linear-gradient(180deg,#FF6F00,#E65100);display:flex;align-items:center;justify-content:center;">
            <div style="font-family:${DISPLAY};font-size:56px;color:white;letter-spacing:6px;text-shadow:0 2px 8px rgba(0,0,0,0.4);">GRAB A PHOTO!</div>
          </div>
          <!-- running lights around header -->
          ${Array.from({length:20}, (_,i) => {
            const c = i%2===0 ? '#FFD600' : '#FF1744'
            return `<div style="position:absolute;top:100px;left:${i*48+12}px;width:12px;height:12px;border-radius:50%;background:${c};box-shadow:0 0 6px ${c};"></div>`
          }).join('')}
          <!-- glass window -->
          <div style="position:absolute;top:130px;left:20px;right:20px;bottom:200px;background:rgba(0,0,0,0.4);border:4px solid rgba(255,255,255,0.1);border-radius:12px;overflow:hidden;">
            <!-- crane arm -->
            <div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:8px;height:120px;background:linear-gradient(90deg,#aaa,#ddd,#aaa);"></div>
            <div style="position:absolute;top:120px;left:50%;transform:translateX(-50%);width:80px;height:6px;background:#aaa;"></div>
            <!-- claw -->
            <div style="position:absolute;top:126px;left:50%;transform:translateX(-50%);width:60px;height:40px;">
              <div style="position:absolute;left:0;width:4px;height:40px;background:#aaa;transform:rotate(15deg);"></div>
              <div style="position:absolute;right:0;width:4px;height:40px;background:#aaa;transform:rotate(-15deg);"></div>
            </div>
          </div>
          <div style="position:absolute;top:160px;left:0;right:0;text-align:center;">
            <div style="font-family:${SERIF};font-size:${cs(90,city)}px;font-weight:bold;font-style:italic;color:white;text-shadow:0 4px 12px rgba(0,0,0,0.6);">${C}</div>
            ${PH('rgba(255,255,255,0.5)')}
            <div style="font-family:${FUTURA};font-size:42px;font-weight:bold;color:#FFD600;letter-spacing:4px;margin-top:4px;">FREE PHOTO SHOOT</div>
          </div>
          <!-- plush photos in pile -->
          <div style="position:absolute;bottom:240px;left:40px;width:400px;height:520px;border-radius:10px;overflow:hidden;transform:rotate(-3deg);box-shadow:0 8px 30px rgba(0,0,0,0.4);border:4px solid #FFD600;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="position:absolute;bottom:280px;right:40px;width:360px;height:460px;border-radius:10px;overflow:hidden;transform:rotate(4deg);box-shadow:0 8px 30px rgba(0,0,0,0.4);border:4px solid #FFD600;">
            <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <!-- prize chute -->
          <div style="position:absolute;bottom:20px;left:20px;right:20px;height:160px;background:#222;border-radius:12px;border:3px solid #444;display:flex;align-items:center;justify-content:center;gap:20px;">
            <div style="width:120px;height:120px;border-radius:8px;overflow:hidden;border:3px solid #FFD600;">
              <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
            <div style="font-family:${DISPLAY};font-size:32px;color:#FFD600;">PRIZE!</div>
          </div>
        </div>
        <div style="position:absolute;bottom:30px;left:0;right:0;text-align:center;font-family:${SANS};font-size:18px;color:rgba(255,214,0,0.35);">${CTA}</div>
      </div>`
    }

    // 19: SNOWFALL
    case 19: {
      const flakes = Array.from({length:60}, (_,i) => {
        const x = (i * 71) % 1060 + 10
        const y = (i * 43) % 1880 + 20
        const size = 3 + (i % 5) * 2
        const opacity = 0.2 + (i % 4) * 0.15
        return `<div style="position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;border-radius:50%;background:white;opacity:${opacity};box-shadow:0 0 ${size}px rgba(255,255,255,${opacity*0.5});"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#1a2a4a 0%,#2a3a5a 30%,#3a4a6a 70%,#F5F5F5 92%,#fff 100%);">
        ${flakes}
        <!-- frosted overlay at top -->
        <div style="position:absolute;top:0;left:0;right:0;height:200px;background:linear-gradient(180deg,rgba(255,255,255,0.1),transparent);"></div>
        <div style="position:absolute;top:80px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(120,city)}px;font-weight:bold;font-style:italic;color:white;text-shadow:0 2px 20px rgba(100,160,255,0.5);">${C}</div>
          ${PH('rgba(200,220,255,0.5)')}
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:white;letter-spacing:5px;margin-top:4px;text-shadow:0 2px 10px rgba(0,0,0,0.4);">FREE PHOTO SHOOT</div>
        </div>
        <!-- photo cards in snow scene -->
        <div style="position:absolute;top:400px;left:60px;width:460px;height:600px;border-radius:10px;overflow:hidden;transform:rotate(-2deg);box-shadow:0 12px 40px rgba(0,0,0,0.3);border:6px solid white;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:480px;right:60px;width:420px;height:540px;border-radius:10px;overflow:hidden;transform:rotate(3deg);box-shadow:0 12px 40px rgba(0,0,0,0.3);border:6px solid white;">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;bottom:380px;left:50%;transform:translateX(-50%);width:480px;height:360px;border-radius:10px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.3);border:6px solid white;">
          <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <!-- snow mound at bottom -->
        <div style="position:absolute;bottom:0;left:0;right:0;height:200px;background:white;border-radius:50% 50% 0 0 / 100px 100px 0 0;"></div>
        <div style="position:absolute;bottom:50px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(0,0,0,0.35);">${CTA}</div>
      </div>`
    }

    // 20: NEON DINER
    case 20: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#0a0a1a,#1a0a2a);">
        <!-- checkerboard floor at bottom -->
        <div style="position:absolute;bottom:0;left:0;right:0;height:300px;background:repeating-conic-gradient(#222 0% 25%,#111 0% 50%) 0 0/80px 80px;transform:perspective(400px) rotateX(45deg);transform-origin:bottom;"></div>
        <!-- neon sign frame -->
        <div style="position:absolute;top:60px;left:80px;right:80px;height:260px;border:4px solid rgba(255,0,100,0.6);border-radius:16px;box-shadow:0 0 30px rgba(255,0,100,0.3),inset 0 0 30px rgba(255,0,100,0.1);display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <div style="font-family:${DISPLAY};font-size:${cs(100,city)}px;color:#FF1493;text-shadow:0 0 20px rgba(255,20,147,0.8),0 0 60px rgba(255,20,147,0.3);">${C}</div>
          ${PH('rgba(255,20,147,0.4)')}
          <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:#00FFFF;text-shadow:0 0 15px rgba(0,255,255,0.6);letter-spacing:4px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- neon "OPEN" sign -->
        <div style="position:absolute;top:350px;right:100px;font-family:${SERIF};font-size:40px;font-style:italic;color:#00FF88;text-shadow:0 0 12px rgba(0,255,136,0.6);transform:rotate(-8deg);">OPEN</div>
        <!-- diner counter with photos as menu items -->
        <div style="position:absolute;top:420px;left:60px;right:60px;height:60px;background:linear-gradient(180deg,#D32F2F,#B71C1C);border-radius:8px 8px 0 0;box-shadow:0 4px 12px rgba(0,0,0,0.3);"></div>
        <div style="position:absolute;top:480px;left:60px;right:60px;display:flex;gap:20px;">
          ${[p,p2,p3].map(ph => `<div style="flex:1;height:500px;border-radius:0 0 10px 10px;overflow:hidden;border:3px solid #333;box-shadow:0 8px 24px rgba(0,0,0,0.4);">
            <img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>`).join('')}
        </div>
        <!-- chrome stools -->
        ${Array.from({length:4}, (_,i) => `
          <div style="position:absolute;bottom:300px;left:${120+i*260}px;">
            <div style="width:70px;height:30px;background:linear-gradient(180deg,#E53935,#C62828);border-radius:35px 35px 0 0;"></div>
            <div style="width:8px;height:80px;background:linear-gradient(90deg,#aaa,#ddd,#aaa);margin:0 auto;"></div>
            <div style="width:50px;height:8px;background:#888;border-radius:4px;margin:0 auto;"></div>
          </div>
        `).join('')}
        <!-- jukebox mini in corner -->
        <div style="position:absolute;top:1040px;right:80px;width:120px;height:160px;background:linear-gradient(180deg,#D4AF37,#8B6914);border-radius:60px 60px 10px 10px;border:3px solid #FFD600;box-shadow:0 0 20px rgba(255,214,0,0.2);"></div>
        <div style="position:absolute;bottom:240px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,20,147,0.35);">${CTA}</div>
      </div>`
    }

    // 21: SUBWAY MAP
    case 21: {
      const stations = ['START','BOOK','SHOW UP','SHOOT','EDIT','DELIVER','ENJOY','FREE']
      const stationDots = stations.map((s,i) => {
        const y = 420 + i * 160
        const isRight = i % 2 === 0
        return `
          <div style="position:absolute;top:${y}px;left:490px;width:30px;height:30px;border-radius:50%;background:white;border:5px solid #E53935;z-index:2;"></div>
          <div style="position:absolute;top:${y+2}px;${isRight?'left:540px':'right:560px'};font-family:${SANS};font-size:22px;font-weight:bold;color:white;letter-spacing:2px;">${s}</div>
        `
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F5F5F5;">
        <!-- map background grid -->
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(0,0,0,0.03) 0px,transparent 1px,transparent 60px),repeating-linear-gradient(180deg,rgba(0,0,0,0.03) 0px,transparent 1px,transparent 60px);"></div>
        <!-- header bar -->
        <div style="position:absolute;top:0;left:0;right:0;height:180px;background:#E53935;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.2);">
          <div style="font-family:${FUTURA};font-size:${cs(80,city)}px;font-weight:bold;color:white;letter-spacing:6px;">${C}</div>
          ${PH('rgba(255,255,255,0.6)')}
        </div>
        <!-- line color label -->
        <div style="position:absolute;top:200px;left:60px;display:flex;align-items:center;gap:12px;">
          <div style="width:30px;height:30px;border-radius:50%;background:#E53935;"></div>
          <div style="font-family:${SANS};font-size:22px;font-weight:bold;color:#333;">FREE PHOTO SHOOT LINE</div>
        </div>
        <!-- main line -->
        <div style="position:absolute;top:420px;left:502px;width:8px;height:1260px;background:#E53935;z-index:1;"></div>
        ${stationDots}
        <!-- photo at certain stations -->
        <div style="position:absolute;top:360px;left:60px;width:380px;height:300px;border-radius:8px;overflow:hidden;border:3px solid #E53935;box-shadow:0 4px 16px rgba(0,0,0,0.15);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:820px;right:60px;width:380px;height:300px;border-radius:8px;overflow:hidden;border:3px solid #E53935;box-shadow:0 4px 16px rgba(0,0,0,0.15);">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:1200px;left:60px;width:380px;height:300px;border-radius:8px;overflow:hidden;border:3px solid #E53935;box-shadow:0 4px 16px rgba(0,0,0,0.15);">
          <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <!-- legend -->
        <div style="position:absolute;bottom:100px;left:60px;right:60px;padding:16px;background:white;border:2px solid #ddd;border-radius:8px;">
          <div style="font-family:${SANS};font-size:18px;color:#666;">${CTA}</div>
        </div>
      </div>`
    }

    // 22: TRAIN DEPARTURE BOARD
    case 22: {
      const rows = [
        {time:'09:15',dest:city,platform:'1',status:'FREE'},
        {time:'10:30',dest:'Photo Session',platform:'2',status:'BOOK'},
        {time:'11:45',dest:'Your Best Look',platform:'3',status:'NOW'},
        {time:'13:00',dest:'Portfolio Day',platform:'4',status:'FREE'},
        {time:'14:15',dest:'Golden Hour',platform:'5',status:'GO'},
      ]
      const boardRows = rows.map((r,i) => `
        <div style="display:flex;gap:4px;margin-bottom:6px;">
          <div style="width:140px;height:56px;background:#111;border-radius:4px;display:flex;align-items:center;justify-content:center;font-family:${MONO};font-size:28px;color:#FFD600;">${r.time}</div>
          <div style="flex:1;height:56px;background:#111;border-radius:4px;display:flex;align-items:center;padding-left:16px;font-family:${MONO};font-size:24px;color:#FFD600;letter-spacing:1px;">${r.dest.toUpperCase()}</div>
          <div style="width:80px;height:56px;background:#111;border-radius:4px;display:flex;align-items:center;justify-content:center;font-family:${MONO};font-size:28px;color:#FFD600;">${r.platform}</div>
          <div style="width:120px;height:56px;background:#111;border-radius:4px;display:flex;align-items:center;justify-content:center;font-family:${MONO};font-size:22px;color:${r.status==='FREE'?'#00FF88':'#FFD600'};font-weight:bold;">${r.status}</div>
        </div>
      `).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a1a2e;">
        <!-- station header -->
        <div style="position:absolute;top:0;left:0;right:0;height:160px;background:#0D47A1;display:flex;align-items:center;padding:0 60px;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
          <div style="flex:1;">
            <div style="font-family:${FUTURA};font-size:20px;color:rgba(255,255,255,0.6);letter-spacing:4px;">DEPARTURES</div>
            <div style="font-family:${FUTURA};font-size:${cs(70,city)}px;font-weight:bold;color:white;">${C}</div>
          </div>
          <div style="font-family:${MONO};font-size:48px;color:#FFD600;">15:24</div>
        </div>
        ${PH('rgba(255,255,255,0.4)')}
        <!-- column headers -->
        <div style="position:absolute;top:180px;left:60px;right:60px;display:flex;gap:4px;margin-bottom:8px;">
          <div style="width:140px;font-family:${SANS};font-size:16px;color:rgba(255,255,255,0.4);letter-spacing:2px;">TIME</div>
          <div style="flex:1;font-family:${SANS};font-size:16px;color:rgba(255,255,255,0.4);letter-spacing:2px;">DESTINATION</div>
          <div style="width:80px;font-family:${SANS};font-size:16px;color:rgba(255,255,255,0.4);letter-spacing:2px;">PLAT</div>
          <div style="width:120px;font-family:${SANS};font-size:16px;color:rgba(255,255,255,0.4);letter-spacing:2px;">STATUS</div>
        </div>
        <!-- board -->
        <div style="position:absolute;top:220px;left:60px;right:60px;">${boardRows}</div>
        <!-- FREE PHOTO SHOOT -->
        <div style="position:absolute;top:580px;left:60px;right:60px;height:70px;background:#FF6F00;border-radius:8px;display:flex;align-items:center;justify-content:center;">
          <div style="font-family:${FUTURA};font-size:40px;font-weight:bold;color:white;letter-spacing:6px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- photos below board -->
        <div style="position:absolute;top:700px;left:60px;right:60px;display:flex;gap:16px;">
          ${[p,p2,p3].map(ph => `<div style="flex:1;height:500px;border-radius:8px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.4);">
            <img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>`).join('')}
        </div>
        <div style="position:absolute;bottom:200px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,214,0,0.35);">${CTA}</div>
      </div>`
    }

    // 23: ROLLER COASTER PHOTO
    case 23: {
      const trackBars = Array.from({length:20}, (_,i) => {
        const x = i * 54
        return `<div style="position:absolute;left:${x}px;top:0;width:6px;height:100%;background:rgba(255,255,255,0.15);transform:skewX(-5deg);"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#0D47A1,#1565C0,#42A5F5);">
        <!-- track rails -->
        <div style="position:absolute;top:0;left:0;right:0;height:100px;overflow:hidden;">${trackBars}</div>
        <!-- speed lines -->
        ${Array.from({length:15}, (_,i) => `<div style="position:absolute;top:${100+i*50}px;left:${-100+(i*80)%400}px;width:${200+i*30}px;height:3px;background:rgba(255,255,255,${0.05+i*0.02});transform:rotate(-3deg);"></div>`).join('')}
        <div style="position:absolute;top:80px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:${cs(120,city)}px;color:white;text-shadow:0 4px 16px rgba(0,0,0,0.5);letter-spacing:4px;">${C}</div>
          ${PH('rgba(255,255,255,0.5)')}
          <div style="font-family:${FUTURA};font-size:50px;font-weight:bold;color:#FFD600;letter-spacing:5px;margin-top:6px;text-shadow:0 2px 8px rgba(0,0,0,0.4);">FREE PHOTO SHOOT</div>
        </div>
        <!-- "Your photo from the ride" frame -->
        <div style="position:absolute;top:380px;left:80px;right:80px;background:white;border-radius:12px;padding:16px;box-shadow:0 20px 60px rgba(0,0,0,0.4);">
          <div style="width:100%;height:700px;overflow:hidden;border-radius:8px;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="display:flex;gap:12px;margin-top:12px;">
            <div style="flex:1;height:220px;overflow:hidden;border-radius:6px;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
            <div style="flex:1;height:220px;overflow:hidden;border-radius:6px;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
          </div>
          <div style="text-align:center;padding:12px 0 4px;">
            <div style="font-family:${SANS};font-size:20px;color:#666;letter-spacing:2px;">YOUR RIDE PHOTO — ${C}</div>
          </div>
        </div>
        <div style="position:absolute;bottom:200px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,255,255,0.4);">${CTA}</div>
      </div>`
    }

    // 24: HAUNTED HOUSE
    case 24: {
      const cobwebs = `
        <div style="position:absolute;top:0;left:0;width:200px;height:200px;border-right:1px solid rgba(255,255,255,0.08);border-bottom:1px solid rgba(255,255,255,0.08);border-radius:0 0 100% 0;"></div>
        <div style="position:absolute;top:0;right:0;width:200px;height:200px;border-left:1px solid rgba(255,255,255,0.08);border-bottom:1px solid rgba(255,255,255,0.08);border-radius:0 0 0 100%;"></div>
      `
      const bats = Array.from({length:6}, (_,i) => {
        const x = 80 + (i * 180) % 900
        const y = 50 + (i * 70) % 200
        return `<div style="position:absolute;left:${x}px;top:${y}px;font-size:28px;color:rgba(255,255,255,0.15);transform:rotate(${-15+i*8}deg);">&#x1F987;</div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#0a0a0a,#1a0a1a,#0a0808);">
        ${cobwebs}
        ${bats}
        <!-- fog -->
        <div style="position:absolute;bottom:0;left:0;right:0;height:400px;background:linear-gradient(180deg,transparent,rgba(100,100,120,0.15));"></div>
        <!-- gothic arch doorway -->
        <div style="position:absolute;top:300px;left:140px;right:140px;bottom:100px;border:6px solid #333;border-radius:400px 400px 0 0;background:rgba(20,0,0,0.5);overflow:hidden;box-shadow:inset 0 0 60px rgba(0,0,0,0.5);">
          <!-- blood red glow from inside -->
          <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 30%,rgba(150,0,0,0.15),transparent 60%);"></div>
          <!-- photos as haunted portraits -->
          <div style="position:absolute;top:40px;left:30px;width:340px;height:440px;border:8px solid #3a2a1a;box-shadow:0 8px 24px rgba(0,0,0,0.5);overflow:hidden;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:contrast(1.1) saturate(0.8);"/>
          </div>
          <div style="position:absolute;top:80px;right:30px;width:300px;height:400px;border:8px solid #3a2a1a;box-shadow:0 8px 24px rgba(0,0,0,0.5);overflow:hidden;">
            <img src="${p2}" style="width:100%;height:100%;object-fit:cover;filter:contrast(1.1) saturate(0.8);"/>
          </div>
          <div style="position:absolute;bottom:40px;left:50%;transform:translateX(-50%);width:400px;height:400px;border:8px solid #3a2a1a;box-shadow:0 8px 24px rgba(0,0,0,0.5);overflow:hidden;">
            <img src="${p3}" style="width:100%;height:100%;object-fit:cover;filter:contrast(1.1) saturate(0.8);"/>
          </div>
        </div>
        <!-- candle glow lights -->
        ${Array.from({length:4}, (_,i) => `
          <div style="position:absolute;top:${280}px;left:${60+i*280}px;width:20px;height:40px;background:linear-gradient(180deg,#FFD600,#FF6F00);border-radius:50% 50% 0 0;box-shadow:0 0 20px rgba(255,150,0,0.4);"></div>
        `).join('')}
        <div style="position:absolute;top:80px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(110,city)}px;font-weight:bold;font-style:italic;color:#8B0000;text-shadow:0 0 20px rgba(139,0,0,0.5);">${C}</div>
          ${PH('rgba(139,0,0,0.4)')}
          <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:#ccc;letter-spacing:5px;margin-top:4px;text-shadow:0 2px 10px rgba(0,0,0,0.6);">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;bottom:40px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(139,0,0,0.35);">${CTA}</div>
      </div>`
    }

    // 25: PLANETARIUM
    case 25: {
      const stars = Array.from({length:80}, (_,i) => {
        const x = (i * 67) % 1060 + 10
        const y = (i * 43) % 1880 + 20
        const size = 1 + (i % 4)
        return `<div style="position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;border-radius:50%;background:white;opacity:${0.2+(i%5)*0.12};"></div>`
      }).join('')
      const orbits = Array.from({length:4}, (_,i) => {
        const size = 300 + i * 180
        return `<div style="position:absolute;top:50%;left:50%;width:${size}px;height:${size}px;border:1px solid rgba(255,255,255,0.05);border-radius:50%;transform:translate(-50%,-50%) rotate(${i*15}deg);"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:radial-gradient(ellipse at 50% 45%,#0a0a2a,#000);">
        ${stars}
        ${orbits}
        <!-- dome edge -->
        <div style="position:absolute;bottom:-400px;left:-200px;right:-200px;height:1000px;border:2px solid rgba(255,255,255,0.04);border-radius:50%;"></div>
        <div style="position:absolute;top:80px;left:0;right:0;text-align:center;">
          <div style="font-family:${FUTURA};font-size:20px;color:rgba(100,150,255,0.5);letter-spacing:8px;">PLANETARIUM PRESENTS</div>
          <div style="font-family:${SERIF};font-size:${cs(120,city)}px;font-weight:bold;font-style:italic;color:white;text-shadow:0 0 30px rgba(100,150,255,0.4);">${C}</div>
          ${PH('rgba(100,150,255,0.5)')}
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:#7C4DFF;letter-spacing:5px;margin-top:6px;text-shadow:0 0 15px rgba(124,77,255,0.4);">FREE PHOTO SHOOT</div>
        </div>
        <!-- constellation photo arrangement -->
        <div style="position:absolute;top:440px;left:120px;width:360px;height:460px;border-radius:50%;overflow:hidden;border:2px solid rgba(100,150,255,0.2);box-shadow:0 0 40px rgba(100,150,255,0.1);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:520px;right:100px;width:320px;height:380px;border-radius:50%;overflow:hidden;border:2px solid rgba(100,150,255,0.2);box-shadow:0 0 40px rgba(100,150,255,0.1);">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;bottom:340px;left:50%;transform:translateX(-50%);width:400px;height:340px;border-radius:50%;overflow:hidden;border:2px solid rgba(100,150,255,0.2);box-shadow:0 0 40px rgba(100,150,255,0.1);">
          <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <!-- constellation lines connecting photos -->
        <div style="position:absolute;top:700px;left:480px;width:120px;height:2px;background:rgba(100,150,255,0.15);transform:rotate(10deg);"></div>
        <div style="position:absolute;top:880px;left:400px;width:200px;height:2px;background:rgba(100,150,255,0.15);transform:rotate(-30deg);"></div>
        <div style="position:absolute;bottom:240px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(124,77,255,0.35);">${CTA}</div>
      </div>`
    }

    // 26: DRIVE-THRU MENU
    case 26: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a0a00;">
        <!-- menu board backlight -->
        <div style="position:absolute;top:30px;left:40px;right:40px;bottom:30px;background:linear-gradient(180deg,#111,#1a1a1a);border:6px solid #444;border-radius:16px;box-shadow:0 0 30px rgba(255,200,50,0.1),inset 0 0 40px rgba(0,0,0,0.5);">
          <!-- brand header strip -->
          <div style="position:absolute;top:0;left:0;right:0;height:120px;background:linear-gradient(180deg,#FF6F00,#E65100);border-radius:10px 10px 0 0;display:flex;align-items:center;justify-content:center;">
            <div style="font-family:${DISPLAY};font-size:${cs(70,city)}px;color:white;letter-spacing:6px;">${C}</div>
          </div>
          ${PH('rgba(255,255,255,0.6)')}
          <!-- MENU title -->
          <div style="position:absolute;top:140px;left:0;right:0;text-align:center;">
            <div style="font-family:${FUTURA};font-size:36px;font-weight:bold;color:#FFD600;letter-spacing:8px;">PHOTO MENU</div>
          </div>
          <!-- menu items with photos -->
          <div style="position:absolute;top:220px;left:30px;right:30px;">
            ${[{name:'THE CLASSIC',desc:'Portrait session',ph:p},{name:'THE DELUXE',desc:'Full portfolio',ph:p2},{name:'THE SPECIAL',desc:'Creative concept',ph:p3}].map((item,i) => `
              <div style="display:flex;gap:16px;margin-bottom:20px;padding:16px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid rgba(255,255,255,0.06);">
                <div style="width:260px;height:300px;border-radius:8px;overflow:hidden;flex-shrink:0;">
                  <img src="${item.ph}" style="width:100%;height:100%;object-fit:cover;"/>
                </div>
                <div style="flex:1;padding:8px 0;">
                  <div style="font-family:${FUTURA};font-size:32px;font-weight:bold;color:#FFD600;letter-spacing:2px;">#${i+1} ${item.name}</div>
                  <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.5);margin-top:8px;">${item.desc}</div>
                  <div style="font-family:${DISPLAY};font-size:44px;color:#00FF88;margin-top:16px;">FREE</div>
                </div>
              </div>
            `).join('')}
          </div>
          <!-- bottom banner -->
          <div style="position:absolute;bottom:40px;left:30px;right:30px;height:80px;background:#FF6F00;border-radius:8px;display:flex;align-items:center;justify-content:center;">
            <div style="font-family:${FUTURA};font-size:38px;font-weight:bold;color:white;letter-spacing:4px;">FREE PHOTO SHOOT</div>
          </div>
        </div>
        <!-- speaker box -->
        <div style="position:absolute;bottom:10px;right:60px;width:100px;height:80px;background:#333;border-radius:8px;border:2px solid #555;">
          <div style="width:60px;height:4px;background:#666;border-radius:2px;margin:12px auto;"></div>
          <div style="width:60px;height:4px;background:#666;border-radius:2px;margin:0 auto;"></div>
        </div>
      </div>`
    }

    // 27: RECORD STORE
    case 27: {
      const crates = Array.from({length:5}, (_,i) => {
        return `<div style="position:absolute;bottom:${100+i*20}px;left:${60+i*30}px;width:${900-i*60}px;height:16px;background:linear-gradient(180deg,#8D6E63,#6D4C41);border-radius:3px;"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#2a1a0a,#1a1008);">
        <!-- exposed brick wall -->
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(120,60,30,0.1) 0px,rgba(120,60,30,0.1) 30px,rgba(80,40,20,0.1) 30px,rgba(80,40,20,0.1) 32px);"></div>
        <!-- neon store sign -->
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:#FF4081;text-shadow:0 0 20px rgba(255,64,129,0.6),0 0 60px rgba(255,64,129,0.2);">${C}</div>
          ${PH('rgba(255,64,129,0.4)')}
          <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:#00E5FF;text-shadow:0 0 15px rgba(0,229,255,0.5);letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- vinyl records display -->
        <div style="position:absolute;top:340px;left:60px;right:60px;display:flex;gap:20px;">
          ${[p,p2,p3].map((ph,i) => `
            <div style="flex:1;position:relative;">
              <!-- album sleeve -->
              <div style="width:100%;height:300px;border-radius:4px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.4);">
                <img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/>
              </div>
              <!-- vinyl peeking out -->
              <div style="position:absolute;bottom:-30px;right:-10px;width:140px;height:140px;border-radius:50%;background:radial-gradient(circle at 50% 50%,#111 20%,#1a1a1a 21%,#1a1a1a 40%,#222 41%,#222 42%,#1a1a1a 43%,#1a1a1a 90%,#111 91%);border:1px solid #333;"></div>
            </div>
          `).join('')}
        </div>
        <!-- more browsing photos in row below -->
        <div style="position:absolute;top:720px;left:60px;right:60px;display:flex;gap:12px;">
          ${[p,p2,p3,p,p2].map(ph => `<div style="flex:1;height:240px;border-radius:4px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
            <img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>`).join('')}
        </div>
        <!-- divider bins -->
        <div style="position:absolute;top:1000px;left:60px;right:60px;">
          ${['NEW ARRIVALS','STAFF PICKS','FREE SHOOTS'].map((label,i) => `
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;padding:12px 20px;background:rgba(255,255,255,0.04);border-radius:6px;border-left:4px solid ${['#FF4081','#00E5FF','#FFD600'][i]};">
              <div style="font-family:${FUTURA};font-size:24px;font-weight:bold;color:${['#FF4081','#00E5FF','#FFD600'][i]};letter-spacing:2px;">${label}</div>
            </div>
          `).join('')}
        </div>
        ${crates}
        <div style="position:absolute;bottom:60px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,64,129,0.35);">${CTA}</div>
      </div>`
    }

    // 28: FLOWER SHOP
    case 28: {
      const petals = Array.from({length:15}, (_,i) => {
        const x = (i * 73) % 1020 + 30
        const y = (i * 130) % 1800 + 60
        const colors = ['rgba(255,182,193,0.2)','rgba(255,218,185,0.15)','rgba(230,190,255,0.15)','rgba(255,240,200,0.1)']
        const size = 15 + (i % 4) * 8
        return `<div style="position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size*1.3}px;border-radius:50% 50% 50% 0;background:${colors[i%4]};transform:rotate(${i*30}deg);"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#FFF8E1,#FFF3E0,#FCE4EC);">
        ${petals}
        <!-- shop awning -->
        <div style="position:absolute;top:0;left:0;right:0;height:100px;background:repeating-linear-gradient(90deg,#F48FB1 0px,#F48FB1 60px,#F8BBD0 60px,#F8BBD0 120px);box-shadow:0 4px 12px rgba(0,0,0,0.1);"></div>
        <div style="position:absolute;top:100px;left:0;right:0;height:20px;background:linear-gradient(180deg,rgba(0,0,0,0.1),transparent);"></div>
        <div style="position:absolute;top:130px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:#AD1457;">${C}</div>
          ${PH('rgba(173,20,87,0.4)')}
          <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:#880E4F;letter-spacing:4px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- bouquet arrangement of photos -->
        <div style="position:absolute;top:400px;left:50%;transform:translateX(-50%);">
          <div style="position:relative;width:900px;height:1000px;">
            <!-- wrapping paper cone -->
            <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:0;height:0;border-left:250px solid transparent;border-right:250px solid transparent;border-top:400px solid #F8BBD0;"></div>
            <!-- ribbon -->
            <div style="position:absolute;bottom:300px;left:50%;transform:translateX(-50%);width:200px;height:30px;background:#AD1457;border-radius:15px;"></div>
            <!-- photos as flowers -->
            <div style="position:absolute;top:0;left:80px;width:320px;height:440px;border-radius:12px;overflow:hidden;transform:rotate(-8deg);box-shadow:0 8px 24px rgba(0,0,0,0.15);border:4px solid white;">
              <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
            <div style="position:absolute;top:40px;right:80px;width:320px;height:440px;border-radius:12px;overflow:hidden;transform:rotate(6deg);box-shadow:0 8px 24px rgba(0,0,0,0.15);border:4px solid white;">
              <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
            <div style="position:absolute;top:160px;left:50%;transform:translateX(-50%);width:350px;height:440px;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.15);border:4px solid white;">
              <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
          </div>
        </div>
        <div style="position:absolute;bottom:120px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(173,20,87,0.4);">${CTA}</div>
      </div>`
    }

    // 29: CANDY STORE
    case 29: {
      const candyStripes = `<div style="position:absolute;inset:0;background:repeating-linear-gradient(45deg,transparent 0px,transparent 30px,rgba(255,255,255,0.03) 30px,rgba(255,255,255,0.03) 60px);pointer-events:none;"></div>`
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#FF8A80,#FF80AB,#EA80FC);">
        ${candyStripes}
        <!-- candy dots border -->
        ${Array.from({length:40}, (_,i) => {
          const colors = ['#FFD600','#00E5FF','#FF1744','#76FF03','#FF6D00']
          const c = colors[i%5]
          const isTop = i < 20
          const pos = isTop ? `top:20px;left:${i*54+10}px` : `bottom:20px;left:${(i-20)*54+10}px`
          return `<div style="position:absolute;${pos};width:28px;height:28px;border-radius:50%;background:${c};box-shadow:0 2px 6px rgba(0,0,0,0.15);"></div>`
        }).join('')}
        <!-- lollipop sticks decorative -->
        <div style="position:absolute;top:300px;left:40px;width:16px;height:200px;background:#8D6E63;border-radius:8px;"></div>
        <div style="position:absolute;top:260px;left:24px;width:48px;height:48px;border-radius:50%;background:radial-gradient(circle,#FF1744,#D50000);"></div>
        <div style="position:absolute;top:340px;right:40px;width:16px;height:200px;background:#8D6E63;border-radius:8px;"></div>
        <div style="position:absolute;top:300px;right:24px;width:48px;height:48px;border-radius:50%;background:radial-gradient(circle,#00E5FF,#0097A7);"></div>
        <div style="position:absolute;top:80px;left:0;right:0;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:${cs(110,city)}px;color:white;text-shadow:0 4px 12px rgba(0,0,0,0.2);">${C}</div>
          ${PH('rgba(255,255,255,0.6)')}
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:white;letter-spacing:5px;margin-top:4px;text-shadow:0 2px 8px rgba(0,0,0,0.2);">FREE PHOTO SHOOT</div>
        </div>
        <!-- jar-shaped photo containers -->
        <div style="position:absolute;top:420px;left:60px;right:60px;display:flex;gap:24px;">
          ${[p,p2,p3].map(ph => `
            <div style="flex:1;position:relative;">
              <div style="width:70%;height:30px;background:rgba(255,255,255,0.5);border-radius:15px 15px 0 0;margin:0 auto;"></div>
              <div style="width:100%;height:440px;background:rgba(255,255,255,0.3);border-radius:0 0 20px 20px;overflow:hidden;border:3px solid rgba(255,255,255,0.4);box-shadow:0 6px 20px rgba(0,0,0,0.15);">
                <img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/>
              </div>
            </div>
          `).join('')}
        </div>
        <!-- gummy bear shapes -->
        ${Array.from({length:6}, (_,i) => {
          const colors2 = ['#FF1744','#FFD600','#76FF03','#FF6D00','#00E5FF','#E040FB']
          const x = 80 + (i * 180) % 900
          return `<div style="position:absolute;bottom:${180+(i%2)*40}px;left:${x}px;width:40px;height:50px;background:${colors2[i]};border-radius:40% 40% 45% 45%;opacity:0.5;"></div>`
        }).join('')}
        <div style="position:absolute;bottom:100px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,255,255,0.5);">${CTA}</div>
      </div>`
    }

    // 30: BARBERSHOP POLE
    case 30: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a1a1a;">
        <!-- tile floor -->
        <div style="position:absolute;bottom:0;left:0;right:0;height:300px;background:repeating-conic-gradient(#222 0% 25%,#2a2a2a 0% 50%) 0 0/60px 60px;"></div>
        <!-- barbershop poles on sides -->
        ${[60, 960].map(x => `
          <div style="position:absolute;top:100px;left:${x}px;width:60px;height:1600px;">
            <div style="width:100%;height:30px;background:linear-gradient(180deg,#D4AF37,#8B6914);border-radius:30px 30px 0 0;"></div>
            <div style="width:100%;height:1540px;background:repeating-linear-gradient(135deg,#E53935 0px,#E53935 20px,white 20px,white 40px,#1565C0 40px,#1565C0 60px,white 60px,white 80px);border:3px solid #D4AF37;overflow:hidden;"></div>
            <div style="width:100%;height:30px;background:linear-gradient(180deg,#8B6914,#D4AF37);border-radius:0 0 30px 30px;"></div>
          </div>
        `).join('')}
        <!-- mirror frame -->
        <div style="position:absolute;top:100px;left:160px;right:160px;bottom:340px;border:12px solid #D4AF37;border-radius:16px;background:#111;box-shadow:0 0 30px rgba(212,175,55,0.15),inset 0 0 40px rgba(0,0,0,0.3);overflow:hidden;">
          <!-- mirror shine -->
          <div style="position:absolute;top:0;left:0;width:200px;height:100%;background:linear-gradient(90deg,rgba(255,255,255,0.04),transparent);"></div>
          <div style="position:absolute;top:30px;left:30px;right:30px;text-align:center;">
            <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:#D4AF37;text-shadow:0 2px 12px rgba(212,175,55,0.4);">${C}</div>
            ${PH('rgba(212,175,55,0.4)')}
            <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:white;letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
          </div>
          <!-- photos in mirror -->
          <div style="position:absolute;top:260px;left:20px;right:20px;display:flex;gap:14px;">
            <div style="flex:2;height:500px;border-radius:8px;overflow:hidden;border:3px solid rgba(212,175,55,0.3);box-shadow:0 6px 20px rgba(0,0,0,0.4);">
              <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
            <div style="flex:1;display:flex;flex-direction:column;gap:14px;">
              <div style="flex:1;border-radius:8px;overflow:hidden;border:3px solid rgba(212,175,55,0.3);box-shadow:0 6px 20px rgba(0,0,0,0.4);">
                <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
              </div>
              <div style="flex:1;border-radius:8px;overflow:hidden;border:3px solid rgba(212,175,55,0.3);box-shadow:0 6px 20px rgba(0,0,0,0.4);">
                <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
              </div>
            </div>
          </div>
          <!-- shelf with products -->
          <div style="position:absolute;bottom:30px;left:20px;right:20px;height:8px;background:linear-gradient(180deg,#D4AF37,#8B6914);border-radius:4px;"></div>
          ${Array.from({length:6}, (_,i) => `<div style="position:absolute;bottom:38px;left:${40+i*105}px;width:40px;height:60px;background:linear-gradient(180deg,${['#4CAF50','#2196F3','#FF9800','#E91E63','#9C27B0','#00BCD4'][i]},${['#388E3C','#1565C0','#E65100','#C2185B','#6A1B9A','#00838F'][i]});border-radius:4px 4px 8px 8px;"></div>`).join('')}
        </div>
        <div style="position:absolute;bottom:260px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(212,175,55,0.35);">${CTA}</div>
      </div>`
    }

    // 31: LAUNDROMAT
    case 31: {
      const machines = Array.from({length:6}, (_,i) => {
        const col = i % 3
        const row = Math.floor(i / 3)
        const x = 60 + col * 330
        const y = 500 + row * 480
        const ph = [p,p2,p3,p,p2,p3][i]
        return `
          <div style="position:absolute;left:${x}px;top:${y}px;width:300px;height:440px;background:linear-gradient(180deg,#E0E0E0,#BDBDBD);border-radius:12px;border:3px solid #999;box-shadow:0 6px 20px rgba(0,0,0,0.2);">
            <!-- control panel -->
            <div style="height:80px;padding:10px 16px;display:flex;align-items:center;gap:8px;">
              <div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#4CAF50,#388E3C);border:2px solid #666;"></div>
              <div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#FF9800,#E65100);border:2px solid #666;"></div>
              <div style="flex:1;height:20px;background:#333;border-radius:4px;margin-left:8px;">
                <div style="width:60%;height:100%;background:#00E676;border-radius:4px;"></div>
              </div>
            </div>
            <!-- drum window with photo -->
            <div style="margin:0 16px;width:268px;height:268px;border-radius:50%;border:6px solid #777;overflow:hidden;box-shadow:inset 0 4px 12px rgba(0,0,0,0.3);background:#333;">
              <img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/>
              <!-- glass reflection -->
              <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,0.1),transparent 50%);"></div>
            </div>
            <!-- bottom panel -->
            <div style="height:60px;display:flex;align-items:center;justify-content:center;">
              <div style="font-family:${MONO};font-size:16px;color:#555;">FREE</div>
            </div>
          </div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#F5F5F5,#E8E8E8);">
        <!-- fluorescent light bars -->
        <div style="position:absolute;top:0;left:100px;right:100px;height:20px;background:white;box-shadow:0 0 40px rgba(255,255,255,0.5);"></div>
        <div style="position:absolute;top:80px;left:0;right:0;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:${cs(100,city)}px;color:#333;">${C}</div>
          ${PH('rgba(0,0,0,0.3)')}
          <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:#1565C0;letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- sign on wall -->
        <div style="position:absolute;top:340px;left:60px;right:60px;padding:16px;background:white;border:2px solid #ddd;border-radius:8px;text-align:center;">
          <div style="font-family:${SANS};font-size:22px;color:#666;">WASH YOUR WORRIES AWAY — PORTRAITS ARE FREE</div>
        </div>
        ${machines}
        <div style="position:absolute;bottom:80px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(0,0,0,0.3);">${CTA}</div>
      </div>`
    }

    // 32: BOOKSHELF
    case 32: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#3E2723;">
        <!-- wood grain texture -->
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(0,0,0,0.05) 0px,transparent 2px,transparent 20px);"></div>
        <!-- shelves with books and photo frames -->
        ${Array.from({length:4}, (_,shelfIdx) => {
          const y = 80 + shelfIdx * 450
          const books = Array.from({length:8}, (_2,bi) => {
            const w = 30 + (bi % 4) * 15
            const h = 280 + (bi % 3) * 40
            const colors = ['#C62828','#1565C0','#2E7D32','#FF6F00','#4A148C','#00838F','#D84315','#283593']
            return `<div style="width:${w}px;height:${h}px;background:${colors[bi]};border-radius:2px;box-shadow:1px 0 3px rgba(0,0,0,0.3);flex-shrink:0;"></div>`
          }).join('')
          const ph = [p,p2,p3,p][shelfIdx]
          return `
            <!-- shelf ${shelfIdx} -->
            <div style="position:absolute;top:${y}px;left:40px;right:40px;">
              <div style="display:flex;align-items:flex-end;gap:4px;height:340px;padding:0 20px;">
                ${books}
                <!-- photo frame on shelf -->
                <div style="width:200px;height:280px;flex-shrink:0;margin-left:16px;border:8px solid #D4AF37;box-shadow:0 4px 12px rgba(0,0,0,0.3);overflow:hidden;">
                  <img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/>
                </div>
              </div>
              <!-- shelf board -->
              <div style="width:100%;height:20px;background:linear-gradient(180deg,#6D4C41,#5D4037,#4E342E);border-radius:3px;box-shadow:0 6px 12px rgba(0,0,0,0.3);"></div>
            </div>
          `
        }).join('')}
        <!-- overlay text panel -->
        <div style="position:absolute;bottom:120px;left:60px;right:60px;background:rgba(0,0,0,0.7);border-radius:12px;padding:30px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(80,city)}px;font-weight:bold;font-style:italic;color:#D4AF37;">${C}</div>
          ${PH('rgba(212,175,55,0.4)')}
          <div style="font-family:${FUTURA};font-size:42px;font-weight:bold;color:white;letter-spacing:4px;margin-top:6px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:20px;color:rgba(255,255,255,0.4);margin-top:10px;">${CTA}</div>
        </div>
      </div>`
    }

    // 33: TYPEWRITER KEYS
    case 33: {
      const keys = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('').map((k,i) => {
        const row = i < 10 ? 0 : i < 19 ? 1 : 2
        const col = i < 10 ? i : i < 19 ? i - 10 : i - 19
        const offsets = [0, 25, 50]
        const x = 60 + col * 100 + offsets[row]
        const y = 1400 + row * 110
        return `<div style="position:absolute;left:${x}px;top:${y}px;width:80px;height:80px;border-radius:50%;background:linear-gradient(180deg,#333,#1a1a1a);border:3px solid #555;box-shadow:0 4px 8px rgba(0,0,0,0.4),inset 0 1px 2px rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;">
          <div style="font-family:${MONO};font-size:24px;font-weight:bold;color:#ccc;">${k}</div>
        </div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F5F0E0;">
        <!-- paper texture -->
        <div style="position:absolute;top:0;left:0;right:0;height:1350px;background:#FFFEF5;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
          <!-- typed text -->
          <div style="position:absolute;top:100px;left:120px;right:120px;">
            <div style="font-family:${MONO};font-size:${cs(72,city)}px;color:#333;line-height:1.1;">${C}</div>
            ${PH('#666', MONO)}
            <div style="font-family:${MONO};font-size:36px;color:#333;margin-top:20px;">FREE PHOTO SHOOT</div>
            <div style="font-family:${MONO};font-size:18px;color:#999;margin-top:16px;">${CTA}</div>
          </div>
          <!-- photos as typed/pasted images -->
          <div style="position:absolute;top:380px;left:80px;right:80px;">
            <div style="width:100%;height:480px;overflow:hidden;margin-bottom:16px;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
              <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
            <div style="display:flex;gap:16px;">
              <div style="flex:1;height:320px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
                <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
              </div>
              <div style="flex:1;height:320px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
                <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
              </div>
            </div>
          </div>
          <!-- cursor blink -->
          <div style="position:absolute;top:1260px;left:120px;width:20px;height:36px;background:#333;"></div>
        </div>
        <!-- typewriter body -->
        <div style="position:absolute;bottom:0;left:0;right:0;height:600px;background:linear-gradient(180deg,#2a2a2a,#1a1a1a);border-radius:20px 20px 0 0;">
          <!-- carriage rail -->
          <div style="position:absolute;top:20px;left:40px;right:40px;height:8px;background:linear-gradient(90deg,#555,#888,#555);border-radius:4px;"></div>
          ${keys}
        </div>
      </div>`
    }

    // 34: PIANO KEYS
    case 34: {
      const whiteKeys = Array.from({length:14}, (_,i) => {
        return `<div style="position:absolute;bottom:0;left:${i*77+1}px;width:75px;height:350px;background:linear-gradient(180deg,#f8f8f8,#e8e8e8,#ddd);border:1px solid #bbb;border-radius:0 0 6px 6px;box-shadow:0 4px 8px rgba(0,0,0,0.15);"></div>`
      }).join('')
      const blackKeyPositions = [1,2,4,5,6,8,9,11,12,13]
      const blackKeys = blackKeyPositions.map(i => {
        return `<div style="position:absolute;bottom:140px;left:${i*77-18}px;width:50px;height:220px;background:linear-gradient(180deg,#222,#111);border-radius:0 0 4px 4px;box-shadow:0 4px 8px rgba(0,0,0,0.3);z-index:2;"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#111;">
        <!-- grand piano lid shape -->
        <div style="position:absolute;top:0;left:0;right:0;height:1570px;background:linear-gradient(180deg,#1a1a1a,#0a0a0a);overflow:hidden;">
          <!-- glossy reflection -->
          <div style="position:absolute;top:0;left:0;width:400px;height:100%;background:linear-gradient(90deg,rgba(255,255,255,0.03),transparent);"></div>
          <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
            <div style="font-family:${SERIF};font-size:${cs(120,city)}px;font-weight:bold;font-style:italic;color:white;text-shadow:0 2px 16px rgba(255,255,255,0.1);">${C}</div>
            ${PH('rgba(255,255,255,0.3)')}
            <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:#D4AF37;letter-spacing:5px;margin-top:6px;">FREE PHOTO SHOOT</div>
          </div>
          <!-- photos arranged inside piano -->
          <div style="position:absolute;top:340px;left:60px;right:60px;display:flex;gap:16px;">
            <div style="flex:2;height:700px;border-radius:8px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.5);border:2px solid rgba(212,175,55,0.2);">
              <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
            <div style="flex:1;display:flex;flex-direction:column;gap:16px;">
              <div style="flex:1;border-radius:8px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.5);border:2px solid rgba(212,175,55,0.2);">
                <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
              </div>
              <div style="flex:1;border-radius:8px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.5);border:2px solid rgba(212,175,55,0.2);">
                <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
              </div>
            </div>
          </div>
          <div style="position:absolute;bottom:40px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(212,175,55,0.35);">${CTA}</div>
        </div>
        <!-- keyboard at bottom -->
        <div style="position:absolute;bottom:0;left:0;right:0;height:350px;background:#ddd;z-index:1;">
          ${whiteKeys}
          ${blackKeys}
        </div>
      </div>`
    }

    // 35: GUITAR AMP
    case 35: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#111;">
        <!-- amp cabinet -->
        <div style="position:absolute;top:40px;left:60px;right:60px;bottom:40px;background:linear-gradient(180deg,#1a1a1a,#111);border:6px solid #333;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,0.5);">
          <!-- tolex texture -->
          <div style="position:absolute;inset:6px;background:repeating-linear-gradient(45deg,rgba(255,255,255,0.02) 0px,transparent 1px,transparent 4px);border-radius:10px;"></div>
          <!-- top control panel -->
          <div style="position:absolute;top:20px;left:30px;right:30px;height:140px;background:#222;border-radius:8px;border:2px solid #444;display:flex;align-items:center;padding:0 30px;gap:24px;">
            <!-- knobs -->
            ${['VOL','GAIN','BASS','MID','TREB','PRES'].map((label,i) => `
              <div style="text-align:center;">
                <div style="width:50px;height:50px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#555,#222);border:3px solid #666;margin:0 auto;position:relative;">
                  <div style="position:absolute;top:5px;left:50%;width:3px;height:20px;background:#ccc;transform:translateX(-50%) rotate(${(i+1)*45}deg);transform-origin:bottom center;border-radius:2px;"></div>
                </div>
                <div style="font-family:${MONO};font-size:11px;color:#888;margin-top:4px;">${label}</div>
              </div>
            `).join('')}
            <!-- LED -->
            <div style="margin-left:auto;width:14px;height:14px;border-radius:50%;background:#FF1744;box-shadow:0 0 10px rgba(255,23,68,0.6);"></div>
          </div>
          <!-- brand logo -->
          <div style="position:absolute;top:180px;left:0;right:0;text-align:center;">
            <div style="font-family:${SERIF};font-size:48px;font-style:italic;color:#D4AF37;text-shadow:0 2px 8px rgba(212,175,55,0.3);">madebyaidan</div>
          </div>
          <!-- speaker grille with photos -->
          <div style="position:absolute;top:260px;left:30px;right:30px;bottom:60px;background:#0a0a0a;border-radius:12px;border:3px solid #333;overflow:hidden;">
            <!-- grille cloth pattern -->
            <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,0.03) 0px,transparent 1px,transparent 8px),repeating-linear-gradient(90deg,rgba(255,255,255,0.03) 0px,transparent 1px,transparent 8px);"></div>
            <!-- text over grille -->
            <div style="position:absolute;top:40px;left:0;right:0;text-align:center;">
              <div style="font-family:${DISPLAY};font-size:${cs(100,city)}px;color:white;text-shadow:0 4px 12px rgba(0,0,0,0.8);">${C}</div>
              ${PH('rgba(255,255,255,0.4)')}
              <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:#D4AF37;letter-spacing:5px;margin-top:6px;">FREE PHOTO SHOOT</div>
            </div>
            <!-- photos as speaker cones -->
            <div style="position:absolute;top:320px;left:30px;right:30px;display:flex;gap:20px;">
              ${[p,p2].map(ph => `<div style="flex:1;height:440px;border-radius:50%;overflow:hidden;border:6px solid #333;box-shadow:inset 0 0 30px rgba(0,0,0,0.5);">
                <img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/>
              </div>`).join('')}
            </div>
            <div style="position:absolute;bottom:40px;left:50%;transform:translateX(-50%);width:360px;height:360px;border-radius:50%;overflow:hidden;border:6px solid #333;box-shadow:inset 0 0 30px rgba(0,0,0,0.5);">
              <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
          </div>
        </div>
        <div style="position:absolute;bottom:60px;left:0;right:0;text-align:center;font-family:${SANS};font-size:18px;color:rgba(212,175,55,0.3);">${CTA}</div>
      </div>`
    }

    // 36: DJ TURNTABLE
    case 36: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#0a0a1a,#111);">
        <!-- DJ booth frame -->
        <div style="position:absolute;top:40px;left:40px;right:40px;bottom:40px;background:#1a1a1a;border-radius:16px;border:2px solid #333;box-shadow:0 10px 40px rgba(0,0,0,0.5);">
          <div style="position:absolute;top:30px;left:0;right:0;text-align:center;">
            <div style="font-family:${DISPLAY};font-size:${cs(90,city)}px;color:#00E5FF;text-shadow:0 0 20px rgba(0,229,255,0.5);">${C}</div>
            ${PH('rgba(0,229,255,0.4)', MONO)}
            <div style="font-family:${FUTURA};font-size:42px;font-weight:bold;color:white;letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
          </div>
          <!-- two turntables -->
          <div style="position:absolute;top:300px;left:30px;right:30px;display:flex;gap:30px;">
            ${[p,p2].map(ph => `
              <div style="flex:1;position:relative;">
                <!-- platter -->
                <div style="width:100%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 50% 50%,#111 15%,#222 16%,#222 18%,#1a1a1a 19%,#1a1a1a 85%,#333 86%,#333 88%,#222 89%);border:4px solid #444;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.4);">
                  <!-- vinyl grooves -->
                  <div style="position:absolute;inset:0;background:repeating-radial-gradient(circle,transparent 0px,transparent 8px,rgba(255,255,255,0.03) 8px,rgba(255,255,255,0.03) 10px);"></div>
                  <!-- label with photo -->
                  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:55%;height:55%;border-radius:50%;overflow:hidden;border:2px solid #444;">
                    <img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/>
                  </div>
                  <!-- spindle -->
                  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:20px;height:20px;border-radius:50%;background:#444;"></div>
                </div>
                <!-- tonearm -->
                <div style="position:absolute;top:10px;right:20px;width:6px;height:180px;background:#888;transform:rotate(15deg);transform-origin:top;border-radius:3px;"></div>
              </div>
            `).join('')}
          </div>
          <!-- mixer in center -->
          <div style="position:absolute;top:800px;left:50%;transform:translateX(-50%);width:300px;height:500px;background:#222;border-radius:8px;border:2px solid #444;">
            <!-- faders -->
            ${Array.from({length:4}, (_,i) => `
              <div style="position:absolute;top:${40+i*80}px;left:40px;right:40px;height:8px;background:#333;border-radius:4px;">
                <div style="position:absolute;top:-8px;left:${30+i*20}%;width:30px;height:24px;background:linear-gradient(180deg,#666,#444);border-radius:4px;border:1px solid #777;"></div>
              </div>
            `).join('')}
            <!-- crossfader -->
            <div style="position:absolute;bottom:40px;left:30px;right:30px;height:10px;background:#333;border-radius:5px;">
              <div style="position:absolute;top:-10px;left:45%;width:40px;height:30px;background:linear-gradient(180deg,#888,#555);border-radius:6px;border:2px solid #999;"></div>
            </div>
          </div>
          <!-- bottom photo strip -->
          <div style="position:absolute;bottom:40px;left:30px;right:30px;height:300px;border-radius:8px;overflow:hidden;border:2px solid #333;">
            <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <div style="position:absolute;bottom:60px;left:0;right:0;text-align:center;font-family:${SANS};font-size:18px;color:rgba(0,229,255,0.3);">${CTA}</div>
      </div>`
    }

    // 37: MICROPHONE STAGE
    case 37: {
      const spotlights = Array.from({length:5}, (_,i) => {
        const x = 100 + i * 220
        return `<div style="position:absolute;top:0;left:${x}px;width:200px;height:800px;background:linear-gradient(180deg,rgba(255,220,100,0.15),transparent);clip-path:polygon(40% 0%,60% 0%,100% 100%,0% 100%);"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#000,#0a0a1a);">
        ${spotlights}
        <!-- stage floor -->
        <div style="position:absolute;bottom:0;left:0;right:0;height:500px;background:linear-gradient(180deg,rgba(60,40,20,0.3),rgba(40,25,10,0.5));"></div>
        <div style="position:absolute;bottom:500px;left:0;right:0;height:8px;background:linear-gradient(90deg,transparent,rgba(255,200,100,0.3),transparent);"></div>
        <!-- microphone -->
        <div style="position:absolute;top:400px;left:50%;transform:translateX(-50%);">
          <div style="width:60px;height:80px;background:radial-gradient(circle at 50% 40%,#555,#222);border-radius:30px 30px 15px 15px;border:2px solid #666;margin:0 auto;"></div>
          <div style="width:8px;height:400px;background:linear-gradient(90deg,#444,#666,#444);margin:0 auto;"></div>
          <div style="width:120px;height:8px;background:#444;border-radius:4px;margin:0 auto;"></div>
        </div>
        <div style="position:absolute;top:80px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(120,city)}px;font-weight:bold;font-style:italic;color:white;text-shadow:0 4px 16px rgba(255,200,100,0.3);">${C}</div>
          ${PH('rgba(255,200,100,0.4)')}
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:#FFD600;letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- photos as posters on back wall -->
        <div style="position:absolute;top:380px;left:60px;width:340px;height:450px;border-radius:8px;overflow:hidden;transform:rotate(-3deg);box-shadow:0 10px 30px rgba(0,0,0,0.5);border:3px solid rgba(255,200,100,0.15);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:420px;right:60px;width:340px;height:450px;border-radius:8px;overflow:hidden;transform:rotate(2deg);box-shadow:0 10px 30px rgba(0,0,0,0.5);border:3px solid rgba(255,200,100,0.15);">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;bottom:160px;left:50%;transform:translateX(-50%);width:500px;height:380px;border-radius:8px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.5);border:3px solid rgba(255,200,100,0.15);">
          <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;bottom:100px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,200,100,0.3);">${CTA}</div>
      </div>`
    }

    // 38: DRUM KIT
    case 38: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#1a0a1a,#0a0a0a);">
        <!-- stage lights -->
        <div style="position:absolute;top:0;left:300px;width:480px;height:600px;background:radial-gradient(ellipse at 50% 0%,rgba(150,50,255,0.15),transparent);"></div>
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:${cs(110,city)}px;color:#E040FB;text-shadow:0 0 30px rgba(224,64,251,0.5);">${C}</div>
          ${PH('rgba(224,64,251,0.4)')}
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:white;letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- bass drum (large center circle with photo) -->
        <div style="position:absolute;top:400px;left:50%;transform:translateX(-50%);width:600px;height:600px;border-radius:50%;background:#222;border:12px solid #444;box-shadow:0 10px 40px rgba(0,0,0,0.5),inset 0 0 30px rgba(0,0,0,0.3);overflow:hidden;">
          <!-- drum head with photo -->
          <div style="position:absolute;inset:20px;border-radius:50%;overflow:hidden;border:4px solid #555;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <!-- tom drums -->
        <div style="position:absolute;top:340px;left:80px;width:250px;height:250px;border-radius:50%;background:#333;border:8px solid #555;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.4);">
          <div style="position:absolute;inset:10px;border-radius:50%;overflow:hidden;">
            <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <div style="position:absolute;top:340px;right:80px;width:250px;height:250px;border-radius:50%;background:#333;border:8px solid #555;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.4);">
          <div style="position:absolute;inset:10px;border-radius:50%;overflow:hidden;">
            <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <!-- cymbal stands -->
        ${Array.from({length:3}, (_,i) => {
          const x = [120, 540, 860][i]
          return `
            <div style="position:absolute;top:${1100+i*20}px;left:${x}px;width:6px;height:300px;background:linear-gradient(90deg,#888,#ccc,#888);"></div>
            <div style="position:absolute;top:${1080+i*20}px;left:${x-40}px;width:86px;height:16px;background:linear-gradient(180deg,#D4AF37,#8B6914);border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>
          `
        }).join('')}
        <!-- hi-hat -->
        <div style="position:absolute;top:1080px;left:60px;width:120px;height:12px;background:linear-gradient(180deg,#D4AF37,#8B6914);border-radius:50%;"></div>
        <div style="position:absolute;bottom:200px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(224,64,251,0.35);">${CTA}</div>
      </div>`
    }

    // 39: SAXOPHONE
    case 39: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(135deg,#0D1B2A,#1B2838,#0D1B2A);">
        <!-- warm jazz glow -->
        <div style="position:absolute;top:200px;left:100px;width:600px;height:600px;background:radial-gradient(ellipse,rgba(255,180,50,0.1),transparent);"></div>
        <!-- saxophone silhouette line art -->
        <div style="position:absolute;top:300px;right:40px;width:300px;height:1200px;">
          <!-- bell -->
          <div style="position:absolute;bottom:0;left:0;width:260px;height:300px;border:4px solid rgba(212,175,55,0.3);border-radius:0 0 130px 130px;border-top:none;"></div>
          <!-- body curve -->
          <div style="position:absolute;bottom:280px;left:60px;width:4px;height:600px;background:rgba(212,175,55,0.2);"></div>
          <!-- neck -->
          <div style="position:absolute;top:0;left:40px;width:4px;height:320px;background:rgba(212,175,55,0.2);transform:rotate(-15deg);"></div>
          <!-- keys -->
          ${Array.from({length:8}, (_,i) => `<div style="position:absolute;bottom:${320+i*60}px;left:${80+(i%2)*30}px;width:20px;height:20px;border-radius:50%;border:2px solid rgba(212,175,55,0.25);"></div>`).join('')}
        </div>
        <div style="position:absolute;top:60px;left:60px;right:360px;">
          <div style="font-family:${SERIF};font-size:${cs(110,city)}px;font-weight:bold;font-style:italic;color:#D4AF37;text-shadow:0 2px 16px rgba(212,175,55,0.3);">${C}</div>
          ${PH('rgba(212,175,55,0.4)')}
          <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:white;letter-spacing:4px;margin-top:6px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:20px;color:rgba(212,175,55,0.35);margin-top:12px;">${CTA}</div>
        </div>
        <!-- photos arranged as album covers -->
        <div style="position:absolute;top:420px;left:60px;width:580px;">
          <div style="width:100%;height:460px;border-radius:8px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.4);border:2px solid rgba(212,175,55,0.2);margin-bottom:16px;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="display:flex;gap:16px;">
            <div style="flex:1;height:320px;border-radius:8px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.4);border:2px solid rgba(212,175,55,0.2);">
              <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
            <div style="flex:1;height:320px;border-radius:8px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.4);border:2px solid rgba(212,175,55,0.2);">
              <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
          </div>
        </div>
        <!-- music notes floating -->
        ${Array.from({length:8}, (_,i) => `<div style="position:absolute;left:${60+(i*120)%600}px;top:${1400+(i*80)%300}px;font-size:${24+i*4}px;color:rgba(212,175,55,${0.1+i*0.03});">&#9835;</div>`).join('')}
      </div>`
    }

    // 40: CHESS BOARD
    case 40: {
      const squares = Array.from({length:64}, (_,i) => {
        const row = Math.floor(i / 8)
        const col = i % 8
        const isDark = (row + col) % 2 === 1
        return `<div style="position:absolute;left:${col*120+60}px;top:${row*120+500}px;width:120px;height:120px;background:${isDark?'#5D4037':'#EFEBE9'};"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a1a1a;">
        <!-- marble texture background -->
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 30%,#2a2a2a,#111);"></div>
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(120,city)}px;font-weight:bold;font-style:italic;color:white;text-shadow:0 2px 12px rgba(0,0,0,0.6);">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:#D4AF37;letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- board frame -->
        <div style="position:absolute;top:480px;left:40px;right:40px;height:980px;border:10px solid #3E2723;box-shadow:0 10px 30px rgba(0,0,0,0.5);background:#8D6E63;">
          ${squares}
          <!-- photos as chess pieces -->
          <div style="position:absolute;top:20px;left:180px;width:240px;height:320px;border-radius:8px;overflow:hidden;transform:rotate(-3deg);box-shadow:0 8px 24px rgba(0,0,0,0.5);z-index:2;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="position:absolute;top:60px;right:60px;width:240px;height:320px;border-radius:8px;overflow:hidden;transform:rotate(4deg);box-shadow:0 8px 24px rgba(0,0,0,0.5);z-index:2;">
            <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="position:absolute;bottom:100px;left:50%;transform:translateX(-50%);width:280px;height:340px;border-radius:8px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.5);z-index:2;">
            <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <div style="position:absolute;bottom:100px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(212,175,55,0.35);">${CTA}</div>
      </div>`
    }

    // 41: POKER TABLE
    case 41: {
      const chips = Array.from({length:12}, (_,i) => {
        const x = 60 + (i * 90) % 900
        const y = 1300 + (i * 40) % 200
        const colors = ['#E53935','#1E88E5','#2E7D32','#FFD600','#E040FB']
        const c = colors[i%5]
        return `<div style="position:absolute;left:${x}px;top:${y}px;width:50px;height:50px;border-radius:50%;background:${c};border:4px dashed rgba(255,255,255,0.4);box-shadow:0 3px 8px rgba(0,0,0,0.3);"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a1a0a;">
        <!-- felt table surface -->
        <div style="position:absolute;top:200px;left:40px;right:40px;bottom:200px;background:linear-gradient(180deg,#1B5E20,#2E7D32,#1B5E20);border-radius:500px/200px;border:12px solid #5D4037;box-shadow:inset 0 0 60px rgba(0,0,0,0.3),0 10px 40px rgba(0,0,0,0.5);">
          <!-- betting line -->
          <div style="position:absolute;inset:40px;border:3px solid rgba(255,255,255,0.15);border-radius:480px/180px;"></div>
        </div>
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:#D4AF37;text-shadow:0 2px 16px rgba(212,175,55,0.4);">${C}</div>
          ${PH('rgba(212,175,55,0.4)')}
          <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:white;letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- cards (photos) dealt on table -->
        <div style="position:absolute;top:400px;left:120px;width:300px;height:420px;background:white;border-radius:12px;padding:8px;transform:rotate(-8deg);box-shadow:0 10px 30px rgba(0,0,0,0.4);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;"/>
        </div>
        <div style="position:absolute;top:440px;left:400px;width:300px;height:420px;background:white;border-radius:12px;padding:8px;transform:rotate(2deg);box-shadow:0 10px 30px rgba(0,0,0,0.4);">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;"/>
        </div>
        <div style="position:absolute;top:480px;right:100px;width:300px;height:420px;background:white;border-radius:12px;padding:8px;transform:rotate(10deg);box-shadow:0 10px 30px rgba(0,0,0,0.4);">
          <img src="${p3}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;"/>
        </div>
        ${chips}
        <!-- dealer button -->
        <div style="position:absolute;top:940px;left:50%;transform:translateX(-50%);width:80px;height:80px;border-radius:50%;background:white;border:4px solid #D4AF37;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
          <div style="font-family:${FUTURA};font-size:16px;font-weight:bold;color:#333;">FREE</div>
        </div>
        <div style="position:absolute;bottom:120px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(212,175,55,0.35);">${CTA}</div>
      </div>`
    }

    // 42: DOMINO TILES
    case 42: {
      const dominoes = Array.from({length:8}, (_,i) => {
        const x = 60 + (i % 4) * 250
        const y = 1100 + Math.floor(i / 4) * 200
        const dots1 = Math.floor(Math.random()*6)+1
        const dots2 = Math.floor(Math.random()*6)+1
        return `<div style="position:absolute;left:${x}px;top:${y}px;width:100px;height:200px;background:white;border-radius:8px;border:2px solid #333;box-shadow:0 4px 8px rgba(0,0,0,0.2);transform:rotate(${-10+i*5}deg);">
          <div style="height:50%;border-bottom:2px solid #333;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:bold;color:#333;">${dots1}</div>
          <div style="height:50%;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:bold;color:#333;">${dots2}</div>
        </div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#1a3a1a,#0a1a0a);">
        <!-- felt surface -->
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(45deg,rgba(255,255,255,0.01) 0px,transparent 2px,transparent 10px);"></div>
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(110,city)}px;font-weight:bold;font-style:italic;color:white;text-shadow:0 2px 12px rgba(0,0,0,0.5);">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:#FFD600;letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- main photo domino tiles -->
        <div style="position:absolute;top:360px;left:60px;right:60px;display:flex;gap:20px;">
          ${[p,p2,p3].map((ph,i) => `
            <div style="flex:1;background:white;border-radius:12px;padding:8px;box-shadow:0 8px 24px rgba(0,0,0,0.4);transform:rotate(${-3+i*3}deg);">
              <div style="width:100%;height:320px;border-radius:8px;overflow:hidden;margin-bottom:6px;">
                <img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/>
              </div>
              <div style="width:100%;height:4px;background:#333;border-radius:2px;"></div>
              <div style="width:100%;height:320px;border-radius:8px;overflow:hidden;margin-top:6px;">
                <img src="${[p3,p,p2][i]}" style="width:100%;height:100%;object-fit:cover;"/>
              </div>
            </div>
          `).join('')}
        </div>
        ${dominoes}
        <div style="position:absolute;bottom:120px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,214,0,0.35);">${CTA}</div>
      </div>`
    }

    // 43: RUBIK'S CUBE
    case 43: {
      const faceColors = ['#E53935','#FF6F00','#FDD835','#43A047','#1E88E5','#F5F5F5']
      const cubeSquares = Array.from({length:9}, (_,i) => {
        const row = Math.floor(i / 3)
        const col = i % 3
        const x = col * 110
        const y = row * 110
        return `<div style="position:absolute;left:${x}px;top:${y}px;width:104px;height:104px;background:${faceColors[i%6]};border:3px solid #111;border-radius:4px;"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(135deg,#0a0a2a,#1a1a3a);">
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:${cs(100,city)}px;color:white;text-shadow:0 4px 12px rgba(0,0,0,0.5);">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:#FDD835;letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- cube front face with photos -->
        <div style="position:absolute;top:360px;left:210px;width:330px;height:330px;transform:perspective(800px) rotateY(-15deg) rotateX(10deg);background:#111;">
          ${cubeSquares}
          <!-- photo overlays on some squares -->
          <div style="position:absolute;top:0;left:0;width:104px;height:104px;overflow:hidden;border:3px solid #111;border-radius:4px;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="position:absolute;top:110px;left:110px;width:104px;height:104px;overflow:hidden;border:3px solid #111;border-radius:4px;">
            <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="position:absolute;top:220px;left:220px;width:104px;height:104px;overflow:hidden;border:3px solid #111;border-radius:4px;">
            <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <!-- right face (side) -->
        <div style="position:absolute;top:340px;left:540px;width:200px;height:330px;transform:perspective(800px) rotateY(30deg) skewY(-10deg);background:#ddd;overflow:hidden;">
          ${Array.from({length:9}, (_,i) => {
            const r2 = Math.floor(i/3)
            const c2 = i%3
            return `<div style="position:absolute;left:${c2*66}px;top:${r2*110}px;width:62px;height:104px;background:${faceColors[(i+2)%6]};border:2px solid #111;border-radius:3px;"></div>`
          }).join('')}
        </div>
        <!-- large photo cards below -->
        <div style="position:absolute;top:780px;left:60px;right:60px;display:flex;gap:16px;">
          ${[p,p2,p3].map((ph,i) => `<div style="flex:1;height:500px;border-radius:10px;overflow:hidden;border:4px solid ${faceColors[i]};box-shadow:0 8px 24px rgba(0,0,0,0.4);">
            <img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>`).join('')}
        </div>
        <!-- scattered mini cubes -->
        ${Array.from({length:6}, (_,i) => `<div style="position:absolute;left:${60+(i*180)%900}px;bottom:${120+(i%3)*50}px;width:30px;height:30px;background:${faceColors[i]};border:2px solid #111;border-radius:3px;transform:rotate(${i*15}deg);"></div>`).join('')}
        <div style="position:absolute;bottom:80px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(253,216,53,0.35);">${CTA}</div>
      </div>`
    }

    // 44: MAGIC 8-BALL
    case 44: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:radial-gradient(circle at 50% 50%,#1a1a2e,#000);">
        <!-- ambient glow -->
        <div style="position:absolute;top:300px;left:50%;transform:translateX(-50%);width:900px;height:900px;background:radial-gradient(circle,rgba(30,0,60,0.4),transparent);"></div>
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(110,city)}px;font-weight:bold;font-style:italic;color:white;text-shadow:0 2px 20px rgba(100,50,200,0.4);">${C}</div>
          ${PH('rgba(150,100,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:#7C4DFF;letter-spacing:5px;margin-top:4px;text-shadow:0 0 15px rgba(124,77,255,0.4);">FREE PHOTO SHOOT</div>
        </div>
        <!-- 8-ball sphere -->
        <div style="position:absolute;top:350px;left:50%;transform:translateX(-50%);width:700px;height:700px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#333,#111,#000);box-shadow:0 20px 60px rgba(0,0,0,0.5),inset 0 -20px 40px rgba(0,0,0,0.3);overflow:hidden;">
          <!-- 8 circle -->
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:300px;height:300px;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;">
            <div style="font-family:${SERIF};font-size:160px;font-weight:bold;color:#111;">8</div>
          </div>
          <!-- highlight -->
          <div style="position:absolute;top:60px;left:150px;width:200px;height:120px;background:rgba(255,255,255,0.08);border-radius:50%;transform:rotate(-20deg);"></div>
        </div>
        <!-- answer window (triangle with answer) -->
        <div style="position:absolute;top:1100px;left:50%;transform:translateX(-50%);width:400px;height:200px;background:#0D47A1;border-radius:16px;border:3px solid #1565C0;box-shadow:0 0 30px rgba(13,71,161,0.3);display:flex;align-items:center;justify-content:center;">
          <div style="width:0;height:0;border-left:80px solid transparent;border-right:80px solid transparent;border-bottom:100px solid #1565C0;position:absolute;top:-60px;"></div>
          <div style="font-family:${SERIF};font-size:28px;font-style:italic;color:white;text-align:center;">Signs point<br/>to YES</div>
        </div>
        <!-- photos below -->
        <div style="position:absolute;top:1340px;left:60px;right:60px;display:flex;gap:16px;">
          ${[p,p2,p3].map(ph => `<div style="flex:1;height:340px;border-radius:10px;overflow:hidden;border:3px solid rgba(124,77,255,0.3);box-shadow:0 6px 20px rgba(0,0,0,0.4);">
            <img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>`).join('')}
        </div>
        <div style="position:absolute;bottom:100px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(124,77,255,0.35);">${CTA}</div>
      </div>`
    }

    // 45: OUIJA BOARD
    case 45: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#2a1a0a;">
        <!-- wood grain -->
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(175deg,rgba(100,60,20,0.1) 0px,transparent 3px,transparent 15px);"></div>
        <!-- board -->
        <div style="position:absolute;top:60px;left:50px;right:50px;bottom:60px;background:linear-gradient(180deg,#DEB887,#C4A06A,#B8956A);border-radius:16px;border:6px solid #5D4037;box-shadow:inset 0 0 30px rgba(0,0,0,0.2),0 10px 30px rgba(0,0,0,0.4);">
          <!-- decorative corners -->
          ${[{t:'20px',l:'20px'},{t:'20px',r:'20px'},{b:'20px',l:'20px'},{b:'20px',r:'20px'}].map(pos => {
            const style = Object.entries(pos).map(([k,v])=>`${k==='t'?'top':k==='b'?'bottom':k==='l'?'left':'right'}:${v}`).join(';')
            return `<div style="position:absolute;${style};width:60px;height:60px;border:3px solid #5D4037;border-radius:50%;"></div>`
          }).join('')}
          <!-- YES / NO -->
          <div style="position:absolute;top:40px;left:60px;font-family:${SERIF};font-size:40px;font-style:italic;color:#3E2723;">YES</div>
          <div style="position:absolute;top:40px;right:60px;font-family:${SERIF};font-size:40px;font-style:italic;color:#3E2723;">NO</div>
          <!-- title -->
          <div style="position:absolute;top:100px;left:0;right:0;text-align:center;">
            <div style="font-family:${SERIF};font-size:${cs(80,city)}px;font-weight:bold;font-style:italic;color:#3E2723;">${C}</div>
            ${PH('#5D4037')}
            <div style="font-family:${FUTURA};font-size:38px;font-weight:bold;color:#5D4037;letter-spacing:4px;margin-top:4px;">FREE PHOTO SHOOT</div>
          </div>
          <!-- letter arcs -->
          <div style="position:absolute;top:340px;left:30px;right:30px;text-align:center;">
            <div style="font-family:${SERIF};font-size:36px;letter-spacing:16px;color:#3E2723;">ABCDEFGHIJKLM</div>
            <div style="font-family:${SERIF};font-size:36px;letter-spacing:16px;color:#3E2723;margin-top:8px;">NOPQRSTUVWXYZ</div>
          </div>
          <!-- photos in mystical arrangement -->
          <div style="position:absolute;top:520px;left:40px;right:40px;display:flex;gap:16px;">
            ${[p,p2,p3].map(ph => `<div style="flex:1;height:440px;border-radius:8px;overflow:hidden;border:3px solid #5D4037;box-shadow:0 6px 20px rgba(0,0,0,0.3);">
              <img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>`).join('')}
          </div>
          <!-- numbers -->
          <div style="position:absolute;top:1000px;left:0;right:0;text-align:center;">
            <div style="font-family:${SERIF};font-size:32px;letter-spacing:20px;color:#3E2723;">1234567890</div>
          </div>
          <!-- planchette -->
          <div style="position:absolute;top:1080px;left:50%;transform:translateX(-50%);width:180px;height:220px;background:rgba(100,60,20,0.4);border-radius:50% 50% 50% 50% / 60% 60% 40% 40%;border:3px solid #5D4037;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
            <div style="position:absolute;top:40%;left:50%;transform:translate(-50%,-50%);width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,0.3);border:2px solid #5D4037;"></div>
          </div>
          <!-- GOODBYE -->
          <div style="position:absolute;bottom:40px;left:0;right:0;text-align:center;font-family:${SERIF};font-size:36px;font-style:italic;color:#3E2723;">GOODBYE</div>
        </div>
      </div>`
    }

    // 46: BOARD GAME
    case 46: {
      const pathSquares = Array.from({length:20}, (_,i) => {
        const colors = ['#E53935','#FDD835','#43A047','#1E88E5','#E040FB']
        const positions = [
          {x:60,y:500},{x:210,y:500},{x:360,y:500},{x:510,y:500},{x:660,y:500},{x:810,y:500},{x:960,y:500},
          {x:960,y:650},{x:960,y:800},{x:960,y:950},
          {x:810,y:950},{x:660,y:950},{x:510,y:950},{x:360,y:950},{x:210,y:950},{x:60,y:950},
          {x:60,y:1100},{x:60,y:1250},{x:210,y:1250},{x:360,y:1250}
        ]
        const pos = positions[i] || {x:60,y:500}
        return `<div style="position:absolute;left:${pos.x}px;top:${pos.y}px;width:130px;height:130px;background:${colors[i%5]};border:3px solid rgba(0,0,0,0.2);border-radius:8px;display:flex;align-items:center;justify-content:center;">
          ${i===3||i===10||i===17 ? `<div style="font-family:${MONO};font-size:14px;color:white;text-align:center;font-weight:bold;">FREE<br/>PHOTO</div>` : `<div style="font-family:${MONO};font-size:24px;color:white;font-weight:bold;">${i+1}</div>`}
        </div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#FFF8E1;">
        <!-- board texture -->
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(0,0,0,0.02) 0px,transparent 1px,transparent 40px);"></div>
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:${cs(90,city)}px;color:#E53935;">${C}</div>
          ${PH('#E53935')}
          <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:#1E88E5;letter-spacing:4px;margin-top:4px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SERIF};font-size:28px;font-style:italic;color:#666;margin-top:6px;">The Photography Board Game</div>
        </div>
        ${pathSquares}
        <!-- game pieces (photos) -->
        <div style="position:absolute;top:340px;left:120px;width:260px;height:340px;border-radius:8px;overflow:hidden;transform:rotate(-3deg);box-shadow:0 8px 24px rgba(0,0,0,0.2);border:4px solid white;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:380px;right:60px;width:260px;height:340px;border-radius:8px;overflow:hidden;transform:rotate(4deg);box-shadow:0 8px 24px rgba(0,0,0,0.2);border:4px solid white;">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;bottom:240px;left:50%;transform:translateX(-50%);width:500px;height:340px;border-radius:8px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.2);border:4px solid white;">
          <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <!-- dice -->
        <div style="position:absolute;bottom:120px;right:80px;width:70px;height:70px;background:white;border-radius:10px;border:2px solid #ddd;box-shadow:0 4px 8px rgba(0,0,0,0.15);transform:rotate(15deg);display:flex;align-items:center;justify-content:center;">
          <div style="font-family:${SANS};font-size:36px;font-weight:bold;color:#333;">&#9861;</div>
        </div>
        <div style="position:absolute;bottom:100px;left:60px;font-family:${SANS};font-size:20px;color:rgba(0,0,0,0.35);">${CTA}</div>
      </div>`
    }

    // 47: PUZZLE PIECES
    case 47: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#E8EAF6;">
        <!-- puzzle texture bg -->
        <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(0,0,0,0.02),transparent,rgba(0,0,0,0.02));"></div>
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:${cs(100,city)}px;color:#283593;">${C}</div>
          ${PH('#3F51B5')}
          <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:#FF6F00;letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- puzzle grid with photos -->
        <div style="position:absolute;top:350px;left:60px;right:60px;height:1000px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:6px;">
          ${Array.from({length:9}, (_,i) => {
            const photos = [p,p2,p3]
            const isPhoto = i === 0 || i === 4 || i === 8 || i === 2 || i === 6
            const bgColors = ['#E53935','#1E88E5','#43A047','#FDD835','#E040FB','#FF6F00','#00BCD4','#8D6E63','#78909C']
            return `<div style="border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.15);${isPhoto ? '' : `background:${bgColors[i]};display:flex;align-items:center;justify-content:center;`}position:relative;">
              ${isPhoto ? `<img src="${photos[i%3]}" style="width:100%;height:100%;object-fit:cover;"/>` : `
                <div style="font-family:${FUTURA};font-size:28px;font-weight:bold;color:white;text-align:center;">FREE<br/>SHOOT</div>
              `}
              <!-- puzzle notches -->
              <div style="position:absolute;top:50%;right:-12px;width:24px;height:40px;background:inherit;border-radius:50%;transform:translateY(-50%);"></div>
              <div style="position:absolute;left:50%;bottom:-12px;width:40px;height:24px;background:inherit;border-radius:50%;transform:translateX(-50%);"></div>
            </div>`
          }).join('')}
        </div>
        <!-- floating piece -->
        <div style="position:absolute;bottom:200px;right:60px;width:160px;height:180px;background:#FF6F00;border-radius:12px;transform:rotate(20deg);box-shadow:0 8px 24px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;">
          <div style="font-family:${FUTURA};font-size:20px;font-weight:bold;color:white;text-align:center;">YOUR<br/>PIECE</div>
        </div>
        <div style="position:absolute;bottom:100px;left:60px;font-family:${SANS};font-size:20px;color:rgba(40,53,147,0.35);">${CTA}</div>
      </div>`
    }

    // 48: DICE ROLL
    case 48: {
      const dice = Array.from({length:6}, (_,i) => {
        const x = 60 + (i % 3) * 340
        const y = 1200 + Math.floor(i / 3) * 200
        const rotation = -20 + i * 12
        return `<div style="position:absolute;left:${x}px;top:${y}px;width:100px;height:100px;background:white;border-radius:14px;border:2px solid #ddd;box-shadow:0 4px 10px rgba(0,0,0,0.15);transform:rotate(${rotation}deg);display:flex;align-items:center;justify-content:center;">
          <div style="font-size:40px;color:#E53935;">&#${9855+i};</div>
        </div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#1B5E20,#2E7D32);">
        <!-- felt texture -->
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(45deg,rgba(0,0,0,0.03) 0px,transparent 2px,transparent 8px);"></div>
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:${cs(110,city)}px;color:white;text-shadow:0 4px 12px rgba(0,0,0,0.4);">${C}</div>
          ${PH('rgba(255,255,255,0.5)')}
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:#FFD600;letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- photos as faces of giant dice -->
        <div style="position:absolute;top:360px;left:100px;width:400px;height:400px;background:white;border-radius:30px;padding:16px;box-shadow:0 12px 40px rgba(0,0,0,0.3);transform:rotate(-5deg);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;border-radius:16px;"/>
        </div>
        <div style="position:absolute;top:440px;right:80px;width:380px;height:380px;background:white;border-radius:30px;padding:16px;box-shadow:0 12px 40px rgba(0,0,0,0.3);transform:rotate(8deg);">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;border-radius:16px;"/>
        </div>
        <div style="position:absolute;top:800px;left:50%;transform:translateX(-50%) rotate(-2deg);width:420px;height:400px;background:white;border-radius:30px;padding:16px;box-shadow:0 12px 40px rgba(0,0,0,0.3);">
          <img src="${p3}" style="width:100%;height:100%;object-fit:cover;border-radius:16px;"/>
        </div>
        ${dice}
        <div style="position:absolute;bottom:100px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,255,255,0.4);">${CTA}</div>
      </div>`
    }

    // 49: CARD DECK FAN
    case 49: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#1B5E20,#0D3B0D);">
        <!-- felt -->
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(135deg,rgba(0,0,0,0.03) 0px,transparent 2px,transparent 8px);"></div>
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(110,city)}px;font-weight:bold;font-style:italic;color:#FFD600;text-shadow:0 2px 12px rgba(255,214,0,0.4);">${C}</div>
          ${PH('rgba(255,214,0,0.4)')}
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:white;letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- fanned cards -->
        ${Array.from({length:7}, (_,i) => {
          const angle = -30 + i * 10
          const photos = [p,p2,p3]
          const isPhoto = i === 1 || i === 3 || i === 5
          const suits = ['&#9824;','&#9829;','&#9830;','&#9827;']
          const values = ['A','K','Q','J','10','9','8']
          return `<div style="position:absolute;bottom:400px;left:50%;width:220px;height:340px;background:white;border-radius:10px;border:2px solid #ddd;box-shadow:0 6px 20px rgba(0,0,0,0.3);transform-origin:bottom center;transform:translateX(-50%) rotate(${angle}deg);overflow:hidden;">
            ${isPhoto ? `<img src="${photos[Math.floor(i/2)]}" style="width:100%;height:100%;object-fit:cover;"/>` : `
              <div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px;">
                <div style="font-family:${SERIF};font-size:28px;color:${i%2===0?'#111':'#E53935'};align-self:flex-start;">${values[i]}</div>
                <div style="font-size:60px;color:${i%2===0?'#111':'#E53935'};">${suits[i%4]}</div>
                <div style="font-family:${SERIF};font-size:28px;color:${i%2===0?'#111':'#E53935'};align-self:flex-end;transform:rotate(180deg);">${values[i]}</div>
              </div>
            `}
          </div>`
        }).join('')}
        <!-- large feature photo -->
        <div style="position:absolute;top:320px;left:60px;right:60px;height:500px;border-radius:12px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.4);border:4px solid rgba(255,214,0,0.3);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;bottom:100px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,214,0,0.35);">${CTA}</div>
      </div>`
    }

    // 50: HOT AIR BALLOON
    case 50: {
      const stripes = Array.from({length:10}, (_,i) => {
        const colors = ['#E53935','#FF6F00','#FDD835','#43A047','#1E88E5','#E040FB','#E53935','#FF6F00','#FDD835','#43A047']
        return `<div style="position:absolute;top:${i*80}px;left:0;right:0;height:80px;background:${colors[i]};"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#87CEEB,#B0E2FF,#E0F7FF);">
        <!-- clouds -->
        ${Array.from({length:6}, (_,i) => {
          const x = -80 + (i * 200) % 1100
          const y = 200 + (i * 300) % 800
          return `<div style="position:absolute;left:${x}px;top:${y}px;width:${200+i*30}px;height:80px;background:white;border-radius:40px;opacity:0.6;"></div>
            <div style="position:absolute;left:${x+40}px;top:${y-30}px;width:120px;height:80px;background:white;border-radius:40px;opacity:0.6;"></div>`
        }).join('')}
        <!-- balloon envelope -->
        <div style="position:absolute;top:80px;left:200px;width:680px;height:800px;border-radius:340px 340px 200px 200px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.15);">
          ${stripes}
        </div>
        <!-- ropes -->
        <div style="position:absolute;top:860px;left:360px;width:2px;height:200px;background:#8D6E63;"></div>
        <div style="position:absolute;top:860px;right:360px;width:2px;height:200px;background:#8D6E63;"></div>
        <div style="position:absolute;top:860px;left:50%;width:2px;height:200px;background:#8D6E63;transform:translateX(-50%);"></div>
        <!-- basket with photos -->
        <div style="position:absolute;top:1040px;left:280px;right:280px;height:320px;background:linear-gradient(180deg,#D2691E,#8B4513);border-radius:8px;border:4px solid #6D4C41;box-shadow:0 8px 24px rgba(0,0,0,0.3);overflow:hidden;">
          <!-- wicker pattern -->
          <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,0.1) 0px,transparent 2px,transparent 10px),repeating-linear-gradient(90deg,rgba(0,0,0,0.1) 0px,transparent 2px,transparent 10px);"></div>
          <div style="position:absolute;inset:8px;display:flex;gap:6px;">
            ${[p,p2,p3].map(ph => `<div style="flex:1;border-radius:4px;overflow:hidden;border:2px solid rgba(255,255,255,0.3);">
              <img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>`).join('')}
          </div>
        </div>
        <div style="position:absolute;top:40px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(80,city)}px;font-weight:bold;font-style:italic;color:white;text-shadow:0 2px 10px rgba(0,0,0,0.2);">${C}</div>
          ${PH('rgba(255,255,255,0.6)')}
        </div>
        <div style="position:absolute;bottom:300px;left:0;right:0;text-align:center;">
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:#333;letter-spacing:5px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:20px;color:rgba(0,0,0,0.35);margin-top:10px;">${CTA}</div>
        </div>
      </div>`
    }

    // 51: SUBMARINE PORTHOLE
    case 51: {
      const rivets = Array.from({length:24}, (_,i) => {
        const angle = (i / 24) * 2 * Math.PI
        const cx = 540 + Math.cos(angle) * 380
        const cy = 800 + Math.sin(angle) * 380
        return `<div style="position:absolute;left:${Math.round(cx)-8}px;top:${Math.round(cy)-8}px;width:16px;height:16px;border-radius:50%;background:linear-gradient(135deg,#888,#555);border:1px solid #444;box-shadow:inset 0 1px 2px rgba(255,255,255,0.2);"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#2a3040;">
        <!-- metal wall texture -->
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,0.02) 0px,transparent 1px,transparent 30px);"></div>
        <!-- metal plate seams -->
        <div style="position:absolute;top:0;left:360px;width:4px;height:100%;background:rgba(0,0,0,0.2);"></div>
        <div style="position:absolute;top:0;left:720px;width:4px;height:100%;background:rgba(0,0,0,0.2);"></div>
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:${cs(90,city)}px;color:#90CAF9;text-shadow:0 0 20px rgba(144,202,249,0.3);">${C}</div>
          ${PH('rgba(144,202,249,0.4)')}
          <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:white;letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- porthole frame -->
        <div style="position:absolute;top:400px;left:140px;width:800px;height:800px;border-radius:50%;background:linear-gradient(135deg,#666,#444,#555);box-shadow:0 10px 40px rgba(0,0,0,0.5),inset 0 0 20px rgba(0,0,0,0.3);">
          <!-- inner ring -->
          <div style="position:absolute;inset:20px;border-radius:50%;background:linear-gradient(135deg,#555,#333);"></div>
          <!-- glass with photo -->
          <div style="position:absolute;inset:40px;border-radius:50%;overflow:hidden;box-shadow:inset 0 0 30px rgba(0,50,100,0.3);">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.9);"/>
            <!-- water caustic overlay -->
            <div style="position:absolute;inset:0;background:radial-gradient(circle at 35% 30%,rgba(100,200,255,0.1),transparent 40%);"></div>
          </div>
        </div>
        ${rivets}
        <!-- smaller portholes with p2, p3 -->
        <div style="position:absolute;bottom:300px;left:80px;width:250px;height:250px;border-radius:50%;background:linear-gradient(135deg,#555,#333);box-shadow:0 6px 20px rgba(0,0,0,0.4);overflow:hidden;">
          <div style="position:absolute;inset:16px;border-radius:50%;overflow:hidden;">
            <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <div style="position:absolute;bottom:280px;right:80px;width:250px;height:250px;border-radius:50%;background:linear-gradient(135deg,#555,#333);box-shadow:0 6px 20px rgba(0,0,0,0.4);overflow:hidden;">
          <div style="position:absolute;inset:16px;border-radius:50%;overflow:hidden;">
            <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <div style="position:absolute;bottom:160px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(144,202,249,0.35);">${CTA}</div>
      </div>`
    }

    // 52: LIGHTHOUSE BEAM
    case 52: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#0D1B2A,#1B2838,#2E4057);">
        <!-- stars -->
        ${Array.from({length:40}, (_,i) => `<div style="position:absolute;left:${(i*67)%1060}px;top:${(i*41)%600}px;width:${2+(i%3)}px;height:${2+(i%3)}px;border-radius:50%;background:white;opacity:${0.2+(i%4)*0.12};"></div>`).join('')}
        <!-- light beam -->
        <div style="position:absolute;top:200px;left:400px;width:600px;height:1200px;background:linear-gradient(90deg,transparent,rgba(255,240,180,0.08),rgba(255,240,180,0.15),rgba(255,240,180,0.08),transparent);transform:rotate(15deg);transform-origin:top left;"></div>
        <!-- lighthouse tower -->
        <div style="position:absolute;bottom:0;left:60px;width:200px;height:1200px;">
          <!-- tower body -->
          <div style="position:absolute;bottom:0;left:20px;width:160px;height:1000px;background:repeating-linear-gradient(180deg,white 0px,white 80px,#E53935 80px,#E53935 160px);border-radius:8px 8px 0 0;"></div>
          <!-- light room -->
          <div style="position:absolute;bottom:980px;left:0;width:200px;height:120px;background:linear-gradient(180deg,#333,#222);border-radius:8px;border:3px solid #555;">
            <!-- lamp -->
            <div style="position:absolute;top:20px;left:50%;transform:translateX(-50%);width:80px;height:80px;border-radius:50%;background:radial-gradient(circle,#FFF9C4,#FFD600);box-shadow:0 0 40px rgba(255,214,0,0.6);"></div>
          </div>
          <!-- gallery rail -->
          <div style="position:absolute;bottom:960px;left:-20px;width:240px;height:30px;background:#333;border-radius:4px;">
            ${Array.from({length:12}, (_,i) => `<div style="position:absolute;bottom:0;left:${i*20}px;width:3px;height:20px;background:#555;"></div>`).join('')}
          </div>
        </div>
        <!-- title -->
        <div style="position:absolute;top:80px;right:60px;text-align:right;">
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:white;text-shadow:0 2px 16px rgba(255,240,180,0.3);">${C}</div>
          ${PH('rgba(255,240,180,0.4)')}
          <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:#FFD600;letter-spacing:4px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- photos illuminated by beam -->
        <div style="position:absolute;top:500px;right:60px;width:540px;">
          <div style="width:100%;height:440px;border-radius:8px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.4);border:3px solid rgba(255,240,180,0.15);margin-bottom:16px;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="display:flex;gap:16px;">
            <div style="flex:1;height:300px;border-radius:8px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.4);border:3px solid rgba(255,240,180,0.15);">
              <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
            <div style="flex:1;height:300px;border-radius:8px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.4);border:3px solid rgba(255,240,180,0.15);">
              <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
          </div>
        </div>
        <!-- ocean waves -->
        <div style="position:absolute;bottom:0;left:0;right:0;height:200px;background:linear-gradient(180deg,transparent,rgba(0,40,80,0.5));"></div>
        <div style="position:absolute;bottom:100px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,240,180,0.35);">${CTA}</div>
      </div>`
    }

    // 53: COMPASS ROSE
    case 53: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F5F0E0;">
        <!-- parchment texture -->
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,#F5F0E0,#E8DCC8);"></div>
        <div style="position:absolute;inset:30px;border:3px solid #8B7355;"></div>
        <div style="position:absolute;inset:40px;border:1px solid rgba(139,115,85,0.3);"></div>
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:#3E2723;">${C}</div>
          ${PH('#5D4037')}
          <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:#8B0000;letter-spacing:4px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- compass rose -->
        <div style="position:absolute;top:340px;left:50%;transform:translateX(-50%);width:700px;height:700px;">
          <!-- outer ring -->
          <div style="position:absolute;inset:0;border:4px solid #8B7355;border-radius:50%;"></div>
          <div style="position:absolute;inset:10px;border:2px solid rgba(139,115,85,0.3);border-radius:50%;"></div>
          <!-- compass points -->
          ${['N','E','S','W'].map((dir,i) => {
            const positions = [{top:'-30px',left:'50%',tx:'-50%'},{top:'50%',right:'-30px',ty:'-50%'},{bottom:'-30px',left:'50%',tx:'-50%'},{top:'50%',left:'-30px',ty:'-50%'}]
            const p2 = positions[i]
            const style = `${p2.top?`top:${p2.top};`:''}${p2.bottom?`bottom:${p2.bottom};`:''}${p2.left?`left:${p2.left};`:''}${p2.right?`right:${p2.right};`:''}transform:${p2.tx?`translateX(${p2.tx})`:p2.ty?`translateY(${p2.ty})`:''};`
            return `<div style="position:absolute;${style}font-family:${SERIF};font-size:36px;font-weight:bold;color:#3E2723;">${dir}</div>`
          }).join('')}
          <!-- star pattern -->
          ${Array.from({length:8}, (_,i) => {
            const angle = i * 45
            return `<div style="position:absolute;top:50%;left:50%;width:4px;height:280px;background:${i%2===0?'#8B0000':'#8B7355'};transform-origin:top center;transform:translate(-50%,0) rotate(${angle}deg);"></div>`
          }).join('')}
          <!-- center with photo -->
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:280px;height:280px;border-radius:50%;overflow:hidden;border:4px solid #8B7355;box-shadow:0 6px 20px rgba(0,0,0,0.2);">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <!-- photos in corners -->
        <div style="position:absolute;top:1100px;left:60px;width:440px;height:360px;border-radius:8px;overflow:hidden;border:4px solid #8B7355;box-shadow:0 6px 20px rgba(0,0,0,0.15);">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:1140px;right:60px;width:440px;height:360px;border-radius:8px;overflow:hidden;border:4px solid #8B7355;box-shadow:0 6px 20px rgba(0,0,0,0.15);">
          <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;bottom:130px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(62,39,35,0.35);">${CTA}</div>
      </div>`
    }

    // 54: TELESCOPE VIEW
    case 54: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <!-- telescope circle view -->
        <div style="position:absolute;top:200px;left:50%;transform:translateX(-50%);width:900px;height:900px;border-radius:50%;overflow:hidden;border:8px solid #333;box-shadow:0 0 60px rgba(0,0,0,0.8),inset 0 0 40px rgba(0,0,0,0.5);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          <!-- crosshair -->
          <div style="position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(255,255,255,0.2);"></div>
          <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(255,255,255,0.2);"></div>
          <!-- center marker -->
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:30px;height:30px;border:2px solid rgba(255,255,255,0.3);border-radius:50%;"></div>
          <!-- distance markings -->
          ${Array.from({length:4}, (_,i) => `<div style="position:absolute;top:50%;left:50%;width:${200+i*150}px;height:${200+i*150}px;border:1px solid rgba(255,255,255,0.06);border-radius:50%;transform:translate(-50%,-50%);"></div>`).join('')}
          <!-- vignette -->
          <div style="position:absolute;inset:0;background:radial-gradient(circle,transparent 60%,rgba(0,0,0,0.8) 100%);"></div>
        </div>
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${MONO};font-size:22px;color:rgba(255,255,255,0.4);letter-spacing:4px;">VIEWED FROM A DISTANCE</div>
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:white;text-shadow:0 2px 12px rgba(0,0,0,0.6);">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
        </div>
        <!-- thumbnails below -->
        <div style="position:absolute;top:1200px;left:60px;right:60px;display:flex;gap:16px;">
          ${[p2,p3,p].map(ph => `<div style="flex:1;height:340px;border-radius:8px;overflow:hidden;border:3px solid #333;box-shadow:0 6px 20px rgba(0,0,0,0.4);">
            <img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>`).join('')}
        </div>
        <div style="position:absolute;top:1160px;left:0;right:0;text-align:center;">
          <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:white;letter-spacing:5px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;bottom:120px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,255,255,0.3);">${CTA}</div>
      </div>`
    }

    // 55: BINOCULARS VIEW
    case 55: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:white;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:white;letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- binocular circles -->
        <div style="position:absolute;top:360px;left:50px;width:480px;height:480px;border-radius:50%;overflow:hidden;border:6px solid #333;box-shadow:inset 0 0 40px rgba(0,0,0,0.5);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          <div style="position:absolute;inset:0;background:radial-gradient(circle,transparent 65%,rgba(0,0,0,0.8) 100%);"></div>
        </div>
        <div style="position:absolute;top:360px;right:50px;width:480px;height:480px;border-radius:50%;overflow:hidden;border:6px solid #333;box-shadow:inset 0 0 40px rgba(0,0,0,0.5);">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
          <div style="position:absolute;inset:0;background:radial-gradient(circle,transparent 65%,rgba(0,0,0,0.8) 100%);"></div>
        </div>
        <!-- bridge between circles -->
        <div style="position:absolute;top:560px;left:50%;transform:translateX(-50%);width:80px;height:80px;background:#222;border-radius:8px;"></div>
        <!-- bottom photo -->
        <div style="position:absolute;top:920px;left:60px;right:60px;height:560px;border-radius:12px;overflow:hidden;border:4px solid #333;box-shadow:0 10px 30px rgba(0,0,0,0.4);">
          <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <!-- focus ring markers -->
        <div style="position:absolute;top:1520px;left:60px;right:60px;display:flex;justify-content:space-between;">
          ${Array.from({length:11}, (_,i) => `<div style="width:${i===5?4:2}px;height:${i===5?30:20}px;background:rgba(255,255,255,${i===5?0.5:0.2});"></div>`).join('')}
        </div>
        <div style="position:absolute;bottom:200px;left:0;right:0;text-align:center;font-family:${MONO};font-size:18px;color:rgba(255,255,255,0.3);">10x magnification — crystal clear portraits</div>
        <div style="position:absolute;bottom:140px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,255,255,0.3);">${CTA}</div>
      </div>`
    }

    // 56: PERISCOPE
    case 56: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#0D47A1,#1565C0,#1976D2);">
        <!-- water ripples -->
        ${Array.from({length:8}, (_,i) => `<div style="position:absolute;top:${800+i*30}px;left:-100px;right:-100px;height:${2}px;background:rgba(255,255,255,${0.03+i*0.01});transform:rotate(${-1+i*0.3}deg);"></div>`).join('')}
        <div style="position:absolute;top:80px;left:0;right:0;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:${cs(100,city)}px;color:white;text-shadow:0 2px 16px rgba(0,0,0,0.4);">${C}</div>
          ${PH('rgba(255,255,255,0.5)')}
          <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:#FFD600;letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- periscope tube -->
        <div style="position:absolute;top:320px;left:50%;transform:translateX(-50%);width:120px;height:1200px;background:linear-gradient(90deg,#555,#888,#666);border:2px solid #444;border-radius:60px;"></div>
        <!-- top eyepiece -->
        <div style="position:absolute;top:280px;left:50%;transform:translateX(-50%);width:200px;height:80px;background:linear-gradient(180deg,#666,#444);border-radius:100px/40px;border:2px solid #555;"></div>
        <!-- main viewing circles -->
        <div style="position:absolute;top:400px;left:50%;transform:translateX(-50%);width:700px;height:700px;border-radius:50%;overflow:hidden;border:6px solid #555;box-shadow:0 10px 40px rgba(0,0,0,0.4),inset 0 0 30px rgba(0,0,0,0.3);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          <!-- crosshair -->
          <div style="position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(255,255,255,0.15);"></div>
          <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(255,255,255,0.15);"></div>
          <div style="position:absolute;inset:0;background:radial-gradient(circle,transparent 60%,rgba(0,0,0,0.6) 100%);"></div>
        </div>
        <!-- smaller photos -->
        <div style="position:absolute;top:1180px;left:60px;right:60px;display:flex;gap:16px;">
          <div style="flex:1;height:340px;border-radius:10px;overflow:hidden;border:3px solid rgba(255,255,255,0.15);box-shadow:0 6px 20px rgba(0,0,0,0.3);">
            <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="flex:1;height:340px;border-radius:10px;overflow:hidden;border:3px solid rgba(255,255,255,0.15);box-shadow:0 6px 20px rgba(0,0,0,0.3);">
            <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <div style="position:absolute;bottom:180px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,214,0,0.35);">${CTA}</div>
      </div>`
    }

    // 57: RADAR SCREEN
    case 57: {
      const rings = Array.from({length:5}, (_,i) => {
        const size = 200 + i * 160
        return `<div style="position:absolute;top:50%;left:50%;width:${size}px;height:${size}px;border:1px solid rgba(0,255,0,0.15);border-radius:50%;transform:translate(-50%,-50%);"></div>`
      }).join('')
      const blips = Array.from({length:6}, (_,i) => {
        const angle = (i * 60 + 15) * Math.PI / 180
        const dist = 100 + i * 60
        const x = 480 + Math.cos(angle) * dist
        const y = 700 + Math.sin(angle) * dist
        return `<div style="position:absolute;left:${Math.round(x)}px;top:${Math.round(y)}px;width:10px;height:10px;border-radius:50%;background:#00FF00;box-shadow:0 0 8px rgba(0,255,0,0.6);"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0a0a;">
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${MONO};font-size:${cs(80,city)}px;color:#00FF00;text-shadow:0 0 15px rgba(0,255,0,0.4);">${C}</div>
          ${PH('rgba(0,255,0,0.4)', MONO)}
          <div style="font-family:${MONO};font-size:36px;color:#00FF00;letter-spacing:4px;margin-top:4px;text-shadow:0 0 10px rgba(0,255,0,0.3);">FREE PHOTO SHOOT</div>
        </div>
        <!-- radar circle -->
        <div style="position:absolute;top:300px;left:60px;right:60px;height:960px;position:relative;">
          <div style="position:absolute;inset:0;border:2px solid rgba(0,255,0,0.2);border-radius:50%;overflow:hidden;background:radial-gradient(circle,rgba(0,40,0,0.3),rgba(0,10,0,0.1));">
            ${rings}
            <!-- scan line -->
            <div style="position:absolute;top:50%;left:50%;width:50%;height:2px;background:linear-gradient(90deg,rgba(0,255,0,0.4),transparent);transform-origin:left center;transform:rotate(45deg);"></div>
            <!-- sweep glow -->
            <div style="position:absolute;top:50%;left:50%;width:50%;height:200px;background:linear-gradient(90deg,rgba(0,255,0,0.1),transparent);transform-origin:left center;transform:rotate(30deg);clip-path:polygon(0 50%,100% 0%,100% 100%);"></div>
            ${blips}
            <!-- crosshair lines -->
            <div style="position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(0,255,0,0.1);"></div>
            <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(0,255,0,0.1);"></div>
          </div>
          <!-- photo targets -->
          <div style="position:absolute;top:60px;left:100px;width:220px;height:280px;border:2px solid rgba(0,255,0,0.3);border-radius:6px;overflow:hidden;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.8) hue-rotate(80deg);"/>
          </div>
          <div style="position:absolute;top:120px;right:80px;width:220px;height:280px;border:2px solid rgba(0,255,0,0.3);border-radius:6px;overflow:hidden;">
            <img src="${p2}" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.8) hue-rotate(80deg);"/>
          </div>
          <div style="position:absolute;bottom:80px;left:50%;transform:translateX(-50%);width:260px;height:300px;border:2px solid rgba(0,255,0,0.3);border-radius:6px;overflow:hidden;">
            <img src="${p3}" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.8) hue-rotate(80deg);"/>
          </div>
        </div>
        <!-- status bar -->
        <div style="position:absolute;bottom:100px;left:60px;right:60px;display:flex;justify-content:space-between;">
          <div style="font-family:${MONO};font-size:16px;color:rgba(0,255,0,0.4);">SCAN: ACTIVE</div>
          <div style="font-family:${MONO};font-size:16px;color:rgba(0,255,0,0.4);">TARGETS: 3</div>
          <div style="font-family:${MONO};font-size:16px;color:rgba(0,255,0,0.4);">STATUS: FREE</div>
        </div>
        <div style="position:absolute;bottom:60px;left:0;right:0;text-align:center;font-family:${SANS};font-size:18px;color:rgba(0,255,0,0.25);">${CTA}</div>
      </div>`
    }

    // 58: SATELLITE VIEW
    case 58: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <!-- earth curve at bottom -->
        <div style="position:absolute;bottom:-600px;left:-200px;right:-200px;height:1200px;border-radius:50%;background:linear-gradient(180deg,#1565C0,#0D47A1,#0a2a5a);box-shadow:0 -40px 80px rgba(21,101,192,0.3);"></div>
        <!-- atmosphere glow -->
        <div style="position:absolute;bottom:280px;left:-200px;right:-200px;height:80px;background:linear-gradient(180deg,transparent,rgba(100,181,246,0.2),transparent);"></div>
        <!-- stars -->
        ${Array.from({length:50}, (_,i) => `<div style="position:absolute;left:${(i*67)%1060}px;top:${(i*43)%1000}px;width:${1+(i%3)}px;height:${1+(i%3)}px;border-radius:50%;background:white;opacity:${0.3+(i%4)*0.15};"></div>`).join('')}
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${MONO};font-size:18px;color:rgba(100,181,246,0.5);letter-spacing:4px;">SATELLITE IMAGERY — ${C}</div>
          <div style="font-family:${SERIF};font-size:${cs(110,city)}px;font-weight:bold;font-style:italic;color:white;text-shadow:0 2px 16px rgba(100,181,246,0.3);">${C}</div>
          ${PH('rgba(100,181,246,0.4)')}
          <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:#64B5F6;letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- satellite photo frames -->
        <div style="position:absolute;top:400px;left:80px;right:80px;">
          <div style="width:100%;height:500px;border-radius:8px;overflow:hidden;border:2px solid rgba(100,181,246,0.2);box-shadow:0 10px 40px rgba(0,0,0,0.4);margin-bottom:16px;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="display:flex;gap:16px;">
            <div style="flex:1;height:360px;border-radius:8px;overflow:hidden;border:2px solid rgba(100,181,246,0.2);box-shadow:0 8px 30px rgba(0,0,0,0.4);">
              <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
            <div style="flex:1;height:360px;border-radius:8px;overflow:hidden;border:2px solid rgba(100,181,246,0.2);box-shadow:0 8px 30px rgba(0,0,0,0.4);">
              <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
          </div>
        </div>
        <!-- HUD overlay -->
        <div style="position:absolute;top:400px;left:80px;font-family:${MONO};font-size:14px;color:rgba(100,181,246,0.4);">LAT: 14.5995&deg; N</div>
        <div style="position:absolute;top:420px;left:80px;font-family:${MONO};font-size:14px;color:rgba(100,181,246,0.4);">LON: 120.9842&deg; E</div>
        <div style="position:absolute;top:400px;right:80px;font-family:${MONO};font-size:14px;color:rgba(100,181,246,0.4);text-align:right;">ALT: 408 KM</div>
        <div style="position:absolute;bottom:200px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(100,181,246,0.35);">${CTA}</div>
      </div>`
    }

    // 59: CONTROL TOWER
    case 59: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#0D1B2A,#1B2838);">
        <!-- runway lights at bottom -->
        ${Array.from({length:10}, (_,i) => `
          <div style="position:absolute;bottom:${60+i*8}px;left:${300+i*24}px;width:8px;height:8px;border-radius:50%;background:#FFD600;box-shadow:0 0 6px rgba(255,214,0,0.5);"></div>
          <div style="position:absolute;bottom:${60+i*8}px;right:${300+i*24}px;width:8px;height:8px;border-radius:50%;background:#FFD600;box-shadow:0 0 6px rgba(255,214,0,0.5);"></div>
        `).join('')}
        <!-- control panel at top -->
        <div style="position:absolute;top:0;left:0;right:0;height:300px;background:linear-gradient(180deg,#1a1a2e,#111);border-bottom:3px solid #333;">
          <!-- instrument displays -->
          <div style="position:absolute;top:20px;left:40px;right:40px;display:flex;gap:12px;">
            ${Array.from({length:5}, (_,i) => `<div style="flex:1;height:80px;background:#0a0a1a;border:2px solid #333;border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;">
              <div style="font-family:${MONO};font-size:12px;color:rgba(0,255,0,0.4);">${['ALT','SPD','HDG','VOR','ILS'][i]}</div>
              <div style="font-family:${MONO};font-size:24px;color:#00FF00;">${['35000','280','090','114.1','110.3'][i]}</div>
            </div>`).join('')}
          </div>
          <!-- title -->
          <div style="position:absolute;top:120px;left:0;right:0;text-align:center;">
            <div style="font-family:${SERIF};font-size:${cs(90,city)}px;font-weight:bold;font-style:italic;color:white;">${C}</div>
            ${PH('rgba(255,255,255,0.4)')}
            <div style="font-family:${FUTURA};font-size:40px;font-weight:bold;color:#00E676;letter-spacing:4px;margin-top:4px;">FREE PHOTO SHOOT</div>
          </div>
        </div>
        <!-- panoramic window with photos -->
        <div style="position:absolute;top:320px;left:40px;right:40px;bottom:200px;background:#0a0a15;border:4px solid #333;border-radius:12px;overflow:hidden;">
          <!-- window mullions -->
          <div style="position:absolute;top:0;left:33%;width:4px;height:100%;background:#333;z-index:2;"></div>
          <div style="position:absolute;top:0;left:66%;width:4px;height:100%;background:#333;z-index:2;"></div>
          <!-- photos in window panes -->
          <div style="display:flex;height:100%;">
            <div style="flex:1;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
            <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
            <div style="flex:1;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
          </div>
          <!-- radar sweep overlay -->
          <div style="position:absolute;bottom:20px;right:20px;width:160px;height:160px;border-radius:50%;border:2px solid rgba(0,255,0,0.2);background:rgba(0,20,0,0.5);">
            <div style="position:absolute;top:50%;left:50%;width:50%;height:1px;background:rgba(0,255,0,0.3);transform-origin:left;transform:rotate(30deg);"></div>
          </div>
        </div>
        <div style="position:absolute;bottom:120px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(0,230,118,0.35);">${CTA}</div>
      </div>`
    }

    // 60: FILM REEL
    case 60: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#0a0a0a,#1a1a1a);">
        <!-- large reel -->
        <div style="position:absolute;top:100px;left:50%;transform:translateX(-50%);width:700px;height:700px;border-radius:50%;border:8px solid #333;background:#111;">
          <!-- spokes -->
          ${Array.from({length:6}, (_,i) => `<div style="position:absolute;top:50%;left:50%;width:4px;height:320px;background:#333;transform-origin:top center;transform:translate(-50%,0) rotate(${i*60}deg);"></div>`).join('')}
          <!-- hub -->
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:120px;height:120px;border-radius:50%;background:#222;border:4px solid #444;"></div>
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;border-radius:50%;background:#111;border:3px solid #555;"></div>
          <!-- film frames on reel -->
          ${Array.from({length:6}, (_,i) => {
            const angle = (i * 60 - 90) * Math.PI / 180
            const cx = 350 + Math.cos(angle) * 220
            const cy = 350 + Math.sin(angle) * 220
            return `<div style="position:absolute;left:${Math.round(cx)-50}px;top:${Math.round(cy)-35}px;width:100px;height:70px;border-radius:4px;overflow:hidden;border:2px solid #444;">
              <img src="${[p,p2,p3][i%3]}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>`
          }).join('')}
        </div>
        <div style="position:absolute;top:40px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:28px;font-style:italic;color:rgba(255,255,255,0.3);">now showing</div>
        </div>
        <!-- title -->
        <div style="position:absolute;top:840px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(110,city)}px;font-weight:bold;font-style:italic;color:white;text-shadow:0 2px 12px rgba(0,0,0,0.5);">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:#FFD600;letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- film strip below -->
        <div style="position:absolute;top:1120px;left:40px;right:40px;height:500px;background:#1a1a1a;border:4px solid #333;border-radius:8px;display:flex;gap:8px;padding:8px;">
          ${[p,p2,p3].map(ph => `<div style="flex:1;border-radius:4px;overflow:hidden;border:2px solid #333;">
            <img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>`).join('')}
        </div>
        <div style="position:absolute;bottom:180px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,214,0,0.35);">${CTA}</div>
      </div>`
    }

    // 61: PROJECTION SCREEN
    case 61: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a1a1a;">
        <!-- ceiling -->
        <div style="position:absolute;top:0;left:0;right:0;height:100px;background:linear-gradient(180deg,#0a0a0a,#1a1a1a);"></div>
        <!-- screen mount bar -->
        <div style="position:absolute;top:80px;left:100px;right:100px;height:16px;background:linear-gradient(90deg,#444,#666,#444);border-radius:8px;box-shadow:0 4px 8px rgba(0,0,0,0.3);"></div>
        <!-- screen border -->
        <div style="position:absolute;top:96px;left:60px;right:60px;height:1000px;background:white;border:4px solid #333;box-shadow:0 10px 40px rgba(0,0,0,0.5);">
          <!-- projected content -->
          <div style="position:absolute;inset:20px;background:#f8f8f8;overflow:hidden;">
            <div style="position:absolute;top:20px;left:0;right:0;text-align:center;">
              <div style="font-family:${SERIF};font-size:${cs(90,city)}px;font-weight:bold;font-style:italic;color:#111;">${C}</div>
              ${PH('#555')}
              <div style="font-family:${FUTURA};font-size:40px;font-weight:bold;color:#E53935;letter-spacing:4px;margin-top:4px;">FREE PHOTO SHOOT</div>
            </div>
            <!-- projected photos -->
            <div style="position:absolute;top:240px;left:20px;right:20px;display:flex;gap:12px;">
              ${[p,p2,p3].map(ph => `<div style="flex:1;height:440px;border-radius:6px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
                <img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/>
              </div>`).join('')}
            </div>
            <!-- projector light effect -->
            <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,transparent 40%,rgba(0,0,0,0.05) 100%);"></div>
          </div>
        </div>
        <!-- projector beam from bottom -->
        <div style="position:absolute;bottom:200px;left:50%;transform:translateX(-50%);width:400px;height:600px;background:linear-gradient(180deg,transparent,rgba(255,255,200,0.03));clip-path:polygon(30% 100%,70% 100%,100% 0%,0% 0%);"></div>
        <!-- projector body -->
        <div style="position:absolute;bottom:100px;left:50%;transform:translateX(-50%);width:200px;height:120px;background:linear-gradient(180deg,#333,#222);border-radius:12px;border:2px solid #444;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
          <!-- lens -->
          <div style="position:absolute;top:30px;left:50%;transform:translateX(-50%);width:60px;height:60px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#888,#333);border:3px solid #555;"></div>
        </div>
        <!-- audience seats silhouette -->
        ${Array.from({length:6}, (_,i) => `<div style="position:absolute;bottom:${240+i*10}px;left:${80+i*160}px;width:100px;height:60px;background:rgba(0,0,0,0.3);border-radius:30px 30px 0 0;"></div>`).join('')}
        <div style="position:absolute;bottom:60px;left:0;right:0;text-align:center;font-family:${SANS};font-size:18px;color:rgba(255,255,255,0.3);">${CTA}</div>
      </div>`
    }

    // 62: PHOTO DARKROOM RED
    case 62: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0000;">
        <!-- red safelight glow -->
        <div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:800px;height:600px;background:radial-gradient(ellipse,rgba(200,0,0,0.15),transparent);"></div>
        <!-- safelight fixture -->
        <div style="position:absolute;top:20px;left:50%;transform:translateX(-50%);width:200px;height:40px;background:#333;border-radius:6px;border:2px solid #444;">
          <div style="position:absolute;inset:4px;background:rgba(255,0,0,0.3);border-radius:4px;"></div>
        </div>
        <div style="position:absolute;top:80px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(110,city)}px;font-weight:bold;font-style:italic;color:#FF1744;text-shadow:0 0 30px rgba(255,23,68,0.4);">${C}</div>
          ${PH('rgba(255,23,68,0.4)')}
          <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:rgba(255,255,255,0.8);letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- clothesline with hanging photos -->
        <div style="position:absolute;top:380px;left:40px;right:40px;height:4px;background:#555;"></div>
        ${[p,p2,p3].map((ph,i) => `
          <!-- clip -->
          <div style="position:absolute;top:368px;left:${140+i*300}px;width:20px;height:30px;background:#888;border-radius:3px;"></div>
          <!-- hanging photo -->
          <div style="position:absolute;top:398px;left:${80+i*300}px;width:260px;height:360px;background:white;padding:8px;box-shadow:0 6px 20px rgba(0,0,0,0.4);transform:rotate(${-3+i*3}deg);">
            <img src="${ph}" style="width:100%;height:100%;object-fit:cover;filter:sepia(0.1);"/>
          </div>
        `).join('')}
        <!-- developing trays at bottom -->
        <div style="position:absolute;bottom:180px;left:60px;right:60px;display:flex;gap:20px;">
          ${['DEVELOPER','STOP','FIXER'].map(label => `
            <div style="flex:1;height:100px;background:#222;border:2px solid #444;border-radius:6px;display:flex;align-items:center;justify-content:center;">
              <div style="font-family:${MONO};font-size:18px;color:rgba(255,0,0,0.4);letter-spacing:2px;">${label}</div>
            </div>
          `).join('')}
        </div>
        <!-- enlarger silhouette -->
        <div style="position:absolute;bottom:300px;right:80px;width:8px;height:400px;background:#333;"></div>
        <div style="position:absolute;bottom:680px;right:40px;width:90px;height:60px;background:#222;border:2px solid #444;border-radius:4px;"></div>
        <div style="position:absolute;bottom:100px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,23,68,0.3);">${CTA}</div>
      </div>`
    }

    // 63: VIEWFINDER
    case 63: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <!-- viewfinder frame -->
        <div style="position:absolute;inset:40px;border:3px solid rgba(255,255,255,0.15);border-radius:12px;"></div>
        <!-- focus brackets -->
        <div style="position:absolute;top:350px;left:250px;width:580px;height:700px;">
          <div style="position:absolute;top:0;left:0;width:60px;height:60px;border-top:3px solid white;border-left:3px solid white;"></div>
          <div style="position:absolute;top:0;right:0;width:60px;height:60px;border-top:3px solid white;border-right:3px solid white;"></div>
          <div style="position:absolute;bottom:0;left:0;width:60px;height:60px;border-bottom:3px solid white;border-left:3px solid white;"></div>
          <div style="position:absolute;bottom:0;right:0;width:60px;height:60px;border-bottom:3px solid white;border-right:3px solid white;"></div>
          <!-- center focus point -->
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;border:2px solid rgba(255,255,255,0.4);border-radius:50%;"></div>
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:6px;height:6px;background:rgba(255,255,255,0.4);border-radius:50%;"></div>
        </div>
        <div style="position:absolute;top:80px;left:60px;">
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:white;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:white;letter-spacing:4px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- HUD info -->
        <div style="position:absolute;top:80px;right:60px;text-align:right;">
          <div style="font-family:${MONO};font-size:18px;color:rgba(255,255,255,0.4);">f/1.8</div>
          <div style="font-family:${MONO};font-size:18px;color:rgba(255,255,255,0.4);">1/125</div>
          <div style="font-family:${MONO};font-size:18px;color:rgba(255,255,255,0.4);">ISO 400</div>
        </div>
        <!-- main photo -->
        <div style="position:absolute;top:360px;left:80px;right:80px;height:680px;border-radius:8px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.5);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <!-- thumbnail strip -->
        <div style="position:absolute;top:1100px;left:80px;right:80px;display:flex;gap:12px;">
          ${[p,p2,p3,p2,p3].map((ph,i) => `<div style="flex:1;height:200px;border-radius:6px;overflow:hidden;border:${i===0?'3px solid white':'2px solid #444'};">
            <img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>`).join('')}
        </div>
        <!-- meter bar -->
        <div style="position:absolute;bottom:280px;left:80px;right:80px;height:6px;background:#333;border-radius:3px;">
          <div style="width:60%;height:100%;background:linear-gradient(90deg,#00E676,#FFD600);border-radius:3px;"></div>
        </div>
        <div style="position:absolute;bottom:240px;left:80px;font-family:${MONO};font-size:14px;color:rgba(255,255,255,0.3);">EV +0.7</div>
        <!-- battery + shots -->
        <div style="position:absolute;bottom:160px;left:80px;right:80px;display:flex;justify-content:space-between;">
          <div style="font-family:${MONO};font-size:16px;color:rgba(255,255,255,0.3);">&#9608;&#9608;&#9608;&#9601; 78%</div>
          <div style="font-family:${MONO};font-size:16px;color:rgba(255,255,255,0.3);">247 shots left</div>
        </div>
        <div style="position:absolute;bottom:100px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,255,255,0.3);">${CTA}</div>
      </div>`
    }

    // 64: CAMERA VIEWFINDER LCD
    case 64: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#111;">
        <!-- LCD screen frame -->
        <div style="position:absolute;top:40px;left:40px;right:40px;bottom:40px;background:#000;border:6px solid #333;border-radius:12px;overflow:hidden;">
          <!-- live view photo -->
          <div style="position:absolute;inset:0;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <!-- LCD overlay grid -->
          <div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(255,255,255,0.02) 0px,transparent 1px,transparent 360px),repeating-linear-gradient(180deg,rgba(255,255,255,0.02) 0px,transparent 1px,transparent 640px);"></div>
          <!-- rule of thirds -->
          <div style="position:absolute;top:33.3%;left:0;right:0;height:1px;background:rgba(255,255,255,0.1);"></div>
          <div style="position:absolute;top:66.6%;left:0;right:0;height:1px;background:rgba(255,255,255,0.1);"></div>
          <div style="position:absolute;left:33.3%;top:0;bottom:0;width:1px;background:rgba(255,255,255,0.1);"></div>
          <div style="position:absolute;left:66.6%;top:0;bottom:0;width:1px;background:rgba(255,255,255,0.1);"></div>
          <!-- focus point -->
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:50px;height:50px;border:2px solid #FF1744;"></div>
          <!-- top info bar -->
          <div style="position:absolute;top:0;left:0;right:0;padding:16px 24px;background:rgba(0,0,0,0.6);display:flex;justify-content:space-between;">
            <div style="font-family:${MONO};font-size:18px;color:white;">M 1/125 f/2.8 ISO400</div>
            <div style="font-family:${MONO};font-size:18px;color:#00FF00;">&#9679; REC</div>
          </div>
          <!-- bottom info -->
          <div style="position:absolute;bottom:0;left:0;right:0;padding:16px 24px;background:rgba(0,0,0,0.6);">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <div style="font-family:${MONO};font-size:16px;color:white;">[RAW+JPEG]</div>
              <div style="font-family:${MONO};font-size:16px;color:white;">AF-C [  ]</div>
              <div style="font-family:${MONO};font-size:16px;color:white;">WB: AUTO</div>
            </div>
            <!-- histogram -->
            <div style="height:40px;display:flex;align-items:flex-end;gap:1px;">
              ${Array.from({length:40}, (_,i) => `<div style="flex:1;height:${8+Math.sin(i*0.3)*20+Math.random()*15}px;background:rgba(255,255,255,0.3);"></div>`).join('')}
            </div>
          </div>
          <!-- title overlay -->
          <div style="position:absolute;top:80px;left:0;right:0;text-align:center;">
            <div style="font-family:${SERIF};font-size:${cs(90,city)}px;font-weight:bold;font-style:italic;color:white;text-shadow:0 4px 12px rgba(0,0,0,0.8);">${C}</div>
            ${PH('rgba(255,255,255,0.5)')}
            <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:white;letter-spacing:4px;margin-top:4px;text-shadow:0 2px 8px rgba(0,0,0,0.8);">FREE PHOTO SHOOT</div>
          </div>
          <!-- side thumbnails -->
          <div style="position:absolute;right:16px;top:200px;display:flex;flex-direction:column;gap:8px;">
            <div style="width:140px;height:100px;border-radius:4px;overflow:hidden;border:2px solid white;">
              <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
            <div style="width:140px;height:100px;border-radius:4px;overflow:hidden;border:2px solid #444;">
              <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
          </div>
        </div>
        <div style="position:absolute;bottom:60px;left:0;right:0;text-align:center;font-family:${SANS};font-size:18px;color:rgba(255,255,255,0.3);">${CTA}</div>
      </div>`
    }

    // 65: PHOTO PRINTER
    case 65: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#E8E8E8;">
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:#333;">${C}</div>
          ${PH('#888')}
          <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:#E53935;letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- printer body -->
        <div style="position:absolute;top:360px;left:60px;right:60px;height:300px;background:linear-gradient(180deg,#F5F5F5,#E0E0E0);border-radius:20px;border:2px solid #ccc;box-shadow:0 8px 24px rgba(0,0,0,0.1);">
          <!-- feed slot -->
          <div style="position:absolute;top:-4px;left:100px;right:100px;height:12px;background:#333;border-radius:6px;"></div>
          <!-- brand -->
          <div style="position:absolute;top:30px;left:40px;font-family:${SANS};font-size:18px;color:#999;letter-spacing:2px;">MADEBYAIDAN</div>
          <!-- status LED -->
          <div style="position:absolute;top:30px;right:40px;display:flex;align-items:center;gap:8px;">
            <div style="width:10px;height:10px;border-radius:50%;background:#00E676;box-shadow:0 0 6px rgba(0,230,118,0.5);"></div>
            <div style="font-family:${SANS};font-size:14px;color:#666;">PRINTING</div>
          </div>
          <!-- output tray -->
          <div style="position:absolute;bottom:-20px;left:80px;right:80px;height:30px;background:#ddd;border-radius:0 0 15px 15px;"></div>
        </div>
        <!-- photos coming out of printer -->
        <div style="position:absolute;top:640px;left:100px;right:100px;">
          <div style="width:100%;height:500px;background:white;padding:16px;box-shadow:0 8px 24px rgba(0,0,0,0.15);margin-bottom:16px;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="display:flex;gap:16px;">
            <div style="flex:1;background:white;padding:12px;box-shadow:0 8px 24px rgba(0,0,0,0.15);">
              <img src="${p2}" style="width:100%;height:300px;object-fit:cover;"/>
            </div>
            <div style="flex:1;background:white;padding:12px;box-shadow:0 8px 24px rgba(0,0,0,0.15);">
              <img src="${p3}" style="width:100%;height:300px;object-fit:cover;"/>
            </div>
          </div>
        </div>
        <!-- paper tray -->
        <div style="position:absolute;bottom:80px;left:80px;right:80px;height:60px;background:white;border:2px solid #ddd;border-radius:8px;display:flex;align-items:center;justify-content:center;">
          <div style="font-family:${SANS};font-size:18px;color:#999;">Fresh prints ready for pickup</div>
        </div>
        <div style="position:absolute;bottom:20px;left:0;right:0;text-align:center;font-family:${SANS};font-size:18px;color:rgba(0,0,0,0.3);">${CTA}</div>
      </div>`
    }

    // 66: PHOTO FRAME SHOP
    case 66: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F5F0E8;">
        <!-- wallpaper pattern -->
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(45deg,rgba(139,115,85,0.03) 0px,transparent 1px,transparent 20px);"></div>
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(90,city)}px;font-weight:bold;font-style:italic;color:#3E2723;">${C}</div>
          ${PH('#5D4037')}
          <div style="font-family:${FUTURA};font-size:42px;font-weight:bold;color:#E53935;letter-spacing:4px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- ornate frame 1 (large) -->
        <div style="position:absolute;top:300px;left:80px;width:560px;height:700px;border:20px solid #8B6914;box-shadow:0 10px 30px rgba(0,0,0,0.2),inset 0 0 10px rgba(0,0,0,0.1);overflow:hidden;">
          <div style="position:absolute;inset:0;border:4px solid #D4AF37;"></div>
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <!-- frame 2 (small, tilted) -->
        <div style="position:absolute;top:340px;right:60px;width:320px;height:400px;border:14px solid #5D4037;box-shadow:0 8px 24px rgba(0,0,0,0.2);transform:rotate(4deg);overflow:hidden;">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <!-- frame 3 (bottom, modern) -->
        <div style="position:absolute;top:1060px;left:50%;transform:translateX(-50%);width:800px;height:480px;border:8px solid #333;box-shadow:0 8px 24px rgba(0,0,0,0.2);overflow:hidden;">
          <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <!-- mat board accent -->
        <div style="position:absolute;top:1040px;left:50%;transform:translateX(-50%);width:840px;height:520px;border:4px solid #E0D8C8;z-index:-1;"></div>
        <!-- picture hanging wires -->
        <div style="position:absolute;top:260px;left:360px;width:2px;height:40px;background:#888;"></div>
        <div style="position:absolute;top:300px;right:180px;width:2px;height:40px;background:#888;transform:rotate(10deg);"></div>
        <div style="position:absolute;bottom:200px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(62,39,35,0.35);">${CTA}</div>
      </div>`
    }

    // 67: GALLERY OPENING
    case 67: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F8F8F8;">
        <!-- gallery walls -->
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,#F0F0F0,#E8E8E8);"></div>
        <!-- track lighting -->
        <div style="position:absolute;top:0;left:0;right:0;height:40px;background:#333;">
          ${Array.from({length:6}, (_,i) => `<div style="position:absolute;top:30px;left:${80+i*180}px;width:30px;height:50px;background:#444;border-radius:0 0 15px 15px;">
            <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:8px;height:8px;border-radius:50%;background:#FFD600;box-shadow:0 0 10px rgba(255,214,0,0.4);"></div>
          </div>`).join('')}
        </div>
        <!-- exhibition title -->
        <div style="position:absolute;top:120px;left:60px;">
          <div style="font-family:${FUTURA};font-size:18px;color:#999;letter-spacing:6px;">OPENING NIGHT</div>
          <div style="font-family:${SERIF};font-size:${cs(90,city)}px;font-weight:bold;font-style:italic;color:#111;">${C}</div>
          ${PH('#888')}
          <div style="font-family:${FUTURA};font-size:40px;font-weight:bold;color:#E53935;letter-spacing:4px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- artworks on wall -->
        <div style="position:absolute;top:440px;left:60px;width:600px;height:500px;background:white;box-shadow:0 4px 20px rgba(0,0,0,0.08);overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <!-- wall label -->
        <div style="position:absolute;top:960px;left:60px;width:200px;">
          <div style="font-family:${SERIF};font-size:18px;font-style:italic;color:#333;">Untitled Portrait</div>
          <div style="font-family:${SANS};font-size:14px;color:#888;">2026, Digital photograph</div>
        </div>
        <div style="position:absolute;top:480px;right:60px;width:320px;height:400px;background:white;box-shadow:0 4px 20px rgba(0,0,0,0.08);overflow:hidden;">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:1060px;left:50%;transform:translateX(-50%);width:700px;height:440px;background:white;box-shadow:0 4px 20px rgba(0,0,0,0.08);overflow:hidden;">
          <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <!-- red dot (sold) -->
        <div style="position:absolute;top:970px;left:680px;width:16px;height:16px;border-radius:50%;background:#E53935;"></div>
        <!-- wine glass silhouettes -->
        ${Array.from({length:3}, (_,i) => `<div style="position:absolute;bottom:${180+i*20}px;left:${200+i*300}px;width:3px;height:60px;background:rgba(0,0,0,0.06);"></div>`).join('')}
        <div style="position:absolute;bottom:100px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(0,0,0,0.3);">${CTA}</div>
      </div>`
    }

    // 68: ART AUCTION
    case 68: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#1a0a00,#2a1500);">
        <!-- velvet curtain sides -->
        <div style="position:absolute;top:0;left:0;width:120px;height:100%;background:linear-gradient(90deg,#5a0a0a,#8b1a1a,#5a0a0a);"></div>
        <div style="position:absolute;top:0;right:0;width:120px;height:100%;background:linear-gradient(90deg,#5a0a0a,#8b1a1a,#5a0a0a);"></div>
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${FUTURA};font-size:22px;color:rgba(212,175,55,0.5);letter-spacing:6px;">LOT #${city.length}</div>
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:#D4AF37;text-shadow:0 2px 12px rgba(212,175,55,0.3);">${C}</div>
          ${PH('rgba(212,175,55,0.4)')}
          <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:white;letter-spacing:4px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- main lot (framed on easel) -->
        <div style="position:absolute;top:380px;left:50%;transform:translateX(-50%);">
          <!-- easel legs -->
          <div style="position:absolute;bottom:-200px;left:100px;width:6px;height:200px;background:#5D4037;transform:rotate(-5deg);"></div>
          <div style="position:absolute;bottom:-200px;right:100px;width:6px;height:200px;background:#5D4037;transform:rotate(5deg);"></div>
          <!-- frame -->
          <div style="width:700px;height:560px;border:16px solid #D4AF37;box-shadow:0 10px 40px rgba(0,0,0,0.5);overflow:hidden;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <!-- bidding info -->
        <div style="position:absolute;top:1020px;left:140px;right:140px;background:rgba(0,0,0,0.5);border:2px solid #D4AF37;border-radius:8px;padding:20px;text-align:center;">
          <div style="font-family:${FUTURA};font-size:24px;color:#D4AF37;letter-spacing:4px;">CURRENT BID</div>
          <div style="font-family:${SERIF};font-size:64px;font-weight:bold;color:#00E676;">FREE</div>
        </div>
        <!-- more lots preview -->
        <div style="position:absolute;top:1220px;left:140px;right:140px;display:flex;gap:16px;">
          <div style="flex:1;height:320px;border:4px solid #D4AF37;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.4);">
            <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="flex:1;height:320px;border:4px solid #D4AF37;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.4);">
            <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <!-- paddle -->
        <div style="position:absolute;bottom:160px;right:160px;width:80px;height:120px;background:#D4AF37;border-radius:40px 40px 8px 8px;box-shadow:0 4px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;transform:rotate(15deg);">
          <div style="font-family:${FUTURA};font-size:20px;font-weight:bold;color:#3a2000;">FREE</div>
        </div>
        <div style="position:absolute;bottom:100px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(212,175,55,0.35);">${CTA}</div>
      </div>`
    }

    // 69: SCULPTURE PEDESTAL
    case 69: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#F5F5F5,#E8E8E8);">
        <!-- gallery wall -->
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,#F0F0F0 0%,#E0E0E0 80%,#BDBDBD 100%);"></div>
        <!-- spotlight from above -->
        <div style="position:absolute;top:0;left:250px;width:580px;height:1200px;background:linear-gradient(180deg,rgba(255,250,220,0.2),transparent);clip-path:polygon(30% 0%,70% 0%,100% 100%,0% 100%);"></div>
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:#333;">${C}</div>
          ${PH('#888')}
          <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:#E53935;letter-spacing:4px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- main pedestal with photo -->
        <div style="position:absolute;top:360px;left:50%;transform:translateX(-50%);">
          <!-- photo as sculpture -->
          <div style="width:500px;height:660px;border-radius:8px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <!-- pedestal column -->
          <div style="width:400px;height:200px;background:linear-gradient(180deg,#E0E0E0,#BDBDBD,#9E9E9E);margin:0 auto;border-radius:4px;box-shadow:0 8px 20px rgba(0,0,0,0.15);"></div>
        </div>
        <!-- side pedestals -->
        <div style="position:absolute;bottom:320px;left:60px;">
          <div style="width:240px;height:300px;border-radius:6px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.15);">
            <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="width:180px;height:120px;background:linear-gradient(180deg,#D0D0D0,#AAA);margin:0 auto;border-radius:3px;"></div>
        </div>
        <div style="position:absolute;bottom:340px;right:60px;">
          <div style="width:240px;height:300px;border-radius:6px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.15);">
            <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="width:180px;height:120px;background:linear-gradient(180deg,#D0D0D0,#AAA);margin:0 auto;border-radius:3px;"></div>
        </div>
        <!-- museum info card -->
        <div style="position:absolute;bottom:80px;left:50%;transform:translateX(-50%);width:500px;padding:16px;background:white;border:1px solid #ddd;text-align:center;">
          <div style="font-family:${SERIF};font-size:22px;font-style:italic;color:#333;">Free Photo Session</div>
          <div style="font-family:${SANS};font-size:16px;color:#999;margin-top:4px;">${city}, Philippines — 2026</div>
          <div style="font-family:${SANS};font-size:16px;color:#bbb;margin-top:4px;">${CTA}</div>
        </div>
      </div>`
    }

    // 70: CANDY BAR WRAPPER
    case 70: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#6A1B9A,#4A148C);">
        <!-- foil texture -->
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(135deg,rgba(255,255,255,0.02) 0px,transparent 2px,transparent 8px);"></div>
        <!-- wrapper shape -->
        <div style="position:absolute;top:100px;left:60px;right:60px;bottom:100px;background:linear-gradient(180deg,#8E24AA,#6A1B9A,#4A148C);border-radius:16px;border:3px solid rgba(255,255,255,0.1);box-shadow:0 10px 40px rgba(0,0,0,0.4);overflow:hidden;">
          <!-- wrapper crinkle at top -->
          <div style="position:absolute;top:0;left:0;right:0;height:60px;background:repeating-linear-gradient(90deg,rgba(255,255,255,0.05) 0px,transparent 20px,rgba(255,255,255,0.03) 40px);"></div>
          <!-- brand name -->
          <div style="position:absolute;top:80px;left:0;right:0;text-align:center;">
            <div style="font-family:${DISPLAY};font-size:${cs(100,city)}px;color:white;text-shadow:0 4px 12px rgba(0,0,0,0.4);">${C}</div>
            ${PH('rgba(255,255,255,0.5)')}
          </div>
          <!-- diagonal gold banner -->
          <div style="position:absolute;top:260px;left:-40px;right:-40px;height:80px;background:linear-gradient(90deg,#D4AF37,#FFD700,#D4AF37);transform:rotate(-3deg);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
            <div style="font-family:${FUTURA};font-size:38px;font-weight:bold;color:#4A148C;letter-spacing:6px;">FREE PHOTO SHOOT</div>
          </div>
          <!-- photo as chocolate bar segments -->
          <div style="position:absolute;top:380px;left:30px;right:30px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
            ${[p,p2,p3,p,p2,p3].map(ph => `<div style="height:260px;border-radius:8px;overflow:hidden;box-shadow:inset 0 2px 6px rgba(0,0,0,0.3),0 4px 8px rgba(0,0,0,0.2);">
              <img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>`).join('')}
          </div>
          <!-- nutrition facts parody -->
          <div style="position:absolute;bottom:40px;left:30px;width:400px;background:rgba(0,0,0,0.3);border:2px solid rgba(255,255,255,0.1);border-radius:8px;padding:16px;">
            <div style="font-family:${FUTURA};font-size:20px;color:white;font-weight:bold;border-bottom:2px solid rgba(255,255,255,0.2);padding-bottom:8px;margin-bottom:8px;">PHOTO FACTS</div>
            <div style="font-family:${MONO};font-size:16px;color:rgba(255,255,255,0.6);line-height:1.8;">
              Duration.........30-60min<br/>
              Location.........${city}<br/>
              Cost.............FREE<br/>
              Quality..........Premium<br/>
              Flavor...........Amazing
            </div>
          </div>
        </div>
      </div>`
    }

    // 71: ICE CREAM TRUCK
    case 71: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#87CEEB,#B0E2FF);">
        <!-- sun -->
        <div style="position:absolute;top:40px;right:80px;width:120px;height:120px;border-radius:50%;background:#FFD600;box-shadow:0 0 60px rgba(255,214,0,0.4);"></div>
        <!-- clouds -->
        <div style="position:absolute;top:60px;left:100px;width:200px;height:60px;background:white;border-radius:30px;opacity:0.7;"></div>
        <div style="position:absolute;top:120px;left:400px;width:160px;height:50px;background:white;border-radius:25px;opacity:0.5;"></div>
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:${cs(90,city)}px;color:white;text-shadow:0 2px 8px rgba(0,0,0,0.2);">${C}</div>
          ${PH('rgba(255,255,255,0.7)')}
        </div>
        <!-- truck body -->
        <div style="position:absolute;top:300px;left:60px;right:60px;height:1100px;background:white;border-radius:20px;border:4px solid #eee;box-shadow:0 10px 40px rgba(0,0,0,0.15);overflow:hidden;">
          <!-- awning -->
          <div style="position:absolute;top:0;left:0;right:0;height:80px;background:repeating-linear-gradient(90deg,#FF6B6B 0px,#FF6B6B 60px,#FFE66D 60px,#FFE66D 120px);border-radius:16px 16px 0 0;"></div>
          <!-- menu sign -->
          <div style="position:absolute;top:100px;left:30px;right:30px;height:120px;background:#FF6B6B;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:white;letter-spacing:4px;">FREE PHOTO SHOOT</div>
            <div style="font-family:${SANS};font-size:20px;color:rgba(255,255,255,0.8);">today's special</div>
          </div>
          <!-- menu items with photos -->
          <div style="position:absolute;top:250px;left:30px;right:30px;display:flex;gap:16px;">
            ${[{name:'THE CLASSIC',ph:p},{name:'DOUBLE SCOOP',ph:p2},{name:'SUNDAE',ph:p3}].map(item => `
              <div style="flex:1;background:#FFF9E6;border-radius:12px;overflow:hidden;border:2px solid #FFE66D;">
                <div style="height:280px;overflow:hidden;">
                  <img src="${item.ph}" style="width:100%;height:100%;object-fit:cover;"/>
                </div>
                <div style="padding:12px;text-align:center;">
                  <div style="font-family:${FUTURA};font-size:18px;font-weight:bold;color:#333;">${item.name}</div>
                  <div style="font-family:${DISPLAY};font-size:28px;color:#FF6B6B;margin-top:4px;">FREE</div>
                </div>
              </div>
            `).join('')}
          </div>
          <!-- serving window -->
          <div style="position:absolute;bottom:200px;left:30px;right:30px;height:250px;background:#FFF9E6;border-radius:12px;border:3px solid #FFE66D;overflow:hidden;display:flex;align-items:center;justify-content:center;">
            <div style="font-family:${SERIF};font-size:36px;font-style:italic;color:#333;text-align:center;">Serving free portraits<br/>all day!</div>
          </div>
          <!-- wheels -->
          <div style="position:absolute;bottom:-30px;left:100px;width:80px;height:80px;border-radius:50%;background:#333;border:4px solid #555;"></div>
          <div style="position:absolute;bottom:-30px;right:100px;width:80px;height:80px;border-radius:50%;background:#333;border:4px solid #555;"></div>
        </div>
        <div style="position:absolute;bottom:60px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(0,0,0,0.3);">${CTA}</div>
      </div>`
    }

    // 72: FOOD TRUCK
    case 72: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#FF6F00,#E65100);">
        <!-- texture -->
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(45deg,rgba(0,0,0,0.03) 0px,transparent 2px,transparent 12px);"></div>
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:${cs(100,city)}px;color:white;text-shadow:0 4px 12px rgba(0,0,0,0.3);">${C}</div>
          ${PH('rgba(255,255,255,0.6)')}
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:white;letter-spacing:5px;margin-top:4px;text-shadow:0 2px 8px rgba(0,0,0,0.3);">FREE PHOTO SHOOT</div>
        </div>
        <!-- truck window (chalkboard style menu) -->
        <div style="position:absolute;top:340px;left:80px;right:80px;bottom:200px;background:#2a2a2a;border-radius:16px;border:8px solid #5D4037;box-shadow:0 10px 40px rgba(0,0,0,0.3);overflow:hidden;">
          <!-- chalkboard texture -->
          <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,0.01) 0px,transparent 1px,transparent 4px);"></div>
          <!-- menu title -->
          <div style="position:absolute;top:20px;left:0;right:0;text-align:center;">
            <div style="font-family:${SERIF};font-size:40px;font-style:italic;color:white;text-decoration:underline;">TODAY'S MENU</div>
          </div>
          <!-- photo menu items -->
          <div style="position:absolute;top:90px;left:20px;right:20px;">
            ${[{name:'PORTRAIT SPECIAL',desc:'30-60 min session',ph:p},{name:'THE GOLDEN HOUR',desc:'Sunset magic',ph:p2},{name:'EDITORIAL FEAST',desc:'Full creative spread',ph:p3}].map((item,i) => `
              <div style="display:flex;gap:16px;margin-bottom:16px;align-items:center;">
                <div style="width:220px;height:260px;border-radius:8px;overflow:hidden;border:3px solid rgba(255,255,255,0.2);flex-shrink:0;">
                  <img src="${item.ph}" style="width:100%;height:100%;object-fit:cover;"/>
                </div>
                <div style="flex:1;">
                  <div style="font-family:${FUTURA};font-size:28px;color:#FFD600;letter-spacing:2px;">${item.name}</div>
                  <div style="font-family:${SERIF};font-size:22px;font-style:italic;color:rgba(255,255,255,0.6);margin-top:4px;">${item.desc}</div>
                  <div style="font-family:${DISPLAY};font-size:36px;color:#00E676;margin-top:8px;">FREE</div>
                  <div style="width:100%;height:1px;background:rgba(255,255,255,0.1);margin-top:12px;"></div>
                </div>
              </div>
            `).join('')}
          </div>
          <!-- order here arrow -->
          <div style="position:absolute;bottom:20px;right:20px;font-family:${SERIF};font-size:28px;font-style:italic;color:rgba(255,255,255,0.4);">order here &rarr;</div>
        </div>
        <div style="position:absolute;bottom:120px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,255,255,0.4);">${CTA}</div>
      </div>`
    }

    // 73: SUSHI CONVEYOR
    case 73: {
      const plates = Array.from({length:5}, (_,i) => {
        const colors = ['#E53935','#1E88E5','#FFD600','#43A047','#E040FB']
        const y = 500 + i * 260
        return `
          <!-- conveyor belt segment -->
          <div style="position:absolute;top:${y}px;left:0;right:0;height:20px;background:linear-gradient(90deg,#666,#888,#666);"></div>
          <!-- plate with photo -->
          <div style="position:absolute;top:${y-120}px;left:${100+i*60}px;width:300px;height:120px;">
            <div style="width:100%;height:100%;border-radius:50%;background:${colors[i]};box-shadow:0 4px 12px rgba(0,0,0,0.2);overflow:hidden;display:flex;align-items:center;justify-content:center;">
              <div style="width:260px;height:100px;border-radius:50%;overflow:hidden;border:2px solid rgba(255,255,255,0.3);">
                <img src="${[p,p2,p3,p,p2][i]}" style="width:100%;height:100%;object-fit:cover;"/>
              </div>
            </div>
          </div>
        `
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a1a1a;">
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:white;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:#E53935;letter-spacing:4px;margin-top:4px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SERIF};font-size:24px;font-style:italic;color:rgba(255,255,255,0.3);margin-top:8px;">all you can shoot</div>
        </div>
        <!-- counter top -->
        <div style="position:absolute;top:360px;left:0;right:0;height:20px;background:linear-gradient(180deg,#8D6E63,#6D4C41);"></div>
        ${plates}
        <!-- large feature photos -->
        <div style="position:absolute;top:400px;right:60px;width:500px;height:400px;border-radius:8px;overflow:hidden;border:3px solid rgba(255,255,255,0.1);box-shadow:0 8px 24px rgba(0,0,0,0.4);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:860px;right:80px;width:460px;height:360px;border-radius:8px;overflow:hidden;border:3px solid rgba(255,255,255,0.1);box-shadow:0 8px 24px rgba(0,0,0,0.4);">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <!-- price labels -->
        ${Array.from({length:5}, (_,i) => {
          const colors = ['#E53935','#1E88E5','#FFD600','#43A047','#E040FB']
          return `<div style="position:absolute;top:${1340+Math.floor(i/3)*50}px;left:${60+(i%3)*340}px;display:flex;align-items:center;gap:8px;">
            <div style="width:20px;height:20px;border-radius:50%;background:${colors[i]};"></div>
            <div style="font-family:${MONO};font-size:16px;color:rgba(255,255,255,0.4);">FREE</div>
          </div>`
        }).join('')}
        <div style="position:absolute;bottom:200px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,255,255,0.3);">${CTA}</div>
      </div>`
    }

    // 74: PIZZA BOX
    case 74: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#E8DCC8;">
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:${cs(100,city)}px;color:#E53935;">${C}</div>
          ${PH('#8B4513')}
          <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:#2E7D32;letter-spacing:4px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- pizza box -->
        <div style="position:absolute;top:320px;left:80px;right:80px;height:920px;background:#D2B48C;border-radius:8px;border:3px solid #8B7355;box-shadow:0 10px 30px rgba(0,0,0,0.2);">
          <!-- corrugated pattern -->
          <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,0.02) 0px,transparent 1px,transparent 4px);border-radius:8px;"></div>
          <!-- pizza logo circle -->
          <div style="position:absolute;top:20px;left:50%;transform:translateX(-50%);width:200px;height:200px;border:4px solid #E53935;border-radius:50%;display:flex;align-items:center;justify-content:center;">
            <div style="font-family:${SERIF};font-size:28px;font-weight:bold;font-style:italic;color:#E53935;text-align:center;">PHOTO<br/>PIE</div>
          </div>
          <!-- italian flag stripe -->
          <div style="position:absolute;top:240px;left:0;right:0;height:8px;display:flex;">
            <div style="flex:1;background:#2E7D32;"></div>
            <div style="flex:1;background:white;"></div>
            <div style="flex:1;background:#E53935;"></div>
          </div>
          <!-- photos as pizza slices arranged in circle -->
          <div style="position:absolute;top:280px;left:50px;right:50px;height:600px;border-radius:50%;overflow:hidden;border:6px solid #D4AF37;">
            <div style="display:flex;height:50%;">
              <div style="flex:1;overflow:hidden;border-right:3px solid #D4AF37;border-bottom:3px solid #D4AF37;">
                <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
              </div>
              <div style="flex:1;overflow:hidden;border-bottom:3px solid #D4AF37;">
                <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
              </div>
            </div>
            <div style="display:flex;height:50%;">
              <div style="flex:1;overflow:hidden;border-right:3px solid #D4AF37;">
                <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
              </div>
              <div style="flex:1;overflow:hidden;">
                <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
              </div>
            </div>
            <!-- center circle -->
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:80px;height:80px;border-radius:50%;background:#D4AF37;border:3px solid #8B6914;display:flex;align-items:center;justify-content:center;">
              <div style="font-family:${FUTURA};font-size:16px;font-weight:bold;color:white;">FREE</div>
            </div>
          </div>
        </div>
        <!-- order ticket -->
        <div style="position:absolute;bottom:200px;left:80px;right:80px;background:white;border:1px dashed #ccc;border-radius:8px;padding:16px;text-align:center;">
          <div style="font-family:${MONO};font-size:20px;color:#333;">ORDER: FREE PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:16px;color:#999;margin-top:4px;">TOTAL: $0.00</div>
        </div>
        <div style="position:absolute;bottom:120px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(0,0,0,0.3);">${CTA}</div>
      </div>`
    }

    // 75: BUBBLE TEA
    case 75: {
      const bubbles = Array.from({length:30}, (_,i) => {
        const x = 280 + (i * 37) % 520
        const y = 1000 + (i * 29) % 500
        const size = 20 + (i % 5) * 6
        return `<div style="position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#555,#222);box-shadow:inset -2px -2px 4px rgba(0,0,0,0.3);"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#FFE0F0,#FFB6C1,#FF69B4);">
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:white;text-shadow:0 2px 8px rgba(0,0,0,0.15);">${C}</div>
          ${PH('rgba(255,255,255,0.7)')}
          <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:white;letter-spacing:4px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- cup body -->
        <div style="position:absolute;top:340px;left:240px;right:240px;bottom:120px;background:rgba(255,255,255,0.4);border-radius:30px 30px 60px 60px;border:3px solid rgba(255,255,255,0.5);overflow:hidden;">
          <!-- drink gradient -->
          <div style="position:absolute;bottom:0;left:0;right:0;height:70%;background:linear-gradient(180deg,rgba(200,100,150,0.4),rgba(150,50,100,0.6));"></div>
          ${bubbles}
          <!-- photos floating in drink -->
          <div style="position:absolute;top:40px;left:30px;width:240px;height:320px;border-radius:10px;overflow:hidden;transform:rotate(-4deg);box-shadow:0 6px 20px rgba(0,0,0,0.2);border:3px solid white;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="position:absolute;top:80px;right:30px;width:220px;height:300px;border-radius:10px;overflow:hidden;transform:rotate(3deg);box-shadow:0 6px 20px rgba(0,0,0,0.2);border:3px solid white;">
            <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="position:absolute;bottom:200px;left:50%;transform:translateX(-50%);width:260px;height:300px;border-radius:10px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.2);border:3px solid white;">
            <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <!-- dome lid -->
        <div style="position:absolute;top:290px;left:220px;right:220px;height:70px;background:rgba(255,255,255,0.3);border-radius:50%;border:3px solid rgba(255,255,255,0.4);"></div>
        <!-- straw -->
        <div style="position:absolute;top:200px;left:50%;transform:translateX(-50%) rotate(8deg);width:20px;height:600px;background:repeating-linear-gradient(180deg,#FF1744 0px,#FF1744 30px,white 30px,white 60px);border-radius:10px;"></div>
        <div style="position:absolute;bottom:60px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,255,255,0.5);">${CTA}</div>
      </div>`
    }

    // 76: DONUT BOX
    case 76: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#FF8F00;">
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:${cs(100,city)}px;color:white;text-shadow:0 4px 8px rgba(0,0,0,0.2);">${C}</div>
          ${PH('rgba(255,255,255,0.6)')}
          <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:white;letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- box -->
        <div style="position:absolute;top:340px;left:60px;right:60px;height:1200px;background:white;border-radius:12px;border:3px solid #eee;box-shadow:0 10px 40px rgba(0,0,0,0.15);overflow:hidden;">
          <!-- box lid open effect -->
          <div style="position:absolute;top:0;left:0;right:0;height:20px;background:linear-gradient(180deg,rgba(0,0,0,0.05),transparent);"></div>
          <!-- donut grid (photos in circles) -->
          <div style="position:absolute;top:30px;left:30px;right:30px;display:grid;grid-template-columns:repeat(3,1fr);gap:20px;">
            ${[p,p2,p3,p3,p,p2,p2,p3,p].map((ph,i) => {
              const glazeColors = ['#FF69B4','#8B4513','#FFD600','#FF6B6B','#9C27B0','#FF8F00','#43A047','#1E88E5','#E040FB']
              return `<div style="aspect-ratio:1;border-radius:50%;background:${glazeColors[i]};padding:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                <div style="width:100%;height:100%;border-radius:50%;overflow:hidden;border:4px solid rgba(255,255,255,0.4);">
                  <img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/>
                </div>
              </div>`
            }).join('')}
          </div>
          <!-- sprinkles decoration -->
          ${Array.from({length:15}, (_,i) => {
            const x = 40 + (i * 63) % 860
            const y = 1050 + (i * 27) % 100
            const colors = ['#E53935','#FDD835','#43A047','#1E88E5','#FF6F00']
            return `<div style="position:absolute;left:${x}px;top:${y}px;width:4px;height:14px;background:${colors[i%5]};border-radius:2px;transform:rotate(${i*30}deg);"></div>`
          }).join('')}
        </div>
        <div style="position:absolute;bottom:120px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,255,255,0.5);">${CTA}</div>
      </div>`
    }

    // 77: POPCORN BUCKET
    case 77: {
      const kernels = Array.from({length:20}, (_,i) => {
        const x = 200 + (i * 43) % 680
        const y = 200 + (i * 67) % 400
        const size = 20 + (i % 4) * 8
        return `<div style="position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;border-radius:${40+i%20}%;background:radial-gradient(circle at 40% 35%,#FFF9C4,#FFECB3,#FFD54F);box-shadow:0 2px 4px rgba(0,0,0,0.1);transform:rotate(${i*25}deg);"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#1a1a2e,#0a0a1a);">
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:white;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:#FFD600;letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- bucket shape -->
        <div style="position:absolute;top:350px;left:140px;right:140px;bottom:200px;">
          <!-- bucket body (tapered) -->
          <div style="position:absolute;bottom:0;left:40px;right:40px;height:1000px;background:linear-gradient(90deg,#E53935,#FF1744,#E53935);clip-path:polygon(8% 0%,92% 0%,100% 100%,0% 100%);border-radius:0 0 20px 20px;overflow:hidden;">
            <!-- red and white stripes -->
            <div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,#E53935 0px,#E53935 80px,white 80px,white 160px);"></div>
          </div>
          <!-- rim -->
          <div style="position:absolute;top:0;left:20px;right:20px;height:50px;background:linear-gradient(180deg,#D32F2F,#B71C1C);border-radius:50%;"></div>
          <!-- popcorn pile with photos -->
          <div style="position:absolute;top:-100px;left:0;right:0;height:500px;">
            ${kernels}
            <!-- photos peeking out of popcorn -->
            <div style="position:absolute;top:50px;left:60px;width:240px;height:320px;border-radius:8px;overflow:hidden;transform:rotate(-8deg);box-shadow:0 6px 20px rgba(0,0,0,0.3);border:3px solid white;">
              <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
            <div style="position:absolute;top:20px;right:60px;width:240px;height:320px;border-radius:8px;overflow:hidden;transform:rotate(6deg);box-shadow:0 6px 20px rgba(0,0,0,0.3);border:3px solid white;">
              <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
            <div style="position:absolute;top:120px;left:50%;transform:translateX(-50%);width:260px;height:280px;border-radius:8px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.3);border:3px solid white;">
              <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
          </div>
        </div>
        <div style="position:absolute;bottom:120px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,214,0,0.35);">${CTA}</div>
      </div>`
    }

    // 78: COTTON CANDY
    case 78: {
      const puffs = Array.from({length:20}, (_,i) => {
        const x = 200 + (i * 47) % 680
        const y = 300 + (i * 63) % 600
        const size = 60 + (i % 5) * 30
        const colors = ['rgba(255,182,193,0.4)','rgba(200,162,255,0.3)','rgba(173,216,255,0.3)','rgba(255,218,185,0.3)']
        return `<div style="position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;border-radius:50%;background:${colors[i%4]};filter:blur(10px);"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#FCE4EC,#F3E5F5,#E8EAF6);">
        ${puffs}
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:#AD1457;text-shadow:0 2px 8px rgba(0,0,0,0.1);">${C}</div>
          ${PH('rgba(173,20,87,0.4)')}
          <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:#7B1FA2;letter-spacing:4px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- cotton candy cloud with photos -->
        <div style="position:absolute;top:320px;left:150px;right:150px;height:900px;">
          <!-- fluffy shape -->
          <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,rgba(255,182,193,0.6),rgba(200,162,255,0.4),transparent 70%);border-radius:50%;"></div>
          <!-- photos inside -->
          <div style="position:absolute;top:80px;left:40px;width:300px;height:400px;border-radius:12px;overflow:hidden;transform:rotate(-4deg);box-shadow:0 8px 24px rgba(0,0,0,0.15);border:4px solid white;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="position:absolute;top:120px;right:40px;width:280px;height:380px;border-radius:12px;overflow:hidden;transform:rotate(3deg);box-shadow:0 8px 24px rgba(0,0,0,0.15);border:4px solid white;">
            <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="position:absolute;bottom:120px;left:50%;transform:translateX(-50%);width:320px;height:340px;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.15);border:4px solid white;">
            <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <!-- stick -->
        <div style="position:absolute;bottom:100px;left:50%;transform:translateX(-50%);width:16px;height:400px;background:linear-gradient(90deg,#DDD,#F5F5F5,#DDD);border-radius:8px;"></div>
        <div style="position:absolute;bottom:60px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(173,20,87,0.35);">${CTA}</div>
      </div>`
    }

    // 79: LOLLIPOP
    case 79: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#E8F5E9,#C8E6C9);">
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:${cs(100,city)}px;color:#E53935;text-shadow:0 2px 8px rgba(0,0,0,0.1);">${C}</div>
          ${PH('rgba(229,57,53,0.5)')}
          <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:#2E7D32;letter-spacing:4px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- main lollipop (photo in circle) -->
        <div style="position:absolute;top:320px;left:50%;transform:translateX(-50%);width:650px;height:650px;border-radius:50%;background:conic-gradient(#E53935 0deg,#E53935 60deg,#FFD600 60deg,#FFD600 120deg,#1E88E5 120deg,#1E88E5 180deg,#E53935 180deg,#E53935 240deg,#FFD600 240deg,#FFD600 300deg,#1E88E5 300deg,#1E88E5 360deg);box-shadow:0 10px 40px rgba(0,0,0,0.15);">
          <!-- inner circle with photo -->
          <div style="position:absolute;inset:40px;border-radius:50%;overflow:hidden;border:6px solid white;box-shadow:inset 0 4px 12px rgba(0,0,0,0.1);">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <!-- stick -->
        <div style="position:absolute;top:960px;left:50%;transform:translateX(-50%);width:24px;height:500px;background:linear-gradient(90deg,#DDD,#F5F5F5,#DDD);border-radius:12px;"></div>
        <!-- smaller lollipops with p2, p3 -->
        <div style="position:absolute;bottom:260px;left:60px;">
          <div style="width:280px;height:280px;border-radius:50%;background:conic-gradient(#FF69B4,#FF9100,#00BCD4,#FF69B4);box-shadow:0 6px 20px rgba(0,0,0,0.1);">
            <div style="position:absolute;inset:20px;border-radius:50%;overflow:hidden;border:4px solid white;">
              <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
          </div>
          <div style="width:14px;height:200px;background:#DDD;border-radius:7px;margin:0 auto;"></div>
        </div>
        <div style="position:absolute;bottom:300px;right:60px;">
          <div style="width:260px;height:260px;border-radius:50%;background:conic-gradient(#7C4DFF,#00E676,#FFD600,#7C4DFF);box-shadow:0 6px 20px rgba(0,0,0,0.1);">
            <div style="position:absolute;inset:20px;border-radius:50%;overflow:hidden;border:4px solid white;">
              <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
          </div>
          <div style="width:14px;height:180px;background:#DDD;border-radius:7px;margin:0 auto;"></div>
        </div>
        <div style="position:absolute;bottom:60px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(46,125,50,0.4);">${CTA}</div>
      </div>`
    }

    // 80: SNEAKER BOX
    case 80: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#111;">
        <!-- shelf background -->
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(180deg,#111 0px,#111 480px,#1a1a1a 480px,#1a1a1a 482px);"></div>
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:${cs(100,city)}px;color:white;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:#FF6F00;letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- shoe box -->
        <div style="position:absolute;top:340px;left:80px;right:80px;height:600px;position:relative;">
          <!-- box lid (open, tilted) -->
          <div style="position:absolute;top:-100px;left:-20px;width:960px;height:200px;background:linear-gradient(180deg,#E65100,#FF6F00);border-radius:8px;transform:perspective(600px) rotateX(-20deg);transform-origin:bottom;box-shadow:0 -4px 12px rgba(0,0,0,0.2);">
            <!-- brand on lid -->
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:${FUTURA};font-size:48px;font-weight:bold;color:white;letter-spacing:8px;">MADEBYAIDAN</div>
          </div>
          <!-- box body -->
          <div style="position:absolute;top:60px;left:0;right:0;height:540px;background:linear-gradient(180deg,#E65100,#BF360C);border-radius:0 0 8px 8px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.3);">
            <!-- tissue paper -->
            <div style="position:absolute;top:0;left:0;right:0;height:80px;background:rgba(255,255,255,0.1);"></div>
            <!-- photos inside box -->
            <div style="position:absolute;top:20px;left:20px;right:20px;bottom:20px;display:flex;gap:12px;">
              ${[p,p2,p3].map(ph => `<div style="flex:1;border-radius:6px;overflow:hidden;border:3px solid rgba(255,255,255,0.2);box-shadow:0 6px 16px rgba(0,0,0,0.3);">
                <img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/>
              </div>`).join('')}
            </div>
          </div>
        </div>
        <!-- size label -->
        <div style="position:absolute;top:1020px;left:80px;width:200px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.1);border-radius:4px;padding:12px;">
          <div style="font-family:${MONO};font-size:14px;color:rgba(255,255,255,0.4);">SIZE: FREE</div>
          <div style="font-family:${MONO};font-size:14px;color:rgba(255,255,255,0.4);">COLOR: ${C}</div>
          <div style="font-family:${MONO};font-size:14px;color:rgba(255,255,255,0.4);">STYLE: PORTRAIT</div>
        </div>
        <!-- more boxes stacked -->
        ${Array.from({length:3}, (_,i) => `<div style="position:absolute;top:${1100+i*80}px;left:${60+i*40}px;right:${60+i*40}px;height:70px;background:${['#E65100','#BF360C','#FF6F00'][i]};border-radius:4px;border:2px solid rgba(255,255,255,0.05);"></div>`).join('')}
        <div style="position:absolute;bottom:180px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,111,0,0.35);">${CTA}</div>
      </div>`
    }

    // 81: PERFUME AD
    case 81: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <!-- luxury gradient -->
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,#1a1020,#000);"></div>
        <!-- sparkle particles -->
        ${Array.from({length:30}, (_,i) => `<div style="position:absolute;left:${(i*71)%1060}px;top:${(i*47)%1880}px;width:${2+(i%3)}px;height:${2+(i%3)}px;border-radius:50%;background:rgba(212,175,55,${0.2+(i%4)*0.1});box-shadow:0 0 ${4+(i%3)*2}px rgba(212,175,55,${0.1+(i%3)*0.05});"></div>`).join('')}
        <div style="position:absolute;top:80px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:24px;font-style:italic;color:rgba(212,175,55,0.5);letter-spacing:8px;">INTRODUCING</div>
          <div style="font-family:${SERIF};font-size:${cs(130,city)}px;font-weight:bold;font-style:italic;color:#D4AF37;text-shadow:0 0 30px rgba(212,175,55,0.3);line-height:0.85;">${C}</div>
          ${PH('rgba(212,175,55,0.4)')}
        </div>
        <!-- perfume bottle silhouette -->
        <div style="position:absolute;top:400px;left:50%;transform:translateX(-50%);">
          <!-- bottle neck -->
          <div style="width:80px;height:80px;background:linear-gradient(180deg,rgba(212,175,55,0.3),rgba(212,175,55,0.1));margin:0 auto;border-radius:4px;"></div>
          <!-- bottle cap -->
          <div style="width:120px;height:40px;background:linear-gradient(180deg,#D4AF37,#8B6914);margin:0 auto;border-radius:4px 4px 0 0;"></div>
          <!-- bottle body with photo -->
          <div style="width:500px;height:600px;background:linear-gradient(180deg,rgba(212,175,55,0.1),rgba(212,175,55,0.05));border:2px solid rgba(212,175,55,0.2);border-radius:12px;overflow:hidden;box-shadow:0 10px 40px rgba(212,175,55,0.1);">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;opacity:0.85;"/>
            <!-- glass reflection -->
            <div style="position:absolute;top:0;left:0;width:150px;height:100%;background:linear-gradient(90deg,rgba(255,255,255,0.05),transparent);"></div>
          </div>
        </div>
        <!-- brand text -->
        <div style="position:absolute;top:1200px;left:0;right:0;text-align:center;">
          <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:white;letter-spacing:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SERIF};font-size:24px;font-style:italic;color:rgba(212,175,55,0.4);margin-top:8px;">a portrait experience</div>
        </div>
        <!-- small proof photos -->
        <div style="position:absolute;top:1340px;left:60px;right:60px;display:flex;gap:16px;">
          <div style="flex:1;height:300px;border-radius:8px;overflow:hidden;border:1px solid rgba(212,175,55,0.2);">
            <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="flex:1;height:300px;border-radius:8px;overflow:hidden;border:1px solid rgba(212,175,55,0.2);">
            <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <div style="position:absolute;bottom:120px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(212,175,55,0.3);">${CTA}</div>
      </div>`
    }

    // 82: WATCH AD
    case 82: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0a0a;">
        <!-- luxury dark texture -->
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,#1a1a1a,#000);"></div>
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${FUTURA};font-size:18px;color:rgba(212,175,55,0.5);letter-spacing:10px;">HANDCRAFTED SINCE 2026</div>
          <div style="font-family:${SERIF};font-size:${cs(110,city)}px;font-weight:bold;font-style:italic;color:#D4AF37;text-shadow:0 2px 16px rgba(212,175,55,0.3);">${C}</div>
          ${PH('rgba(212,175,55,0.4)')}
        </div>
        <!-- watch face (large circle) -->
        <div style="position:absolute;top:340px;left:50%;transform:translateX(-50%);width:600px;height:600px;border-radius:50%;background:linear-gradient(135deg,#222,#111);border:8px solid #D4AF37;box-shadow:0 0 40px rgba(212,175,55,0.15),0 10px 40px rgba(0,0,0,0.5);">
          <!-- hour markers -->
          ${Array.from({length:12}, (_,i) => {
            const angle = (i * 30 - 90) * Math.PI / 180
            const x = 300 + Math.cos(angle) * 250
            const y = 300 + Math.sin(angle) * 250
            return `<div style="position:absolute;left:${Math.round(x)-4}px;top:${Math.round(y)-12}px;width:8px;height:24px;background:#D4AF37;transform:rotate(${i*30}deg);border-radius:4px;"></div>`
          }).join('')}
          <!-- hands -->
          <div style="position:absolute;top:50%;left:50%;width:4px;height:180px;background:#D4AF37;transform-origin:bottom center;transform:translate(-50%,-100%) rotate(-30deg);border-radius:2px;"></div>
          <div style="position:absolute;top:50%;left:50%;width:3px;height:220px;background:white;transform-origin:bottom center;transform:translate(-50%,-100%) rotate(60deg);border-radius:2px;"></div>
          <div style="position:absolute;top:50%;left:50%;width:2px;height:240px;background:#E53935;transform-origin:bottom center;transform:translate(-50%,-100%) rotate(180deg);border-radius:1px;"></div>
          <!-- center pin -->
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:16px;height:16px;border-radius:50%;background:#D4AF37;"></div>
          <!-- photo in dial subdial -->
          <div style="position:absolute;top:160px;left:50%;transform:translateX(-50%);width:150px;height:150px;border-radius:50%;overflow:hidden;border:2px solid #D4AF37;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <!-- watch band -->
        <div style="position:absolute;top:920px;left:50%;transform:translateX(-50%);width:200px;height:100px;background:linear-gradient(180deg,#333,#222);border-radius:0 0 100px 100px;"></div>
        <!-- brand banner -->
        <div style="position:absolute;top:1060px;left:0;right:0;text-align:center;">
          <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:white;letter-spacing:6px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- portfolio photos -->
        <div style="position:absolute;top:1160px;left:60px;right:60px;display:flex;gap:16px;">
          ${[p,p2,p3].map(ph => `<div style="flex:1;height:380px;border-radius:8px;overflow:hidden;border:2px solid rgba(212,175,55,0.2);box-shadow:0 6px 20px rgba(0,0,0,0.4);">
            <img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>`).join('')}
        </div>
        <div style="position:absolute;bottom:100px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(212,175,55,0.3);">${CTA}</div>
      </div>`
    }

    // 83: JEWELRY BOX
    case 83: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#1a0a1a,#0a0008);">
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(110,city)}px;font-weight:bold;font-style:italic;color:#D4AF37;text-shadow:0 0 20px rgba(212,175,55,0.3);">${C}</div>
          ${PH('rgba(212,175,55,0.4)')}
          <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:white;letter-spacing:5px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- jewelry box -->
        <div style="position:absolute;top:360px;left:100px;right:100px;bottom:180px;">
          <!-- lid (open) -->
          <div style="position:absolute;top:-40px;left:20px;right:20px;height:160px;background:linear-gradient(180deg,#5D4037,#4E342E);border:3px solid #D4AF37;border-radius:12px 12px 0 0;transform-origin:bottom;transform:perspective(600px) rotateX(-25deg);">
            <!-- mirror -->
            <div style="position:absolute;inset:12px;background:linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03));border:1px solid rgba(212,175,55,0.3);border-radius:6px;overflow:hidden;">
              <img src="${p3}" style="width:100%;height:100%;object-fit:cover;opacity:0.4;"/>
            </div>
          </div>
          <!-- box body -->
          <div style="position:absolute;top:80px;left:0;right:0;bottom:0;background:linear-gradient(180deg,#4E342E,#3E2723);border:3px solid #D4AF37;border-radius:0 0 12px 12px;box-shadow:0 10px 40px rgba(0,0,0,0.5);overflow:hidden;">
            <!-- velvet lining -->
            <div style="position:absolute;inset:8px;background:linear-gradient(180deg,#880E4F,#6A0040);border-radius:0 0 8px 8px;">
              <!-- photo compartments -->
              <div style="position:absolute;top:20px;left:20px;right:20px;display:flex;gap:12px;">
                <div style="flex:2;height:460px;border-radius:8px;overflow:hidden;border:2px solid rgba(212,175,55,0.3);box-shadow:0 6px 20px rgba(0,0,0,0.3);">
                  <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
                </div>
                <div style="flex:1;display:flex;flex-direction:column;gap:12px;">
                  <div style="flex:1;border-radius:8px;overflow:hidden;border:2px solid rgba(212,175,55,0.3);">
                    <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
                  </div>
                  <div style="flex:1;border-radius:8px;overflow:hidden;border:2px solid rgba(212,175,55,0.3);">
                    <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
                  </div>
                </div>
              </div>
              <!-- ring slots at bottom -->
              <div style="position:absolute;bottom:20px;left:20px;right:20px;display:flex;gap:16px;">
                ${Array.from({length:6}, (_,i) => `<div style="flex:1;height:60px;background:rgba(0,0,0,0.2);border-radius:30px;border:1px solid rgba(212,175,55,0.2);"></div>`).join('')}
              </div>
            </div>
          </div>
          <!-- clasp -->
          <div style="position:absolute;top:76px;left:50%;transform:translateX(-50%);width:40px;height:20px;background:#D4AF37;border-radius:0 0 10px 10px;z-index:2;"></div>
        </div>
        <div style="position:absolute;bottom:100px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(212,175,55,0.3);">${CTA}</div>
      </div>`
    }

    // 84: GIFT WRAP
    case 84: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#E53935;">
        <!-- wrapping paper pattern -->
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(45deg,rgba(255,255,255,0.03) 0px,transparent 2px,transparent 30px);"></div>
        <!-- polka dots -->
        ${Array.from({length:40}, (_,i) => `<div style="position:absolute;left:${(i*103)%1060}px;top:${(i*79)%1900}px;width:20px;height:20px;border-radius:50%;background:rgba(255,255,255,0.06);"></div>`).join('')}
        <!-- gift box shape -->
        <div style="position:absolute;top:200px;left:100px;right:100px;bottom:200px;background:#C62828;border-radius:12px;border:3px solid rgba(255,255,255,0.1);box-shadow:0 10px 40px rgba(0,0,0,0.3);overflow:hidden;">
          <!-- horizontal ribbon -->
          <div style="position:absolute;top:50%;left:0;right:0;height:60px;background:linear-gradient(180deg,#D4AF37,#FFD700,#D4AF37);transform:translateY(-50%);box-shadow:0 4px 12px rgba(0,0,0,0.2);"></div>
          <!-- vertical ribbon -->
          <div style="position:absolute;left:50%;top:0;bottom:0;width:60px;background:linear-gradient(90deg,#D4AF37,#FFD700,#D4AF37);transform:translateX(-50%);box-shadow:0 4px 12px rgba(0,0,0,0.2);"></div>
          <!-- photos in quadrants -->
          <div style="position:absolute;top:20px;left:20px;width:380px;height:44%;border-radius:8px;overflow:hidden;box-shadow:0 6px 16px rgba(0,0,0,0.3);">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="position:absolute;top:20px;right:20px;width:380px;height:44%;border-radius:8px;overflow:hidden;box-shadow:0 6px 16px rgba(0,0,0,0.3);">
            <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="position:absolute;bottom:20px;left:50%;transform:translateX(-50%);width:500px;height:42%;border-radius:8px;overflow:hidden;box-shadow:0 6px 16px rgba(0,0,0,0.3);">
            <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <!-- bow on top -->
        <div style="position:absolute;top:160px;left:50%;transform:translateX(-50%);">
          <div style="width:120px;height:60px;background:#D4AF37;border-radius:50%;transform:rotate(-20deg);box-shadow:0 2px 8px rgba(0,0,0,0.2);"></div>
          <div style="width:120px;height:60px;background:#FFD700;border-radius:50%;transform:rotate(20deg);margin-top:-30px;margin-left:40px;box-shadow:0 2px 8px rgba(0,0,0,0.2);"></div>
          <div style="width:40px;height:40px;background:#D4AF37;border-radius:50%;margin:-20px auto 0;position:relative;z-index:2;"></div>
        </div>
        <div style="position:absolute;top:80px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(80,city)}px;font-weight:bold;font-style:italic;color:white;text-shadow:0 2px 8px rgba(0,0,0,0.3);">${C}</div>
          ${PH('rgba(255,255,255,0.6)')}
          <div style="font-family:${FUTURA};font-size:36px;font-weight:bold;color:#FFD700;letter-spacing:4px;margin-top:2px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;bottom:120px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,255,255,0.4);">${CTA}</div>
      </div>`
    }

    // 85: ADVENT GIFT
    case 85: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#0D1B2A,#1B2838);">
        <!-- star field -->
        ${Array.from({length:35}, (_,i) => `<div style="position:absolute;left:${(i*67)%1060}px;top:${(i*43)%1880}px;width:${2+(i%3)}px;height:${2+(i%3)}px;border-radius:50%;background:rgba(255,215,0,${0.2+(i%4)*0.1});"></div>`).join('')}
        <!-- christmas tree silhouette -->
        <div style="position:absolute;bottom:200px;left:50%;transform:translateX(-50%);">
          <div style="width:0;height:0;border-left:350px solid transparent;border-right:350px solid transparent;border-bottom:800px solid #1B5E20;position:relative;">
            <!-- tree layers -->
            <div style="position:absolute;bottom:-200px;left:-400px;width:0;height:0;border-left:400px solid transparent;border-right:400px solid transparent;border-bottom:300px solid #2E7D32;"></div>
          </div>
          <!-- trunk -->
          <div style="width:60px;height:80px;background:#5D4037;margin:0 auto;"></div>
        </div>
        <!-- gift tag -->
        <div style="position:absolute;top:80px;left:0;right:0;text-align:center;">
          <div style="display:inline-block;background:rgba(255,255,255,0.9);padding:20px 60px;border-radius:8px;transform:rotate(-3deg);box-shadow:0 4px 16px rgba(0,0,0,0.2);">
            <div style="font-family:${SERIF};font-size:24px;font-style:italic;color:#888;">to: you</div>
            <div style="font-family:${SERIF};font-size:${cs(60,city)}px;font-weight:bold;color:#E53935;">${C}</div>
            <div style="font-family:${SERIF};font-size:20px;font-style:italic;color:#888;">from: madebyaidan</div>
          </div>
        </div>
        <!-- ornament photos -->
        <div style="position:absolute;top:360px;left:120px;width:300px;height:300px;border-radius:50%;overflow:hidden;border:6px solid #D4AF37;box-shadow:0 8px 24px rgba(0,0,0,0.4);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:400px;right:120px;width:260px;height:260px;border-radius:50%;overflow:hidden;border:6px solid #E53935;box-shadow:0 8px 24px rgba(0,0,0,0.4);">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:680px;left:50%;transform:translateX(-50%);width:320px;height:320px;border-radius:50%;overflow:hidden;border:6px solid #43A047;box-shadow:0 8px 24px rgba(0,0,0,0.4);">
          <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <!-- ornament hooks -->
        <div style="position:absolute;top:345px;left:268px;width:4px;height:20px;background:#D4AF37;"></div>
        <div style="position:absolute;top:385px;right:248px;width:4px;height:20px;background:#E53935;"></div>
        <div style="position:absolute;top:665px;left:538px;width:4px;height:20px;background:#43A047;"></div>
        <div style="position:absolute;bottom:260px;left:0;right:0;text-align:center;">
          <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:#FFD600;letter-spacing:5px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;bottom:160px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,215,0,0.35);">${CTA}</div>
      </div>`
    }

    // 86: SHOPPING CART
    case 86: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#F5F5F5,#E0E0E0);">
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:${cs(100,city)}px;color:#333;">${C}</div>
          ${PH('#888')}
          <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:#E53935;letter-spacing:4px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- shopping cart wireframe -->
        <div style="position:absolute;top:340px;left:100px;right:100px;bottom:300px;">
          <!-- cart basket -->
          <div style="position:absolute;top:0;left:0;right:0;height:900px;border:4px solid #666;border-radius:0 0 12px 12px;background:rgba(255,255,255,0.5);overflow:hidden;">
            <!-- wire mesh pattern -->
            <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,0.03) 0px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,rgba(0,0,0,0.03) 0px,transparent 1px,transparent 40px);"></div>
            <!-- photos as items in cart -->
            <div style="position:absolute;top:20px;left:20px;right:20px;">
              <div style="width:100%;height:400px;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.15);margin-bottom:16px;border:3px solid white;">
                <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
              </div>
              <div style="display:flex;gap:16px;">
                <div style="flex:1;height:280px;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.15);border:3px solid white;">
                  <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
                </div>
                <div style="flex:1;height:280px;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.15);border:3px solid white;">
                  <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
                </div>
              </div>
            </div>
            <!-- price tag -->
            <div style="position:absolute;bottom:20px;right:20px;background:#FFD600;padding:8px 20px;border-radius:20px;transform:rotate(-5deg);">
              <div style="font-family:${DISPLAY};font-size:32px;color:#333;">FREE!</div>
            </div>
          </div>
          <!-- handle -->
          <div style="position:absolute;top:-30px;left:50%;transform:translateX(-50%);width:300px;height:40px;background:#666;border-radius:20px;"></div>
          <!-- wheels -->
          <div style="position:absolute;bottom:-30px;left:60px;width:50px;height:50px;border-radius:50%;background:#444;border:3px solid #666;"></div>
          <div style="position:absolute;bottom:-30px;right:60px;width:50px;height:50px;border-radius:50%;background:#444;border:3px solid #666;"></div>
        </div>
        <div style="position:absolute;bottom:200px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(0,0,0,0.3);">${CTA}</div>
      </div>`
    }

    // 87: RECEIPT ROLL
    case 87: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#E8E8E8;">
        <!-- receipt paper -->
        <div style="position:absolute;top:60px;left:160px;right:160px;bottom:60px;background:white;box-shadow:0 4px 20px rgba(0,0,0,0.1);overflow:hidden;">
          <!-- thermal print texture -->
          <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,0.01) 0px,transparent 1px,transparent 3px);"></div>
          <!-- receipt content -->
          <div style="padding:40px 30px;">
            <div style="text-align:center;border-bottom:2px dashed #ccc;padding-bottom:20px;margin-bottom:20px;">
              <div style="font-family:${MONO};font-size:32px;font-weight:bold;color:#333;">MADEBYAIDAN</div>
              <div style="font-family:${MONO};font-size:18px;color:#666;margin-top:4px;">${city}, Philippines</div>
              <div style="font-family:${MONO};font-size:16px;color:#999;margin-top:4px;">Date: March 2026</div>
            </div>
            <div style="font-family:${MONO};font-size:${cs(52,city)}px;font-weight:bold;color:#333;text-align:center;margin:20px 0;">${C}</div>
            ${PH('#999', MONO)}
            <div style="border-top:2px dashed #ccc;border-bottom:2px dashed #ccc;padding:16px 0;margin:16px 0;">
              <div style="display:flex;justify-content:space-between;font-family:${MONO};font-size:20px;color:#333;margin-bottom:8px;">
                <span>PHOTO SHOOT x1</span><span>FREE</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-family:${MONO};font-size:20px;color:#333;margin-bottom:8px;">
                <span>EDITED PHOTOS</span><span>FREE</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-family:${MONO};font-size:20px;color:#333;">
                <span>GOOD VIBES</span><span>FREE</span>
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;font-family:${MONO};font-size:28px;font-weight:bold;color:#333;margin:12px 0;">
              <span>TOTAL</span><span>$0.00</span>
            </div>
            <!-- photos -->
            <div style="margin-top:20px;">
              <div style="width:100%;height:340px;overflow:hidden;margin-bottom:12px;">
                <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
              </div>
              <div style="display:flex;gap:12px;">
                <div style="flex:1;height:240px;overflow:hidden;">
                  <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
                </div>
                <div style="flex:1;height:240px;overflow:hidden;">
                  <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
                </div>
              </div>
            </div>
            <div style="border-top:2px dashed #ccc;margin-top:20px;padding-top:16px;text-align:center;">
              <div style="font-family:${MONO};font-size:18px;color:#666;">${CTA}</div>
              <div style="font-family:${MONO};font-size:16px;color:#999;margin-top:8px;">THANK YOU!</div>
              <!-- barcode -->
              <div style="display:flex;justify-content:center;gap:2px;margin-top:16px;">
                ${Array.from({length:30}, (_,i) => `<div style="width:${i%3===0?4:2}px;height:40px;background:#333;"></div>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>`
    }

    // 88: COUPON BOOK
    case 88: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#FFF8E1,#FFE0B2);">
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:${cs(100,city)}px;color:#E65100;">${C}</div>
          ${PH('#BF360C')}
          <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:#E65100;letter-spacing:4px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- coupon cards -->
        ${[{ph:p,title:'PORTRAIT SESSION',y:340},{ph:p2,title:'EDITORIAL SHOOT',y:860},{ph:p3,title:'CREATIVE CONCEPT',y:1380}].map((coupon,i) => `
          <div style="position:absolute;top:${coupon.y}px;left:60px;right:60px;height:460px;background:white;border-radius:12px;border:3px dashed #E65100;box-shadow:0 4px 16px rgba(0,0,0,0.1);display:flex;overflow:hidden;">
            <!-- photo side -->
            <div style="width:380px;height:100%;overflow:hidden;flex-shrink:0;">
              <img src="${coupon.ph}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
            <!-- perforation line -->
            <div style="width:0;border-left:3px dashed #ddd;flex-shrink:0;"></div>
            <!-- coupon info -->
            <div style="flex:1;padding:24px;display:flex;flex-direction:column;justify-content:center;">
              <div style="font-family:${FUTURA};font-size:18px;color:#999;letter-spacing:4px;">COUPON #${i+1}</div>
              <div style="font-family:${FUTURA};font-size:28px;font-weight:bold;color:#E65100;margin-top:8px;">${coupon.title}</div>
              <div style="font-family:${DISPLAY};font-size:56px;color:#E53935;margin-top:12px;">FREE</div>
              <div style="font-family:${MONO};font-size:14px;color:#999;margin-top:12px;">Valid: Anytime</div>
              <div style="font-family:${MONO};font-size:14px;color:#999;">Location: ${city}</div>
              <!-- scissors icon line -->
              <div style="margin-top:12px;border-top:2px dashed #ddd;padding-top:8px;font-family:${SANS};font-size:14px;color:#ccc;">&#9986; cut here</div>
            </div>
          </div>
        `).join('')}
        <div style="position:absolute;bottom:60px;left:0;right:0;text-align:center;font-family:${SANS};font-size:18px;color:rgba(230,81,0,0.35);">${CTA}</div>
      </div>`
    }

    // 89: LOYALTY CARD
    case 89: {
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#1a1a2e,#0D1B2A);">
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:white;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:#FFD600;letter-spacing:4px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- loyalty card -->
        <div style="position:absolute;top:340px;left:60px;right:60px;height:600px;background:linear-gradient(135deg,#1565C0,#0D47A1);border-radius:20px;border:2px solid rgba(255,255,255,0.1);box-shadow:0 10px 40px rgba(0,0,0,0.4);overflow:hidden;">
          <!-- card shine -->
          <div style="position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:conic-gradient(transparent,rgba(255,255,255,0.03),transparent,rgba(255,255,255,0.03));"></div>
          <!-- brand -->
          <div style="position:absolute;top:24px;left:30px;font-family:${FUTURA};font-size:24px;font-weight:bold;color:white;letter-spacing:4px;">MADEBYAIDAN</div>
          <!-- loyalty stamps -->
          <div style="position:absolute;top:80px;left:30px;right:30px;display:grid;grid-template-columns:repeat(5,1fr);gap:12px;">
            ${Array.from({length:10}, (_,i) => `<div style="aspect-ratio:1;border-radius:50%;border:3px solid rgba(255,255,255,0.2);${i<8?`background:rgba(255,215,0,0.8);display:flex;align-items:center;justify-content:center;`:'background:rgba(255,255,255,0.05);'}">
              ${i<8?`<div style="font-size:20px;">&#10003;</div>`:''}
            </div>`).join('')}
          </div>
          <!-- reward text -->
          <div style="position:absolute;bottom:24px;left:30px;right:30px;text-align:center;">
            <div style="font-family:${SANS};font-size:18px;color:rgba(255,255,255,0.5);">8/10 stamps collected — almost there!</div>
            <div style="font-family:${FUTURA};font-size:22px;color:#FFD600;margin-top:4px;">REWARD: FREE PHOTO SHOOT</div>
          </div>
        </div>
        <!-- photos below card -->
        <div style="position:absolute;top:1000px;left:60px;right:60px;display:flex;gap:16px;">
          ${[p,p2,p3].map(ph => `<div style="flex:1;height:440px;border-radius:10px;overflow:hidden;border:3px solid rgba(255,255,255,0.1);box-shadow:0 6px 20px rgba(0,0,0,0.3);">
            <img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>`).join('')}
        </div>
        <div style="position:absolute;bottom:120px;left:0;right:0;text-align:center;font-family:${SANS};font-size:20px;color:rgba(255,214,0,0.35);">${CTA}</div>
      </div>`
    }

    // PLACEHOLDER_NEXT
    default: return `<div style="width:1080px;height:1920px;background:#000;color:white;display:flex;align-items:center;justify-content:center;font-size:60px;">Variant ${variant}</div>`
  }
}

const LANDSCAPE_VARIANTS = new Set([1,4,14,21,22,27,34,41,50,53,57,63,72,80,88,95])

const slides = []
for (let ci = 0; ci < cities.length; ci++) {
  const city = cities[ci]
  for (let v = 0; v < 100; v++) {
    const pool = LANDSCAPE_VARIANTS.has(v) ? landscapePhotos : portraitPhotos
    const pi1 = (v * 3 + ci * 7) % pool.length
    const pi2 = (v * 3 + ci * 7 + 1) % pool.length
    const pi3 = (v * 3 + ci * 7 + 2) % pool.length
    slides.push({
      name: `${slug(city)}-${String(v + 1).padStart(3, '0')}`,
      city,
      html: makeSlide(city, pool[pi1], pool[pi2], pool[pi3], v),
    })
  }
}

async function render() {
  for (const city of cities) {
    fs.mkdirSync(path.join(OUT, slug(city)), { recursive: true })
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
    const outPath = path.join(OUT, slug(slide.city), `${slide.name}.png`)
    await page.screenshot({ path: outPath, type: 'png' })
    await page.close()
    console.log(`  [${i + 1}/${slides.length}] ${slide.name}`)
  }
  await browser.close()
  console.log(`\nDone — ${slides.length} CPC ads rendered to ${OUT}`)
}
render()
