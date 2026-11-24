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
      return {act: clip_(r.act, 60), item: clip_(r.item, 60), ok: !!r.first && r.said !== false};
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
      date: Utilities.formatDate(new Date(), 'Europe/London', 'd MMMM yyyy')
    };
    r.first = res.filter(function (x) { return x.ok; }).length;
    r.total = res.length;
    r.practise = uniq_(res.filter(function (x) { return !x.ok; }).map(function (x) { return x.item; }));
    r.next = NEXT[r.game] || {t: 'the next lesson', u: '/year-7'};

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

/* ---------- report (PDF) ---------- */
function reportHtml_(r) {
  var acts = uniq_(r.results.map(function (x) { return x.act; }));
  var rows = acts.map(function (a) {
    var items = r.results.filter(function (x) { return x.act === a; }).map(function (x) {
      return '<tr><td style="padding:5px 8px;border-bottom:1px solid #E4DFCF">' + esc_(x.item) + '</td>' +
        '<td style="padding:5px 8px;border-bottom:1px solid #E4DFCF;color:' + (x.ok ? '#4E7A1E' : '#B5651D') + ';font-weight:bold">' +
        (x.ok ? 'Secure' : 'Needs another go') + '</td></tr>';
    }).join('');
    return '<tr><td colspan="2" style="padding:10px 8px 4px;font-weight:bold;color:#1F2A44">' + esc_(cap_(a)) + '</td></tr>' + items;
  }).join('');
  var practise = r.practise.length
    ? '<p><b>Practise these next</b> (the workbook pages for this lesson help): ' + esc_(r.practise.join(', ')) + '.</p>'
    : '<p><b>Everything looks secure.</b> Well done!</p>';
  return '<html><head><meta charset="utf-8"></head><body style="font-family:Verdana,Arial,sans-serif;font-size:12pt;color:#1F2A44;line-height:1.5;margin:28px">' +
    '<div style="border:4px double #81A63C;border-radius:14px;padding:18px 22px;background:#FAF6E9">' +
    '<div style="font-size:10pt;letter-spacing:2px;color:#56607A">CELLY SCHOOL · REPORT FOR GROWN-UPS</div>' +
    '<h1 style="font-size:20pt;margin:6px 0 2px">' + esc_(r.title) + '</h1>' +
    '<div style="color:#56607A">Talk to Celly · ' + esc_(r.game + ' ' + r.topic) + ' · ' + esc_(r.date) + '</div></div>' +
    '<table style="width:100%;margin:16px 0;border-collapse:collapse"><tr>' +
    box_('Right first time', r.first + ' of ' + r.total) + box_('Time', (r.minutes || '<1') + ' min') +
    box_('Played by', r.mode) + box_('"Say it again"', r.sayAgain + (r.sayAgain === 1 ? ' time' : ' times')) +
    '</tr></table>' + practise +
    '<p style="font-size:10.5pt;color:#56607A">"Needs another go" means your child got there with help, or Celly could not hear the word clearly. It is not a mark.</p>' +
    '<table style="width:100%;border-collapse:collapse;font-size:11pt">' + rows + '</table>' +
    '<p style="margin-top:16px"><b>Next:</b> ' + esc_(r.next.t) + ' at ' + SITE.replace('https://', '') + r.next.u + '</p>' +
    '<p style="font-size:9.5pt;color:#56607A;margin-top:18px">Celly School · free, dyslexia-friendly KS3 science · www.cellyschool.com</p>' +
    '</body></html>';
}
function box_(k, v) {
  return '<td style="width:25%;padding:4px"><div style="border:2px solid #E4DFCF;border-radius:10px;padding:8px;text-align:center">' +
    '<div style="font-size:9.5pt;color:#56607A">' + k + '</div><div style="font-size:14pt;font-weight:bold">' + esc_(v) + '</div></div></td>';
}

/* ---------- email ---------- */
function emailHtml_(r) {
  var p = 'font-family:Verdana,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1F2A44;margin:0 0 12px';
  return '<div style="max-width:560px">' +
    '<p style="' + p + '">Hello,</p>' +
    '<p style="' + p + '">Your child has just finished <b>' + esc_(r.title) + '</b> (' + esc_(r.game + ' ' + r.topic) + ') on Celly School.</p>' +
    '<p style="' + p + '"><b>' + r.first + ' of ' + r.total + '</b> right first time, in about ' + (r.minutes || 1) + ' minutes.' +
    (r.practise.length ? ' Words to practise next: <b>' + esc_(r.practise.join(', ')) + '</b>.' : ' Everything looked secure.') + '</p>' +
    '<p style="' + p + '">The full one-page report is attached as a PDF.</p>' +
    '<p style="' + p + '"><b>Next:</b> <a href="' + SITE + r.next.u + '">' + esc_(r.next.t) + '</a></p>' +
    '<p style="' + p + '">Celly School</p>' +
    '<p style="font-family:Verdana,Arial,sans-serif;font-size:12px;line-height:1.5;color:#56607A;margin-top:20px">' +
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
