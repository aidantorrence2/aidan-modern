import { neon, NeonQueryFunction } from '@neondatabase/serverless'

// Lazily construct the Neon client on first use. Constructing it at module load
// (e.g. `neon(process.env.DATABASE_URL || '')`) throws synchronously when the
// env var is absent — which crashes Next's build-time page-data collection even
// for unrelated routes. Deferring to request time keeps the build green and
// surfaces a clear error only if a DB-backed route is actually hit without config.
let cached: NeonQueryFunction<false, false> | null = null

function client(): NeonQueryFunction<false, false> {
  if (!cached) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL is not set; database-backed routes are unavailable.')
    cached = neon(url)
  }
  return cached
}

// Proxy forwards both tagged-template calls (`sql`...``) and property/method
// access (`sql.query`, `sql.transaction`) to the lazily-created client.
export const sql: NeonQueryFunction<false, false> = new Proxy(
  (() => undefined) as unknown as NeonQueryFunction<false, false>,
  {
    apply(_target, _thisArg, args: unknown[]) {
      return (client() as unknown as (...a: unknown[]) => unknown)(...args)
    },
    get(_target, prop) {
      return (client() as unknown as Record<string | symbol, unknown>)[prop]
    },
  }
)
