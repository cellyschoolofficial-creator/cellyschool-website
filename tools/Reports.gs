/**
 * Celly School — game reports for grown-ups (email + PDF, no sign-in)
 *
 * A Talk to Celly game sends its results here when the child reaches the certificate,
 * but only if a grown-up typed an email and ticked "I'm this child's parent or carer".
 * This script builds a one-page PDF report and emails it from the Celly School account.
 *
 * What is kept: a log row (date, game, score, minutes, mode) in "Celly School game reports (log)".
 * The email address is NOT kept. A short one-way code of it is held for one day only,
 * to stop more than 3 reports a day going to the same address.
 *
 * Deploy: Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone.
 */

var ROOT_ID = '1jSuRoxkYXvwHiUS5sM0zUgq7pfSjSxvm';   // Celly School folder
var MAX_PER_EMAIL_PER_DAY = 3;
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
    var email = String(d.email || '').trim().toLowerCase();
    if (!/^[^\s@<>()",;]+@[^\s@<>()",;]+\.[a-z]{2,}$/.test(email) || email.length > 120) return out_({ok: false, why: 'email'});
    if (d.parent !== true) return out_({ok: false, why: 'parent'});
    if (!/^7[A-L][a-e]?$/.test(String(d.game || ''))) return out_({ok: false, why: 'game'});
    var res = (Array.isArray(d.results) ? d.results : []).slice(0, 200).map(function (r) {
      var t = Math.round(+r.t), te = Math.round(+r.tEnd), rm = Math.round(+r.room);
      return {act: clip_(r.act, 60), item: clip_(r.item, 70), ok: !!r.first && r.said !== false,
        wrong: !r.first, unheard: !!r.first && r.said === false,
        room: rm >= 0 && rm <= 30 ? rm : -1, roomName: clip_(r.roomName, 40),
        t: t >= 0 && t <= 7200 ? t : -1, tEnd: te > 0 && te <= 7200 ? te : 0, chap: clip_(r.chap, 60)};
    });
    if (!res.length) return out_({ok: false, why: 'empty'});

    if (!allow_(email)) return out_({ok: false, why: 'limit'});
    if (MailApp.getRemainingDailyQuota() < 3) return out_({ok: false, why: 'quota'});

    var r = {
      game: d.game, title: clip_(d.title, 80) || 'Talk to Celly', topic: clip_(d.topic, 80),
      minutes: Math.max(0, Math.min(240, Math.round(+d.minutes || 0))),
      mode: d.mode === 'talk' ? 'talking and tapping' : 'tapping only',
      sayAgain: Math.max(0, Math.min(999, Math.round(+d.sayAgain || 0))),
      results: res,
      video: /^[A-Za-z0-9_-]{11}$/.test(String(d.video || '')) ? String(d.video) : '',
      date: Utilities.formatDate(new Date(), 'Europe/London', 'd MMMM yyyy')
    };
    r.first = res.filter(function (x) { return x.ok; }).length;
    r.total = res.length;
    r.practise = uniq_(res.filter(function (x) { return !x.ok; }).map(function (x) { return x.item; }));
    r.next = NEXT[r.game] || {t: 'the next lesson', u: '/year-7'};
    plan_(r);

    var pdf = Utilities.newBlob(reportHtml_(r), 'text/html', 'report.html').getAs('application/pdf')
      .setName('Celly School report - ' + r.game + ' ' + r.topic + ' - ' + r.date + '.pdf');
    MailApp.sendEmail({
      to: email,
      name: 'Celly School',
      subject: "Your child's Celly School report: " + r.game + ' ' + r.topic,
      htmlBody: emailHtml_(r),
      attachments: [pdf]
    });
    log_(r);
    return out_({ok: true});
  } catch (err) {
    console.error(err);
    return out_({ok: false, why: 'error'});
  }
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
  // one automatic recap: each weak video part, then the game room that practises it, in game order
  var steps = [], seen = {};
  r.results.filter(function (x) { return !x.ok; }).sort(function (a, b) { return a.room - b.room; }).forEach(function (x) {
    if (x.wrong && x.t >= 0 && r.video && !seen['c' + x.t]) {
      seen['c' + x.t] = 1; steps.push({c: [x.t, x.tEnd > x.t ? x.tEnd : x.t + 90], n: x.chap || 'the lesson'});
    }
    if (x.room >= 0 && !seen['r' + x.room]) { seen['r' + x.room] = 1; steps.push({r: x.room, n: x.roomName || x.act}); }
  });
  steps = steps.slice(0, 12);
  r.recapMins = steps.reduce(function (a, s) { return a + (s.c ? Math.max(1, Math.round((s.c[1] - s.c[0]) / 60)) : 3); }, 0);
  r.recap = steps.length ? SITE + '/play/recap/?p=' + Utilities.base64EncodeWebSafe(Utilities.newBlob(JSON.stringify(
    {g: r.game.toLowerCase(), v: r.video, s: steps})).getBytes()).replace(/=+$/, '') : '';
}
function mmss_(s) { return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
function list_(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
function dot_(s) { return /[.!?]$/.test(s) ? s : s + '.'; }

function planHtml_(r, big) {
  var li = 'margin:0 0 10px;line-height:1.5', h = '';
  if (r.recap) {
    h += '<p style="margin:14px 0 6px"><a href="' + r.recap + '" style="display:inline-block;background:#2B3A67;color:#ffffff;text-decoration:none;font-weight:bold;' +
      'font-size:' + (big ? '13pt' : '17px') + ';padding:12px 20px;border-radius:12px">▶ Start Celly’s recap (about ' + r.recapMins + ' min)</a></p>' +
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
  var rows = r.sections.map(function (s) {
    var col = s.status === 'Secure' ? '#4E7A1E' : '#B5651D';
    var items = s.items.map(function (x) {
      var st = x.ok ? '<span style="color:#4E7A1E">Secure</span>' : x.unheard ? '<span style="color:#56607A">Celly couldn’t hear it clearly</span>'
        : '<span style="color:#B5651D">Needs another go</span>';
      return '<tr><td style="padding:3px 8px 3px 22px;border-bottom:1px solid #EEE9DA">' + esc_(x.item) + '</td><td style="padding:3px 8px;border-bottom:1px solid #EEE9DA;font-weight:bold">' + st + '</td></tr>';
    }).join('');
    return '<tr><td style="padding:10px 8px 4px;font-weight:bold">' + esc_(cap_(s.act)) + '</td><td style="padding:10px 8px 4px;font-weight:bold;color:' + col + '">' +
      s.ok + ' of ' + s.n + ' · ' + s.status + '</td></tr>' + items;
  }).join('');
  var heard = r.unheard.length ? '<p style="font-size:10.5pt;color:#56607A">Celly couldn’t hear ' + esc_(list_(r.unheard)) +
    ' clearly. That is usually the microphone or a noisy room, not your child’s knowledge. Saying the word slowly in beats (tapping each part) helps.</p>' : '';
  return '<html><head><meta charset="utf-8"></head><body style="font-family:Verdana,Arial,sans-serif;font-size:11.5pt;color:#1F2A44;line-height:1.5;margin:26px">' +
    '<div style="border:4px double #81A63C;border-radius:14px;padding:16px 20px;background:#FAF6E9">' +
    '<div style="font-size:10pt;letter-spacing:2px;color:#56607A">CELLY SCHOOL · REPORT FOR GROWN-UPS</div>' +
    '<h1 style="font-size:19pt;margin:6px 0 2px">' + esc_(r.title) + '</h1>' +
    '<div style="color:#56607A">Talk to Celly · ' + esc_(r.game + ' ' + r.topic) + ' · ' + esc_(r.date) + '</div></div>' +
    '<table style="width:100%;margin:14px 0 6px;border-collapse:collapse"><tr>' +
    box_('Right first time', r.first + ' of ' + r.total) + box_('Overall', r.level.t) + box_('Time', (r.minutes || '<1') + ' min') +
    box_('Played by', r.mode) + box_('"Say it again"', String(r.sayAgain)) + '</tr></table>' +
    '<p style="margin:8px 0"><b style="color:' + r.level.c + '">' + r.level.t + '.</b> ' + esc_(r.level.s) + '</p>' +
    (r.strong.length ? '<p style="margin:8px 0"><b>Strong in:</b> ' + esc_(list_(r.strong)) + '.</p>' : '') +
    '<div style="border:2px solid #81A63C;border-radius:12px;padding:6px 16px 12px;margin:14px 0;background:#F6FAEE">' +
    '<h2 style="font-size:13.5pt;margin:8px 0 0">What to do next</h2>' + planHtml_(r, true) + '</div>' +
    '<h2 style="font-size:13.5pt;margin:18px 0 4px">How each part went</h2>' +
    '<table style="width:100%;border-collapse:collapse;font-size:10.5pt">' + rows + '</table>' + heard +
    '<p style="font-size:10pt;color:#56607A">“Needs another go” means your child got there with help. It is not a mark. A child who says “say it again” a lot is using a good strategy, not struggling.</p>' +
    '<p style="margin-top:12px"><b>After that:</b> ' + esc_(r.next.t) + ' at ' + SITE.replace('https://', '') + r.next.u + '</p>' +
    '<p style="font-size:9.5pt;color:#56607A;margin-top:16px">Celly School · free, dyslexia-friendly KS3 science · www.cellyschool.com</p>' +
    '</body></html>';
}
function box_(k, v) {
  return '<td style="width:20%;padding:3px"><div style="border:2px solid #E4DFCF;border-radius:10px;padding:6px;text-align:center">' +
    '<div style="font-size:9pt;color:#56607A">' + k + '</div><div style="font-size:12.5pt;font-weight:bold">' + esc_(v) + '</div></div></td>';
}

/* ---------- email ---------- */
function emailHtml_(r) {
  var p = 'font-family:Verdana,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1F2A44;margin:0 0 12px';
  return '<div style="max-width:580px;font-family:Verdana,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1F2A44">' +
    '<p style="' + p + '">Hello,</p>' +
    '<p style="' + p + '">Your child has just finished <b>' + esc_(r.title) + '</b> (' + esc_(r.game + ' ' + r.topic) + ') on Celly School: ' +
    '<b>' + r.first + ' of ' + r.total + '</b> right first time, in about ' + (r.minutes || 1) + ' minutes.</p>' +
    '<p style="' + p + '"><b style="color:' + r.level.c + '">' + r.level.t + '.</b> ' + esc_(r.level.s) + '</p>' +
    (r.strong.length ? '<p style="' + p + '"><b>Strong in:</b> ' + esc_(list_(r.strong)) + '.</p>' : '') +
    '<div style="border:2px solid #81A63C;border-radius:12px;padding:4px 16px 8px;margin:0 0 14px;background:#F6FAEE">' +
    '<p style="margin:10px 0 0;font-weight:bold;font-size:16px">What to do next</p>' + planHtml_(r, false) + '</div>' +
    '<p style="' + p + '">The full report, with every answer, is attached as a PDF.</p>' +
    '<p style="' + p + '">Celly School</p>' +
    '<p style="font-size:12px;line-height:1.5;color:#56607A;margin-top:20px">' +
    'You got this email because someone typed this address into a Celly School game and ticked “I’m this child’s parent or carer”. ' +
    'If that wasn’t you, you can ignore it. We don’t keep your email address. <a href="' + SITE + '/privacy">Privacy</a></p></div>';
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

function log_(r) {
  try {
    var root = DriveApp.getFolderById(ROOT_ID), name = 'Celly School game reports (log)';
    var it = root.getFilesByName(name), ss;
    if (it.hasNext()) ss = SpreadsheetApp.open(it.next());
    else {
      ss = SpreadsheetApp.create(name);
      DriveApp.getFileById(ss.getId()).moveTo(root);
      ss.getSheets()[0].appendRow(['Date', 'Game', 'Right first time', 'Out of', 'Minutes', 'Mode', 'Say it again', 'To practise']);
    }
    ss.getSheets()[0].appendRow([new Date(), r.game, r.first, r.total, r.minutes, r.mode, r.sayAgain, r.practise.join(', ')]);
  } catch (e) { console.error('log: ' + e); }
}

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
