import { COUNTRY_CODES, type CountryCode } from '@/components/countryCodes'

// IANA timezone → ISO 3166 country. Timezone reflects where the visitor
// physically is (unlike browser language, which is often left at en-US), and
// reading it needs no permission prompt. Legacy aliases (Calcutta, Saigon,
// Kiev…) are included because older Androids still report them.
const TZ_COUNTRY: Record<string, string> = {
  // Europe
  'Europe/London': 'GB', 'Europe/Dublin': 'IE', 'Europe/Lisbon': 'PT', 'Atlantic/Azores': 'PT', 'Atlantic/Madeira': 'PT',
  'Europe/Madrid': 'ES', 'Atlantic/Canary': 'ES', 'Europe/Paris': 'FR', 'Europe/Brussels': 'BE', 'Europe/Amsterdam': 'NL',
  'Europe/Luxembourg': 'LU', 'Europe/Zurich': 'CH', 'Europe/Berlin': 'DE', 'Europe/Busingen': 'DE', 'Europe/Copenhagen': 'DK',
  'Europe/Oslo': 'NO', 'Europe/Stockholm': 'SE', 'Europe/Helsinki': 'FI', 'Europe/Rome': 'IT', 'Europe/Vienna': 'AT',
  'Europe/Prague': 'CZ', 'Europe/Warsaw': 'PL', 'Europe/Budapest': 'HU', 'Europe/Bratislava': 'SK', 'Europe/Ljubljana': 'SI',
  'Europe/Zagreb': 'HR', 'Europe/Belgrade': 'RS', 'Europe/Sarajevo': 'BA', 'Europe/Skopje': 'MK', 'Europe/Tirane': 'AL',
  'Europe/Podgorica': 'ME', 'Europe/Athens': 'GR', 'Europe/Sofia': 'BG', 'Europe/Bucharest': 'RO', 'Europe/Chisinau': 'MD',
  'Europe/Kyiv': 'UA', 'Europe/Kiev': 'UA', 'Europe/Uzhgorod': 'UA', 'Europe/Zaporozhye': 'UA', 'Europe/Minsk': 'BY',
  'Europe/Moscow': 'RU', 'Europe/Kaliningrad': 'RU', 'Europe/Samara': 'RU', 'Europe/Volgograd': 'RU', 'Europe/Saratov': 'RU',
  'Europe/Kirov': 'RU', 'Europe/Astrakhan': 'RU', 'Europe/Ulyanovsk': 'RU', 'Europe/Istanbul': 'TR', 'Europe/Riga': 'LV',
  'Europe/Vilnius': 'LT', 'Europe/Tallinn': 'EE', 'Atlantic/Reykjavik': 'IS', 'Europe/Malta': 'MT', 'Europe/Monaco': 'MC',
  'Europe/Andorra': 'AD', 'Europe/Gibraltar': 'GI', 'Europe/Vatican': 'VA', 'Europe/San_Marino': 'SM', 'Europe/Simferopol': 'UA',
  'Atlantic/Faroe': 'FO', 'Europe/Isle_of_Man': 'IM', 'Europe/Jersey': 'JE', 'Europe/Guernsey': 'GG',
  // Middle East & Central Asia
  'Asia/Istanbul': 'TR', 'Asia/Dubai': 'AE', 'Asia/Muscat': 'OM', 'Asia/Riyadh': 'SA', 'Asia/Qatar': 'QA', 'Asia/Bahrain': 'BH',
  'Asia/Kuwait': 'KW', 'Asia/Baghdad': 'IQ', 'Asia/Amman': 'JO', 'Asia/Beirut': 'LB', 'Asia/Damascus': 'SY',
  'Asia/Jerusalem': 'IL', 'Asia/Tel_Aviv': 'IL', 'Asia/Gaza': 'PS', 'Asia/Hebron': 'PS', 'Asia/Nicosia': 'CY',
  'Asia/Tehran': 'IR', 'Asia/Kabul': 'AF', 'Asia/Baku': 'AZ', 'Asia/Yerevan': 'AM', 'Asia/Tbilisi': 'GE',
  'Asia/Ashgabat': 'TM', 'Asia/Tashkent': 'UZ', 'Asia/Samarkand': 'UZ', 'Asia/Dushanbe': 'TJ', 'Asia/Bishkek': 'KG',
  'Asia/Almaty': 'KZ', 'Asia/Aqtobe': 'KZ', 'Asia/Atyrau': 'KZ', 'Asia/Oral': 'KZ', 'Asia/Qostanay': 'KZ', 'Asia/Qyzylorda': 'KZ', 'Asia/Aqtau': 'KZ',
  // South & Southeast Asia
  'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN', 'Asia/Colombo': 'LK', 'Asia/Karachi': 'PK', 'Asia/Dhaka': 'BD', 'Asia/Dacca': 'BD',
  'Asia/Kathmandu': 'NP', 'Asia/Katmandu': 'NP', 'Asia/Thimphu': 'BT', 'Indian/Maldives': 'MV',
  'Asia/Bangkok': 'TH', 'Asia/Ho_Chi_Minh': 'VN', 'Asia/Saigon': 'VN', 'Asia/Hanoi': 'VN', 'Asia/Phnom_Penh': 'KH',
  'Asia/Vientiane': 'LA', 'Asia/Yangon': 'MM', 'Asia/Rangoon': 'MM', 'Asia/Jakarta': 'ID', 'Asia/Makassar': 'ID',
  'Asia/Jayapura': 'ID', 'Asia/Pontianak': 'ID', 'Asia/Kuala_Lumpur': 'MY', 'Asia/Kuching': 'MY', 'Asia/Singapore': 'SG',
  'Asia/Manila': 'PH', 'Asia/Brunei': 'BN', 'Asia/Dili': 'TL',
  // East Asia
  'Asia/Hong_Kong': 'HK', 'Asia/Macau': 'MO', 'Asia/Taipei': 'TW', 'Asia/Shanghai': 'CN', 'Asia/Urumqi': 'CN',
  'Asia/Chongqing': 'CN', 'Asia/Harbin': 'CN', 'Asia/Seoul': 'KR', 'Asia/Pyongyang': 'KP', 'Asia/Tokyo': 'JP',
  'Asia/Ulaanbaatar': 'MN', 'Asia/Hovd': 'MN', 'Asia/Choibalsan': 'MN',
  // Russia (Asian zones)
  'Asia/Yekaterinburg': 'RU', 'Asia/Omsk': 'RU', 'Asia/Novosibirsk': 'RU', 'Asia/Barnaul': 'RU', 'Asia/Tomsk': 'RU',
  'Asia/Novokuznetsk': 'RU', 'Asia/Krasnoyarsk': 'RU', 'Asia/Irkutsk': 'RU', 'Asia/Chita': 'RU', 'Asia/Yakutsk': 'RU',
  'Asia/Khandyga': 'RU', 'Asia/Vladivostok': 'RU', 'Asia/Ust-Nera': 'RU', 'Asia/Magadan': 'RU', 'Asia/Sakhalin': 'RU',
  'Asia/Srednekolymsk': 'RU', 'Asia/Kamchatka': 'RU', 'Asia/Anadyr': 'RU',
  // North America
  'America/New_York': 'US', 'America/Detroit': 'US', 'America/Chicago': 'US', 'America/Denver': 'US', 'America/Phoenix': 'US',
  'America/Los_Angeles': 'US', 'America/Anchorage': 'US', 'America/Adak': 'US', 'America/Boise': 'US', 'America/Juneau': 'US',
  'America/Sitka': 'US', 'America/Metlakatla': 'US', 'America/Nome': 'US', 'America/Yakutat': 'US', 'America/Menominee': 'US',
  'Pacific/Honolulu': 'US',
  'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'America/Edmonton': 'CA', 'America/Winnipeg': 'CA', 'America/Halifax': 'CA',
  'America/St_Johns': 'CA', 'America/Regina': 'CA', 'America/Whitehorse': 'CA', 'America/Yellowknife': 'CA', 'America/Iqaluit': 'CA',
  'America/Moncton': 'CA', 'America/Glace_Bay': 'CA', 'America/Goose_Bay': 'CA', 'America/Dawson': 'CA', 'America/Dawson_Creek': 'CA',
  'America/Creston': 'CA', 'America/Fort_Nelson': 'CA', 'America/Cambridge_Bay': 'CA', 'America/Inuvik': 'CA',
  'America/Rankin_Inlet': 'CA', 'America/Resolute': 'CA', 'America/Swift_Current': 'CA', 'America/Blanc-Sablon': 'CA', 'America/Atikokan': 'CA',
  'America/Mexico_City': 'MX', 'America/Cancun': 'MX', 'America/Merida': 'MX', 'America/Monterrey': 'MX', 'America/Matamoros': 'MX',
  'America/Chihuahua': 'MX', 'America/Ciudad_Juarez': 'MX', 'America/Hermosillo': 'MX', 'America/Mazatlan': 'MX',
  'America/Tijuana': 'MX', 'America/Ojinaga': 'MX', 'America/Bahia_Banderas': 'MX',
  // Central America & Caribbean
  'America/Guatemala': 'GT', 'America/Belize': 'BZ', 'America/El_Salvador': 'SV', 'America/Tegucigalpa': 'HN',
  'America/Managua': 'NI', 'America/Costa_Rica': 'CR', 'America/Panama': 'PA', 'America/Havana': 'CU', 'America/Jamaica': 'JM',
  'America/Port-au-Prince': 'HT', 'America/Santo_Domingo': 'DO', 'America/Puerto_Rico': 'PR', 'America/Barbados': 'BB',
  'America/Port_of_Spain': 'TT', 'America/Curacao': 'CW', 'America/Aruba': 'AW', 'America/Nassau': 'BS', 'America/Cayman': 'KY',
  'Atlantic/Bermuda': 'BM', 'America/Grenada': 'GD', 'America/St_Lucia': 'LC', 'America/Antigua': 'AG', 'America/Dominica': 'DM',
  'America/St_Vincent': 'VC', 'America/St_Kitts': 'KN', 'America/Martinique': 'MQ', 'America/Guadeloupe': 'GP',
  // South America
  'America/Bogota': 'CO', 'America/Caracas': 'VE', 'America/Guyana': 'GY', 'America/Paramaribo': 'SR', 'America/Cayenne': 'GF',
  'America/Guayaquil': 'EC', 'Pacific/Galapagos': 'EC', 'America/Lima': 'PE', 'America/La_Paz': 'BO', 'America/Asuncion': 'PY',
  'America/Montevideo': 'UY', 'America/Santiago': 'CL', 'America/Punta_Arenas': 'CL', 'Pacific/Easter': 'CL',
  'America/Sao_Paulo': 'BR', 'America/Rio_Branco': 'BR', 'America/Manaus': 'BR', 'America/Belem': 'BR', 'America/Fortaleza': 'BR',
  'America/Recife': 'BR', 'America/Bahia': 'BR', 'America/Campo_Grande': 'BR', 'America/Cuiaba': 'BR', 'America/Boa_Vista': 'BR',
  'America/Porto_Velho': 'BR', 'America/Santarem': 'BR', 'America/Maceio': 'BR', 'America/Araguaina': 'BR',
  'America/Noronha': 'BR', 'America/Eirunepe': 'BR',
  // Africa
  'Africa/Cairo': 'EG', 'Africa/Tripoli': 'LY', 'Africa/Tunis': 'TN', 'Africa/Algiers': 'DZ', 'Africa/Casablanca': 'MA',
  'Africa/El_Aaiun': 'EH', 'Africa/Lagos': 'NG', 'Africa/Accra': 'GH', 'Africa/Abidjan': 'CI', 'Africa/Dakar': 'SN',
  'Africa/Bamako': 'ML', 'Africa/Conakry': 'GN', 'Africa/Freetown': 'SL', 'Africa/Monrovia': 'LR', 'Africa/Nouakchott': 'MR',
  'Africa/Niamey': 'NE', 'Africa/Ouagadougou': 'BF', 'Africa/Lome': 'TG', 'Africa/Porto-Novo': 'BJ', 'Africa/Banjul': 'GM',
  'Africa/Bissau': 'GW', 'Africa/Sao_Tome': 'ST', 'Africa/Malabo': 'GQ', 'Africa/Douala': 'CM', 'Africa/Ndjamena': 'TD',
  'Africa/Bangui': 'CF', 'Africa/Libreville': 'GA', 'Africa/Brazzaville': 'CG', 'Africa/Kinshasa': 'CD', 'Africa/Lubumbashi': 'CD',
  'Africa/Luanda': 'AO', 'Africa/Windhoek': 'NA', 'Africa/Johannesburg': 'ZA', 'Africa/Maseru': 'LS', 'Africa/Mbabane': 'SZ',
  'Africa/Gaborone': 'BW', 'Africa/Harare': 'ZW', 'Africa/Lusaka': 'ZM', 'Africa/Blantyre': 'MW', 'Africa/Maputo': 'MZ',
  'Africa/Dar_es_Salaam': 'TZ', 'Africa/Nairobi': 'KE', 'Africa/Kampala': 'UG', 'Africa/Kigali': 'RW', 'Africa/Bujumbura': 'BI',
  'Africa/Addis_Ababa': 'ET', 'Africa/Asmara': 'ER', 'Africa/Djibouti': 'DJ', 'Africa/Mogadishu': 'SO', 'Africa/Khartoum': 'SD',
  'Africa/Juba': 'SS', 'Indian/Antananarivo': 'MG', 'Indian/Mauritius': 'MU', 'Indian/Reunion': 'RE', 'Indian/Mayotte': 'YT',
  'Indian/Comoro': 'KM', 'Indian/Mahe': 'SC', 'Atlantic/Cape_Verde': 'CV', 'Atlantic/St_Helena': 'SH',
  // Oceania
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Brisbane': 'AU', 'Australia/Perth': 'AU',
  'Australia/Adelaide': 'AU', 'Australia/Hobart': 'AU', 'Australia/Darwin': 'AU', 'Australia/Broken_Hill': 'AU',
  'Australia/Lindeman': 'AU', 'Australia/Lord_Howe': 'AU', 'Australia/Eucla': 'AU',
  'Pacific/Auckland': 'NZ', 'Pacific/Chatham': 'NZ', 'Pacific/Fiji': 'FJ', 'Pacific/Port_Moresby': 'PG',
  'Pacific/Bougainville': 'PG', 'Pacific/Guadalcanal': 'SB', 'Pacific/Noumea': 'NC', 'Pacific/Tahiti': 'PF',
  'Pacific/Marquesas': 'PF', 'Pacific/Gambier': 'PF', 'Pacific/Tongatapu': 'TO', 'Pacific/Apia': 'WS', 'Pacific/Pago_Pago': 'AS',
  'Pacific/Guam': 'GU', 'Pacific/Saipan': 'MP', 'Pacific/Palau': 'PW', 'Pacific/Chuuk': 'FM', 'Pacific/Pohnpei': 'FM',
  'Pacific/Kosrae': 'FM', 'Pacific/Majuro': 'MH', 'Pacific/Kwajalein': 'MH', 'Pacific/Tarawa': 'KI', 'Pacific/Kiritimati': 'KI',
  'Pacific/Kanton': 'KI', 'Pacific/Nauru': 'NR', 'Pacific/Funafuti': 'TV', 'Pacific/Wallis': 'WF', 'Pacific/Niue': 'NU',
  'Pacific/Rarotonga': 'CK', 'Pacific/Norfolk': 'NF', 'Pacific/Pitcairn': 'PN',
  // Atlantic
  'Atlantic/Stanley': 'FK', 'Atlantic/South_Georgia': 'GS',
}

function isoFromTimezone(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (!tz) return null
    if (TZ_COUNTRY[tz]) return TZ_COUNTRY[tz]
    // Prefix rules cover zones not listed explicitly.
    if (tz.startsWith('Australia/')) return 'AU'
    if (tz.startsWith('America/Argentina/')) return 'AR'
    if (tz.startsWith('America/Indiana/') || tz.startsWith('America/Kentucky/') || tz.startsWith('America/North_Dakota/')) return 'US'
    return null
  } catch {
    return null
  }
}

function isoFromLanguage(): string | null {
  try {
    const langs = navigator.languages?.length ? navigator.languages : [navigator.language]
    for (const lang of langs) {
      const m = /^[a-z]{2,3}-([A-Z]{2})\b/.exec(lang || '')
      if (m) return m[1]
    }
    return null
  } catch {
    return null
  }
}

// The locale's region subtag, ignoring en-US — that one is the factory default
// the world over, so it says nothing about who the phone belongs to, while
// every other region tag is a deliberate setting. A visitor whose list reads
// ['en-US', 'de-DE'] is German.
function isoFromLocaleRegion(): string | null {
  try {
    const langs = navigator.languages?.length ? navigator.languages : [navigator.language]
    for (const lang of langs) {
      const m = /^([a-z]{2,3})-([A-Z]{2})\b/.exec(lang || '')
      if (!m) continue
      if (m[1].toLowerCase() === 'en' && m[2] === 'US') continue
      return m[2]
    }
    return null
  } catch {
    return null
  }
}

// Best-effort, permissionless guess of where the visitor physically is:
// timezone first, browser-language region second. This is the one to ask for
// anything about the place — the city chips on the location slide, say.
// Returns null when neither yields a country we have a dial code for.
export function detectCountry(): CountryCode | null {
  const iso = isoFromTimezone() || isoFromLanguage()
  if (!iso) return null
  return COUNTRY_CODES.find(c => c.iso === iso) || null
}

// The country to prefill a phone number's dial code from — deliberately the
// mirror of detectCountry(), because a phone number belongs to the person and
// not to the place. A German on holiday in Bangkok has a phone reporting
// Asia/Bangkok from the moment they land, but their locale stays de-DE and the
// WhatsApp number they are about to type is +49, not +66. So the locale region
// leads and the timezone is the fallback for anyone it can't speak for.
export function detectPhoneCountry(): CountryCode | null {
  const iso = isoFromLocaleRegion() || isoFromTimezone()
  if (!iso) return null
  return COUNTRY_CODES.find(c => c.iso === iso) || null
}
