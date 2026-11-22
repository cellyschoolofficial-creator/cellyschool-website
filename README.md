# Celly School website — source (branch `source`)
The live site is the `main` branch (build output, served by GitHub Pages at www.cellyschool.com).

Rebuild and publish:
1. `python3 src/extract.py` (only if lesson data/video dates change) → `data/lessons.json`
2. `python3 src/build.py` → `build/`
3. Copy `build/.` over a checkout of `main`, commit, push.

Analytics: Umami (cookieless counts, ID in `src/build.py` UMAMI_ID), Microsoft Clarity (replays after consent, CLARITY_ID), Cloudflare Web Analytics. Tracking code: `static/track.js`.
Improvement log: `IMPROVEMENTS.md`.
