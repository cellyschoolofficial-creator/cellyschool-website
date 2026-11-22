/* Celly School: unlock paid practice games (only loaded when PAYWALL = True in src/build.py).
   1) The lock panel's form sends the Gumroad code to the unlock Worker (POST /unlock).
   2) The Worker checks it with Gumroad and returns a signed token.
   3) The token is saved only in this browser (localStorage 'cs-unlock').
   4) With the token, the games for a paid lesson are fetched from the Worker (GET /games/<slug>)
      and handed to practice.js. No game data for paid lessons is in the page HTML. */
(function(){
  var KEY='cs-unlock';
  function getTok(){try{return localStorage.getItem(KEY)||''}catch(e){return ''}}
  function setTok(t){try{localStorage.setItem(KEY,t)}catch(e){}}
  function dropTok(){try{localStorage.removeItem(KEY)}catch(e){}}
  function track(n,d){try{if(window.csTrack)csTrack(n,d||{})}catch(e){}}

  // Play page and notes: hide "Unlock" chips once this device is unlocked.
  function markUnlocked(){
    document.querySelectorAll('[data-plock]').forEach(function(el){el.hidden=true});
    document.querySelectorAll('[data-unlock-note]').forEach(function(el){el.hidden=true});
  }
  if(getTok())markUnlocked();
  document.addEventListener('click',function(ev){
    var a=ev.target.closest&&ev.target.closest('[data-unlock-buy]');
    if(a)track('unlock-click',{page:location.pathname});
  },true);

  var box=document.querySelector('.practice.locked');
  if(!box)return;
  var code=box.getAttribute('data-code'), slug=box.getAttribute('data-slug'),
      api=(box.getAttribute('data-api')||'').replace(/\/+$/,''),
      panel=box.querySelector('[data-lock]'), form=box.querySelector('[data-unlock-form]'),
      input=form&&form.querySelector('input'), btn=form&&form.querySelector('button'),
      msg=box.querySelector('.unlockmsg');

  function say(t,cls){if(!msg)return;msg.textContent=t||'';msg.className='unlockmsg'+(cls?' '+cls:'')}
  var viewed=false;
  function showLock(t,cls){
    panel.hidden=false;say(t,cls);
    if(!viewed){viewed=true;track('unlock-view',{lesson:code})}
  }

  function start(data){
    if(!data||data.code!==code||!data.words){throw new Error('bad data')}
    var s=document.createElement('script');s.type='application/json';s.id='practice-data';
    s.textContent=JSON.stringify(data);
    box.parentNode.appendChild(s);
    panel.remove();box.classList.remove('locked');
    markUnlocked();
    if(window.csPracticeStart)window.csPracticeStart();
  }

  function loadGames(tok){
    panel.hidden=true;
    var wait=document.createElement('p');wait.className='small';wait.textContent='Opening your games…';box.appendChild(wait);
    return fetch(api+'/games/'+encodeURIComponent(slug),{headers:{'Authorization':'Bearer '+tok}})
      .then(function(r){
        wait.remove();
        if(r.status===401||r.status===403){dropTok();showLock('This device needs the code again. Please type it below.','bad');return null}
        if(!r.ok)throw new Error('http '+r.status);
        return r.json();
      })
      .then(function(d){if(d)start(d);return !!d})
      .catch(function(){
        if(wait.parentNode)wait.remove();
        showLock('We could not open the games just now. Please check your internet and try again.','bad');
        return false;
      });
  }

  var REASONS={
    not_found:'We could not find that code. Please check it and try again.',
    refunded:'This code is no longer active, because the purchase was refunded.',
    too_many_devices:'This code is already used on the most devices allowed. Please email us and we will help.',
    bad_request:'Please type or paste the whole code.',
    rate_limited:'Too many tries. Please wait a minute and try again.'
  };

  if(form)form.addEventListener('submit',function(ev){
    ev.preventDefault();
    var key=(input.value||'').trim();
    if(key.length<8){say(REASONS.bad_request,'bad');input.focus();return}
    btn.disabled=true;say('Checking your code…');
    fetch(api+'/unlock',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({license_key:key})})
      .then(function(r){return r.json().catch(function(){return {ok:false,reason:'server'}})})
      .then(function(j){
        btn.disabled=false;
        if(j&&j.ok&&j.token){
          setTok(j.token);track('unlock-success',{lesson:code});
          say('Unlocked! Opening your games…','good');
          return loadGames(j.token);
        }
        var reason=(j&&j.reason)||'server';
        track('unlock-fail',{lesson:code,reason:reason});
        say(REASONS[reason]||'Something went wrong. Please try again in a moment.','bad');
      })
      .catch(function(){
        btn.disabled=false;track('unlock-fail',{lesson:code,reason:'network'});
        say('We could not reach the unlock service. Please check your internet and try again.','bad');
      });
  });

  var tok=getTok();
  if(tok)loadGames(tok);else showLock('');
  if(location.hash==='#practice'){var sec=document.getElementById('practice');if(sec)sec.scrollIntoView()}
})();
