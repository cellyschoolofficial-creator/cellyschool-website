/* Celly School · optional emails about new workbooks (Nov 2026).
   The box appears after "Download the workbook" is pressed. The download never waits for it.
   Double opt-in: the script emails a confirm link; nothing is sent until it is pressed. */
(function () {
  var EP = 'https://script.google.com/macros/s/AKfycbwYsiK2ZrKioF6k0YO_y_m_GhEVFV4ZkxaXX4NvWdqmMY5pcNaCRiwAKmNf4UgOME8DKQ/exec';
  var box = document.getElementById('nlBox'); if (!box) return;
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function track(n, p) { try { if (window.csTrack) window.csTrack(n, p || {}); } catch (e) {} }
  var st = document.createElement('style');
  st.textContent = '.nl{display:grid;gap:8px;border-color:#81A63C}.nl[hidden]{display:none}.nl label{font-weight:600}.nl input[type=email],.nl select{font:inherit;width:100%;max-width:420px;box-sizing:border-box;border:2px solid #C9C2AE;border-radius:12px;padding:10px 12px;background:#fff}' +
    '.nl .tick{display:flex;gap:10px;align-items:flex-start;font-weight:400}.nl .tick input{width:24px;height:24px;flex:none;margin-top:2px}.nl-msg{min-height:1.4em;margin:0;color:#4A5573}';
  document.head.appendChild(st);
  var fam = null; try { fam = JSON.parse(get('cs_family') || 'null'); } catch (e) {}
  if (fam && fam.email) document.getElementById('nlEmail').value = fam.email;
  document.querySelectorAll('a[download]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (get('cs_nl')) return;                       // already signed up or said no on this device
      box.hidden = false; track('newsletter-shown', {page: box.dataset.page});
      setTimeout(function () { box.scrollIntoView({behavior: 'smooth', block: 'nearest'}); }, 300);
    });
  });
  var msg = box.querySelector('.nl-msg'), btn = box.querySelector('button[type=submit]');
  document.getElementById('nlNo').onclick = function () { set('cs_nl', 'no'); box.hidden = true; track('newsletter-no', {}); };
  box.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = document.getElementById('nlEmail').value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) { msg.textContent = 'Please check the email address.'; return; }
    if (!document.getElementById('nlOk').checked) { msg.textContent = 'Please tick the box to say you would like the emails.'; return; }
    btn.disabled = true; msg.textContent = 'Sending…';
    fetch(EP, {method: 'POST', headers: {'Content-Type': 'text/plain;charset=utf-8'}, body: JSON.stringify({
      type: 'subscribe', email: email, who: document.getElementById('nlWho').value, consent: true,
      page: box.dataset.page, hp: document.getElementById('nlHp').value})})
      .then(function (r) { return r.json(); })
      .then(function (r) {
        btn.disabled = false;
        if (r && r.ok) {
          set('cs_nl', 'asked'); track('newsletter-asked', {page: box.dataset.page});
          box.innerHTML = '<h2 style="margin-top:0">Nearly done! 📧</h2><p>' + (r.already ? 'You are already on the list. Thank you!' :
            'We have emailed a link to <b>' + email.replace(/[<>&"]/g, '') + '</b>. Press it to confirm. It may be in Spam or Promotions.') + '</p>';
        } else msg.textContent = r && r.why === 'quota' ? 'Sorry, please try again tomorrow.' : 'Sorry, that didn’t work. Please try again.';
      })
      .catch(function () { btn.disabled = false; msg.textContent = 'No connection. Please try again.'; });
  });
})();
