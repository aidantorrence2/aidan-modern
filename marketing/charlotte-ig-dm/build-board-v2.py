#!/usr/bin/env python3
"""Builds the v2 board: the current winning ad as the benchmark, then CPC-first challengers rendered by render-v2.mjs.

Usage: python3 build-board-v2.py <renders dir from render-v2.mjs> <baseline screenshots dir> <out.html> [videos.json]
videos.json: [{"src": published mp4 path, "poster": published jpg path, "title", "lever", "why", "pick": bool}]
"""
import base64, html, io, json, os, sys
from PIL import Image

R, BASE, OUT = sys.argv[1:4]
VIDEOS = json.load(open(sys.argv[4])) if len(sys.argv) > 4 else []
R3 = sys.argv[5] if len(sys.argv) > 5 else None
R4 = sys.argv[6] if len(sys.argv) > 6 else None
R5 = sys.argv[7] if len(sys.argv) > 7 else None   # render-v5.mjs: 10 new concepts
R6 = sys.argv[8] if len(sys.argv) > 8 else None   # render-v6.mjs: CPC set — ten hooks
R7 = sys.argv[9] if len(sys.argv) > 9 else None   # render-v7.mjs: design set
R8 = sys.argv[10] if len(sys.argv) > 10 else None   # render-v8.mjs: art direction set
R9 = sys.argv[11] if len(sys.argv) > 11 else None   # render-v9.mjs: format-breaking set
R10 = sys.argv[12] if len(sys.argv) > 12 else None   # render-v10.mjs: 30 more formats
LAUNCH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'launch')   # render-v4.mjs: 10 carousels from new_top_tier_candidates   # render-v3.mjs output: photo-heavy still ads (top picks)
PICKS = ['c00', 'n04', 'n11']   # Aidan liked these three (20 Oct)

def thumb(path, w=300):
    im = Image.open(path).convert('RGB'); im.thumbnail((w, int(w * 16 / 9) + 2))
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=74)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()

# lever = which part of cost per chat it attacks; why = the reasoning, grounded in our own campaign numbers where we have them
META = {
 'c00': ('Control: the current winner', 'Benchmark', 'The Istanbul DM deck, photo for photo in layout, re-cast with tier_candidates. The "shot on 35mm film" card is gone (no film in ads) and the last card says "Interested? Let\'s chat." Every challenger is judged against this one in the same ad set.', 'needs nothing'),
 'n01a': ('One frame — hero A', 'CTR · no swipe decay', 'The whole offer and the button cue on card 1. In the decks only cards 1–2 do any work; everything after is people swiping away. Three heroes run as three ads so Meta finds the face that stops Charlotte scrolling.', 'ready'),
 'n01b': ('One frame — hero B', 'CTR · hero test', 'Same layout, full-length frame. Tests whether a full outfit beats a tight face for the click.', 'ready'),
 'n01c': ('One frame — hero C', 'CTR · hero test', 'Same layout, warm golden-hour frame. The third face in the hero test.', 'ready'),
 'n02': ('Face wall', 'CTR · thumb-stop', 'Twelve faces at once is the densest thumb-stop we can make: more faces, more chances a viewer sees someone like herself. City + offer band stays in the middle of the screen, inside the safe zone.', 'ready'),
 'n03': ('One question', 'CTR · self-identification', 'Asks something only the viewer can answer ("have you ever had real photos taken of you?"). Question hooks make people answer in their head, then tap. Card 2 contrasts selfies with portraits.', 'ready'),
 'n04': ('Notes app', 'CPM + CTR · native look', 'Looks like a story a person posted, not an ad. Native-looking creative earns better quality ranking (lower CPM) and gets read instead of skipped. Every objection is answered in four lines.', 'ready'),
 'n05': ('Where should we shoot?', 'CTR + click→chat', 'Charlotte neighbourhoods are the hook (locals recognise them instantly) and the question gives people something to message. The four ice breakers repeat the four spots, so the first DM is one tap.', 'ready · ice breakers = the 4 spots'),
 'n06': ('The DM', 'click→chat · friction', 'Shows exactly what happens after the tap: a two-line chat that answers "is it really free?" and "I\'ve never done this". People click more when the next step is already visible and small.', 'ready'),
 'n07': ('Camera roll vs one hour', 'CTR · contrast', 'Puts the viewer\'s own camera roll next to a portrait. Everyone recognises the top half; the bottom half is the offer.', 'ready'),
 'n08': ('Bring a friend', 'CTR + reach', 'Two people side by side, "free shoot for two". Coming with a friend removes the biggest safety worry, and each yes brings a second person. Needs your OK that duo sessions are on offer.', 'confirm duo sessions'),
 'n09': ('Callout 5', 'CTR · proven English structure', 'The structure of the only English ad that has worked for you (antalya - dm, 5-card callout: 4.17% CTR, $0.40 a chat), without the word "models" so the US ad can\'t be classed as a job ad. One idea per card, one short line each.', 'ready'),
 'n10': ('Eye-contact reel', 'CPM · Reels placement', 'A 4-second reel: one face per beat, all looking into the lens, the city and offer never move. Reels is often one of the cheaper placements, and motion in the first second stops the scroll. Stills here are the keyframes.', 'rendered as a reel below (Eyes)'),
 'n11': ('Hi, I\'m Aidan', 'CTR · trust', 'A real person on camera answers "who is this?" before it is asked. Talking-to-camera creative often gets cheaper clicks. Needs a 10-second selfie video from you; stills show the beats.', 'needs a selfie video'),
 'n12': ('Before the leaves drop', 'CTR · honest deadline', 'Peak leaves in Charlotte (late Oct to mid-Nov) give a real reason to message now instead of later. Needs your dates so the deadline is true.', 'needs your dates'),
}

idx = json.load(open(os.path.join(R, 'index.json')))
base = sorted(f for f in os.listdir(BASE) if f.lower().endswith(('.jpg', '.png')))

def strip(paths, labels):
    return ''.join(f'<figure><img src="{thumb(p)}" alt=""><figcaption>{html.escape(l)}</figcaption></figure>' for p, l in zip(paths, labels))

def card_html(cid):
    title, lever, why, needs = META[cid]
    names = idx.get(cid, [])
    frames = strip([os.path.join(R, cid, n + '.jpg') for n in names], names)
    ok = needs.startswith('ready') or needs == 'needs nothing'
    return (f'''<article class="card{' control' if cid == 'c00' else ''}" id="{cid}">
  <header><span class="num">{cid.upper()}</span><h3>{html.escape(title)}</h3><span class="lever">{html.escape(lever)}</span></header>
  <p class="why">{html.escape(why)}</p>
  <div class="strip">{frames}</div>
  <p class="needs {'ok' if ok else 'warn'}">{html.escape(needs)} · {len(names)} card{'s' if len(names) != 1 else ''}</p>
</article>''')

def vcard(v):
    return f'''<article class="card{' control' if v.get('pick') else ''}">
  <header><span class="num">REEL</span><h3>{html.escape(v['title'])}</h3><span class="lever">{html.escape(v['lever'])}</span></header>
  <p class="why">{html.escape(v['why'])}</p>
  <video src="{v['src']}" poster="{v['poster']}" controls playsinline muted loop preload="none"></video>
  <p class="needs ok">{html.escape(v.get('meta', ''))}</p></article>'''

META3 = {
 'p10f': ('Staggered pairs (pair 2 swapped again)', 'CTR · women & men', 'Same as P10D with the woman in pair 2 swapped for T21.'),
 'p10e': ('Staggered pairs (pair 2 swapped)', 'CTR · women & men', 'Same as P10D with the woman in pair 2 swapped for T49.'),
 'p10d': ('Staggered pairs', 'CTR · women & men', 'Each card is two matted prints, a woman and a man, one high and one low, overlapping and zig-zagging card to card. Copy from your winning deck (same as P10C).'),
 'p07': ('Winner deck, nine prints a card', 'CTR · proof density', 'Your winning deck with your top picks: nine prints on "my recent work" and on "never done this before?", two on "now in Charlotte".'),
 'p08': ('Hi, I\'m Aidan carousel', 'CTR · trust', 'Your hello, then twelve portraits on one card ("here\'s what i shoot"), then the CTA.'),
 'p06': ('Notes app + nine-photo gallery', 'CPM + CTR · native look', 'The note, with a 3×3 grid of portraits under it.'),
 'p02': ('Ten-card carousel', 'CTR · one face per card', 'A hook card, then eight full portraits, each with one short line under the face, then the CTA.'),
 'p01': ('Grid of 16', 'CTR · thumb-stop', 'Sixteen portraits, women and men, with the city band across the middle.'),
 'p03': ('Photo-booth strips', 'CTR · native look', 'Three strips of four portraits (twelve in all) under the headline.'),
 'p04': ('The table', 'CTR · proof', 'Nine prints scattered on the table: "portraits from my last trip, next stop Charlotte".'),
 'p05': ('Hero + rail', 'CTR · thumb-stop', 'One big portrait with the city band under it and a rail of ten more below.'),
 'p09': ('Portfolio grid', 'CTR · credibility', 'Fifteen portraits in a portfolio grid under a plain "aidan · portraits" header.'),
 'p10c': ('Pairs, copy from your deck', 'CTR · women & men', 'Same five pairs; every line after the intro is from your winning deck: Charlotte, free photo shoot → i\'m aidan, a portrait photographer → my recent work → about an hour. i direct every frame. → Interested? Let\'s chat.'),
 'p10b': ('Pairs, story copy (rejected)', 'CTR · women & men', 'Same five pairs, rewritten as one short story in your voice: Charlotte, free photo shoot → i\'m aidan, a portrait photographer → never posed before? perfect, i\'ll guide you → come alone or bring a friend → Interested? Let\'s chat.'),
 'p10': ('Pairs (first copy)', 'CTR · women & men', 'Five cards, each a woman and a man side by side with one line underneath.'),
}
def card3(cid):
    title, lever, why = META3[cid]
    names = json.load(open(os.path.join(R3, 'index.json')))[cid]
    frames = strip([os.path.join(R3, cid, n + '.jpg') for n in names], names)
    return f'''<article class="card"><header><span class="num">{cid.upper()}</span><h3>{html.escape(title)}</h3><span class="lever">{html.escape(lever)}</span></header>
  <p class="why">{html.escape(why)}</p><div class="strip">{frames}</div><p class="needs ok">ready · {len(names)} card{'s' if len(names) != 1 else ''} · top picks only</p></article>'''
photo_ads = ''.join(card3(c) for c in META3) if R3 else ''
META4 = {
 'k01': ('Winner deck, nine prints a card', 'CTR · proof density', 'Your winning deck, 7 cards, with nine prints on "my recent work" and "never done this before?".'),
 'k02': ('Staggered pairs, six cards', 'CTR · women & men', 'A woman and a man per card, one high, one low, zig-zagging; copy from your deck.'),
 'k03': ('Hi, I\'m Aidan + 24 portraits', 'CTR · trust', 'Your hello, then twelve women, then twelve men, then the CTA.'),
 'k04': ('Notes app, two pages of photos', 'CPM + CTR · native look', 'The note with nine portraits, a second page with nine more, then the CTA.'),
 'k05': ('Staggered trios', 'CTR · proof density', 'Three prints cascading down each card, five cards, fifteen people.'),
 'k06': ('Portrait carousel, no words', 'CTR · let the photos talk', 'Hook, eight full-frame portraits with no text at all, then the CTA.'),
 'k07': ('Grid of 20 → hero', 'CTR · thumb-stop', 'Twenty faces on the hook, one big portrait, then the CTA.'),
 'k08': ('The table of twelve', 'CTR · proof', 'Twelve prints over two cards, then the CTA.'),
 'k09': ('Big + inset', 'CTR · two per card', 'Each card a full-frame portrait with a second print laid over the corner.'),
 'k10': ('Photo-booth strips ×2', 'CTR · native look', 'Two cards of three strips (24 portraits), then the CTA.'),
}
def card4(cid):
    title, lever, why = META4[cid]
    names = json.load(open(os.path.join(R4, 'index.json')))[cid]
    frames = strip([os.path.join(R4, cid, n + '.jpg') for n in names], names)
    return f'''<article class="card"><header><span class="num">{cid.upper()}</span><h3>{html.escape(title)}</h3><span class="lever">{html.escape(lever)}</span></header>
  <p class="why">{html.escape(why)}</p><div class="strip">{frames}</div><p class="needs ok">ready · {len(names)} cards · new_top_tier_candidates (all 106 used)</p></article>'''
car4 = ''.join(card4(c) for c in META4) if R4 else ''
META5 = {
 'x01': ('The name is the photo', 'CTR · thumb-stop', 'C-H-A-R-L-O-T-T-E set huge, each letter filled with a different portrait; card 2 shows the nine people.'),
 'x02': ('One shoot, many frames', 'CTR + click→chat · what you get', 'Each card is one person and four frames from the same session: what one hour gives you.'),
 'x03': ('Panorama table', 'CTR · swipe continuity', 'One long table of prints laid across five cards; prints cross the card edges so the swipe feels continuous.'),
 'x04': ('Zoom out', 'CTR · curiosity', 'Card 1 is only her eyes, then her face, then the whole portrait, then everyone else.'),
 'x05': ('Covers', 'CTR · editorial', 'Five magazine covers: CHARLOTTE masthead above the head, cover lines in the clear space.'),
 'x06': ('The exhibition', 'CTR · credibility', 'Framed prints of different sizes hung on a gallery wall with a wall label.'),
 'x07': ('Colour chapters', 'CTR · taste', 'The work sorted by light: golden, blue, black & white — one chapter per card.'),
 'x08': ('The fan', 'CTR · proof density', 'Prints fanned out like a hand of cards, seven a card.'),
 'x09': ('The magazine page', 'CTR · editorial', 'Each card laid out like an editorial page: headline, one big picture, two smaller ones.'),
 'x10': ('Torn collage', 'CTR · native/zine', 'Portraits torn out and layered like a zine; the headline on a torn paper strip.'),
}
def card5(cid):
    title, lever, why = META5[cid]
    names = json.load(open(os.path.join(R5, 'index.json')))[cid]
    frames = strip([os.path.join(R5, cid, n + '.jpg') for n in names], names)
    return f'''<article class="card"><header><span class="num">{cid.upper()}</span><h3>{html.escape(title)}</h3><span class="lever">{html.escape(lever)}</span></header>
  <p class="why">{html.escape(why)}</p><div class="strip">{frames}</div><p class="needs ok">ready · {len(names)} cards</p></article>'''
car5 = ''.join(card5(c) for c in META5) if R5 else ''
META6 = {
 'h01': ('Eye contact', 'card-1 CTR', 'The closest clean portrait, face filling the frame. The control for the hook test.'),
 'h02': ('Golden light', 'card-1 CTR', 'The Seine portrait in warm late light. Same type, different mood.'),
 'h03': ('Colour', 'card-1 CTR', 'White dress on the orange wall: one loud colour in a dark feed.'),
 'h04': ('A man first', 'card-1 CTR · mixed set', 'The curly black-and-white close portrait. Tests a male hero.'),
 'h05': ('Two-up', 'card-1 CTR · women & men', 'A woman and a man full height, faces big, city above both heads.'),
 'h06': ('The street', 'card-1 CTR · scene', 'A full-length street frame; the scene sells the shoot, the face is smaller.'),
 'h07': ('One big print', 'card-1 CTR · premium', 'A single matted print on the black table, nearly full width.'),
 'h08': ('The question', 'card-1 CTR · copy test', '"Want photos like these?" as the headline, city underneath.'),
 'h09': ('The callout', 'card-1 CTR · proven structure', 'City huge plus one line of intent — the shape of your best English ad.'),
 'h10': ('Notes, one photo', 'CPM · native look', 'The Notes look with three lines and one big portrait, no grid.'),
}
def card6(cid):
    title, lever, why = META6[cid]
    names = json.load(open(os.path.join(R6, 'index.json')))[cid]
    frames = strip([os.path.join(R6, cid, n + '.jpg') for n in names], names)
    return f'''<article class="card control"><header><span class="num">{cid.upper()}</span><h3>{html.escape(title)}</h3><span class="lever">{html.escape(lever)}</span></header>
  <p class="why">{html.escape(why)}</p><div class="strip">{frames}</div><p class="needs ok">ready · {len(names)} cards · same proven body behind each hook</p></article>'''
car6 = ''.join(card6(c) for c in META6) if R6 else ''
META7 = {
 'd01': ('Behind', 'design · masthead', 'CHARLOTTE set huge behind the subject (Vision cut-out), her head in front of the letters.'),
 'd02': ('Vertical', 'design · poster', 'The city runs up the left edge in 190px type; the portrait fills the rest.'),
 'd03': ('Poster band', 'design · flat colour', 'The photo stops on a clean edge; a band in the photo\'s own accent colour carries the type.'),
 'd04': ('Arch', 'design · print', 'Cream ground, the portrait inside a tall arch window, ink type above.'),
 'd05': ('Letterbox', 'design · film still', 'A band between black bars, the city as a subtitle, a mono slug in the top bar.'),
 'd06': ('Marked', 'design · contact sheet', 'A hand-drawn ring around the face, the city handwritten, nothing else.'),
 'd07': ('Silhouette', 'design · pure poster', 'The subject cut out on a flat colour field — no background at all.'),
 'd08': ('Label', 'design · gallery', 'Full-bleed portrait with a white gallery label pinned low.'),
 'd09': ('Detail', 'design · magazine', 'The portrait plus a tight detail of the same face inset like a call-out.'),
 'd10': ('Modular', 'design · grid', 'A strict grid: the photo in a 2×2 block, a colour module, a dark module with the city.'),
}
def card7(cid):
    title, lever, why = META7[cid]
    names = json.load(open(os.path.join(R7, 'index.json')))[cid]
    frames = strip([os.path.join(R7, cid, n + '.jpg') for n in names], names)
    return f'''<article class="card control"><header><span class="num">{cid.upper()}</span><h3>{html.escape(title)}</h3><span class="lever">{html.escape(lever)}</span></header>
  <p class="why">{html.escape(why)}</p><div class="strip">{frames}</div><p class="needs ok">ready · {len(names)} cards · same proven body</p></article>'''
car7 = ''.join(card7(c) for c in META7) if R7 else ''
META8 = {
 'e01': ('Comp card', 'Futura + Helvetica · white card', 'A model\'s comp card: the portrait, the city as the agency line, the offer as the stats rows.'),
 'e02': ('Interleaved masthead', 'Fraunces 330px', 'CHAR behind the head, LOTTE in front across the chest — the word threads through her.'),
 'e03': ('Seal', 'Futura on a circle + Didot', 'The offer set on a ring around the face like a stamp; the city once, big, beneath.'),
 'e04': ('Riso poster', 'two-ink duotone + Helvetica Bold', 'Shadows in ink blue, highlights in paper, the city in red. The one treated photo in the set.'),
 'e05': ('Ticker', 'Didot + mono strips', 'Campaign-style running strips at the safe edges; the city once, flush left.'),
 'e06': ('Loupe', 'Baskerville italic', 'A photographer\'s loupe magnifying the eyes.'),
 'e07': ('Diagonal fields', 'Avenir Condensed Heavy', 'Two flat colours split on a diagonal, the subject cut out across the seam.'),
 'e08': ('Outline / solid', 'Bodoni 72', 'The city straddles the photo\'s bottom edge: hollow letters over the photo, solid over the dark.'),
 'e09': ('Stacked grotesque', 'Helvetica Bold 330px', 'CHAR / LOTTE stacked flush left under the face. Poster, not deck.'),
 'e10': ('Polaroid on linen', 'handwriting', 'One thick-bordered instant print on dark linen, the city handwritten on its margin.'),
}
def card8(cid):
    title, lever, why = META8[cid]
    names = json.load(open(os.path.join(R8, 'index.json')))[cid]
    frames = strip([os.path.join(R8, cid, n + '.jpg') for n in names], names)
    return f'''<article class="card control"><header><span class="num">{cid.upper()}</span><h3>{html.escape(title)}</h3><span class="lever">{html.escape(lever)}</span></header>
  <p class="why">{html.escape(why)}</p><div class="strip">{frames}</div><p class="needs ok">ready · {len(names)} cards · same proven body</p></article>'''
car8 = ''.join(card8(c) for c in META8) if R8 else ''
META9 = {
 'g01': ('Viewfinder', 'looks like: the photographer\'s camera', 'The ad is a camera\'s live view: AF square on the face, eye-AF boxes on the pupils (from the face landmarks), exposure readout, the city as the frame label, a shutter ring. Cards: take the shot → about an hour → shutter pressed.'),
 'g02': ('Lock screen', 'looks like: your own phone', 'The portrait is the wallpaper; "Charlotte" is set in the clock\'s slot; Messages notifications from Aidan carry the offer. It looks like something already on your phone.'),
 'g03': ('Instagram story', 'looks like: a friend\'s story', 'Highlight-pill text, a location sticker, a poll ("Want photos like these? yes / yes 👀"), a question sticker with "yes" typed in, a Send-message sticker. Native to where it runs.'),
 'g04': ('Text portrait', 'looks like: nothing else on the feed', 'The portrait is built entirely out of the word CHARLOTTE (letter size and colour follow the photo). Swipe → the real photo → the call.'),
 'g05': ('Die-cut stickers', 'looks like: a sticker pack', 'Cut-out stickers with a white edge on flat colour, marker type with a sticker stroke; card 2 is a sticker sheet of six.'),
 'g06': ('Receipt', 'looks like: a receipt', 'A thermal receipt lying on the portrait: about an hour, I direct every frame, edited photos — total $0.00. Cards 2–3 are receipts with a thermal-printed portrait.'),
 'g07': ('Proof sheet', 'looks like: a photographer\'s contact sheet', 'A contact sheet with grease-pencil marks and one empty frame circled in red: "you?". Next card: "this one." Then the call in red handwriting.'),
 'g08': ('Eye lineup', 'looks like: a line-up', 'Three pairs of eyes stacked at one scale, the city underneath. Cards 2–3: more eyes, then "INTERESTED? LET\'S CHAT."'),
 'g09': ('Double exposure', 'looks like: a photograph', 'A woman and a man superimposed with their eyes locked on the same two points; the type in Futura.'),
 'g10': ('Glitch', 'looks like: a corrupted file', 'The portrait split into red/green/blue channels, torn slices, scanlines, type with the same split.'),
}
def card9(cid):
    title, lever, why = META9[cid]
    names = json.load(open(os.path.join(R9, 'index.json')))[cid]
    frames = strip([os.path.join(R9, cid, n + '.jpg') for n in names], names)
    return f'''<article class="card control"><header><span class="num">{cid.upper()}</span><h3>{html.escape(title)}</h3><span class="lever">{html.escape(lever)}</span></header>
  <p class="why">{html.escape(why)}</p><div class="strip">{frames}</div><p class="needs ok">ready · {len(names)} cards</p></article>'''
car9 = ''.join(card9(c) for c in META9) if R9 else ''
META10 = {
 'm01': ('iMessage', 'a text from Aidan', 'A text thread: your portrait arrives as a photo message, "interested?" underneath.'),
 'm02': ('Instagram message request', 'a DM request', 'A request from @madebyaidan with an Accept button, then the thread.'),
 'm03': ('Memories', 'a Photos memory', 'A "memory" tile: story bars, "Charlotte / free photo shoot", a Play pill.'),
 'm04': ('FaceTime call', 'an incoming call', '"Charlotte" is calling: Decline / Accept. Card 2: the live call.'),
 'm05': ('Now playing', 'a music player', 'The portrait is the album art; the city is the track; "Interested? Let\'s chat." is the next song.'),
 'm06': ('Map pin', 'a map', 'A map whose pin has her portrait as its head; the place card says Charlotte; a Directions-style sheet with the button.'),
 'm07': ('Weather', 'a forecast', 'The forecast says FREE. H: about an hour, L: $0. Card 2: "Tonight — Interested? Let\'s chat."'),
 'm08': ('Listing', 'a stay listing', 'A photo carousel with dots, "Free photo shoot in Charlotte", $0, a Message button.'),
 'm09': ('App Store', 'an app page', 'The app is "Charlotte — Free Photo Shoot": GET, price/time/place, screenshots.'),
 'm10': ('Newspaper', 'a front page', 'A halftone portrait under "Free photo shoot comes to Charlotte". Card 2 is page two with the boxed call.'),
 'm11': ('Admit-one ticket', 'a ticket', 'A perforated ticket: the portrait on it, CHARLOTTE, a barcode stub.'),
 'm12': ('Tarot', 'a tarot card', 'Three cards: THE PORTRAIT (Charlotte), THE HOUR, THE CALL.'),
 'm13': ('Trading card', 'a holo collector card', 'FREE in the corner; abilities: About an hour / I direct every frame / Interested? Let\'s chat.'),
 'm14': ('Instagram profile', 'a profile page', 'Bio from your deck, highlights, and Message as the main button.'),
 'm15': ('Instagram note', 'a friend\'s note', 'A note bubble over the avatar: "free photo shoot in Charlotte 📸".'),
 'm16': ('$0 / 1 hr', 'a stats card', 'Giant numerals behind a cut-out subject.'),
 'm17': ('Activity rings', 'a fitness ring', 'Three closed rings around her portrait, a 01:00:00 timer.'),
 'm18': ('Clapperboard', 'a film slate', 'PROD. free photo shoot · SCENE Charlotte · DIRECTOR Aidan.'),
 'm19': ('Search result', 'a search page', 'The first result is the offer; card 2 is "People also ask".'),
 'm20': ('Post', 'a social post', 'A text post with the portrait as its attached photo.'),
 'm21': ('Album cover', 'a record sleeve', 'A FREE sticker on the sleeve; the back is the track list.'),
 'm22': ('Marquee', 'a theatre marquee', 'CHARLOTTE in bulbs, the portrait in a bulb frame; "NOW SHOWING".'),
 'm23': ('Neon', 'a neon sign', 'Neon script over a dark portrait.'),
 'm24': ('Chalkboard', 'a menu board', '"today\'s special: Free Photo Shoot — Charlotte · about an hour · $0" with a taped polaroid.'),
 'm25': ('Retro window', 'a 90s dialog', 'Charlotte.exe with the portrait and a default button "Interested? Let\'s chat."'),
 'm26': ('CAPTCHA', 'a verification grid', '"Select all squares with a free photo shoot in Charlotte"; card 2 is "Verified ✓".'),
 'm27': ('Facts label', 'a nutrition label', 'Photo Shoot Facts: servings 1, time about an hour, cost $0.'),
 'm28': ('Postcard', 'a postcard', 'Greetings from Charlotte, with a FREE stamp; the back has the message.'),
 'm29': ('Video call', 'a meeting gallery', 'Three tiles and a fourth that says "You — tap to join".'),
 'm30': ('Highway sign', 'an exit sign', 'A green exit sign over the portrait: CHARLOTTE ↗ FREE PHOTO SHOOT, EXIT 1 HR.'),
}
def card10(cid):
    title, lever, why = META10[cid]
    names = json.load(open(os.path.join(R10, 'index.json')))[cid]
    frames = strip([os.path.join(R10, cid, n + '.jpg') for n in names], names)
    return f'''<article class="card control"><header><span class="num">{cid.upper()}</span><h3>{html.escape(title)}</h3><span class="lever">looks like: {html.escape(lever)}</span></header>
  <p class="why">{html.escape(why)}</p><div class="strip">{frames}</div><p class="needs ok">ready · {len(names)} cards</p></article>'''
car10 = ''.join(card10(c) for c in META10) if R10 else ''
import csv
def launch_html():
    rows = list(csv.DictReader(open(os.path.join(LAUNCH, 'ads.csv'))))
    out = []
    for r in rows:
        d = os.path.join(LAUNCH, r['round'].lower(), r['id'])
        fl = r['files (in launch/<round>/<id>/)'].split(' | ')
        if fl[0].endswith('.mp4'):
            v = fl[0][:-4]
            media = f'<video src="videos/{v}.mp4" poster="videos/{v}.jpg" controls playsinline muted loop preload="none"></video>'
        else:
            media = '<div class="strip">' + strip([os.path.join(d, f) for f in fl], fl) + '</div>'
        out.append(f'<article class="card control"><header><span class="num">{r["id"].upper()}</span><h3>{html.escape(r["name"])}</h3><span class="lever">{r["round"]} · {html.escape(r["lever"])}</span></header><p class="why">{html.escape(r["hypothesis"])}</p>{media}</article>')
    return ''.join(out)
launch = launch_html() if os.path.exists(os.path.join(LAUNCH, 'ads.csv')) else ''
picks = ''.join(card_html(c) for c in PICKS)
rest = ''.join(card_html(c) for c in META if c not in PICKS)
vids = ''.join(vcard(v) for v in sorted(VIDEOS, key=lambda v: not v.get('pick')))

page = f'''<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Charlotte Ads v2</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
<style>
:root {{ --bg:#0c0c0c; --panel:#151413; --line:#2a2725; --fg:#ece8e3; --muted:#9a938b; --amber:#f0a43a; --ok:#8fc79a;
  --display:"Instrument Serif",Georgia,serif; --body:"IBM Plex Sans",system-ui,sans-serif; --mono:"IBM Plex Mono",ui-monospace,monospace; color-scheme:dark; }}
* {{ box-sizing:border-box }}
body {{ margin:0; background:var(--bg); color:var(--fg); font:15px/1.55 var(--body); }}
.wrap {{ max-width:1240px; margin:0 auto; padding:40px 16px 80px; }}
h1 {{ font:400 clamp(40px,7vw,76px)/1 var(--display); margin:0 0 12px; }} h1 em {{ color:var(--amber); }}
h2 {{ font:400 34px/1.1 var(--display); margin:48px 0 14px; }}
.lede {{ max-width:70ch; color:var(--muted); margin:0 0 20px; }}
.edge {{ font:500 11px/1 var(--mono); letter-spacing:.14em; text-transform:uppercase; color:var(--amber); margin-bottom:18px; }}
.grid {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:16px; }}
.box {{ background:var(--panel); border:1px solid var(--line); padding:18px 20px; min-width:0; }}
.box h4 {{ font:500 11px/1.2 var(--mono); letter-spacing:.12em; text-transform:uppercase; color:var(--amber); margin:0 0 10px; }}
.box p, .box li {{ margin:0 0 6px; }} .box ul, .box ol {{ margin:0; padding-left:18px; }}
.math {{ font:500 15px/1.6 var(--mono); }}
.card {{ background:var(--panel); border:1px solid var(--line); padding:20px; margin:0 0 18px; }}
.card.control {{ border-color:var(--amber); }}
video {{ width:min(100%,300px); aspect-ratio:9/16; background:#000; display:block; border:1px solid var(--line); }}
.card header {{ display:flex; gap:14px; align-items:baseline; flex-wrap:wrap; }}
.num {{ font:500 13px var(--mono); color:var(--amber); }}
.card h3 {{ font:400 30px/1.1 var(--display); margin:0; }}
.lever {{ font:500 11px var(--mono); letter-spacing:.08em; text-transform:uppercase; border:1px solid var(--line); padding:4px 8px; color:var(--muted); }}
.why {{ max-width:80ch; margin:10px 0 14px; }}
.strip {{ display:flex; gap:10px; overflow-x:auto; padding-bottom:8px; }}
.strip figure {{ margin:0; flex:none; width:170px; }}
.strip img {{ width:170px; aspect-ratio:9/16; object-fit:cover; display:block; border:1px solid var(--line); }}
.strip figcaption {{ font:400 11px var(--mono); color:var(--muted); margin-top:4px; }}
.needs {{ font:500 12px var(--mono); margin:8px 0 0; }} .ok {{ color:var(--ok); }} .warn {{ color:var(--amber); }}
@media (max-width:600px) {{ .strip figure, .strip img {{ width:130px; }} }}
</style>
<div class="wrap">
<div class="edge"><span>Charlotte · Instagram DM ads · v2 · 19 Oct 2026</span></div>
<h1>Beat the <em>winner</em>, cut the cost per click</h1>
<p class="lede">The Istanbul deck below is the benchmark. Everything after it is a different structure, not a re-skin, and each one names the part of the cost it attacks. All photos come from tier_candidates. No text sits on a face: every still and every video frame is checked against Apple Vision face boxes and fails the render if it does. None of this is live and nothing has been spent.</p>

<h2>The benchmark</h2>
<p class="lede">Your current successful ad, as you sent it. In Charlotte it runs as C00 below: same layout, new photos, no film card, last card "Interested? Let's chat."</p>
<div class="strip">{strip([os.path.join(BASE, f) for f in base], [f'card {i + 1}' for i in range(len(base))])}</div>

<h2>Where the cost comes from</h2>
<div class="grid">
 <div class="box"><h4>The equation</h4><p class="math">cost per chat = CPM ÷ (1000 × CTR) ÷ click→chat</p><p>CPC is the first two terms. Your own accounts show CTR is the term that moves: from 0.7% to 7.4% between ads, while click→chat sat at 15–18% everywhere.</p></div>
 <div class="box"><h4>What your past ads say</h4><ul>
  <li>ist - dm - tr (Turkish deck): 5.9–7.4% CTR, $0.11–0.17 a chat</li>
  <li>antalya - dm (English 5-card callout): 4.17% CTR, $0.40 a chat</li>
  <li>athens (English 8-card deck): 1.30% CTR, $2.31 a chat</li>
  <li>fethiye - dm en (English 8-card deck): 0.74% CTR, 0 chats</li></ul>
  <p>The 8-card deck has only won in the viewer's own language. Charlotte speaks English, so that part is solved, but US CPMs are much higher than Turkey's ($2.57), so every point of CTR matters more here.</p></div>
 <div class="box"><h4>Levers that aren't creative</h4><ul>
  <li>Women-only ad set: a hard control on your account; women-only sets have been your cheapest chats</li>
  <li>$5/day can feed 3–4 ads, not 10. More ads split the budget and nothing exits learning</li>
  <li>No edits for 72 hours after launch (Athens lost its learning to 3 location edits in 48h)</li>
  <li>Placements: Stories + Reels + Feed. Explore was removed from the API in v26</li>
  <li>No "models", "casting" or job words. In the US that can make it a job ad: no age targeting, 15-mile minimum radius</li></ul></div>
</div>

<h2>Test plan at $5/day</h2>
<div class="grid">
 <div class="box"><h4>Round 1 · 4 ads · days 1–4</h4><p>C00 control (still deck) · Winner reel · Notes reel · Hi, I'm Aidan reel</p><p>Your three picks, with the winner run both as stills and as a reel, so the first read says whether motion alone lowers CPC.</p></div>
 <div class="box"><h4>Round 2 · days 5–8</h4><p>Keep the two cheapest. Add the best of Eyes / Behind / Wall and the Notes still.</p><p>Pause anything above 1.5× the control's CPC once it has 1,000 impressions.</p></div>
 <div class="box"><h4>Round 3</h4><p>Hero test on the winning layout (three different first frames), plus the real selfie clip if you film it.</p><p>Judge on CPC first, then cost per chat once each ad has 5+ chats.</p></div>
</div>

<h2>Launch set — what to run, in order</h2>
<p class="lede">Round 1 (4 ads, women-only set): the control, the proof sheet, the receipt, the viewfinder without its shutter. Round 2: "just say hi", the ask list, the swipe-bait, four neighbourhoods. Round 3: three 5-second Reels plus the quiet print, the upside-down hook and a zero-design story. Dropped on purpose: anything that draws fake buttons, notifications or checkboxes (Meta's non-existent-functionality rule). Copy, ice breakers and the paused-campaign spec: <code>marketing/charlotte-ig-dm/launch/LAUNCH.md</code>. Nothing is published.</p>
{launch}
<h2>30 more: the same idea, thirty new formats</h2>
<p class="lede">M01–M30. Same principle as the set below (card 1 stops the scroll by looking like something else), thirty new formats: message apps, a call, a player, a map, a forecast, a listing, an app page, a newspaper, a ticket, tarot, a trading card, a profile, a note, a stats card, fitness rings, a clapperboard, a search page, a post, an album, a marquee, neon, a chalkboard, a retro window, a CAPTCHA, a facts label, a postcard, a video call, a highway sign. Each has a hook and its own call-to-action card. No text on any face.</p>
{car10}
<h2>The format-breaking set: ten things that don't look like ads</h2>
<p class="lede">The earlier sets were all "a poster with a face and the city". These break that template: each concept is a different format that borrows the look of something else — a camera, a lock screen, an Instagram story, a sticker pack, a receipt, a contact sheet with an empty frame for you, a portrait made of the word, an eye lineup, a double exposure, a glitch. CPC logic: card 1 stops the scroll by not looking like an ad. Face-size and type-over-face rules are relaxed only where the format needs it (proof sheet, lineup); no text sits on a face in any of them.</p>
{car9}
<h2>The art-direction set: ten voices (earlier)</h2>
<p class="lede">Each hook has its own typeface, layout logic, colour and idea — not the same serif moved around. Same CPC gates (one portrait, face ≥300px, city huge, nothing on a face), same proven body behind each. Fonts: Didot, Futura, Helvetica Neue, Bodoni 72, Baskerville, Avenir Condensed, Menlo, Fraunces.</p>
{car8}
<h2>The design set: ten visual languages</h2>
<p class="lede">Same CPC rules as the set below (one portrait, face ≥300px, city huge, ≤2 lines, nothing on a face), but each hook is a different design language: type behind the subject, vertical type, a colour band, an arch, a letterbox, a hand-drawn mark, a cut-out on flat colour, a gallery label, a detail inset, a modular grid. Same proven body behind each.</p>
{car7}
<h2>The CPC set: ten hooks</h2>
<p class="lede">CPC is decided by card 1. Each of these is one full-bleed portrait with the face framed big, the city huge and at most two lines, in clear space — the composition of your winning hook. Behind every hook is the same proven body (my recent work · never done this before? · CTA) with faces large enough to read on a phone. Run the ten hooks against each other; the body stays constant so the result is about the hook.</p>
{car6}
<h2>Earlier: 10 layout concepts (superseded)</h2>
<p class="lede">Ten concepts that don't reuse any earlier layout. All 106 photos from your new folder appear across them; copy only from your decks; no text on any face.</p>
{car5}
<h2>Earlier carousels from the same folder (old layouts, new photos)</h2>
<p class="lede">Ten carousel variations from your new folder: all 106 photos are used, women and men, copy only from your decks. No text on any face.</p>
{car4}
<h2>Photo ads, more photos</h2>
<p class="lede">Still ads built only from your top_tier_candidates picks (women and men), each showing many portraits at once. No text on any face.</p>
{photo_ads}
<h2>Your picks (earlier stills)</h2>
{picks}
<h2>Video ideas</h2>
<p class="lede">Reels at 1080×1920 with music. Tap to play. Top: the versions built only from your top_tier_candidates picks; then the women-only and mixed versions.</p>
{vids}
<h2>Other stills</h2>
{rest}
</div>'''
open(OUT, 'w').write(page)
print(OUT, f'{len(page) / 1e6:.2f} MB')
