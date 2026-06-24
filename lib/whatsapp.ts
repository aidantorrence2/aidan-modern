// Normalize WhatsApp numbers that signups entered WITHOUT an international
// dialing code, by inferring the country from their free-text `city`.
//
// Signups type their local number (e.g. Kathmandu "9841234567", Manila
// "09171234567"), so the naive `wa.me/${digitsOnly}` link is broken — it has no
// country code. This infers the country from the city, strips the national trunk
// "0", and produces a correct E.164 / wa.me number.
//
// Dependency-free on purpose (this is imported into a client component). The
// city map covers every country currently present in the signups table plus
// Nepal/Kathmandu.

type CC = { cc: string; trunk?: boolean };

// Country calling codes keyed by ISO2.
const CALLING: Record<string, CC> = {
  NP: { cc: '977', trunk: true },   // Nepal (Kathmandu, Pokhara)
  PH: { cc: '63', trunk: true },    // Philippines
  KR: { cc: '82', trunk: true },    // South Korea
  JP: { cc: '81', trunk: true },    // Japan
  TW: { cc: '886', trunk: true },   // Taiwan
  HK: { cc: '852' },                // Hong Kong (no trunk 0)
  MO: { cc: '853' },                // Macau
  CN: { cc: '86', trunk: true },    // China
  MN: { cc: '976' },                // Mongolia
  ID: { cc: '62', trunk: true },    // Indonesia (Bali/Canggu/Ubud)
  SG: { cc: '65' },                 // Singapore
  TH: { cc: '66', trunk: true },    // Thailand
  IN: { cc: '91', trunk: true },    // India
  US: { cc: '1' },
  GB: { cc: '44', trunk: true },
  AU: { cc: '61', trunk: true },
};

// Substring keywords (lowercased) -> ISO2. Checked against the whole city
// string, so "San Fernando, La Union" or "Seoul, South Korea" still resolve.
// Order matters only for disambiguation; keys are matched as substrings.
const CITY_KEYWORDS: Array<[string, string]> = [
  // Nepal (incl. Kathmandu-valley neighborhoods seen in signups)
  ['kathmandu', 'NP'], ['pokhara', 'NP'], ['lalitpur', 'NP'], ['bhaktapur', 'NP'],
  ['thamel', 'NP'], ['nepal', 'NP'], ['ktm', 'NP'], ['patan', 'NP'], ['boudha', 'NP'],
  ['baneshwor', 'NP'], ['baneshwo', 'NP'], ['jawalakhel', 'NP'], ['dhapakhel', 'NP'],
  ['dhobighat', 'NP'], ['kapan', 'NP'], ['sankhu', 'NP'], ['chunikhel', 'NP'],
  ['balkot', 'NP'], ['bijeshwari', 'NP'], ['siphal', 'NP'], ['pepsicola', 'NP'],
  ['chabahil', 'NP'], ['kamalpokhari', 'NP'], ['soalteemode', 'NP'], ['kalanki', 'NP'],
  // Philippines
  ['baguio', 'PH'], ['antipolo', 'PH'], ['la union', 'PH'], ['la aunion', 'PH'],
  ['launion', 'PH'], ['manila', 'PH'], ['quezon', 'PH'], ['makati', 'PH'],
  ['marikina', 'PH'], ['cainta', 'PH'], ['olongapo', 'PH'], ['pasig', 'PH'],
  ['caloocan', 'PH'], ['mandaluyong', 'PH'], ['rizal', 'PH'], ['benguet', 'PH'],
  ['pangasinan', 'PH'], ['bauang', 'PH'], ['bacnotan', 'PH'], ['naguilian', 'PH'],
  ['san fernando', 'PH'], ['san juan', 'PH'], ['subic', 'PH'], ['las piñas', 'PH'],
  ['las pinas', 'PH'], ['cubao', 'PH'], ['novaliches', 'PH'], ['commonwealth', 'PH'],
  ['ortigas', 'PH'], ['angono', 'PH'], ['taytay', 'PH'], ['montalban', 'PH'],
  ['taguig', 'PH'], ['philippines', 'PH'],
  // Korea
  ['seoul', 'KR'], ['soeul', 'KR'], ['séoul', 'KR'], ['ansan', 'KR'], ['suwon', 'KR'],
  ['daegu', 'KR'], ['pyeongtaek', 'KR'], ['namyangju', 'KR'], ['gangnam', 'KR'],
  ['eunpyeong', 'KR'], ['seongbuk', 'KR'], ['mapo', 'KR'], ['-gu', 'KR'],
  ['korea', 'KR'], ['한국', 'KR'], ['관악구', 'KR'],
  // Japan
  ['tokyo', 'JP'], ['osaka', 'JP'], ['kanagawa', 'JP'], ['yokohama', 'JP'],
  ['machida', 'JP'], ['nagano', 'JP'], ['shinjuku', 'JP'], ['minato', 'JP'],
  ['nakano', 'JP'], ['hachioji', 'JP'], ['fujisawa', 'JP'], ['gunma', 'JP'],
  ['kiryu', 'JP'], ['takahatafudo', 'JP'], ['新座市', 'JP'], ['japan', 'JP'],
  // Taiwan
  ['taipei', 'TW'], ['tainan', 'TW'], ['kaohsiung', 'TW'], ['kaoshiung', 'TW'],
  ['hsinchu', 'TW'], ['taichung', 'TW'], ['hualien', 'TW'], ['yilan', 'TW'],
  ['yongkang', 'TW'], ['nanzi', 'TW'], ['nanzih', 'TW'], ['zhongxiao', 'TW'],
  ['liuzhangli', 'TW'], ['wanhua', 'TW'], ['nangang', 'TW'], ['台北', 'TW'],
  ['高雄', 'TW'], ['taiwan', 'TW'], ['taiwán', 'TW'],
  // Hong Kong / Macau
  ['hong kong', 'HK'], ['hongkong', 'HK'], ['kowloon', 'HK'], ['quarry bay', 'HK'],
  ['yau ma tei', 'HK'], ['jordan', 'HK'], ['lohas', 'HK'], ['hk', 'HK'],
  ['macau', 'MO'], ['macao', 'MO'],
  // China
  ['guangzhou', 'CN'], ['shenzhen', 'CN'], ['chongqing', 'CN'], ['dongguan', 'CN'],
  ['foshan', 'CN'], ['zhuhai', 'CN'], ['zhongshan', 'CN'], ['ningbo', 'CN'],
  ['qingyuan', 'CN'], ['guilin', 'CN'], ['shenyang', 'CN'], ['beijing', 'CN'],
  ['tianhe', 'CN'], ['baiyun', 'CN'], ['nanshan', 'CN'], ['longgang', 'CN'],
  ['shapingba', 'CN'], ['yubei', 'CN'], ['changan', 'CN'], ["chang'an", 'CN'],
  ['广州', 'CN'], ['广东', 'CN'], ['china', 'CN'],
  // Mongolia
  ['ulaanbaatar', 'MN'], ['ulaabaatar', 'MN'], ['ulanbator', 'MN'], ['ulaanbator', 'MN'],
  ['khanuul', 'MN'], ['khnergui', 'MN'], ['mongolia', 'MN'], [' ub', 'MN'], ['ub,', 'MN'],
  // Indonesia / Bali
  ['bali', 'ID'], ['canggu', 'ID'], ['ubud', 'ID'], ['seminyak', 'ID'],
  ['denpasar', 'ID'], ['indonesia', 'ID'],
  // misc
  ['singapore', 'SG'], ['bangkok', 'TH'], ['thailand', 'TH'],
];

function isoFromCity(city: string | null | undefined): string | null {
  if (!city) return null;
  const c = city.toLowerCase();
  for (const [kw, iso] of CITY_KEYWORDS) {
    if (c.includes(kw)) return iso;
  }
  return null;
}

export type NormalizedWhatsapp = {
  /** E.164 with leading "+", or null if it couldn't be resolved. */
  e164: string | null;
  /** Digits only, no "+", suitable for wa.me. Falls back to raw digits. */
  waDigits: string;
  /** Full wa.me link. */
  link: string;
  /** Whether a country code was successfully applied. */
  resolved: boolean;
  /** ISO2 used, if any. */
  iso: string | null;
};

/**
 * Normalize a WhatsApp `contact` for a given `city`.
 * - Already-international (+ / 00) numbers are kept as-is.
 * - Otherwise the country is inferred from `city`, the trunk "0" is stripped,
 *   and the calling code is prepended.
 */
export function normalizeWhatsapp(contact: string, city?: string | null): NormalizedWhatsapp {
  const raw = String(contact || '');
  const cleaned = raw.replace(/[^\d+]/g, '');

  const fallback = (digits: string): NormalizedWhatsapp => ({
    e164: null,
    waDigits: digits,
    link: `https://wa.me/${digits}`,
    resolved: false,
    iso: null,
  });

  if (!cleaned) return fallback('');

  // Already international.
  if (cleaned.startsWith('+')) {
    const d = cleaned.slice(1).replace(/\D/g, '');
    return { e164: '+' + d, waDigits: d, link: `https://wa.me/${d}`, resolved: true, iso: null };
  }
  if (cleaned.startsWith('00')) {
    const d = cleaned.slice(2);
    return { e164: '+' + d, waDigits: d, link: `https://wa.me/${d}`, resolved: true, iso: null };
  }

  const iso = isoFromCity(city);
  const info = iso ? CALLING[iso] : null;
  if (!info) {
    // Can't infer country — leave digits as-is (still broken, but unchanged).
    return fallback(cleaned);
  }

  // If the number already begins with the country's calling code, don't double it.
  let national = cleaned;
  if (national.startsWith(info.cc) && national.length > info.cc.length + 5) {
    const d = national;
    return { e164: '+' + d, waDigits: d, link: `https://wa.me/${d}`, resolved: true, iso };
  }

  // Strip a single leading national trunk "0".
  if (info.trunk && national.startsWith('0')) national = national.slice(1);

  const d = info.cc + national;
  return { e164: '+' + d, waDigits: d, link: `https://wa.me/${d}`, resolved: true, iso };
}

/** Convenience: just the wa.me link, country code inferred from city. */
export function whatsappLink(contact: string, city?: string | null): string {
  return normalizeWhatsapp(contact, city).link;
}
