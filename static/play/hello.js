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
