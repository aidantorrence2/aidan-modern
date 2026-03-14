import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-69a');

var W = 1080;
var H = 1920;
var FPS = 30;
var TOTAL_FRAMES = 420; // 14s at 30fps
var TOTAL_DURATION = 14;

var SAFE_TOP = 213;
var SAFE_BOTTOM = 430;

var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans';
var PHOTO_NAMES = [
  'DSC_0288.jpg',
  'DSC_0289.jpg',
  'DSC_0292.jpg',
  'DSC_0300.jpg',
  'DSC_0301.jpg',
  'DSC_0302.jpg',
  'DSC_0304.jpg',
  'DSC_0305.jpg',
  'DSC_0398.jpg',
  'DSC_0401.jpg',
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
  var heroSrc = imageDataMap[PHOTO_NAMES[0]];

  var pagePhotos = PHOTO_NAMES.slice(1, 9).map(function(name, i) {
    return '<img id="page-photo-' + i + '" src="' + imageDataMap[name] + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" />';
  });

  var barcodeLines = '';
  for (var bi = 0; bi < 30; bi++) {
    var bw = (bi % 3 === 0) ? 3 : (bi % 2 === 0 ? 2 : 1);
    barcodeLines += '<div style="width:' + bw + 'px;height:40px;background:#000;"></div>';
  }

  return '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<style>\n  * { box-sizing: border-box; margin: 0; padding: 0; }\n  html, body { margin: 0; padding: 0; overflow: hidden; }\n</style>\n</head>\n<body>\n<div id="root" style="\n  width:' + W + 'px;\n  height:' + H + 'px;\n  position:relative;\n  overflow:hidden;\n  background:#ffffff;\n  font-family: Georgia, Times New Roman, serif;\n">\n\n' +

  '<!-- MAGAZINE COVER -->\n<div id="cover" style="position:absolute;inset:0;z-index:10;">\n' +

  '  <div id="hero-photo" style="position:absolute;top:' + (SAFE_TOP + 200) + 'px;left:40px;right:40px;bottom:' + (SAFE_BOTTOM + 80) + 'px;opacity:0;overflow:hidden;">\n' +
  '    <img src="' + heroSrc + '" style="width:100%;height:100%;object-fit:cover;" />\n' +
  '  </div>\n' +

  '  <div id="mag-title" style="position:absolute;top:' + (SAFE_TOP + 20) + 'px;left:0;right:0;text-align:center;z-index:20;transform:translateY(-120px);opacity:0;">\n' +
  '    <div style="font-size:140px;font-weight:100;letter-spacing:28px;color:#000;font-family:Georgia,serif;line-height:1;text-transform:uppercase;">AIDAN</div>\n' +
  '  </div>\n' +

  '  <div id="cover-lines-left" style="position:absolute;top:' + (SAFE_TOP + 200) + 'px;left:50px;z-index:25;opacity:0;transform:translateX(-30px);">\n' +
  '    <div style="font-size:14px;letter-spacing:6px;color:#cc0000;text-transform:uppercase;font-weight:400;margin-bottom:8px;">EXCLUSIVE</div>\n' +
  '    <div style="font-size:36px;font-weight:700;color:#000;line-height:1.1;max-width:280px;">MANILA<br/>ISSUE</div>\n' +
  '  </div>\n' +

  '  <div id="cover-lines-right" style="position:absolute;top:' + (SAFE_TOP + 220) + 'px;right:50px;z-index:25;opacity:0;transform:translateX(30px);text-align:right;">\n' +
  '    <div style="font-size:18px;letter-spacing:3px;color:#000;text-transform:uppercase;font-weight:400;margin-bottom:6px;">FREE PHOTO</div>\n' +
  '    <div style="font-size:18px;letter-spacing:3px;color:#000;text-transform:uppercase;font-weight:400;margin-bottom:6px;">SHOOTS</div>\n' +
  '    <div style="font-size:14px;letter-spacing:4px;color:#cc0000;text-transform:uppercase;">SPRING 2026</div>\n' +
  '  </div>\n' +

  '  <div id="barcode" style="position:absolute;bottom:' + (SAFE_BOTTOM + 20) + 'px;left:50px;z-index:25;opacity:0;">\n' +
  '    <div style="display:flex;gap:2px;margin-bottom:4px;">' + barcodeLines + '</div>\n' +
  '    <div style="font-size:10px;letter-spacing:2px;color:#000;font-family:monospace;">9 781234 567890</div>\n' +
  '  </div>\n' +

  '  <div id="price-issue" style="position:absolute;bottom:' + (SAFE_BOTTOM + 20) + 'px;right:50px;z-index:25;opacity:0;text-align:right;">\n' +
  '    <div style="font-size:24px;font-weight:700;color:#000;">$0.00 FREE</div>\n' +
  '    <div style="font-size:12px;letter-spacing:3px;color:#666;text-transform:uppercase;margin-top:4px;">Issue No. 01 / Spring 2026</div>\n' +
  '  </div>\n' +

  '  <div id="red-line-top" style="position:absolute;top:' + (SAFE_TOP + 175) + 'px;left:40px;right:40px;height:2px;background:#cc0000;z-index:22;transform:scaleX(0);transform-origin:left;"></div>\n' +
  '  <div id="red-line-bottom" style="position:absolute;bottom:' + (SAFE_BOTTOM + 70) + 'px;left:40px;right:40px;height:2px;background:#cc0000;z-index:22;transform:scaleX(0);transform-origin:right;"></div>\n' +

  '</div>\n\n' +

  '<!-- PAGE FLIP CONTAINER -->\n<div id="pages-container" style="position:absolute;inset:0;z-index:30;perspective:1800px;opacity:0;">\n' +

  '  <!-- Page 1: Full bleed -->\n' +
  '  <div id="page-0" style="position:absolute;inset:0;background:#fff;transform-origin:left center;transform:rotateY(0deg);backface-visibility:hidden;opacity:0;">\n' +
  '    <div style="position:absolute;top:' + SAFE_TOP + 'px;left:0;right:0;bottom:' + SAFE_BOTTOM + 'px;overflow:hidden;">' + pagePhotos[0] + '</div>\n' +
  '    <div style="position:absolute;bottom:' + (SAFE_BOTTOM + 20) + 'px;left:50px;z-index:5;"><div style="font-size:11px;letter-spacing:5px;color:#fff;text-transform:uppercase;text-shadow:0 1px 4px rgba(0,0,0,0.8);">EDITORIAL</div></div>\n' +
  '    <div style="position:absolute;bottom:' + (SAFE_BOTTOM + 20) + 'px;right:50px;z-index:5;"><div style="font-size:11px;letter-spacing:3px;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,0.8);">02</div></div>\n' +
  '  </div>\n' +

  '  <!-- Page 2: Half-page -->\n' +
  '  <div id="page-1" style="position:absolute;inset:0;background:#fff;transform-origin:left center;transform:rotateY(0deg);backface-visibility:hidden;opacity:0;">\n' +
  '    <div style="position:absolute;top:' + SAFE_TOP + 'px;left:0;right:0;height:640px;overflow:hidden;">' + pagePhotos[1] + '</div>\n' +
  '    <div style="position:absolute;top:' + (SAFE_TOP + 660) + 'px;left:60px;right:60px;">\n' +
  '      <div style="font-size:11px;letter-spacing:5px;color:#cc0000;text-transform:uppercase;margin-bottom:10px;">FEATURE</div>\n' +
  '      <div style="font-size:32px;font-weight:700;color:#000;line-height:1.2;margin-bottom:12px;">The Art of<br/>Being Seen</div>\n' +
  '      <div style="font-size:14px;color:#666;line-height:1.6;letter-spacing:0.5px;">Portraits captured on film in Manila. Every frame tells a story of beauty, confidence, and self-expression.</div>\n' +
  '    </div>\n' +
  '    <div style="position:absolute;bottom:' + (SAFE_BOTTOM + 20) + 'px;right:50px;"><div style="font-size:11px;letter-spacing:3px;color:#999;">03</div></div>\n' +
  '  </div>\n' +

  '  <!-- Page 3: Two-photo grid -->\n' +
  '  <div id="page-2" style="position:absolute;inset:0;background:#fff;transform-origin:left center;transform:rotateY(0deg);backface-visibility:hidden;opacity:0;">\n' +
  '    <div style="position:absolute;top:' + (SAFE_TOP + 20) + 'px;left:40px;right:40px;display:flex;gap:12px;height:550px;">\n' +
  '      <div style="flex:1;overflow:hidden;position:relative;">' + pagePhotos[2] + '</div>\n' +
  '      <div style="flex:1;overflow:hidden;position:relative;">' + pagePhotos[3] + '</div>\n' +
  '    </div>\n' +
  '    <div style="position:absolute;top:' + (SAFE_TOP + 590) + 'px;left:60px;right:60px;">\n' +
  '      <div style="font-size:11px;letter-spacing:5px;color:#cc0000;text-transform:uppercase;margin-bottom:10px;">PORTFOLIO</div>\n' +
  '      <div style="font-size:28px;font-weight:700;color:#000;line-height:1.2;">Light &amp; Shadow</div>\n' +
  '      <div style="font-size:13px;color:#999;margin-top:8px;letter-spacing:1px;">Film photography, Manila 2026</div>\n' +
  '    </div>\n' +
  '    <div style="position:absolute;bottom:' + (SAFE_BOTTOM + 20) + 'px;right:50px;"><div style="font-size:11px;letter-spacing:3px;color:#999;">04</div></div>\n' +
  '  </div>\n' +

  '  <!-- Page 4: Full bleed -->\n' +
  '  <div id="page-3" style="position:absolute;inset:0;background:#fff;transform-origin:left center;transform:rotateY(0deg);backface-visibility:hidden;opacity:0;">\n' +
  '    <div style="position:absolute;top:' + SAFE_TOP + 'px;left:0;right:0;bottom:' + SAFE_BOTTOM + 'px;overflow:hidden;">' + pagePhotos[4] + '</div>\n' +
  '    <div style="position:absolute;top:' + (SAFE_TOP + 30) + 'px;left:50px;z-index:5;"><div style="font-size:48px;font-weight:100;color:#fff;letter-spacing:6px;text-shadow:0 2px 8px rgba(0,0,0,0.6);text-transform:uppercase;">Beauty</div></div>\n' +
  '    <div style="position:absolute;bottom:' + (SAFE_BOTTOM + 20) + 'px;right:50px;z-index:5;"><div style="font-size:11px;letter-spacing:3px;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,0.8);">05</div></div>\n' +
  '  </div>\n' +

  '  <!-- Page 5: Half reversed -->\n' +
  '  <div id="page-4" style="position:absolute;inset:0;background:#fff;transform-origin:left center;transform:rotateY(0deg);backface-visibility:hidden;opacity:0;">\n' +
  '    <div style="position:absolute;top:' + (SAFE_TOP + 20) + 'px;left:60px;right:60px;">\n' +
  '      <div style="font-size:11px;letter-spacing:5px;color:#cc0000;text-transform:uppercase;margin-bottom:10px;">BEHIND THE LENS</div>\n' +
  '      <div style="font-size:32px;font-weight:700;color:#000;line-height:1.2;margin-bottom:12px;">Shot on Film</div>\n' +
  '      <div style="font-size:14px;color:#666;line-height:1.6;letter-spacing:0.5px;">Real moments, real light, real people. No filters needed.</div>\n' +
  '    </div>\n' +
  '    <div style="position:absolute;top:' + (SAFE_TOP + 280) + 'px;left:0;right:0;bottom:' + SAFE_BOTTOM + 'px;overflow:hidden;">' + pagePhotos[5] + '</div>\n' +
  '    <div style="position:absolute;bottom:' + (SAFE_BOTTOM + 20) + 'px;right:50px;z-index:5;"><div style="font-size:11px;letter-spacing:3px;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,0.8);">06</div></div>\n' +
  '  </div>\n' +

  '  <!-- Page 6: Three-photo grid -->\n' +
  '  <div id="page-5" style="position:absolute;inset:0;background:#fff;transform-origin:left center;transform:rotateY(0deg);backface-visibility:hidden;opacity:0;">\n' +
  '    <div style="position:absolute;top:' + (SAFE_TOP + 20) + 'px;left:40px;right:40px;height:420px;overflow:hidden;position:relative;">' + pagePhotos[6] + '</div>\n' +
  '    <div style="position:absolute;top:' + (SAFE_TOP + 460) + 'px;left:40px;right:40px;display:flex;gap:12px;height:320px;">\n' +
  '      <div style="flex:1;overflow:hidden;position:relative;"><img src="' + imageDataMap[PHOTO_NAMES[8]] + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" /></div>\n' +
  '      <div style="flex:1;overflow:hidden;position:relative;"><img src="' + imageDataMap[PHOTO_NAMES[9]] + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" /></div>\n' +
  '    </div>\n' +
  '    <div style="position:absolute;top:' + (SAFE_TOP + 800) + 'px;left:60px;"><div style="font-size:11px;letter-spacing:5px;color:#cc0000;text-transform:uppercase;">THE LOOKBOOK</div></div>\n' +
  '    <div style="position:absolute;bottom:' + (SAFE_BOTTOM + 20) + 'px;right:50px;"><div style="font-size:11px;letter-spacing:3px;color:#999;">07</div></div>\n' +
  '  </div>\n' +

  '</div>\n\n' +

  '<!-- BACK COVER -->\n<div id="back-cover" style="position:absolute;inset:0;background:#000;z-index:40;opacity:0;display:flex;align-items:center;justify-content:center;">\n' +
  '  <div style="text-align:center;">\n' +
  '    <div style="font-size:18px;letter-spacing:8px;color:#666;text-transform:uppercase;margin-bottom:20px;">Photography by</div>\n' +
  '    <div style="font-size:56px;font-weight:100;color:#fff;letter-spacing:8px;font-family:Georgia,serif;">@madebyaidan</div>\n' +
  '    <div style="margin-top:24px;width:60px;height:1px;background:#cc0000;margin-left:auto;margin-right:auto;"></div>\n' +
  '  </div>\n' +
  '</div>\n\n' +

  '<!-- CTA SCREEN -->\n<div id="cta-screen" style="position:absolute;inset:0;background:#fff;z-index:50;opacity:0;display:flex;align-items:center;justify-content:center;">\n' +
  '  <div style="text-align:center;">\n' +
  '    <div style="font-size:14px;letter-spacing:6px;color:#cc0000;text-transform:uppercase;margin-bottom:30px;">SUBSCRIBE</div>\n' +
  '    <div style="font-size:44px;font-weight:700;color:#000;font-family:Georgia,serif;line-height:1.2;margin-bottom:20px;">DM for a<br/>free shoot</div>\n' +
  '    <div style="margin:20px auto;width:80px;height:2px;background:#cc0000;"></div>\n' +
  '    <div style="font-size:16px;letter-spacing:4px;color:#999;text-transform:uppercase;margin-top:20px;">@madebyaidan</div>\n' +
  '    <div style="font-size:13px;letter-spacing:3px;color:#ccc;text-transform:uppercase;margin-top:12px;">Manila &middot; Spring 2026</div>\n' +
  '  </div>\n' +
  '</div>\n\n' +

  '</div>\n\n' +

  '<script>\n' +
  '  var FPS = ' + FPS + ';\n' +
  '  var PAGE_COUNT = 6;\n' +
  '\n' +
  '  var cover = document.getElementById("cover");\n' +
  '  var magTitle = document.getElementById("mag-title");\n' +
  '  var heroPhoto = document.getElementById("hero-photo");\n' +
  '  var coverLinesLeft = document.getElementById("cover-lines-left");\n' +
  '  var coverLinesRight = document.getElementById("cover-lines-right");\n' +
  '  var barcode = document.getElementById("barcode");\n' +
  '  var priceIssue = document.getElementById("price-issue");\n' +
  '  var redLineTop = document.getElementById("red-line-top");\n' +
  '  var redLineBottom = document.getElementById("red-line-bottom");\n' +
  '  var pagesContainer = document.getElementById("pages-container");\n' +
  '  var backCover = document.getElementById("back-cover");\n' +
  '  var ctaScreen = document.getElementById("cta-screen");\n' +
  '\n' +
  '  var pages = [];\n' +
  '  for (var i = 0; i < PAGE_COUNT; i++) {\n' +
  '    pages.push(document.getElementById("page-" + i));\n' +
  '  }\n' +
  '\n' +
  '  function ease(t, from, duration) {\n' +
  '    if (t <= from) return 0;\n' +
  '    if (t >= from + duration) return 1;\n' +
  '    var p = (t - from) / duration;\n' +
  '    return p * p * (3 - 2 * p);\n' +
  '  }\n' +
  '\n' +
  '  function lerp(a, b, t) { return a + (b - a) * t; }\n' +
  '\n' +
  '  window.__applyUpTo = function(t) {\n' +
  '    cover.style.opacity = "1";\n' +
  '    pagesContainer.style.opacity = "0";\n' +
  '    backCover.style.opacity = "0";\n' +
  '    ctaScreen.style.opacity = "0";\n' +
  '    for (var i = 0; i < PAGE_COUNT; i++) {\n' +
  '      pages[i].style.opacity = "0";\n' +
  '      pages[i].style.transform = "rotateY(0deg)";\n' +
  '    }\n' +
  '\n' +
  '    if (t < 1.0) {\n' +
  '      var titleProgress = ease(t, 0, 0.8);\n' +
  '      magTitle.style.transform = "translateY(" + lerp(-120, 0, titleProgress) + "px)";\n' +
  '      magTitle.style.opacity = titleProgress.toString();\n' +
  '      heroPhoto.style.opacity = "0";\n' +
  '      coverLinesLeft.style.opacity = "0";\n' +
  '      coverLinesLeft.style.transform = "translateX(-30px)";\n' +
  '      coverLinesRight.style.opacity = "0";\n' +
  '      coverLinesRight.style.transform = "translateX(30px)";\n' +
  '      barcode.style.opacity = "0";\n' +
  '      priceIssue.style.opacity = "0";\n' +
  '      redLineTop.style.transform = "scaleX(0)";\n' +
  '      redLineBottom.style.transform = "scaleX(0)";\n' +
  '    }\n' +
  '    else if (t < 3.0) {\n' +
  '      magTitle.style.transform = "translateY(0px)";\n' +
  '      magTitle.style.opacity = "1";\n' +
  '      heroPhoto.style.opacity = ease(t, 1.0, 0.6).toString();\n' +
  '      redLineTop.style.transform = "scaleX(" + ease(t, 1.2, 0.8) + ")";\n' +
  '      redLineBottom.style.transform = "scaleX(" + ease(t, 1.4, 0.8) + ")";\n' +
  '      var leftProgress = ease(t, 1.5, 0.6);\n' +
  '      coverLinesLeft.style.opacity = leftProgress.toString();\n' +
  '      coverLinesLeft.style.transform = "translateX(" + lerp(-30, 0, leftProgress) + "px)";\n' +
  '      var rightProgress = ease(t, 1.8, 0.6);\n' +
  '      coverLinesRight.style.opacity = rightProgress.toString();\n' +
  '      coverLinesRight.style.transform = "translateX(" + lerp(30, 0, rightProgress) + "px)";\n' +
  '      barcode.style.opacity = "0";\n' +
  '      priceIssue.style.opacity = "0";\n' +
  '    }\n' +
  '    else if (t < 5.0) {\n' +
  '      magTitle.style.transform = "translateY(0px)";\n' +
  '      magTitle.style.opacity = "1";\n' +
  '      heroPhoto.style.opacity = "1";\n' +
  '      redLineTop.style.transform = "scaleX(1)";\n' +
  '      redLineBottom.style.transform = "scaleX(1)";\n' +
  '      coverLinesLeft.style.opacity = "1";\n' +
  '      coverLinesLeft.style.transform = "translateX(0px)";\n' +
  '      coverLinesRight.style.opacity = "1";\n' +
  '      coverLinesRight.style.transform = "translateX(0px)";\n' +
  '      barcode.style.opacity = ease(t, 3.0, 0.5).toString();\n' +
  '      priceIssue.style.opacity = ease(t, 3.3, 0.5).toString();\n' +
  '      if (t > 4.5) {\n' +
  '        var fadeOut = ease(t, 4.5, 0.5);\n' +
  '        cover.style.opacity = lerp(1, 0, fadeOut).toString();\n' +
  '      }\n' +
  '    }\n' +
  '    else if (t < 10.0) {\n' +
  '      cover.style.opacity = "0";\n' +
  '      pagesContainer.style.opacity = "1";\n' +
  '      var pageInterval = 5.0 / PAGE_COUNT;\n' +
  '      var currentPage = Math.floor((t - 5.0) / pageInterval);\n' +
  '      var pageFrac = ((t - 5.0) % pageInterval) / pageInterval;\n' +
  '      for (var i = 0; i < PAGE_COUNT; i++) {\n' +
  '        if (i < currentPage) {\n' +
  '          pages[i].style.opacity = "0";\n' +
  '          pages[i].style.transform = "rotateY(-90deg)";\n' +
  '        } else if (i === currentPage) {\n' +
  '          if (pageFrac < 0.1) {\n' +
  '            var flipIn = pageFrac / 0.1;\n' +
  '            pages[i].style.opacity = "1";\n' +
  '            pages[i].style.transform = "rotateY(" + lerp(90, 0, flipIn * flipIn * (3 - 2 * flipIn)) + "deg)";\n' +
  '          } else if (pageFrac > 0.85) {\n' +
  '            var flipOut = (pageFrac - 0.85) / 0.15;\n' +
  '            pages[i].style.opacity = lerp(1, 0, flipOut).toString();\n' +
  '            pages[i].style.transform = "rotateY(" + lerp(0, -90, flipOut * flipOut * (3 - 2 * flipOut)) + "deg)";\n' +
  '          } else {\n' +
  '            pages[i].style.opacity = "1";\n' +
  '            pages[i].style.transform = "rotateY(0deg)";\n' +
  '          }\n' +
  '        } else {\n' +
  '          pages[i].style.opacity = "0";\n' +
  '          pages[i].style.transform = "rotateY(90deg)";\n' +
  '        }\n' +
  '      }\n' +
  '    }\n' +
  '    else if (t < 12.0) {\n' +
  '      cover.style.opacity = "0";\n' +
  '      pagesContainer.style.opacity = "0";\n' +
  '      backCover.style.opacity = ease(t, 10.0, 0.5).toString();\n' +
  '      if (t > 11.5) {\n' +
  '        var fadeOut2 = ease(t, 11.5, 0.5);\n' +
  '        backCover.style.opacity = lerp(1, 0, fadeOut2).toString();\n' +
  '      }\n' +
  '    }\n' +
  '    else {\n' +
  '      cover.style.opacity = "0";\n' +
  '      pagesContainer.style.opacity = "0";\n' +
  '      backCover.style.opacity = "0";\n' +
  '      ctaScreen.style.opacity = ease(t, 12.0, 0.5).toString();\n' +
  '    }\n' +
  '  };\n' +
  '\n' +
  '  if (location.search.includes("capture=1")) {\n' +
  '    var style = document.createElement("style");\n' +
  '    style.textContent = "*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0.001s !important; animation-play-state: paused !important; }";\n' +
  '    document.head.appendChild(style);\n' +
  '  }\n' +
  '</script>\n' +
  '</body>\n</html>';
}

async function main() {
  console.log('=== Magazine Cover Reel v69a ===');
  resetOutputDir();

  console.log('Processing photos...');
  var imageDataMap = processPhotos();

  var html = buildHTML(imageDataMap);
  var htmlPath = path.join(OUT_DIR, 'index.html');
  writeFileSync(htmlPath, html);
  console.log('HTML written: ' + htmlPath);

  var framesDir = path.join(OUT_DIR, 'tmp-frames');
  mkdirSync(framesDir, { recursive: true });

  var browser = await chromium.launch();
  var page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto('file://' + htmlPath + '?capture=1', { waitUntil: 'load' });
  await page.waitForTimeout(500);

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

  var outputMp4 = path.join(OUT_DIR, 'reel-69a.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + outputMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  var reelsDst = path.join(reelsDir, 'reel-69a.mp4');
  execSync('cp "' + outputMp4 + '" "' + reelsDst + '"');

  var sz = statSync(outputMp4);
  console.log('Final: ' + (sz.size / (1024 * 1024)).toFixed(1) + ' MB');
  console.log('Output: ' + outputMp4);
  console.log('Copied to: ' + reelsDst);
  console.log('=== Done ===');
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
