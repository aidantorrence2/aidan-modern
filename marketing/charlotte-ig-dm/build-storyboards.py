#!/usr/bin/env python3
"""Builds storyboards.html (80 ad concepts) for the Charlotte free-shoot IG DM campaign.

Usage: python3 marketing/charlotte-ig-dm/build-storyboards.py [out.html]
Photos come only from public/images/tier_candidates (keys T<n>, see TC in concepts.py).
That folder is local and untracked; set TIER_DIR to point elsewhere. S0 = Aidan's mirror selfie.
"""
import base64, html, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
exec(open(os.path.join(HERE, 'concepts.py')).read())  # defines FAM, C
PLAN = open(os.path.join(HERE, 'plan.html')).read() if os.path.exists(os.path.join(HERE, 'plan.html')) else ''

TIER_DIR = os.environ.get('TIER_DIR', os.path.join(ROOT, 'public/images/tier_candidates'))

# The first test: 10 ads in one ad set.
LAUNCH = ['01', '05', '14', '17', '30', '31', '49', '54', '59', '67']
FORMATS = {'R': 'Reel 9:16', 'S': 'Story 9:16', 'F': 'Feed 4:5', 'C': 'Carousel 4:5'}

_cache = {}
def img(key):
    if key in _cache:
        return _cache[key]
    from PIL import Image, ImageOps
    import io
    if key == 'S0':
        im = Image.open(os.path.join(ROOT, 'public/images/self/aidan-udaipur-mirror-01.jpg'))
    else:
        stem, rot = TC[key]
        im = ImageOps.exif_transpose(Image.open(os.path.join(TIER_DIR, stem + '.JPG')))
        im.draft('RGB', (1200, 1200))
        im = im.rotate(rot, expand=True)
    im = im.convert('RGB')
    im.thumbnail((256, 384))
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=72)
    data = buf.getvalue()
    _cache[key] = 'data:image/webp;base64,' + base64.b64encode(data).decode()
    return _cache[key]

def keys_in(spec):
    # 'A0…A46' → a few frames from the range; 'A7,A26' → list; 'T' → text card
    m = re.match(r'(T)(\d+)…T(\d+)', spec)
    if m:
        lo, hi = int(m.group(2)), int(m.group(3))
        step = max(1, (hi - lo) // 3)
        return [f'{m.group(1)}{i}' for i in range(lo, hi + 1, step)][:4]
    return re.findall(r'\b(T\d+|S0)\b', spec)

def frame(slot, spec, overlay, ratio):
    ks = keys_in(spec)
    esc = html.escape(overlay).replace('\n', '<br>')
    if not ks:
        inner = f'<div class="ov ov-text">{esc}</div>'
        cls = 'fr text'
    elif len(ks) == 1:
        inner = f'<img src="{img(ks[0])}" alt="">' + (f'<div class="ov">{esc}</div>' if overlay else '')
        cls = 'fr'
    else:
        tiles = ''.join(f'<img src="{img(k)}" alt="">' for k in ks[:4])
        inner = f'<div class="mosaic n{min(len(ks),4)}">{tiles}</div>' + (f'<div class="ov">{esc}</div>' if overlay else '')
        cls = 'fr'
    note = ' · '.join(ks) if ks else 'text card'
    if '(negative)' in spec:
        cls += ' neg'
    return (f'<figure class="{cls} r-{ratio}"><div class="box">{inner}</div>'
            f'<figcaption><b>{html.escape(slot)}</b><span>{html.escape(note)}</span></figcaption></figure>')

cards = []
for (cid, fam, fmt, title, hook, beats, caption, objection, needs, wave) in C:
    w = 1 if cid in LAUNCH else (2 if wave in (1, 2) else 3)
    ratio = 'v' if fmt in 'RS' else 'p'
    frames = ''.join(frame(s, p, o, ratio) for s, p, o in beats)
    ready = needs == 'ready'
    cards.append(f'''
<article class="card" data-fam="{fam}" data-fmt="{fmt}" data-wave="{w}" id="c{cid}">
  <header>
    <span class="num">{cid}</span>
    <div class="meta"><span class="fam">{html.escape(FAM[fam][0])}</span><span class="chip">{FORMATS[fmt]}</span><span class="chip w{w}">{'Launch set' if w == 1 else f'Wave {w}'}</span></div>
  </header>
  <h3>{html.escape(title)}</h3>
  <p class="hook"><span>Hook</span>{html.escape(hook)}</p>
  <div class="strip">{frames}</div>
  <dl>
    {f'<div><dt>Caption</dt><dd>{html.escape(caption)}</dd></div>' if caption else ''}
    <div><dt>Targets</dt><dd>{html.escape(objection)}</dd></div>
    <div><dt>Assets</dt><dd class="{'ok' if ready else 'warn'}">{html.escape(needs)}</dd></div>
  </dl>
</article>''')

fam_chips = ''.join(f'<button class="f" data-k="fam" data-v="{k}">{html.escape(v[0])}</button>' for k, v in FAM.items())
fam_list = ''.join(f'<li><b>{html.escape(v[0])}</b> {html.escape(v[1])}</li>' for v in FAM.values())
n_ready = sum(1 for c in C if c[8] == 'ready')

page = f'''<meta charset="utf-8">
<title>Charlotte Free-Shoot Ads</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
<style>
/* Layout: a darkroom contact sheet. Concepts are frame strips on a long dark table; brand dark (#0c0c0c) with a safelight-amber accent. */
:root {{
  --bg: #0c0c0c; --panel: #151413; --line: #2a2725; --fg: #ece8e3; --muted: #9a938b;
  --amber: #f0a43a; --ok: #8fc79a; --warn: #f0a43a;
  --display: "Instrument Serif", Georgia, serif;
  --body: "IBM Plex Sans", system-ui, sans-serif;
  --mono: "IBM Plex Mono", ui-monospace, monospace;
  color-scheme: dark;
}}
body {{ background: var(--bg); color: var(--fg); font: 15px/1.55 var(--body); }}
.wrap {{ max-width: 1240px; margin: 0 auto; padding-block: 40px 80px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }}
h1 {{ font: 400 clamp(40px, 7vw, 76px)/1 var(--display); margin: 0 0 12px; letter-spacing: -0.01em; text-wrap: balance; }}
h1 em {{ color: var(--amber); }}
h2 {{ font: 400 32px/1.1 var(--display); margin: 0 0 14px; }}
.lede {{ max-width: 68ch; color: var(--muted); margin: 0 0 28px; }}
.edge {{ font: 500 11px/1 var(--mono); letter-spacing: .14em; text-transform: uppercase; color: var(--amber); margin-bottom: 18px; display: flex; gap: 18px; flex-wrap: wrap; }}
section.plan {{ display: grid; gap: 28px; margin: 32px 0 44px; }}
.plan .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; }}
.plan .box {{ background: var(--panel); border: 1px solid var(--line); padding: 18px 20px; min-width: 0; }}
.plan h4 {{ font: 500 11px/1.2 var(--mono); letter-spacing: .12em; text-transform: uppercase; color: var(--amber); margin: 0 0 10px; }}
.plan p, .plan li {{ margin: 0 0 6px; }}
.plan ul, .plan ol {{ margin: 0; padding-left: 18px; }}
.plan .q li {{ margin-bottom: 8px; }}
.fams {{ columns: 2 320px; padding: 0; list-style: none; margin: 0; }}
.fams li {{ break-inside: avoid; margin-bottom: 8px; color: var(--muted); }}
.fams b {{ color: var(--fg); font-weight: 600; margin-right: 4px; }}
.filters {{ position: sticky; top: env(safe-area-inset-top, 0px); z-index: 5; background: var(--bg); padding-block: 12px; border-bottom: 1px solid var(--line); margin-bottom: 24px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }}
body::before {{ content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 10; background: var(--bg); }}
.filters .lab {{ font: 500 10px/1 var(--mono); letter-spacing: .12em; text-transform: uppercase; color: var(--muted); margin: 0 4px 0 10px; }}
.filters .lab:first-child {{ margin-left: 0; }}
button.f {{ font: 500 12px/1 var(--body); color: var(--fg); background: transparent; border: 1px solid var(--line); padding: 7px 10px; cursor: pointer; }}
button.f[aria-pressed="true"] {{ background: var(--amber); color: #120c03; border-color: var(--amber); }}
button.f:focus-visible {{ outline: 2px solid var(--amber); outline-offset: 2px; }}
.count {{ margin-left: auto; font: 12px var(--mono); color: var(--muted); }}
.cards {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 560px), 1fr)); gap: 22px; }}
.card {{ border-top: 1px solid var(--line); padding-top: 16px; min-width: 0; }}
.card header {{ display: flex; gap: 12px; align-items: baseline; }}
.num {{ font: 400 34px/1 var(--display); color: var(--amber); font-variant-numeric: tabular-nums; }}
.meta {{ display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }}
.fam {{ font: 500 11px/1 var(--mono); letter-spacing: .1em; text-transform: uppercase; color: var(--muted); margin-right: 4px; }}
.chip {{ font: 500 11px/1 var(--mono); border: 1px solid var(--line); padding: 4px 6px; color: var(--fg); }}
.chip.w1 {{ background: var(--amber); color: #120c03; border-color: var(--amber); }}
.card h3 {{ font: 400 26px/1.15 var(--display); margin: 8px 0 4px; }}
.hook {{ margin: 0 0 12px; color: var(--fg); }}
.hook span, dt {{ font: 500 10px/1 var(--mono); letter-spacing: .12em; text-transform: uppercase; color: var(--muted); margin-right: 8px; }}
.strip {{ display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; scrollbar-width: thin; }}
.fr {{ margin: 0; flex: 0 0 auto; width: 112px; }}
.fr .box {{ position: relative; width: 100%; background: #000; overflow: hidden; border: 1px solid var(--line); }}
.fr.r-v .box {{ aspect-ratio: 9/16; }}
.fr.r-p .box {{ aspect-ratio: 4/5; width: 100%; }}
.fr.r-p {{ width: 150px; }}
.fr img {{ width: 100%; height: 100%; object-fit: cover; display: block; }}
.fr.neg img {{ filter: invert(1) hue-rotate(180deg); }}
.mosaic {{ display: grid; width: 100%; height: 100%; gap: 1px; }}
.mosaic.n2 {{ grid-template-rows: 1fr 1fr; }}
.mosaic.n3 {{ grid-template-rows: 1fr 1fr 1fr; }}
.mosaic.n4 {{ grid-template: 1fr 1fr / 1fr 1fr; }}
.mosaic img {{ min-height: 0; }}
.ov {{ position: absolute; left: 6px; right: 6px; top: 16%; font: 400 12.5px/1.15 var(--display); color: #fff; text-shadow: 0 1px 6px rgba(0,0,0,.9), 0 0 2px rgba(0,0,0,.9); text-wrap: balance; }}
.fr:not(.text) .box::after {{ content: ""; position: absolute; inset: 0 0 55% 0; background: linear-gradient(rgba(0,0,0,.55), transparent); }}
.ov {{ z-index: 1; }}
.fr.text .box {{ background: #1d1a17; }}
.ov-text {{ top: 50%; transform: translateY(-50%); text-align: center; font-size: 13px; }}
figcaption {{ display: grid; gap: 2px; margin-top: 5px; font: 10px/1.3 var(--mono); color: var(--muted); }}
figcaption b {{ color: var(--fg); font-weight: 500; }}
dl {{ margin: 10px 0 0; display: grid; gap: 4px; }}
dl div {{ display: flex; gap: 8px; align-items: baseline; }}
dt {{ flex: 0 0 64px; }}
dd {{ margin: 0; color: var(--muted); min-width: 0; }}
dd.ok {{ color: var(--ok); }}
dd.warn {{ color: var(--warn); }}
@media (max-width: 520px) {{ .fr {{ width: 96px; }} .fr.r-p {{ width: 128px; }} .count {{ margin-left: 0; width: 100%; }} }}
@media (prefers-reduced-motion: no-preference) {{ .card {{ transition: opacity .2s; }} }}
</style>
<div class="wrap">
  <div class="edge"><span>Charlotte, NC</span><span>Instagram DM · $5/day</span><span>80 concepts · {n_ready} ready to render</span></div>
  <h1>Free portrait sessions,<br><em>Charlotte</em> casting</h1>
  <p class="lede">Storyboards for a click-to-Instagram-Direct campaign offering free portrait sessions in Charlotte. Every frame uses photos from your tier_candidates folder (shot in Almaty and Paris). Grey labels under each frame name the photo key. Text cards are dark frames. Nothing renders or goes live until you pick from this board.</p>
  {PLAN}
  <section class="plan"><div><h2>13 creative families</h2><ul class="fams">{fam_list}</ul></div></section>
  <nav class="filters" aria-label="Filter concepts">
    <span class="lab">Set</span><button class="f" data-k="wave" data-v="1">Launch set (10)</button><button class="f" data-k="wave" data-v="2">Wave 2</button><button class="f" data-k="wave" data-v="3">Wave 3</button>
    <span class="lab">Format</span>{''.join(f'<button class="f" data-k="fmt" data-v="{k}">{v}</button>' for k, v in FORMATS.items())}
    <span class="lab">Family</span>{fam_chips}
    <span class="count" id="count"></span>
  </nav>
  <div class="cards">{''.join(cards)}</div>
</div>
<script>
(() => {{
  const sel = {{ fam: null, fmt: null, wave: null }};
  const cards = [...document.querySelectorAll('.card')];
  const btns = [...document.querySelectorAll('button.f')];
  const apply = () => {{
    let n = 0;
    for (const c of cards) {{
      const show = Object.entries(sel).every(([k, v]) => !v || c.dataset[k] === v);
      c.hidden = !show; if (show) n++;
    }}
    for (const b of btns) b.setAttribute('aria-pressed', sel[b.dataset.k] === b.dataset.v ? 'true' : 'false');
    document.getElementById('count').textContent = n + ' of ' + cards.length + ' concepts';
  }};
  for (const b of btns) b.addEventListener('click', () => {{
    sel[b.dataset.k] = sel[b.dataset.k] === b.dataset.v ? null : b.dataset.v; apply();
  }});
  apply();
}})();
</script>
'''
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'storyboards.html')
open(out, 'w').write(page)
print(out, f'{len(page)/1e6:.2f} MB', len(C), 'concepts')
