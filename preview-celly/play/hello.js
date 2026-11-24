/* Celly School · get Celly talking as soon as possible.
   Browsers only allow sound after the visitor taps or clicks, so:
   1. a tap anywhere on the start screen starts the game (not only the button);
   2. closing the grown-up screen (Send / Skip) counts as that tap;
   3. if the browser already allows sound (returning visitors), Celly starts by herself;
   4. until then Celly waves, the button pulses and the bubble invites a tap. */
(function () {
  if (typeof S === 'undefined') return;
  var css = document.createElement('style');
  css.textContent = '#go.cs-pulse{animation:csPulse 1.1s ease-in-out infinite}@keyframes csPulse{50%{transform:scale(1.06);box-shadow:0 0 0 8px rgba(129,166,60,.25)}}' +
    '.cs-tap{display:block;margin-top:6px;font-size:.8em;font-weight:600;color:#4E7A1E}' +
    '@media (prefers-reduced-motion:reduce){#go.cs-pulse{animation:none}}';
  document.head.appendChild(css);
  function go() { return document.getElementById('go'); }
  var fired = false;
  function start(why) {
    var b = go();
    if (fired || S.started || !b || document.querySelector('.gu')) return;
    fired = true;
    try { if (window.csTrack) csTrack('game-autostart', {how: why}); } catch (e) {}
    b.click();
  }
  // looks alive before the first tap
  var b0 = go(), say = document.getElementById('say');
  if (b0) b0.classList.add('cs-pulse');
  if (say && !S.started) {
    var hint = document.createElement('span'); hint.className = 'cs-tap'; hint.textContent = '👆 Tap anywhere and I’ll talk!';
    say.parentNode.insertBefore(hint, say.nextSibling);
    var stop = setInterval(function () { if (S.started) { hint.remove(); clearInterval(stop); } }, 500);
  }
  var wave = setInterval(function () {
    if (S.started) return clearInterval(wave);
    try { if (typeof Celly !== 'undefined' && Celly.pose) Celly.pose('wave', 1800); } catch (e) {}
  }, 6000);
  // 0. start downloading Celly's voice now, so she can talk the moment anyone taps
  try { if (typeof loadSprite === 'function') loadSprite(); } catch (e) {}
  function voiceReady() { try { return typeof spriteBuf === 'undefined' || !!spriteBuf || !(window.VOICE && VOICE.ready); } catch (e) { return true; } }
  document.addEventListener('click', function (e) {
    if (!e.target.closest('#go') || voiceReady()) return;
    setTimeout(function () {
      if (voiceReady()) return;
      var sy = document.getElementById('say'); if (sy) sy.textContent = 'One moment… I’m warming up my voice! 🎙';
    }, 300);
  }, true);
  // 1. tap anywhere (but not on links, the grown-up notes, the mode buttons or form fields)
  document.addEventListener('click', function (e) {
    if (e.target.closest('a,summary,details,input,select,textarea,label,.tools,.trail,.gu,#go')) return;
    start('tap');
  });
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('input,textarea,button,a,summary,.gu')) start('key');
  });
  // 2. the grown-up screen was answered
  window.addEventListener('cs-grownup-done', function () { setTimeout(function () { start('grownup'); }, 150); });
  // 3. sound already allowed? Try a silent sound: browsers refuse it when a tap is needed
  try {
    var a = new Audio('data:audio/wav;base64,UklGRgQCAABXQVZFZm10IBAAAAABAAEAwF0AAIC7AAACABAAZGF0YeABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=');
    var pr = a.play();
    if (pr && pr.then) pr.then(function () { setTimeout(function () { start('autoplay'); }, 1200); }, function () {});
  } catch (e) {}
})();

/* ---------- progress bar under the room list ---------- */
(function () {
  var trail = document.getElementById('trail');
  if (!trail || typeof S === 'undefined') return;
  var st = document.createElement('style');
  st.textContent = '.cs-prog{display:flex;align-items:center;gap:12px;margin:6px 2px 10px}' +
    '.cs-prog .bar{flex:1;height:14px;border-radius:999px;background:#EDE8D8;border:2px solid #D9D2BC;overflow:hidden}' +
    '.cs-prog .fill{height:100%;width:0;border-radius:999px;background:linear-gradient(90deg,#9BC24E,#81A63C);transition:width .6s ease}' +
    '.cs-prog .lbl{font-size:16px;font-weight:600;color:#4E7A1E;white-space:nowrap}' +
    '@media (max-width:520px){.cs-prog .lbl{font-size:14px}.cs-prog .bar{height:12px}}' +
    '@media (prefers-reduced-motion:reduce){.cs-prog .fill{transition:none}}';
  document.head.appendChild(st);
  var box = document.createElement('div'); box.className = 'cs-prog';
  box.setAttribute('role', 'progressbar'); box.setAttribute('aria-valuemin', '0'); box.setAttribute('aria-label', 'Game progress');
  box.innerHTML = '<div class="bar"><div class="fill"></div></div><span class="lbl"></span>';
  trail.parentNode.insertBefore(box, trail.nextSibling);
  var fill = box.querySelector('.fill'), lbl = box.querySelector('.lbl'), last = null;
  function update() {
    var steps = [].slice.call(trail.querySelectorAll('.step')).filter(function (b) { return !b.classList.contains('nav'); });
    var n = steps.length; if (!n) return;
    var at = Math.max(0, Math.min(n - 1, +S.room || 0));
    var key = at + '/' + n; if (key === last) return; last = key;
    var pct = n > 1 ? Math.round(at / (n - 1) * 100) : 100;
    fill.style.width = pct + '%';
    var L = window.CS_LEVEL; lbl.textContent = at >= n - 1 ? '🏆 All done!' : (L && L.split > 0 ? 'Level ' + L.of(at) + ' · ' : '') + 'Step ' + (at + 1) + ' of ' + n;
    box.setAttribute('aria-valuemax', String(n)); box.setAttribute('aria-valuenow', String(at + 1));
  }
  new MutationObserver(update).observe(trail, {childList: true, subtree: true});
  update();
})();
