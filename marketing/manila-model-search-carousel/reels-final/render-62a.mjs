import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-62a');

var W = 1080;
var H = 1920;
var FPS = 30;
var TOTAL_DURATION = 14;
var TOTAL_FRAMES = FPS * TOTAL_DURATION;

var SAFE_TOP = 213;
var SAFE_BOTTOM = 430;

var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans';
var PHOTO_NAMES = [
  'DSC_0243.jpg',
  'DSC_0255.jpg',
  'DSC_0256.jpg',
  'DSC_0258.jpg',
  'DSC_0260.jpg',
  'DSC_0261.jpg',
  'DSC_0262.jpg',
  'DSC_0263.jpg',
  'DSC_0270.jpg',
  'DSC_0271.jpg',
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

function buildHTML(imageDataMap) {
  var imgDataJSON = JSON.stringify(PHOTO_NAMES.map(function(name) {
    return imageDataMap[name];
  }));

  var captions = [
    'Local talent discovered in Makati',
    'Portrait session, natural light only',
    'Street style near Intramuros',
    'Editorial look, golden hour',
    'First-time model, stunning results',
    'Fresh face from Quezon City',
    'Camera-ready in 15 minutes',
    'Natural beauty, no retouching',
    'Sunset session in Rizal Park',
    'Cover-worthy in one take',
  ];

  var photoLayouts = [
    { left: 45,  top: SAFE_TOP + 390, w: 470, h: 300 },
    { left: 535, top: SAFE_TOP + 390, w: 500, h: 300 },
    { left: 45,  top: SAFE_TOP + 710, w: 310, h: 230 },
    { left: 375, top: SAFE_TOP + 710, w: 310, h: 230 },
    { left: 705, top: SAFE_TOP + 710, w: 330, h: 230 },
    { left: 45,  top: SAFE_TOP + 960, w: 500, h: 260 },
    { left: 565, top: SAFE_TOP + 960, w: 470, h: 260 },
    { left: 45,  top: SAFE_TOP + 1240, w: 320, h: 210 },
    { left: 385, top: SAFE_TOP + 1240, w: 300, h: 210 },
    { left: 705, top: SAFE_TOP + 1240, w: 330, h: 210 },
  ];

  var photoDivs = '';
  for (var pi = 0; pi < PHOTO_NAMES.length; pi++) {
    var l = photoLayouts[pi];
    photoDivs += '<div class="news-photo" id="nphoto-' + pi + '" style="left:' + l.left + 'px;top:' + l.top + 'px;width:' + l.w + 'px;height:' + l.h + 'px;">';
    photoDivs += '<img id="nphoto-img-' + pi + '" src="" alt=""/>';
    photoDivs += '<div class="halftone-overlay"></div>';
    photoDivs += '<div class="caption">' + captions[pi] + '</div>';
    photoDivs += '</div>\n';
  }

  var safeHeight = H - SAFE_TOP - SAFE_BOTTOM;

  var html = [];
  html.push('<!DOCTYPE html>');
  html.push('<html><head><meta charset="utf-8">');
  html.push('<style>');
  html.push('* { box-sizing: border-box; margin: 0; padding: 0; }');
  html.push('html, body { margin: 0; padding: 0; overflow: hidden; }');
  html.push('#root { width: ' + W + 'px; height: ' + H + 'px; position: relative; overflow: hidden; background: #f5f0e8; font-family: Georgia, "Times New Roman", serif; }');
  html.push('#newsprint-texture { position: absolute; inset: 0; z-index: 1; pointer-events: none; background-image: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.015) 3px, rgba(0,0,0,0.015) 4px), repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.01) 3px, rgba(0,0,0,0.01) 4px); opacity: 0; }');
  html.push('#grain-overlay { position: absolute; inset: 0; z-index: 100; pointer-events: none; opacity: 0; background-size: 256px 256px; mix-blend-mode: multiply; }');
  html.push('#paper-edge { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse at center, transparent 65%, rgba(160,140,90,0.25) 100%); z-index: 99; }');
  html.push('.col-rule { position: absolute; width: 1px; background: rgba(0,0,0,0.18); z-index: 3; opacity: 0; }');
  html.push('.h-rule { position: absolute; left: 40px; height: 2px; background: #111; z-index: 3; opacity: 0; width: ' + (W - 80) + 'px; }');
  html.push('.h-rule.thick { height: 4px; }');
  html.push('.h-rule.thin { height: 1px; background: rgba(0,0,0,0.3); }');
  html.push('.h-rule.double { height: 3px; border-top: 3px solid #111; border-bottom: 1px solid #111; background: #f5f0e8; padding-top: 3px; }');
  html.push('#masthead { position: absolute; top: ' + (SAFE_TOP + 20) + 'px; left: 0; width: ' + W + 'px; text-align: center; z-index: 10; opacity: 0; }');
  html.push('#masthead-name { font-family: Georgia, "Times New Roman", serif; font-size: 68px; font-weight: 700; color: #111; letter-spacing: 4px; text-transform: uppercase; line-height: 1; }');
  html.push('#masthead-tagline { font-size: 13px; letter-spacing: 7px; color: #555; text-transform: uppercase; margin-top: 6px; }');
  html.push('#masthead-date { font-size: 12px; letter-spacing: 4px; color: #777; text-transform: uppercase; margin-top: 4px; font-style: italic; }');
  html.push('#headline-section { position: absolute; top: ' + (SAFE_TOP + 165) + 'px; left: 55px; right: 55px; z-index: 10; opacity: 0; }');
  html.push('#breaking-label { font-size: 24px; font-weight: 700; color: #fff; background: #111; display: inline-block; padding: 4px 16px; letter-spacing: 5px; text-transform: uppercase; margin-bottom: 8px; }');
  html.push('#main-headline { font-size: 48px; font-weight: 700; color: #111; line-height: 1.1; letter-spacing: 1px; text-transform: uppercase; }');
  html.push('#sub-headline { font-size: 17px; font-weight: 400; color: #444; font-style: italic; margin-top: 6px; letter-spacing: 1px; }');
  html.push('.news-photo { position: absolute; z-index: 8; opacity: 0; overflow: hidden; border: 1px solid rgba(0,0,0,0.12); background: #ddd8cf; }');
  html.push('.news-photo img { width: 100%; height: 100%; object-fit: cover; display: block; filter: contrast(1.2) saturate(0.3) brightness(1.05); }');
  html.push('.news-photo .caption { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(245,240,232,0.9); font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #333; padding: 5px 8px; border-top: 1px solid rgba(0,0,0,0.12); }');
  html.push('.news-photo .halftone-overlay { position: absolute; inset: 0; pointer-events: none; background-image: radial-gradient(circle, rgba(0,0,0,0.7) 1px, transparent 1px); background-size: 5px 5px; mix-blend-mode: multiply; opacity: 0.35; z-index: 5; }');
  html.push('#extra-banner { position: absolute; top: 50%; left: 0; width: ' + (W * 3) + 'px; transform: translateY(-50%) translateX(' + W + 'px); z-index: 50; background: #cc0000; padding: 16px 0; opacity: 0; display: flex; align-items: center; gap: 50px; white-space: nowrap; }');
  html.push('.extra-text { font-size: 58px; font-weight: 700; color: #fff; letter-spacing: 10px; text-transform: uppercase; font-family: Georgia, serif; }');
  html.push('.extra-star { font-size: 36px; color: #fff; }');
  html.push('#hero-photo { position: absolute; top: 0; left: 0; width: ' + W + 'px; height: ' + H + 'px; z-index: 40; opacity: 0; overflow: hidden; }');
  html.push('#hero-photo img { width: 100%; height: 100%; object-fit: cover; filter: contrast(1.15) saturate(0.35) brightness(1.05); }');
  html.push('#hero-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.08), rgba(0,0,0,0.5)); }');
  html.push('#hero-caption { position: absolute; bottom: ' + (SAFE_BOTTOM + 80) + 'px; left: 55px; right: 55px; font-size: 40px; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 3px; text-shadow: 0 2px 8px rgba(0,0,0,0.5); opacity: 0; }');
  html.push('#cta-section { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 60; opacity: 0; width: 820px; pointer-events: none; }');
  html.push('#cta-box { background: #f5f0e8; border: 3px solid #111; outline: 3px solid #111; outline-offset: 4px; padding: 36px 44px; text-align: center; position: relative; }');
  html.push('#cta-classified-label { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: #111; color: #f5f0e8; font-size: 12px; font-weight: 700; letter-spacing: 6px; padding: 4px 18px; text-transform: uppercase; }');
  html.push('#cta-ornament-top { font-size: 22px; color: #999; letter-spacing: 10px; margin-bottom: 10px; }');
  html.push('#cta-handle { font-size: 52px; font-weight: 700; color: #111; letter-spacing: 2px; line-height: 1; margin-bottom: 10px; }');
  html.push('#cta-details { font-size: 17px; color: #444; font-style: italic; margin-bottom: 16px; letter-spacing: 2px; }');
  html.push('#cta-action { font-size: 22px; font-weight: 700; color: #111; text-transform: uppercase; letter-spacing: 6px; border-top: 2px solid #111; border-bottom: 2px solid #111; padding: 12px 0; margin-top: 12px; }');
  html.push('#cta-free { font-size: 13px; letter-spacing: 4px; color: #777; text-transform: uppercase; margin-top: 14px; }');
  html.push('#cta-ornament-bot { font-size: 22px; color: #999; letter-spacing: 10px; margin-top: 8px; }');
  html.push('</style></head><body>');
  html.push('<div id="root">');
  html.push('<div id="newsprint-texture"></div>');
  html.push('<div id="grain-overlay"></div>');
  html.push('<div id="paper-edge"></div>');
  html.push('<div class="col-rule" id="col-rule-1" style="left:360px;top:' + SAFE_TOP + 'px;height:' + safeHeight + 'px;"></div>');
  html.push('<div class="col-rule" id="col-rule-2" style="left:720px;top:' + SAFE_TOP + 'px;height:' + safeHeight + 'px;"></div>');
  html.push('<div class="h-rule double" id="h-rule-top" style="top:' + (SAFE_TOP + 150) + 'px;"></div>');
  html.push('<div class="h-rule" id="h-rule-mid" style="top:' + (SAFE_TOP + 360) + 'px;"></div>');
  html.push('<div class="h-rule thin" id="h-rule-bot" style="top:' + (H - SAFE_BOTTOM - 50) + 'px;"></div>');
  html.push('<div id="masthead">');
  html.push('  <div id="masthead-name"></div>');
  html.push('  <div id="masthead-tagline">ALL THE PHOTOS FIT TO PRINT</div>');
  html.push('  <div id="masthead-date">MANILA, PHILIPPINES &mdash; SPECIAL EDITION</div>');
  html.push('</div>');
  html.push('<div id="headline-section">');
  html.push('  <div id="breaking-label"></div>');
  html.push('  <div id="main-headline"></div>');
  html.push('  <div id="sub-headline">Professional photographer offers complimentary sessions</div>');
  html.push('</div>');
  html.push(photoDivs);
  html.push('<div id="extra-banner">');
  html.push('  <span class="extra-star">&#9733;</span><span class="extra-text">EXTRA EXTRA</span>');
  html.push('  <span class="extra-star">&#9733;</span><span class="extra-text">READ ALL ABOUT IT</span>');
  html.push('  <span class="extra-star">&#9733;</span><span class="extra-text">EXTRA EXTRA</span>');
  html.push('  <span class="extra-star">&#9733;</span><span class="extra-text">FREE PHOTO SHOOTS</span>');
  html.push('  <span class="extra-star">&#9733;</span>');
  html.push('</div>');
  html.push('<div id="hero-photo">');
  html.push('  <img id="hero-photo-img" src="" alt=""/>');
  html.push('  <div id="hero-overlay"></div>');
  html.push('  <div id="hero-caption">EXCLUSIVE COVERAGE</div>');
  html.push('</div>');
  html.push('<div id="cta-section">');
  html.push('  <div id="cta-box">');
  html.push('    <div id="cta-classified-label">CLASSIFIED</div>');
  html.push('    <div id="cta-ornament-top">&#10022; &#10022; &#10022;</div>');
  html.push('    <div id="cta-handle">@madebyaidan</div>');
  html.push('    <div id="cta-details">Professional Photography &mdash; Manila</div>');
  html.push('    <div id="cta-action">DM FOR DETAILS</div>');
  html.push('    <div id="cta-free">FREE SESSIONS &mdash; LIMITED SPOTS</div>');
  html.push('    <div id="cta-ornament-bot">&#10022; &#10022; &#10022;</div>');
  html.push('  </div>');
  html.push('</div>');
  html.push('</div>');

  // Script block - using array join to preserve newlines
  var js = [];
  js.push('<script>');
  js.push('var W = ' + W + ';');
  js.push('var H = ' + H + ';');
  js.push('var PHOTO_COUNT = ' + PHOTO_NAMES.length + ';');
  js.push('var IMG_DATA = ' + imgDataJSON + ';');
  js.push('');
  js.push('for (var i = 0; i < PHOTO_COUNT; i++) {');
  js.push('  var img = document.getElementById("nphoto-img-" + i);');
  js.push('  if (img) img.src = IMG_DATA[i];');
  js.push('}');
  js.push('var heroImg = document.getElementById("hero-photo-img");');
  js.push('if (heroImg) heroImg.src = IMG_DATA[4];');
  js.push('');
  js.push('function easeOut(t) { return 1 - Math.pow(1 - t, 3); }');
  js.push('function easeIn(t) { return Math.pow(t, 3); }');
  js.push('function easeInOut(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }');
  js.push('function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }');
  js.push('function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }');
  js.push('function prog(t, start, end) { return clamp((t - start) / (end - start), 0, 1); }');
  js.push('');
  js.push('function typewrite(text, progress) {');
  js.push('  var len = Math.floor(text.length * clamp(progress, 0, 1));');
  js.push('  return text.substring(0, len);');
  js.push('}');
  js.push('');
  js.push('window.__applyUpTo = function(t) {');
  js.push('  var tex = document.getElementById("newsprint-texture");');
  js.push('  tex.style.opacity = String(easeOut(prog(t, 0.0, 0.5)));');
  js.push('');
  js.push('  var grain = document.getElementById("grain-overlay");');
  js.push('  grain.style.opacity = String(0.5 * easeOut(prog(t, 0.0, 0.5)));');
  js.push('');
  js.push('  var col1 = document.getElementById("col-rule-1");');
  js.push('  var col2 = document.getElementById("col-rule-2");');
  js.push('  col1.style.opacity = String(easeOut(prog(t, 0.5, 1.5)));');
  js.push('  col2.style.opacity = String(easeOut(prog(t, 0.7, 1.5)));');
  js.push('');
  js.push('  var hrt = document.getElementById("h-rule-top");');
  js.push('  var hrm = document.getElementById("h-rule-mid");');
  js.push('  var hrb = document.getElementById("h-rule-bot");');
  js.push('  hrt.style.opacity = String(easeOut(prog(t, 0.3, 1.0)));');
  js.push('  hrm.style.opacity = String(easeOut(prog(t, 0.8, 1.5)));');
  js.push('  hrb.style.opacity = String(easeOut(prog(t, 1.0, 1.8)));');
  js.push('');
  js.push('  var masthead = document.getElementById("masthead");');
  js.push('  var mastheadName = document.getElementById("masthead-name");');
  js.push('  var mastheadTagline = document.getElementById("masthead-tagline");');
  js.push('  var mastheadDate = document.getElementById("masthead-date");');
  js.push('');
  js.push('  if (t < 0.1) {');
  js.push('    masthead.style.opacity = "0";');
  js.push('  } else {');
  js.push('    masthead.style.opacity = "1";');
  js.push('    mastheadName.textContent = typewrite("THE MANILA TIMES", prog(t, 0.1, 0.9));');
  js.push('    mastheadTagline.style.opacity = String(easeOut(prog(t, 0.7, 1.2)));');
  js.push('    mastheadDate.style.opacity = String(easeOut(prog(t, 0.9, 1.3)));');
  js.push('  }');
  js.push('');
  js.push('  var headlineSection = document.getElementById("headline-section");');
  js.push('  var breakingLabel = document.getElementById("breaking-label");');
  js.push('  var mainHeadline = document.getElementById("main-headline");');
  js.push('  var subHeadline = document.getElementById("sub-headline");');
  js.push('');
  js.push('  if (t < 1.0) {');
  js.push('    headlineSection.style.opacity = "0";');
  js.push('  } else {');
  js.push('    headlineSection.style.opacity = "1";');
  js.push('    breakingLabel.textContent = typewrite("BREAKING:", prog(t, 1.0, 1.5));');
  js.push('    breakingLabel.style.opacity = t >= 1.0 ? "1" : "0";');
  js.push('    mainHeadline.textContent = typewrite("FREE PHOTO SHOOTS OFFERED", prog(t, 1.5, 2.8));');
  js.push('    subHeadline.style.opacity = String(easeOut(prog(t, 2.5, 3.0)));');
  js.push('  }');
  js.push('');
  js.push('  if (t >= 7.8 && t < 8.2) {');
  js.push('    var fo = 1 - easeIn(prog(t, 7.8, 8.2));');
  js.push('    headlineSection.style.opacity = String(fo);');
  js.push('    masthead.style.opacity = String(fo);');
  js.push('    col1.style.opacity = String(fo);');
  js.push('    col2.style.opacity = String(fo);');
  js.push('    hrt.style.opacity = String(fo);');
  js.push('    hrm.style.opacity = String(fo);');
  js.push('    hrb.style.opacity = String(fo);');
  js.push('  } else if (t >= 8.2 && t < 12.0) {');
  js.push('    headlineSection.style.opacity = "0";');
  js.push('    masthead.style.opacity = "0";');
  js.push('    col1.style.opacity = "0";');
  js.push('    col2.style.opacity = "0";');
  js.push('    hrt.style.opacity = "0";');
  js.push('    hrm.style.opacity = "0";');
  js.push('    hrb.style.opacity = "0";');
  js.push('  }');
  js.push('');
  js.push('  if (t >= 12.0) {');
  js.push('    masthead.style.opacity = String(easeOut(prog(t, 12.0, 12.5)));');
  js.push('    mastheadName.textContent = "THE MANILA TIMES";');
  js.push('  }');
  js.push('');
  js.push('  for (var ip = 0; ip < 10; ip++) {');
  js.push('    var photoEl = document.getElementById("nphoto-" + ip);');
  js.push('    if (!photoEl) continue;');
  js.push('    var photoStart = 3.0 + ip * 0.5;');
  js.push('    var photoEnd = photoStart + 0.4;');
  js.push('    if (t < photoStart) {');
  js.push('      photoEl.style.opacity = "0";');
  js.push('      photoEl.style.transform = "translateY(-40px)";');
  js.push('    } else if (t < photoEnd) {');
  js.push('      var pp = easeOut(prog(t, photoStart, photoEnd));');
  js.push('      photoEl.style.opacity = String(pp);');
  js.push('      photoEl.style.transform = "translateY(" + lerp(-40, 0, pp) + "px)";');
  js.push('    } else {');
  js.push('      photoEl.style.opacity = "1";');
  js.push('      photoEl.style.transform = "translateY(0px)";');
  js.push('    }');
  js.push('    if (t >= 9.5 && t < 10.0) {');
  js.push('      var fadeP = easeIn(prog(t, 9.5, 10.0));');
  js.push('      photoEl.style.opacity = String(1 - fadeP);');
  js.push('    } else if (t >= 10.0) {');
  js.push('      photoEl.style.opacity = "0";');
  js.push('    }');
  js.push('  }');
  js.push('');
  js.push('  var banner = document.getElementById("extra-banner");');
  js.push('  if (t >= 8.0 && t < 10.0) {');
  js.push('    banner.style.opacity = "1";');
  js.push('    var scrollProg = easeInOut(prog(t, 8.0, 10.0));');
  js.push('    var scrollX = lerp(W, -W * 2, scrollProg);');
  js.push('    banner.style.transform = "translateY(-50%) translateX(" + scrollX + "px)";');
  js.push('  } else {');
  js.push('    banner.style.opacity = "0";');
  js.push('  }');
  js.push('');
  js.push('  var heroPhoto = document.getElementById("hero-photo");');
  js.push('  var heroCap = document.getElementById("hero-caption");');
  js.push('  if (t >= 10.0 && t < 12.0) {');
  js.push('    var heroP = easeOut(prog(t, 10.0, 10.8));');
  js.push('    heroPhoto.style.opacity = String(heroP);');
  js.push('    var heroScale = lerp(1.1, 1.0, easeOut(prog(t, 10.0, 11.5)));');
  js.push('    heroPhoto.querySelector("img").style.transform = "scale(" + heroScale + ")";');
  js.push('    heroCap.style.opacity = String(easeOut(prog(t, 10.5, 11.2)));');
  js.push('    if (t >= 11.5) {');
  js.push('      heroPhoto.style.opacity = String(1 - easeIn(prog(t, 11.5, 12.0)));');
  js.push('    }');
  js.push('  } else {');
  js.push('    heroPhoto.style.opacity = "0";');
  js.push('  }');
  js.push('');
  js.push('  var ctaSection = document.getElementById("cta-section");');
  js.push('  if (t >= 12.0 && t <= 14.0) {');
  js.push('    var ctaP = easeOut(prog(t, 12.0, 12.8));');
  js.push('    ctaSection.style.opacity = String(ctaP);');
  js.push('    var ctaScale = lerp(0.9, 1.0, ctaP);');
  js.push('    ctaSection.style.transform = "translate(-50%, -50%) scale(" + ctaScale + ")";');
  js.push('  } else {');
  js.push('    ctaSection.style.opacity = "0";');
  js.push('  }');
  js.push('};');
  js.push('');
  js.push('if (location.search.includes("capture=1")) {');
  js.push('  var s = document.createElement("style");');
  js.push('  s.textContent = "*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0.001s !important; }";');
  js.push('  document.head.appendChild(s);');
  js.push('}');
  js.push('</' + 'script>');
  js.push('</body></html>');

  html.push(js.join('\n'));
  return html.join('\n');
}

async function main() {
  console.log('=== Breaking News / Newspaper Reel v62a ===');
  resetOutputDir();

  console.log('Processing photos...');
  var imageDataMap = processPhotos();

  var html = buildHTML(imageDataMap);
  var htmlPath = path.join(OUT_DIR, 'index.html');
  writeFileSync(htmlPath, html);

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
  console.log('All frames captured');

  var outputMp4 = path.join(OUT_DIR, '62a-newspaper.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + outputMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  execSync('cp "' + outputMp4 + '" "' + path.join(reelsDir, '62a-newspaper.mp4') + '"');

  var sz = statSync(outputMp4);
  console.log('Final: ' + (sz.size / (1024 * 1024)).toFixed(1) + ' MB');
  console.log('Copied to reels/62a-newspaper.mp4');
  console.log('=== Done ===');
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
