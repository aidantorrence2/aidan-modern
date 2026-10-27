#!/usr/bin/env python3
"""
build-audio.py -- regenerates audio/out/ for the Paris portrait-photographer video ads.

  python3 audio/build-audio.py            # beds + sfx + verification + pngs
  python3 audio/build-audio.py beds       # only the five music beds
  python3 audio/build-audio.py sfx        # only the sound effects

Self-bootstraps a venv (numpy, scipy, soundfile) into audio/cache/venv on first run.
Needs macOS `afconvert` (decodes the Apple Loops .caf/AAC files, honouring the
encoder priming/remainder frames from the 'pakt' chunk so loops tile gaplessly) and
`ffmpeg` (decodes the Commons .ogg sources, renders PNGs, cross-checks loudness).

Music beds = original arrangements built from several Apple Loops (GarageBand
content, royalty-free inside your own compositions). Every layer is tiled on one
global sample grid (beat 1 of bar 1 = sample 0), so all loop seams sit on exact
loop-length boundaries. SFX = trimmed CC0 / public-domain Wikimedia Commons
recordings where usable, otherwise synthesised here (fixed seeds, deterministic).
See SOURCES.md for every source + licence.
"""
import os, sys, json, struct, subprocess, math, re, shutil, urllib.request, urllib.parse
from fractions import Fraction
from pathlib import Path

HERE = Path(__file__).resolve().parent
CACHE = HERE / 'cache'
OUT = HERE / 'out'
VENV = CACHE / 'venv'


def _bootstrap():
    try:
        import numpy, scipy, soundfile  # noqa: F401
        return
    except ImportError:
        pass
    if os.environ.get('PARIS_AUDIO_VENV') == '1':
        sys.exit('numpy/scipy/soundfile still missing inside ' + str(VENV))
    py = VENV / 'bin' / 'python'
    if not py.exists():
        CACHE.mkdir(parents=True, exist_ok=True)
        subprocess.run([sys.executable, '-m', 'venv', str(VENV)], check=True)
        subprocess.run([str(py), '-m', 'pip', 'install', '-q', 'numpy', 'scipy', 'soundfile'], check=True)
    os.environ['PARIS_AUDIO_VENV'] = '1'
    os.execv(str(py), [str(py), str(Path(__file__).resolve())] + sys.argv[1:])


_bootstrap()

import numpy as np  # noqa: E402
import soundfile as sf  # noqa: E402
from scipy.signal import (butter, sosfilt, sosfiltfilt, resample_poly, fftconvolve,  # noqa: E402
                          stft, istft)
from scipy.ndimage import minimum_filter1d, uniform_filter1d  # noqa: E402

LOOP_ROOT = Path('/Library/Audio/Apple Loops/Apple')
SR_OUT = 48000
BED_SECONDS = 26.0
TARGET_LUFS = -16.0
TP_CEILING = -1.6          # limiter ceiling (dBTP); spec is <= -1.5
SFX_PEAK_DBFS = -3.0
FFMPEG = shutil.which('ffmpeg') or '/opt/homebrew/bin/ffmpeg'
UA = {'User-Agent': 'paris-video-ads-audio/1.0 (build script; contact aidan.torrence@gmail.com)'}


def db(x):
    return 20 * np.log10(np.maximum(np.abs(x), 1e-12))


def log(*a):
    print(*a, flush=True)


# ----------------------------------------------------------------------------- CAF / Apple Loops
def caf_meta(path):
    """Parse a CAF file: desc (sample rate), pakt (valid/priming/remainder frames) and the
    Apple Loops 'uuid' string table (beat count, key signature, descriptors, ...)."""
    d = Path(path).read_bytes()
    pos, m = 8, {}
    while pos + 12 <= len(d):
        typ = d[pos:pos + 4]
        size = struct.unpack('>q', d[pos + 4:pos + 12])[0]
        body = d[pos + 12:pos + 12 + size] if size >= 0 else d[pos + 12:]
        if typ == b'desc':
            m['sr'] = struct.unpack('>d', body[:8])[0]
            m['format'] = body[8:12].decode('latin1')
        elif typ == b'pakt':
            _, m['valid'], m['priming'], m['remainder'] = struct.unpack('>qqii', body[:24])
        elif typ in (b'uuid', b'info'):
            rest = body[16:] if typ == b'uuid' else body
            if typ == b'uuid' and not (b'beat count' in rest or b'key signature' in rest or b'category' in rest):
                pass
            else:
                n = struct.unpack('>I', rest[:4])[0]
                parts = rest[4:].split(b'\x00')
                for i in range(0, min(len(parts) - 1, 2 * n), 2):
                    m[parts[i].decode('utf8', 'replace')] = parts[i + 1].decode('utf8', 'replace')
        if size < 0:
            break
        pos += 12 + size
    return m


_LOOP_PATHS = None


def loop_path(name):
    global _LOOP_PATHS
    if _LOOP_PATHS is None:
        _LOOP_PATHS = {p.stem: p for p in LOOP_ROOT.glob('*/*.caf')}
    if name not in _LOOP_PATHS:
        raise SystemExit(f'Apple Loop not found: {name!r} (looked in {LOOP_ROOT})')
    return _LOOP_PATHS[name]


_LOOPS = {}


def load_loop(name):
    """Decode with afconvert (drops AAC priming + remainder -> exactly `valid` frames)."""
    if name in _LOOPS:
        return _LOOPS[name]
    p = loop_path(name)
    meta = caf_meta(p)
    dst = CACHE / 'loops' / (name + '.wav')
    if not dst.exists():
        dst.parent.mkdir(parents=True, exist_ok=True)
        tmp = dst.with_name(name + '.partial.wav')
        subprocess.run(['afconvert', '-f', 'WAVE', '-d', 'LEF32', str(p), str(tmp)], check=True)
        os.replace(tmp, dst)
    x, sr = sf.read(dst, dtype='float64', always_2d=True)
    if x.shape[1] == 1:
        x = np.repeat(x, 2, axis=1)
    if int(sr) != int(meta['sr']):
        raise RuntimeError(f'{name}: sample-rate mismatch')
    if 'valid' in meta and len(x) != meta['valid']:
        raise RuntimeError(f'{name}: decoded {len(x)} frames, CAF pakt says {meta["valid"]} valid frames')
    beats = int(meta['beat count'])
    info = dict(name=name, pack=p.parent.name, path=str(p), sr=int(sr), frames=len(x), beats=beats,
                bpm=beats * 60.0 * sr / len(x), key=meta.get('key signature', '-'),
                descriptors=meta.get('descriptors', ''), category=meta.get('category', ''),
                subcategory=meta.get('subcategory', ''), priming=meta.get('priming'),
                remainder=meta.get('remainder'))
    _LOOPS[name] = (x, info)
    return x, info


def tile(x, period, n, origin=0.0):
    """Continuous loop playback on a global grid: sample k of the timeline reads loop index
    floor((k - origin) mod period). period may be fractional (exact tempo); the <=1 sample
    rounding difference repeats the last loop sample, never inserts silence."""
    k = np.arange(n, dtype=np.float64)
    idx = np.floor(np.mod(k - origin, period)).astype(np.int64)
    np.minimum(idx, len(x) - 1, out=idx)
    return x[idx]


SEAM_FADE_MS = 1.0


def smooth_seam(x, sr, fade_in=False):
    """Apple Loops start from ~0 (a few-ms attack ramp, measured) but some end on a
    non-zero sample; a 1 ms raised-cosine fade on the last 1 ms of each loop iteration
    makes the wrap continuous (end -> 0 -> start) without touching the downbeat. Only
    applied where the raw wrap step is > -40 dB re loop RMS (otherwise left untouched)."""
    x = x.copy()
    k = int(SEAM_FADE_MS / 1000 * sr)
    if seam_step_db(x) > -40:
        x[-k:] *= (0.5 + 0.5 * np.cos(np.pi * np.arange(1, k + 1) / k))[:, None]
    if fade_in and np.abs(x[0]).max() > 10 ** (-50 / 20):   # pitched loops that start mid-sound
        j = int(0.001 * sr)
        x[:j] *= (0.5 - 0.5 * np.cos(np.pi * np.arange(j) / j))[:, None]
    return x


def seam_step_db(x):
    """Size of the sample step at the loop wrap (last sample -> first sample) relative to
    the loop's RMS. <= -40 dB is far below audibility inside a mix."""
    step = np.abs(x[0] - x[-1]).max()
    return float(db(step) - db(np.sqrt(np.mean(x ** 2))))


def active_rms_db(x, sr):
    """RMS over the 50 ms frames within 20 dB of the loudest frame (level of the part
    while it is playing, so sparse loops are not over-boosted)."""
    m = x.mean(axis=1)
    hop = int(0.05 * sr)
    fr = np.array([np.mean(m[i:i + hop] ** 2) for i in range(0, len(m) - hop, hop)])
    keep = fr[fr > fr.max() * 0.01]
    return float(10 * np.log10(keep.mean() + 1e-20))


# ----------------------------------------------------------------------------- DSP helpers
def rbj_sos(kind, f0, sr, gain_db=0.0, q=0.7071):
    A = 10 ** (gain_db / 40)
    w0 = 2 * math.pi * f0 / sr
    al = math.sin(w0) / (2 * q)
    c = math.cos(w0)
    if kind == 'peak':
        b = [1 + al * A, -2 * c, 1 - al * A]
        a = [1 + al / A, -2 * c, 1 - al / A]
    elif kind == 'highshelf':
        s = 2 * math.sqrt(A) * al
        b = [A * ((A + 1) + (A - 1) * c + s), -2 * A * ((A - 1) + (A + 1) * c), A * ((A + 1) + (A - 1) * c - s)]
        a = [(A + 1) - (A - 1) * c + s, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - s]
    elif kind == 'lowshelf':
        s = 2 * math.sqrt(A) * al
        b = [A * ((A + 1) - (A - 1) * c + s), 2 * A * ((A - 1) - (A + 1) * c), A * ((A + 1) - (A - 1) * c - s)]
        a = [(A + 1) + (A - 1) * c + s, -2 * ((A - 1) + (A + 1) * c), (A + 1) + (A - 1) * c - s]
    else:
        raise ValueError(kind)
    return np.array([[b[0] / a[0], b[1] / a[0], b[2] / a[0], 1.0, a[1] / a[0], a[2] / a[0]]])


def filt(y, sr, hp=None, lp=None, order=2):
    if hp:
        y = sosfilt(butter(order, hp, 'highpass', fs=sr, output='sos'), y, axis=0)
    if lp:
        y = sosfilt(butter(order, min(lp, 0.45 * sr), 'lowpass', fs=sr, output='sos'), y, axis=0)
    return y


def lpf_sweep(y, sr, points, bar_sec, order=4, block=256):
    """Time-varying low-pass (log-interpolated cutoff between (bar, Hz) points), block-wise
    Butterworth with the filter state carried across coefficient updates."""
    tt = np.array([(b - 1) * bar_sec for b, _ in points])
    lh = np.log(np.array([h for _, h in points], dtype=float))
    out = np.empty_like(y)
    zi = None
    for a in range(0, len(y), block):
        b = min(len(y), a + block)
        f = float(np.exp(np.interp((a + b) / 2 / sr, tt, lh)))
        sos = butter(order, min(f, 0.45 * sr), 'lowpass', fs=sr, output='sos')
        if zi is None:
            zi = np.zeros((sos.shape[0], 2, y.shape[1]))
        out[a:b], zi = sosfilt(sos, y[a:b], axis=0, zi=zi)
    return out


def fade_env(n, sr, regions, bar_sec, fin_ms, fout_ms):
    env = np.zeros(n)
    for r in regions:
        b0, b1 = r[0], r[1]
        fi = r[2] if len(r) > 2 else fin_ms
        fo = r[3] if len(r) > 3 else fout_ms
        s0 = int(round((b0 - 1) * bar_sec * sr))
        s1 = n if b1 is None else min(n, int(round((b1 - 1) * bar_sec * sr)))
        seg = np.ones(s1 - s0)
        nfi, nfo = int(fi * sr / 1000), int(fo * sr / 1000)
        if nfi > 0 and s0 > 0:
            seg[:nfi] = 0.5 - 0.5 * np.cos(np.pi * np.arange(nfi) / nfi)
        if nfo > 0 and b1 is not None:
            seg[-nfo:] *= 0.5 + 0.5 * np.cos(np.pi * np.arange(1, nfo + 1) / nfo)
        env[s0:s1] = np.maximum(env[s0:s1], seg)
    return env


def pump_env(n, sr, beat_sec, depth_db, tau_ms, start_sec=0.0):
    """Beat-synced ducking (sidechain-style pulse): dips depth_db on every beat, 2 ms attack,
    exponential recovery tau_ms."""
    t = np.arange(n) / sr
    ph = np.mod(t, beat_sec)
    shape = np.exp(-ph / (tau_ms / 1000)) * (1 - np.exp(-ph / 0.002))
    shape /= shape.max()
    d = 1 - 10 ** (-depth_db / 20)
    g = 1 - d * shape
    g[t < start_sec] = 1.0
    return g


def make_ir(sr, rt60=2.2, predelay=0.022, seed=11):
    rng = np.random.default_rng(seed)
    n = int(rt60 * 1.15 * sr)
    t = np.arange(n) / sr
    ir = rng.normal(0, 1, (n, 2)) * (10 ** (-3 * t / rt60))[:, None]
    lp = sosfilt(butter(2, 2800, 'lowpass', fs=sr, output='sos'), ir, axis=0)
    w = np.clip(t / 0.5, 0, 1)[:, None]
    ir = ir * (1 - w) + lp * w
    ir = sosfilt(butter(2, 280, 'highpass', fs=sr, output='sos'), ir, axis=0)
    ir[: int(0.004 * sr)] *= np.linspace(0, 1, int(0.004 * sr))[:, None]
    ir = np.vstack([np.zeros((int(predelay * sr), 2)), ir])
    return ir / np.sqrt((ir ** 2).sum(axis=0)).max()


# ----------------------------------------------------------------------------- loudness (BS.1770-4)
def _kweight_sos(sr):
    G, Q1, f1 = 3.99984385397, 0.7071752369554193, 1681.9744509555319
    A = 10 ** (G / 40)
    w0 = 2 * math.pi * f1 / sr
    al = math.sin(w0) / (2 * Q1)
    c = math.cos(w0)
    s = 2 * math.sqrt(A) * al
    b = [A * ((A + 1) + (A - 1) * c + s), -2 * A * ((A - 1) + (A + 1) * c), A * ((A + 1) + (A - 1) * c - s)]
    a = [(A + 1) - (A - 1) * c + s, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - s]
    s1 = [b[0] / a[0], b[1] / a[0], b[2] / a[0], 1, a[1] / a[0], a[2] / a[0]]
    Q2, f2 = 0.5003270373253953, 38.13547087613982
    w0 = 2 * math.pi * f2 / sr
    al = math.sin(w0) / (2 * Q2)
    c = math.cos(w0)
    b = [(1 + c) / 2, -(1 + c), (1 + c) / 2]
    a = [1 + al, -2 * c, 1 - al]
    s2 = [b[0] / a[0], b[1] / a[0], b[2] / a[0], 1, a[1] / a[0], a[2] / a[0]]
    return np.array([s1, s2])


def integrated_lufs(x, sr):
    y = sosfilt(_kweight_sos(sr), x, axis=0)
    blk, hop = int(0.4 * sr), int(0.1 * sr)
    if len(y) < blk:
        z = np.array([np.mean(y ** 2, axis=0).sum()])
    else:
        z = np.array([np.mean(y[i:i + blk] ** 2, axis=0).sum() for i in range(0, len(y) - blk + 1, hop)])
    lk = -0.691 + 10 * np.log10(z + 1e-20)
    z1 = z[lk > -70]
    if len(z1) == 0:
        return -70.0
    rel = -0.691 + 10 * np.log10(z1.mean()) - 10
    z2 = z[lk > rel]
    return float(-0.691 + 10 * np.log10(z2.mean()))


def true_peak_db(x):
    up = resample_poly(x, 4, 1, axis=0)
    return float(db(np.abs(up).max()))


def limiter(x, sr, ceiling_db, look_ms=2.0, release_ms=90.0):
    """Look-ahead peak limiter driven by a 4x-oversampled peak estimate."""
    up = resample_poly(x, 4, 1, axis=0)
    pk = np.abs(up).max(axis=1)
    pk = pk[: len(x) * 4].reshape(len(x), 4).max(axis=1)
    ceil = 10 ** (ceiling_db / 20)
    need = np.minimum(1.0, ceil / np.maximum(pk, 1e-12))
    if need.min() >= 1.0:
        return x, 0.0
    L = max(1, int(look_ms * sr / 1000))
    la = minimum_filter1d(need, size=2 * L + 1, origin=0)          # covers +-L around each peak
    sm = uniform_filter1d(la, size=L, origin=0)
    sm = np.minimum(sm, la)                                        # never above the needed gain
    rel = 1 - math.exp(-1 / (release_ms * sr / 1000))
    g = np.empty_like(sm)
    cur = 1.0
    for i in range(len(sm)):                                       # release smoothing
        v = sm[i]
        cur = v if v < cur else cur + (v - cur) * rel
        g[i] = cur
    return x * g[:, None], float(db(g.min()))


def ffmpeg_ebur128(path):
    r = subprocess.run([FFMPEG, '-hide_banner', '-nostats', '-i', str(path), '-af', 'ebur128=peak=true:framelog=quiet',
                        '-f', 'null', '-'], capture_output=True, text=True)
    txt = r.stderr
    i = re.findall(r'I:\s+(-?[\d.]+) LUFS', txt)
    tp = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', txt)
    return (float(i[-1]) if i else None), (float(tp[-1]) if tp else None)


# ----------------------------------------------------------------------------- bed specifications
END = None


def T(loop, level, regions, **kw):
    """One arrangement layer. level = target active-RMS (dBFS) of the layer before the
    master gain; regions = [(startBar, endBar|END[, fadeInMs, fadeOutMs])]."""
    return dict(loop=loop, level=level, regions=regions, **kw)


BEDS = [
    dict(
        id='bed-a', slug='salut', bpm=90,
        brief='typed-message opener -> soft montage; soft, warm, laid-back chill groove',
        family='Tokyo Dreams (07 Chillwave)', key='Eb (Apple Loops tag); sounds Bb major',
        sections=[('intro', 1), ('groove', 3), ('lift', 5), ('full', 7)],
        events=[('drums drop (breath before full)', 6.5), ('drums back', 7)],
        reverb=dict(rt60=2.4),
        master_eq=[('lowshelf', 100, -2.0, 0.7)],
        tracks=[
            T('Tokyo Dreams Pad', -21, [(1, END)], hp=110, sweep=[(1, 650), (2.5, 2600), (3, 16000)], send=-13),
            T('Tokyo Dreams Delay Guitar', -26, [(1, END)], hp=220, sweep=[(1, 1100), (3, 15000)], send=-15),
            T('Tokyo Dreams Bass', -18, [(3, END, 8, 15)], mono=True, lp=4500),
            T('Reverse Hat Beat 01', -17.5, [(3, 6.5, 1, 25), (7, END, 1, 25)], kick=True),
            T('Reverse Hat Beat 02', -21.5, [(5, 6.5, 1, 25), (7, END, 1, 25)]),
            T('Tokyo Dreams Guitar', -26, [(5, END, 8, 15)], hp=180),
            T('Tokyo Dreams Synth', -23.5, [(7, END, 8, 15)], hp=150, send=-17),
        ]),
    dict(
        id='bed-b', slug='couverture', bpm=95,
        brief='magazine-cover depth shots, slow pushes; dreamy, elegant, spacious, minimal drums',
        family='Dream State (07 Chillwave)', key='Eb (Apple Loops tag); sounds Bb major / C minor',
        sections=[('intro', 1), ('groove', 3), ('lift', 5), ('full', 7)],
        events=[],
        reverb=dict(rt60=3.0),
        master_eq=[('lowshelf', 100, -2.0, 0.7), ('highshelf', 8000, 2.5, 0.7)],
        tracks=[
            T('Dream State Guitar', -21, [(1, END)], hp=160, sweep=[(1, 1500), (3, 16000)], send=-10),
            T('Dream State Synth', -22, [(3, END, 10, 15)], hp=70, send=-16),
            T('Dream State Bass', -19.5, [(3, END, 10, 15)], mono=True, lp=4000),
            # minimal drums: Chillwave 100 BPM kit, varispeed 100 -> 95 (0.89 semitone lower)
            T('Matchbox Beat 01', -21.5, [(5, END, 1, 25)], varispeed=True, lp=9000, send=-22, kick=True),
            T('Matchbox Beat 02', -22.5, [(7, END, 1, 25)], varispeed=True, lp=11000, send=-16),
        ]),
    dict(
        id='bed-c', slug='regard', bpm=120,
        brief='rapid eye-locked match-cut montage that accelerates, then holds; pulsing, hypnotic, tight kick, tension',
        family='Hyperlapse (07 Chillwave)', key='C# (Apple Loops tag); sounds F minor / Ab major',
        sections=[('intro', 1), ('groove', 3), ('lift', 7), ('full', 9)],
        events=[('kick drop (half bar)', 8.5), ('kick back', 9)],
        reverb=dict(rt60=1.8),
        master_eq=[('lowshelf', 100, -1.5, 0.7)],
        tracks=[
            T('Hyperlapse Synth', -20, [(1, END)], hp=90, sweep=[(1, 480), (3, 2600), (7, 5200), (9, 16000)],
              pump=dict(depth=5.0, tau=120, start_bar=1), send=-17),
            T('Minimal Backbeat 01', -23, [(1, 3, 0, 4)], lp=200, label='kick, muffled (intro pulse)'),
            T('Minimal Backbeat 01', -16.5, [(3, 8.5, 1, 20), (9, END, 1, 20)], kick=True),
            T('Hyperlapse Bass', -18, [(3, END, 6, 15)], mono=True, lp=4000,
              pump=dict(depth=3.0, tau=90, start_bar=3)),
            T('Minimal Backbeat 02', -20, [(5, 8.5, 1, 20), (9, END, 1, 20)], send=-20),
            T('Doubledown Beat 02', -26, [(7, 8.5, 1, 20), (9, END, 1, 20)], hp=5500, label='16th hats only (high-passed)'),
            T('Hyperlapse Guitar', -24, [(7, END, 6, 15)], hp=220, send=-15),
        ]),
    dict(
        id='bed-d', slug='le-mur', bpm=120,
        brief='scrolling photo-wall columns, then a hero photo; groovy, warm, confident',
        family='Moving Pictures (07 Chillwave)', key='G (Apple Loops tag); sounds G major / E minor',
        sections=[('intro', 1), ('groove', 3), ('lift', 7), ('full', 9)],
        events=[],
        reverb=dict(rt60=1.6),
        tracks=[
            T('Moving Pictures Rhythm Guitar', -21, [(1, END)], hp=140, sweep=[(1, 550), (2.75, 1700), (3, 16000)]),
            T('Disco Swagger Beat 01', -16.5, [(3, END, 1, 20)], kick=True),
            T('Moving Pictures Bass', -17.5, [(3, END, 6, 15)], mono=True, lp=4500),
            T('Disco Swagger Beat 02', -19.5, [(5, END, 1, 20)], send=-20),
            T('Moving Pictures Acoustic Guitar', -23, [(7, END, 6, 15)], hp=180),
            T('Moving Pictures Synth', -24, [(9, END, 6, 15)], hp=200, send=-16),
        ]),
    dict(
        id='bed-e', slug='depart', bpm=110,
        brief='split-flap departure board (loud flap clacks on top); minimal, clean, cool, leave mid-high space',
        family='Contrails (07 Chillwave)', key='B (Apple Loops tag); sounds B minor / D major',
        sections=[('intro', 1), ('groove', 3), ('lift', 7), ('full', 9)],
        events=[],
        reverb=dict(rt60=2.2),
        master_eq=[('peak', 3000, -3.5, 0.8), ('highshelf', 6500, -2.0, 0.7)],
        tracks=[
            T('Contrails Synth', -21, [(1, END)], hp=140, sweep=[(1, 1500), (3, 7000)], send=-10),
            T('Contrails Bass', -17.5, [(3, END, 6, 15)], mono=True, lp=3000),
            T('Minimal Disco 80s Beat 03', -17.5, [(3, END, 1, 20)], lp=2600, label='4/4 kick, low-passed (muted)', kick=True),
            T('Minimal Disco 80s Beat 02', -22.5, [(5, END, 1, 20)], lp=4500, label='backbeat + hats, low-passed (muted)'),
            T('Contrails Acoustic Guitar', -25, [(7, END, 6, 15)], hp=200, lp=6000),
            T('Contrails Lead Guitar', -25.5, [(9, END, 6, 15)], hp=250, lp=5000, send=-14),
        ]),
]


# ----------------------------------------------------------------------------- bed rendering
def render_bed(spec):
    sr = 44100
    bpm = float(spec['bpm'])
    beat = 60.0 / bpm
    bar = 4 * beat
    n = int(round((BED_SECONDS + 0.25) * sr))
    mix = np.zeros((n, 2))
    drums = np.zeros((n, 2))
    send_bus = np.zeros((n, 2))
    layers, seams = [], []
    kick_ref = None
    for tr in spec['tracks']:
        x, info = load_loop(tr['loop'])
        src_bpm = info['bpm']
        varispeed = None
        if abs(src_bpm - bpm) > 0.01:
            if not tr.get('varispeed'):
                raise SystemExit(f"{spec['id']}: {tr['loop']} is {src_bpm:.3f} BPM, bed is {bpm} (set varispeed=True)")
            fr = Fraction(src_bpm / bpm).limit_denominator(400)
            x = resample_poly(x, fr.numerator, fr.denominator, axis=0)
            varispeed = dict(fromBpm=round(src_bpm, 3), ratio=f'{fr.numerator}/{fr.denominator}',
                             semitones=round(-12 * math.log2(src_bpm / bpm), 2))
        period = info['beats'] * beat * sr
        raw_step = seam_step_db(x)
        x = smooth_seam(x, sr, fade_in=info['category'] != 'Drums')
        y = tile(x, period, n)
        gain_db = tr['level'] - active_rms_db(x, sr)
        y = filt(y, sr, hp=tr.get('hp'), lp=tr.get('lp'))
        if tr.get('sweep'):
            y = lpf_sweep(y, sr, tr['sweep'], bar)
        if tr.get('pump'):
            p = tr['pump']
            y = y * pump_env(n, sr, beat, p['depth'], p['tau'], (p['start_bar'] - 1) * bar)[:, None]
        if tr.get('mono'):
            y = np.repeat(y.mean(axis=1, keepdims=True), 2, axis=1)
        env = fade_env(n, sr, tr['regions'], bar, tr.get('fin', 5), tr.get('fout', 15))
        y = y * env[:, None] * 10 ** (gain_db / 20)
        mix += y
        if info['category'] == 'Drums':
            drums += y
        if tr.get('kick'):
            pre = int(0.25 * sr)
            ctx = tile(x, period, pre + int(period), origin=pre).mean(axis=1)   # loop tail, then sample 0 at 250 ms
            ko = kick_onsets(ctx, sr, 0.0, len(ctx) / sr) - pre / sr
            down = [k - round(k / bar) * bar for k in ko if abs(k - round(k / bar) * bar) < 0.03]
            kick_ref = dict(loop=tr['loop'], sourceLoopDownbeatKickMs=round(float(np.median(down)) * 1000, 2) if down else None)
        if tr.get('send') is not None:
            send_bus += y * 10 ** (tr['send'] / 20)
        # seams that fall inside the layer's active regions
        k = np.arange(1, int(n / period) + 1)
        st = k * period / sr
        act = env[np.minimum((k * period).astype(int), n - 1)] > 0.5
        seams += [float(s) for s in st[act] if s < BED_SECONDS]
        layers.append(dict(loop=tr['loop'], pack=info['pack'], label=tr.get('label'), loopBpm=round(src_bpm, 3),
                           loopKey=info['key'], beats=info['beats'], descriptors=info['descriptors'],
                           regionsBars=[[r[0], r[1]] for r in tr['regions']], gainDb=round(gain_db, 2),
                           varispeed=varispeed, category=info['category'], seamStepRawDbReRms=round(raw_step, 1),
                           seamStepDbReRms=round(seam_step_db(x), 1),
                           primingFrames=info['priming'], remainderFrames=info['remainder']))
    if np.abs(send_bus).max() > 0:
        rv = spec.get('reverb', {})
        ir = make_ir(sr, rt60=rv.get('rt60', 2.2), seed=sum(map(ord, spec['id'])))
        wet = np.stack([fftconvolve(send_bus[:, c], ir[:, c])[:n] for c in range(2)], axis=1)
        mix += wet
    mix = filt(mix, sr, hp=30)
    for kind, f0, g, q in spec.get('master_eq', []):
        mix = sosfilt(rbj_sos(kind, f0, sr, g, q), mix, axis=0)
    # -> 48 kHz, exact length, edge fades (1 ms in so beat 1 stays at t=0, 10 ms out)
    y = resample_poly(mix, 160, 147, axis=0)[: int(round(BED_SECONDS * SR_OUT))]
    fi, fo = int(0.001 * SR_OUT), int(0.010 * SR_OUT)
    y[:fi] *= (0.5 - 0.5 * np.cos(np.pi * np.arange(fi) / fi))[:, None]
    y[-fo:] *= (0.5 + 0.5 * np.cos(np.pi * np.arange(1, fo + 1) / fo))[:, None]
    # loudness: gain to target, limit true peak, iterate
    lim_gr = 0.0
    for _ in range(6):
        g = TARGET_LUFS - integrated_lufs(y, SR_OUT)
        y = y * 10 ** (g / 20)
        if true_peak_db(y) > TP_CEILING:
            y, gr = limiter(y, SR_OUT, TP_CEILING - 0.05)
            lim_gr = min(lim_gr, gr)
        if abs(integrated_lufs(y, SR_OUT) - TARGET_LUFS) < 0.05 and true_peak_db(y) <= TP_CEILING + 0.01:
            break
    drums48 = resample_poly(filt(drums, sr, hp=25), 160, 147, axis=0)[: len(y)]
    return y, drums48, layers, sorted(set(round(s, 6) for s in seams)), lim_gr, kick_ref


# ----------------------------------------------------------------------------- bed verification
def onset_env(m, sr, hop=128, nfft=1024, fmin=30, fmax=16000):
    f, t, Z = stft(m, sr, nperseg=nfft, noverlap=nfft - hop, boundary='even', padded=True)
    sel = (f >= fmin) & (f <= fmax)
    L = np.log1p(100 * np.abs(Z[sel]))
    flux = np.maximum(0, np.diff(L, axis=1)).sum(axis=0)
    flux = np.concatenate([[0], flux])
    flux = flux - uniform_filter1d(flux, 64)
    return np.maximum(flux, 0), t


def comb_score(env, tt, period, phase, t0, t1):
    beats = np.arange(t0 + phase, t1, period)
    return float(np.interp(beats, tt, env).mean())


def grid_analysis(y, sr, bpm, t0, t1, bias=0.0):
    m = y.mean(axis=1)
    env, tt = onset_env(m, sr)
    tt = tt - bias
    beat = 60.0 / bpm
    cands = np.arange(bpm - 5, bpm + 5.001, 0.01)
    sc = []
    for b in cands:
        p = 60.0 / b
        phs = np.arange(0, p, 0.002)
        sc.append(max(comb_score(env, tt, p, ph, t0, t1) for ph in phs[::4]))
    best_bpm = float(cands[int(np.argmax(sc))])
    phs = np.arange(-beat / 2, beat / 2, 0.0005)
    s2 = [comb_score(env, tt, beat, ph, t0, t1) for ph in phs]
    phase = float(phs[int(np.argmax(s2))])
    # independent autocorrelation tempo (40-200 BPM), reported as the octave nearest the stated BPM
    seg = env[(tt >= t0) & (tt < t1)]
    seg = seg - seg.mean()
    ac = np.correlate(seg, seg, 'full')[len(seg) - 1:]
    dt = tt[1] - tt[0]
    lags = np.arange(len(ac)) * dt
    ok = (lags > 60 / 200) & (lags < 60 / 40)
    lag = lags[ok][int(np.argmax(ac[ok]))]
    ac_bpm = 60 / lag
    while ac_bpm < bpm / 1.42:
        ac_bpm *= 2
    while ac_bpm > bpm * 1.42:
        ac_bpm /= 2
    return best_bpm, phase * 1000, float(ac_bpm)


def kick_onsets(m, sr, t0, t1):
    """Kick attack times in a (drums-only) mono signal: zero-phase 40-160 Hz band-pass,
    1 ms envelope, onset = first crossing of 30% of the following 40 ms peak."""
    lb = sosfiltfilt(butter(4, [40, 160], 'bandpass', fs=sr, output='sos'), m)
    env = uniform_filter1d(np.abs(lb), int(0.001 * sr))
    e = env[:: int(0.001 * sr)]
    a, b = int(t0 * 1000), min(len(e), int(t1 * 1000))
    gmax = e[a:b].max()
    out = []
    i = a + 2
    while i < b - 45:
        w = e[i:i + 40]
        pk = w.max()
        if e[i] < 0.12 * pk and pk > 0.2 * gmax:
            j = i + int(np.argmax(w > 0.3 * pk))
            out.append(j / 1000.0)
            i = j + 100
        else:
            i += 1
    return np.array(out)


def calibrate_bias(sr):
    """Measure the onset detector's own latency on a synthetic click track whose clicks sit
    exactly on the grid; the verification subtracts it."""
    bpm, n = 120.0, int(8 * sr)
    y = np.zeros((n, 2))
    rng = np.random.default_rng(3)
    for k in range(16):
        s = int(round(k * 0.5 * sr))
        L = int(0.12 * sr)
        tt = np.arange(L) / sr
        hit = np.sin(2 * np.pi * 55 * tt * (1 + 2 * np.exp(-tt / 0.01))) * np.exp(-tt / 0.06)
        hit[: int(0.004 * sr)] += rng.normal(0, 0.4, int(0.004 * sr))
        y[s:s + L] += hit[:, None] * 0.5
    env, tt = onset_env(y.mean(axis=1), sr)
    beat = 60.0 / bpm
    phs = np.arange(-beat / 2, beat / 2, 0.0005)
    s2 = [comb_score(env, tt, beat, ph, 0.5, 7.5) for ph in phs]
    flux_bias = float(phs[int(np.argmax(s2))])
    ko = kick_onsets(y.mean(axis=1), sr, 0.0, 7.9)
    kick_bias = float(np.median(ko - np.round(ko / beat) * beat))
    return flux_bias, kick_bias


def verify_bed(path, spec, seams, bias, drums):
    y, sr = sf.read(path, dtype='float64', always_2d=True)
    bpm = float(spec['bpm'])
    beat = 60 / bpm
    bar = 4 * beat
    dur = len(y) / sr
    res = dict(durationSec=round(dur, 6), sampleRate=sr)
    res['samplePeakDbfs'] = round(float(db(np.abs(y).max())), 2)
    res['clippedSamples'] = int((np.abs(y) >= 0.9999).sum())
    res['lufs'] = round(integrated_lufs(y, sr), 2)
    res['truePeakDbtp'] = round(true_peak_db(y), 2)
    fl, ftp = ffmpeg_ebur128(path)
    res['lufsFfmpeg'], res['truePeakFfmpegDbtp'] = fl, ftp
    # tempo / grid on groove + full sections (drums present)
    groove_t = (dict(spec['sections'])['groove'] - 1) * bar
    best, phase_ms, ac = grid_analysis(y, sr, bpm, groove_t, dur - 0.1, bias=bias[0])
    res['measuredBpm'] = round(best, 2)
    res['autocorrBpm'] = round(ac, 2)
    res['beatGridOffsetMs'] = round(phase_ms, 1)
    # kicks, measured on the bed's own drum layers rendered through the same chain
    ko = kick_onsets(drums.mean(axis=1), sr, groove_t - 0.02, dur)
    six = beat / 4
    off16 = ko - np.round(ko / six) * six
    res['kickOnsetsDetected'] = int(len(ko))
    res['kickWithin5msOf16thGrid'] = round(float((np.abs(off16) <= 0.005).mean()), 3) if len(ko) else None
    res['kickOffsetMedianMs'] = round(float(np.median(off16) * 1000), 2) if len(ko) else None
    res['kickOffsetMaxAbsMs'] = round(float(np.abs(off16).max() * 1000), 2) if len(ko) else None
    pos = np.round(np.mod(ko, bar) / six).astype(int) % 16
    res['kickPositionsIn16ths'] = sorted(set(int(p) for p in pos))
    down = ko[np.abs(ko - np.round(ko / bar) * bar) < 0.03]
    res['downbeatKicks'] = int(len(down))
    res['downbeatKickOffsetMedianMs'] = round(float(np.median(down - np.round(down / bar) * bar) * 1000), 2) if len(down) else None
    res['firstKickSec'] = round(float(ko[0]), 4) if len(ko) else None
    res['firstKickVsNearestBarMs'] = round(float((ko[0] - round(ko[0] / bar) * bar) * 1000), 2) if len(ko) else None
    # beat 1 = t 0: audio starts immediately and the first onset sits at 0
    m = y.mean(axis=1)
    thr = np.abs(m).max() * 10 ** (-40 / 20)
    res['audioStartsMs'] = round(float(np.argmax(np.abs(m) > thr) / sr * 1000), 2)
    env, tt = onset_env(m, sr)
    tt = tt - bias[0]
    sel = (tt >= -0.01) & (tt <= 0.3)
    res['firstOnsetMs'] = round(float(tt[sel][int(np.argmax(env[sel]))] * 1000), 1)
    # section levels
    secs = spec['sections'] + [('end', None)]
    lv = {}
    for (nm, b0), (_, b1) in zip(secs[:-1], secs[1:]):
        a = int((b0 - 1) * bar * sr)
        b = len(y) if b1 is None else int((b1 - 1) * bar * sr)
        seg = y[a:b]
        lv[nm] = dict(rmsDbfs=round(float(10 * np.log10(np.mean(seg ** 2) + 1e-20)), 2),
                      lufs=round(integrated_lufs(seg, sr), 2))
    res['sectionLevels'] = lv
    # seam clicks: high-passed 2nd difference at each loop seam vs the same metric at
    # every 16th-note grid point that is NOT a seam (same musical positions, no splice)
    hp = sosfilt(butter(4, 3000, 'highpass', fs=sr, output='sos'), m)
    d2 = np.abs(np.diff(hp, 2))
    w = int(0.001 * sr)

    def win_max(t):
        c = int(round(t * sr))
        return d2[max(0, c - w):c + w].max()
    seam_set = set(round(t, 3) for t in seams)
    bars = [t for t in np.arange(bar, dur - 0.05, bar) if round(t, 3) not in seam_set]
    seam_vals = np.array([win_max(t) for t in seams])
    ref = np.array([win_max(t) for t in bars])
    res['seamCount'] = len(seams)
    # HF splice energy at loop seams vs. at bar lines that are not seams (~1 => no click)
    res['seamClickRatioMedian'] = round(float(np.median(seam_vals) / (np.median(ref) + 1e-12)), 2) if len(seams) else None
    res['seamClickRatioMax'] = round(float(seam_vals.max() / (ref.max() + 1e-12)), 2) if len(seams) else None

    def dip(t):
        c = int(round(t * sr))
        r5 = np.sqrt(np.mean(m[c - int(0.0025 * sr):c + int(0.0025 * sr)] ** 2))
        r60 = np.sqrt(np.mean(m[c - int(0.03 * sr):c + int(0.03 * sr)] ** 2))
        return float(db(r5) - db(r60))
    # gaps: 5 ms RMS centred on the seam vs surrounding 60 ms, compared with non-seam bar lines
    res['seamGapMinDb'] = round(min(dip(t) for t in seams), 1) if seams else None
    res['nonSeamBarGapMinDb'] = round(min(dip(t) for t in bars), 1) if bars else None
    # dropouts: quietest 5 ms window after the groove starts
    h = int(0.005 * sr)
    a = int(groove_t * sr)
    fr = np.sqrt(uniform_filter1d(m[a:] ** 2, h)[::h])
    res['minRms5msAfterGrooveDbfs'] = round(float(db(fr[:-2].min())), 1)
    return res


def bed_pngs(path, png):
    flt = ('[0:a]aformat=channel_layouts=mono,showwavespic=s=1600x260:colors=0x6fa8dc[w];'
           '[0:a]showspectrumpic=s=1600x420:legend=0:scale=log:fscale=log:color=intensity[s];'
           '[w][s]vstack=inputs=2,format=rgb24')
    subprocess.run([FFMPEG, '-v', 'error', '-y', '-i', str(path), '-lavfi', flt, '-frames:v', '1', str(png)], check=True)


def build_beds():
    OUT.mkdir(parents=True, exist_ok=True)
    bias = calibrate_bias(SR_OUT)
    log(f'onset-detector latency calibration: flux {bias[0]*1000:.2f} ms, kick {bias[1]*1000:.2f} ms')
    report = {}
    for spec in BEDS:
        log(f"\n== {spec['id']} {spec['slug']} @ {spec['bpm']} BPM")
        y, drums, layers, seams, lim_gr, kick_ref = render_bed(spec)
        fname = f"{spec['id']}-{spec['slug']}.wav"
        path = OUT / fname
        sf.write(path, y, SR_OUT, subtype='PCM_24')
        v = verify_bed(path, spec, seams, bias, drums)
        if kick_ref:
            v['kickReference'] = kick_ref
            if v.get('downbeatKickOffsetMedianMs') is not None and kick_ref['sourceLoopDownbeatKickMs'] is not None:
                v['downbeatPlacementErrorMs'] = round(v['downbeatKickOffsetMedianMs'] - kick_ref['sourceLoopDownbeatKickMs'], 2)
        png = OUT / f"{spec['id']}-{spec['slug']}.png"
        bed_pngs(path, png)
        beat = 60.0 / spec['bpm']
        bar = 4 * beat
        report[spec['id']] = dict(
            id=spec['id'], slug=spec['slug'], file=fname, png=png.name, brief=spec['brief'],
            bpm=spec['bpm'], beatSec=round(beat, 6), barSec=round(bar, 6), beatsPerBar=4,
            key=spec['key'], family=spec['family'], durationSec=v['durationSec'],
            sampleRate=SR_OUT, bitDepth=24, channels=2,
            lufs=v['lufs'], truePeakDbtp=v['truePeakDbtp'],
            sections=[dict(name=nm, startSec=round((b - 1) * bar, 4), startBar=b) for nm, b in spec['sections']],
            events=[dict(name=nm, startSec=round((b - 1) * bar, 4), startBar=b) for nm, b in spec.get('events', [])],
            loops=layers, limiterMaxGainReductionDb=round(lim_gr, 2), verification=v)
        log(json.dumps({k: v[k] for k in v if k not in ('sectionLevels',)}))
        log('   sections', json.dumps(v['sectionLevels']))
        log('   limiter GR', round(lim_gr, 2), 'dB;  layers:', ', '.join(f"{l['loop']} ({l['gainDb']:+.1f} dB, seam {l['seamStepRawDbReRms']}->{l['seamStepDbReRms']} dB)" for l in layers))
    (OUT / 'beds.json').write_text(json.dumps(report, indent=2))
    log('\nwrote', OUT / 'beds.json')
    return report


# ----------------------------------------------------------------------------- Commons sources
COMMONS = {
    'shutter': 'File:Auslösegeräusch SLR Serienaufnahme bis Puffer voll.oga',
    'typing': 'File:Typing hunt and peck.ogg',
}


def commons_api(params):
    url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(dict(params, format='json'))
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return json.load(r)


def commons_fetch(title):
    """Download (once) into cache/commons/ and return (local path, metadata). Refuses anything
    that is not CC0 / public domain."""
    d = CACHE / 'commons'
    d.mkdir(parents=True, exist_ok=True)
    metaf = d / '_meta.json'
    allmeta = json.loads(metaf.read_text()) if metaf.exists() else {}
    local = d / title[5:].replace('/', '_')
    meta = allmeta.get(title)
    if meta is None or 'page' not in meta or not local.exists():
        q = commons_api(dict(action='query', titles=title, prop='imageinfo', iiprop='url|extmetadata'))
        ii = list(q['query']['pages'].values())[0]['imageinfo'][0]
        em = ii['extmetadata']
        strip = lambda s: ' '.join(re.sub('<[^>]+>', ' ', str(s)).split())  # noqa: E731
        meta = dict(title=title, url=ii['url'], page='https://commons.wikimedia.org/wiki/' + urllib.parse.quote(title.replace(' ', '_')),
                    lic=em.get('LicenseShortName', {}).get('value'), artist=strip(em.get('Artist', {}).get('value', '')),
                    credit=strip(em.get('Credit', {}).get('value', '')), desc=strip(em.get('ImageDescription', {}).get('value', ''))[:300])
        if not local.exists():
            with urllib.request.urlopen(urllib.request.Request(meta['url'], headers=UA), timeout=180) as r:
                local.write_bytes(r.read())
        allmeta[title] = dict(meta, local=str(local))
        metaf.write_text(json.dumps(allmeta, indent=1, ensure_ascii=False))
    if meta['lic'] not in ('CC0', 'Public domain'):
        raise SystemExit(f'{title}: licence {meta["lic"]} is not CC0/PD')
    return local, meta


def decode_any(path, sr=None):
    tmp = CACHE / 'decoded'
    tmp.mkdir(parents=True, exist_ok=True)
    dst = tmp / (Path(path).stem + '.wav')
    if not dst.exists():
        subprocess.run([FFMPEG, '-v', 'error', '-y', '-i', str(path), '-map', '0:a:0', '-c:a', 'pcm_f32le', str(dst)], check=True)
    x, s = sf.read(dst, dtype='float64', always_2d=True)
    return x, int(s)


def to48(x, sr):
    if sr == SR_OUT:
        return x
    fr = Fraction(SR_OUT, sr)
    return resample_poly(x, fr.numerator, fr.denominator, axis=0)


def finish_sfx(x, sr, fade_in_ms=0.3, fade_out_ms=20.0, peak_db=SFX_PEAK_DBFS, tighten=True):
    x = np.array(x, dtype=np.float64)
    if x.ndim == 1:
        x = x[:, None]
    if x.shape[1] == 1:
        x = np.repeat(x, 2, axis=1)
    x = to48(x, sr)
    if tighten:   # transient (first sample >= -12 dB re peak) must land within ~1 ms of t=0
        m = np.abs(x).max(axis=1)
        k = int(np.argmax(m >= m.max() * 10 ** (-12 / 20)))
        lead = int(0.001 * SR_OUT)
        if k > int(0.0015 * SR_OUT):
            x = x[k - lead:]
    fi, fo = max(1, int(fade_in_ms * SR_OUT / 1000)), int(fade_out_ms * SR_OUT / 1000)
    x[:fi] *= (0.5 - 0.5 * np.cos(np.pi * np.arange(fi) / fi))[:, None]
    x[-fo:] *= (0.5 + 0.5 * np.cos(np.pi * np.arange(1, fo + 1) / fo))[:, None]
    x *= 10 ** (peak_db / 20) / np.abs(x).max()
    return x


# ----------------------------------------------------------------------------- SFX: shutter (Commons CC0)
def cut_shutter(x, sr, t_guess, tail_ms):
    """Find the main mechanical spike near t_guess and start the clip 0.8 ms before it."""
    hp = sosfiltfilt(butter(2, 300, 'highpass', fs=sr, output='sos'), x, axis=0)
    a = int((t_guess - 0.06) * sr)
    b = int((t_guess + 0.06) * sr)
    pk = a + int(np.argmax(np.abs(hp[a:b]).max(axis=1)))
    s0 = pk - int(0.0008 * sr)
    seg = x[s0:s0 + int(tail_ms / 1000 * sr)]
    seg = filt(seg, sr, hp=110)
    return seg


def cut_key(x, sr, t_guess, max_ms, release_guard_ms=8):
    hp = sosfiltfilt(butter(4, 400, 'highpass', fs=sr, output='sos'), x, axis=0)
    m = np.abs(hp).max(axis=1)
    hop = int(0.0005 * sr)
    a = int((t_guess - 0.03) * sr)
    e = np.array([m[i:i + hop].max() for i in range(a, a + int(0.08 * sr), hop)])
    floor = np.percentile(np.abs(hp).max(axis=1)[int((t_guess - 0.4) * sr):int((t_guess - 0.05) * sr)], 60)
    k = int(np.argmax(e > max(floor * 12, e.max() * 0.08)))
    s0 = a + k * hop - int(0.0004 * sr)
    seg = x[s0:s0 + int(max_ms / 1000 * sr)]
    # stop before the key-release click if it comes inside the window
    env = uniform_filter1d(np.abs(sosfilt(butter(4, 400, 'highpass', fs=sr, output='sos'), seg, axis=0)).max(axis=1), int(0.001 * sr))
    pk = env[: int(0.02 * sr)].max()
    after = np.where(env[int(0.03 * sr):] > 0.35 * pk)[0]
    if len(after):
        cut = int(0.03 * sr) + after[0] - int(release_guard_ms / 1000 * sr)
        seg = seg[:max(cut, int(0.04 * sr))]
    seg = filt(seg, sr, hp=260, order=4)
    seg = sosfilt(rbj_sos('highshelf', 6500, sr, -5.0, 0.7), seg, axis=0)   # soften: laptop-ish, not clacky
    seg = filt(seg, sr, lp=11000)
    # gate the residual room/rumble under the decay
    env = uniform_filter1d(np.abs(seg).max(axis=1), int(0.002 * sr))
    g = np.clip((db(env) - (db(env.max()) - 42)) / 12, 0, 1)
    return seg * uniform_filter1d(g, int(0.004 * sr))[:, None]


# ----------------------------------------------------------------------------- SFX: synthesis
def damped_modes(rng, sr, n, freqs, taus, amps):
    t = np.arange(n) / sr
    y = np.zeros(n)
    for f, tau, a in zip(freqs, taus, amps):
        y += a * np.exp(-t / tau) * np.sin(2 * np.pi * f * t + rng.uniform(0, 2 * np.pi))
    return y


def flap_hit(rng, sr, bright=1.0, metal=0.5, dur=0.07):
    """One split-flap leaf slapping its stop: crisp noise click + damped plate modes
    (plastic/aluminium leaf) + tiny housing thump + a quieter bounce 3-8 ms later +
    a few short early reflections (small cabinet). Returns stereo."""
    n = int(dur * sr)
    base = np.array([1150, 1900, 2750, 3700, 4900, 6400, 8300]) * rng.uniform(0.9, 1.1)

    def one(scale):
        f = base * rng.uniform(0.95, 1.05, len(base))
        tau = (np.array([7.0, 5.5, 4.2, 3.2, 2.4, 1.8, 1.3]) * (0.7 + 0.9 * metal)) / 1000 * rng.uniform(0.85, 1.15, len(base))
        amp = rng.uniform(0.35, 1.0, len(base)) * np.array([0.7, 0.9, 1.0, 0.9, 0.75, 0.6, 0.45]) ** (1 / bright)
        y = damped_modes(rng, sr, n, f, tau, amp)
        exc_n = int(0.0009 * sr)
        click = rng.normal(0, 1, exc_n) * np.exp(-np.arange(exc_n) / (exc_n / 4))
        click = sosfilt(butter(2, 2500, 'highpass', fs=sr, output='sos'), click)
        y[:exc_n] += 2.2 * click * bright
        tt = np.arange(n) / sr
        thump = np.sin(2 * np.pi * rng.uniform(210, 330) * tt) * np.exp(-tt / 0.006) * (1 - np.exp(-tt / 0.0004))
        y += 0.35 * thump
        return y * scale
    y = one(1.0)
    d = int(rng.uniform(0.003, 0.008) * sr)
    y[d:] += one(rng.uniform(0.18, 0.32))[: n - d]
    out = np.stack([y, y], axis=1)
    for ch in range(2):
        for ms, g in [(1.7, 0.16), (3.9, 0.11), (6.3, 0.07), (9.8, 0.05)]:
            k = int((ms + rng.uniform(-0.6, 0.6)) / 1000 * sr)
            refl = sosfilt(butter(1, 3500, 'lowpass', fs=sr, output='sos'), y)
            out[k:, ch] += g * refl[: n - k]
    out = filt(out, sr, hp=150, lp=12000)
    t = np.arange(n) / sr
    out *= np.clip((dur - t) / 0.012, 0, 1)[:, None]
    return out


def flap_cascade(rng, sr, length=0.62, modules=13):
    n = int((length + 0.08) * sr)
    out = np.zeros((n, 2))
    pool = [flap_hit(rng, sr, bright=rng.uniform(0.8, 1.15), metal=rng.uniform(0.3, 0.8)) for _ in range(28)]
    ends = np.sort(rng.uniform(0.2, length, modules))
    for mi in range(modules):
        start = 0.0 if mi == 0 else rng.uniform(0.0, 0.045)
        period = rng.uniform(0.026, 0.040)
        pan = rng.uniform(-0.65, 0.65)
        gl, gr = math.cos((pan + 1) * math.pi / 4), math.sin((pan + 1) * math.pi / 4)
        mod_gain = rng.uniform(0.55, 1.0)
        t = start
        while t <= ends[mi]:
            last = t + period > ends[mi]
            h = pool[rng.integers(len(pool))]
            g = mod_gain * rng.uniform(0.6, 1.0) * (1.35 if last else 1.0)
            s = int(t * sr)
            L = min(len(h), n - s)
            out[s:s + L, 0] += g * gl * h[:L, 0]
            out[s:s + L, 1] += g * gr * h[:L, 1]
            t += period * rng.uniform(0.85, 1.15)
    return out


def whoosh(rng, sr, dur=0.55, peak_at=0.30):
    """Very soft air swish: decorrelated noise shaped in the STFT domain by a moving
    ~1.2-octave band (520 Hz -> 2.1 kHz at the peak -> 900 Hz), smooth swell, slight L->R pan."""
    n = int(dur * sr)
    nfft, hop = 1024, 256
    t_axis = np.arange(n) / sr
    env = np.where(t_axis < peak_at, (t_axis / peak_at) ** 1.8,
                   np.exp(-(np.maximum(t_axis - peak_at, 0) / 0.11) ** 1.6))
    chans = []
    for c in range(2):
        w = rng.normal(0, 1, n + nfft)
        f, tt, Z = stft(w, sr, nperseg=nfft, noverlap=nfft - hop)
        fc = np.where(tt < peak_at, 520 * (2100 / 520) ** np.clip(tt / peak_at, 0, 1),
                      2100 * (900 / 2100) ** np.clip((tt - peak_at) / (dur - peak_at), 0, 1))
        ff = np.maximum(f, 1)[:, None]
        band = np.exp(-0.5 * (np.log2(ff / fc[None, :]) / 0.85) ** 2)
        tilt = (ff / 1000) ** -0.35
        Z = Z * band * tilt
        _, y = istft(Z, sr, nperseg=nfft, noverlap=nfft - hop)
        chans.append(y[:n])
    y = np.stack(chans, axis=1) * env[:, None]
    pan = np.linspace(-0.35, 0.35, n)
    y[:, 0] *= np.cos((pan + 1) * np.pi / 4) * math.sqrt(2)
    y[:, 1] *= np.sin((pan + 1) * np.pi / 4) * math.sqrt(2)
    return filt(y, sr, hp=180, lp=9000)


def sfx_stats(x, sr):
    m = np.abs(x).max(axis=1)
    pk = m.max()
    return dict(durationSec=round(len(x) / sr, 4), peakDbfs=round(float(db(pk)), 2), truePeakDbtp=round(true_peak_db(x), 2),
                transientMs=round(float(np.argmax(m >= pk * 10 ** (-12 / 20)) / sr * 1000), 2),
                firstAboveMinus40dBMs=round(float(np.argmax(m >= pk * 0.01) / sr * 1000), 2),
                mainPeakMs=round(float(np.argmax(m) / sr * 1000), 2))


def build_sfx():
    OUT.mkdir(parents=True, exist_ok=True)
    items = {}

    def save(name, x, source):
        path = OUT / name
        sf.write(path, x, SR_OUT, subtype='PCM_24')
        st = sfx_stats(x, SR_OUT)
        items[name] = dict(file=name, sampleRate=SR_OUT, bitDepth=24, channels=2, **st, source=source)
        log(f'  {name:24s} {st}')

    log('\n== SFX')
    # camera shutter: three single frames from a CC0 DSLR burst recording (after the buffer
    # fills, frames are ~0.65 s apart, so each one is a complete, clean shot)
    src, meta = commons_fetch(COMMONS['shutter'])
    x, sr = decode_any(src)
    srcdesc = dict(type='wikimedia-commons', title=meta['title'], url=meta['page'], fileUrl=meta['url'],
                   license=meta['lic'], author=meta['artist'])
    for name, t, tail in [('sfx-shutter.wav', 5.653, 175), ('sfx-shutter-2.wav', 8.355, 165), ('sfx-shutter-3.wav', 6.962, 215)]:
        seg = cut_shutter(x, sr, t, tail)
        save(name, finish_sfx(seg, sr, fade_in_ms=0.3, fade_out_ms=35), dict(srcdesc, cutAtSec=t))
    # keyboard taps: individual key presses (release clicks excluded) from a public-domain
    # hunt-and-peck recording, high-passed + top softened for a quiet laptop feel
    src, meta = commons_fetch(COMMONS['typing'])
    x, sr = decode_any(src)
    srcdesc = dict(type='wikimedia-commons', title=meta['title'], url=meta['page'], fileUrl=meta['url'],
                   license=meta['lic'], author=meta['artist'], via=meta['credit'][:160])
    for name, t, mx in [('sfx-key-1.wav', 21.043, 75), ('sfx-key-2.wav', 23.067, 75), ('sfx-key-3.wav', 36.145, 75),
                        ('sfx-key-4.wav', 14.298, 75), ('sfx-key-space.wav', 34.119, 120)]:
        seg = cut_key(x, sr, t, mx)
        save(name, finish_sfx(seg, sr, fade_in_ms=0.2, fade_out_ms=18), dict(srcdesc, cutAtSec=t))
    # split-flap: no CC0/PD recording with audio exists on Commons (the CC0 videos are silent,
    # the Solari recordings are CC BY) -> synthesised
    syn = dict(type='synthesized', by='audio/build-audio.py (numpy modal synthesis, fixed seeds)')
    for i, (seed, br, mt) in enumerate([(101, 1.0, 0.45), (202, 0.9, 0.6), (303, 1.1, 0.35), (404, 0.95, 0.75)], 1):
        rng = np.random.default_rng(seed)
        save(f'sfx-flap-{i}.wav', finish_sfx(flap_hit(rng, SR_OUT, bright=br, metal=mt, dur=0.065), SR_OUT, 0.05, 15),
             dict(syn, seed=seed))
    rng = np.random.default_rng(777)
    save('sfx-flap-cascade.wav', finish_sfx(flap_cascade(rng, SR_OUT), SR_OUT, 0.05, 30), dict(syn, seed=777))
    rng = np.random.default_rng(909)
    w = whoosh(rng, SR_OUT)
    save('sfx-whoosh-soft.wav', finish_sfx(w, SR_OUT, fade_in_ms=2, fade_out_ms=60, tighten=False),
         dict(syn, seed=909, note='Commons CC0 candidate "Fuu som.ogg" rejected: mouth-blown hiss peaking 8-10 kHz'))
    (OUT / 'sfx.json').write_text(json.dumps(items, indent=2, ensure_ascii=False))
    # contact sheet
    names = list(items)
    inputs = sum([['-i', str(OUT / nm)] for nm in names], [])
    flt = ''.join(f'[{i}:a]aformat=channel_layouts=mono,apad=whole_dur=0.7,atrim=0:0.7,showwavespic=s=900x90:colors=0x93c47d[w{i}];'
                  for i in range(len(names)))
    flt += ''.join(f'[w{i}]' for i in range(len(names))) + f'vstack=inputs={len(names)},format=rgb24'
    subprocess.run([FFMPEG, '-v', 'error', '-y', *inputs, '-lavfi', flt, '-frames:v', '1', str(OUT / 'sfx-contact-sheet.png')], check=True)
    log('wrote', OUT / 'sfx.json')
    return items


REJECTED = [
    ('File:Canon T50 shutter noise.ogg', 'CC BY-SA 3.0', 'attribution/share-alike licence - not allowed for ads'),
    ('File:D7100 shot sound at Continous High(7fps).wav', 'CC BY-SA 3.0', 'attribution/share-alike licence'),
    ('File:Holga shutter.ogg', 'CC BY-SA 3.0', 'attribution/share-alike licence'),
    ('File:Holga shuttersound.ogg', 'Public domain', 'usable, but a plastic toy-camera click, not the SLR sound wanted'),
    ('File:Auslösegeräusch SLR Serienaufnahme mit AF Schärfepriorität.ogg', 'CC0', 'usable; noisier room tone than the buffer-full burst, kept as a fallback'),
    ('File:VID20240601163749.mp4.webm', 'CC0', 'leaf-shutter (Prontor II) video, quiet + self-timer buzz; not SLR-like'),
    ('File:Split-flap display at German train station.webm', 'CC0', 'video has no audio stream'),
    ('File:München, U-Bahn, Fallblattanzeiger, 1.ogv', 'CC0', 'video has no audio stream'),
    ('Solari board videos at Secaucus Junction / Trenton (2026)', 'CC BY 4.0', 'attribution licence'),
    ('File:Typing on Keychron V1 Ultra (Red Linear Switch).wav', 'CC BY 4.0', 'attribution licence'),
    ('File:Keyboard noise.ogg', 'Public domain', 'usable, but a loud clacky desktop keyboard'),
    ('File:Typing fast.ogg / File:Typing medium speed.ogg', 'Public domain', 'usable; hunt-and-peck has better isolated strokes'),
    ('File:Fuu som.ogg', 'CC0', 'mouth-blown hiss peaking at 8-10 kHz with an abrupt onset; whoosh synthesised instead'),
]


def write_sources():
    beds = json.loads((OUT / 'beds.json').read_text()) if (OUT / 'beds.json').exists() else {}
    sfx = json.loads((OUT / 'sfx.json').read_text()) if (OUT / 'sfx.json').exists() else {}
    L = ['# Audio sources', '',
         'Generated by `audio/build-audio.py` (re-run it to regenerate `audio/out/` and this file).', '',
         '## Licences in one paragraph', '',
         '* **Music beds** are original arrangements made from Apple Loops that ship with GarageBand/Logic '
         '(`/Library/Audio/Apple Loops/Apple/`). Apple\'s software licence lets you use the included Apple Loops '
         'royalty-free in your own original musical compositions and soundtracks, including commercial video; the loops '
         'may not be redistributed on their own (as loops/samples). Each bed layers 5-7 loops with its own arrangement '
         '(entries, drop-outs, filter sweeps, sidechain-style pumping, reverb, EQ), so no loop is used raw.',
         '* **SFX** come from Wikimedia Commons files licensed **CC0** or **public domain** only (no attribution needed), '
         'or are synthesised by the build script (no third-party material).', '',
         '## Music beds (48 kHz / 24-bit stereo, 26 s, -16 LUFS integrated, true peak <= -1.5 dBTP)', '']
    for k, b in beds.items():
        L += [f"### {b['file']} - {b['bpm']} BPM, {b['key']}", '', f"Brief: {b['brief']}.", '',
              '| Loop | Pack | Native tempo / key | Bars (start-end) | Notes |', '|---|---|---|---|---|']
        for l in b['loops']:
            notes = []
            if l.get('label'):
                notes.append(l['label'])
            if l.get('varispeed'):
                v = l['varispeed']
                notes.append(f"varispeed {v['fromBpm']:g} -> {b['bpm']} BPM ({v['semitones']:+} st)")
            regs = ', '.join(f"{r[0]:g}-{'end' if r[1] is None else format(r[1], 'g')}" for r in l['regionsBars'])
            L.append(f"| {l['loop']} | {l['pack']} | {l['loopBpm']:g} BPM / {l['loopKey']} | {regs} | {'; '.join(notes)} |")
        L += ['', 'Sections: ' + ', '.join(f"{s['name']} bar {s['startBar']:g} ({s['startSec']:.2f} s)" for s in b['sections']), '']
    L += ['## Sound effects (48 kHz / 24-bit stereo, peak -3 dBFS, transient within ~1 ms of t=0)', '',
          '| File | Source | Licence | Author | Processing |', '|---|---|---|---|---|']
    for name, it in sfx.items():
        src = it['source']
        if src['type'] == 'wikimedia-commons':
            L.append(f"| {name} | [{src['title'][5:]}]({src['url']}) (cut at {src['cutAtSec']} s) | {src['license']} | "
                     f"{src['author']} | trimmed to one event, high-passed, faded, peak-normalised |")
        else:
            L.append(f"| {name} | synthesised by build script (seed {src.get('seed')}) | n/a (original) | build-audio.py | "
                     f"{src.get('note', 'modal/noise synthesis')} |")
    L += ['', '### Commons candidates checked but not used', '', '| File | Licence | Why not |', '|---|---|---|']
    L += [f'| {t} | {lic} | {why} |' for t, lic, why in REJECTED]
    L += ['', 'Typing source chain: PDSounds.org record #70 ("Typing - Hunt and Peck", teto_yasha, 2007, public domain), '
          'transferred to Commons by Fæ.', '']
    (HERE / 'SOURCES.md').write_text('\n'.join(L))
    log('wrote', HERE / 'SOURCES.md')


if __name__ == '__main__':
    what = sys.argv[1:] or ['beds', 'sfx']
    if 'beds' in what:
        build_beds()
    if 'sfx' in what:
        build_sfx()
    write_sources()
