/* Celly School · workbook downloads ask for an email first (Nov 2026).
   Press "Download the workbook" → the email box opens → the email is saved → the PDF downloads.
   News emails are a separate, optional tick, confirmed by email (double opt-in).
   A device that has already given an email downloads straight away next time. */
(function () {
  var EP = 'https://script.google.com/macros/s/AKfycbwYsiK2ZrKioF6k0YO_y_m_GhEVFV4ZkxaXX4NvWdqmMY5pcNaCRiwAKmNf4UgOME8DKQ/exec';
  var box = document.getElementById('nlBox'); if (!box) return;
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function track(n, p) { try { if (window.csTrack) window.csTrack(n, p || {}); } catch (e) {} }
  var st = document.createElement('style');
  st.textContent = '.nl{display:grid;gap:8px;border-color:#81A63C}.nl[hidden]{display:none}.nl label{font-weight:600}.nl input[type=email],.nl select{font:inherit;width:100%;max-width:420px;box-sizing:border-box;border:2px solid #C9C2AE;border-radius:12px;padding:10px 12px;background:#fff}' +
    '.nl .tick{display:flex;gap:10px;align-items:flex-start;font-weight:400}.nl .tick input{width:24px;height:24px;flex:none;margin-top:2px}.nl-msg{min-height:1.4em;margin:0;color:#4A5573}' +
    '.nl button.btn{font:inherit;font-size:17px;font-weight:600;padding:10px 18px;min-height:46px;cursor:pointer;display:inline-flex;gap:8px;align-items:center}.nl .small{font-size:14px;color:#56607A;margin:0}';
  document.head.appendChild(st);
  var fam = null; try { fam = JSON.parse(get('cs_family') || 'null'); } catch (e) {}
  var saved = get('cs_wb_email');
  document.getElementById('nlEmail').value = saved || (fam && fam.email) || '';
  function download() {
    var a = document.createElement('a'); a.href = box.dataset.file; a.download = ''; document.body.appendChild(a); a.click(); a.remove();
    track('workbook-download', {page: box.dataset.page});
  }
  function send(email, news) {
    return fetch(EP, {method: 'POST', headers: {'Content-Type': 'text/plain;charset=utf-8'}, body: JSON.stringify({
      type: 'subscribe', email: email, who: document.getElementById('nlWho').value, newsletter: !!news,
      page: box.dataset.page, hp: document.getElementById('nlHp').value})}).then(function (r) { return r.json(); });
  }
  // the download buttons open the box instead of downloading (unless this device already gave an email)
  document.querySelectorAll('a[download]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      if (saved) { send(saved, false).catch(function () {}); download(); return; }
      box.hidden = false; track('workbook-email-shown', {page: box.dataset.page});
      setTimeout(function () { box.scrollIntoView({behavior: 'smooth', block: 'center'}); document.getElementById('nlEmail').focus(); }, 200);
    });
  });
  var msg = box.querySelector('.nl-msg'), btn = box.querySelector('button[type=submit]'), fails = 0;
  document.getElementById('nlNo').onclick = function () { box.hidden = true; track('workbook-email-cancel', {page: box.dataset.page}); };
  box.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = document.getElementById('nlEmail').value.trim().toLowerCase(), news = document.getElementById('nlOk').checked;
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) { msg.textContent = 'Please type your email address.'; document.getElementById('nlEmail').focus(); return; }
    btn.disabled = true; msg.textContent = 'Saving…';
    send(email, news).then(function (r) {
      btn.disabled = false;
      if (!r || !r.ok) throw 0;
      set('cs_wb_email', email); saved = email; download();
      track('workbook-email-saved', {page: box.dataset.page, news: news ? 1 : 0});
      box.innerHTML = '<h2 style="margin-top:0">Your download has started 🎉</h2><p>Thank you!' + (r.mailed ?
        ' We have also emailed <b>' + email.replace(/[<>&"]/g, '') + '</b> a link to confirm the news emails. It may be in Spam or Promotions.' : '') + '</p>';
    }).catch(function () {
      btn.disabled = false; fails++;
      // never leave a family without the workbook: after two failed tries, download anyway
      if (fails >= 2) { msg.textContent = 'We couldn’t save your email just now, but here is your workbook.'; download(); }
      else msg.textContent = 'Sorry, that didn’t work. Please press Download again.';
    });
  });
})();
