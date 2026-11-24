/* Celly School · Talk to Celly game add-ons (Stage 2, Nov 2026). Loaded after app.js.
   1. Faster voice: Celly's voice comes in ~40 s pieces (media/v/chunks.js), so she can talk
      after a small download instead of the whole 8 MB file.
   2. Levels: each game is split at its brain break. Level 1 = rooms before it, Level 2 = after.
   3. Carry on where you stopped: the child's place, answers and report choice are saved on this
      device, and the next visit offers "Carry on" or "Start again".
   4. Phone screen: talk/tap and voice buttons go behind one ⚙ button; the room trail is shorter.
   5. Progress for the website: games started / finished are saved on this device (cs_progress),
      so lesson pages can show ticks and the home page a "Carry on" button. */
(function () {
  if (typeof S === 'undefined' || typeof TRAIL === 'undefined') return;
  var slug = (location.pathname.match(/\/play\/([a-z0-9]+)\//) || [])[1];
  if (!slug) return;
  var BASE = (location.pathname.match(/^\/preview-[a-z0-9-]+/) || [''])[0];
  var QS = new URLSearchParams(location.search), RECAP = !!QS.get('recap');
  var R0 = +(QS.get('room') || 0);
  var RKEY = 'cs_resume_' + slug;
  function lsGet(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]; }); }
  function track(n, p) { try { if (window.csTrack) window.csTrack(n, p); } catch (e) {} }

  /* ---------- 1. faster voice ---------- */
  if (window.VOICE_CHUNKS && window.VOICE && window.VOICE.ready) {
    var CH = window.VOICE_CHUNKS, bufs = {}, loading = {};
    var findChunk = function (t) { for (var i = 0; i < CH.length; i++) if (t >= CH[i][0] - 0.001 && t < CH[i][1]) return i; return CH.length - 1; };
    var getChunk = function (i) {
      if (i < 0 || i >= CH.length) return Promise.resolve(null);
      if (bufs[i]) return Promise.resolve(bufs[i]);
      if (loading[i]) return loading[i];
      var c = ac(); if (!c) return Promise.resolve(null);
      loading[i] = fetch(CH[i][2]).then(function (r) { if (!r.ok) throw 0; return r.arrayBuffer(); })
        .then(function (b) { return new Promise(function (ok, no) { c.decodeAudioData(b, ok, no); }); })
        .then(function (buf) { bufs[i] = buf; try { spriteBuf = spriteBuf || true; } catch (e) {} return buf; })
        .catch(function () { loading[i] = null; return null; });
      return loading[i];
    };
    // which piece the first line of this room is in: rooms run in order, so estimate from the room number
    var guess = function () { return R0 > 0 ? Math.min(CH.length - 1, Math.floor(R0 / Math.max(1, TRAIL.length - 1) * CH.length)) : 0; };
    loadSprite = function () { var g = guess(); var p = getChunk(g); getChunk(g + 1); if (g > 0) getChunk(g - 1); return p; };
    clipLine = async function (id, tok) {
      var seg = window.VOICE.seg[id]; if (!seg) return false;
      var i = findChunk(seg[0]);
      var buf = await getChunk(i); if (!buf) return false;
      getChunk(i + 1); getChunk(i + 2);              // fetch the next lines while Celly talks
      if (tok !== S.token) return true;
      var c = ac();
      return new Promise(function (res) {
        var src = c.createBufferSource(); src.buffer = buf; src.connect(c.destination); curSrc = src; curAudio = src;
        var env = window.VOICE.env[id] || [], t0 = c.currentTime + .02, raf = 0, done = false;
        var step = function () { var k = Math.floor((c.currentTime - t0) / .04); Celly.mouth(k >= 0 && k < env.length ? env[k] / 9 : 0); if (!done) raf = requestAnimationFrame(step); };
        src.onended = function () { done = true; cancelAnimationFrame(raf); Celly.mouth(0); curSrc = null; res(true); };
        src.start(t0, Math.max(0, seg[0] - CH[i][0]), seg[1]); raf = requestAnimationFrame(step);
      });
    };
  }

  /* ---------- 2. levels ---------- */
  var BB = -1; TRAIL.forEach(function (t, i) { if (BB < 0 && /brain break/i.test(t)) BB = i; });
  var LAST = TRAIL.length - 1;
  function levelOf(r) { return BB > 0 && r > BB ? 2 : 1; }
  window.CS_LEVEL = {split: BB, of: function (r) { return levelOf(r); }, count: BB > 0 ? 2 : 1};

  /* ---------- 5. progress for the website ---------- */
  function prog(fn) {
    var ch = ssGet('cs_report_' + slug + '_child');
    if (window.CSProg) { if (ch) CSProg.setKid(ch); CSProg.update(fn); return; }
    var p = lsGet('cs_progress2') || {v: 1, lessons: {}, games: {}};
    p.lessons = p.lessons || {}; p.games = p.games || {};
    fn(p); lsSet('cs_progress2', p);
  }
  var gameName = ((document.querySelector('#card h1') || {}).textContent || '').trim() || (document.title.split('·')[1] || '').trim();
  function savePlace(room) {
    if (RECAP || room == null || room >= LAST) return;
    var snap = {};
    try {
      for (var i = 0; i < sessionStorage.length; i++) {
        var k = sessionStorage.key(i);
        if (k.indexOf('cs' + slug + '_') === 0 || k.indexOf('cs_report_' + slug + '_') === 0) snap[k] = sessionStorage.getItem(k);
      }
    } catch (e) {}
    delete snap['cs_report_' + slug + '_sent'];
    var child = ssGet('cs_report_' + slug + '_child') || '';
    lsSet(RKEY, {room: room, level: levelOf(room), t: Date.now(), child: child, snap: snap});
    prog(function (p) {
      var g = p.games[slug] = p.games[slug] || {};
      g.name = g.name || gameName; g.started = g.started || Date.now(); g.room = room; g.level = levelOf(room); g.t = Date.now();
      p.last = {kind: 'game', slug: slug, t: Date.now()};
    });
  }

  /* ---------- 3. carry on where you stopped ---------- */
  var saved = lsGet(RKEY);
  if (saved && (Date.now() - saved.t > 30 * 864e5 || saved.room >= LAST)) { lsDel(RKEY); saved = null; }
  if (!RECAP && !R0 && saved && saved.room > 0) {
    var CK = 'cs_report_' + slug + '_choice';
    var hadChoice = ssGet(CK);
    if (!hadChoice) ssSet(CK, 'wait');                // keeps the grown-up screen away while we ask
    var st = document.createElement('style');
    st.textContent = '.cs-resume{position:fixed;inset:0;z-index:60;background:rgba(31,42,68,.45);display:flex;align-items:center;justify-content:center;padding:16px}' +
      '.cs-resume .box{background:#FFFDF6;border:3px solid #81A63C;border-radius:22px;max-width:460px;width:100%;padding:22px 22px 18px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.2)}' +
      '.cs-resume h2{margin:0 0 6px;font-size:26px}.cs-resume p{margin:0 0 14px}' +
      '.cs-resume button{font:inherit;font-weight:600;font-size:19px;min-height:52px;border-radius:999px;padding:.5em 1.3em;margin:5px;cursor:pointer;border:2px solid #2E3F6E;background:#fff;color:#1F2A44}' +
      '.cs-resume button.go{background:#1F2A44;color:#fff;border-color:#1F2A44}';
    document.head.appendChild(st);
    var d = document.createElement('div'); d.className = 'cs-resume gu'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
    d.innerHTML = '<div class="box"><img src="/img/celly.png" alt="" width="90" height="80">' +
      '<h2>Welcome back' + (saved.child ? ', ' + esc(saved.child) : '') + '! 👋</h2>' +
      '<p>You stopped at <b>' + esc(TRAIL[saved.room] || 'room ' + saved.room) + '</b>' + (BB > 0 ? ' (Level ' + saved.level + ' of 2)' : '') + '.</p>' +
      '<button class="go" id="csCarry">▶ Carry on</button><button id="csAgain">Start again</button></div>';
    document.body.appendChild(d);
    setTimeout(function () { var b = document.getElementById('csCarry'); if (b) b.focus(); }, 60);
    document.getElementById('csCarry').onclick = function () {
      try { sessionStorage.removeItem(CK); } catch (e) {}
      Object.keys(saved.snap || {}).forEach(function (k) { ssSet(k, saved.snap[k]); });
      track('game-resume', {game: slug, room: saved.room});
      location.href = location.pathname + '?room=' + saved.room;
    };
    document.getElementById('csAgain').onclick = function () {
      lsDel(RKEY); if (!hadChoice) { try { sessionStorage.removeItem(CK); } catch (e) {} }
      track('game-restart', {game: slug, room: saved.room});
      location.reload();
    };
  }

  // remember the place whenever the room changes, and when leaving the page
  var navTo = null;
  if (typeof goRoom === 'function') {
    var _goRoom = goRoom;
    goRoom = function (i) { var n = Math.max(0, Math.min(LAST, +i)); if (n !== S.room && !RECAP) { navTo = n; savePlace(n); } return _goRoom(i); };
  }
  var lastRoom = null;
  setInterval(function () {
    if (!S.started) return;
    var r = +S.room || 0;
    if (r !== lastRoom) { lastRoom = r; savePlace(r); if (r === BB) levelDone(); }
  }, 1000);
  window.addEventListener('pagehide', function () { if (S.started && navTo === null && !finished) savePlace(+S.room || 0); });

  // finished: forget the saved place, tick the game
  var finished = false;
  new MutationObserver(function () {
    if (finished || !document.querySelector('.cert')) return;
    finished = true; lsDel(RKEY);
    if (RECAP) return;
    // honest "finished": most rooms really played (20 s or more in the room), not just jumping to the certificate
    var log = {}; try { log = JSON.parse(ssGet('cs_report_' + slug + '_rooms') || '{}'); } catch (e) {}
    var playable = 0, played = 0;
    TRAIL.forEach(function (t, i) { if (i === LAST || i === BB) return; playable++; if (log[i] && log[i].s >= 20) played++; });
    var real = playable && played / playable >= 0.7;
    track(real ? 'game-finished-real' : 'game-cert-skipped', {game: slug, played: played, of: playable});
    prog(function (p) {
      var g = p.games[slug] = p.games[slug] || {}; g.name = g.name || gameName; g.played = Math.max(g.played || 0, played); g.of = playable;
      if (real) { g.done = Date.now(); g.room = LAST; g.level = 2; } else { g.room = g.room || 0; }
      p.last = {kind: 'game', slug: slug, t: Date.now(), done: real};
    });
  }).observe(document.getElementById('card') || document.body, {childList: true, subtree: true});

  /* the brain break ends Level 1: say so, and offer a natural place to stop */
  var shownLevel = false;
  function levelDone() {
    if (shownLevel || RECAP || BB <= 0) return; shownLevel = true;
    track('game-level-done', {game: slug, level: 1});
    var t = document.createElement('div'); t.className = 'cs-level';
    var st2 = document.createElement('style');
    st2.textContent = '.cs-level{position:fixed;left:12px;right:12px;bottom:12px;z-index:40;max-width:560px;margin:0 auto;background:#FFFDF6;border:3px solid #81A63C;border-radius:18px;padding:14px 16px;box-shadow:0 8px 30px rgba(0,0,0,.18);text-align:center}' +
      '.cs-level p{margin:0 0 8px}.cs-level button,.cs-level a{font:inherit;font-weight:600;min-height:48px;border-radius:999px;padding:.4em 1.1em;margin:4px;cursor:pointer;border:2px solid #2E3F6E;background:#fff;color:#1F2A44;text-decoration:none;display:inline-flex;align-items:center}' +
      '.cs-level .go{background:#1F2A44;color:#fff;border-color:#1F2A44}';
    document.head.appendChild(st2);
    t.innerHTML = '<p><b>🎉 Level 1 done!</b> Your place is saved. Take your brain break, then keep going, or stop for today and carry on next time.</p>' +
      '<button class="go" id="csKeep">Keep going</button><a id="csStop" href="' + BASE + '/' + slug + '">Stop for today</a>';
    document.body.appendChild(t);
    document.getElementById('csKeep').onclick = function () { t.remove(); };
    document.getElementById('csStop').onclick = function () { savePlace(BB + 1); track('game-stop-later', {game: slug}); };
  }

  /* ---------- 4. phone screen: one ⚙ button, shorter trail ---------- */
  var tools = document.querySelector('header .tools');
  if (tools) {
    var gear = document.createElement('button');
    gear.className = 'tbtn cs-gear'; gear.type = 'button'; gear.setAttribute('aria-expanded', 'false'); gear.innerHTML = '⚙ Settings';
    tools.parentNode.insertBefore(gear, tools);
    var back = document.createElement('a');
    back.className = 'tbtn cs-back'; back.href = BASE + '/' + slug; back.textContent = '← ' + slug.replace(/^7(.)(.)$/, function (_, u, l) { return '7' + u.toUpperCase() + l; }) + ' lesson';
    tools.appendChild(back);
    gear.onclick = function () { var o = !tools.classList.contains('open'); tools.classList.toggle('open', o); gear.setAttribute('aria-expanded', o ? 'true' : 'false'); };
    var css = document.createElement('style');
    css.textContent = '.cs-gear{display:none}.cs-back{text-decoration:none;display:inline-flex;align-items:center}' +
      // back and next always in the same place: back top-left, next top-right; room names in between
      '.trail{position:relative;padding:0 112px;min-height:46px;align-content:flex-start}' +
      '.trail .step.nav{position:absolute;top:0;min-height:44px;min-width:100px;justify-content:center;font-size:16px}' +
      '.trail .step.nav:first-child{left:0}.trail .step.nav:last-child{right:0}' +
      '@media (max-width:600px){' +
      'header.top .chip{display:none}' +
      'header.top{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}' +
      '.cs-gear{display:inline-flex;align-items:center;min-height:44px}' +
      'header .tools{display:none;width:100%;flex-direction:column;align-items:stretch}' +
      'header .tools.open{display:flex}' +
      'header .tools .tbtn{min-height:44px;justify-content:center}' +
      '.trail .step:not(.nav):not(.now){display:none}' +
      '.trail{justify-content:center;flex-wrap:nowrap;padding:0 96px}' +
      '.trail .step.nav{min-width:86px}' +
      '.trail .step.now{flex:1;justify-content:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
      '}';
    document.head.appendChild(css);
  }
})();
