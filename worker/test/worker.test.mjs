import test from 'node:test';
import assert from 'node:assert/strict';
import worker, { signToken, verifyToken, checkPurchase } from '../index.js';
import { fakeGumroad, memoryKV, env as mkEnv, PRODUCT } from './mocks.mjs';

const GAME = JSON.stringify({ code: '7Db', quiz: [{ q: 'Q?', a: 'A.' }], words: [{ w: 'adaptation', m: 'm', b: ['Ad', 'Ap'] }] });

function setup() {
  const g = fakeGumroad();
  globalThis.fetch = g.fetchStub;
  const kv = memoryKV([{ key: 'game:7db', value: GAME }]);
  return { g, kv, env: mkEnv(kv) };
}
const ORIGIN = 'https://www.cellyschool.com';
function unlockReq(key, origin = ORIGIN) {
  return new Request('https://unlock.cellyschool.com/unlock', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify({ license_key: key }),
  });
}
function gameReq(slug, token) {
  const h = { Origin: ORIGIN };
  if (token) h.Authorization = 'Bearer ' + token;
  return new Request('https://unlock.cellyschool.com/games/' + slug, { headers: h });
}

test('valid code: returns a signed token, counts one device, and the token opens a paid game', async () => {
  const { g, env } = setup();
  const r = await worker.fetch(unlockReq('VALID-1111-2222-3333'), env);
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('Access-Control-Allow-Origin'), ORIGIN);
  const j = await r.json();
  assert.equal(j.ok, true);
  assert.match(j.token, /^[\w-]+\.[\w-]+$/);
  assert.equal(g.uses['VALID-1111-2222-3333'], 1, 'exactly one use counted');
  assert.deepEqual(g.calls.map((c) => c.inc), [false, true], 'checks first, then counts');
  assert.equal(g.calls[0].pid, PRODUCT);
  const p = await verifyToken(j.token, env.TOKEN_SECRET);
  assert.equal(p.s, 'sale_vali');
  assert.ok(!JSON.stringify(p).includes('@'), 'no email in the token');
  const gr = await worker.fetch(gameReq('7db', j.token), env);
  assert.equal(gr.status, 200);
  assert.equal(await gr.text(), GAME);
});

test('refunded code is refused, and no device is used', async () => {
  const { g, env } = setup();
  const r = await worker.fetch(unlockReq('REFUND-1111-2222-3333'), env);
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { ok: false, reason: 'refunded' });
  assert.equal(g.uses['REFUND-1111-2222-3333'], 0);
});

test('chargebacked code is refused', async () => {
  const { env } = setup();
  const r = await worker.fetch(unlockReq('CHARGE-1111-2222-3333'), env);
  assert.equal(r.status, 200);
  assert.equal((await r.json()).reason, 'refunded');
});

test('too many uses: a code already on 3 devices is refused without counting a 4th', async () => {
  const { g, env } = setup();
  const r = await worker.fetch(unlockReq('FULL-1111-2222-3333'), env);
  assert.equal(r.status, 200);
  assert.equal((await r.json()).reason, 'too_many_devices');
  assert.equal(g.uses['FULL-1111-2222-3333'], 3);
});

test('the 3rd device is allowed, the 4th is refused', async () => {
  const { g, env } = setup();
  for (let i = 1; i <= 3; i++) assert.equal((await worker.fetch(unlockReq('VALID-1111-2222-3333'), env)).status, 200, 'device ' + i);
  const r = await worker.fetch(unlockReq('VALID-1111-2222-3333'), env);
  assert.equal((await r.json()).reason, 'too_many_devices');
  assert.equal(g.uses['VALID-1111-2222-3333'], 3);
});

test('wrong product: Worker configured for another product gets 404 from Gumroad -> not_found', async () => {
  const { env } = setup();
  env.GUMROAD_PRODUCT_ID = 'SOME_OTHER_PRODUCT';
  const r = await worker.fetch(unlockReq('VALID-1111-2222-3333'), env);
  assert.deepEqual(await r.json(), { ok: false, reason: 'not_found' });
});

test('wrong product: a purchase for a different product_id in the answer is refused', () => {
  const body = { success: true, uses: 0, purchase: { product_id: 'OTHER', refunded: false } };
  assert.equal(checkPurchase(body, { GUMROAD_PRODUCT_ID: PRODUCT, MAX_USES: '3' }), 'not_found');
});

test('unknown code -> not_found; junk input -> bad_request', async () => {
  const { env } = setup();
  assert.equal((await (await worker.fetch(unlockReq('NOPE-1111-2222-3333'), env)).json()).reason, 'not_found');
  assert.equal((await (await worker.fetch(unlockReq('x'), env)).json()).reason, 'bad_request');
  assert.equal((await (await worker.fetch(unlockReq('<script>alert(1)</script>'), env)).json()).reason, 'bad_request');
});

test('games: no token 401, forged or tampered token 401, expired token 401, revoked sale 403, unknown slug 404', async () => {
  const { env, kv } = setup();
  assert.equal((await worker.fetch(gameReq('7db'), env)).status, 401);
  const forged = await signToken({ v: 1, s: 'x', iat: 0, exp: 9999999999 }, 'another-secret-0123456789-abcdefghijkl');
  assert.equal((await worker.fetch(gameReq('7db', forged), env)).status, 401);
  const good = await signToken({ v: 1, s: 'sale_1', iat: 0, exp: 9999999999 }, env.TOKEN_SECRET);
  const [body, sig] = good.split('.');
  const evil = Buffer.from(JSON.stringify({ v: 1, s: 'sale_2', iat: 0, exp: 9999999999 })).toString('base64url');
  assert.equal((await worker.fetch(gameReq('7db', evil + '.' + sig), env)).status, 401);
  const old = await signToken({ v: 1, s: 'sale_1', iat: 0, exp: 1 }, env.TOKEN_SECRET);
  assert.equal((await worker.fetch(gameReq('7db', old), env)).status, 401);
  assert.equal((await worker.fetch(gameReq('7db', good), env)).status, 200);
  await kv.put('revoked:sale_1', '1');
  assert.equal((await worker.fetch(gameReq('7db', good), env)).status, 403);
  const other = await signToken({ v: 1, s: 'sale_3', iat: 0, exp: 9999999999 }, env.TOKEN_SECRET);
  assert.equal((await worker.fetch(gameReq('7zz', other), env)).status, 404);
  assert.equal((await worker.fetch(gameReq('7ka', other), env)).status, 404, 'not in KV');
  assert.ok(body);
});

test('CORS: preflight from the site is allowed, other origins get no allow header', async () => {
  const { env } = setup();
  const ok = await worker.fetch(new Request('https://unlock.cellyschool.com/unlock', { method: 'OPTIONS', headers: { Origin: ORIGIN } }), env);
  assert.equal(ok.status, 204);
  assert.equal(ok.headers.get('Access-Control-Allow-Origin'), ORIGIN);
  const bad = await worker.fetch(unlockReq('VALID-1111-2222-3333', 'https://evil.example'), env);
  assert.equal(bad.headers.get('Access-Control-Allow-Origin'), null);
});

test('server misconfigured (no secret) fails closed', async () => {
  const { env } = setup();
  delete env.TOKEN_SECRET;
  const r = await worker.fetch(unlockReq('VALID-1111-2222-3333'), env);
  assert.equal(r.status, 500);
  assert.equal((await r.json()).ok, false);
});
