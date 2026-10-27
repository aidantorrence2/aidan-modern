// One continuous mix per reel: music bed (from audio/out, composed from Apple Loops by audio/build-audio) + SFX
// one-shots placed at exact frame times, ONE two-pass loudnorm on the final mix (-14 LUFS, -1.5 dBTP).
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync, spawnSync } from 'node:child_process'
import { ROOT, FF } from './engine.mjs'

export const AUDIO = path.join(ROOT, 'audio/out')
export function beds() {
  const f = path.join(AUDIO, 'beds.json')
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null
}
// beat length for a bed id ('bed-a' …), falling back to a default BPM before the beds exist
export function bedEntry(bedId) {
  const b = beds(); if (!b) return null
  const list = Array.isArray(b) ? b : (b.beds ? (Array.isArray(b.beds) ? b.beds : Object.entries(b.beds).map(([k, v]) => ({ id: k, ...v }))) : Object.entries(b).map(([k, v]) => ({ id: k, ...v })))
  return list.find(x => (x.id || '').includes(bedId) || (x.file || '').includes(bedId)) || null
}
export function beatOf(bedId, fallbackBpm) {
  const e = bedEntry(bedId)
  const bpm = e?.bpm || fallbackBpm
  return { bpm, beat: e?.beatSec || 60 / bpm, bed: e ? path.join(AUDIO, path.basename(e.file || `${bedId}.wav`)) : null }
}
// bed second where a section starts (default: the groove = 2nd section, on a bar line)
export function grooveSec(bedId, section = null) {
  const e = bedEntry(bedId); const s = e?.sections || []
  if (section) { const f = s.find(x => x.name === section); if (f) return f.startSec }
  return s.length > 1 ? s[1].startSec : 0
}

/**
 * @param name   work subdir
 * @param dur    seconds
 * @param bed    { file, at = 0 (video time where bed sample 0 plays), from = 0 (seek into bed), gainDb = 0, fadeIn = 0, fadeOut = 1.2, duckUntil? }
 * @param events [{ t, file (basename in audio/out), gainDb = 0 }]
 */
export function mix(name, dur, { bed: bedIn = null, events = [] } = {}) {
  let bed = bedIn
  const work = path.join(ROOT, 'work', name); fs.mkdirSync(work, { recursive: true })
  const inputs = [], chains = [], labels = []
  if (bed?.file && bed.alignAt != null) {   // land the bed's groove entrance on video time alignAt
    const g = grooveSec(bed.groove || path.basename(bed.file, '.wav'), bed.section)
    bed = { ...bed, at: Math.max(0, bed.alignAt - g), from: Math.max(0, g - bed.alignAt) }
  }
  if (bed?.file) {
    inputs.push('-ss', String(bed.from || 0), '-i', bed.file)
    const fades = [bed.fadeIn ? `afade=t=in:st=0:d=${bed.fadeIn}` : null,
      `afade=t=out:st=${(dur - (bed.at || 0) - (bed.fadeOut ?? 1.2)).toFixed(3)}:d=${bed.fadeOut ?? 1.2}:curve=qsin`].filter(Boolean).join(',')
    chains.push(`[0:a]aresample=48000,aformat=channel_layouts=stereo,${fades},volume=${bed.gainDb || 0}dB,adelay=${Math.round((bed.at || 0) * 1000)}:all=1[bed]`)
    labels.push('[bed]')
  }
  events.forEach((e, i) => {
    const f = path.join(AUDIO, e.file)
    if (!fs.existsSync(f)) throw new Error(`missing sfx ${f}`)
    const idx = inputs.filter(x => x === '-i').length
    inputs.push('-i', f)
    chains.push(`[${idx}:a]aresample=48000,aformat=channel_layouts=stereo,volume=${e.gainDb || 0}dB${e.pan != null ? `,stereotools=balance_out=${e.pan}` : ''},adelay=${Math.round(e.t * 1000)}:all=1[e${i}]`)
    labels.push(`[e${i}]`)
  })
  if (!labels.length) return null
  chains.push(`${labels.join('')}amix=inputs=${labels.length}:normalize=0:dropout_transition=0,apad,atrim=0:${dur.toFixed(3)}[m]`)
  const pre = path.join(work, 'mix-pre.wav')
  execFileSync(FF, ['-hide_banner', '-loglevel', 'error', '-y', ...inputs, '-filter_complex', chains.join(';'), '-map', '[m]', '-ar', '48000', '-c:a', 'pcm_s24le', pre])
  // two-pass loudnorm on the whole mix
  const r = spawnSync(FF, ['-hide_banner', '-nostats', '-i', pre, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'])
  const err = r.stderr.toString()
  const j = JSON.parse(err.slice(err.lastIndexOf('{'), err.lastIndexOf('}') + 1))
  const out = path.join(work, 'mix.wav')
  execFileSync(FF, ['-hide_banner', '-loglevel', 'error', '-y', '-i', pre, '-af',
    `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true,aresample=48000`,
    '-ar', '48000', '-c:a', 'pcm_s24le', out])
  console.log(`[${name}] mix: in ${j.input_i} LUFS / ${j.input_tp} dBTP → -14 LUFS`)
  return out
}
