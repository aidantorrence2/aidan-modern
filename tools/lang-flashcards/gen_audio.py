#!/usr/bin/env python3
"""Generate bundled voice clips for every card with Microsoft neural voices (free, via edge-tts).

Portuguese: pt-BR-AntonioNeural (male), slightly slowed for learners.
English:    en-US-AndrewNeural (male).

Files: app/src/main/assets/audio/{p,e}_<sha1(text)[:16]>.mp3 — the app hashes the same raw strings.
Usage: pip install edge-tts && python3 gen_audio.py   (behind a proxy: HTTPS_PROXY + SSL_CERT_FILE)
Skips clips that already exist, so re-running after editing the deck only fetches new ones.
"""
import asyncio, hashlib, json, os, re, sys
import edge_tts

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, "app/src/main/assets")
OUT = os.path.join(ASSETS, "audio")
PT_VOICE, PT_RATE = "pt-BR-AntonioNeural", "-10%"
EN_VOICE, EN_RATE = "en-US-AndrewNeural", "+0%"
PROXY = os.environ.get("HTTPS_PROXY") or None


def key(s):
    return hashlib.sha1(s.encode("utf-8")).hexdigest()[:16]


def spoken_en(s):
    """'the (f.) / to' -> 'the, or to'. Drop grammar notes in brackets, read slashes as 'or'."""
    s = re.sub(r"\([^)]*\)", "", s)
    s = re.sub(r"\s*/\s*", ", or ", s)
    return re.sub(r"\s+", " ", s).strip(" ,") or s


async def one(sem, text, voice, rate, path):
    if os.path.exists(path) and os.path.getsize(path) > 0:
        return
    async with sem:
        for attempt in range(5):
            try:
                await edge_tts.Communicate(text, voice, rate=rate, proxy=PROXY).save(path + ".tmp")
                if os.path.getsize(path + ".tmp") > 0:
                    os.replace(path + ".tmp", path)
                    return
            except Exception as e:
                err = e
            await asyncio.sleep(2 ** attempt)
        print("FAILED", voice, text, err if "err" in dir() else "", file=sys.stderr)


async def main():
    os.makedirs(OUT, exist_ok=True)
    jobs = {}
    for f in sorted(os.listdir(ASSETS)):
        if not f.endswith(".json"):
            continue
        deck = json.load(open(os.path.join(ASSETS, f), encoding="utf-8"))
        for lv in deck["levels"]:
            for front, back in lv["words"] + lv.get("phrases", []):
                jobs[os.path.join(OUT, "p_" + key(front) + ".mp3")] = (front, PT_VOICE, PT_RATE)
                jobs[os.path.join(OUT, "e_" + key(back) + ".mp3")] = (spoken_en(back), EN_VOICE, EN_RATE)
    sem = asyncio.Semaphore(20)
    tasks = [one(sem, t, v, r, p) for p, (t, v, r) in jobs.items()]
    done = 0
    for coro in asyncio.as_completed(tasks):
        await coro
        done += 1
        if done % 250 == 0:
            print(done, "/", len(tasks), flush=True)
    keep = set(jobs)
    for f in os.listdir(OUT):  # remove clips no longer in any deck
        p = os.path.join(OUT, f)
        if p not in keep:
            os.remove(p)
    print("clips:", len(jobs))


asyncio.run(main())
