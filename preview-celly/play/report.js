/* Celly School · optional report for grown-ups (email + PDF, no sign-in).
   Shown once before the game starts. If a grown-up gives an email and ticks the box,
   the results are sent to the Celly School Google Script when the certificate appears.
   Needs: <script src="/preview-celly/play/report.js" data-endpoint="https://script.google.com/macros/s/.../exec"> after app.js */
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
  // time in each room and "say it again" per room (kept for the session, rooms reload the page)
  function roomLog() { try { return JSON.parse(ss(K + '_rooms') || '{}'); } catch (e) { return {}; } }
  var curRoom = null, roomT0 = Date.now();
  setInterval(function () {
    if (typeof S === 'undefined' || !S.started) return;
    var r = +S.room || 0;
    if (curRoom === null) { curRoom = r; roomT0 = Date.now(); return; }
    // count only time the game is on screen, so a tab left open does not add an hour
    var dt = Math.min(10000, Date.now() - roomT0); roomT0 = Date.now();
    if (document.visibilityState === 'hidden') { curRoom = r; return; }
    var lg = roomLog(), k = String(curRoom); lg[k] = lg[k] || {s: 0, a: 0};
    lg[k].s += dt / 1000; ss(K + '_rooms', JSON.stringify(lg));
    curRoom = r;
  }, 2000);
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('button'); if (!t) return;
    if (t.id === 'again') {
      ss(K + '_again', String(+(ss(K + '_again') || 0) + 1));
      var lg = roomLog(), k = String((typeof S !== 'undefined' && +S.room) || 0); lg[k] = lg[k] || {s: 0, a: 0}; lg[k].a++; ss(K + '_rooms', JSON.stringify(lg));
    }
    if (t.id === 'muteBtn') ss(K + '_muted', '1');
    if (t.id === 'modeTap' || t.id === 'modeTalk') ss(K + '_modeSwitch', String(+(ss(K + '_modeSwitch') || 0) + 1));
    if (t.id === 'go') {
      // a fresh attempt (nothing answered yet): start the clock and the room times again
      var fresh = !(typeof S !== 'undefined' && S.results && S.results.length);
      if (fresh || !ss(K + '_t0')) { ss(K + '_t0', String(Date.now())); ss(K + '_rooms', '{}'); ss(K + '_again', '0'); ss(K + '_sent', ''); curRoom = null; }
    }
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
        [/sensitiv|pupil|hot pan/i, 225], [/grow|ring/i, 270], [/symptom|flu|cold|spots/i, 0], [/organism|alive/i, 69]]},
    '7Ab': {video: 'UxjKmbYN3jQ',
      chapters: [[0, 'Hearts, brains and mummies'], [67, 'Word workshop: organ'], [123, 'Brain, skin and heart'], [175, 'Organs for breathing'],
        [229, 'Follow your lunch'], [289, 'Liver, kidneys and bladder'], [345, 'Brain break'], [358, 'Plants have organs too'], [425, 'Photosynthesis'],
        [484, 'Storage organs'], [519, 'Doctors solve problems'], [602, 'Thumbs up, thumbs down'], [659, 'Quiz and big ideas'], [742, 'Workbook for grown-ups']],
      acts: {
        'Wake up, Mumbles!': {room: 0, t: 0},
        'Build the word': {room: 1, t: 67, kw: [[/photosynth/i, 425, 6], [/diagnos/i, 519, 7]]},
        'Follow your lunch': {room: 3, t: 229},
        'Job cards': {room: 3, t: 229, kw: [[/brain|skin|heart/i, 123], [/lung|windpipe|diaphragm/i, 175], [/liver|kidney|bladder/i, 289]]},
        'Organ teams': {room: 5, t: 123, kw: [[/lung|breath/i, 175], [/stomach|intestin|gullet/i, 229]]},
        'Body Town Park': {room: 6, t: 358, kw: [[/light|food|photosynth|carbon/i, 425], [/storage|carrot|potato/i, 484], [/report/i, 519]]},
        'Body Town Hospital': {room: 7, t: 519, kw: [[/liver/i, 289], [/heart/i, 123]]},
        'Teach Celly': {room: 8, t: 659}}},
    '7Ac': {video: '6XNPyFMaGxw',
      chapters: [[0, 'The mummy mystery'], [70, 'Word workshop: tissue'], [125, 'Inside a heart'], [176, 'Muscle tissue'], [219, 'Draw a tissue'],
        [273, 'Brain break'], [286, 'Root hair tissue'], [331, 'Word workshop: xylem'], [387, 'Cell to organism'], [447, 'Thumbs up, thumbs down'],
        [514, 'Quiz and big ideas'], [606, 'Workbook for grown-ups']],
      acts: {
        'Tissue Lab': {room: 0, t: 0},
        'Build the words': {room: 1, t: 70, kw: [[/xylem/i, 331, 3], [/microscope/i, null, 5], [/specimen/i, null, 6], [/magnif/i, null, 8]]},
        'Team Tissue': {room: 1, t: 70},
        'Heart detective': {room: 2, t: 125, kw: [[/muscle/i, 176]]},
        "Barry's carrot": {room: 3, t: 286, kw: [[/xylem/i, 331], [/storage|colour/i, 387]]},
        'Organ or tissue': {room: 3, t: 387},
        'Microscope parts': {room: 5, t: null}, 'Make a slide': {room: 6, t: null},
        'Focus!': {room: 7, t: null}, "Hanky's helpdesk": {room: 7, t: null}, 'Microscope safety': {room: 7, t: null},
        'Magnification Station': {room: 8, t: null},
        'Teach Celly': {room: 9, t: 514}}},
    '7Ad': {video: 'ZIf1F5QKn-I',
      chapters: [[0, 'What is a cell? Microscopes'], [62, 'Word workshop: microscope, magnify, specimen'], [133, 'Parts of a microscope'],
        [200, 'Six steps and magnification'], [288, 'Brain break'], [302, 'Word workshop: nucleus, cytoplasm, membrane'], [396, 'Draw an animal cell'],
        [478, 'Plant cells: wall, vacuole, chloroplast'], [564, 'Thumbs up, thumbs down'], [632, 'Brain break'], [645, 'Specialised cells'],
        [732, 'One-celled living things'], [792, 'Quiz'], [878, 'Workbook for grown-ups']],
      acts: {
        "Hooke's little rooms": {room: 1, t: 0, kw: [[/magnif|×/i, 200]]},
        'Building blocks': {room: 2, t: 0},
        'Word workshop': {room: 3, t: 302, kw: [[/microscope|magnif|specimen/i, 62]]},
        'Fix Celly': {room: 4, t: 396, kw: [[/mitochond|energy/i, 302]]},
        'Plant cells only, or both?': {room: 5, t: 478}, 'Label a plant cell': {room: 5, t: 478}, 'Photo puzzle': {room: 5, t: 478},
        'Plant or animal?': {room: 7, t: 478},
        'Special jobs': {room: 8, t: 645}, 'Mystery cells W to Z': {room: 8, t: 645},
        'How big really?': {room: 9, t: 200},
        'Teach Celly': {room: 10, t: 792},
        'Draw a root hair cell': {room: 11, t: 645}}},
    '7Ca': {video: '029hCBjtQJY',
      chapters: [[0, 'Part 1: Fitness and gas exchange'], [107, 'Fitness and the four S-factors'], [192, 'Which S-factor?'], [273, 'Why do we breathe?'],
        [366, 'Gas exchange'], [455, 'True or false?'], [519, 'Brain break'], [532, 'Part 2: The breathing muscles'], [614, 'The breathing muscles'],
        [689, 'Breathing in'], [770, 'Breathing out'], [852, 'Breathing rate'], [931, 'Quiz and big ideas'], [1059, 'Workbook for grown-ups']],
      acts: {
        'The moving chest': {room: 0, t: 0},
        'Fitness lab': {room: 1, t: 107, kw: [[/cell, tissue/i, 0], [/criteri|stamina|suppleness|strength|speed/i, 192]]},
        'Build the words': {room: 2, t: 614, kw: [[/respiration/i, 273], [/trachea/i, 366]]},
        'Oxygen lab': {room: 3, t: 273, kw: [[/blood|carbon|heart|vessel/i, 366]]},
        'Muscle lab': {room: 4, t: 532},
        'Chest model': {room: 6, t: 689, kw: [[/relax|breathing out/i, 770], [/find the/i, 614]]},
        'Breathing rate': {room: 7, t: 852},
        'Teach Celly': {room: 8, t: 931}}},
    '7Ae': {video: 'Klo1RDcyc-o',
      chapters: [[0, 'Climb the ladder'], [74, 'Word workshop: organ system'], [140, 'The digestive system'], [205, 'The circulatory system'],
        [268, 'The breathing system'], [323, 'The urinary system'], [386, 'Brain break'], [400, 'The nervous system'], [456, 'The locomotor system'],
        [509, 'All six systems'], [578, 'Plants have systems too'], [653, 'Biopsy and transplants'], [783, 'Quiz and big ideas'], [873, 'Workbook for grown-ups']],
      acts: {
        'Welcome to Body Town': {room: 0, t: 0},
        'Climb the ladder': {room: 1, t: 0},
        'Build the words': {room: 2, t: 74, kw: [[/transplant|biops/i, 653, 7]]},
        'Fix the signposts': {room: 3, t: 509, kw: true},
        'The town map': {room: 4, t: 509, kw: true},
        'The garden district': {room: 6, t: 578},
        'Body Town Hospital': {room: 7, t: 653},
        'Teach Celly': {room: 8, t: 783}},
      kw: [[/digest|stomach|gullet|intestin|mouth/i, 140], [/circulat|heart|blood|arter|vein/i, 205], [/breath|lung|windpipe|oxygen/i, 268],
        [/urin|kidney|bladder/i, 323], [/nerv|brain|spinal/i, 400], [/locomot|bone|muscle|skeleton|joint/i, 456]]}
  };
  function place(r) {
    var g = GUIDES[GAME]; if (!g) return {};
    var a = g.acts[r.act]; if (!a) return {};
    var t = a.t, room = a.room;
    // per-answer detail: some answers belong to another part of the video (and sometimes another room)
    var list = Array.isArray(a.kw) ? a.kw : (a.kw ? g.kw : null);
    if (list) for (var i = 0; i < list.length; i++) if (list[i][0].test(r.item)) { t = list[i][1]; if (list[i][2] != null) room = list[i][2]; break; }
    var rn = (typeof TRAIL !== 'undefined' && TRAIL[room]) || '';
    if (t == null) return {room: room, roomName: rn, t: -1, tEnd: 0, chap: ''};   // not covered by this lesson's video
    var ch = g.chapters, name = '', end = 0;
    for (var j = 0; j < ch.length; j++) if (ch[j][0] <= t) { name = ch[j][1]; end = ch[j + 1] ? ch[j + 1][0] : 0; }
    return {room: room, roomName: rn, t: t, tEnd: end, chap: name};
  }

  /* ---------- recap mode: play one room, then go back to Celly's recap ---------- */
  var QS = new URLSearchParams(location.search), RECAP = QS.get('recap') || '';
  if (RECAP && RECAP.indexOf(location.origin + '/preview-celly/play/recap/') !== 0) RECAP = '';
  if (RECAP) {
    var startRoom = +(QS.get('room') || 0), leaving = false, RK = (QS.get('rk') || '').replace(/[^A-Za-z0-9_]/g, '');
    var L0 = (typeof S !== 'undefined' && S.results) ? S.results.length : 0;
    var bk = document.createElement('a'); bk.href = RECAP; bk.textContent = '↩ Back to the recap';
    bk.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:150;background:#fff;border:3px solid #2B3A67;border-radius:14px;padding:8px 14px;font:600 16px Lexend,Arial,sans-serif;color:#1F2A44;text-decoration:none';
    document.body.appendChild(bk);
    setInterval(function () {
      if (leaving || typeof S === 'undefined' || S.room == null) return;
      if (S.room !== startRoom || document.querySelector('.cert')) {
        leaving = true; track('recap-room-done', {game: GAME, room: startRoom});
        if (RK) try {
          var got = JSON.parse(ss('cs_rr_' + RK) || '[]');
          S.results.slice(L0).forEach(function (r) {
            var p = place(r);
            got.push({act: r.act, item: r.item, first: r.first, said: r.said, room: p.room, roomName: p.roomName, t: p.t, tEnd: p.tEnd, chap: p.chap});
          });
          ss('cs_rr_' + RK, JSON.stringify(got.slice(-120)));
        } catch (e) {}
        try { if (window.stopVoice) stopVoice(); } catch (e) {}
        var m = document.createElement('div');
        m.style.cssText = 'position:fixed;inset:0;z-index:210;background:rgba(31,42,68,.6);display:flex;align-items:center;justify-content:center;padding:16px';
        m.innerHTML = '<div style="background:#FFFDF6;border:3px solid #1F2A44;border-radius:22px;padding:22px 26px;font:600 22px Lexend,Arial,sans-serif;color:#1F2A44;text-align:center">🎉 Well done!<br><span style="font-weight:400;font-size:18px">Back to your recap…</span></div>';
        document.body.appendChild(m);
        setTimeout(function () { location.href = RECAP; }, 2200);
      }
    }, 600);
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
    '.gu-sent{margin:8px 0 0;font-size:16px;color:#4E7A1E;font-weight:600}' +
    '.gu .kidbtns{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-top:14px}' +
    '.gu button.kid{font-size:26px;padding:20px 14px;background:#EEF5E1;border-color:#81A63C;border-radius:18px}' +
    '.gu button.kid:hover{background:#81A63C;color:#fff}.gu button.kid:focus-visible{outline:4px solid #2B3A67;outline-offset:2px}';

  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  function finishAsk(d, choice) {
    d.remove(); ss(K + '_choice', choice);
    var go = document.getElementById('go'); if (go) go.focus();
    try { window.dispatchEvent(new Event('cs-grownup-done')); } catch (e) {}
  }
  function overlay() {
    var d = document.createElement('div'); d.className = 'gu'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
    d.innerHTML = '<div class="box"></div>'; document.body.appendChild(d); return d;
  }
  function useFamily(f, child, hp) {
    ss(K + '_email', f.email); ss(K + '_child', child || ''); ss(K + '_hp', hp || '');
  }
  // first time on this device: the grown-up sets up email + children
  function setup(d) {
    var box = d.querySelector('.box'); box.innerHTML = '';
    var inner = document.createElement('div'); box.appendChild(inner);
    window.CSFamily.form(inner, {
      intro: '<h2 id="guT">For the grown-up 👋</h2>' +
        '<p style="margin:0">Set this up once and get a short report by email each time your child finishes a game, even when they play alone.</p>' +
        '<ul><li>At the end of each game: what they got right first time, which words to practise, and Celly’s recap.</li>' +
        '<li>No account and no sign-in. We keep your email and your children’s first names so we can send each child’s reports and recaps. We never share them.</li></ul>',
      saveLabel: 'Save and play', skipLabel: 'Play without a report',
      onSave: function (f, hp) {
        track('report-optin', {game: GAME, kids: f.kids.length});
        if (f.kids.length > 1) return who(d, f);
        useFamily(f, f.kids[0] || '', hp); finishAsk(d, 'yes');
      },
      onSkip: function () { track('report-skip', {game: GAME}); finishAsk(d, 'no'); }
    });
  }
  // every time after that: the child picks their name
  function who(d, f) {
    var box = d.querySelector('.box'), E = window.CSFamily.esc;
    var kids = f.kids;
    box.innerHTML = '<h2 id="guT" style="font-size:28px;text-align:center">' + (kids.length ? 'Who’s playing today? 👋' : 'Ready to play? 👋') + '</h2>' +
      '<div class="kidbtns">' + (kids.length ? kids.map(function (k, i) { return '<button class="kid" data-i="' + i + '">' + ['🌟', '🚀', '🌈', '⚡', '🍀', '🎈'][i % 6] + ' ' + E(k) + '</button>'; }).join('')
        : '<button class="kid" data-i="-1">▶ Start</button>') + '</div>' +
      '<div class="btns" style="margin-top:10px"><button id="kNew">Someone else</button><button id="kNo">Play without a report</button></div>' +
      '<p class="small">Reports go to ' + E(window.CSFamily.mask(f.email)) + '. <a href="#" id="kSet">Grown-up settings</a></p>';
    [].forEach.call(box.querySelectorAll('.kid'), function (b) {
      b.onclick = function () { var i = +b.dataset.i; useFamily(f, i >= 0 ? kids[i] : ''); track('report-child', {game: GAME}); finishAsk(d, 'yes'); };
    });
    box.querySelector('#kNo').onclick = function () { track('report-skip', {game: GAME}); finishAsk(d, 'no'); };
    box.querySelector('#kSet').onclick = function (e) { e.preventDefault(); setup(d); };
    box.querySelector('#kNew').onclick = function () {
      box.innerHTML = '<h2 style="text-align:center">What’s your name? 😊</h2><input type="text" id="kName" maxlength="24" autocomplete="off" style="font:inherit;font-size:24px;width:100%;box-sizing:border-box;border:2px solid #C9C2AE;border-radius:12px;padding:10px 12px;text-align:center">' +
        '<div class="btns"><button class="yes" id="kGo">▶ Play</button><button id="kBack">Back</button></div>' +
        '<p class="small">Your name goes in the report to ' + E(window.CSFamily.mask(f.email)) + '.</p>';
      var inp = box.querySelector('#kName'); inp.focus();
      var go = function () {
        var n = window.CSFamily.cleanName(inp.value); if (!n) { inp.focus(); return; }
        if (f.kids.indexOf(n) < 0 && f.kids.length < 6) { f.kids.push(n); window.CSFamily.save(f); }
        useFamily(f, n); finishAsk(d, 'yes');
      };
      box.querySelector('#kGo').onclick = go; inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
      box.querySelector('#kBack').onclick = function () { who(d, f); };
    };
    var first = box.querySelector('.kid'); if (first) setTimeout(function () { first.focus(); }, 50);
  }
  function ask() {
    if (!window.CSFamily) return;
    var d = overlay(), f = window.CSFamily.get();
    if (f) who(d, f); else setup(d);
  }

  /* ---------- what we learn about how the game is used (no names, nothing typed) ---------- */
  function meta() {
    var ua = navigator.userAgent || '', w = screen.width || 0, h = screen.height || 0;
    var device = /iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)) ? 'tablet' : /Mobi|iPhone|Android/i.test(ua) ? 'phone' : 'computer';
    var browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /SamsungBrowser/.test(ua) ? 'Samsung' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'other';
    var os = /Windows/.test(ua) ? 'Windows' : /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Mac OS X/.test(ua) ? 'macOS' : /Android/.test(ua) ? 'Android' : /CrOS/.test(ua) ? 'ChromeOS' : /Linux/.test(ua) ? 'Linux' : 'other';
    var ref = ''; try { ref = document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) {}
    var q = new URLSearchParams(location.search), lg = roomLog(), names = (typeof TRAIL !== 'undefined' && TRAIL) || [];
    var rooms = Object.keys(lg).map(function (k) { return {room: +k, name: names[+k] || ('Room ' + k), secs: Math.round(lg[k].s), again: lg[k].a}; });
    var tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    var ver = ((document.querySelector('script[src*="app.js"]') || {}).getAttribute || function () { return ''; }).call(document.querySelector('script[src*="app.js"]'), 'src') || '';
    return {device: device, browser: browser, os: os, screen: w + 'x' + h, lang: navigator.language || '', tz: tz,
      from: q.get('utm_source') || ss('cs_from') || ref, rooms: rooms, muted: !!(typeof S !== 'undefined' && S.mute) || !!ss(K + '_muted'),
      modeSwitches: +(ss(K + '_modeSwitch') || 0), speech: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
      version: (ver.split('?')[1] || '').replace('v=', 'v'), order: schoolOrder().join(','), now: (function () { try { return (JSON.parse(localStorage.getItem('cs_order') || 'null') || {}).now || ''; } catch (e) { return ''; } })(), family: window.CSFamily && window.CSFamily.get() ? (window.CSFamily.get().kids || []).length : 0};
  }
  try { if (!ss('cs_from')) ss('cs_from', new URLSearchParams(location.search).get('utm_source') || (document.referrer ? new URL(document.referrer).hostname : 'direct')); } catch (e) {}

  /* ---------- send at the certificate ---------- */
  function send(cert) {
    if (RECAP || ss(K + '_choice') !== 'yes' || ss(K + '_sent')) return;
    var results = []; try { results = (typeof S !== 'undefined' && S.results) || JSON.parse(ss('cs' + GAME.toLowerCase() + '_res') || '[]'); } catch (e) {}
    if (!results.length) return;
    ss(K + '_sent', '1');
    var t0 = +(ss(K + '_t0') || 0), lg = roomLog(), act = 0;
    Object.keys(lg).forEach(function (k) { act += lg[k].s || 0; });
    // every room of the game (not the brain break or the certificate): played, or skipped
    var names = (typeof TRAIL !== 'undefined' && TRAIL) || [], trail = [];
    names.slice(0, -1).forEach(function (n, i) {
      if (/brain break/i.test(n)) return;
      var secs = lg[String(i)] ? lg[String(i)].s : 0;
      trail.push({room: i, name: n, played: secs >= 20 || results.some(function (r) { return place(r).room === i; })});
    });
    var body = {
      email: ss(K + '_email'), child: ss(K + '_child') || '', parent: true, hp: ss(K + '_hp') || '', game: GAME,
      title: ss(K + '_title') || 'Talk to Celly', topic: topic,
      minutes: act ? act / 60 : t0 ? Math.min(90, (Date.now() - t0) / 60000) : 0,
      trail: trail,
      mode: (typeof S !== 'undefined' && S.mode) || 'tap',
      sayAgain: +(ss(K + '_again') || 0),
      video: (GUIDES[GAME] || {}).video || '',
      meta: meta(),
      results: results.map(function (r) {
        var p = place(r);
        return {act: r.act, item: r.item, first: r.first, said: r.said, room: p.room, roomName: p.roomName, t: p.t, tEnd: p.tEnd, chap: p.chap};
      })
    };
    window.__csRecapWait = true;
    fetch(URL_, {method: 'POST', headers: {'Content-Type': 'text/plain;charset=utf-8'}, body: JSON.stringify(body)})
      .then(function (res) { return res.json().catch(function () { return {}; }); })
      .then(function (r) {
        window.__csRecapWait = false; window.__csRecap = r || {};
        try { window.dispatchEvent(new Event('cs-recap-ready')); } catch (e) {}
        track('report-sent', {game: GAME});
        var p = document.createElement('p'); p.className = 'gu-sent'; p.textContent = '📧 ' + (ss(K + '_child') ? ss(K + '_child') + ', your' : 'Your') + ' grown-up’s report is on its way by email.';
        cert.appendChild(p);
      })
      .catch(function () { ss(K + '_sent', ''); window.__csRecapWait = false; try { window.dispatchEvent(new Event('cs-recap-ready')); } catch (e) {} });
  }
  // put the child's name on the certificate (they already chose it on "Who's playing today?")
  function nameCert() {
    var n = ss(K + '_child'), inp = document.getElementById('nameIn'), out = document.getElementById('certName');
    if (!n || !inp || inp.dataset.csFilled) return;
    inp.dataset.csFilled = '1';
    if (!inp.value) { inp.value = n; if (out) out.textContent = n; try { inp.dispatchEvent(new Event('input', {bubbles: true})); } catch (e) {} }
  }
  /* ---------- after the certificate: what to do next (never a dead end) ---------- */
  var NEXTS = {
    '7Aa': {lesson: ['7ab', '7Ab Organs'], game: ['7ab', 'The Body Town Tour']},
    '7Ab': {lesson: ['7ac', '7Ac Tissues'], game: ['7ac', 'The Tissue Lab']},
    '7Ac': {lesson: ['7ad', '7Ad Cells'], game: ['7ad', "Celly's Cell Museum"]},
    '7Ad': {lesson: ['7ae', '7Ae Organ systems'], game: ['7ae', 'Body Town Grand Opening']},
    '7Ae': {lesson: ['7ca', '7Ca Fitness and breathing'], game: ['7ca', 'The Case of the Moving Chest']},
    '7Ca': {lesson: ['7cb', '7Cb Muscles and blood'], game: null}
  };
  var BASE = (location.pathname.match(/^\/preview-[a-z0-9-]+/) || [''])[0];
  function schoolOrder() {
    var book = ['7A', '7B', '7C', '7D', '7E', '7F', '7G', '7H', '7I', '7J', '7K', '7L'], o = null;
    try { o = JSON.parse(localStorage.getItem('cs_order') || 'null'); } catch (e) {}
    if (!o || !o.units || !o.units.length) return [];
    var out = o.units.filter(function (c) { return book.indexOf(c) >= 0; });
    book.forEach(function (c) { if (out.indexOf(c) < 0) out.push(c); });
    return out;
  }
  function nextSteps(cert) {
    if (RECAP || document.getElementById('csNext')) return;
    var n = NEXTS[GAME]; if (!n) return;
    var so = schoolOrder();
    if (so.length && /e$/.test(GAME)) {           // last lesson of a unit: go to the next unit in the school's order
      var nu = so[so.indexOf(GAME.slice(0, 2)) + 1];
      n = {lesson: nu ? [nu.toLowerCase() + 'a', nu + 'a, unit ' + nu + ' (your school\'s order)'] : n.lesson, game: n.game};
    }
    var st = document.createElement('style');
    st.textContent = '.cert .t{letter-spacing:.02em!important;text-transform:none!important;font-size:17px!important}' +
      '#csNext{margin:18px 0 6px;padding:16px 18px;border:2px solid #81A63C;border-radius:16px;background:#F6FAEE}' +
      '#csNext h2{margin:0 0 10px;font-size:22px}#csNext .row{display:flex;flex-wrap:wrap;gap:10px}' +
      '#csNext a{display:inline-flex;align-items:center;gap:.4em;min-height:48px;padding:.6em 1.1em;border-radius:999px;font-weight:600;text-decoration:none;border:2px solid #2E3F6E;color:#1F2A44;background:#fff}' +
      '#csNext a.go{background:#1F2A44;color:#fff;border-color:#1F2A44}' +
      '#csNext a.recap{background:#81A63C;border-color:#5E7F22;color:#fff;font-size:1.08em}' +
      '#csNext .recap-wait{display:inline-flex;align-items:center;min-height:48px;color:#4E7A1E;font-weight:600}' +
      '#csNext .recap-note{margin:8px 0 0;color:#4A5573;font-size:16px}';
    document.head.appendChild(st);
    var box = document.createElement('div'); box.id = 'csNext';
    var h = '<h2>What next? 🚀</h2><div class="row">' +
      '<a class="go" href="' + BASE + '/' + n.lesson[0] + '">▶ Next lesson: ' + n.lesson[1] + '</a>' +
      (n.game ? '<a href="' + BASE + '/' + 'play/' + n.game[0] + '/">🎮 Next game: ' + n.game[1] + '</a>' : '<a href="' + BASE + '/' + 'play/">🎮 All Celly games</a>') +
      '<a href="' + BASE + '/' + GAME.toLowerCase() + '">📺 Watch the ' + GAME + ' video again</a></div>';
    box.innerHTML = h;
    cert.parentNode.insertBefore(box, cert.nextSibling);
    // the report decides: if some parts need practice, Celly's recap comes first (short, and optional)
    var row = box.querySelector('.row'), hold = null;
    function showRecap() {
      var r = window.__csRecap || {};
      if (hold) { hold.remove(); hold = null; }
      if (!r.recap || !r.weak || box.querySelector('.recap')) return;
      var a = document.createElement('a'); a.className = 'go recap'; a.href = r.recap;
      a.innerHTML = '⭐ Practise the tricky bits with Celly' + (r.mins ? ' (about ' + r.mins + ' min)' : '');
      row.insertBefore(a, row.firstChild);
      var lead = row.querySelector('a.go:not(.recap)'); if (lead) lead.className = '';
      var note = document.createElement('p'); note.className = 'recap-note';
      note.textContent = 'Or do it tomorrow: your grown-up has the same link in their email.';
      row.parentNode.insertBefore(note, row.nextSibling);
      track('recap-offered', {game: GAME, weak: r.weak});
    }
    if (window.__csRecapWait) {
      hold = document.createElement('span'); hold.className = 'recap-wait'; hold.textContent = '⭐ Celly is checking which bits to practise…';
      row.insertBefore(hold, row.firstChild);
      window.addEventListener('cs-recap-ready', showRecap);
      setTimeout(function () { if (hold) { hold.remove(); hold = null; } }, 25000);
    } else if (window.__csRecap) showRecap();
    box.addEventListener('click', function (e) { var a = e.target.closest('a'); if (a) track('game-next-click', {game: GAME, to: a.getAttribute('href')}); });
  }
  new MutationObserver(function () { var c = document.querySelector('.cert'); if (c) { nameCert(); send(c); nextSteps(c); } })
    .observe(document.getElementById('card') || document.body, {childList: true, subtree: true});

  if (!RECAP && !ss(K + '_choice')) ask();
})();
