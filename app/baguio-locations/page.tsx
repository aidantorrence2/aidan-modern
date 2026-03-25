'use client'

const locations = [
  {
    name: 'The Mansion',
    subtitle: 'Presidential Summer Residence',
    type: 'Colonial Architecture',
    description: 'Grand colonial facade with imposing wrought-iron gates, symmetrical driveway, classical columns, and manicured lawns. Regal, stately compositions.',
    backdrop: 'Whitewashed walls, dark wood trim, iron gates, stone columns, long symmetrical paths',
    mood: 'Regal & Stately',
    colors: ['#f5f5f0', '#2d4a2d', '#1a1a1a', '#8a8a7a'],
    colorNames: ['White Stone', 'Garden Green', 'Iron Black', 'Slate Gray'],
    bestFor: 'Power editorial, couture, structured tailoring',
    bestTime: 'Early morning for soft light on white facade',
    icon: '🏛',
  },
  {
    name: 'Diplomat Hotel Ruins',
    subtitle: 'Abandoned Dominican Retreat (1911)',
    type: 'Ruins / Abandoned',
    description: 'Crumbling concrete corridors, empty window frames with sky showing through, overgrown vegetation reclaiming the structure. Hauntingly beautiful roofless halls.',
    backdrop: 'Decaying concrete, moss-covered walls, empty archways, sky-lit interiors, tangled vines',
    mood: 'Dark & Haunting',
    colors: ['#6b6b6b', '#4a5e3a', '#8c8c8c', '#3a3a3a'],
    colorNames: ['Concrete', 'Moss Green', 'Ash', 'Deep Shadow'],
    bestFor: 'Dark editorial, avant-garde, deconstructed fashion',
    bestTime: 'Overcast days for moody atmosphere',
    icon: '🏚',
  },
  {
    name: 'Camp John Hay Pine Forest',
    subtitle: 'Mile-Hi Trail',
    type: 'Nature / Forest',
    description: 'Towering Benguet pines creating cathedral-like corridors. Soft diffused light through canopy, pine needle carpet, morning mist adds ethereal atmosphere.',
    backdrop: 'Vertical pine trunks, dappled light, fog layers, warm needle-covered ground',
    mood: 'Ethereal & Serene',
    colors: ['#2d5a2d', '#c4956a', '#f0f0e8', '#1a3a1a'],
    colorNames: ['Forest Green', 'Pine Amber', 'Fog White', 'Deep Forest'],
    bestFor: 'Romantic editorial, flowing fabrics, earth tones',
    bestTime: 'Early morning for mist and golden canopy light',
    icon: '🌲',
  },
  {
    name: 'BenCab Museum',
    subtitle: 'Contemporary Art Museum',
    type: 'Modern Architecture',
    description: 'Multi-level museum with clean concrete and glass architecture set into hillside. Sculpted garden terraces, lily ponds, mountain views, stark white gallery walls.',
    backdrop: 'Clean concrete, glass reflections, white walls, sculptural terraces, water features',
    mood: 'Minimalist & Sophisticated',
    colors: ['#e8e8e8', '#7a7a7a', '#c8d8c0', '#4a4a4a'],
    colorNames: ['Gallery White', 'Concrete', 'Garden Sage', 'Charcoal'],
    bestFor: 'Clean-line fashion, minimalist editorial, architectural looks',
    bestTime: 'Midday for crisp shadows on concrete',
    icon: '🏗',
  },
  {
    name: 'Session Road',
    subtitle: "Baguio's Main Street",
    type: 'Urban / Streetscape',
    description: 'Art deco and mid-century Filipino commercial facades climbing the hillside. Colorful signage, layered building fronts, wide sloping road. Best early morning or dusk.',
    backdrop: 'Faded pastels, neon signs, concrete facades, sloping perspective, layered urban depth',
    mood: 'Retro-Urban & Vibrant',
    colors: ['#d4a84a', '#c4a088', '#e87060', '#4a4a5a'],
    colorNames: ['Warm Yellow', 'Faded Coral', 'Neon Red', 'Urban Gray'],
    bestFor: 'Street style, retro editorial, bold color fashion',
    bestTime: 'Golden hour for warm tones on building faces',
    icon: '🏙',
  },
  {
    name: 'Tam-Awan Village',
    subtitle: 'Reconstructed Cordilleran Village',
    type: 'Cultural / Indigenous',
    description: 'Traditional Ifugao and Kalinga huts with thatched roofs and wooden walls on a hillside. Artistic installations woven throughout, mountain views behind.',
    backdrop: 'Thatched roofs, carved wood, woven textures, terraced hillside, art installations',
    mood: 'Earthy & Cultural',
    colors: ['#8b6914', '#6b4e1a', '#4a6a3a', '#c4956a'],
    colorNames: ['Thatch Gold', 'Dark Wood', 'Mountain Green', 'Terra Warm'],
    bestFor: 'Textural fashion, woven pieces, earth-tone editorial',
    bestTime: 'Late afternoon for warm side light on wood textures',
    icon: '🛖',
  },
  {
    name: 'Wright Park & Pool of Pines',
    subtitle: 'Symmetrical Reflecting Pool',
    type: 'Landscape / Park',
    description: 'Long symmetrical reflecting pool lined with towering pines creating a vanishing-point composition. Adjacent rustic horse stables. Extremely photogenic geometry.',
    backdrop: 'Mirror-still water, pine tree rows, vanishing perspective, rustic wood fences',
    mood: 'Classic & Symmetrical',
    colors: ['#2d5a2d', '#6a8aa0', '#5a3a2a', '#c0c0c0'],
    colorNames: ['Pine Green', 'Water Blue', 'Stable Brown', 'Overcast Sky'],
    bestFor: 'Symmetrical compositions, reflected fashion, classic editorial',
    bestTime: 'Still mornings for perfect reflections',
    icon: '🪞',
  },
  {
    name: 'Baguio Cathedral',
    subtitle: 'Our Lady of the Atonement',
    type: 'Religious / Gothic Revival',
    description: 'Rose-pink twin-spired church in Gothic Revival style perched above Session Road. The candy-colored facade against overcast skies creates surreal contrast. Arched doorways and stone detailing.',
    backdrop: 'Pink stone facade, Gothic arches, twin spires, stained glass, hilltop position',
    mood: 'Romantic & Surreal',
    colors: ['#c4727a', '#e8d8c8', '#5a6a7a', '#8a5a6a'],
    colorNames: ['Rose Pink', 'Cream Stone', 'Slate Sky', 'Dusty Mauve'],
    bestFor: 'Romantic editorial, bold color fashion against pink stone',
    bestTime: 'Overcast days amplify the pink facade',
    icon: '⛪',
  },
  {
    name: 'Botanical Garden',
    subtitle: 'Valley Garden',
    type: 'Nature / Botanical',
    description: 'Lush tropical and temperate plantings in a valley. Mossy stone pathways, indigenous village replicas, small bridges, and dense fern walls. Naturally soft, diffused light.',
    backdrop: 'Fern walls, moss-covered stone, wooden bridges, dense canopy, filtered light',
    mood: 'Lush & Tropical',
    colors: ['#2a6a2a', '#5a8a40', '#7a7a6a', '#d4c480'],
    colorNames: ['Deep Green', 'Vivid Fern', 'Mossy Stone', 'Dappled Gold'],
    bestFor: 'Nature editorial, flowing organic pieces, botanical themes',
    bestTime: 'Midday for bright diffused glow in the valley',
    icon: '🌿',
  },
  {
    name: 'Our Lady of Lourdes Grotto',
    subtitle: '252-Step Stairway',
    type: 'Architecture / Stairway',
    description: 'Dramatic 252-step staircase carved into a hillside. Repetitive geometry of concrete steps, iron railings, and surrounding vegetation creates powerful leading lines.',
    backdrop: 'Cascading stairs, iron railings, concrete geometry, cave-like grotto, steep perspective',
    mood: 'Dramatic & Graphic',
    colors: ['#7a7a7a', '#8a5a3a', '#3a5a3a', '#2a2a2a'],
    colorNames: ['Concrete', 'Iron Rust', 'Hillside Green', 'Deep Shadow'],
    bestFor: 'Graphic editorial, strong lines, geometric compositions',
    bestTime: 'Late afternoon for dramatic side-lit steps',
    icon: '🪜',
  },
  {
    name: 'Mines View Park',
    subtitle: 'Clifftop Overlook',
    type: 'Nature / Mountain',
    description: 'Panoramic views of abandoned mining valley with layered mountain ridges. Vast, open landscape creates dramatic large-scale backdrop. Viewing platform provides foreground framing.',
    backdrop: 'Layered mountain ridges, valley depth, open sky, railing foreground, haze layers',
    mood: 'Epic & Cinematic',
    colors: ['#4a6a5a', '#7a6a8a', '#a0b8c8', '#5a5a4a'],
    colorNames: ['Mountain Green', 'Haze Purple', 'Sky Blue', 'Earth Tone'],
    bestFor: 'Wide editorial, dramatic scale, epic landscape fashion',
    bestTime: 'Sunrise for layered mountain haze',
    icon: '🏔',
  },
  {
    name: 'Ili-Likha Artists Village',
    subtitle: 'Creative Container Compound',
    type: 'Urban / Art',
    description: 'Repurposed shipping containers with murals and street art housing studios and galleries. Tight alleyways and stacked containers create layered, graphic compositions.',
    backdrop: 'Bold murals, industrial steel, raw concrete, colorful containers, narrow alleyways',
    mood: 'Edgy & Creative',
    colors: ['#d44040', '#3a7ac4', '#e8c840', '#4a4a4a'],
    colorNames: ['Mural Red', 'Bold Blue', 'Accent Yellow', 'Steel Gray'],
    bestFor: 'Streetwear editorial, bold color fashion, urban-art looks',
    bestTime: 'Any time — walls provide consistent color',
    icon: '🎨',
  },
  {
    name: "Teacher's Camp",
    subtitle: 'American-Colonial Campus',
    type: 'Colonial / Institutional',
    description: 'Sprawling campus with aged wooden buildings, covered walkways, and pine-shaded grounds. Nostalgic academic feel with dark wood and stone structures.',
    backdrop: 'Dark wood buildings, stone walls, covered walkways, pine shade, open fields',
    mood: 'Nostalgic & Warm',
    colors: ['#5a3a20', '#6a6a5a', '#2d5a2d', '#c4a060'],
    colorNames: ['Dark Wood', 'Aged Stone', 'Pine Green', 'Golden Light'],
    bestFor: 'Heritage editorial, preppy fashion, warm vintage looks',
    bestTime: 'Golden hour for warm light on aged wood',
    icon: '🏫',
  },
  {
    name: 'Burnham Park',
    subtitle: 'Lakeside & Grandstand',
    type: 'Park / Lakeside',
    description: 'Man-made lake with rowboats surrounded by pines. Mid-century geometric grandstand. Early morning mist on the lake creates ethereal atmosphere.',
    backdrop: 'Still lake, rowboats, pine tree line, geometric grandstand, morning mist',
    mood: 'Tranquil & Nostalgic',
    colors: ['#5a7a9a', '#f0f0e8', '#2d5a2d', '#c4a8b0'],
    colorNames: ['Lake Blue', 'Mist White', 'Pine Green', 'Soft Pastel'],
    bestFor: 'Soft editorial, pastel fashion, tranquil mood pieces',
    bestTime: 'Dawn for lake mist and still water',
    icon: '🚣',
  },
  {
    name: 'Camp 7 Strawberry Fields',
    subtitle: 'Terraced Hillside Farm',
    type: 'Agricultural / Nature',
    description: 'Geometric rows of strawberry plants on terraced hillside with mountain ridges behind. Natural leading lines. Morning dew and low mist add editorial atmosphere.',
    backdrop: 'Green plant rows, red strawberries, terraced earth, mountain backdrop, morning mist',
    mood: 'Fresh & Pastoral',
    colors: ['#c43a3a', '#3a7a3a', '#6a5040', '#f0f0e0'],
    colorNames: ['Berry Red', 'Leaf Green', 'Rich Soil', 'Misty White'],
    bestFor: 'Pastoral editorial, color-pop fashion, fresh natural looks',
    bestTime: 'Early morning for dew and low mist',
    icon: '🍓',
  },
]

export default function BaguioLocationsPage() {
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
            Baguio
          </h1>
          <p>
            {locations.length} curated photo shoot locations for editorial fashion photography in the Summer Capital of the Philippines. Color palettes, backdrop details, and shooting notes for each spot.
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
            Baguio sits at 1,500m elevation with cool temperatures year-round. Best shooting months: November through February for clear skies and morning fog. Permits may be needed for heritage sites and museums.
          </p>
        </div>
      </div>
    </>
  )
}
