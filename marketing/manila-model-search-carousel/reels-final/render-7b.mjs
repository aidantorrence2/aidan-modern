import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-7b');

var W = 1080;
var H = 1920;
var FPS = 30;
var TOTAL_DURATION = 23;
var TOTAL_FRAMES = FPS * TOTAL_DURATION;

var SAFE_TOP = 213;
var SAFE_BOTTOM = 430;

var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans';
var PHOTO_NAMES = [
  'DSC_0274.jpg',
  'DSC_0276.jpg',
  'DSC_0277.jpg',
  'DSC_0280.jpg',
  'DSC_0281.jpg',
  'DSC_0284.jpg',
];

function resetOutputDir() {
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
}

function processPhotos() {
  var cropDir = path.join(OUT_DIR, 'tmp-photos');
  mkdirSync(cropDir, { recursive: true });
  var processed = {};
  for (var name of PHOTO_NAMES) {
    var src = path.join(FILM_SCANS_DIR, name);
    if (!existsSync(src)) {
      console.error('Photo not found: ' + src);
      process.exit(1);
    }
    var dst = path.join(cropDir, name.replace(/\.jpg$/i, '_processed.jpg'));
    execSync('magick "' + src + '" -shave 500x600 +repage -auto-level -quality 95 "' + dst + '"', { stdio: 'pipe' });
    var buf = readFileSync(dst);
    processed[name] = 'data:image/jpeg;base64,' + buf.toString('base64');
    console.log('  Processed: ' + name + ' (' + (buf.length / 1024).toFixed(0) + ' KB)');
  }
  return processed;
}

// Message timeline - each entry: [time, type, data]
// Types: 'recv', 'sent', 'photo', 'typing', 'tapback', 'read'
var MESSAGES = [
  // typing indicator before first message
  { t: 0.3,  type: 'typing', who: 'Mia' },
  { t: 0.8,  type: 'recv', who: 'Mia', text: 'ok wait you guys NEED to see these' },
  { t: 1.3,  type: 'typing', who: 'Mia' },
  { t: 1.8,  type: 'photo', who: 'Mia', photoIdx: 0 },
  { t: 2.8,  type: 'read', text: 'Read 2:34 PM' },

  { t: 3.0,  type: 'typing', who: 'Luna' },
  { t: 3.5,  type: 'recv', who: 'Luna', text: 'WAIT 😳' },
  { t: 3.8,  type: 'typing', who: 'Luna' },
  { t: 4.2,  type: 'recv', who: 'Luna', text: 'who took these omg' },
  { t: 4.6,  type: 'tapback', emoji: '!!', label: 'Luna emphasized', targetIdx: 3 }, // on the photo

  { t: 4.8,  type: 'typing', who: 'Mia' },
  { t: 5.3,  type: 'recv', who: 'Mia', text: 'a photographer doing free shoots in manila' },
  { t: 5.8,  type: 'typing', who: 'Mia' },
  { t: 6.2,  type: 'recv', who: 'Mia', text: 'like actually FREE', consecutive: true },

  { t: 6.5,  type: 'typing', who: 'Ava' },
  { t: 6.9,  type: 'recv', who: 'Ava', text: 'no way??? how' },

  { t: 7.2,  type: 'typing', who: 'Mia' },
  { t: 7.6,  type: 'recv', who: 'Mia', text: 'you just DM him on IG' },
  { t: 8.0,  type: 'recv', who: 'Mia', text: '@madebyaidan', consecutive: true, isHandle: true },

  { t: 8.4,  type: 'typing', who: 'Mia' },
  { t: 8.8,  type: 'photo', who: 'Mia', photoIdx: 1 },
  { t: 9.3,  type: 'photo', who: 'Mia', photoIdx: 2, consecutive: true },

  { t: 9.8,  type: 'tapback', emoji: '\u2764\uFE0F', label: 'Ava loved', targetIdx: 21 },
  { t: 10.0, type: 'tapback', emoji: '\u2764\uFE0F', label: 'Luna loved', targetIdx: 22 },

  { t: 10.2, type: 'typing', who: 'Luna' },
  { t: 10.6, type: 'recv', who: 'Luna', text: 'ok these are literally insane' },
  { t: 11.0, type: 'typing', who: 'Luna' },
  { t: 11.4, type: 'recv', who: 'Luna', text: 'I got mine done too look', consecutive: true },

  { t: 11.7, type: 'photo', who: 'Luna', photoIdx: 3 },
  { t: 12.2, type: 'photo', who: 'Luna', photoIdx: 4, consecutive: true },

  { t: 12.7, type: 'tapback', emoji: '\u2764\uFE0F', label: 'Mia loved', targetIdx: 30 },
  { t: 12.9, type: 'tapback', emoji: '\u2764\uFE0F', label: 'Ava loved', targetIdx: 31 },

  { t: 13.1, type: 'typing', who: 'Ava' },
  { t: 13.5, type: 'recv', who: 'Ava', text: 'wait do you need modeling experience??' },

  { t: 13.8, type: 'typing', who: 'Mia' },
  { t: 14.2, type: 'recv', who: 'Mia', text: 'no!! he directs everything' },
  { t: 14.5, type: 'recv', who: 'Mia', text: 'posing, angles, lighting, all of it', consecutive: true },
  { t: 14.9, type: 'recv', who: 'Mia', text: 'you literally just show up', consecutive: true },

  { t: 15.3, type: 'sent', text: "I'm DMing him right now \uD83D\uDE2D" },
  { t: 15.7, type: 'tapback', emoji: '!!', label: 'Luna emphasized', targetIdx: 41 },
  { t: 15.9, type: 'tapback', emoji: '\u2764\uFE0F', label: 'Mia loved', targetIdx: 41 },

  { t: 16.2, type: 'typing', who: 'Ava' },
  { t: 16.5, type: 'recv', who: 'Ava', text: 'SAME omg' },
  { t: 16.8, type: 'tapback', emoji: '\uD83D\uDE02', label: 'Luna laughed', targetIdx: 45 },

  { t: 17.0, type: 'typing', who: 'Luna' },
  { t: 17.4, type: 'recv', who: 'Luna', text: "we're ALL doing this \uD83D\uDE2D\uD83D\uDE2D" },

  { t: 17.8, type: 'photo', who: 'Mia', photoIdx: 5 },
  { t: 18.3, type: 'tapback', emoji: '\u2764\uFE0F', label: 'Everyone loved', targetIdx: 50 },

  { t: 18.6, type: 'typing', who: 'Mia' },
  { t: 19.0, type: 'recv', who: 'Mia', text: 'dm him!! @madebyaidan', isHandle: true },
  { t: 19.4, type: 'recv', who: 'Mia', text: "he's only here for a limited time \u23F3", consecutive: true },

  // hold for CTA
];

function buildHTML(imageDataMap) {
  var SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif";
  var BG = '#000000';
  var IMSG_BLUE = '#0B93F6';
  var IMSG_RECV = '#262628';
  var IMSG_GRAY = '#8E8E93';

  var COLOR_MIA = '#FF6B8A';
  var COLOR_LUNA = '#9B59B6';
  var COLOR_AVA = '#27AE60';

  var COLORS = { Mia: COLOR_MIA, Luna: COLOR_LUNA, Ava: COLOR_AVA };

  var imgDataJSON = JSON.stringify(PHOTO_NAMES.map(function(n) { return imageDataMap[n]; }));
  var messagesJSON = JSON.stringify(MESSAGES);

  return '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<style>\n' +
    '* { box-sizing: border-box; margin: 0; padding: 0; }\n' +
    'html, body { margin: 0; padding: 0; background: #000; overflow: hidden; -webkit-font-smoothing: antialiased; }\n' +
    '#root { width: ' + W + 'px; height: ' + H + 'px; position: relative; overflow: hidden; background: #000; }\n' +
    '</style>\n</head>\n<body>\n<div id="root">\n' +

    // Phone frame
    '  <div id="phone-frame" style="position:absolute;top:' + (SAFE_TOP + 20) + 'px;left:24px;right:24px;bottom:' + (SAFE_BOTTOM - 200) + 'px;border-radius:44px;overflow:hidden;background:#000;border:3px solid rgba(255,255,255,0.15);">\n' +

    // Status bar
    '    <div style="position:absolute;left:0;right:0;top:0;height:54px;padding:14px 32px 0;display:flex;align-items:center;justify-content:space-between;z-index:30;background:#000;">\n' +
    '      <span style="font-family:' + SF + ';font-size:40px;font-weight:600;color:#fff;">9:41</span>\n' +
    '      <div style="position:absolute;left:50%;top:10px;transform:translateX(-50%);width:126px;height:34px;background:#000;border-radius:0 0 20px 20px;"></div>\n' +
    '      <div style="display:flex;align-items:center;gap:6px;">\n' +
    '        <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="4" width="3" height="8" rx="1" fill="#fff"/><rect x="5" y="2" width="3" height="10" rx="1" fill="#fff"/><rect x="10" y="0" width="3" height="12" rx="1" fill="#fff"/><rect x="15" y="1" width="3" height="11" rx="1" fill="#fff" opacity="0.35"/></svg>\n' +
    '        <svg width="17" height="12" viewBox="0 0 17 12"><path d="M1 4.5C3.8 1.5 7.5 0 8.5 0s4.7 1.5 7.5 4.5" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.35"/><path d="M3.5 7C5.3 5 7 4 8.5 4s3.2 1 5 3" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.7"/><circle cx="8.5" cy="10" r="2" fill="#fff"/></svg>\n' +
    '        <svg width="28" height="13" viewBox="0 0 28 13"><rect x="0" y="0" width="24" height="13" rx="3.5" stroke="#fff" stroke-width="1" fill="none" opacity="0.4"/><rect x="25" y="4" width="2" height="5" rx="1" fill="#fff" opacity="0.4"/><rect x="2" y="2" width="19" height="9" rx="2" fill="#34C759"/></svg>\n' +
    '      </div>\n' +
    '    </div>\n' +

    // iMessage navigation header
    '    <div style="position:absolute;left:0;right:0;top:54px;height:96px;display:flex;align-items:center;z-index:30;background:#000;border-bottom:0.5px solid #2C2C2E;padding:0 16px;">\n' +
    '      <div style="display:flex;align-items:center;gap:6px;width:60px;">\n' +
    '        <svg width="11" height="18" viewBox="0 0 11 18" fill="none"><path d="M10 1L2 9l8 8" stroke="#0A84FF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>\n' +
    '        <span style="font-family:' + SF + ';font-size:40px;color:#0A84FF;">12</span>\n' +
    '      </div>\n' +
    '      <div style="flex:1;display:flex;flex-direction:column;align-items:center;">\n' +
    '        <div style="display:flex;margin-bottom:4px;">\n' +
    ['Mia', 'Luna', 'Ava'].map(function(name, i) {
      var c = COLORS[name];
      return '<div style="width:60px;height:60px;border-radius:50%;background:' + c + ';border:2px solid #000;display:flex;align-items:center;justify-content:center;margin-left:' + (i === 0 ? '0' : '-8') + 'px;z-index:' + (10-i) + ';"><span style="font-family:' + SF + ';font-size:30px;font-weight:700;color:#fff;">' + name[0] + '</span></div>';
    }).join('') + '\n' +
    '        </div>\n' +
    '        <p style="font-family:' + SF + ';font-size:40px;font-weight:600;color:#fff;margin:0;">manila girlies \uD83C\uDF34</p>\n' +
    '        <p style="font-family:' + SF + ';font-size:30px;color:' + IMSG_GRAY + ';margin:2px 0 0;">4 people</p>\n' +
    '      </div>\n' +
    '      <div style="width:60px;display:flex;justify-content:flex-end;">\n' +
    '        <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 4h14v14H4z" stroke="transparent"/><path d="M17 8c0-2.2-1.8-4-4-4H9C6.8 4 5 5.8 5 8v1.5c0 1 .4 2 1.1 2.7L11 17l4.9-4.8c.7-.7 1.1-1.7 1.1-2.7V8z" stroke="#0A84FF" stroke-width="1.8" fill="none"/></svg>\n' +
    '      </div>\n' +
    '    </div>\n' +

    // Gradient overlay below header
    '    <div style="position:absolute;left:0;right:0;top:150px;height:40px;background:linear-gradient(180deg,#000,transparent);z-index:25;pointer-events:none;"></div>\n' +

    // Chat area
    '    <div id="chat-viewport" style="position:absolute;left:0;right:0;top:150px;bottom:56px;overflow:hidden;">\n' +
    '      <div id="chat-scroll" style="padding:50px 14px 800px 14px;">\n' +
    '      </div>\n' +
    '    </div>\n' +

    // Bottom gradient
    '    <div style="position:absolute;left:0;right:0;bottom:56px;height:50px;background:linear-gradient(0deg,#000,transparent);z-index:25;pointer-events:none;"></div>\n' +

    // Input bar
    '    <div style="position:absolute;left:0;right:0;bottom:0;height:56px;padding:8px 12px;display:flex;align-items:center;gap:10px;z-index:30;background:#000;border-top:0.5px solid #2C2C2E;">\n' +
    '      <div style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">\n' +
    '        <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="13" stroke="#8E8E93" stroke-width="1.5"/><path d="M14 8v12M8 14h12" stroke="#8E8E93" stroke-width="1.8" stroke-linecap="round"/></svg>\n' +
    '      </div>\n' +
    '      <div style="flex:1;padding:8px 16px;border:1px solid #3A3A3C;border-radius:20px;background:#1C1C1E;">\n' +
    '        <span style="font-family:' + SF + ';font-size:40px;color:#636366;">iMessage</span>\n' +
    '      </div>\n' +
    '      <div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">\n' +
    '        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 3a3 3 0 0 1 3 3v5a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3z" stroke="#8E8E93" stroke-width="1.5"/><path d="M19 11a7 7 0 1 1-14 0" stroke="#8E8E93" stroke-width="1.5" stroke-linecap="round"/><path d="M12 18v3" stroke="#8E8E93" stroke-width="1.5" stroke-linecap="round"/></svg>\n' +
    '      </div>\n' +
    '    </div>\n' +

    '  </div>\n' + // close phone-frame

    // CTA overlay at bottom (always visible)
    '  <div id="cta-bar" style="position:absolute;left:0;right:0;bottom:0;height:' + (SAFE_BOTTOM - 100) + 'px;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:50;opacity:0;">\n' +
    '    <p style="font-family:' + SF + ';font-size:72px;font-weight:800;color:#fff;text-align:center;margin:0;">Free Photo Shoot in Manila</p>\n' +
    '    <p style="font-family:' + SF + ';font-size:48px;font-weight:500;color:rgba(255,255,255,0.6);text-align:center;margin:8px 0 0;">DM @madebyaidan on Instagram</p>\n' +
    '  </div>\n' +

    '</div>\n' +

    '<script>\n' +
    'var W = ' + W + ';\n' +
    'var H = ' + H + ';\n' +
    'var MESSAGES = ' + messagesJSON + ';\n' +
    'var IMG_DATA = ' + imgDataJSON + ';\n' +
    'var SF = "' + SF + '";\n' +
    'var IMSG_BLUE = "' + IMSG_BLUE + '";\n' +
    'var IMSG_RECV = "' + IMSG_RECV + '";\n' +
    'var IMSG_GRAY = "' + IMSG_GRAY + '";\n' +
    'var COLORS = ' + JSON.stringify(COLORS) + ';\n' +
    '\n' +
    'function easeOut(t) { return 1 - Math.pow(1 - t, 3); }\n' +
    'function easeIn(t) { return Math.pow(t, 2); }\n' +
    'function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }\n' +
    'function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }\n' +
    'function prog(t, s, e) { return clamp((t - s) / (e - s), 0, 1); }\n' +
    '\n' +
    'var chatScroll = document.getElementById("chat-scroll");\n' +
    'var chatViewport = document.getElementById("chat-viewport");\n' +
    'var renderedUpTo = -1;\n' +
    'var typingEl = null;\n' +
    'var currentScrollY = 0;\n' +
    'var targetScrollY = 0;\n' +
    '\n' +
    'function avatar(name) {\n' +
    '  var c = COLORS[name] || "#555";\n' +
    '  return \'<div style="width:56px;height:56px;border-radius:50%;background:\' + c + \';display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span style="font-family:\' + SF + \';font-size:30px;font-weight:700;color:#fff;">\' + name[0] + \'</span></div>\';\n' +
    '}\n' +
    '\n' +
    'function createTypingIndicator(who) {\n' +
    '  var el = document.createElement("div");\n' +
    '  el.className = "typing-indicator";\n' +
    '  el.style.cssText = "display:flex;align-items:flex-end;gap:8px;margin-bottom:4px;padding:0 4px;";\n' +
    '  el.innerHTML = avatar(who) +\n' +
    '    \'<div style="background:\' + IMSG_RECV + \';border-radius:18px 18px 18px 6px;padding:12px 18px;display:flex;gap:4px;align-items:center;">\' +\n' +
    '    \'<div class="tdot" style="width:8px;height:8px;border-radius:50%;background:#8E8E93;"></div>\' +\n' +
    '    \'<div class="tdot" style="width:8px;height:8px;border-radius:50%;background:#8E8E93;"></div>\' +\n' +
    '    \'<div class="tdot" style="width:8px;height:8px;border-radius:50%;background:#8E8E93;"></div>\' +\n' +
    '    \'</div>\';\n' +
    '  return el;\n' +
    '}\n' +
    '\n' +
    'function createRecvBubble(who, text, consecutive, isHandle) {\n' +
    '  var el = document.createElement("div");\n' +
    '  el.style.cssText = "display:flex;align-items:flex-end;gap:8px;margin-bottom:" + (consecutive ? "2" : "10") + "px;padding:0 4px;";\n' +
    '  var av = consecutive ? \'<div style="width:32px;flex-shrink:0;"></div>\' : avatar(who);\n' +
    '  var nameLabel = consecutive ? "" : \'<span style="font-family:\' + SF + \';font-size:28px;color:\' + IMSG_GRAY + \';display:block;margin-bottom:2px;margin-left:4px;">\' + who + \'</span>\';\n' +
    '  var textColor = "#fff";\n' +
    '  var displayText = text;\n' +
    '  if (isHandle && text.indexOf("@madebyaidan") !== -1) {\n' +
    '    displayText = text.replace(/@madebyaidan/g, \'<span style="color:#0A84FF;">@madebyaidan</span>\');\n' +
    '  }\n' +
    '  el.innerHTML = av +\n' +
    '    \'<div style="max-width:70%;">\' + nameLabel +\n' +
    '    \'<div style="background:\' + IMSG_RECV + \';border-radius:\' + (consecutive ? "12px 18px 18px 12px" : "18px 18px 18px 6px") + \';padding:10px 16px;">\' +\n' +
    '    \'<p style="font-family:\' + SF + \';font-size:40px;color:\' + textColor + \';margin:0;line-height:1.35;">\' + displayText + \'</p>\' +\n' +
    '    \'</div></div>\';\n' +
    '  return el;\n' +
    '}\n' +
    '\n' +
    'function createSentBubble(text) {\n' +
    '  var el = document.createElement("div");\n' +
    '  el.style.cssText = "display:flex;justify-content:flex-end;margin-bottom:10px;padding:0 4px;";\n' +
    '  el.innerHTML = \'<div style="max-width:70%;background:\' + IMSG_BLUE + \';border-radius:18px 18px 6px 18px;padding:10px 16px;">\' +\n' +
    '    \'<p style="font-family:\' + SF + \';font-size:40px;color:#fff;margin:0;line-height:1.35;">\' + text + \'</p>\' +\n' +
    '    \'</div>\';\n' +
    '  return el;\n' +
    '}\n' +
    '\n' +
    'function createPhotoBubble(who, photoIdx, consecutive) {\n' +
    '  var el = document.createElement("div");\n' +
    '  el.style.cssText = "display:flex;align-items:flex-end;gap:8px;margin-bottom:" + (consecutive ? "2" : "10") + "px;padding:0 4px;";\n' +
    '  var av = consecutive ? \'<div style="width:32px;flex-shrink:0;"></div>\' : avatar(who);\n' +
    '  var nameLabel = consecutive ? "" : \'<span style="font-family:\' + SF + \';font-size:28px;color:\' + IMSG_GRAY + \';display:block;margin-bottom:2px;margin-left:4px;">\' + who + \'</span>\';\n' +
    '  el.innerHTML = av +\n' +
    '    \'<div style="max-width:70%;">\' + nameLabel +\n' +
    '    \'<div style="width:260px;height:340px;border-radius:18px;overflow:hidden;">\' +\n' +
    '    \'<img src="\' + IMG_DATA[photoIdx] + \'" style="width:100%;height:100%;object-fit:cover;display:block;"/>\' +\n' +
    '    \'</div></div>\';\n' +
    '  return el;\n' +
    '}\n' +
    '\n' +
    'function createReadReceipt(text) {\n' +
    '  var el = document.createElement("div");\n' +
    '  el.style.cssText = "display:flex;justify-content:flex-end;margin-bottom:10px;padding:0 8px;";\n' +
    '  el.innerHTML = \'<span style="font-family:\' + SF + \';font-size:26px;color:\' + IMSG_GRAY + \';font-weight:500;">\' + text + \'</span>\';\n' +
    '  return el;\n' +
    '}\n' +
    '\n' +
    'function createTapback(emoji, label) {\n' +
    '  var el = document.createElement("div");\n' +
    '  el.style.cssText = "display:flex;align-items:center;margin-bottom:6px;padding:0 4px 0 44px;";\n' +
    '  var emojiDisplay = emoji === "!!" ? "\\u203C\\uFE0F" : emoji;\n' +
    '  el.innerHTML = \'<div style="background:#1C1C1E;border:1px solid #3A3A3C;border-radius:14px;padding:3px 10px;display:flex;align-items:center;gap:5px;">\' +\n' +
    '    \'<span style="font-size:32px;">\' + emojiDisplay + \'</span>\' +\n' +
    '    \'<span style="font-family:\' + SF + \';font-size:28px;color:\' + IMSG_GRAY + \';font-weight:500;">\' + label + \'</span>\' +\n' +
    '    \'</div>\';\n' +
    '  return el;\n' +
    '}\n' +
    '\n' +
    'function animateTypingDots(t) {\n' +
    '  if (!typingEl) return;\n' +
    '  var dots = typingEl.querySelectorAll(".tdot");\n' +
    '  for (var d = 0; d < dots.length; d++) {\n' +
    '    var phase = t * 5 + d * 0.7;\n' +
    '    var bounce = Math.sin(phase) * 0.35 + 0.65;\n' +
    '    dots[d].style.opacity = String(bounce);\n' +
    '    dots[d].style.transform = "translateY(" + (Math.sin(phase) * -3) + "px)";\n' +
    '  }\n' +
    '}\n' +
    '\n' +
    'function updateScroll() {\n' +
    '  var scrollHeight = chatScroll.scrollHeight;\n' +
    '  var viewportHeight = chatViewport.offsetHeight;\n' +
    '  var maxScroll = Math.max(0, scrollHeight - viewportHeight);\n' +
    '  targetScrollY = Math.min(targetScrollY, maxScroll);\n' +
    '  // Smooth scroll towards target\n' +
    '  currentScrollY = lerp(currentScrollY, targetScrollY, 0.25);\n' +
    '  chatScroll.style.transform = "translateY(" + (-currentScrollY) + "px)";\n' +
    '}\n' +
    '\n' +
    'function requestScroll() {\n' +
    '  var scrollHeight = chatScroll.scrollHeight;\n' +
    '  var viewportHeight = chatViewport.offsetHeight;\n' +
    '  targetScrollY = Math.max(0, scrollHeight - viewportHeight + 20);\n' +
    '}\n' +
    '\n' +
    'var lastApplied = -1;\n' +
    '\n' +
    'window.__applyUpTo = function(t) {\n' +
    '  // Process messages up to current time\n' +
    '  for (var i = 0; i <= renderedUpTo; i++) {\n' +
    '    // Already rendered\n' +
    '  }\n' +
    '  \n' +
    '  for (var mi = renderedUpTo + 1; mi < MESSAGES.length; mi++) {\n' +
    '    var msg = MESSAGES[mi];\n' +
    '    if (t < msg.t) break;\n' +
    '    \n' +
    '    // Remove typing indicator if this is not a typing message\n' +
    '    if (msg.type !== "typing" && typingEl) {\n' +
    '      typingEl.remove();\n' +
    '      typingEl = null;\n' +
    '    }\n' +
    '    \n' +
    '    var newEl = null;\n' +
    '    if (msg.type === "typing") {\n' +
    '      if (typingEl) typingEl.remove();\n' +
    '      typingEl = createTypingIndicator(msg.who);\n' +
    '      chatScroll.appendChild(typingEl);\n' +
    '      requestScroll();\n' +
    '    } else if (msg.type === "recv") {\n' +
    '      newEl = createRecvBubble(msg.who, msg.text, msg.consecutive || false, msg.isHandle || false);\n' +
    '    } else if (msg.type === "sent") {\n' +
    '      newEl = createSentBubble(msg.text);\n' +
    '    } else if (msg.type === "photo") {\n' +
    '      newEl = createPhotoBubble(msg.who, msg.photoIdx, msg.consecutive || false);\n' +
    '    } else if (msg.type === "read") {\n' +
    '      newEl = createReadReceipt(msg.text);\n' +
    '    } else if (msg.type === "tapback") {\n' +
    '      newEl = createTapback(msg.emoji, msg.label);\n' +
    '    }\n' +
    '    \n' +
    '    if (newEl) {\n' +
    '      // Entrance animation: start slightly translated and transparent\n' +
    '      newEl.style.opacity = "0";\n' +
    '      newEl.style.transform = "translateY(12px)";\n' +
    '      chatScroll.appendChild(newEl);\n' +
    '      // Store arrival time for animation\n' +
    '      newEl.dataset.arriveAt = String(msg.t);\n' +
    '      newEl.dataset.msgType = msg.type;\n' +
    '      requestScroll();\n' +
    '    }\n' +
    '    \n' +
    '    renderedUpTo = mi;\n' +
    '  }\n' +
    '\n' +
    '  // Animate entrance of recently added elements\n' +
    '  var children = chatScroll.children;\n' +
    '  for (var ci = 0; ci < children.length; ci++) {\n' +
    '    var child = children[ci];\n' +
    '    if (child === typingEl) continue;\n' +
    '    var arriveAt = parseFloat(child.dataset.arriveAt || "0");\n' +
    '    if (arriveAt <= 0) continue;\n' +
    '    var elapsed = t - arriveAt;\n' +
    '    if (elapsed < 0) {\n' +
    '      child.style.opacity = "0";\n' +
    '    } else if (elapsed < 0.25) {\n' +
    '      var p = easeOut(elapsed / 0.25);\n' +
    '      child.style.opacity = String(p);\n' +
    '      var yOff = lerp(12, 0, p);\n' +
    '      if (child.dataset.msgType === "photo") {\n' +
    '        var sc = lerp(0.9, 1, p);\n' +
    '        child.style.transform = "translateY(" + yOff + "px) scale(" + sc + ")";\n' +
    '      } else if (child.dataset.msgType === "tapback") {\n' +
    '        var sc2 = lerp(0.5, 1, p);\n' +
    '        child.style.transform = "scale(" + sc2 + ")";\n' +
    '      } else {\n' +
    '        child.style.transform = "translateY(" + yOff + "px)";\n' +
    '      }\n' +
    '    } else {\n' +
    '      child.style.opacity = "1";\n' +
    '      child.style.transform = "translateY(0)";\n' +
    '    }\n' +
    '  }\n' +
    '\n' +
    '  // Animate typing dots\n' +
    '  animateTypingDots(t);\n' +
    '\n' +
    '  // Update scroll position\n' +
    '  updateScroll();\n' +
    '\n' +
    '  // CTA bar at bottom - fade in after last message\n' +
    '  var ctaBar = document.getElementById("cta-bar");\n' +
    '  if (t < 19.8) {\n' +
    '    ctaBar.style.opacity = "0";\n' +
    '  } else {\n' +
    '    ctaBar.style.opacity = String(easeOut(prog(t, 19.8, 20.5)));\n' +
    '  }\n' +
    '};\n' +
    '\n' +
    'if (location.search.includes("capture=1")) {\n' +
    '  var s = document.createElement("style");\n' +
    '  s.textContent = "*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0.001s !important; }";\n' +
    '  document.head.appendChild(s);\n' +
    '}\n' +
    '</script>\n</body>\n</html>';
}

async function main() {
  console.log('=== iMessage Group Chat Reel v7b ===');
  resetOutputDir();

  console.log('Processing photos...');
  var imageDataMap = processPhotos();

  var html = buildHTML(imageDataMap);
  var htmlPath = path.join(OUT_DIR, 'index.html');
  writeFileSync(htmlPath, html);

  writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify({
    createdAt: new Date().toISOString(),
    strategy: 'v7b - Polished iMessage group chat with typing indicators, tapbacks, photo reveals, scrolling',
    photos: PHOTO_NAMES,
    duration: TOTAL_DURATION,
    fps: FPS,
  }, null, 2));

  var framesDir = path.join(OUT_DIR, 'tmp-frames');
  mkdirSync(framesDir, { recursive: true });

  var browser = await chromium.launch();
  var page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto('file://' + htmlPath + '?capture=1', { waitUntil: 'load' });
  await page.waitForTimeout(600);

  console.log('Capturing ' + TOTAL_FRAMES + ' frames...');

  for (var frame = 0; frame < TOTAL_FRAMES; frame++) {
    var t = frame / FPS;
    await page.evaluate(function(time) { window.__applyUpTo(time); }, t);
    await page.waitForTimeout(2);
    var padded = String(frame).padStart(5, '0');
    await page.screenshot({ path: path.join(framesDir, 'frame_' + padded + '.png'), type: 'png' });
    if (frame % (FPS * 2) === 0) {
      console.log('  ' + t.toFixed(1) + 's / ' + TOTAL_DURATION + 's');
    }
  }

  await browser.close();
  console.log('All frames captured.');

  var outputMp4 = path.join(OUT_DIR, '7b-imessage-group-chat.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + outputMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  var reelsDst = path.join(reelsDir, '7b-imessage-group-chat.mp4');
  execSync('cp "' + outputMp4 + '" "' + reelsDst + '"');

  var sz = statSync(outputMp4);
  console.log('Final: ' + (sz.size / (1024 * 1024)).toFixed(1) + ' MB');
  console.log('Copied to reels/7b-imessage-group-chat.mp4');
  console.log('=== Done ===');
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
