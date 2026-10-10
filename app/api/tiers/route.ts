import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Local-only: saves the photo order/tiers chosen in the /tiers editor to data/portfolio-tiers.json.
// Keeps tier-1 and tier0 untouched, and moves each photo's file into the matching public/images/tier1 or tier2 folder.
// Refuses to run anywhere but `next dev`, so the live site can never write files.
const FILE = path.join(process.cwd(), 'data', 'portfolio-tiers.json');
const IMAGES = path.join(process.cwd(), 'public', 'images');
type Entry = [string, number, number];

function format(readme: string, tierMinusOne: Entry[], tier0: Entry[], tier1: Entry[], tier2: Entry[]) {
  const list = (a: Entry[]) => (a.length ? '[\n' + a.map(([k, w, h]) => `    [${JSON.stringify(k)}, ${w}, ${h}]`).join(',\n') + '\n  ]' : '[]');
  return `{\n  "_readme": ${JSON.stringify(readme)},\n  "tier-1": ${list(tierMinusOne)},\n  "tier0": ${list(tier0)},\n  "tier1": ${list(tier1)},\n  "tier2": ${list(tier2)}\n}\n`;
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== 'development') return NextResponse.json({ error: 'Not available' }, { status: 404 });
  const body = (await req.json()) as { tier1?: string[]; tier2?: string[] };
  const current = JSON.parse(await fs.readFile(FILE, 'utf8')) as { _readme: string; 'tier-1'?: Entry[]; tier0?: Entry[]; tier1: Entry[]; tier2: Entry[] };
  const byKey = new Map([...current.tier1, ...current.tier2].map((e) => [e[0], e] as const));
  const t1 = body.tier1 ?? [], t2 = body.tier2 ?? [];
  const all = [...t1, ...t2];
  // Only reorder/move existing photos: same set, no duplicates, nothing lost.
  if (all.length !== byKey.size || new Set(all).size !== all.length || !all.every((k) => byKey.has(k))) {
    return NextResponse.json({ error: 'Photo list does not match the saved tiers; reload the editor and try again.' }, { status: 400 });
  }
  // Move files whose tier changed; if any move fails, put the earlier ones back and save nothing.
  const was = new Set(current.tier1.map((e) => e[0]));
  const moves = [...t1.filter((k) => !was.has(k)).map((k) => [k, 'tier2', 'tier1']), ...t2.filter((k) => was.has(k)).map((k) => [k, 'tier1', 'tier2'])];
  const done: string[][] = [];
  try {
    for (const [k, from, to] of moves) {
      await fs.rename(path.join(IMAGES, from, `${k}.jpg`), path.join(IMAGES, to, `${k}.jpg`));
      done.push([k, from, to]);
    }
  } catch (err) {
    for (const [k, from, to] of done.reverse()) await fs.rename(path.join(IMAGES, to, `${k}.jpg`), path.join(IMAGES, from, `${k}.jpg`)).catch(() => {});
    return NextResponse.json({ error: `Could not move photo files (${(err as Error).message}).` }, { status: 500 });
  }
  await fs.writeFile(FILE, format(current._readme, current['tier-1'] ?? [], current.tier0 ?? [], t1.map((k) => byKey.get(k)!), t2.map((k) => byKey.get(k)!)));
  return NextResponse.json({ ok: true, tier1: t1.length, tier2: t2.length });
}
