/* Celly School · progress per child, and the same family on every device (Nov 2026).
   CSProg: progress saved in this browser, one set per child (localStorage "cs_progress3").
   CSSync: when a parent links a device with a 6-digit email code, the children's names, the school's
   unit order and each child's progress are kept the same on all their linked devices.
   A linked device keeps a private token; without it nothing is sent. */
(function () {
  var EP = 'https://script.google.com/macros/s/AKfycbwYsiK2ZrKioF6k0YO_y_m_GhEVFV4ZkxaXX4NvWdqmMY5pcNaCRiwAKmNf4UgOME8DKQ/exec';
  var KEY = 'cs_progress3';
  function lsGet(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function fam() { return window.CSFamily ? window.CSFamily.get() : lsGet('cs_family'); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]; }); }

  /* ---------- progress per child ---------- */
  function store() {
    var s = lsGet(KEY);
    if (!s) {
      s = {cur: '', kids: {}};
      var old = lsGet('cs_progress2');          // the earlier one-per-device progress becomes this device's first child
      if (old && (old.lessons || old.games)) s.kids['_'] = {lessons: old.lessons || {}, games: old.games || {}, last: old.last || null};
    }
    s.kids = s.kids || {};
    return s;
  }
  function kid() {
    var s = store(), f = fam(), kids = (f && f.kids) || [];
    if (s.cur && (kids.indexOf(s.cur) >= 0 || (!kids.length && s.cur === '_'))) return s.cur;
    return kids[0] || '_';
  }
  function blank() { return {lessons: {}, games: {}, last: null}; }
  window.CSProg = {
    kid: kid,
    setKid: function (name) {
      var s = store(); name = name || '_';
      if (s.cur === name) return;
      // the first named child takes over progress made before any names were set up
      if (name !== '_' && !s.kids[name] && s.kids['_']) { s.kids[name] = s.kids['_']; delete s.kids['_']; }
      s.cur = name; lsSet(KEY, s);
    },
    get: function () { var s = store(), k = kid(); return JSON.parse(JSON.stringify(s.kids[k] || blank())); },
    put: function (obj) { var s = store(), k = kid(); s.kids[k] = obj; s.cur = k; lsSet(KEY, s); CSSync.soon(); },
    update: function (fn) { var o = this.get(); fn(o); this.put(o); },
    all: function () { return store().kids; }
  };

  /* ---------- sync with the parent's email ---------- */
  var timer = null;
  function post(body) {
    return fetch(EP, {method: 'POST', headers: {'Content-Type': 'text/plain;charset=utf-8'}, body: JSON.stringify(body)})
      .then(function (r) { return r.json(); });
  }
  function device() {
    var ua = navigator.userAgent || '';
    return (/iPad|Tablet/i.test(ua) ? 'tablet' : /Mobi|iPhone|Android/i.test(ua) ? 'phone' : 'computer') + ' · ' +
      (/Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'browser');
  }
  function state() {
    var f = fam() || {}, o = lsGet('cs_order');
    return {kids: f.kids || [], order: o && o.t ? o : null, progress: store().kids};
  }
  function apply(st, email, token) {
    if (!st) return;
    var f = fam() || {};
    var nf = {email: email || f.email, kids: st.kids && st.kids.length ? st.kids : (f.kids || []), token: token || f.token};
    if (window.CSFamily) window.CSFamily.save(nf); else lsSet('cs_family', nf);
    var lo = lsGet('cs_order');
    if (st.order && (!lo || (+st.order.t || 0) >= (+lo.t || 0))) lsSet('cs_order', st.order);
    var s = store(); s.kids = st.progress || s.kids; lsSet(KEY, s);
    try { sessionStorage.setItem('cs_sync_t', String(Date.now())); } catch (e) {}
  }
  var CSSync = window.CSSync = {
    linked: function () { var f = fam(); return !!(f && f.token); },
    soon: function () { if (!CSSync.linked()) return; clearTimeout(timer); timer = setTimeout(CSSync.sync, 2500); },
    sync: function () {
      var f = fam(); if (!f || !f.token) return Promise.resolve(false);
      return post({type: 'sync', token: f.token, state: state()}).then(function (r) {
        if (r && r.ok) { apply(r.state, r.email, f.token); return true; }
        if (r && r.why === 'token') { var g = fam(); delete g.token; if (window.CSFamily) window.CSFamily.save(g); }
        return false;
      }).catch(function () { return false; });
    },
    /* The link screen: email → code → linked. opts: {email, intro, onDone(family), onCancel} */
    linkUI: function (box, opts) {
      opts = opts || {};
      var f = fam() || {};
      box.innerHTML = (opts.intro || '') +
        '<div class="cs-link"><label for="lkE" style="display:block;font-weight:600;margin:8px 0 4px">Your email</label>' +
        '<input type="email" id="lkE" autocomplete="email" inputmode="email" maxlength="120" value="' + esc(opts.email || f.email || '') + '" style="font:inherit;width:100%;box-sizing:border-box;border:2px solid #C9C2AE;border-radius:12px;padding:10px 12px;background:#fff">' +
        '<p class="lk-msg" aria-live="polite" style="min-height:1.4em;margin:8px 0;color:#4A5573"></p>' +
        '<div class="lk-code" hidden><label for="lkC" style="display:block;font-weight:600;margin:0 0 4px">The 6-digit code from the email</label>' +
        '<input id="lkC" inputmode="numeric" autocomplete="one-time-code" maxlength="7" style="font:inherit;font-size:1.4em;letter-spacing:.3em;width:9em;border:2px solid #C9C2AE;border-radius:12px;padding:8px 12px;background:#fff"></div>' +
        '<div class="btns" style="margin-top:10px"><button type="button" class="btn primary yes" id="lkGo">Email me a code</button>' +
        (opts.onCancel ? '<button type="button" class="btn" id="lkNo">Back</button>' : '') + '</div></div>';
      var E = box.querySelector('#lkE'), C = box.querySelector('#lkC'), go = box.querySelector('#lkGo'), msg = box.querySelector('.lk-msg'), step = 'email';
      if (opts.onCancel) box.querySelector('#lkNo').onclick = opts.onCancel;
      go.onclick = function () {
        var email = E.value.trim().toLowerCase();
        if (step === 'email') {
          if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) { msg.textContent = 'Please check the email address.'; return; }
          go.disabled = true; msg.textContent = 'Sending…';
          post({type: 'code', email: email}).then(function (r) {
            go.disabled = false;
            if (!r.ok) { msg.textContent = r.why === 'limit' ? 'Too many codes for now. Please try again in an hour.' : 'Sorry, the code could not be sent. Please try again later.'; return; }
            step = 'code'; box.querySelector('.lk-code').hidden = false; E.readOnly = true; go.textContent = 'Confirm';
            msg.textContent = 'We have emailed a code to ' + email + '. It may take a minute, and it may be in Spam or Promotions.';
            if (window.csTrack) csTrack('link-code-sent', {});
            setTimeout(function () { C.focus(); }, 50);
          }).catch(function () { go.disabled = false; msg.textContent = 'No connection. Please try again.'; });
        } else {
          go.disabled = true; msg.textContent = 'Checking…';
          post({type: 'verify', email: email, code: C.value, device: device(), state: state()}).then(function (r) {
            go.disabled = false;
            if (!r.ok) {
              msg.textContent = r.why === 'code' ? 'That code doesn’t match. ' + (r.left ? r.left + ' tries left.' : '') :
                r.why === 'expired' || r.why === 'tries' ? 'This code has expired. Press “Email me a new code”.' : 'Something went wrong. Please try again.';
              if (r.why === 'expired' || r.why === 'tries') { step = 'email'; go.textContent = 'Email me a new code'; }
              return;
            }
            apply(r.state, email, r.token);
            if (window.csTrack) csTrack('link-done', {kids: (r.state.kids || []).length});
            if (opts.onDone) opts.onDone(fam());
          }).catch(function () { go.disabled = false; msg.textContent = 'No connection. Please try again.'; });
        }
      };
      setTimeout(function () { (E.value ? go : E).focus(); }, 50);
    }
  };

  // keep a linked device up to date (at most every 5 minutes, and whenever the page is shown again)
  function maybeSync() {
    if (!CSSync.linked()) return;
    var t = 0; try { t = +sessionStorage.getItem('cs_sync_t') || 0; } catch (e) {}
    if (Date.now() - t > 5 * 60 * 1000) CSSync.sync();
  }
  maybeSync();
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') maybeSync(); });
})();
