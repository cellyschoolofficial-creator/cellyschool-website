// Browser test of the paid-games flow (needs Playwright).
//   CS_PAYWALL=1 CS_UNLOCK_API=http://localhost:8787 python3 src/build.py
//   python3 src/export_games.py
//   (cd build && python3 -m http.server 8000) &   node worker/dev-mock.mjs &
//   node worker/test/e2e.mjs
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const SITE = process.env.SITE || 'http://localhost:8000';
const SHOTS = process.env.SHOTS || new URL('../../shots/', import.meta.url).pathname;
fs.mkdirSync(SHOTS, { recursive: true });
const problems = [];
let passed = 0;
function ok(cond, msg) { if (cond) { passed++; console.log('  ok  ' + msg); } else { problems.push(msg); console.log('  FAIL ' + msg); } }

const browser = await chromium.launch();
async function newPage(viewport) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  // No outside network in tests: answer external hosts (analytics, YouTube thumbnails, Gumroad) with empty 200s.
  await ctx.route(/^https?:\/\/(?!localhost)/, (r) => r.fulfill({ status: 200, body: '', contentType: r.request().resourceType() === 'script' ? 'text/javascript' : 'text/plain' }));
  await ctx.addInitScript(() => { window.__ev = []; window.umami = { track: (n, d) => window.__ev.push(n) }; try { localStorage.setItem('cs-consent', 'no'); } catch (e) {} }); // consent bar off so it does not cover screenshots
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console error on ' + page.url() + ': ' + m.text()); });
  page.on('pageerror', (e) => problems.push('page error on ' + page.url() + ': ' + e.message));
  return { ctx, page };
}
const ev = (page) => page.evaluate(() => window.__ev.slice());

for (const [label, viewport] of [['390', { width: 390, height: 844 }], ['desktop', { width: 1280, height: 900 }]]) {
  console.log(`\n== viewport ${label}`);
  const { ctx, page } = await newPage(viewport);

  // 1) free lesson plays its games
  await page.goto(SITE + '/7da.html#practice');
  await page.waitForSelector('#practice:not([hidden]) .ptabs');
  ok(await page.locator('.lockcard').count() === 0, '7Da (free): no lock panel');
  ok((await page.locator('.ptab').allTextContents()).join('|') === 'Recall quiz|Match the words|Tap the beats', '7Da: three game tabs');
  await page.click('text=Show answer');
  await page.click('text=✓ I knew it');
  ok(/Question 2 of/.test(await page.locator('.pstep').textContent()), '7Da: recall quiz moves on');
  await page.click('.ptab[data-m="beats"]');
  const nb = await page.locator('.pbeat').count();
  for (let i = 0; i < nb; i++) await page.click('.ptap');
  ok(await page.locator('.pbeat.on').count() === nb && nb > 1, `7Da: beat tap lights all ${nb} beats`);
  await page.locator('#practice').screenshot({ path: `${SHOTS}free-7da-${label}.png` });

  // 1b) a free lesson that only got data in this change
  await page.goto(SITE + '/7ba.html');
  await page.waitForSelector('#practice:not([hidden]) .ptabs');
  ok(true, '7Ba (free, new data): games show');

  // 2) paid lesson: lock panel, no game data in HTML
  const raw = await (await page.request.get(SITE + '/7db.html')).text();
  ok(!raw.includes('practice-data') && !raw.includes('"words":') && !raw.includes('"quiz":'), '7Db (paid): no game JSON in the HTML');
  await page.goto(SITE + '/7db.html#practice');
  await page.waitForSelector('.lockcard');
  ok(await page.locator('.lockcard').isVisible(), '7Db: lock panel visible');
  ok(await page.locator('.lockcard h3').textContent() === 'Unlock all Year 7 games', '7Db: lock heading');
  ok(await page.locator('#quiz').isVisible(), '7Db: quick quiz still free and visible');
  ok(await page.locator('.ptabs').count() === 0, '7Db: no games before unlocking');
  ok((await ev(page)).includes('unlock-view'), 'event unlock-view');
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  ok(sw <= viewport.width, `no sideways scroll (scrollWidth ${sw})`);
  await page.locator('#practice').screenshot({ path: `${SHOTS}paid-7db-locked-${label}.png` });
  if (label === '390') await page.screenshot({ path: `${SHOTS}paid-7db-page-${label}.png`, fullPage: false });

  // buy button is tracked (navigation stopped for the test)
  await page.evaluate(() => document.querySelector('[data-unlock-buy]').addEventListener('click', (e) => e.preventDefault()));
  await page.click('[data-unlock-buy]');
  ok((await ev(page)).includes('unlock-click'), 'event unlock-click');

  // 3) wrong code
  await page.fill('.unlockrow input', 'NOPE-1111-2222-3333');
  await page.click('.unlockrow button');
  await page.waitForFunction(() => /could not find/.test(document.querySelector('.unlockmsg').textContent));
  ok((await ev(page)).includes('unlock-fail'), 'wrong code: friendly message + event unlock-fail');
  await page.locator('#practice').screenshot({ path: `${SHOTS}paid-7db-wrongcode-${label}.png` });

  // refunded code
  await page.fill('.unlockrow input', 'REFUND-1111-2222-3333');
  await page.click('.unlockrow button');
  await page.waitForFunction(() => /refunded/.test(document.querySelector('.unlockmsg').textContent));
  ok(true, 'refunded code: refused with message');

  // 4) right code -> games open
  await page.fill('.unlockrow input', 'VALID-1111-2222-3333');
  await page.click('.unlockrow button');
  await page.waitForSelector('#practice .ptabs');
  ok((await ev(page)).includes('unlock-success'), 'event unlock-success');
  ok(await page.locator('.lockcard').count() === 0, 'lock panel gone after unlock');
  const tok = await page.evaluate(() => localStorage.getItem('cs-unlock'));
  ok(/^[\w-]+\.[\w-]+$/.test(tok || ''), 'token saved in localStorage');
  ok(!(await page.locator('#quiz').isVisible()), 'quick quiz folds into the recall game, as on free lessons');
  await page.click('.ptab[data-m="match"]');
  await page.waitForSelector('.popt');
  ok(await page.locator('.popt').count() >= 3, 'paid 7Db: word match playable');
  await page.locator('#practice').screenshot({ path: `${SHOTS}paid-7db-unlocked-${label}.png` });

  // 5) another paid lesson opens straight away with the saved token
  await page.goto(SITE + '/7ab.html#practice');
  await page.waitForSelector('#practice .ptabs');
  ok(await page.locator('.lockcard').count() === 0, '7Ab (paid, new data): opens with saved token');
  await page.goto(SITE + '/play.html');
  ok(await page.locator('[data-plock]:visible').count() === 0, 'play page: lock chips hidden once unlocked');

  // 6) bad token is dropped and the panel comes back
  await page.evaluate(() => localStorage.setItem('cs-unlock', 'aaa.bbb'));
  await page.goto(SITE + '/7dc.html');
  await page.waitForFunction(() => /needs the code again/.test((document.querySelector('.unlockmsg') || {}).textContent || ''));
  ok(await page.evaluate(() => localStorage.getItem('cs-unlock')) === null, 'bad token removed, lock panel shown again');
  await ctx.close();
}

// play page before unlocking
{
  const { ctx, page } = await newPage({ width: 390, height: 844 });
  await page.goto(SITE + '/play.html');
  ok(await page.locator('[data-plock]:visible').count() === 48, 'play page: 48 paid lessons show the lock chip');
  await page.locator('.subj').nth(1).screenshot({ path: `${SHOTS}play-390.png` });
  await page.goto(SITE + '/privacy.html');
  ok(await page.locator('text=Unlock codes for the games').count() === 1, 'privacy page: unlock paragraph');
  await ctx.close();
}

await browser.close();
// The one expected browser log: the deliberately broken token on /7dc gets a 401 from the Worker.
const real = problems.filter((p) => !(p.startsWith('console error on ' + SITE + '/7dc.html') && /status of 401/.test(p)));
console.log(`\n${passed} checks passed, ${real.length} problems (${problems.length - real.length} expected 401 log from the broken-token check)`);
problems.forEach((p) => console.log('  - ' + p));
process.exit(real.length ? 1 : 0);
