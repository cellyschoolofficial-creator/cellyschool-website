# Website improvement log

Each weekly review adds a dated entry: what the data showed, what was changed, what to watch next time.

## 2026-11-24 — weekly review (no analytics read)
- **Data:** not collected. This run was in the cloud with no link to the owner's PC, so Chrome (signed in to Umami and Clarity) could not be used. No Umami or Clarity numbers this week.
- **Code checks (done):** rebuilt from `source` (258 files); build matches live `main` apart from five old `celly_voice_*2.mp3` files left in `main/play/*/media` (harmless). Playwright pass over 135 pages at 390 px and 1280 px: no JS errors, no horizontal scroll, no broken internal links. `track.js` is on every page except the two redirect pages.
- **Changed:** nothing. No evidence to act on, and tracking/consent changed on 24 Nov (no banner during testing, PostHog, GA4), so a clean before/after is better.
- **Note:** `/course` calls `umami.track("course-redirect")`, but Umami is not loaded on that page, so the event never fires. Fixing it changes tracking, so it needs the owner's OK.
- **Proposals for owner:** (1) fix the `/course` redirect event (above); (2) turn on "Require this computer" for this scheduled task so it can reach Chrome; (3) traffic action: share one lesson link (e.g. /7aa) with its workbook in a parent/tutor group this week.
- **Next week:** first real Umami/Clarity read. Compare against the 24 Nov tracking change; check that Clarity sessions rise now there is no banner.

## 2026-11-22 — baseline
- Umami + Clarity (consent-gated) went live 22 Nov. No data yet.
