import { neon } from '@neondatabase/serverless'

const url = process.env.DATABASE_URL

if (!url) {
  // Surfaced at request time rather than build time so missing env in one
  // environment doesn't break unrelated routes.
  console.warn('DATABASE_URL is not set; database-backed routes will fail.')
}

export const sql = neon(url || '')
