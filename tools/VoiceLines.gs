/**
 * Celly School voice lines — Gemini TTS → Google Drive (replaces the Make scenarios)
 *
 * How it works
 * 1. Claude drops a batch file (JSON) into "Celly School/Voice inbox".
 *    {batch_name, model, key, style_prompt?, lines:[{file_name, style, text, voice_name}]}
 * 2. Claude starts the batch through the web app (a safety-net trigger also checks every 5 minutes). The script, records each line with Gemini,
 *    and saves <file_name>.wav into "Celly School/Voice batches/<batch_name> (date)".
 *    Each run stops after about 5 minutes and the next run carries on where it left off.
 * 3. When a batch is finished, the script also saves "<batch_name>.zip" (all the takes)
 *    next to the folder and moves the batch file to "Voice inbox/done".
 *    A line that fails twice gets a "FAILED - <file_name>.txt" note instead.
 *
 * One-time setup (the owner does this):
 *   Project Settings → Script properties → add GEMINI_KEY_1 … GEMINI_KEY_9 (one per API key).
 *   Then run setup() once and allow the permissions.
 */

var ROOT_ID = '1jSuRoxkYXvwHiUS5sM0zUgq7pfSjSxvm';          // Celly School folder
var RUN_LIMIT_MS = 5 * 60 * 1000;                           // stop before Apps Script's 6-minute cap
var PAUSE_MS = 3000;                                        // gap between calls (rate limits)
var DEFAULT_MODEL = 'gemini-3.8-flash-tts';

// Same voice description as the Make scenarios, so the voice does not change.
var VOICE = "A warm, calm British woman in her thirties with a soft Southern English accent, speaking as a kind, patient tutor to an 11-year-old girl who has dyslexia. Speak slowly and clearly at a relaxed pace, about 110 words per minute, with a small natural pause after every sentence. Sound friendly and encouraging, never rushed, never babyish and never like a cartoon. Pronounce every science word carefully and fully. When asked to say a word in beats, separate each syllable with a short, even gap. Smile in the voice when praising, and lower the energy slightly when explaining something new.";

function setup() {
  folder_(ROOT_ID, 'Voice inbox');
  folder_(folder_(ROOT_ID, 'Voice inbox').getId(), 'done');
  folder_(ROOT_ID, 'Voice batches');
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'processInbox') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('processInbox').timeBased().everyMinutes(5).create();
  var keys = Object.keys(PropertiesService.getScriptProperties().getProperties())
    .filter(function (k) { return /^GEMINI_KEY_\d+$/.test(k); });
  Logger.log('Ready. Keys found: ' + (keys.join(', ') || 'none yet'));
}

// Runs every 5 minutes as a safety net. Claude normally starts batches straight away through the web app (doGet).
function processInbox() { run_(null); }

// Web app: ?status=1 shows progress; ?batch=<file id> (or nothing) records now. Each call works for up to 5 minutes.
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.status) return json_(report_());
  var done = run_(p.batch || null);
  return json_({ran: done, report: report_()});
}

function run_(onlyId) {
  var start = Date.now(), ran = [];
  var inbox = folder_(ROOT_ID, 'Voice inbox');
  var files = inbox.getFiles(), list = [];
  while (files.hasNext()) {
    var f = files.next();
    if (/\.json$/i.test(f.getName()) && (!onlyId || f.getId() === onlyId)) list.push(f);
  }
  list.sort(function (a, b) { return a.getDateCreated() - b.getDateCreated(); });
  for (var i = 0; i < list.length; i++) {
    if (Date.now() - start > RUN_LIMIT_MS) break;
    if (!claim_(list[i].getId())) continue;     // another run is already recording this batch
    try { ran.push(list[i].getName()); runBatch_(list[i], start); }
    finally { release_(list[i].getId()); }
  }
  return ran;
}

// one run per batch at a time, so several batches (one per key) can record side by side
function claim_(id) {
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var props = PropertiesService.getScriptProperties(), k = 'claim_' + id, t = +(props.getProperty(k) || 0);
    if (Date.now() - t < 7 * 60 * 1000) return false;
    props.setProperty(k, String(Date.now())); return true;
  } finally { lock.releaseLock(); }
}
function release_(id) { PropertiesService.getScriptProperties().deleteProperty('claim_' + id); }

function report_() {
  var props = PropertiesService.getScriptProperties().getProperties(), out = {waiting: [], done: []};
  var inbox = folder_(ROOT_ID, 'Voice inbox'), it = inbox.getFiles();
  while (it.hasNext()) {
    var f = it.next(); if (!/\.json$/i.test(f.getName())) continue;
    var st = JSON.parse(props['state_' + f.getId()] || '{}');
    var n = JSON.parse(f.getBlob().getDataAsString()).lines.length;
    out.waiting.push({name: f.getName(), id: f.getId(), recorded: st.next || 0, of: n, running: !!props['claim_' + f.getId()]});
  }
  var d = folder_(inbox.getId(), 'done').getFiles(), k = 0;
  while (d.hasNext() && k < 20) { var g = d.next(); out.done.push(g.getName()); k++; }
  var z = folder_(ROOT_ID, 'Voice batches').getFiles(); out.zips = [];
  while (z.hasNext()) { var y = z.next(); out.zips.push({name: y.getName(), id: y.getId(), date: y.getDateCreated()}); }
  return out;
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o, null, 1)).setMimeType(ContentService.MimeType.JSON); }

function runBatch_(file, start) {
  var props = PropertiesService.getScriptProperties();
  var b = JSON.parse(file.getBlob().getDataAsString());
  if (b.check_folders) return checkBatch_(file, b, start);
  var stateKey = 'state_' + file.getId();
  var state = JSON.parse(props.getProperty(stateKey) || '{}');
  var out;
  if (state.folderId) {
    out = DriveApp.getFolderById(state.folderId);
  } else {
    var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'd MMM yyyy HH.mm');
    out = folder_(ROOT_ID, 'Voice batches').createFolder(b.batch_name + ' (' + stamp + ')');
    state = {folderId: out.getId(), next: 0, tries: {}};
    props.setProperty(stateKey, JSON.stringify(state));
  }
  var key = props.getProperty('GEMINI_KEY_' + (b.key || 1));
  if (!key) { note_(out, 'FAILED - no key.txt', 'Script property GEMINI_KEY_' + (b.key || 1) + ' is missing.'); return false; }

  while (state.next < b.lines.length) {
    if (Date.now() - start > RUN_LIMIT_MS) { props.setProperty(stateKey, JSON.stringify(state)); return false; }
    var L = b.lines[state.next];
    var res = speak_(key, b.model || DEFAULT_MODEL, b.voice || VOICE, L);
    if (res.ok) {
      out.createFile(res.blob.setName(L.file_name + '.wav'));
    } else if (res.retryLater) {
      props.setProperty(stateKey, JSON.stringify(state));   // quota / rate limit: try again next minute
      return false;
    } else {
      var n = (state.tries[L.file_name] || 0) + 1;
      state.tries[L.file_name] = n;
      if (n < 2) { props.setProperty(stateKey, JSON.stringify(state)); continue; }
      note_(out, 'FAILED - ' + L.file_name + '.txt', 'Gemini could not make the audio for ' + L.file_name +
        '.\n\n' + res.error + '\n\nText: ' + L.text);
    }
    state.next++;
    props.setProperty(stateKey, JSON.stringify(state));
    Utilities.sleep(PAUSE_MS);
  }

  // finished: zip every take, then file the batch away
  var blobs = [], it = out.getFiles();
  while (it.hasNext()) { var w = it.next(); if (/\.wav$/i.test(w.getName())) blobs.push(w.getBlob()); }
  if (blobs.length) out.getParents().next().createFile(Utilities.zip(blobs, b.batch_name + '.zip'));
  file.moveTo(folder_(folder_(ROOT_ID, 'Voice inbox').getId(), 'done'));
  props.deleteProperty(stateKey);
  return true;
}

function speak_(key, model, voice, L) {
  var prompt = "### DIRECTOR'S NOTES\nVoice: " + voice + "\nStyle for this line: " + (L.style || '') +
    "\nRead only the transcript below, exactly as written. Do not read these notes aloud.\n\n### TRANSCRIPT\n" + L.text;
  var body = {
    contents: [{parts: [{text: prompt}]}],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {voiceConfig: {prebuiltVoiceConfig: {voiceName: L.voice_name || 'Sulafat'}}}
    }
  };
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent';
  var r;
  try {
    r = UrlFetchApp.fetch(url, {method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      headers: {'x-goog-api-key': key}, payload: JSON.stringify(body)});
  } catch (e) {
    return {ok: false, error: String(e)};
  }
  var code = r.getResponseCode();
  if (code === 429 || code === 503) return {ok: false, retryLater: true, error: 'HTTP ' + code};
  if (code !== 200) return {ok: false, error: 'HTTP ' + code + ': ' + r.getContentText().slice(0, 800)};
  var j = JSON.parse(r.getContentText());
  var part = (((j.candidates || [])[0] || {}).content || {}).parts;
  part = part && part.filter(function (p) { return p.inlineData; })[0];
  if (!part) return {ok: false, error: 'No audio in the reply: ' + r.getContentText().slice(0, 800)};
  var bytes = Utilities.base64Decode(part.inlineData.data);
  var mime = part.inlineData.mimeType || '';
  var isWav = bytes.length > 4 && bytes[0] === 82 && bytes[1] === 73 && bytes[2] === 70 && bytes[3] === 70; // "RIFF"
  if (!isWav) {
    var m = /rate=(\d+)/.exec(mime);
    bytes = wav_(bytes, m ? +m[1] : 24000);
  }
  return {ok: true, blob: Utilities.newBlob(bytes, 'audio/wav')};
}

// 16-bit mono PCM → WAV file
function wav_(pcm, rate) {
  var n = pcm.length, h = [];
  function s(str) { for (var i = 0; i < str.length; i++) h.push(str.charCodeAt(i)); }
  function u32(v) { h.push(v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >> 24) & 255); }
  function u16(v) { h.push(v & 255, (v >> 8) & 255); }
  s('RIFF'); u32(36 + n); s('WAVE'); s('fmt '); u32(16); u16(1); u16(1); u32(rate); u32(rate * 2); u16(2); u16(16);
  s('data'); u32(n);
  var head = h.map(function (x) { return x > 127 ? x - 256 : x; });
  return head.concat(Array.prototype.slice.call(pcm));
}

/* ---------- checking takes: Gemini writes down the words it hears ----------
   Batch file: {batch_name, key, check_folders:[folder ids]} → transcripts.json in each folder
   ({"<file>.wav": "words heard"}). Resumes across runs. */
var CHECK_MODEL = 'gemini-3.8-flash';
function checkBatch_(file, b, start) {
  var props = PropertiesService.getScriptProperties();
  var key = props.getProperty('GEMINI_KEY_' + (b.key || 1));
  for (var i = 0; i < b.check_folders.length; i++) {
    var f = DriveApp.getFolderById(b.check_folders[i]);
    var tf = f.getFilesByName('transcripts.json'), tfile = tf.hasNext() ? tf.next() : null;
    var done = tfile ? JSON.parse(tfile.getBlob().getDataAsString()) : {};
    var it = f.getFiles(), todo = [];
    while (it.hasNext()) { var w = it.next(); if (/\.wav$/i.test(w.getName()) && !(done[w.getName()] && String(done[w.getName()]).indexOf('ERROR') !== 0)) todo.push(w); }
    todo.sort(function (x, y) { return x.getName() < y.getName() ? -1 : 1; });
    for (var j = 0; j < todo.length; j++) {
      if (Date.now() - start > RUN_LIMIT_MS) { save_(f, tfile, done); return false; }
      var r = hear_(key, todo[j].getBlob());
      if (r.retryLater) { save_(f, tfile, done); return false; }
      done[todo[j].getName()] = r.ok ? r.text : ('ERROR: ' + r.error);
      if (j % 10 === 9) tfile = save_(f, tfile, done);
      Utilities.sleep(1500);
    }
    tfile = save_(f, tfile, done);
  }
  file.moveTo(folder_(folder_(ROOT_ID, 'Voice inbox').getId(), 'done'));
  return true;
}
function save_(folder, tfile, obj) {
  var txt = JSON.stringify(obj, null, 1);
  if (tfile) { tfile.setContent(txt); return tfile; }
  return folder.createFile('transcripts.json', txt, 'application/json');
}
function hear_(key, blob) {
  var body = {contents: [{parts: [
    {inline_data: {mime_type: 'audio/wav', data: Utilities.base64Encode(blob.getBytes())}},
    {text: 'Write down exactly the words spoken in this audio, word for word, including any repeated words or sentences. Output only the words, nothing else.'}]}],
    generationConfig: {temperature: 0}};
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + CHECK_MODEL + ':generateContent';
  try {
    var r = UrlFetchApp.fetch(url, {method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      headers: {'x-goog-api-key': key}, payload: JSON.stringify(body)});
    var code = r.getResponseCode();
    if (code === 429 || code === 503) return {ok: false, retryLater: true};
    if (code !== 200) return {ok: false, error: 'HTTP ' + code + ' ' + r.getContentText().slice(0, 300)};
    var j = JSON.parse(r.getContentText());
    var parts = (((j.candidates || [])[0] || {}).content || {}).parts || [];
    return {ok: true, text: parts.map(function (p) { return p.text || ''; }).join(' ').trim()};
  } catch (e) { return {ok: false, error: String(e)}; }
}

function note_(folder, name, text) { folder.createFile(name, text, MimeType.PLAIN_TEXT); }

function folder_(parentId, name) {
  var p = DriveApp.getFolderById(parentId), it = p.getFoldersByName(name);
  return it.hasNext() ? it.next() : p.createFolder(name);
}

