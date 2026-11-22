# Paid games: what was built and how to switch it on

Branch: `games-paywall`. Nothing here is live. `main` (the live site) and `source` are unchanged.

## What was built

**1. Games for every lesson.** Lessons 7Aa–7Ae, 7Ba–7Be and 7Ca had no games, because their scripts are not in the format `src/extract.py` reads. `data/practice-extra.json` now gives each of them:
- key words with syllable taps and meanings
- 6–7 recall questions
- memory tricks and three big ideas

All of it comes only from that lesson's own workbook, website key-facts text and (for 7Ca) the voice script. `build.py` uses it only for lessons that have no data of their own, so running `extract.py` again does not lose it. These lesson pages now also show the Key words, Memory tricks, Big ideas and Quick quiz sections, like the other lessons do.

**2. A paywall for the games, built but switched OFF.** It is controlled by one flag in `src/build.py`:

```python
PAYWALL = False
```

- **With `False`** the site builds exactly as it does today. Every HTML page is byte-for-byte the same as a build of `source`, apart from the 11 lessons above and `/play`, which change only because they now have games. `practice.js` was changed so it can start again after unlocking, but it behaves the same.
- **With `True`:**
  - **Free:** the games for the first lesson of each unit (7Aa, 7Ba, 7Ca, 7Da, 7Ea, 7Fa, 7Ga, 7Ha, 7Ia, 7Ja, 7Ka, 7La).
  - **Paid:** the games for the other 48 lessons. Their pages contain **no game data**. The Practise box shows a lock panel instead: "Unlock all Year 7 games", a "Get an unlock code" button (goes to `GUMROAD_URL`) and an "I have a code" box.
  - **Always free:** videos, workbooks, key words and the quick quiz.
  - **Unlocking:** the code goes to the unlock Worker (`UNLOCK_API`). The Worker checks it with Gumroad and sends back a signed token. The browser saves the token in `localStorage` (`cs-unlock`). After that, each paid lesson gets its games from the Worker (`GET /games/<slug>`).
  - **`/play`:** shows a "Free" or "🔒 Unlock" label on each lesson, plus a short note. The labels are hidden once the device is unlocked.
  - **`/privacy`:** gets an extra paragraph about unlock codes, Gumroad and the token.
  - **Analytics (Umami):** `unlock-view`, `unlock-click`, `unlock-success` and `unlock-fail` (with a reason).
  - **Unchanged:** stars, sound and "Easier reading" work as before.

**3. Thinkific links.** Each lesson's games have a fixed link: `https://www.cellyschool.com/<code in lower case>#practice`, for example `https://www.cellyschool.com/7db#practice`. Use this as the "Play the games" link in each Thinkific lesson. It opens the lesson and scrolls to the games. On a paid lesson it scrolls to the lock panel, or to the games if the device is already unlocked.

**4. The unlock Worker** (`worker/`), for Cloudflare Workers:
- **`POST /unlock` `{license_key}`** checks the code with Gumroad (`POST https://api.gumroad.com/v2/licenses/verify` with `product_id` and `license_key`):
  - First it checks without counting a device. It refuses codes that are unknown, for another product, refunded, chargebacked or disputed, and codes already used on `MAX_USES` (3) devices.
  - Then it counts this device (`increment_uses_count=true`) and checks the count again.
  - On success it returns an HMAC-SHA256 token signed with the `TOKEN_SECRET` secret. The token holds only the Gumroad sale id, the date and an expiry date (2 years). It holds no name and no email.
- **`GET /games/<slug>`** needs `Authorization: Bearer <token>`. It returns the game JSON from the KV namespace `GAMES` (key `game:<slug>`). It refuses a token whose sale id has a `revoked:<sale_id>` key in KV.
- **CORS:** only `ALLOWED_ORIGINS` (www.cellyschool.com) may call it.
- **`wrangler.toml`:** contains placeholders only. The secret is never in git.
- **`src/export_games.py`:** writes the 48 paid lessons' game JSON to `worker/.games/paid-games.json` (git-ignored), ready for `wrangler kv bulk put`.

## Tests (all run on this branch)
- **Flag off:** `diff -r` against a build of the untouched `source` branch. Only `practice.js` differs (it can now restart, same behaviour). With the new 7A/7B/7Ca data, the only other changes are those 11 lesson pages and `/play`.
- **Worker unit tests (11 passing):** `cd worker && npm test` (Node 18+, no installs needed). They use mocked Gumroad answers: valid, refunded, chargebacked, too many uses (3rd device OK, 4th refused), wrong product (Gumroad 404, and a product_id that does not match), unknown or junk codes, and forged, tampered, expired or revoked tokens. They also cover CORS and a missing secret.
- **Browser test (48 checks, at 390 px and desktop):** `worker/test/e2e.mjs`. It runs against the PAYWALL build and `worker/dev-mock.mjs`, which is the real Worker code with a fake Gumroad. It checks:
  - free 7Da plays its games
  - paid 7Db has no game JSON and shows the lock panel
  - wrong and refunded codes show a friendly message
  - the right code opens the games, and the token then opens other paid lessons
  - a broken token is dropped and the lock panel comes back
  - there are no console errors, apart from the one expected 401 log from that broken-token check
  - the page has no sideways scrolling

  To run it:
  ```
  CS_PAYWALL=1 CS_UNLOCK_API=http://localhost:8787 python3 src/build.py
  python3 src/export_games.py
  (cd build && python3 -m http.server 8000) &  node worker/dev-mock.mjs &
  node worker/test/e2e.mjs
  ```
  (`CS_PAYWALL` and `CS_UNLOCK_API` are only for test builds. The real switch is the flag in `build.py`.)

## What you (the owner) need to do to switch it on

1. **Gumroad: create the product.**
   - Make a new digital product, for example "Celly School – Year 7 games unlock", as a one-off payment (not a membership).
   - Set your price.
   - In the product's content settings, turn on **"Generate a unique license key per sale"**.
   - Add a line to the receipt, for example: "Open any Celly School lesson, find the Practise box, press 'I have a code' and paste your key."
   - Send me (a) the product's **product ID** (shown with the license key setting; it is not a secret) and (b) the product page link. The link becomes `GUMROAD_URL`.
2. **Cloudflare: approve a Worker and a KV namespace** in your Cloudflare account. On your computer, in `worker/`, you run:
   - `npx wrangler login` (you sign in yourself)
   - `npx wrangler kv namespace create GAMES`, then paste the printed id into `wrangler.toml`
   - put the Gumroad product ID into `wrangler.toml` (`GUMROAD_PRODUCT_ID`)
   - `npx wrangler secret put TOKEN_SECRET`, and paste a long random string, for example from `openssl rand -base64 48`. Type it only there and keep it private.
   - `python3 ../src/export_games.py`, then `npx wrangler kv bulk put --binding GAMES --remote .games/paid-games.json`
   - `npx wrangler deploy`
3. **DNS: add the route `unlock.cellyschool.com`.** If cellyschool.com's DNS is on Cloudflare, `wrangler deploy` creates it from `wrangler.toml` (`custom_domain = true`). If the DNS is somewhere else, see the open question below.
4. **Switch on:** in `src/build.py` set `GUMROAD_URL`, then `PAYWALL = True`. Build and publish as usual. Then try it once with a real code. A 100% discount code on Gumroad lets you "buy" it for free.
5. **When lessons change:** run `src/export_games.py` and `wrangler kv bulk put` again, so the Worker has the new games.

## Known limits (honest list)
- **The facts are still free.** The key words, meanings and quick-quiz questions are free on every lesson page, as you decided. Only the interactive games are locked. Someone determined could copy the facts. The game data itself is not in the public HTML or in the repo.
- **One token per browser.** Clearing site data, private browsing or a new browser needs the code again, and that uses up one of the 3 devices. A family that runs out has to email you. There is no "reset devices" button yet. Gumroad's licence API has a call to lower the count, and I can add a small script for it if you want.
- **Refunds after unlocking:** the token keeps working until it expires (2 years). To stop it sooner, add a KV key `revoked:<sale_id>`. Automatic revoking from a Gumroad refund ping is not built.
- **Tokens can be shared.** A token is not tied to one device, so someone could copy it to another browser. This is normal for a low-price unlock.
- **No rate limit in the Worker itself.** I recommend one Cloudflare rate-limiting rule on `unlock.cellyschool.com/unlock`, for example 10 requests per minute per IP. Wrong codes are cheap, but this stops guessing.
- **Internet needed.** Paid games need the internet the first time each lesson is opened. After that, the browser keeps them for about an hour.
- **Free lessons are fixed.** The free lessons are always the first lesson of each unit in `lessons.json`.
- **Words left out of 7B on purpose.** For 7Bb and 7Bc I left some workbook words out of the games, to keep them gentle: intercourse, ejaculation, circumcision, prostate, and vagina as a separate card (the "Orange Owls Use Cosy Vans" trick is described as "the female organs, from the ovary to the outside"). Tell me if you want them added.
