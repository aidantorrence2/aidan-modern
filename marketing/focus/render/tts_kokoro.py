#!/usr/bin/env python3
"""Kokoro TTS (Apache-2.0, runs on CPU). Usage: tts_kokoro.py "text" out.wav [voice]
Needs: pip install kokoro soundfile  (and espeak-ng); first run downloads the model
from huggingface.co (hexgrad/Kokoro-82M) — that host must be allowed in the environment."""
import sys
import numpy as np
import soundfile as sf
from kokoro import KPipeline

text, out = sys.argv[1], sys.argv[2]
voice = sys.argv[3] if len(sys.argv) > 3 else "af_heart"
pipe = KPipeline(lang_code="a")  # American English
audio = np.concatenate([a for _, _, a in pipe(text, voice=voice, speed=1.05)])
sf.write(out, audio, 24000)
