/* Celly School · optional report for grown-ups (email + PDF, no sign-in).
   Shown once before the game starts. If a grown-up gives an email and ticks the box,
   the results are sent to the Celly School Google Script when the certificate appears.
   Needs: <script src="/play/report.js" data-endpoint="https://script.google.com/macros/s/.../exec"> after app.js */
(function () {
  var me = document.currentScript, URL_ = me && me.getAttribute('data-endpoint');
  if (!URL_) return;
  var m = location.pathname.match(/\/play\/(7[a-l])([a-e]?)\//i); if (!m) return;
  var GAME = '7' + m[1].charAt(1).toUpperCase() + m[2].toLowerCase();         // e.g. 7Aa
  var K = 'cs_report_' + GAME.toLowerCase();
  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function track(n, p) { try { if (window.csTrack) window.csTrack(n, p); } catch (e) {} }

  var topic = (document.title.split('·')[1] || '').replace(GAME, '').trim();
  var h1 = document.querySelector('#card h1');
  if (!ss(K + '_title') && h1 && !/[?]room=/.test(location.search)) ss(K + '_title', h1.textContent.trim());

  // count "say it again" and remember when play started (rooms reload the page)
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('button'); if (!t) return;
    if (t.id === 'again') ss(K + '_again', String(+(ss(K + '_again') || 0) + 1));
    if (t.id === 'go' && !ss(K + '_t0')) ss(K + '_t0', String(Date.now()));
  }, true);


  /* ---------- where each part of the game is taught in the lesson video ----------
     chapters: [start in seconds, name]; acts: game activity → {room, t} (t = default video time);
     kw: words in an item → video time (used when the activity is marked kw:true). */
  var GUIDES = {
    '7Aa': {video: 'E_YFTGRxsR4',
      chapters: [[0, 'Doctors and clues'], [69, 'Word workshop: organism'], [127, 'Meet Mrs Gren'], [162, 'Movement and reproduction'],
        [225, 'Sensitivity'], [270, 'Growth'], [312, 'Brain break'], [326, 'Respiration'], [400, 'Excretion and nutrition'],
        [454, 'Say Mrs Gren together'], [494, 'Organism or not?'], [571, 'Quiz and big ideas'], [650, 'Workbook for grown-ups']],
      acts: {
        "Doctor's tools": {room: 0, t: 0}, 'Clue detective': {room: 1, t: 0},
        'Build the word': {room: 2, t: 69, kw: true}, 'Mrs Gren': {room: 3, t: 454}, 'Mrs Gren meanings': {room: 3, t: 127, kw: true},
        'Test Bolt': {room: 5, t: 494}, 'Test Zoom': {room: 5, t: 494}, 'Test the campfire': {room: 5, t: 494},
        'Waiting room': {room: 6, t: 494}, 'Clinic lab': {room: 7, t: 571, kw: true}, 'Teach Dr Celly': {room: 8, t: 571, kw: true}},
      kw: [[/respir|limewater|gills|breath/i, 326], [/excret|nutrition|urine/i, 400], [/movement|move|reproduc/i, 162],
        [/sensitiv|pupil|hot pan/i, 225], [/grow|ring/i, 270], [/symptom|flu|cold|spots/i, 0], [/organism|alive/i, 69]]}
  };
  function place(r) {
    var g = GUIDES[GAME]; if (!g) return {};
    var a = g.acts[r.act]; if (!a) return {};
    var t = a.t;
    if (a.kw) for (var i = 0; i < g.kw.length; i++) if (g.kw[i][0].test(r.item)) { t = g.kw[i][1]; break; }
    var ch = g.chapters, name = '', end = 0;
    for (var j = 0; j < ch.length; j++) if (ch[j][0] <= t) { name = ch[j][1]; end = ch[j + 1] ? ch[j + 1][0] : 0; }
    var rn = (typeof TRAIL !== 'undefined' && TRAIL[a.room]) || '';
    return {room: a.room, roomName: rn, t: t, tEnd: end, chap: name};
  }

  /* ---------- the grown-up screen ---------- */
  var css = '.gu{position:fixed;inset:0;z-index:200;background:rgba(31,42,68,.55);display:flex;padding:16px;overflow-y:auto;box-sizing:border-box}' +
    '.gu .box{margin:auto;background:#FFFDF6;border:3px solid #1F2A44;border-radius:22px;max-width:560px;width:100%;padding:20px 22px;font-size:18px;line-height:1.55;color:#1F2A44;box-shadow:0 10px 40px rgba(0,0,0,.25)}' +
    '.gu h2{margin:0 0 6px;font-size:24px}.gu ul{margin:8px 0 12px;padding-left:22px}.gu li{margin:4px 0}' +
    '.gu label{display:block;font-weight:600;margin:10px 0 4px}' +
    '.gu input[type=email]{font:inherit;width:100%;box-sizing:border-box;border:2px solid #C9C2AE;border-radius:12px;padding:10px 12px}' +
    '.gu input[type=email]:focus{outline:3px solid #81A63C;border-color:#81A63C}' +
    '.gu .tick{display:flex;gap:10px;align-items:flex-start;font-weight:400;margin:12px 0}.gu .tick input{width:24px;height:24px;margin-top:3px;flex:none}' +
    '.gu .btns{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}' +
    '.gu button{font:inherit;font-weight:600;border-radius:14px;padding:12px 18px;cursor:pointer;border:3px solid #1F2A44;background:#fff;color:#1F2A44;flex:1 1 200px}' +
    '.gu button.yes{background:#1F2A44;color:#fff}.gu .err{color:#B5651D;font-weight:600;min-height:1.4em;margin:6px 0 0}' +
    '.gu .small{font-size:14px;color:#56607A;margin:12px 0 0}.gu .small a{color:#56607A}.gu .hp{position:absolute;left:-9999px}' +
    '.gu-sent{margin:8px 0 0;font-size:16px;color:#4E7A1E;font-weight:600}';

  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  function ask() {
    var saved = ls('cs_report_email') || '';
    var d = document.createElement('div'); d.className = 'gu'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-labelledby', 'guT');
    d.innerHTML = '<div class="box"><h2 id="guT">For the grown-up 👋</h2>' +
      '<p style="margin:0">Before your child starts: would you like a short report by email when the game ends?</p>' +
      '<ul><li>Your child plays as normal. It takes about 15 minutes.</li>' +
      '<li>At the end, we email you a one-page PDF: what they got right first time, which words to practise, and what to try next.</li>' +
      '<li>No account and no sign-in. We don’t keep your email address. It is only used to send this report.</li></ul>' +
      '<label for="guE">Your email (optional)</label><input type="email" id="guE" autocomplete="email" inputmode="email" maxlength="120" placeholder="name@example.com">' +
      '<input class="hp" type="text" id="guH" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<label class="tick"><input type="checkbox" id="guP"> <span>I’m this child’s parent or carer.</span></label>' +
      '<p class="err" id="guErr" aria-live="polite"></p>' +
      '<div class="btns"><button class="yes" id="guYes">Send me the report</button><button id="guNo">Skip and play without a report</button></div>' +
      '<p class="small">This device remembers the email so you don’t need to type it again. <a href="/privacy" target="_blank" rel="noopener">Privacy</a></p></div>';
    document.body.appendChild(d);
    var E = d.querySelector('#guE'), P = d.querySelector('#guP'), err = d.querySelector('#guErr');
    E.value = saved; if (saved) P.checked = true;
    setTimeout(function () { (saved ? d.querySelector('#guYes') : E).focus(); }, 50);
    function close(choice) { d.remove(); ss(K + '_choice', choice); var go = document.getElementById('go'); if (go) go.focus(); }
    d.querySelector('#guYes').onclick = function () {
      var v = E.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v)) { err.textContent = 'Please check the email address.'; E.focus(); return; }
      if (!P.checked) { err.textContent = 'Please tick the box to say you’re the parent or carer.'; return; }
      ss(K + '_email', v); ss(K + '_hp', d.querySelector('#guH').value); ls('cs_report_email', v);
      track('report-optin', {game: GAME}); close('yes');
    };
    d.querySelector('#guNo').onclick = function () { track('report-skip', {game: GAME}); close('no'); };
    E.addEventListener('keydown', function (e) { if (e.key === 'Enter') d.querySelector('#guYes').click(); });
  }

  /* ---------- send at the certificate ---------- */
  function send(cert) {
    if (ss(K + '_choice') !== 'yes' || ss(K + '_sent')) return;
    var results = []; try { results = (typeof S !== 'undefined' && S.results) || JSON.parse(ss('cs' + GAME.toLowerCase() + '_res') || '[]'); } catch (e) {}
    if (!results.length) return;
    ss(K + '_sent', '1');
    var t0 = +(ss(K + '_t0') || 0);
    var body = {
      email: ss(K + '_email'), parent: true, hp: ss(K + '_hp') || '', game: GAME,
      title: ss(K + '_title') || 'Talk to Celly', topic: topic,
      minutes: t0 ? (Date.now() - t0) / 60000 : 0,
      mode: (typeof S !== 'undefined' && S.mode) || 'tap',
      sayAgain: +(ss(K + '_again') || 0),
      video: (GUIDES[GAME] || {}).video || '',
      results: results.map(function (r) {
        var p = place(r);
        return {act: r.act, item: r.item, first: r.first, said: r.said, room: p.room, roomName: p.roomName, t: p.t, tEnd: p.tEnd, chap: p.chap};
      })
    };
    fetch(URL_, {method: 'POST', mode: 'no-cors', headers: {'Content-Type': 'text/plain;charset=utf-8'}, body: JSON.stringify(body)})
      .then(function () {
        track('report-sent', {game: GAME});
        var p = document.createElement('p'); p.className = 'gu-sent'; p.textContent = '📧 Your grown-up’s report is on its way by email.';
        cert.appendChild(p);
      })
      .catch(function () { ss(K + '_sent', ''); });
  }
  new MutationObserver(function () { var c = document.querySelector('.cert'); if (c) send(c); })
    .observe(document.getElementById('card') || document.body, {childList: true, subtree: true});

  if (!ss(K + '_choice')) ask();
})();
