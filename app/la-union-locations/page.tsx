'use client'

const locations = [
  {
    name: 'Tangadan Falls',
    subtitle: 'Two-Tiered Jungle Waterfall',
    type: 'Nature / Waterfall',
    description: 'Powerful two-tiered waterfall surrounded by lush jungle and massive rock formations. Natural rock pool, secluded feel reached by a short trek and river crossing.',
    backdrop: 'Cascading water, massive boulders, jungle canopy, turquoise rock pool, mist spray',
    mood: 'Primal & Moody',
    colors: ['#1a4a2a', '#5a6a6a', '#f0f0f0', '#2a3a2a'],
    colorNames: ['Deep Emerald', 'Cool Rock', 'White Water', 'Jungle Dark'],
    bestFor: 'Raw editorial, swimwear, high-fashion-meets-nature',
    bestTime: 'Midday when sun reaches the falls',
    icon: '💧',
  },
  {
    name: 'Flotsam & Jetsam',
    subtitle: 'Artist Beach Hostel, San Juan',
    type: 'Architecture / Beach',
    description: 'Bohemian-industrial beach compound made from repurposed shipping containers covered in murals and street art. Bold graffiti walls and raw industrial textures against ocean.',
    backdrop: 'Mural walls, rusted containers, bold graffiti, beachfront setting, industrial furniture',
    mood: 'Gritty & Tropical',
    colors: ['#d44040', '#2a8a6a', '#e8c040', '#4a3a3a'],
    colorNames: ['Mural Red', 'Tropical Teal', 'Accent Gold', 'Rusted Steel'],
    bestFor: 'Streetwear editorial, bold color fashion, urban-beach fusion',
    bestTime: 'Late afternoon for warm light on containers',
    icon: '🎨',
  },
  {
    name: 'Urbiztondo Beach',
    subtitle: 'Iconic Surf Beach, San Juan',
    type: 'Beach',
    description: 'La Union\'s most iconic surf beach — long stretch of grey-brown sand with consistent waves. Surf culture atmosphere, scattered surfboards, golden-hour rim lighting.',
    backdrop: 'Wide sand, rolling surf, scattered boards, coastal haze, open horizon',
    mood: 'Sun-Drenched & Relaxed',
    colors: ['#d4a860', '#a09080', '#5a7a9a', '#e8b888'],
    colorNames: ['Golden Hour', 'Sand Neutral', 'Ocean Steel', 'Peach Sunset'],
    bestFor: 'Beach editorial, resort wear, golden-hour fashion',
    bestTime: 'Golden hour — 30min before sunset',
    icon: '🏄',
  },
  {
    name: 'Bahay na Bato Heritage Houses',
    subtitle: 'Spanish-Colonial Stone Houses',
    type: 'Heritage Architecture',
    description: 'Colonial-era stone-and-wood ancestral houses with capiz shell windows, thick coral-stone walls, carved wooden frames, and aged hardwood floors. Timeless elegance.',
    backdrop: 'Coral stone walls, capiz windows, carved wood, hardwood floors, filtered interior light',
    mood: 'Nostalgic & Refined',
    colors: ['#c4956a', '#8a6a40', '#e8dcc8', '#3a2a1a'],
    colorNames: ['Ochre', 'Dark Wood', 'Weathered Cream', 'Shadow'],
    bestFor: 'Heritage editorial, luxe fabrics, old-world styling',
    bestTime: 'Morning for soft light through capiz windows',
    icon: '🏠',
  },
  {
    name: 'Ma-Cho Temple',
    subtitle: 'Chinese Taoist Temple, San Fernando',
    type: 'Cultural / Religious',
    description: 'Large Taoist temple perched on a hillside overlooking the sea. Ornate red-and-gold dragon carvings, pagoda roofing, intricate mosaics, sweeping ocean views.',
    backdrop: 'Dragon carvings, red columns, gold ornamentation, pagoda tiers, ocean panorama',
    mood: 'Opulent & Ceremonial',
    colors: ['#c43a2a', '#d4a020', '#2a6a4a', '#4a7aa0'],
    colorNames: ['Vermillion', 'Imperial Gold', 'Jade Green', 'Sea Blue'],
    bestFor: 'Bold color editorial, ornate fashion, maximalist looks',
    bestTime: 'Late afternoon for warm light on gold details',
    icon: '🐉',
  },
  {
    name: 'Lomboy Grape Farm',
    subtitle: 'Working Vineyard, Bauang',
    type: 'Agricultural',
    description: 'Rare Philippine vineyard with rows of grapevines on wooden trellises. Orderly green rows create geometric patterns — unexpectedly European pastoral quality in a tropical setting.',
    backdrop: 'Vine rows, wooden trellises, dappled leaf patterns, orderly geometry, green canopy',
    mood: 'Pastoral & Romantic',
    colors: ['#4a7a2a', '#6a5a3a', '#c4d4a0', '#e8e0c8'],
    colorNames: ['Vine Green', 'Trellis Brown', 'Leaf Light', 'Warm Cream'],
    bestFor: 'Romantic editorial, flowing dresses, countryside fashion',
    bestTime: 'Golden hour for dappled vine shadows',
    icon: '🍇',
  },
  {
    name: 'Pebble Beach',
    subtitle: 'Stone Beach, Luna',
    type: 'Beach / Nature',
    description: 'Covered in smooth rounded stones instead of sand — shades of grey, charcoal, and slate. Crashing waves and rocky headlands create an austere, almost Scandinavian landscape.',
    backdrop: 'Smooth stone carpet, monochrome palette, white foam, rocky headlands, stark horizon',
    mood: 'Stark & Minimal',
    colors: ['#6a6a6a', '#3a3a3a', '#8a9aa0', '#f0f0f0'],
    colorNames: ['Stone Gray', 'Charcoal', 'Slate Blue', 'Sea Foam'],
    bestFor: 'Minimalist editorial, monochrome fashion, stark contrasts',
    bestTime: 'Overcast days for even monochrome tones',
    icon: '🪨',
  },
  {
    name: 'San Juan Surf Town Murals',
    subtitle: 'Street Art & Alleyways',
    type: 'Urban / Street',
    description: 'Surf-culture murals, colorful shopfronts, and narrow alleyways with tropical plants spilling over walls. Street art, weathered concrete, and greenery create layered visuals.',
    backdrop: 'Bold murals, narrow alleys, tropical plants, pastel shopfronts, weathered walls',
    mood: 'Youthful & Layered',
    colors: ['#2a8a8a', '#d46a50', '#d4c440', '#3a5a3a'],
    colorNames: ['Surf Teal', 'Warm Coral', 'Bright Yellow', 'Tropical Green'],
    bestFor: 'Street style, surf fashion, colorful casual editorial',
    bestTime: 'Midday for saturated wall colors',
    icon: '🏘',
  },
  {
    name: 'Bacnotan Church',
    subtitle: 'San Miguel Archangel, Centuries-Old',
    type: 'Heritage / Religious',
    description: 'Centuries-old Spanish colonial church with thick coral-stone walls, bell tower, and baroque facade. Heavy stone textures, arched doorways, filtered window light.',
    backdrop: 'Coral stone walls, baroque facade, arched doors, wooden pews, candlelight interior',
    mood: 'Solemn & High-Contrast',
    colors: ['#7a7a7a', '#c4956a', '#2a2a2a', '#e8d8c0'],
    colorNames: ['Cool Stone', 'Candlelight', 'Deep Shadow', 'Aged Cream'],
    bestFor: 'Dark editorial, dramatic lighting, textural fashion',
    bestTime: 'Late afternoon for interior light shafts',
    icon: '⛪',
  },
  {
    name: 'Darigayos Cove',
    subtitle: 'Hidden Rocky Cove, Luna',
    type: 'Nature / Cliffs',
    description: 'Hidden cove accessible by steep descent — dramatic cliff walls, small crescent of sand, turquoise tidal pools. Cave-like rock formations create seclusion and raw beauty.',
    backdrop: 'Cliff walls, turquoise pools, crescent sand, volcanic rock, enclosed cove',
    mood: 'Wild & Cinematic',
    colors: ['#40a0a0', '#3a3a3a', '#c4b090', '#80c8d0'],
    colorNames: ['Turquoise', 'Volcanic Rock', 'Sand', 'Tidal Pool'],
    bestFor: 'Adventure editorial, swimwear, dramatic landscape fashion',
    bestTime: 'Midday when sun enters the cove',
    icon: '🌊',
  },
  {
    name: 'Tobacco Fields',
    subtitle: 'Bangar / Ilocos Sur Border',
    type: 'Agricultural',
    description: 'Vast flat fields of broad-leafed tobacco plants stretching toward distant mountains. Large textured leaves at waist height create unique foreground. Open sky for dramatic clouds.',
    backdrop: 'Broad green leaves, geometric rows, mountain backdrop, dramatic cloudscapes, golden light',
    mood: 'Expansive & Cinematic',
    colors: ['#4a7a3a', '#8a7a5a', '#d4c480', '#6a8aaa'],
    colorNames: ['Tobacco Green', 'Dusty Earth', 'Golden Light', 'Hazy Blue'],
    bestFor: 'Epic fashion editorial, landscape-scale compositions',
    bestTime: 'Golden hour for warm backlight through leaves',
    icon: '🌱',
  },
  {
    name: 'Kahuna Beach Resort',
    subtitle: 'Design-Forward Surf Resort, San Juan',
    type: 'Architecture / Resort',
    description: 'Curated surf-lifestyle resort with clean mid-century architecture, whitewashed walls, natural wood accents, minimalist pool area steps from the beach. Polished and aspirational.',
    backdrop: 'White walls, clean pool, natural wood, minimalist design, ocean proximity',
    mood: 'Clean & Aspirational',
    colors: ['#f0efe8', '#c4b090', '#80c8d8', '#6a5a4a'],
    colorNames: ['White Wash', 'Natural Wood', 'Pool Aqua', 'Warm Brown'],
    bestFor: 'Lifestyle editorial, resort wear, clean minimalist fashion',
    bestTime: 'Morning for clean pool reflections',
    icon: '🏊',
  },
  {
    name: 'Provincial Capitol Gardens',
    subtitle: 'San Fernando Botanical Grounds',
    type: 'Nature / Architecture',
    description: 'Manicured gardens with large old-growth trees, hedgerows, stone pathways, and formal landscaping around the colonial capitol building. Refined, almost European quality.',
    backdrop: 'Formal hedges, old trees, stone paths, colonial facade, structured greenery',
    mood: 'Stately & Classic',
    colors: ['#2a5a2a', '#e8dcc8', '#7a6a50', '#a0b8a0'],
    colorNames: ['Deep Green', 'Cream Stone', 'Warm Earth', 'Garden Sage'],
    bestFor: 'Classic editorial, structured fashion, formal portraits',
    bestTime: 'Late afternoon for filtered tree light',
    icon: '🌳',
  },
  {
    name: 'Aringay Salt Flats',
    subtitle: 'Coastal Salt Beds (Dry Season)',
    type: 'Landscape',
    description: 'During dry months, salt-making areas create flat reflective surfaces and geometric salt beds. Cracked-earth textures and mirror-like shallow pools at sunrise produce surreal imagery.',
    backdrop: 'Reflective water, cracked earth, white salt, geometric beds, mirrored sky',
    mood: 'Surreal & Minimal',
    colors: ['#f0efe8', '#a09070', '#e8a8a0', '#d4c8b0'],
    colorNames: ['Salt White', 'Cracked Earth', 'Reflected Pink', 'Warm Gold'],
    bestFor: 'High-fashion surreal editorial, reflective compositions',
    bestTime: 'Sunrise/sunset for sky reflections in water',
    icon: '🪞',
  },
  {
    name: 'Vintage Roadside Eateries',
    subtitle: 'Retro Filipino Spots, San Fernando',
    type: 'Cultural / Urban',
    description: 'Retro roadside eateries with hand-painted signage, pastel walls, vintage wooden benches, and old-school tiled counters. Provincial Filipino nostalgia at its most charming.',
    backdrop: 'Hand-painted signs, pastel walls, wooden benches, tiled counters, retro neon',
    mood: 'Vintage & Warm',
    colors: ['#a0d0b8', '#a0c0d4', '#d4a088', '#e8d4b0'],
    colorNames: ['Mint Green', 'Baby Blue', 'Faded Coral', 'Warm Cream'],
    bestFor: 'Retro editorial, vintage fashion, story-driven shoots',
    bestTime: 'Late afternoon or dusk for neon signage glow',
    icon: '🍧',
  },
]

export default function LaUnionLocationsPage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: `<style>
        body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0c0c0c; color: #f0efe8; }
        .loc-page { font-family: Georgia, 'Times New Roman', serif; max-width: 1400px; margin: 0 auto; padding: 24px 20px 80px; }
        .loc-hero { text-align: center; padding: 60px 20px 50px; border-bottom: 1px solid #2a2a2a; margin-bottom: 48px; }
        .loc-hero h1 { font-size: clamp(2.2rem, 5vw, 4rem); font-weight: 400; letter-spacing: 0.08em; text-transform: uppercase; color: #f0efe8; line-height: 1.15; }
        .loc-hero h1 span { display: block; font-family: system-ui, -apple-system, sans-serif; font-size: clamp(0.75rem, 1.5vw, 0.95rem); letter-spacing: 0.35em; color: #8a8a7a; margin-bottom: 12px; font-weight: 400; text-transform: uppercase; }
        .loc-hero p { font-family: system-ui, -apple-system, sans-serif; font-size: 0.9rem; color: #8a8a7a; max-width: 600px; margin: 20px auto 0; line-height: 1.7; }
        .loc-legend { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-bottom: 48px; padding: 0 20px; }
        .loc-legend-item { font-family: system-ui, sans-serif; font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; color: #6a6a5a; background: #151515; border: 1px solid #2a2a2a; padding: 6px 14px; border-radius: 20px; }
        .loc-grid { display: grid; grid-template-columns: 1fr; gap: 32px; }
        @media (min-width: 768px) { .loc-grid { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 1100px) { .loc-grid { grid-template-columns: 1fr 1fr 1fr; } }
        .loc-card { background: #141414; border: 1px solid #2a2a2a; border-radius: 12px; overflow: hidden; transition: border-color 0.3s, transform 0.3s; }
        .loc-card:hover { border-color: #4a4a3a; transform: translateY(-2px); }
        .loc-card-visual { height: 200px; position: relative; overflow: hidden; display: flex; align-items: stretch; }
        .loc-card-visual .swatch { flex: 1; transition: flex 0.4s ease; }
        .loc-card:hover .loc-card-visual .swatch { flex: 1.3; }
        .loc-card:hover .loc-card-visual .swatch:nth-child(2) { flex: 1.6; }
        .loc-card-visual .swatch:nth-child(odd) { opacity: 0.9; }
        .loc-card-visual::after { content: attr(data-icon); position: absolute; bottom: 12px; right: 14px; font-size: 1.8rem; opacity: 0.7; filter: grayscale(0.3); }
        .loc-card-visual .type-badge { position: absolute; top: 12px; left: 12px; font-family: system-ui, sans-serif; font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase; background: rgba(0,0,0,0.65); color: #c0bfb0; padding: 4px 10px; border-radius: 10px; backdrop-filter: blur(8px); }
        .loc-card-body { padding: 20px; }
        .loc-card-body h3 { font-size: 1.15rem; font-weight: 400; letter-spacing: 0.04em; margin-bottom: 2px; color: #f0efe8; }
        .loc-card-body .subtitle { font-family: system-ui, sans-serif; font-size: 0.72rem; color: #7a7a6a; letter-spacing: 0.06em; margin-bottom: 14px; }
        .loc-card-body .desc { font-family: system-ui, sans-serif; font-size: 0.78rem; color: #9a9a8a; line-height: 1.65; margin-bottom: 16px; }
        .loc-card-meta { display: grid; gap: 10px; }
        .loc-card-meta-row { display: flex; gap: 8px; align-items: baseline; }
        .loc-card-meta-row .label { font-family: system-ui, sans-serif; font-size: 0.6rem; letter-spacing: 0.14em; text-transform: uppercase; color: #5a5a4a; min-width: 70px; flex-shrink: 0; }
        .loc-card-meta-row .value { font-family: system-ui, sans-serif; font-size: 0.75rem; color: #b0b0a0; }
        .loc-palette { display: flex; gap: 6px; margin-top: 14px; padding-top: 14px; border-top: 1px solid #222; }
        .loc-palette-swatch { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
        .loc-palette-swatch .dot { width: 28px; height: 28px; border-radius: 50%; border: 1px solid #333; }
        .loc-palette-swatch .name { font-family: system-ui, sans-serif; font-size: 0.55rem; color: #6a6a5a; text-align: center; letter-spacing: 0.03em; }
        .loc-mood-tag { display: inline-block; font-family: system-ui, sans-serif; font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 10px; border-radius: 8px; border: 1px solid #2a2a2a; color: #a0a090; margin-top: 12px; }
        .loc-section-footer { text-align: center; margin-top: 60px; padding-top: 40px; border-top: 1px solid #2a2a2a; }
        .loc-section-footer p { font-family: system-ui, sans-serif; font-size: 0.8rem; color: #6a6a5a; line-height: 1.7; max-width: 500px; margin: 0 auto; }
      </style>` }} />
      <div className="loc-page">
        <div className="loc-hero">
          <h1>
            <span>Editorial Fashion Location Guide</span>
            La Union
          </h1>
          <p>
            {locations.length} curated photo shoot locations for editorial fashion photography along the surf coast and beyond. Color palettes, backdrop details, and shooting notes for each spot.
          </p>
        </div>

        <div className="loc-legend">
          {[...new Set(locations.map(l => l.type))].map(type => (
            <span key={type} className="loc-legend-item">{type}</span>
          ))}
        </div>

        <div className="loc-grid">
          {locations.map((loc, i) => (
            <div key={i} className="loc-card">
              <div className="loc-card-visual" data-icon={loc.icon}>
                {loc.colors.map((color, ci) => (
                  <div key={ci} className="swatch" style={{ backgroundColor: color }} />
                ))}
                <span className="type-badge">{loc.type}</span>
              </div>
              <div className="loc-card-body">
                <h3>{loc.name}</h3>
                <div className="subtitle">{loc.subtitle}</div>
                <div className="desc">{loc.description}</div>
                <div className="loc-card-meta">
                  <div className="loc-card-meta-row">
                    <span className="label">Backdrop</span>
                    <span className="value">{loc.backdrop}</span>
                  </div>
                  <div className="loc-card-meta-row">
                    <span className="label">Best For</span>
                    <span className="value">{loc.bestFor}</span>
                  </div>
                  <div className="loc-card-meta-row">
                    <span className="label">Timing</span>
                    <span className="value">{loc.bestTime}</span>
                  </div>
                </div>
                <div className="loc-palette">
                  {loc.colors.map((color, ci) => (
                    <div key={ci} className="loc-palette-swatch">
                      <div className="dot" style={{ backgroundColor: color }} />
                      <span className="name">{loc.colorNames[ci]}</span>
                    </div>
                  ))}
                </div>
                <div className="loc-mood-tag">{loc.mood}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="loc-section-footer">
          <p>
            La Union is a 4-6 hour drive north of Manila. Best shooting months: November through March for drier skies and cleaner golden-hour light. Contact resorts and heritage sites in advance for commercial shoot permits.
          </p>
        </div>
      </div>
    </>
  )
}
