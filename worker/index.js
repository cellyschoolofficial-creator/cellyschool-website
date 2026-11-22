/* Celly School unlock Worker (Cloudflare Workers, ES module).

   POST /unlock          {"license_key": "..."}  ->  {"ok": true, "token": "..."}  or  {"ok": false, "reason": "..."}
   GET  /games/<slug>    Authorization: Bearer <token>  ->  the lesson's game JSON (from KV key "game:<slug>")
   GET  /health          -> {"ok": true}

   Settings (wrangler.toml [vars]):   GUMROAD_PRODUCT_ID, MAX_USES, ALLOWED_ORIGINS
   Secret (wrangler secret put):      TOKEN_SECRET   (a long random string; never in git)
   KV binding:                        GAMES          (keys "game:<slug>", optional "revoked:<sale_id>")
*/

const GUMROAD_VERIFY = 'https://api.gumroad.com/v2/licenses/verify';
const TOKEN_DAYS = 730; // a token lasts two years on a device, then the code is typed again

const enc = new TextEncoder();

function b64url(bytes) {
  let s = '';
  const a = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < a.length; i++) s += String.fromCharCode(a[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(str) {
  const s = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4);
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(secret) {
  if (!secret || secret.length < 32) throw new Error('TOKEN_SECRET missing or too short');
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function signToken(payload, secret) {
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(body));
  return body + '.' + b64url(sig);
}

export async function verifyToken(token, secret, now = Date.now()) {
  if (typeof token !== 'string' || token.length > 2048) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  let ok = false;
  try {
    ok = await crypto.subtle.verify('HMAC', await hmacKey(secret), b64urlDecode(parts[1]), enc.encode(parts[0]));
  } catch (e) { return null; }
  if (!ok) return null;
  let p;
  try { p = JSON.parse(new TextDecoder().decode(b64urlDecode(parts[0]))); } catch (e) { return null; }
  if (!p || p.v !== 1 || typeof p.exp !== 'number' || p.exp * 1000 < now) return null;
  return p;
}

async function gumroadVerify(env, key, increment) {
  const form = new URLSearchParams();
  form.set('product_id', env.GUMROAD_PRODUCT_ID);
  form.set('license_key', key);
  form.set('increment_uses_count', increment ? 'true' : 'false');
  const r = await fetch(GUMROAD_VERIFY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });
  let j = null;
  try { j = await r.json(); } catch (e) { j = null; }
  return { status: r.status, body: j };
}

/* Decide whether a Gumroad verify answer may unlock. Returns null when fine, or a reason. */
export function checkPurchase(body, env, { afterIncrement = false } = {}) {
  if (!body || body.success !== true || !body.purchase) return 'not_found';
  const p = body.purchase;
  if (p.product_id && env.GUMROAD_PRODUCT_ID && p.product_id !== env.GUMROAD_PRODUCT_ID) return 'not_found';
  if (p.refunded || p.chargebacked || p.disputed) return 'refunded';
  if (p.subscription_ended_at || p.subscription_cancelled_at || p.subscription_failed_at) return 'refunded';
  const max = parseInt(env.MAX_USES || '3', 10);
  const uses = Number(body.uses || 0);
  // Before counting this device: refuse if all the devices are already used.
  // After counting it: uses now includes this device, so it may equal max.
  if (afterIncrement ? uses > max : uses >= max) return 'too_many_devices';
  return null;
}

function corsHeaders(req, env) {
  const origin = req.headers.get('Origin') || '';
  const allowed = String(env.ALLOWED_ORIGINS || 'https://www.cellyschool.com').split(',').map((s) => s.trim()).filter(Boolean);
  const h = { 'Vary': 'Origin' };
  if (allowed.includes(origin)) {
    h['Access-Control-Allow-Origin'] = origin;
    h['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
    h['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    h['Access-Control-Max-Age'] = '86400';
  }
  return h;
}

function json(obj, status, req, env, extra = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...corsHeaders(req, env), ...extra },
  });
}

async function handleUnlock(req, env) {
  let body = null;
  try { body = await req.json(); } catch (e) { body = null; }
  const key = body && typeof body.license_key === 'string' ? body.license_key.trim() : '';
  if (key.length < 8 || key.length > 100 || !/^[A-Za-z0-9-]+$/.test(key)) {
    return json({ ok: false, reason: 'bad_request' }, 200, req, env);
  }
  if (!env.GUMROAD_PRODUCT_ID || !env.TOKEN_SECRET) return json({ ok: false, reason: 'server' }, 500, req, env);

  // 1) check without using up a device
  let g = await gumroadVerify(env, key, false);
  if (g.status >= 500 || (!g.body && g.status !== 404)) return json({ ok: false, reason: 'server' }, 502, req, env);
  // User-facing refusals are 200 + ok:false, so the browser console stays clean for families.
  let why = checkPurchase(g.body, env);
  if (why) return json({ ok: false, reason: why }, 200, req, env);

  // 2) count this device
  g = await gumroadVerify(env, key, true);
  if (!g.body) return json({ ok: false, reason: 'server' }, 502, req, env);
  why = checkPurchase(g.body, env, { afterIncrement: true });
  if (why) return json({ ok: false, reason: why }, 200, req, env);

  const p = g.body.purchase;
  const now = Math.floor(Date.now() / 1000);
  // Only the sale id goes in the token: no name, no email.
  const token = await signToken({ v: 1, s: String(p.sale_id || p.id || ''), iat: now, exp: now + TOKEN_DAYS * 86400 }, env.TOKEN_SECRET);
  return json({ ok: true, token }, 200, req, env);
}

async function handleGame(req, env, slug) {
  if (!/^7[a-l][a-e]$/.test(slug)) return json({ ok: false, reason: 'not_found' }, 404, req, env);
  const auth = req.headers.get('Authorization') || '';
  const m = auth.match(/^Bearer\s+(.+)$/);
  if (!m) return json({ ok: false, reason: 'no_token' }, 401, req, env);
  let p = null;
  try { p = await verifyToken(m[1], env.TOKEN_SECRET); } catch (e) { p = null; }
  if (!p) return json({ ok: false, reason: 'bad_token' }, 401, req, env);
  if (p.s && env.GAMES && (await env.GAMES.get('revoked:' + p.s))) return json({ ok: false, reason: 'revoked' }, 403, req, env);
  const data = env.GAMES ? await env.GAMES.get('game:' + slug) : null;
  if (!data) return json({ ok: false, reason: 'not_found' }, 404, req, env);
  return new Response(data, {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, max-age=3600', ...corsHeaders(req, env) },
  });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(req, env) });
    try {
      if (url.pathname === '/unlock' && req.method === 'POST') return await handleUnlock(req, env);
      const gm = url.pathname.match(/^\/games\/([a-z0-9]+)$/);
      if (gm && req.method === 'GET') return await handleGame(req, env, gm[1]);
      if (url.pathname === '/health') return json({ ok: true }, 200, req, env);
      return json({ ok: false, reason: 'not_found' }, 404, req, env);
    } catch (e) {
      return json({ ok: false, reason: 'server' }, 500, req, env);
    }
  },
};
