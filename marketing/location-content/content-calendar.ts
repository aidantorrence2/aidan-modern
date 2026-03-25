/**
 * 30-piece location-based content calendar.
 *
 * Each piece maps to real images in /public/images/large/.
 * "type" determines which render template to use:
 *   - city-reveal-reel : fast slideshow with text overlay (8-15s)
 *   - direction-reel   : before→after posing progression (10-18s)
 *   - hero-post        : single image post
 *   - carousel         : multi-image swipe post
 *   - pov-reel         : POV walk-through experience reel
 *
 * Images reference IDs from data/shoots.ts (served at /images/large/{id}.jpg).
 */

export type ContentType =
  | 'city-reveal-reel'
  | 'direction-reel'
  | 'hero-post'
  | 'carousel'
  | 'pov-reel';

export type ContentPiece = {
  id: number;
  type: ContentType;
  city: string;
  country: string;
  geotag: string; // exact IG geotag to use
  subject: string;
  images: string[]; // image IDs from data/shoots.ts
  caption: string;
  hashtags: string[];
  textOverlay?: string; // for reels
  audioCue?: string; // trending audio suggestion
  durationSeconds?: number; // for reels
};

export const contentCalendar: ContentPiece[] = [
  // === PIECE 1: Tokyo City Reveal ===
  {
    id: 1,
    type: 'city-reveal-reel',
    city: 'Tokyo',
    country: 'Japan',
    geotag: 'Tokyo, Japan',
    subject: 'Sumika + Ellie + Rin',
    images: [
      '000049740018', '000048750031', '000049660001',
      '000049740024', '000048780010', '000049660026',
    ],
    caption: 'Three sessions. One city. All 35mm.\nTokyo has this light that just hits different on film.',
    hashtags: ['#TokyoPhotographer', '#JapanPhotography', '#35mmFilm', '#EditorialPortrait', '#FilmIsNotDead'],
    textOverlay: 'Shot on 35mm film in Tokyo',
    audioCue: 'Trending lo-fi or Japanese city pop',
    durationSeconds: 12,
  },

  // === PIECE 2: Rome Hero Post ===
  {
    id: 2,
    type: 'hero-post',
    city: 'Rome',
    country: 'Italy',
    geotag: 'Rome, Italy',
    subject: 'Daniela',
    images: ['000008-7'],
    caption: 'Golden hour in Rome. Daniela had never done a shoot before — you wouldn\'t know it.\n\nEvery session is fully directed. You just show up.',
    hashtags: ['#RomePhotographer', '#ItalyPortraits', '#ShotOnFilm', '#FilmPortrait', '#PortraitPhotography'],
  },

  // === PIECE 3: Bangkok Direction Reel ===
  {
    id: 3,
    type: 'direction-reel',
    city: 'Bangkok',
    country: 'Thailand',
    geotag: 'Bangkok, Thailand',
    subject: 'Kiki + Sasha + Pharima',
    images: [
      '000040-4', '000059-4',
      '000043-5', '000066-5',
      '000046-4', '000048-5',
    ],
    caption: 'None of them had modeled before.\n\nI break down every pose, every angle. You just follow along and the confidence builds itself.',
    hashtags: ['#BangkokPhotographer', '#ThailandPhotography', '#35mmFilm', '#EditorialPortrait', '#FilmIsNotDead'],
    textOverlay: 'How I direct first-time models',
    audioCue: 'Motivational/confidence trending audio',
    durationSeconds: 15,
  },

  // === PIECE 4: Venice Carousel ===
  {
    id: 4,
    type: 'carousel',
    city: 'Venice',
    country: 'Italy',
    geotag: 'Venice, Italy',
    subject: 'Greta',
    images: [
      '000007-3', '000003', '000009-3', '000010-3',
      '000014-9', '000023-9', '000031-7', '000038-7',
    ],
    caption: 'Greta in Venice. Canals, film grain, and late afternoon light.\n\nThis is what happens when you let the city become part of the portrait.',
    hashtags: ['#VenicePhotographer', '#ItalyPortraits', '#35mmFilm', '#AnalogPortrait', '#FilmPhotography'],
  },

  // === PIECE 5: Bali POV Reel ===
  {
    id: 5,
    type: 'pov-reel',
    city: 'Bali',
    country: 'Indonesia',
    geotag: 'Bali, Indonesia',
    subject: 'Althea',
    images: [
      '000020-2', '000021-2', '000022-2',
      '000023-2', '000024-2', '000025-2', '000026',
    ],
    caption: 'POV: you booked a film portrait session in Bali\n\nOutfit guidance → location scouting → full direction on set → 20+ edited photos in your inbox.',
    hashtags: ['#BaliPhotographer', '#IndonesiaPhotography', '#ShotOnFilm', '#EditorialPortrait', '#PortraitPhotography'],
    textOverlay: 'POV: you booked a film shoot in Bali',
    audioCue: 'Dreamy/aspirational trending audio',
    durationSeconds: 14,
  },

  // === PIECE 6: Vienna City Reveal ===
  {
    id: 6,
    type: 'city-reveal-reel',
    city: 'Vienna',
    country: 'Austria',
    geotag: 'Vienna, Austria',
    subject: 'Linda + Soph',
    images: [
      '000039-2', 'r1-05459-0005', 'r1-05459-0018',
      '000032', '000036', 'r1-05459-0030',
    ],
    caption: 'Vienna on 35mm. There\'s something about European architecture and film grain that just works.',
    hashtags: ['#ViennaPhotographer', '#AustriaPhotography', '#35mmFilm', '#FilmPortrait', '#FilmIsNotDead'],
    textOverlay: 'Shot on 35mm film in Vienna',
    audioCue: 'Classical remix or elegant trending audio',
    durationSeconds: 10,
  },

  // === PIECE 7: Da Nang Hero Post ===
  {
    id: 7,
    type: 'hero-post',
    city: 'Da Nang',
    country: 'Vietnam',
    geotag: 'Da Nang, Vietnam',
    subject: 'Kristin',
    images: ['000044-9'],
    caption: 'Kristin. Da Nang. 35mm film.\n\nThe best portraits happen when someone forgets they\'re being photographed.',
    hashtags: ['#DaNangPhotographer', '#VietnamPhotography', '#ShotOnFilm', '#FilmPortrait', '#PortraitPhotography'],
  },

  // === PIECE 8: Warsaw Direction Reel ===
  {
    id: 8,
    type: 'direction-reel',
    city: 'Warsaw',
    country: 'Poland',
    geotag: 'Warsaw, Poland',
    subject: 'Mary',
    images: [
      '000012-3', '000016-3', '000019-3',
      'bc-0829-aidantorrence0488-015', 'bc-0829-aidantorrence0488-016', 'bc-0829-aidantorrence0488-019',
    ],
    caption: '"I\'ve never done this before" is my favorite thing to hear.\n\nMary walked in nervous and walked out with a portfolio. That\'s what full direction does.',
    hashtags: ['#WarsawPhotographer', '#PolandPhotography', '#35mmFilm', '#EditorialPortrait', '#FilmIsNotDead'],
    textOverlay: 'First shoot ever → this',
    audioCue: 'Transformation/glow-up trending audio',
    durationSeconds: 12,
  },

  // === PIECE 9: Cascais Carousel ===
  {
    id: 9,
    type: 'carousel',
    city: 'Cascais',
    country: 'Portugal',
    geotag: 'Cascais, Portugal',
    subject: 'Francisca',
    images: [
      '000029', '000007', '000008', '000013',
      '000020', '000021', '000024', '000042-4',
    ],
    caption: 'Francisca in Cascais. Portuguese coast, soft light, Kodak Portra.\n\nSwipe through the full set.',
    hashtags: ['#CascaisPhotographer', '#PortugalPhotography', '#35mmFilm', '#AnalogPortrait', '#KodakPortra'],
  },

  // === PIECE 10: Tokyo Hero Post (Ellie) ===
  {
    id: 10,
    type: 'hero-post',
    city: 'Tokyo',
    country: 'Japan',
    geotag: 'Tokyo, Japan',
    subject: 'Ellie',
    images: ['000048750031'],
    caption: 'Ellie. Tokyo at night.\n\nFilm handles city light in a way digital never will.',
    hashtags: ['#TokyoPhotographer', '#JapanPortraits', '#ShotOnFilm', '#FilmPortrait', '#NightPhotography'],
  },

  // === PIECE 11: Saigon City Reveal ===
  {
    id: 11,
    type: 'city-reveal-reel',
    city: 'Saigon',
    country: 'Vietnam',
    geotag: 'Ho Chi Minh City, Vietnam',
    subject: 'Ly Gia Han',
    images: [
      '000004', '000043', '000055', '000056', '000057', '6',
    ],
    caption: 'Saigon on film. The chaos, the color, the light — it all comes through in the grain.',
    hashtags: ['#SaigonPhotographer', '#VietnamPhotography', '#35mmFilm', '#EditorialPortrait', '#FilmIsNotDead'],
    textOverlay: 'Shot on 35mm film in Saigon',
    audioCue: 'Vietnamese or Southeast Asian trending audio',
    durationSeconds: 10,
  },

  // === PIECE 12: Bratislava Hero Post ===
  {
    id: 12,
    type: 'hero-post',
    city: 'Bratislava',
    country: 'Slovakia',
    geotag: 'Bratislava, Slovakia',
    subject: 'Hana',
    images: ['r1-05454-0002'],
    caption: 'Hana in Bratislava. Shot on a quiet afternoon with nothing but natural light and Kodak film.\n\nNo studio. No crew. Just trust and good light.',
    hashtags: ['#BratislavaPhotographer', '#SlovakiaPhotography', '#ShotOnFilm', '#FilmPortrait', '#PortraitPhotography'],
  },

  // === PIECE 13: Rome Carousel (Maria) ===
  {
    id: 13,
    type: 'carousel',
    city: 'Rome',
    country: 'Italy',
    geotag: 'Rome, Italy',
    subject: 'Maria',
    images: [
      '000008-11', '000024-7', '000026-7', '000028-6',
      '000030-6', '000031-6', '000035-6', '000042-3',
    ],
    caption: 'Maria walking through Rome like it was built for her.\n\n35mm film. Zero retouching on skin. This is just how film renders.',
    hashtags: ['#RomePhotographer', '#ItalyPortraits', '#35mmFilm', '#AnalogPortrait', '#NoRetouching'],
  },

  // === PIECE 14: Ghent City Reveal ===
  {
    id: 14,
    type: 'city-reveal-reel',
    city: 'Ghent',
    country: 'Belgium',
    geotag: 'Ghent, Belgium',
    subject: 'Minka',
    images: [
      '000001', '000022-5', '000024-5',
      '000030-4', '000032-4', '000039-4',
    ],
    caption: 'Ghent is one of Europe\'s most underrated cities for portraits. Medieval streets, canal light, zero crowds.',
    hashtags: ['#GhentPhotographer', '#BelgiumPhotography', '#35mmFilm', '#EditorialPortrait', '#FilmIsNotDead'],
    textOverlay: 'Shot on 35mm film in Ghent',
    audioCue: 'Indie/European trending audio',
    durationSeconds: 10,
  },

  // === PIECE 15: Bangkok POV Reel ===
  {
    id: 15,
    type: 'pov-reel',
    city: 'Bangkok',
    country: 'Thailand',
    geotag: 'Bangkok, Thailand',
    subject: 'Sasha',
    images: [
      '000043-5', '000053-5', '000065-5', '000066-5', '000067-4',
    ],
    caption: 'POV: you just got your film photos back from Bangkok\n\nEvery session includes full posing direction + outfit guidance. No experience needed.',
    hashtags: ['#BangkokPhotographer', '#ThailandPhotography', '#ShotOnFilm', '#EditorialPortrait', '#PortraitPhotography'],
    textOverlay: 'POV: your Bangkok film photos just dropped',
    audioCue: 'Reveal/unboxing trending audio',
    durationSeconds: 12,
  },

  // === PIECE 16: Krakow Hero Post ===
  {
    id: 16,
    type: 'hero-post',
    city: 'Krakow',
    country: 'Poland',
    geotag: 'Krakow, Poland',
    subject: 'Yana',
    images: ['000019-7'],
    caption: 'Yana. Krakow. Late light.\n\nSome cities just photograph well on film. Krakow is one of them.',
    hashtags: ['#KrakowPhotographer', '#PolandPhotography', '#ShotOnFilm', '#FilmPortrait', '#PortraitPhotography'],
  },

  // === PIECE 17: Dunedin Carousel ===
  {
    id: 17,
    type: 'carousel',
    city: 'Dunedin',
    country: 'New Zealand',
    geotag: 'Dunedin, New Zealand',
    subject: 'Indy',
    images: [
      'aidanto-r2-009-3', 'aidanto-r2-013-5', 'aidanto-r2-023-10',
      'aidanto-r4-019-8', 'aidanto-r4-027-12', 'aidanto-r4-045-21',
      'aidanto-r4-063-30', 'aidanto-r4-077-37',
    ],
    caption: 'Indy in Dunedin. 25 photos from one roll of Kodak Portra.\n\nNew Zealand light is unreal — soft, moody, and completely unpredictable. That\'s why film works so well here.',
    hashtags: ['#DunedinPhotographer', '#NewZealandPhotography', '#35mmFilm', '#AnalogPortrait', '#KodakPortra'],
  },

  // === PIECE 18: Milan Hero Post ===
  {
    id: 18,
    type: 'hero-post',
    city: 'Milan',
    country: 'Italy',
    geotag: 'Milan, Italy',
    subject: 'Silvia',
    images: ['000012-5'],
    caption: 'Silvia. Milan. Film.\n\nThe fashion capital deserves to be shot on medium that actually has texture.',
    hashtags: ['#MilanPhotographer', '#ItalyPortraits', '#ShotOnFilm', '#FashionPortrait', '#FilmIsNotDead'],
  },

  // === PIECE 19: Bali Brand Campaign Reel ===
  {
    id: 19,
    type: 'city-reveal-reel',
    city: 'Bali',
    country: 'Indonesia',
    geotag: 'Bali, Indonesia',
    subject: 'Merasa Jewelry',
    images: [
      'merasa-jewelry-11', 'merasa-jewelry-01', 'merasa-jewelry-05',
      'merasa-jewelry-08', 'merasa-jewelry-12', 'merasa-jewelry-15',
    ],
    caption: 'Campaign lookbook for @merasajewelry — shot entirely on 35mm film in Bali.\n\nBrands: this is what a film-first campaign looks like. DM for rates.',
    hashtags: ['#BaliPhotographer', '#BrandPhotography', '#35mmFilm', '#CampaignShoot', '#JewelryPhotography'],
    textOverlay: 'Campaign shoot on 35mm film',
    audioCue: 'Luxury/fashion trending audio',
    durationSeconds: 12,
  },

  // === PIECE 20: Glasgow Hero Post ===
  {
    id: 20,
    type: 'hero-post',
    city: 'Glasgow',
    country: 'Scotland',
    geotag: 'Glasgow, Scotland',
    subject: 'Tess',
    images: ['000041'],
    caption: 'Tess. Glasgow. Overcast skies and Kodak film.\n\nOvercast light is the most flattering light for portraits. Film photographers know this.',
    hashtags: ['#GlasgowPhotographer', '#ScotlandPhotography', '#ShotOnFilm', '#FilmPortrait', '#PortraitPhotography'],
  },

  // === PIECE 21: Tokyo Carousel (Sumika) ===
  {
    id: 21,
    type: 'carousel',
    city: 'Tokyo',
    country: 'Japan',
    geotag: 'Tokyo, Japan',
    subject: 'Sumika',
    images: [
      '000049740018', '000049740006', '000049740012',
      '000049740020', '000049740024', '000049690025',
      '000049690034', '000049740026',
    ],
    caption: 'Sumika in Tokyo. 16 frames. Every single one from the same roll of film.\n\nThis is what a directed session looks like when the chemistry is right.',
    hashtags: ['#TokyoPhotographer', '#JapanPhotography', '#35mmFilm', '#AnalogPortrait', '#FilmPhotography'],
  },

  // === PIECE 22: Sitges Direction Reel ===
  {
    id: 22,
    type: 'direction-reel',
    city: 'Sitges',
    country: 'Spain',
    geotag: 'Sitges, Spain',
    subject: 'Paula',
    images: [
      '000023-5', '000026-3', '000027-3',
      '000030-5', '000036-5', '000040-5',
    ],
    caption: 'Paula in Sitges. Mediterranean light, 35mm grain.\n\n"I don\'t know how to pose" — I hear this every shoot. That\'s why I direct everything.',
    hashtags: ['#SitgesPhotographer', '#SpainPhotography', '#35mmFilm', '#EditorialPortrait', '#MediterraneanVibes'],
    textOverlay: '"I don\'t know how to pose" → this',
    audioCue: 'Confidence/transformation trending audio',
    durationSeconds: 13,
  },

  // === PIECE 23: Rotorua City Reveal ===
  {
    id: 23,
    type: 'city-reveal-reel',
    city: 'Rotorua',
    country: 'New Zealand',
    geotag: 'Rotorua, New Zealand',
    subject: 'Kiritokia',
    images: [
      'aidantorre000577-000012', 'aidantorre000579-000007',
      'aidantorre000579-000017', 'aidantorre000579-000028',
      'aidantorre000579-000035', 'aidantorre000579-000041',
    ],
    caption: 'Rotorua. Geothermal steam, lush green, and Kodak Portra.\n\nNew Zealand is one of the most beautiful places I\'ve ever shot.',
    hashtags: ['#RotoruaPhotographer', '#NewZealandPhotography', '#35mmFilm', '#FilmPortrait', '#FilmIsNotDead'],
    textOverlay: 'Shot on 35mm film in Rotorua',
    audioCue: 'Nature/ambient trending audio',
    durationSeconds: 11,
  },

  // === PIECE 24: Berlin Hero Post ===
  {
    id: 24,
    type: 'hero-post',
    city: 'Berlin',
    country: 'Germany',
    geotag: 'Berlin, Germany',
    subject: 'Paris',
    images: ['000015-2'],
    caption: 'Paris in Berlin. Yes, that\'s her name.\n\n35mm film. Natural light. Zero direction needed — she just moved.',
    hashtags: ['#BerlinPhotographer', '#GermanyPhotography', '#ShotOnFilm', '#FilmPortrait', '#PortraitPhotography'],
  },

  // === PIECE 25: Da Nang Carousel ===
  {
    id: 25,
    type: 'carousel',
    city: 'Da Nang',
    country: 'Vietnam',
    geotag: 'Da Nang, Vietnam',
    subject: 'Kristin',
    images: [
      '000044-9', '000038-10', '000040-10', '000043-9',
      '000047-10', '000060-10', '000065', '000070',
    ],
    caption: 'Kristin in Da Nang. 20 photos from one session. All film.\n\nVietnam has some of the best natural light in Southeast Asia. Every frame just works.',
    hashtags: ['#DaNangPhotographer', '#VietnamPhotography', '#35mmFilm', '#AnalogPortrait', '#SoutheastAsiaPhotography'],
  },

  // === PIECE 26: Vienna POV Reel ===
  {
    id: 26,
    type: 'pov-reel',
    city: 'Vienna',
    country: 'Austria',
    geotag: 'Vienna, Austria',
    subject: 'Linda',
    images: [
      'r1-05459-0001', 'r1-05459-0007', 'r1-05459-0015',
      'r1-05459-0022', 'r1-05459-0030', 'r1-05459-0036',
    ],
    caption: 'POV: you booked a portrait session in Vienna and got 40+ photos back\n\nEvery frame shot on 35mm. Every pose directed. You just showed up.',
    hashtags: ['#ViennaPhotographer', '#AustriaPhotography', '#ShotOnFilm', '#EditorialPortrait', '#FilmIsNotDead'],
    textOverlay: 'POV: 40+ film portraits from one Vienna session',
    audioCue: 'Photo dump/reveal trending audio',
    durationSeconds: 14,
  },

  // === PIECE 27: Bali Hero Post (Althea) ===
  {
    id: 27,
    type: 'hero-post',
    city: 'Bali',
    country: 'Indonesia',
    geotag: 'Bali, Indonesia',
    subject: 'Althea',
    images: ['000025-2'],
    caption: 'Althea. Bali. Late afternoon.\n\nTropical light + Kodak film = portraits that feel alive.',
    hashtags: ['#BaliPhotographer', '#IndonesiaPhotography', '#ShotOnFilm', '#FilmPortrait', '#TropicalVibes'],
  },

  // === PIECE 28: Multi-City Compilation Reel ===
  {
    id: 28,
    type: 'city-reveal-reel',
    city: 'Multiple',
    country: 'Multiple',
    geotag: 'Tokyo, Japan', // geotag to highest-value city, rotate each repost
    subject: 'Multi-city compilation',
    images: [
      '000049740018', // Tokyo - Sumika
      '000008-7',     // Rome - Daniela
      '000007-3',     // Venice - Greta
      '000040-4',     // Bangkok - Kiki
      '000044-9',     // Da Nang - Kristin
      'r1-05454-0002', // Bratislava - Hana
    ],
    caption: '6 cities. 6 women. All 35mm film.\n\nTokyo → Rome → Venice → Bangkok → Da Nang → Bratislava\n\nCurrently booking worldwide. Link in bio.',
    hashtags: ['#FilmPhotographer', '#35mmFilm', '#WorldwidePhotographer', '#EditorialPortrait', '#FilmIsNotDead'],
    textOverlay: '6 cities. All 35mm.',
    audioCue: 'Epic/travel montage trending audio',
    durationSeconds: 15,
  },

  // === PIECE 29: Bratislava Carousel ===
  {
    id: 29,
    type: 'carousel',
    city: 'Bratislava',
    country: 'Slovakia',
    geotag: 'Bratislava, Slovakia',
    subject: 'Hana',
    images: [
      'r1-05454-0002', 'r1-05454-0007', 'r1-05454-0009',
      'r1-05461-0006', 'r1-05461-0011', 'r1-05461-0016',
      'r1-05461-0023', 'r1-05461-0030',
    ],
    caption: 'Hana in Bratislava. Quiet streets, warm light, and Kodak Portra.\n\nEastern Europe doesn\'t get enough love from portrait photographers. That\'s changing.',
    hashtags: ['#BratislavaPhotographer', '#SlovakiaPhotography', '#35mmFilm', '#AnalogPortrait', '#EasternEuropePhotography'],
  },

  // === PIECE 30: Tokyo Night Direction Reel ===
  {
    id: 30,
    type: 'direction-reel',
    city: 'Tokyo',
    country: 'Japan',
    geotag: 'Tokyo, Japan',
    subject: 'Rin',
    images: [
      '000049660001', '000049660003', '000049660026',
      '000049660027', '000049820005', '000049820006',
    ],
    caption: 'Rin in Tokyo. Night session. Pushed film to 800.\n\nShooting film at night is a risk most photographers won\'t take. That\'s exactly why it looks different.',
    hashtags: ['#TokyoPhotographer', '#JapanPhotography', '#35mmFilm', '#NightPortrait', '#FilmIsNotDead'],
    textOverlay: '35mm film at night in Tokyo',
    audioCue: 'Moody/nightlife trending audio',
    durationSeconds: 13,
  },
];
