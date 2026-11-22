// Test helpers: a fake Gumroad license API and an in-memory KV namespace.
export const PRODUCT = 'TEST_PRODUCT_ID';

function purchase(extra = {}) {
  return {
    product_id: PRODUCT, sale_id: 'sale_' + (extra.sale || '1'), email: 'buyer@example.com',
    refunded: false, chargebacked: false, disputed: false,
    subscription_ended_at: null, subscription_cancelled_at: null, subscription_failed_at: null,
    ...extra,
  };
}

/* Fake licences:
   VALID-1111-2222-3333   fine, 0 uses so far
   REFUND-1111-2222-3333  refunded
   CHARGE-1111-2222-3333  chargebacked
   FULL-1111-2222-3333    already used on 3 devices
   anything else          does not exist for this product (Gumroad answers 404)
   Wrong product id in the request also gives 404, like Gumroad. */
export function fakeGumroad() {
  const uses = { 'VALID-1111-2222-3333': 0, 'REFUND-1111-2222-3333': 0, 'CHARGE-1111-2222-3333': 1, 'FULL-1111-2222-3333': 3 };
  const calls = [];
  async function fetchStub(url, init = {}) {
    const u = String(url);
    if (!u.startsWith('https://api.gumroad.com/v2/licenses/verify')) throw new Error('unexpected fetch ' + u);
    const f = new URLSearchParams(init.body);
    const key = f.get('license_key'), pid = f.get('product_id'), inc = f.get('increment_uses_count') !== 'false';
    calls.push({ key, pid, inc });
    const notFound = () => new Response(JSON.stringify({ success: false, message: 'That license does not exist for the provided product.' }), { status: 404 });
    if (pid !== PRODUCT || !(key in uses)) return notFound();
    if (inc) uses[key] += 1;
    const p = key.startsWith('REFUND') ? purchase({ refunded: true, sale: 'r' })
      : key.startsWith('CHARGE') ? purchase({ chargebacked: true, sale: 'c' })
      : purchase({ sale: key.slice(0, 4).toLowerCase() });
    return new Response(JSON.stringify({ success: true, uses: uses[key], purchase: p }), { status: 200 });
  }
  return { fetchStub, calls, uses };
}

export function memoryKV(rows = []) {
  const m = new Map(rows.map((r) => [r.key, r.value]));
  return { get: async (k) => (m.has(k) ? m.get(k) : null), put: async (k, v) => { m.set(k, v); }, _m: m };
}

export function env(kv) {
  return {
    GUMROAD_PRODUCT_ID: PRODUCT, MAX_USES: '3', TOKEN_SECRET: 'test-secret-0123456789-abcdefghijklmnop',
    ALLOWED_ORIGINS: 'https://www.cellyschool.com,http://localhost:8000', GAMES: kv,
  };
}
