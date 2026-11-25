/* Celly School · family setup, once per device.
   A grown-up saves their email and their children's first names. Every game then asks
   "Who's playing today?" and the report goes to that grown-up with the right child's name.
   Stored in this browser (localStorage "cs_family") and, with the parent's agreement, in Celly School's parent list. */
(function () {
  var KEY = 'cs_family';
  function get() {
    try {
      var f = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!f) { var old = localStorage.getItem('cs_report_email'); if (old) f = {email: old, kids: []}; }
      if (f && f.email) { f.kids = (f.kids || []).filter(Boolean).slice(0, 6); return f; }
    } catch (e) {}
    return null;
  }
  function save(f) {
    var old = get(), tok = f.token || (old && old.email === f.email ? old.token : undefined);
    try { localStorage.setItem(KEY, JSON.stringify({email: f.email, kids: f.kids || [], token: tok})); localStorage.setItem('cs_report_email', f.email); } catch (e) {}
    try { if (window.CSSync) window.CSSync.soon(); } catch (e) {}
  }
  function clear() { try { localStorage.removeItem(KEY); localStorage.removeItem('cs_report_email'); } catch (e) {} }
  function mask(e) { var p = String(e).split('@'); return p[0].slice(0, 2) + '•••@' + (p[1] || ''); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]; }); }
  function cleanName(s) { return String(s || '').replace(/[<>"\\]/g, '').replace(/\s+/g, ' ').trim().slice(0, 24); }

  var CSS = '.fam label{display:block;font-weight:600;margin:10px 0 4px}' +
    '.fam input[type=email],.fam input[type=text]{font:inherit;width:100%;box-sizing:border-box;border:2px solid #C9C2AE;border-radius:12px;padding:10px 12px;background:#fff}' +
    '.fam input:focus{outline:3px solid #81A63C;border-color:#81A63C}' +
    '.fam .kids{display:grid;gap:8px}.fam .addkid{font:inherit;font-size:16px;background:none;border:none;color:#2B5BA8;cursor:pointer;padding:4px 0;text-align:left;font-weight:600}' +
    '.fam .tick{display:flex;gap:10px;align-items:flex-start;font-weight:400;margin:12px 0}.fam .tick input{width:24px;height:24px;margin-top:3px;flex:none}' +
    '.fam .err{color:#B5651D;font-weight:600;min-height:1.4em;margin:6px 0 0}' +
    '.fam .hp{position:absolute;left:-9999px}';
  var styled = false;
  function style() { if (styled) return; styled = true; var s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); }

  /* The setup form. opts: {intro, saveLabel, skipLabel, onSave(f, hp), onSkip} */
  function form(box, opts) {
    style();
    var f = get() || {email: '', kids: []};
    var kids = f.kids.length ? f.kids : [''];
    box.classList.add('fam');
    box.innerHTML = (opts.intro || '') +
      (window.CSSync && !(f && f.token) ? '<p class="fam-back" style="margin:6px 0 4px;padding:10px 12px;border-radius:12px;background:#F6FAEE;border:2px solid #D9E5C4">Already use Celly School on another device? <a href="#" id="famLink">🔗 Bring your family here</a></p>' : '') +
      '<label for="famE">Your email</label><input type="email" id="famE" autocomplete="email" inputmode="email" maxlength="120" placeholder="name@example.com" value="' + esc(f.email) + '">' +
      '<input class="hp" type="text" id="famH" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<label>Your child’s first name <span style="font-weight:400;color:#56607A">(or a nickname)</span></label><div class="kids" id="famK"></div>' +
      '<button type="button" class="addkid" id="famAdd">+ Add another child</button>' +
      '<label class="tick"><input type="checkbox" id="famP"' + (f.email ? ' checked' : '') + '> <span>I’m the parent or carer of these children, and I agree to Celly School keeping this email and these first names to send me their reports and recaps.</span></label>' +
      '<p class="err" id="famErr" aria-live="polite"></p>' +
      '<div class="btns"><button class="yes" id="famSave">' + (opts.saveLabel || 'Save') + '</button>' + (opts.onSkip ? '<button id="famSkip">' + (opts.skipLabel || 'Skip') + '</button>' : '') + '</div>' +
      '<p class="small">We keep your email and your children’s first names in our private Google account, only to send you their reports and recaps. We never share them. You can ask us to change or delete them at any time. This device also remembers them, so next time your child just taps their name. <a href="/privacy" target="_blank" rel="noopener">Privacy</a></p>';
    var K = box.querySelector('#famK');
    function addRow(v) {
      if (K.children.length >= 6) return;
      var i = document.createElement('input'); i.type = 'text'; i.maxLength = 24; i.placeholder = 'e.g. Sam'; i.value = v || ''; i.autocomplete = 'off';
      i.setAttribute('aria-label', 'Child’s first name'); K.appendChild(i); return i;
    }
    kids.forEach(addRow);
    box.querySelector('#famAdd').onclick = function () { var i = addRow(''); if (i) i.focus(); };
    var E = box.querySelector('#famE'), P = box.querySelector('#famP'), err = box.querySelector('#famErr');
    box.querySelector('#famSave').onclick = function () {
      var v = E.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v)) { err.textContent = 'Please check the email address.'; E.focus(); return; }
      if (!P.checked) { err.textContent = 'Please tick the box to say you’re the parent or carer.'; return; }
      var names = [].map.call(K.querySelectorAll('input'), function (i) { return cleanName(i.value); }).filter(Boolean);
      names = names.filter(function (n, i) { return names.indexOf(n) === i; });
      var nf = {email: v, kids: names}; save(nf);
      opts.onSave(nf, box.querySelector('#famH').value);
    };
    if (opts.onSkip) box.querySelector('#famSkip').onclick = opts.onSkip;
    var lk = box.querySelector('#famLink');
    if (lk) lk.onclick = function (e) {
      e.preventDefault();
      window.CSSync.linkUI(box, {email: E.value.trim(),
        intro: '<h2 style="margin-top:0">Bring your family here</h2><p>Type the email you used before. We’ll email you a 6-digit code, and this device gets your children’s names, your school’s order and their progress.</p>',
        onDone: function (nf) { opts.onSave(nf, ''); },
        onCancel: function () { form(box, opts); }});
      [].forEach.call(box.querySelectorAll('.btns button'), function (b) { b.classList.add('btn'); });
    };
    setTimeout(function () { (f.email ? box.querySelector('#famSave') : E).focus(); }, 50);
  }

  window.CSFamily = {get: get, save: save, clear: clear, mask: mask, esc: esc, cleanName: cleanName, form: form};

  // Games page panel: <div id="family"></div>
  var panel = document.getElementById('family');
  if (panel) {
    var show = function () {
      var f = get();
      if (f) {
        panel.innerHTML = '<h2 style="margin-top:0">✅ Reports are set up on this device</h2><p>Reports go to <b>' + esc(mask(f.email)) + '</b>' +
          (f.kids.length ? ' for <b>' + f.kids.map(esc).join(', ') + '</b>' : '') + '. Each game asks “Who’s playing today?”, so your child can play alone.</p>' +
          (f.token ? '<p>🔗 <b>Linked to your email.</b> Children, school order and progress are the same on all your linked devices.</p>' :
            '<p>Want the same children, school order and progress on your other devices? <button class="btn" id="famLinkP" type="button">🔗 Link to my email</button></p>') +
          '<div class="btns"><button class="btn" id="famEdit">Change</button><button class="btn" id="famDel">Remove from this device</button></div>';
        panel.querySelector('#famEdit').onclick = edit;
        panel.querySelector('#famDel').onclick = function () { clear(); show(); };
        var lp = panel.querySelector('#famLinkP');
        if (lp) lp.onclick = function () { if (!window.CSSync) return; var b = document.createElement('div'); panel.innerHTML = ''; panel.appendChild(b);
          window.CSSync.linkUI(b, {email: f.email, intro: '<h2 style="margin-top:0">Link to your email</h2><p>We’ll email you a 6-digit code. After that, every device you link shows the same children, school order and progress.</p>', onDone: show, onCancel: show}); };
      } else {
        panel.innerHTML = '<h2 style="margin-top:0">Parents and carers: set up reports once</h2><p>Add your email and your children’s names. After each game you get a short report for the child who played, even when they play alone.</p>' +
          '<div class="btns"><button class="btn primary" id="famStart">Set up reports</button></div>';
        panel.querySelector('#famStart').onclick = edit;
      }
    };
    var edit = function () {
      var box = document.createElement('div'); panel.innerHTML = ''; panel.appendChild(box);
      form(box, {intro: '<h2 style="margin-top:0">Set up reports</h2>', saveLabel: 'Save', onSave: function () { orderStep(); }, onSkip: show, skipLabel: 'Cancel'});
      [].forEach.call(panel.querySelectorAll('.btns button'), function (b) { b.classList.add('btn'); if (b.id === 'famSave') b.classList.add('primary'); });
    };
    // after saving: one optional question about the school's order of units
    var orderStep = function () {
      var o = null; try { o = JSON.parse(localStorage.getItem('cs_order') || 'null'); } catch (e) {}
      if (o && o.units && o.units.length) { show(); return; }
      var base = (location.pathname.match(/^\/preview-[a-z0-9-]+/) || [''])[0];
      panel.innerHTML = '<h2 style="margin-top:0">✅ Saved. One more question (optional)</h2>' +
        '<p>Does your school teach the Year 7 units in a different order from the book? Set it once, and every “Next” button will follow your school.</p>' +
        '<div class="btns"><a class="btn primary" href="' + base + '/year-7?setorder=1#schoolOrder">🏫 Set our school’s order</a><button class="btn" id="famBook" type="button">No, the book order is fine</button></div>';
      panel.querySelector('#famBook').onclick = show;
    };
    show();
  }
})();
