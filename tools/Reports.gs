/**
 * Celly School — game reports for grown-ups (email + PDF, no sign-in)
 *
 * A Talk to Celly game sends its results here when the child reaches the certificate,
 * but only if a grown-up typed an email and ticked "I'm this child's parent or carer".
 * This script builds a one-page PDF report and emails it from the Celly School account.
 *
 * What is kept: a log row (date, game, score, minutes, mode) in "Celly School game reports (log)".
 * The email address and the children's first names the parent gives are saved in "Celly School parent
 * emails" (Google Sheet in the Celly School folder). The parent agrees to this on the setup screen. A short one-way code of it is also held for one day
 * to stop more than 3 reports a day going to the same address.
 *
 * Deploy: Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone.
 */

var ROOT_ID = '1jSuRoxkYXvwHiUS5sM0zUgq7pfSjSxvm';   // Celly School folder
var MAX_PER_EMAIL_PER_DAY = 10;   // a family with several children may finish several games a day
var SITE = 'https://www.cellyschool.com';

// Next step after each game
var NEXT = {
  '7Aa': {t: 'the 7Ab Organs game', u: '/play/7ab/'},
  '7Ab': {t: 'the 7Ac Tissues game', u: '/play/7ac/'},
  '7Ac': {t: 'the 7Ad Cells game', u: '/play/7ad/'},
  '7Ad': {t: 'the 7Ae Organ systems game', u: '/play/7ae/'},
  '7Ae': {t: 'the 7C Muscles and bones lessons', u: '/year-7/7c'},
  '7Ca': {t: 'the 7C Muscles and bones lessons', u: '/year-7/7c'}
};

function doGet() { return out_({ok: true, service: 'Celly School game reports'}); }

function doPost(e) {
  try {
    var d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.hp) return out_({ok: true});                              // hidden spam trap was filled in
    if (d.type === 'recap') return recapResult_(d);
    var email = String(d.email || '').trim().toLowerCase();
    if (!/^[^\s@<>()",;]+@[^\s@<>()",;]+\.[a-z]{2,}$/.test(email) || email.length > 120) return out_({ok: false, why: 'email'});
    if (d.parent !== true) return out_({ok: false, why: 'parent'});
    if (!/^7[A-L][a-e]?$/.test(String(d.game || ''))) return out_({ok: false, why: 'game'});
    var res = parseResults_(d.results);
    if (!res.length) return out_({ok: false, why: 'empty'});

    if (!allow_(email)) return out_({ok: false, why: 'limit'});
    if (MailApp.getRemainingDailyQuota() < 3) return out_({ok: false, why: 'quota'});

    var r = {
      game: d.game, title: clip_(d.title, 80) || 'Talk to Celly', topic: clip_(d.topic, 80),
      minutes: Math.max(0, Math.min(240, Math.round(+d.minutes || 0))),
      mode: d.mode === 'talk' ? 'talking and tapping' : 'tapping only',
      sayAgain: Math.max(0, Math.min(999, Math.round(+d.sayAgain || 0))),
      results: res,
      child: kid_(d.child),
      meta: meta_(d.meta),
      video: /^[A-Za-z0-9_-]{11}$/.test(String(d.video || '')) ? String(d.video) : '',
      date: Utilities.formatDate(new Date(), 'Europe/London', 'd MMMM yyyy')
    };
    r.first = res.filter(function (x) { return x.ok; }).length;
    r.total = res.length;
    r.practise = uniq_(res.filter(function (x) { return !x.ok; }).map(function (x) { return x.item; }));
    r.next = NEXT[r.game] || {t: 'the next lesson', u: '/year-7'};
    r.token = makeToken_(email);
    plan_(r);

    var pdf = Utilities.newBlob(reportHtml_(r), 'text/html', 'report.html').getAs('application/pdf')
      .setName('Celly School report - ' + r.game + ' ' + r.topic + ' - ' + r.date + '.pdf');
    MailApp.sendEmail({
      to: email,
      name: 'Celly School',
      subject: (r.child ? r.child + '’s' : "Your child's") + ' Celly School report: ' + r.game + ' ' + r.topic,
      htmlBody: emailHtml_(r),
      attachments: [pdf]
    });
    log_(r, email, 'game');
    saveEmail_(email, r.game, 'report', r.child);
    return out_({ok: true});
  } catch (err) {
    console.error(err);
    return out_({ok: false, why: 'error'});
  }
}

function parseResults_(a) {
  return (Array.isArray(a) ? a : []).slice(0, 200).map(function (r) {
    var t = Math.round(+r.t), te = Math.round(+r.tEnd), rm = Math.round(+r.room);
    return {act: clip_(r.act, 60), item: clip_(r.item, 70), ok: !!r.first && r.said !== false,
      wrong: !r.first, unheard: !!r.first && r.said === false,
      room: rm >= 0 && rm <= 30 ? rm : -1, roomName: clip_(r.roomName, 40),
      t: t >= 0 && t <= 7200 ? t : -1, tEnd: te > 0 && te <= 7200 ? te : 0, chap: clip_(r.chap, 60)};
  });
}

/* ---------- what the results mean, and what to do next ---------- */
function plan_(r) {
  var pct = r.total ? r.first / r.total : 0;
  r.level = pct >= 0.85 ? {t: 'Strong', c: '#4E7A1E', s: 'Your child understood most of this lesson. A quick look at anything below is enough.'}
    : pct >= 0.6 ? {t: 'Getting there', c: '#B5651D', s: 'Most of it is in place. A few ideas need another look, and the plan below shows exactly where.'}
    : {t: 'Needs another go', c: '#B5651D', s: 'That is normal for a first try. Watch the parts below again, then replay those rooms. It usually clicks the second time.'};
  // sections in the order they were played
  var acts = uniq_(r.results.map(function (x) { return x.act; }));
  r.sections = acts.map(function (a) {
    var xs = r.results.filter(function (x) { return x.act === a; }), ok = xs.filter(function (x) { return x.ok; }).length;
    return {act: a, items: xs, ok: ok, n: xs.length,
      status: ok === xs.length ? 'Secure' : ok * 2 >= xs.length ? 'Nearly there' : 'Needs practice'};
  });
  r.strong = r.sections.filter(function (s) { return s.status === 'Secure'; }).map(function (s) { return s.act; });
  r.unheard = r.results.filter(function (x) { return x.unheard; }).map(function (x) { return x.item; });
  // video parts to watch again (only for real misunderstandings), joined by lesson part
  var watch = {}, play = {};
  r.results.forEach(function (x) {
    if (x.wrong && x.t >= 0 && r.video) {
      var k = String(x.t); (watch[k] = watch[k] || {t: x.t, tEnd: x.tEnd, chap: x.chap, items: []}).items.push(x.item);
    }
    if (!x.ok && x.room >= 0) {
      var q = String(x.room); (play[q] = play[q] || {room: x.room, name: x.roomName || x.act, items: []}).items.push(x.item + (x.unheard ? ' (saying it)' : ''));
    }
  });
  r.watch = Object.keys(watch).map(function (k) { return watch[k]; }).sort(function (a, b) { return a.t - b.t; });
  r.play = Object.keys(play).map(function (k) { return play[k]; }).sort(function (a, b) { return a.room - b.room; });
  r.watch.forEach(function (w) {
    w.url = 'https://www.youtube.com/watch?v=' + r.video + '&t=' + w.t + 's';
    w.mins = w.tEnd > w.t ? Math.max(1, Math.round((w.tEnd - w.t) / 60)) : 0;
  });
  r.play.forEach(function (p) {
    p.url = SITE + '/play/' + r.game.toLowerCase() + '/' + (p.room > 0 ? '?room=' + p.room : '');
  });
  // Celly's recap: built per part of the game, weakest first, about 12 minutes at a time
  var parts = recapParts_(r.results, r.video);
  r.recapMins = parts.mins1;
  r.recapParts = parts.p2.length ? 2 : 1;
  r.recap = parts.p1.length ? recapUrl_({g: r.game.toLowerCase(), v: r.video, s: parts.p1, n2: parts.p2,
    k: r.token || '', p: 1, of: r.recapParts, t: r.title, c: r.child}) : '';
}

var RECAP_MINUTES = 12;
function stepMins_(s) { return s.c ? Math.max(1, Math.round((s.c[1] - s.c[0]) / 60)) : 3; }
/* A part under half right gets the video part and its room. A part with one slip ("Nearly there") gets
   the room only. Secure parts are left out. Rooms are grouped, weakest first, and packed into recaps of
   about 12 minutes: part 1 now, part 2 for the next day. */
function recapParts_(results, video) {
  var acts = uniq_(results.map(function (x) { return x.act; })), score = {};
  acts.forEach(function (a) {
    var xs = results.filter(function (x) { return x.act === a; });
    score[a] = xs.filter(function (x) { return x.ok; }).length / xs.length;
  });
  var units = {}, order = [];
  results.forEach(function (x) {
    if (x.ok || score[x.act] === 1 || x.room < 0) return;
    var u = units[x.room];
    if (!u) { u = units[x.room] = {room: x.room, name: x.roomName || x.act, clips: [], score: 1}; order.push(u); }
    u.score = Math.min(u.score, score[x.act]);
    if (score[x.act] < 0.5 && x.wrong && x.t >= 0 && video &&
        !u.clips.some(function (c) { return c.c[0] === x.t; }))
      u.clips.push({c: [x.t, x.tEnd > x.t ? x.tEnd : x.t + 90], n: x.chap || 'the lesson'});
  });
  order.sort(function (a, b) { return a.score - b.score || a.room - b.room; });
  var p1 = [], p2 = [], m1 = 0, seen = {};
  order.forEach(function (u) {
    var steps = u.clips.filter(function (c) { return !seen[c.c[0]]; });
    steps.forEach(function (c) { seen[c.c[0]] = 1; });
    steps = steps.concat([{r: u.room, n: u.name}]);
    var m = steps.reduce(function (a, s) { return a + stepMins_(s); }, 0);
    if (!p1.length || m1 + m <= RECAP_MINUTES) { p1 = p1.concat(steps); m1 += m; }
    else if (p2.length < 12) p2 = p2.concat(steps).slice(0, 12);
  });
  return {p1: p1, p2: p2, mins1: m1};
}
function recapUrl_(o) {
  return SITE + '/play/recap/?p=' + Utilities.base64EncodeWebSafe(Utilities.newBlob(JSON.stringify(o)).getBytes()).replace(/=+$/, '');
}

/* ---------- the email travels inside the recap link, scrambled and signed (never stored here) ---------- */
function secret_() {
  var props = PropertiesService.getScriptProperties(), k = props.getProperty('LINK_SECRET');
  if (!k) { k = Utilities.getUuid() + Utilities.getUuid(); props.setProperty('LINK_SECRET', k); }
  return k;
}
function keystream_(id, n) {
  var out = [], i = 0;
  while (out.length < n) { out = out.concat(Utilities.computeHmacSha256Signature(id + ':' + i, secret_())); i++; }
  return out.slice(0, n);
}
function makeToken_(email) {
  var id = Utilities.getUuid().replace(/-/g, '').slice(0, 12);
  var b = Utilities.newBlob(email).getBytes(), ks = keystream_(id, b.length);
  var enc = Utilities.base64EncodeWebSafe(b.map(function (x, i) { return (x ^ ks[i]) << 24 >> 24; })).replace(/=+$/, '');
  return id + '.' + enc + '.' + sign_(id + '.' + enc);
}
function sign_(s) { return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(s, secret_())).slice(0, 16); }
function readToken_(tok) {
  var m = /^([a-f0-9]{12})\.([A-Za-z0-9_-]{2,200})\.([A-Za-z0-9_-]{16})$/.exec(String(tok || ''));
  if (!m || sign_(m[1] + '.' + m[2]) !== m[3]) return null;
  var pad = m[2] + '==='.slice((m[2].length + 3) % 4), b = Utilities.base64DecodeWebSafe(pad), ks = keystream_(m[1], b.length);
  return {id: m[1], email: Utilities.newBlob(b.map(function (x, i) { return (x ^ ks[i]) << 24 >> 24; })).getDataAsString()};
}

/* ---------- after a recap: what is secure now, and a short recap 2 for tomorrow ---------- */
function recapResult_(d) {
  var t = readToken_(d.k);
  if (!t) return out_({ok: false, why: 'token'});
  if (!/^7[A-L][a-e]?$/.test(String(d.game || ''))) return out_({ok: false, why: 'game'});
  var props = PropertiesService.getScriptProperties(), key = 'rk_' + t.id, n = +(props.getProperty(key) || 0);
  if (n >= 3) return out_({ok: false, why: 'limit'});
  props.setProperty(key, String(n + 1));
  var res = parseResults_(d.results);
  if (!res.length) return out_({ok: false, why: 'empty'});
  var video = /^[A-Za-z0-9_-]{11}$/.test(String(d.video || '')) ? String(d.video) : '';
  var nowOk = uniq_(res.filter(function (x) { return x.ok; }).map(function (x) { return x.item; }));
  var still = uniq_(res.filter(function (x) { return !x.ok; }).map(function (x) { return x.item; }));
  // recap 2 = whatever is still weak now, then the rest of the original plan, capped again at about 12 minutes
  var parts = recapParts_(res, video), steps = parts.p1, seen = {}, mins = parts.mins1;
  steps.forEach(function (s) { seen[s.c ? 'c' + s.c[0] : 'r' + s.r] = 1; });
  (Array.isArray(d.n2) ? d.n2 : []).slice(0, 12).forEach(function (s) {
    var st = s && s.c && s.c.length === 2 ? {c: [Math.round(+s.c[0]) || 0, Math.round(+s.c[1]) || 0], n: clip_(s.n, 60)}
      : s && s.r >= 0 && s.r <= 30 ? {r: Math.round(+s.r), n: clip_(s.n, 40)} : null;
    if (!st) return;
    var k2 = st.c ? 'c' + st.c[0] : 'r' + st.r;
    if (seen[k2] || mins + stepMins_(st) > RECAP_MINUTES + 3) return;
    seen[k2] = 1; steps.push(st); mins += stepMins_(st);
  });
  var title = clip_(d.title, 80) || 'Talk to Celly', game = d.game, child = kid_(d.child);
  var next = steps.length ? recapUrl_({g: game.toLowerCase(), v: video, s: steps, n2: [], k: d.k, p: 2, of: 2, t: title, c: child}) : '';
  var pp = 'font-family:Verdana,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1F2A44;margin:0 0 12px';
  var html = '<div style="max-width:580px;font-family:Verdana,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1F2A44">' +
    '<p style="' + pp + '">Hello,</p>' +
    '<p style="' + pp + '">' + (child ? esc_(child) : 'Your child') + ' has just finished <b>Celly’s recap</b> for <b>' + esc_(title) + '</b> (' + esc_(game) + ').</p>' +
    (nowOk.length ? '<p style="' + pp + '"><b style="color:#4E7A1E">Now secure:</b> ' + esc_(list_(nowOk)) + '. Well done!</p>' : '') +
    (still.length ? '<p style="' + pp + '"><b style="color:#B5651D">Still tricky:</b> ' + esc_(list_(still)) + '. That is fine. Ideas often click after a night’s sleep.</p>' : '') +
    (next ? '<p style="margin:14px 0 6px"><a href="' + next + '" style="display:inline-block;background:#2B3A67;color:#ffffff;text-decoration:none;font-weight:bold;font-size:17px;padding:12px 20px;border-radius:12px">▶ Recap 2, for tomorrow (about ' + mins + ' min)</a></p>' +
      '<p style="' + pp + '">It covers what is still tricky' + (Array.isArray(d.n2) && d.n2.length ? ' and the parts that did not fit in today’s recap' : '') + '. Short and often works best.</p>'
      : '<p style="' + pp + '"><b>Everything from the report is secure now.</b> Your child is ready for ' + esc_((NEXT[game] || {t: 'the next lesson'}).t) + '.</p>') +
    '<p style="' + pp + '">Celly School</p>' +
    '<p style="font-size:12px;line-height:1.5;color:#56607A;margin-top:20px">You got this because a Celly School recap was finished from a report sent to this address. ' +
    'We never share your email address. To stop these emails or delete your address, reply to this email. <a href="' + SITE + '/privacy">Privacy</a></p></div>';
  if (MailApp.getRemainingDailyQuota() < 3) return out_({ok: false, why: 'quota'});
  MailApp.sendEmail({to: t.email, name: 'Celly School', subject: (child ? child + '’s recap result: ' : 'Celly’s recap result: ') + game + ' ' + (still.length ? '(recap 2 ready)' : '(all secure)'), htmlBody: html});
  saveEmail_(t.email, game, 'recap', child);
  log_({game: game, topic: '', child: child, results: res, first: res.filter(function (x) { return x.ok; }).length, total: res.length, mode: 'recap', minutes: 0, sayAgain: 0}, t.email, 'recap');
  return out_({ok: true});
}

function mmss_(s) { return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
function list_(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
function dot_(s) { return /[.!?]$/.test(s) ? s : s + '.'; }

function planPdf_(r) {
  var h = '';
  if (r.recap) h += '<p style="margin:8px 0 4px"><a href="' + r.recap + '" style="display:inline-block;background:#2B3A67;color:#ffffff;text-decoration:none;font-weight:bold;font-size:11pt;padding:7px 14px;border-radius:10px">▶ Start Celly’s recap (about ' + r.recapMins + ' min)</a>' +
    '<span style="margin-left:10px;color:#56607A;font-size:9pt">' + (r.recapParts > 1 ? 'Recap 1 of 2, trickiest parts first. ' : '') + 'Video part, then its game room, in order. Your child just presses Next.</span></p>';
  var w = r.watch.map(function (x) { return '<div style="margin:0 0 3px"><a href="' + x.url + '" style="color:#2B5BA8;font-weight:bold">▶ ' + esc_(x.chap) + ' (' + mmss_(x.t) + ')</a> <span style="color:#56607A">' + esc_(list_(x.items)) + '</span></div>'; }).join('');
  var g = r.play.map(function (x) { return '<div style="margin:0 0 3px"><a href="' + x.url + '" style="color:#2B5BA8;font-weight:bold">🎮 ' + esc_(x.name) + '</a> <span style="color:#56607A">' + esc_(list_(x.items)) + '</span></div>'; }).join('');
  if (!w && !g) return '<p>Nothing to repeat. Move on to ' + esc_(r.next.t) + ' when your child is ready.</p>';
  return h + '<table style="width:100%;border-collapse:collapse;table-layout:fixed;font-size:9.5pt;margin-top:4px"><tr>' +
    '<td style="width:50%;vertical-align:top;padding-right:10px"><div style="font-weight:bold;margin:0 0 4px">1. Watch these parts again</div>' + (w || '<span style="color:#56607A">None needed.</span>') + '</td>' +
    '<td style="vertical-align:top;padding-left:10px;border-left:1px solid #D9E5C4"><div style="font-weight:bold;margin:0 0 4px">2. Then replay these rooms</div>' + (g || '<span style="color:#56607A">None needed.</span>') + '</td></tr></table>';
}

function planHtml_(r, big) {
  var li = big ? 'margin:0 0 4px;line-height:1.4' : 'margin:0 0 10px;line-height:1.5', h = '';
  if (r.recap) {
    h += '<p style="margin:14px 0 6px"><a href="' + r.recap + '" style="display:inline-block;background:#2B3A67;color:#ffffff;text-decoration:none;font-weight:bold;' +
      'font-size:' + (big ? '13pt' : '17px') + ';padding:12px 20px;border-radius:12px">▶ Start Celly’s recap (about ' + r.recapMins + ' min)</a></p>' +
      (r.recapParts > 1 ? '<p style="margin:0 0 6px"><b>This is recap 1 of 2.</b> It starts with the trickiest parts. Recap 2 comes by email when recap 1 is finished, for the next day.</p>' : '') +
      '<p style="margin:0 0 6px">One link does it all. It plays each tricky part of the video, then opens the matching room of the game, in order. ' +
      'When a room is finished it comes back by itself, so your child just presses <b>Next</b>.</p>' +
      '<p style="margin:14px 0 0;color:#56607A">Or pick a part yourself:</p>';
  }
  if (r.watch.length) {
    h += '<p style="margin:14px 0 6px;font-weight:bold">1. Watch these parts of the lesson again</p><ul style="margin:0;padding-left:20px">';
    r.watch.forEach(function (w) {
      h += '<li style="' + li + '"><a href="' + w.url + '" style="color:#2B5BA8;font-weight:bold">▶ “' + esc_(w.chap) + '” from ' + mmss_(w.t) + '</a>' +
        (w.mins ? ' (about ' + w.mins + ' min)' : '') + '<br><span style="color:#56607A">Because of: ' + esc_(list_(w.items)) + '</span></li>';
    });
    h += '</ul>';
  }
  if (r.play.length) {
    h += '<p style="margin:14px 0 6px;font-weight:bold">' + (r.watch.length ? '2' : '1') + '. Then play these rooms of the game again</p><ul style="margin:0;padding-left:20px">';
    r.play.forEach(function (p) {
      h += '<li style="' + li + '"><a href="' + p.url + '" style="color:#2B5BA8;font-weight:bold">🎮 ' + esc_(p.name) + '</a>' +
        '<br><span style="color:#56607A">To practise: ' + esc_(list_(p.items)) + '</span></li>';
    });
    h += '</ul>';
  }
  if (!r.watch.length && !r.play.length) h = '<p>Nothing to repeat. Move on to ' + esc_(r.next.t) + ' when your child is ready.</p>';
  else if (big) h += '<p style="margin:12px 0 0;color:#56607A;font-size:10.5pt">Short and often works best: one video part and one room in a sitting is plenty.</p>';
  return h;
}

/* ---------- report (PDF) ---------- */
function reportHtml_(r) {
  // one row per part of the game: score, status and only the answers that need work
  var rows = r.sections.map(function (s, i) {
    var col = s.status === 'Secure' ? '#4E7A1E' : '#B5651D', bg = s.status === 'Secure' ? '#EEF5E1' : '#FBEEDD';
    var weak = s.items.filter(function (x) { return !x.ok; }).map(function (x) { return esc_(x.item) + (x.unheard ? ' <i style="color:#56607A">(Celly couldn’t hear it)</i>' : ''); });
    var td = 'padding:6px 8px;border-bottom:1px solid #EEE9DA;vertical-align:top;' + (i % 2 ? 'background:#FCFAF3;' : '');
    return '<tr><td style="' + td + 'font-weight:bold">' + esc_(cap_(s.act)) + '</td>' +
      '<td style="' + td + 'text-align:center;font-weight:bold">' + s.ok + ' / ' + s.n + '</td>' +
      '<td style="' + td + 'text-align:center"><span style="display:inline-block;padding:1px 8px;border-radius:10px;background:' + bg + ';color:' + col + ';font-weight:bold;font-size:9.5pt">' + s.status + '</span></td>' +
      '<td style="' + td + 'color:' + (weak.length ? '#1F2A44' : '#56607A') + '">' + (weak.length ? weak.join(', ') : 'All secure') + '</td></tr>';
  }).join('');
  var th = 'padding:6px 8px;text-align:left;font-size:9.5pt;color:#56607A;border-bottom:2px solid #E4DFCF';
  return '<html><head><meta charset="utf-8"></head><body style="font-family:Verdana,Arial,sans-serif;font-size:10.5pt;color:#1F2A44;line-height:1.45;margin:22px">' +
    '<div style="border:4px double #81A63C;border-radius:14px;padding:12px 18px;background:#FAF6E9">' +
    '<div style="font-size:9pt;letter-spacing:2px;color:#56607A">CELLY SCHOOL · REPORT FOR GROWN-UPS</div>' +
    '<div style="font-size:17pt;font-weight:bold;margin:4px 0 0">' + esc_(r.title) + '</div>' +
    '<div style="color:#56607A">' + (r.child ? '<b style="color:#1F2A44">Report for ' + esc_(r.child) + '</b> · ' : '') + 'Talk to Celly · ' + esc_(r.game + ' ' + r.topic) + ' · ' + esc_(r.date) + '</div></div>' +
    '<table style="width:100%;margin:10px 0 6px;border-collapse:separate;border-spacing:6px 0;table-layout:fixed"><tr>' +
    box_('Right first time', r.first + ' of ' + r.total) + box_('Overall', r.level.t) + box_('Time', (r.minutes || '<1') + ' min') +
    box_('Played by', r.mode) + box_('"Say it again"', String(r.sayAgain)) + '</tr></table>' +
    '<p style="margin:8px 0 4px"><b style="color:' + r.level.c + '">' + r.level.t + '.</b> ' + esc_(r.level.s) + '</p>' +
    '<div style="font-size:12.5pt;font-weight:bold;margin:12px 0 4px">How each part went</div>' +
    '<table style="width:100%;border-collapse:collapse;font-size:10pt;table-layout:fixed">' +
    '<tr><th style="' + th + ';width:26%">Part of the game</th><th style="' + th + ';width:10%;text-align:center">Score</th>' +
    '<th style="' + th + ';width:20%;text-align:center">Status</th><th style="' + th + '">Needs another go</th></tr>' + rows + '</table>' +
    '<p style="margin:6px 0 0;font-size:9pt;color:#56607A">“Needs another go” means your child got there with help. It is not a mark. “Celly couldn’t hear it” is usually the microphone, not your child’s knowledge.</p>' +
    '<div style="border:2px solid #81A63C;border-radius:12px;padding:2px 14px 8px;margin:12px 0 0;background:#F6FAEE;font-size:10pt">' +
    '<div style="font-size:12.5pt;font-weight:bold;margin:8px 0 0">What to do next</div>' + planPdf_(r) + '<div style="font-size:8.5pt;color:#56607A;margin-top:4px">Short and often works best: one video part and one room in a sitting is plenty.</div></div>' +
    '<p style="margin:10px 0 0"><b>After that:</b> ' + esc_(r.next.t) + ' at ' + SITE.replace('https://', '') + r.next.u + '</p>' +
    '<p style="font-size:8.5pt;color:#56607A;margin-top:8px">Celly School · free, dyslexia-friendly KS3 science · www.cellyschool.com</p>' +
    '</body></html>';
}
function box_(k, v) {
  return '<td style="width:20%;height:58px;vertical-align:top;text-align:center;border:2px solid #E4DFCF;border-radius:10px;padding:7px 6px;background:#FFFFFF">' +
    '<div style="font-size:9pt;color:#56607A;line-height:1.3">' + k + '</div><div style="font-size:12pt;font-weight:bold;line-height:1.25">' + esc_(v) + '</div></td>';
}

/* ---------- email ---------- */
function emailHtml_(r) {
  var p = 'font-family:Verdana,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1F2A44;margin:0 0 12px';
  return '<div style="max-width:580px;font-family:Verdana,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1F2A44">' +
    '<p style="' + p + '">Hello,</p>' +
    '<p style="' + p + '">' + who_(r) + ' has just finished <b>' + esc_(r.title) + '</b> (' + esc_(r.game + ' ' + r.topic) + ') on Celly School: ' +
    '<b>' + r.first + ' of ' + r.total + '</b> right first time, in about ' + (r.minutes || 1) + ' minutes.</p>' +
    '<p style="' + p + '"><b style="color:' + r.level.c + '">' + r.level.t + '.</b> ' + esc_(r.level.s) + '</p>' +
    (r.strong.length ? '<p style="' + p + '"><b>Strong in:</b> ' + esc_(list_(r.strong)) + '.</p>' : '') +
    '<div style="border:2px solid #81A63C;border-radius:12px;padding:4px 16px 8px;margin:0 0 14px;background:#F6FAEE">' +
    '<p style="margin:10px 0 0;font-weight:bold;font-size:16px">What to do next</p>' + planHtml_(r, false) + '</div>' +
    '<p style="' + p + '">The full report, with every answer, is attached as a PDF.</p>' +
    '<p style="' + p + '">Celly School</p>' +
    '<p style="font-size:12px;line-height:1.5;color:#56607A;margin-top:20px">' +
    'You got this email because someone typed this address into a Celly School game and ticked “I’m this child’s parent or carer”. ' +
    'If that wasn’t you, reply and we will delete the address. We never share it. <a href="' + SITE + '/privacy">Privacy</a></p></div>';
}

/* ---------- helpers ---------- */
function allow_(email) {
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var props = PropertiesService.getScriptProperties();
    var day = Utilities.formatDate(new Date(), 'UTC', 'yyyyMMdd');
    var all = props.getProperties();
    Object.keys(all).forEach(function (k) { if (/^r_/.test(k) && k.indexOf('r_' + day + '_') !== 0) props.deleteProperty(k); });
    var h = Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, email + '|celly')).slice(0, 16);
    var k = 'r_' + day + '_' + h, n = +(all[k] || 0);
    if (n >= MAX_PER_EMAIL_PER_DAY) return false;
    props.setProperty(k, String(n + 1));
    return true;
  } finally { lock.releaseLock(); }
}

/* ---------- the log: every game and recap, every answer, and each child's progress ----------
   One spreadsheet "Celly School game reports (log)" with three tabs: Sessions, Answers, Progress by child. */
function tab_(ss, name, head) {
  var sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(head); sh.setFrozenRows(1); sh.getRange(1, 1, 1, head.length).setFontWeight('bold'); }
  return sh;
}
function logBook_() {
  var root = DriveApp.getFolderById(ROOT_ID), name = 'Celly School game reports (log)', it = root.getFilesByName(name);
  if (it.hasNext()) return SpreadsheetApp.open(it.next());
  var ss = SpreadsheetApp.create(name); DriveApp.getFileById(ss.getId()).moveTo(root); return ss;
}
function log_(r, email, type) {
  try {
    var lock = LockService.getScriptLock(); lock.waitLock(15000);
    try {
      var ss = logBook_(), now = new Date(), id = Utilities.getUuid().slice(0, 8), type_ = type || 'game';
      var pct = r.total ? Math.round(r.first / r.total * 100) : 0;
      var secs = r.sections || [], cnt = function (st) { return secs.filter(function (x) { return x.status === st; }).length; };
      var weak = uniq_(r.results.filter(function (x) { return x.wrong; }).map(function (x) { return x.item; }));
      var unheard = uniq_(r.results.filter(function (x) { return x.unheard; }).map(function (x) { return x.item; }));
      var M = r.meta || {}, rooms = (M.rooms || []).slice().sort(function (a, b) { return a.room - b.room; });
      var slow = rooms.slice().sort(function (a, b) { return b.secs - a.secs; })[0];
      tab_(ss, 'Sessions', ['Date', 'Session', 'Parent email', 'Child', 'Game', 'Topic', 'Type', 'Right first time', 'Out of', '%', 'Level',
        'Minutes', 'Mode', 'Say it again', 'Parts secure', 'Parts nearly there', 'Parts needing practice', 'Needs another go', 'Celly couldn’t hear', 'Recap minutes', 'Recap parts',
        'Device', 'Browser', 'System', 'Screen', 'Language', 'Time zone', 'Came from', 'Voice muted', 'Talk/tap switches', 'Speech recognition available', 'Game version', 'Children on device', 'Slowest room', 'Room times'])
        .appendRow([now, id, email || '', r.child || '', r.game, r.topic || '', type_, r.first, r.total, pct, (r.level || {}).t || '',
          r.minutes || 0, r.mode || '', r.sayAgain || 0, cnt('Secure'), cnt('Nearly there'), cnt('Needs practice'), weak.join(', '), unheard.join(', '),
          r.recapMins || 0, r.recapParts || 0,
          M.device || '', M.browser || '', M.os || '', M.screen || '', M.lang || '', M.tz || '', M.from || '', M.muted ? 'yes' : 'no', M.modeSwitches || 0,
          M.speech ? 'yes' : 'no', M.version || '', M.family || 0, slow ? slow.name + ' (' + slow.secs + 's)' : '',
          rooms.map(function (x) { return x.name + ' ' + x.secs + 's' + (x.again ? ' / ' + x.again + ' again' : ''); }).join('; ')]);
      if (rooms.length) {
        var rt = tab_(ss, 'Room times', ['Date', 'Session', 'Child', 'Game', 'Room', 'Seconds', 'Say it again', 'Device']);
        rt.getRange(rt.getLastRow() + 1, 1, rooms.length, 8).setValues(rooms.map(function (x) { return [now, id, r.child || '', r.game, x.name, x.secs, x.again, M.device || '']; }));
      }
      var ans = tab_(ss, 'Answers', ['Date', 'Session', 'Child', 'Game', 'Type', 'Part of the game', 'Answer', 'Right first time', 'Celly heard it', 'Video part', 'Video time', 'Room']);
      var rows = r.results.map(function (x) {
        return [now, id, r.child || '', r.game, type_, x.act, x.item, x.wrong ? 'no' : 'yes', x.unheard ? 'no' : 'yes', x.chap || '', x.t >= 0 ? mmss_(x.t) : '', x.roomName || ''];
      });
      if (rows.length) ans.getRange(ans.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
      // progress: one row per parent + child + game
      var pr = tab_(ss, 'Progress by child', ['Parent email', 'Child', 'Game', 'First played', 'Last played', 'Games played', 'Recaps finished',
        'First score %', 'Latest score %', 'Best score %', 'Still tricky (latest)']);
      var data = pr.getDataRange().getValues(), key = (email || '') + '|' + (r.child || '') + '|' + r.game, tricky = uniq_(weak.concat(unheard)).join(', ');
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] + '|' + data[i][1] + '|' + data[i][2] === key) {
          if (type_ === 'game') pr.getRange(i + 1, 5, 1, 7).setValues([[now, (+data[i][5] || 0) + 1, +data[i][6] || 0, data[i][7], pct, Math.max(+data[i][9] || 0, pct), tricky]]);
          else pr.getRange(i + 1, 5, 1, 7).setValues([[now, +data[i][5] || 0, (+data[i][6] || 0) + 1, data[i][7], data[i][8], data[i][9], tricky]]);
          return;
        }
      }
      pr.appendRow([email || '', r.child || '', r.game, now, now, type_ === 'game' ? 1 : 0, type_ === 'recap' ? 1 : 0,
        type_ === 'game' ? pct : '', type_ === 'game' ? pct : '', type_ === 'game' ? pct : '', tricky]);
    } finally { lock.releaseLock(); }
  } catch (e) { console.error('log: ' + e); }
}

function saveEmail_(email, game, kind, child) {
  try {
    var lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {
      var root = DriveApp.getFolderById(ROOT_ID), name = 'Celly School parent emails', it = root.getFilesByName(name), ss;
      var head = ['Email', 'First seen', 'Last activity', 'Games', 'Reports', 'Recaps finished', 'News consent', 'Children'];
      if (it.hasNext()) ss = SpreadsheetApp.open(it.next());
      else { ss = SpreadsheetApp.create(name); DriveApp.getFileById(ss.getId()).moveTo(root); ss.getSheets()[0].setFrozenRows(1); }
      var sh = ss.getSheets()[0];
      if (sh.getLastRow() === 0 || sh.getRange(1, 8).getValue() !== 'Children') sh.getRange(1, 1, 1, head.length).setValues([head]);
      var rows = sh.getDataRange().getValues(), now = new Date();
      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0]).toLowerCase() === email) {
          var gl = String(rows[i][3] || '') ? String(rows[i][3]).split(', ') : [];
          if (gl.indexOf(game) < 0) gl.push(game);
          var kl = String(rows[i][7] || '') ? String(rows[i][7]).split(', ') : [];
          if (child && kl.indexOf(child) < 0) kl.push(child);
          sh.getRange(i + 1, 3, 1, 4).setValues([[now, gl.join(', '), (+rows[i][4] || 0) + (kind === 'report' ? 1 : 0), (+rows[i][5] || 0) + (kind === 'recap' ? 1 : 0)]]);
          sh.getRange(i + 1, 8).setValue(kl.join(', '));
          return;
        }
      }
      sh.appendRow([email, now, now, game, kind === 'report' ? 1 : 0, kind === 'recap' ? 1 : 0, 'not asked', child || '']);
    } finally { lock.releaseLock(); }
  } catch (e) { console.error('saveEmail: ' + e); }
}

function meta_(m) {
  m = m && typeof m === 'object' ? m : {};
  var rooms = (Array.isArray(m.rooms) ? m.rooms : []).slice(0, 30).map(function (x) {
    return {room: Math.max(0, Math.min(30, Math.round(+x.room) || 0)), name: clip_(x.name, 40), secs: Math.max(0, Math.min(36000, Math.round(+x.secs) || 0)), again: Math.max(0, Math.min(999, Math.round(+x.again) || 0))};
  });
  return {device: clip_(m.device, 12), browser: clip_(m.browser, 12), os: clip_(m.os, 12), screen: clip_(m.screen, 12), lang: clip_(m.lang, 12),
    tz: clip_(m.tz, 40), from: clip_(m.from, 60), rooms: rooms, muted: !!m.muted, modeSwitches: Math.min(99, Math.round(+m.modeSwitches) || 0),
    speech: !!m.speech, version: clip_(m.version, 12), family: Math.min(9, Math.round(+m.family) || 0)};
}
function kid_(s) { return clip_(String(s || '').replace(/[<>"\\]/g, ''), 24); }
function who_(r) { return r.child ? esc_(r.child) : 'Your child'; }

function clip_(s, n) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, n); }
function cap_(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function uniq_(a) { var o = []; a.forEach(function (x) { if (o.indexOf(x) < 0) o.push(x); }); return o; }
function esc_(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// Run this once from the editor to send yourself a sample report (and to allow the permissions).
function testReport() {
  var me = Session.getEffectiveUser().getEmail();
  var res = doPost({postData: {contents: JSON.stringify({
    email: me, parent: true, game: '7Aa', title: "Dr Celly's Clinic", topic: 'Life processes', minutes: 14, mode: 'talk', sayAgain: 3,
    results: [{act: 'life processes', item: 'movement', first: true}, {act: 'life processes', item: 'respiration', first: false},
              {act: 'words', item: 'excretion', first: true, said: false}, {act: 'words', item: 'nutrition', first: true, said: true}]
  })}});
  Logger.log(res.getContent());
}
