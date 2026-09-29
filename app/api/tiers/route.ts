import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Local-only: saves the photo order/tiers chosen in the /tiers editor to data/portfolio-tiers.json.
// Refuses to run anywhere but `next dev`, so the live site can never write files.
const FILE = path.join(process.cwd(), 'data', 'portfolio-tiers.json');
type Entry = [string, number, number];

function format(readme: string, tier1: Entry[], tier2: Entry[]) {
  const list = (a: Entry[]) => (a.length ? '[\n' + a.map(([k, w, h]) => `    [${JSON.stringify(k)}, ${w}, ${h}]`).join(',\n') + '\n  ]' : '[]');
  return `{\n  "_readme": ${JSON.stringify(readme)},\n  "tier1": ${list(tier1)},\n  "tier2": ${list(tier2)}\n}\n`;
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== 'development') return NextResponse.json({ error: 'Not available' }, { status: 404 });
  const body = (await req.json()) as { tier1?: string[]; tier2?: string[] };
  const current = JSON.parse(await fs.readFile(FILE, 'utf8')) as { _readme: string; tier1: Entry[]; tier2: Entry[] };
  const byKey = new Map([...current.tier1, ...current.tier2].map((e) => [e[0], e] as const));
  const t1 = body.tier1 ?? [], t2 = body.tier2 ?? [];
  const all = [...t1, ...t2];
  // Only reorder/move existing photos: same set, no duplicates, nothing lost.
  if (all.length !== byKey.size || new Set(all).size !== all.length || !all.every((k) => byKey.has(k))) {
    return NextResponse.json({ error: 'Photo list does not match the saved tiers; reload the editor and try again.' }, { status: 400 });
  }
  await fs.writeFile(FILE, format(current._readme, t1.map((k) => byKey.get(k)!), t2.map((k) => byKey.get(k)!)));
  return NextResponse.json({ ok: true, tier1: t1.length, tier2: t2.length });
}
