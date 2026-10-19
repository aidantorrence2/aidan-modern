export interface Note {
  id: string
  topic: string
  /** The word or phrase in the target language. Alternatives are separated by " / ". */
  t: string
  en: string
  ex?: string
  exEn?: string
  tip?: string
}

export interface Topic {
  id: string
  name: string
  blurb: string
  notes: Note[]
}

export interface Deck {
  code: string
  name: string
  nativeName: string
  flag: string
  /** BCP 47 tag used for speech synthesis, e.g. "pt-BR". */
  tts: string
  topics: Topic[]
}

/** [target, english, example?, exampleEnglish?, tip?] — use "" to skip an optional field. */
export type Entry = [t: string, en: string, ex?: string, exEn?: string, tip?: string]

export function slug(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function topic(id: string, name: string, blurb: string, entries: Entry[]): Topic {
  return {
    id,
    name,
    blurb,
    notes: entries.map(([t, en, ex, exEn, tip]) => ({
      id: `${id}.${slug(t)}`,
      topic: id,
      t,
      en,
      ex: ex || undefined,
      exEn: exEn || undefined,
      tip: tip || undefined,
    })),
  }
}
