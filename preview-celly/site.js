(function(){
  // Phone menu: one button opens the full list (Stage 1, Nov 2026)
  var mb=document.getElementById('menuBtn'), nv=document.getElementById('mainNav');
  if(mb&&nv)mb.addEventListener('click',function(){var o=!nv.classList.contains('open');nv.classList.toggle('open',o);mb.setAttribute('aria-expanded',o?'true':'false');});
  // Reading comfort: bigger text and wider spacing, remembered on this device only.
  var html=document.documentElement, btn=document.getElementById('comfy');
  function set(on){html.classList.toggle('comfy',on);if(btn)btn.setAttribute('aria-pressed',on?'true':'false');}
  try{set(localStorage.getItem('comfy')==='1');}catch(e){}
  if(btn)btn.addEventListener('click',function(){var on=!html.classList.contains('comfy');set(on);try{localStorage.setItem('comfy',on?'1':'0');}catch(e){}});

  // Lesson video: shown from its go-live time; loads YouTube only when the play button is pressed.
  var box=document.querySelector('.video[data-vid]');
  if(!box)return;
  var vid=box.getAttribute('data-vid'), from=box.getAttribute('data-from'), age=box.hasAttribute('data-age');
  var live=!from||Date.now()>=Date.parse(from);
  if(!live){
    var d=new Date(Date.parse(from));
    var txt=d.toLocaleString(undefined,{weekday:'long',day:'numeric',month:'long',hour:'numeric',minute:'2-digit'});
    box.querySelector('.when').textContent=txt;
    return;
  }
  document.querySelectorAll('.yt-link').forEach(function(a){a.hidden=false;});
  document.querySelectorAll('.t[data-s]').forEach(function(t){
    var a=document.createElement('a');a.href='https://www.youtube.com/watch?v='+vid+'&t='+t.getAttribute('data-s')+'s';a.textContent=t.textContent;a.rel='noopener';a.target='_blank';t.textContent='';t.appendChild(a);
  });
  var soon=box.querySelector('.soon'); if(soon)soon.remove();
  if(age){
    var a=document.createElement('a');a.className='soon';a.href='https://www.youtube.com/watch?v='+vid;a.target='_blank';a.rel='noopener';
    a.innerHTML='<p><strong>Watch this lesson on YouTube</strong><br>This unit is age-restricted on YouTube, so it plays there, not on this page.</p>';
    a.style.textDecoration='none';box.appendChild(a);return;
  }
  var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Play the lesson video');
  b.style.backgroundImage='url(https://i.ytimg.com/vi/'+vid+'/hqdefault.jpg)';
  b.innerHTML='<span class="play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span>';
  b.addEventListener('click',function(){
    if(window.csTrack)csTrack('video-play',{lesson:location.pathname.replace(/^\//,'')});
    var f=document.createElement('iframe');
    f.src='https://www.youtube-nocookie.com/embed/'+vid+'?autoplay=1&rel=0&modestbranding=1';
    f.title='Lesson video';f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';f.allowFullscreen=true;
    box.replaceChild(f,b);
  });
  box.appendChild(b);
})();

/* ---------- Progress on this device (Stage 2, Nov 2026) ----------
   Saved only in this browser (localStorage "cs_progress"): which lessons were opened or watched,
   which workbooks were downloaded and which games were finished. Nothing is sent anywhere. */
(function(){
  var KEY='cs_progress';
  var BASE=(location.pathname.match(/^\/preview-[a-z0-9-]+/)||[''])[0];
  function load(){try{var p=JSON.parse(localStorage.getItem(KEY)||'null')||{};p.lessons=p.lessons||{};p.games=p.games||{};return p;}catch(e){return {lessons:{},games:{}};}}
  function save(p){try{localStorage.setItem(KEY,JSON.stringify(p));}catch(e){}}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function isDone(p,slug){var l=p.lessons[slug]||{},g=p.games[slug]||{};return !!(l.watched||g.done);}

  // 1. record this lesson
  var meta=document.getElementById('lessonMeta');
  if(meta){
    var slug=meta.getAttribute('data-slug'),name=meta.getAttribute('data-name');
    var p=load(),l=p.lessons[slug]=p.lessons[slug]||{};l.name=name;l.seen=l.seen||Date.now();l.t=Date.now();
    p.last={kind:'lesson',slug:slug,t:Date.now()};save(p);
    document.addEventListener('click',function(e){
      var t=e.target.closest&&e.target.closest('.video button,.yt-link,.t a,a[href*="-workbook"],a[download]');if(!t)return;
      var q=load(),m=q.lessons[slug]=q.lessons[slug]||{name:name};
      if(/workbook|\.pdf/.test(t.getAttribute('href')||''))m.wb=Date.now();else m.watched=Date.now();
      save(q);
    },true);
  }

  // 2. ticks on lesson cards and unit cards
  var P=load();
  document.querySelectorAll('a.card[href]').forEach(function(a){
    var h=(a.getAttribute('href')||'').replace(BASE,'');
    var m=h.match(/^\/(7[a-l][a-e])$/), u=h.match(/^\/year-7\/(7[a-l])$/), g=h.match(/^\/play\/(7[a-l][a-e])\/$/);
    var tag=null;
    if(m){var s=m[1];if(isDone(P,s))tag=['done','✓ Done'];else if(P.lessons[s])tag=['seen','Started'];}
    else if(g){var gg=P.games[g[1]];if(gg&&gg.done)tag=['done','✓ Finished'];else if(gg&&gg.room>0)tag=['seen','Level '+(gg.level||1)+' started'];}
    else if(u){var keys={};Object.keys(P.lessons).concat(Object.keys(P.games)).forEach(function(k){if(k.indexOf(u[1])===0&&isDone(P,k))keys[k]=1;});
      var n=Object.keys(keys).length;if(n)tag=['done','✓ '+n+' of 5 done'];}
    if(tag){var b=document.createElement('span');b.className='prog '+tag[0];b.textContent=tag[1];a.appendChild(b);}
  });

  // 3. "Carry on" on the home page and the Year 7 page
  var box=document.getElementById('carryOn');
  if(!box)return;
  var order=[],games={};try{order=JSON.parse(box.getAttribute('data-order'));games=JSON.parse(box.getAttribute('data-games'));}catch(e){}
  var last=P.last;if(!last)return;
  var href,label,sub='';
  if(last.kind==='game'&&P.games[last.slug]&&!P.games[last.slug].done){
    var G=P.games[last.slug];href=BASE+'/'+'play/'+last.slug+'/';label='▶ Carry on: '+(games[last.slug]||G.name||'your game');sub='Level '+(G.level||1)+' of 2, your place is saved.';
  }else{
    var i=-1;order.forEach(function(o,k){if(o[0]===last.slug)i=k;});
    var cur=order[i];
    if(cur&&!isDone(P,cur[0])){href=BASE+'/'+cur[0];label='▶ Carry on: '+cur[1]+' '+cur[2];}
    else{var nx=null;for(var k=i+1;k<order.length;k++){if(order[k][3]&&!isDone(P,order[k][0])){nx=order[k];break;}}
      if(nx){href=BASE+'/'+nx[0];label='▶ Next: '+nx[1]+' '+nx[2];}}
  }
  if(!href)return;
  var done=0;order.forEach(function(o){if(isDone(P,o[0]))done++;});
  box.innerHTML='<p class="carry-hi">👋 Welcome back!</p><a class="btn primary big" href="'+href+'">'+esc(label)+'</a>'+
    (sub?'<p class="carry-sub">'+esc(sub)+'</p>':'')+(done?'<p class="carry-sub">✓ '+done+' lesson'+(done>1?'s':'')+' done so far</p>':'');
  box.hidden=false;
  var hg=document.getElementById('heroGo');if(hg)hg.hidden=true;
  box.addEventListener('click',function(e){if(e.target.closest('a')&&window.csTrack)csTrack('carry-on-click',{to:href.replace(BASE,'')});});
})();
