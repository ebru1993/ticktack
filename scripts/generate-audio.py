#!/usr/bin/env python3
"""Generate neural German speech clips for TickTack (offline PWA)."""

from __future__ import annotations

import asyncio
import hashlib
import json
import re
import sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "audio"
CLIPS = OUT / "clips"
MANIFEST = OUT / "manifest.json"
VOICE = "de-DE-SeraphinaMultilingualNeural"
RATE = "-10%"
CONCURRENCY = 6

BELOW_20 = [
    "null", "ein", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun",
    "zehn", "elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn",
    "achtzehn", "neunzehn",
]
TENS = ["", "", "zwanzig", "dreissig", "vierzig", "fünfzig"]


def cardinal(n: int) -> str:
    if n < 20:
        return BELOW_20[n]
    tens, ones = divmod(n, 10)
    if ones == 0:
        return TENS[tens]
    return f"{'ein' if ones == 1 else BELOW_20[ones]}und{TENS[tens]}"


def face_hour(hour: int) -> int:
    wrapped = ((hour % 12) + 12) % 12
    return 12 if wrapped == 0 else wrapped


def hour_label(hour: int, kind: str) -> str:
    face = face_hour(hour)
    if face == 12:
        return "zwölf"
    if face == 1:
        return "ein" if kind == "uhr" else "eins"
    return cardinal(face)


def fragment(n: int) -> str:
    if n == 1:
        return "eine Minute"
    if n % 5 == 0:
        return cardinal(n)
    return f"{cardinal(n)} Minuten"


def colloquial(hour: int, minute: int) -> str:
    current = hour_label(hour, "nach")
    current_uhr = hour_label(hour, "uhr")
    nxt = hour_label(hour + 1, "nach")
    if minute == 0:
        return f"{current_uhr} Uhr"
    if minute == 15:
        return f"Viertel nach {current}"
    if minute == 30:
        return f"halb {nxt}"
    if minute == 45:
        return f"Viertel vor {nxt}"
    if minute < 30:
        return f"{fragment(minute)} nach {current}"
    return f"{fragment(60 - minute)} vor {nxt}"


def official_parts(hour: int, minute: int) -> list[str]:
    h = "null" if hour == 0 else "ein" if hour == 1 else cardinal(hour)
    if minute == 0:
        return [h, "Uhr"]
    m = "eins" if minute == 1 else cardinal(minute)
    return [h, "Uhr", m]


def day_period(hour: int) -> str:
    if hour < 5 or hour >= 22:
        return "in der Nacht"
    if hour < 11:
        return "am Morgen"
    if hour < 12:
        return "am Vormittag"
    if hour < 13:
        return "am Mittag"
    return "am Nachmittag" if hour < 18 else "am Abend"


STEMS = [
    "Hallo! Lass uns die Uhr lernen.",
    "Hör genau zu. Stell die Zeiger auf",
    "Welche Zeit zeigt die Uhr? Tippe auf die richtige Antwort.",
    "Schau auf die Digitaluhr und stell die Zeiger auf dieselbe Zeit.",
    "Welche Zeit zeigt die Analoguhr? Stell die Zahlen ein.",
    "Welche Zeit zeigt die Uhr? Achte auf Sonne oder Mond, und stell die Zahlen ein.",
    "Es ist",
    "Super! Es ist",
    "Das stimmt noch nicht. Versuch es noch einmal.",
    "Schau noch einmal auf den Stundenzeiger.",
    "Schau noch einmal auf den Minutenzeiger.",
    "Schau, so sieht die richtige Zeit aus. Es ist",
    "Versuch es noch einmal.",
    "So ist es richtig. Es ist",
    "Stell die Zeiger auf",
    "Stell die Zahlen auf",
    "Tippe zuerst auf eine Antwort.",
    "Dieses Level ist noch zu.",
    "Spiel mit der Uhr. Dreh die Zeiger, ich sage dir die Zeit.",
    "Runde geschafft! Ein neuer Sticker für dich.",
    "Runde geschafft! Ein neuer Sticker. Neues Level ist offen!",
    "Volle Stunden",
    "Halbe Stunden",
    "Viertelstunden",
    "5-Minuten-Schritte",
    "Genaue Minuten",
    "24-Stunden-Zeit",
    "Uhr",
]


def slug(text: str) -> str:
    table = str.maketrans("äöüÄÖÜ", "aouAOU")
    s = text.translate(table).replace("ß", "ss").lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    digest = hashlib.sha1(text.encode("utf-8")).hexdigest()[:10]
    if not s:
        return digest
    return f"{s[:72]}-{digest}"


def all_utterances() -> list[str]:
    texts: list[str] = []
    seen: set[str] = set()

    def add(text: str) -> None:
        text = text.strip()
        if text and text not in seen:
            seen.add(text)
            texts.append(text)

    for item in STEMS:
        add(item)
    for hour in range(12):
        for minute in range(60):
            add(colloquial(hour, minute))
    for hour in range(24):
        add(day_period(hour))
        for part in official_parts(hour, 0 if False else 0):
            add(part)
        for minute in range(60):
            for part in official_parts(hour, minute):
                add(part)
    return texts


async def synthesize(text: str, dest: Path, retries: int = 5) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    last_err: Exception | None = None
    for attempt in range(retries):
        try:
            comm = edge_tts.Communicate(text, VOICE, rate=RATE)
            tmp = dest.with_suffix(".part.mp3")
            await comm.save(str(tmp))
            tmp.replace(dest)
            return
        except Exception as err:  # noqa: BLE001
            last_err = err
            await asyncio.sleep(1.2 * (attempt + 1))
    raise RuntimeError(f"failed to synthesize {text!r}: {last_err}")


async def main() -> int:
    CLIPS.mkdir(parents=True, exist_ok=True)
    utterances = all_utterances()
    manifest: dict[str, str] = {}
    jobs: list[tuple[str, Path]] = []
    for text in utterances:
        name = f"{slug(text)}.mp3"
        rel = f"clips/{name}"
        manifest[text] = rel
        dest = OUT / rel
        if dest.exists() and dest.stat().st_size > 400:
            continue
        jobs.append((text, dest))

    print(f"utterances={len(utterances)} to_generate={len(jobs)}", flush=True)
    sem = asyncio.Semaphore(CONCURRENCY)
    done = 0

    async def worker(text: str, dest: Path) -> None:
        nonlocal done
        async with sem:
            await synthesize(text, dest)
            done += 1
            if done % 25 == 0 or done == len(jobs):
                print(f"generated {done}/{len(jobs)}", flush=True)

    if jobs:
        await asyncio.gather(*(worker(text, dest) for text, dest in jobs))

    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    missing = [text for text, rel in manifest.items() if not (OUT / rel).exists()]
    if missing:
        print("MISSING", len(missing), file=sys.stderr)
        return 1
    print("manifest written", MANIFEST, "clips", len(manifest))
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
